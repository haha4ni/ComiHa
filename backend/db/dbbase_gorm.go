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

// 新增：更新資料的函數
func UpdateData(db *DB, data interface{}) error {
    fmt.Printf("[UpdateData] data: %+v\n", data)
	return db.conn.Session(&gorm.Session{FullSaveAssociations: true}).Save(data).Error
}

func DeleteData(db *DB, data interface{}) error {
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