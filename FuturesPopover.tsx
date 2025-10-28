/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const FuturesPopover = ({ item, style, onMouseEnter, onMouseLeave }) => {
    const { t } = useLanguage();
    const isPositive = item.change >= 0;

    // A generic path for the mini-chart
    const chartPath = "M0 45 L10 42 L20 35 L30 38 L40 30 L50 25 L60 28 L70 20 L80 22 L90 15 L100 18";
    const gradientPath = chartPath + " L100 50 L0 50 Z";
    
    const gradientColor = isPositive ? '#10B981' : '#EF4444';

    return (
        <div 
            style={{...style, position: 'fixed', zIndex: 50, width: '320px'}}
            className="bg-white dark:bg-[#1C2331] rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700/50 animate-fade-in-up text-gray-900 dark:text-white"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">{t(item.nameKey)}</h4>
                 <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <item.IconComponent className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Price Info */}
            <div className="flex items-baseline gap-4 mb-3">
                 <p className="font-semibold text-xl">{item.price} <span className="text-gray-500 dark:text-gray-400 text-base">{item.unit}</span></p>
                <p className={`font-semibold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                </p>
            </div>
            
            {/* Mini Chart */}
            <div className="h-24 w-full relative">
                 <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="futuresPopoverChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <path d={gradientPath} fill="url(#futuresPopoverChartGradient)" />
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