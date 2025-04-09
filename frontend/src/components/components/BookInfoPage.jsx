import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, TextField } from "@mui/material";
import { ReadCover, ScraperInfo, GetBookPage } from "../../../wailsjs/go/main/App";
import { useNavigate, useParams } from "react-router-dom";
import useBookStore from "../../store/useBookStore";

export default function BookInfoPage() {
  const [bookCover, setBookCover] = useState(null);
  const [Thumbnails, setThumbnails] = useState([]);
  const navigate = useNavigate();
  const { bookname, booknumber } = useParams();
  const { bookinfo } = useBookStore();

  const handleSwitchMode = async () => {
    try {
      console.log("Current bookinfo:", bookinfo);
      const newBookInfo = await ScraperInfo(bookname ,booknumber);
      console.log("New bookinfo:", newBookInfo);
    } catch (error) {
      console.error("Error fetching book info:", error);
    }
  };

  const handleGetBookPages = async () => {
    try {
      const pages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const page of pages) {
        const result = await GetBookPage(bookname + "_" + booknumber, page);
        setThumbnails(prev => {
          const newThumbnails = [...prev];
          newThumbnails[page] = result;
          return newThumbnails;
        });
      }
    } catch (error) {
      console.error("Error fetching book pages:", error);
    }
  };

  useEffect(() => {
    if (bookinfo?.filename) {
      ReadCover(bookinfo.filename).then((img) => {
        const cover = img.map(
          (item) => `data:image/png;base64,${item.FileBitmap}`
        );
        setBookCover(cover[0]); // Assuming only one cover image is returned
      });
    }
  }, [bookinfo]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <Button variant="contained" onClick={() => navigate("/")} sx={{ mb: 2 }}>
        Back to Home
      </Button>
      <Button variant="contained" onClick={handleSwitchMode} sx={{ mb: 2, ml: 2 }}>
        ScraperInfo
      </Button>
      <Button variant="contained" onClick={handleGetBookPages} sx={{ mb: 2, ml: 2 }}>
        GetBookPages
      </Button>
      
      {/* <Typography variant="h4">Book Information</Typography> */}
      {/* Render bookinfo content here */}
      {bookinfo && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            backgroundColor: "#f5f5f5", // ✅ 設定背景顏色為淺灰色
            borderRadius: "10px", // ✅ 設定圓角
            padding: 2, // ✅ 內邊距，讓內容不貼邊
            width: "100%", // ✅ 確保子容器寬度為 100%
          }}
        >
          {bookCover && (
            <Avatar
              src={bookCover}
              alt={`${bookinfo.bookname} cover`}
              onClick={() => navigate(`/bookinfo/${bookname}/${booknumber}/0`)}
              sx={{
                width: "auto", // ✅ 自動調整寬度以保持比例
                height: "50vh", // ✅ 最大高度改為視窗的一半
                borderRadius: "10px", // ✅ 設定圖片圓角
                maxWidth: "100%",
                aspectRatio: "215 / 320",
                objectFit: "cover",
                margin: "5px",
                flex: "0 0 auto", // 防止圖片被壓縮
                cursor: 'pointer', // ✅ 添加指針游標樣式表示可點擊
              }}
            />
          )}
          <Box sx={{
            textAlign: "left",
            flex: "1 1 auto",
            minWidth: 0, // 防止內容溢出
            marginLeft: "10px" // 添加左邊距
          }}>
            <Typography variant="h6">{bookinfo.metadata?.series || bookinfo.bookname}</Typography>
            <Typography variant="body1">集數: {bookinfo.metadata?.volume || bookinfo.booknumber}</Typography>
            <Typography variant="body1">作者: {bookinfo.metadata?.writer}</Typography>
            <Typography variant="body1">出版社: {bookinfo.metadata?.publisher}</Typography>
            <Typography variant="body1">發售日: {`${bookinfo.metadata?.year}-${bookinfo.metadata?.month}-${bookinfo.metadata?.day}`}</Typography>
            <Typography sx={{ mt: 2 }}>內容簡介:</Typography>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              multiline
              minRows={4}
              value={bookinfo.metadata?.summary || ""}
            />
          </Box>
        </Box>
      )}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          padding: 2,
          width: "100%",
        }}
      >
        <Typography variant="h6">{bookinfo.metadata?.series || bookinfo.bookname}</Typography>
      </Box>

      {/* Thumbnails Grid */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
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
