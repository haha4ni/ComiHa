import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const ImageBoxList = ({ imageNames, images }) => { // Update imageNames parameter
  return (
    <>
      {images.map((image, index) => (
        <Box key={index} sx={{ width: 215, textAlign: 'center', bgcolor: 'gray', borderRadius: '8px', m: 2 }}>
          <Avatar src={image} alt={`Drawer Image ${index}`} sx={{ width: 215, height: 320, borderRadius: '8px 8px 0 0' }} />
          <Typography variant="body2">{imageNames[index]}</Typography> {/* Display corresponding imageName */}
        </Box>
      ))}
    </>
  );
};

export default ImageBoxList;
