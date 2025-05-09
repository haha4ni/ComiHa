import React, { useState } from 'react';
import { TextField, Select, MenuItem, FormControl, Box, Typography } from '@mui/material';

export default function SettingPage() {
    const [comicPath, setComicPath] = useState('./comic');
    const [dbPath, setDbPath] = useState('./data');
    const [themeMode, setThemeMode] = useState('light');

    return (
        <Box sx={{ padding: '20px', textAlign: 'left' }}>
            <Typography variant="h4" gutterBottom>設定</Typography>

            <Box sx={{ marginBottom: '20px' }}>
                <Typography variant="h6">一般</Typography>
                <FormControl fullWidth sx={{ marginBottom: '10px' }}>
                    <Typography variant="body1" gutterBottom>漫畫路徑</Typography>
                    <TextField
                        value={comicPath}
                        onChange={(e) => setComicPath(e.target.value)}
                        placeholder="漫畫讀取的路徑"
                        variant="outlined"
                        size="small"
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Typography variant="body1" gutterBottom>資料庫路徑</Typography>
                    <TextField
                        value={dbPath}
                        onChange={(e) => setDbPath(e.target.value)}
                        placeholder="資料庫儲存路徑"
                        variant="outlined"
                        size="small"
                    />
                </FormControl>
            </Box>

            <Box>
                <Typography variant="h6">主題</Typography>
                <FormControl fullWidth>
                    <Typography variant="body1" gutterBottom>模式</Typography>
                    <Select
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="dark">深色模式</MenuItem>
                        <MenuItem value="light">淺色模式</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
}
