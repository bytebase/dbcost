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
	Type           client.ChargeType `json:"type"`
	Payload        *TermPayload      `json:"payload"`

	HourlyUSD     float64 `json:"hourlyUSD"`
	CommitmentUSD float64 `json:"commitmentUSD"`
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

// ConvertAWS convert the offer provided by AWS to DBInstance
func ConvertAWS(offerList []*client.Offer) ([]*DBInstance, error) {
	var dbInstanceList []*DBInstance
	dbInstanceMap := make(map[string]*DBInstance)
	offerMap := make(map[string][]*Term)

	for _, offer := range offerList {
		var payload *TermPayload
		// Only reserved type has payload field
		if offer.ChargeType == client.ChargeTypeReserved {
			payload = &TermPayload{
				LeaseContractLength: offer.ChargePayload.LeaseContractLength,
				PurchaseOption:      offer.ChargePayload.PurchaseOption,
			}
		}

		term := &Term{
			Type:          offer.ChargeType,
			Payload:       payload,
			HourlyUSD:     offer.HourlyUSD,
			CommitmentUSD: offer.CommitmentUSD,
		}
		if termList, ok := offerMap[offer.SKUID]; !ok {
			offerMap[offer.SKUID] = []*Term{term}
		} else {
			offerMap[offer.SKUID] = append(termList, term)
		}
	}

	now := time.Now().UTC()
	incrID := 0
	for _, offer := range offerList {
		// filter the offer does not have a instancePayload (only got price but no goods)
		if offer.InstancePayload == nil {
			continue
		}

		instance := offer.InstancePayload
		vCPUInt, err := strconv.Atoi(instance.VCPU)
		if err != nil {
			return nil, fmt.Errorf("Fail to parse the VCPU value from string to int, [val]: %v", instance.VCPU)
		}
		memoryDigit := instance.Memory[:strings.Index(instance.Memory, "GiB")-1]

		if _, ok := dbInstanceMap[instance.Type]; !ok {
			dbInstance := &DBInstance{
				ID:            incrID,
				ExternalID:    offer.SKUID,
				RowStatus:     RowStatusNormal,
				CreatorID:     SYSTEM_BOT,
				CreatedTs:     now.Unix(),
				UpdaterID:     SYSTEM_BOT,
				UpdatedTs:     now.Unix(),
				CloudProvider: CloudProviderAWS,

				Name:      instance.Type, // e.g. db.t4g.xlarge
				VCPU:      vCPUInt,
				Memory:    memoryDigit,
				Processor: instance.PhysicalProcessor,

				RegionList: []*Region{},
			}
			dbInstanceList = append(dbInstanceList, dbInstance)
			dbInstanceMap[instance.Type] = dbInstance
			incrID++
		}

		// fill in the region info
		dbInstance := dbInstanceMap[instance.Type]
		for _, offerRegion := range offer.RegionList {
			isRegionExist := false
			for _, region := range dbInstance.RegionList {
				if region.Name == offerRegion {
					if offerList, ok := offerMap[offer.SKUID]; ok {
						for _, offer := range offerList {
							offer.DatabaseEngine = instance.DatabaseEngine
						}
						region.TermList = append(region.TermList, offerMap[offer.SKUID]...)
					}
					isRegionExist = true
					break
				}
			}
			if !isRegionExist {
				dbInstance.RegionList = append(dbInstance.RegionList, &Region{
					Name:     offerRegion,
					TermList: offerMap[offer.SKUID],
				})
			}
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
