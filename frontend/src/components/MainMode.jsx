import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline} from "@mui/material";
import WindowMenu from "./WindowMenu";
import SimpleList from "./List";
import Appbar from "./Appbar";

export default function MainMode() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <Box>
      <CssBaseline />
      <WindowMenu />
      <Appbar onMenuClick={handleDrawerToggle} />
      <Box sx={{ display: "flex" }}>
        <SimpleList open={drawerOpen} onToggle={handleDrawerToggle} />
        <Box
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 5,
            marginLeft: drawerOpen ? "0px" : "-240px", // Adjust margin based on drawer state
            transition: "margin-left 0.3s ease", // Smooth transition
            // bgcolor: "grey",
            // bgcolor: "white",
            display: "flex",
            mt: 6, // appbar高度
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            height: "calc(100vh - 48px)",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}