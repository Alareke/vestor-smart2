/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const NewsItem = ({ news, onNewsClick }) => {
    return (
        <button onClick={onNewsClick} className="flex items-start gap-4 group w-full text-left">
            <div className="flex-grow">
                <p className="text-gray-500 text-xs mb-1">
                    <span>{news.timestamp}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{news.source}</span>
                </p>
                <h3 className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug block line-clamp-3">
                    {news.headline}
                </h3>
            </div>
            <img src={news.imageUrl || DEFAULT_NEWS_IMAGE_URL} alt="" className="w-24 h-16 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-800" 
                loading="lazy" decoding="async"
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
        </button>
    );
};


export const FuturesNews = ({ userNews = [], onNewsClick, onTitleClick }) => {
    const { t, language } = useLanguage();

    const newsData = [
        // Col 1
        { id: 1, timestampKey: 'fn_ts1', source: 'Reuters', headlineKey: 'fn_hl1', imageUrl: 'https://images.unsplash.com/photo-1616843438319-a9a3b37a5?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 2, timestampKey: 'fn_ts2', source: 'Reuters', headlineKey: 'fn_hl2', imageUrl: 'https://images.unsplash.com/photo-1631210741241-4828691a7f33?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 3, timestampKey: 'fn_ts3', source: 'Reuters', headlineKey: 'fn_hl3', imageUrl: 'https://images.unsplash.com/photo-1588551401340-9e5c3a3b37a5?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 4, timestampKey: 'fn_ts4', source: 'Reuters', headlineKey: 'fn_hl4', imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=400&h=225&auto=format&fit=crop' },
        // Col 2
        { id: 5, timestampKey: 'fn_ts5', source: 'Reuters', headlineKey: 'fn_hl5', imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 6, timestampKey: 'fn_ts6', source: 'Reuters', headlineKey: 'fn_hl6', imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 7, timestampKey: 'fn_ts7', source: 'Reuters', headlineKey: 'fn_hl7', imageUrl: 'https://images.unsplash.com/photo-1579591942450-49641e7f6731?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 8, timestampKey: 'fn_ts8', source: 'Reuters', headlineKey: 'fn_hl8', imageUrl: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=400&h=225&auto=format&fit=crop' },
        // Col 3
        { id: 9, timestampKey: 'fn_ts9', source: 'Reuters', headlineKey: 'fn_hl9', imageUrl: 'https://images.unsplash.com/photo-1621495484054-05553e1b8b8b?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 10, timestampKey: 'fn_ts10', source: 'Reuters', headlineKey: 'fn_hl10', imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 11, timestampKey: 'fn_ts11', source: 'Reuters', headlineKey: 'fn_hl11', imageUrl: 'https://images.unsplash.com/photo-1599388136367-3331b6f0e34c?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 12, timestampKey: 'fn_ts12', source: 'Reuters', headlineKey: 'fn_hl12', imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=400&h=225&auto=format&fit=crop' },
    ];
    
    const translatedNewsData = newsData.map(news => ({
        ...news,
        timestamp: t(news.timestampKey),
        headline: t(news.headlineKey),
    }));

    const translatedUserNews = userNews.map(news => ({
        id: `user-${news.id}`,
        headline: news.title,
        timestamp: news.date || t('just_now_label'),
        source: news.author,
        imageUrl: news.img
    }));

    const combinedNews = [...translatedUserNews, ...translatedNewsData];

    const col1 = combinedNews.slice(0, 4);
    const col2 = combinedNews.slice(4, 8);
    const col3 = combinedNews.slice(8, 12);
    
    const renderColumn = (items) => (
        <div className="flex flex-col">
            {items.map((news, index) => (
                <React.Fragment key={news.id}>
                    <div className="py-3 px-2 -mx-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1C2331] transition-colors">
                        <NewsItem news={news} onNewsClick={onNewsClick} />
                    </div>
                    {index < items.length - 1 && <hr className="border-gray-200 dark:border-gray-800" />}
                </React.Fragment>
            ))}
        </div>
    );


    return (
        <section>
            <div className="flex flex-wrap gap-y-2 justify-between items-center mb-4">
                <button onClick={onTitleClick} className="text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t('futures_news_title')} {language === 'ar' ? '<' : '>'}
                    </h2>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                {renderColumn(col1)}
                {renderColumn(col2)}
                {renderColumn(col3)}
            </div>

            <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('futures_news_continue_reading')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
};