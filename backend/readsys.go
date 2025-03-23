package backend

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
)

func (a *App) NowPath() (string, error) {
    path, err := os.Getwd()
    if (err != nil) {
        fmt.Println("❌ 無法取得當前目錄路徑:", err)
        return "XX", err
    }
    fmt.Println("G@當前目錄路徑:", path)
    return path, err
}

type ImageDataTemp struct {
	FileName  string
	FileBitmap []byte
}

// 讀取 ZIP 並取得Cover(第一張圖片)
func (a *App) ReadCover(zipPath string) ([]ImageDataTemp, error) {
    fmt.Println("G@進入READ:",zipPath)
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
    
	// 依序讀取圖片，並存入結果
	// for _, k := range keys {
	// 	f := fileMap[k]

    //     // 打開f檔案
	// 	rc, err := f.Open()
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	defer rc.Close()

    //     // 讀取檔案內容
    //     data, err := io.ReadAll(rc)
    //     if err != nil {
    //         fmt.Println("讀取檔案內容失敗:", err)
    //         return nil, err
    //     }

	// 	// 存入結果
	// 	images = append(images, ImageDataTemp{
	// 		FileName:  f.Name,
	// 		FileBitmap: data,
	// 	})
	// }

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
		FileName:  f.Name,
		FileBitmap: data,
	})

	return images, nil
}