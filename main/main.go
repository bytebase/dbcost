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

var cloudProvider = make(map[store.CloudProvider]client.Client)

func init() {
	APIKeyGCP := os.Args[1]
	cloudProvider[store.CloudProviderGCP] = gcp.NewClient(APIKeyGCP)
	cloudProvider[store.CloudProviderAWS] = aws.NewClient()
}

var (
	dirPath  = "./store/data"
	fileName = "rds.json"
	filePath = path.Join(dirPath, fileName)
)

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
