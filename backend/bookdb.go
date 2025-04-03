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
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"go.etcd.io/bbolt"

	"ComiHa/backend/debug"
)

type ImageData struct {
	FileName string `json:"filename"`
	FileIndex int64 `json:"fileindex"`
	FileSize     int64  `json:"size"`
}

type BookInfo struct {
	BookName  string      `json:"bookname"`
	BookNumber string	  `json:"booknumber"`
	FileName  string      `json:"filename"`
	SHA       string      `json:"sha"`
	Timestamp int64       `json:"timestamp"`
	ImageData []ImageData `json:"imagedata"`
}

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(db *bbolt.DB, book BookInfo) error {
    err := db.Update(func(tx *bbolt.Tx) error {
        // 獲取或創建名為 "bookinfo" 的 Bucket
        bucket, err := tx.CreateBucketIfNotExists([]byte("bookinfo"))
        if err != nil {
            return fmt.Errorf("failed to create or get bucket: %w", err)
        }

        // 將 BookInfo 結構轉換為 JSON 格式
        data, err := json.Marshal(book)
        if err != nil {
            return fmt.Errorf("failed to marshal book info: %w", err)
        }

        // 構建 Key，包含 BookName 與 BookNumber
        key := fmt.Sprintf("%s_%s", book.BookName, book.BookNumber)
        // 將資料存入 Bucket
        err = bucket.Put([]byte(key), data)
        if err != nil {
            return fmt.Errorf("failed to save book info: %w", err)
        }

        return nil
    })

    // 檢查是否有錯誤
    if err != nil {
        return fmt.Errorf("failed to save book info in database: %w", err)
    }

    return nil
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
func parseBookName(fileName string) (string, string) {
	// 移除副檔名
	baseName := strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))

	// 使用正則表達式匹配書名和數字部分
	re := regexp.MustCompile(`^(.*?)(\d+)$`)
	matches := re.FindStringSubmatch(baseName)

	if len(matches) == 3 {
		return strings.TrimSpace(matches[1]), matches[2]
	}
	return baseName, ""
}


// 解析 ZIP 檔，取得檔案資訊
func AnalyzeZipFile(zipPath string) (*BookInfo, error) {
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer zipReader.Close()

	var images []ImageData
	for index, file := range zipReader.File {
		if filepath.Ext(file.Name) == ".png" || filepath.Ext(file.Name) == ".jpg" { // 處理 PNG 和 JPG
			images = append(images, ImageData{
				FileName: file.Name,
				FileIndex: int64(index),
				FileSize:     int64(file.UncompressedSize64),
			})
		}
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("ZIP 檔內沒有圖片")
	}

	// 產生 SHA（使用檔案的二進位內容）
	sha, err := generateSHA256(zipPath)
	if err != nil {
		return nil, err
	}

    // 按照 FileName 重新排序
    sort.Slice(images, func(i, j int) bool {
        return naturalLess(images[i].FileName, images[j].FileName)
    })

	// 解析書名與集數
	bookName, bookNumber := parseBookName(zipPath)

	bookInfo := &BookInfo{
		BookName:   bookName,
		BookNumber: bookNumber,
		FileName:  zipPath,
		SHA:       sha,
		Timestamp: time.Now().Unix(),
		ImageData: images,
	}

	return bookInfo, nil
}

// 自然排序函数
func naturalLess(a, b string) bool {
    re := regexp.MustCompile(`\d+`)
    aMatches := re.FindAllString(a, -1)
    bMatches := re.FindAllString(b, -1)

    for i := 0; i < len(aMatches) && i < len(bMatches); i++ {
        aNum, _ := strconv.Atoi(aMatches[i]) // 将字符串转换为整数
        bNum, _ := strconv.Atoi(bMatches[i]) // 将字符串转换为整数
        if aNum != bNum {
            return aNum < bNum
        }
    }
    return a < b
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

func AddBook(bookPath string) {
	// 解析 ZIP 檔案
	bookInfo, err := AnalyzeZipFile(bookPath)
	if err != nil {
		log.Fatal("解析失敗:", err)
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

	// 構建 Key，包含 BookName 與 BookNumber
	key := fmt.Sprintf("%s_%s", bookInfo.BookName, bookInfo.BookNumber)
	// 從 BoltDB 讀取剛剛存入的第一個 BookInfo
	loadedBook, err := LoadBookInfo(db, key)
	if err != nil {
		log.Fatal("讀取失敗:", err)
	}

	// 顯示讀取結果
	fmt.Println("從 BoltDB 讀取到的第一個 BookInfo:")
	fmt.Printf("SHA: %s\n", loadedBook.SHA)
	fmt.Printf("BookName: %s\n", loadedBook.BookName)
	fmt.Printf("Timestamp: %d\n", loadedBook.Timestamp)
	fmt.Println("Images:")
	// for _, img := range loadedBook.ImageData {
	// 	fmt.Printf("  - %s (%d bytes)\n", img.FileName, img.FileSize)
	// }


	// 刪除第一個 BookInfo
	// err = DeleteBookInfo(db, bookInfo.BookName)
	// if err != nil {
	// 	log.Fatal("刪除失敗:", err)
	// }
	// fmt.Println("成功刪除 BookInfo:", bookInfo.BookName)
}


/////////////////////////////////////////////////////////////////////////////////////////////
// API

func (a *App) ScanBookAll() {
	debug.DebugInfo("Func:ScanBookAll()")

	scanPath := ".\\comic"
	fileNameList, err := GetFileList(scanPath)
	if err != nil {
		debug.DebugInfo("讀取Path內容失敗:", err)
	}

	for _, fileName := range fileNameList {
		debug.DebugInfo("fileName:",fileName)
		filePath := scanPath + "\\" + fileName
		AddBook(filePath)
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
	// fmt.Println("bookList:", bookList) //todo
	return bookList
}

func (a *App) GetBookInfo(filePath string) (*BookInfo, error) {
	// 開啟 BoltDB
	db, err := bbolt.Open("data.db", 0600, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// 讀取指定的 BookInfo
	var book BookInfo
	err = db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket([]byte("bookinfo"))
		if bucket == nil {
			return fmt.Errorf("bucket not found")
		}

		data := bucket.Get([]byte(filepath.Base(filePath)))
		if data == nil {
			return fmt.Errorf("bookinfo not found for file: %s", filePath)
		}

		return json.Unmarshal(data, &book)
	})

	if err != nil {
		return nil, err
	}
	return &book, nil
}