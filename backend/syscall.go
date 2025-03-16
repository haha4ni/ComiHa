package backend

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Shutdown closes the application window
func (a *App) Shutdown() {
	runtime.Quit(a.Ctx)
}

func SetWindowPosition(ctx context.Context, x int, y int) {
    runtime.WindowSetPosition(ctx, x, y)
}