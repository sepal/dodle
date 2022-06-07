package dodle

import "testing"

func TestAddNDaysToEpoch(t *testing.T) {
	if date := AddNDaysToEpoch(1653941866, 0); date != 1653868800 {
		t.Fatalf("Expected 1653868800, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, 3); date != 1654128000 {
		t.Fatalf("Expected 1654128000, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, -1); date != 1653782400 {
		t.Fatalf("Expected 1653782400, got %d", date)
	}

	if date := AddNDaysToEpoch(1653941866, -4); date != 1653523200 {
		t.Fatalf("Expected 1653523200, got %d", date)
	}
}

func TestRoundToDay(t *testing.T) {
	if date := RoundToDay(1654071623); date != 1654041600 {
		t.Fatalf("Expected 1654041600, got %d", date)
	}
	if date := RoundToDay(1654560000); date != 1654560000 {
		t.Fatalf("Expected 1654560000, got %d", date)
	}
}
