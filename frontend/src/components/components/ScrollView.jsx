import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

export default function ScrollView({ pages, pageRefs, onLoadMore }) {
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 1 } // Adjusted rootMargin
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [observerRef, onLoadMore]);

  return (
    <>
      {Object.entries(pages).map(
        ([pageNum, pageData]) =>
          pageData && (
            <Box
              key={pageNum}
              data-page={pageNum}
              ref={(el) => (pageRefs.current[pageNum] = el)}
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Box
                component="img"
                src={`data:image/png;base64,${pageData.FileBitmap}`}
                alt={`Page ${pageNum}`}
                sx={{
                  maxWidth: "90%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          )
      )}
      <Box
        ref={observerRef}
        sx={{
          height: "10px",
          width: "90%",
          position: "relative",
          top: "-1000px",
        }}
      />
    </>
  );
}
