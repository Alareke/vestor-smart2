/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme, type Theme } from '../i18n/ThemeContext';
import { Search, CornerDownLeft, Sun, Moon, Monitor, LayoutDashboard, Briefcase, GitBranch, CandlestickChart, Trophy, Globe, Newspaper, Building2, User } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, setMainView, setTheme, addSymbolToWatchlist, allSymbols }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const baseCommands = useMemo(() => [
        { group: t('cmd_group_navigation'), action: () => { setMainView('default'); onClose(); }, icon: LayoutDashboard, label: t('cmd_nav_dashboard') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('portfolio'); onClose(); }, icon: Briefcase, label: t('cmd_nav_portfolio') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('options'); onClose(); }, icon: GitBranch, label: t('cmd_nav_options') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('the_leap'); onClose(); }, icon: Trophy, label: t('cmd_nav_the_leap') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('markets'); onClose(); }, icon: Globe, label: t('cmd_nav_markets') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('news'); onClose(); }, icon: Newspaper, label: t('cmd_nav_news') },
        { group: t('cmd_group_navigation'), action: () => { setMainView('brokers_page'); onClose(); }, icon: Building2, label: t('cmd_nav_brokers') },
        
        { group: t('cmd_group_theme'), action: () => { setTheme('light'); onClose(); }, icon: Sun, label: t('cmd_theme_light') },
        { group: t('cmd_group_theme'), action: () => { setTheme('dark'); onClose(); }, icon: Moon, label: t('cmd_theme_dark') },
        { group: t('cmd_group_theme'), action: () => { setTheme('system'); onClose(); }, icon: Monitor, label: t('cmd_theme_system') },
    ], [t, setMainView, setTheme, onClose]);

    const symbolCommands = useMemo(() => {
        if (searchTerm.length < 1) return [];
        return allSymbols
            .filter(s => s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || t(s.nameKey).toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5)
            .map(s => ({
                group: t('cmd_group_symbols'),
                action: () => { addSymbolToWatchlist(s.symbol); onClose(); },
                icon: () => <img src={s.iconUrl} className="w-5 h-5 rounded-full" />,
                label: `${t('cmd_symbol_add')} '${s.symbol}' (${t(s.nameKey)})`
            }));
    }, [searchTerm, allSymbols, t, addSymbolToWatchlist, onClose]);

    const filteredCommands = useMemo(() => {
        if (searchTerm.length > 0 && symbolCommands.length > 0) {
            return symbolCommands;
        }
        if (searchTerm.length > 0) {
            return baseCommands.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return baseCommands;
    }, [searchTerm, baseCommands, symbolCommands]);
    
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setActiveIndex(0);
        } else {
            setSearchTerm('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[activeIndex]) {
                    filteredCommands[activeIndex].action();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, activeIndex]);
    
    useEffect(() => {
        resultsRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (!isOpen) return null;

    let lastGroup = '';

    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C2331] rounded-xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                    <Search size={20} className="text-gray-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('cmd_placeholder')}
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setActiveIndex(0); }}
                        className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
                    />
                    <div className="kbd-shortcut">ESC</div>
                </div>
                <div ref={resultsRef} className="max-h-[400px] overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((command, index) => {
                            const showGroup = command.group !== lastGroup;
                            lastGroup = command.group;
                            const Icon = command.icon;
                            return (
                                <React.Fragment key={command.label}>
                                    {showGroup && <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 pt-3 pb-1">{command.group}</h3>}
                                    <button
                                        onClick={command.action}
                                        className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors ${activeIndex === index ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}
                                        onMouseMove={() => setActiveIndex(index)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-white">{command.label}</span>
                                        </div>
                                        {activeIndex === index && <CornerDownLeft size={16} className="text-gray-500" />}
                                    </button>
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 p-8">{t('cmd_no_results')}</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};