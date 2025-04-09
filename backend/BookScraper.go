package backend

import (
	"fmt"
	"log"
	"math/rand"
	"net/url"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"

	"ComiHa/backend/debug"
)

func FindBookURL(bookName string) (string, error) {
	c := colly.NewCollector()

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

	var bookURL string

	// 抓取該系列頁面上的所有書籍
	c.OnHTML(".listbox_bwmain2 a", func(e *colly.HTMLElement) {
		bookTitle := strings.TrimSpace(e.DOM.Find("h4.bookname").Text()) // 抓取書名
		href := e.Attr("href")                                           // 抓取超連結

		log.Println("找到鏈接:", href, "標題:", bookTitle)

		// 檢查書名是否包含目標編號 (targetNumber)，例如 "(6)"
		if strings.Contains(bookTitle, "("+targetNumber+")") {
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
	bookInfo.Metadata = Metadata{} // 初始化 Metadata 結構

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
				// Parse the date string
				if date, err := time.Parse("2006/01/02", value); err == nil {
					bookInfo.Metadata.Year = date.Format("2006")
					bookInfo.Metadata.Month = date.Format("01")
					bookInfo.Metadata.Day = date.Format("02")
				}
			}
		})
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
	existingBook, err := GetBookInfo(title + "_" + volume)
	if err == nil {
		debug.DebugInfo("從 BoltDB 快取讀取:", existingBook)
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
		bookInfo.Metadata = bookInfoPtr.Metadata
	}

	bookInfo.Metadata.Series = title
	bookInfo.Metadata.Number = volume

	// 存入 BoltDB
	log.Println("💾 嘗試存入 BoltDB:", bookInfo.Metadata.Series, bookInfo.Metadata.Number)
	err = AddBookInfo(bookInfo)
	if err != nil {
		log.Println("❌ 存入 BoltDB 失敗:", err)
	} else {
		log.Println("✅ 成功存入 BoltDB 快取:", bookInfo.Metadata.Series, bookInfo.Metadata.Number)
	}

	return &bookInfo, nil
}
