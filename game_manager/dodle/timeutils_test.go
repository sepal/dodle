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
