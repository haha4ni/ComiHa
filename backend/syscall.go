package backend

import (
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Shutdown closes the application window
func (a *App) Shutdown() {
	runtime.Quit(a.Ctx)
}

// GetFileList retrieves all .zip files in the given directory (non-recursive)
func (a *App) GetFileList(dir string) ([]string, error) {
	var files []string
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".zip") {
			fmt.Println("❌ path:", entry.Name())
			files = append(files, entry.Name())
		}
	}
	return files, nil
}