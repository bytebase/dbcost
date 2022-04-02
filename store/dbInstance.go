package store

// DBInstance is the type of DBInstance
type DBInstance struct {
	// system fields
	ID         int64     `json:"id"`
	ExternalID string    `json:"externalId"`
	RowStatus  RowStatus `json:"rowStatus"`
	CreatorID  int       `json:"creatorId"`
	CreatedTs  int64     `json:"createdTs"`
	UpdaterID  int       `json:"updaterId"`
	UpdatedTs  int64     `json:"UpdatedTs"`

	// reference fields
	CloudProviderID int   `json:"cloudProviderId"`
	RegionID        int   `json:"regionId"`
	TermIDList      []int `json:"termIdList"`

	// domain fields
	Name      string `json:"name"`
	VCpu      int    `json:"vCpu"`
	Memory    int    `json:"memory"`
	Processor string `json:"processor"`
}
