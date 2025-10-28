/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { X, CheckSquare, Settings, Bell, ChevronDown } from 'lucide-react';

export const NotificationsPanel = ({ isOpen, onClose, onOpenSettings }) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('all');
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

    return (
        <aside className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[var(--panel-width)] bg-[#0a0a0a] text-white flex-shrink-0 border-l border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
            <header className="flex-shrink-0 p-3 border-b border-black flex items-center justify-between bg-[#171717]">
                <div className="flex items-center gap-2">
                    <button onClick={onOpenSettings} title={t('notifications_settings_tooltip')} className="p-1.5 hover:bg-gray-700 rounded-md"><Settings size={20} /></button>
                    <button title={t('notifications_mark_all_read_tooltip')} className="p-1.5 hover:bg-gray-700 rounded-md"><CheckSquare size={20} /></button>
                </div>
                <h3 className="font-bold text-white">{t('notifications_panel_title')}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full cursor-pointer"><X size={18} /></button>
            </header>

            <div className="flex-shrink-0 p-3 border-b border-black flex items-center gap-2 flex-wrap">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'all' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('notifications_tab_all')}</button>
                <button onClick={() => setActiveTab('comments')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'comments' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('notifications_tab_comments')}</button>
                <button onClick={() => setActiveTab('mentions')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'mentions' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('notifications_tab_mentions')}</button>
                <button onClick={() => setActiveTab('following')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === 'following' ? 'bg-white text-black' : 'bg-[#262626] text-gray-300'}`}>{t('notifications_tab_following')}</button>
                <div className="relative" ref={moreMenuRef}>
                    <button
                        onClick={() => setIsMoreMenuOpen(p => !p)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#262626] text-gray-300"
                    >
                        {t('notifications_tab_more')}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMoreMenuOpen && (
                        <div className="absolute top-full mt-2 start-0 bg-[#262626] rounded-md shadow-lg w-40 z-10 border border-black p-1">
                            {/* Placeholder for more options */}
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell size={48} className="text-gray-600" />
                    </div>
                    <p>{t('notifications_empty_message')}</p>
                </div>
            </main>
        </aside>
    );
};