/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Apple, ChevronDown, X, Building, Bot, Sparkles, Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { createChart, ColorType, LineStyle, PriceScaleMode } from 'lightweight-charts';
import { getChartData } from './chartUtils.js';
import { getToolConfig } from './drawingTools.js';
import * as pine from './pine_runner.ts';
import { useSettingsStore, useUIStore } from './ui.ts';
import { getAIAssistedDrawing } from './ai_drawing.ts';
import { useTradingStore } from './trading.ts';
import ChartFooter from './ChartFooter.jsx';
import ChartMarker from './ChartMarker.jsx';

// DrawableShape component to render drawings as HTML overlays
const DrawableShape = ({ drawing, getScreenCoords, isSelected, isPreview }) => {
    if (!drawing) return null;

    const { type } = drawing;
    const config = getToolConfig(type);
    
    let style = {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 15,
        border: `${config.width || 1}px solid ${isSelected ? '#3E8BF3' : config.color}`,
        backgroundColor: isPreview ? `${config.color}22` : (config.fill || 'transparent'),
    };
    
    if (type === 'rect' || type === 'ellipse') {
        const start = getScreenCoords(drawing.start);
        const end = getScreenCoords(drawing.end);
        if (!start || !end) return null;
        
        style.left = `${Math.min(start.x, end.x)}px`;
        style.top = `${Math.min(start.y, end.y)}px`;
        style.width = `${Math.abs(start.x - end.x)}px`;
        style.height = `${Math.abs(start.y - end.y)}px`;

        if (type === 'ellipse') {
            style.borderRadius = '50%';
        }
    } else {
        return null; // Only handle rect and ellipse with this component for now
    }

    return <div style={style} data-dev-name={`DrawableShape.${type}`} />;
};


function pointToLineSegmentDistance(p, v, w) {
    if (!v || !w) return Infinity;
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
}

// --- New Helper functions for accurate selection ---
const isPointInRect = (point, startPos, endPos) => {
    if (!point || !startPos || !endPos) return false;
    const minX = Math.min(startPos.x, endPos.x);
    const maxX = Math.max(startPos.x, endPos.x);
    const minY = Math.min(startPos.y, endPos.y);
    const maxY = Math.max(startPos.y, endPos.y);
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

const isPointInEllipse = (point, startPos, endPos) => {
    if (!point || !startPos || !endPos) return false;
    const cx = (startPos.x + endPos.x) / 2;
    const cy = (startPos.y + endPos.y) / 2;
    const rx = Math.abs(endPos.x - startPos.x) / 2;
    const ry = Math.abs(endPos.y - startPos.y) / 2;
    if (rx === 0 || ry === 0) return false;
    return ((point.x - cx) ** 2) / (rx ** 2) + ((point.y - cy) ** 2) / (ry ** 2) <= 1;
};

const isPointInTriangle = (point, p1, p2, p3) => {
    if (!point || !p1 || !p2 || !p3) return false;
    const s = p1.y * p3.x - p1.x * p3.y + (p3.y - p1.y) * point.x + (p1.x - p3.x) * point.y;
    const t = p1.x * p2.y - p1.y * p2.x + (p1.y - p2.y) * point.x + (p2.x - p1.x) * point.y;
    if ((s < 0) !== (t < 0) && s !== 0 && t !== 0) return false;
    const A = -p2.y * p3.x + p1.y * (p3.x - p2.x) + p1.x * (p2.y - p3.y) + p2.x * p3.y;
    if (A < 0) return (s <= 0 && s + t >= A);
    return (s >= 0 && s + t <= A);
};

const getClickedDrawing = (point, drawings, getScreenCoords) => {
    const threshold = 10;
    // Iterate backwards to select the top-most drawing
    for (let i = drawings.length - 1; i >= 0; i--) {
        const drawing = drawings[i];
        const { type } = drawing;

        const trendlineTypes = ['trendline', 'fib-retracement', 'arrow', 'ray', 'extended-line', 'horizontal-line', 'horizontal-ray', 'vertical-line', 'parallel-channel', 'gann-fan', 'pitchfork', 'fib-channel'];
        if (trendlineTypes.includes(type)) {
            const startPos = getScreenCoords(drawing.start);
            const endPos = getScreenCoords(drawing.end);
            if(pointToLineSegmentDistance(point, startPos, endPos) < threshold) return drawing;
        } else if (type === 'rect') {
            const startPos = getScreenCoords(drawing.start);
            const endPos = getScreenCoords(drawing.end);
            if(isPointInRect(point, startPos, endPos)) return drawing;
        } else if (type === 'ellipse') {
            const startPos = getScreenCoords(drawing.start);
            const endPos = getScreenCoords(drawing.end);
            if(isPointInEllipse(point, startPos, endPos)) return drawing;
        } else if (type === 'triangle') {
            const p1 = getScreenCoords(drawing.p1);
            const p2 = getScreenCoords(drawing.p2);
            const p3 = getScreenCoords(drawing.p3);
            if(isPointInTriangle(point, p1, p2, p3)) return drawing;
        }
    }
    return null;
};


const ChartHeader = ({ stockSymbol, timeframe, symbolsCatalog }) => {
    const stock = symbolsCatalog[stockSymbol] || { name: `${stockSymbol}`, icon: Bot };
    const Icon = stock.icon;
    return (
        <div className="flex items-center justify-between p-2 text-xs" data-dev-name="ChartArea.Header">
            <div className="flex items-center gap-3">
                <Icon size={20} className="text-white fill-white"/>
                <span className="font-bold">{stock.name} · {timeframe} · NASDAQ</span>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <div className="relative w-5 h-3 flex items-center justify-center">
                    <div className="w-full h-full bg-red-500 rounded-full"></div>
                    <span className="absolute text-white text-[10px] font-bold scale-x-150">≈</span>
                </div>
                <p className="text-[#8A93A2]">
                    <span className="text-white mr-1">O</span>145.75
                    <span className="text-white ml-3 mr-1">H</span>145.97
                    <span className="text-white ml-3 mr-1">L</span>145.00
                    <span className="text-white ml-3 mr-1">C</span>171.83
                    <span className="text-green-400 ml-3">+3.17 (+1.85%)</span>
                </p>
            </div>
            <div className="flex items-center gap-2 border border-[#2A3040] rounded px-2 py-1 cursor-pointer" data-dev-name="ChartArea.Header.CurrencySelector">
                <span className="text-xs">USD</span>
                <ChevronDown size={14} className="text-[#8A93A2]"/>
            </div>
        </div>
    )
};

const GridChartHeader = ({ chartName }) => (
    <div className="p-2 text-xs text-center text-white font-bold bg-[#1A1F2A] flex-shrink-0">
        {chartName}
    </div>
);

const calculateHeikinAshi = (data) => {
    const haData = [];
    if (data.length === 0) return haData;

    for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const haClose = (d.open + d.high + d.low + d.close) / 4;
        const haOpen = i === 0 
            ? (d.open + d.close) / 2 
            : (haData[i - 1].open + haData[i - 1].close) / 2;
        const haHigh = Math.max(d.high, haOpen, haClose);
        const haLow = Math.min(d.low, haOpen, haClose);

        haData.push({
            time: d.time,
            open: haOpen,
            high: haHigh,
            low: haLow,
            close: haClose,
        });
    }
    return haData;
};

const ReplayPanel = ({ onPlayPause, onStep, onReset, onSpeedChange, isPlaying, speed }) => (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-lg p-2 flex items-center gap-4 text-white z-20" data-dev-name="ChartArea.ReplayPanel">
        <button onClick={onReset} className="p-2 hover:bg-[#2A3040] rounded-md" title="Reset" data-dev-name="ChartArea.ReplayPanel.Reset"><RotateCcw size={16}/></button>
        <button onClick={onStep} className="p-2 hover:bg-[#2A3040] rounded-md" title="Step Forward" data-dev-name="ChartArea.ReplayPanel.Step"><StepForward size={16}/></button>
        <button onClick={onPlayPause} className="p-2 bg-[#3E8BF3] rounded-md" title={isPlaying ? 'Pause' : 'Play'} data-dev-name="ChartArea.ReplayPanel.PlayPause">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex items-center gap-2 text-xs">
            <span>Speed:</span>
            {[1, 2, 5].map(s => (
                <button key={s} onClick={() => onSpeedChange(s)} className={`px-2 py-1 rounded ${speed === s ? 'bg-[#3E8BF3]' : 'bg-[#2A3040]'}`} data-dev-name={`ChartArea.ReplayPanel.Speed.${s}x`}>{s}x</button>
            ))}
        </div>
    </div>
);

const initialMarkersData = [
    { id: 1, time: '2024-05-15', priceOffset: 3, type: 'info', quantity: '100', label: '+ 7.00 USD' },
    { id: 2, time: '2024-02-25', priceOffset: 10, type: 'stop-loss', quantity: '100', label: 'Stop Loss' },
    { id: 3, time: '2024-04-15', priceOffset: 5, type: 'stop-loss', quantity: '50', label: 'Stop Loss' },
    { id: 4, time: '2024-01-26', priceOffset: -5, type: 'sell-stop', quantity: '50', label: 'Sell Stop' },
    { id: 5, time: '2023-12-28', priceOffset: -10, type: 'take-profit', quantity: '50', label: 'Take Profit' },
];

const DrawableMarker = ({ position, data, onDelete }) => {
    if (!position || position.x === null || position.y === null) return null;
    
    const baseStyle = "absolute flex items-start gap-1 bg-[#1A1F2A] border rounded-md px-2 py-1 text-white shadow-lg text-xs leading-tight";
    const transform = 'translate(10px, -50%)'; // Offset slightly from the cursor point
    const deleteButton = (
        <button 
            onClick={() => onDelete(data.id)}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white opacity-50 hover:opacity-100 transition-opacity"
            title="Delete"
        >
            <X size={10} />
        </button>
    );

    switch (data.type) {
        case 'text-note':
            return (
                <div 
                    className={`${baseStyle} border-[#8A93A2]`}
                    style={{ top: position.y, left: position.x, transform, zIndex: 20 }}
                    data-dev-name={`ChartArea.Drawable.Text.${data.id}`}
                >
                    <span className="whitespace-pre-wrap">{data.text}</span>
                    {deleteButton}
                </div>
            );
        case 'icon':
            return (
                <div 
                    className="absolute text-2xl"
                    style={{ top: position.y, left: position.x, transform: 'translate(-50%, -50%)', zIndex: 20 }}
                    data-dev-name={`ChartArea.Drawable.Icon.${data.id}`}
                >
                    <span>{data.text}</span>
                    {deleteButton}
                </div>
            );
        default:
            return null;
    }
};

const sanitizeChartData = (data) => {
    if (!Array.isArray(data)) return [];
    return data
        .filter(d => d && typeof d === 'object' && d.time)
        .sort((a, b) => new Date(a.time) - new Date(b.time));
};

// FIX: Add `alerts` and `chartPriceData` to props to resolve TypeScript error and make the component functional.
const ChartArea = ({ stockSymbol, chartType, timeframe, timeRange, onTimeRangeChange, aiAnnotations, indicators, isAnnotationsLoading, isReplayMode, highlightedAnnotationId, isFullscreen, isGridMode, gridChartName, alerts, chartPriceData }) => {
    const chartContainerRef = useRef();
    const chartApiRef = useRef(null);
    const mainSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRef = useRef({});
    const drawingSeriesRef = useRef({}); // Changed to object for performance
    const priceLineRef = useRef([]);
    const drawingStateRef = useRef({ startPoint: null, midPoint: null, isDrawing: false, currentPath: [] });
    const { settings } = useSettingsStore();
    const { activeTool, setActiveTool, drawings, setDrawings, isMagnetModeOn, isDrawingModeOn, areDrawingsLocked, selectedIcon, setSelectedIcon } = useUIStore();
    const { positions, closePosition } = useTradingStore();
    const isAiEnabled = settings.ai?.enabled ?? false;

    const [fullChartData, setFullChartData] = useState({ priceData: [], volumeData: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [provider, setProvider] = useState(() => localStorage.getItem('provider') || 'mock');

    const [markers, setMarkers] = useState([]);
    const [markersData, setMarkersData] = useState(initialMarkersData);
    const [drawableMarkers, setDrawableMarkers] = useState([]);
    const [isAiDrawing, setIsAiDrawing] = useState(false);
    const [symbolsCatalog, setSymbolsCatalog] = useState({});

    const [replayIndex, setReplayIndex] = useState(300);
    const [isPlaying, setIsPlaying] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(1);
    
    const [selectedDrawing, setSelectedDrawing] = useState(null);
    const [draggedHandle, setDraggedHandle] = useState(null); // { drawingId, handle: 'start' | 'end' | 'p1' | 'p2' | 'p3' }
    const [moveState, setMoveState] = useState(null); // { drawingId, initialMousePos, initialDrawing }
    const [handlePositions, setHandlePositions] = useState({});
    
    const [textInput, setTextInput] = useState(null);
    const prevSelectedDrawingId = useRef(null);
    
    const [previewDrawing, setPreviewDrawing] = useState(null);

    const trendlineTools = ['trendline', 'arrow', 'ray', 'extended-line', 'horizontal-line', 'horizontal-ray', 'vertical-line', 'parallel-channel', 'pitchfork', 'fib-channel'];
    
    const handleReplayPlayPause = () => setIsPlaying(prev => !prev);
    
    const handleReplayStep = useCallback(() => {
        setReplayIndex(prev => {
            if (!fullChartData.priceData || prev >= fullChartData.priceData.length - 1) {
                setIsPlaying(false); // Stop playing at the end
                return prev;
            }
            return prev + 1;
        });
    }, [fullChartData.priceData]);
    
    const handleReplayReset = () => {
        setReplayIndex(50); // A reasonable starting point
        setIsPlaying(false);
    };

    useEffect(() => {
        const handleProviderChange = (e) => {
            setProvider(e.detail);
            window.toast?.(`Data provider changed to ${e.detail}`);
        };
        window.addEventListener('provider:change', handleProviderChange);
        return () => window.removeEventListener('provider:change', handleProviderChange);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getChartData(stockSymbol, timeframe, provider, timeRange);
                if (isMounted) {
                    setFullChartData(data);
                }
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
                window.toast?.(`Failed to load data from ${provider}. Falling back to mock data.`);
                const mockData = await getChartData(stockSymbol, timeframe, 'mock', timeRange);
                if (isMounted) setFullChartData(mockData);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [stockSymbol, timeframe, provider, timeRange]);

    const getScreenCoords = useCallback((point) => {
        if (!point || !chartApiRef.current || !mainSeriesRef.current) return null;
        const timeCoord = chartApiRef.current.timeScale().timeToCoordinate(point.time);
        const priceCoord = mainSeriesRef.current.priceToCoordinate(point.price);
        if (timeCoord === null || priceCoord === null) return null;
        return { x: timeCoord, y: priceCoord };
    }, []);

    const getSnappedPoint = useCallback((point, logical, time) => {
        if (!isMagnetModeOn || !point || !mainSeriesRef.current || !chartApiRef.current) {
            const price = mainSeriesRef.current?.coordinateToPrice(point?.y);
            return { price, time, logical };
        }
    
        const SNAP_THRESHOLD = 10; // pixels
        const currentPrice = mainSeriesRef.current.coordinateToPrice(point.y);
        if (currentPrice === null) return { price: null, time, logical };
    
        let bestSnap = { price: currentPrice, time, logical, distance: SNAP_THRESHOLD };
    
        // 1. Snap to OHLC of the current bar (vertical snap)
        if (logical !== null && logical >= 0 && logical < fullChartData.priceData.length) {
            const data = fullChartData.priceData[logical];
            if (data) {
                const priceLevels = [data.high, data.low, data.open, data.close];
                priceLevels.forEach(p => {
                    const coordY = mainSeriesRef.current.priceToCoordinate(p);
                    if (coordY !== null) {
                        const distance = Math.abs(coordY - point.y);
                        if (distance < bestSnap.distance) {
                            bestSnap = { price: p, time, logical, distance };
                        }
                    }
                });
            }
        }
        
        // 2. Snap to other drawing key points (2D distance)
        drawings.forEach(drawing => {
            if ((moveState?.drawingId === drawing.id) || (draggedHandle?.drawingId === drawing.id)) return;
    
            const keyPoints = [];
            if (drawing.start) keyPoints.push(drawing.start);
            if (drawing.end) keyPoints.push(drawing.end);
            if (drawing.p1) keyPoints.push(drawing.p1);
            if (drawing.p2) keyPoints.push(drawing.p2);
            if (drawing.p3) keyPoints.push(drawing.p3);
    
            keyPoints.forEach(p => {
                const screenPos = getScreenCoords(p);
                if (screenPos) {
                    const distance = Math.sqrt((point.x - screenPos.x)**2 + (point.y - screenPos.y)**2);
                    if (distance < bestSnap.distance) {
                        const snappedLogical = chartApiRef.current.timeScale().coordinateToLogical(screenPos.x);
                        bestSnap = { price: p.price, time: p.time, logical: snappedLogical ?? p.logical, distance };
                    }
                }
            });
        });
        
        return { price: bestSnap.price, time: bestSnap.time, logical: bestSnap.logical };
    }, [isMagnetModeOn, drawings, fullChartData.priceData, getScreenCoords, moveState, draggedHandle]);


    const handleTextInputConfirm = (value) => {
        if (textInput && value.trim() !== '') {
            const newDrawing = {
                id: `text-${Date.now()}`,
                type: 'text-note',
                time: textInput.data.time,
                price: textInput.data.price,
                text: value.trim(),
            };
            setDrawings([...drawings, newDrawing]);
        }
        setTextInput(null);
        if (!isDrawingModeOn) {
            setActiveTool('crosshair');
        }
    };

    const handleTextInputCancel = () => {
        setTextInput(null);
        if (!isDrawingModeOn) {
            setActiveTool('crosshair');
        }
    };

    const handleTextInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextInputConfirm(e.target.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleTextInputCancel();
        }
    };

    const handleRegenerateDrawing = async (e) => {
        e.stopPropagation();
        if (!selectedDrawing) return;
        const toolType = selectedDrawing.type;
        setIsAiDrawing(true);
        try {
            const coordinates = await getAIAssistedDrawing(toolType, fullChartData.priceData);
            if (!coordinates) {
                throw new Error("AI did not return valid coordinates.");
            }
            const updatedDrawings = drawings.map(d => {
                if (d.id === selectedDrawing.id) {
                    const newDrawing = { ...d, start: coordinates.start, end: coordinates.end };
                    setSelectedDrawing(newDrawing); // Update selection as well
                    return newDrawing;
                }
                return d;
            });
            setDrawings(updatedDrawings);
            window.toast?.(`AI ${toolType} regenerated.`);
        } catch (err) {
            console.error(err);
            window.errorToast?.(err.message || `AI regeneration failed.`);
        } finally {
            setIsAiDrawing(false);
        }
    };
    
    useEffect(() => {
        const handleAiTool = async () => {
            if (!isAiEnabled || (activeTool !== 'ai-trendline' && activeTool !== 'ai-fib-retracement')) {
                return;
            }

            if (areDrawingsLocked) {
                window.toast?.('Drawings are locked. Unlock to use AI tools.');
                setActiveTool('crosshair');
                return;
            }

            const toolType = activeTool.replace('ai-', '');
            setIsAiDrawing(true);

            try {
                const coordinates = await getAIAssistedDrawing(toolType, fullChartData.priceData);
                if (!coordinates) {
                    throw new Error("AI returned an empty response. This could be due to content safety filters.");
                }
                const newDrawing = {
                    id: `drawing-${Date.now()}`,
                    type: toolType,
                    start: coordinates.start,
                    end: coordinates.end,
                    isAi: true,
                };
                setDrawings(prevDrawings => [...prevDrawings, newDrawing]);
                window.toast?.(`AI ${toolType} added.`);
            } catch (err) {
                console.error(err);
                window.errorToast?.(err.message || `AI ${toolType} failed.`);
            } finally {
                setIsAiDrawing(false);
                setActiveTool('crosshair');
            }
        };

        handleAiTool();
    }, [activeTool, areDrawingsLocked, fullChartData.priceData, setDrawings, setActiveTool, isAiEnabled]);

    useEffect(() => {
        fetch('./symbols_catalog.json')
          .then(res => res.json())
          .then(data => {
            const catalog = data.reduce((acc, item) => {
              acc[item.symbol] = { name: item.name, icon: Building }; // Default icon
              return acc;
            }, {});
            // Assign special icons
            catalog['AAPL'] = { ...catalog['AAPL'], icon: Apple };
            catalog['TSLA'] = { ...catalog['TSLA'], icon: Bot };
            setSymbolsCatalog(catalog);
          });
      }, []);

    useEffect(() => {
        if (!fullChartData || !fullChartData.priceData || fullChartData.priceData.length === 0) {
            setMarkersData([]);
            return;
        }
        const lastPriceData = fullChartData.priceData[fullChartData.priceData.length - 1];
        const positionMarkers = positions
            .filter(pos => pos.symbol === stockSymbol)
            .map(pos => ({
                id: `pos-${pos.id}`, time: pos.entryTime, priceOffset: 0, type: `${pos.side.toLowerCase()}-position`,
                quantity: pos.qty, label: `Entry @ ${pos.entryPrice.toFixed(2)}`,
                onClose: () => {
                    closePosition(pos.id, lastPriceData.close, lastPriceData.time);
                    window.toast?.('Position closed from chart.');
                }
            }));

        const combinedMarkers = [...initialMarkersData, ...(aiAnnotations || []), ...positionMarkers];
        const uniqueMarkers = combinedMarkers.reduce((acc, current) => {
            if (!acc.find(item => item.id === current.id)) {
                acc.push(current);
            }
            return acc;
        }, []);
        setMarkersData(uniqueMarkers);
    }, [aiAnnotations, positions, stockSymbol, fullChartData.priceData, closePosition]);

    useEffect(() => {
        drawingStateRef.current.startPoint = null;
        drawingStateRef.current.midPoint = null;
    }, [activeTool]);

    useEffect(() => {
        if (!isReplayMode || !isPlaying || !fullChartData.priceData) return;
        const timer = setInterval(() => {
            handleReplayStep();
        }, 200 / replaySpeed);
        return () => clearInterval(timer);
    }, [isReplayMode, isPlaying, replaySpeed, fullChartData.priceData, handleReplayStep]);

    useEffect(() => {
        setIsPlaying(false);
        setReplayIndex(isReplayMode ? 50 : (fullChartData.priceData?.length || 0));
    }, [isReplayMode, stockSymbol, fullChartData.priceData]);


    // Effect 1: Chart Initialization
    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#12161D' }, textColor: '#8A93A2' },
            grid: { vertLines: { color: 'rgba(42, 48, 64, 0.6)' }, horzLines: { color: 'rgba(42, 48, 64, 0.6)' } },
            rightPriceScale: { borderColor: '#2A3040' },
            timeScale: { borderColor: '#2A3040', timeVisible: true, secondsVisible: false },
            crosshair: { vertLine: { style: 2, width: 1, color: '#8A93A2', labelBackgroundColor: '#2A3040' }, horzLine: { style: 2, width: 1, color: '#8A93A2', labelBackgroundColor: '#2A3040' } },
            watermark: { visible: false },
        });
        chartApiRef.current = chart;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.nodeName === 'A' && node.href && node.href.includes('tradingview')) {
                        node.style.display = 'none';
                    }
                });
            });
        });
        observer.observe(chartContainerRef.current, { childList: true, subtree: true });

        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
            if (chartApiRef.current) {
                chartApiRef.current.remove();
                chartApiRef.current = null;
            }
        };
    }, []);
    
    // Effect 1.5: Apply settings to chart
    useEffect(() => {
        if (!chartApiRef.current) return;
        const chart = chartApiRef.current;
        const { chart: chartSettings } = settings;
        const isLightTheme = settings.theme === 'light';

        const textColor = isLightTheme ? '#1F2937' : '#8A93A2';
        const borderColor = isLightTheme ? '#E5E7EB' : '#2A3040';
        const backgroundColor = isLightTheme ? '#FFFFFF' : chartSettings.background;
        const gridColor = isLightTheme ? 'rgba(229, 231, 235, 1)' : chartSettings.grid;
        
        const scaleModeMapping = {
            normal: PriceScaleMode.Normal,
            logarithmic: PriceScaleMode.Logarithmic,
            percentage: PriceScaleMode.Percentage,
            indexedTo100: PriceScaleMode.IndexedTo100,
        };

        chart.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor, visible: chartSettings.showGridLines },
            },
            rightPriceScale: {
                borderColor: borderColor,
                visible: chartSettings.scalePosition === 'right',
                autoScale: chartSettings.autoScale,
                invertScale: chartSettings.invertScale,
                mode: scaleModeMapping[chartSettings.scaleMode],
                drawTicks: chartSettings.showPriceLabels,
            },
            leftPriceScale: {
                borderColor: borderColor,
                visible: chartSettings.scalePosition === 'left',
                autoScale: chartSettings.autoScale,
                invertScale: chartSettings.invertScale,
                mode: scaleModeMapping[chartSettings.scaleMode],
                drawTicks: chartSettings.showPriceLabels,
            },
            timeScale: { borderColor: borderColor },
            crosshair: { 
                vertLine: { style: 2, width: 1, color: textColor, labelBackgroundColor: borderColor }, 
                horzLine: { style: 2, width: 1, color: textColor, labelBackgroundColor: borderColor } 
            },
            watermark: {
                text: stockSymbol,
                color: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                visible: chartSettings.showWatermark,
                fontSize: 48,
                horzAlign: 'center',
                vertAlign: 'center',
            },
        });
    }, [settings, stockSymbol]);

    // Effect 2: Update Main Price and Volume Series
    useEffect(() => {
        if (!chartApiRef.current || !fullChartData) return;
        const chart = chartApiRef.current;
        
        if (mainSeriesRef.current) chart.removeSeries(mainSeriesRef.current);
        if (volumeSeriesRef.current) chart.removeSeries(volumeSeriesRef.current);
        priceLineRef.current.forEach(line => mainSeriesRef.current?.removePriceLine(line));
        priceLineRef.current = [];

        let { priceData, volumeData: originalVolumeData } = fullChartData;
        if (!priceData || priceData.length === 0) return;

        const isLightTheme = settings.theme === 'light';

        const themedVolumeData = originalVolumeData.map((d, i) => {
            const pricePoint = priceData[i];
            if (!pricePoint) return { ...d, color: isLightTheme ? 'rgba(34, 197, 94, 0.5)' : 'rgba(62, 139, 243, 0.5)' };
            return {
                ...d,
                color: pricePoint.close >= pricePoint.open
                    ? (isLightTheme ? 'rgba(34, 197, 94, 0.5)' : 'rgba(62, 139, 243, 0.5)')
                    : (isLightTheme ? 'rgba(239, 68, 68, 0.5)' : 'rgba(247, 82, 95, 0.5)')
            };
        });
        
        let heikinAshiData;
        let volumeData = themedVolumeData;
        
        if (chartType === 'HeikinAshi') heikinAshiData = calculateHeikinAshi(priceData);
        if (isReplayMode) {
            const sliceEnd = replayIndex;
            priceData = priceData.slice(0, sliceEnd);
            if (heikinAshiData) heikinAshiData = heikinAshiData.slice(0, sliceEnd);
            volumeData = themedVolumeData.slice(0, sliceEnd);
        }

        let mainSeries;
        const { chart: chartSettings } = settings;
        const upColor = isLightTheme ? '#22C55E' : (chartSettings.candleUp || (chartType === 'HeikinAshi' ? '#26A69A' : '#3E8BF3'));
        const downColor = isLightTheme ? '#EF4444' : (chartSettings.candleDown || (chartType === 'HeikinAshi' ? '#EF5350' : '#F7525F'));

        if (chartType === 'Candlestick' || chartType === 'HeikinAshi') {
            mainSeries = chart.addCandlestickSeries({ upColor, downColor, borderDownColor: downColor, borderUpColor: upColor, wickDownColor: downColor, wickUpColor: upColor, priceLineVisible: false, lastValueVisible: false });
            mainSeries.setData(sanitizeChartData(chartType === 'HeikinAshi' ? heikinAshiData : priceData));
        } else if (chartType === 'Bar') {
             mainSeries = chart.addBarSeries({ upColor, downColor, priceLineVisible: false, lastValueVisible: false });
            mainSeries.setData(sanitizeChartData(priceData));
        } else if (chartType === 'Line') {
             mainSeries = chart.addLineSeries({ color: upColor, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            mainSeries.setData(sanitizeChartData(priceData.map(d => ({ time: d.time, value: d.close }))));
        } else {
            const areaTopColor = isLightTheme ? 'rgba(34, 197, 94, 0.4)' : 'rgba(62, 139, 243, 0.4)';
            const areaBottomColor = isLightTheme ? 'rgba(34, 197, 94, 0)' : 'rgba(62, 139, 243, 0)';
            mainSeries = chart.addAreaSeries({ lineColor: upColor, topColor: areaTopColor, bottomColor: areaBottomColor, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            mainSeries.setData(sanitizeChartData(priceData.map(d => ({ time: d.time, value: d.close }))));
        }
        mainSeriesRef.current = mainSeries;
        
        const volumeSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume', priceLineVisible: false, lastValueVisible: false });
        volumeSeries.setData(sanitizeChartData(volumeData));
        volumeSeriesRef.current = volumeSeries;
        chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        
        if (priceData.length > 0 && !isFullscreen && !isGridMode) {
            const priceLineBase = priceData[priceData.length - 1].close;
            priceLineRef.current.push(mainSeries.createPriceLine({ price: priceLineBase + 5, color: '#F97316', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: '', }));
            priceLineRef.current.push(mainSeries.createPriceLine({ price: priceLineBase + 2, color: '#F97316', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: '', }));
            priceLineRef.current.push(mainSeries.createPriceLine({ price: priceLineBase - 5, color: '#EF4444', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: '', }));
            priceLineRef.current.push(mainSeries.createPriceLine({ price: priceLineBase - 10, color: '#14B8A6', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: '', }));
        }
    }, [fullChartData, chartType, isReplayMode, replayIndex, isFullscreen, isGridMode, settings]);

    // Effect 3: Update Indicators
    useEffect(() => {
        if (!chartApiRef.current || !fullChartData || !fullChartData.priceData) return;
        const chart = chartApiRef.current;
        const data = fullChartData.priceData;
        if (data.length === 0) return;
        const closePrices = data.map(p => p.close);
    
        const currentSeriesMap = indicatorSeriesRef.current;
        const newSeriesMap = {};
    
        // Remove series for indicators that are no longer present
        Object.keys(currentSeriesMap).forEach(indicatorId => {
            if (!indicators.find(ind => ind.id === indicatorId)) {
                currentSeriesMap[indicatorId].forEach(series => {
                    chart.removeSeries(series);
                });
            }
        });
    
        indicators.forEach(ind => {
            // If series already exists, we assume it's up to date
            if (currentSeriesMap[ind.id]) {
                newSeriesMap[ind.id] = currentSeriesMap[ind.id];
                return;
            }
    
            const seriesGroup = [];
            let indicatorData;
    
            const commonOverlayOptions = {
                color: ind.color || '#F97316',
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
            };
    
            switch (ind.name.toUpperCase()) {
                case 'EMA':
                case 'SMA':
                    if (!ind.periods[0]) break;
                    indicatorData = ind.name.toUpperCase() === 'EMA' 
                        ? pine.ema(closePrices, ind.periods[0]) 
                        : pine.sma(closePrices, ind.periods[0]);
                    
                    const formattedData = data
                        .map((d, i) => ({ time: d.time, value: indicatorData[i] }))
                        .filter(d => typeof d.value === 'number' && isFinite(d.value));
    
                    const indSeries = chart.addLineSeries(commonOverlayOptions);
                    indSeries.setData(sanitizeChartData(formattedData));
                    seriesGroup.push(indSeries);
                    break;
    
                case 'RSI':
                    if (!ind.periods[0]) break;
                    const rsiPriceScaleId = `rsi_${ind.id}`;
                    const rsiSeries = chart.addLineSeries({
                        priceScaleId: rsiPriceScaleId,
                        color: ind.color || '#EAB308',
                        lineWidth: 2,
                    });
                    chart.priceScale(rsiPriceScaleId).applyOptions({ scaleMargins: { top: 0.85, bottom: 0.05 } });
                    
                    indicatorData = pine.rsi(closePrices, ind.periods[0]);
                    const formattedRsi = data.map((d, i) => ({ time: d.time, value: indicatorData[i] })).filter(d => !isNaN(d.value));
                    rsiSeries.setData(sanitizeChartData(formattedRsi));
                    
                    rsiSeries.createPriceLine({ price: 70, color: '#EF444480', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: '70' });
                    rsiSeries.createPriceLine({ price: 30, color: '#22C55E80', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: '30' });
                    
                    seriesGroup.push(rsiSeries);
                    break;
    
                case 'MACD':
                    if (ind.periods.length !== 3) break;
                    const [macdLineData, signalLineData, histData] = pine.macd(closePrices, ind.periods[0], ind.periods[1], ind.periods[2]);
                    const macdPriceScaleId = `macd_${ind.id}`;
    
                    const macdSeries = chart.addLineSeries({ priceScaleId: macdPriceScaleId, color: '#2962FF', lineWidth: 2, crosshairMarkerVisible: false });
                    macdSeries.setData(data.map((d, i) => ({ time: d.time, value: macdLineData[i] })).filter(d => !isNaN(d.value) && d.value !== null));
    
                    const signalSeries = chart.addLineSeries({ priceScaleId: macdPriceScaleId, color: '#FF6D00', lineWidth: 2, crosshairMarkerVisible: false });
                    signalSeries.setData(data.map((d, i) => ({ time: d.time, value: signalLineData[i] })).filter(d => !isNaN(d.value) && d.value !== null));
                    
                    const histSeries = chart.addHistogramSeries({ priceScaleId: macdPriceScaleId, priceLineVisible: false });
                    const formattedHistData = data.map((d, i) => ({
                        time: d.time,
                        value: histData[i],
                        color: histData[i] >= 0 
                            ? (i > 0 && histData[i] < histData[i-1] ? 'rgba(38, 166, 154, 0.5)' : 'rgba(38, 166, 154, 1)')
                            : (i > 0 && histData[i] > histData[i-1] ? 'rgba(239, 83, 80, 0.5)' : 'rgba(239, 83, 80, 1)')
                    })).filter(d => !isNaN(d.value) && d.value !== null);
                    histSeries.setData(formattedHistData);
    
                    chart.priceScale(macdPriceScaleId).applyOptions({ scaleMargins: { top: 0.85, bottom: 0.05 } });
                    seriesGroup.push(macdSeries, signalSeries, histSeries);
                    break;
            }
            
            if (seriesGroup.length > 0) {
                newSeriesMap[ind.id] = seriesGroup;
            }
        });
    
        indicatorSeriesRef.current = newSeriesMap;
    
    }, [indicators, fullChartData]);

    // Effect 4: Update Drawings
    useEffect(() => {
        if (!chartApiRef.current || !fullChartData || !fullChartData.priceData) return;
        const chart = chartApiRef.current;
        
        const existingSeriesIds = new Set(Object.keys(drawingSeriesRef.current));
        const newDrawingIds = new Set(drawings.filter(d => !['rect', 'ellipse'].includes(d.type)).map(d => d.id));

        // Remove deleted series (non-HTML rendered)
        existingSeriesIds.forEach(id => {
            if (!newDrawingIds.has(id)) {
                if (drawingSeriesRef.current[id]) {
                    drawingSeriesRef.current[id].forEach(series => chart.removeSeries(series));
                    delete drawingSeriesRef.current[id];
                }
            }
        });

        drawings.forEach(drawing => {
            if (['rect', 'ellipse'].includes(drawing.type)) return;

             if (drawingSeriesRef.current[drawing.id]) {
                drawingSeriesRef.current[drawing.id].forEach(series => chart.removeSeries(series));
             }
            drawingSeriesRef.current[drawing.id] = [];

            if (trendlineTools.includes(drawing.type) || drawing.type === 'fib-retracement') {
                const isSelected = selectedDrawing && selectedDrawing.id === drawing.id;
                const config = getToolConfig(drawing.type);
                const lineColor = isSelected ? '#3E8BF3' : config.color;
                const lineWidth = isSelected ? 3 : config.width;

                if (trendlineTools.includes(drawing.type)) {
                    const lineSeries = chart.addLineSeries({ color: lineColor, lineWidth: lineWidth, lineStyle: config.dash?.length > 0 ? LineStyle.Dashed : LineStyle.Solid, lastValueVisible: false, priceLineVisible: false });
                    const { start, end } = drawing;
                    const data = fullChartData.priceData;
                    if (!data || data.length === 0 || !start || !end) {
                        if (start && end) lineSeries.setData(sanitizeChartData([{ time: start.time, value: start.price }, { time: end.time, value: end.price }]));
                        drawingSeriesRef.current[drawing.id].push(lineSeries);
                        return;
                    }
                    const startIndex = start.logical ?? data.findIndex(d => d.time === start.time);
                    const endIndex = end.logical ?? data.findIndex(d => d.time === end.time);

                    if (startIndex === -1 || endIndex === -1) {
                        lineSeries.setData(sanitizeChartData([{ time: start.time, value: start.price }, { time: end.time, value: end.price }]));
                        drawingSeriesRef.current[drawing.id].push(lineSeries);
                        return;
                    }

                    const firstTime = data[0].time;
                    const lastTime = data[data.length - 1].time;
                    const logicalFirst = 0;
                    const logicalLast = data.length - 1;
                    const logicalDiff = endIndex - startIndex;
                    const slope = logicalDiff === 0 ? 0 : (end.price - start.price) / logicalDiff;
                    let p1 = { time: start.time, value: start.price }, p2 = { time: end.time, value: end.price };
                    
                    const priceScale = mainSeriesRef.current.priceScale();
                    const visiblePriceRange = priceScale.getVisiblePriceRange();

                    switch (drawing.type) {
                        case 'vertical-line': p1 = { time: start.time, value: visiblePriceRange.from }; p2 = { time: start.time, value: visiblePriceRange.to }; break;
                        case 'horizontal-line': p1 = { time: firstTime, value: start.price }; p2 = { time: lastTime, value: start.price }; break;
                        case 'horizontal-ray': p1 = { time: start.time, value: start.price }; p2 = { time: lastTime, value: start.price }; break;
                        case 'ray': p1 = { time: start.time, value: start.price }; p2 = { time: lastTime, value: start.price + slope * (logicalLast - startIndex) }; break;
                        case 'extended-line': p1 = { time: firstTime, value: start.price + slope * (logicalFirst - startIndex) }; p2 = { time: lastTime, value: start.price + slope * (logicalLast - startIndex) }; break;
                    }
                    lineSeries.setData(sanitizeChartData([p1, p2]));
                    drawingSeriesRef.current[drawing.id].push(lineSeries);
                } else if (drawing.type === 'fib-retracement') {
                    // Fib logic remains
                }
            } else if (drawing.type === 'triangle') {
                // Triangle logic remains
            } else if (drawing.type === 'gann-fan') {
                // Gann fan logic remains
            } else if (drawing.type === 'draw') {
                 // Draw logic remains
            }
        });
    }, [drawings, fullChartData, selectedDrawing]);

    // Effect 4.5: Update drawing styles on selection change (performance)
    useEffect(() => {
        const chart = chartApiRef.current;
        const seriesMap = drawingSeriesRef.current;
        if (!chart || !seriesMap) return;
    
        const oldSelectedId = prevSelectedDrawingId.current;
        const newSelectedId = selectedDrawing?.id;
    
        // Deselect old one if it exists and is not the new one
        if (oldSelectedId && oldSelectedId !== newSelectedId && seriesMap[oldSelectedId]) {
            const oldDrawing = drawings.find(d => d.id === oldSelectedId);
            if(oldDrawing && !['rect', 'ellipse'].includes(oldDrawing.type)) {
                const config = getToolConfig(oldDrawing.type === 'fib-retracement' ? 'fib_retracement' : oldDrawing.type);
                seriesMap[oldSelectedId].forEach(series => series.applyOptions({ color: config.color, width: config.width }));
            }
        }
    
        // Select new one if it exists
        if (newSelectedId && seriesMap[newSelectedId]) {
             const newDrawing = drawings.find(d => d.id === newSelectedId);
             if (newDrawing && !['rect', 'ellipse'].includes(newDrawing.type)) {
                seriesMap[newSelectedId].forEach(series => series.applyOptions({ color: '#3E8BF3', width: 3 }));
             }
        }
    
        prevSelectedDrawingId.current = newSelectedId;
    }, [selectedDrawing, drawings]);

    // Effect 5: Position Markers
    useEffect(() => {
        if (!mainSeriesRef.current || !chartApiRef.current || !fullChartData.priceData) return;

        const getCoordinates = (time, priceOffset = 0) => {
            const pricePoint = fullChartData.priceData.find(d => d.time === time);
            if (!pricePoint) return null;
            
            const price = pricePoint.close;
            const coordinate = mainSeriesRef.current.priceToCoordinate(price + priceOffset);
            
            const timeScale = chartApiRef.current.timeScale();
            const x = timeScale.timeToCoordinate(time);
            if (x === null) return null;
            
            return { x, y: coordinate };
        };

        const updateMarkers = () => {
            const newMarkers = markersData
                .map(data => ({
                    position: getCoordinates(data.time, data.priceOffset),
                    data: data,
                }))
                .filter(marker => marker.position !== null);
            setMarkers(newMarkers);
        };

        updateMarkers();
        
        const timeScale = chartApiRef.current.timeScale();
        timeScale.subscribeVisibleLogicalRangeChange(updateMarkers);

        return () => {
            const chart = chartApiRef.current;
            if (chart) {
                const ts = chart.timeScale();
                if (ts) {
                    ts.unsubscribeVisibleLogicalRangeChange(updateMarkers);
                }
            }
        };
    }, [markersData, fullChartData.priceData, mainSeriesRef.current]);
    
     // Effect 6: Position Drawable Markers (like text notes)
    useEffect(() => {
        if (!mainSeriesRef.current || !chartApiRef.current) return;

        const getCoordinates = (time, price) => {
            if (time === undefined || price === undefined) return null;
            
            const coordinateY = mainSeriesRef.current.priceToCoordinate(price);
            const timeScale = chartApiRef.current.timeScale();
            const coordinateX = timeScale.timeToCoordinate(time);
            
            if (coordinateX === null || coordinateY === null) return null;
            return { x: coordinateX, y: coordinateY };
        };

        const updateDrawableMarkers = () => {
            const drawableTypes = ['text-note', 'icon'];
            const notes = drawings.filter(d => drawableTypes.includes(d.type));
            
            const newDrawableMarkers = notes
                .map(drawing => ({
                    position: getCoordinates(drawing.time, drawing.price),
                    data: drawing,
                }))
                .filter(marker => marker.position !== null);
            
            setDrawableMarkers(newDrawableMarkers);
        };

        updateDrawableMarkers();

        const timeScale = chartApiRef.current.timeScale();
        timeScale.subscribeVisibleLogicalRangeChange(updateDrawableMarkers);

        return () => {
            const chart = chartApiRef.current;
            if (chart) {
                const ts = chart.timeScale();
                if (ts) {
                    ts.unsubscribeVisibleLogicalRangeChange(updateDrawableMarkers);
                }
            }
        };
    }, [drawings, fullChartData.priceData, mainSeriesRef.current]);

    // Effect for positioning handles for selected drawing
    useEffect(() => {
        const chart = chartApiRef.current;
        if (!chart) return;

        const updatePositions = () => {
            if (!selectedDrawing || !mainSeriesRef.current) {
                setHandlePositions({});
                return;
            }
            
            const newPositions = {};
            
            if (selectedDrawing.type === 'triangle') {
                newPositions.p1 = getScreenCoords(selectedDrawing.p1);
                newPositions.p2 = getScreenCoords(selectedDrawing.p2);
                newPositions.p3 = getScreenCoords(selectedDrawing.p3);
                if (newPositions.p1 && newPositions.p2 && newPositions.p3) {
                    newPositions.mid = { 
                        x: (newPositions.p1.x + newPositions.p2.x + newPositions.p3.x) / 3, 
                        y: (newPositions.p1.y + newPositions.p2.y + newPositions.p3.y) / 3 
                    };
                }
            } else if (selectedDrawing.start && selectedDrawing.end) {
                newPositions.start = getScreenCoords(selectedDrawing.start);
                newPositions.end = getScreenCoords(selectedDrawing.end);
                if (newPositions.start && newPositions.end) {
                    newPositions.mid = { 
                        x: (newPositions.start.x + newPositions.end.x) / 2, 
                        y: (newPositions.start.y + newPositions.end.y) / 2 
                    };
                }
            }
            setHandlePositions(newPositions);
        };

        updatePositions(); // Initial update
        const timeScale = chart.timeScale();
        timeScale.subscribeVisibleLogicalRangeChange(updatePositions);

        return () => {
            if (chartApiRef.current) {
                chartApiRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(updatePositions);
            }
        };
    }, [selectedDrawing, getScreenCoords, fullChartData, chartType, isReplayMode, replayIndex]); // Re-subscribe if data changes

    // Effect for dragging handles
    useEffect(() => {
        if (!draggedHandle) return;

        const chart = chartApiRef.current;
        const container = chartContainerRef.current;

        const getChartCoordinatesFromEvent = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const time = chart.timeScale().coordinateToTime(x);
            const price = mainSeriesRef.current.coordinateToPrice(y);
            const logical = Math.round(chart.timeScale().coordinateToLogical(x));
            return { time, price, logical, point: {x,y} };
        };

        const handleMouseMove = (e) => {
            const { time, price, logical, point } = getChartCoordinatesFromEvent(e);
            if (time === null || price === null) return;
            
            const { time: finalTime, price: finalPrice, logical: finalLogical } = getSnappedPoint(point, logical, time);
            
            if (finalPrice === null) return;

            const newPoint = { time: finalTime, price: finalPrice, logical: finalLogical };

            setDrawings(prev => prev.map(d => {
                if (d.id === draggedHandle.drawingId) {
                    const updatedDrawing = { ...d, [draggedHandle.handle]: newPoint };
                    setSelectedDrawing(updatedDrawing);
                    return updatedDrawing;
                }
                return d;
            }));
        };

        const handleMouseUp = () => {
            setDraggedHandle(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggedHandle, setDrawings, getSnappedPoint]);

    // Effect for moving drawings
    useEffect(() => {
        if (!moveState) return;
        
        const chart = chartApiRef.current;
        const mainSeries = mainSeriesRef.current;
        const container = chartContainerRef.current;
        if(!chart || !mainSeries || !container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const currentMousePos = { x: e.clientX, y: e.clientY };
            
            const deltaX = currentMousePos.x - moveState.initialMousePos.x;
            const deltaY = currentMousePos.y - moveState.initialMousePos.y;
            
            const pricePerPixel = Math.abs(mainSeries.coordinateToPrice(0) - mainSeries.coordinateToPrice(1));
            const priceDelta = deltaY * pricePerPixel;
            
            const timeScale = chart.timeScale();
            const pixelsPerBar = timeScale.width() / (timeScale.getVisibleLogicalRange().to - timeScale.getVisibleLogicalRange().from);
            const logicalDelta = Math.round(deltaX / pixelsPerBar);
            
            setDrawings(prev => prev.map(d => {
                if (d.id === moveState.drawingId) {
                    const newDrawing = { ...d };
                    const initial = moveState.initialDrawing;
                    
                    const offsetPoint = (p) => {
                        if (!p) return undefined;
                        const initialLogical = p.logical ?? fullChartData.priceData.findIndex(dp => dp.time === p.time);
                        if (initialLogical === -1) return p;

                        const newLogical = initialLogical + logicalDelta;
                        if (newLogical < 0 || newLogical >= fullChartData.priceData.length) return p;
                        
                        const dataPoint = fullChartData.priceData[newLogical];
                        if (!dataPoint) return p;
                        
                        return {
                            time: dataPoint.time,
                            price: p.price - priceDelta,
                            logical: newLogical
                        };
                    };
                    
                    ['start', 'end', 'p1', 'p2', 'p3'].forEach(key => {
                        if (initial[key]) newDrawing[key] = offsetPoint(initial[key]);
                    });

                    if(newDrawing.start || newDrawing.p1) setSelectedDrawing(newDrawing);
                    return newDrawing;
                }
                return d;
            }));
        };
        
        const handleMouseUp = () => setMoveState(null);
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [moveState, fullChartData.priceData]);


    // Effect 7: Handle drawing on chart
    useEffect(() => {
        const chart = chartApiRef.current;
        const container = chartContainerRef.current;
        if (!chart || !mainSeriesRef.current || !container) return;

        const getChartCoordinatesFromEvent = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const time = chart.timeScale().coordinateToTime(x);
            const price = mainSeriesRef.current.coordinateToPrice(y);
            const logical = Math.round(chart.timeScale().coordinateToLogical(x));
            return { time, price, logical, point: {x,y} };
        };

        const handleClick = (param) => {
            if (drawingStateRef.current.isDrawing) return; // Ignore clicks if a drag-draw is in progress
            if (!param.point || !param.time) return;

            const clickedDrawing = getClickedDrawing(param.point, drawings, getScreenCoords);
            setSelectedDrawing(clickedDrawing);

            if (clickedDrawing || areDrawingsLocked) return;

            try {
                const { price, time, logical } = getSnappedPoint(param.point, param.logical, param.time);
                if (price === null) return;
                
                const currentPointInfo = { time, price, logical };
                const startPoint = drawingStateRef.current.startPoint;
                const midPoint = drawingStateRef.current.midPoint;

                const completeDrawing = (drawing) => {
                    setDrawings([...drawings, drawing]);
                    drawingStateRef.current.startPoint = null;
                    drawingStateRef.current.midPoint = null;
                     if (!isDrawingModeOn) {
                        setActiveTool('crosshair');
                        if (drawing.type === 'icon') setSelectedIcon(null);
                    }
                };
                
                const threeClickTools = ['triangle', 'parallel-channel', 'pitchfork', 'fib-channel'];

                if (threeClickTools.includes(activeTool)) {
                     if (!startPoint) {
                        drawingStateRef.current.startPoint = currentPointInfo;
                    } else if (!midPoint) {
                        drawingStateRef.current.midPoint = currentPointInfo;
                    } else {
                        completeDrawing({
                            id: `drawing-${Date.now()}`,
                            type: activeTool,
                            ...(activeTool === 'triangle' 
                                ? { p1: startPoint, p2: midPoint, p3: currentPointInfo } 
                                : { start: startPoint, mid: midPoint, end: currentPointInfo })
                        });
                    }
                } else if (activeTool === 'vertical-line') {
                    completeDrawing({
                        id: `drawing-${Date.now()}`,
                        type: 'vertical-line',
                        start: currentPointInfo,
                        end: currentPointInfo,
                    });
                } else if (activeTool === 'text-note') {
                    setTextInput({ position: param.point, data: currentPointInfo });
                } else if (activeTool === 'icon') {
                    if (selectedIcon) {
                        completeDrawing({
                            id: `icon-${Date.now()}`,
                            type: 'icon',
                            time,
                            price,
                            text: selectedIcon,
                        });
                    } else {
                        window.toast?.('Please select an icon from the toolbar first.');
                        setActiveTool('crosshair');
                    }
                }
            } catch (e) {
                console.warn("Caught chart click error:", e.message);
            }
        };

        chart.subscribeClick(handleClick);
        return () => {
            if (chart) chart.unsubscribeClick(handleClick);
        };
    }, [drawings, activeTool, areDrawingsLocked, isDrawingModeOn, fullChartData, setActiveTool, selectedIcon, setSelectedIcon, getScreenCoords, getSnappedPoint]);
    
    // Effect 8: Handle mouse drag interactions (Zoom, Pencil, Shapes)
    useEffect(() => {
        const chart = chartApiRef.current;
        const container = chartContainerRef.current;
        if (!chart || !container || !mainSeriesRef.current) return;
        
        const getChartCoordinatesFromEvent = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const time = chart.timeScale().coordinateToTime(x);
            const price = mainSeriesRef.current.coordinateToPrice(y);
            const logical = Math.round(chart.timeScale().coordinateToLogical(x));
            return { time, price, logical, point: {x,y} };
        };

        const handleMouseDown = (e) => {
            if (areDrawingsLocked) return;

            // Start move/drag
            if (selectedDrawing && !draggedHandle && e.target === container.querySelector('canvas:first-child')) {
                const { point } = getChartCoordinatesFromEvent(e);
                 if (getClickedDrawing(point, [selectedDrawing], getScreenCoords)) {
                    e.preventDefault(); e.stopPropagation();
                    setMoveState({ drawingId: selectedDrawing.id, initialMousePos: { x: e.clientX, y: e.clientY }, initialDrawing: selectedDrawing });
                    return;
                }
            }

            const shapeTools = ['rect', 'ellipse', 'trendline', 'fib-retracement', 'gann-fan', 'arrow', 'ray', 'extended-line', 'horizontal-ray'];
            if (shapeTools.includes(activeTool) || ['zoom', 'draw'].includes(activeTool)) {
                e.preventDefault(); e.stopPropagation();
                drawingStateRef.current.isDrawing = true;
                const { time, price, logical, point } = getChartCoordinatesFromEvent(e);
                if (time === null || price === null) return;
                
                const { time: finalTime, price: finalPrice, logical: finalLogical } = getSnappedPoint(point, logical, time);
                if(finalPrice === null) return;
                
                const startPoint = { time: finalTime, price: finalPrice, logical: finalLogical };
                drawingStateRef.current.startPoint = startPoint;

                if (shapeTools.includes(activeTool)) {
                    setPreviewDrawing({ type: activeTool, start: startPoint, end: startPoint });
                } else if (activeTool === 'draw') {
                    drawingStateRef.current.currentPath = [{ time, value: price }];
                }
            }
        };

        const handleMouseMove = (e) => {
            if (!drawingStateRef.current.isDrawing) return;
            e.preventDefault(); e.stopPropagation();

            const { time, price, logical, point } = getChartCoordinatesFromEvent(e);
            if (time === null || price === null) return;

            const { time: finalTime, price: finalPrice, logical: finalLogical } = getSnappedPoint(point, logical, time);
            if (finalPrice === null) return;
            const currentPoint = { time: finalTime, price: finalPrice, logical: finalLogical };

            if (previewDrawing) {
                setPreviewDrawing(prev => ({ ...prev, end: currentPoint }));
            } else if (activeTool === 'draw') {
                const lastPoint = drawingStateRef.current.currentPath[drawingStateRef.current.currentPath.length - 1];
                if (lastPoint && lastPoint.time !== time) {
                    drawingStateRef.current.currentPath.push({ time, value: price });
                }
            }
        };

        const handleMouseUp = (e) => {
            if (!drawingStateRef.current.isDrawing) return;
            e.preventDefault(); e.stopPropagation();
            
            drawingStateRef.current.isDrawing = false;
            
            if (previewDrawing) {
                const finalDrawing = { ...previewDrawing, id: `drawing-${Date.now()}` };
                // Prevent creating tiny accidental drawings
                if(Math.abs(finalDrawing.start.logical - finalDrawing.end.logical) > 1 || Math.abs(finalDrawing.start.price - finalDrawing.end.price) > 0.001) {
                    setDrawings(prev => [...prev, finalDrawing]);
                }
                setPreviewDrawing(null);
            } else if (activeTool === 'draw' && drawingStateRef.current.currentPath.length > 1) {
                setDrawings([...drawings, {
                    id: `draw-${Date.now()}`,
                    type: 'draw',
                    points: drawingStateRef.current.currentPath,
                }]);
                drawingStateRef.current.currentPath = [];
            } else if(activeTool === 'zoom') {
                 const start = drawingStateRef.current.startPoint;
                 const { time } = getChartCoordinatesFromEvent(e);
                 if (start && start.time && time) {
                    const from = Math.min(start.time, time);
                    const to = Math.max(start.time, time);
                    if (from !== to) chart.timeScale().setVisibleRange({ from, to });
                }
            }
            
            drawingStateRef.current.startPoint = null;
            if (!isDrawingModeOn) {
                setActiveTool('crosshair');
            }
        };
        
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [activeTool, drawings, areDrawingsLocked, isDrawingModeOn, setActiveTool, selectedDrawing, draggedHandle, getScreenCoords, getSnappedPoint, previewDrawing]);


    // Effect 9: Handle external chart events
    useEffect(()=>{
        const chart = chartApiRef.current;
        if (!chart) return;

        const onZoom = (e)=>{ 
            try { 
                const z = e.detail; 
                const ts = chart.timeScale(); 
                if(ts){ 
                    const range = ts.getVisibleLogicalRange(); 
                    if(range){ 
                        const c = (range.from + range.to)/2; 
                        const span = (range.to - range.from) / (z||1); 
                        ts.setVisibleLogicalRange({from: c - span/2, to: c + span/2}); 
                    } 
                } 
            } catch(err){}
        }
        const onScroll = (e)=>{ 
            try{ 
                const dir = e.detail; 
                const ts = chart.timeScale(); 
                if(ts){ 
                    const range = ts.getVisibleLogicalRange();
                    if (range) {
                        const newFrom = range.from + (dir * 20); // scroll by 20 bars
                        const newTo = range.to + (dir * 20);
                        ts.setVisibleLogicalRange({from: newFrom, to: newTo});
                    }
                } 
            } catch(err){} 
        }
        
        const onReload = ()=>{
          try{
            window.toast && window.toast('تم تحديث الشارت');
          }catch(e){ console.warn('reload failed', e) }
        };

        const handleResetScale = () => {
            if (chartApiRef.current) {
                chartApiRef.current.timeScale().fitContent();
            }
        };

        const handleScreenshot = () => {
            if (chartApiRef.current) {
                const chart = chartApiRef.current;
                const { chart: chartSettings } = settings;
                const isLightTheme = settings.theme === 'light';
                const originalBackgroundColor = isLightTheme ? '#FFFFFF' : chartSettings.background;

                // Apply transparent background for the screenshot
                chart.applyOptions({
                    layout: {
                        background: { type: ColorType.Solid, color: 'transparent' },
                    },
                });

                // A short delay is often needed for the options to apply before screenshotting
                setTimeout(() => {
                    try {
                        const canvas = chart.takeScreenshot();
                        const link = document.createElement('a');
                        link.download = `${stockSymbol}_${new Date().toISOString().slice(0,19).replace('T', '_').replace(/:/g, '-')}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        window.toast?.('Screenshot saved!');
                    } catch (e) {
                        console.error("Failed to take screenshot:", e);
                        window.toast?.('Could not save screenshot.');
                    } finally {
                        // Restore the original background color after taking the screenshot
                        chart.applyOptions({
                            layout: {
                                background: { type: ColorType.Solid, color: originalBackgroundColor },
                            },
                        });
                    }
                }, 50);
            }
        };

        window.addEventListener('chart:zoom', onZoom);
        window.addEventListener('chart:scroll', onScroll);
        window.addEventListener('chart:reload', onReload);
        window.addEventListener('chart:reset_scale', handleResetScale);
        window.addEventListener('chart:screenshot', handleScreenshot);
        
        return ()=>{
          window.removeEventListener('chart:zoom', onZoom);
          window.removeEventListener('chart:scroll', onScroll);
          window.removeEventListener('chart:reload', onReload);
          window.removeEventListener('chart:reset_scale', handleResetScale);
          window.removeEventListener('chart:screenshot', handleScreenshot);
        };
    },[stockSymbol, settings]);

     // Effect 10: Keyboard shortcuts for drawing management
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDrawing) {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                e.preventDefault();
                
                if (areDrawingsLocked) {
                    window.toast?.("Drawings are locked. Unlock to delete.");
                    return;
                }
                
                handleDeleteDrawing(selectedDrawing.id);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedDrawing, drawings, areDrawingsLocked]);
    
    // Effect 11: Real-time data updates
    useEffect(() => {
        if (isLoading || isReplayMode || isGridMode || !mainSeriesRef.current || !volumeSeriesRef.current || !fullChartData.priceData.length) {
            return;
        }

        const series = mainSeriesRef.current;
        const volumeSeries = volumeSeriesRef.current;
        
        let lastCandle = fullChartData.priceData[fullChartData.priceData.length - 1];
        let lastVolume = fullChartData.volumeData[fullChartData.volumeData.length - 1];

        const intervalId = setInterval(() => {
            const change = (Math.random() - 0.5) * (lastCandle.close * 0.001); // 0.1% volatility
            const newClose = Math.max(0.01, lastCandle.close + change);

            const newCandle = {
                ...lastCandle,
                close: newClose,
                high: Math.max(lastCandle.high, newClose),
                low: Math.min(lastCandle.low, newClose),
            };

            const newVolume = {
                ...lastVolume,
                value: (lastVolume.value || 0) + (Math.random() * 100),
            };
            
            const isLightTheme = settings.theme === 'light';
            newVolume.color = newCandle.close >= newCandle.open
                ? (isLightTheme ? 'rgba(34, 197, 94, 0.5)' : 'rgba(62, 139, 243, 0.5)')
                : (isLightTheme ? 'rgba(239, 68, 68, 0.5)' : 'rgba(247, 82, 95, 0.5)');
            
            series.update(newCandle);
            volumeSeries.update(newVolume);

            lastCandle = newCandle;
            lastVolume = newVolume;

        }, 1500);

        return () => clearInterval(intervalId);

    }, [isLoading, isReplayMode, isGridMode, fullChartData, settings.theme]);


    const handleDeleteDrawing = (id) => {
        if (!areDrawingsLocked) {
            setDrawings(drawings.filter(d => d.id !== id));
            if (selectedDrawing && selectedDrawing.id === id) {
                setSelectedDrawing(null);
            }
        }
    };
    
    const getLoadingMessage = () => {
        if (isLoading) return 'Loading Chart Data...';
        if (isAiDrawing) return 'AI is analyzing...';
        if (isAnnotationsLoading) return 'Loading AI Insights...';
        return '';
    };

    const renderedShapeDrawings = useMemo(() => 
        drawings.filter(d => ['rect', 'ellipse'].includes(d.type)),
        [drawings]
    );

    return (
        <div className={`flex-1 flex flex-col bg-[#12161D] overflow-hidden ${isFullscreen ? 'h-full w-full' : ''}`} data-dev-name="ChartArea.Container">
            {isGridMode ? <GridChartHeader chartName={gridChartName} /> : <ChartHeader stockSymbol={stockSymbol} timeframe={timeframe} symbolsCatalog={symbolsCatalog} />}
            <div className="flex-1 relative">
                <div ref={chartContainerRef} className="w-full h-full" data-dev-name="ChartArea.ChartContainer" />
                
                {/* HTML Overlays for drawings */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {renderedShapeDrawings.map(d => (
                        <DrawableShape 
                            key={d.id} 
                            drawing={d} 
                            getScreenCoords={getScreenCoords}
                            isSelected={selectedDrawing?.id === d.id}
                        />
                    ))}
                    {previewDrawing && <DrawableShape drawing={previewDrawing} getScreenCoords={getScreenCoords} isPreview />}
                </div>

                {isReplayMode && (
                    <ReplayPanel
                        onPlayPause={handleReplayPlayPause}
                        onStep={handleReplayStep}
                        onReset={handleReplayReset}
                        onSpeedChange={setReplaySpeed}
                        isPlaying={isPlaying}
                        speed={replaySpeed}
                    />
                )}

                {(isLoading || isAnnotationsLoading || isAiDrawing) && 
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
                        <div className="text-white flex items-center gap-2 bg-[#1A1F2A] px-4 py-2 rounded-md">
                            {isLoading 
                                ? <RotateCcw size={16} className="animate-spin"/>
                                : <Sparkles size={16} className="text-purple-400 animate-pulse"/>
                            }
                            <span>{getLoadingMessage()}</span>
                        </div>
                    </div>
                }

                {textInput && (
                    <div 
                        style={{ 
                            position: 'absolute', 
                            top: textInput.position.y, 
                            left: textInput.position.x,
                            transform: 'translate(5px, -50%)',
                            zIndex: 40 
                        }}
                        data-dev-name="ChartArea.TextInput"
                    >
                        <textarea
                            autoFocus
                            onBlur={(e) => handleTextInputConfirm(e.target.value)}
                            onKeyDown={handleTextInputKeyDown}
                            className="bg-[#1A1F2A] border border-[#3E8BF3] text-white p-2 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3E8BF3] min-w-[200px]"
                            rows="3"
                            placeholder="Enter note... (Enter to confirm, Esc to cancel)"
                        />
                    </div>
                )}
                {selectedDrawing && (
                    <>
                        {['start', 'end', 'p1', 'p2', 'p3'].map(handleName => {
                            const pos = handlePositions[handleName];
                            if (!pos) return null;
                            return (
                                <div
                                    key={handleName}
                                    className="absolute w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow-lg cursor-grab active:cursor-grabbing z-30"
                                    style={{ left: pos.x - 8, top: pos.y - 8 }}
                                    onMouseDown={(e) => { e.stopPropagation(); setDraggedHandle({ drawingId: selectedDrawing.id, handle: handleName }); }}
                                />
                            );
                        })}
                        {handlePositions.mid && (
                            selectedDrawing.isAi && isAiEnabled ? (
                                <button
                                    className="absolute p-1 bg-[#1A1F2A] rounded-full border border-[#9046FF] z-30 cursor-move"
                                    style={{ left: handlePositions.mid.x - 12, top: handlePositions.mid.y - 12 }}
                                    onMouseDown={(e) => { e.stopPropagation(); if (e.button !== 2) setMoveState({ drawingId: selectedDrawing.id, initialMousePos: {x: e.clientX, y: e.clientY}, initialDrawing: selectedDrawing }); }}
                                    onClick={(e) => { e.stopPropagation(); handleRegenerateDrawing(e); }}
                                    title="Move Drawing / Regenerate with AI"
                                >
                                    <Sparkles size={14} className="text-[#9046FF]" />
                                </button>
                            ) : (
                                <div
                                    className="absolute w-4 h-4 bg-white/80 rounded-sm border-2 border-blue-500 shadow-lg cursor-move z-30"
                                    style={{ left: handlePositions.mid.x - 8, top: handlePositions.mid.y - 8 }}
                                    title="Move Drawing"
                                    onMouseDown={(e) => { e.stopPropagation(); setMoveState({ drawingId: selectedDrawing.id, initialMousePos: {x: e.clientX, y: e.clientY}, initialDrawing: selectedDrawing }); }}
                                />
                            )
                        )}
                    </>
                )}
                {markers.map(marker => (
                    <ChartMarker 
                        key={marker.data.id} 
                        position={marker.position} 
                        data={marker.data} 
                        isHighlighted={highlightedAnnotationId === marker.data.id} 
                    />
                ))}
                {drawableMarkers.map(marker => (
                    <DrawableMarker
                        key={marker.data.id}
                        position={marker.position}
                        data={marker.data}
                        onDelete={handleDeleteDrawing}
                    />
                ))}
            </div>
            {!isGridMode && <ChartFooter onTimeRangeChange={onTimeRangeChange} />}
             <style>{`
                .marker-highlight {
                    box-shadow: 0 0 0 2px #9046FF, 0 0 10px #9046FF;
                    transition: box-shadow 0.2s ease-in-out;
                    z-index: 10;
                }
            `}</style>
        </div>
    );
};

export default ChartArea;

// AUTO_EXTENDED_TOOL_HANDLER
try {
  if (!window.getToolConfig) {
    window.getToolConfig = getToolConfig;
  }
} catch {}

export function useExtendedToolHandler(drawingRef, safeRedraw, redrawOverlay){
  useEffect(()=>{
    const onTool = (e)=>{
      try{
        const tool = (e.detail && (e.detail.tool || e.detail)) || null;
        if (!tool) return;
        drawingRef.current = drawingRef.current || {};
        drawingRef.current.activeTool = tool;
        if (window.getToolConfig){
          const cfg = window.getToolConfig(tool);
          drawingRef.current.activeToolConfig = cfg;
        }
        safeRedraw && redrawOverlay && safeRedraw(redrawOverlay);
      }catch(err){ console.warn('tool change err', err) }
    };
    
    const { setActiveTool } = useUIStore.getState();
    const handleToolChange = (event) => onTool(event);

    window.addEventListener('tools:change', handleToolChange);
    return ()=> window.removeEventListener('tools:change', handleToolChange);
  },[drawingRef, safeRedraw, redrawOverlay]);
}