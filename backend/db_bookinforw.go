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

func SaveBookInfo(book BookInfo) error {
	return db.SaveData(comicDB, &book)
}

func UpdateBookInfo(book BookInfo) error {
	return db.UpdateData(comicDB, &book)
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

func GetBookinfosByAndConditions(db *db.DB, conditions map[string]interface{}) ([]BookInfo, error) {
	var books []BookInfo
	debug.DebugInfo("GetBookinfosByAndConditions()")
	debug.DebugInfo("conditions:", conditions)
	query := db.Conn().
		Preload("ImageData").
		Preload("Metadata").
		Preload("Metadata.Pages"). // 新增這行
		Joins("JOIN metadata ON metadata.book_info_id = book_infos.id")

	for key, value := range conditions {
		query = query.Where(fmt.Sprintf("%s = ?", key), value)
	}

	err := query.Find(&books).Error
	if err != nil {
		return nil, err
	}
	return books, nil
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
	
	bookInfo, err := AnalyzeZipFile(bookPath)
	if err != nil {
		return fmt.Errorf("解析失敗: %w", err)
	}

	if dbBook != nil && dbBook.ID != 0 {
		bookInfo.ID = dbBook.ID
		bookInfo.SHA = sha
		err = UpdateBookInfo(*bookInfo)
		if err != nil {
			return fmt.Errorf("更新 DB 失敗: %w", err)
		}
		fmt.Printf("成功更新書籍: %s\n", bookInfo.Metadata.Series)
		return nil
	} else {
		bookInfo.SHA = sha
		err = SaveBookInfo(*bookInfo)
		if err != nil {
			return fmt.Errorf("存入 DB 失敗: %w", err)
		}
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

func (a *App) GetBookinfosByAndConditions(conditions map[string]interface{}) ([]BookInfo, error) {
	return GetBookinfosByAndConditions(comicDB, conditions)
}

func (a *App) GetBookinfosByComplexConditions(conditions []QueryCondition) ([]BookInfo, error) {
	return GetBookinfosByComplexConditions(comicDB, conditions)
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
	path := bookInfo.FileName

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

func (a *App) UpdateBookInfo(book BookInfo) error {
	err := UpdateBookInfo(book)
	return err
}

func (a *App) GetSeriesKeyListAll() (seriesList []string) {
	// 直接用 SQL 查詢唯一 Series
	var seriesArr []string
	err := comicDB.Conn().Model(&Metadata{}).
		Select("DISTINCT series").
		Where("series != ''").
		Pluck("series", &seriesArr).Error
	if err != nil {
		log.Fatal("查詢所有 Series 失敗:", err)
	}
	return seriesArr
}

func (a *App) SaveBookInfo(book BookInfo) error {
	return SaveBookInfo(book)
}

func GetBookinfosByComplexConditions(db *db.DB, conditions []QueryCondition) ([]BookInfo, error) {
	var books []BookInfo
	debug.DebugInfo("GetBookinfosByComplexConditions()")
	debug.DebugInfo("conditions:", conditions)
	
	query := db.Conn().
		Preload("ImageData").
		Preload("Metadata").
		Preload("Metadata.Pages").
		Joins("JOIN metadata ON metadata.book_info_id = book_infos.id")

	if len(conditions) == 0 {
		err := query.Find(&books).Error
		return books, err
	}

	// 構建 WHERE 條件
	var whereClause strings.Builder
	var values []interface{}
	
	for i, condition := range conditions {
		if i > 0 {
			// 添加邏輯操作符 (AND/OR)
			prevLogic := conditions[i-1].Logic
			if prevLogic == "OR" {
				whereClause.WriteString(" OR ")
			} else {
				whereClause.WriteString(" AND ")
			}
		}
		
		switch condition.Operator {
		case "=":
			whereClause.WriteString(fmt.Sprintf("%s = ?", condition.Field))
			values = append(values, condition.Value)
		case "!=":
			whereClause.WriteString(fmt.Sprintf("%s != ?", condition.Field))
			values = append(values, condition.Value)
		case "IS NULL":
			whereClause.WriteString(fmt.Sprintf("(%s IS NULL OR %s = '')", condition.Field, condition.Field))
		case "IS NOT NULL":
			whereClause.WriteString(fmt.Sprintf("(%s IS NOT NULL AND %s != '')", condition.Field, condition.Field))
		case "LIKE":
			whereClause.WriteString(fmt.Sprintf("%s LIKE ?", condition.Field))
			values = append(values, condition.Value)
		case "IN":
			if valueSlice, ok := condition.Value.([]interface{}); ok && len(valueSlice) > 0 {
				placeholders := strings.Repeat("?,", len(valueSlice))
				placeholders = placeholders[:len(placeholders)-1] // 移除最後的逗號
				whereClause.WriteString(fmt.Sprintf("%s IN (%s)", condition.Field, placeholders))
				values = append(values, valueSlice...)
			}
		case "NOT IN":
			if valueSlice, ok := condition.Value.([]interface{}); ok && len(valueSlice) > 0 {
				placeholders := strings.Repeat("?,", len(valueSlice))
				placeholders = placeholders[:len(placeholders)-1] // 移除最後的逗號
				whereClause.WriteString(fmt.Sprintf("%s NOT IN (%s)", condition.Field, placeholders))
				values = append(values, valueSlice...)
			}
		default:
			return nil, fmt.Errorf("不支援的操作符: %s", condition.Operator)
		}
	}
	
	if whereClause.Len() > 0 {
		query = query.Where(whereClause.String(), values...)
	}
	
	err := query.Find(&books).Error
	if err != nil {
		return nil, err
	}
	return books, nil
}