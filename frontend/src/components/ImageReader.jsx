import { NowPath, GetFileList, ReadCover } from "../../wailsjs/go/main/App";

export const ReadImage = async (path, setImages, setImageNames) => {
  try {
    const img = await ReadCover(path); 
    console.log("目錄路徑fullPath", path); // Log 讀取的目錄路徑
    console.log("圖片", img); // Log 讀取的目錄路徑

    // Convert the first three FileBitmap values to base64 and add to images state
    const newImages = img.map(item => `data:image/png;base64,${item.FileBitmap}`);
    setImages(prevImages => [...prevImages, ...newImages]);
    setImageNames(prevNames => [...prevNames, path.split("\\").pop()]); // Add to imageNames state

  } catch (error) {
    console.error("Failed to select path:", error);
  }
};

export const processImages = async (pathList, setImages, setImageInfos) => {
  console.log("@@@@@@@pathList", pathList); // Log 讀取的目錄路徑
    // Use map to call ReadImage for each filename in filelist
    for (const path of pathList) {
      await ReadImage(path, setImages, setImageInfos);
    }
};