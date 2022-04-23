package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func Test_Extraction(t *testing.T) {
	file, err := os.ReadFile("../../store/example/aws.json")
	require.NoError(t, err)

	rawData := &Rawjson{}
	err = json.Unmarshal(file, rawData)
	require.NoError(t, err)

	getOfferStart := time.Now()
	offerList, err := extractOffer(rawData)
	require.NoError(t, err)
	getOfferEnd := time.Now()
	fmt.Printf("get pricing info: [entry cnt]: %v, [time duration]: %v\n", len(offerList), getOfferEnd.Sub(getOfferStart))

	fillInstanceStart := time.Now()
	byteProducts, err := json.Marshal(rawData.Product)
	require.NoError(t, err)
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList InstanceRecord
	err = productsDecoder.Decode(&rawEntryList)
	require.NoError(t, err)

	fillInstancePayload(rawEntryList, offerList)

	fillInstanceEnd := time.Now()
	fmt.Printf("get instance info: [entry cnt]: %v, [time duration]: %v\n", len(offerList), fillInstanceEnd.Sub(fillInstanceStart))
}

func Test_HTTP(t *testing.T) {
	start := time.Now()

	c := NewClient()
	offerList, err := c.GetOffer()
	require.NoError(t, err)

	end := time.Now()

	fmt.Printf("get offer:\n[offer entry cnt]: %v\n[time duration]: %v\n", len(offerList), end.Sub(start))
}
