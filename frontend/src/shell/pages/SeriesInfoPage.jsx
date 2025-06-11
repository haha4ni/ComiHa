import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Avatar, Tabs, Tab, Button } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  GetBookCoverByBookinfo,
  GetBookinfoByAndConditions,
  GetBookinfosByAndConditions,
} from "../../../wailsjs/go/main/App";

export default function SeriesInfoInfoPage() {
  const navigate = useNavigate();
  const { seriesname } = useParams();
  const isFirstRender = useRef(true);

  // Series related states
  const [bookinfo, setBookinfo] = useState(null);
  const [bookCover, setBookCover] = useState(null);

  // Chapter related states
  const [bookinfo_chapter, setBookinfoChapter] = useState([]);
  const [Thumbnails, setThumbnails] = useState([]);

  const [tabValue, setTabValue] = useState(0);
  const [openSettings, setOpenSettings] = useState(false); // Added state for Dialog
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (isFirstRender.current) {
      const fetchSeriesInfo = async () => {
        try {
          const seriesinfo = await GetBookinfoByAndConditions({
            "metadata.series": seriesname,
          });
          setBookinfo(seriesinfo);
          console.log("seriesinfo:", seriesinfo);

          if (seriesinfo?.FileName) {
            const img = await GetBookCoverByBookinfo(seriesinfo);
            setBookCover(img.FileString);
          }
        } catch (error) {
          console.error("Error fetching series info:", error);
        }
      };

      const fetchBookPages = async () => {
        try {
          const bookinfos = await GetBookinfosByAndConditions({
            "metadata.series": seriesname,
          });

          const thumbnails = [];
          for (const bookinfo of bookinfos) {
            const img = await GetBookCoverByBookinfo(bookinfo);
            thumbnails.push(img.FileString);
          }
          setBookinfoChapter(bookinfos);
          setThumbnails(thumbnails);
        } catch (error) {
          console.error("Error fetching book pages:", error);
        }
      };

      console.log("First render, fetching series info...");
      fetchSeriesInfo();
      fetchBookPages();
      isFirstRender.current = false;
    } else {
      console.log("Subsequent render, skipping fetch series info.");
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderThumbnails = () => {
    return Thumbnails.map((thumbnail, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <img
          src={thumbnail}
          alt={`${index + 1}`}
          onClick={() => {
            const handleNavigation = async () => {
              navigate(
                `/bookinfo/${encodeURIComponent(
                  bookinfo_chapter[index].Metadata.Series
                )}/${encodeURIComponent(bookinfo_chapter[index].Metadata.Number)}`
              );
            };
            handleNavigation();
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          // onMouseLeave={() => setHoveredIndex(null)}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            objectFit: "cover",
            cursor: "pointer",
            boxShadow: hoveredIndex === index ? "0 0 0 2px #1976d2" : undefined,
            transition: "box-shadow 0.2s",
          }}
        />
        <Typography variant="caption">{`卷 ${index + 1}`}</Typography>
      </Box>
    ));
  };

  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* 外框架永遠存在，內容根據 bookinfo 決定 */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          backgroundColor: "#f8f8f8",
          borderRadius: "10px",
          p: 2,
          mx: 2,
          my: 2,
          position: "relative",
        }}
      >
        {/* 齒輪 */}
        <Box
          sx={{
            position: "absolute",
            mt: 2,
            mr: 2,
            top: 0,
            right: 0,
            cursor: "pointer",
          }}
          onClick={() => setOpenSettings(true)}
        >
          <SettingsIcon
            fontSize="large"
            sx={{
              fontSize: 24,
              color: "#b0b0b0",
              "&:hover": {
                color: "#808080",
              },
            }}
          />
        </Box>

        {/* 內容區塊 */}
        {bookinfo ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              width: "100%",
              gap: 2,
            }}
          >
            {(bookCover || hoveredIndex !== null) && (
              <img
                src={hoveredIndex !== null ? Thumbnails[hoveredIndex] : bookCover}
                alt={`${bookinfo.bookname} cover`}
                onClick={() => navigate(`/bookinfo/${bookname}/${booknumber}/0`)}
                style={{
                  width: "auto",
                  height: "50vh",
                  borderRadius: "8px",
                  maxWidth: "100%",
                  aspectRatio: "215 / 320",
                  objectFit: "cover",
                  margin: "5px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  // transition: "box-shadow 0.2s",
                  // boxShadow: hoveredIndex !== null ? "0 0 0 4px #1976d2" : undefined,
                }}
              />
            )}
            <Box
              sx={{
                textAlign: "left",
                flex: 1, // 讓 Typography 占據剩餘空間
                minWidth: 0,
                marginLeft: "10px",
                display: "grid", // 加這行
                flexDirection: "column", // 加這行
                justifyContent: "space-between", // 加這行
              }}
            >
              <Box>
                <Typography variant="h5">
                  {bookinfo.Metadata?.Series || bookinfo.bookname}
                </Typography>
                <Typography variant="body1">{bookinfo.metadata?.writer}</Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  justifyContent: "flex-start", // Align to the left
                  alignItems: "flex-end", // Align to the bottom
                }}
              >
                內容簡介:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  maxWidth: "100%",
                  overflow: "auto", // 超過範圍會顯示滾動條
                }}
              >
                {bookinfo.Metadata?.Summary || ""}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start", // Align to the left
                  alignItems: "flex-end", // Align to the bottom
                  mt: "auto", // Push to the bottom of the container
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/bookinfo/${bookname}/${booknumber}/0`)}
                >
                  開始閱讀
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          // 載入中或無資料時顯示
          <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              載入中...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog for settings */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>設定</DialogTitle>
        <DialogContent>
          <Typography>這裡可以放一些設定項目！</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>關閉</Button>
        </DialogActions>
      </Dialog>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mt: 1,
          mx: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <Tab label="卷" />
        <Tab label="章" />
      </Tabs>
      {tabValue === 0 && (
        <Box
          sx={{
            mx: 2,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: "0 0 10px 10px",
            padding: 2,
          }}
        >
          {renderThumbnails()}
        </Box>
      )}
      {tabValue === 1 && (
        <Box
          sx={{
            mx: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "0 0 10px 10px",
            padding: 2,
          }}
        >
          <Typography variant="body1">章內容待實作</Typography>
        </Box>
      )}
    </Box>
  );
}
