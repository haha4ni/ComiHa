import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Button } from "@mui/material";
import {
  ScanBookAll,
  GetBookListAll,
  ReadCover,
  GetBookInfo,
  GetSeriesKeyListAll,
  GetSeriesInfoByKey
} from "../../../wailsjs/go/main/App";

const ImageBoxList = ({ mode }) => {
  const [images, setImages] = useState([]);
  const [booklist, setBooklist] = useState([]);
  const [serieslist, setSerieslist] = useState([]);
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
    try {
      const seriesList = await GetSeriesKeyListAll();
      if (!seriesList || !Array.isArray(seriesList)) {
        console.error("Invalid series list received:", seriesList);
        return;
      }
      for (const series of seriesList) {
        console.log("series", series);
        const seriesInfo = await GetSeriesInfoByKey(series);
        console.log("seriesInfo", seriesInfo.bookinfokeys);
        const bookinfo = await GetBookInfo(seriesInfo.bookinfokeys[0]);
        console.log("bookinfo", bookinfo);
        setSerieslist((serieslist) => [...serieslist, seriesInfo]);
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
    } catch (error) {
      console.error("Error in ShowSeriesinfoList:", error);
    }
  };

  const handleGetBooks = async () => {
    if (mode === "series") {
      await ShowSeriesinfoList();
    } else if (mode === "bookinfo") {
      await ScanBookAll();
      const booklist = await GetBookListAll();
      setBooklist(booklist);
      await processImages(booklist);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "block" }}>
        <Button variant="contained" onClick={handleGetBooks} sx={{ mb: 2 }}>
          {mode === "series" ? "Get Series" : "Get Book"}
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
                if (mode === "bookinfo") {
                  const book = booklist[index];
                  navigate(
                    `/bookinfo/${encodeURIComponent(book.bookname)}/${encodeURIComponent(book.booknumber)}`
                  );
                }
                else if (mode === "series") {
                  const series = serieslist[index];
                  navigate(
                    `/seriesinfo/${encodeURIComponent(series.seriesname)}`
                  );
                }
              }}
            />
            <Typography variant="body2">
              {mode === "bookinfo"
                ? `${booklist[index]?.bookname} ${booklist[index]?.booknumber}`
                : `${serieslist[index]?.seriesname}`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageBoxList;
