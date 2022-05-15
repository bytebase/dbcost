package gcp

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/bytebase/dbcost/client"
)

// Client is the client struct
type Client struct {
	apiKey string
}

var _ client.Client = (*Client)(nil)

// NewClient return a client
func NewClient(apiKey string) *Client {
	return &Client{apiKey}
}

const rdsServiceID = "9662-B51E-5089"

// priceInfoEndpoint is the endpoint for all Cloud SQL services on GCP
// For more information, please refer to https://cloud.google.com/billing/v1/how-tos/catalog-api
var priceInfoEndpoint = fmt.Sprintf("https://cloudbilling.googleapis.com/v1/services/%s/skus", rdsServiceID)

type unitPrice struct {
	CurrencyCode string `json:"currencyCode"`
	// The nanos is the number of nano (10^-9) units of the amount. The value must be between -999,999,999 and +999,999,999 inclusive.
	// The cost of the SKU is units + nanos.
	// For example, a cost of $1.75 is represented as units=1 and nanos=750,000,000.
	Unit string  `json:"units"`
	Nano float64 `json:"nanos"`
}

type tieredRate struct {
	UnitPrice unitPrice `json:"unitPrice"`
}

type pricingExpression struct {
	UsageUnit      string        `json:"usageUnit"`
	TieredRateList []*tieredRate `json:"tieredRates"`
}

type pricingInfo struct {
	PricingExpression pricingExpression `json:"pricingExpression"`
}

type category struct {
	ServiceDisplayName string `json:"serviceDisplayName"`
	ResourceFamily     string `json:"resourceFamily"`
	ResourceGroup      string `json:"resourceGroup"`
	UsageType          string `json:"usageType"`
}

type offer struct {
	ID                string        `json:"skuId"`
	Description       string        `json:"description"`
	Category          category      `json:"category"`
	PricingInfo       []pricingInfo `json:"pricingInfo"`
	ServiceRegionList []string      `json:"serviceRegions"`
}

type pricing struct {
	OfferList     []*offer `json:"skus"`
	NextPageToken string   `json:"nextPageToken"`
}

func (c *Client) getPricingWithPageToken(nextPageToken string) (*pricing, error) {
	endpoint := fmt.Sprintf("%s?key=%s", priceInfoEndpoint, c.apiKey)
	if nextPageToken != "" {
		endpoint = fmt.Sprintf("%s&pageToken=%s", endpoint, nextPageToken)
	}

	req, err := http.NewRequest("GET", endpoint, nil)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Fail to fetch the info file. Error: %v", err)
	}
	if res.StatusCode != 200 {
		return nil, fmt.Errorf("An http error occur. Error: %v", err)
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("Fail when reading response data. Error: %v", err)
	}

	p := &pricing{}
	if err := json.Unmarshal(data, p); err != nil {
		return nil, fmt.Errorf("Fail when unmarshaling response data. Error: %v", err)
	}
	return p, nil
}

// GetOffer return the offers provide by GCP.
func (c *Client) GetOffer() ([]*client.Offer, error) {
	var rawOffer []*offer
	var token string
	for {
		p, err := c.getPricingWithPageToken(token)
		if err != nil {
			return nil, err
		}
		rawOffer = append(p.OfferList)
		if p.NextPageToken == "" {
			break
		}
		token = p.NextPageToken
	}

	var offerList []*client.Offer
	incrID := 0
	for _, rawOffer := range rawOffer {
		// This condition will filter resource like Network。
		// For now, we only focus on the RDS Instance information.
		if rawOffer.Category.ResourceFamily != "ApplicationServices" ||
			// the Gen1 offering is unavailabe
			strings.Contains(rawOffer.Category.ResourceGroup, "Gen1") ||
			!rSpecification.Match([]byte(rawOffer.Description)) {
			continue
		}

		offerType := getOfferType(rawOffer.Category.ResourceGroup)
		hourlyUSD, err := getUSD(rawOffer.PricingInfo)
		if err != nil {
			return nil, err
		}

		offer := &client.Offer{
			ID:  incrID,
			SKU: rawOffer.ID,
			// TermCode in GCP is the same as its SKU as different term is identified as different SKU.
			TermCode:  rawOffer.ID,
			OfferType: offerType,

			// All GCP services are charged on demand literal, but we consider commitment for a length as reserved type
			ChargeType: client.ChargeTypeOnDemand,

			RegionList:  rawOffer.ServiceRegionList,
			Description: rawOffer.Description,

			CommitmentUSD: 0,
			HourlyUSD:     hourlyUSD,
		}

		if offerType == client.OfferTypeInstance {
			databaseEngine, CPU, memory, err := getCPUMemory(rawOffer.Description)
			if err != nil {
				continue
			}

			instanceType := getInstanceType(rawOffer.Category.ResourceGroup, CPU, memory)
			payload := &client.OfferInstancePayload{
				Type:           instanceType,
				InstanceFamily: instanceType,
				CPU:            CPU,
				Memory:         memory,
				DatabaseEngine: databaseEngine,
			}
			offer.InstancePayload = payload
		}

		// TODO(zilong): implement it later.
		if offer.ChargeType == client.ChargeTypeReserved {
			continue
		}

		offerList = append(offerList, offer)
		incrID++
	}
	return offerList, nil
}

// getOfferType will extract the OfferType from a given resource group.
// Possible resource group are:
// SQLGen2Instance${INSTANE_CODE}, SQLGen2InstanceRAM, SQLGen2InstanceCPU.
func getOfferType(resourceGroup string) client.OfferType {
	offerType := client.OfferType(strings.ReplaceAll(resourceGroup, "SQLGen2Instances", ""))
	if offerType != "RAM" && offerType != "CPU" {
		offerType = client.OfferTypeInstance
	}
	return offerType
}

// Regional Instance means High Available Instance, see https://cloud.google.com/sql/docs/postgres/high-availability
var rSpecification = regexp.MustCompile(`Cloud SQL for ([\S|\s]+): Zonal - (\d+) vCPU \+ (\d+.\d*)GB RAM`)

// getCPUMemory will use a reg-expression to extract the specification expressed in the given description
// the description should follow the form of "Cloud SQL for ${ENGINE_TYPE}: Zonal - ${NUM_VCPU} vCPU + ${NUM_MEM}GB RAM".
func getCPUMemory(description string) (databaseEngine client.EngineType, CPU string, memory string, err error) {
	match := rSpecification.FindStringSubmatch(description)
	if match[1] == "MySQL" {
		databaseEngine = client.EngineTypeMySQL
	} else if match[1] == "PostgreSQL" {
		databaseEngine = client.EngineTypePostgreSQL
	} else {
		return databaseEngine, match[2], match[3], nil
	}
	return databaseEngine, match[2], match[3], nil
}

// getUSD will return a single value of the price in USD
// pricing in GCP is seperated into to part, the unit and the nanos.
// The nanos is the number of nano (10^-9) units of the amount. The value must be between -999,999,999 and +999,999,999 inclusive.
// The cost of the SKU is units + nanos.
// For example, a cost of $1.75 is represented as units=1 and nanos=750,000,000.
func getUSD(pricingInfo []pricingInfo) (float64, error) {
	if len(pricingInfo) == 0 || len(pricingInfo[0].PricingExpression.TieredRateList) == 0 {
		return 0, fmt.Errorf("Incomplete type")
	}
	unitPrice := pricingInfo[0].PricingExpression.TieredRateList[0].UnitPrice
	unitInt64, err := strconv.Atoi(unitPrice.Unit)
	if err != nil {
		return 0, err
	}
	return float64(unitInt64) + unitPrice.Nano/1e9, nil
}

// getInstanceType will return a the type of the given instance
func getInstanceType(resourceGroup, CPU, memory string) string {
	serviceCode := strings.ReplaceAll(resourceGroup, "SQLGen2Instances", "")
	return fmt.Sprintf("db-%v-%v-%v", serviceCode, CPU, memory)
}
