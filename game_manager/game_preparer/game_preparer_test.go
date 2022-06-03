package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/joho/godotenv"
	"github.com/sepal/dodle/game_manager/dodle"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func getTestMessage() events.SQSEvent {

	message := events.SQSMessage{
		MessageId:     "2ecbbaab-f350-42dc-b356-65b4ab76d1e7",
		ReceiptHandle: "MessageReceiptHandle",
		Body:          "{\"word\": \"paper\", \"prompt\": \"beautiful black paper doodle\", \"images\": [{\"key\": \"inbox/1654002616/0.png\", \"score\": 16}, {\"key\": \"inbox/1654002616/1.png\", \"score\": 18}, {\"key\": \"inbox/1654002616/2.png\", \"score\": 18}, {\"key\": \"inbox/1654002616/3.png\", \"score\": 20}, {\"key\": \"inbox/1654002616/4.png\", \"score\": 20}], \"prefix\": \"inbox/1654002616\"}",
		Attributes: map[string]string{
			"CreatedAt": "1654002616",
			"CreatedBy": "ps6x1a3nv",
			"Type":      "GameInbox",
		},
	}

	event := events.SQSEvent{
		Records: []events.SQSMessage{
			message,
		},
	}

	return event
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

func setup() *bun.DB {
	godotenv.Load(".env")

	db := initDB()

	ctx := context.Background()
	dodle.CreateSchemas(ctx, db)

	return db
}

func tearDown(db *bun.DB) error {
	ctx := context.Background()

	db.NewDropTable().Model((*dodle.ImageEntry)(nil)).Exec(ctx)
	db.NewDropTable().Model((*dodle.DBRound)(nil)).Exec(ctx)

	return nil
}

func TestHandleRequest(t *testing.T) {
	db := setup()
	defer tearDown(db)

	ctx := context.Background()
	message := getTestMessage()

	err := HandleRequest(ctx, message)

	if err != nil {
		t.Fatalf("Error while handling request %s", err)
	}

	var round *dodle.DBRound
	db.NewSelect().
		Model(round).
		Limit(1).
		Scan(ctx)

	if round == nil {
		t.Fatal("No new round inserted")
	}

	if round.Word != "paper" {
		t.Fatalf("Expected word paper, got %s", round.Word)
	}

	if len(round.Images) != 5 {
		t.Fatalf("Expected to %d images, got %d", 5, len(round.Images))
	}
}
