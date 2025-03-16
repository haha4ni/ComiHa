import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";

export default function BookMode({ setMode }) {
    const [state, setState] = useState(null);

    useEffect(() => {
        // Add your side-effect logic here
    }, []);

    return (
        <div>
            <h1>BookMode</h1>
            {/* Add your component JSX here */}
            <Button variant="contained" onClick={() => setMode('main')}>Switch to Main Mode</Button>
        </div>
    );
}