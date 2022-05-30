package dodle

// import (
// 	"context"
// 	"os"
// 	"testing"
// 	"time"

// 	"github.com/uptrace/bun"
// )

// func clearDB(ctx context.Context, db *bun.DB) {

// }

// func TestCreateScores(t *testing.T) {
// 	var scores []float64
// 	scores = append(scores, 48.0)
// 	scores = append(scores, 56.0)
// 	scores = append(scores, 89.0)

// 	db := DBConnect()

// 	err := CreateSchemas(ctx, db)

// 	if err != nil {
// 		t.Fatalf("Error while trying to insert scores: %s", err)
// 	}

// 	_, err = CreateImageScores(ctx, db, scores)

// 	if err != nil {
// 		t.Fatalf("Error while trying to insert scores: %s", err)
// 	}
// }

// // func TestCreateImageEntries(t *testing.T) {
// // 	var images []string
// // 	images = append(images, "testing/1651363200/toad0.png")
// // 	images = append(images, "testing/1651363200/toad1.png")
// // 	images = append(images, "testing/1651363200/toad2.png")
// // 	images = append(images, "testing/1651363200/toad3.png")
// // 	images = append(images, "testing/1651363200/toad4.png")

// // 	db := DBConnect()
// // 	ctx := context.Background()

// // 	entries, err := CreateImageEntries(ctx, db, BUCKET, images)

// // 	if err != nil {
// // 		t.Fatalf("Error while trying to insert scores: %s", err)
// // 	}
// // }

// func TestLoadGame(t *testing.T) {
// 	sess, err := GetSession()

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	game, err := LoadGame(sess, BUCKET, "1651363200")

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	if game == nil {
// 		t.Fatal(`Game not loaded`)
// 	}

// 	if game.GameDate != 1651363200 {
// 		t.Fatalf("Expected game 1651363200, got %d", game.GameDate)
// 	}

// 	if game.Word != "toad" {
// 		t.Fatalf(`Wanted game with word toad got "%s"`, game.Word)
// 	}
// }

// func TestLoadGameImages(t *testing.T) {
// 	sess, err := GetSession()

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	game, err := LoadGame(sess, BUCKET, "1651363200")

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	err = game.LoadImages(sess)

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	if _, err = os.Stat(game.Files[0]); err != nil {
// 		t.Fatalf(`Error while checking if the first game image was downloaded "%s"`, err)
// 	}
// }

// func TestGetImage(t *testing.T) {
// 	sess, err := GetSession()

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	game, err := LoadGame(sess, BUCKET, "1651363200")

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	buffer, err := game.GetImage(sess, 0)

// 	if err != nil {
// 		t.Fatalf(`Error while loading image: "%s"`, err)
// 	}

// 	if len(buffer) <= 0 {
// 		t.Fatalf(`Expected an image buffer > 0 bytes got %d bytes`, len(buffer))
// 	}
// }

// func TestListGames(t *testing.T) {
// 	session, err := GetSession()

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}
// 	games, err := ListGames(session, BUCKET)

// 	if err != nil {
// 		t.Fatalf(`Error while listing games: "%s"`, err)
// 	}

// 	if len(games) < 1 {
// 		t.Fatalf(`Expected at least one game, got "%d" games`, len(games))
// 	}
// }

// func TestGetNextGame(t *testing.T) {
// 	session, err := GetSession()

// 	if err != nil {
// 		t.Fatalf(`Error while loading game: "%s"`, err)
// 	}

// 	CurrentTime = func() time.Time {
// 		return time.Date(2022, 05, 01, 00, 00, 00, 0, time.UTC)
// 	}

// 	g, err := GetNextGame(session, BUCKET)

// 	if err != nil {
// 		t.Fatalf(`Error while listing games: "%s"`, err)
// 	}

// 	if g.Word != "toad" || g.GameDate != 1651363200 {
// 		t.Fatalf(`Expected game 1651363200 with word "toad", got game %d with word "%s"`, g.GameDate, g.Word)
// 	}

// 	CurrentTime = func() time.Time {
// 		return time.Date(2022, 05, 01, 23, 59, 59, 0, time.UTC)
// 	}

// 	g, err = GetNextGame(session, BUCKET)

// 	if err != nil {
// 		t.Fatalf(`Error while listing games: "%s"`, err)
// 	}

// 	if g.Word != "toad" || g.GameDate != 1651363200 {
// 		t.Fatalf(`Expected game 1651363200 with word "toad", got game %d with word "%s"`, g.GameDate, g.Word)
// 	}

// 	CurrentTime = func() time.Time {
// 		return time.Date(2022, 04, 29, 23, 59, 59, 0, time.UTC)
// 	}

// 	g, err = GetNextGame(session, BUCKET)

// 	if err == nil {
// 		t.Fatalf("Should have not found a game, found %s", g.Word)
// 	}

// 	CurrentTime = func() time.Time {
// 		return time.Date(2022, 05, 03, 23, 59, 59, 0, time.UTC)
// 	}

// 	g, err = GetNextGame(session, BUCKET)

// 	if err != nil {
// 		t.Fatalf(`Error while listing games: "%s"`, err)
// 	}

// 	if g.Word != "mattress" || g.GameDate != 1651536000 {
// 		t.Fatalf(`Expected game 1651536000 with word "mattress", got game %d with word "%s"`, g.GameDate, g.Word)
// 	}
// }
