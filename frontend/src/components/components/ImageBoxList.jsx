import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar } from "@mui/material";
import {
  ScanBookAll,
  GetBookListAll,
  ReadCover,
  GetBookInfoByKey,
  GetSeriesKeyListAll,
  GetSeriesInfoByKey
} from "../../../wailsjs/go/main/App";

export default function ImageBoxList({ mode }) {
  const [images, setImages] = useState([]);
  const [booklist, setBooklist] = useState([]);
  const [serieslist, setSerieslist] = useState([]);
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const handleModeChange = async () => {
      console.log("Effect triggered due to mode change");
      setImages([]); // Reset images when mode changes
      if (mode === "series") {
        await ShowSeriesinfoList();
      } else if (mode === "bookinfo") {
        const booklist = await GetBookListAll();
        setBooklist(booklist);
        await processImages(booklist);
      }
    };

    if (isFirstRender.current) {
      console.log("Effect triggered when mode changes");
      isFirstRender.current = false; // Mark as rendered
    } else {
      handleModeChange();
    }
  }, [mode]);

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
        const seriesInfo = await GetSeriesInfoByKey(series);
        const bookinfo = await GetBookInfoByKey(seriesInfo.bookinfokeys[0]);
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
    await ScanBookAll();
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
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
}
