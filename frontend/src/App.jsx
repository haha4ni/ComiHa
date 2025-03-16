import { useState } from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import { Greet } from "../wailsjs/go/main/App";
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
