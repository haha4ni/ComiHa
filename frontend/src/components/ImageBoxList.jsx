import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const ImageBoxList = ({ images }) => {
  return (
    <>
      {images.map((image, index) => (
        <Box key={index} sx={{ width: 300, textAlign: 'center', bgcolor: 'gray', borderRadius: '8px', m: 2 }}>
          <Avatar src={image} alt={`Drawer Image ${index}`} sx={{ width: 300, height: 300, borderRadius: '8px 8px 0 0' }} />
          <Typography variant="body1">{`Image ${index + 1}`}</Typography>
        </Box>
      ))}
    </>
  );
};

export default ImageBoxList;
