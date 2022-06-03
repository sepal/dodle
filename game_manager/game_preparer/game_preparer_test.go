package main

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/joho/godotenv"
	"github.com/sepal/dodle/game_manager/dodle"
	"github.com/uptrace/bun"
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

func TestDecodeBody(t *testing.T) {
	event := getTestMessage()

	for _, record := range event.Records {
		var input dodle.RoundFactory
		err := json.Unmarshal([]byte(record.Body), &input)

		if err != nil {
			t.Fatalf("Error while decoding body, %s", err)
		}
	}

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

	var out []dodle.DBRound
	err = db.NewSelect().
		Model(&out).
		Relation("Images").
		Limit(1).
		Scan(ctx)

	if err != nil {
		t.Fatalf("Error while trying to fetch round: %s", err)
	}

	if len(out) < 1 {
		t.Fatalf("Expected one round fetched, got %d", len(out))
	}

	word := "paper"
	if out[0].Word != word {
		t.Fatalf("Expected fetched round to have word %s, not %s", word, out[0].Word)
	}

	images := 5
	if len(out[0].Images) != images {
		t.Fatalf("Expected to %d images, got %d", images, len(out[0].Images))
	}
}
