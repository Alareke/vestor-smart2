/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { CurrencyIcon } from './CurrencyIcon';

export const CryptoPopover = ({ currency, style, onMouseEnter, onMouseLeave }) => {
    const { t } = useLanguage();
    const isPositive = currency.change >= 0;

    // A generic path for the mini-chart, more spiky for crypto
    const chartPath = "M0 40 L10 35 L20 45 L30 30 L40 25 L50 35 L60 20 L70 15 L80 25 L90 20 L100 22";
    const gradientPath = chartPath + " L100 50 L0 50 Z";
    
    const gradientColor = isPositive ? '#10B981' : '#EF4444';

    // Flexible price formatter for crypto
    const formatPrice = (price) => {
        if (price > 1) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (price < 0.000001) {
            return price.toExponential(4);
        }
        return price.toLocaleString('en-US', { maximumSignificantDigits: 6 });
    };

    return (
        <div 
            style={{...style, position: 'fixed', zIndex: 50, width: '320px'}}
            className="bg-white dark:bg-black rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-800 animate-fade-in-up text-gray-900 dark:text-white"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">{currency.name}</h4>
                <img src={currency.logo} alt={`${currency.name} logo`} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 object-contain p-0.5" />
            </div>

            {/* Price Info */}
            <div className="flex items-baseline gap-4 mb-3">
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-xl">{formatPrice(currency.price)}</p>
                    <div className="flex items-center gap-1 text-base text-gray-500 dark:text-gray-400">
                        <CurrencyIcon code="USD" size={16} title={t('currency_usd')} />
                        <span>{t('currency_usd')}</span>
                    </div>
                </div>
                <p className={`font-semibold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{currency.change.toFixed(2)}%
                </p>
            </div>
            
            {/* Mini Chart */}
            <div className="h-24 w-full relative">
                 <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="cryptoPopoverChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <path d={gradientPath} fill="url(#cryptoPopoverChartGradient)" />
                    <path d={chartPath} fill="none" stroke={gradientColor} strokeWidth="1.5" />
                    <circle cx="100" cy="22" r="2" fill={gradientColor} />
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