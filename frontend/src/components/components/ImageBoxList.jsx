import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import useBookStore from "../../store/useBookStore";

const ImageBoxList = ({ booklist, images }) => {
  const { setShowBookInfo, setBookinfo } = useBookStore();

  return (
    <>
      {images.map((image, index) => (
        <Box key={index} sx={{ width: 215, textAlign: 'center', bgcolor: 'gray', borderRadius: '8px', m: 2 }}>
          <Avatar 
            src={image} 
            alt={`Drawer Image ${index}`} 
            sx={{ width: 215, height: 320, borderRadius: '8px 8px 0 0' }} 
            onClick={() => {
              setBookinfo(booklist[index]);
              setShowBookInfo(true);
            }}
          />
          <Typography variant="body2">{booklist[index].bookname} {booklist[index].booknumber}</Typography>
        </Box>
      ))}
      <Button 
        variant="contained" 
        onClick={() => setShowBookInfo(!useBookStore.getState().showBookInfo)}
        sx={{ mt: 2 }}
      >
        Toggle Book Info
      </Button>
    </>
  );
};

export default ImageBoxList;
