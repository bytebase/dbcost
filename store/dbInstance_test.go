package store

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/bytebase/dbcost/client/aws"
)

func Test_AWSSaveToLocal(t *testing.T) {
	c := aws.NewClient()
	offerList, err := c.GetOffer()
	if err != nil {
		t.Fatalf("fail to get price instance info, [internal error]: %v", err)
	}
	dbInstanceList, err := ConvertAWS(offerList)
	if err != nil {
		t.Fatalf("fail to convert to dbInstance, [internal error]: %v", err)
	}

	dirPath := fmt.Sprintf("./data/test")
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		t.Fatalf("fail to mkdir, [internal error]: %v", err)
	}
	filePath := fmt.Sprintf("%s/aws.json", dirPath)
	fd, err := os.Create(filePath)
	if err != nil {
		t.Fatalf("fail to mk file, [internal error]: %v", err)
	}
	dataByted, err := json.Marshal(dbInstanceList)
	if err != nil {
		t.Fatalf("fail to marshal, [internal error]: %v", err)
	}
	if _, err := fd.Write(dataByted); err != nil {
		t.Fatalf("fail to write to file, [internal error]: %v", err)
	}
}

// func Test_GCPSaveToLocal(t *testing.T) {

// 	offerList, instanceList, err := gcp.GetOfferInstance()
// 	if err != nil {
// 		t.Fatalf("fail to get price instance info, [internal error]: %v", err)
// 	}
// 	dbInstanceList, err := ConvertGCP(offerList, instanceList)
// 	if err != nil {
// 		t.Fatalf("fail to convert to dbInstance, [internal error]: %v", err)
// 	}

// 	dirPath := fmt.Sprintf("./data/test")
// 	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
// 		t.Fatalf("fail to mkdir, [internal error]: %v", err)
// 	}
// 	filePath := fmt.Sprintf("%s/gcp-full.json", dirPath)
// 	fd, err := os.Create(filePath)
// 	if err != nil {
// 		t.Fatalf("fail to mk file, [internal error]: %v", err)
// 	}
// 	dataByted, err := json.Marshal(dbInstanceList)
// 	if err != nil {
// 		t.Fatalf("fail to marshal, [internal error]: %v", err)
// 	}
// 	if _, err := fd.Write(dataByted); err != nil {
// 		t.Fatalf("fail to write to file, [internal error]: %v", err)
// 	}
// }

func Test_Replace(t *testing.T) {
	a := strings.Replace("SQLGen2InstancesN1Standard", "SQLGen2Instances", "", -1)
	fmt.Println(a)
}
