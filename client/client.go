package client

// Instance is the api message of the instance
type Instance struct {
	ID                 string
	ServiceCode        string `json:"servicecode"`
	Location           string `json:"location"`
	RegionCode         string `json:"regionCode"`
	Type               string `json:"instanceType"`
	InstanceFamily     string `json:"instanceFamily"`
	VCPU               string `json:"vcpu"`
	Memory             string `json:"memory"`
	PhysicalProcessor  string `json:"physicalProcessor"`
	NetworkPerformance string `json:"networkPerformance"`
	DeploymentOption   string `json:"deploymentOption"`
	EngineCode         string `json:"engineCode"`
}

// ChargeType is the charging type of the price
type ChargeType string

const (
	// ChargeTypeONDEMAND is the on demand type of the price
	ChargeTypeONDEMAND ChargeType = "OnDemand"
	// ChargeTypeReserved is the reserved type of the price
	ChargeTypeReserved ChargeType = "Reserved"
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

// Offer is the api message of an Offer
type Offer struct {
	ID         string
	InstanceID string

	Type ChargeType
	// Term is nil when the ChargeType is onDemand
	Term *PriceTerm

	Description string
	Unit        string
	USD         float64
}

// Client is the client for http request
type Client interface {
	GetInstancePrice()
}
