import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  GetBookInfoByKey,
  GetSeriesInfoByKey,
  GetBookCoverByBookinfo,
} from "../../../wailsjs/go/main/App";

export default function SeriesInfoInfoPage() {
  const [bookCover, setBookCover] = useState(null);
  const [Thumbnails, setThumbnails] = useState([]);
  const [bookinfo, setBookinfo] = useState(null);
  const [seriesinfo, setSeriesinfo] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openSettings, setOpenSettings] = useState(false); // Added state for Dialog
  const navigate = useNavigate();
  const { seriesname, bookname, booknumber } = useParams();

  useEffect(() => {
    const fetchSeriesInfo = async () => {
      try {
        const seriesinfo = await GetSeriesInfoByKey(seriesname);
        const seriesInfoResult = await GetBookInfoByKey(
          seriesinfo.bookinfokeys[0]
        );
        setBookinfo(seriesInfoResult);
        if (seriesInfoResult?.filename) {
          const img = await GetBookCoverByBookinfo(seriesInfoResult);
          const cover = img.map(
            (item) => `data:image/png;base64,${item.FileBitmap}`
          );
          setBookCover(cover[0]); // Assuming only one cover image is returned
        }
      } catch (error) {
        console.error("Error fetching series info:", error);
      }
    };

    const fetchBookPages = async () => {
      try {
        const fetchedSeriesInfo = await GetSeriesInfoByKey(seriesname);
        setSeriesinfo(fetchedSeriesInfo);

        const thumbnails = [];
        for (const key of fetchedSeriesInfo.bookinfokeys) {
          const bookinfo = await GetBookInfoByKey(key);
          const img = await GetBookCoverByBookinfo(bookinfo);
          thumbnails.push(img);
        }
        setThumbnails(thumbnails);
      } catch (error) {
        console.error("Error fetching book pages:", error);
      }
    };

    fetchSeriesInfo();
    fetchBookPages();
  }, [seriesname]);

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
          // backgroundColor: "lightblue"
        }}
      >
        <Avatar
          src={`data:image/png;base64,${thumbnail.FileBitmap}`}
          alt={`${index + 1}`}
          onClick={() => {
            const handleNavigation = async () => {
              const book = await GetBookInfoByKey(
                seriesinfo.bookinfokeys[index]
              );
              navigate(
                `/bookinfo/${encodeURIComponent(
                  book.bookname
                )}/${encodeURIComponent(book.booknumber)}`
              );
            };
            handleNavigation();
          }}
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            objectFit: "cover",
            cursor: "pointer",
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
      {bookinfo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start", // 加這行
            flexWrap: "wrap",
            gap: 2,
            backgroundColor: "#f8f8f8",
            borderRadius: "10px",
            padding: 2,
            mx: 2,
            mt: 1,
            position: "relative", // Added for positioning the gear icon
          }}
        >
          {/* 齒輪 */}
          <Box
            sx={{
              position: "absolute",
              mt: 2, // Top margin
              mr: 2, // Right margin
              top: 0,
              right: 0,
              cursor: "pointer",
            }}
            onClick={() => setOpenSettings(true)} // Modified onClick
          >
            <SettingsIcon
              fontSize="large"
              sx={{
                fontSize: 24,
                color: "#b0b0b0", // Darker default color
                "&:hover": {
                  color: "#808080", // Current lighter color on hover
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {bookCover && (
              <Avatar
                src={bookCover}
                alt={`${bookinfo.bookname} cover`}
                onClick={() =>
                  navigate(`/bookinfo/${bookname}/${booknumber}/0`)
                }
                sx={{
                  width: "auto",
                  height: "calc(56vh - 48px)",
                  minHeight: "300px", // 不管怎樣最小高度是300px
                  borderRadius: "10px",
                  maxWidth: "100%",
                  aspectRatio: "215 / 320",
                  objectFit: "cover",
                  flex: "0 0 auto",
                  cursor: "pointer",
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
                  {bookinfo.metadata?.series || bookinfo.bookname}
                </Typography>
                <Typography variant="body1">
                  {bookinfo.metadata?.writer}
                </Typography>
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
                {bookinfo.metadata?.summary || ""}
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
                  onClick={() =>
                    navigate(`/bookinfo/${bookname}/${booknumber}/0`)
                  }
                >
                  開始閱讀
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

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
          borderRadius: "10px 10px 0 0", // Keep rounded corners for Tabs
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
            borderRadius: "0 0 10px 10px", // Sharp corners only at the bottom
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
            borderRadius: "0 0 10px 10px", // Sharp corners only at the bottom
            padding: 2,
          }}
        >
          <Typography variant="body1">章內容待實作</Typography>
        </Box>
      )}
    </Box>
  );
}
