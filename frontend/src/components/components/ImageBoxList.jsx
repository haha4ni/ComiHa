import React, { useState } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ScanBookAll,
  GetBookListAll,
  ReadCover,
  GetSeriesKeyListAll,
  GetSeriesListAll,
  GetSeriesInfoByKey
} from "../../../wailsjs/go/main/App";

const ImageBoxList = () => {
  const [images, setImages] = useState([]);
  const [booklist, setBooklist] = useState([]);
  const navigate = useNavigate();

  const processImages = async (booklist) => {
    for (const bookinfo of booklist) {
      try {
        const path = bookinfo.filename;
        const img = await ReadCover(path);
        const newImages = img.map(
          (item) => `data:image/png;base64,${item.FileBitmap}`
        );
        setImages((prevImages) => [...prevImages, ...newImages]);
      } catch (error) {
        console.error("Failed to process image:", error);
      }
    }
  };

  const ShowSeriesinfoList = async () => {
    const seriesList = await GetSeriesKeyListAll();
    for (const series of seriesList) {
      console.log("series", series);
        const seriesInfo = await GetSeriesInfoByKey(series);
        console.log("seriesInfo", seriesInfo.bookinfokeys);
    }
  };

  const handleGetBooks = async () => {
    await ScanBookAll();
    const booklist = await GetBookListAll();

    setBooklist(booklist);
    await processImages(booklist);
    await ShowSeriesinfoList();
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "block" }}>
        <Button variant="contained" onClick={handleGetBooks} sx={{ mb: 2 }}>
          Get Book
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              width: 215,
              textAlign: "center",
              bgcolor: "gray",
              borderRadius: "8px",
              m: 2,
            }}
          >
            <Avatar
              src={image}
              alt={`Drawer Image ${index}`}
              sx={{ width: 215, height: 320, borderRadius: "8px 8px 0 0" }}
              onClick={() => {
                const book = booklist[index];
                navigate(
                  `/bookinfo/${encodeURIComponent(book.bookname
                  )}/${encodeURIComponent(book.booknumber)}`
                );
              }}
            />
            <Typography variant="body2">
              {booklist[index]?.bookname} {booklist[index]?.booknumber}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageBoxList;
