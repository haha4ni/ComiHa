import { create } from 'zustand';

const useBookStore = create((set) => ({
  showBookInfo: false,
  bookinfo: null,
  setShowBookInfo: (show) => set({ showBookInfo: show }),
  setBookinfo: (info) => set({ bookinfo: info }),
}));

export default useBookStore; 