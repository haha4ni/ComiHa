import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar } from "@mui/material";
import {
  GetBookListAll,
  GetBookInfoByKey,
  GetSeriesKeyListAll,
  GetSeriesInfoByKey,
  GetBookCoverByKey
} from "../../../wailsjs/go/main/App";

export default function ImageBoxList({ mode }) {
  const [images, setImages] = useState([]);
  const [booklist, setBooklist] = useState([]);
  const [serieslist, setSerieslist] = useState([]);
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const ShowBookinfoList = async () => {
    try {
      const booklist = await GetBookListAll();
      setBooklist(booklist);

      const placeholders = Array(booklist.length).fill(null); // Initialize placeholders
      setImages(placeholders);

      booklist.forEach(async (bookinfo, index) => {
        try {
          const img = await GetBookCoverByKey(bookinfo.bookname + "_" + bookinfo.booknumber);
          const newImage = `data:image/png;base64,${img.FileBitmap}`;
          setImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages[index] = newImage; // Update the specific image
            return updatedImages;
          });
        } catch (error) {
          console.error("Failed to process image:", error);
        }
      });
    } catch (error) {
      console.error("Error in ShowBookinfoList:", error);
    }
  };

  const ShowSeriesinfoList = async () => {
    try {
      const seriesList = await GetSeriesKeyListAll();
      if (!seriesList || !Array.isArray(seriesList)) {
        console.error("Invalid series list received:", seriesList);
        return;
      }

      const placeholders = Array(seriesList.length).fill(null); // Initialize placeholders
      setImages(placeholders);

      seriesList.forEach(async (series, index) => {
        try {
          const seriesInfo = await GetSeriesInfoByKey(series);
          const bookinfo = await GetBookInfoByKey(seriesInfo.bookinfokeys[0]);
          setSerieslist((serieslist) => [...serieslist, seriesInfo]);

          const img = await GetBookCoverByKey(bookinfo.bookname + "_" + bookinfo.booknumber);
          const newImage = `data:image/png;base64,${img.FileBitmap}`;
          setImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages[index] = newImage; // Update the specific image
            return updatedImages;
          });
        } catch (error) {
          console.error("Failed to process image:", error);
        }
      });
    } catch (error) {
      console.error("Error in ShowSeriesinfoList:", error);
    }
  };

  useEffect(() => {
    const handleModeChange = async () => {
      console.log("Effect triggered due to mode change");
      setImages([]); // Reset images when mode changes
      if (mode === "series") {
        await ShowSeriesinfoList();
      } else if (mode === "bookinfo") {
        await ShowBookinfoList();
      }
    };

    if (isFirstRender.current) {
      console.log("Effect triggered when mode changes");
      isFirstRender.current = false; // Mark as rendered
    } else {
      handleModeChange();
    }
  }, [mode]);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              width: 150,
              textAlign: "center",
              bgcolor: "gray",
              borderRadius: "8px",
              m: 2,
            }}
          >
            <Avatar
              src={image}
              alt={`Drawer Image ${index}`}
              sx={{ width: "100%", height: 220, borderRadius: "8px 8px 0 0" }}
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
            <Typography variant="caption">
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
