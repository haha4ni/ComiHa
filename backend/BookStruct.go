package backend

import (
	"encoding/xml"
)

type BookInfo struct {
	ID         uint   `gorm:"primaryKey"`
	FileName   string
	SHA        string
	Timestamp  int64
	ImageData  []ImageData `gorm:"foreignKey:BookInfoID;constraint:OnDelete:CASCADE;"` // Foreign key and cascade delete
	Metadata   Metadata    `gorm:"foreignKey:BookInfoID;constraint:OnDelete:CASCADE;"` // Foreign key and cascade delete
}

type ImageData struct {
	ID         uint   `gorm:"primaryKey"`
	BookInfoID uint   // Foreign key to BookInfo
	FileName   string
	FileIndex  int64
	FileSize   int64
}

// ComicInfo XML structure
type Metadata struct {
	ID         uint   `gorm:"primaryKey" xml:"-"`      // <-- 加 xml:"-"
	BookInfoID uint   `xml:"-"`                        // <-- 加 xml:"-"
	XMLName    xml.Name `xml:"ComicInfo" gorm:"-"` // Ignore this field for GORM
	Title           string   `xml:"Title"            `
	Series          string   `xml:"Series"           `
	Number          string   `xml:"Number"           `
	Volume          string   `xml:"Volume"           `
	AlternateSeries string   `xml:"AlternateSeries"  `
	AlternateNumber string   `xml:"AlternateNumber"  `
	StoryArc        string   `xml:"StoryArc"         `
	Year            string   `xml:"Year"             `
	Month           string   `xml:"Month"            `
	Day             string   `xml:"Day"              `
	SeriesGroup     string   `xml:"SeriesGroup"      `
	Summary         string   `xml:"Summary"          `
	Notes           string   `xml:"Notes"            `
	Writer          string   `xml:"Writer"           `
	Publisher       string   `xml:"Publisher"        `
	Imprint         string   `xml:"Imprint"          `
	Genre           string   `xml:"Genre"            `
	Web             string   `xml:"Web"              `
	PageCount       int      `xml:"PageCount"        `
	LanguageISO     string   `xml:"LanguageISO"      `
	Format          string   `xml:"Format"           `
	AgeRating       string   `xml:"AgeRating"        `
	Manga           string   `xml:"Manga"            `
	Characters      string   `xml:"Characters"       `
	Teams           string   `xml:"Teams"            `
	Locations       string   `xml:"Locations"        `
	ScanInformation string   `xml:"ScanInformation"  `
	Pages           []Page   `gorm:"foreignKey:MetadataID;constraint:OnDelete:CASCADE;"` // Define Pages as a separate table
	Count               int      `xml:"Count"`
	AlternateCount      int      `xml:"AlternateCount"`
	Penciller           string   `xml:"Penciller"`
	Inker               string   `xml:"Inker"`
	Colorist            string   `xml:"Colorist"`
	Letterer            string   `xml:"Letterer"`
	CoverArtist         string   `xml:"CoverArtist"`
	Editor              string   `xml:"Editor"`
	BlackAndWhite       string   `xml:"BlackAndWhite"`
	CommunityRating     float64  `xml:"CommunityRating"`
	MainCharacterOrTeam string   `xml:"MainCharacterOrTeam"`
	Review              string   `xml:"Review"`
}

	// AgeRatingUnknown          AgeRating = "Unknown"
	// AgeRatingAdultsOnlyPlus18 AgeRating = "Adults Only 18+"
	// AgeRatingEarlyChildhood   AgeRating = "Early Childhood"
	// AgeRatingEveryone         AgeRating = "Everyone"
	// AgeRatingEveryone10Plus   AgeRating = "Everyone 10+"
	// AgeRatingG                AgeRating = "G"
	// AgeRatingKidsToAdults     AgeRating = "Kids to Adults"
	// AgeRatingM                AgeRating = "M"
	// AgeRatingMAPlus15         AgeRating = "MA15+"
	// AgeRatingMaturePlus17     AgeRating = "Mature 17+"
	// AgeRatingPG               AgeRating = "PG"
	// AgeRatingRPlus18          AgeRating = "R18+"
	// AgeRatingPending          AgeRating = "Rating Pending"
	// AgeRatingTeen             AgeRating = "Teen"
	// AgeRatingXPlus18          AgeRating = "X18+"

type Page struct {
	ID          uint   `gorm:"primaryKey"`
	MetadataID  uint   // Foreign key to Metadata
	Image       int    `xml:"Image,attr"`
	ImageSize   int    `xml:"ImageSize,attr"`
	ImageWidth  int    `xml:"ImageWidth,omitempty"`
	ImageHeight int    `xml:"ImageHeight,omitempty"`
	Type        string `xml:"Type,attr,omitempty"`
	Comment     string `xml:"Comment,attr,omitempty"`
}

type SeriesInfo struct {
	SeriesName string `json:"seriesname"`
	Summary string `json:"seriessummary"`
	Writer string `json:"serieswriter"`
	BookInfoKeys []string `json:"bookinfokeys"`
}


//ref:https://pkg.go.dev/github.com/fmartingr/go-comicinfo/v2#section-readme