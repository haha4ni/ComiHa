import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BookMode() {
    const navigate = useNavigate();

    useEffect(() => {
        // Add your side-effect logic here
    }, []);

    return (
        <div>
            <h1>BookMode</h1>
            {/* Add your component JSX here */}
            <Button variant="contained" onClick={() => navigate("/")}>Switch to Main Mode</Button>
        </div>
    );
}