import React, { useEffect, useState } from 'react';
import ImageBoxList from './ImageBoxList';
import { GetBookinfosByAndConditions, GetBookListAll, GetBookCoverByBookinfo } from '../../../wailsjs/go/main/App';

export default function HomePage() {
    const [bookBoxList, setBookBoxList] = useState([]);
    const [doujinshiBoxList, setDoujinshiBoxList] = useState([]);
    const [webtoonBoxList, setWebtoonBoxList] = useState([]);
    const [uncategorizedBoxList, setUncategorizedBoxList] = useState([]);

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

        async function fetchWebtoon() {
            const booklist = await GetBookinfosByAndConditions({
                "metadata.tags": "Webtoon",
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
            setWebtoonBoxList(arr);
        }

        async function fetchUncategorized() {
            // 取得所有書籍
            const allBooks = await GetBookListAll();
            
            // 篩選出沒有 tags 或 tags 為空的書籍
            const uncategorizedBooks = allBooks.filter(book => 
                !book.Metadata?.Tags || book.Metadata.Tags.trim() === ""
            );
            
            const arr = await Promise.all(
                uncategorizedBooks.map(async (bookinfo) => {
                    const img = await GetBookCoverByBookinfo(bookinfo);
                    return {
                        bookinfo,
                        image_cover: img.FileString,
                        type: 'bookinfo',
                    };
                }),
            );
            setUncategorizedBoxList(arr);
        }

        fetchBooks();
        fetchDoujinshi();
        fetchWebtoon();
        fetchUncategorized();
    }, []);

    return (
        <div>
            <h2 style={{ textAlign: 'left' }}>　漫畫</h2>
            <ImageBoxList type="row" boxlist={bookBoxList} />
            
            <h2 style={{ textAlign: 'left' }}>　同人誌</h2>
            <ImageBoxList type="row" boxlist={doujinshiBoxList} />
            
            <h2 style={{ textAlign: 'left' }}>　條漫</h2>
            <ImageBoxList type="row" boxlist={webtoonBoxList} />
            
            <h2 style={{ textAlign: 'left' }}>　未分類</h2>
            <ImageBoxList type="row" boxlist={uncategorizedBoxList} />
        </div>
    );
}
