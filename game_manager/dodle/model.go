package dodle

type RoundFactory struct {
	Word        string    `json:"word"`
	Prompt      string    `json:"prompt"`
	ImageScores []float64 `json:"imageScores"`
	Images      []string  `json:"images"`
	BaseKey     string    `json:"baseKey"`
}

type Round struct {
	ID          int64     `json:"id"`
	GameDate    int64     `json:"gameDate"`
	Word        string    `json:"word"`
	Prompt      string    `json:"prompt"`
	ImageScores []float64 `json:"imageScores"`
	Images      []string  `json:"images"`
}
