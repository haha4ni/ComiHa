import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetBookPage } from '../../../wailsjs/go/main/App';

export default function BookReadPage() {
  const { bookname, booknumber, page } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState({});
  const [lastLoadedPage, setLastLoadedPage] = useState(parseInt(page));
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const loadPages = useCallback(async (startPage, count = 5) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const pagesToLoad = Array.from({ length: count }, (_, i) => startPage + i);
      
      const loadedPages = await Promise.all(
        pagesToLoad.map(pageNum => 
          GetBookPage(bookname + "_" + booknumber, pageNum)
            .then(result => ({ [pageNum]: result }))
            .catch(error => {
              console.error(`Error loading page ${pageNum}:`, error);
              return { [pageNum]: null };
            })
        )
      );

      const pagesObject = loadedPages.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setPages(prev => ({ ...prev, ...pagesObject }));
      setLastLoadedPage(startPage + count - 1);
    } catch (error) {
      console.error("Error loading pages:", error);
    } finally {
      loadingRef.current = false;
    }
  }, [bookname, booknumber]);

  // Initial load
  useEffect(() => {
    const currentPageNum = parseInt(page);
    setLastLoadedPage(currentPageNum);
    loadPages(currentPageNum);
  }, [page, loadPages]);

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting) {
          loadPages(lastLoadedPage + 1);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '200px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [lastLoadedPage, loadPages]);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        padding: '20px 0'
      }}
    >
      {Object.entries(pages)
        .map(([pageNum, pageData]) => (
          pageData && (
            <Box
              key={pageNum}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <img
                src={`data:image/png;base64,${pageData.FileBitmap}`}
                alt={`Page ${pageNum}`}
                style={{
                  maxWidth: '90%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )
        ))}
      <Box ref={observerRef} sx={{ height: '20px', width: '100%' }} />
    </Box>
  );
}
