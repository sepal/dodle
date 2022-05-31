package dodle

type RoundImageFactory struct {
	Key   string  `json:"key"`
	Score float64 `json:"score"`
}

type RoundFactory struct {
	Word    string              `json:"word"`
	Prompt  string              `json:"prompt"`
	Images  []RoundImageFactory `json:"images"`
	BaseKey string              `json:"baseKey"`
	Bucket  string              `json:"bucket"`
	Prefix  string              `json:"prefix"`
}

type RoundImage struct {
	ID    int64   `json:"id"`
	Level int     `json:"level"`
	Score float64 `json:"score"`
}

type Round struct {
	ID        int64        `json:"id"`
	GameDate  int64        `json:"gameDate"`
	Word      string       `json:"word"`
	Prompt    string       `json:"prompt"`
	Images    []RoundImage `json:"images"`
	CreatedAt int64        `json:"createdAt"`
}
