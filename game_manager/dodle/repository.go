package dodle

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/uptrace/bun"
)

type ImageScore struct {
	ID          int64 `bun:",pk,autoincrement"`
	Level       int
	Score       float64
	DailyGameID int64
}

type ImageEntries struct {
	ID          int64 `bun:",pk,autoincrement"`
	bucket      string
	key         string
	DailyGameID int64
}

type DBRound struct {
	ID        int64 `bun:",pk,autoincrement"`
	GameDate  int64 `bun:",unique"`
	Word      string
	Prompt    string
	Scores    []*ImageScore   `bun:"rel:has-many,join:id=daily_game_id"`
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
	getNextEmptyDate(ctx context.Context) int64
	GetRoundImage(ctx context.Context, level int) ([]byte, error)
}

// CreateRoundRepository creates a new repository to handle rounds.
func CreateRoundRepository(db *bun.DB, session *session.Session) *RoundRepository {
	return &RoundRepository{db, session, nil}
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

// getNextEmptyDate will return the next empty date for inserting a game.
func (r RoundRepository) getNextEmptyDate(ctx context.Context) int64 {
	return 0
}

// GetRoundImage returns a byte slice containing the image data for the given level and game.
func (r RoundRepository) GetRoundImage(ctx context.Context, gameID int64, level int) ([]byte, error) {
	return nil, nil
}
