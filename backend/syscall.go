package backend

import (
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func GetFileList(dir string) ([]string, error) {
	var files []string
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".zip") {
			files = append(files, entry.Name())
		}
	}
	return files, nil
}

func (a *App) NowPath() (string, error) {
	path, err := os.Getwd()
	if err != nil {
		fmt.Println("❌ 無法取得當前目錄路徑:", err)
		return "XX", err
	}
	fmt.Println("G@當前目錄路徑:", path)
	return path, err
}

// Shutdown closes the application window
func (a *App) Shutdown() {
	runtime.Quit(a.Ctx)
}