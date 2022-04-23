package store

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/bytebase/dbcost/client/aws"
	"github.com/stretchr/testify/require"
)

func Test_AWSSaveToLocal(t *testing.T) {
	c := aws.NewClient()
	offerList, err := c.GetOffer()
	require.NoError(t, err, "Fail to get price instance info")

	dbInstanceList, err := convertAWS(offerList)
	require.NoError(t, err, "Fail to convert to dbInstance")

	dirPath := fmt.Sprintf("./data/test")
	err = os.MkdirAll(dirPath, os.ModePerm)
	require.NoError(t, err, "Fail to make dir")

	filePath := fmt.Sprintf("%s/aws.json", dirPath)
	fd, err := os.Create(filePath)
	require.NoError(t, err, "Fail to mk file")

	dataByted, err := json.Marshal(dbInstanceList)
	require.NoError(t, err, "Fail to marshal DBInstanceList")

	_, err = fd.Write(dataByted)
	require.NoError(t, err)

}

func Test_Replace(t *testing.T) {
	a := strings.Replace("SQLGen2InstancesN1Standard", "SQLGen2Instances", "", -1)
	fmt.Println(a)
}
