/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const FlagIcon = (props) => {
    const { code } = props;
    return <img src={`https://flagcdn.com/w20/${code}.png`} alt={`${code} flag`} className="w-4 h-4 rounded-full" />
};

const CustomIcon = (props) => {
    const { text, bgColor, textColor } = props;
    return (
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${bgColor} ${textColor}`}>
            {text}
        </div>
    );
};


const NewsItem = ({ news, onNewsClick }) => {
    return (
        <button onClick={onNewsClick} className="flex items-start gap-4 group w-full text-left">
            <div className="flex-grow">
                 <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                    <span>{news.timestamp}</span>
                    <span className="mx-0.5">•</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{news.source}</span>
                    {news.icons && (
                        <>
                            <span className="mx-0.5">•</span>
                            <div className="flex items-center gap-1">
                                {news.icons.map((icon, index) => {
                                    if (icon.type === 'flag') return <FlagIcon key={index} code={icon.code} />;
                                    if (icon.type === 'custom') return <CustomIcon key={index} text={icon.text} bgColor={icon.bgColor} textColor={icon.textColor} />;
                                    return null;
                                })}
                            </div>
                        </>
                    )}
                </div>
                <h3 className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug block line-clamp-4">
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


export const ForexNews = ({ userNews = [], onNewsClick, onTitleClick }) => {
    const { t, language } = useLanguage();

    const newsData = [
        // Col 1
        { id: 1, timestampKey: 'fnx_ts1', sourceKey: 'fnx_src1', headlineKey: 'fnx_hl1', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 2, timestampKey: 'fnx_ts2', sourceKey: 'fnx_src2', headlineKey: 'fnx_hl2', icons: [{ type: 'flag', code: 'eu' }, { type: 'flag', code: 'us' }, { type: 'flag', code: 'gb' }, { type: 'flag', code: 'ca' }], imageUrl: 'https://images.unsplash.com/photo-1529108539659-456a2f3b927a?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 3, timestampKey: 'fnx_ts3', sourceKey: 'fnx_src3', headlineKey: 'fnx_hl3', imageUrl: 'https://images.unsplash.com/photo-1594883445943-7f7f32e9a5a5?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 4, timestampKey: 'fnx_ts4', sourceKey: 'fnx_src4', headlineKey: 'fnx_hl4', icons: [{ type: 'custom', text: '', bgColor: 'bg-blue-500', textColor: '' }], imageUrl: 'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?q=80&w=400&h=225&auto=format&fit=crop' },
        // Col 2
        { id: 5, timestampKey: 'fnx_ts5', sourceKey: 'fnx_src5', headlineKey: 'fnx_hl5', imageUrl: 'https://images.unsplash.com/photo-1502472584811-0a2f/2feb8968?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 6, timestampKey: 'fnx_ts6', sourceKey: 'fnx_src6', headlineKey: 'fnx_hl6', imageUrl: 'https://images.unsplash.com/photo-1507721999472-ea04a2c4249a?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 7, timestampKey: 'fnx_ts7', sourceKey: 'fnx_src7', headlineKey: 'fnx_hl7', imageUrl: 'https://images.unsplash.com/photo-1574925895514-97216669b768?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 8, timestampKey: 'fnx_ts8', sourceKey: 'fnx_src8', headlineKey: 'fnx_hl8', icons: [{ type: 'custom', text: '100', bgColor: 'bg-blue-500', textColor: 'text-white' }], imageUrl: 'https://images.unsplash.com/photo-1629824638549-34d6731a581e?q=80&w=400&h=225&auto=format&fit=crop' },
        // Col 3
        { id: 9, timestampKey: 'fnx_ts9', sourceKey: 'fnx_src9', headlineKey: 'fnx_hl9', imageUrl: 'https://images.unsplash.com/photo-1565968254823-ce171b3e8c56?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 10, timestampKey: 'fnx_ts10', sourceKey: 'fnx_src10', headlineKey: 'fnx_hl10', icons: [{ type: 'flag', code: 'au' }, { type: 'flag', code: 'nz' }, { type: 'flag', code: 'us' }, { type: 'flag', code: 'gb' }], imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 11, timestampKey: 'fnx_ts11', sourceKey: 'fnx_src11', headlineKey: 'fnx_hl11', imageUrl: 'https://images.unsplash.com/photo-1565968254823-ce171b3e8c56?q=80&w=400&h=225&auto=format&fit=crop' },
        { id: 12, timestampKey: 'fnx_ts12', sourceKey: 'fnx_src12', headlineKey: 'fnx_hl12', imageUrl: 'https://images.unsplash.com/photo-1559759352-7243c1d42a92?q=80&w=400&h=225&auto=format&fit=crop' },
    ];
    
    const translatedNewsData = newsData.map(news => ({
        ...news,
        timestamp: t(news.timestampKey),
        source: t(news.sourceKey),
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
                        {t('forex_news_title')} {language === 'ar' ? '<' : '>'}
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
                    {t('forex_news_continue_reading')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
};