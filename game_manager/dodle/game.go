package dodle

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/uptrace/bun"
)

var AWS_PREFIX = "game/"

type GameData struct {
	GameDate int64     `json:"gameDate"`
	Word     string    `json:"word"`
	Prompt   string    `json:"prompt"`
	Scores   []float64 `json:"scores"`
	Files    []string  `json:"files"`
	bucket   string
	prefix   string
}



var CurrentTime = func() time.Time {
	return time.Now()
}

func CreateSchemas(ctx context.Context, db *bun.DB) error {

	if _, err := db.NewCreateTable().Model((*ImageScore)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	if _, err := db.NewCreateTable().Model((*ImageEntries)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	if _, err := db.NewCreateTable().Model((*Round)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	return nil
}

func CreateImageScores(ctx context.Context, db *bun.DB, scores []float64) ([]*ImageScore, error) {
	imageScores := make([]*ImageScore, len(scores))

	for i, score := range scores {
		imageScores[i] = &ImageScore{
			Score: score,
			Level: i,
		}
	}

	_, err := db.NewInsert().Model(&imageScores).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return imageScores, nil
}

// CreateDailyGame inserts a new game into the database.
func CreateDailyGame(word string, prompt string, scores []float64, files []string, bucket string) (*GameData, error) {

	return nil, nil
}

func LoadGame(session *session.Session, bucket string, name string) (g *GameData, e error) {
	buff := &aws.WriteAtBuffer{}

	key := AWS_PREFIX + name + "/game.json"
	fmt.Println(key)

	downloader := s3manager.NewDownloader(session)
	numBytes, err := downloader.Download(buff, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return nil, err
	}

	if numBytes < 1 {
		return nil, errors.New("download game data with zero bytes")
	}

	err = json.Unmarshal(buff.Bytes(), &g)

	if err != nil {
		return nil, err
	}

	epoch, err := strconv.ParseInt(name, 10, 0)

	if err != nil {
		return nil, err
	}

	g.GameDate = epoch
	g.bucket = bucket
	g.prefix = AWS_PREFIX + name

	return g, e
}

func (g *GameData) GetImageKey(level int) string {
	f := g.Files[level]

	return fmt.Sprintf("%s/%s", g.prefix, f)
}

func (g *GameData) GetImage(session *session.Session, level int) ([]byte, error) {
	writeBuf := &aws.WriteAtBuffer{}

	downloader := s3manager.NewDownloader(session)
	_, err := downloader.Download(writeBuf, &s3.GetObjectInput{
		Bucket: aws.String(g.bucket),
		Key:    aws.String(g.GetImageKey(level)),
	})

	if err != nil {
		return nil, err
	}

	return writeBuf.Bytes(), nil
}

func (g *GameData) LoadImages(session *session.Session) error {
	downloader := s3manager.NewDownloader(session)

	tempDir, err := os.MkdirTemp("", "dodle")

	if err != nil {
		return err
	}

	for i, f := range g.Files {
		fileName := fmt.Sprintf("image%s.png", strconv.Itoa(i))

		filePath := filepath.Join(tempDir, fileName)
		file, err := os.Create(filePath)

		if err != nil {
			return err
		}

		numBytes, err := downloader.Download(file, &s3.GetObjectInput{
			Bucket: aws.String(g.bucket),
			Key:    aws.String(g.GetImageKey(i)),
		})

		if err != nil {
			return err
		}

		g.Files[i] = filePath

		log.Printf("Downloaded %d bytes image %s for game %s\n", int(numBytes), f, g.Word)
	}

	return nil
}

func ListGames(session *session.Session, bucket string) (games []string, err error) {
	svc := s3.New(session)
	resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(AWS_PREFIX),
	})

	if err != nil {
		return games, err
	}

	for _, element := range resp.Contents {
		parts := strings.Split(*element.Key, "/")
		if len(parts) >= 3 && parts[2] == "game.json" {
			games = append(games, parts[1])
		}
	}

	return games, nil
}

func GetNextGame(session *session.Session, bucket string) (g *GameData, err error) {
	games, err := ListGames(session, bucket)

	if err != nil {
		return nil, err
	}

	ct := CurrentTime().Unix()

	var next_game int64

	next_game = 0

	for _, name := range games {
		epoch, err := strconv.ParseInt(name, 10, 0)

		if err != nil {
			return nil, err
		}

		log.Printf("%d", epoch)
		if !(epoch > ct) {
			next_game = epoch
		}
	}

	if next_game == 0 {
		return nil, errors.New("no game found")
	}

	name := strconv.FormatInt(next_game, 10)

	log.Printf("Loading game %s", name)

	return LoadGame(session, bucket, name)
}
