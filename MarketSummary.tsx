/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { SymbolIcon } from './SymbolIcon';

import { MainChart } from './MainChart';

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const StockTicker = (props) => {
    const { stock, onTickerChange, isFavorited, onToggleFavorite, t, animationClass } = props;
    const isPositive = parseFloat(stock.change) >= 0;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(stock.id);
    };
    
    const IconDisplay = () => {
        const size = window.innerWidth < 640 ? 32 : 40;
        return <SymbolIcon symbol={stock.id} size={size} />;
    };
    
    const numericValue = parseFloat(stock.value.replace(/,/g, ''));
    const numericChange = parseFloat(stock.change);
    const previousValue = numericValue - numericChange;
    const changePct = previousValue !== 0 ? (numericChange / previousValue) * 100 : 0;


    return (
        <button 
            onClick={() => onTickerChange(stock.id)} 
            title={t('tooltip_view_details_for', { item: t(stock.nameKey) })}
            className={`market-summary-card flex-shrink-0 w-32 h-32 p-3 sm:w-36 sm:h-36 md:w-44 md:h-44 sm:p-4 rounded-2xl flex flex-col justify-between transition-all duration-300 group ${animationClass} ${stock.selected ? 'market-summary-card-active' : ''}`}
        >
            <div className="flex justify-between items-start">
                <IconDisplay />
                <button 
                    onClick={handleFavoriteClick} 
                    title={isFavorited ? t('remove_from_favorites_tooltip') : t('add_to_favorites_tooltip')}
                    className={`p-1.5 rounded-full transition-all duration-200 ${isFavorited ? 'opacity-100 text-yellow-400 bg-yellow-400/10' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                >
                    <Bookmark size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
            </div>
            
            <div>
                <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">{t(stock.nameKey)}</h4>
                <p className="text-base sm:text-lg font-mono text-gray-900 dark:text-white mt-1">{stock.value}</p>
                <div className="flex items-center gap-2 text-sm font-mono mt-1">
                    <span className={isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}>{stock.change}</span>
                    <span className={isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}>
                        ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </button>
    );
}

export const MarketSummary = ({ data, activeTab, activeTicker, onTabChange, onTickerChange, chartData, tickerInfo, activeTimeframe, onTimeframeChange, favorites, onToggleFavorite }) => {
    const { t, language } = useLanguage();
    const { theme } = useTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const tabsContainerRef = useRef<HTMLDivElement>(null);

    const [underlineStyle, setUnderlineStyle] = useState({});
    const [marketTickers, setMarketTickers] = useState(data);
    const [animationState, setAnimationState] = useState<{ [key: string]: 'up' | 'down' | null }>({});
    
    const marketTabsValue = t('market_tabs');
    const marketTabs = Array.isArray(marketTabsValue) ? marketTabsValue : [];
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);


    useEffect(() => {
        setMarketTickers(data);
    }, [data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketTickers(prevData => {
                const newData = JSON.parse(JSON.stringify(prevData));
                Object.keys(newData).forEach(categoryKey => {
                    newData[categoryKey].forEach(ticker => {
                        if (Math.random() < 0.2) {
                            const currentValue = parseFloat(ticker.value.replace(/,/g, ''));
                            const randomChange = (Math.random() - 0.5) * (currentValue * 0.005);
                            const newValue = currentValue + randomChange;
                            const originalChangeValue = parseFloat(ticker.change);
                            const newChangeValue = originalChangeValue + randomChange;
                            
                            ticker.value = newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            ticker.change = `${newChangeValue >= 0 ? '+' : ''}${newChangeValue.toFixed(2)}`;
                            
                            setAnimationState(prevAnim => ({...prevAnim, [ticker.id]: randomChange >= 0 ? 'up' : 'down' }));
                            setTimeout(() => {
                                setAnimationState(prevAnim => ({...prevAnim, [ticker.id]: null }));
                            }, 500);
                        }
                    });
                });
                return newData;
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

     useEffect(() => {
        const activeTabIndex = marketTabs.findIndex(tab => tab.key === activeTab);
        const activeTabNode = tabsRef.current[activeTabIndex];
        if (activeTabNode && tabsContainerRef.current) {
            const containerRect = tabsContainerRef.current.getBoundingClientRect();
            const tabRect = activeTabNode.getBoundingClientRect();
            setUnderlineStyle({
                left: tabRect.left - containerRect.left + activeTabNode.parentElement.scrollLeft,
                width: tabRect.width,
            });
        }
    }, [activeTab, marketTabs, language]); // Rerun on language change

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    const displayedTickers = marketTickers[activeTab] || [];

    return (
        <section className="market-summary-section rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('marketSummary_title')}</h2>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-sm font-semibold text-red-500 dark:text-red-400">● {t('marketSummary_live')}</span>
                    </div>
                </div>

                <div ref={tabsContainerRef} className="relative border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                        {marketTabs.map((tab, index) => {
                            const count = data[tab.key]?.length || 0;
                            return (
                                <button
                                    ref={el => { tabsRef.current[index] = el; }}
                                    key={tab.key}
                                    onClick={() => onTabChange(tab.key)}
                                    title={t(tab.nameKey)}
                                    className={`px-2 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 relative z-10 ${activeTab === tab.key ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    {`${t(tab.nameKey)} (${count})`}
                                </button>
                            )
                        })}
                    </div>
                    <div className="absolute bottom-0 h-0.5 bg-cyan-500 transition-all duration-300" style={underlineStyle}></div>
                </div>
                
                <div className="mt-4 relative">
                        <div ref={scrollContainerRef} className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar -mx-2 px-2 py-2">
                            {displayedTickers.map(stock => (
                            <StockTicker key={stock.id} stock={{...stock, selected: stock.id === activeTicker}} onTickerChange={onTickerChange} isFavorited={favorites.has(stock.id)} onToggleFavorite={onToggleFavorite} t={t} animationClass={animationState[stock.id] ? (animationState[stock.id] === 'up' ? 'animate-price-up' : 'animate-price-down') : ''} />
                        ))}
                        </div>
                    <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-0' : 'left-0'} bg-white dark:bg-black/60 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors hidden sm:block`}>
                        {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-0' : 'right-0'} bg-white dark:bg-black/60 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors hidden sm:block`}>
                            {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <div className="mt-6">
                    <MainChart chartData={chartData} tickerInfo={tickerInfo} activeTimeframe={activeTimeframe} onTimeframeChange={onTimeframeChange} isDark={isDark} />
                </div>
            </div>
        </section>
    );
}