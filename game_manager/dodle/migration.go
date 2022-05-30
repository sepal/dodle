package dodle

import (
	"context"

	"github.com/uptrace/bun"
)

func CreateSchemas(ctx context.Context, db *bun.DB) error {

	db.RegisterModel((*DBRound)(nil))

	if _, err := db.NewCreateTable().Model((*ImageEntry)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	if _, err := db.NewCreateTable().Model((*DBRound)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	return nil
}
