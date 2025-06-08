package backend

import (
	"archive/zip"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"ComiHa/backend/db"
	"ComiHa/backend/debug"
	"ComiHa/backend/gadget"
)

var cachePath = "./data/cache"
var comitPath = "./comic"

// Global database connection
var comicDB *db.DB

func InitDB() error {
	dbPath := "./bookinfo.db"
	var err error
	comicDB, err = db.NewDB(dbPath, &BookInfo{}, &ImageData{}, &Metadata{}, &Page{})
	return err
}

func CloseDB() error {
	if comicDB != nil {
		return db.CloseBD(comicDB)
	}
	return nil
}

func SaveSeriesInfo(book BookInfo) error {
	return nil //TODO
}

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(book BookInfo) error {
	return db.SaveData(comicDB, &book)
}

func UpdateBookInfo(book BookInfo) error {
	return db.UpdateData(comicDB, &book)
}

// 從 BoltDB 讀取 BookInfo
func LoadBookInfo(bookname string) (*BookInfo, error) {
	return nil, nil //TODO
}

// 根據 BookName 刪除 BookInfo
func DeleteBookInfo(bookname string) error {
	return nil //TODO
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

func GetBookinfoByAndConditions(db *db.DB, conditions map[string]interface{}) (*BookInfo, error) {
	var book BookInfo
	debug.DebugInfo("GetBookinfoByAndConditions()")
	debug.DebugInfo("conditions:", conditions)
	query := db.Conn().Preload("ImageData").Preload("Metadata").
		Joins("JOIN metadata ON metadata.book_info_id = book_infos.id")

	for key, value := range conditions {
		query = query.Where(fmt.Sprintf("%s = ?", key), value)
	}

	err := query.First(&book).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func GetBookinfoByOrConditions(db *db.DB, conditions map[string]interface{}) (*BookInfo, error) {
	var book BookInfo
	query := db.Conn().Preload("ImageData").Preload("Metadata").
		Joins("JOIN metadata ON metadata.book_info_id = book_infos.id")

	// Build OR conditions dynamically
	orConditions := []string{}
	values := []interface{}{}
	for key, value := range conditions {
		orConditions = append(orConditions, fmt.Sprintf("%s = ?", key))
		values = append(values, value)
	}

	query = query.Where(strings.Join(orConditions, " OR "), values...)

	err := query.First(&book).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func AddBook(bookPath string) error {
	// 比對現有的book Key其SHA是否相同
	sha, err := gadget.GenerateSHA256(bookPath)
	if err != nil {
		return fmt.Errorf("生成 SHA 失敗: %w", err)
	}
	// Attempt to retrieve ComicInfo.xml metadata
	metadata, err := GetComicInfoFromZip(bookPath)
	if err != nil {
		fmt.Printf("讀取 ComicInfo.xml 失敗，將使用檔名解析: %v\n", err)
	}

	var dbBook *BookInfo
	if metadata != nil && metadata.Series != "" && metadata.Number != "" {
		// Use metadata to find the book
		dbBook, err = GetBookinfoByAndConditions(comicDB, map[string]interface{}{
			"metadata.series": metadata.Series,
			"metadata.number": metadata.Number,
		})
	} else {
		// Fallback to parsing the book name
		bookName, bookNumber := parseBookName(bookPath)
		dbBook, err = GetBookinfoByAndConditions(comicDB, map[string]interface{}{
			"metadata.series": bookName,
			"metadata.number": bookNumber,
		})
	}

	if err == nil && dbBook.SHA == sha {
		fmt.Printf("書籍已存在且 SHA 相同，跳過保存: %s\n", dbBook.Metadata.Series)
		return nil
	}
	
	// Perform full ZIP analysis if the book is not found or SHA is different
	bookInfo, err := AnalyzeZipFile(bookPath)
	if err != nil {
		return fmt.Errorf("解析失敗: %w", err)
	}
	
	// Save BookInfo to BoltDB
	err = SaveBookInfo(*bookInfo)
	if err != nil {
		return fmt.Errorf("存入 BoltDB 失敗: %w", err)
	}
	
	// Save series info
	err = SaveSeriesInfo(*bookInfo)
	if err != nil {
		return fmt.Errorf("存入系列資訊失敗: %w", err)
	}

	fmt.Printf("成功新增書籍: %s\n", bookInfo.Metadata.Series)
	return nil
}

/////////////////////////////////////////////////////////////////////////////////////////////
type BookImageData struct {
	FileName   string
	FileBitmap []byte
	FileString string 
}

func (a *App) ScanBookAll() {
	debug.DebugInfo("Func:ScanBookAll()")

	scanPath := ".\\comic" // TODO: 從設定檔讀取路徑
	fileNameList, err := GetFileList(scanPath)
	if err != nil {
		debug.DebugInfo("讀取漫畫路徑失敗:", err)
	}

	for _, fileName := range fileNameList {
		filePath := scanPath + "\\" + fileName
		debug.DebugInfo("讀取漫畫:", fileName)
		err := AddBook(filePath)
		if err != nil {
			debug.DebugInfo("新增漫畫失敗:", err)
			continue
		}
	}
}

func (a *App) GetBookListAll() (bookList []BookInfo) {
	err := db.GetAllData(comicDB, &bookList, "ImageData", "Metadata")
	if err != nil {
		log.Fatal("讀取所有 BookInfo 失敗:", err)
	}
	return bookList
}


func (a *App) GetBookinfoByAndConditions(conditions map[string]interface{}) (*BookInfo, error) {
	return GetBookinfoByAndConditions(comicDB, conditions)
}

func (a *App) GetBookCoverByBookinfo(bookInfo *BookInfo) (*BookImageData, error) {
	zipPath := bookInfo.FileName
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer r.Close()

	// 先將圖片名稱存入 slice
	fileMap := make(map[string]*zip.File)
	var keys []string

	for _, f := range r.File {
		if !strings.HasSuffix(f.Name, ".png") && !strings.HasSuffix(f.Name, ".jpg") {
			continue // 只處理 PNG / JPG 圖片
		}

		// 提取副檔名以外的部分，例如 "0_cover.jpg" 解析成 "0_cover"
		base := strings.TrimSuffix(f.Name, ".png")
		base = strings.TrimSuffix(base, ".jpg")

		keys = append(keys, base)
		fileMap[base] = f
	}

	// 按照字串排序檔名
	sort.Strings(keys)

	// 打開第一個檔案
	f := fileMap[keys[0]]
	fo, err := f.Open()
	if err != nil {
		return nil, err
	}
	defer fo.Close()

	data, err := io.ReadAll(fo)
	if err != nil {
		fmt.Println("讀取檔案內容失敗:", err)
		return nil, err
	}

	mime := "image/png"
    if strings.HasSuffix(f.Name, ".jpg") {
        mime = "image/jpeg"
    }

    base64Data := base64.StdEncoding.EncodeToString(data)
    fullDataURL := fmt.Sprintf("data:%s;base64,%s", mime, base64Data)

	// 存入結果
	image := &BookImageData{
		FileName:   f.Name,
		FileString: fullDataURL,
	}

	return image, nil
}

func (a *App) GetBookPageThumbnailByBookinfo(bookInfo *BookInfo, page int64) (*BookImageData, error) {
	debug.DebugInfo("GetBookPageThumbnailByBookinfo()")
	
	return nil, fmt.Errorf("GetBookPageThumbnailByBookinfo() 尚未實作")
}

func (a *App) GetBookPageByBookinfo(bookInfo *BookInfo, page int64) (*BookImageData, error) {
	debug.DebugInfo("GetBookPageByBookinfo()")

	path := bookInfo.FileName
	debug.DebugInfo("path:", path)
	debug.DebugInfo("page:", page)

	r, err := zip.OpenReader(path)
	if err != nil {
		debug.DebugInfo("開啟 ZIP 失敗:", err)
		return nil, err
	}
	defer r.Close()

	if page < 0 || int(page) >= len(bookInfo.ImageData) {
		debug.DebugInfo("頁面超出範圍:", page)
		return nil, fmt.Errorf("頁面超出範圍: %d", page)
	}

	fileIndex := bookInfo.ImageData[page].FileIndex
	if fileIndex < 0 || fileIndex >= int64(len(r.File)) {
		debug.DebugInfo("檔案索引超出範圍:", fileIndex)
		return nil, fmt.Errorf("檔案索引超出範圍: %d", fileIndex)
	}

	targetFile := r.File[fileIndex]
	debug.DebugInfo("讀取檔案:", targetFile.Name)

	fileReader, err := targetFile.Open()
	if err != nil {
		debug.DebugInfo("開啟檔案失敗:", err)
		return nil, err
	}
	defer fileReader.Close()

	data, err := io.ReadAll(fileReader)
	if err != nil {
		debug.DebugInfo("讀取檔案內容失敗:", err)
		return nil, err
	}

	image := &BookImageData{
		FileName:   targetFile.Name,
		FileBitmap: data,
	}
	return image, nil
}

// 疊代呼叫單頁取得多頁
func (a *App) GetBookPagesByBookinfo(bookInfo *BookInfo, pages []int64) ([]BookImageData, error) {
	debug.DebugInfo("GetBookPagesByBookinfo()")
	var images []BookImageData
	for _, page := range pages {
		img, err := a.GetBookPageByBookinfo(bookInfo, page)
		if err != nil {
			debug.DebugInfo("取得頁面失敗:", err)
			continue
		}
		images = append(images, *img)
	}
	return images, nil
}

func (a *App) GetBookInfoByKey(key string) (*BookInfo, error) {
	return GetBookInfoByKey(key)
}

func GetBookInfoByKey(key string) (*BookInfo, error) {
	bookInfo, err := LoadBookInfo(key)
	if err != nil {
		return nil, fmt.Errorf("failed to load book info: %w", err)
	}
	return bookInfo, nil
}


func (a *App) UpdateBookInfo(book BookInfo) error {
	err := UpdateBookInfo(book)
	return err
}

func (a *App) GetSeriesListAll() (seriesinfoList []SeriesInfo) {
	// 讀取所有 BookInfo
	// err := globalDB.GetAllData("seriesinfo", &seriesinfoList)
	// if err != nil {
	// 	log.Fatal("讀取所有 seriesinfo 失敗:", err)
	// }
	// return seriesinfoList

	return nil
}

func (a *App) GetSeriesKeyListAll() (serieskeyList []string) {
	// 讀取所有 BookInfo
	// serieskeyList, err := globalDB.GetAllKeys("seriesinfo")
	// if err != nil {
	// 	log.Fatal("讀取所有 serieskey 失敗:", err)
	// }
	// return serieskeyList
	return nil
}

func (a *App) GetSeriesInfoByKey(seriesKey string) (*SeriesInfo, error) {
	// var seriesInfo SeriesInfo
	// err := globalDB.LoadData("seriesinfo", seriesKey, &seriesInfo)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to load series info: %w", err)
	// }
	// return &seriesInfo, nil

	return nil, nil
}

func (a *App) SaveBookInfo(book BookInfo) error {
	return SaveBookInfo(book)
}