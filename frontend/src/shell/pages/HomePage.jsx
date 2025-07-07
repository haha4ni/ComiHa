import React, { useEffect, useState } from 'react';
import ImageBoxList from './ImageBoxList';
import { GetBookinfosByAndConditions, GetBookCoverByBookinfo } from '../../../wailsjs/go/main/App';

export default function HomePage() {
    const [bookBoxList, setBookBoxList] = useState([]);
    const [doujinshiBoxList, setDoujinshiBoxList] = useState([]);

    useEffect(() => {
        async function fetchBooks() {
            const booklist = await GetBookinfosByAndConditions({
                "metadata.tags": "Comic",
            });
            const arr = await Promise.all(
                booklist.map(async (bookinfo) => {
                    const img = await GetBookCoverByBookinfo(bookinfo);
                    return {
                        bookinfo,
                        image_cover: img.FileString,
                        type: 'bookinfo',
                    };
                }),
            );
            setBookBoxList(arr);
        }

        async function fetchDoujinshi() {
            const booklist = await GetBookinfosByAndConditions({
                "metadata.tags": "Doujinshi",
            });
            const arr = await Promise.all(
                booklist.map(async (bookinfo) => {
                    const img = await GetBookCoverByBookinfo(bookinfo);
                    return {
                        bookinfo,
                        image_cover: img.FileString,
                        type: 'bookinfo',
                    };
                }),
            );
            setDoujinshiBoxList(arr);
        }

        fetchBooks();
        fetchDoujinshi();
    }, []);

    return (
        <div>
            <h2 style={{ textAlign: 'left' }}>　漫畫</h2>
            <ImageBoxList type="row" boxlist={bookBoxList} />
            
            <h2 style={{ textAlign: 'left' }}>　同人誌</h2>
            <ImageBoxList type="row" boxlist={doujinshiBoxList} />
            
        </div>
    );
}
