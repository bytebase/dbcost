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
