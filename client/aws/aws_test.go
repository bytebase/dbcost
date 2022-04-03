package aws

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"
)

func Test_Extraction(t *testing.T) {
	file, err := os.ReadFile("../../store/example/aws-raw.json")
	if err != nil {
		t.Fail()
	}

	rawData := &rawJSON{}
	if err = json.Unmarshal(file, rawData); err != nil {
		t.Fail()
	}

	getPriceStart := time.Now()
	priceList, err := extractPrice(rawData)
	if err != nil {
		t.FailNow()
	}
	getPriceEnd := time.Now()
	fmt.Printf("get pricing info: [entry cnt]: %v, [time duration]: %v\n", len(priceList), getPriceEnd.Sub(getPriceStart))

	getInstanceStart := time.Now()
	instanceList, err := extractInstance(rawData)
	if err != nil {
		t.FailNow()
	}
	getInstanceEnd := time.Now()
	fmt.Printf("get instance info: [entry cnt]: %v, [time duration]: %v\n", len(instanceList), getInstanceEnd.Sub(getInstanceStart))
}

func Test_HTTP(t *testing.T) {
	c := NewClient()
	start := time.Now()
	price, instance, err := c.GetPriceInstance()
	end := time.Now()

	if err != nil {
		t.Fail()
	}

	fmt.Printf("get price instance info:\n[price entry cnt]: %v\n[instance entry cnt]: %v\n[time duration]: %v\n", len(price), len(instance), end.Sub(start))
}
