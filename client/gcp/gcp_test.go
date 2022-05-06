package gcp

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_GetOffer(t *testing.T) {
	c := NewClient()
	_, err := c.GetOffer()
	require.NoError(t, err)
}
