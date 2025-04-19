import React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline} from "@mui/material";
import WindowMenu from "./WindowMenu";
import SimpleList from "./List";
import Appbar from "./Appbar";

export default function MainMode() {
  return (
    <Box>
      <CssBaseline />
      <WindowMenu />
      <Appbar />
      <Box sx={{ display: "flex" }}>
        <SimpleList />
        <Box
          sx={{
            bgcolor: "white",
            display: "flex",
            mt: 5, // appbar高度
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            height: "calc(100vh - 40px)",
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