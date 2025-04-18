import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Avatar, Button, TextField } from "@mui/material";
import {
  ReadCover,
  GetBookInfoByKey,
  GetSeriesInfoByKey,
} from "../../../wailsjs/go/main/App";

export default function SeriesInfoInfoPage() {
  const [bookCover, setBookCover] = useState(null);
  const [Thumbnails, setThumbnails] = useState([]);
  const [bookinfo, setBookinfo] = useState(null);
  const [seriesinfo, setSeriesinfo] = useState(null);
  const navigate = useNavigate();
  const { seriesname, bookname, booknumber } = useParams();

  const handleGetBookPages = async () => {
    try {
        const fetchedSeriesInfo = await GetSeriesInfoByKey(seriesname);
        setSeriesinfo(fetchedSeriesInfo);
      for (const key of fetchedSeriesInfo.bookinfokeys) {
        const seriesInfoResult = await GetBookInfoByKey(key);
        console.log("@@@seriesInfoResult.filename:", seriesInfoResult.filename);
        const result = await ReadCover(seriesInfoResult.filename);
        console.log("@@@result:", result);
        setThumbnails((prevImages) => [...prevImages, ...result]);
        console.log("@@@Thumbnails:", Thumbnails);
      }
    } catch (error) {
      console.error("Error fetching book pages:", error);
    }
  };

  useEffect(() => {
    const fetchSeriesInfo = async () => {
      try {
        const seriesinfo = await GetSeriesInfoByKey(seriesname);
        const seriesInfoResult = await GetBookInfoByKey(seriesinfo.bookinfokeys[0]);
        setBookinfo(seriesInfoResult);
        if (seriesInfoResult?.filename) {
          const img = await ReadCover(seriesInfoResult.filename);
          const cover = img.map(
            (item) => `data:image/png;base64,${item.FileBitmap}`
          );
          setBookCover(cover[0]); // Assuming only one cover image is returned
        }
      } catch (error) {
        console.error("Error fetching series info:", error);
      }
    };

    fetchSeriesInfo();
  }, [seriesname]);

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
        <Avatar
          src={`data:image/png;base64,${thumbnail.FileBitmap}`}
          alt={`${index + 1}`}
          onClick={() => {
            const handleNavigation = async () => {
              const book = await GetBookInfoByKey(seriesinfo.bookinfokeys[index]);
              navigate(
                `/bookinfo/${encodeURIComponent(book.bookname)}/${encodeURIComponent(book.booknumber)}`
              );
            };
            handleNavigation();
          }}
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
        <Typography variant="caption">{seriesinfo.bookinfokeys[index]}</Typography>
      </Box>
    ));
  };

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
      <Button
        variant="contained"
        onClick={handleGetBookPages}
        sx={{ mb: 2, ml: 2 }}
      >
        GetBookPages
      </Button>

      {bookinfo && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            padding: 2,
            width: "100%",
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
                cursor: "pointer",
              }}
            />
          )}
          <Box
            sx={{
              textAlign: "left",
              flex: "1 1 auto",
              minWidth: 0,
              marginLeft: "10px",
            }}
          >
            <Typography variant="h6">
              {bookinfo.metadata?.series || bookinfo.bookname}
            </Typography>
            <Typography variant="body1">
              作者: {bookinfo.metadata?.writer}
            </Typography>
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
        <Typography variant="h6">{bookinfo?.metadata?.series}</Typography>
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
        {renderThumbnails()}
      </Box>
    </Box>
  );
}
