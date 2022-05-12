package main

import (
	"fmt"
	"log"
	"os"
	"path"

	"github.com/bytebase/dbcost/client"
	"github.com/bytebase/dbcost/client/aws"
	"github.com/bytebase/dbcost/client/gcp"
	"github.com/bytebase/dbcost/store"
)

var (
	cloudProvider = make(map[store.CloudProvider]client.Client)
	// renderEnvKey is set on render
	renderEnvKey = "API_KEY_GCP"
	apiKeyGCP    = ""
	dirPath      = "./store/data"
	fileName     = "rds.json"
	filePath     = path.Join(dirPath, fileName)
)

func init() {
	apiKeyGCP = os.Getenv(renderEnvKey)
	if apiKeyGCP == "" {
		log.Fatalf("Env variable API_KEY_GCP not found, please set your API key in your environment first.\n")
	}

	cloudProvider[store.CloudProviderGCP] = gcp.NewClient(apiKeyGCP)
	cloudProvider[store.CloudProviderAWS] = aws.NewClient()
}

func main() {
	if isFileExist(filePath) {
		log.Fatalf("Fail already exist, pass seeding phase.\n")
	}

	incrID := 0
	var dbInstanceList []*store.DBInstance
	for provider, client := range cloudProvider {
		fmt.Printf("--------Fetching %s--------\n", provider)

		offerList, err := client.GetOffer()
		if err != nil {
			fmt.Printf("Error occurred when fetching %s's entry.\n", provider)
			continue
		}
		fmt.Printf("Fetched %d offer entry.\n", len(offerList))

		providerDBInstanceList, err := store.Convert(offerList, provider)
		if err != nil {
			log.Fatalf("Fail to covert to dbInstance.\n")
		}
		fmt.Printf("Converted to %d dbInstance entry.\n", len(providerDBInstanceList))

		for _, instance := range providerDBInstanceList {
			instance.ID = incrID
			dbInstanceList = append(dbInstanceList, instance)
			incrID++
		}
	}

	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		log.Fatalf("Fail to make dir, err: %s.\n", err)
	}

	fmt.Printf("Saving data, total entry: %d.\n", len(dbInstanceList))

	if err := store.Save(dbInstanceList, filePath); err != nil {
		log.Fatalf("Fail to save data, err: %s.\n", err)
	}
}

func isFileExist(fileName string) bool {
	_, err := os.Stat(fileName)
	return err == nil || os.IsExist(err)
}
