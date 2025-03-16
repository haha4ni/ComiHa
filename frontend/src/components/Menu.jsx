import React from "react";
import { Box, IconButton } from "@mui/material";
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import {
    Shutdown
  } from "../../wailsjs/go/main/App";


export default function Menu() {

    // function greet() {
    //     Greet(name).then(updateResultText);
    // }

  const handleMinimize = () => {
    // Minimize window logic here
  };

  const handleFullscreen = () => {
    // Fullscreen window logic here
  };

  const handleClose = () => {
    Shutdown(); // Call the shutdown method from the Go backend
  };

  return (
    <Box sx={{ position: "fixed", top: 0, width: "100%", display: "flex", justifyContent: "flex-end", p: 0.5, bgcolor: "grey", height: 40 }}>
      <IconButton size="small" sx={{ p: 0.3 }} onClick={handleMinimize}>
        <MinimizeIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.3 }} onClick={handleFullscreen}>
        <FullscreenIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.3 }} onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
