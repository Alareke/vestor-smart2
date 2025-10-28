/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, HelpCircle, FolderSearch, Plus, X } from 'lucide-react';
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
  ChartOptions,
  ChartDataset,
} from 'chart.js';
// FIX: Changed import to default for proper type augmentation.
import annotationPlugin from 'chartjs-plugin-annotation';
import { useLanguage } from '../i18n/LanguageContext';

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

const labels = Array.from({ length: 41 }, (_, i) => 5900 + i * 25); // 5900 to 6900

const expiryDates = ['18 أغسطس 2025', '15 سبتمبر 2025', '20 أكتوبر 2025'];

const optionChainData = {
    [expiryDates[0]]: Array.from({ length: 15 }, (_, i) => 6100 + i * 25).map((strike, i) => ({
        strike,
        call: { delta: (0.9 - i * 0.05).toFixed(2), theta: (-0.1 - i * 0.01).toFixed(2), bid: (170 - i * 10).toFixed(2), ask: (172 - i * 10).toFixed(2) },
        put: { delta: (-0.1 - i * 0.05).toFixed(2), theta: (-0.2 - i * 0.01).toFixed(2), bid: (5 + i * 5).toFixed(2), ask: (6 + i * 5).toFixed(2) },
    })),
    [expiryDates[1]]: Array.from({ length: 15 }, (_, i) => 6100 + i * 25).map((strike, i) => ({
        strike,
        call: { delta: (0.85 - i * 0.05).toFixed(2), theta: (-0.15 - i * 0.01).toFixed(2), bid: (190 - i * 10).toFixed(2), ask: (192 - i * 10).toFixed(2) },
        put: { delta: (-0.15 - i * 0.05).toFixed(2), theta: (-0.25 - i * 0.01).toFixed(2), bid: (15 + i * 5).toFixed(2), ask: (16 + i * 5).toFixed(2) },
    })),
    [expiryDates[2]]: Array.from({ length: 15 }, (_, i) => 6100 + i * 25).map((strike, i) => ({
        strike,
        call: { delta: (0.8 - i * 0.05).toFixed(2), theta: (-0.2 - i * 0.01).toFixed(2), bid: (210 - i * 10).toFixed(2), ask: (212 - i * 10).toFixed(2) },
        put: { delta: (-0.2 - i * 0.05).toFixed(2), theta: (-0.3 - i * 0.01).toFixed(2), bid: (25 + i * 5).toFixed(2), ask: (26 + i * 5).toFixed(2) },
    })),
};

const strategiesData = {
  'Bull Call Spread': {
    basePnl: labels.map(p => {
        const lowerStrike = 6150;
        const upperStrike = 6250;
        const netDebit = 40;
        if (p <= lowerStrike) return -netDebit;
        if (p >= upperStrike) return (upperStrike - lowerStrike) - netDebit;
        return p - lowerStrike - netDebit;
    }),
    baseT0: [-35, -35, -34, -32, -28, -20, -10, -5, -2, -5, -10, -18, -25, -30, -33, -35, -36, -37, -38, -39, -40, -41, -42, -43, -44, -45, -46, -47, -48, -49, -50, -50, -50, -50, -50, -50, -50, -50, -50, -50, -50],
    delta: [0.01, 0.01, 0.02, 0.03, 0.05, 0.08, 0.15, 0.25, 0.40, 0.50, 0.45, 0.35, 0.28, 0.20, 0.15, 0.10, 0.08, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
    summary: [
      { labelKey: 'options_summary_delta', value: '0.15' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,190' },
      { labelKey: 'options_summary_pop', value: '45.1%' },
      { labelKey: 'options_summary_max_loss', value: '-40.00', color: 'text-red-500', isScalable: true },
      { labelKey: 'options_summary_max_profit', value: '60.00', color: 'text-green-500', isScalable: true },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Short Put': {
    basePnl: labels.map(p => {
      const strike = 6200;
      const premium = 45;
      if (p >= strike) return premium;
      return (p - strike) + premium;
    }),
    baseT0: [-64,-53,-42,-31,-20,-9,2,13,24,35,40,42,41,38,33,26,19,12,5,-2,-9,-16,-23,-30,-37,-44,-51,-58,-65,-72,-79,-86,-93,-100,-100,-100,-100,-100,-100,-100,-100],
    summary: [
      { labelKey: 'options_summary_delta', value: '0.48' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,155' },
      { labelKey: 'options_summary_pop', value: '68.2%' },
      { labelKey: 'options_summary_max_loss', valueKey: 'options_summary_unlimited', color: 'text-red-500' },
      { labelKey: 'options_summary_max_profit', value: '45.00', color: 'text-green-500', isScalable: true },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Bear Put Spread': {
    basePnl: labels.map(p => {
      const high = 6250;
      const low = 6150;
      const debit = 30;
      if (p >= high) return -debit;
      if (p <= low) return (high - low) - debit;
      return high - p - debit;
    }),
    baseT0: [65, 60, 55, 50, 43, 35, 25, 15, 5, -5, -15, -25, -30, -32, -33, -34, -34, -33, -32, -31, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30, -30],
    summary: [
      { labelKey: 'options_summary_delta', value: '-0.18' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,220' },
      { labelKey: 'options_summary_pop', value: '48.5%' },
      { labelKey: 'options_summary_max_loss', value: '-30.00', color: 'text-red-500', isScalable: true },
      { labelKey: 'options_summary_max_profit', value: '70.00', color: 'text-green-500', isScalable: true },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Long Put': {
    basePnl: labels.map(p => {
      const strike = 6200;
      const premium = 50;
      if (p >= strike) return -premium;
      return strike - p - premium;
    }),
    baseT0: [200, 150, 100, 50, 0, -25, -40, -48, -50, -48, -45, -40, -35, -30, -28, -25, -24, -23, -22, -21, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20, -20],
    summary: [
      { labelKey: 'options_summary_delta', value: '-0.45' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,150' },
      { labelKey: 'options_summary_pop', value: '35.0%' },
      { labelKey: 'options_summary_max_loss', value: '-50.00', color: 'text-red-500', isScalable: true },
      { labelKey: 'options_summary_max_profit', valueKey: 'options_summary_unlimited', color: 'text-green-500' },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Bear Call Spread': {
    basePnl: labels.map(p => {
      const low = 6150;
      const high = 6250;
      const credit = 40;
      if (p <= low) return credit;
      if (p >= high) return credit - (high - low);
      return credit - (p - low);
    }),
    baseT0: [38, 38, 38, 38, 38, 35, 30, 22, 15, 5, -5, -18, -30, -40, -45, -48, -50, -51, -52, -53, -54, -55, -56, -57, -58, -59, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60, -60],
    summary: [
      { labelKey: 'options_summary_delta', value: '-0.25' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,190' },
      { labelKey: 'options_summary_pop', value: '55.2%' },
      { labelKey: 'options_summary_max_loss', value: '-60.00', color: 'text-red-500', isScalable: true },
      { labelKey: 'options_summary_max_profit', value: '40.00', color: 'text-green-500', isScalable: true },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Long Call': {
    basePnl: labels.map(p => {
      const strike = 6200;
      const premium = 70;
      if (p <= strike) return -premium;
      return p - strike - premium;
    }),
    baseT0: [-68, -68, -68, -68, -68, -65, -60, -50, -40, -25, -10, 5, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580],
    summary: [
      { labelKey: 'options_summary_delta', value: '0.55' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,270' },
      { labelKey: 'options_summary_pop', value: '42.8%' },
      { labelKey: 'options_summary_max_loss', value: '-70.00', color: 'text-red-500', isScalable: true },
      { labelKey: 'options_summary_max_profit', valueKey: 'options_summary_unlimited', color: 'text-green-500' },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
  'Short Call': {
    basePnl: labels.map(p => {
      const strike = 6300;
      const premium = 55;
      if (p <= strike) return premium;
      return premium - (p - strike);
    }),
    baseT0: [50, 52, 53, 54, 55, 55, 54, 53, 50, 45, 38, 30, 20, 10, -5, -15, -30, -50, -70, -90, -110, -130, -150, -170, -190, -210, -230, -250, -270, -290, -310, -330, -350, -370, -390, -410, -430, -450, -470, -490, -510],
    summary: [
      { labelKey: 'options_summary_delta', value: '-0.40' },
      { labelKey: 'options_summary_size', value: '1' },
      { labelKey: 'options_summary_breakeven', value: '6,355' },
      { labelKey: 'options_summary_pop', value: '72.1%' },
      { labelKey: 'options_summary_max_loss', valueKey: 'options_summary_unlimited', color: 'text-red-500' },
      { labelKey: 'options_summary_max_profit', value: '55.00', color: 'text-green-500', isScalable: true },
      { labelKey: 'options_summary_underlying', value: '6,264.50 USD' },
    ],
  },
};

const strategies = [
  { name: 'Short Put', typeKey: 'options_type_bullish' },
  { name: 'Bull Call Spread', typeKey: 'options_type_bullish' },
  { name: 'Long Call', typeKey: 'options_type_bullish' },
  { name: 'Bear Put Spread', typeKey: 'options_type_bearish' },
  { name: 'Long Put', typeKey: 'options_type_bearish' },
  { name: 'Bear Call Spread', typeKey: 'options_type_bearish' },
  { name: 'Short Call', typeKey: 'options_type_bearish' },
];

const StrategyCarousel = ({ strategies, activeStrategyName, onStrategyClick, t }) => {
  const scrollContainerRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);
      
      const timeoutId = setTimeout(checkScrollability, 100);

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        clearTimeout(timeoutId);
      };
    }
  }, [checkScrollability, strategies]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };
    
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className="bg-[#2A2A44] p-2 rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronLeft size={20} />
      </button>
      <div 
        ref={scrollContainerRef}
        className="flex-grow flex items-center gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {strategies.map((s, i) => {
          const isActive = s.name === activeStrategyName;
          const isImplemented = Object.keys(strategiesData).includes(s.name);
          return (
            <button 
              key={i} 
              onClick={() => isImplemented && onStrategyClick(s.name)}
              disabled={!isImplemented}
              className={`flex-shrink-0 text-sm font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-colors duration-200 ${
                isActive ? 'bg-gray-700' : 'bg-[#1C1C33]'
              } ${
                isImplemented ? 'hover:bg-gray-600' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <span>{s.name}</span>
              <span className="bg-gray-500/50 text-white text-xs px-2 py-0.5 rounded-full">{t(s.typeKey)}</span>
            </button>
          )
        })}
      </div>
      <button 
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className="bg-[#2A2A44] p-2 rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const Filters = ({ activeFilter, onFilterChange, t }) => {
    const filterOptionsValue = t('options_page_sentiment_filters');
    const filterOptions = Array.isArray(filterOptionsValue) ? filterOptionsValue : [];
    return (<div className="flex justify-start items-center gap-2 flex-wrap">
        <span className="text-lg font-bold">{t('options_page_market_sentiment')}</span>
        <div className="flex items-center gap-2 bg-[#1C1C33] p-1 rounded-full">
            {filterOptions.map(filter => (<button key={filter} onClick={() => onFilterChange(filter)} className={`transition-colors duration-200 text-sm py-1 px-4 rounded-full ${activeFilter === filter
                ? 'bg-[#565674] text-white'
                : 'text-gray-400 hover:bg-[#2A2A44]'}`}>{filter}</button>))}
        </div>
    </div>);
};

const ChartControls = ({ 
  size, setSize, 
  selectedExpiry, setSelectedExpiry, 
  selectedGreek, setSelectedGreek,
  selectedStrike, setSelectedStrike,
  availableStrikes,
  t
}) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 text-sm text-gray-300 gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex flex-col items-end w-full">
                <label>{t('options_controls_expiry')}</label>
                <div className="w-full flex items-center gap-2 bg-[#0A0A1A] border border-gray-700 rounded-md px-3 py-1 mt-1">
                    <select
                        value={selectedExpiry}
                        onChange={(e) => setSelectedExpiry(e.target.value)}
                        className="w-full bg-transparent text-white focus:outline-none"
                    >
                        {expiryDates.map(date => <option key={date} value={date}>{date}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap justify-end">
            <div className="flex flex-col items-end flex-grow">
                <label>{t('options_controls_strike')}</label>
                <div className="w-full flex items-center gap-2 bg-[#0A0A1A] border border-gray-700 rounded-md px-3 py-1 mt-1">
                    <select
                        value={selectedStrike ?? ''}
                        onChange={(e) => setSelectedStrike(Number(e.target.value))}
                        className="w-full bg-transparent text-white focus:outline-none"
                    >
                        {availableStrikes.map(strike => <option key={strike} value={strike}>{strike}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                    <HelpCircle size={12} className="text-gray-500"/>
                    <label>{t('options_controls_size')}</label>
                </div>
                <input
                    type="number"
                    min="0"
                    value={size === null ? '' : size.toString()}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                            setSize(null);
                        } else {
                            const num = parseFloat(val);
                            if (num >= 0) {
                                setSize(num);
                            }
                        }
                    }}
                    className="bg-[#0A0A1A] border border-gray-700 rounded-md px-3 py-1 w-20 text-center mt-1" />
            </div>
            <div className="flex flex-col items-end flex-grow">
                <label>Greek</label>
                <div className="w-full flex items-center gap-2 bg-[#0A0A1A] border border-gray-700 rounded-md px-3 py-1 mt-1">
                    <select
                        value={selectedGreek}
                        onChange={(e) => setSelectedGreek(e.target.value)}
                        className="w-full bg-transparent text-white focus:outline-none"
                    >
                        <option value="فيجا">{t('options_greek_vega')}</option>
                        <option value="دلتا">{t('options_greek_delta')}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
);

const initialChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(29, 29, 51, 0.9)',
      borderColor: '#565674',
      borderWidth: 1,
      titleColor: '#EAEAEA',
      bodyColor: '#EAEAEA',
      padding: 10,
    },
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yScaleID: 'y',
          xMin: 6264.50,
          xMax: 6264.50,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1,
          borderDash: [6, 6],
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: 'gray' },
    },
    y: {
      position: 'left',
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: 'gray', stepSize: 40, callback: (v) => (v as number).toFixed(2) },
    },
    y1: {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: { color: 'gray' },
    },
  },
};

const ChartComponent = ({ data, options, chartRef, onDrag, t }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    useEffect(() => {
        if(options.plugins.tooltip.callbacks){
            options.plugins.tooltip.callbacks.title = (tooltipItems) => `${t('options_chart_tooltip_price')}: ${tooltipItems[0].label}`;
            options.plugins.tooltip.callbacks.label = (context) => {
              const datasetId = (context.dataset as ChartDataset<'line'> & { id?: string }).id;
              let label = context.dataset.label || '';
              const value = context.parsed.y;
              if (datasetId === 'pnl') {
                return `${t('options_chart_tooltip_pnl_expiry')}: ${value.toFixed(2)}`;
              } else if (datasetId === 't0') {
                return `${t('options_chart_tooltip_pnl_t0')}: ${value.toFixed(2)}`;
              } else if (datasetId === 'greek') {
                 if (label === t('options_greek_delta')) {
                    return `${label}: ${value.toFixed(3)}`;
                 }
                 return `${label}: ${(value * 100).toFixed(2)}%`;
              }
              return `${label}: ${value.toFixed(2)}`;
            };
        }
    },[options, t])

    const handleInteraction = (e, isEnding = false) => {
        if (!onDrag || !chartRef.current) return;
        if (isEnding) {
            if (isDragging) {
                setIsDragging(false);
                onDrag(null, true);
            }
            return;
        }

        const chart = chartRef.current;
        const rect = chart.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const price = chart.scales.x.getValueForPixel(x);
        const annotation = chart.options.plugins.annotation.annotations.line1;
        const currentPriceLine = annotation.xMin;
        
        if (e.type === 'mousedown') {
            const priceAtClick = chart.scales.x.getValueForPixel(e.nativeEvent.offsetX);
            if (Math.abs(priceAtClick - currentPriceLine) < 50) {
                setIsDragging(true);
            }
        }
        
        if (isDragging && e.type === 'mousemove') {
            const minPrice = chart.scales.x.min;
            const maxPrice = chart.scales.x.max;
            const clampedPrice = Math.max(minPrice, Math.min(maxPrice, price));
            onDrag(clampedPrice, false);
        }
    };

    return (
        <div style={{ height: '400px', cursor: isDragging ? 'grabbing' : 'default' }}
            onMouseDown={(e) => handleInteraction(e)}
            onMouseMove={(e) => handleInteraction(e)}
            onMouseUp={(e) => handleInteraction(e, true)}
            onMouseLeave={(e) => handleInteraction(e, true)}
        >
            <Line ref={chartRef} data={data} options={options} />
        </div>
    );
};

const SummaryBar = ({ data, t }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(5);

    const updateVisibleItems = useCallback(() => {
        const width = window.innerWidth;
        if (width < 768) { // Mobile
            setVisibleItems(2);
        } else if (width < 1024) { // Tablet
            setVisibleItems(3);
        } else { // Desktop
            setVisibleItems(5);
        }
    }, []);

    useEffect(() => {
        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, [updateVisibleItems]);

    useEffect(() => {
        setStartIndex(0);
    }, [data, visibleItems]);

    const handleNext = () => {
        setStartIndex(prev => Math.min(prev + 1, data.length - visibleItems));
    };

    const handlePrev = () => {
        setStartIndex(prev => Math.max(prev - 1, 0));
    };

    const isPrevDisabled = startIndex === 0;
    const isNextDisabled = data.length <= visibleItems || startIndex >= data.length - visibleItems;

    const visibleData = data.slice(startIndex, startIndex + visibleItems);
    
    const gridColsClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        5: 'grid-cols-5',
    }[visibleItems] || 'grid-cols-5';

    return (
        <div className="flex justify-between items-center bg-[#101021] p-4 rounded-2xl">
            <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                className="bg-[#2A2A44] p-2 rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={20} />
            </button>
            <div className={`flex-grow grid ${gridColsClass} gap-4 text-center mx-4 min-h-[56px]`}>
                {visibleData.map(item => (
                    <div key={item.labelKey || item.label}>
                        <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-400">
                            <HelpCircle size={12} />
                            <span>{item.labelKey ? t(item.labelKey) : item.label}</span>
                        </div>
                        <p className={`text-lg sm:text-xl font-bold ${item.color || 'text-white'}`}>{item.valueKey ? t(item.valueKey) : item.value}</p>
                    </div>
                ))}
                 {Array.from({ length: Math.max(0, visibleItems - visibleData.length) }).map((_, i) => <div key={`placeholder-${i}`}></div>)}
            </div>
            <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="bg-[#2A2A44] p-2 rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

const VolatilityView = ({t}) => {
  const volLabels = Array.from({ length: 30 }, (_, i) => `${t('options_volatility_day')} ${i + 1}`);
  const historicalVol = [18, 19, 20, 22, 21, 23, 25, 24, 26, 28, 30, 29, 27, 26, 25, 24, 23, 22, 21, 20, 22, 24, 23, 25, 26, 27, 28, 29, 30, 31];
  const impliedVol = [22, 23, 24, 25, 26, 28, 30, 31, 32, 33, 35, 34, 32, 30, 29, 28, 27, 26, 28, 29, 30, 31, 30, 29, 28, 29, 31, 33, 34, 35];

  const volatilityChartData = {
    labels: volLabels,
    datasets: [
      {
        label: t('options_volatility_historical'),
        data: historicalVol.map(v => v/100),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        tension: 0.3,
        fill: false,
      },
      {
        label: t('options_volatility_implied'),
        data: impliedVol.map(v => v/100),
        borderColor: '#FFA500',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        tension: 0.3,
        fill: false,
      }
    ]
  };

  const volatilityChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: { color: 'white' }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(2)}%`,
        }
      },
       title: {
        display: true,
        text: t('options_volatility_chart_title'),
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: 'gray',
          callback: (value) => `${(Number(value) * 100).toFixed(0)}%`
        }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'gray' }
      }
    }
  };

  return (
    <div className="bg-[#101021] p-4 md:p-6 rounded-2xl my-5 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-[#1C1C33] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('options_volatility_iv_rank')}</h3>
            <p className="text-2xl font-bold text-white">65</p>
        </div>
        <div className="bg-[#1C1C33] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('options_volatility_iv_percentile')}</h3>
            <p className="text-2xl font-bold text-white">85%</p>
        </div>
        <div className="bg-[#1C1C33] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('options_volatility_iv_current')}</h3>
            <p className="text-2xl font-bold text-white">35.0%</p>
        </div>
      </div>
      <div style={{ height: '450px' }}>
        <Line data={volatilityChartData} options={volatilityChartOptions} />
      </div>
    </div>
  );
};

const ChainView = ({ selectedExpiry, setSelectedExpiry, selectedStrike, t }) => {
    const currentPrice = 6264.50;
    const chain = optionChainData[selectedExpiry] || [];

    return (
        <div className="bg-[#101021] p-2 sm:p-4 rounded-2xl my-5 text-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-lg sm:text-xl font-bold">{t('options_chain_title')}</h2>
                <div className="flex items-center gap-2">
                    <label className="text-gray-300">{t('options_controls_expiry')}:</label>
                    <div className="flex items-center gap-2 bg-[#0A0A1A] border border-gray-700 rounded-md px-3 py-1">
                        <select
                            value={selectedExpiry}
                            onChange={(e) => setSelectedExpiry(e.target.value)}
                            className="bg-transparent text-white focus:outline-none"
                        >
                            {expiryDates.map(date => <option key={date} value={date}>{date}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center text-blue-400" colSpan={4}>{t('options_chain_calls')}</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center bg-[#0A0A1A]">{t('options_controls_strike')}</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center text-orange-400" colSpan={4}>{t('options_chain_puts')}</th>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Delta</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Theta</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Bid</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Ask</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal bg-[#0A0A1A]"></th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Bid</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Ask</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Theta</th>
                            <th className="p-1 text-xs sm:text-sm sm:p-2 text-center font-normal">Delta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chain.map(({ strike, call, put }, index) => {
                            const isCallInTheMoney = strike < currentPrice;
                            const isPutInTheMoney = strike > currentPrice;
                            const isSelectedStrike = strike === selectedStrike;
                            return (
                                <tr key={index} className={`border-b border-gray-800 hover:bg-[#1A1A2F] transition-colors ${isSelectedStrike ? 'bg-blue-900/60' : ''}`}>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isCallInTheMoney ? 'bg-blue-900/30' : ''}`}>{call.delta}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isCallInTheMoney ? 'bg-blue-900/30' : ''}`}>{call.theta}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isCallInTheMoney ? 'bg-blue-900/30' : ''}`}>{call.bid}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isCallInTheMoney ? 'bg-blue-900/30' : ''}`}>{call.ask}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center font-bold bg-[#0A0A1A] ${isSelectedStrike ? 'ring-2 ring-blue-400' : ''}`}>{strike.toFixed(2)}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isPutInTheMoney ? 'bg-orange-900/30' : ''}`}>{put.bid}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isPutInTheMoney ? 'bg-orange-900/30' : ''}`}>{put.ask}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isPutInTheMoney ? 'bg-orange-900/30' : ''}`}>{put.theta}</td>
                                    <td className={`p-1 text-xs sm:text-sm sm:p-2 text-center ${isPutInTheMoney ? 'bg-orange-900/30' : ''}`}>{put.delta}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BlankStrategyView = ({ onStrategyUpdate, t }) => {
    const [legs, setLegs] = useState([]);
    const [newLeg, setNewLeg] = useState({ type: 'call', side: 'buy', strike: 6200, premium: 10, quantity: 1 });

    const handleAddLeg = () => {
        setLegs([...legs, { ...newLeg, id: Date.now() }]);
    };
    
    const handleRemoveLeg = (id) => {
        setLegs(legs.filter(leg => leg.id !== id));
    };

    const handleNewLegChange = (field, value) => {
        setNewLeg(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (legs.length === 0) {
            onStrategyUpdate({ pnlData: [], summary: [] });
            return;
        }

        const pnlData = labels.map(price => {
            return legs.reduce((totalPnl, leg) => {
                let pnl = 0;
                const { type, side, strike, premium, quantity } = leg;
                if (type === 'call') {
                    pnl = Math.max(0, price - strike) - premium;
                } else { // put
                    pnl = Math.max(0, strike - price) - premium;
                }
                if (side === 'sell') {
                    pnl *= -1;
                }
                return totalPnl + pnl * quantity;
            }, 0);
        });

        const maxProfit = Math.max(...pnlData);
        const maxLoss = Math.min(...pnlData);
        
        let breakEvens = [];
        for (let i = 1; i < pnlData.length; i++) {
            if ((pnlData[i-1] < 0 && pnlData[i] >= 0) || (pnlData[i-1] > 0 && pnlData[i] <= 0)) {
                const p1 = {x: labels[i-1], y: pnlData[i-1]};
                const p2 = {x: labels[i], y: pnlData[i]};
                const be = p1.x - p1.y * (p2.x - p1.x) / (p2.y - p1.y);
                breakEvens.push(be.toFixed(2));
            }
        }

        const summary = [
            { label: t('options_custom_summary_legs'), value: legs.length.toString() },
            { label: t('options_summary_breakeven'), value: breakEvens.join(', ') || 'N/A' },
            { label: t('options_summary_max_loss'), value: isFinite(maxLoss) ? maxLoss.toFixed(2) : t('options_summary_unlimited'), color: 'text-red-500' },
            { label: t('options_summary_max_profit'), value: isFinite(maxProfit) ? maxProfit.toFixed(2) : t('options_summary_unlimited'), color: 'text-green-500' },
        ];
        onStrategyUpdate({ pnlData, summary });

    }, [legs, onStrategyUpdate, t]);

    return (
        <div className="bg-[#101021] p-4 md:p-6 rounded-2xl my-5 space-y-6">
            <h3 className="text-xl font-bold">{t('options_custom_title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3 items-end">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{t('options_custom_quantity')}</label>
                    <input type="number" value={String(newLeg.quantity)} onChange={e => handleNewLegChange('quantity', Number(e.target.value) || 1)} className="bg-[#1C1C33] p-2 rounded-md"/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{t('options_custom_type')}</label>
                    <select value={newLeg.type} onChange={e => handleNewLegChange('type', e.target.value)} className="bg-[#1C1C33] p-2 rounded-md">
                        <option value="call">{t('options_custom_type_call')}</option>
                        <option value="put">{t('options_custom_type_put')}</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{t('options_custom_side')}</label>
                    <select value={newLeg.side} onChange={e => handleNewLegChange('side', e.target.value)} className="bg-[#1C1C33] p-2 rounded-md">
                        <option value="buy">{t('options_custom_side_buy')}</option>
                        <option value="sell">{t('options_custom_side_sell')}</option>
                    </select>
                </div>
                 <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{t('options_controls_strike')}</label>
                    <input type="number" value={String(newLeg.strike)} onChange={e => handleNewLegChange('strike', Number(e.target.value) || 0)} className="bg-[#1C1C33] p-2 rounded-md"/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{t('options_custom_price')}</label>
                    <input type="number" value={String(newLeg.premium)} onChange={e => handleNewLegChange('premium', parseFloat(e.target.value) || 0)} className="bg-[#1C1C33] p-2 rounded-md"/>
                </div>
                <button onClick={handleAddLeg} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md flex items-center justify-center gap-2 h-10">
                    <Plus size={18}/>
                    <span>{t('options_custom_add_leg')}</span>
                </button>
            </div>
            <div className="space-y-2">
                {legs.map(leg => (
                    <div key={leg.id} className="bg-[#1C1C33] p-3 rounded-md flex justify-between items-center text-sm">
                        <span>{`${leg.quantity} x ${leg.side === 'buy' ? t('options_custom_side_buy') : t('options_custom_side_sell')} ${leg.type === 'call' ? t('options_custom_type_call') : t('options_custom_type_put')} @ ${leg.strike} (${t('options_custom_price')}: ${leg.premium})`}</span>
                        <button onClick={() => handleRemoveLeg(leg.id)} className="text-red-500 hover:text-red-400"><X size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SearchModal = ({ isOpen, onClose, onSelectSymbol, currentSymbol, t }) => {
    if (!isOpen) return null;
    const symbols = ['!ES1', 'AAPL', 'GOOGL', 'MSFT', 'SPY', 'TSLA'];
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSymbols = symbols.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (symbol) => {
        onSelectSymbol(symbol);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#101021] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 sm:mx-0" onClick={e => e.stopPropagation()}>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('options_search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1C1C33] w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredSymbols.map(symbol => (
                        <button
                            key={symbol}
                            onClick={() => handleSelect(symbol)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                symbol === currentSymbol ? 'bg-blue-600 text-white' : 'hover:bg-[#2A2A44]'
                            }`}
                        >
                            {symbol}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const OptionsStrategy = () => {
    const { t } = useLanguage();
    const headerTabsValue = t('options_page_header_tabs');
    const headerTabs = Array.isArray(headerTabsValue) ? headerTabsValue : [];

    const sentimentFiltersValue = t('options_page_sentiment_filters');
    const sentimentFilters = Array.isArray(sentimentFiltersValue) ? sentimentFiltersValue : [];

    const [activeTab, setActiveTab] = useState(headerTabs[0] ?? '');
    const [marketSentiment, setMarketSentiment] = useState(sentimentFilters[0] ?? '');
    const [activeStrategyName, setActiveStrategyName] = useState('Bull Call Spread');
    const [size, setSize] = useState(1);
    const [selectedExpiry, setSelectedExpiry] = useState(expiryDates[0]);
    const [selectedGreek, setSelectedGreek] = useState(t('options_greek_vega'));
    const chartRef = useRef(null);
    const [interactivePnl, setInteractivePnl] = useState(null);
    const [customStrategyResult, setCustomStrategyResult] = useState({ pnlData: [], summary: [] });
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState('!ES1');
    const [selectedStrike, setSelectedStrike] = useState(null);
  
    const availableStrikes = useMemo(() => {
        return optionChainData[selectedExpiry]?.map(d => d.strike) || [];
    }, [selectedExpiry]);

    useEffect(() => {
        if (availableStrikes.length > 0 && selectedStrike === null) {
            const currentPrice = 6264.50;
            const closestStrike = availableStrikes.reduce((prev, curr) => 
                Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
            );
            setSelectedStrike(closestStrike);
        }
    }, [availableStrikes, selectedStrike]);

    useEffect(() => {
        const strikes = optionChainData[selectedExpiry]?.map(d => d.strike) || [];
        if (strikes.length > 0) {
            const currentPrice = 6264.50;
            const closestStrike = strikes.reduce((prev, curr) => 
                Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
            );
            if (selectedStrike !== closestStrike) {
              setSelectedStrike(closestStrike);
            }
        }
    }, [selectedExpiry, selectedStrike]);


    const filteredStrategies = useMemo(() => {
        const currentSentimentFilters = t('options_page_sentiment_filters');
        if (!Array.isArray(currentSentimentFilters) || marketSentiment === currentSentimentFilters[0]) { // all
            return strategies;
        }
        const typeToFilter = marketSentiment === currentSentimentFilters[1] ? 'options_type_bullish' : marketSentiment === currentSentimentFilters[3] ? 'options_type_bearish' : '';
        return strategies.filter(s => s.typeKey === typeToFilter);
    }, [marketSentiment, t]);

    useEffect(() => {
        const isCurrentStrategyVisible = filteredStrategies.some(s => s.name === activeStrategyName);

        if (!isCurrentStrategyVisible) {
            if (filteredStrategies.length > 0) {
                setActiveStrategyName(filteredStrategies[0].name);
            } else {
                setActiveStrategyName(null);
            }
        }
    }, [filteredStrategies, activeStrategyName]);

    const [chartData, setChartData] = useState({
        labels: labels,
        datasets: [
          { id: 'greek', yAxisID: 'y1', data: [], borderColor: '#FFA500', borderWidth: 2, pointRadius: 0, borderDash: [5, 5], tension: 0.4 },
          { id: 'pnl', yAxisID: 'y', data: [], borderColor: '#00BAC4', borderWidth: 2, pointRadius: 0, tension: 0,
            segment: { borderColor: (ctx) => ctx.p0.parsed.y < 0 ? '#E84A5F' : '#00BAC4' },
            fill: { target: 'origin', above: 'rgba(0, 186, 172, 0.2)', below: 'rgba(232, 74, 95, 0.2)' },
          },
          { id: 't0', yAxisID: 'y', data: [], borderColor: '#4A90E2', borderDash: [5, 5], borderWidth: 2, pointRadius: 0, tension: 0.4 },
        ],
    });
    const [chartOptions, setChartOptions] = useState(initialChartOptions);
    const [summaryData, setSummaryData] = useState([]);
  
    useEffect(() => {
        const isCustom = activeTab === t('options_page_header_tabs')[3]; // Blank Strategy
        const strategy = !isCustom && activeStrategyName ? strategiesData[activeStrategyName] : null;
        const dataExists = isCustom ? customStrategyResult.pnlData.length > 0 : !!strategy;
        
        if (!dataExists) {
            setChartData(prev => ({ ...prev, datasets: prev.datasets.map(ds => ({ ...ds, data: [] })) }));
            setSummaryData([]);
            return;
        }
        
        const numSize = size === null ? 1 : size || 1;
        let basePnl, baseT0, baseGreek, greekLabel;

        if (isCustom) {
            basePnl = customStrategyResult.pnlData;
            baseT0 = [];
            setSummaryData(customStrategyResult.summary);
        } else {
            basePnl = strategy.basePnl.map(p => p * numSize);
            baseT0 = strategy.baseT0 ? strategy.baseT0.map(t => t * numSize) : [];
            const newSummary = strategy.summary.map(item => {
                if (item.labelKey === 'options_summary_size') return { ...item, value: numSize.toString() };
                if (item.isScalable && item.value) {
                    const baseValue = parseFloat(item.value.replace(/,/g, ''));
                    return { ...item, value: (baseValue * numSize).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
                }
                return item;
            });
            setSummaryData(newSummary);
        }
        
        const vegaKey = t('options_greek_vega');
        const deltaKey = t('options_greek_delta');

        if (selectedGreek === deltaKey && strategy?.delta) {
            baseGreek = strategy.delta;
            greekLabel = deltaKey;
        } else {
            baseGreek = [60, 110, 180, 260, 350, 420, 460, 480, 480, 450, 400, 330, 250, 180, 120, 70, 40, 20, 10, 5, 4, 3, 2, 1, 1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map(v => v / 100);
            greekLabel = vegaKey;
        }

        setChartData(prev => ({
            ...prev,
            labels: labels,
            datasets: prev.datasets.map(ds => {
                if (ds.id === 'pnl') return { ...ds, data: basePnl };
                if (ds.id === 't0') return { ...ds, data: baseT0 };
                if (ds.id === 'greek') return { ...ds, data: baseGreek, label: greekLabel, borderColor: greekLabel === deltaKey ? '#DA70D6' : '#FFA500' };
                return ds;
            }),
        }));

        const allYValues = [...basePnl, ...baseT0];
        const yMin = Math.min(0, ...allYValues);
        const yMax = Math.max(0, ...allYValues);
        const padding = (yMax - yMin) * 0.15;
        const scaleMin = isFinite(yMin) ? Math.floor((yMin - padding) / 50) * 50 : -100;
        const scaleMax = isFinite(yMax) ? Math.ceil((yMax + padding) / 50) * 50 : 100;
        
        setChartOptions(prev => ({
            ...prev,
            scales: { ...prev.scales,
                y: { ...prev.scales.y, min: scaleMin, max: scaleMax },
                y1: { ...prev.scales.y1,
                    min: selectedGreek === deltaKey ? -0.1 : -0.5,
                    max: selectedGreek === deltaKey ? 1.1 : 6.0,
                    ticks: { ...prev.scales.y1.ticks,
                        callback: selectedGreek === deltaKey ? v => (v as number).toFixed(1) : v => `${((v as number) * 100).toFixed(0)}%`,
                    },
                },
            },
        }));

    }, [activeStrategyName, size, activeTab, customStrategyResult, selectedGreek, t]);

    const calculatePnlAtPrice = (price) => {
        const t0Dataset = chartData.datasets.find(d => d.id === 't0');
        if (!t0Dataset || t0Dataset.data.length === 0) return null;
        const data = t0Dataset.data;
        
        for (let i = 0; i < labels.length - 1; i++) {
            if (price >= labels[i] && price <= labels[i+1]) {
                const y1 = data[i];
                const y2 = data[i+1];
                if (typeof y1 === 'number' && typeof y2 === 'number') {
                    const x1 = labels[i];
                    const x2 = labels[i+1];
                    return y1 + (y2 - y1) * (price - x1) / (x2 - x1);
                }
            }
        }
        return null;
    };

    const handleChartDrag = (price, isFinished) => {
        const chart = chartRef.current;
        if (!chart) return;

        if (isFinished) {
            setTimeout(() => setInteractivePnl(null), 2000);
            return;
        }

        if (price !== null) {
            chart.options.plugins.annotation.annotations.line1.xMin = price;
            chart.options.plugins.annotation.annotations.line1.xMax = price;
            chart.update('none');
            const pnl = calculatePnlAtPrice(price);
            if (pnl !== null) {
                setInteractivePnl(pnl);
            }
        }
    };

    const displaySummaryData = useMemo(() => {
        if (interactivePnl !== null) {
            const livePnlItem = { label: t('options_summary_live_pnl'), value: interactivePnl.toFixed(2), color: interactivePnl >= 0 ? 'text-green-500' : 'text-red-500' };
            const existingData = summaryData.filter(item => (item.labelKey || item.label) !== t('options_summary_live_pnl'));
            return [...existingData, livePnlItem];
        }
        return summaryData;
    }, [summaryData, interactivePnl, t]);

  const renderContent = () => {
    const isStrategyView = activeTab === (headerTabs[0] ?? '') || activeTab === (headerTabs[3] ?? '');

    const mainContent = (() => {
        if (!headerTabs || headerTabs.length === 0) return null;
        switch (activeTab) {
            case headerTabs[0]:
                return (
                    <>
                        <StrategyCarousel strategies={filteredStrategies} activeStrategyName={activeStrategyName} onStrategyClick={setActiveStrategyName} t={t} />
                        <Filters activeFilter={marketSentiment} onFilterChange={setMarketSentiment} t={t}/>
                    </>
                );
            case headerTabs[3]:
                return <BlankStrategyView onStrategyUpdate={setCustomStrategyResult} t={t} />;
            case headerTabs[1]:
                return <VolatilityView t={t}/>;
            case headerTabs[2]:
                return <ChainView selectedExpiry={selectedExpiry} setSelectedExpiry={setSelectedExpiry} selectedStrike={selectedStrike} t={t} />;
            default:
                return null;
        }
    })();
    
    return (
        <>
            {mainContent}
            {isStrategyView && (
                <>
                    <div className="bg-[#101021] p-4 rounded-2xl min-h-[480px]">
                        {(activeStrategyName || customStrategyResult.pnlData.length > 0) ? (
                            <>
                                <ChartControls 
                                    size={size} setSize={setSize} 
                                    selectedExpiry={selectedExpiry} setSelectedExpiry={setSelectedExpiry} 
                                    selectedGreek={selectedGreek} setSelectedGreek={setSelectedGreek}
                                    selectedStrike={selectedStrike} setSelectedStrike={setSelectedStrike}
                                    availableStrikes={availableStrikes}
                                    t={t}
                                />
                                <ChartComponent data={chartData} options={chartOptions} chartRef={chartRef} onDrag={handleChartDrag} t={t} />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[416px]">
                                <div className="text-center text-gray-400">
                                    <FolderSearch size={48} className="mx-auto text-gray-500" />
                                    <p className="mt-4 text-lg font-semibold">{(headerTabs && activeTab === headerTabs[3]) ? t('options_placeholder_custom_title') : t('options_placeholder_title')}</p>
                                    <p className="text-sm">{(headerTabs && activeTab === headerTabs[3]) ? t('options_placeholder_custom_subtitle') : t('options_placeholder_subtitle')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <SummaryBar data={displaySummaryData} t={t} />
                </>
            )}
        </>
    );
};

  return (
    <div className="bg-black min-h-screen p-4 sm:p-6">
      <div className="bg-[#0A0A1A] border-2 border-[#1A3A8A] rounded-3xl shadow-[0_0_25px_rgba(42,95,255,0.4)] p-4 sm:p-6 space-y-5">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">VESTOR SMART</h1>
                <h2 className="text-2xl sm:text-3xl font-bold">{t('options_page_title')}</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-1 overflow-x-auto pb-2 -mb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {Array.isArray(headerTabs) && headerTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-shrink-0 text-sm py-2 px-4 rounded-full transition-colors duration-200 ${
                                    activeTab === tab
                                    ? 'bg-white text-black font-bold'
                                    : 'bg-[#1C1C33] text-white hover:bg-[#2A2A44]'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setIsSearchModalOpen(true)} className="flex-shrink-0 flex items-center justify-center border border-gray-600 rounded-full px-3 py-1.5 hover:bg-[#2A2A44] transition-colors">
                    <span className="text-gray-400 text-sm">{selectedSymbol}</span>
                    <div className="w-px h-4 bg-gray-600 mx-2"></div>
                    <Search className="text-white" size={18} />
                </button>
            </div>
        </header>
        {renderContent()}
        <SearchModal 
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSelectSymbol={setSelectedSymbol}
            currentSymbol={selectedSymbol}
            t={t}
        />
      </div>
    </div>
  );
}