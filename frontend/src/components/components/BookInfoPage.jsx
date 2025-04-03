import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { ReadCover } from "../../../wailsjs/go/main/App";

export default function BookInfoPage({ bookinfo }) {
  const [bookCover, setBookCover] = useState(null);

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
              }}
            />
          )}
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="h6">{bookinfo.bookname}</Typography>
            <Typography variant="h6">{bookinfo.booknumber}</Typography>
            <Typography variant="body1">Author: {bookinfo.author}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
