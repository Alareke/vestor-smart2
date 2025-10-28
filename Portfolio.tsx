/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ClipboardList, Plus, Download, Pause, ChevronLeft, ChevronRight, X, UploadCloud, ChevronDown, MoreVertical, HelpCircle } from 'lucide-react';

const ActionCard = ({ icon: Icon, titleKey, descKey, t }) => {
    return (
        <div className="bg-gray-50 dark:bg-[#131722] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center h-full hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-white dark:hover:bg-[#1c2331] transition-all duration-300 cursor-pointer">
            <div className="text-gray-500 dark:text-gray-400 mb-4">{<Icon size={32} />}</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t(titleKey)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-500 flex-grow">{t(descKey)}</p>
        </div>
    );
};

const CreatePortfolioForm = ({ t }) => {
    const [benchmark, setBenchmark] = useState('SPX');
    return (
        <div className="bg-white dark:bg-[#2A2E39] rounded-xl p-6 text-sm relative w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('create_portfolio_title')}</h2>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs leading-relaxed">{t('create_portfolio_csv_instructions')} <a href="#" className="text-blue-500 dark:text-blue-400 underline">{t('create_portfolio_download_example')}</a></p>
            
            <div className="border border-dashed border-gray-400 dark:border-gray-500 rounded-lg p-4 text-center mb-6">
                <UploadCloud size={24} className="mx-auto text-gray-500 mb-2" />
                <p className="text-gray-900 dark:text-white font-semibold text-sm">{t('create_portfolio_drag_and_drop')} <button className="text-blue-500 dark:text-blue-400 font-semibold">{t('create_portfolio_browse')}</button></p>
                <p className="text-xs text-gray-500 mt-1">{t('create_portfolio_csv_size_limit')}</p>
            </div>

            <div className="space-y-4 flex-grow">
                <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('create_portfolio_name_label')}</label>
                    <input type="text" placeholder={t('create_portfolio_name_placeholder')} className="w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('create_portfolio_currency_label')}</label>
                        <div className="relative">
                            <select className="w-full appearance-none bg-gray-100 dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white">
                                <option>USD</option>
                                <option>EUR</option>
                                <option>SAR</option>
                            </select>
                            <ChevronDown size={16} className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="w-28">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('create_portfolio_risk_free_rate_label')}</label>
                        <div className="relative">
                           <input type="number" defaultValue="2" className="w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" />
                           <span className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">%</span>
                        </div>
                    </div>
                </div>
                 <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('create_portfolio_benchmark_label')}</label>
                    <div className="relative">
                         <select className="w-full appearance-none bg-gray-100 dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white">
                            <option>SPX</option>
                            <option>NAS100</option>
                        </select>
                        <ChevronDown size={16} className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs">
                        {['SPX', 'NAS100', 'US2000', 'QQQ'].map(b => (
                            <button key={b} onClick={() => setBenchmark(b)} className={`px-3 py-1 rounded-md ${benchmark === b ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white' : 'bg-gray-200 dark:bg-[#1e293b] text-gray-600 dark:text-gray-400'}`}>
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PortfolioDashboard = ({ t }) => {
    const [chartMode, setChartMode] = useState('value');
     const performanceData = [
        { label: t('portfolio_perf_1m'), value: '-10.16%', isPositive: false },
        { label: t('portfolio_perf_3m'), value: '-5.16%', isPositive: false },
        { label: t('portfolio_perf_6m'), value: '+15.94%', isPositive: true },
        { label: t('portfolio_perf_ytd'), value: '-146.93%', isPositive: false },
        { label: t('portfolio_perf_1y'), value: '+11.32%', isPositive: true },
        { label: t('portfolio_perf_all'), value: '+10.1%', isPositive: true },
    ];
    
    // Simplified static SVG paths for visual representation
    const blueLinePath = "M0 250 Q 80 100, 160 180 T 320 120 Q 400 50, 480 150 T 640 130 Q 720 180, 800 160";
    const pinkLinePath = "M0 260 Q 150 200, 300 210 T 600 180 Q 750 170, 800 190";

    const yAxisLabels = ["-1000.00", "0.00", "1980.00", "2500.00", "3000.00"];
    const xAxisLabels = ["2022", "Apr", "Jul", "Oct", "2023", "Apr", "Jul", "Oct", "2024", "Apr", "Jul", "Oct"];
    
    const PerformanceMetric = (props: any) => {
        const { label, value, isPositive } = props;
        const colorClass = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500';
        return (
            <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
                <p className={`font-semibold ${colorClass}`}>{value}</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('portfolio_slide_title_1')}</h2>
                <div className="bg-gray-200 dark:bg-black p-1 rounded-lg flex text-sm">
                    <button onClick={() => setChartMode('value')} className={`px-4 py-1 rounded-md transition-colors ${chartMode === 'value' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {t('portfolio_chart_mode_value')}
                    </button>
                    <button onClick={() => setChartMode('performance')} className={`px-4 py-1 rounded-md transition-colors ${chartMode === 'performance' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {t('portfolio_chart_mode_performance')}
                    </button>
                </div>
            </div>

            <div className="relative w-full h-72 mb-6">
                <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                    {/* Y Axis Labels */}
                    {yAxisLabels.map((label, i) => (
                        <text key={i} x="795" y={(270 - i * (270 / (yAxisLabels.length -1)))} fill="#718096" fontSize="12" textAnchor="end">{label}</text>
                    ))}
                    {/* Chart Lines */}
                    <path d={blueLinePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                    <path d={pinkLinePath} fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    {/* X Axis Labels */}
                    {xAxisLabels.map((label, i) => (
                        <text key={i} x={i * (800 / (xAxisLabels.length))} y="295" fill="#718096" fontSize="12" textAnchor="start">{label}</text>
                    ))}
                </svg>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                {performanceData.map(item => <PerformanceMetric key={item.label} {...item} />)}
            </div>
        </div>
    );
};

const HoldingsPerformance = ({ t }) => {
    const [filter, setFilter] = useState('all');
    const holdingsData = [
        { ticker: 'GOOG', logoUrl: 'https://s3-symbol-logo.tradingview.com/google.svg', performance: 43.03 },
        { ticker: 'APPL', logoUrl: 'https://s3-symbol-logo.tradingview.com/apple.svg', performance: 37.82 },
        { ticker: 'TSLA', logoUrl: 'https://s3-symbol-logo.tradingview.com/tesla.svg', performance: 24.54 },
        { ticker: 'AMZN', logoUrl: 'https://s3-symbol-logo.tradingview.com/amazon.svg', performance: 18.75 },
        { ticker: 'MSFT', logoUrl: 'https://s3-symbol-logo.tradingview.com/microsoft.svg', performance: 9.02 },
        { ticker: 'CCL', logoUrl: 'https://s3-symbol-logo.tradingview.com/carnival.svg', performance: 7.74 },
        { ticker: 'META', logoUrl: 'https://s3-symbol-logo.tradingview.com/meta.svg', performance: 2.05 },
        { ticker: 'NVDA', logoUrl: 'https://s3-symbol-logo.tradingview.com/nvidia.svg', performance: -9.08 },
        { ticker: 'CVX', logoUrl: 'https://s3-symbol-logo.tradingview.com/chevron.svg', performance: -18.74 },
        { ticker: 'NFLX', logoUrl: 'https://s3-symbol-logo.tradingview.com/netflix.svg', performance: -24.52 },
        { ticker: 'SNAP', logoUrl: 'https://s3-symbol-logo.tradingview.com/snap.svg', performance: -58.83 },
        { ticker: 'VOW', logoUrl: 'https://s3-symbol-logo.tradingview.com/volkswagen.svg', performance: -120.06 },
    ];

    const displayedHoldings = holdingsData.filter(h => {
        if (filter === 'gainers') return h.performance > 0;
        if (filter === 'losers') return h.performance < 0;
        return true;
    }).sort((a, b) => b.performance - a.performance);
    
    const maxPerformance = 150;

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('portfolio_holdings_performance_title')}</h2>
                <div className="flex items-center gap-1">
                    <div className="bg-gray-200 dark:bg-black p-1 rounded-lg flex text-sm">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('portfolio_holdings_all')}</button>
                        <button onClick={() => setFilter('gainers')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'gainers' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('portfolio_holdings_gainers')}</button>
                        <button onClick={() => setFilter('losers')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'losers' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('portfolio_holdings_losers')}</button>
                    </div>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreVertical size={18} /></button>
                </div>
            </div>
            <div className="flex-grow space-y-3 pr-4 overflow-y-auto custom-scrollbar">
                {displayedHoldings.map(item => {
                    const isGainer = item.performance > 0;
                    const barWidth = (Math.abs(item.performance) / maxPerformance) * 100;
                    return (
                        <div key={item.ticker} className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 w-24 flex-shrink-0">
                                <img src={item.logoUrl} alt={item.ticker} className="w-6 h-6 rounded-full" />
                                <span className="font-semibold text-gray-900 dark:text-white">{item.ticker}</span>
                            </div>
                            <div className="flex-grow bg-gray-200 dark:bg-[#2A2E39] rounded-sm h-6 flex items-center">
                                <div style={{ width: `${barWidth}%` }} className={`h-full rounded-sm ${isGainer ? 'bg-teal-500' : 'bg-red-600'}`}></div>
                            </div>
                            <span className={`w-20 text-right font-mono ${isGainer ? 'text-teal-500 dark:text-teal-400' : 'text-red-500'}`}>
                                {isGainer ? '+' : ''}{item.performance.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="flex text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                <div className="w-24"></div>
                <div className="flex-grow grid grid-cols-4">
                    <span>0%</span>
                    <span className="text-center">50%</span>
                    <span className="text-center">100%</span>
                    <span className="text-right">150%</span>
                </div>
                <div className="w-20"></div>
            </div>
        </div>
    );
};

const PortfolioDistribution = ({ t }) => {
    const [activeTab, setActiveTab] = useState('asset_types');

    const tabs = [
        { key: 'assets', nameKey: 'portfolio_dist_assets' },
        { key: 'asset_types', nameKey: 'portfolio_dist_asset_types' },
        { key: 'sectors', nameKey: 'portfolio_dist_sectors' },
        { key: 'currency', nameKey: 'portfolio_dist_currency' },
    ];
    
    const distributionData = [
        { nameKey: 'filter_stocks', value: '79,023 USD', allocation: '57%', gain: '8,023 USD', gainPct: '+63.3%', color: '#3b82f6', isPositive: true },
        { nameKey: 'filter_crypto', value: '41,093 USD', allocation: '32%', gain: '645 USD', gainPct: '+5.6%', color: '#22d3ee', isPositive: true },
        { nameKey: 'filter_bonds', value: '14,304 USD', allocation: '11%', gain: '-293 USD', gainPct: '-9.5%', color: '#f97316', isPositive: false },
    ];

    const DonutChart = () => {
        const radius = 55;
        const circumference = 2 * Math.PI * radius;
        const data = [
            { percent: 57, color: '#3b82f6' },
            { percent: 32, color: '#22d3ee' },
            { percent: 11, color: '#f97316' },
        ];
        let accumulatedPercent = 0;

        return (
            <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full">
                    <g transform="rotate(-90 70 70)">
                        {data.map((item, index) => {
                            const dashArray = `${(item.percent / 100) * circumference} ${circumference}`;
                            const dashOffset = -((accumulatedPercent / 100) * circumference);
                            accumulatedPercent += item.percent;
                            return (
                                <circle key={index} cx="70" cy="70" r={radius} fill="transparent" stroke={item.color} strokeWidth="15" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
                            );
                        })}
                    </g>
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="fill-gray-900 dark:fill-white" fontSize="16" fontWeight="bold">121</text>
                    <text x="50%" y="50%" textAnchor="middle" dy="1.6em" className="fill-gray-500 dark:fill-gray-400" fontSize="10">{t('portfolio_dist_total_assets')}</text>
                </svg>
            </div>
        );
    };


    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('portfolio_distribution_title')}</h2>
                <div className="bg-gray-200 dark:bg-black p-1 rounded-lg flex text-sm flex-wrap">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1 rounded-md transition-colors ${activeTab === tab.key ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {t(tab.nameKey)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center gap-6">
                <DonutChart />
                <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs min-w-[500px]">
                        <thead>
                            <tr className="text-gray-500 dark:text-gray-500">
                                <th className="pb-2 font-normal">{t('portfolio_dist_header_asset_type')}</th>
                                <th className="pb-2 font-normal text-right">{t('portfolio_dist_header_portfolio_value')}</th>
                                <th className="pb-2 font-normal text-right">{t('portfolio_dist_header_allocation')}</th>
                                <th className="pb-2 font-normal text-right">{t('portfolio_dist_header_unrealized_gain')}</th>
                                <th className="pb-2 font-normal text-right">{t('portfolio_dist_header_unrealized_gain_pct')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {distributionData.map(item => (
                                <tr key={item.nameKey}>
                                    <td className="py-2"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-gray-900 dark:text-white font-semibold">{t(item.nameKey)}</span></div></td>
                                    <td className="py-2 text-right text-gray-900 dark:text-white font-mono">{item.value}</td>
                                    <td className="py-2 text-right text-gray-900 dark:text-white font-mono">{item.allocation}</td>
                                    <td className="py-2 text-right text-gray-900 dark:text-white font-mono">{item.gain}</td>
                                    <td className={`py-2 text-right font-mono ${item.isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{item.gainPct}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PortfolioRisks = ({ t }) => {
    
    const RiskSlider = ({ title, desc, value, max, label, valuePos, labelPos, gradient }) => (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                <HelpCircle size={14} className="text-gray-500"/>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{desc}</p>
            <div className="relative h-6">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${valuePos}%`, background: gradient }}></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${valuePos}% - 8px)` }}>
                     <div className="w-4 h-4 rounded-full bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-900"></div>
                </div>
                <div className="absolute top-0" style={{ left: `calc(${valuePos}% - 18px)` }}>
                    <div className="bg-gray-700 dark:bg-[#374151] text-white text-xs font-bold px-2 py-0.5 rounded-md">{value}</div>
                </div>
                {label && (
                    <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${labelPos}% - 22px)` }}>
                        <div className="bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-md">{label}</div>
                    </div>
                )}
                 <div className="absolute top-1/2 -translate-y-1/2 -left-2 text-xs text-gray-500">0</div>
                 <div className="absolute top-1/2 -translate-y-1/2 -right-2 text-xs text-gray-500">{max}</div>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full p-4">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">{t('portfolio_risks_title')}</h2>
             <div className="space-y-10">
                <RiskSlider 
                    title={t('portfolio_beta_title')}
                    desc={t('portfolio_beta_desc')}
                    value="0.465"
                    max="2"
                    label="MARKET"
                    valuePos={23.25}
                    labelPos={50}
                    gradient="linear-gradient(to right, #a8a29e, #d4d4d8)"
                />
                 <RiskSlider 
                    title={t('portfolio_sharpe_title')}
                    desc={t('portfolio_sharpe_desc')}
                    value="2.134"
                    max="3"
                    label="S&P"
                    valuePos={71.13}
                    labelPos={33.33}
                    gradient="linear-gradient(to right, #f97316, #facc15, #84cc16, #22c55e)"
                />
                 <RiskSlider 
                    title={t('portfolio_sortino_title')}
                    desc={t('portfolio_sortino_desc')}
                    value="2.134"
                    max="5"
                    label="S&P"
                    valuePos={42.68}
                    labelPos={20}
                    gradient="linear-gradient(to right, #f97316, #facc15, #84cc16, #22c55e)"
                />
             </div>
        </div>
    );
};

const FeatureListItem = (props: any) => {
    const { titleKey, descKey, isActive, t } = props;
    return (
        <div>
            <h3 className={`text-2xl font-semibold transition-colors duration-300 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t(titleKey)}</h3>
            {isActive && descKey && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 animate-fade-in-up">{t(descKey)}</p>}
        </div>
    );
};

export const Portfolio = () => {
    const { t, language } = useLanguage();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const slides = [
        <CreatePortfolioForm t={t} />,
        <PortfolioDashboard t={t} />,
        <HoldingsPerformance t={t} />,
        <PortfolioDistribution t={t} />,
        <PortfolioRisks t={t} />,
    ];
    
    const slideInfo = [
        { activeTitleKey: 'portfolio_main_title_slide1', descKey: 'portfolio_main_desc_slide1' },
        { activeTitleKey: 'portfolio_main_title_slide2', descKey: 'portfolio_main_desc_slide2' },
        { activeTitleKey: 'portfolio_feature1', descKey: 'portfolio_feature1_desc_slide3' },
        { activeTitleKey: 'portfolio_feature2', descKey: 'portfolio_feature2_desc_slide4' },
        { activeTitleKey: 'portfolio_feature3', descKey: 'portfolio_feature3_desc_slide5' }
    ];

    const featureTitles = [
        'portfolio_main_title_slide1',
        'portfolio_feature1',
        'portfolio_feature2',
        'portfolio_feature3'
    ];
    
    const totalSlides = slides.length;
    
    const currentSlide = slideInfo[currentSlideIndex];
    const activeTitleKey = currentSlide.activeTitleKey;
    const activeDescKey = currentSlide.descKey;
    
    const handlePrevSlide = () => {
        setCurrentSlideIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    };
    const handleNextSlide = () => {
        setCurrentSlideIndex(prev => (prev + 1) % totalSlides);
    };

    return (
        <div className="bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-300 p-4 sm:p-6 min-h-full font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('portfolio_header')}</h1>
                <span className="text-xs bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold px-2 py-1 rounded">BETA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ActionCard icon={ClipboardList} titleKey="portfolio_action_watchlist_title" descKey="portfolio_action_watchlist_desc" t={t} />
                <ActionCard icon={Plus} titleKey="portfolio_action_manual_title" descKey="portfolio_action_manual_desc" t={t} />
                <ActionCard icon={Download} titleKey="portfolio_action_csv_title" descKey="portfolio_action_csv_desc" t={t} />
            </div>
            
            <div className="bg-white dark:bg-[#131722] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 flex flex-col min-h-[550px]">
                    <div className="flex-grow">
                        {slides[currentSlideIndex]}
                    </div>
                    <div className="flex items-center gap-4 mt-auto pt-8">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><Pause size={20} /></button>
                        <button onClick={handlePrevSlide} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><ChevronLeft size={20} /></button>
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{totalSlides} / {currentSlideIndex + 1}</span>
                        <button onClick={handleNextSlide} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className={`lg:w-1/3 text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{t('portfolio_tagline')}</p>
                     <div className="space-y-4">
                        {featureTitles.map((titleKey) => {
                            const isActive = activeTitleKey === titleKey || (activeTitleKey === 'portfolio_main_title_slide2' && titleKey === 'portfolio_main_title_slide1') || (activeTitleKey === 'portfolio_feature3' && titleKey === 'portfolio_feature3');
                            return (
                                <FeatureListItem 
                                    key={titleKey}
                                    titleKey={titleKey}
                                    descKey={isActive ? activeDescKey : null}
                                    isActive={isActive}
                                    t={t}
                                />
                            );
                        })}
                    </div>
                    <img src="../assets/placeholder.png" alt="VESTOR SMART Logo" className="h-9 object-contain mx-auto filter dark:grayscale opacity-50 mt-16" />
                </div>
            </div>
        </div>
    );
};