import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, TextField } from "@mui/material";
import { ReadCover, ScraperInfo } from "../../../wailsjs/go/main/App";

export default function BookInfoPage({ bookinfo }) {
  const [bookCover, setBookCover] = useState(null);

  const handleSwitchMode = async () => {
    try {
      console.log("Current bookinfo:", bookinfo);
      const newBookInfo = await ScraperInfo(bookinfo.bookname, bookinfo.booknumber);
      console.log("New bookinfo:", newBookInfo);
    } catch (error) {
      console.error("Error fetching book info:", error);
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
        width: "100%", // ✅ 確保父容器寬度為 100%
        maxWidth: "1200px", // ✅ 可選，設置最大寬度
        margin: "0 auto", // ✅ 可選，居中對齊
      }}
    >
      <Button variant="contained" onClick={() => handleSwitchMode()}>ScraperInfo</Button>
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
              sx={{
                width: "auto", // ✅ 自動調整寬度以保持比例
                height: "50vh", // ✅ 最大高度改為視窗的一半
                borderRadius: "10px", // ✅ 設定圖片圓角
                maxWidth: "100%",
                aspectRatio: "215 / 320",
                objectFit: "cover",
                margin: "5px",
                flex: "0 0 auto", // 防止圖片被壓縮
              }}
            />
          )}
          <Box sx={{
            textAlign: "left",
            flex: "1 1 auto",
            minWidth: 0, // 防止內容溢出
            marginLeft: "10px" // 添加左邊距
          }}>
            <Typography variant="h6">{bookinfo.metadata?.title || bookinfo.bookname}</Typography>
            <Typography variant="body1">集數: {bookinfo.metadata?.volume || bookinfo.booknumber}</Typography>
            <Typography variant="body1">作者: {bookinfo.metadata?.author}</Typography>
            <Typography variant="body1">出版社: {bookinfo.metadata?.publisher}</Typography>
            <Typography variant="body1">發售日: {bookinfo.metadata?.release_date}</Typography>
            <Typography variant="body1">頁數: {bookinfo.metadata?.page_count}</Typography>
            <Typography variant="body1">EPUB格式: {bookinfo.metadata?.epub_format}</Typography>
            <Typography sx={{ mt: 2 }}>內容簡介:</Typography>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              multiline
              minRows={4}
              value={bookinfo.metadata?.description || ""}
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
          backgroundColor: "#f5f5f5", // ✅ 設定背景顏色為淺灰色
          borderRadius: "10px", // ✅ 設定圓角
          padding: 2, // ✅ 內邊距，讓內容不貼邊
          width: "100%", // ✅ 確保子容器寬度為 100%
        }}
      >
        <Typography variant="h6">{bookinfo.metadata?.title || bookinfo.bookname}</Typography>
      </Box>
    </Box>
  );
}
