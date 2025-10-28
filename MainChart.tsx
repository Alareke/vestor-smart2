/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, GitCompareArrows, Bookmark, Code, X, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import { useAI } from './i18n/AIContext';
// FIX: Import GenerateContentResponse to handle API response type correctly.
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SymbolIcon } from './components/SymbolIcon';

const ChartAnalysisPanel = ({ result, onClose, t }) => {
    return (
        <div className="absolute inset-2 sm:inset-4 bg-gray-900/80 dark:bg-black/80 backdrop-blur-md rounded-lg p-3 sm:p-4 z-20 flex flex-col animate-fadeIn text-sm">
            <header className="flex-shrink-0 flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2 text-white">
                    <Bot size={18} /> {t('ai_analysis_panel_title')}
                </h4>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors">
                    <X size={18}/>
                </button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {result.isLoading && (
                     <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                        <Loader2 size={18} className="animate-spin"/>
                        <span>{t('ai_analysis_loading')}</span>
                    </div>
                )}
                {result.error && <p className="text-red-400">{result.error}</p>}
                {!result.isLoading && !result.error && (
                     <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.text}</p>
                )}
            </div>
        </div>
    );
};

export const MainChart = ({ chartData, tickerInfo, activeTimeframe, onTimeframeChange, isDark }) => {
  const { t, language } = useLanguage();
  const { isAIEnabled } = useAI();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, dataIndex: 0 });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const chartContainerRef = useRef(null);
  
  const [analysisResult, setAnalysisResult] = useState({
      isOpen: false,
      isLoading: false,
      text: '',
      error: null,
  });

  const gridColor = isDark ? "#374151" : "#E5E7EB";
  const textColor = isDark ? "#d1d5db" : "#6B7281";
  const tooltipBgClass = isDark ? "bg-black/80 text-white" : "bg-white/90 text-black border border-gray-200";
  const dotStrokeColor = isDark ? "white" : "#131722";
  
  const handleAnalyzeChart = useCallback(async () => {
    if (!tickerInfo || !chartData) return;

    setAnalysisResult({ isOpen: true, isLoading: true, text: '', error: null });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ohlcSummary = chartData.data.slice(-20).map(d => `${t('chart_ohlc_o')}:${d.open.toFixed(2)},${t('chart_ohlc_h')}:${d.high.toFixed(2)},${t('chart_ohlc_l')}:${d.low.toFixed(2)},${t('chart_ohlc_c')}:${d.close.toFixed(2)}`).join('; ');
        
            name: t(tickerInfo.nameKey),
            id: tickerInfo.id,
            timeframe: activeTimeframe,
            ohlc: ohlcSummary,
            price: chartData.data[chartData.data.length - 1].close.toFixed(2),
            lang: language === 'ar' ? 'Arabic' : 'English'
        });

        // FIX: Explicitly type the API response to ensure `response.text` is accessible.
        const response: GenerateContentResponse = await ai.models.generateContent({
        });

        setAnalysisResult({ isOpen: true, isLoading: false, text: response.text, error: null });

    } catch (err: any) {
        let errorMessageKey = 'ai_analysis_error'; // default
        const errorMessage = err?.message?.toLowerCase() || '';

        if (errorMessage.includes('safety')) {
            errorMessageKey = 'ai_analysis_error_safety';
        } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            errorMessageKey = 'ai_analysis_error_ratelimit';
        } else if (err instanceof TypeError) { // Often indicates network issue
             errorMessageKey = 'ai_analysis_error_network';
        }
        
        setAnalysisResult({ isOpen: true, isLoading: false, text: '', error: t(errorMessageKey) });
    }
  }, [tickerInfo, chartData, activeTimeframe, t, language]);

  if (!chartData || !tickerInfo) {
      return (
        <div className="h-[550px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t('loading_chart_data')}
        </div>
      );
  }

  const { data, xAxisLabels, color } = chartData;

  const svgWidth = 1200;
  const priceChartHeight = 400;
  const xAxisHeight = 20;
  const totalHeight = priceChartHeight + xAxisHeight + 20;

  const priceChartYOffset = 0;
  const xAxisYOffset = priceChartYOffset + priceChartHeight + 5;
  
  const priceValues = data.map(d => d.close);
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice || 1;
  
  const priceScaleY = (v) => priceChartYOffset + priceChartHeight - ((v - minPrice) / priceRange) * priceChartHeight;

  const path = data.map((d, i) => {
    const x = i * (svgWidth / (data.length > 1 ? data.length - 1 : 1));
    const y = priceScaleY(d.close);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  
  const latestDataPoint = data[data.length - 1];
  const currentPriceY = priceScaleY(latestDataPoint.close);
  const gradientPath = path + ` L${svgWidth},${currentPriceY} L${svgWidth},${priceChartYOffset + priceChartHeight} L0,${priceChartYOffset + priceChartHeight} Z`;

  const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
      const val = maxPrice - i * (priceRange / 5);
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  const chartPeriods = t('chart_periods');
  
  const chartTools = [
      { Icon: Maximize2, key: 'maximize', titleKey: 'chart_tool_maximize' },
      { Icon: GitCompareArrows, key: 'compare', titleKey: 'chart_tool_compare' },
      { Icon: Bookmark, key: 'bookmark', titleKey: 'chart_tool_bookmark' },
      { Icon: Code, key: 'code', titleKey: 'chart_tool_code' },
  ];

  const handleMouseMove = (e) => {
    if (!chartContainerRef.current || data.length === 0) return;

    const svg = chartContainerRef.current.querySelector('svg');
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    
    if (svgPoint.y < priceChartYOffset || svgPoint.y > xAxisYOffset) {
      handleMouseLeave();
      return;
    }

    const svgX = Math.max(0, Math.min(svgWidth, svgPoint.x));
    const dataIndex = Math.round(svgX / (svgWidth / (data.length - 1)));
    const safeIndex = Math.max(0, Math.min(dataIndex, data.length - 1));

    const dataPoint = data[safeIndex];
    const y = priceScaleY(dataPoint.close);
    
    setTooltip({
      visible: true,
      x: safeIndex * (svgWidth / (data.length - 1)),
      y: y,
      dataIndex: safeIndex,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(t => ({ ...t, visible: false }));
  };
  
  const tooltipData = tooltip.visible ? data[tooltip.dataIndex] : null;
  const tooltipX = tooltip.x > 1050 ? tooltip.x - 120 : tooltip.x + 20;
  const tooltipYPos = tooltip.y < 80 ? tooltip.y + 20 : tooltip.y - 90;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-3">
              <SymbolIcon symbol={tickerInfo.id} size={32} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t(tickerInfo.nameKey)}</h3>
          </div>
      </div>

      <div
        ref={chartContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[450px] sm:h-[550px] cursor-crosshair"
      >
        {analysisResult.isOpen && <ChartAnalysisPanel result={analysisResult} onClose={() => setAnalysisResult(p => ({...p, isOpen: false}))} t={t} />}

        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${totalHeight}`} preserveAspectRatio="none">
          {/* Price Chart Y-axis grid lines and labels */}
          {yAxisLabels.map((label, i) => (
            <g key={`price-grid-${i}`}>
              <line x1="0" y1={priceChartYOffset + i * (priceChartHeight / (yAxisLabels.length -1))} x2={svgWidth} y2={priceChartYOffset + i * (priceChartHeight / (yAxisLabels.length -1))} stroke={gridColor} strokeWidth="1" />
              <text x={svgWidth - 10} y={priceChartYOffset + i * (priceChartHeight / (yAxisLabels.length -1)) - 5} fill={textColor} fontSize="12" textAnchor="end">{label}</text>
            </g>
          ))}
          
          {/* Price Chart Gradient & Path */}
          <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
          </defs>
          <path d={gradientPath} fill="url(#chartGradient)" />
          <path d={path} fill="none" stroke={color} strokeWidth="2.5" />

          {/* Current price indicator */}
          <line x1="0" y1={currentPriceY} x2={svgWidth} y2={currentPriceY} stroke={color} strokeWidth="1" strokeDasharray="5,5" />
          <foreignObject x={svgWidth - 100} y={currentPriceY - 12} width="100" height="24">
            <div className={`${isDark ? 'text-white' : 'text-black'} text-xs font-bold p-1 rounded text-center`} style={{ backgroundColor: color }}>{latestDataPoint.close.toFixed(2)}</div>
          </foreignObject>

          {/* X-axis labels */}
          {xAxisLabels.map((label, i) => (
              <text key={i} x={i * (svgWidth / (xAxisLabels.length -1))} y={xAxisYOffset + 15} fill={textColor} fontSize="12" textAnchor="middle">{label}</text>
          ))}

           {/* Interactive hover elements */}
          {tooltip.visible && tooltipData && (
            <g className="pointer-events-none">
              {/* Vertical crosshair */}
              <line x1={tooltip.x} y1={priceChartYOffset} x2={tooltip.x} y2={priceChartYOffset + priceChartHeight} stroke={textColor} strokeWidth="1" strokeDasharray="3,3" />
              {/* Horizontal crosshair */}
              <line x1="0" y1={tooltip.y} x2={svgWidth} y2={tooltip.y} stroke={textColor} strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Y-axis price label */}
              <foreignObject x={svgWidth - 100} y={tooltip.y - 12} width="100" height="24">
                <div className={`${isDark ? 'text-white' : 'text-black'} text-xs font-bold p-1 rounded text-center`} style={{ backgroundColor: color }}>{tooltipData.close.toFixed(2)}</div>
              </foreignObject>

              {/* Dot on the line */}
              <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={color} stroke={dotStrokeColor} strokeWidth="2" />
              
              {/* Main tooltip */}
              <foreignObject x={tooltipX} y={tooltipYPos} width="110" height="85">
                <div className={`${tooltipBgClass} text-xs rounded-lg p-2 shadow-lg backdrop-blur-sm`}>
                  {tooltipData && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono">
                        <span className="font-bold text-gray-500 dark:text-gray-400">{t('chart_ohlc_o')}:</span><span>{tooltipData.open.toFixed(2)}</span>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{t('chart_ohlc_h')}:</span><span>{tooltipData.high.toFixed(2)}</span>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{t('chart_ohlc_l')}:</span><span>{tooltipData.low.toFixed(2)}</span>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{t('chart_ohlc_c')}:</span><span>{tooltipData.close.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
      <div className="flex flex-wrap justify-between items-center mt-4 px-2 gap-y-2">
        <div className="flex items-center flex-wrap gap-1 bg-gray-100 dark:bg-gray-900 rounded-full p-1">
            {chartPeriods.map((period) => (
                <button 
                  key={period} 
                  onClick={() => onTimeframeChange(period)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTimeframe === period ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >{period}</button>
            ))}
        </div>
        <div className="flex items-center gap-2">
            {isAIEnabled && (
                <>
                    <button onClick={handleAnalyzeChart} title={t('ai_analysis_button')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span>🤖</span>
                        <span>{t('ai_analysis_button')}</span>
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:border-gray-700"></div>
                </>
            )}
            {chartTools.map((tool) => {
                const { Icon, key, titleKey } = tool;
                const isBookmark = key === 'bookmark';
                const isActive = isBookmark && isBookmarked;
                
                const handleClick = () => {
                    if (isBookmark) setIsBookmarked(prev => !prev);
                };

                return (
                    <button key={key} title={t(titleKey)} onClick={handleClick} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Icon size={18} fill={isActive ? 'currentColor' : 'none'} />
                    </button>
                );
            })}
        </div>
      </div>
    </>
  );
};