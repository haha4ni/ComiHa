import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Button, Slider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetBookPage } from '../../../wailsjs/go/main/App';

export default function BookReadPage() {
  const { bookname, booknumber, page } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState({});
  const [lastLoadedPage, setLastLoadedPage] = useState(parseInt(page));
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev);
  };

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

  // Scroll to the corresponding page when the `page` parameter changes
  useEffect(() => {
    const currentPageNum = parseInt(page);
    if (pages[currentPageNum]) {
      const pageElement = document.querySelector(`[data-page="${currentPageNum}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [page, pages]);

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
      <Button onClick={togglePopup}>
        Toggle Popup
      </Button>
      {Object.entries(pages)
        .map(([pageNum, pageData]) => (
          pageData && (
            <Box
              key={pageNum}
              data-page={pageNum} // Add data attribute for scrolling
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
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
      <Box ref={observerRef} sx={{ height: '20px', width: '100%' }} />

      {/* Bottom Popup */}
      {isPopupVisible && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(51, 51, 51, 0.8)', // Semi-transparent background
            color: '#fff',
            padding: '20px',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column', // Adjust layout for Slider
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          {/* Page Slider */}
          <Slider
            defaultValue={30} // Dummy value
            aria-label="Page Slider"
            valueLabelDisplay="auto"
            sx={{
              width: '80%',
              color: '#fff',
              '& .MuiSlider-thumb': {
                backgroundColor: '#fff',
              },
              '& .MuiSlider-track': {
                backgroundColor: '#fff',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#555',
              },
            }}
          />
          <span>Popup Content</span>
          <Button
            onClick={togglePopup}
            sx={{
              color: '#fff',
              borderColor: '#fff',
              '&:hover': { backgroundColor: '#444' }
            }}
          >
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
}
