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
    const changeClass = isPositive ? 'bg-green-500' : 'bg-red-500';

    return (
        <button 
            onMouseEnter={(e) => onMouseEnter(e, stock)}
            onMouseLeave={onMouseLeave}
            className={`flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md cursor-pointer w-full text-left`}
        >
             <div className="flex items-center gap-4">
                <span className={`text-white font-bold text-sm px-2 py-1 rounded-md w-[80px] text-center ${changeClass}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
                <p className="text-gray-900 dark:text-white font-semibold text-sm w-28 text-start">{stock.price.toFixed(2)} {t('currency_sar')}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                   <h4 className="text-gray-900 dark:text-white font-semibold text-sm whitespace-nowrap">{stock.name}</h4>
                   <span className="text-gray-500 text-xs font-mono">{stock.code}</span>
                </div>
                <SymbolIcon symbol={stock.code} size={36} />
            </div>
        </button>
    );
};

const StockList = ({ titleKey, linkKey, stocks, onMouseEnter, onMouseLeave, t, language }) => {
    const renderStockList = () => {
        const translatedStocks = stocks.map(stock => ({ ...stock, name: t(stock.nameKey) }));
        return translatedStocks.map((stock, index) => (
            <React.Fragment key={stock.code}>
                <StockItem 
                    stock={stock} 
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    t={t}
                />
                {index < stocks.length - 1 && <hr className="border-gray-200 dark:border-gray-800 my-1" />}
            </React.Fragment>
        ));
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">{t(titleKey)} {language === 'ar' ? '<' : '>'}</h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                {renderStockList()}
            </div>
            <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-4 block text-center hover:underline">
                {t(linkKey)} {language === 'ar' ? '<' : '>'}
            </a>
        </div>
    );
};

export const PerformanceStocks = () => {
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
    
    const bestPerformers = {
        titleKey: 'performance_stocks_best_title',
        linkKey: 'performance_stocks_best_link',
        stocks: [
            { nameKey: 'stock_amd_name', code: 'AMD', price: 160.30, change: 23.31, logo: 'https://s3-symbol-logo.tradingview.com/amd.svg' },
            { nameKey: 'stock_shams', code: '4170', price: 1.22, change: 9.91, logo: 'https://s3-symbol-logo.tradingview.com/shams.svg' },
            { nameKey: 'stock_intc_name', code: 'INTC', price: 30.58, change: 9.63, logo: 'https://s3-symbol-logo.tradingview.com/intel.svg' },
            { nameKey: 'stock_nflx_name', code: 'NFLX', price: 686.12, change: 9.09, logo: 'https://s3-symbol-logo.tradingview.com/netflix.svg' },
            { nameKey: 'stock_alashghal', code: '9608', price: 69.00, change: 9.00, logo: 'https://s3-symbol-logo.tradingview.com/al-ashghal.svg' },
            { nameKey: 'stock_cat_name', code: 'CAT', price: 326.87, change: 8.82, logo: 'https://s3-symbol-logo.tradingview.com/caterpillar.svg' },
        ],
    };
    
    const worstPerformers = {
        titleKey: 'performance_stocks_worst_title',
        linkKey: 'performance_stocks_worst_link',
        stocks: [
            { nameKey: 'stock_ba_name', code: 'BA', price: 179.10, change: -8.02, logo: 'https://s3-symbol-logo.tradingview.com/boeing.svg' },
            { nameKey: 'stock_mcd_name', code: 'MCD', price: 260.47, change: -5.45, logo: 'https://s3-symbol-logo.tradingview.com/mcdonalds.svg' },
            { nameKey: 'stock_dis_name', code: 'DIS', price: 102.13, change: -5.37, logo: 'https://s3-symbol-logo.tradingview.com/disney.svg' },
            { nameKey: 'stock_alhasoob', code: '9522', price: 43.96, change: -5.26, logo: 'https://s3-symbol-logo.tradingview.com/alhasoob.svg' },
            { nameKey: 'stock_mutahida_glass', code: '9611', price: 43.00, change: -4.44, logo: 'https://s3-symbol-logo.tradingview.com/mutahida-glass.svg' },
            { nameKey: 'stock_leen_alkhair', code: '9555', price: 17.35, change: -4.14, logo: 'https://s3-symbol-logo.tradingview.com/leen-alkhair.svg' },
        ],
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-10">
            <StockList 
                {...worstPerformers}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                t={t}
                language={language}
            />
            <StockList 
                {...bestPerformers}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                t={t}
                language={language}
            />

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