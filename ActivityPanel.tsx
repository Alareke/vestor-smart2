/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Eye, Save, Pencil, ListFilter, Activity } from 'lucide-react';

interface ActivityPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const activityData = [
    { type: 'view', target: 'AAPL', icon: Eye, time: '2m ago', textKey: 'activity_viewed_stock', stock: 'AAPL' },
    { type: 'save', target: 'Market Outlook Q3', icon: Save, time: '1h ago', textKey: 'activity_saved_article', article: 'Market Outlook Q3' },
    { type: 'modify', target: 'Bull Call Spread', icon: Pencil, time: '3h ago', textKey: 'activity_modified_strategy', strategy: 'Bull Call Spread' },
    { type: 'screener', target: 'US Stocks > $100', icon: ListFilter, time: 'yesterday', textKey: 'activity_ran_screener' },
    { type: 'view', target: 'TSLA', icon: Eye, time: 'yesterday', textKey: 'activity_viewed_stock', stock: 'TSLA' },
];

export const ActivityPanel = ({ isOpen, onClose }: ActivityPanelProps) => {
    const { t, language } = useLanguage();

    if (!isOpen) {
        return null;
    }

    const animationClass = `animate-slide-in-up-full lg:animate-none ${language === 'ar' ? 'lg:animate-slide-in-left' : 'lg:animate-slide-in-right'}`;

    return (
        <aside className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[var(--panel-width)] bg-white dark:bg-black text-white flex-shrink-0 border-l border-gray-200 dark:border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity size={20} />
                    {t('activity_panel_title')}
                </h2>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {activityData.length > 0 ? (
                    activityData.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                                <item.icon size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {t(item.textKey, { stock: item.stock, article: item.article, strategy: item.strategy })}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.time}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-20">
                        <Activity size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t('activity_no_recent_activity')}</p>
                    </div>
                )}
            </main>
        </aside>
    );
};