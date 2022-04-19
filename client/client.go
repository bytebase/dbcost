package client

// EngineType is the type of the database engine.
// It should be noticed that the price of different engine may differ.
type EngineType string

const (
	// EngineTypeMySQL is the engine type for MySQL.
	EngineTypeMySQL = "MYSQL"
	// EngineTypePostgreSQL is the engine type for PostgreSQL.
	EngineTypePostgreSQL = "POSTGRES"
	// EngineTypeOracle is the engine type for Oracle.
	EngineTypeOracle = "ORACLE"
	// EngineTypeSQLServer is the engine type for SQLServer.
	EngineTypeSQLServer = "SQLSERVER"
)

// Instance is the api message of the instance.
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

// ChargeType is the charge type of the price.
type ChargeType string

const (
	// ChargeTypeOnDemand is the on demand type of the price.
	ChargeTypeOnDemand ChargeType = "OnDemand"
	// ChargeTypeReserved is the reserved type of the price.
	ChargeTypeReserved ChargeType = "Reserved"
)

// OfferType is the type of the smallest offer type of a offer.
// Some vendors may provide offer at a VCPU/RAM level while others may only provide a specified instance.
type OfferType string

const (
	// OfferTypeInstance is the offer type that provides specified instance as a basic unit.
	OfferTypeInstance OfferType = "Instance"
	// OfferTypeRAM is the offer type that provides RAM as a basic unit.
	OfferTypeRAM OfferType = "RAM"
	// OfferTypeVCPU is the offer type that provides vCPU as a basic unit.
	OfferTypeVCPU OfferType = "VCPU"
)

// Currency is the type of the currency.
type Currency string

// CurrencyUSD is the type of the currency of USC.
const CurrencyUSD = "USD"

// ChargePayload is the charge payload of the offer.
type ChargePayload struct {
	LeaseContractLength string `json:"leaseContractLength"`
	PurchaseOption      string `json:"purchaseOption"`
}

// Offer is the api message of an Offer.
type Offer struct {
	ID string

	OfferType OfferType
	// If OfferType is not Instance, InstanceID would be empty, otherwise InstanceID may be the sku of that instance.
	InstanceID string

	ChargeType ChargeType
	// Payload is present when the ChargeType is Reserved, otherwise nil.
	ChargePayload *ChargePayload

	RegionList  []string
	Description string
	Unit        string
	USD         float64
}

// Client is the client for http request.
type Client interface {
	GetInstancePrice()
}
