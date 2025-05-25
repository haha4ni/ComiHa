import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainMode from "./shell/MainMode";
import BookInfoPage from "./shell/pages/BookInfoPage";
import BookReadPage from "./shell/pages/BookReadPage/BookReadPage";
import ImageBoxList from "./shell/pages/ImageBoxList";
import SeriesInfoPage from './shell/pages/SeriesInfoPage';
import SettingPage from "./shell/pages/SettingPage";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainMode />}>
                    <Route index element={<div>Welcome to MainMode!</div>} />
                    <Route path="series" element={<ImageBoxList mode="series" />} />
                    <Route path="seriesinfo/:seriesname" element={<SeriesInfoPage />} />
                    <Route path="bookinfo" element={<ImageBoxList mode="bookinfo" />} />
                    <Route path="bookinfo/:bookname/:booknumber" element={<BookInfoPage />} />
                    <Route path="bookinfo/:bookname/:booknumber/:page" element={<BookReadPage />} />
                    <Route path="settings" element={<SettingPage />} />
                </Route>
                {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}
            </Routes>
        </Router>
    );
}
