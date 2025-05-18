import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Button, Slider, Tooltip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { GetBookPage, GetBookinfoByAndConditions } from "../../../wailsjs/go/main/App";
import ScrollView from "./ScrollView";
import PageView from "./PageView";
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import SwapVertIcon from '@mui/icons-material/SwapVert';

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
  const [viewMode, setViewMode] = useState("scroll"); // 'scroll', 'two-page', or 'single-page'

  const [isJumping, setIsJumping] = useState(false); // 新增狀態變數

  const parentRef = useRef(null);
  const [scrollY, setScrollY] = useState(0); // 修改為 scrollY

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const bookinfo = await GetBookinfoByAndConditions(bookname, booknumber);
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
    setViewMode((prev) => {
      if (prev === "scroll") return "two-page";
      if (prev === "two-page") return "single-page";
      return "scroll";
    });
  };

  const handleLeftButtonClick = () => {
    console.log("Left button clicked");
    const nextPage = Math.min(sliderValue + 1, totalPages); // Ensure it doesn't exceed totalPages
    setSliderValue(nextPage);
    jumpToPage(nextPage - 1); // Map sliderValue to image index (nextPage - 1)
  };

  const handleCenterButtonClick = () => {
    togglePopup();
  };

  const handleRightButtonClick = () => {
    console.log("Right button clicked");
    const prevPage = Math.max(sliderValue - 1, 1); // Ensure it doesn't go below 1
    setSliderValue(prevPage);
    jumpToPage(prevPage - 1); // Map sliderValue to image index (prevPage - 1)
  };

  const loadPages = useCallback(
    async (startPage, count = 5) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const pagesToLoad = Array.from(
          { length: count },
          (_, i) => startPage + i
        ).filter((pn) => !pages.hasOwnProperty(pn));

        const loadedPages = await Promise.all(
          pagesToLoad.map((pageNum) =>
            GetBookPage(bookname + "_" + booknumber, pageNum)
              .then((result) => ({ [pageNum]: result }))
              .catch((error) => {
                console.error(`Error loading page ${pageNum}:`, error);
                return { [pageNum]: null };
              })
          )
        );

        const pagesObject = loadedPages.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );
        setPages((prev) => ({ ...prev, ...pagesObject }));
        setLastLoadedPage(startPage + count - 1);
      } catch (error) {
        console.error("Error loading pages:", error);
      } finally {
        loadingRef.current = false;
      }
    },
    [bookname, booknumber]
  );

  const jumpToPage = async (pageNumber) => {
    console.log(`Attempting to jump to page ${pageNumber}`);
    setIsJumping(true); // 開始跳轉，禁用 IntersectionObserver 的更新

    let pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
    if (pageElement) {
      console.log(`Page ${pageNumber} found, scrolling into view.`);
      await loadPages(pageNumber, 2);
      pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      console.log(`Page ${pageNumber} not found, loading page.`);
      await loadPages(pageNumber, 2);

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      pageElement = document.querySelector(`[data-page="${pageNumber}"]`);
      if (pageElement) {
        console.log(`Page ${pageNumber} loaded, scrolling into view.`);
        pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
          setSliderValue(currentPage + 1);
        }
      },
      {
        threshold: 0.6,
      }
    );

    Object.values(pageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages]);

  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        setScrollY(parentRef.current.scrollTop); // 修改為 scrollTop
      }
    };

    const parentElement = parentRef.current;
    if (parentElement) {
      parentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (parentElement) {
        parentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <Box
    ref={parentRef}
      sx={{
        width: "100%",
        maxHeight: "calc(100vh - 40px)",
        backgroundColor: "#123456",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        position: "relative", // Ensure absolute children are positioned correctly
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: scrollY, // 將 scrollY 值應用到 top
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          display: "flex",
          pointerEvents: "none", // 讓內層可點擊，其餘透明
        }}
      >
        <Box
          onClick={handleLeftButtonClick}
          sx={{ width: "20%", height: "100%", pointerEvents: "auto" }}
        />
        <Box
          onClick={handleCenterButtonClick}
          sx={{ width: "60%", height: "100%", pointerEvents: "auto" }}
        />
        <Box
          onClick={handleRightButtonClick}
          sx={{ width: "20%", height: "100%", pointerEvents: "auto" }}
        />
      </Box>
      {viewMode === "scroll" ? (
        <ScrollView
          pages={pages}
          pageRefs={pageRefs}
          onLoadMore={() => loadPages(lastLoadedPage + 1)}
        />
      ) : viewMode === "two-page" ? (
        <PageView
          pages={pages}
          pageRefs={pageRefs}
          sliderValue={sliderValue}
          mode="two-page"
        />
      ) : (
        <PageView
          pages={pages}
          pageRefs={pageRefs}
          sliderValue={sliderValue}
          mode="single-page"
        />
      )}
      {/* Bottom Popup */}
      {isPopupVisible && (
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
              value={sliderValue} // Keep sliderValue as is since it starts from 1
              min={1} // Minimum value starts from 1
              max={totalPages} // Maximum value matches totalPages
              onChange={(e, val) => setSliderValue(val)} // Update sliderValue directly
              onChangeCommitted={(e, val) => jumpToPage(val - 1)} // Map sliderValue to image index (val - 1)
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
      )}
    </Box>
  );
}
