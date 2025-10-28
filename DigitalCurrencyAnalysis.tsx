/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const AnalysisCard = (props) => {
    const { analysis } = props;
    const { t } = useLanguage();
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg w-72 sm:w-80 md:w-[420px] flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <img src={analysis.img || DEFAULT_NEWS_IMAGE_URL} alt={analysis.title} className="w-full h-56 object-cover" loading="lazy" decoding="async" 
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-md">{analysis.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-line h-20 truncate">
                    {analysis.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-700/80 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title={t('like_tooltip')}>
                            <Rocket size={16} />
                            <span>{analysis.likes || 0}</span>
                        </button>
                        <div className="h-4 border-l border-gray-200 dark:border-gray-700"></div>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title={t('comment_tooltip')}>
                            <MessageSquare size={16} />
                        </button>
                    </div>
                     <div className="text-right">
                        <div>
                            <span>{t('idea_by')} </span>
                            <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">{analysis.author}</a>
                        </div>
                        <div className="mt-1">{analysis.date}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DigitalCurrencyAnalysis = ({ userAnalyses = [] }) => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const staticData = useMemo(() => [
        {
            id: 1,
            img: 'https://images.unsplash.com/photo-1621405232980-329158555252?q=80&w=420&h=224&auto=format&fit=crop',
            title: t('dca_card1_title'),
            description: t('dca_card1_desc'),
            author: t('dca_card1_author'),
            date: t('dca_card1_date'),
            likes: 4,
        },
        {
            id: 2,
            img: 'https://images.unsplash.com/photo-1624562522469-3351a02b8d89?q=80&w=420&h=224&auto=format&fit=crop',
            title: t('dca_card2_title'),
            description: t('dca_card2_desc'),
            author: t('dca_card2_author'),
            date: t('dca_card2_date'),
            likes: 11,
        },
        {
            id: 3,
            img: 'https://images.unsplash.com/photo-1625402935542-53a5dda5a5ea?q=80&w=420&h=224&auto=format&fit=crop',
            title: t('dca_card3_title'),
            description: t('dca_card3_desc'),
            author: t('dca_card3_author'),
            date: t('dca_card3_date'),
            likes: 16,
        },
        {
            id: 4,
            img: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=420&h=224&auto=format&fit=crop',
            title: t('dca_card2_title'), // Reusing for variety
            description: t('dca_card2_desc'),
            author: t('dca_card2_author'),
            date: t('dca_card2_date'),
            likes: 21,
        },
    ], [t]);
    
    const combinedData = useMemo(() => [...userAnalyses, ...staticData], [userAnalyses, staticData]);

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const cardWidth = window.innerWidth < 768 ? 320 : 420;
            const scrollAmount = cardWidth + 24; // card width + gap
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('digital_currency_analysis_title')} {language === 'ar' ? '<' : '>'}</h2>
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