package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytebase/dbcost/client"
)

// Client is the client struct
type Client struct{}

var _ client.Client = (*Client)(nil)

// NewClient return a client
func NewClient() *Client {
	return &Client{}
}

//  pricing is the api message for AWS pricing .json file
type pricing struct {
	Product interface{} `json:"products"`
	Term    interface{} `json:"terms"`
}

// EngineType is the engine type specified in AWS api message.
// we implement its String() method to convert it into the type stored in ours.
type EngineType string

const (
	engineTypeMySQL      = "MySQL"
	engineTypePostgreSQL = "PostgreSQL"
	// TODO: Add support to SQLSERVER & ORACLE
	// engineTypeSQLServer  = "SQL Server"
	// engineTypeOracle     = "Oracle"
	engineTypeUnknown = "UNKNOWN"
)

func (e EngineType) String() string {
	switch e {
	case engineTypeMySQL:
		return "MYSQL"
	case engineTypePostgreSQL:
		return "POSTGRES"
	}
	return "UNKNOWN"
}

// instance is the api message of the Instance for AWS specifically
type instance struct {
	ID string
	// The tag here does not follow small-camel naming style, it is intended for the AWS name it this way.
	ServiceCode    string `json:"servicecode"`
	RegionCode     string `json:"regionCode"`
	Type           string `json:"instanceType"`
	InstanceFamily string `json:"instanceFamily"`
	// Noted that this is a api mmessage from AWS, so we still use vcpu for unmarshaling the info,
	// But in our systems, we use CPU over VCPU.
	CPU                string     `json:"vcpu"`
	Memory             string     `json:"memory"`
	PhysicalProcessor  string     `json:"physicalProcessor"`
	NetworkPerformance string     `json:"networkPerformance"`
	DeploymentOption   string     `json:"deploymentOption"`
	DatabaseEngine     EngineType `json:"databaseEngine"`
}

// productEntry is the entry of the instance info
type productEntry struct {
	ID            string   `json:"sku"`
	ProductFamily string   `json:"productFamily"`
	Attributes    instance `json:"attributes"`
}

// instanceRecord is the Record of the instance info
type instanceRecord map[string]productEntry

// priceDimensionRaw is the raw dimension struct marshaled from the aws json file
type priceDimensionRaw struct {
	Description  string                     `json:"description"`
	Unit         string                     `json:"unit"`
	PricePerUnit map[client.Currency]string `json:"pricePerUnit"`
}

// priceRaw is the raw price struct marshaled from the aws json file
type priceRaw struct {
	Dimension map[string]priceDimensionRaw `json:"priceDimensions"`
	Term      *client.ChargePayload        `json:"termAttributes"`
}

// InfoEndPoint is the instance info endpoint
// More infomation, see: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/reading-an-offer.html
const InfoEndPoint = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/index.json"

// GetOffer returns the offers provided by AWS.
func (c *Client) GetOffer() ([]*client.Offer, error) {
	res, err := http.Get(InfoEndPoint)
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

	rawData := &pricing{}
	if err := json.Unmarshal(data, rawData); err != nil {
		return nil, fmt.Errorf("Fail when unmarshaling response data , [internal]: %v", err)
	}

	offerList, err := extractOffer(rawData)
	if err != nil {
		return nil, fmt.Errorf("Fail when extrating offer, [internal]: %v", err)
	}

	productBytes, err := json.Marshal(rawData.Product)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(productBytes))
	var rawEntryList instanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	fillInstancePayload(rawEntryList, offerList)

	return offerList, nil
}

// extractOffer extracts the client.offer from the rawData.
func extractOffer(rawData *pricing) ([]*client.Offer, error) {
	bytePrice, err := json.Marshal(rawData.Term)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	offerDecoder := json.NewDecoder(bytes.NewReader(bytePrice))
	var rawEntry map[client.OfferType]map[string]map[string]priceRaw
	if err := offerDecoder.Decode(&rawEntry); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var offerList []*client.Offer
	incrID := 0
	// rawEntry has two charge types, reserved and on-demand.
	for chargeType, instanceOfferList := range rawEntry {
		// we use skuID here to track the instance relevant to this offer
		for instanceSKU, _offerList := range instanceOfferList {
			for instanceTermCode, rawOffer := range _offerList {
				offer := &client.Offer{
					ID: incrID,
					// e.g. 9QH3PUGXCYKNCYPB
					SKU: instanceSKU,
					// e.g. 9QH3PUGXCYKNCYPB.HU7G6KETJZ
					TermCode: instanceTermCode,
					// AWS only offer instance-wise product
					OfferType:     client.OfferTypeInstance,
					ChargeType:    client.ChargeType(chargeType),
					ChargePayload: rawOffer.Term,
				}
				// an offer may have differnet charging dimension, say upfront fee and it relevant fee charged hourly.
				for _, dimension := range rawOffer.Dimension {
					USDFloat, err := strconv.ParseFloat(dimension.PricePerUnit[client.CurrencyUSD], 64)
					if err != nil {
						return nil, fmt.Errorf("Fail to parse the price to type FLOAT64, value: %v, [internal]: %v", dimension.PricePerUnit[client.CurrencyUSD], err)
					}
					if dimension.Unit == "Quantity" {
						offer.CommitmentUSD = USDFloat
					} else {
						offer.HourlyUSD = USDFloat
					}

				}

				incrID++
				offerList = append(offerList, offer)
			}
		}
	}

	return offerList, nil
}

func fillInstancePayload(instanceRecord instanceRecord, offerList []*client.Offer) {
	// There may be many offers that are bind to the same instance with the same SKU.
	offerMap := make(map[string][]*client.Offer)
	for _, offer := range offerList {
		offerMap[offer.SKU] = append(offerMap[offer.SKU], offer)
	}

	for instanceSKU, entry := range instanceRecord {
		if entry.ProductFamily != "Database Instance" /* filter non-db instance */ ||
			entry.Attributes.DeploymentOption != "Single-AZ" /* filter multi-region deployment */ {
			continue
		}

		engineType := entry.Attributes.DatabaseEngine.String()
		if engineType == engineTypeUnknown {
			continue
		}

		instance := &client.OfferInstancePayload{
			Type:               entry.Attributes.Type,
			InstanceFamily:     entry.Attributes.InstanceFamily,
			CPU:                entry.Attributes.CPU,
			Memory:             strings.ReplaceAll(entry.Attributes.Memory, "GiB", ""),
			PhysicalProcessor:  entry.Attributes.PhysicalProcessor,
			NetworkPerformance: entry.Attributes.NetworkPerformance,
			DatabaseEngine:     client.EngineType(engineType),
		}
		if _, ok := offerMap[instanceSKU]; ok {
			for _, offer := range offerMap[instanceSKU] {
				offer.RegionList = []string{entry.Attributes.RegionCode}
				offer.InstancePayload = instance
			}
		}
	}
}
