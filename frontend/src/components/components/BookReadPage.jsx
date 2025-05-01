import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Button, Slider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetBookPage, GetBookInfoByKey } from '../../../wailsjs/go/main/App';

export default function BookReadPage() {
  const { bookname, booknumber, page } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState({});
  const [lastLoadedPage, setLastLoadedPage] = useState(parseInt(page));
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(parseInt(page));
  const [totalPages, setTotalPages] = useState(0); // Default value
  const pageRefs = useRef({});

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const bookinfo = await GetBookInfoByKey(bookname + "_" + booknumber);
        console.log("New bookinfo:", bookinfo.imagedata);
        const size = bookinfo.imagedata?.length || 0;
        setTotalPages(size);
      } catch (error) {
        console.error("Error fetching book info:", error);
      }
    };

    fetchBookInfo();
  }, [bookname, booknumber]);

  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev);
  };

  const loadPages = useCallback(async (startPage, count = 5) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const pagesToLoad = Array.from({ length: count }, (_, i) => startPage + i)
  .filter(pn => !pages.hasOwnProperty(pn));
      
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

  const jumpToPage = async (pageNumber) => {
    console.log(`Attempting to jump to page ${pageNumber}`);
    let pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (pageElement) {
      console.log(`Page ${pageNumber} found, scrolling into view.`);
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log(`Page ${pageNumber} not found, loading page.`);
      await loadPages(pageNumber, 1);

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
      if (pageElement) {
        console.log(`Page ${pageNumber} loaded, scrolling into view.`);
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.error(`Page ${pageNumber} could not be loaded.`);
      }
    }
  };

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
        threshold: 1,
        rootMargin: '500px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [lastLoadedPage, loadPages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries.find(e => e.isIntersecting);
      if (visibleEntry) {
        const currentPage = parseInt(visibleEntry.target.dataset.page);
        setSliderValue(currentPage);
      }
    }, {
      threshold: 0.6
    });
  
    Object.values(pageRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });
  
    return () => observer.disconnect();
  }, [pages]);
  

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
      <Button onClick={() => jumpToPage(100)}>
        Jump to Page 10
      </Button>
      {Object.entries(pages)
        .map(([pageNum, pageData]) => (
          pageData && (
            <Box
              key={pageNum}
              data-page={pageNum} // Add data attribute for scrolling
              ref={el => pageRefs.current[pageNum] = el} // 記錄每個頁的元素
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
          <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'space-between'
  }}
>
<Slider
    value={sliderValue}
    min={1}
    max={totalPages}
    onChange={(e, val) => setSliderValue(val)}
    onChangeCommitted={(e, val) => jumpToPage(val)}
    valueLabelDisplay="auto"
    sx={{
      flexGrow: 1,
      color: '#fff',
      '& .MuiSlider-thumb': { backgroundColor: '#fff' },
      '& .MuiSlider-track': { backgroundColor: '#fff' },
      '& .MuiSlider-rail': { backgroundColor: '#555' },
    }}
  />
            <Box sx={{ marginLeft: '16px', minWidth: '80px', textAlign: 'right' }}>
    <span>{sliderValue} / {totalPages}</span>
  </Box>
          </Box>
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
