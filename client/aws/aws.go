package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

// ID is the id (sku) of an instance record
type ID string

// Instance is the api message of the instance
type Instance struct {
	ID                 string
	ServiceCode        string `json:"servicecode"`
	Location           string `json:"location"`
	RegionCode         string `json:"regionCode"`
	InstanceType       string `json:"instanceType"`
	InstanceFamily     string `json:"instanceFamily"`
	VCpu               string `json:"vcpu"`
	Memory             string `json:"memory"`
	PhysicalProcessor  string `json:"physicalProcessor"`
	NetworkPerformance string `json:"networkPerformance"`
	DeploymentOption   string `json:"deploymentOption"`
	EngineCode         string `json:"engineCode"`
}

// ProductEntry is the entry of the instance info
type ProductEntry struct {
	ID            string   `json:"sku"`
	ProductFamily string   `json:"productFamily"`
	Attributes    Instance `json:"attributes"`
}

// InstanceRecord is the Record of the instance info
type InstanceRecord map[ID]ProductEntry

// PriceType is the charging type of the price
type PriceType string

const (
	// PriceTypeONDEMAND is the on demand type of the price
	PriceTypeONDEMAND PriceType = "OnDemand"
	// PriceTypeReserved is the reserved type of the price
	PriceTypeReserved PriceType = "Reserved"
)

// PriceTerm is the term of the price
type PriceTerm struct {
	LeaseContractLength string `json:"LeaseContractLength"`
	PurchaseOption      string `json:"PurchaseOption"`
}

// Currency is the type of the currency
type Currency string

// CurrencyUSD is the type of the currency of USC
const CurrencyUSD = "USD"

// PriceDimensionRaw is the raw dimension struct marshaled from the aws json file
type PriceDimensionRaw struct {
	Description  string              `json:"description"`
	Unit         string              `json:"unit"`
	PricePerUnit map[Currency]string `json:"pricePerUnit"`
}

// PriceRaw is the raw price struct marshaled from the aws json file
type PriceRaw struct {
	Dimension map[ID]PriceDimensionRaw `json:"priceDimensions"`
	Term      *PriceTerm               `json:"termAttributes"`
}

// Price is the api message of the Price
type Price struct {
	ID         string
	InstanceID string

	Type PriceType
	// Term is nil when the priceType is onDemand
	Term *PriceTerm

	Description string
	Unit        string
	USD         string
}

// InfoEndPoint is the instance info endpoint
const InfoEndPoint = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/index.json"

// GetPriceInstance get the pricing and instance info
func (c *Client) GetPriceInstance() ([]*Price, []*Instance, error) {
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

func extractPrice(rawData *rawJSON) ([]*Price, error) {
	bytePrice, err := json.Marshal(rawData.Term)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	priceDecoder := json.NewDecoder(bytes.NewReader(bytePrice))
	var rawEntry map[PriceType]map[ID]map[ID]PriceRaw
	if err := priceDecoder.Decode(&rawEntry); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var priceList []*Price
	for priceType, instanceOfferList := range rawEntry {
		for instanceID, offerList := range instanceOfferList {
			for _, offer := range offerList {
				for rateCode, dimension := range offer.Dimension {
					price := &Price{
						ID:          string(rateCode),
						InstanceID:  string(instanceID),
						Type:        priceType,
						Term:        offer.Term,
						Description: dimension.Description,
						Unit:        dimension.Unit,
						USD:         dimension.PricePerUnit[CurrencyUSD],
					}
					priceList = append(priceList, price)
				}
			}
		}
	}

	return priceList, nil
}

func extractInstance(rawData *rawJSON) ([]*Instance, error) {
	byteProducts, err := json.Marshal(rawData.Product)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList InstanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	var instanceList []*Instance
	for id, entry := range rawEntryList {
		if entry.ProductFamily != "Database Instance" /* filter non-db instance */ ||
			entry.Attributes.DeploymentOption != "Single-AZ" /* filter multi-region deployment */ {
			continue
		}
		instance := &Instance{
			ID:                 string(id),
			ServiceCode:        entry.Attributes.ServiceCode,
			Location:           entry.Attributes.Location,
			RegionCode:         entry.Attributes.RegionCode,
			InstanceType:       entry.Attributes.InstanceType,
			InstanceFamily:     entry.Attributes.InstanceFamily,
			VCpu:               entry.Attributes.VCpu,
			Memory:             entry.Attributes.Memory,
			PhysicalProcessor:  entry.Attributes.PhysicalProcessor,
			NetworkPerformance: entry.Attributes.NetworkPerformance,
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
