/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const TechnicalIndicators = ({ indicators, t }) => {
    const rsiValue = indicators.rsi.value;
    const rsiPercent = (rsiValue / 100) * 100;
    
    let rsiColorClass = 'bg-gray-400';
    if (rsiValue > 70) rsiColorClass = 'bg-red-500';
    else if (rsiValue < 30) rsiColorClass = 'bg-green-500';

    const macdValue = indicators.macd.value;
    const macdHeight = Math.min(100, Math.abs(macdValue) * 200);
    const macdColorClass = macdValue > 0 ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 space-y-4 animate-fadeIn text-xs">
            {/* RSI */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('forex_indicator_rsi')}</span>
                    <span className={`font-bold ${rsiColorClass.replace('bg-', 'text-')}`}>{t(indicators.rsi.statusKey)}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full relative">
                    <div className={`h-full rounded-full ${rsiColorClass}`} style={{ width: `${rsiPercent}%` }}></div>
                     <div className="absolute top-1/2 h-4 w-1 bg-gray-800 dark:bg-white rounded-full -translate-y-1/2" style={{ left: `calc(${rsiPercent}% - 2px)` }}></div>
                </div>
                <div className="flex justify-between text-gray-500 mt-1">
                    <span>0</span><span>{rsiValue}</span><span>100</span>
                </div>
            </div>
            {/* MACD */}
            <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('forex_indicator_macd')}</span>
                    <span className={`font-bold ${macdColorClass.replace('bg-', 'text-')}`}>{t(indicators.macd.statusKey)}</span>
                </div>
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700/50 rounded flex items-end justify-center p-1 relative">
                    <div className="absolute w-full h-px bg-gray-400/50 top-1/2"></div>
                    <div className={`w-4 rounded-t-sm ${macdColorClass}`} style={{ height: `${macdHeight}%` }}></div>
                </div>
            </div>
        </div>
    );
};


const AnalysisCard = (props) => {
    const { analysis } = props;
    const { t, language } = useLanguage();
    const [likeCount, setLikeCount] = useState(analysis.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [showTechnicals, setShowTechnicals] = useState(false);

    const handleLikeClick = () => {
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        setIsLiked(!isLiked);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg w-72 md:w-80 flex-shrink-0 overflow-hidden text-gray-900 dark:text-white shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800">
            <img src={analysis.img || DEFAULT_NEWS_IMAGE_URL} alt={analysis.title} className="w-full h-48 object-cover" loading="lazy" decoding="async" 
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="p-4 flex flex-col justify-between" style={{ minHeight: '180px' }}>
                <div>
                    <h3 className="font-bold mb-2 text-md leading-tight text-gray-900 dark:text-white">{analysis.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {analysis.description}
                    </p>
                </div>
                 <div className="flex justify-between items-center text-xs mt-auto">
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-1.5 rounded-md">
                        <button onClick={handleLikeClick} title={t('like_tooltip')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                            <Rocket size={16} className={isLiked ? 'text-green-500 fill-current' : ''}/>
                            <span>{likeCount}</span>
                        </button>
                        <div className="h-4 border-l border-gray-300 dark:border-gray-600"></div>
                        <button onClick={() => console.log('Comment on:', analysis.title)} title={t('comment_tooltip')} className="hover:opacity-80 transition-opacity">
                            <MessageSquare size={16} />
                        </button>
                    </div>
                     <div className="text-gray-500 dark:text-gray-400 text-right">
                        <div>
                            <span>{t('idea_by')} </span>
                            <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">{analysis.author}</a>
                        </div>
                        <div className="mt-1">{analysis.date}</div>
                    </div>
                </div>
                 <div className="mt-4">
                    <button onClick={() => setShowTechnicals(!showTechnicals)} className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <span>{t('forex_indicator_show_technicals')}</span>
                        <ChevronDown size={18} className={`transition-transform ${showTechnicals ? 'rotate-180' : ''}`} />
                    </button>
                    {showTechnicals && analysis.indicators && <TechnicalIndicators indicators={analysis.indicators} t={t} />}
                </div>
            </div>
        </div>
    );
};

export const ForexAnalysis = ({ userAnalyses = [] }) => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const staticData = useMemo(() => [
        {
            id: 1,
            img: 'https://picsum.photos/seed/forex1/320/192',
            title: t('forex_card1_title'),
            description: t('forex_card1_desc'),
            author: t('forex_card1_author'),
            date: t('forex_card1_date'),
            likes: 6,
            comments: 1,
            indicators: {
                rsi: { value: 82, statusKey: 'forex_indicator_rsi_status_overbought' },
                macd: { value: 0.25, statusKey: 'forex_indicator_macd_status_bullish' }
            }
        },
        {
            id: 2,
            img: 'https://picsum.photos/seed/forex2/320/192',
            title: t('forex_card2_title'),
            description: t('forex_card2_desc'),
            author: t('forex_card2_author'),
            date: t('forex_card2_date'),
            likes: 1,
            comments: 1,
             indicators: {
                rsi: { value: 25, statusKey: 'forex_indicator_rsi_status_oversold' },
                macd: { value: -0.15, statusKey: 'forex_indicator_macd_status_bearish' }
            }
        },
        {
            id: 3,
            img: 'https://picsum.photos/seed/forex3/320/192',
            title: t('forex_card3_title'),
            description: t('forex_card3_desc'),
            author: t('forex_card3_author'),
            date: t('forex_card3_date'),
            likes: 3,
            comments: 0,
             indicators: {
                rsi: { value: 55, statusKey: 'forex_indicator_rsi_status_neutral' },
                macd: { value: 0.05, statusKey: 'forex_indicator_macd_status_bullish' }
            }
        },
        {
            id: 4,
            img: 'https://picsum.photos/seed/forex4/320/192',
            title: t('forex_card4_title'),
            description: t('forex_card4_desc'),
            author: t('forex_card4_author'),
            date: t('forex_card4_date'),
            likes: 5,
            comments: 2,
            indicators: {
                rsi: { value: 48, statusKey: 'forex_indicator_rsi_status_neutral' },
                macd: { value: -0.02, statusKey: 'forex_indicator_macd_status_bearish' }
            }
        },
    ], [t]);

    const combinedData = useMemo(() => [...userAnalyses, ...staticData], [userAnalyses, staticData]);


    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320 + 24; // card width + gap
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('forex_analysis_title1')} {language === 'ar' ? '<' : '>'}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('forex_analysis_title2')}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {combinedData.map((analysis, index) => <AnalysisCard key={`${analysis.id}-${index}`} analysis={analysis} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
        </section>
    );
};