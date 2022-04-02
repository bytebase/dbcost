package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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

// InfoEndPoint is the instance info endpoint
const InfoEndPoint = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/index.json"

type rawJSON struct {
	Products interface{} `json:"products"`
	Terms    interface{} `json:"terms"`
}

// ID is the id (sku) of an instance record
type ID string

// Attribute is the raw Attribute for the json object fetched
type Attribute struct {
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
}

// ProductEntry is the entry of the instance info
type ProductEntry struct {
	ID            string    `json:"sku"`
	ProductFamily string    `json:"productFamily"`
	Attributes    Attribute `json:"attributes"`
}

// Record is the Record of the instance info
type Record map[ID]ProductEntry

// Get is get
func (c *Client) Get(endpoint string) (Record, error) {

	// res, err := http.Get(endpoint)
	// if err != nil {
	// 	return false, fmt.Errorf("Fail to fetch the info file, [internal]: %v", err)
	// }

	// if res.StatusCode != 200 {
	// 	return false, fmt.Errorf("An http error , [internal]: %v", err)
	// }

	file, err := os.ReadFile("../../store/example/aws-raw.json")

	if err != nil {
		return nil, fmt.Errorf("Fail to fetch the info file, [internal]: %v", err)
	}

	rawData := &rawJSON{}
	if err = json.Unmarshal(file, rawData); err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	byteProducts, err := json.Marshal(rawData.Products)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}

	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))

	var rawEntryList Record
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	return rawEntryList, nil
}
