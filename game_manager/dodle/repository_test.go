package dodle

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dbfixture"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func getSession() (*session.Session, error) {
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

func setup() *RoundRepository {
	godotenv.Load(".env")

	db := initDB()
	session, err := getSession()

	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	CreateSchemas(ctx, db)

	return CreateRoundRepository(db, session, os.Getenv("S3_BUCKET"))
}

func tearDown(r *RoundRepository) error {
	ctx := context.Background()

	r.db.NewDropTable().Model((*ImageEntry)(nil)).Exec(ctx)
	r.db.NewDropTable().Model((*DBRound)(nil)).Exec(ctx)

	return nil
}

func TestCreateImageEntries(t *testing.T) {
	r := setup()
	defer tearDown(r)

	var input []RoundImageFactory

	input = append(input, RoundImageFactory{
		Key:   "testing/1651363200/toad2.png",
		Score: 0.85,
	})

	input = append(input, RoundImageFactory{
		Key:   "testing/1651363200/toad0.png",
		Score: 0.456,
	})

	input = append(input, RoundImageFactory{
		Key:   "testing/1651363200/toad1.png",
		Score: 0.75,
	})

	ctx := context.Background()

	entries, err := r.createImageEntriesForRound(ctx, 0, input)

	if err != nil {
		t.Fatalf("Error while trying to create image entries: %s", err)
	}

	if len(entries) <= 0 {
		t.Fatal("No image entries created!")
	}

	if entries[0].ID == 0 && entries[1].ID == 0 && entries[2].ID == 0 {
		t.Fatal("The ids for all entries are 0.")
	}

	if entries[0].Level != 1 && entries[1].Level != 2 && entries[2].Level != 3 {
		t.Fatalf("Wrong levels set for images. 0 is %d, 1 is %d, 2 is %d",
			entries[0].Level,
			entries[1].Level,
			entries[2].Level,
		)
	}

}

func TestAddNDaysToEpoch(t *testing.T) {
	if date := AddNDaysToEpoch(1653941866, 0); date != 1653868800 {
		t.Fatalf("Expected 1653868800, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, 3); date != 1654128000 {
		t.Fatalf("Expected 1654128000, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, -1); date != 1653782400 {
		t.Fatalf("Expected 1653782400, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, -4); date != 1653523200 {
		t.Fatalf("Expected 1653523200, got %d", date)
	}
}

func TestGetNextEmptyDate(t *testing.T) {
	r := setup()
	defer tearDown(r)
	ctx := context.Background()

	fixture := dbfixture.New(r.db)

	if err := fixture.Load(ctx, os.DirFS("fixtures"), "nextEmptyDate.yml"); err != nil {
		t.Fatalf("Error while trying to load fixtures: %s", err)
	}

	nextDate, err := r.getNextEmptyDate(ctx, 1653941866)

	if err != nil {
		t.Fatalf("Error while trying to get next empty date: %s", err)
	}

	if nextDate == 0 {
		t.Fatal("No next date found!")
	}

	if nextDate != 1654041600 {
		t.Fatalf("Expected next date to be 1654041600, got %d", nextDate)
	}

	nextDate, err = r.getNextEmptyDate(ctx, 1654054600)

	if err != nil {
		t.Fatalf("Error while trying to get next empty date: %s", err)
	}

	if nextDate == 0 {
		t.Fatal("No next date found!")
	}

	if nextDate != 1654214400 {
		t.Fatalf("Expected next date to be 1654214400, got %d", nextDate)
	}
}

func TestCreateRound(t *testing.T) {
	r := setup()
	defer tearDown(r)
	ctx := context.Background()

	images := []RoundImageFactory{
		{
			Key:   "testing/1651363200/toad0.png",
			Score: 0.456,
		},
		{
			Key:   "testing/1651363200/toad1.png",
			Score: 0.78,
		},
	}

	input := RoundFactory{
		Word:   "toad",
		Prompt: "fancy colorful toad doodle",
		Images: images,
		Prefix: "testing/1651363200/",
	}

	round, err := r.CreateRound(ctx, 1653941866, input)

	if err != nil {
		t.Fatalf("Error while trying to create game: %s", err)
	}

	if round.CreatedAt == 0 {
		t.Fatalf("Expected a proper created date for inserted game, got %d", round.CreatedAt)
	}

	var out []DBRound
	err = r.db.NewSelect().
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

	if out[0].Word != input.Word {
		t.Fatalf("Expected fetched round to have word %s, not %s", input.Word, out[0].Word)
	}

	if len(out[0].Images) != len(input.Images) {
		t.Fatalf("Expected to %d images, got %d", len(input.Images), len(out[0].Images))
	}

}

func TestGetRound(t *testing.T) {
	r := setup()
	defer tearDown(r)
	ctx := context.Background()

	fixture := dbfixture.New(r.db)

	if err := fixture.Load(ctx, os.DirFS("fixtures"), "rounds.yml"); err != nil {
		t.Fatalf("Error while trying to load fixtures: %s", err)
	}

	round, err := r.GetRound(ctx, 1)

	if err != nil {
		t.Fatalf("Error while trying to load game: %s", err)
	}

	if round == nil {
		t.Fatal("No game loaded.")
	}

	if round.Word != "toad" {
		t.Fatalf("Expected to load game with word toad, got %s", round.Word)
	}

	if round.GameDate != 1653955200 {
		t.Fatalf("Expected game to have a game date of 1653955200, got %d", round.GameDate)
	}

	if len(round.Images) != 5 {
		t.Fatalf("Expected to game to have 5 images, got %d", len(round.Images))
	}
}

func TestGetRoundByTime(t *testing.T) {
	r := setup()
	defer tearDown(r)
	ctx := context.Background()

	fixture := dbfixture.New(r.db)

	if err := fixture.Load(ctx, os.DirFS("fixtures"), "rounds.yml"); err != nil {
		t.Fatalf("Error while trying to load fixtures: %s", err)
	}

	round, err := r.GetRoundByTime(ctx, 1653985200)

	if err != nil {
		t.Fatalf("Error while trying to load game: %s", err)
	}

	if round == nil {
		t.Fatal("No game found, expected 1 game.")
	}

	if round.Word != "mattress" {
		t.Fatalf("Expected to load game with word mattress, got %s", round.Word)
	}

	if round.GameDate != 1654041600 {
		t.Fatalf("Expected game to have a game date of 1654041600, got %d", round.GameDate)
	}

	if len(round.Images) != 5 {
		t.Fatalf("Expected to game to have 5 images, got %d", len(round.Images))
	}

}

func TestGetRoundImage(t *testing.T) {
	r := setup()
	defer tearDown(r)
	ctx := context.Background()

	fixture := dbfixture.New(r.db)

	if err := fixture.Load(ctx, os.DirFS("fixtures"), "rounds.yml"); err != nil {
		t.Fatalf("Error while trying to load fixtures: %s", err)
	}

	round, err := r.GetRoundByTime(ctx, 1653985200)

	if err != nil {
		t.Fatalf("Error while trying to load game: %s", err)
	}

	if round == nil {
		t.Fatal("No game found, expected 1 game.")
	}

	buffer, err := r.GetRoundImage(ctx, round.ID, 0)

	if err != nil {
		t.Fatalf(`Error while loading image: "%s"`, err)
	}

	if len(buffer) <= 0 {
		t.Fatalf(`Expected an image buffer > 0 bytes got %d bytes`, len(buffer))
	}
}
