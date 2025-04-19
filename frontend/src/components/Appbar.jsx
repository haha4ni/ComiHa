import React from "react";
import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Appbar({ onMenuClick }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        color="default" // Set AppBar to white
        elevation={0} // Remove shadow
        sx={{
          position: "fixed",
          zIndex: (theme) => theme.zIndex.drawer + 9,
          height: "45px", // Reduced height
        }}
      >
        <Toolbar variant="dense" >
          <IconButton
            edge="start"
            aria-label="menu"
            sx={{ ml: -2,mr: 2}}
            onClick={onMenuClick} // Use the passed prop
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
