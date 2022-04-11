package aws

import (
	"encoding/json"
	"fmt"
	"os"
)

// MockGetPriceInstance mock the aws client
func MockGetPriceInstance(filePath string) ([]*Price, []*Instance, error) {
	file, err := os.ReadFile(filePath)

	rawData := &rawJSON{}
	if err = json.Unmarshal(file, rawData); err != nil {
		return nil, nil, fmt.Errorf("fail to unmarshal json, internal: %v", err)
	}

	priceList, err := extractPrice(rawData)
	if err != nil {
		return nil, nil, err
	}

	instanceList, err := extractInstance(rawData)
	if err != nil {
		return nil, nil, err
	}

	return priceList, instanceList, nil
}
