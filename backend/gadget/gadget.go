package gadget

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"regexp"
	"strconv"
)

// GenerateSHA256 generates a SHA256 hash for the given file
func GenerateSHA256(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// NaturalLess compares strings in a natural way, handling numbers properly
func NaturalLess(a, b string) bool {
	re := regexp.MustCompile(`\d+`)
	aMatches := re.FindAllString(a, -1)
	bMatches := re.FindAllString(b, -1)

	for i := 0; i < len(aMatches) && i < len(bMatches); i++ {
		aNum, _ := strconv.Atoi(aMatches[i])
		bNum, _ := strconv.Atoi(bMatches[i])
		if aNum != bNum {
			return aNum < bNum
		}
	}
	return a < b
}
