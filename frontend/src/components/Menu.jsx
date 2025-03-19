import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import {
    Shutdown
  } from "../../wailsjs/go/main/App";

import { WindowMinimise, WindowToggleMaximise } from "../../wailsjs/runtime/runtime";

export default function Menu() {
  const handleMinimize = () => {
    WindowMinimise(); // 最小化窗口
  };

  const handleFullscreen = () => {
    WindowToggleMaximise(); // 切換最大化/還原
  };
  
  const handleClose = () => {
    Shutdown(); // Call the shutdown method from the Go backend
  };

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: (theme) => theme.zIndex.drawer + 1 ,
        top: 0,
        width: "100%",

        display: "flex",
        justifyContent: "flex-end",
        bgcolor: "grey",
        height: 40,
        "--wails-draggable": "drag", // 讓整個元件可拖動
      }}
    >
      <IconButton size="small" sx={{ p: 0.3, mx: 0.5 }} onClick={handleMinimize}>
        <MinimizeIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.3, mx: 0.5 }} onClick={handleFullscreen}>
        <FullscreenIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.3, mx: 0.5 }} onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
