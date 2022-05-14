package store

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/bytebase/dbcost/client/aws"
	"github.com/bytebase/dbcost/client/gcp"
	"github.com/stretchr/testify/require"
)

func Test_AWSSaveToLocal(t *testing.T) {
	c := aws.NewClient()
	offerList, err := c.GetOffer()
	require.NoError(t, err, "Fail to get price instance info")

	dbInstanceList, err := Convert(offerList, CloudProviderAWS)
	require.NoError(t, err, "Fail to convert to dbInstance")

	dirPath := fmt.Sprintf("../data/test")
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

func Test_GCPSaveToLocal(t *testing.T) {
	c := gcp.NewClient("GCP API Key")
	offerList, err := c.GetOffer()
	require.NoError(t, err, "Fail to get price instance info")

	dbInstanceList, err := Convert(offerList, CloudProviderGCP)
	require.NoError(t, err, "Fail to convert to dbInstance")

	dirPath := fmt.Sprintf("../data/test")
	err = os.MkdirAll(dirPath, os.ModePerm)
	require.NoError(t, err, "Fail to make dir")

	filePath := fmt.Sprintf("%s/gcp.json", dirPath)
	fd, err := os.Create(filePath)
	require.NoError(t, err, "Fail to mk file")

	dataByted, err := json.Marshal(dbInstanceList)
	require.NoError(t, err, "Fail to marshal DBInstanceList")

	_, err = fd.Write(dataByted)
	require.NoError(t, err)
}
