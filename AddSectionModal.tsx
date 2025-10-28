/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const sectionList = [
    { key: 'personalizedBriefing', nameKey: 'section_personalized_briefing' },
    { key: 'aiSuggestions', nameKey: 'section_ai_suggestions' },
    { key: 'marketSummary', nameKey: 'section_market_summary' },
    { key: 'communityIdeas', nameKey: 'section_community_ideas' },
    { key: 'indicatorsAndStrategies', nameKey: 'section_indicators_and_strategies' },
    { key: 'saudiStocks', nameKey: 'section_saudi_stocks' },
    { key: 'tradingAnalysis', nameKey: 'section_trading_analysis' },
    { key: 'topPerformingStocks', nameKey: 'section_top_performing_stocks' },
    { key: 'performanceStocks', nameKey: 'section_performance_stocks' },
    { key: 'dividendSchedule', nameKey: 'section_dividend_schedule' },
    { key: 'usStockNews', nameKey: 'section_us_stock_news' },
    { key: 'digitalCurrencies', nameKey: 'section_digital_currencies' },
    { key: 'digitalCurrencyAnalysis', nameKey: 'section_digital_currency_analysis' },
    { key: 'digitalCurrencyPerformance', nameKey: 'section_digital_currency_performance' },
    { key: 'digitalCurrencyNews', nameKey: 'section_digital_currency_news' },
    { key: 'futuresAnalysis', nameKey: 'section_futures_analysis' },
    { key: 'futuresContracts', nameKey: 'section_futures_contracts' },
    { key: 'futuresNews', nameKey: 'section_futures_news' },
    { key: 'forexAnalysis', nameKey: 'section_forex_analysis' },
    { key: 'forexHeatmap', nameKey: 'section_forex_heatmap' },
    { key: 'forexNews', nameKey: 'section_forex_news' },
    { key: 'economicCalendar', nameKey: 'section_economic_calendar' },
    { key: 'brokers', nameKey: 'section_brokers' },
    { key: 'inflationMap', nameKey: 'section_inflation_map' },
];

const ToggleSwitch = ({ id, checked, onChange }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
);


export const AddSectionModal = ({ isOpen, onClose, sections, toggleSection, resetSections }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const modalRef = useRef(null);

    const filteredSections = useMemo(() => {
        if (!searchTerm) return sectionList;
        return sectionList.filter(section =>
            t(section.nameKey).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, t]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        modalRef.current?.querySelector('input')?.focus();
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 dark:bg-[#1C2331] rounded-xl shadow-2xl w-full max-w-lg mx-auto flex flex-col h-[90vh] max-h-[700px]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-white">{t('add_section_modal_title')}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('add_section_modal_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-100 dark:bg-[#131722] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 dark:text-gray-300 placeholder-gray-500 rounded-lg py-2.5 ps-10 pe-4 w-full focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-500" size={20} />
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredSections.map(section => (
                        <div key={section.key} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                            <span className="text-gray-900 dark:text-gray-100 dark:text-white font-medium">{t(section.nameKey)}</span>
                            <ToggleSwitch
                                id={`section-toggle-${section.key}`}
                                checked={!!sections[section.key]}
                                onChange={() => toggleSection(section.key)}
                            />
                        </div>
                    ))}
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 text-center">
                    <button
                        onClick={() => {
                            resetSections();
                            onClose();
                        }}
                        className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold hover:underline"
                    >
                        {t('add_section_modal_reset_button')}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};