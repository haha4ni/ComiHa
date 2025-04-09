import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Menu from "./Menu";
import SimpleList from "./List";
import ImageBoxList from "./components/ImageBoxList";
import { processImages } from "./ImageReader";
import { NowPath, ScanBookAll, GetBookListAll } from "../../wailsjs/go/main/App";
import useBookStore from "../store/useBookStore";

export default function MainMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(".");
  const [images, setImages] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const { bookinfo } = useBookStore();

  const isBookInfoRoute = location.pathname.includes('/bookinfo/');

  useEffect(() => {
    // Add your side-effect logic here
  }, []);

  const temptemp = async () => {
    await ScanBookAll();

    const booklist = await GetBookListAll();
    console.log("booklist", booklist);

    await processImages(booklist, setImages, setImageNames);
    console.log("imageNames:", imageNames);
  };

  return (
    <Box>
      <CssBaseline />
      <Menu />
      <Box sx={{ display: "flex" }}>
        <SimpleList />
        <Box
          sx={{
            bgcolor: "white",
            display: "flex",
            mt: 5,
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            height: "calc(100vh - 40px)",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <Button variant="contained" onClick={() => navigate("/book")}>
            Switch to Book Mode
          </Button>
          <Button variant="contained" onClick={temptemp}>Get Book</Button>
          <Typography variant="body1">{currentPath}</Typography>
          <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            {isBookInfoRoute ? (
              <Outlet />
            ) : (
              <ImageBoxList booklist={imageNames} images={images} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}