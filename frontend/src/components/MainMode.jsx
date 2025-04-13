import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Menu from "./Menu";
import SimpleList from "./List";
import ImageBoxList from "./components/ImageBoxList";

export default function MainMode() {
  const navigate = useNavigate();
  const location = useLocation();

  // const isBookInfoRoute = location.pathname.includes('/bookinfo/');

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
          <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}