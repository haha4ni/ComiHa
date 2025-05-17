package backend

import (
	"archive/zip"
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"ComiHa/backend/debug"

	"github.com/nfnt/resize"
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

// GetBookPageThumbnail returns a resized thumbnail for the requested page
func (a *App) GetBookPageThumbnail(bookKey string, page int64, width uint, height uint) (ImageDataTemp, error) {
	debug.DebugInfo("GetBookPageThumbnail()")
	bookInfo, err := GetBookInfoByKey(bookKey)
	if err != nil {
		return ImageDataTemp{}, err
	}

	path := bookInfo.FileName
	debug.DebugInfo("page:", page)

	// Open ZIP file
	r, err := zip.OpenReader(path)
	if err != nil {
		debug.DebugInfo("Failed to open ZIP:", err)
		return ImageDataTemp{}, err
	}
	defer r.Close()

	if page < 0 || int(page) >= len(bookInfo.ImageData) {
		debug.DebugInfo("Page out of range:", page)
		return ImageDataTemp{}, fmt.Errorf("Page out of range: %d", page)
	}

	fileIndex := bookInfo.ImageData[page].FileIndex
	if fileIndex < 0 || fileIndex >= int64(len(r.File)) {
		debug.DebugInfo("File index out of range:", fileIndex)
		return ImageDataTemp{}, fmt.Errorf("File index out of range: %d", fileIndex)
	}

	targetFile := r.File[fileIndex]
	debug.DebugInfo("Reading file:", targetFile.Name)

	// Open file
	fileReader, err := targetFile.Open()
	if err != nil {
		debug.DebugInfo("Failed to open file:", err)
		return ImageDataTemp{}, err
	}
	defer fileReader.Close()

	// Read file content
	data, err := io.ReadAll(fileReader)
	if err != nil {
		debug.DebugInfo("Failed to read file content:", err)
		return ImageDataTemp{}, err
	}

	// Decode image
	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		debug.DebugInfo("Failed to decode image:", err)
		return ImageDataTemp{}, err
	}

	// Resize image
	thumbnail := resize.Resize(width, height, img, resize.Lanczos3)

	// Encode resized image to buffer
	var buf bytes.Buffer
	switch format {
	case "jpeg":
		err = jpeg.Encode(&buf, thumbnail, nil)
	case "png":
		err = png.Encode(&buf, thumbnail)
	default:
		return ImageDataTemp{}, fmt.Errorf("Unsupported image format: %s", format)
	}
	if err != nil {
		debug.DebugInfo("Failed to encode thumbnail:", err)
		return ImageDataTemp{}, err
	}

	// Return thumbnail data
	return ImageDataTemp{
		FileName:   targetFile.Name,
		FileBitmap: buf.Bytes(),
	}, nil
}
