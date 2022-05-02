package dodle

import (
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
)

var AWS_PREFIX = "game/"

type GameData struct {
	Word   string    `json:"word"`
	Prompt string    `json:"prompt"`
	Scores []float64 `json:"scores"`
	Files  []string  `json:"files"`
	bucket string
	prefix string
}

var CurrentTime = func() time.Time {
	return time.Now()
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
		return nil, errors.New("Download game data with zero bytes")
	}

	err = json.Unmarshal(buff.Bytes(), &g)

	if err != nil {
		return nil, err
	}

	g.bucket = bucket
	g.prefix = AWS_PREFIX + name

	return g, e
}

func (g *GameData) LoadImages(session *session.Session) error {
	downloader := s3manager.NewDownloader(session)

	tempDir, err := os.MkdirTemp("", "dodle")

	if err != nil {
		return err
	}

	for i := range g.Files {
		fileName := filepath.Join(tempDir, g.Files[i])
		file, err := os.Create(fileName)

		if err != nil {
			return err
		}

		key := fmt.Sprintf("%s/%s", g.prefix, g.Files[i])

		numBytes, err := downloader.Download(file, &s3.GetObjectInput{
			Bucket: aws.String(g.bucket),
			Key:    aws.String(key),
		})

		if err != nil {
			return err
		}

		g.Files[i] = fileName

		log.Printf("Downloaded %d bytes image %s for game %s\n", int(numBytes), g.Files[i], g.Word)
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

		if next_game == 0 && !(epoch > ct) {
			next_game = epoch
		}
	}

	if next_game == 0 {
		return nil, errors.New("No game found")
	}

	name := strconv.FormatInt(next_game, 10)

	log.Printf("Loading game %s", name)

	return LoadGame(session, bucket, name)
}
