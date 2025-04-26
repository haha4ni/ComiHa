import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainMode from "./components/MainMode";
import BookMode from "./components/BookMode";
import BookInfoPage from "./components/components/BookInfoPage";
import BookReadPage from "./components/components/BookReadPage";
import ImageBoxList from "./components/components/ImageBoxList";
import SeriesInfoPage from './components/components/SeriesInfoPage';

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
                </Route>
                {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}
            </Routes>
        </Router>
    );
}
