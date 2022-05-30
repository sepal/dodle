package dodle

type RoundImageFactory struct {
	Level  int64   `json:"level"`
	Key    string  `json:"key"`
	Bucket string  `json:"bucket"`
	Score  float64 `json:"score"`
}

type RoundFactory struct {
	Word    string              `json:"word"`
	Prompt  string              `json:"prompt"`
	Images  []RoundImageFactory `json:"images"`
	BaseKey string              `json:"baseKey"`
}

type RoundImage struct {
	ID    int64   `json:"id"`
	Level int64   `json:"level"`
	Path  string  `json:"path"`
	Score float64 `json:"score"`
}

type Round struct {
	ID       int64        `json:"id"`
	GameDate int64        `json:"gameDate"`
	Word     string       `json:"word"`
	Prompt   string       `json:"prompt"`
	Images   []RoundImage `json:"images"`
}
