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

// Global database connection
var globalDB *db.DB

// InitializeDB initializes the global database connection
func InitializeDB() error {
	var err error
	globalDB, err = db.NewDB("data.db")
	return err
}

// CloseDB closes the global database connection
func CloseDB() error {
	if globalDB != nil {
		return globalDB.Close()
	}
	return nil
}

// ///////////////////////////////////////////////////////////////////////////////////////
func SaveSeriesInfo(book BookInfo) error {
	key := book.BookName
	var seriesInfo SeriesInfo

	// Load existing data
	err := globalDB.LoadData("seriesinfo", key, &seriesInfo)
	if err != nil {
		// If bucket doesn't exist or key not found, initialize empty seriesInfo
		seriesInfo = SeriesInfo{
			SeriesName: key,
			BookInfoKeys: []string{},
		}
	}

	// Append new key
	newKey := fmt.Sprintf("%s_%s", book.BookName, book.BookNumber)
	seriesInfo.BookInfoKeys = append(seriesInfo.BookInfoKeys, newKey)

	// Sort the keys
	sort.Strings(seriesInfo.BookInfoKeys)

	return globalDB.SaveData("seriesinfo", key, seriesInfo)
}

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(book BookInfo) error {
	key := fmt.Sprintf("%s_%s", book.BookName, book.BookNumber)
	return globalDB.SaveData("bookinfo", key, book)
}

// 從 BoltDB 讀取 BookInfo
func LoadBookInfo(bookname string) (*BookInfo, error) {
	var book BookInfo
	err := globalDB.LoadData("bookinfo", bookname, &book)
	if err != nil {
		return nil, err
	}
	return &book, nil
}

// 根據 BookName 刪除 BookInfo
func DeleteBookInfo(bookname string) error {
	return globalDB.DeleteData("bookinfo", bookname)
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
	// 存入 BookInfo 到 BoltDB
	err := SaveBookInfo(bookInfo)
	if err != nil {
		return fmt.Errorf("failed to save book info: %w", err)
	}

	return nil
}

func GetBookInfo(bookName string) (*BookInfo, error) {
	// 從 BoltDB 讀取 BookInfo
	bookInfo, err := LoadBookInfo(bookName)
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

	// 構建 Key，包含 BookName 與 BookNumber
	key := fmt.Sprintf("%s_%s", bookInfo.BookName, bookInfo.BookNumber)

	// 先檢查是否已存在相同 SHA 的書籍
	existingBook, err := LoadBookInfo(key)
	if err == nil && existingBook.SHA == bookInfo.SHA {
		fmt.Printf("書籍已存在且 SHA 相同，跳過保存: %s\n", bookInfo.BookName)
		return
	}

	// 存入 BookInfo 到 BoltDB
	err = SaveBookInfo(*bookInfo)
	if err != nil {
		log.Fatal("存入 BoltDB 失敗:", err)
	}

	// Save series info
	err = SaveSeriesInfo(*bookInfo)
	if err != nil {
		log.Fatal("存入系列資訊失敗:", err)
	}

	// 從 BoltDB 讀取剛剛存入的 BookInfo
	loadedBook, err := LoadBookInfo(key)
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
	// 讀取所有 BookInfo
	err := globalDB.GetAllData("bookinfo", &bookList)
	if err != nil {
		log.Fatal("讀取所有 BookInfo 失敗:", err)
	}
	return bookList
}

func (a *App) GetBookInfoByKey(key string) (*BookInfo, error) {
	// 從 BoltDB 讀取 BookInfo
	bookInfo, err := LoadBookInfo(key)
	if err != nil {
		return nil, fmt.Errorf("failed to load book info: %w", err)
	}

	return bookInfo, nil
}

func (a *App) GetSeriesListAll() (seriesinfoList []SeriesInfo) {
	// 讀取所有 BookInfo
	err := globalDB.GetAllData("seriesinfo", &seriesinfoList)
	if err != nil {
		log.Fatal("讀取所有 seriesinfo 失敗:", err)
	}
	return seriesinfoList
}

func (a *App) GetSeriesKeyListAll() (serieskeyList []string) {
	// 讀取所有 BookInfo
	serieskeyList, err := globalDB.GetAllKeys("seriesinfo")
	if err != nil {
		log.Fatal("讀取所有 serieskey 失敗:", err)
	}
	return serieskeyList
}

func (a *App) GetSeriesInfoByKey(seriesKey string) (*SeriesInfo, error) {
	var seriesInfo SeriesInfo
	err := globalDB.LoadData("seriesinfo", seriesKey, &seriesInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to load series info: %w", err)
	}
	return &seriesInfo, nil
}