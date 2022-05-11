package main

import (
	"fmt"
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
		fmt.Printf("Env variable API_KEY_GCP not found, please set your API key in your environment first.\n")
		os.Exit(1)
	}

	cloudProvider[store.CloudProviderGCP] = gcp.NewClient(apiKeyGCP)
	cloudProvider[store.CloudProviderAWS] = aws.NewClient()
}

func main() {
	if isFileExist(filePath) {
		fmt.Printf("Fail already exist, pass seeding phase.\n")
		os.Exit(1)
		return
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
			fmt.Printf("Fail to covert to dbInstance.\n")
			os.Exit(1)
		}
		fmt.Printf("Converted to %d dbInstance entry.\n", len(providerDBInstanceList))

		for _, instance := range providerDBInstanceList {
			instance.ID = incrID
			dbInstanceList = append(dbInstanceList, instance)
			incrID++
		}
	}

	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		fmt.Printf("Fail to make dir, err: %s.\n", err)
		os.Exit(1)
	}
	fmt.Printf("Saving data, total entry: %d.\n", len(dbInstanceList))

	if err := store.Save(dbInstanceList, filePath); err != nil {
		fmt.Printf("Fail to save data, err: %s.\n", err)
		os.Exit(1)
	}
}

func isFileExist(fileName string) bool {
	_, err := os.Stat(fileName)
	return err == nil || os.IsExist(err)
}
