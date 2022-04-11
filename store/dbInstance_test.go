package store

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/bytebase/dbcost/client/aws"
)

func Test_SaveToLocal(t *testing.T) {
	priceList, instanceList, err := aws.MockGetPriceInstance("./example/aws-raw.json")
	if err != nil {
		t.Fatalf("fail to get price instance info, [internal error]: %v", err)
	}
	dbInstanceList, err := Convert(priceList, instanceList)
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
