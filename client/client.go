package client

// EngineType is the type of the database engine.
// It should be noticed that the price of different engine may differ.
type EngineType string

const (
	// EngineTypeMySQL is the engine type for MySQL.
	EngineTypeMySQL = "MYSQL"
	// EngineTypePostgreSQL is the engine type for PostgreSQL.
	EngineTypePostgreSQL = "POSTGRES"

	// TODO: add support to ORACLE & SQLSERVER
	// EngineTypeOracle is the engine type for Oracle.
	// EngineTypeOracle = "ORACLE"
	// EngineTypeSQLServer is the engine type for SQLServer.
	// EngineTypeSQLServer = "SQLSERVER"
)

// OfferInstancePayload is the payload of the offer type instance.
type OfferInstancePayload struct {
	// e.g. db.lg, N1Standard-1-1
	Type string `json:"instanceType"`
	// e.g. HighMem, Generals
	InstanceFamily string `json:"instanceFamily"`
	CPU            string `json:"cpu"`
	Memory         string `json:"memory"`
	// e.g. Intel Lake
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
// Some vendors may provide offer at a CPU/RAM level while others may only provide a specified instance.
// Allowed OfferType are : Instance, RAM, CPU
type OfferType string

const (
	// OfferTypeInstance is the offer type that provides specified instance as a basic unit.
	OfferTypeInstance OfferType = "Instance"
	// OfferTypeRAM is the offer type that provides RAM as a basic unit.
	OfferTypeRAM OfferType = "RAM"
	// OfferTypeCPU is the offer type that provides CPU as a basic unit.
	OfferTypeCPU OfferType = "CPU"
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
	ID int

	// e.g. AWS: 9QH3PUGXCYKNCYPB, GCP: 0009-6F35-3126
	SKU string
	// The same SKU may have different charge type, the term code is used to differentiate this.
	// e.g. Instance A may be charged monthly(with term code 'a', SKU 'A') of daily((with term code 'b', SKU 'A')).\
	// 		AWS: 9QH3PUGXCYKNCYPB.HU7G6KETJZ
	TermCode string
	// Allowed OfferType are Instance, RAM, CPU
	OfferType OfferType
	// If the offer type is Instance, the payload would be the information of that instance, otherwise this field will be nil
	InstancePayload *OfferInstancePayload

	// Possible ChargeType are reserved, onDemand
	ChargeType ChargeType
	// Payload is present when the ChargeType is Reserved, otherwise nil.
	ChargePayload *ChargePayload

	// RegionList is the region that share the same price of this offer
	RegionList  []string
	Description string
	HourlyUSD   float64
	// CommitmentUSD is the price need be paid in advance in order to get a discount in the hourly fee.
	// If commitment is not applicable, CommitmentUSD would be 0.
	CommitmentUSD float64
}

// Client is the client for http request.
type Client interface {
	GetOffer() ([]*Offer, error)
}
