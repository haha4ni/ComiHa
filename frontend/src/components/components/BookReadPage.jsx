import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Button, Slider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { GetBookPage, GetBookInfoByKey } from '../../../wailsjs/go/main/App';
import ScrollView from './ScrollView';
import TwoPageView from './TwoPageView';

export default function BookReadPage() {
  const { bookname, booknumber, page } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState({});
  const [lastLoadedPage, setLastLoadedPage] = useState(parseInt(page));
  const loadingRef = useRef(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(parseInt(page));
  const [totalPages, setTotalPages] = useState(0); // Default value
  const pageRefs = useRef({});
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' or 'two-page'

  const [isJumping, setIsJumping] = useState(false); // 新增狀態變數


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

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'scroll' ? 'two-page' : 'scroll'));
  };

  const handleLeftButtonClick = () => {
    console.log("Left button clicked");
    // Add functionality for left button click if needed
  };

  const handleCenterButtonClick = () => {
    togglePopup();
  };

  const handleRightButtonClick = () => {
    console.log("Right button clicked");
    // Add functionality for right button click if needed
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
    setIsJumping(true); // 開始跳轉，禁用 IntersectionObserver 的更新

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
    setTimeout(() => setIsJumping(false), 500); // 延遲一段時間後重新啟用更新
  };

  // Initial load
  useEffect(() => {
    const currentPageNum = parseInt(page);
    setLastLoadedPage(currentPageNum);
    loadPages(currentPageNum);
  }, [page, loadPages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumping) return; // 如果正在跳轉頁數，則不更新 sliderValue
  
        const visibleEntry = entries.find((e) => e.isIntersecting);
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
        padding: '20px 0',
        position: 'relative' // Ensure absolute children are positioned correctly
      }}
    >
      <Box
        onClick={handleLeftButtonClick}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20%',
          height: '100%',
          zIndex: 10,
        }}
      />
      <Box
        onClick={handleCenterButtonClick}
        sx={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '60%',
          height: '100%',
          zIndex: 10,
        }}
      />
      <Box
        onClick={handleRightButtonClick}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20%',
          height: '100%',
          zIndex: 10,
        }}
      />
      {viewMode === 'scroll' ? (
        <ScrollView
          pages={pages}
          pageRefs={pageRefs}
          onLoadMore={() => loadPages(lastLoadedPage + 1)}
        />
      ) : (
        <TwoPageView pages={pages} pageRefs={pageRefs} />
      )}
      {/* Bottom Popup */}
      {isPopupVisible && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(51, 51, 51, 0.8)',
            color: '#fff',
            padding: '20px',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
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
                width: '10%',
                flexGrow: 1,
                color: '#fff',
                '& .MuiSlider-thumb': { backgroundColor: '#fff' },
                '& .MuiSlider-track': { backgroundColor: '#fff' },
                '& .MuiSlider-rail': { backgroundColor: '#555' },
              }}
            />
            <Box
              sx={{
                marginLeft: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{sliderValue} / {totalPages}</span>
              <Button
                onClick={toggleViewMode}
                sx={{
                  color: '#fff',
                  borderColor: '#fff',
                  '&:hover': { backgroundColor: '#444' },
                  fontSize: '0.8rem',
                  padding: '4px 8px'
                }}
              >
                Switch
              </Button>
              <Button
                onClick={() => jumpToPage(100)}
                sx={{
                  color: '#fff',
                  borderColor: '#fff',
                  '&:hover': { backgroundColor: '#444' },
                  fontSize: '0.8rem',
                  padding: '4px 8px'
                }}
              >
                Jump
              </Button>
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
