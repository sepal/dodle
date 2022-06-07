package dodle

func AddNDaysToEpoch(currentTime int64, days int64) int64 {
	return (currentTime/86400)*86400 + (86400 * (days))
}
