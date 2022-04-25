package aws

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"

	"github.com/bytebase/dbcost/client"
)

// MockGetOffer mock the aws client
func MockGetOffer(filePath string) ([]*client.Offer, error) {
	file, err := os.ReadFile(filePath)

	rawData := &pricing{}
	if err = json.Unmarshal(file, rawData); err != nil {
		return nil, fmt.Errorf("fail to unmarshal json, internal: %v", err)
	}

	offerList, err := extractOffer(rawData)
	if err != nil {
		return nil, err
	}

	byteProducts, err := json.Marshal(rawData.Product)
	if err != nil {
		return nil, fmt.Errorf("Fail to unmarshal the result, [internal]: %v", err)
	}
	productsDecoder := json.NewDecoder(bytes.NewReader(byteProducts))
	var rawEntryList instanceRecord
	if err := productsDecoder.Decode(&rawEntryList); err != nil {
		return nil, fmt.Errorf("Fail to decode the result, [internal]: %v", err)
	}

	fillInstancePayload(rawEntryList, offerList)

	return offerList, nil
}
