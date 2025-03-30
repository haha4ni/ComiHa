import React, { useContext } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { ShowBookInfoContext } from "../context/ShowBookInfoContext"; // Import context

const ImageBoxList = ({ booklist, images }) => { // Remove onImageClick prop
  const { showBookInfo, setShowBookInfo, bookinfo, setBookinfo } = useContext(ShowBookInfoContext); // Use context

  return (
    <>
      {images.map((image, index) => (
        <Box key={index} sx={{ width: 215, textAlign: 'center', bgcolor: 'gray', borderRadius: '8px', m: 2 }}>
          <Avatar 
            src={image} 
            alt={`Drawer Image ${index}`} 
            sx={{ width: 215, height: 320, borderRadius: '8px 8px 0 0' }} 
            onClick={() => {
              setBookinfo(booklist[index]); // Set bookinfo with the clicked book
              setShowBookInfo(true); // Switch to the book info page
            }}
          />
          <Typography variant="body2">{booklist[index].filename}</Typography>
        </Box>
      ))}
      <Button 
        variant="contained" 
        onClick={() => setShowBookInfo(!showBookInfo)} // Toggle showBookInfo
        sx={{ mt: 2 }}
      >
        Toggle Book Info
      </Button>
    </>
  );
};

export default ImageBoxList;
