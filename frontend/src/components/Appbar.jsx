import React from "react";
import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Appbar() {
  const handleMenuClick = () => {
    console.log("Menu icon clicked");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        sx={{
          position: "fixed",
          zIndex: (theme) => theme.zIndex.drawer + 9,
          height: "45px", // Reduced height
        }}
      >
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            ComiHa
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
