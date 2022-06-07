package dodle

// AddNDaysToEpoch adds the amount of days to the given epoch.
func AddNDaysToEpoch(currentTime int64, days int64) int64 {
	return (currentTime/86400)*86400 + (86400 * (days))
}

// RoundToDay rounds the given epoch to an epoch at midnight at the same day.
func RoundToDay(epoch int64) int64 {
	// Floor divide through 24h and then multiply times 24 hours.
	return epoch / 86400 * 86400
}
