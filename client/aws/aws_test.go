package aws

import (
	"testing"
)

func Test_Get(t *testing.T) {
	c := NewClient()
	if _, err := c.GetPrice(""); err != nil {
		t.FailNow()
	}
	if _, err := c.GetInstance(""); err != nil {
		t.FailNow()
	}

}
