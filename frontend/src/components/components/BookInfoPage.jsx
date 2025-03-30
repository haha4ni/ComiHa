import React from "react";
import { Box, Typography } from "@mui/material";

export default function BookInfoPage({ bookinfo }) {
  console.log("BookInfo object:", bookinfo); // Log bookinfo for debugging
  return (
    <Box>
      <Typography variant="h4">Book Information</Typography>
      {/* Render bookinfo content here */}
      {bookinfo && (
        <Box>
          <Typography variant="body1">Title: {bookinfo.bookname}</Typography>
          <Typography variant="body1">Author: {bookinfo.author}</Typography>
          {/* Add more book information fields as needed */}
        </Box>
      )}
    </Box>
  );
}
