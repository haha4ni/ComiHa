import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Button } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Chip from "@mui/material/Chip";

import {
  GetBookCoverByBookinfo,
  GetBookPageByBookinfo,
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
  const [bookinfos_volume, setBookinfosVolume] = useState([]);
  const [Thumbnails, setThumbnails] = useState([]);

  const [bookinfos_chapter, setBookinfosChapter] = useState([]);
  const [Thumbnails_chapter, setThumbnailsChapter] = useState([]);

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
          setBookinfosVolume(bookinfos);
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

  // 監聽 bookinfos_volume 變化，並 log chapters
  useEffect(() => {
    if (bookinfos_volume && bookinfos_volume.length > 0) {
      const extractChaptersFromBookinfos = async (bookinfos_volume) => {
        const chapters = [];
        const thumbnails = [];
        console.log("bookinfos_volume:", bookinfos_volume);
        for (let bookIndex = 0; bookIndex < bookinfos_volume.length; bookIndex++) {
          const bookinfo = bookinfos_volume[bookIndex];
          const pages = bookinfo.Metadata?.Pages || [];
          for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            if (typeof page.Type === "string" && page.Type.startsWith("chapter")) {
              const tokens = page.Type.split(" ");
              if (tokens.length >= 3 && tokens[0] === "chapter") {
                chapters.push({
                  index: bookIndex,
                  chapter: tokens[1],
                  chapter_name: tokens.slice(2).join(" "),
                  page: page.Image,
                });
                // 直接取得該章節的縮圖
                try {
                  const img = await GetBookPageByBookinfo(bookinfo, page.Image);
                  thumbnails.push(img);
                } catch (e) {
                  thumbnails.push(null);
                }
              }
            }
          }
        }
        setThumbnailsChapter(thumbnails);
        return chapters;
      };
      extractChaptersFromBookinfos(bookinfos_volume).then((chapters) => {
        setBookinfosChapter(chapters);
        console.log("chapters:", chapters);
      });
    }
  }, [bookinfos_volume]);

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
                  bookinfos_volume[index].Metadata.Series
                )}/${encodeURIComponent(bookinfos_volume[index].Metadata.Number)}`
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
                width: "100%",
                textAlign: "left",
                flex: "1",
                marginLeft: "10px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "50vh", // 與圖片高度一致
                minHeight: 0,
              }}
            >
              <Box>
                <Typography variant="h5">
                  {bookinfo.Metadata?.Series || bookinfo.bookname}
                </Typography>
                <Box sx={{ height: "16px" }} />
                <Typography variant="body1">{bookinfo.metadata?.writer}</Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  maxWidth: "100%",
                  overflow: "auto", // 超過範圍會顯示滾動條
                }}
              >
                {bookinfo.Metadata?.Summary || ""}
              </Typography>
              <Box sx={{ height: "8px" }} /> {/* Add spacing here */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", // Responsive columns
                  gap: 2,
                  mt: 2,
                  width: "100%", // Ensure the grid spans 100% width
                  textAlign: "center", // Horizontally center the text
                  alignItems: "start", // Vertically center the text
                  justifyContent: "center", // Optional: Center within a container
                }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>作者</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bookinfo.Metadata?.Writer || "未知"}
                  </Typography>
                </Box>
                {/* <Box>
                  <Typography variant="body2">
                    <strong>發行日</strong>
                  </Typography>
                  <Typography variant="body2">
                    {`${bookinfo.Metadata?.Year || "未知"}-${
                      bookinfo.Metadata?.Month || "未知"
                    }-${bookinfo.Metadata?.Day || "未知"}`}
                  </Typography>
                </Box> */}
                <Box>
                  <Typography variant="body2">
                    <strong>出版社</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bookinfo.Metadata?.Publisher || "未知"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>標籤</strong>
                  </Typography>
                  {bookinfo.Metadata?.Tags?.length > 0 ? (
                    (() => {
                      const tagColorMap = {
                        comic: { label: "Comic", color: "warning" },
                        doujinshi: { label: "Doujinshi", color: "error" },
                        // 可擴充更多標籤
                      };
                      // 支援陣列或字串
                      const tagsArr = Array.isArray(bookinfo.Metadata.Tags)
                        ? bookinfo.Metadata.Tags
                        : bookinfo.Metadata.Tags.split(",").map(tag => tag.trim());
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            minHeight: 32,
                          }}
                        >
                          {tagsArr.map((tag, idx) => {
                            const key = tag.toLowerCase();
                            if (tagColorMap[key]) {
                              return (
                                <Chip
                                  key={idx}
                                  label={tagColorMap[key].label}
                                  color={tagColorMap[key].color}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: "6px" }}
                                />
                              );
                            }
                            return (
                              <Chip
                                key={idx}
                                label={tag}
                                color="default"
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: "6px" }}
                              />
                            );
                          })}
                        </Box>
                      );
                    })()
                  ) : (
                    <Chip
                      label="Comic"
                      color="warning"
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: "6px" }}
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ height: "32px" }} /> {/* Add spacing here */}
              <Typography variant="body2">
                <strong>近期更新</strong>
              </Typography>
              {/* 新增：近期更新章節列表 */}
              <Box
                sx={{
                  mt: 1,
                  overflowY: "auto",
                  pr: 1, // 避免滾動條遮住內容
                }}
              >
                {bookinfos_chapter.map((chapter, idx) => {
                  const bookinfo = bookinfos_volume[chapter.index];
                  if (!bookinfo) return null;
                  return (
                    <Box
                      key={idx}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline", color: "#1976d2" },
                        mb: 0.5,
                        width: "fit-content",
                      }}
                      onClick={() =>
                        navigate(
                          `/bookinfo/${encodeURIComponent(bookinfo.Metadata.Series)}/${encodeURIComponent(bookinfo.Metadata.Number)}/${chapter.page}`
                        )
                      }
                    >
                      <Typography variant="body2">
                        {`第${chapter.chapter}話 - ${chapter.chapter_name}`}
                      </Typography>
                    </Box>
                  );
                })}
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
        <Tab label="話" />
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: "0 0 10px 10px",
            padding: 2,
          }}
        >
          {/* 章節縮圖顯示 */}
          {Thumbnails_chapter.map((thumbnail, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {thumbnail && thumbnail.FileBitmap ? (
                <img
                  src={`data:image/png;base64,${thumbnail.FileBitmap}`}
                  alt={`Chapter ${index + 1}`}
                  onClick={() => {
                    const chapter = bookinfos_chapter[index];
                    if (chapter) {
                      const bookinfo = bookinfos_volume[chapter.index];
                      if (bookinfo) {
                        navigate(
                          `/bookinfo/${encodeURIComponent(bookinfo.Metadata.Series)}/${encodeURIComponent(bookinfo.Metadata.Number)}/${chapter.page}`
                        );
                      }
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    objectFit: "cover",
                    cursor: "pointer", // 新增這行
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "120px",
                    backgroundColor: "#eee",
                    borderRadius: "8px",
                  }}
                />
              )}
              <Typography variant="caption">{`第${bookinfos_chapter[index]?.chapter}話 ${bookinfos_chapter[index]?.chapter_name}`}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
