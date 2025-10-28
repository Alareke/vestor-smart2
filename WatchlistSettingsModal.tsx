/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#131722] rounded-lg">
        <span className="text-gray-900 dark:text-white font-semibold">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-900 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
    </div>
);

const CheckboxItem = (props: any) => {
    const { label, checked, onChange } = props;
    return (
    <div className="flex items-center justify-between py-2.5">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <label className="relative flex items-center justify-center w-5 h-5">
            <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" checked={checked} onChange={onChange} />
            <span className="w-5 h-5 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors peer-checked:bg-cyan-500 peer-checked:border-cyan-500"></span>
            <svg className="absolute w-4 h-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </label>
    </div>
);
};

const RadioItem = ({ label, name, value, checked, onChange }) => (
     <div className="flex items-center justify-between py-2.5">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <label className="relative flex items-center justify-center w-5 h-5">
            <input type="radio" name={name} value={value} className="absolute opacity-0 w-full h-full cursor-pointer peer" checked={checked} onChange={onChange} />
            <span className="w-5 h-5 bg-transparent border-2 border-gray-400 dark:border-gray-500 rounded-full transition-colors peer-checked:border-cyan-500"></span>
            <span className="absolute w-2.5 h-2.5 bg-cyan-500 rounded-full scale-0 transition-transform peer-checked:scale-100"></span>
        </label>
    </div>
);

export const WatchlistSettingsModal = ({ isOpen, onClose, settings, setSettings, watchlistData }) => {
    const { t } = useLanguage();
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleColumnChange = (key) => {
        setSettings(prev => ({ ...prev, columns: { ...prev.columns, [key]: !prev.columns[key] } }));
    };
    
    const handleSymbolDisplayChange = (e) => {
        setSettings(prev => ({ ...prev, symbolDisplay: e.target.value }));
    };

    const handleSectionChange = (key) => {
        setSettings(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [key]: !(prev.sections?.[key] ?? true)
            }
        }));
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-[#1C2331] rounded-xl shadow-2xl w-full max-w-sm mx-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('watchlist_settings_modal_title')}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-2">
                        <ToggleSwitch 
                            label={t('watchlist_settings_title')} 
                            checked={settings.showTable}
                            onChange={() => setSettings(prev => ({ ...prev, showTable: !prev.showTable }))}
                        />
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700/50" />
                    <div className="px-4 py-3">
                        <h4 className="text-xs text-gray-500 font-semibold mb-2">{t('watchlist_settings_customize_columns')}</h4>
                        <CheckboxItem label={t('watchlist_settings_col_last_price')} checked={settings.columns.lastPrice} onChange={() => handleColumnChange('lastPrice')} />
                        <CheckboxItem label={t('watchlist_settings_col_change')} checked={settings.columns.change} onChange={() => handleColumnChange('change')} />
                        <CheckboxItem label={t('watchlist_settings_col_change_pct')} checked={settings.columns.changePct} onChange={() => handleColumnChange('changePct')} />
                        <CheckboxItem label={t('watchlist_settings_col_volume')} checked={settings.columns.volume} onChange={() => handleColumnChange('volume')} />
                        <CheckboxItem label={t('watchlist_settings_col_extended_hours')} checked={settings.columns.extendedHours} onChange={() => handleColumnChange('extendedHours')} />
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700/50" />
                    <div className="px-4 py-3">
                        <h4 className="text-xs text-gray-500 font-semibold mb-2">{t('watchlist_settings_visible_sections')}</h4>
                        {Object.entries(watchlistData).map(([key, section]) => (
                            <CheckboxItem
                                key={key}
                                label={t((section as any).titleKey)}
                                checked={settings.sections?.[key] ?? true}
                                onChange={() => handleSectionChange(key)}
                            />
                        ))}
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700/50" />
                    <div className="px-4 py-3">
                        <h4 className="text-xs text-gray-500 font-semibold mb-2">{t('watchlist_settings_financial_symbol_display')}</h4>
                        <RadioItem label={t('watchlist_settings_display_logo')} name="symbolDisplay" value="logo" checked={settings.symbolDisplay === 'logo'} onChange={handleSymbolDisplayChange} />
                        <RadioItem label={t('watchlist_settings_display_symbol')} name="symbolDisplay" value="symbol" checked={settings.symbolDisplay === 'symbol'} onChange={handleSymbolDisplayChange} />
                        <RadioItem label={t('watchlist_settings_display_description')} name="symbolDisplay" value="description" checked={settings.symbolDisplay === 'description'} onChange={handleSymbolDisplayChange} />
                    </div>
                </main>
            </div>
        </div>,
        document.body
    );
};