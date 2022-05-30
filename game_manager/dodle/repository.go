package dodle

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/uptrace/bun"
)

type ImageEntries struct {
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
	Files     []*ImageEntries `bun:"rel:has-many,join:id=daily_game_id"`
	CreatedAt time.Time       `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time       `bun:",nullzero,notnull,default:current_timestamp"`
}

type RoundRepository struct {
	db      *bun.DB
	session *session.Session
}

type Repository interface {
	CreateRound(ctx context.Context, input RoundFactory) (*Round, error)
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
func (r *RoundRepository) createImageEntries(ctx context.Context, input []*RoundImageFactory) ([]*ImageEntries, error) {
	return nil, nil
}

// getNextEmptyDate will return the next empty date for inserting a game.
func (r RoundRepository) getNextEmptyDate(ctx context.Context) int64 {
	return 0
}

// CreateRound creates a new round based on the given round input data. The
// round will get an id and a game date by beeing inserted.
func (r *RoundRepository) CreateRound(ctx context.Context, input RoundFactory) (*Round, error) {
	return nil, nil
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
