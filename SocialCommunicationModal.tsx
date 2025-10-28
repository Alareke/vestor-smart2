/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { X, MoreHorizontal, MessageSquare, Rocket, ChevronDown } from 'lucide-react';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const socialData = [
    {
        id: 1,
        ticker: 'XAUUSD',
        flag: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
        type: 'IDEA',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
        authorKey: 'social_post1_author',
        dateKey: 'social_post1_date',
        contentKey: 'social_post1_content',
        comments: 1,
        likes: 8,
    },
    {
        id: 2,
        ticker: 'US30',
        flag: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
        type: 'IDEA',
        image: 'https://images.unsplash.com/photo-1612198332194-42713a5ac75d?q=80&w=800&auto=format&fit=crop',
        authorKey: 'social_post1_author',
        dateKey: 'social_post1_date',
        contentKey: 'social_post2_content',
        comments: 1,
        likes: 8,
    },
    {
        id: 3,
        ticker: 'US30',
        flag: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
        type: 'IDEA',
        image: 'https://i.ibb.co/bMSQqw4q/image.png',
        authorKey: 'social_post1_author',
        dateKey: 'social_post1_date',
        contentKey: 'social_post2_content',
        comments: 1,
        likes: 8,
    },
    {
        id: 4,
        ticker: 'US30',
        flag: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
        type: 'IDEA',
        image: 'https://i.ibb.co/bMSQqw4q/image.png',
        authorKey: 'social_post1_author',
        dateKey: 'social_post1_date',
        contentKey: 'social_post2_content',
        comments: 1,
        likes: 8,
    }
];

const SocialPostCard = (props: any) => {
    const { post, t } = props;
    return (
        <div className="bg-[#1e1e1e] border border-black rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <img src={post.flag} alt="flag" className="w-5 h-5 rounded-full" />
                    <span className="font-bold text-sm">{post.ticker}</span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{post.type}</span>
                </div>
                <MoreHorizontal size={20} className="text-gray-500" />
            </div>

            <img src={post.image || DEFAULT_NEWS_IMAGE_URL} alt="Post image" className="rounded-md w-full aspect-video object-cover mb-2" onError={(e) => {
                if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                  e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                }
            }}/>
            
            <p className="text-gray-300 text-sm mb-3">
                 <span className="text-red-500 me-1">✴</span>{t(post.contentKey)}
            </p>

            <div className="flex justify-between items-center text-gray-500 text-sm">
                <p>
                    <span className="text-white font-semibold">{t(post.authorKey)}</span>
                    <span className="mx-2">•</span>
                    <span>{t(post.dateKey)}</span>
                </p>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageSquare size={18} />
                        <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Rocket size={18} />
                        <span>{post.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


export const SocialCommunicationModal = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('for_you');
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    if (!isOpen) {
        return null;
    }

    const animationClass = `animate-slide-in-up-full lg:animate-none ${language === 'ar' ? 'lg:animate-slide-in-left' : 'lg:animate-slide-in-right'}`;


    const moreTabs = ['popular', 'your_posts'];
    const isMoreTabActive = moreTabs.includes(activeTab);

    return (
        <aside className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[var(--panel-width)] bg-[#0a0a0a] text-white flex-shrink-0 border-l border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
            <header className="flex-shrink-0 p-3 border-b border-black flex items-center justify-between bg-[#171717]">
                <div className="flex items-center gap-2">
                    <MoreHorizontal size={20} />
                    <h3 className="font-bold text-white">{t('social_modal_title')}</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full cursor-pointer"><X size={18} /></button>
            </header>

            <div className="flex-shrink-0 p-3 border-b border-black flex items-center gap-2 flex-wrap">
                <button onClick={() => setActiveTab('for_you')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'for_you' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('social_tab_for_you')}</button>
                <button onClick={() => setActiveTab('following')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'following' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('social_tab_following')}</button>
                <button onClick={() => setActiveTab('editors_picks')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'editors_picks' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('social_tab_editors_picks')}</button>
                <div className="relative" ref={moreMenuRef}>
                    <button
                        onClick={() => setIsMoreMenuOpen(p => !p)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${isMoreTabActive ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}
                    >
                        {t('social_tab_more')}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMoreMenuOpen && (
                        <div className="absolute top-full mt-2 start-0 bg-[#262626] rounded-md shadow-lg w-40 z-10 border border-black p-1">
                            <ul>
                                <li>
                                    <button
                                        onClick={() => { setActiveTab('popular'); setIsMoreMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-700/50 text-sm"
                                    >
                                        {t('social_tab_popular')}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { setActiveTab('your_posts'); setIsMoreMenuOpen(false); }}
                                        className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-700/50 text-sm"
                                    >
                                        {t('social_tab_your_posts')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {socialData.map(post => <SocialPostCard key={post.id} post={post} t={t} />)}
            </main>
        </aside>
    );
};