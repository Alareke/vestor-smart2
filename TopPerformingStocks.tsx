/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { StockPopover } from './StockPopover';
import { CurrencyIcon } from './CurrencyIcon';
import { SymbolIcon } from './SymbolIcon';

const StockItem = ({ stock, onMouseEnter, onMouseLeave, t }) => {
    const { language } = useLanguage();
    const isPositive = stock.change >= 0;

    return (
        <button 
            onMouseEnter={(e) => onMouseEnter(e, stock)}
            onMouseLeave={onMouseLeave}
            title={t('view_details_for_tooltip', { stock: stock.name })}
            className={`flex justify-between items-center py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors rounded-md px-2 w-full text-left ${language === 'ar' ? 'flex-row-reverse' : ''}`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <SymbolIcon symbol={stock.code} size={36} />
                <div className={`${language === 'ar' ? 'text-right' : 'text-left'} min-w-0`}>
                    <div className="flex items-center gap-1.5">
                       <h4 className="text-gray-900 dark:text-white font-semibold text-sm truncate">{stock.name}</h4>
                       <span className="text-gray-400 dark:text-gray-500">-</span>
                       <span className="text-yellow-500 dark:text-yellow-400 font-bold text-xs">{t('badge_dividend')}</span>
                    </div>
                    <span className="text-gray-500 text-xs font-mono">{stock.code}</span>
                </div>
            </div>

            <div className={`${language === 'ar' ? 'text-left' : 'text-right'} flex-shrink-0`}>
                <div className="flex items-center justify-end gap-1.5 text-sm">
                    <p className="text-gray-900 dark:text-white font-semibold">{stock.price.toFixed(2)}</p>
                    <CurrencyIcon code="SAR" size={14} title={t('currency_sar')} />
                </div>
                <p className={`font-semibold text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{isPositive ? '+' : ''}{stock.change.toFixed(2)}%</p>
            </div>
        </button>
    );
};

export const TopPerformingStocks = () => {
    const { t, language } = useLanguage();
    const [popoverState, setPopoverState] = useState({ visible: false, stock: null, style: {} });
    const popoverTimeoutRef = useRef(null);

    const handleMouseEnter = useCallback((event, stock) => {
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        const rect = event.currentTarget.getBoundingClientRect();
        const popoverWidth = 320; 
        const popoverHeight = 220;
        const gap = 8;
        
        let top = rect.top;
        if (top + popoverHeight > window.innerHeight) top = window.innerHeight - popoverHeight - gap;

        let left;
        if (language === 'ar') {
            left = rect.left - popoverWidth - gap;
            if (left < 0) left = rect.right + gap;
        } else {
            left = rect.right + gap;
            if (left + popoverWidth > window.innerWidth) left = rect.left - popoverWidth - gap;
        }

        setPopoverState({ visible: true, stock, style: { top: `${top}px`, left: `${left}px` } });
    }, [language]);

    const handleMouseLeave = useCallback(() => {
        popoverTimeoutRef.current = setTimeout(() => {
            setPopoverState(s => ({ ...s, visible: false, stock: null }));
        }, 200);
    }, []);

    const handlePopoverEnter = useCallback(() => {
         if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    }, []);

    const topGainers = {
        title: 'top_stocks_gainers_title',
        viewAllLink: 'top_stocks_gainers_link',
        stocks: [
            { nameKey: 'stock_amd_name', code: 'AMD', price: 160.25, change: 9.87, logo: 'https://s3-symbol-logo.tradingview.com/amd.svg' },
            { nameKey: 'stock_nflx_name', code: 'NFLX', price: 686.12, change: 8.51, logo: 'https://s3-symbol-logo.tradingview.com/netflix.svg' },
            { nameKey: 'screener_stock_name_lly', code: 'LLY', price: 757.91, change: 2.41, logo: 'https://s3-symbol-logo.tradingview.com/eli-lilly.svg' },
        ],
    };

    const mostVolatile = {
        title: 'top_stocks_volatile_title',
        viewAllLink: 'top_stocks_volatile_link',
        stocks: [
             { nameKey: 'stock_gme_name', code: 'GME', price: 25.46, change: 23.31, logo: 'https://s3-symbol-logo.tradingview.com/gamestop.svg' },
             { nameKey: 'stock_amc_name', code: 'AMC', price: 4.58, change: 8.03, logo: 'https://s3-symbol-logo.tradingview.com/amc-entertainment.svg' },
             { nameKey: 'stock_ba_name', code: 'BA', price: 179.10, change: -4.56, logo: 'https://s3-symbol-logo.tradingview.com/boeing.svg' },
             { nameKey: 'screener_stock_name_tsla', code: 'TSLA', price: 304.71, change: -1.15, logo: 'https://s3-symbol-logo.tradingview.com/tesla.svg' },
             { nameKey: 'saudi_stock6_name', code: '2222', price: 28.50, change: 0.35, logo: 'https://s3-symbol-logo.tradingview.com/saudi-aramco.svg' },
             { nameKey: 'saudi_stock8_name', code: '7010', price: 38.15, change: 0.26, logo: 'https://s3-symbol-logo.tradingview.com/saudi-telecom.svg' },
        ],
    };
    
    const highestVolume = {
        title: 'top_stocks_volume_title',
        viewAllLink: 'top_stocks_volume_link',
        stocks: [
            { nameKey: 'etf_spy_name', code: 'SPY', price: 544.83, change: 0.91, logo: 'https://s3-symbol-logo.tradingview.com/spy.svg' },
            { nameKey: 'saudi_stock5_name', price: 94.90, change: -0.42, code: '1120', logo: 'https://s3-symbol-logo.tradingview.com/al-rajhi-bank.svg' },
            { nameKey: 'stock_sabic_agri', code: '2020', price: 119.0, change: 2.15, logo: 'https://s3-symbol-logo.tradingview.com/sabic-agri-nutrients.svg' },
        ],
    };

    const firstHalfVolatile = mostVolatile.stocks.slice(0, Math.ceil(mostVolatile.stocks.length / 2));
    const secondHalfVolatile = mostVolatile.stocks.slice(Math.ceil(mostVolatile.stocks.length / 2));
    
    const translatedStocks = (list) => list.map(stock => ({ ...stock, name: t(stock.nameKey) }));

    const renderStockList = (stocks) => {
        return translatedStocks(stocks).map((stock, index) => (
            <React.Fragment key={stock.code}>
                <StockItem stock={stock} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} t={t} />
                {index < stocks.length - 1 && <hr className="border-gray-200 dark:border-gray-800" />}
            </React.Fragment>
        ));
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-y-10 lg:gap-x-6">
            <div className="lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">{t(topGainers.title)} {language === 'ar' ? '<' : '>'}</h3>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                    {renderStockList(topGainers.stocks)}
                </div>
                <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-4 block text-center hover:underline">
                    {t(topGainers.viewAllLink)} {language === 'ar' ? '<' : '>'}
                </a>
            </div>
            
            <div className="lg:col-span-2 lg:ps-6 lg:border-s border-gray-200 dark:border-gray-800">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">{t(mostVolatile.title)} {language === 'ar' ? '<' : '>'}</h3>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6 border border-gray-200 dark:border-gray-800">
                    <div>{renderStockList(firstHalfVolatile)}</div>
                     <div>{renderStockList(secondHalfVolatile)}</div>
                </div>
                <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-4 block text-center hover:underline">
                    {t(mostVolatile.viewAllLink)} {language === 'ar' ? '<' : '>'}
                </a>
            </div>

            <div className="lg:col-span-1 lg:ps-6 lg:border-s border-gray-200 dark:border-gray-800">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">{t(highestVolume.title)} {language === 'ar' ? '<' : '>'}</h3>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                    {renderStockList(highestVolume.stocks)}
                </div>
                <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-4 block text-center hover:underline">
                    {t(highestVolume.viewAllLink)} {language === 'ar' ? '<' : '>'}
                </a>
            </div>
            {popoverState.visible && popoverState.stock && createPortal(
                <StockPopover 
                    stock={popoverState.stock}
                    style={popoverState.style}
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handleMouseLeave}
                />,
                document.body
            )}
        </section>
    );
};