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
	Metadata   Metadata    `json:"metadata"` // 書籍元數據
	ImageData  []ImageData `json:"imagedata"`
}

type ImageData struct {
	FileName  string `json:"filename"`
	FileIndex int64  `json:"fileindex"`
	FileSize  int64  `json:"size"`
}

type Page struct {
	Image       int    `xml:"Image,attr"       json:"image"`
	ImageSize   int    `xml:"ImageSize,attr"   json:"imageSize"`
	ImageWidth  int    `xml:"ImageWidth,omitempty"  json:"imageWidth"`
	ImageHeight int    `xml:"ImageHeight,omitempty" json:"imageHeight"`
	Type        string `xml:"Type,attr,omitempty"        json:"type,omitempty"`
	Comment     string `xml:"Comment,attr,omitempty"     json:"comment,omitempty"`
}

type Metadata struct {
	XMLName         xml.Name `xml:"ComicInfo"`
	Title           string   `xml:"Title"             json:"title"`
	Series          string   `xml:"Series"            json:"series"`
	Number          string   `xml:"Number"            json:"number"`
	Volume          string   `xml:"Volume"            json:"volume"`
	AlternateSeries string   `xml:"AlternateSeries"   json:"alternateSeries"`
	AlternateNumber string   `xml:"AlternateNumber"   json:"alternateNumber"`
	StoryArc        string   `xml:"StoryArc"          json:"storyArc"`
	Year            string   `xml:"Year"              json:"year"`
	Month           string   `xml:"Month"             json:"month"`
	Day             string   `xml:"Day"               json:"day"`
	SeriesGroup     string   `xml:"SeriesGroup"       json:"seriesGroup"`
	Summary         string   `xml:"Summary"           json:"summary"`
	Notes           string   `xml:"Notes"             json:"notes"`
	Writer          string   `xml:"Writer"            json:"writer"`
	Publisher       string   `xml:"Publisher"         json:"publisher"`
	Imprint         string   `xml:"Imprint"           json:"imprint"`
	Genre           string   `xml:"Genre"             json:"genre"`
	Web             string   `xml:"Web"               json:"web"`
	PageCount       int      `xml:"PageCount"         json:"pageCount"`
	LanguageISO     string   `xml:"LanguageISO"       json:"languageISO"`
	Format          string   `xml:"Format"            json:"format"`
	AgeRating       string   `xml:"AgeRating"         json:"ageRating"`
	Manga           string   `xml:"Manga"             json:"manga"`
	Characters      string   `xml:"Characters"        json:"characters"`
	Teams           string   `xml:"Teams"             json:"teams"`
	Locations       string   `xml:"Locations"         json:"locations"`
	ScanInformation string   `xml:"ScanInformation"   json:"scanInformation"`
	Pages           []Page   `xml:"Pages>Page"        json:"pages"`
}

type SeriesInfo struct {
	SeriesName string `json:"seriesname"`
	BookInfoKeys []string `json:"bookinfokeys"`
}
