/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { MarketSelectorModal } from './MarketSelectorModal';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const NewsItem = ({ news, onNewsClick }) => {
    return (
        <button onClick={onNewsClick} className="flex items-start gap-4 group w-full text-left">
            <img src={news.imageUrl || DEFAULT_NEWS_IMAGE_URL} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-800"
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="flex flex-col">
                <p className="text-gray-500 text-xs mb-1">
                    <span>{news.timestamp}</span>
                    <span className="mx-1.5">•</span>
                    <span>{news.source}</span>
                </p>
                <h3 className="text-gray-900 dark:text-white text-sm font-medium group-hover:underline leading-snug line-clamp-4">
                    {news.headline}
                </h3>
            </div>
        </button>
    );
};

export const UsStockNews = ({ userNews = [], onNewsClick, onTitleClick }) => {
    const { t, language } = useLanguage();
    const [selectedMarket, setSelectedMarket] = useState({ key: 'us', countryKey: 'country_usa', flagCode: 'us' });
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const marketButtonRef = useRef(null);

    const newsData = [
        { id: 1, timestampKey: 'news1_timestamp', headlineKey: 'news1_headline', source: 'Levi & Korsinsky', imageUrl: 'https://picsum.photos/seed/lucidmotors/400/225' },
        { id: 2, timestampKey: 'news2_timestamp', headlineKey: 'news2_headline', source: 'Levi & Korsinsky', imageUrl: 'https://picsum.photos/seed/tesla/400/225' },
        { id: 3, timestampKey: 'news3_timestamp', headlineKey: 'news3_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/fitness/400/225' },
        { id: 4, timestampKey: 'news4_timestamp', headlineKey: 'news4_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/schwab/400/225' },
        { id: 5, timestampKey: 'news5_timestamp', headlineKey: 'news5_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/prism/400/225' },
        { id: 6, timestampKey: 'news6_timestamp', headlineKey: 'news6_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/equinix/400/225' },
        { id: 7, timestampKey: 'news7_timestamp', headlineKey: 'news7_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/teradata/400/225' },
        { id: 8, timestampKey: 'news8_timestamp', headlineKey: 'news8_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/anavex/400/225' },
        { id: 9, timestampKey: 'news9_timestamp', headlineKey: 'news9_headline', source: 'Bronstein, Gewirtz & Grossman', imageUrl: 'https://picsum.photos/seed/malibu/400/225' },
    ];
    
    const translatedNewsData = newsData.map(news => ({
        ...news,
        timestamp: t(news.timestampKey),
        headline: t(news.headlineKey),
    }));
    
    const translatedUserNews = userNews
        .filter(news => news.country === selectedMarket.key)
        .map(news => ({
            id: `user-${news.id}`,
            headline: news.title,
            timestamp: news.date || t('just_now_label'),
            source: news.author,
            imageUrl: news.img
        }));

    const combinedNews = [...translatedUserNews, ...translatedNewsData];


    const handleMarketSelect = (market) => {
        setSelectedMarket(market);
        setIsMarketModalOpen(false);
    };

    return (
        <section>
            <div className="flex flex-wrap gap-y-2 justify-between items-center mb-4">
                 <button onClick={onTitleClick} className="text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t('us_stock_news_title_country', { country: t(selectedMarket.countryKey) })} {language === 'ar' ? '<' : '>'}
                    </h2>
                </button>
                <button
                    ref={marketButtonRef}
                    onClick={() => setIsMarketModalOpen(p => !p)}
                    title={t('select_market_tooltip')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                >
                    <img src={`https://flagcdn.com/w20/${selectedMarket.flagCode}.png`} alt={`${t(selectedMarket.countryKey)} flag`} className="w-5 h-auto rounded-sm" />
                    <span>{t(selectedMarket.countryKey)}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {combinedNews.map((news) => <NewsItem key={news.id} news={news} onNewsClick={onNewsClick} />)}
            </div>

            <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('us_stock_news_keep_reading')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
             <MarketSelectorModal
                isOpen={isMarketModalOpen}
                onClose={() => setIsMarketModalOpen(false)}
                onMarketSelect={handleMarketSelect}
                anchorEl={marketButtonRef.current}
            />
        </section>
    );
};