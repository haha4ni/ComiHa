package backend

import (
	"ComiHa/backend/gadget"
	"archive/zip"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// WriteComicInfo writes the BookInfo struct to a ComicInfo.xml file
func WriteComicInfo(bookInfo BookInfo) error {
	// Log the entire bookInfo.Metadata
	log.Printf("BookInfo Metadata: %+v", bookInfo.Metadata)

	// Marshal the XML
	xmlData, err := xml.MarshalIndent(bookInfo.Metadata, "", "  ")
	if err != nil {
		return err
	}

	// Add XML header
	xmlData = append([]byte(xml.Header), xmlData...)

	// Write to file
	filename := bookInfo.FileName + ".ComicInfo.xml"
	log.Printf("Writing ComicInfo.xml to %s", filename)
	err = os.WriteFile(filename, xmlData, 0644)
	if err != nil {
		return err
	}

	return nil
}

func WriteComicInfoToZip(bookInfo BookInfo) error {
	fmt.Printf("WriteComicInfoToZip\n")
	xmlPath := bookInfo.FileName + ".ComicInfo.xml"
	zipPath := bookInfo.FileName
	tmpZipPath := zipPath + ".tmp"

	// Rename the file to ComicInfo.xml for insertion into the ZIP
	tmpXmlPath := "ComicInfo.xml"
	if err := os.Rename(xmlPath, tmpXmlPath); err != nil {
		return fmt.Errorf("failed to rename XML file: %w", err)
	}
	defer os.Remove(tmpXmlPath) // Ensure the temporary XML file is deleted after operation

	// 先複製一份 zip，避免寫壞原檔
	if err := copyFile(zipPath, tmpZipPath); err != nil {
		return fmt.Errorf("failed to copy zip: %w", err)
	}

	fmt.Printf("cmd := exec.Command\n")
	// 使用 7zr 更新 ComicInfo.xml 到 zip 檔
	cmd := exec.Command("./7z/7za.exe", "u", tmpZipPath, tmpXmlPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to update zip using 7zr: %w", err)
	}
	fmt.Printf("cmd := exec.Command\n")

	// 原子替換
	if err := os.Rename(tmpZipPath, zipPath); err != nil {
		return fmt.Errorf("failed to replace original zip: %w", err)
	}

	// 刪除原本的 XML 檔案
	if err := os.Remove(xmlPath); err != nil {
		return fmt.Errorf("failed to delete original XML file: %w", err)
	}

	return nil
}

// copyFile 複製 zip 檔用
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return out.Close()
}

// GetComicInfoFromZip extracts ComicInfo.xml metadata from a ZIP file.
func GetComicInfoFromZip(zipPath string) (*Metadata, error) {
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, fmt.Errorf("無法打開 ZIP 檔案: %w", err)
	}
	defer zipReader.Close()

	for _, file := range zipReader.File {
		if strings.EqualFold(file.Name, "ComicInfo.xml") {
			fileReader, err := file.Open()
			if err != nil {
				return nil, fmt.Errorf("無法打開 ComicInfo.xml: %w", err)
			}
			defer fileReader.Close()

			var metadata Metadata
			err = xml.NewDecoder(fileReader).Decode(&metadata)
			if err != nil {
				return nil, fmt.Errorf("解析 ComicInfo.xml 失敗: %w", err)
			}
			return &metadata, nil
		}
	}

	return nil, nil // No ComicInfo.xml found
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