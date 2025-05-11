package backend

import (
	"archive/zip"
	"fmt"
	"io"
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
var comicDB *db.DB

// InitializeDB initializes the global database connection
func InitializeDB() error {
	dbPath := "./bookinfo.db"
	var err error
	comicDB, err = db.NewDB(dbPath, &BookInfo{}, &ImageData{}, &Metadata{}, &Page{})
	return err
}

// CloseDB closes the global database connection
func CloseDB() error {
	if comicDB != nil {
		return db.CloseBD(comicDB)
	}
	return nil
}

// ///////////////////////////////////////////////////////////////////////////////////////
func SaveSeriesInfo(book BookInfo) error {
	return nil //TODO
}

// 存入 BookInfo 到 BoltDB
func SaveBookInfo(book BookInfo) error {
	return db.SaveData(comicDB, &book)
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

// 解析 ZIP 檔，取得檔案資訊
func AnalyzeZipFile(zipPath string) (*BookInfo, error) {
	var bookName, bookNumber string

	// Retrieve ComicInfo.xml metadata
	metadata, err := GetComicInfoFromZip(zipPath)
	if err != nil {
		fmt.Printf("讀取 ComicInfo.xml 失敗，將使用檔名解析: %v\n", err)
		bookName, bookNumber = parseBookName(zipPath)
	} else if metadata != nil && metadata.Series != "" && metadata.Number != "" {
		bookName = metadata.Series
		bookNumber = metadata.Number
	} else {
		fmt.Printf("讀取 ComicInfo.xml 書名未填寫，將使用檔名解析\n")
		bookName, bookNumber = parseBookName(zipPath)
	}

	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer zipReader.Close()

	var images []ImageData
	for index, file := range zipReader.File {
		if filepath.Ext(file.Name) == ".png" || filepath.Ext(file.Name) == ".jpg" {
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

	// Generate SHA (using the binary content of the file)
	sha, err := gadget.GenerateSHA256(zipPath)
	if err != nil {
		return nil, err
	}

	// Sort images by file name
	sort.Slice(images, func(i, j int) bool {
		return gadget.NaturalLess(images[i].FileName, images[j].FileName)
	})

	bookInfo := &BookInfo{
		FileName:   zipPath,
		SHA:        sha,
		Timestamp:  time.Now().Unix(),
		ImageData:  images,
	}

	// Populate metadata if ComicInfo.xml exists
	if metadata != nil {
		bookInfo.Metadata = *metadata
	}
	bookInfo.Metadata.Series = bookName
	bookInfo.Metadata.Number = bookNumber

	//如果metadata.pages是空的
	//把images填進metadata裡面
	if metadata != nil && len(metadata.Pages) == 0 {
		fmt.Println("Metadata pages are empty, populating with image data...")
		for i, img := range images {
			metadata.Pages = append(metadata.Pages, Page{
				Image:     i,
				ImageSize: int(img.FileSize),
			})
		}
		fmt.Printf("Populated metadata pages with %d images.\n", len(images))
		// Reassign updated metadata back to bookInfo.Metadata
		bookInfo.Metadata = *metadata
	}
	WriteComicInfo(*bookInfo)

	return bookInfo, nil
}

func GetBookBySeriesAndNumber(db *db.DB, series string, number string) (*BookInfo, error) {
    var book BookInfo
    err := db.Conn().Preload("ImageData").Preload("Metadata").
        Joins("JOIN metadata ON metadata.book_info_id = book_infos.id").
        Where("metadata.series = ? AND metadata.number = ?", series, number).
        First(&book).Error
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
	debug.DebugInfo("11111:")
	// Attempt to retrieve ComicInfo.xml metadata
	metadata, err := GetComicInfoFromZip(bookPath)
	if err != nil {
		fmt.Printf("讀取 ComicInfo.xml 失敗，將使用檔名解析: %v\n", err)
	}
	debug.DebugInfo("22222:")
	var dbBook *BookInfo
	if metadata != nil && metadata.Series != "" && metadata.Number != "" {
		// Use metadata to find the book
		dbBook, err = GetBookBySeriesAndNumber(comicDB, metadata.Series, metadata.Number)
	} else {
		// Fallback to parsing the book name
		bookName, bookNumber := parseBookName(bookPath)
		dbBook, err = GetBookBySeriesAndNumber(comicDB, bookName, bookNumber)
	}
	debug.DebugInfo("33333:")
	if err == nil && dbBook.SHA == sha {
		fmt.Printf("書籍已存在且 SHA 相同，跳過保存: %s\n", dbBook.Metadata.Series)
		return nil
	}
	debug.DebugInfo("44444:")
	// Perform full ZIP analysis if the book is not found or SHA is different
	bookInfo, err := AnalyzeZipFile(bookPath)
	if err != nil {
		return fmt.Errorf("解析失敗: %w", err)
	}
	debug.DebugInfo("55555:")
	// Save BookInfo to BoltDB
	err = SaveBookInfo(*bookInfo)
	if err != nil {
		return fmt.Errorf("存入 BoltDB 失敗: %w", err)
	}
	debug.DebugInfo("66666:")
	// Save series info
	err = SaveSeriesInfo(*bookInfo)
	if err != nil {
		return fmt.Errorf("存入系列資訊失敗: %w", err)
	}

	fmt.Printf("成功新增書籍: %s\n", bookInfo.Metadata.Series)
	return nil
}

/////////////////////////////////////////////////////////////////////////////////////////////
// API

type BookImageData struct {
	FileName   string
	FileBitmap []byte
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

///

func (a *App) GetBookListAll() (bookList []BookInfo) {
	// 讀取所有 BookInfo
		fmt.Printf("111111111111111\n")

	err := db.GetAllData(comicDB, &bookList, "ImageData", "Metadata")
	if err != nil {
		log.Fatal("讀取所有 BookInfo 失敗:", err)
	}
	fmt.Printf("2222222222222\n")
	return bookList
}

func (a *App) GetBookCoverBySeriesAndNumber(series string, number string) (*BookImageData, error) {
	bookInfo, err := GetBookBySeriesAndNumber(comicDB, series, number)
	if err != nil {
		return nil, fmt.Errorf("failed to get book info: %w", err)
	}
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
	// fmt.Println(keys)

	f := fileMap[keys[0]]

	// 打開f檔案
	fo, err := f.Open()
	if err != nil {
		return nil, err
	}
	defer fo.Close()

	// 讀取檔案內容
	data, err := io.ReadAll(fo)
	if err != nil {
		fmt.Println("讀取檔案內容失敗:", err)
		return nil, err
	}

	// 存入結果
    image := &BookImageData{
        FileName:   f.Name,
        FileBitmap: data,
    }
	return image, nil
}

func (a *App) GetBookInfoByKey(key string) (*BookInfo, error) {
	return GetBookInfoByKey(key)
}

func GetBookInfoByKey(key string) (*BookInfo, error) {
	// 從 BoltDB 讀取 BookInfo
	bookInfo, err := LoadBookInfo(key)
	if err != nil {
		return nil, fmt.Errorf("failed to load book info: %w", err)
	}
	return bookInfo, nil
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