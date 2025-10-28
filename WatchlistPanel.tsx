/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage, SUPPORTED_CURRENCIES } from '../i18n/LanguageContext';
import { PieChart, Plus, ChevronDown, MoreHorizontal, LayoutDashboard } from 'lucide-react';
import { StockDetailPanel } from './StockDetailPanel';
import type { WatchlistData } from '../data/watchlistData';
import { CurrencyIcon } from './CurrencyIcon';
import { SymbolIcon } from './SymbolIcon';
import { WatchlistSettingsModal } from './WatchlistSettingsModal';

const exchangeRatesToUSD = {
    'USD': 1,
    'SAR': 0.266,
    'EUR': 1.08,
    'JPY': 0.0064,
    'GBP': 1.27,
    'INR': 0.012,
    'USDT': 1,
    'CAD': 0.73,
    'CHF': 1.11,
};

const convertCurrency = (amount, from, to) => {
    if (!from || !to || !exchangeRatesToUSD[from] || !exchangeRatesToUSD[to] || typeof amount !== 'number' || isNaN(amount)) {
        return amount;
    }
    const amountInUSD = amount * exchangeRatesToUSD[from];
    return amountInUSD / exchangeRatesToUSD[to];
};

const formatCurrency = (amount, currency) => {
    if(typeof amount !== 'number' || isNaN(amount)) return '-';
    const options: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    if (currency === 'JPY') {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    } else if (Math.abs(amount) < 0.01 && Math.abs(amount) > 0) {
        options.maximumFractionDigits = 6;
    } else if (Math.abs(amount) < 1) {
        options.maximumFractionDigits = 4;
    }
    return new Intl.NumberFormat('en-US', options).format(amount);
};

const CollapsibleCategoryHeader = ({ title, isOpen, toggle }) => {
    return (
        <tr className="bg-white dark:bg-black sticky top-0 z-10">
            <td colSpan={6} className="py-0 px-2">
                <button onClick={toggle} className="flex justify-between items-center w-full h-8 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span>{title}</span>
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </td>
        </tr>
    );
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const WatchlistItemRow = (props) => {
    const { item, isSelected, onSelect, settings, t, currency, updatedSymbols } = props;
    const isPositive = item.change >= 0;
    const isUpdated = updatedSymbols.has(item.key);
    const animationClass = isUpdated ? (isPositive ? 'animate-price-up' : 'animate-price-down') : '';


    const renderSymbol = () => {
        if (settings.symbolDisplay === 'description') {
            return (
                <div className="text-sm text-gray-900 dark:text-white font-semibold truncate text-right rtl:text-left px-2">
                    {t(item.nameKey)}
                </div>
            );
        }

        const showLogo = settings.symbolDisplay === 'logo';
        
        return (
            <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-1.5 text-sm">
                    {item.prefixType === 'dot' && <span className="text-orange-500 dark:text-orange-400">●</span>}
                    <span className="font-semibold text-gray-900 dark:text-white">{item.symbol}</span>
                    {item.badge && <div className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>{item.badge}</div>}
                </div>
                {showLogo && <SymbolIcon symbol={item.symbol} size={24} />}
            </div>
        );
    };
    
    return (
        <tr onClick={onSelect} className={`border-b border-gray-200 dark:border-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/40 cursor-pointer ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''} ${animationClass}`}>
            <td className="p-2.5">{renderSymbol()}</td>
            {settings.columns.lastPrice && <td className={`p-2.5 text-sm font-mono text-right rtl:text-left ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{item.price}</td>}
            {settings.columns.change && <td className={`p-2.5 text-sm font-mono text-right rtl:text-left ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{formatCurrency(item.change, currency)}</td>}
            {settings.columns.changePct && (
                <td className={`p-2.5 text-sm font-mono text-right rtl:text-left ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end gap-2">
                        <span>{Number(item.changePct).toFixed(2)}%</span>
                        {item.dividend && <span className="text-yellow-500 dark:text-yellow-400 font-bold text-xs">{t('badge_dividend')}</span>}
                    </div>
                </td>
            )}
            {settings.columns.volume && <td className="p-2.5 text-sm text-gray-900 dark:text-white font-mono text-right rtl:text-left">-</td>}
            {settings.columns.extendedHours && <td className="p-2.5 text-sm text-gray-900 dark:text-white font-mono text-right rtl:text-left">-</td>}
        </tr>
    );
};


export const WatchlistPanel = ({ isOpen, onAddSectionClick, onAddSymbolClick, watchlistData, detailedWatchlistData, updatedSymbols }: {
    isOpen: boolean;
    onAddSectionClick: () => void;
    onAddSymbolClick: () => void;
    watchlistData: WatchlistData;
    detailedWatchlistData: any;
    updatedSymbols: Set<string>;
}) => {
    const { t, language, currency, setCurrency } = useLanguage();
    const [openSections, setOpenSections] = useState(new Set(['indices', 'stocks', 'forex', 'futures', 'crypto']));
    const [selectedRowKey, setSelectedRowKey] = useState('AAPL');
    const [topPanelHeight, setTopPanelHeight] = useState(400);
    const [isDragging, setIsDragging] = useState(false);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const [isWatchlistSettingsModalOpen, setIsWatchlistSettingsModalOpen] = useState(false);
    
    const [settings, setSettings] = useState({
        showTable: true,
        columns: {
            lastPrice: true,
            change: true,
            changePct: true,
            volume: false,
            extendedHours: false,
        },
        symbolDisplay: 'logo', // 'logo', 'symbol', 'description'
        sections: {
            indices: true,
            stocks: true,
            forex: true,
            futures: true,
            crypto: true,
        },
    });

    const panelContainerRef = useRef<HTMLDivElement>(null);
    const bottomPanelRef = useRef<HTMLDivElement>(null);
    const currencyDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
                setIsCurrencyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency as any);
        setIsCurrencyDropdownOpen(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setTopPanelHeight(prevHeight => {
                const newHeight = prevHeight + e.movementY;
                const containerHeight = panelContainerRef.current?.clientHeight || window.innerHeight;
                const minHeight = 150;
                const maxHeight = containerHeight - 200; // Leave 200px for bottom panel
                return Math.max(minHeight, Math.min(newHeight, maxHeight));
            });
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const toggleSection = (sectionKey) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionKey)) {
                newSet.delete(sectionKey);
            } else {
                newSet.add(sectionKey);
            }
            return newSet;
        });
    };

    const handleSelectRow = (key) => {
        setSelectedRowKey(key);
        if (bottomPanelRef.current) {
            bottomPanelRef.current.scrollTop = 0;
        }
    };
    
    if (!isOpen) {
        return null;
    }

    const allItems = Object.values(watchlistData).flatMap(category => category.items);
    const selectedItem = allItems.find(item => item.key === selectedRowKey);
    const selectedDetails = detailedWatchlistData[selectedRowKey];
    const selectedData = selectedItem ? { ...selectedItem, ...selectedDetails } : null;

    const animationClass = `animate-slide-in-up-full lg:animate-none ${language === 'ar' ? 'lg:animate-slide-in-left' : 'lg:animate-slide-in-right'}`;

    return (
        <>
            <aside ref={panelContainerRef} className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[var(--panel-width)] bg-white dark:bg-black text-gray-900 dark:text-white flex-shrink-0 border-l border-gray-200 dark:border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-900">
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                            <PieChart size={20} />
                        </button>
                        <h2 className="font-bold">{t('watchlist_panel_title')}</h2>
                        <ChevronDown size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={currencyDropdownRef}>
                            <button onClick={() => setIsCurrencyDropdownOpen(p => !p)} className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">
                                <CurrencyIcon code={currency} size={16} />
                                <span>{currency}</span>
                                <ChevronDown size={16} />
                            </button>
                            {isCurrencyDropdownOpen && (
                                <div className="absolute top-full mt-2 end-0 bg-white dark:bg-gray-800 rounded-md shadow-lg w-32 py-1 z-20 ring-1 ring-black/5 dark:ring-white/10">
                                    {Array.from(SUPPORTED_CURRENCIES).map(c => (
                                        <button key={c} onClick={() => handleCurrencyChange(c as any)} className="w-full text-start px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2">
                                            <CurrencyIcon code={c} size={16} />
                                            <span>{c}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onAddSectionClick} title={t('add_section_button_tooltip')} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md hover:text-gray-900 dark:hover:text-white">
                            <LayoutDashboard size={20} />
                        </button>
                        <button onClick={() => setIsWatchlistSettingsModalOpen(true)} title={t('watchlist_settings_tooltip')} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                            <MoreHorizontal size={20} />
                        </button>
                        <button onClick={onAddSymbolClick} title={t('add_symbol_tooltip')} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Resizable Content */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Top Panel (Watchlist) */}
                    <div style={{ height: `${topPanelHeight}px` }} className="overflow-y-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-white dark:bg-black z-20">
                                <tr className="text-gray-500 dark:text-gray-500 text-xs font-semibold">
                                    <th className="p-2 text-right">{t('watchlist_symbol_header')}</th>
                                    {settings.columns.lastPrice && <th className="p-2 text-right rtl:text-left">{t('watchlist_last_price_header')} ({currency})</th>}
                                    {settings.columns.change && <th className="p-2 text-right rtl:text-left">{t('watchlist_change_header')}</th>}
                                    {settings.columns.changePct && <th className="p-2 text-right rtl:text-left">{t('watchlist_change_pct_header')}</th>}
                                    {settings.columns.volume && <th className="p-2 text-right rtl:text-left">{t('watchlist_settings_col_volume')}</th>}
                                    {settings.columns.extendedHours && <th className="p-2 text-right rtl:text-left">{t('watchlist_settings_col_extended_hours')}</th>}
                                </tr>
                            </thead>
                            {Object.entries(watchlistData)
                                .filter(([key]) => settings.sections?.[key] ?? true)
                                .map(([key, section]) => (
                                <tbody key={key}>
                                    <CollapsibleCategoryHeader
                                        title={t(section.titleKey)}
                                        isOpen={openSections.has(key)}
                                        toggle={() => toggleSection(key)}
                                    />
                                    {openSections.has(key) && section.items.map(item => {
                                        const priceNum = parseFloat(item.price.replace(/,/g, ''));
                                        const convertedPrice = convertCurrency(priceNum, item.currency, currency);
                                        const convertedChange = convertCurrency(item.change, item.currency, currency);
                                        
                                        const convertedItem = {
                                            ...item,
                                            price: formatCurrency(convertedPrice, currency),
                                            change: convertedChange,
                                        };
                                        
                                        return (
                                            <WatchlistItemRow
                                                key={item.key}
                                                item={convertedItem}
                                                isSelected={selectedRowKey === item.key}
                                                onSelect={() => handleSelectRow(item.key)}
                                                settings={settings}
                                                t={t}
                                                currency={currency}
                                                updatedSymbols={updatedSymbols}
                                            />
                                        );
                                    })}
                                </tbody>
                            ))}
                        </table>
                    </div>

                    {/* Draggable Handle */}
                    <div
                        onMouseDown={handleMouseDown}
                        className="flex-shrink-0 h-3 bg-gray-100 dark:bg-gray-900 hover:bg-cyan-200 dark:hover:bg-cyan-700 cursor-ns-resize transition-colors group hidden lg:flex items-center justify-center"
                        aria-label="Resize panel"
                    >
                        <div className="h-1 w-10 bg-gray-300 dark:bg-gray-600 group-hover:bg-cyan-400 dark:group-hover:bg-cyan-400 rounded-full"></div>
                    </div>

                    {/* Bottom Panel (Financial Analysis) */}
                    <div ref={bottomPanelRef} className="flex-1 overflow-y-auto custom-scrollbar">
                        <StockDetailPanel data={selectedData} />
                    </div>
                </div>
            </aside>
            <WatchlistSettingsModal
                isOpen={isWatchlistSettingsModalOpen}
                onClose={() => setIsWatchlistSettingsModalOpen(false)}
                settings={settings}
                setSettings={setSettings}
                watchlistData={watchlistData}
            />
        </>
    );
};