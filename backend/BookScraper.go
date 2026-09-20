package backend

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"

	"ComiHa/backend/debug"
)

func FindBookURL(bookName string) (string, error) {
	c := colly.NewCollector()

	c.SetCookies("https://www.bookwalker.com.tw/", []*http.Cookie{
		{Name: "session", Value: "fake_session_value"},
		{Name: "lang", Value: "zh-TW"},
	})

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		log.Println("正在訪問:", r.URL.String()) // 紀錄訪問的網址
		// r.Headers.Set("User-Agent", randomUserAgent())
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive")                               // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	// 在收到回應時印出 HTML
	c.OnResponse(func(r *colly.Response) {
		log.Println("收到 HTML，長度:", len(r.Body)) // 印出 HTML 的長度

		// 避免超出字串長度
		if len(r.Body) > 500 {
			log.Println("HTML 頭 500 字:", string(r.Body[:500]))
		} else {
			log.Println("完整 HTML:", string(r.Body))
		}
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,                                                          // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})

	// 轉換搜尋字串為 URL 格式
	query := url.QueryEscape(bookName)
	searchURL := fmt.Sprintf("https://www.bookwalker.com.tw/search?w=%s&series_display=1", query)
	log.Println("搜尋 URL:", searchURL)

	var bookURL string

	// 解析搜尋結果列表，尋找第一本書的超連結
	c.OnHTML(".bwbookitem a", func(e *colly.HTMLElement) {
		href := e.Attr("href")
		// title := e.Text
		// log.Println("找到鏈接:", href, "標題:", title)
		log.Println("找到鏈接:", href)

		if bookURL == "" { // 只抓取第一本書的網址
			bookURL = href
			log.Println("選擇的書籍網址:", bookURL)
		}
	})

	// randomDelay() // 訪問前隨機延遲

	// 開始爬取
	err := c.Visit(searchURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return "", err
	}

	// 檢查是否成功取得書籍網址
	if bookURL == "" {
		log.Println("未找到符合的書籍")
		return "", fmt.Errorf("未找到書籍: %s", bookName)
	}

	// 返回書籍的完整網址
	finalURL := "https://www.bookwalker.com.tw" + bookURL
	log.Println("最終書籍網址:", finalURL)
	return finalURL, nil
}

func FindBookDetails(seriesURL string, targetNumber string) (string, error) {
	c := colly.NewCollector()

	// 與 FindBookURL 保持相同的 cookie，可避免伺服器回傳不同視圖
	c.SetCookies("https://www.bookwalker.com.tw/", []*http.Cookie{
		{Name: "session", Value: "fake_session_value"},
		{Name: "lang", Value: "zh-TW"},
	})

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive")                               // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,                                                          // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})

	// 記錄回應內容以便 debug（檢查是否有 book_package 或 product/ 標記）
	c.OnResponse(func(r *colly.Response) {
		log.Println("FindBookDetails 收到 HTML，長度:", len(r.Body))
		if len(r.Body) > 1000 {
			log.Println("FindBookDetails HTML 頭 1000 字:", string(r.Body[:1000]))
		} else {
			log.Println("FindBookDetails HTML:", string(r.Body))
		}
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Println("FindBookDetails 請求錯誤:", r.Request.URL, err)
	})

	var bookURL string

	// 建立多種匹配正則，覆蓋常見格式：
	// (N)、（N）、第N、Vol N、V N，以及數字邊界匹配
	patterns := []*regexp.Regexp{}
	try := func(p string) { patterns = append(patterns, regexp.MustCompile(p)) }

	// 整數邊界匹配，避免把 15 當成 5
	try(`(^|[^0-9])` + regexp.QuoteMeta(targetNumber) + `([^0-9]|$)`)
	// 帶括號的常見寫法 (N)
	try(`\(` + regexp.QuoteMeta(targetNumber) + `\)`)               // (N)
	try(`（` + regexp.QuoteMeta(targetNumber) + `）`)                 // （N）全形
	// 中文常見：第N、N卷、N話
	try(`第\s*` + regexp.QuoteMeta(targetNumber))
	try(regexp.QuoteMeta(targetNumber) + `\s*(卷|話)`)                
	// 英文常見：Vol N, V N
	try(`(?i)vol\.?\s*` + regexp.QuoteMeta(targetNumber))
	try(`(?i)\bv\s*` + regexp.QuoteMeta(targetNumber) + `\b`)

	// 抓取該系列頁面上的每個書籍包裝區塊，確保可以取得標題與正確的商品連結
	c.OnHTML(".listbox_bwmain2 .book_package", func(e *colly.HTMLElement) {
		bookTitle := strings.TrimSpace(e.DOM.Find("h4.bookname").Text()) // 抓取書名（位於包塊內）

		// 優先取得指向商品頁的連結（常見 class: gtag-click），再備援到其他 a
		href := e.ChildAttr("a.gtag-click", "href")
		if href == "" {
			href = e.ChildAttr("a.bookHoverCover", "href")
		}
		if href == "" {
			href = e.ChildAttr("a", "href")
		}

		// 如果標題抓不到，回退到包塊文字
		if bookTitle == "" {
			bookTitle = strings.TrimSpace(e.Text)
		}

		log.Println("找到鏈接:", href, "標題:", bookTitle)

		matched := false

		// 常見格式：包含 (N)
		if strings.Contains(bookTitle, "("+targetNumber+")") {
			matched = true
		}

		// 嘗試所有正則模式
		if !matched {
			// 先做 normalize：把全形數字與全形括號轉成半形，並保留原始標題供備援
			normalized := bookTitle
			normalized = strings.ReplaceAll(normalized, "（", "(")
			normalized = strings.ReplaceAll(normalized, "）", ")")
			fwMap := map[rune]rune{'０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9'}
			var nb strings.Builder
			for _, r := range normalized {
				if v, ok := fwMap[r]; ok {
					nb.WriteRune(v)
				} else {
					nb.WriteRune(r)
				}
			}
			normalized = nb.String()

			for _, p := range patterns {
				if p.MatchString(bookTitle) || p.MatchString(normalized) {
					matched = true
					break
				}
			}
		}

		if matched {
			bookURL = href
			log.Println("找到符合的書籍:", bookTitle, "網址:", bookURL)
		}
	})

	// 開始抓取該系列的頁面
	err := c.Visit(seriesURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return "", err
	}

	if bookURL == "" {
		return "", fmt.Errorf("未找到符合編號 (%s) 的書籍", targetNumber)
	}

	// 返回完整書籍詳細頁面 URL
	return bookURL, nil
}

func FindBookInfo(bookURL string) (*BookInfo, error) {
	// 確保 bookURL 是完整網址
	if !strings.HasPrefix(bookURL, "http") {
		bookURL = "https://www.bookwalker.com.tw" + bookURL
	}

	fmt.Println("找到的書籍詳細頁面網址:", bookURL)

	c := colly.NewCollector()

	var bookInfo BookInfo
	bookInfo.Metadata = Metadata{}       // 初始化 Metadata 結構
	bookInfo.Metadata.LanguageISO = "zh" // 設置默認語言為中文

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive")                               // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,                                                          // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})

	// 解析書籍的詳細資訊
	c.OnHTML("#writerinfo", func(e *colly.HTMLElement) {
		// 取得所有作者
		e.ForEach(".writer_data dd a", func(i int, el *colly.HTMLElement) {
			if i > 0 {
				bookInfo.Metadata.Writer += ", " // 多個作者時用逗號分隔
			}
			bookInfo.Metadata.Writer += strings.TrimSpace(strings.ReplaceAll(el.Text, "\n", " "))
		})

		// 取得所有類型標籤
		e.ForEach(".bookinfo_more li", func(_ int, el *colly.HTMLElement) {
			label := el.ChildText("span.title")                                                               // 找到標籤名稱
			value := strings.TrimSpace(strings.ReplaceAll(strings.Replace(el.Text, label, "", 1), "\n", " ")) // 移除標籤名稱並清理換行

			switch label {
			case "類型標籤：":
				el.ForEach("a", func(_ int, tag *colly.HTMLElement) {
					bookInfo.Metadata.Genre = strings.Join(append(strings.Split(bookInfo.Metadata.Genre, ", "), tag.Text), ", ")
				})
			case "出版社：":
				bookInfo.Metadata.Publisher = value
			case "發售日：":
				// Parse the date string in format "2023年 04月 07日"
				log.Println("日期解析:", value)
				// 移除所有換行符和多余空格
				dateStr := strings.ReplaceAll(value, "\n", "")
				dateStr = strings.ReplaceAll(dateStr, " ", "")
				dateStr = strings.ReplaceAll(dateStr, "年", "-")
				dateStr = strings.ReplaceAll(dateStr, "月", "-")
				dateStr = strings.ReplaceAll(dateStr, "日", "")
				log.Println("處理後的日期字串:", dateStr)
				if date, err := time.Parse("2006-01-02", dateStr); err == nil {
					bookInfo.Metadata.Year = date.Format("2006")
					bookInfo.Metadata.Month = date.Format("01")
					bookInfo.Metadata.Day = date.Format("02")
				} else {
					log.Println("日期解析錯誤:", err)
				}
			}
		})
	})

	// 有些頁面會把資料放在 #app 的 data-page 屬性（JSON 結構），優先嘗試解析它
	c.OnHTML("#app", func(e *colly.HTMLElement) {
		raw := e.Attr("data-page")
		if raw == "" {
			return
		}

		// data-page 內會是 HTML entity encoded 的 JSON，先 unescape 再解析
		decoded := html.UnescapeString(raw)

		var doc map[string]interface{}
		if err := json.Unmarshal([]byte(decoded), &doc); err != nil {
			log.Println("解析 data-page JSON 錯誤:", err)
			return
		}

		// props -> productData
		props, _ := doc["props"].(map[string]interface{})
		if props == nil {
			return
		}

		// productData 內有 author 與 publisher
		productData, _ := props["productData"].(map[string]interface{})
		if productData != nil {
			if authors, ok := productData["author"].([]interface{}); ok && len(authors) > 0 {
				if first, ok := authors[0].(map[string]interface{}); ok {
					if name, ok := first["name"].(string); ok && name != "" {
						bookInfo.Metadata.Writer = name
					}
				}
			}

			if pub, ok := productData["publisher"].(map[string]interface{}); ok {
				if text, ok := pub["text"].(string); ok && text != "" {
					bookInfo.Metadata.Publisher = text
				}
			}

			// product_detail_info 可能包含 sell_date_start
			if detail, ok := productData["product_detail_info"].(map[string]interface{}); ok {
				if sd, ok := detail["sell_date_start"].(string); ok && sd != "" {
					// sd 可能是像 "2024年05月17日" 或帶有 escape，移除空白並轉換
					dateStr := strings.ReplaceAll(sd, " ", "")
					dateStr = strings.ReplaceAll(dateStr, "年", "-")
					dateStr = strings.ReplaceAll(dateStr, "月", "-")
					dateStr = strings.ReplaceAll(dateStr, "日", "")
					if date, err := time.Parse("2006-01-02", dateStr); err == nil {
						bookInfo.Metadata.Year = date.Format("2006")
						bookInfo.Metadata.Month = date.Format("01")
						bookInfo.Metadata.Day = date.Format("02")
					} else {
						log.Println("解析發售日失敗:", err, "輸入:", sd)
					}
				}
			}
		}
	})

	// 抓取內容簡介
	c.OnHTML(".product-introduction-container", func(e *colly.HTMLElement) {
		bookInfo.Metadata.Summary = strings.TrimSpace(e.Text)
		log.Println("內容簡介:", bookInfo.Metadata.Summary)
	})

	// 開始抓取該書籍的詳細頁面
	err := c.Visit(bookURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return nil, err
	}

	return &bookInfo, nil
}

func (a *App) ScraperInfo(title string, volume string) (*BookInfo, error) {
	debug.DebugInfo("ScraperInfo()", volume)

	var bookInfo BookInfo
	bookInfo.Metadata = Metadata{} // 初始化 Metadata 結構

	// 先嘗試從 BoltDB 讀取
	existingBook, err := GetBookinfoByAndConditions(comicDB, map[string]interface{}{
			"metadata.series": title,
			"metadata.number": volume,
		})
	if err == nil {
		debug.DebugInfo("從DB快取讀取:", existingBook)
		// 保留快取資料
		bookInfo = *existingBook
	}

	// 沒找到快取，執行爬蟲
	log.Println("開始爬取:", title, volume)

	seriesURL, err := FindBookURL(title)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("#找到的書籍網址:", seriesURL)

	fmt.Println("#查詢該系列的指定書籍:", volume)
	bookURL, err := FindBookDetails(seriesURL, volume)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("找到的書籍詳細頁面網址:", bookURL)
	bookInfoPtr, err := FindBookInfo(bookURL)
	if err != nil {
		log.Fatal(err)
	}

	// 合併新爬取的資料
	if bookInfoPtr != nil {
		// 只覆蓋非空白的資料
		if bookInfoPtr.Metadata.Writer != "" {
			bookInfo.Metadata.Writer = bookInfoPtr.Metadata.Writer
		}
		if bookInfoPtr.Metadata.Genre != "" {
			bookInfo.Metadata.Genre = bookInfoPtr.Metadata.Genre
		}
		if bookInfoPtr.Metadata.Publisher != "" {
			bookInfo.Metadata.Publisher = bookInfoPtr.Metadata.Publisher
		}
		if bookInfoPtr.Metadata.Year != "" {
			bookInfo.Metadata.Year = bookInfoPtr.Metadata.Year
		}
		if bookInfoPtr.Metadata.Month != "" {
			bookInfo.Metadata.Month = bookInfoPtr.Metadata.Month
		}
		if bookInfoPtr.Metadata.Day != "" {
			bookInfo.Metadata.Day = bookInfoPtr.Metadata.Day
		}
		if bookInfoPtr.Metadata.Summary != "" {
			bookInfo.Metadata.Summary = bookInfoPtr.Metadata.Summary
		}
	}

	bookInfo.Metadata.Series = title
	bookInfo.Metadata.Volume = volume

	WriteComicInfo(bookInfo)
	return &bookInfo, nil
}


func (a *App) WriteComicInfo(bookInfo BookInfo) {
	WriteComicInfo(bookInfo)
}

func (a *App) WriteComicInfoToZip(bookInfo BookInfo) {
	WriteComicInfoToZip(bookInfo)
}