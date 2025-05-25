import React from "react";
import { Box, Button, Slider, Tooltip } from "@mui/material";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import SwapVertIcon from "@mui/icons-material/SwapVert";

export default function BottomPopup({
  sliderValue,
  setSliderValue,
  totalPages,
  jumpToPage,
  toggleViewMode,
  viewMode,
}) {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "rgba(51, 51, 51, 0.8)",
        color: "#fff",
        padding: "20px",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {/* Page Slider */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "80%",
          justifyContent: "space-between",
        }}
      >
        <Slider
          value={sliderValue}
          min={1}
          max={totalPages}
          onChange={(e, val) => setSliderValue(val)}
          onChangeCommitted={(e, val) => jumpToPage(val - 1)}
          valueLabelDisplay="auto"
          sx={{
            width: "10%",
            flexGrow: 1,
            color: "#fff",
            "& .MuiSlider-thumb": { backgroundColor: "#fff" },
            "& .MuiSlider-track": { backgroundColor: "#fff" },
            "& .MuiSlider-rail": { backgroundColor: "#111" },
          }}
        />
        <Box
          sx={{
            marginLeft: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>
            {sliderValue} / {totalPages}
          </span>
          <Tooltip title="閱讀模式">
            <Button
              onClick={toggleViewMode}
              sx={{
                color: "#fff",
                borderColor: "#fff",
                "&:hover": { backgroundColor: "#444" },
                fontSize: "0.8rem",
                padding: "4px 8px",
              }}
            >
              {viewMode === "scroll" && <SwapVertIcon />}
              {viewMode === "two-page" && <LooksTwoIcon />}
              {viewMode === "single-page" && <LooksOneIcon />}
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <span>Popup Content</span>
    </Box>
  );
}
