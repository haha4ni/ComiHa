import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import Menu from "./Menu";
import SimpleList from "./List";
import ImageBoxList from "./components/ImageBoxList"; // Import ImageBoxList
import BookInfoPage from "./components/BookInfoPage"; // Import BookInfoPage
import { processImages } from "./ImageReader"; // Import processImages
import { NowPath, ScanBookAll, GetBookListAll } from "../../wailsjs/go/main/App";
import { ShowBookInfoContext } from "./context/ShowBookInfoContext"; // Import context

export default function MainMode({ setMode }) {
  const [currentPath, setCurrentPath] = useState(".");
  const [images, setImages] = useState([]); // Convert images to useState with an empty array
  const [imageNames, setImageNames] = useState([]); // Add imageNames state
  const [showBookInfo, setShowBookInfo] = useState(false); // Add showBookInfo state
  const [bookinfo, setBookinfo] = useState({ title: "Default Book", author: "Unknown" }); // Initialize with default values


  useEffect(() => {
    // Add your side-effect logic here
  }, []);

  const temptemp = async () => {
    await ScanBookAll();

    // const path = await NowPath();
    // if (path) {
    //   setCurrentPath(path);
    //   console.log("目錄路徑", path); // Log 讀取的目錄路徑
    // }

    // await processImages(path, setImages, setImageNames);

    const booklist = await GetBookListAll();
    console.log("booklist", booklist); // Log 讀取的目錄路徑

    // const filenames = booklist.map((book) => book.filename); // Extract filenames
    // console.log("filenames", filenames); // Log filenames array

    await processImages(booklist, setImages, setImageNames);
    console.log("imageNames:", imageNames);
  };

  return (
    <ShowBookInfoContext.Provider value={{ showBookInfo, setShowBookInfo, bookinfo, setBookinfo }}> {/* Provide context */}
      <Box>
        <CssBaseline />
        <Menu />
        <Box sx={{ display: "flex" }}>
          <SimpleList />
          <Box
            sx={{
              bgcolor: "white",
              display: "flex",
              mt: 5,
              flexWrap: "wrap",
              alignItems: "flex-start",
              alignContent: "flex-start",
              height: "calc(100vh - 40px)", // 設定固定高度
              width: "100%",
              overflowY: "auto", // 讓內容超出時可滾動
            }}
          >
            <Button variant="contained" onClick={() => setMode("book")}>
              Switch to Book Mode
            </Button>
            <Button variant="contained" onClick={temptemp}>Get Book</Button>
            <Typography variant="body1">{currentPath}</Typography>
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
              {showBookInfo ? (
                <BookInfoPage bookinfo={bookinfo} /> // Pass bookinfo to BookInfoPage
              ) : (
                <ImageBoxList booklist={imageNames} images={images} /> // Pass imageNames as booklist
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ShowBookInfoContext.Provider>
  );
}