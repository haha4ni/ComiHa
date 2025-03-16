package main

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Shutdown closes the application window
func (a *App) Shutdown() {
	runtime.Quit(a.ctx)
}
