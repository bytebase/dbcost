package store

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/bytebase/dbcost/client"
)

// TermPayload is the payload of the term
type TermPayload struct {
	// e.g. 3ys 1ms
	LeaseContractLength string `json:"leaseContractLength"`
	// e.g. All Upfront, Partail Upfront
	PurchaseOption string `json:"purchaseOption"`
}

// Term is the pricing term of a given instance
type Term struct {
	Code string `json:"code"`

	DatabaseEngine client.EngineType `json:"databaseEngine"`
	Type           client.ChargeType `json:"type"`
	Payload        *TermPayload      `json:"payload"`

	HourlyUSD     float64 `json:"hourlyUSD"`
	CommitmentUSD float64 `json:"commitmentUSD"`
}

// Region is region-price info of a given instance
type Region struct {
	Code     string  `json:"code"`
	TermList []*Term `json:"termList"`
}

// DBInstance is the type of DBInstance
type DBInstance struct {
	// system fields
	ID        int       `json:"id"`
	RowStatus RowStatus `json:"rowStatus"`
	CreatorID int       `json:"creatorId"`
	CreatedTs int64     `json:"createdTs"`
	UpdaterID int       `json:"updaterId"`
	UpdatedTs int64     `json:"updatedTs"`

	// Region-Price info
	RegionList []*Region `json:"regionList"`

	// domain fields
	CloudProvider string `json:"cloudProvider"`
	Name          string `json:"name"`
	CPU           int    `json:"cpu"`
	Memory        string `json:"memory"`
	Processor     string `json:"processor"`
}

// Convert convert the offer provided by client to DBInstance
func Convert(offerList []*client.Offer, cloudProvider CloudProvider) ([]*DBInstance, error) {
	termMap := make(map[int][]*Term)
	for _, offer := range offerList {
		// filter the offer does not have a instancePayload (only got price but no goods).
		if offer.InstancePayload == nil {
			continue
		}
		var termPayload *TermPayload
		// Only reserved type has payload field
		if offer.ChargeType == client.ChargeTypeReserved {
			termPayload = &TermPayload{
				LeaseContractLength: offer.ChargePayload.LeaseContractLength,
				PurchaseOption:      offer.ChargePayload.PurchaseOption,
			}
		}

		term := &Term{
			Code:           offer.TermCode,
			DatabaseEngine: offer.InstancePayload.DatabaseEngine,
			Type:           offer.ChargeType,
			Payload:        termPayload,
			HourlyUSD:      offer.HourlyUSD,
			CommitmentUSD:  offer.CommitmentUSD,
		}
		termMap[offer.ID] = append(termMap[offer.ID], term)
	}

	now := time.Now().UTC()
	incrID := 0
	// dbInstanceMap is used to aggregate the instance by their type (e.g. db.m3.large).
	dbInstanceMap := make(map[string]*DBInstance)
	var dbInstanceList []*DBInstance
	// extract dbInstance from the payload field stored in the offer.
	for _, offer := range offerList {
		// filter the offer does not have a instancePayload (only got price but no goods).
		if offer.InstancePayload == nil {
			continue
		}

		instance := offer.InstancePayload
		cpuInt, err := strconv.Atoi(instance.CPU)
		if err != nil {
			return nil, fmt.Errorf("Fail to parse the CPU value from string to int, [val]: %v", instance.CPU)
		}
		memoryDigit := instance.Memory

		// we use the instance type (e.g. db.m3.xlarge) differentiate the specification of each instances,
		// and consider they as the same instance.
		if _, ok := dbInstanceMap[instance.Type]; !ok {
			dbInstance := &DBInstance{
				ID:            incrID,
				RowStatus:     RowStatusNormal,
				CreatorID:     SYSTEM_BOT,
				CreatedTs:     now.Unix(),
				UpdaterID:     SYSTEM_BOT,
				UpdatedTs:     now.Unix(),
				CloudProvider: cloudProvider.String(),
				Name:          instance.Type, // e.g. db.t4g.xlarge
				CPU:           cpuInt,
				Memory:        memoryDigit,
				Processor:     instance.PhysicalProcessor,
			}
			dbInstanceList = append(dbInstanceList, dbInstance)
			dbInstanceMap[instance.Type] = dbInstance
			incrID++
		}

		// fill in the term info of the instance
		dbInstance := dbInstanceMap[instance.Type]
		for _, regionCode := range offer.RegionList {
			isRegionExist := false
			for _, region := range dbInstance.RegionList {
				if region.Code == regionCode {
					isRegionExist = true
					if _, ok := termMap[offer.ID]; ok {
						region.TermList = append(region.TermList, termMap[offer.ID]...)
					}
				}
			}
			if !isRegionExist {
				dbInstance.RegionList = append(dbInstance.RegionList, &Region{
					Code:     regionCode,
					TermList: termMap[offer.ID],
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

	return fd.Close()
}
