/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SaudiFlag } from './SaudiFlag';
import { SymbolIcon } from './SymbolIcon';

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const StockCard = (props) => {
    const { stock } = props;
    const isPositive = stock.change >= 0;
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg w-52 flex-shrink-0 p-4 border border-gray-200 dark:border-gray-800/50">
            <div className="flex items-start justify-between mb-4">
                <div className="text-left rtl:text-right">
                    <span className="text-gray-500 dark:text-gray-500 text-sm font-mono">{stock.code}</span>
                    <h4 className="text-gray-900 dark:text-white font-semibold">{stock.name}</h4>
                </div>
                <SymbolIcon symbol={stock.code} size={36} />
            </div>
            <div className="text-left rtl:text-right">
                <p className="text-gray-900 dark:text-white font-semibold text-lg">{stock.price.toFixed(2)} <span className="text-gray-500 dark:text-gray-500 text-sm">SAR</span></p>
                <p className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{isPositive ? '+' : ''}{stock.change.toFixed(2)}%</p>
            </div>
        </div>
    );
};


export const SaudiStocks = () => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const stocksData = [
        { id: 6, code: '2222', name: t('saudi_stock6_name'), price: 28.50, change: +0.35, logo: 'https://s3-symbol-logo.tradingview.com/saudi-aramco.svg' },
        { id: 5, code: '1120', name: t('saudi_stock5_name'), price: 95.30, change: -0.73, logo: 'https://s3-symbol-logo.tradingview.com/al-rajhi-bank.svg' },
        { id: 3, code: '1180', name: t('saudi_stock3_name'), price: 36.94, change: +0.54, logo: 'https://s3-symbol-logo.tradingview.com/saudi-national-bank.svg' },
        { id: 8, code: '7010', name: t('saudi_stock8_name'), price: 38.15, change: +0.26, logo: 'https://s3-symbol-logo.tradingview.com/saudi-telecom.svg' },
        { id: 1, code: '1211', name: t('saudi_stock1_name'), price: 53.70, change: -0.74, logo: 'https://s3-symbol-logo.tradingview.com/maaden.svg' },
        { id: 7, code: '2010', name: t('saudi_stock7_name'), price: 85.40, change: -0.93, logo: 'https://s3-symbol-logo.tradingview.com/sabic.svg' },
        { id: 11, code: '5110', name: t('saudi_stock11_name'), price: 18.90, change: +0.53, logo: 'https://s3-symbol-logo.tradingview.com/saudi-electricity.svg' },
        { id: 4, code: '1150', name: t('saudi_stock4_name'), price: 25.82, change: -1.60, logo: 'https://s3-symbol-logo.tradingview.com/alinma-bank.svg' },
        { id: 10, code: '1010', name: t('saudi_stock10_name'), price: 27.50, change: -0.18, logo: 'https://s3-symbol-logo.tradingview.com/riyad-bank.svg' },
        { id: 9, code: '2280', name: t('saudi_stock9_name'), price: 55.20, change: +1.10, logo: 'https://s3-symbol-logo.tradingview.com/almarai.svg' },
        { id: 2, code: '1202', name: t('saudi_stock2_name'), price: 27.80, change: -2.11, logo: 'https://s3-symbol-logo.tradingview.com/mepco.svg' },
    ];

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 208 + 16; // card width (w-52) + gap (gap-4)
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span>{t('saudi_stocks_title')} {language === 'ar' ? '<' : '>'}</span>
                        <SaudiFlag />
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('saudi_stocks_subtitle')}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-4 overflow-x-auto no-scrollbar py-2">
                    {stocksData.map(stock => <StockCard key={stock.id} stock={stock} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
        </section>
    );
}