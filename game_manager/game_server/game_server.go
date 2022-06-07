package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/joho/godotenv"
	"github.com/sepal/dodle/game_manager/dodle"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

var repository dodle.Repository

func initSession() (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})
}

func initDB() *bun.DB {
	godotenv.Load(".env")

	dsn := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_NAME"),
	)

	conn := pgdriver.NewConnector(pgdriver.WithDSN(dsn))
	db := sql.OpenDB(conn)

	return bun.NewDB(db, pgdialect.New())
}

func init() {
	session, err := initSession()

	if err != nil {
		log.Fatalf("Error while trying to create aws session %s", err)
	}

	db := initDB()

	repository = dodle.CreateRoundRepository(db, session, os.Getenv("S3_BUCKET"))

	ctx := context.Background()
	dodle.CreateSchemas(ctx, db)
}

func HandleRequest(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	ctx := context.Background()
	time, err := strconv.ParseInt(request.QueryStringParameters["time"], 10, 64)

	if err != nil {
		return nil, err
	}

	round, err := repository.GetRoundByTime(ctx, time)

	if err != nil {
		return nil, err
	}

	body, err := json.Marshal(round)

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
