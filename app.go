package main

import (
	"ComiHa/backend"
	"context"
	"fmt"
	"log"
)

// App struct
type App struct {
	backend.App
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.Ctx = ctx

	// Initialize database
	if err := backend.InitializeDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
