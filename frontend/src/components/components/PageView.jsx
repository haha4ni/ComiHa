import React from 'react';
import { Box } from '@mui/material';

export default function PageView({ pages, pageRefs, sliderValue, mode }) {
  const pagePairs = mode === 'single-page'
    ? [[sliderValue - 1].filter(pageNum => pages[pageNum])] // Single page mode
    : sliderValue === 1
      ? [[0]] // Only show the first page if it's the first page
      : [[sliderValue - 1, sliderValue].filter(pageNum => pages[pageNum])]; // Two-page mode

  return (
    <>
      {pagePairs.map((pagePair, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            justifyContent: 'center', // Center for single-page
            alignItems: 'center', // Vertically center content
            flexWrap: "nowrap",
            position: "relative",
            backgroundColor: '#11119a',
            height: '100vh', // Ensure the container takes full viewport height
          }}
        >
          {pagePair.reverse().map((pageNum, index) => ( // Reverse order for right-to-left
            pages[pageNum] && (
              <Box
                key={pageNum}
                data-page={pageNum}
                ref={el => pageRefs.current[pageNum] = el}
                sx={{
                  maxWidth: mode === 'single-page' ? '100%' : '50%', // Limit width to 50% for two-page mode
                  backgroundColor: '#9aFFFF',
                  display: 'flex', // Ensure image scaling follows this Box
                  justifyContent: 'center', // Center the image within the Box
                  alignItems: 'center',
                }}
              >
                  <Box
                    component="img"
                    src={`data:image/png;base64,${pages[pageNum].FileBitmap}`}
                    alt={`Page ${pageNum}`}
                    sx={{
                      width: '100%', // Scale image to fit within the Box
                      height: 'auto', // Maintain aspect ratio
                      maxHeight: '100vh', // Ensure the image height does not exceed the viewport
                    }}
                  />
                
              </Box>
            )
          ))}
        </Box>
      ))}
    </>
  );
}
