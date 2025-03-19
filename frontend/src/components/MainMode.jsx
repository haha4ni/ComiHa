import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Typography, Button } from "@mui/material";
import Menu from "./Menu";
import SimpleList from "./List";
import BookList from "./BookList"; // Import BookList

import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';

export default function MainMode({ setMode }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Add your side-effect logic here
  }, []);

  const mainContent = (
    <Box sx={{ bgcolor: "green", display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', width: '100%' }}>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <Button variant="contained" onClick={() => setMode('book')}>Switch to Book Mode</Button>
      <img src=".\photo.jpeg" alt="Drawer Image" style={{ width: '100%' }} />
    </Box>
  );

  return (
    <Box>
      <CssBaseline />
      <Menu />
      <Box sx={{ display: 'flex', pt: 5 }}>
      <SimpleList />
      {mainContent}
      </Box>
    </Box>
  );
}