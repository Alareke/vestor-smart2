/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageCircle, Copy } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const IndicatorCard = (props: any) => {
    const { indicator, onIdeaClick } = props;
    const { t } = useLanguage();
    const [likes, setLikes] = useState(indicator.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [copyTooltip, setCopyTooltip] = useState(t('indicator_copy_tooltip'));

    const handleLike = (e) => {
        e.stopPropagation();
        setLikes(isLiked ? likes - 1 : likes + 1);
        setIsLiked(!isLiked);
    };

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(indicator.title);
        setCopyTooltip(t('indicator_copied_tooltip'));
        setTimeout(() => setCopyTooltip(t('indicator_copy_tooltip')), 2000);
    };

    return (
        <div onClick={onIdeaClick} className="w-72 sm:w-80 flex-shrink-0 group cursor-pointer">
            <div className="relative mb-3">
                <div className="bg-white dark:bg-[#1C2331] rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                     <img src={indicator.img || DEFAULT_NEWS_IMAGE_URL} alt={indicator.title} className="w-full h-40 object-cover rounded-md" loading="lazy" decoding="async" 
                        onError={(e) => {
                            if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                              e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                            }
                        }}
                     />
                </div>
                <div className="absolute top-4 end-4 flex flex-col gap-2">
                    <button onClick={handleCopy} title={copyTooltip} className="bg-black/50 p-1.5 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <Copy size={16} />
                    </button>
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded self-end">TV</div>
                </div>
            </div>
            <div className="px-2">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-md">{indicator.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-line truncate h-10">{indicator.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} title={t('like_tooltip')} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Rocket size={16} className={isLiked ? 'text-green-500 fill-current' : ''} />
                            <span>{likes}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onIdeaClick(); }} title={t('comment_tooltip')} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <MessageCircle size={16} />
                            {indicator.comments > 0 && <span>{indicator.comments}</span>}
                        </button>
                    </div>
                    <div>
                        <span>{indicator.author} </span>
                        <span className="text-cyan-600 dark:text-cyan-400 mx-1">•</span>
                        <span>{indicator.date}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const IndicatorsAndStrategies = ({ indicatorsData, onIdeaClick, onTitleClick }) => {
    const { t, language } = useLanguage();
    const tabsValue = t('indicators_strategies_tabs');
    const tabs = Array.isArray(tabsValue) ? tabsValue : [];
    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[tabs.length - 1] : '');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320 + 24; // card width (w-80) + gap (gap-6)
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <div className="mb-4">
                <button onClick={onTitleClick} className="w-full text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('indicators_strategies_title')} {language === 'ar' ? '<' : '>'}</h2>
                </button>
                <div className="flex gap-2 justify-start overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-gray-200 dark:bg-[#2A2E39] text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-[#1C2331] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{tab}</button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-[#1C2331] rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {indicatorsData.map(indicator => <IndicatorCard key={indicator.id} indicator={indicator} onIdeaClick={onIdeaClick} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-[#1C2331] rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
            <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('read_more_link')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
}