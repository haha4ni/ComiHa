import React from "react";
import { Box } from "@mui/material";

export default function OverlayButtons({
  scrollY,
  handleLeftButtonClick,
  handleCenterButtonClick,
  handleRightButtonClick,
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: scrollY,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        display: "flex",
        pointerEvents: "none",
      }}
    >
      <Box
        onClick={handleLeftButtonClick}
        sx={{ width: "20%", height: "100%", pointerEvents: "auto" }}
      />
      <Box
        onClick={handleCenterButtonClick}
        sx={{ width: "60%", height: "100%", pointerEvents: "auto" }}
      />
      <Box
        onClick={handleRightButtonClick}
        sx={{ width: "20%", height: "100%", pointerEvents: "auto" }}
      />
    </Box>
  );
}
