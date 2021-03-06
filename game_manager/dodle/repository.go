package dodle

import (
	"context"
	"log"
	"sort"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/uptrace/bun"
)

type ImageEntry struct {
	ID        int64 `bun:",pk,autoincrement"`
	Level     int
	Score     float64
	Key       string
	DBRoundID int64
	round     *DBRound `rel:"belongs-to"`
}

type DBRound struct {
	ID        int64 `bun:",pk,autoincrement"`
	GameDate  int64 `bun:",unique"`
	Word      string
	Prompt    string
	Bucket    string
	Prefix    string
	Images    []*ImageEntry `bun:"rel:has-many,join:id=db_round_id"`
	CreatedAt time.Time     `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time     `bun:",nullzero,notnull,default:current_timestamp"`
}

type RoundRepository struct {
	db       *bun.DB
	session  *session.Session
	s3Bucket string
}

type Repository interface {
	CreateRound(ctx context.Context, currentTime int64, input RoundFactory) (*Round, error)
	GetRound(ctx context.Context, id int64) (*Round, error)
	GetRoundByTime(ctx context.Context, time int64) (*Round, error)
	GetRoundImage(ctx context.Context, roundID int64, level int) ([]byte, error)
}

// CreateRoundRepository creates a new repository to handle rounds.
func CreateRoundRepository(db *bun.DB, session *session.Session, bucket string) *RoundRepository {
	return &RoundRepository{db, session, *aws.String(bucket)}
}

// createImageEntriesForRound is a private function which insert paths to the images stored in s3 to the db
// include the score caclulated by the model, which in turn determines the level of the image in a
// round. Entries are always created as a bulk operation, since a round should have more than 1
// image.
func (r RoundRepository) createImageEntriesForRound(ctx context.Context, roundID int64, input []RoundImageFactory) (entries []*ImageEntry, err error) {
	sort.Slice(input, func(i, j int) bool {
		return input[i].Score < input[j].Score
	})

	for i, image := range input {
		entries = append(entries, &ImageEntry{
			Level:     i + 1,
			Score:     image.Score,
			Key:       image.Key,
			DBRoundID: roundID,
		})
	}

	if _, err = r.db.NewInsert().Model(&entries).Exec(ctx); err != nil {
		return nil, err
	}

	return entries, nil
}

// getNextEmptyDate will return the next empty date for inserting a game.
func (r RoundRepository) getNextEmptyDate(ctx context.Context, currentTime int64) (int64, error) {
	var rounds []DBRound

	err := r.db.NewSelect().
		Model(&rounds).
		Where("game_date > ?", currentTime).
		OrderExpr("game_date ASC").
		Scan(ctx)

	if err != nil {
		return 0, err
	}

	if len(rounds) == 0 {
		return AddNDaysToEpoch(currentTime, 1), nil
	}

	// Try to find gaps between the dates.
	for i, round := range rounds[1:] {
		prevRound := rounds[i]
		diff := round.GameDate - prevRound.GameDate
		if diff >= 172800 {
			return AddNDaysToEpoch(prevRound.GameDate, 1), nil
		}
	}

	// Otherwise return the date after the last game in the DB.
	return AddNDaysToEpoch(rounds[len(rounds)-1].GameDate, 1), nil
}

// CreateRound creates a new round based on the given round input data. The
// round will get an id and a game date by being inserted.
func (r RoundRepository) CreateRound(ctx context.Context, currentTime int64, input RoundFactory) (*Round, error) {

	date, err := r.getNextEmptyDate(ctx, currentTime)

	if err != nil {
		return nil, err
	}

	dbRound := DBRound{
		GameDate: date,
		Word:     input.Word,
		Prompt:   input.Prompt,
		Bucket:   input.Bucket,
		Prefix:   input.Prefix,
	}

	_, err = r.db.NewInsert().
		Model(&dbRound).
		Exec(ctx)

	if err != nil {
		return nil, err
	}

	entries, err := r.createImageEntriesForRound(ctx, dbRound.ID, input.Images)

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
	dbRound := new(DBRound)
	err := r.db.NewSelect().
		Model(dbRound).
		Where("id = ?", id).
		Relation("Images").
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	var images []RoundImage

	for _, img := range dbRound.Images {
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

// GetRoundByTime gets a certain round given the certain time.
func (r RoundRepository) GetRoundByTime(ctx context.Context, time int64) (*Round, error) {
	dbRound := new(DBRound)

	day := RoundToDay(time)

	err := r.db.NewSelect().
		Model(dbRound).
		Where("game_date <= ?", day).
		Relation("Images").
		OrderExpr("game_date DESC").
		Limit(1).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	var images []RoundImage

	for _, img := range dbRound.Images {
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

func (r RoundRepository) getS3Image(key string) ([]byte, error) {
	writeBuf := &aws.WriteAtBuffer{}

	downloader := s3manager.NewDownloader(r.session)
	_, err := downloader.Download(writeBuf, &s3.GetObjectInput{
		Bucket: aws.String(r.s3Bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return nil, err
	}

	return writeBuf.Bytes(), nil
}

// GetRoundImage returns a byte slice containing the image data for the given level and game.
func (r RoundRepository) GetRoundImage(ctx context.Context, roundID int64, level int) ([]byte, error) {
	entry := new(ImageEntry)

	log.Printf("Selecting image for round %d and level %d", roundID, level)
	err := r.db.NewSelect().
		Model(entry).
		Where("db_round_id = ?", roundID).
		Where("level = ?", level).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	if entry == nil {
		return nil, nil
	}

	log.Printf("Fetching image %s", entry.Key)

	return r.getS3Image(entry.Key)
}
