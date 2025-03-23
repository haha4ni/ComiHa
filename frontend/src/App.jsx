import { useState } from 'react';
import './App.css';
import MainMode from "./components/MainMode";
import BookMode from "./components/BookMode";

export default function App() {
    const [mode, setMode] = useState('main');

    return (
        <>
            {mode === 'main' ? <MainMode setMode={setMode} /> : <BookMode setMode={setMode} />}
        </>
    );
}
