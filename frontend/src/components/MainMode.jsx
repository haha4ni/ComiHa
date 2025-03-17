import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import Menu from "./Menu";
import SimpleList from "./List";

export default function MainMode({ setMode }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Add your side-effect logic here
  }, []);

  const mainContent = (
    <Box sx={{ bgcolor: "green", display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', width: '100%' }}>
      <Typography variant="h4" sx={{ mr: 2 }}>Main Mode</Typography>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
    </Box>
  );

  return (
    <div>
      <CssBaseline />
      <Menu />

      <Box sx={{ display: 'flex', pt: 5 }}>
      <SimpleList />
      {mainContent}
      </Box>
    </div>
  );
}