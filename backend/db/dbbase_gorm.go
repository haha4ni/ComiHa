package db

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB represents a BoltDB database instance
type DB struct {
	conn *gorm.DB
}
func (db *DB) Conn() *gorm.DB {
    return db.conn
}

func NewDB(dbPath string, models ...interface{}) (*DB, error) {
	// Initialize the database connection using the modified path
	fullPath := fmt.Sprintf("%s?mode=rwc", dbPath)
	conn, err := gorm.Open(sqlite.Open(fullPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate the provided models
	err = conn.AutoMigrate(models...)
	if err != nil {
		return nil, err
	}

	return &DB{conn: conn}, nil
}

func CloseBD(db *DB) error {
	sqlDB, err := db.conn.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func SaveData(db *DB, data interface{}) error {
	return db.conn.Create(data).Error
}

func (db *DB) DeleteData(bucketName string, key string) error {
	// return db.Update(func(tx *bbolt.Tx) error {
	// 	bucket := tx.Bucket([]byte(bucketName))
	// 	if bucket == nil {
	// 		return fmt.Errorf("bucket not found")
	// 	}
	// 	return bucket.Delete([]byte(key))
	// })
	return nil
}

func GetAllData(db *DB, out interface{}, preloads ...string) error {
	// Apply preloads if any
	query := db.conn
	for _, preload := range preloads {
		query = query.Preload(preload)
	}
	// Retrieve all records
	return query.Find(out).Error
}