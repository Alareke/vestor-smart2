/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Bookmark, Clock, Bot, Radar, CalendarDays, Rss, Bell, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// FIX: Added onOpenTranslateModal and onOpenI18nInspector props to fix type error.
export const MobileToolbar = ({ activePanel, setActivePanel, onOpenTranslateModal, onOpenI18nInspector }) => {
  const { t } = useLanguage();

  const icons = [
    { id: 'watchlist', icon: Bookmark, 'aria-label-key': 'watchlist_tooltip' },
    { id: 'activity', icon: Clock, 'aria-label-key': 'my_activity_tooltip' },
    { id: 'chat', icon: Bot, 'aria-label-key': 'chat_tooltip' },
    { id: 'screener', icon: Radar, 'aria-label-key': 'radar_tooltip' },
    { id: 'calendar', icon: CalendarDays, 'aria-label-key': 'calendar_tooltip' },
    { id: 'social', icon: Rss, 'aria-label-key': 'social_tooltip' },
    { id: 'alerts', icon: Bell, 'aria-label-key': 'alerts_tooltip' },
    { id: 'help', icon: HelpCircle, 'aria-label-key': 'help_tooltip' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-2 flex justify-around items-center z-40 lg:hidden">
      {icons.map(item => {
        const isActive = activePanel === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePanel(isActive ? null : item.id)}
            aria-label={t(item['aria-label-key'])}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-16 h-14 ${
              isActive 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-semibold">{t(item['aria-label-key'])}</span>
          </button>
        );
      })}
    </div>
  );
};