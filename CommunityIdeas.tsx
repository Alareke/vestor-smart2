/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare as MessageIcon, PlayCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const IdeaCard = (props) => {
    const { idea, onIdeaClick } = props;
    const { t, language } = useLanguage();
    const [likeCount, setLikeCount] = useState(idea.likes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = (e) => {
        e.stopPropagation();
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        setIsLiked(!isLiked);
    };
    
    const handleCommentClick = (e) => {
        e.stopPropagation();
        onIdeaClick();
    }

    const hasVideo = idea.mediaType === 'video' || idea.videoUrl;

    return (
        <div
            onClick={onIdeaClick}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg w-72 sm:w-80 flex-shrink-0 overflow-hidden group transition-transform duration-300 hover:-translate-y-2 shadow-sm dark:shadow-none cursor-pointer">
            <div className="relative overflow-hidden">
                {idea.isImageLoading ? (
                     <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-500" />
                     </div>
                ) : idea.mediaType === 'video' ? (
                    <video src={idea.img} className="w-full h-40 object-cover" muted loop playsInline />
                ) : (
                    <img src={idea.img || DEFAULT_NEWS_IMAGE_URL} alt={idea.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async"
                        onError={(e) => {
                            if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                                e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                            }
                        }}
                    />
                )}
                {hasVideo && !idea.isImageLoading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={48} className="text-white/80" />
                    </div>
                )}
                {idea.cornerBadge && (
                    <div className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'} bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                        {idea.cornerBadge}
                    </div>
                )}
                {idea.badge && (
                    <div className={`absolute bottom-2 ${language === 'ar' ? 'left-2' : 'right-2'} w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${idea.badgeColor} ${idea.badgeTextColor}`}>
                        {idea.badge}
                    </div>
                )}
                {idea.badgeIcon && (
                    <div className={`absolute bottom-2 ${language === 'ar' ? 'left-2' : 'right-2'} w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg ${idea.badgeColor} ${idea.badgeTextColor}`}>
                        {idea.badgeIcon}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-md truncate">{idea.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 h-[60px] line-clamp-3">{idea.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                    <div>
                        <span>{t('idea_by')} </span>
                        <span className="text-cyan-600 dark:text-cyan-400">{idea.author}</span>
                        <span className="mx-2">•</span>
                        <span>{idea.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLikeClick} title={t('like_tooltip')} className={`flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors ${isLiked ? 'text-green-500 dark:text-green-400' : ''}`}>
                            <Rocket size={16} className={isLiked ? 'fill-current' : ''} />
                            <span>{likeCount}</span>
                        </button>
                        <button onClick={handleCommentClick} className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors" title={t('comment_tooltip')}>
                            <MessageIcon size={16} />
                            {idea.comments > 0 && <span>{idea.comments}</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const CommunityIdeas = ({ communityIdeasData, onIdeaClick, onTitleClick }) => {
    const { t, language } = useLanguage();
    const communityTabsValue = t('community_tabs');
    const communityTabs = Array.isArray(communityTabsValue) ? communityTabsValue : [];
    const [activeTab, setActiveTab] = useState(communityTabs.length > 0 ? communityTabs[communityTabs.length - 1] : '');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320 + 16; // card width (w-80) + gap (gap-4)
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <button onClick={onTitleClick} className="block w-full text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('communityIdeas_title')} {language === 'ar' ? '<' : '>'}</h2>
            </button>
            <div className="flex gap-2 mb-4 justify-start overflow-x-auto no-scrollbar">
                {communityTabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} title={t('tooltip_select_category', { category: tab })} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>{tab}</button>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {communityIdeasData.map(idea => <IdeaCard key={idea.id} idea={idea} onIdeaClick={onIdeaClick} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
             <div className="text-center mt-6">
                <button onClick={onTitleClick} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('read_more_link')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
        </section>
    );
}