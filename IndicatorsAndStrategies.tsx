/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageCircle, Copy } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const IndicatorCard = (props: any) => {
    const { indicator } = props;
    const { t } = useLanguage();
    const [likes, setLikes] = useState(indicator.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [copyTooltip, setCopyTooltip] = useState(t('indicator_copy_tooltip'));

    const handleLike = () => {
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
        <div className="w-72 sm:w-80 flex-shrink-0 group">
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
                        <button onClick={() => console.log('Comment on:', indicator.title)} title={t('comment_tooltip')} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
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


export const IndicatorsAndStrategies = () => {
    const { t, language } = useLanguage();
    const tabs = t('indicators_strategies_tabs');
    const [activeTab, setActiveTab] = useState(tabs[tabs.length - 1]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const indicatorImages = [
        'https://images.unsplash.com/photo-1665686306574-1ace09918530?q=80&w=600&h=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&h=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560415755-bd80d06eda60?q=80&w=600&h=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1638368482963-94c036353364?q=80&w=600&h=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587614295999-6c1c13675123?q=80&w=600&h=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&h=400&auto=format&fit=crop',
    ];

    const indicatorsData = [
        { id: 1, title: t('indicator1_title'), author: t('indicator1_author'), date: t('indicator1_date'), likes: 41, comments: 2, description: t('indicator1_desc') },
        { id: 2, title: t('indicator2_title'), author: t('indicator2_author'), date: t('indicator2_date'), likes: 19, comments: 2, description: t('indicator2_desc') },
        { id: 3, title: t('indicator3_title'), author: t('indicator3_author'), date: t('indicator3_date'), likes: 428, comments: 2, description: t('indicator3_desc') },
        { id: 4, title: t('indicator4_title'), author: t('indicator4_author'), date: t('indicator4_date'), likes: 255, comments: 15, description: t('indicator4_desc') },
        { id: 5, title: t('indicator5_title'), author: t('indicator5_author'), date: t('indicator5_date'), likes: 310, comments: 28, description: t('indicator5_desc') },
        { id: 6, title: t('indicator6_title'), author: t('indicator6_author'), date: t('indicator6_date'), likes: 512, comments: 45, description: t('indicator6_desc') },
    ].map((indicator, index) => ({...indicator, img: indicatorImages[index % indicatorImages.length]}));


    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320 + 24; // card width (w-80) + gap (gap-6)
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section>
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('indicators_strategies_title')} {language === 'ar' ? '<' : '>'}</h2>
                <div className="flex gap-2 justify-start overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-gray-200 dark:bg-[#2A2E39] text-gray-900 dark:text-white' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{tab}</button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-[#1C2331] rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {indicatorsData.map(indicator => <IndicatorCard key={indicator.id} indicator={indicator} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-[#1C2331] rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
        </section>
    );
}