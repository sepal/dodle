package main

import (
	"encoding/json"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestHandleRequest(t *testing.T) {
	request := events.APIGatewayProxyRequest{
		StageVariables: map[string]string{
			"env": "testing",
		},
	}

	response, err := HandleRequest(request)

	if err != nil {
		t.Fatal(err)
	}

	var game GameResponse

	err = json.Unmarshal([]byte(response.Body), &game)

	if err != nil {
		t.Fatal(err)
	}

	if game.GameDate != 1651536000 {
		t.Fatalf("Expected game 1651536000, got game %d", game.GameDate)
	}
}
