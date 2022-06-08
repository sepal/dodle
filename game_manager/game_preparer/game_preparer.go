package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

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

func HandleRequest(ctx context.Context, event events.SQSEvent) error {
	for _, record := range event.Records {
		var input dodle.RoundFactory
		err := json.Unmarshal([]byte(record.Body), &input)

		if err == nil {
			now := time.Now()
			round, err := repository.CreateRound(ctx, now.Unix(), input)

			if err != nil {
				log.Printf("Error while creating round %s", err)
			} else {
				log.Printf("Created new round with id %d", round.ID)
			}

		} else {
			log.Printf("Could not decode body for message %s due to %s", record.MessageId, err)
			log.Printf("Body is: '%s'", record.Body)
		}
	}
	return nil
}

func main() {
	lambda.Start(HandleRequest)
}
