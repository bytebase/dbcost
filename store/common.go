package store

// RowStatus is the type of the row status
type RowStatus string

const (
	// RowStatusNormal is the normal status of a row
	RowStatusNormal RowStatus = "NORMAL"
	// RowStatusArchived is the archived status of a row
	RowStatusArchived RowStatus = "ARCHIVED"
)

func (r RowStatus) String() string {
	switch r {
	case RowStatusNormal:
		return "NORMAL"
	case RowStatusArchived:
		return "ARCHIVED"
	}
	return ""
}

// CloudProvider is the type of the cloud provider, eg. GCP, Aliyun
type CloudProvider string

const (
	// CloudProviderAWS is the enumerate type for AWS
	CloudProviderAWS = "AWS"
	// CloudProviderALIYUN is the enumerate type for ALIYUN
	CloudProviderALIYUN = "ALIYUN"
	// CloudProviderGCP is the enumerate type for GCP
	CloudProviderGCP = "GCP"
)

func (c CloudProvider) String() string {
	switch c {
	case CloudProviderAWS:
		return "AWS"
	case CloudProviderALIYUN:
		return "ALIYUN"
	case CloudProviderGCP:
		return "GCP"
	}
	return ""
}
