package backend

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"go.etcd.io/bbolt"
)

type ImageData struct {
	FileName string `json:"filename"`
	Size     int64  `json:"size"`
}

type BookInfo struct {
	BookName  string      `json:"bookname"`
	FileName  string      `json:"filename"`
	SHA       string      `json:"sha"`
	Timestamp int64       `json:"timestamp"`
	ImageData []ImageData `json:"imagedata"`
}

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(db *bbolt.DB, book BookInfo) error {
	return db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte("bookinfo"))
		if err != nil {
			return err
		}

		data, err := json.Marshal(book)
		if err != nil {
			return err
		}

		return bucket.Put([]byte(book.BookName), data)
	})
}

// 從 BoltDB 讀取 BookInfo
func LoadBookInfo(db *bbolt.DB, bookname string) (*BookInfo, error) {
	var book BookInfo
	err := db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte("bookinfo"))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		data := bucket.Get([]byte(bookname))
		if data == nil {
			return fmt.Errorf("bookinfo not found")
		}

		return json.Unmarshal(data, &book)
	})

	if err != nil {
		return nil, err
	}
	return &book, nil
}

// 根據 BookName 刪除 BookInfo
func DeleteBookInfo(db *bbolt.DB, bookname string) error {
	return db.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte("bookinfo"))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		return bucket.Delete([]byte(bookname))
	})
}

// 解析 ZIP 檔，取得 PNG 檔案資訊
func ParseZipFile(zipPath string) (*BookInfo, error) {
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer zipReader.Close()

	var images []ImageData
	for _, file := range zipReader.File {
		if filepath.Ext(file.Name) == ".png" || filepath.Ext(file.Name) == ".jpg" { // 處理 PNG 和 JPG
			images = append(images, ImageData{
				FileName: file.Name,
				Size:     int64(file.UncompressedSize64),
			})
		}
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("ZIP 檔內沒有 PNG 圖片")
	}

	// 產生 SHA（使用檔案的二進位內容）
	sha, err := generateSHA256(zipPath)
	if err != nil {
		return nil, err
	}

	bookInfo := &BookInfo{
		BookName:  filepath.Base(zipPath),
		FileName:  zipPath, // Add this line
		SHA:       sha,
		Timestamp: time.Now().Unix(),
		ImageData: images,
	}

	return bookInfo, nil
}

// 生成檔案的 SHA256
func generateSHA256(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

func AddBook(zipPath string) {
	// 解析 ZIP 檔案
	bookInfo, err := ParseZipFile(zipPath)
	if err != nil {
		log.Fatal("解析 ZIP 失敗:", err)
	}

	// 開啟 BoltDB
	db, err := bbolt.Open("data.db", 0600, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 存入第一個 BookInfo 到 BoltDB
	err = SaveBookInfo(db, *bookInfo)
	if err != nil {
		log.Fatal("存入 BoltDB 失敗:", err)
	}

	fmt.Println("成功存入 BoltDB:", bookInfo)


	// 從 BoltDB 讀取剛剛存入的第一個 BookInfo
	loadedBook, err := LoadBookInfo(db, bookInfo.BookName)
	if err != nil {
		log.Fatal("讀取失敗:", err)
	}

	// 顯示讀取結果
	fmt.Println("從 BoltDB 讀取到的第一個 BookInfo:")
	fmt.Printf("SHA: %s\n", loadedBook.SHA)
	fmt.Printf("BookName: %s\n", loadedBook.BookName)
	fmt.Printf("Timestamp: %d\n", loadedBook.Timestamp)
	fmt.Println("Images:")
	for _, img := range loadedBook.ImageData {
		fmt.Printf("  - %s (%d bytes)\n", img.FileName, img.Size)
	}


	// 刪除第一個 BookInfo
	// err = DeleteBookInfo(db, bookInfo.BookName)
	// if err != nil {
	// 	log.Fatal("刪除失敗:", err)
	// }
	// fmt.Println("成功刪除 BookInfo:", bookInfo.BookName)
}


func (a *App) ScanBookAll() {
	// Correct the method call to use a pointer receiver
	fmt.Println("@@ScanBookAll")
	pathList, err := a.GetFileList(".\\comic")
	if err != nil {
		fmt.Println("讀取Path內容失敗:", err)
	}
	fmt.Println("@@path:", pathList)

	for _, path := range pathList{
		fmt.Println("@@path:", path)
		path = ".\\comic\\" + path
		AddBook(path)
	}
}

func (a *App) GetBookListAll() (bookList []BookInfo) {
	// 開啟 BoltDB
	db, err := bbolt.Open("data.db", 0600, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 讀取所有 BookInfo
	err = db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte("bookinfo"))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		return bucket.ForEach(func(k, v []byte) error {
			var book BookInfo
			if err := json.Unmarshal(v, &book); err != nil {
				return err
			}
			bookList = append(bookList, book)
			return nil
		})
	})

	if err != nil {
		log.Fatal("讀取所有 BookInfo 失敗:", err)
	}
	fmt.Println("bookList:", bookList)
	return bookList
}