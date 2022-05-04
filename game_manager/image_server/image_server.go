package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/sepal/dodle/game_manager/dodle"
)

const BUCKET = "dodle"

func CreateErrorResponse(statusCode int, message string) (*events.APIGatewayProxyResponse, error) {
	body, err := json.Marshal(map[string]string{
		"error": message,
	})

	if err != nil {
		return nil, err
	}

	resp := &events.APIGatewayProxyResponse{
		StatusCode: http.StatusNotFound,
		Body:       string(body),
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}
	return resp, nil
}

func HandleRequest(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	dodle.AWS_PREFIX = "testing/"

	session, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})

	if err != nil {
		return nil, err
	}

	game, err := dodle.GetNextGame(session, BUCKET)

	if err != nil {
		return nil, err
	}

	level := 0

	level_str, ok := request.QueryStringParameters["level"]

	if ok {
		level, err = strconv.Atoi(level_str)

		if err != nil {
			resp, err := CreateErrorResponse(http.StatusNotFound, "Invalid level given.")
			if err != nil {
				return nil, err
			}

			return resp, nil
		}
	}

	if level >= len(game.Files) || level < 0 {
		resp, err := CreateErrorResponse(http.StatusNotFound, "Image not found for given level.")
		if err != nil {
			return nil, err
		}

		return resp, nil
	}

	image, err := game.GetImage(session, level)

	if err != nil {
		log.Fatalf("Could not load image due to: %s", err)
	}

	b64Img := base64.StdEncoding.EncodeToString(image)

	return &events.APIGatewayProxyResponse{
		StatusCode:      http.StatusOK,
		Body:            b64Img,
		IsBase64Encoded: true,
		Headers: map[string]string{
			"Content-Type": "image/png",
		},
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
