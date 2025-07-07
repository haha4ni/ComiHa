import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import {
  GetBookListAll,
  GetSeriesKeyListAll,
  GetBookinfoByAndConditions,
  GetBookCoverByBookinfo,
} from "../../../wailsjs/go/main/App";

export default function ImageBoxList({ type = "default", mode = "none", boxlist: externalBoxlist = null }) {
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const imagePlaceholder = {
    bookinfo: null,
    image_cover: null,
    type: null,
  };

  const [boxlist, setBoxlist] = useState([]);

  const ShowBookinfoList = async () => {
    try {
      const booklist = await GetBookListAll();

      // 建立空結構
      const placeholders = Array(booklist.length)
        .fill(null)
        .map(() => ({
          ...imagePlaceholder,
        }));
      setBoxlist(placeholders);

      booklist.forEach(async (bookinfo, index) => {
        try {
          const img = await GetBookCoverByBookinfo(bookinfo);

          setBoxlist((prevBoxlist) => {
            const updatedBoxlist = [...prevBoxlist];
            updatedBoxlist[index] = {
              bookinfo: bookinfo,
              image_cover: img.FileString,
              type: "bookinfo",
            };
            return updatedBoxlist;
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

      // 先建立空結構
      const placeholders = Array(seriesList.length)
        .fill(null)
        .map(() => ({
          ...imagePlaceholder,
        }));
      setBoxlist(placeholders);

      seriesList.forEach(async (series, index) => {
        try {
          const bookinfo = await GetBookinfoByAndConditions({
            "metadata.series": series,
          });
          const img = await GetBookCoverByBookinfo(bookinfo);

          setBoxlist((prevBoxlist) => {
            const updatedBoxlist = [...prevBoxlist];
            updatedBoxlist[index] = {
              bookinfo: bookinfo,
              image_cover: img.FileString,
              type: "series",
            };
            return updatedBoxlist;
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
    if (mode === "none") {
      setBoxlist(externalBoxlist || []);
      return;
    }
    const handleModeChange = async () => {
      setBoxlist([]); // Reset boxlist when mode changes
      if (mode === "series") {
        await ShowSeriesinfoList();
      } else if (mode === "bookinfo") {
        await ShowBookinfoList();
      }
    };

    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as rendered
    } else {
      handleModeChange();
    }
  }, [mode, externalBoxlist]);

  return (
    type === "row" ? (
      <Box
        sx={{
          padding: 2,
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          display: "block",
          bgcolor: "#f5f5f5", // TODO
          textAlign: "left",
        }}
        onWheel={e => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            gap: 2,
          }}
        >
          {boxlist.map((item, index) => (
            <Box
              key={index}
              sx={{
                minWidth: "120px",
                maxWidth: "120px",
                textAlign: "center",
                bgcolor: "#f5f5f5",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={item?.image_cover}
                alt={`Drawer Image ${index}`}
                style={{
                  width: "100%",
                  aspectRatio: "15 / 21",
                  borderRadius: "8px 8px 0 0",
                  objectFit: "cover",
                  cursor: "pointer",
                  display: "block",
                }}
                onClick={() => {
                  if (item.type === "bookinfo" && item.bookinfo) {
                    navigate(
                      `/bookinfo/${encodeURIComponent(
                        item.bookinfo.Metadata.Series
                      )}/${encodeURIComponent(item.bookinfo.Metadata.Number)}`
                    );
                  } else if (item.type === "series" && item.bookinfo) {
                    navigate(
                      `/seriesinfo/${encodeURIComponent(
                        item.bookinfo.Metadata.Series
                      )}`
                    );
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  maxWidth: "100%",
                }}
              >
                {item.type === "bookinfo"
                  ? `${item.bookinfo?.Metadata?.Series ?? ""} ${item.bookinfo?.Metadata?.Number ?? ""}`
                  : item.type === "series"
                    ? `${item.bookinfo?.Metadata?.Series ?? ""}`
                    : ""}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    ) : (
      <Box
        sx={{
          padding: 2,
          width: "100%",
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 120px))",
          justifyContent: "start",
        }}
      >
        {boxlist.map((item, index) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              textAlign: "center",
              bgcolor: "#f5f5f5",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={item?.image_cover}
              alt={`Drawer Image ${index}`}
              style={{
                width: "100%",
                aspectRatio: "15 / 21",
                borderRadius: "8px 8px 0 0",
                objectFit: "cover",
                cursor: "pointer",
                display: "block",
              }}
              onClick={() => {
                if (item.type === "bookinfo" && item.bookinfo) {
                  navigate(
                    `/bookinfo/${encodeURIComponent(
                      item.bookinfo.Metadata.Series
                    )}/${encodeURIComponent(item.bookinfo.Metadata.Number)}`
                  );
                } else if (item.type === "series" && item.bookinfo) {
                  navigate(
                    `/seriesinfo/${encodeURIComponent(
                      item.bookinfo.Metadata.Series
                    )}`
                  );
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{
                px: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "100%",
              }}
            >
              {item.type === "bookinfo"
                ? `${item.bookinfo?.Metadata?.Series ?? ""} ${item.bookinfo?.Metadata?.Number ?? ""}`
                : item.type === "series"
                  ? `${item.bookinfo?.Metadata?.Series ?? ""}`
                  : ""}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  );
}
