package dodle

import (
	"encoding/json"
	"errors"

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

	return g, e
}
