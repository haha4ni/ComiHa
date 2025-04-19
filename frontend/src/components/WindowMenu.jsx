import React from "react";
import { Box, IconButton } from "@mui/material";
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { pink } from '@mui/material/colors';
import {
    Shutdown
  } from "../../wailsjs/go/main/App";

import { WindowMinimise, WindowToggleMaximise } from "../../wailsjs/runtime/runtime";

export default function WindowMenu() {
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
        zIndex: (theme) => theme.zIndex.drawer + 10 ,
        top: 0,
        width: "30%", // Change width to 50%
        right: 0, // Align to the right

        display: "flex",
        justifyContent: "flex-end",
        // bgcolor: "grey",
        height: 46,
        "--wails-draggable": "drag", // 讓整個元件可拖動
      }}
    >
      <IconButton size="small" sx={{ p: 0.1, mx: 0.5 }} onClick={handleMinimize}>
        <MinimizeIcon fontSize="small" sx={{ color: " " }} />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.1, mx: 0.5 }} onClick={handleFullscreen}>
        <FullscreenIcon fontSize="small" sx={{ color: " " }} />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.1, mx: 0.5 }} onClick={handleClose}>
        <CloseIcon fontSize="small" sx={{ color: " " }} />
      </IconButton>
    </Box>
  );
}
