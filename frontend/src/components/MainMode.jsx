import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import Menu from "./Menu"; // Add this import

export default function MainMode({ setMode }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Add your side-effect logic here
  }, []);

  return (
    <div>
      <CssBaseline />
      <Menu />
      <Box sx={{ p: 20, bgcolor: "green" }}>
        <Typography variant="h4">Main Mode</Typography>
        {/* Add your component JSX here */}
        <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      </Box>
    </div>
  );
}