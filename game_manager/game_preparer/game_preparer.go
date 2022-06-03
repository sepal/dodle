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
	"github.com/sepal/dodle/game_manager/dodle"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func initSession() (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})
}

func initDB() *bun.DB {
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

func HandleRequest(ctx context.Context, event events.SQSEvent) error {
	session, err := initSession()

	if err != nil {
		return err
	}

	db := initDB()

	r := dodle.CreateRoundRepository(db, session, os.Getenv("S3_BUCKET"))

	for _, record := range event.Records {
		var input dodle.RoundFactory
		err := json.Unmarshal([]byte(record.Body), &input)

		if err == nil {
			now := time.Now()
			round, err := r.CreateRound(ctx, now.Unix(), input)

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
