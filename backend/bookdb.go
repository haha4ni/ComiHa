package backend

import (
	"archive/zip"
	"fmt"
	"log"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"ComiHa/backend/db"
	"ComiHa/backend/debug"
	"ComiHa/backend/gadget"
)

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(db *db.DB, book BookInfo) error {
	key := fmt.Sprintf("%s_%s", book.BookName, book.BookNumber)
	return db.SaveData("bookinfo", key, book)
}

// 從 BoltDB 讀取 BookInfo
func LoadBookInfo(db *db.DB, bookname string) (*BookInfo, error) {
	var book BookInfo
	err := db.LoadData("bookinfo", bookname, &book)
	if err != nil {
		return nil, err
	}
	return &book, nil
}

// 根據 BookName 刪除 BookInfo
func DeleteBookInfo(db *db.DB, bookname string) error {
	return db.DeleteData("bookinfo", bookname)
}

func parseBookName(fileName string) (string, string) {
	// 移除副檔名
	baseName := strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))

	// 使用正則表達式匹配書名和數字部分
	re := regexp.MustCompile(`^(.*?)(\d+)$`)
	matches := re.FindStringSubmatch(baseName)

	if len(matches) == 3 {
		// 移除數字部分的前導零
		number := strings.TrimLeft(matches[2], "0")
		if number == "" {
			number = "0" // 如果全部是零，保留一個零
		}
		return strings.TrimSpace(matches[1]), number
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
				FileName:  file.Name,
				FileIndex: int64(index),
				FileSize:  int64(file.UncompressedSize64),
			})
		}
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("ZIP 檔內沒有圖片")
	}

	// 產生 SHA（使用檔案的二進位內容）
	sha, err := gadget.GenerateSHA256(zipPath)
	if err != nil {
		return nil, err
	}

	// 按照 FileName 重新排序
	sort.Slice(images, func(i, j int) bool {
		return gadget.NaturalLess(images[i].FileName, images[j].FileName)
	})

	// 解析書名與集數
	bookName, bookNumber := parseBookName(zipPath)

	bookInfo := &BookInfo{
		BookName:   bookName,
		BookNumber: bookNumber,
		FileName:   zipPath,
		SHA:        sha,
		Timestamp:  time.Now().Unix(),
		ImageData:  images,
	}

	return bookInfo, nil
}

func AddBookInfo(bookInfo BookInfo) error {
	// 開啟 BoltDB
	db, err := db.NewDB("data.db")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// 存入 BookInfo 到 BoltDB
	err = SaveBookInfo(db, bookInfo)
	if err != nil {
		return fmt.Errorf("failed to save book info: %w", err)
	}

	return nil
}

func GetBookInfo(bookName string) (*BookInfo, error) {
	// 開啟 BoltDB
	db, err := db.NewDB("data.db")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// 從 BoltDB 讀取 BookInfo
	bookInfo, err := LoadBookInfo(db, bookName)
	if err != nil {
		return nil, fmt.Errorf("failed to load book info: %w", err)
	}

	return bookInfo, nil
}

func AddBook(bookPath string) {
	// 解析 ZIP 檔案
	bookInfo, err := AnalyzeZipFile(bookPath)
	if err != nil {
		log.Fatal("解析失敗:", err)
	}

	// 開啟 BoltDB
	db, err := db.NewDB("data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 構建 Key，包含 BookName 與 BookNumber
	key := fmt.Sprintf("%s_%s", bookInfo.BookName, bookInfo.BookNumber)

	// 先檢查是否已存在相同 SHA 的書籍
	existingBook, err := LoadBookInfo(db, key)
	if err == nil && existingBook.SHA == bookInfo.SHA {
		fmt.Printf("書籍已存在且 SHA 相同，跳過保存: %s\n", bookInfo.BookName)
		return
	}

	// 存入 BookInfo 到 BoltDB
	err = SaveBookInfo(db, *bookInfo)
	if err != nil {
		log.Fatal("存入 BoltDB 失敗:", err)
	}

	// 從 BoltDB 讀取剛剛存入的 BookInfo
	loadedBook, err := LoadBookInfo(db, key)
	if err != nil {
		log.Fatal("讀取失敗:", err)
	}

	// 顯示讀取結果
	fmt.Println("從 BoltDB 讀取到的 BookInfo:")
	fmt.Printf("SHA: %s\n", loadedBook.SHA)
	fmt.Printf("BookName: %s\n", loadedBook.BookName)
	fmt.Printf("Timestamp: %d\n", loadedBook.Timestamp)
	fmt.Println("Images:")
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
		debug.DebugInfo("fileName:", fileName)
		filePath := scanPath + "\\" + fileName
		AddBook(filePath)
	}
}

func (a *App) GetBookListAll() (bookList []BookInfo) {
	// 開啟 BoltDB
	db, err := db.NewDB("data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 讀取所有 BookInfo
	err = db.GetAllData("bookinfo", &bookList)
	if err != nil {
		log.Fatal("讀取所有 BookInfo 失敗:", err)
	}
	return bookList
}

func (a *App) GetBookInfo(bookName string) (*BookInfo, error) {
	// 開啟 BoltDB
	db, err := db.NewDB("data.db")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// 從 BoltDB 讀取 BookInfo
	bookInfo, err := LoadBookInfo(db, bookName)
	if err != nil {
		return nil, fmt.Errorf("failed to load book info: %w", err)
	}

	return bookInfo, nil
}
