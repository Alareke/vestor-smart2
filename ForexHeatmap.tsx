

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { CurrencyIcon } from './CurrencyIcon';


const columnCurrencies = ['SAR', 'CAD', 'CNY', 'AUD', 'CHF', 'JPY', 'GBP', 'USD', 'EUR'];
const rowCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CNY', 'CAD', 'SAR'];

const currencyFlags = {
    EUR: { type: 'svg', content: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 rounded-full"><path fill="#003399" d="M0 0h512v512H0z"/><path fill="#ffcc00" d="M256 160.7a95.3 95.3 0 1 0 0 190.6 95.3 95.3 0 0 0 0-190.6z"/><path fill="#003399" d="m256 181.2 11.2 34.4h36.2l-29.3 21.3 11.2 34.4-29.3-21.3-29.3 21.3 11.2 34.4-29.3-21.3h36.2z"/></svg> },
    USD: { type: 'cdn', code: 'us' },
    GBP: { type: 'cdn', code: 'gb' },
    JPY: { type: 'cdn', code: 'jp' },
    CHF: { type: 'cdn', code: 'ch' },
    AUD: { type: 'cdn', code: 'au' },
    CNY: { type: 'cdn', code: 'cn' },
    CAD: { type: 'cdn', code: 'ca' },
    SAR: { type: 'cdn', code: 'sa' },
};

const heatmapDataAll = {
    EUR: { SAR: 0.00, CAD: -9.27, CNY: 12.11, AUD: 33.69, CHF: -60.63, JPY: -10.08, GBP: 54.78, USD: 117.19, EUR: null },
    USD: { SAR: 0.03, CAD: 35.66, CNY: 367.60, AUD: 69.17, CHF: -81.45, JPY: -58.60, GBP: 64.40, USD: null, EUR: 28.72 },
    GBP: { SAR: -39.29, CAD: -21.77, CNY: -25.34, AUD: 16.74, CHF: -69.30, JPY: -71.69, GBP: null, USD: -43.91, EUR: -26.25 },
    JPY: { SAR: -22.00, CAD: -1.36, CNY: -22.78, AUD: -3.54, CHF: -44.91, JPY: null, GBP: 14.55, USD: 26.59, EUR: -18.89 },
    CHF: { SAR: 53.23, CAD: 117.22, CNY: 43.62, AUD: 126.48, CHF: null, JPY: 135.36, GBP: 138.83, USD: 104.29, EUR: 66.58 },
    AUD: { SAR: -60.16, CAD: -30.95, CNY: -26.50, AUD: null, CHF: -70.33, JPY: -63.50, GBP: 5.65, USD: -41.31, EUR: 9.93 },
    CNY: { SAR: 7.08, CAD: 25.61, CNY: null, AUD: 37.50, CHF: -30.33, JPY: 29.53, GBP: 58.88, USD: 7.03, EUR: 21.73 },
    CAD: { SAR: -17.48, CAD: null, CNY: -27.87, AUD: 12.29, CHF: -61.33, JPY: -41.42, GBP: 13.17, USD: -2.79, EUR: 1.58 },
    SAR: { SAR: null, CAD: undefined, CNY: undefined, AUD: undefined, CHF: -43.49, JPY: 25.02, GBP: 18.09, USD: -92.90, EUR: -6.21 }
};

const generateRandomHeatmapData = (period) => {
    const data = {};
    const multipliers = { "Day": 0.5, "1 Week": 1.5, "1 Month": 4, "3 Months": 8, "6 Months": 15, "1 Year": 25, "YTD": 22, "يوم": 0.5, "1 أسبوع": 1.5, "1 شهر": 4, "3 أشهر": 8, "6 أشهر": 15, "1 سنة": 25 };
    const multiplier = multipliers[period] || 1;
    for (const row of rowCurrencies) {
        data[row] = {};
        for (const col of columnCurrencies) {
            if (row === col) data[row][col] = null;
            else if (heatmapDataAll[row]?.[col] === undefined) data[row][col] = undefined;
            else data[row][col] = (Math.random() - 0.5) * 2 * multiplier;
        }
    }
    return data;
};

const CurrencyFlag = ({ code }) => {
    const flag = currencyFlags[code];
    if (flag.type === 'svg') return flag.content;
    return <img src={`https://flagcdn.com/w40/${flag.code}.png`} alt={`${code} flag`} className="w-6 h-6 rounded-full" />
};

const getCellClass = (value) => {
    if (value === undefined) return 'bg-gray-100 dark:bg-[#2A2E39]';
    if (value === null) return 'bg-gray-300 dark:bg-black';
    if (value > 100) return 'bg-green-500 text-white'; if (value > 50) return 'bg-green-600 text-white'; if (value > 10) return 'bg-green-700 text-white'; if (value > 0) return 'bg-green-800 text-white';
    if (value < -80) return 'bg-red-500 text-white'; if (value < -40) return 'bg-red-600 text-white'; if (value < -15) return 'bg-red-700 text-white'; if (value < 0) return 'bg-red-800 text-white';
    return 'bg-gray-300 dark:bg-black';
};

const Tooltip = ({ data, t }) => {
    if (!data) return null;
    const { row, col, value, x, y } = data;

    return createPortal(
        <div 
            className="tooltip animate-fade-in-up" 
            style={{ position: 'absolute', top: `${y}px`, left: `${x}px`, transform: 'translate(15px, -100%)', zIndex: 100 }}
        >
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-1">
                <CurrencyIcon code={row} size={16} />
                <span>{row}</span>
                <span className="font-normal">/</span>
                <CurrencyIcon code={col} size={16} />
                <span>{col}</span>
            </div>
            {value !== null && value !== undefined ? (
                <p className={`text-sm font-mono ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>{value > 0 ? '+' : ''}{value.toFixed(2)}%</p>
            ) : (
                <p className="text-sm text-gray-500">{t('heatmap_no_data')}</p>
            )}
        </div>,
        document.body
    );
};

export const ForexHeatmap = ({ onOpenForexMapModal }) => {
    const { t, language } = useLanguage();
    const periodsValue = t('forex_heatmap_periods');
    const periods = Array.isArray(periodsValue) ? periodsValue : [];
    const [activePeriodIndex, setActivePeriodIndex] = useState(periods.length > 0 ? periods.length - 1 : 0);
    const [tooltipData, setTooltipData] = useState(null);

    const periodDataSets = useMemo(() => {
        const data = {};
        periods.forEach((period, index) => {
            if (index === periods.length - 1) data[period] = heatmapDataAll;
            else data[period] = generateRandomHeatmapData(period);
        });
        return data;
    }, [periods]); 

    const activePeriodKey = periods[activePeriodIndex];
    const currentHeatmapData = periodDataSets[activePeriodKey] || heatmapDataAll;

    const handleMouseOver = useCallback((event, row, col, value) => {
        setTooltipData({
            row,
            col,
            value,
            x: event.pageX,
            y: event.pageY
        });
    }, []);

    const handleMouseOut = useCallback(() => {
        setTooltipData(null);
    }, []);

    return (
        <section className="bg-white dark:bg-black p-4 sm:p-6 rounded-lg overflow-x-auto no-scrollbar">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('forex_heatmap_title')} {language === 'ar' ? '<' : '>'}</h2>
            
            <div className="flex" dir="ltr">
                <div className="flex-grow">
                    <div className="flex">
                        <div className="w-20 shrink-0 border-t border-b border-r border-gray-200 dark:border-gray-800"></div>
                        {columnCurrencies.map(colCurrency => (
                            <div key={colCurrency} className="flex-1 flex items-center justify-center gap-2 py-2 border-t border-b border-r border-gray-200 dark:border-gray-800 h-[45px]">
                                <span className="text-gray-900 dark:text-white font-semibold">{colCurrency}</span>
                                <CurrencyFlag code={colCurrency} />
                            </div>
                        ))}
                    </div>

                    {rowCurrencies.map(rowCurrency => (
                        <div key={rowCurrency} className="flex items-stretch">
                           <div className="w-20 shrink-0 border-r border-b border-gray-200 dark:border-gray-800"></div>
                           {columnCurrencies.map(colCurrency => {
                               const value = currentHeatmapData[rowCurrency]?.[colCurrency];
                               return (
                                   <div 
                                       key={`${rowCurrency}-${colCurrency}`} 
                                       className={`flex-1 min-w-[70px] flex items-center justify-center p-2 text-center font-semibold border-b border-r border-gray-200 dark:border-gray-800 ${getCellClass(value)}`}
                                       onMouseMove={(e) => handleMouseOver(e, rowCurrency, colCurrency, value)}
                                       onMouseLeave={handleMouseOut}
                                   >
                                       {value !== null && value !== undefined ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : <span className="text-gray-500">-</span>}
                                   </div>
                               );
                           })}
                        </div>
                    ))}
                </div>
                
                <div className="flex flex-col w-20 shrink-0 border-l border-gray-200 dark:border-gray-800">
                     <div className="h-[45px] border-t border-b border-gray-200 dark:border-gray-800"></div>
                     {rowCurrencies.map(rowCurrency => (
                         <div key={rowCurrency} className="flex-1 flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-gray-900 dark:text-white font-semibold">{rowCurrency}</span>
                            <CurrencyFlag code={rowCurrency} />
                         </div>
                     ))}
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                 <div className="flex items-center flex-wrap-reverse md:flex-wrap gap-1 bg-gray-200 dark:bg-[#1C2331] rounded-full p-1">
                    {periods.map((period, index) => (
                        <button 
                            key={period} 
                            onClick={() => setActivePeriodIndex(index)}
                            className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activePeriodIndex === index ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800'}`}
                        >{period}</button>
                    ))}
                 </div>
                 <button onClick={onOpenForexMapModal} className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('forex_heatmap_view_all')} {language === 'ar' ? '<' : '>'}
                </button>
            </div>
            <Tooltip data={tooltipData} t={t} />
        </section>
    );
};