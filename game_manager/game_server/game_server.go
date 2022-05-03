package main

import (
	"log"
	"path/filepath"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/sepal/dodle/game_manager/dodle"
)

const BUCKET = "dodle"

type GameResponse struct {
	Word   string   `json:"word"`
	Images []string `json:"images"`
}

var game dodle.GameData

func HandleRequest(request events.APIGatewayProxyRequest) (g GameResponse, err error) {
	dodle.AWS_PREFIX = "testing/"

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

	g.Word = game.Word

	for _, f := range game.Files {
		fp := filepath.Base(f)
		g.Images = append(g.Images, fp)
	}

	return g, err
}

func main() {
	lambda.Start(HandleRequest)
}
