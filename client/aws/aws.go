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

// ProductEntry is the entry of the instance info
type ProductEntry struct {
	ID            string          `json:"sku"`
	ProductFamily string          `json:"productFamily"`
	Attributes    client.Instance `json:"attributes"`
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
	Term      *client.OfferPayload         `json:"termAttributes"`
}

// InfoEndPoint is the instance info endpoint
const InfoEndPoint = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/index.json"

// GetOfferInstance get the offer and instance info
func (c *Client) GetOfferInstance() ([]*client.Offer, []*client.Instance, error) {
	res, err := http.Get(InfoEndPoint)
	if err != nil {
		return nil, nil, fmt.Errorf("Fail to fetch the info file, [internal]: %v", err)
	}
	if res.StatusCode != 200 {
		return nil, nil, fmt.Errorf("An http error occur , [internal]: %v", err)
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, nil, fmt.Errorf("Fail when reading response data , [internal]: %v", err)
	}

	rawData := &rawJSON{}
	if err := json.Unmarshal(data, rawData); err != nil {
		return nil, nil, fmt.Errorf("Fail when unmarshaling response data , [internal]: %v", err)
	}

	priceInfo, err := extractPrice(rawData)
	if err != nil {
		return nil, nil, fmt.Errorf("Fail when extrating pricing info, [internal]: %v", err)
	}

	instanceInfo, err := extractInstance(rawData)
	if err != nil {
		return nil, nil, fmt.Errorf("Fail when extrating instance info, [internal]: %v", err)
	}

	return priceInfo, instanceInfo, nil
}

func extractPrice(rawData *rawJSON) ([]*client.Offer, error) {
	bytePrice, err := json.Marshal(rawData.Term)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	priceDecoder := json.NewDecoder(bytes.NewReader(bytePrice))
	var rawEntry map[client.OfferType]map[string]map[string]PriceRaw
	if err := priceDecoder.Decode(&rawEntry); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var priceList []*client.Offer
	for chargeType, instanceOfferList := range rawEntry {
		for instanceID, offerList := range instanceOfferList {
			for _, offer := range offerList {
				for rateCode, dimension := range offer.Dimension {
					USDFloat, err := strconv.ParseFloat(dimension.PricePerUnit[client.CurrencyUSD], 64)
					if err != nil {
						return nil, fmt.Errorf("Fail to parse the price to type FLOAT64, value: %v, [internal]: %v", dimension.PricePerUnit[client.CurrencyUSD], err)
					}
					price := &client.Offer{
						ID:          string(rateCode),
						InstanceID:  string(instanceID),
						Type:        chargeType,
						Payload:     offer.Term,
						Description: dimension.Description,
						Unit:        dimension.Unit,
						USD:         USDFloat,
					}
					priceList = append(priceList, price)
				}
			}
		}
	}

	return priceList, nil
}

func extractInstance(rawData *rawJSON) ([]*client.Instance, error) {
	byteProducts, err := json.Marshal(rawData.Product)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList InstanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var instanceList []*client.Instance
	for id, entry := range rawEntryList {
		if entry.ProductFamily != "Database Instance" /* filter non-db instance */ ||
			entry.Attributes.DeploymentOption != "Single-AZ" /* filter multi-region deployment */ {
			continue
		}
		instance := &client.Instance{
			ID:                 string(id),
			ServiceCode:        entry.Attributes.ServiceCode,
			Location:           entry.Attributes.Location,
			RegionCode:         entry.Attributes.RegionCode,
			Type:               entry.Attributes.Type,
			InstanceFamily:     entry.Attributes.InstanceFamily,
			VCPU:               entry.Attributes.VCPU,
			Memory:             entry.Attributes.Memory,
			PhysicalProcessor:  entry.Attributes.PhysicalProcessor,
			NetworkPerformance: entry.Attributes.NetworkPerformance,
			DatabaseEngine:     entry.Attributes.DatabaseEngine,
		}
		instanceList = append(instanceList, instance)
	}

	return instanceList, nil
}

// RegionInfoEndPoint is the endpoint for the region info mapping, e.g.: ap-east-1 --> Asia Pacific (Hong Kong)
const RegionInfoEndPoint = "https://github.com/boto/botocore/blob/develop/botocore/data/endpoints.json"

// GetRegionMapping get the mapping between the region code and the human redable description
func (c *Client) GetRegionMapping() (map[string]string, error) {
	res, err := http.Get(RegionInfoEndPoint)
	if err != nil {
		return nil, fmt.Errorf("Fail to fetch the region file, [internal]: %v", err)
	}
	if res.StatusCode != 200 {
		return nil, fmt.Errorf("An http error occur , [internal]: %v", err)
	}

	panic("Implement me")
}
