/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Globe, ChevronRight, Settings, Crown, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const marketData = [
    { regionKey: 'market_selector_region_all', countries: [
        { key: 'world', countryKey: 'country_world', flag: <Globe size={24} className="text-gray-500 dark:text-gray-400"/> },
    ]},
    { regionKey: 'market_selector_region_north_america', countries: [
        { key: 'us', countryKey: 'country_usa', flagCode: 'us' },
        { key: 'ca', countryKey: 'country_canada', flagCode: 'ca' },
    ]},
    { regionKey: 'market_selector_region_europe', countries: [
        { key: 'gb', countryKey: 'country_uk', flagCode: 'gb' },
        { key: 'de', countryKey: 'country_germany', flagCode: 'de' },
        { key: 'fr', countryKey: 'country_france', flagCode: 'fr' },
    ]},
    { regionKey: 'market_selector_region_asia', countries: [
        { key: 'sa', countryKey: 'country_saudi', flagCode: 'sa' },
        { key: 'in', countryKey: 'country_india', flagCode: 'in' },
        { key: 'jp', countryKey: 'country_japan', flagCode: 'jp' },
        { key: 'cn', countryKey: 'country_china', flagCode: 'cn' },
        { key: 'hk', countryKey: 'country_hk', flagCode: 'hk', noFlag: true },
    ]},
];

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const MarketItem = (props) => {
    const { item, t, onMarketSelect } = props;
    return (
        <button className="flex items-center gap-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 px-4 rounded-md cursor-pointer w-full text-left"
             onClick={() => onMarketSelect(item)}>
            {item.flag ? item.flag : (
                item.noFlag ? <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div> :
                 <img
                    src={`https://flagcdn.com/w40/${item.flagCode}.png`}
                    width="24"
                    height="24"
                    alt={`${t(item.countryKey)} flag`}
                    className="rounded-full object-cover w-6 h-6"
                />
            )}
            <div className="flex-1">
                <span className="text-gray-900 dark:text-gray-100 dark:text-white font-medium">{t(item.countryKey)}</span>
            </div>
        </button>
    );
}

const ToggleSwitch = ({ id, checked, onChange }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
);

export const MarketSelectorModal = ({ isOpen, onClose, onMarketSelect, anchorEl }) => {
    const { t, language } = useLanguage();
    const modalRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPrimaryList, setIsPrimaryList] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorEl]);

    const filteredMarketData = useMemo(() => {
        if (!searchTerm) return marketData;
        
        return marketData.map(region => {
            const filteredCountries = region.countries.filter(country => 
                t(country.countryKey).toLowerCase().includes(searchTerm.toLowerCase())
            );
            return { ...region, countries: filteredCountries };
        }).filter(region => region.countries.length > 0);

    }, [searchTerm, t]);

    const style: React.CSSProperties = useMemo(() => {
        const baseStyle: React.CSSProperties = { position: 'absolute' };
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            if (language === 'ar') {
                return {
                    ...baseStyle,
                    top: `${rect.bottom + 8}px`,
                    right: `${window.innerWidth - rect.right}px`,
                };
            } else {
                return {
                    ...baseStyle,
                    top: `${rect.bottom + 8}px`,
                    left: `${rect.left}px`,
                };
            }
        }
        return baseStyle;
    }, [anchorEl, language]);

    if (!isOpen)
        return null;

    return createPortal(
        <div 
            ref={modalRef}
            style={style}
            className="z-30 w-80 bg-white dark:bg-gray-900 dark:bg-black rounded-lg shadow-2xl flex flex-col text-gray-900 dark:text-gray-100 dark:text-white animate-fade-in-up border border-gray-200 dark:border-gray-700 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-3 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">{t('screener_filter_market')}</h3>
            </header>
            <main className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[400px]">
                {filteredMarketData.map(region => (
                    region.countries.map(country => (
                        <MarketItem key={country.key} item={country} t={t} onMarketSelect={onMarketSelect} />
                    ))
                ))}
            </main>
            <footer className="p-3 border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 space-y-3">
                 <button className="w-full flex justify-between items-center text-left text-gray-900 dark:text-gray-100 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                        <Settings size={20} className="text-gray-500 dark:text-gray-400"/>
                        <span>{t('country_more_markets')}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                </button>
                <div className="w-full flex justify-between items-center p-2">
                    <div className="flex items-center gap-3">
                        <Crown size={20} className="text-yellow-400"/>
                        <span className="text-gray-900 dark:text-gray-100 dark:text-white">{t('country_primary_list')}</span>
                         <Info size={16} className="text-gray-500" />
                    </div>
                    <ToggleSwitch id="primary-list-toggle" checked={isPrimaryList} onChange={() => setIsPrimaryList(p => !p)} />
                </div>
            </footer>
        </div>,
        document.body
    );
};