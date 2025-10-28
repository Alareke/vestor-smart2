/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { InteractiveChart } from './InteractiveChart';
import { SentimentAnalysis } from './SentimentAnalysis';
import { useAI } from '../i18n/AIContext';
import { CurrencyIcon } from './CurrencyIcon';
import { SymbolIcon } from './SymbolIcon';

interface SectionProps {
    title?: string;
    // FIX: Made children prop optional to resolve build error.
    children?: React.ReactNode;
    buttonText?: string;
    onButtonClick?: () => void;
}

const Section = ({ title, children, buttonText, onButtonClick = () => {} }: SectionProps) => {
    if (!title && !children) return null;
    return (
        <div className="py-4 border-b border-gray-200 dark:border-gray-800 px-2 sm:px-3">
            {title && <h3 className="text-gray-900 dark:text-white font-bold mb-3">{title}</h3>}
            {children}
            {buttonText && (
                <div className="text-center mt-4">
                    <button onClick={onButtonClick} className="bg-gray-200 dark:bg-[#2A2E39] text-gray-700 dark:text-gray-300 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                        {buttonText}
                    </button>
                </div>
            )}
        </div>
    );
};

const StatRow = ({ label, value }) => {
    if (value === null || value === undefined) return null;
    return (
        <div className="flex justify-between items-center text-sm py-1.5">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white font-semibold text-right">{value}</span>
        </div>
    );
};


export const StockDetailPanel = ({ data }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const { isAIEnabled } = useAI();
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [incomeTab, setIncomeTab] = useState<'quarterly'|'annual'>('quarterly');
    
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const Gauge = ({ value, label, segments, size = 160 }) => {
        const angle = (value / 100) * 180 - 90;

        const gridStroke = isDark ? '#374151' : '#E5E7EB';
        const pointerColor = isDark ? 'white' : '#1f2937';
        const labelColor = isDark ? 'white' : '#1f2937';
        const segmentTextColor = isDark ? '#9ca3af' : '#6B7281';

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size / 2 + 10} viewBox="0 0 100 60">
                    <defs>
                        <linearGradient id="strong-sell-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f87171" /></linearGradient>
                        <linearGradient id="sell-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                        <linearGradient id="neutral-grad-path" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a8a29e" /><stop offset="100%" stopColor="#a8a29e" /></linearGradient>
                        <linearGradient id="buy-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a3e635" /><stop offset="100%" stopColor="#4ade80" /></linearGradient>
                        <linearGradient id="strong-buy-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
                    </defs>
                    
                    <path d="M10 50 A 40 40 0 0 1 90 50" stroke={gridStroke} strokeWidth={16} fill="none" />
                    
                    {label === segments.strong_sell && <path d="M10 50 A 40 40 0 0 1 23.68 23.68" stroke="url(#strong-sell-grad)" strokeWidth={16} fill="none" />}
                    {label === segments.sell && <path d="M10 50 A 40 40 0 0 1 38.79 12.06" stroke="url(#sell-grad)" strokeWidth={16} fill="none" />}
                    {label === segments.neutral && <path d="M10 50 A 40 40 0 0 1 50 10" stroke="url(#neutral-grad-path)" strokeWidth={16} fill="none" />}
                    {label === segments.buy && <path d="M10 50 A 40 40 0 0 1 61.21 12.06" stroke="url(#buy-grad)" strokeWidth={16} fill="none" />}
                    {label === segments.strong_buy && <path d="M10 50 A 40 40 0 0 1 76.32 23.68" stroke="url(#strong-buy-grad)" strokeWidth={16} fill="none" />}
                    
                    <g transform={`rotate(${angle} 50 50)`}>
                        <path d="M 50 50 L 50 10" stroke={pointerColor} strokeWidth={2} />
                        <circle cx="50" cy="50" r={4} fill={pointerColor} />
                    </g>
    
                    <text x="50" y="45" textAnchor="middle" fontSize={12} fontWeight="bold" fill={labelColor}>{label}</text>
                    
                     <text x="12" y="55" textAnchor="middle" fontSize={6} fill={segmentTextColor}>{segments.strong_sell}</text>
                     <text x="30" y="18" textAnchor="middle" fontSize={6} fill={segmentTextColor}>{segments.sell}</text>
                     <text x="50" y="8" textAnchor="middle" fontSize={6} fill={segmentTextColor}>{segments.neutral}</text>
                     <text x="70" y="18" textAnchor="middle" fontSize={6} fill={segmentTextColor}>{segments.buy}</text>
                     <text x="88" y="55" textAnchor="middle" fontSize={6} fill={segmentTextColor}>{segments.strong_buy}</text>
                </svg>
            </div>
        );
    };

    if (!data) {
        return (
             <div className="p-4 text-center text-gray-500 h-full flex items-center justify-center">
                {t('details_not_available')}
            </div>
        )
    }

    const {
        symbol, nameKey, exchange, sectorKey, price, currency, change, changePct, isPositive,
        marketStatusKey, newsAlertKey, keyStats, performance,
        technicalAnalysis, analystRatings, profile, earningsData, incomeStatementData,
        ownershipData, atmIvData, volatilityData
    } = data;

    const change_str = isPositive ? `+${Number(change).toFixed(2)}` : `${Number(change).toFixed(2)}`;
    const change_pct_str = isPositive ? `+${Number(changePct).toFixed(2)}` : `${Number(changePct).toFixed(2)}`;

    return (
        <div className="bg-white dark:bg-black text-sm h-full">
            <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-10">
                <div className="flex items-center gap-3 mb-2">
                    <SymbolIcon symbol={symbol} size={40} />
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{symbol}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t(nameKey)} {exchange ? ` • ${exchange}` : ''}</p>
                    </div>
                </div>
                {sectorKey && <p className="text-gray-500 dark:text-gray-500 mb-2">{t(sectorKey)}</p>}
                <div className="flex items-end gap-3">
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{price}</p>
                        <div className="flex items-center gap-1.5 pb-1">
                            <CurrencyIcon code={currency} size={20} />
                            <span className="text-xl text-gray-500 dark:text-gray-400">{currency}</span>
                        </div>
                    </div>
                    <p className={`${isPositive ? 'text-green-500' : 'text-red-500'} font-semibold`}>{change_str} ({change_pct_str}%)</p>
                </div>
                {marketStatusKey && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>{t(marketStatusKey)}</span>
                    </div>
                )}
                {newsAlertKey && (
                     <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-500 rounded-r-md">
                        <p className="text-purple-700 dark:text-purple-300 text-xs">⚡ {t(newsAlertKey)}</p>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                {isAIEnabled && <SentimentAnalysis stockData={data} />}
                {keyStats && (
                     <div className="py-2 border-b border-gray-200 dark:border-gray-800 px-2 sm:px-3">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-2">{t('key_stats_title')}</h3>
                        <StatRow label={t(keyStats.earningsReportLabelKey)} value={t(keyStats.earningsReportValueKey)} />
                        <StatRow label={t(keyStats.volumeLabelKey)} value={keyStats.volumeValue} />
                        {isStatsExpanded && (
                            <>
                                <StatRow label={t(keyStats.avgVolumeLabelKey)} value={keyStats.avgVolumeValue} />
                                <StatRow label={t(keyStats.marketCapLabelKey)} value={keyStats.marketCapValue} />
                                <StatRow label={t(keyStats.dividendYieldLabelKey)} value={keyStats.dividendYieldValue} />
                                <StatRow label={t(keyStats.peRatioLabelKey)} value={keyStats.peRatioValue} />
                            </>
                        )}
                        <button onClick={() => setIsStatsExpanded(p => !p)} className="w-full mt-2">
                            <div className="mx-auto w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                {isStatsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                    </div>
                )}
                
                {earningsData && (
                     <Section title={t('earnings_title')} buttonText={t('more_info_button')}>
                        <InteractiveChart
                            height={120}
                            data={earningsData}
                            xKey="quarter"
                            series={[
                                { key: 'actual', type: 'scatter', color: '#38B2AC' },
                                { key: 'expected', type: 'scatter', color: isDark ? 'white' : 'black', isHollow: true }
                            ]}
                            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                            yFormatLeft={d => d.toFixed(2)}
                            tooltipFormatter={d => `
                                <div><strong>${d.quarter}</strong></div>
                                <div style="color: #38B2AC">${t('earnings_actual')}: ${d.actual.toFixed(2)}</div>
                                <div>${t('earnings_expected')}: ${d.expected.toFixed(2)}</div>
                            `}
                        />
                         <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                             <span className="inline-flex items-center me-4"><div className="w-2.5 h-2.5 rounded-full bg-[#38B2AC] me-1.5"></div>{t('earnings_actual')}</span>
                             <span className="inline-flex items-center"><div className={`w-2.5 h-2.5 rounded-full border ${isDark ? 'border-white' : 'border-black'} me-1.5`}></div>{t('earnings_expected')}</span>
                         </div>
                     </Section>
                )}
                {incomeStatementData && (
                     <Section title={t('income_statement_title')} buttonText={t('more_financial_data_button')}>
                        <div className="flex gap-4 mb-3">
                            <button onClick={() => setIncomeTab('quarterly')} className={`pb-1 text-sm ${incomeTab === 'quarterly' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500'}`}>{t('quarterly_tab')}</button>
                            <button onClick={() => setIncomeTab('annual')} className={`pb-1 text-sm ${incomeTab === 'annual' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500'}`}>{t('annual_tab')}</button>
                        </div>
                        <InteractiveChart
                            height={220}
                            data={incomeStatementData}
                            xKey="quarter"
                            series={[
                                { key: 'revenue', type: 'bar', color: '#4A90E2', yAxis: 'left' },
                                { key: 'netProfit', type: 'bar', color: '#50E3C2', yAxis: 'left' },
                                { key: 'netMargin', type: 'line', color: '#F6AD55', yAxis: 'right' }
                            ]}
                            margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                            yFormatLeft={d => `${d.toFixed(1)}B`}
                            yFormatRight={d => `${d.toFixed(0)}%`}
                            tooltipFormatter={d => `
                                <div><strong>${d.quarter}</strong></div>
                                <div style="color: #4A90E2">${t('revenue_legend')}: ${d.revenue.toFixed(2)}B</div>
                                <div style="color: #50E3C2">${t('net_profit_legend')}: ${d.netProfit.toFixed(2)}B</div>
                                <div style="color: #F6AD55">${t('net_margin_legend')}: ${d.netMargin.toFixed(1)}%</div>
                            `}
                        />
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-center gap-3">
                            <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#4A90E2] me-1.5"></div>{t('revenue_legend')}</span>
                            <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#50E3C2] me-1.5"></div>{t('net_profit_legend')}</span>
                            <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#F6AD55] me-1.5"></div>{t('net_margin_legend')}</span>
                        </div>
                     </Section>
                )}
                
                {performance && (
                    <Section title={t('performance_title')}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-gray-900 dark:text-white">
                            {Object.entries(performance).map(([key, value]) => {
                                const numValue = Number(value);
                                const isPositivePerf = numValue >= 0;
                                return (
                                    <div key={key} className={`dark:text-white ${isPositivePerf ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'} p-2 rounded`}>
                                        <div className={`font-bold ${isPositivePerf ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isPositivePerf ? '+' : ''}{numValue.toFixed(2)}%</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">{t(`perf_${key.toLowerCase()}`)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {ownershipData && (
                    <Section title={t('institutional_ownership_title')} buttonText={t('more_seasons_button')}>
                       <InteractiveChart
                            height={180}
                            data={ownershipData}
                            xKey="month"
                            series={[
                                { key: '2023', type: 'line', color: '#c084fc' },
                                { key: '2024', type: 'line', color: '#f472b6' },
                                { key: '2025', type: 'line', color: '#60a5fa' },
                            ]}
                            margin={{ top: 20, right: 10, bottom: 40, left: 30 }}
                            yFormatLeft={(d) => `${d.toFixed(0)}%`}
                            tooltipFormatter={d => `
                                <div><strong>${d.month || '...'}</strong></div>
                                <div style="color: #c084fc">2023: ${d['2023'].toFixed(1)}%</div>
                                <div style="color: #f472b6">2024: ${d['2024'].toFixed(1)}%</div>
                                <div style="color: #60a5fa">2025: ${d['2025'].toFixed(1)}%</div>
                            `}
                        />
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-center gap-3">
                             <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#c084fc] me-1.5"></div>{t('year_2023')}</span>
                             <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#f472b6] me-1.5"></div>{t('year_2024')}</span>
                             <span className="inline-flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] me-1.5"></div>{t('year_2025')}</span>
                        </div>
                    </Section>
                )}
                
                {technicalAnalysis && (
                     <Section title={t('technical_analysis_title')}>
                        <Gauge value={technicalAnalysis.value} label={t(technicalAnalysis.labelKey)} segments={{strong_sell: t('strong_sell'), sell: t('sell'), neutral: t('neutral'), buy: t('buy'), strong_buy: t('strong_buy')}} />
                    </Section>
                )}
               
                {analystRatings && (
                     <Section title={t('analyst_ratings_title')} buttonText={t('view_forecasts_button')}>
                         <Gauge value={analystRatings.value} label={t(analystRatings.labelKey)} segments={{strong_sell: t('strong_sell'), sell: t('sell'), neutral: t('neutral'), buy: t('buy'), strong_buy: t('strong_buy')}} />
                         {analystRatings.targetPrice && typeof analystRatings.targetChangePct === 'number' && (
                            <div className="text-center mt-2">
                                <p className="text-gray-500 dark:text-gray-400 text-xs">{t('one_year_price_target')}</p>
                                <p className="text-gray-900 dark:text-white font-bold">{analystRatings.targetPrice} <span className="text-green-500 dark:text-green-400">({analystRatings.targetChangePct.toFixed(2)}%)</span></p>
                            </div>
                        )}
                    </Section>
                )}
                 
                {atmIvData && (
                     <Section title={t('top_ytm_bonds_title')} buttonText={t('more_bonds_button')}>
                        <div className="space-y-2">
                            <StatRow label="6.85%" value="20 أغسطس 2050" />
                            <StatRow label="6.74%" value="8 فبراير 2051" />
                            <StatRow label="6.73%" value="8 فبراير 2061" />
                        </div>
                    </Section>
                )}
                {atmIvData && (
                    <Section title={t('atm_iv_structure_title')}>
                         <InteractiveChart
                            height={80}
                            data={atmIvData}
                            xKey="time"
                            series={[{ key: 'value', type: 'line', color: '#60a5fa' }]}
                            margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
                            yFormatLeft={d => `${d.toFixed(0)}%`}
                            tooltipFormatter={d => `<div><strong>${d.time}</strong>: ${d.value.toFixed(1)}%</div>`}
                        />
                    </Section>
                )}
                {volatilityData && (
                    <Section title={t('volatility_curve_title')} buttonText={t('more_options_button')}>
                          <InteractiveChart
                            height={100}
                            data={volatilityData}
                            xKey="strike"
                            series={[{ key: 'value', type: 'line', color: '#60a5fa' }]}
                            margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
                            yFormatLeft={d => `${d.toFixed(0)}%`}
                            tooltipFormatter={d => `<div><strong>Strike ${d.strike}</strong>: ${d.value.toFixed(1)}%</div>`}
                        />
                    </Section>
                )}

                {profile && (
                    <Section title={t('profile_title')}>
                        <StatRow label={t(profile.websiteLabelKey)} value={<a href={`https://${profile.websiteValue}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1 justify-end">{profile.websiteValue} <ExternalLink size={14}/></a>} />
                        {profile.employeesValue !== '—' && <StatRow label={t(profile.employeesLabelKey)} value={`${profile.employeesValue} ${t(profile.employeesValueSuffixKey)}`} />}
                        {profile.isinValue !== '—' && <StatRow label={t(profile.isinLabelKey)} value={profile.isinValue} />}
                        {profile.figiValue !== '—' && <StatRow label={t(profile.figiLabelKey)} value={profile.figiValue} />}
                            {isProfileExpanded && (
                            <p className="text-gray-600 dark:text-gray-400 mt-3 text-xs leading-relaxed">{t(profile.descriptionKey)}</p>
                        )}
                            <button onClick={() => setIsProfileExpanded(p => !p)} className="w-full mt-2">
                            <div className="mx-auto w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                {isProfileExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                    </Section>
                )}
            </div>
        </div>
    );
};
StockDetailPanel.displayName = 'StockDetailPanel';