import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const books = [
  { title: "Book 1", author: "Author 1" },
  { title: "Book 2", author: "Author 2" },
  { title: "Book 3", author: "Author 3" },
];

export default function BookList() {
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Book List</Typography>
      <List>
        {books.map((book, index) => (
          <ListItem key={index}>
            <ListItemText primary={book.title} secondary={book.author} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
