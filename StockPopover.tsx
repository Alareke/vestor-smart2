/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { CurrencyIcon } from './CurrencyIcon';

export const StockPopover = ({ stock, style, onMouseEnter, onMouseLeave }) => {
    const { t } = useLanguage();
    const isPositive = stock.change >= 0;

    // A generic path for the mini-chart that shows a positive trend.
    const chartPath = "M0 45 L10 42 L20 35 L30 38 L40 30 L50 25 L60 28 L70 20 L80 22 L90 15 L100 18";
    const gradientPath = chartPath + " L100 50 L0 50 Z";
    
    const gradientColor = isPositive ? '#10B981' : '#EF4444';

    return (
        <div 
            style={{...style, position: 'fixed', zIndex: 50, width: '320px'}}
            className="bg-white dark:bg-black rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-800 animate-fade-in-up text-gray-900 dark:text-white"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">{stock.name}</h4>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                    <Info size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
            </div>

            {/* Price Info */}
            <div className="flex items-baseline gap-4 mb-3">
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-xl">{stock.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-base text-gray-500 dark:text-gray-400">
                        <CurrencyIcon code="SAR" size={16} title={t('currency_sar')} />
                        <span>{t('currency_sar')}</span>
                    </div>
                </div>
                <p className={`font-semibold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                </p>
            </div>
            
            {/* Mini Chart */}
            <div className="h-24 w-full relative">
                 <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="popoverChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <path d={gradientPath} fill="url(#popoverChartGradient)" />
                    <path d={chartPath} fill="none" stroke={gradientColor} strokeWidth="1.5" />
                    <circle cx="100" cy="18" r="2" fill={gradientColor} />
                </svg>
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400 text-xs mb-4">{t('popover_period_day')}</div>

            {/* Action Button */}
            <button className="w-full text-center py-2.5 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                {t('popover_view_advanced_charts')}
            </button>
        </div>
    );
};