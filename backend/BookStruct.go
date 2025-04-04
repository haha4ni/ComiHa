package backend

type ImageData struct {
	FileName  string `json:"filename"`
	FileIndex int64  `json:"fileindex"`
	FileSize  int64  `json:"size"`
}
type Metadata struct {
	Title       string   `json:"title"`        // 書籍標題
	Volume      string   `json:"volume"`       // 卷數或集數
	Author      string   `json:"author"`       // 作者
	Tags        []string `json:"tags"`         // 標籤
	Publisher   string   `json:"publisher"`    // 出版社
	ReleaseDate string   `json:"release_date"` // 發行日期
	PageCount   string   `json:"page_count"`   // 頁數
	EPUBFormat  string   `json:"epub_format"`  // EPUB 格式
	Description string   `json:"description"`  // 書籍描述
}

type BookInfo struct {
	BookName   string      `json:"bookname"`
	BookNumber string      `json:"booknumber"`
	FileName   string      `json:"filename"`
	SHA        string      `json:"sha"`
	Timestamp  int64       `json:"timestamp"`
	ImageData  []ImageData `json:"imagedata"`
	Metadata   Metadata    `json:"metadata"` // 書籍元數據
}