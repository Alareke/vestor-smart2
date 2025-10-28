/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SymbolIcon } from './SymbolIcon';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const NewsItem = ({ news, onNewsClick }) => {
    return (
        <button onClick={onNewsClick} className="flex items-start gap-4 group text-left">
            <img src={news.imageUrl || DEFAULT_NEWS_IMAGE_URL} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-800" 
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="flex flex-col">
                <p className="text-gray-500 text-xs mb-1 flex items-center gap-1.5">
                    <SymbolIcon symbol={news.ticker} size={16} />
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{news.source}</span>
                    <span className="mx-1.5">•</span>
                    <span>{news.timestamp}</span>
                </p>
                <h3 className="text-gray-900 dark:text-white text-sm font-medium group-hover:underline leading-snug line-clamp-4">
                    {news.headline}
                </h3>
            </div>
        </button>
    );
};

export const DigitalCurrencyNews = ({ userNews = [], onNewsClick, onTitleClick }) => {
    const { t, language } = useLanguage();

    const newsData = [
        { id: 1, sourceKey: 'dcn1_source', headlineKey: 'dcn1_headline', ticker: 'BTC', imageUrl: 'https://images.unsplash.com/photo-1621495484054-05553e1b8b8b?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 2, sourceKey: 'dcn2_source', headlineKey: 'dcn2_headline', ticker: 'BTC', imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 3, sourceKey: 'dcn3_source', headlineKey: 'dcn3_headline', ticker: 'USDT', imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 4, sourceKey: 'dcn4_source', headlineKey: 'dcn4_headline', ticker: 'ETH', imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 5, sourceKey: 'dcn5_source', headlineKey: 'dcn5_headline', ticker: 'SOL', imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 6, sourceKey: 'dcn6_source', headlineKey: 'dcn6_headline', ticker: 'XRP', imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 7, sourceKey: 'dcn7_source', headlineKey: 'dcn7_headline', ticker: 'DOGE', imageUrl: 'https://images.unsplash.com/photo-1621495484054-05553e1b8b8b?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 8, sourceKey: 'dcn8_source', headlineKey: 'dcn8_headline', ticker: 'BNB', imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 9, sourceKey: 'dcn9_source', headlineKey: 'dcn9_headline', ticker: 'ADA', imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 10, sourceKey: 'dcn10_source', headlineKey: 'dcn10_headline', ticker: 'MANA', imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 11, sourceKey: 'dcn11_source', headlineKey: 'dcn11_headline', ticker: 'LTC', imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 12, sourceKey: 'dcn12_source', headlineKey: 'dcn12_headline', ticker: 'BTC', imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=400&h=225&auto=format&fit=crop' },
    ];
    
    const translatedNewsData = newsData.map(news => ({
        ...news,
        source: t(news.sourceKey),
        headline: t(news.headlineKey),
        timestamp: t('dcn_timestamp'),
    }));

    const translatedUserNews = userNews.map(news => ({
        id: `user-${news.id}`,
        headline: news.title,
        timestamp: news.date || t('just_now_label'),
        source: news.author,
        imageUrl: news.img,
        ticker: news.icon || 'BTC' // Default to BTC icon if none selected
    }));

    const combinedNews = [...translatedUserNews, ...translatedNewsData];

    return (
        <section>
            <div className="flex flex-wrap gap-y-2 justify-between items-center mb-4">
                <button onClick={onTitleClick} className="text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t('digital_currency_news_title')} {language === 'ar' ? '<' : '>'}
                    </h2>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {combinedNews.map((news) => <NewsItem key={news.id} news={news} onNewsClick={onNewsClick} />)}
            </div>

            <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('digital_currency_news_continue_reading')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
};