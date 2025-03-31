package backend

import (
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


// Shutdown closes the application window
func (a *App) Shutdown() {
	runtime.Quit(a.Ctx)
}