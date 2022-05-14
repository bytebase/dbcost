package main

import (
	"log"
	"os"
	"path"

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

func main() {
	apiKeyGCP := os.Getenv(renderEnvKey)
	if apiKeyGCP == "" {
		log.Fatalf("Env variable API_KEY_GCP not found, please set your API key in your environment first.\n")
	}

	cloudProvider := map[store.CloudProvider]client.Client{
		store.CloudProviderGCP: gcp.NewClient(apiKeyGCP),
		store.CloudProviderAWS: aws.NewClient(),
	}

	incrID := 0
	var dbInstanceList []*store.DBInstance
	for provider, client := range cloudProvider {
		log.Printf("--------Fetching %s--------\n", provider)
		offerList, err := client.GetOffer()
		if err != nil {
			log.Printf("Error occurred when fetching %s's entry.\n", provider)
			continue
		}
		log.Printf("Fetched %d offer entry.\n", len(offerList))

		providerDBInstanceList, err := store.Convert(offerList, provider)
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
