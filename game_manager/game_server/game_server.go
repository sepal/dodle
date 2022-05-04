package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/sepal/dodle/game_manager/dodle"
)

const BUCKET = "dodle"

type GameResponse struct {
	Word   string    `json:"word"`
	Levels int       `json:"levels"`
	Scores []float64 `json:"scores"`
	Prompt string    `json:"prompt"`
}

func HandleRequest(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	env, ok := request.StageVariables["env"]

	if ok {
		dodle.AWS_PREFIX = env + "/"
	}

	session, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})

	if err != nil {
		log.Fatalf("Problem creating an AWS session: %s", err)
	}

	game, err := dodle.GetNextGame(session, BUCKET)

	if err != nil {
		log.Fatalf("Could not load next game due to: %s", err)
	}

	err = game.LoadImages(session)

	if err != nil {
		log.Fatalf("Could not load game images due to: %s", err)
	}

	g := GameResponse{
		Word:   game.Word,
		Levels: len(game.Files),
		Scores: game.Scores,
		Prompt: game.Prompt,
	}

	body, err := json.Marshal(g)

	if err != nil {
		return nil, err
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(body),
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
