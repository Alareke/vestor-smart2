/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
// FIX: Import Bot icon and use it for chat to ensure consistency. Remove unused MessageSquare.
// FIX: Import BrainCircuit icon for the Developer i18n Inspector button.
import { Bookmark, Clock, Calendar, Rss, Bell, HelpCircle, Grid3x3, Radar, CodeXml, Languages, Bot, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useDeveloperMode } from '../i18n/DeveloperModeContext';

// FIX: Added onOpenI18nInspector to props to fix type error.
export const RightToolbar = ({ activePanel, setActivePanel, onOpenTranslateModal, onOpenI18nInspector }) => {
  const { t } = useLanguage();
  const { isDevMode, toggleDevMode } = useDeveloperMode();

  const topIcons = [
    { id: 'watchlist', icon: Bookmark, 'aria-label-key': 'watchlist_tooltip' },
    // FIX: Changed 'history' to 'activity' to match the panel component and translation key.
    { id: 'activity', icon: Clock, 'aria-label-key': 'my_activity_tooltip' },
    { id: 'chat', icon: Bot, 'aria-label-key': 'chat_tooltip' },
  ];
  const middleIcons = [
    { id: 'calendar', icon: Calendar, 'aria-label-key': 'calendar_tooltip' },
    { id: 'translate', icon: Languages, 'aria-label-key': 'translate_tooltip' },
    { id: 'apps', icon: Grid3x3, 'aria-label-key': 'apps_tooltip' },
  ];
  const bottomIcons = [
    { id: 'social', icon: Rss, 'aria-label-key': 'social_tooltip' },
    { id: 'alerts', icon: Bell, 'aria-label-key': 'alerts_tooltip' },
    { id: 'help', icon: HelpCircle, 'aria-label-key': 'help_tooltip' },
  ];

  const IconButton = (props: any) => {
    const { item } = props;
    const isActive = item.id === activePanel;
    const tooltipText = t(item['aria-label-key']);
    return (
      <button
        key={item.id}
        onClick={() => {
          if (item.id === 'translate') {
            onOpenTranslateModal();
          } else {
            setActivePanel(isActive ? null : item.id);
          }
        }}
        aria-label={tooltipText}
        title={tooltipText}
        className={`p-3 my-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 
        ${isActive ? 'bg-blue-600 text-white dark:bg-blue-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
      >
        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      </button>
    );
  };

  const DevModeButton = () => {
    const isActive = isDevMode;
    const tooltipText = t('dev_mode_tooltip');
    return (
      <button
        onClick={toggleDevMode}
        title={tooltipText}
        aria-label={tooltipText}
        className={`p-3 my-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 
        ${isActive ? 'bg-cyan-400 text-black dark:bg-cyan-500 dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
      >
        <CodeXml size={22} strokeWidth={isActive ? 2.5 : 2} />
      </button>
    );
  };
  
  const I18nInspectorButton = () => {
    const tooltipText = t('i18n_inspector_tooltip');
    return (
      <button
        onClick={onOpenI18nInspector}
        title={tooltipText}
        aria-label={tooltipText}
        className={`p-3 my-1 rounded-full text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-200`}
      >
        <BrainCircuit size={22} strokeWidth={2.5} />
      </button>
    );
  }

  const screenerIcon = { id: 'screener', icon: Radar, 'aria-label-key': 'radar_tooltip' };

  return (
    <aside className="h-screen bg-white dark:bg-black p-2 hidden lg:flex flex-col items-center justify-between sticky top-0 border-l border-gray-200 dark:border-gray-900">
      <div className="flex flex-col items-center">
        {topIcons.map(item => <IconButton key={item.id} item={item} />)}
        <hr className="w-8/12 my-2 border-t border-gray-200 dark:border-gray-700" />
        <IconButton item={screenerIcon} />
        {middleIcons.map(item => <IconButton key={item.id} item={item} />)}
      </div>
      <div className="flex flex-col items-center">
        <hr className="w-8/12 mb-2 border-t border-gray-200 dark:border-gray-700" />
        {bottomIcons.map(item => <IconButton key={item.id} item={item} />)}
        <DevModeButton />
        {isDevMode && <I18nInspectorButton />}
      </div>
    </aside>
  );
};