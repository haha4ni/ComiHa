package backend

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"

	"ComiHa/backend/debug"
)

func (a *App) NowPath() (string, error) {
	path, err := os.Getwd()
	if err != nil {
		fmt.Println("❌ 無法取得當前目錄路徑:", err)
		return "XX", err
	}
	fmt.Println("G@當前目錄路徑:", path)
	return path, err
}

type ImageDataTemp struct {
	FileName   string
	FileBitmap []byte
}

// 讀取 ZIP 並取得Cover(第一張圖片)
func (a *App) ReadCover(zipPath string) ([]ImageDataTemp, error) {
	fmt.Println("G@進入READ:", zipPath)
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer r.Close()

	var images []ImageDataTemp

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
	images = append(images, ImageDataTemp{
		FileName:   f.Name,
		FileBitmap: data,
	})

	return images, nil
}

func (a *App) GetBookPages(bookKey string, pages []int64) ([]ImageDataTemp, error) {
	debug.DebugInfo("GetBookPages()")
	bookInfo, err := GetBookInfoByKey(bookKey)
	if err != nil {
		return nil, err
	}

	path := bookInfo.FileName
	debug.DebugInfo("path:", path)
	// debug.DebugInfo("bookInfo:", bookInfo)
	debug.DebugInfo("pages:", pages)

	// 開啟 ZIP 檔案
	r, err := zip.OpenReader(path)
	if err != nil {
		debug.DebugInfo("開啟 ZIP 失敗:", err)
		return nil, err
	}
	defer r.Close()

	var images []ImageDataTemp

	// 讀取指定頁面的檔案
	for _, page := range pages {
		if page < 0 || int(page) >= len(bookInfo.ImageData) {
			debug.DebugInfo("頁面超出範圍:", page)
			continue
		}

		fileIndex := bookInfo.ImageData[page].FileIndex
		if fileIndex < 0 || fileIndex >= int64(len(r.File)) {
			debug.DebugInfo("檔案索引超出範圍:", fileIndex)
			continue
		}

		targetFile := r.File[fileIndex]
		debug.DebugInfo("讀取檔案:", targetFile.Name)

		// 打開檔案
		fileReader, err := targetFile.Open()
		if err != nil {
			debug.DebugInfo("開啟檔案失敗:", err)
			continue
		}
		defer fileReader.Close()

		// 讀取檔案內容
		data, err := io.ReadAll(fileReader)
		if err != nil {
			debug.DebugInfo("讀取檔案內容失敗:", err)
			continue
		}

		// 將圖片數據添加到結果中
		images = append(images, ImageDataTemp{
			FileName:   targetFile.Name,
			FileBitmap: data,
		})
	}

	return images, nil
}

func (a *App) GetBookPage(bookKey string, page int64) (ImageDataTemp, error) {
	debug.DebugInfo("GetBookPage()")
	bookInfo, err := GetBookInfoByKey(bookKey)
	if err != nil {
		return ImageDataTemp{}, err
	}

	path := bookInfo.FileName
	debug.DebugInfo("path:", path)
	debug.DebugInfo("page:", page)

	// 開啟 ZIP 檔案
	r, err := zip.OpenReader(path)
	if err != nil {
		debug.DebugInfo("開啟 ZIP 失敗:", err)
		return ImageDataTemp{}, err
	}
	defer r.Close()

	if page < 0 || int(page) >= len(bookInfo.ImageData) {
		debug.DebugInfo("頁面超出範圍:", page)
		return ImageDataTemp{}, fmt.Errorf("頁面超出範圍: %d", page)
	}

	fileIndex := bookInfo.ImageData[page].FileIndex
	if fileIndex < 0 || fileIndex >= int64(len(r.File)) {
		debug.DebugInfo("檔案索引超出範圍:", fileIndex)
		return ImageDataTemp{}, fmt.Errorf("檔案索引超出範圍: %d", fileIndex)
	}

	targetFile := r.File[fileIndex]
	debug.DebugInfo("讀取檔案:", targetFile.Name)

	// 打開檔案
	fileReader, err := targetFile.Open()
	if err != nil {
		debug.DebugInfo("開啟檔案失敗:", err)
		return ImageDataTemp{}, err
	}
	defer fileReader.Close()

	// 讀取檔案內容
	data, err := io.ReadAll(fileReader)
	if err != nil {
		debug.DebugInfo("讀取檔案內容失敗:", err)
		return ImageDataTemp{}, err
	}

	// 返回圖片數據
	return ImageDataTemp{
		FileName:   targetFile.Name,
		FileBitmap: data,
	}, nil
}
