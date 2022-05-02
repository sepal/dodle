package dodle

import (
	"os"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
)

func GetSession() (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})
}

func TestLoadGame(t *testing.T) {
	sess, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	game, err := LoadGame(sess, "dodle", "game/1651418811")

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	if game == nil {
		t.Fatal(`Game not loaded`)
	}

	if game.Word != "toad" {
		t.Fatalf(`Wanted game with word toad got "%s"`, game.Word)
	}
}

func TestLoadGameImages(t *testing.T) {
	sess, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	game, err := LoadGame(sess, "dodle", "game/1651418811")

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	err = game.LoadImages(sess)

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	if _, err = os.Stat(game.Files[0]); err != nil {
		t.Fatalf(`Error while checking if the first game image was downloaded "%s"`, err)
	}
}
