package dodle

import (
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
)

func TestLoadGame(t *testing.T) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})

	if err != nil {
		t.Fatalf(`Error while loading game: %s`, err)
	}

	game, err := LoadGame(sess, "dodle", "game/1651418811")

	if err != nil {
		t.Fatalf(`Error while loading game: %s`, err)
	}

	if game == nil {
		t.Fatal(`Game not loaded`)
	}

	if game.Word != "toad" {
		t.Fatalf(`Wanted game with word toad got "%s"`, game.Word)
	}
}
