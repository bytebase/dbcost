package store

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bytebase/dbcost/client"
)

type TermPayload struct {
	LeaseContractLength string `json:"leaseContractLength"`
	PurchaseOption      string `json:"purchaseOption"`
}

// Term is the pricing term of a given instance
type Term struct {
	DatabaseEngine client.EngineType `json:"databaseEngine"`
	Type           client.OfferType  `json:"type"`
	Payload        *TermPayload      `json:"payload"`

	Unit        string  `json:"unit"`
	USD         float64 `json:"usd"`
	Description string  `json:"description"`
}

// Region is region-price info of a given instance
type Region struct {
	Name     string  `json:"name"`
	TermList []*Term `json:"termList"`
}

// DBInstance is the type of DBInstance
type DBInstance struct {
	// system fields
	ID         int       `json:"id"`
	ExternalID string    `json:"externalId"`
	RowStatus  RowStatus `json:"rowStatus"`
	CreatorID  int       `json:"creatorId"`
	CreatedTs  int64     `json:"createdTs"`
	UpdaterID  int       `json:"updaterId"`
	UpdatedTs  int64     `json:"updatedTs"`

	// Region-Price info
	RegionList []*Region `json:"regionList"`

	// domain fields
	CloudProvider string `json:"cloudProvider"`
	Name          string `json:"name"`
	VCPU          int    `json:"vCPU"`
	Memory        string `json:"memory"`
	Processor     string `json:"processor"`
}

// Convert convert the client api message to the storage form
func Convert(priceList []*client.Offer, instanceList []*client.Instance) ([]*DBInstance, error) {
	var dbInstanceList []*DBInstance
	dbInstanceMap := make(map[string]*DBInstance)
	offerMap := make(map[string][]*Term)

	for _, offer := range priceList {
		var payload *TermPayload
		// Only reserved type has payload field
		if offer.Type == client.OfferTypeReserved {
			payload = &TermPayload{
				LeaseContractLength: offer.Payload.LeaseContractLength,
				PurchaseOption:      offer.Payload.PurchaseOption,
			}
		}

		term := &Term{
			Type:        offer.Type,
			Payload:     payload,
			Unit:        offer.Unit,
			USD:         offer.USD,
			Description: offer.Description,
		}
		if termList, ok := offerMap[offer.InstanceID]; !ok {
			offerMap[offer.InstanceID] = []*Term{term}
		} else {
			offerMap[offer.InstanceID] = append(termList, term)
		}
	}

	now := time.Now().UTC()
	incrID := 0
	for _, instance := range instanceList {
		vCPUInt, err := strconv.Atoi(instance.VCPU)
		if err != nil {
			return nil, fmt.Errorf("Fail to parse the VCPU value from string to int, [val]: %v", instance.VCPU)
		}

		memoryDigit := instance.Memory[:strings.Index(instance.Memory, "GiB")-1]

		if dbInstance, ok := dbInstanceMap[instance.Type]; ok {
			regionList := dbInstance.RegionList
			isRegionExist := false
			for _, region := range regionList {
				if region.Name == instance.Region {
					if offerList, ok := offerMap[instance.ID]; ok {
						for _, offer := range offerList {
							offer.DatabaseEngine = instance.DatabaseEngine
						}
						region.TermList = append(region.TermList, offerMap[instance.ID]...)
					}
					isRegionExist = true
					break
				}
			}
			if !isRegionExist {
				regionList = append(regionList, &Region{
					Name:     instance.Region,
					TermList: offerMap[instance.ID],
				})
			}
		} else {
			dbInstance := &DBInstance{
				ID:         incrID,
				ExternalID: instance.ID,
				RowStatus:  RowStatusNormal,
				CreatorID:  SYSTEM_BOT,
				CreatedTs:  now.Unix(),
				UpdaterID:  SYSTEM_BOT,
				UpdatedTs:  now.Unix(),
				RegionList: []*Region{
					{
						Name:     instance.Region,
						TermList: offerMap[instance.ID],
					},
				},
				CloudProvider: CloudProviderAWS,
				Name:          instance.Type, // e.g. db.t4g.xlarge
				VCPU:          vCPUInt,
				Memory:        memoryDigit,
				Processor:     instance.PhysicalProcessor,
			}
			dbInstanceList = append(dbInstanceList, dbInstance)
			dbInstanceMap[instance.Type] = dbInstance

			incrID++
		}

	}

	return dbInstanceList, nil
}

// Save save DBInstanceList to local .json file
func Save(dbInstanceList []*DBInstance, filePath string) error {
	fd, err := os.Create(filePath)
	if err != nil {
		return err
	}

	dataByted, err := json.Marshal(dbInstanceList)
	if err != nil {
		return err
	}
	if _, err := fd.Write(dataByted); err != nil {
		return err
	}

	return nil
}
