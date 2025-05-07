import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import {
  ReadCover,
  ScraperInfo,
  GetBookPage,
  GetBookInfoByKey,
} from "../../../wailsjs/go/main/App";
import SettingsIcon from "@mui/icons-material/Settings";

export default function BookInfoPage() {
  const navigate = useNavigate();
  const { bookname, booknumber } = useParams();

  const [bookCover, setBookCover] = useState(null);
  const [Thumbnails, setThumbnails] = useState([]);
  const [bookinfo, setBookinfo] = useState(null);

  const handleSwitchMode = async () => {
    try {
      const newBookInfo = await ScraperInfo(bookname, booknumber);
      console.log("New bookinfo:", newBookInfo);
      setBookinfo(newBookInfo);
    } catch (error) {
      console.error("Error fetching book info:", error);
    }
  };

  useEffect(() => {
    const fetchBookPages = async () => {
      try {
        const bookinfo = await GetBookInfoByKey(bookname + "_" + booknumber);
        console.log("New bookinfo:", bookinfo.imagedata);
        const size = bookinfo.imagedata?.length || 0; // Retrieve the size using the array length
        console.log("New bookinfo:", size);
        for (let page = 0; page < size / 100; page++) {
          // Loop dynamically based on size
          const result = await GetBookPage(bookname + "_" + booknumber, page);
          setThumbnails((prevThumbnails) => {
            const updatedThumbnails = [...prevThumbnails];
            updatedThumbnails[page] = result;
            return updatedThumbnails;
          });
        }
      } catch (error) {
        console.error("Error fetching book pages:", error);
      }
    };

    fetchBookPages();
  }, [bookname, booknumber]);

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const bookInfoResult = await GetBookInfoByKey(
          bookname + "_" + booknumber
        );
        setBookinfo(bookInfoResult);
        if (bookInfoResult?.filename) {
          const img = await ReadCover(bookInfoResult.filename);
          const cover = img.map(
            (item) => `data:image/png;base64,${item.FileBitmap}`
          );
          setBookCover(cover[0]); // Assuming only one cover image is returned
        }
      } catch (error) {
        console.error("Error fetching book info:", error);
      }
    };

    fetchBookInfo();
  }, [bookname, booknumber]);

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
            mb: 2,
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
              width: "100%",
              gap: 2,
            }}
          >
            {bookCover && (
              <img
                src={bookCover}
                alt={`${bookinfo.bookname} cover`}
                onClick={() =>
                  navigate(`/bookinfo/${bookname}/${booknumber}/0`)
                }
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
                }}
              />
            )}
            <Box
              sx={{
                width: "100%",
                textAlign: "left",
                flex: "1",
                marginLeft: "10px",
              }}
            >
              <Typography variant="h6">
                {bookinfo.metadata?.series || bookinfo.bookname}{" "}
                {bookinfo.metadata?.volume || bookinfo.booknumber}
              </Typography>
              <Box sx={{ height: "16px" }} /> {/* Add spacing here */}
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
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", // Responsive columns
                  gap: 2,
                  mt: 2,
                  width: "100%", // Ensure the grid spans 100% width
                }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>作者:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bookinfo.metadata?.writer || "未知"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>發行時間:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {`${bookinfo.metadata?.year || "未知"}-${
                      bookinfo.metadata?.month || "未知"
                    }-${bookinfo.metadata?.day || "未知"}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>出版社:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bookinfo.metadata?.publisher || "未知"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>標籤:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bookinfo.metadata?.tags?.join(", ") ||               <Chip
                label="Comic"
                color="warning"
                size="small"
                variant="outlined"
                sx={{ borderRadius: "6px" }}
              />}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Thumbnails Grid */}
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
        {Thumbnails.map((thumbnail, index) => (
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
              src={`data:image/png;base64,${thumbnail.FileBitmap}`}
              alt={`Page ${index + 1}`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <Typography variant="caption">Page {index + 1}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
