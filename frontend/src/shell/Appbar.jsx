import React from "react";
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import ArrowBackIcon
import RefreshIcon from "@mui/icons-material/Refresh"; // Import RefreshIcon
import logo from "../assets/images/appicon.png";



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
          <IconButton
            edge="start"
            aria-label="back"
            sx={{ mr: 1 }}
            onClick={() => window.history.back()} // Navigate back to the previous page
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            edge="start"
            aria-label="refresh"
            sx={{ mr: 2 }}
            onClick={() => window.location.reload()} // Refresh the current page
          >
            <RefreshIcon />
          </IconButton>
          <Typography
            variant="h7"
            color="inherit"
            component="div"
            sx={{ 
                display: "flex", 
                alignItems: "center", 
                color: 'white',
                WebkitTextStroke: '1.1px rgb(112, 112, 112)', // Add stroke to text
                fontWeight: 'bold',
                userSelect: 'none', // Prevent text selection
            }} // Align content horizontally
          >
            <Avatar
              src={logo}
              alt="logo"
              variant="square" // Use square shape
              sx={{ width: 25, height: 25, mr: 1, ml:-1 }} // Set size and margin
            />
            ComiHa
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
