import { createContext } from "react";

export const ShowBookInfoContext = createContext({
  showBookInfo: false,
  setShowBookInfo: () => {},
  bookinfo: null, // Add bookinfo
  setBookinfo: () => {}, // Add setBookinfo
});
