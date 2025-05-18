package backend

import (
	"archive/zip"
	"fmt"
	"io"
	"ComiHa/backend/debug"
)

type ImageDataTemp struct {
	FileName   string
	FileBitmap []byte
}


func (a *App) GetBookPage(bookKey string, page int64) (ImageDataTemp, error) {
	debug.DebugInfo("GetBookPage()")
	bookInfo, err := GetBookInfoByKey(bookKey)
	if err != nil {
		return ImageDataTemp{}, err
	}

	path := bookInfo.FileName
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

