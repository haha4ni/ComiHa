import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import Menu from "./Menu";
import SimpleList from "./List";
import logo from "../photo.jpeg";
import {
  NowPath,
  ReadCover,
} from "../../wailsjs/go/main/App";
import ImageBoxList from "./ImageBoxList"; // Import ImageBoxList

export default function MainMode({ setMode }) {
  const [state, setState] = useState(null);
  const [currentPath, setCurrentPath] = useState(".");
  const [images, setImages] = useState([logo, logo]); // Convert images to useState

  useEffect(() => {
    ReadNowPath(); // Call ReadNowPath at the beginning
    console.log("目錄路徑currentPath", currentPath); // Log 讀取的目錄路徑
    const fullPath = `${currentPath}\\comic\\結緣甘神神社 1.zip`
    ReadImage(fullPath);
    // Add your side-effect logic here
  }, []);

  const ReadNowPath = async () => {
    try {
      const path = await NowPath();
      if (path) {
        setCurrentPath(path);
        console.log("目錄路徑", currentPath); // Log 讀取的目錄路徑
      }
    } catch (error) {
      console.error("Failed to select path:", error);
    }
  };

  const ReadImage = async (path) => {
    try {
      const img = await ReadCover(path); 
      console.log("目錄路徑fullPath", path); // Log 讀取的目錄路徑
      console.log("圖片", img); // Log 讀取的目錄路徑

      // Convert the first three FileBitmap values to base64 and add to images state
      const newImages = img.slice(0, 3).map(item => `data:image/png;base64,${item.FileBitmap}`);
      setImages(prevImages => [...prevImages, ...newImages]);

    } catch (error) {
      console.error("Failed to select path:", error);
    }
  };

  const mainContent = (
    <>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      {/* <Button variant="contained" onClick={fetchCurrentPath}>Fetch Current Path</Button> */}
      <Typography variant="body1">{currentPath}</Typography>
      <ImageBoxList images={images} />
    </>
  );

  return (
    <Box>
      <CssBaseline />
      <Menu />
      <Box sx={{ display: "flex" }}>
        <SimpleList />
        <Box
          sx={{
            bgcolor: "red",
            display: "flex",
            mt: 5,
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            height: "calc(100vh - 40px)", // 設定固定高度
            overflowY: "auto", // 讓內容超出時可滾動
          }}
        >
          {mainContent}
        </Box>
      </Box>
    </Box>
  );
}