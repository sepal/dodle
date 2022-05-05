package dodle

import (
	"os"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
)

const BUCKET = "dodle"

func GetSession() (*session.Session, error) {
	AWS_PREFIX = "testing/"
	return session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})
}

func TestLoadGame(t *testing.T) {
	sess, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	game, err := LoadGame(sess, BUCKET, "1651363200")

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

	game, err := LoadGame(sess, BUCKET, "1651363200")

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

func TestGetImage(t *testing.T) {
	sess, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	game, err := LoadGame(sess, BUCKET, "1651363200")

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	buffer, err := game.GetImage(sess, 0)

	if err != nil {
		t.Fatalf(`Error while loading image: "%s"`, err)
	}

	if len(buffer) <= 0 {
		t.Fatalf(`Expected an image buffer > 0 bytes got %d bytes`, len(buffer))
	}
}

func TestListGames(t *testing.T) {
	session, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}
	games, err := ListGames(session, BUCKET)

	if err != nil {
		t.Fatalf(`Error while listing games: "%s"`, err)
	}

	if len(games) < 1 {
		t.Fatalf(`Expected at least one game, got "%d" games`, len(games))
	}
}

func TestGetNextGame(t *testing.T) {
	session, err := GetSession()

	if err != nil {
		t.Fatalf(`Error while loading game: "%s"`, err)
	}

	CurrentTime = func() time.Time {
		return time.Date(2022, 05, 01, 00, 00, 00, 0, time.UTC)
	}

	g, err := GetNextGame(session, BUCKET)

	if err != nil {
		t.Fatalf(`Error while listing games: "%s"`, err)
	}

	if g.Word != "toad" {
		t.Fatalf(`Expected game with word "toad", got "%s"`, g.Word)
	}

	CurrentTime = func() time.Time {
		return time.Date(2022, 05, 01, 23, 59, 59, 0, time.UTC)
	}

	g, err = GetNextGame(session, BUCKET)

	if err != nil {
		t.Fatalf(`Error while listing games: "%s"`, err)
	}

	if g.Word != "toad" {
		t.Fatalf(`Expected game with word "toad", got "%s"`, g.Word)
	}

	CurrentTime = func() time.Time {
		return time.Date(2022, 04, 29, 23, 59, 59, 0, time.UTC)
	}

	g, err = GetNextGame(session, BUCKET)

	if err == nil {
		t.Fatalf("Should have not found a game, found %s", g.Word)
	}

	CurrentTime = func() time.Time {
		return time.Date(2022, 05, 03, 23, 59, 59, 0, time.UTC)
	}

	g, err = GetNextGame(session, BUCKET)

	if err != nil {
		t.Fatalf(`Error while listing games: "%s"`, err)
	}

	if g.Word != "mattress" {
		t.Fatalf(`Expected game with word "mattress", got "%s"`, g.Word)
	}
}
