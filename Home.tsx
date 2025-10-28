/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Minimize } from 'lucide-react';
import Header from './Header.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import ChartArea from './ChartArea.jsx';
import ChartGrid from './ChartGrid.jsx';
import RightSidebar from './RightSidebar.jsx';
import { GoogleGenAI, Type } from '@google/genai';
import { getChartData } from './chartUtils.js';
import Toolbar from './Toolbar.jsx';
import BottomDock from './BottomDock.jsx';
import SymbolSearchModal from './SymbolSearchModal.jsx';
import BottomBar from './BottomBar.jsx';
import RightToolbar from './RightToolbar.jsx';
import SettingsModal from './SettingsModal.jsx';
import './shortcuts.js'; // AUTO: load shortcuts
import './toast-1.js';
import { useSettingsStore, useUIStore, t } from './ui.ts';
import * as pine from './pine_runner.ts';

declare global {
  interface Window {
    toast?: (message: string) => void;
    stockSymbol?: string;
    getToolConfig?: (tool: string) => any;
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GlobalErrorModal = ({ error, onClose }) => {
    if (!error) return null;

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]" aria-modal="true" role="dialog" data-dev-name="GlobalErrorModal">
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 text-white animate-fade-in-up">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-500/20 rounded-full flex-shrink-0 mt-1">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                         <h3 className="text-lg font-bold">{t('error_modal_title')}</h3>
                         <p className="text-sm text-[#8A93A2] mt-2">{t('error_modal_description')}</p>
                         <details className="mt-4 text-xs">
                             <summary className="cursor-pointer text-[#8A93A2] hover:text-white">{t('error_modal_details')}</summary>
                             <div className="mt-2 p-3 bg-[#12161D] rounded-md font-mono text-red-400 max-h-40 overflow-y-auto border border-red-500/20">
                                <p className="font-bold">Error:</p>
                                <code className="whitespace-pre-wrap break-all">{error.message || 'Unknown error'}</code>
                                {error.details && (
                                    <>
                                        <p className="font-bold mt-2">Stack Trace:</p>
                                        <code className="whitespace-pre-wrap break-all">{error.details}</code>
                                    </>
                                )}
                             </div>
                         </details>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                     <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-semibold text-[#E1E3E6] bg-[#2A3040] hover:bg-[#383f52] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="GlobalErrorModal.DismissButton"
                     >
                        {t('common_dismiss')}
                    </button>
                    <button 
                        onClick={handleRefresh} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="GlobalErrorModal.RefreshButton"
                     >
                        {t('common_refresh_page')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// FIX: Refactored to use React.PropsWithChildren for more robust children prop typing, resolving a potential TypeScript error.
interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
}

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, title, children }: React.PropsWithChildren<ConfirmationDialogProps>) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[10000]" aria-modal="true" role="dialog" data-dev-name="ConfirmationDialog">
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl p-6 w-full max-w-md mx-4 text-white animate-fade-in-up">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-full flex-shrink-0 mt-1">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">{title}</h3>
                        <div className="text-sm text-[#8A93A2] mt-2">
                            {children}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 text-sm font-semibold text-[#E1E3E6] bg-[#2A3040] hover:bg-[#383f52] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="ConfirmationDialog.CancelButton"
                    >
                        {t('common_cancel')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="ConfirmationDialog.ConfirmButton"
                    >
                        {t('common_confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuotaExceededModal = ({ isOpen, onDisable, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]" aria-modal="true" role="dialog" data-dev-name="QuotaExceededModal">
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 text-white animate-fade-in-up">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-full flex-shrink-0 mt-1">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                         <h3 className="text-lg font-bold">{t('quota_modal_title')}</h3>
                         <p className="text-sm text-[#8A93A2] mt-2">{t('quota_modal_description')}</p>
                         <p className="text-sm text-[#8A93A2] mt-4">{t('quota_modal_question')}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                     <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-semibold text-[#E1E3E6] bg-[#2A3040] hover:bg-[#383f52] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="QuotaExceededModal.NotNowButton"
                     >
                        {t('common_not_now')}
                    </button>
                    <button 
                        onClick={onDisable} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-[#1A1F2A] transition-colors"
                        data-dev-name="QuotaExceededModal.DisableButton"
                     >
                        {t('quota_modal_disable_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Resizer = ({ onMouseDown, className = '' }) => (
    <div 
        className={`w-1.5 bg-transparent hover:bg-purple-500/50 cursor-col-resize transition-colors duration-200 ${className}`}
        onMouseDown={onMouseDown}
    />
);

export default function Home() {
    const { settings, setSettings } = useSettingsStore();
    const { 
        rightSidebarView, setRightSidebarView, activeTool,
        areDrawingsLocked, toggle, undoDrawing, redoDrawing, alerts
    } = useUIStore();
    const isLeftPanelOpen = useUIStore(state => state.rightbar.leftPanelOpen);
    const isAiEnabled = settings.ai?.enabled ?? false;

    useEffect(() => {
        document.documentElement.className = settings.theme;
        document.documentElement.lang = settings.general.language;
        document.documentElement.dir = settings.general.language === 'ar' ? 'rtl' : 'ltr';
    }, [settings.theme, settings.general.language]);

  const [currentStock, setCurrentStock] = useState('BTCUSD');
  const [chartLayout, setChartLayout] = useState('grid');
  const [chartType, setChartType] = useState('Candlestick');
  const [timeframe, setTimeframe] = useState('1D');
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [timeRange, setTimeRange] = useState('1Y');

  const [aiAnnotations, setAiAnnotations] = useState([]);
  const [isAnnotationsLoading, setIsAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState('');
  
  const [indicators, setIndicators] = useState([]);
  
  const [isDevMode, setIsDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const highlightedElementRef = useRef(null);

  const [globalError, setGlobalError] = useState(null);
  
  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState(null);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const lastLeftSidebarWidth = useRef(300);

  const [rightSidebarWidth, setRightSidebarWidth] = useState(370);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [bottomDockHeight, setBottomDockHeight] = useState(40);
  const [isDockMaximized, setIsDockMaximized] = useState(false);
  const [bottomDockInitialTab, setBottomDockInitialTab] = useState('trading');
  const mainContentRef = useRef(null);

  const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);
  
  // Layout Management State
  const [savedLayouts, setSavedLayouts] = useState<string[]>([]);
  const [activeLayoutName, setActiveLayoutName] = useState<string | null>(null);
  
  const [chartDataForAnalysis, setChartDataForAnalysis] = useState({ priceData: [], volumeData: [] });
  const [provider, setProvider] = useState(() => localStorage.getItem('provider') || 'mock');

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  useEffect(() => {
    const handleQuotaError = () => {
        if (useSettingsStore.getState().settings.ai.enabled) {
            setIsQuotaModalOpen(true);
        }
    };
  }, []);

  useEffect(() => {
    const aiViews = ['AIBriefing', 'AIHub', 'AIPatterns', 'AIIndicatorSuggestions', 'Annotations', 'News', 'Analysis', 'Chat'];
    if (!isAiEnabled && aiViews.includes(rightSidebarView)) {
        setRightSidebarView(null);
    }
  }, [isAiEnabled, rightSidebarView, setRightSidebarView]);

  const handleDisableAi = () => {
    setSettings(prev => ({
        ...prev,
        ai: { ...prev.ai, enabled: false },
    }));
    setIsQuotaModalOpen(false);
    window.toast?.(t('toast_ai_disabled'));
  };

  useEffect(() => {
    const handleProviderChange = (e) => setProvider(e.detail);
    window.addEventListener('provider:change', handleProviderChange);
    return () => window.removeEventListener('provider:change', handleProviderChange);
  }, []);

  useEffect(() => {
      let isMounted = true;
      const fetchData = async () => {
          try {
              const data = await getChartData(currentStock, '1D', provider);
              if (isMounted) {
                  setChartDataForAnalysis(data);
              }
          } catch (e) {
              console.error("Failed to fetch analysis data:", e);
              const mockData = await getChartData(currentStock, '1D', 'mock');
               if (isMounted) {
                  setChartDataForAnalysis(mockData);
              }
          }
      };
      fetchData();
      return () => { isMounted = false; };
  }, [currentStock, provider]);

  useEffect(() => {
    const layouts = Object.keys(localStorage)
      .filter(key => key.startsWith('vs_layout_'))
      .map(key => key.replace('vs_layout_', ''));
    setSavedLayouts(layouts);
  }, []);

  const handleStockChange = useCallback((newStock: string) => {
    if (newStock && newStock.trim() !== '') {
      setCurrentStock(newStock.trim().toUpperCase());
      setIsReplayMode(false); // Exit replay mode on stock change
    }
  }, []);
  
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  const handleToggleZenMode = useCallback(() => {
    setIsZenMode(prev => !prev);
  }, []);

  const handleDockResizeStart = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomDockHeight;
    const handleMouseMove = (event) => {
      const newHeight = startHeight - (event.clientY - startY);
      if (newHeight >= 40 && newHeight < (mainContentRef.current?.clientHeight || window.innerHeight) * 0.9) {
        setBottomDockHeight(newHeight);
        setIsDockMaximized(false);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleToggleDock = useCallback((tab?: string) => {
    setBottomDockHeight(currentHeight => {
      const isOpening = currentHeight <= 40;
      if (isOpening) {
        setBottomDockInitialTab(tab || 'trading');
      }
      return isOpening ? 300 : 40;
    });
    setIsDockMaximized(false);
  }, []);
  
  const handleMaximizeDock = () => {
      if (isDockMaximized) {
          setBottomDockHeight(300); // Restore to default
      } else {
          const mainHeight = mainContentRef.current?.clientHeight || window.innerHeight;
          setBottomDockHeight(mainHeight * 0.9); // Maximize to 90%
      }
      setIsDockMaximized(!isDockMaximized);
  };
  
  useEffect(() => {
    const handleToggleDockEvent = (event: CustomEvent) => {
        const { tab } = event.detail;
        handleToggleDock(tab);
    };
    window.addEventListener('dock:toggle', handleToggleDockEvent as EventListener);
    return () => {
        window.removeEventListener('dock:toggle', handleToggleDockEvent as EventListener);
    };
  }, [handleToggleDock]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZenMode]);

  useEffect(() => {
    const handleSymbolChange = (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        const newStock = customEvent.detail;
        if (newStock && typeof newStock === 'string' && newStock.trim() !== '') {
            handleStockChange(newStock);
        }
    };
    window.addEventListener('chart:symbol', handleSymbolChange);
    return () => {
        window.removeEventListener('chart:symbol', handleSymbolChange);
    };
  }, [handleStockChange]);

  useEffect(() => {
    const handleAiAction = (event: Event) => {
      const { detail: command } = event as CustomEvent<any>;
      if (command.command_name === 'add_indicator' && command.parameters) {
        const { indicator_name, periods } = command.parameters;
        if(indicator_name && periods) {
            const newIndicator = {
                id: `${indicator_name}-${periods.join('-')}-${Date.now()}`,
                name: indicator_name,
                periods: periods,
                color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
            };
            setIndicators(prev => {
                if (prev.some(ind => ind.name === newIndicator.name && JSON.stringify(ind.periods) === JSON.stringify(newIndicator.periods))) {
                    return prev;
                }
                return [...prev, newIndicator];
            });
        }
      } else if (command.command_name === 'change_symbol' && command.parameters?.symbol) {
          handleStockChange(command.parameters.symbol);
      }
    };

    window.addEventListener('chart:ai_action', handleAiAction);
    return () => {
      window.removeEventListener('chart:ai_action', handleAiAction);
    };
  }, [handleStockChange]);

  const handleAddPineIndicator = (code) => {
      if (!code || chartDataForAnalysis.priceData.length === 0) return;
      
      const pineIndicator = {
          id: `pine-${Date.now()}`,
          name: 'Pine',
          pineCode: code,
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
      };
      
      // Check if a pine indicator already exists and replace it for simplicity
      setIndicators(prev => [...prev.filter(ind => ind.name !== 'Pine'), pineIndicator]);
      window.toast?.(t('toast_pine_added'));
  };

  useEffect(() => {
    if (isLeftPanelOpen) {
      setLeftSidebarWidth(lastLeftSidebarWidth.current);
    } else {
      if (leftSidebarWidth > 48) {
        lastLeftSidebarWidth.current = leftSidebarWidth;
      }
      setLeftSidebarWidth(48);
    }
  }, [isLeftPanelOpen, leftSidebarWidth]);


  const handleLeftResize = (e) => {
      e.preventDefault();
      const initialX = e.clientX;
      const initialWidth = leftSidebarWidth;
      
      const moveHandler = (event) => {
          const newWidth = initialWidth + (event.clientX - initialX);
          if (newWidth > 200 && newWidth < 600) { 
              setLeftSidebarWidth(newWidth);
              lastLeftSidebarWidth.current = newWidth;
          }
      };
      
      const upHandler = () => {
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
  };
    
  const handleRightResize = (e) => {
      e.preventDefault();
      const initialX = e.clientX;
      const initialWidth = rightSidebarWidth;
      const moveHandler = (event) => {
        const newWidth = initialWidth - (event.clientX - initialX);
         if (newWidth > 250 && newWidth < 600) {
            setRightSidebarWidth(newWidth);
        }
      };
      
      const upHandler = () => {
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
  };

  useEffect(() => {
    const handleError = (message, source, lineno, colno, error) => {
      console.error("Global Error Caught:", message, error);
      setGlobalError({
        message: error?.message || message,
        details: `Error in ${source} at line ${lineno}:${colno}`
      });
      return true;
    };

    const handleRejection = (event) => {
      console.error("Unhandled Rejection Caught:", event.reason);
      if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
        return;
      }
      setGlobalError({
        message: event.reason?.message || 'An unhandled promise rejection occurred.',
        details: event.reason?.stack || 'No stack trace available.'
      });
      event.preventDefault();
    };

    window.onerror = handleError;
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.onerror = null;
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const removeHighlight = () => {
        if (highlightedElementRef.current) {
            highlightedElementRef.current.classList.remove('dev-mode-highlight');
            highlightedElementRef.current = null;
        }
    };
    
    if (!isDevMode) {
        removeHighlight();
        return;
    }

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-dev-name]');
      if (target && target !== highlightedElementRef.current) {
        removeHighlight();
        target.classList.add('dev-mode-highlight');
        highlightedElementRef.current = target;
      }
    };

    const handleMouseOut = (e) => {
       if (highlightedElementRef.current && !highlightedElementRef.current.contains(e.relatedTarget)) {
         removeHighlight();
       }
    };

    const handleClick = (e) => {
      const target = e.target.closest('[data-dev-name]');
      if (target) {
        // If the click is inside the LeftSidebar, dev mode should ignore it
        // to allow the toolbar buttons to function correctly.
        if (target.closest('[data-dev-name^="LeftSidebar"]')) {
          return;
        }
    
        // Similarly, if a drawing tool is active, dev mode should ignore clicks
        // on the chart area to allow drawing.
        const isChartArea = target.closest('[data-dev-name^="ChartArea"]');
        if (isChartArea && activeTool !== 'crosshair') {
            return;
        }
        
        // Otherwise, this is a dev mode click meant to copy the component name.
        e.preventDefault();
        e.stopPropagation();
        const devName = target.dataset.devName;
        navigator.clipboard.writeText(devName);
        setToastMessage(`${t('toast_copied')}: ${devName}`);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, true);
      removeHighlight();
    };
  }, [isDevMode, activeTool]);


  useEffect(() => {
    const fetchAnnotations = async () => {
        if (!isAiEnabled) {
            setAiAnnotations([]);
            return;
        }
        if (!chartDataForAnalysis || chartDataForAnalysis.priceData.length < 90) {
            setAiAnnotations([]);
            return;
        }
        setIsAnnotationsLoading(true);
        setAnnotationsError('');
        setAiAnnotations([]);
        try {
            const recentData = chartDataForAnalysis.priceData.slice(-90).map(p => ({date: p.time, high: p.high.toFixed(2), low: p.low.toFixed(2)}));
            
            const annotationSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: 'The date of the event in "YYYY-MM-DD" format.' },
                        event: { type: Type.STRING, description: 'A very short description of the event (max 3 words).' },
                        position: { type: Type.STRING, description: 'Position of the annotation: "above" or "below" the price bar.'}
                    },
                    required: ['date', 'event', 'position']
                }
            };
            
            const result = await ai.models.generateContent({
                config: {
                    responseMimeType: "application/json",
                    responseSchema: annotationSchema
                },
            });

            const text = result.text;
            if (!text || text.trim() === '') {
                console.warn("AI returned an empty or undefined response for annotations.");
                throw new Error("AI returned an empty response. It might be due to content safety filters or a temporary issue.");
            }

            let rawAnnotations = [];
            try {
                rawAnnotations = JSON.parse(text);
            } catch (parseError) {
                console.error("Failed to parse AI annotations JSON:", parseError, "Raw text:", text);
                throw new Error("Received malformed data from the AI service. Please try again.");
            }

            const processedAnnotations = rawAnnotations.map((item, index) => {
                const candleData = chartDataForAnalysis.priceData.find(p => p.time === item.date);
                let priceOffset;

                if (candleData) {
                    const padding = (candleData.high - candleData.low) * 0.5; // Add some space
                    if (item.position === 'below') {
                        // Place below the low, calculate offset from close
                        priceOffset = (candleData.low - candleData.close) - padding;
                    } else { // 'above'
                        // Place above the high, calculate offset from close
                        priceOffset = (candleData.high - candleData.close) + padding;
                    }
                } else {
                    // Fallback to a simple offset if candle data is not found
                    priceOffset = item.position === 'below' ? -5 : 5;
                }

                return {
                    id: `ai-${index}`,
                    time: item.date,
                    priceOffset: priceOffset,
                    type: 'ai-insight',
                    label: item.event,
                };
            });

            setAiAnnotations(processedAnnotations);
        } catch (e) {
            console.error("AI Annotation Error:", e);
            if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            }
            setAnnotationsError(e.message || 'Failed to fetch AI annotations.');
        } finally {
            setIsAnnotationsLoading(false);
        }
    };

    if (rightSidebarView === 'Annotations') {
        fetchAnnotations();
    }
  }, [currentStock, chartDataForAnalysis, rightSidebarView, isAiEnabled]);

  const handleToggleReplayMode = () => {
    setIsReplayMode(prev => !prev);
  };

  const handleToggleFullscreen = () => {
      if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          }
      }
  };

  useEffect(() => {
      const handleFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSaveLayout = useCallback((name: string) => {
    if (!name) return;
    try {
        const layout = {
            stock: currentStock,
            chartLayout: chartLayout,
            chartType: chartType,
            timeframe: timeframe,
            indicators: indicators,
            drawings: useUIStore.getState().drawings,
            leftSidebarWidth: leftSidebarWidth,
            rightSidebarWidth: rightSidebarWidth,
            isLeftPanelOpen: isLeftPanelOpen,
            rightSidebarView: rightSidebarView,
        };
        localStorage.setItem(`vs_layout_${name}`, JSON.stringify(layout));
        setSavedLayouts(prev => [...new Set([...prev, name])]);
        setActiveLayoutName(name);
        window.toast?.(t('toast_layout_saved', { name }));
    } catch (e) {
        console.error("Failed to save layout:", e);
        window.toast?.(t('toast_layout_save_error'));
    }
  }, [currentStock, chartLayout, chartType, timeframe, indicators, leftSidebarWidth, rightSidebarWidth, isLeftPanelOpen, rightSidebarView]);

  const handleLoadLayout = useCallback((name: string) => {
    if (!name) return;
    try {
        const savedLayout = localStorage.getItem(`vs_layout_${name}`);
        if (savedLayout && savedLayout !== 'null' && savedLayout !== 'undefined') {
            const layout = JSON.parse(savedLayout);
            setCurrentStock(layout.stock || 'BTCUSD');
            setChartLayout(layout.chartLayout || 'grid');
            setChartType(layout.chartType || 'Candlestick');
            setTimeframe(layout.timeframe || '1D');
            setIndicators(layout.indicators || []);
            useUIStore.getState().setDrawingsFromLayout(layout.drawings || []);
            setLeftSidebarWidth(layout.leftSidebarWidth || 48);
            setRightSidebarWidth(layout.rightSidebarWidth || 370);
            const { toggle } = useUIStore.getState();
            if (layout.isLeftPanelOpen !== isLeftPanelOpen) {
              toggle('leftPanelOpen');
            }
            setRightSidebarView(layout.rightSidebarView || 'AIIndicatorSuggestions');
            setActiveLayoutName(name);
            window.toast?.(t('toast_layout_loaded', { name }));
        }
    } catch (e) {
        console.error("Failed to load layout:", e);
        window.toast?.(t('toast_layout_load_error', { name }));
    }
  }, [isLeftPanelOpen, setRightSidebarView]);

  const handleDeleteLayout = useCallback((name: string) => {
    localStorage.removeItem(`vs_layout_${name}`);
    setSavedLayouts(prev => prev.filter(l => l !== name));
    if (name === activeLayoutName) {
        setActiveLayoutName(null);
        handleResetLayout(); // Optionally reset to default when active is deleted
    }
  }, [activeLayoutName]);

  const handleResetLayout = useCallback(() => {
      setCurrentStock('BTCUSD');
      setChartLayout('grid');
      setChartType('Candlestick');
      setTimeframe('1D');
      setIndicators([]);
      useUIStore.getState().setDrawingsFromLayout([]);
      setLeftSidebarWidth(48);
      setRightSidebarWidth(370);
      if(isLeftPanelOpen) {
        useUIStore.getState().toggle('leftPanelOpen');
      }
      setRightSidebarView('AIIndicatorSuggestions');
      setIsReplayMode(false);
      useUIStore.getState().setActiveTool('crosshair');
      setActiveLayoutName(null);
      window.toast?.(t('toast_layout_reset'));
  }, [isLeftPanelOpen, setRightSidebarView]);
  
  const handleClearDrawings = () => {
      if (areDrawingsLocked) {
          window.toast?.(t('toast_drawings_locked'));
          return;
      }
      setIsClearConfirmVisible(true);
  };
  
  const confirmClearDrawings = () => {
      useUIStore.getState().setDrawings([]);
      setIsClearConfirmVisible(false);
      window.toast?.(t('toast_drawings_cleared'));
  };

  const Toast = () => (
    toastMessage && (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#2A3040] border border-[#383f52] text-white px-4 py-2 rounded-md shadow-lg z-[9999] text-sm flex items-center gap-2 animate-fade-in-up">
        <CheckCircle size={16} className="text-green-400" />
        <span>{toastMessage}</span>
      </div>
    )
  );
  
  if (isZenMode) {
    return (
      <div className="bg-[#0D1017] h-screen w-screen flex flex-col font-sans overflow-hidden" data-dev-name="AppRoot.ZenMode">
        <button
          onClick={handleToggleZenMode}
          className="zen-mode-exit-button"
          title={t('zen_mode_exit_tooltip')}
          data-dev-name="ZenMode.ExitButton"
        >
          <Minimize size={18} />
          <span className="ml-2 hidden sm:inline">{t('zen_mode_exit')}</span>
        </button>
        <main className="flex-1 flex flex-col overflow-hidden bg-[#12161D]">
          <ChartGrid
            layout={'single'} // Force single layout in Zen mode
            chartType={chartType}
            stockSymbol={currentStock}
            timeframe={timeframe}
            timeRange={timeRange}
            aiAnnotations={aiAnnotations}
            indicators={indicators}
            isAnnotationsLoading={isAnnotationsLoading}
            isReplayMode={isReplayMode}
            highlightedAnnotationId={highlightedAnnotationId}
            isFullscreen={false}
            alerts={alerts}
            chartPriceData={chartDataForAnalysis.priceData}
            onTimeRangeChange={setTimeRange}
          />
        </main>
      </div>
    );
  }
  
  if (isFullscreen) {
    return (
        <div className="bg-[#0D1017] h-screen w-screen flex flex-col font-sans overflow-hidden">
            <ChartArea 
                stockSymbol={currentStock} 
                chartType={chartType}
                timeframe={timeframe}
                timeRange={timeRange}
                aiAnnotations={aiAnnotations}
                indicators={indicators}
                isAnnotationsLoading={isAnnotationsLoading}
                isReplayMode={isReplayMode}
                highlightedAnnotationId={highlightedAnnotationId}
                isFullscreen={isFullscreen}
                isGridMode={false}
                gridChartName=""
                alerts={alerts}
                chartPriceData={chartDataForAnalysis.priceData}
                onTimeRangeChange={setTimeRange}
            />
        </div>
    );
  }

  return (
    <div className="bg-[#0D1017] text-[#E1E3E6] h-screen w-screen flex flex-col font-sans overflow-hidden" data-dev-name="AppRoot">
      <GlobalErrorModal error={globalError} onClose={() => setGlobalError(null)} />
      <QuotaExceededModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onDisable={handleDisableAi}
      />
      <Toast />
      <SymbolSearchModal />
      <SettingsModal/>
      <ConfirmationDialog
        isOpen={isClearConfirmVisible}
        onConfirm={confirmClearDrawings}
        onCancel={() => setIsClearConfirmVisible(false)}
        title={t('clear_drawings_title')}
      >
        <p>{t('clear_drawings_confirm')}</p>
      </ConfirmationDialog>

      <Header 
        currentStock={currentStock}
        chartLayout={chartLayout}
        onChartLayoutChange={setChartLayout}
        chartType={chartType}
        onChartTypeChange={setChartType}
        onTimeframeChange={handleTimeframeChange}
        isReplayMode={isReplayMode}
        onToggleReplayMode={handleToggleReplayMode}
        isDevMode={isDevMode}
        onToggleDevMode={() => setIsDevMode(prev => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        onSaveLayout={handleSaveLayout}
        onLoadLayout={handleLoadLayout}
        onDeleteLayout={handleDeleteLayout}
        onResetLayout={handleResetLayout}
        onToggleZenMode={handleToggleZenMode}
        activeLayoutName={activeLayoutName}
        savedLayouts={savedLayouts}
        onUndo={undoDrawing}
        onRedo={redoDrawing}
      />
      <div className="flex flex-1 border-t border-t-[#2A3040] overflow-hidden" data-dev-name="MainContent">
          {(isLeftPanelOpen || rightSidebarView) && (
              <div 
                  className="fixed inset-0 bg-black/60 z-30 md:hidden"
                  onClick={() => {
                      if (isLeftPanelOpen) toggle('leftPanelOpen');
                      if (rightSidebarView) setRightSidebarView(null);
                  }}
                  aria-hidden="true"
              />
          )}

        <div style={{ width: isLeftPanelOpen ? `${leftSidebarWidth}px` : '48px' }} className={`
            fixed top-[56px] bottom-0 left-0 w-[300px] md:w-auto
            h-full md:h-auto
            z-40 bg-[#0D1017]
            md:relative md:top-auto md:bottom-auto
            transform transition-transform md:transition-width duration-300 ease-in-out
            ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <LeftSidebar 
                onStockChange={handleStockChange} 
                currentStock={currentStock} 
                onClearDrawings={handleClearDrawings}
            />
        </div>
        <Resizer onMouseDown={handleLeftResize} className="hidden md:flex" />

        <div className="flex-1 flex flex-col overflow-hidden" ref={mainContentRef}>
            <Toolbar/>
            <main className="flex-1 flex flex-col overflow-hidden bg-[#12161D]" data-dev-name="ChartContainer">
              <div className="flex-1 relative flex flex-col">
                <ChartGrid 
                  layout={chartLayout}
                  chartType={chartType}
                  stockSymbol={currentStock}
                  timeframe={timeframe}
                  timeRange={timeRange}
                  aiAnnotations={aiAnnotations}
                  indicators={indicators}
                  isAnnotationsLoading={isAnnotationsLoading}
                  isReplayMode={isReplayMode}
                  highlightedAnnotationId={highlightedAnnotationId}
                  isFullscreen={isFullscreen}
                  alerts={alerts}
                  chartPriceData={chartDataForAnalysis.priceData}
                  onTimeRangeChange={setTimeRange}
                />
              </div>
              <BottomDock 
                height={bottomDockHeight}
                onResizeStart={handleDockResizeStart}
                onToggle={handleToggleDock}
                onMaximize={handleMaximizeDock}
                initialTab={bottomDockInitialTab}
                stockSymbol={currentStock}
                chartPriceData={chartDataForAnalysis}
                onAddPineIndicator={handleAddPineIndicator}
              />
            </main>
        </div>
        
        {rightSidebarView && <Resizer onMouseDown={handleRightResize} className="hidden md:flex"/>}
        <div style={{ width: rightSidebarView ? `${rightSidebarWidth}px` : '0px' }} className={`
             flex-shrink-0 overflow-hidden bg-[#12161D]
             transition-all duration-300 ease-in-out
             fixed top-[56px] bottom-0 right-0 h-full z-40
             transform md:transform-none
             ${rightSidebarView ? 'translate-x-0' : 'translate-x-full'}
             md:relative md:top-auto md:bottom-auto md:h-auto
        `}>
            <RightSidebar 
                stockSymbol={currentStock}
                chartPriceData={chartDataForAnalysis}
                aiAnnotations={aiAnnotations}
                isAnnotationsLoading={isAnnotationsLoading}
                annotationsError={annotationsError}
                onAnnotationHover={setHighlightedAnnotationId}
                indicators={indicators}
                setIndicators={setIndicators}
            />
        </div>
      </div>

      <RightToolbar/>
      <BottomBar timeframe={timeframe} onTimeframeChange={handleTimeframeChange} onTimeRangeChange={setTimeRange}/>
      <style>{`
          @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
              animation: fade-in-up 0.3s ease-out forwards;
          }
          .transition-width {
            transition-property: width;
          }
      `}</style>
    </div>
  );
}