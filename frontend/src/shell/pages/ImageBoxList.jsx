import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import {
  GetBookListAll,
  GetBookInfoByKey,
  GetSeriesKeyListAll,
  GetSeriesInfoByKey,
  GetBookCoverByBookinfo,
} from "../../../wailsjs/go/main/App";

export default function ImageBoxList({ mode }) {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [booklist, setBooklist] = useState([]);
  const [serieslist, setSerieslist] = useState([]);

  const isFirstRender = useRef(true);

  const ShowBookinfoList = async () => {
    try {
      const booklist = await GetBookListAll();

      setBooklist(booklist);

      const placeholders = Array(booklist.length).fill(null); // Initialize placeholders
      setImages(placeholders);

      booklist.forEach(async (bookinfo, index) => {
        try {
          const img = await GetBookCoverByBookinfo(bookinfo);
          const newImage = `data:image/jpg;base64,${img.FileBitmap}`;
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
          const img = await GetBookCoverByBookinfo(bookinfo);
          const newImage = `data:image/png;base64,${img.FileBitmap}`;

          setSerieslist((prevSerieslist) => {
            const updatedSerieslist = [...prevSerieslist];
            updatedSerieslist[index] = seriesInfo; // Update the specific series
            return updatedSerieslist;
          });

          setImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages[index] = newImage; // Update the specific image
            return updatedImages;
          });
        } catch (error) {
          console.error("Failed to process series:", error);
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
    <Box
      sx={{
        padding: 2,
        width: "100%",
        display: "grid", // 使用 grid 排版
        gap: 2, // 間距
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      }}
    >
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            width: "100%",
            textAlign: "center",
            bgcolor: "#f5f5f5",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column", // Stack image and text vertically
            alignItems: "center", // Center align content
          }}
        >
          <img
            src={image}
            alt={`Drawer Image ${index}`}
            style={{
              width: "100%",
              aspectRatio: "15 / 21", // Maintain a 16:9 aspect ratio
              borderRadius: "8px 8px 0 0",
              objectFit: "cover",
              cursor: "pointer",
              display: "block",
            }}
            onClick={() => {
              if (mode === "bookinfo") {
                navigate(
                  `/bookinfo/${encodeURIComponent(
                    booklist[index].Metadata.Series
                  )}/${encodeURIComponent(booklist[index].Metadata.Number)}`
                );
              } else if (mode === "series") {
                const series = serieslist[index];
                navigate(
                  `/seriesinfo/${encodeURIComponent(series.seriesname)}`
                );
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              px: 1,
              whiteSpace: "nowrap", // 強制單行顯示
              overflow: "hidden", // 隱藏超出部分
              textOverflow: "ellipsis", // 用點點點表示超出部分
              display: "block", // 確保是塊級元素
              maxWidth: "100%", // 限制寬度
            }}
          >
            {mode === "bookinfo"
              ? `${booklist[index]?.Metadata.Series} ${booklist[index]?.Metadata.Number}`
              : `${serieslist[index]?.seriesname}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
