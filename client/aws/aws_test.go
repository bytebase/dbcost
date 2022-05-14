package aws

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_Extraction(t *testing.T) {
	file, err := os.ReadFile("./apiExample/aws.json")
	require.NoError(t, err)

	rawData := &pricing{}
	err = json.Unmarshal(file, rawData)
	require.NoError(t, err)

	_, err = extractOffer(rawData)
	require.NoError(t, err)

	byteProducts, err := json.Marshal(rawData.Product)
	require.NoError(t, err)
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList instanceRecord
	err = productsDecoder.Decode(&rawEntryList)
	require.NoError(t, err)
}

func Test_HTTP(t *testing.T) {
	c := NewClient()
	_, err := c.GetOffer()
	require.NoError(t, err)
}
