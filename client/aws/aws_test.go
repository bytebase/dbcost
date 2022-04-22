package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"
)

func Test_Extraction(t *testing.T) {
	file, err := os.ReadFile("../../store/example/aws.json")
	if err != nil {
		t.Fail()
	}

	rawData := &rawJSON{}
	if err = json.Unmarshal(file, rawData); err != nil {
		t.Fail()
	}

	getOfferStart := time.Now()
	offerList, err := extractOffer(rawData)
	if err != nil {
		t.FailNow()
	}
	getOfferEnd := time.Now()
	fmt.Printf("get pricing info: [entry cnt]: %v, [time duration]: %v\n", len(offerList), getOfferEnd.Sub(getOfferStart))

	fillInstanceStart := time.Now()
	byteProducts, err := json.Marshal(rawData.Product)
	if err != nil {
		t.FailNow()
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList InstanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		t.FailNow()
	}
	fillInstancePayload(rawEntryList, offerList)
	if err != nil {
		t.FailNow()
	}
	fillInstanceEnd := time.Now()
	fmt.Printf("get instance info: [entry cnt]: %v, [time duration]: %v\n", len(offerList), fillInstanceEnd.Sub(fillInstanceStart))
}

func Test_HTTP(t *testing.T) {
	c := NewClient()
	start := time.Now()
	offerList, err := c.GetOffer()
	end := time.Now()

	if err != nil {
		t.Fail()
	}

	fmt.Printf("get offer:\n[offer entry cnt]: %v\n[time duration]: %v\n", len(offerList), end.Sub(start))
}
