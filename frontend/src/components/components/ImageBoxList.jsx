import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useBookStore from "../../store/useBookStore";

const ImageBoxList = ({ booklist, images }) => {
  const navigate = useNavigate();
  const { setBookinfo } = useBookStore();

  return (
    <>
      {images.map((image, index) => (
        <Box key={index} sx={{ width: 215, textAlign: 'center', bgcolor: 'gray', borderRadius: '8px', m: 2 }}>
          <Avatar 
            src={image} 
            alt={`Drawer Image ${index}`} 
            sx={{ width: 215, height: 320, borderRadius: '8px 8px 0 0' }} 
            onClick={() => {
              const book = booklist[index];
              setBookinfo(book);
              navigate(`/bookinfo/${encodeURIComponent(book.bookname)}/${encodeURIComponent(book.booknumber)}`);
            }}
          />
          <Typography variant="body2">{booklist[index].bookname} {booklist[index].booknumber}</Typography>
        </Box>
      ))}
    </>
  );
};

export default ImageBoxList;
