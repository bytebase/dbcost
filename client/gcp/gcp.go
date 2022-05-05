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
	httpClient http.Client
}

// NewClient return a client
func NewClient() Client {
	return Client{
		httpClient: http.Client{},
	}
}

const rdsServiceID = "9662-B51E-5089"

// this apiKey should be blocked before merging
const apiKey = "AIzaSyAj36rmGvQ_3kBqd6Lp3nSzPDo2_nD-sdM"

// PriceInfoEndpoint is the endpoint for all Cloud SQL services on GCP
// For more information, please refer to https://cloud.google.com/billing/v1/how-tos/catalog-api
var PriceInfoEndpoint = fmt.Sprintf("https://cloudbilling.googleapis.com/v1/services/%s/skus?key=%s", rdsServiceID, apiKey)

type unitPrice struct {
	CurrencyCode string  `json:"currencyCode"`
	Unit         string  `json:"units"`
	Nano         float64 `json:"nanos"`
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

func httpHelper(nextpageToken string) ([]*offer, error) {
	endpoint := PriceInfoEndpoint
	if nextpageToken != "" {
		endpoint = fmt.Sprintf("%v&pageToken=%v", PriceInfoEndpoint, nextpageToken)
	}

	req, err := http.NewRequest("GET", endpoint, nil)
	req.Header.Add("User-Agaent", `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15`)
	req.Header.Add("Connection", `keep-alive`)
	req.Header.Add("Accept", `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Fail to fetch the info file, [internal]: %v", err)
	}
	if res.StatusCode != 200 {
		return nil, fmt.Errorf("An http error occur , [internal]: %v", err)
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("Fail when reading response data , [internal]: %v", err)
	}
	var offerList []*offer
	rawData := &pricing{}
	if err := json.Unmarshal(data, rawData); err != nil {
		return nil, fmt.Errorf("Fail when unmarshaling response data , [internal]: %v", err)
	}
	offerList = rawData.OfferList

	if rawData.NextPageToken != "" {
		nextPage, err := httpHelper(rawData.NextPageToken)
		if err != nil {
			return nil, err
		}
		offerList = append(offerList, nextPage...)
		return offerList, nil
	}

	return offerList, nil
}

// GetOffer return the offers provide by GCP.
func (c *Client) GetOffer() ([]*client.Offer, error) {
	rawOffer, err := httpHelper("")
	if err != nil {
		return nil, err
	}

	var offerList []*client.Offer
	incrID := 0
	for _, rawOffer := range rawOffer {
		// This condition will filter resource like Network.
		if rawOffer.Category.ResourceFamily != "ApplicationServices" ||
			// the Gen1 offering is unavailabe
			strings.Contains(rawOffer.Category.ResourceGroup, "Gen1") ||
			!rSpecification.Match([]byte(rawOffer.Description)) {
			continue
		}

		offerType := getOfferType(rawOffer.Category.ResourceGroup)
		hourlyUSD := getUSD(rawOffer.PricingInfo[0].PricingExpression.TieredRateList[0].UnitPrice)

		offer := &client.Offer{
			ID:        incrID,
			SKU:       rawOffer.ID,
			OfferType: offerType,

			// All GCP services are charged on demand literal, but we consider commitment for a length as reserved type
			ChargeType: client.ChargeTypeOnDemand,

			RegionList:  rawOffer.ServiceRegionList,
			Description: rawOffer.Description,

			CommitmentUSD: 0,
			HourlyUSD:     hourlyUSD,
		}
		incrID++

		if offerType == client.OfferTypeInstance {
			databaseEngine, CPU, memory := getCPUMemory(rawOffer.Description)
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

		if offer.ChargeType == client.ChargeTypeReserved {
			panic("Implement me")
		}

		offerList = append(offerList, offer)
	}
	return offerList, nil
}

// getOfferType will extract the OfferType from a given resource group.
// Possible resource group are:
// SQLGen2Instance${INSTANE_CODE}, SQLGen2InstanceRAM, SQLGen2InstanceCPU.
func getOfferType(resourceGroup string) client.OfferType {
	offerType := client.OfferType(strings.Replace(resourceGroup, "SQLGen2Instances", "", -1))
	if offerType != "RAM" && offerType != "CPU" {
		offerType = client.OfferTypeInstance
	}
	return offerType
}

// Regional Instance means High Available Instance, see https://cloud.google.com/sql/docs/postgres/high-availability
var rSpecification = regexp.MustCompile(`Cloud SQL for ([\S|\s]+): Zonal - (\d+) vCPU \+ (\d+.\d*)GB RAM`)

// getCPUMemory will use a reg-expression to extract the specification expressed in the given description
// the description should follow the form of "Cloud SQL for ${ENGINE_TYPE}: Zonal - ${NUM_VCPU} vCPU + ${NUM_MEM}GB RAM".
func getCPUMemory(description string) (databaseEngine client.EngineType, CPU string, memory string) {
	match := rSpecification.FindStringSubmatch(description)
	if match[1] == "MySQL" {
		databaseEngine = client.EngineTypeMySQL
	} else if match[1] == "PostgreSQL" {
		databaseEngine = client.EngineTypePostgreSQL
	}
	return databaseEngine, match[2], match[3]
}

// getUSD will return a single value of the price in USD
func getUSD(unitPrice unitPrice) float64 {
	unitInt64, _ := strconv.Atoi(unitPrice.Unit)
	return float64(unitInt64) + unitPrice.Nano/1e9
}

// getInstanceType will return a the type of the given instance
func getInstanceType(resourceGroup, CPU, memory string) string {
	serviceCode := strings.Replace(resourceGroup, "SQLGen2Instances", "", -1)
	return fmt.Sprintf("db-%v-%v-%v", serviceCode, CPU, memory)
}
