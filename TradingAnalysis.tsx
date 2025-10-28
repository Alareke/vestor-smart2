/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const AnalysisCard = (props: any) => {
    const { analysis, onIdeaClick } = props;
    const { t } = useLanguage();
    const [likeCount, setLikeCount] = useState(analysis.likes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        setIsLiked(!isLiked);
    };
    
    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onIdeaClick();
    };

    return (
        <div onClick={onIdeaClick} className="bg-white dark:bg-black rounded-lg w-72 sm:w-80 md:w-[420px] flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer transition-transform duration-300 hover:-translate-y-1">
            <img src={analysis.img || DEFAULT_NEWS_IMAGE_URL} alt={analysis.title} className="w-full h-56 object-cover" loading="lazy" decoding="async" 
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-md">{analysis.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-line h-12 truncate">
                    {analysis.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLikeClick} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
                            <Rocket size={16} className={isLiked ? 'text-green-500 fill-current' : ''} />
                            <span>{likeCount}</span>
                        </button>
                         <button onClick={handleCommentClick} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            <MessageSquare size={16} />
                            {analysis.comments > 0 && <span>{analysis.comments}</span>}
                        </button>
                    </div>
                    <div>
                        <span>{analysis.author} </span>
                        <span className="text-cyan-600 dark:text-cyan-400 mx-1">•</span>
                        <span>{analysis.date}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TradingAnalysis = ({ tradingAnalysisData, onIdeaClick, onTitleClick }) => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const cardWidth = window.innerWidth < 768 ? 320 : 420;
            const scrollAmount = cardWidth + 24; // card width + gap
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <button onClick={onTitleClick} className="w-full text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('trading_analysis_title')} {language === 'ar' ? '<' : '>'}</h2>
            </button>
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {tradingAnalysisData.map((analysis: any) => <AnalysisCard key={analysis.id} analysis={analysis} onIdeaClick={onIdeaClick} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
            <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('read_more_link')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
};