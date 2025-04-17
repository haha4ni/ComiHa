package backend

import (
	"encoding/xml"
)

type BookInfo struct {
	BookName   string      `json:"bookname"`
	BookNumber string      `json:"booknumber"`
	FileName   string      `json:"filename"`
	SHA        string      `json:"sha"`
	Timestamp  int64       `json:"timestamp"`
	ImageData  []ImageData `json:"imagedata"`
	Metadata   Metadata    `json:"metadata"` // 書籍元數據
}

type ImageData struct {
	FileName  string `json:"filename"`
	FileIndex int64  `json:"fileindex"`
	FileSize  int64  `json:"size"`
}
type Metadata struct {
	XMLName         xml.Name `xml:"ComicInfo"`
	Title           string   `xml:"Title"             json:"title"`           // 暫時用不到
	Series          string   `xml:"Series"            json:"series"`          // 系列名稱（例如作品名稱）
	Number          string   `xml:"Number"            json:"number"`          // 單集編號（通常是本集是第幾話/冊）
	Volume          string   `xml:"Volume"            json:"volume"`          // 卷號（可與 Number 有區別） (manga用不到)
	AlternateSeries string   `xml:"AlternateSeries"   json:"alternateSeries"` // 系列的替代名稱（如果有）
	AlternateNumber string   `xml:"AlternateNumber"   json:"alternateNumber"` // 替代的單集編號（例如日文原版號碼）
	StoryArc        string   `xml:"StoryArc"          json:"storyArc"`        // 故事主軸名稱（如果有）
	Year            string   `xml:"Year"              json:"year"`
	Month           string   `xml:"Month"             json:"month"`
	Day             string   `xml:"Day"               json:"day"`
	SeriesGroup     string   `xml:"SeriesGroup"       json:"seriesGroup"`     // 同系列作品的群組標記
	Summary         string   `xml:"Summary"           json:"summary"`         // 劇情簡介
	Notes           string   `xml:"Notes"             json:"notes"`           // 備註說明
	Writer          string   `xml:"Writer"            json:"writer"`          // 作者（或腳本作者）
	Publisher       string   `xml:"Publisher"         json:"publisher"`       // 出版社
	Imprint         string   `xml:"Imprint"           json:"imprint"`         // 出版品牌（如少年Jump等）
	Genre           string   `xml:"Genre"             json:"genre"`           // 類型（多個可用逗號分隔，如 Action, Drama）
	Web             string   `xml:"Web"               json:"web"`             // 官方網站或相關連結
	PageCount       int      `xml:"PageCount"         json:"pageCount"`       // 頁數總數（通常是圖片頁數）
	LanguageISO     string   `xml:"LanguageISO"       json:"languageISO"`     // 語言代碼（例如 en、ja、zh 等）
	Format          string   `xml:"Format"            json:"format"`          // 書籍格式（如 Tankoubon、Webtoon 等）
	AgeRating       string   `xml:"AgeRating"         json:"ageRating"`       // 年齡分級（如 PG、18+）
	Manga           string   `xml:"Manga"             json:"manga"`           // 是否為漫畫（"Yes" 或空）
	Characters      string   `xml:"Characters"        json:"characters"`      // 登場角色（逗號分隔）
	Teams           string   `xml:"Teams"             json:"teams"`           // 團體或小隊（如果適用）
	Locations       string   `xml:"Locations"         json:"locations"`       // 地點（出現過的場景）
	ScanInformation string   `xml:"ScanInformation"   json:"scanInformation"` // 掃描相關資訊（如版本、掃圖者等）
}

type SeriesInfo struct {
	SeriesName string `json:"seriesname"`
	BookInfoKeys []string `json:"bookinfokeys"`
}
