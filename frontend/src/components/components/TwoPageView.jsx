import React from 'react';
import { Box } from '@mui/material';

export default function TwoPageView({ pages, pageRefs }) {
  const pagePairs = Object.entries(pages).reduce((acc, [pageNum, pageData], index, array) => {
    if (index % 2 === 0) {
      acc.push(array.slice(index, index + 2));
    }
    return acc;
  }, []);

  return (
    <>
      {pagePairs.map((pagePair, idx) => (
        <Box
          key={idx}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            gap: '20px'
          }}
        >
          {pagePair.map(([pageNum, pageData]) => (
            pageData && (
              <Box
                key={pageNum}
                data-page={pageNum}
                ref={el => pageRefs.current[pageNum] = el}
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box
                  component="img"
                  src={`data:image/png;base64,${pageData.FileBitmap}`}
                  alt={`Page ${pageNum}`}
                  sx={{
                    maxWidth: '90%',
                    height: 'auto',
                    objectFit: 'contain'
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
