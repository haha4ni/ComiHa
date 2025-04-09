import { NowPath, ReadCover } from "../../wailsjs/go/main/App";

export const ReadImage = async (bookinfo, setImages, setImageNames) => {
  try {
    const path = bookinfo.filename;
    const img = await ReadCover(path); 
    console.log("目錄路徑fullPath", path); // Log 讀取的目錄路徑
    console.log("圖片", img); // Log 讀取的目錄路徑
    console.log("bookinfo", bookinfo); // Log 讀取的目錄路徑
    console.log("FileBitmap type:", typeof img[0].FileBitmap); // 檢查 FileBitmap 的類型
    console.log("FileBitmap first 100 chars:", img[0].FileBitmap.substring(0, 100)); // 查看 FileBitmap 的前100個字符
    // Convert the first three FileBitmap values to base64 and add to images state
    const newImages = img.map(item => `data:image/png;base64,${item.FileBitmap}`);
    setImages(prevImages => [...prevImages, ...newImages]);
    // setImageNames(prevNames => [...prevNames, path.split("\\").pop()]); // Add to imageNames state
    setImageNames(prevNames => [...prevNames, bookinfo]); // Add to imageNames state
  } catch (error) {
    console.error("Failed to select path:", error);
  }

};

export const processImages = async (booklist, setImages, setImageInfos) => {
    for (const bookinfo of booklist) {
      await ReadImage(bookinfo, setImages, setImageInfos);
    }
};