/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
// FIX: Changed import to default for proper type augmentation.
import annotationPlugin from 'chartjs-plugin-annotation';
import { Share2, Settings, CalendarDays, SlidersHorizontal, BarChart2, ChevronLeft, ChevronRight, X, Search, Trash2, Copy, Plus, ChevronDown, Flag, Play, Pause } from 'lucide-react';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  // FIX: Use the default import for the annotation plugin.
  annotationPlugin
);

// --- TYPE DEFINITIONS ---
const TIME_HORIZONS_TABLE = ['30Y', '20Y', '10Y', '7Y', '5Y', '3Y', '2Y', '1Y', '6M', '4M', '3M', '2M', '1M'] as const;
const KEY_TABLE_HORIZONS = ['30Y', '10Y', '2Y'] as const;

type YieldData = Record<typeof TIME_HORIZONS_TABLE[number], number>;

interface Curve {
  id: number;
  country: string;
  date: string;
  color: string;
  flag: string;
  visible: boolean;
  data: YieldData;
}

interface Country {
    nameKey: string;
    flag?: string;
    type: 'country' | 'header';
}

// --- MOCK DATA & HELPERS ---
const MOCK_DATA: Curve[] = [
  { id: 1, country: 'أمريكا', date: '3 يوليو 2025', color: '#3b82f6', flag: '🇺🇸', visible: true, data: { '30Y': 4.862, '20Y': 4.864, '10Y': 4.348, '7Y': 4.126, '5Y': 3.939, '3Y': 3.845, '2Y': 3.886, '1Y': 4.088, '6M': 4.307, '4M': 4.347, '3M': 4.364, '2M': 4.388, '1M': 4.236 } },
  { id: 2, country: 'أمريكا', date: '3 يوليو 2025', color: '#be185d', flag: '🇺🇸', visible: true, data: { '30Y': 4.983, '20Y': 4.990, '10Y': 4.458, '7Y': 4.230, '5Y': 4.026, '3Y': 3.922, '2Y': 3.957, '1Y': 4.130, '6M': 4.300, '4M': 4.339, '3M': 4.351, '2M': 4.314, '1M': 4.282 } },
  { id: 3, country: 'أمريكا', date: '3 يوليو 2024', color: '#8b5cf6', flag: '🇺🇸', visible: true, data: { '30Y': 4.523, '20Y': 4.631, '10Y': 4.355, '7Y': 4.323, '5Y': 4.322, '3Y': 4.492, '2Y': 4.708, '1Y': 5.059, '6M': 5.310, '4M': 5.370, '3M': 5.378, '2M': 5.364, '1M': 5.360 } },
];

const MAIN_CHART_LABELS = ['1M', '2M', '3M', '4M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];
const KEY_CHART_LABELS = ['2Y', '10Y', '30Y'];
const NEW_CURVE_COLORS = ['#22c55e', '#f97316', '#eab308', '#06b6d4', '#ef4444'];
const HISTORICAL_YEARS = 5;
const HISTORICAL_MONTHS = HISTORICAL_YEARS * 12;

const generateRandomData = (): YieldData => {
    return TIME_HORIZONS_TABLE.reduce((acc, h) => {
        acc[h] = Math.random() * (5.5 - 3.5) + 3.5;
        return acc;
    }, {} as YieldData);
};

const generateHistoricalDataForCurve = (baseData: YieldData): YieldData[] => {
    const historicalSeries: YieldData[] = [];
    for (let i = 0; i < HISTORICAL_MONTHS; i++) {
        const monthData = { ...baseData };
        Object.keys(monthData).forEach(horizon => {
            const volatility = (Math.random() - 0.5) * 0.1;
            const trend = (i - HISTORICAL_MONTHS / 2) * 0.0015;
            monthData[horizon] = parseFloat((monthData[horizon] + volatility + trend).toFixed(4));
        });
        historicalSeries.push(monthData);
    }
    return historicalSeries;
};

// --- SUB-COMPONENTS ---

interface AnimatedNumberProps { value: number; isPlaying: boolean; }
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, isPlaying }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const valueRef = useRef(value);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isPlaying) {
            setDisplayValue(value);
            valueRef.current = value;
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }
        const startValue = valueRef.current;
        const endValue = value;
        if (typeof endValue !== 'number' || startValue === endValue) {
            setDisplayValue(endValue);
            valueRef.current = endValue;
            return;
        }
        const duration = 100;
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const animatedValue = startValue + (endValue - startValue) * percentage;
            setDisplayValue(animatedValue);
            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                 valueRef.current = endValue;
                 setDisplayValue(endValue);
            }
        };
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(animate);
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [value, isPlaying]);

    if (typeof displayValue !== 'number') return <span className="tabular-nums">...</span>;
    return <span className="tabular-nums">{`${displayValue.toFixed(3)}%`}</span>;
};

const VestroSmartLogo = () => (
    <img src="https://i.ibb.co/DgTDSpjZ/3-vestor.png" alt="VESTOR SMART" className="h-6 w-auto" />
);

const getOrCreateTooltip = (chart: ChartJS) => {
    let tooltipEl = chart.canvas.parentNode?.querySelector('div.chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'chartjs-tooltip opacity-0 transition-opacity pointer-events-none absolute bg-zinc-900 rounded-lg shadow-xl p-2 border border-zinc-700 z-50';
        chart.canvas.parentNode?.appendChild(tooltipEl);
    }
    return tooltipEl as HTMLDivElement;
};

const customTooltip = (context: { chart: ChartJS, tooltip: any }) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
    }
    if (tooltip.body) {
        const title = tooltip.title?.[0] || '';
        let innerHtml = `<div class="flex flex-col gap-1.5 text-xs p-1">`;
        innerHtml += `<div class="font-bold text-center mb-1 text-gray-300">${title}</div>`;
        tooltip.dataPoints.forEach((dp: any) => {
            const value = dp.raw.toFixed(3) + '%';
            const color = dp.dataset.borderColor;
            const colorSwatch = `<span style="background-color: ${color}; width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 6px; border: 1px solid ${color};"></span>`;
            innerHtml += `<div class="flex items-center justify-between gap-4 text-gray-400 min-w-[200px]"><span class="flex items-center whitespace-nowrap">${colorSwatch}${dp.dataset.label}</span><span class="font-mono font-semibold text-white">${value}</span></div>`;
        });
        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;
    }
    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.transform = 'translate(-50%, -120%)';
};

const YieldChart = ({ curves, setCurves, labels, scaleType, selectedPoint, onPointSelect, onLabelHover, historicalData, currentTimeIndex, isCompareMode, comparisonSelection, t }: any) => {
    const [hoveredDatasetLabel, setHoveredDatasetLabel] = useState<string | null>(null);

    const handleLegendClick = (e, legendItem, legend) => {
        const datasetIndex = legendItem.datasetIndex;
        const visibleCurves = curves.filter(c => c.visible);
        if (visibleCurves[datasetIndex]) {
            const curveIdToToggle = visibleCurves[datasetIndex].id;
            setCurves(prevCurves => 
                prevCurves.map(c => 
                    c.id === curveIdToToggle ? { ...c, visible: !c.visible } : c
                )
            );
        }
    };

    const renderSpreadChart = () => {
        const curve1 = curves.find((c: Curve) => c.id === comparisonSelection[0]);
        const curve2 = curves.find((c: Curve) => c.id === comparisonSelection[1]);
        if (!curve1 || !curve2) return null;
        const spreadData = labels.map((label: string) => (curve1.data[label] - curve2.data[label]));
        const data = {
            labels,
            datasets: [{ label: `Spread: ${curve1.country} vs ${curve2.country}`, data: spreadData, borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.2)', tension: scaleType === 'linear' ? 0 : 0.4, borderWidth: 2.5, pointRadius: 5, fill: true }]
        };
        const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF' }, border: { display: false } }, y: { position: 'right' as const, grid: { color: 'rgba(55, 65, 81, 0.3)' }, ticks: { color: '#9CA3AF', callback: (v: any) => `${v.toFixed(2)}%` }, border: { display: false } } } };
        return <Line options={options} data={data} />;
    };
    const renderYieldChart = () => {
        const chartData = {
            labels,
            datasets: curves.filter((curve: Curve) => curve.visible).map((curve: Curve) => {
                const data = historicalData[curve.id]?.[currentTimeIndex] || curve.data;
                const label = `${curve.flag} ${t(curve.country)} ${curve.date}`;
                const isHovered = hoveredDatasetLabel === label;
                const isDimmed = hoveredDatasetLabel && !isHovered;
                return {
                    label, data: labels.map((l: string) => data[l]), borderColor: isDimmed ? `${curve.color}4D` : curve.color, backgroundColor: isDimmed ? `${curve.color}4D` : curve.color, pointBackgroundColor: isDimmed ? `${curve.color}4D` : curve.color, pointBorderColor: '#0D0E11', tension: scaleType === 'linear' ? 0 : 0.4, borderWidth: isHovered ? 4 : 2.5,
                    pointRadius: (ctx: any) => {
                        if (!selectedPoint?.curveId || !selectedPoint?.label) return 5;
                        const currentCurve = curves.filter((c: Curve) => c.visible)[ctx.datasetIndex];
                        return selectedPoint.curveId === currentCurve.id && selectedPoint.label === labels[ctx.dataIndex] ? 8 : 5;
                    },
                    pointBorderWidth: (ctx: any) => {
                        if (!selectedPoint?.curveId || !selectedPoint?.label) return 2;
                        const currentCurve = curves.filter((c: Curve) => c.visible)[ctx.datasetIndex];
                        return selectedPoint.curveId === currentCurve.id && selectedPoint.label === labels[ctx.dataIndex] ? 3 : 2;
                    },
                    pointHoverRadius: 8, pointHoverBorderWidth: 3,
                }
            }),
        };
        const options = {
            responsive: true, maintainAspectRatio: false,
            onClick: (event: any, elements: any[]) => {
                if (elements.length > 0) {
                    const { datasetIndex, index } = elements[0];
                    const visibleCurves = curves.filter((c: Curve) => c.visible);
                    const currentSelectedCurve = visibleCurves[datasetIndex];
                    if (currentSelectedCurve && labels[index]) {
                        if (selectedPoint?.curveId === currentSelectedCurve.id && selectedPoint?.label === labels[index]) {
                            onPointSelect(null, null);
                        } else {
                            onPointSelect(currentSelectedCurve.id, labels[index]);
                        }
                    }
                } else if (selectedPoint?.curveId) {
                    onPointSelect(null, null);
                }
            },
            onHover: (event: any, activeElements: any[], chart: any) => {
                onLabelHover(activeElements.length > 0 ? labels[activeElements[0].index] : null);
                const points = chart.getElementsAtEventForMode(event, 'dataset', { intersect: false }, true);
                setHoveredDatasetLabel(points.length > 0 ? chart.data.datasets[points[0].datasetIndex].label : null);
            },
            plugins: { 
                legend: { 
                    display: true,
                    position: 'bottom' as const,
                    onClick: handleLegendClick,
                    labels: {
                        color: '#9CA3AF',
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20
                    }
                }, 
                tooltip: { 
                    enabled: false, 
                    position: 'nearest' as const, 
                    external: customTooltip 
                } 
            },
            interaction: { mode: 'index' as const, intersect: false },
            scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF' }, border: { display: false } }, y: { position: 'right' as const, grid: { color: 'rgba(55, 65, 81, 0.3)', drawBorder: false }, ticks: { color: '#9CA3AF', callback: (value: any) => `${parseFloat(value).toFixed(1)}%`, stepSize: 0.2 }, min: 3.6, max: 5.4, border: { display: false } } },
        };
        return <Line options={options} data={chartData} />;
    };
    return (
        <div className="relative h-72 sm:h-96 bg-[#1A1C20] p-4 rounded-xl border border-zinc-800">
             {isCompareMode && comparisonSelection.length === 2 ? renderSpreadChart() : renderYieldChart()}
             <div className="absolute bottom-12 left-6"><VestroSmartLogo /></div>
        </div>
    );
};

const Header = ({ onToggleMaturities, scaleType, setScaleType, heatmapEnabled, setHeatmapEnabled, onShowToast, isCompareMode, onToggleCompareMode, t }: any) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) setIsSettingsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            onShowToast(t('yield_curves_toast_link_copied'));
        } catch (err) {
            onShowToast(t('yield_curves_toast_share_error'));
        }
    };
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 pt-12">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{t('yield_curves_title')}</h1>
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 border border-zinc-800 rounded-lg text-gray-300 transition-colors shadow-sm bg-[#1A1C20] hover:bg-zinc-800"><Share2 size={16} /><span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">{t('yield_curves_share')}</span></button>
                <div className="relative" ref={wrapperRef}>
                    <button onClick={() => setIsSettingsOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 border border-zinc-800 rounded-lg text-gray-300 transition-colors shadow-sm bg-[#1A1C20] hover:bg-zinc-800"><Settings size={16} /><span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">{t('yield_curves_settings')}</span></button>
                    {isSettingsOpen && (
                        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-[#1A1C20] border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 text-white">
                            <div className="space-y-4">
                                <div><h4 className="text-xs text-gray-400 font-semibold mb-2 px-1">{t('yield_curves_settings')}</h4><div className="space-y-1"><button onClick={() => setScaleType('tenor')} className={`w-full flex items-center gap-3 text-right p-2.5 rounded-lg transition-colors ${scaleType === 'tenor' ? 'bg-zinc-200 text-zinc-900 font-semibold' : 'text-gray-200 hover:bg-zinc-700/60'}`}><SlidersHorizontal size={20} className={scaleType === 'tenor' ? 'text-zinc-800' : 'text-gray-400'} /><span className="flex-grow">{t('yield_curves_tenor_scale')}</span></button><button onClick={() => setScaleType('linear')} className={`w-full flex items-center gap-3 text-right p-2.5 rounded-lg transition-colors ${scaleType === 'linear' ? 'bg-zinc-200 text-zinc-900 font-semibold' : 'text-gray-200 hover:bg-zinc-700/60'}`}><SlidersHorizontal size={20} className={scaleType === 'linear' ? 'text-zinc-800' : 'text-gray-400'} /><span className="flex-grow">{t('yield_curves_linear_scale')}</span></button></div></div>
                                <div className="border-t border-zinc-700"></div>
                                <div><h4 className="text-xs text-gray-400 font-semibold mb-2 px-1">{t('yield_curves_settings')}</h4><div className="flex items-center justify-between p-2 rounded-lg"><span className="text-sm font-medium text-gray-200">{t('yield_curves_heatmap_mode')}</span><button onClick={() => setHeatmapEnabled(!heatmapEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-violet-500 ${heatmapEnabled ? 'bg-violet-500' : 'bg-zinc-700'}`} aria-pressed={heatmapEnabled}><span className="sr-only">Enable Heatmap</span><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${heatmapEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button></div></div>
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={onToggleCompareMode} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-300 transition-colors shadow-sm ${isCompareMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' : 'bg-[#1A1C20] hover:bg-zinc-800'}`}><BarChart2 size={16} /><span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">{t('yield_curves_compare')}</span></button>
                <button onClick={onToggleMaturities} className="flex items-center gap-2 px-3 py-2 border border-zinc-800 rounded-lg text-gray-300 transition-colors shadow-sm bg-[#1A1C20] hover:bg-zinc-800"><CalendarDays size={16} /><span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">{t('yield_curves_key_maturities')}</span></button>
            </div>
        </header>
    );
};

const getCellBg = (value: number, color: string, heatmapEnabled: boolean, min = 3.5, max = 5.5) => {
    if (!heatmapEnabled || !value) return 'transparent';
    const opacity = Math.min(1, Math.max(0, (value - min) / (max - min)));
    let r = 0, g = 0, b = 0;
    if (color.startsWith('#') && color.length === 7) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${0.15 + opacity * 0.7})`;
};

const YieldTable = ({ curves, setCurves, headers, onDeleteCurve, onCopyCurve, onAddCurve, heatmapEnabled, onOpenDatePicker, selectedPoint, hoveredLabel, tableEndRef, isCompareMode, comparisonSelection, onComparisonSelect, isPlaying, t }: any) => {
    const handleToggleVisibility = (id: number) => {
        setCurves((prevCurves: Curve[]) => prevCurves.map(curve => curve.id === id ? { ...curve, visible: !curve.visible } : curve));
    };
    return (
        <div className="mt-2 bg-[#1A1C20] p-4 rounded-xl border border-zinc-800">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-white text-sm">
                    <thead><tr className="border-b border-zinc-700">{isCompareMode && <th className="sticky left-0 bg-[#1A1C20] p-3 w-12 z-10"></th>}<th className={`p-3 w-20 bg-[#1A1C20] z-10 ${isCompareMode ? 'sticky left-12' : 'sticky left-0'}`}></th>{headers.map((header: string) => <th key={header} className="p-1 text-sm font-light text-gray-400 text-center whitespace-nowrap"><div className={`py-2 px-3 rounded-md ${hoveredLabel === header ? 'ring-1 ring-white' : ''}`}>{header}</div></th>)}<th className="p-3 text-sm font-light text-gray-400 text-right whitespace-nowrap">{t('yield_curves_as_of_date')}</th><th className="sticky right-0 bg-[#1A1C20] p-3 text-sm font-light text-gray-400 text-right whitespace-nowrap z-10"><div className="flex items-center justify-end gap-2"><Flag size={16} /><span>{t('yield_curves_country')}</span></div></th></tr></thead>
                    <tbody>{curves.map((curve: Curve, index: number) => (
                        <tr ref={index === curves.length - 1 ? tableEndRef : null} className="group border-b border-zinc-800 text-sm transition-colors" key={curve.id}>
                            {isCompareMode && <td className="sticky left-0 p-2 text-center bg-[#1A1C20] group-hover:bg-zinc-800/50 z-10"><input type="checkbox" checked={comparisonSelection.includes(curve.id)} onChange={() => onComparisonSelect(curve.id)} disabled={comparisonSelection.length >= 2 && !comparisonSelection.includes(curve.id)} className="w-4 h-4 rounded bg-zinc-700 border-zinc-600 text-violet-500 focus:ring-violet-500 disabled:opacity-50" /></td>}
                            <td className={`p-2 bg-[#1A1C20] group-hover:bg-zinc-800/50 z-10 ${isCompareMode ? 'sticky left-12' : 'sticky left-0'}`}><div className="flex items-center justify-start gap-4 pl-2"><button onClick={() => onDeleteCurve(curve.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button><button onClick={() => onCopyCurve(curve.id)} className="text-gray-500 hover:text-blue-400 transition-colors"><Copy size={16} /></button></div></td>
                            {headers.map((header: string) => <td key={header} className="p-1 text-center whitespace-nowrap group-hover:bg-zinc-800/50"><div className={`py-2 px-3 m-0.5 rounded-lg font-mono transition-all ${selectedPoint?.curveId === curve.id && selectedPoint?.label === header ? 'ring-2 ring-white ring-inset' : hoveredLabel === header ? 'ring-1 ring-white' : ''}`} style={{ backgroundColor: getCellBg(curve.data?.[header], curve.color, heatmapEnabled)}}><AnimatedNumber value={curve.data?.[header]} isPlaying={isPlaying} /></div></td>)}
                            <td className="p-2 text-right whitespace-nowrap group-hover:bg-zinc-800/50"><button onClick={() => onOpenDatePicker(curve.id)} className="flex items-center justify-end gap-2 w-full text-right hover:bg-zinc-700/50 rounded-md px-2 py-1 transition-colors"><span>{curve.date}</span><ChevronDown size={16} className="text-gray-400" /></button></td>
                            <td className={`sticky right-0 p-2 text-right whitespace-nowrap bg-[#1A1C20] group-hover:bg-zinc-800/50 z-10`}><div className="flex items-center justify-end gap-2"><button onClick={() => handleToggleVisibility(curve.id)} className="w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 transition-all" style={{ backgroundColor: curve.visible ? curve.color : 'transparent', borderColor: curve.color }}>{curve.visible && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}</button><span className="text-2xl">{curve.flag}</span><span>{t(curve.country)}</span></div></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-end"><button onClick={onAddCurve} className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-semibold animate-pulse-subtle"><Plus size={18} /><span>{t('yield_curves_add')}</span></button></div>
        </div>
    );
};

const ALL_COUNTRIES: Country[] = [ { nameKey: 'yc_region_north_america', type: 'header' }, { nameKey: 'yc_country_usa', flag: '🇺🇸', type: 'country' }, { nameKey: 'yc_country_ca', flag: '🇨🇦', type: 'country' }, { nameKey: 'yc_region_europe', type: 'header' }, { nameKey: 'yc_country_au', flag: '🇦🇺', type: 'country' }, { nameKey: 'yc_country_be', flag: '🇧🇪', type: 'country' }, { nameKey: 'yc_country_ch', flag: '🇨🇭', type: 'country' }, { nameKey: 'yc_country_cz', flag: '🇨🇿', type: 'country' }, { nameKey: 'yc_country_de', flag: '🇩🇪', type: 'country' }, { nameKey: 'yc_country_dk', flag: '🇩🇰', type: 'country' }, { nameKey: 'yc_country_es', flag: '🇪🇸', type: 'country' }, { nameKey: 'yc_country_eu', flag: '🇪🇺', type: 'country' }, { nameKey: 'yc_country_fi', flag: '🇫🇮', type: 'country' }, { nameKey: 'yc_country_is', flag: '🇮🇸', type: 'country' }, { nameKey: 'yc_country_it', flag: '🇮🇹', type: 'country' }, { nameKey: 'yc_country_lt', flag: '🇱🇹', type: 'country' }, { nameKey: 'yc_country_nl', flag: '🇳🇱', type: 'country' }, { nameKey: 'yc_country_no', flag: '🇳🇴', type: 'country' }, { nameKey: 'yc_country_pl', flag: '🇵🇱', type: 'country' }, { nameKey: 'yc_country_pt', flag: '🇵🇹', type: 'country' }, { nameKey: 'yc_country_ro', flag: '🇷🇴', type: 'country' }, { nameKey: 'yc_country_se', flag: '🇸🇪', type: 'country' } ];
const CountrySelectModal = ({ isOpen, onClose, onSelectCountry, t }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCountries = useMemo(() => {
        if (!searchTerm) return ALL_COUNTRIES;
        const lowercasedFilter = searchTerm.toLowerCase();
        const results: Country[] = [];
        let currentHeader: Country | null = null;
        for (const item of ALL_COUNTRIES) {
            if (item.type === 'header') {
                currentHeader = item;
            } else if (item.type === 'country' && t(item.nameKey).toLowerCase().includes(lowercasedFilter)) {
                if (currentHeader && !results.includes(currentHeader)) results.push(currentHeader);
                results.push(item);
            }
        }
        return results;
    }, [searchTerm, t]);
    const midPoint = Math.ceil(filteredCountries.length / 2);
    const leftColumnItems = filteredCountries.slice(0, midPoint);
    const rightColumnItems = filteredCountries.slice(midPoint);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1A1C20] w-full max-w-lg sm:max-w-4xl max-h-[80vh] rounded-2xl border border-zinc-800 flex flex-col animate-modal-in" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0"><h2 className="text-xl font-bold text-white">{t('yield_curves_select_country_title')}</h2><button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button></header>
                <div className="p-4 border-b border-zinc-800 shrink-0"><div className="relative"><input type="text" placeholder={t('yield_curves_country_search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500" /><div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"><Search size={20} /></div></div></div>
                <main className="p-4 overflow-y-auto flex-grow"><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8"><div>{rightColumnItems.map((item, index) => item.type === 'header' ? <h3 className="text-gray-500 text-sm mt-6 mb-3 px-2 font-semibold" key={`${item.nameKey}-${index}`}>{t(item.nameKey)}</h3> : <button onClick={() => onSelectCountry(item)} className="flex items-center gap-4 w-full text-right p-2 rounded-lg hover:bg-zinc-700/50 transition-colors" key={`${item.nameKey}-${index}`}><span className="text-2xl">{item.flag}</span><span className="text-gray-200">{t(item.nameKey)}</span></button>)}</div><div>{leftColumnItems.map((item, index) => item.type === 'header' ? <h3 className="text-gray-500 text-sm mt-6 mb-3 px-2 font-semibold" key={`${item.nameKey}-${index}`}>{t(item.nameKey)}</h3> : <button onClick={() => onSelectCountry(item)} className="flex items-center gap-4 w-full text-right p-2 rounded-lg hover:bg-zinc-700/50 transition-colors" key={`${item.nameKey}-${index}`}><span className="text-2xl">{item.flag}</span><span className="text-gray-200">{t(item.nameKey)}</span></button>)}</div></div></main>
            </div>
        </div>
    );
};

const DatePickerModal = ({ isOpen, onClose, onUpdate, t }: any) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const changeMonth = (amount: number) => setCurrentDate(d => { const n = new Date(d); n.setMonth(d.getMonth() + amount); return n; });
    const handleDayClick = (day: number) => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const handleUpdate = () => onUpdate(selectedDate.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }));
    if (!isOpen) return null;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const blanks = Array(new Date(year, month, 1).getDay()).fill(null);
    const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1);
    const dayNames = [t('yc_day_sun'), t('yc_day_sat'), t('yc_day_fri'), t('yc_day_thu'), t('yc_day_wed'), t('yc_day_tue'), t('yc_day_mon')];
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center" onClick={onClose}>
            <div className="bg-[#1A1C20] w-full max-w-sm rounded-2xl border border-zinc-800 flex flex-col p-4 shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ChevronRight size={20}/></button><div className="text-lg font-bold">{currentDate.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' })}</div><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-zinc-700 transition-colors"><ChevronLeft size={20}/></button></div>
                <div><div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">{dayNames.map(day => <div key={day} className="py-2">{day}</div>)}</div><div className="grid grid-cols-7 text-center text-sm">{blanks.map((_, i) => <div key={`b-${i}`}></div>)}{days.map(day => <div key={day} className="p-1"><button onClick={() => handleDayClick(day)} className={`w-full h-8 rounded-lg transition-colors ${selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? 'bg-white text-black font-bold' : 'text-gray-300 hover:bg-zinc-700'}`}>{day}</button></div>)}</div></div>
                <button onClick={handleUpdate} className="w-full mt-4 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">{t('yield_curves_select_date_button', { date: selectedDate.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }) })}</button>
            </div>
        </div>
    );
};

const Toast = ({ message }: { message: string }) => {
    if (!message) return null;
    return <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-lg shadow-xl border border-zinc-700 z-[100] animate-fade-in-out">{message}</div>;
};

const TimeSlider = ({ isPlaying, onPlayPause, onSliderChange, currentTimeIndex }: any) => {
    const years = Array.from({ length: HISTORICAL_YEARS + 1 }, (_, i) => 2020 + i);
    const displayDate = new Date(2020, currentTimeIndex, 1).toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' });
    return (
        <div className="mt-4 bg-[#1A1C20] p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
            <button onClick={onPlayPause} className="w-10 h-10 rounded-full bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600 transition-colors flex-shrink-0">
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            <div className="flex-grow">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{displayDate}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={HISTORICAL_MONTHS - 1}
                    value={currentTimeIndex}
                    onChange={(e) => onSliderChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer range-sm"
                />
                 <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {years.map(year => <span key={year}>{year}</span>)}
                </div>
            </div>
        </div>
    );
};

export const YieldCurvesPage = () => {
    const { t } = useLanguage();
    const [curves, setCurves] = useState<Curve[]>(MOCK_DATA);
    const [showKeyMaturities, setShowKeyMaturities] = useState(false);
    const [scaleType, setScaleType] = useState('tenor');
    const [heatmapEnabled, setHeatmapEnabled] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [curveToUpdate, setCurveToUpdate] = useState<number | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<{ curveId: number | null, label: string | null }>({ curveId: null, label: null });
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [comparisonSelection, setComparisonSelection] = useState<number[]>([]);
    const [historicalData, setHistoricalData] = useState<Record<number, YieldData[]>>({});
    const [currentTimeIndex, setCurrentTimeIndex] = useState(HISTORICAL_MONTHS - 1);
    const [isPlaying, setIsPlaying] = useState(false);
    const tableEndRef = useRef<HTMLTableRowElement>(null);
    const intervalRef = useRef<number | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleAddCurve = () => setIsCountryModalOpen(true);
    const handleSelectCountry = (country: Country) => {
        const newId = curves.length > 0 ? Math.max(...curves.map(c => c.id)) + 1 : 1;
        const newColor = NEW_CURVE_COLORS[newId % NEW_CURVE_COLORS.length];
        const newCurve: Curve = { id: newId, country: country.nameKey, date: new Date().toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }), color: newColor, flag: country.flag || '🏳️', visible: true, data: generateRandomData() };
        setCurves(prev => [...prev, newCurve]);
        setIsCountryModalOpen(false);
    };
    const handleDeleteCurve = (id: number) => setCurves(prev => prev.filter(c => c.id !== id));
    const handleCopyCurve = (id: number) => {
        const curveToCopy = curves.find(c => c.id === id);
        if (curveToCopy) {
            const newId = curves.length > 0 ? Math.max(...curves.map(c => c.id)) + 1 : 1;
            const newCurve = { ...curveToCopy, id: newId, date: new Date().toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }) };
            setCurves(prev => [...prev, newCurve]);
            showToast(t('yield_curves_toast_curve_copied'));
        }
    };
    const handleOpenDatePicker = (id: number) => {
        setCurveToUpdate(id);
        setIsDateModalOpen(true);
    };
    const handleUpdateDate = (date: string) => {
        setCurves(prev => prev.map(c => c.id === curveToUpdate ? { ...c, date } : c));
        setIsDateModalOpen(false);
        setCurveToUpdate(null);
    };
    const handleComparisonSelect = (id: number) => {
        setComparisonSelection(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) newSelection.delete(id);
            else if (newSelection.size < 2) newSelection.add(id);
            return Array.from(newSelection);
        });
    };

    useEffect(() => {
        const initialHistory: Record<number, YieldData[]> = {};
        curves.forEach(curve => {
            initialHistory[curve.id] = generateHistoricalDataForCurve(curve.data);
        });
        setHistoricalData(initialHistory);
    }, [curves.length]);

    useEffect(() => {
        if (tableEndRef.current) {
            tableEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [curves.length]);

    const playTimeline = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPlaying(true);
        if (currentTimeIndex >= HISTORICAL_MONTHS - 1) {
            setCurrentTimeIndex(0);
        }
        intervalRef.current = window.setInterval(() => {
            setCurrentTimeIndex(prevIndex => {
                if (prevIndex >= HISTORICAL_MONTHS - 1) {
                    setIsPlaying(false);
                    if(intervalRef.current) clearInterval(intervalRef.current);
                    return HISTORICAL_MONTHS - 1;
                }
                return prevIndex + 1;
            });
        }, 100);
    };

    const pauseTimeline = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) pauseTimeline();
        else playTimeline();
    };
    
    return (
        <div className="bg-[#0D0E11] text-gray-300 font-sans min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <Header 
                    onToggleMaturities={() => setShowKeyMaturities(p => !p)} 
                    scaleType={scaleType} 
                    setScaleType={setScaleType} 
                    heatmapEnabled={heatmapEnabled} 
                    setHeatmapEnabled={setHeatmapEnabled} 
                    onShowToast={showToast} 
                    isCompareMode={isCompareMode} 
                    onToggleCompareMode={() => { setIsCompareMode(p => !p); setComparisonSelection([]); }}
                    t={t}
                />
                <div className="mt-8">
                    <YieldChart 
                        curves={curves}
                        setCurves={setCurves}
                        labels={showKeyMaturities ? KEY_CHART_LABELS : MAIN_CHART_LABELS}
                        scaleType={scaleType} 
                        selectedPoint={selectedPoint} 
                        onPointSelect={setSelectedPoint}
                        onLabelHover={setHoveredLabel}
                        historicalData={historicalData}
                        currentTimeIndex={currentTimeIndex}
                        isCompareMode={isCompareMode}
                        comparisonSelection={comparisonSelection}
                        t={t}
                    />
                     <TimeSlider
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        onSliderChange={setCurrentTimeIndex}
                        currentTimeIndex={currentTimeIndex}
                    />
                    <YieldTable
                        curves={curves} 
                        setCurves={setCurves}
                        headers={showKeyMaturities ? KEY_TABLE_HORIZONS : TIME_HORIZONS_TABLE}
                        onDeleteCurve={handleDeleteCurve}
                        onCopyCurve={handleCopyCurve}
                        onAddCurve={handleAddCurve}
                        heatmapEnabled={heatmapEnabled}
                        onOpenDatePicker={handleOpenDatePicker}
                        selectedPoint={selectedPoint}
                        hoveredLabel={hoveredLabel}
                        tableEndRef={tableEndRef}
                        isCompareMode={isCompareMode}
                        comparisonSelection={comparisonSelection}
                        onComparisonSelect={handleComparisonSelect}
                        isPlaying={isPlaying}
                        t={t}
                    />
                </div>
            </main>
            <CountrySelectModal isOpen={isCountryModalOpen} onClose={() => setIsCountryModalOpen(false)} onSelectCountry={handleSelectCountry} t={t} />
            <DatePickerModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onUpdate={handleUpdateDate} t={t} />
            <Toast message={toastMessage} />
        </div>
    );
};