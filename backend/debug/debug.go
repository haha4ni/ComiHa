package debug

import (
	"fmt"
	"path"
	"runtime"
)

// DebugInfo formats and prints a message with function name, file name, and line number.
func DebugInfo(v ...interface{}) {
	_, file, lineNo, ok := runtime.Caller(1)
	if !ok {
		fmt.Println("runtime.Caller() failed")
		return
	}
	// funcName := runtime.FuncForPC(pc).Name()
	fileName := path.Base(file)
	// prefix := fmt.Sprintf("[INFO] %s:%d %s:", fileName, lineNo, funcName)
	prefix := fmt.Sprintf("[INFO] %s:%d:", fileName, lineNo)
	fmt.Println(prefix, fmt.Sprint(v...))
}

// Println is an alias for DebugInfo that prints debug information.
func Println(v ...interface{}) {
	DebugInfo(v...)
}
