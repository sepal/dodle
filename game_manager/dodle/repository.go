package dodle

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/uptrace/bun"
)

type ImageEntry struct {
	ID          int64 `bun:",pk,autoincrement"`
	Level       int
	Score       float64
	Bucket      string
	Key         string
	DailyGameID int64
}

type DBRound struct {
	ID        int64 `bun:",pk,autoincrement"`
	GameDate  int64 `bun:",unique"`
	Word      string
	Prompt    string
	Images    []*ImageEntry `bun:"rel:has-many,join:id=daily_game_id"`
	CreatedAt time.Time     `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time     `bun:",nullzero,notnull,default:current_timestamp"`
}

type RoundRepository struct {
	db      *bun.DB
	session *session.Session
}

type Repository interface {
	CreateRound(ctx context.Context, currentTime int64, input RoundFactory) (*Round, error)
	GetRound(ctx context.Context, id int64) (*Round, error)
	GetRoundByTime(ctx context.Context, date *time.Time) (*Round, error)
	GetRoundImage(ctx context.Context, level int) ([]byte, error)
}

// CreateRoundRepository creates a new repository to handle rounds.
func CreateRoundRepository(db *bun.DB, session *session.Session) *RoundRepository {
	return &RoundRepository{db, session}
}

// createImageEntries is a private function which insert paths to the images stored in s3 to the db
// include the score caclulated by the model, which in turn determines the level of the image in a
// round. Entries are always created as a bulk operation, since a round should have more than 1
// image.
func (r RoundRepository) createImageEntries(ctx context.Context, input []RoundImageFactory) (entries []*ImageEntry, err error) {
	sort.Slice(input, func(i, j int) bool {
		return input[i].Score < input[j].Score
	})

	for i, image := range input {
		entries = append(entries, &ImageEntry{
			Level:  i + 1,
			Score:  image.Score,
			Key:    image.Key,
			Bucket: image.Bucket,
		})
	}

	if _, err = r.db.NewInsert().Model(&entries).Exec(ctx); err != nil {
		return nil, err
	}

	return entries, nil
}

func AddNDaysToEpoch(currentTime int64, days int64) int64 {
	return (currentTime/86400)*86400 + (86400 * (days))
}

// getNextEmptyDate will return the next empty date for inserting a game.
func (r RoundRepository) getNextEmptyDate(ctx context.Context, currentTime int64) (int64, error) {
	var rounds []DBRound
	err := r.db.NewSelect().
		Model(&rounds).
		Where("game_date > ?", currentTime).
		Scan(ctx)

	if err != nil {
		return 0, err
	}

	if len(rounds) == 0 {
		return AddNDaysToEpoch(currentTime, 1), nil
	}

	// Try to find gaps between the dates.
	for i, round := range rounds[1:] {
		fmt.Printf("Comparing %s with %s", round.Word, rounds[i].Word)
		if round.GameDate-rounds[i].GameDate >= 86400*2 {
			return AddNDaysToEpoch(rounds[i].GameDate, 1), nil
		}
	}

	// Otherwise return the date after the last game in the DB.
	return AddNDaysToEpoch(rounds[len(rounds)-1].GameDate, 1), nil
}

// CreateRound creates a new round based on the given round input data. The
// round will get an id and a game date by beeing inserted.
func (r RoundRepository) CreateRound(ctx context.Context, currentTime int64, input RoundFactory) (*Round, error) {
	entries, err := r.createImageEntries(ctx, input.Images)

	if err != nil {
		return nil, err
	}

	date, err := r.getNextEmptyDate(ctx, currentTime)

	if err != nil {
		return nil, err
	}

	dbRound := DBRound{
		GameDate: date,
		Word:     input.Word,
		Prompt:   input.Prompt,
		Images:   entries,
	}

	_, err = r.db.NewInsert().
		Model(&dbRound).
		Exec(ctx)

	if err != nil {
		return nil, err
	}

	var images []RoundImage

	for _, img := range entries {
		images = append(images, RoundImage{
			ID:    img.ID,
			Level: img.Level,
			Score: img.Score,
		})
	}

	round := Round{
		ID:        dbRound.ID,
		Word:      dbRound.Word,
		Prompt:    dbRound.Prompt,
		GameDate:  dbRound.GameDate,
		Images:    images,
		CreatedAt: dbRound.CreatedAt.Unix(),
	}

	return &round, nil
}

// GetRound gets a round by id.
func (r RoundRepository) GetRound(ctx context.Context, id int64) (*Round, error) {
	return nil, nil
}

// GetGameByTime gets a certain round given the certain time.
func (r RoundRepository) GetGameByTime(ctx context.Context, date *time.Time) (*Round, error) {
	return nil, nil
}

// GetRoundImage returns a byte slice containing the image data for the given level and game.
func (r RoundRepository) GetRoundImage(ctx context.Context, gameID int64, level int) ([]byte, error) {
	return nil, nil
}
