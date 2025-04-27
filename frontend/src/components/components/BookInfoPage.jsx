import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Avatar, Button, TextField } from "@mui/material";
import { ReadCover, ScraperInfo, GetBookPage, GetBookInfoByKey } from "../../../wailsjs/go/main/App";

export default function BookInfoPage() {
  const [bookCover, setBookCover] = useState(null);
  const [Thumbnails, setThumbnails] = useState([]);
  const [bookinfo, setBookinfo] = useState(null);
  const navigate = useNavigate();
  const { bookname, booknumber } = useParams();

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
        for (let page = 0; page < size/10; page++) { // Loop dynamically based on size
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
        const bookInfoResult = await GetBookInfoByKey(bookname + "_" + booknumber);
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
      {/* <Button variant="contained" onClick={handleSwitchMode} sx={{ mb: 2, ml: 2 }}>
        ScraperInfo
      </Button> */}
      
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
          {bookCover && (
            <Avatar
              src={bookCover}
              alt={`${bookinfo.bookname} cover`}
              onClick={() => navigate(`/bookinfo/${bookname}/${booknumber}/0`)}
              sx={{
                width: "auto",
                height: "50vh",
                borderRadius: "10px",
                maxWidth: "100%",
                aspectRatio: "215 / 320",
                objectFit: "cover",
                margin: "5px",
                flex: "0 0 auto",
                cursor: 'pointer',
              }}
            />
          )}
          <Box sx={{
            textAlign: "left",
            flex: "1 1 auto",
            minWidth: 0,
            marginLeft: "10px"
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
