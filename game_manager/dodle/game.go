package dodle

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

type GameData struct {
	Word   string    `json:"word"`
	Prompt string    `json:"prompt"`
	Scores []float64 `json:"scores"`
	Files  []string  `json:"files"`
	bucket string
	name   string
}

func LoadGame(session *session.Session, bucket string, name string) (g *GameData, e error) {
	buff := &aws.WriteAtBuffer{}

	downloader := s3manager.NewDownloader(session)
	numBytes, err := downloader.Download(buff, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(name + "/game.json"),
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
	g.name = name

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

		key := fmt.Sprintf("%s/%s", g.name, g.Files[i])

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
