package backend

import (
	"archive/zip"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"os"
)

// WriteComicInfo writes the BookInfo struct to a ComicInfo.xml file
func WriteComicInfo(bookInfo BookInfo) error {
	// Marshal the XML
	xmlData, err := xml.MarshalIndent(bookInfo.Metadata, "", "  ")
	if err != nil {
		return err
	}

	// Add XML header
	xmlData = append([]byte(xml.Header), xmlData...)

	// Write to file
	filename := bookInfo.FileName + ".ComicInfo.xml"
	log.Printf("Writing ComicInfo.xml to %s", filename)
	err = os.WriteFile(filename, xmlData, 0644)
	if err != nil {
		return err
	}

	return nil
}

// WriteComicInfoToZip reads the ComicInfo.xml file and writes it to the zip file with atomic replacement and hash verification
func WriteComicInfoToZip(bookInfo BookInfo) error {
	// Read the existing ComicInfo.xml file
	xmlPath := bookInfo.FileName + ".ComicInfo.xml"
	xmlData, err := os.ReadFile(xmlPath)
	if err != nil {
		return fmt.Errorf("failed to read ComicInfo.xml: %w", err)
	}

	// Create temporary file
	tmpZipPath := bookInfo.FileName + ".tmp"
	zipPath := bookInfo.FileName

	// Open the original zip file
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return fmt.Errorf("failed to open zip file: %w", err)
	}
	defer zipReader.Close()

	// Create new zip file
	newZipFile, err := os.Create(tmpZipPath)
	if err != nil {
		return fmt.Errorf("failed to create temporary zip file: %w", err)
	}
	defer newZipFile.Close()

	// Create zip writer
	zipWriter := zip.NewWriter(newZipFile)
	defer zipWriter.Close()

	// Copy all files from original zip to new zip
	totalFiles := len(zipReader.File)
	for i, file := range zipReader.File {
		// Skip if it's already a ComicInfo.xml
		if file.Name == "ComicInfo.xml" {
			continue
		}

		log.Printf("Starting to process file: %s (%d/%d)", file.Name, i+1, totalFiles)

		// Create new file in zip
		newFile, err := zipWriter.Create(file.Name)
		if err != nil {
			log.Printf("Error creating file %s in zip: %v", file.Name, err)
			return fmt.Errorf("failed to create file in zip: %w", err)
		}

		// Open file from original zip
		fileReader, err := file.Open()
		if err != nil {
			log.Printf("Error opening file %s from zip: %v", file.Name, err)
			return fmt.Errorf("failed to open file from zip: %w", err)
		}

		// Copy file contents with progress tracking
		bytesCopied, err := io.Copy(newFile, fileReader)
		if err != nil {
			log.Printf("Error copying file %s contents: %v (copied %d bytes)", file.Name, err, bytesCopied)
			fileReader.Close()
			return fmt.Errorf("failed to copy file contents: %w", err)
		}

		// Close the file reader
		if err := fileReader.Close(); err != nil {
			log.Printf("Error closing file reader for %s: %v", file.Name, err)
			return fmt.Errorf("failed to close file reader: %w", err)
		}

		log.Printf("Successfully copied %s (%d bytes)", file.Name, bytesCopied)
	}

	// Add ComicInfo.xml to the zip
	log.Printf("Starting to add ComicInfo.xml to zip")
	comicInfoFile, err := zipWriter.Create("ComicInfo.xml")
	if err != nil {
		log.Printf("Error creating ComicInfo.xml in zip: %v", err)
		return fmt.Errorf("failed to create ComicInfo.xml in zip: %w", err)
	}
	log.Printf("Successfully created ComicInfo.xml entry in zip")

	_, err = comicInfoFile.Write(xmlData)
	if err != nil {
		log.Printf("Error writing ComicInfo.xml to zip: %v", err)
		return fmt.Errorf("failed to write ComicInfo.xml to zip: %w", err)
	}
	log.Printf("Successfully wrote ComicInfo.xml data to zip")

	// Close zip writer to ensure all data is written
	log.Printf("Closing zip writer")
	err = zipWriter.Close()
	if err != nil {
		log.Printf("Error closing zip writer: %v", err)
		return fmt.Errorf("failed to close zip writer: %w", err)
	}
	log.Printf("Successfully closed zip writer")

	// Atomically replace the original file with the new one
	log.Printf("Starting to replace %s with new version", zipPath)

	zipWriter.Close()
	newZipFile.Close()
	zipReader.Close()
	err = os.Rename(tmpZipPath, zipPath)
	if err != nil {
		// Remove temporary file if rename fails
		os.Remove(tmpZipPath)
		return fmt.Errorf("failed to replace original file: %w", err)
	}

	// Verify the file was replaced
	if _, err := os.Stat(zipPath); err == nil {
		log.Printf("Successfully replaced %s with new version", zipPath)
	} else {
		log.Printf("Warning: Could not verify replacement of %s", zipPath)
	}

	return nil
}