package main

import (
	"log"
	"os"
	"path"
	"sort"

	"github.com/bytebase/dbcost/client"
	"github.com/bytebase/dbcost/client/aws"
	"github.com/bytebase/dbcost/client/gcp"
	"github.com/bytebase/dbcost/store"
)

const (
	// renderEnvKey is set on render.
	renderEnvKey = "API_KEY_GCP"
	dirPath      = "data"
	fileName     = "dbInstance.json"
)

type ProviderPair struct {
	Provider store.CloudProvider
	Client   client.Client
}

func main() {
	apiKeyGCP := os.Getenv(renderEnvKey)
	if apiKeyGCP == "" {
		log.Fatalf("Env variable API_KEY_GCP not found, please set your API key in your environment first.\n")
	}

	cloudProviderList := []ProviderPair{
		{store.CloudProviderGCP, gcp.NewClient(apiKeyGCP)},
		{store.CloudProviderAWS, aws.NewClient()},
	}

	incrID := 0
	var dbInstanceList []*store.DBInstance
	for _, pair := range cloudProviderList {
		log.Printf("--------Fetching %s--------\n", pair.Provider)
		offerList, err := pair.Client.GetOffer()
		// sort offerList to generate a stable output
		sort.SliceStable(offerList, func(i, j int) bool { return offerList[i].TermCode < offerList[j].TermCode })
		if err != nil {
			log.Printf("Error occurred when fetching %s's entry.\n", pair.Provider)
			continue
		}
		log.Printf("Fetched %d offer entry.\n", len(offerList))

		providerDBInstanceList, err := store.Convert(offerList, pair.Provider)
		if err != nil {
			log.Fatalf("Fail to covert to dbInstance.\n")
		}
		log.Printf("Converted to %d dbInstance entry.\n", len(providerDBInstanceList))

		for _, instance := range providerDBInstanceList {
			instance.ID = incrID
			dbInstanceList = append(dbInstanceList, instance)
			incrID++
		}
	}

	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		log.Fatalf("Fail to make dir, err: %s.\n", err)
	}

	log.Printf("Saving data, total entry: %d.\n", len(dbInstanceList))

	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		log.Fatalf("Fail to make dir, err: err.\n")
	}

	targetFilePath := path.Join(dirPath, fileName)
	if err := store.Save(dbInstanceList, targetFilePath); err != nil {
		log.Fatalf("Fail to save data, err: %s.\n", err)
	}
	log.Printf("File saved to: %s.\n", targetFilePath)

}
