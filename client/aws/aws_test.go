package aws

import (
	"fmt"
	"testing"
)

func Test_Get(t *testing.T) {
	c := NewClient()
	list, _ := c.Get("as")
	fmt.Println(list)
}
