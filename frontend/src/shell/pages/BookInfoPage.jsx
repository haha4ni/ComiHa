import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import {
  ScraperInfo,
  GetBookinfoByAndConditions,
  GetBookCoverByBookinfo,
  GetBookPageByBookinfo,
  WriteComicInfo,
  UpdateBookInfo,
} from "../../../wailsjs/go/main/App";
import SettingsIcon from "@mui/icons-material/Settings";
import bookwalker from "../../assets/images/bookwalker.jpg";

export default function BookInfoPage() {
  const navigate = useNavigate();
  const { bookname, booknumber } = useParams();

  // 此頁資訊
  const [bookinfo, setBookinfo] = useState(null);
  const [bookCover, setBookCover] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const isFirstRender = useRef(true);

  const [openSettings, setOpenSettings] = useState(false); // Added state for Dialog
  const [editableMetadata, setEditableMetadata] = useState(null); // Added state for editable metadata

  /////

  const handleScraper = async () => {
    try {
      const newBookInfo = await ScraperInfo(bookname, booknumber);
      setBookinfo(newBookInfo);
      UpdateBookInfo(newBookInfo); // Update bookinfo state with new data
    } catch (error) {
      console.error("Error fetching book info:", error);
    }
  };

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const info = await GetBookinfoByAndConditions({
          "metadata.series": bookname,
          "metadata.number": booknumber,
        });
        setBookinfo(info);
      } catch (error) {
        console.error("Error fetching book info:", error);
      }
    };

    if (isFirstRender.current) {
      console.log("First render, fetching book info...");
      fetchBookInfo();
      isFirstRender.current = false; // Set to false after the first render
    } else {
      console.log("Subsequent render, skipping fetch book info.");
    }
  }, []);

  useEffect(() => {
    if (!bookinfo) return;

    const fetchDetails = async () => {
      try {
        const img = await GetBookCoverByBookinfo(bookinfo);
        setBookCover(img.FileString);

        const size = bookinfo.ImageData?.length || 0;
        let thumbnailsArr = [];
        for (let page = 0; page < 30; page++) {
          const result = await GetBookPageByBookinfo(bookinfo, page);
          thumbnailsArr[page] = result;
        }
        setThumbnails(thumbnailsArr);

        // 設定可編輯 metadata
        if (bookinfo?.Metadata) {
          setEditableMetadata({ ...bookinfo.Metadata });
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    fetchDetails();
  }, [bookinfo]);

  const handleMetadataChange = (field, value) => {
    setEditableMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveMetadataChanges = async () => {
    const updatedBookinfo = {
      ...bookinfo,
      metadata: { ...editableMetadata },
    };

    setBookinfo(updatedBookinfo); // Update bookinfo state

    setOpenSettings(false); // Close dialog after saving

    // Wait for state update to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      await WriteComicInfo(updatedBookinfo); // Call WriteComicInfo with updated bookinfo
      console.log("Metadata saved successfully.");
    } catch (error) {
      console.error("Error saving metadata:", error);
    }
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
              mt: 2, // Top margin
              mr: 2, // Right margin
              top: 0,
              right: 0,
              zIndex: 10,
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
                position: "relative",
              }}
            >
              <Typography variant="h6">
                {bookinfo.metadata?.series || bookinfo.Metadata.Series}{" "}
                {bookinfo.metadata?.volume || bookinfo.Metadata.Number}
              </Typography>
              <Box sx={{ height: "16px" }} /> 
              <Typography
                variant="body2"
                sx={{
                  maxWidth: "90%",
                  overflow: "auto", // 超過範圍會顯示滾動條
                }}
              >
                {bookinfo.Metadata?.Summary || ""}
              </Typography>
              <Box sx={{ height: "16px" }} /> {/* Add spacing here */}
              <img
                src={bookwalker}
                alt="logo"
                style={{
                  borderRadius: "4px",
                  width: 20,
                  height: 20,
                  marginRight: 8,
                  objectFit: "contain",
                }}
              />
              <Box sx={{ height: "8px" }} /> {/* Add spacing here */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", // Responsive columns
                  gap: 2,
                  mt: 2,
                  width: "100%", // Ensure the grid spans 100% width
                  textAlign: "center", // Horizontally center the text
                  alignItems: "center", // Vertically center the text
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
                <Box>
                  <Typography variant="body2">
                    <strong>發行日</strong>
                  </Typography>
                  <Typography variant="body2">
                    {`${bookinfo.Metadata?.Year || "未知"}-${
                      bookinfo.Metadata?.Month || "未知"
                    }-${bookinfo.Metadata?.Day || "未知"}`}
                  </Typography>
                </Box>
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
                    <Typography variant="body2">
                      {bookinfo.Metadata.Tags.join(", ")}
                    </Typography>
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
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8, // Distance from the bottom
                  left: 0, // Distance from the left
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
      <Dialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        fullWidth={true} // Enable full width
        maxWidth="md" // Set maximum width to "md" (medium)
      >
        <DialogTitle>書籍資訊</DialogTitle>
        <DialogContent
          sx={{
            maxWidth: "800px", // Set a minimum width for the dialog content
          }}
        >
          {editableMetadata ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 4fr", // Two columns: label and input
                gap: 1,
              }}
            >
              {Object.keys(editableMetadata).map((key) => (
                <React.Fragment key={key}>
                  <Typography variant="body2">
                    <strong>{key}:</strong>
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={editableMetadata[key] || ""}
                    onChange={(e) => handleMetadataChange(key, e.target.value)}
                  />
                </React.Fragment>
              ))}
            </Box>
          ) : (
            <Typography variant="body2">無法取得書籍資訊。</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>取消</Button>
          <Button
            onClick={saveMetadataChanges}
            variant="contained"
            color="primary"
          >
            儲存
          </Button>
          <Button
            onClick={handleScraper}
            variant="outlined"
            color="secondary"
          >
            重新爬蟲
          </Button>
        </DialogActions>
      </Dialog>

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
        {thumbnails.map((thumbnail, index) => (
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
