package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

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

type rawJSON struct {
	Product interface{} `json:"products"`
	Term    interface{} `json:"terms"`
}

type engineType string

const (
	engineTypeMySQL      = "MySQL"
	engineTypePostgreSQL = "PostgreSQL"
	engineTypeSQLServer  = "SQL Server"
	engineTypeSQLOracle  = "Oracle"
)

func (e engineType) String() string {
	switch e {
	case engineTypeMySQL:
		return "MYSQL"
	case engineTypePostgreSQL:
		return "POSTGRES"
	case engineTypeSQLServer:
		return "SQLSERVER"
	case engineTypeSQLOracle:
		return "ORACLE"
	}
	return "UNKNOWN"
}

// instance is the api message of the instance for AWS specifically
type instance struct {
	ID                 string
	ServiceCode        string     `json:"servicecode"`
	Location           string     `json:"location"`
	Type               string     `json:"instanceType"`
	InstanceFamily     string     `json:"instanceFamily"`
	VCPU               string     `json:"vcpu"`
	Memory             string     `json:"memory"`
	PhysicalProcessor  string     `json:"physicalProcessor"`
	NetworkPerformance string     `json:"networkPerformance"`
	DeploymentOption   string     `json:"deploymentOption"`
	DatabaseEngine     engineType `json:"databaseEngine"`
}

// ProductEntry is the entry of the instance info
type ProductEntry struct {
	ID            string   `json:"sku"`
	ProductFamily string   `json:"productFamily"`
	Attributes    instance `json:"attributes"`
}

// InstanceRecord is the Record of the instance info
type InstanceRecord map[string]ProductEntry

// PriceDimensionRaw is the raw dimension struct marshaled from the aws json file
type PriceDimensionRaw struct {
	Description  string                     `json:"description"`
	Unit         string                     `json:"unit"`
	PricePerUnit map[client.Currency]string `json:"pricePerUnit"`
}

// PriceRaw is the raw price struct marshaled from the aws json file
type PriceRaw struct {
	Dimension map[string]PriceDimensionRaw `json:"priceDimensions"`
	Term      *client.ChargePayload        `json:"termAttributes"`
}

// InfoEndPoint is the instance info endpoint
const InfoEndPoint = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/index.json"

// GetOffer return offers provides by AWS
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

	rawData := &rawJSON{}
	if err := json.Unmarshal(data, rawData); err != nil {
		return nil, fmt.Errorf("Fail when unmarshaling response data , [internal]: %v", err)
	}

	offerList, err := extractOffer(rawData)
	if err != nil {
		return nil, fmt.Errorf("Fail when extrating offer, [internal]: %v", err)
	}

	byteProducts, err := json.Marshal(rawData.Product)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList InstanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	fillInstancePayload(rawEntryList, offerList)

	return offerList, nil
}

func getOfferHashKey(offer *client.Offer) string {
	var hash string
	if offer.ChargeType == client.ChargeTypeOnDemand {
		hash = fmt.Sprintf("%v-%v-%v", offer.SKUID, offer.CommitmentUSD, offer.HourlyUSD)
	} else {
		hash = fmt.Sprintf("%v-%v-%v-%v-%v", offer.SKUID,
			offer.ChargePayload.LeaseContractLength,
			offer.ChargePayload.PurchaseOption,
			offer.CommitmentUSD,
			offer.HourlyUSD,
		)
	}

	return hash
}

func extractOffer(rawData *rawJSON) ([]*client.Offer, error) {
	bytePrice, err := json.Marshal(rawData.Term)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	offerDecoder := json.NewDecoder(bytes.NewReader(bytePrice))
	var rawEntry map[client.OfferType]map[string]map[string]PriceRaw
	if err := offerDecoder.Decode(&rawEntry); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var offerList []*client.Offer
	offerSet := make(map[string]bool)
	for chargeType, instanceOfferList := range rawEntry {
		for instanceID, _offerList := range instanceOfferList {
			for _, rawOffer := range _offerList {
				offer := &client.Offer{
					SKUID: instanceID,
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
				// Filter replica
				if _, ok := offerSet[getOfferHashKey(offer)]; ok {
					continue
				}
				offerSet[getOfferHashKey(offer)] = true

				offerList = append(offerList, offer)
			}
		}
	}

	return offerList, nil
}

func fillInstancePayload(instanceRecord InstanceRecord, offerList []*client.Offer) {
	offerMap := make(map[string][]*client.Offer)
	for _, offer := range offerList {
		if _, ok := offerMap[offer.SKUID]; ok {
			offerMap[offer.SKUID] = append(offerMap[offer.SKUID], offer)
		} else {
			offerMap[offer.SKUID] = []*client.Offer{offer}
		}
	}

	for skuID, entry := range instanceRecord {
		if entry.ProductFamily != "Database Instance" /* filter non-db instance */ ||
			entry.Attributes.DeploymentOption != "Single-AZ" /* filter multi-region deployment */ {
			continue
		}
		engineType := entry.Attributes.DatabaseEngine.String()
		if engineType == "UNKNOWN" {
			continue
		}

		instance := &client.OfferPayloadInstance{
			ServiceCode:        entry.Attributes.ServiceCode,
			Type:               entry.Attributes.Type,
			InstanceFamily:     entry.Attributes.InstanceFamily,
			VCPU:               entry.Attributes.VCPU,
			Memory:             entry.Attributes.Memory,
			PhysicalProcessor:  entry.Attributes.PhysicalProcessor,
			NetworkPerformance: entry.Attributes.NetworkPerformance,
			DatabaseEngine:     client.EngineType(entry.Attributes.DatabaseEngine.String()),
		}
		if _, ok := offerMap[skuID]; ok {
			for _, offer := range offerMap[skuID] {
				// The region info of the offer is stored in the instance, we need store the region info here.
				offer.RegionList = []string{entry.Attributes.Location}
				offer.InstancePayload = instance
			}
		}
	}
}
