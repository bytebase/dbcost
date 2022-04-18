package client

// EngineType is the type of the database engine
// It should be noticed that the price of different engine may differ
type EngineType string

const (
	// EngineTypeMySQL is the engine type for MySQL
	EngineTypeMySQL = "MYSQL"
	// EngineTypePostgreSQL is the engine type for PostgreSQL
	EngineTypePostgreSQL = "POSTGRES"
	// EngineTypeOracle is the engine type for Oracle
	EngineTypeOracle = "ORACLE"
	// EngineTypeSQLServer is the engine type for SQLServer
	EngineTypeSQLServer = "SQLSERVER"
)

// Instance is the api message of the instance
type Instance struct {
	ID                 string
	ServiceCode        string     `json:"servicecode"`
	Region             string     `json:"region"`
	Type               string     `json:"instanceType"`
	InstanceFamily     string     `json:"instanceFamily"`
	VCPU               string     `json:"vcpu"`
	Memory             string     `json:"memory"`
	PhysicalProcessor  string     `json:"physicalProcessor"`
	NetworkPerformance string     `json:"networkPerformance"`
	DeploymentOption   string     `json:"deploymentOption"`
	DatabaseEngine     EngineType `json:"databaseEngine"`
}

// OfferType is the charging type of the price
type OfferType string

const (
	// OfferTypeOnDemand is the on demand type of the price
	OfferTypeOnDemand OfferType = "OnDemand"
	// OfferTypeReserved is the reserved type of the price
	OfferTypeReserved OfferType = "Reserved"
)

// Currency is the type of the currency
type Currency string

// CurrencyUSD is the type of the currency of USC
const CurrencyUSD = "USD"

// OfferPayload is the term Payload of the price
type OfferPayload struct {
	LeaseContractLength string `json:"leaseContractLength"`
	PurchaseOption      string `json:"purchaseOption"`
}

// Offer is the api message of an Offer
type Offer struct {
	ID         string
	InstanceID string

	Type OfferType
	// Term is nil when the ChargeType is onDemand
	Payload *OfferPayload

	Description string
	Unit        string
	USD         float64
}

// Client is the client for http request
type Client interface {
	GetInstancePrice()
}
