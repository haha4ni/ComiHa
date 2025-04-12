package db

import (
	"encoding/json"
	"fmt"
	"reflect"

	"go.etcd.io/bbolt"
)

// DB represents a BoltDB database instance
type DB struct {
	*bbolt.DB
}

// NewDB creates a new BoltDB instance
func NewDB(path string) (*DB, error) {
	db, err := bbolt.Open(path, 0600, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	return &DB{db}, nil
}

// SaveData saves data to a bucket with the given key
func (db *DB) SaveData(bucketName string, key string, data interface{}) error {
	return db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(bucketName))
		if err != nil {
			return fmt.Errorf("failed to create or get bucket: %w", err)
		}

		jsonData, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal data: %w", err)
		}

		return bucket.Put([]byte(key), jsonData)
	})
}

// LoadData loads data from a bucket with the given key
func (db *DB) LoadData(bucketName string, key string, data interface{}) error {
	return db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(bucketName))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		value := bucket.Get([]byte(key))
		if value == nil {
			return fmt.Errorf("key not found")
		}

		return json.Unmarshal(value, data)
	})
}

// DeleteData deletes data from a bucket with the given key
func (db *DB) DeleteData(bucketName string, key string) error {
	return db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(bucketName))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}
		return bucket.Delete([]byte(key))
	})
}

// GetAllData retrieves all data from a bucket
func (db *DB) GetAllData(bucketName string, data interface{}) error {
	// 確保 data 是指向切片的指針
	rv := reflect.ValueOf(data)
	if rv.Kind() != reflect.Ptr || rv.Elem().Kind() != reflect.Slice {
		return fmt.Errorf("data must be a pointer to a slice")
	}

	// 獲取切片的元素類型
	elemType := rv.Elem().Type().Elem()

	return db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte(bucketName))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		// 創建一個新的切片來存儲結果
		slice := reflect.MakeSlice(rv.Elem().Type(), 0, 0)

		err := bucket.ForEach(func(k, v []byte) error {
			// 創建一個新的元素實例
			elem := reflect.New(elemType).Interface()

			// 反序列化數據到元素
			if err := json.Unmarshal(v, elem); err != nil {
				return err
			}

			// 將元素添加到切片
			slice = reflect.Append(slice, reflect.ValueOf(elem).Elem())
			return nil
		})

		if err != nil {
			return err
		}

		// 將結果切片賦值給傳入的指針
		rv.Elem().Set(slice)
		return nil
	})
}
