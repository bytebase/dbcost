package main

import (
	"fmt"
	"os"

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

const dirPath = "./store/data"
const filePath = "./store/data/rds.json"

func main() {
	if isFileExist(filePath) {
		panic("File exist")
	}

	incrID := 0
	var dbInstanceList []*store.DBInstance
	for provider, client := range cloudProvider {
		fmt.Println("Fetching ", provider)
		offerList, err := client.GetOffer()
		if err != nil {
			println("2")
		}

		providerDBInstanceList, err := store.Convert(offerList, provider)
		fmt.Println("Fetched ", len(providerDBInstanceList))
		if err != nil {
			println("3")
		}

		for _, instance := range providerDBInstanceList {
			instance.ID = incrID
			dbInstanceList = append(dbInstanceList, instance)
			incrID++
		}
	}

	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		println("41")
	}
	fmt.Println("Saving data, total entry: ", len(dbInstanceList))
	if err := store.Save(dbInstanceList, filePath); err != nil {
		println("4")
	}
}

func isFileExist(fileName string) bool {
	_, err := os.Stat(fileName)
	return err == nil || os.IsExist(err)
}
