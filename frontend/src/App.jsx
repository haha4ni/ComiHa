import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainMode from "./components/MainMode";
import BookMode from "./components/BookMode";
import BookInfoPage from "./components/components/BookInfoPage";
import BookReadPage from "./components/components/BookReadPage";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainMode />}>
                    <Route path="bookinfo/:bookname/:booknumber" element={<BookInfoPage />} />
                    <Route path="bookinfo/:bookname/:booknumber/:page" element={<BookReadPage />} />
                </Route>
                <Route path="/book" element={<BookMode />} />
                {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}
            </Routes>
        </Router>
    );
}
