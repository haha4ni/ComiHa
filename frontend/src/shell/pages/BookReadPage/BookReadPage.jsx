import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import {
  GetBookPageByBookinfo,
  GetBookinfoByAndConditions,
} from "../../../../wailsjs/go/main/App";
import ScrollView from "./ScrollView";
import PageView from "./PageView";
import BottomPopup from "./BottomPopup";
import OverlayButtons from "./OverlayButtons";

export default function BookReadPage() {
  const { bookname, booknumber, page } = useParams();
  const [pages, setPages] = useState({});
  const [lastLoadedPage, setLastLoadedPage] = useState(parseInt(page));
  const loadingRef = useRef(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(parseInt(page));

  const pageRefs = useRef({});
  const [viewMode, setViewMode] = useState("scroll"); // 'scroll', 'two-page', or 'single-page'

  const [isJumping, setIsJumping] = useState(false); // 新增狀態變數

  const parentRef = useRef(null);
  const [scrollY, setScrollY] = useState(0); // 修改為 scrollY

  const [bookinfo, setBookinfo] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        console.log("Fetching book info for:", bookname, booknumber);
        const info = await GetBookinfoByAndConditions({
          "metadata.series": bookname,
          "metadata.number": booknumber,
        });
        setBookinfo(info);
        const size = info?.ImageData?.length || 0;
        setTotalPages(size);
      } catch (error) {
        console.error("Error fetching book info:", error);
      }
    };

    fetchBookInfo();
  }, [bookname, booknumber]);

  const loadPages = useCallback(
    async (startPage, count = 5) => {
      console.log("Right button clicked");
      if (!bookinfo || !totalPages) return;
      if (loadingRef.current) return;
      console.log("Right button clicked~~~");
      loadingRef.current = true;

      try {
        const pagesToLoad = Array.from(
          { length: count },
          (_, i) => startPage + i
        ).filter((pn) => !pages.hasOwnProperty(pn));

        const loadedPages = await Promise.all(
          pagesToLoad.map((pageNum) =>
            GetBookPageByBookinfo(bookinfo, pageNum)
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
    [bookinfo]
  );

  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "scroll") {
        setScrollY(0);
        return "two-page";
      }
      if (prev === "two-page") {
        setScrollY(0);
        return "single-page";
      }
      if (prev === "single-page") {
        // 跳回 scroll mode 時跳轉到對應頁數
        setTimeout(() => {
          jumpToPage(sliderValue - 1);
        }, 0);
        return "scroll";
      }
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
        setScrollY(parentRef.current.scrollTop);
      }
    };

    const parentElement = parentRef.current;
    if (parentElement) {
      parentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (parentElement) {
        parentElement.removeEventListener("scroll", handleScroll);
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
      <OverlayButtons
        scrollY={scrollY}
        handleLeftButtonClick={handleLeftButtonClick}
        handleCenterButtonClick={handleCenterButtonClick}
        handleRightButtonClick={handleRightButtonClick}
      />
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
        <BottomPopup
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          totalPages={totalPages}
          jumpToPage={jumpToPage}
          toggleViewMode={toggleViewMode}
          viewMode={viewMode}
        />
      )}
    </Box>
  );
}
