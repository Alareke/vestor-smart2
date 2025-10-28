/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
    Crosshair, TrendingUp, GitFork, MessageSquare, Type, Smile, Ruler, ZoomIn, Magnet, Pencil, Lock, Trash2, X, Plus, Search, PanelLeft,
    ArrowRight, MoveUpRight, Minus, SeparatorVertical, Equal, List, Shapes, Sparkles, Star, GitBranch, MoveHorizontal, RectangleHorizontal,
    Circle as EllipseIcon, Triangle, GitCommitVertical, Hexagon, Heart, Diamond, Layers,
} from 'lucide-react';
import { useUIStore, useSettingsStore } from './ui.ts';
import * as WL from './watchlists.js';

const Icon = ({ icon: I, active, tooltip, onClick, 'data-dev-name': dataDevName }) => {
    return (
        <button onClick={onClick} className={`p-2.5 rounded-md relative group ${active ? 'bg-[#3E8BF3] text-white' : 'text-[#8A93A2] hover:bg-[#1A1F2A] hover:text-white'}`} data-dev-name={dataDevName}>
            <I size={18} />
            {tooltip && <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50">{tooltip}</span>}
        </button>
    )
}

const Sparkline = ({ data, isUp }) => {
    if (!data || data.length < 2) return <div className="w-16 h-8"></div>;

    const width = 64;
    const height = 16;
    const yMax = Math.max(...data);
    const yMin = Math.min(...data);
    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - yMin) / yRange) * height;
        return `${x},${y}`;
    }).join(' ');
    
    const color = isUp ? '#22C55E' : '#EF4444';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="sparkline-svg" preserveAspectRatio="none">
            <polyline
                points={points}
                className="sparkline-path"
                stroke={color}
            />
        </svg>
    )
}

const Watchlist = ({ onStockChange, currentStock, closePanel }) => {
    const [watchlists, setWatchlists] = useState([]);
    const [activeList, setActiveList] = useState('');
    const [stocks, setStocks] = useState([]); // This will hold the live data
    const [searchQuery, setSearchQuery] = useState('');
    const [newSymbol, setNewSymbol] = useState('');
    const [allSymbolsData, setAllSymbolsData] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    // Fetches catalog and initializes watchlist names
    useEffect(() => {
        const init = async () => {
            try {
                await WL.ensureDefault();
                const names = await WL.listNames();
                setWatchlists(names);
                if (names.length > 0) {
                    const lastActive = localStorage.getItem('wl:active') || names[0];
                    setActiveList(names.includes(lastActive) ? lastActive : names[0]);
                }
            } catch (error) {
                console.error("Failed to initialize watchlists:", error);
                window.errorToast?.(`Failed to load watchlists: ${error.message}`);
            }
        };

        fetch('./symbols_catalog.json')
          .then(res => res.json())
          .then(setAllSymbolsData)
          .catch(err => {
              console.error("Failed to load symbols catalog", err)
              window.errorToast?.(`Could not load symbols catalog: ${err.message}`);
          });
        
        init();
    }, []);

    const initializeStocks = (stockListData) => {
        return stockListData.map(s => {
            const openPrice = s.price ? parseFloat(s.price) : (Math.random() * 500 + 50);
            return {
               ...s,
               price: openPrice.toFixed(2),
               change: '0.00%',
               isUp: true,
               history: s.history || Array.from({length: 20}, () => openPrice * (1 + (Math.random() - 0.5) * 0.05)),
               openPrice: openPrice, // Store the session's opening price
            };
        });
    };

    // Loads and initializes stock data when the active list changes
    useEffect(() => {
        let isMounted = true;
        const loadList = async () => {
            if (activeList) {
                try {
                    const listData = await WL.getList(activeList);
                    if (isMounted) {
                        setStocks(initializeStocks(listData));
                    }
                    localStorage.setItem('wl:active', activeList);
                } catch (error) {
                    console.error(`Failed to load watchlist "${activeList}":`, error);
                    window.errorToast?.(`Failed to load watchlist "${activeList}": ${error.message}`);
                    if (isMounted) setStocks([]);
                }
            } else if (isMounted) {
                setStocks([]);
            }
        };
        loadList();
        return () => { isMounted = false; };
    }, [activeList]);
    
    // Runs the live data simulation interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            setStocks(currentStocks => {
                if (!currentStocks || currentStocks.length === 0) return [];
                return currentStocks.map(stock => {
                    const currentPrice = parseFloat(stock.price);
                    const volatility = 0.005; // Max 0.5% change per tick
                    const trend = 0.0001; // Slight market drift
                    const changePercent = 2 * volatility * Math.random() - volatility + trend;
                    const newPrice = Math.max(0.01, currentPrice * (1 + changePercent));

                    const totalChangePercent = ((newPrice - stock.openPrice) / stock.openPrice) * 100;
                    
                    const newHistory = [...(stock.history || []).slice(1), newPrice];
                    
                    return {
                        ...stock,
                        price: newPrice.toFixed(2),
                        change: `${totalChangePercent.toFixed(2)}%`,
                        isUp: newPrice >= stock.openPrice,
                        history: newHistory,
                    };
                });
            });
        }, 1500); // Update every 1.5 seconds

        return () => clearInterval(intervalId);
    }, []); // This effect should run only once to set up the interval for the component's lifetime

    const addStock = (e) => {
        e.preventDefault();
        const symbolToAdd = newSymbol.toUpperCase().trim();
        if (!symbolToAdd || !activeList) return;

        const stockInfo = allSymbolsData.find(s => s.symbol === symbolToAdd);
        if (stockInfo) {
            if (stocks.some(s => s.symbol === symbolToAdd)) {
                 window.toast?.(`Symbol ${symbolToAdd} is already in the list.`);
                 return;
            }
            
            const newStock = {
                symbol: stockInfo.symbol,
                name: stockInfo.name,
                category: stockInfo.category,
            };

            const [initializedNewStock] = initializeStocks([newStock]);

            // Optimistic UI update
            setStocks(currentStocks => [initializedNewStock, ...currentStocks]);
            setNewSymbol('');

            // Persist in the background
            WL.addSymbol(activeList, newStock).catch(error => {
                console.error("Failed to save stock to watchlist:", error);
                window.toast?.(`Error saving ${symbolToAdd}.`);
                // Revert UI change on failure
                setStocks(currentStocks => currentStocks.filter(s => s.symbol !== symbolToAdd));
            });

        } else {
            window.toast?.(`Symbol ${symbolToAdd} not found in catalog.`);
        }
    };

    const removeStock = async (symbolToRemove) => {
        // Optimistic removal from UI
        const originalStocks = stocks;
        setStocks(currentStocks => currentStocks.filter(s => s.symbol !== symbolToRemove));

        // Persist in background
        try {
            await WL.removeSymbol(activeList, symbolToRemove);
        } catch (error) {
            console.error("Failed to remove stock from watchlist:", error);
            window.toast?.(`Error removing ${symbolToRemove}.`);
            // Revert if persistence fails
            setStocks(originalStocks);
        }
    };
    
    const filteredStocks = stocks.filter(stock => {
        const searchMatch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (stock.name && stock.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const categoryMatch = activeFilter === 'all' || stock.category === activeFilter;
        return searchMatch && categoryMatch;
    });

    const filterCategories = {
        'all': 'الكل',
        'stocks': 'الأسهم',
        'forex': 'فوركس',
        'crypto': 'كريبتو',
        'futures': 'العقود الآجلة',
        'indices': 'المؤشرات'
    };


    return (
        <div className="w-full bg-[#0D1017] flex flex-col text-sm h-full" data-dev-name="LeftSidebar.WatchlistPanel">
            <div className="flex items-center justify-between p-3 border-b border-b-[#2A3040] flex-shrink-0">
                <h2 className="font-bold text-white">قائمة المراقبة</h2>
                <button onClick={closePanel} className="text-[#8A93A2] hover:text-white" data-dev-name="LeftSidebar.Watchlist.CloseButton">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-2 border-b border-b-[#2A3040]">
                <select 
                    value={activeList} 
                    onChange={e => setActiveList(e.target.value)}
                    className="w-full bg-[#1A1F2A] border border-[#2A3040] rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3E8BF3]"
                    aria-label="Select Watchlist"
                >
                    {watchlists.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2 flex items-center gap-1 border-b border-b-[#2A3040]" data-dev-name="LeftSidebar.Watchlist.Search">
                    <Search size={16} className="text-[#8A93A2] ml-1" />
                    <input 
                        type="text" 
                        placeholder="بحث..." 
                        className="bg-transparent text-white w-full focus:outline-none text-sm input-inset"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Search Watchlist"
                    />
                </div>
                 <div className="p-2 flex flex-wrap items-center gap-2 text-xs border-b border-b-[#2A3040]">
                    {Object.entries(filterCategories).map(([key, label]) => (
                        <button 
                            key={key} 
                            onClick={() => setActiveFilter(key)}
                            className={`px-2 py-1 rounded-md ${activeFilter === key ? 'bg-[#3E8BF3] text-white' : 'bg-[#1A1F2A] text-[#8A93A2] hover:bg-[#2A3040]/70'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left text-[#8A93A2] border-b border-b-[#2A3040]">
                            <th className="font-normal p-2">الرمز</th>
                            <th className="font-normal p-2">الاتجاه</th>
                            <th className="font-normal p-2 text-right">التغيير %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map(stock => (
                            <tr key={stock.symbol} onClick={() => onStockChange(stock.symbol)} className={`cursor-pointer hover:bg-[#1A1F2A] group border-b border-b-[#2A3040]/50 ${currentStock === stock.symbol ? 'bg-[#2A3040]' : ''}`} data-dev-name={`LeftSidebar.Watchlist.Item.${stock.symbol}`}>
                                <td className="p-2 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-white">{stock.symbol}</p>
                                        <p className="text-[#8A93A2] text-[10px]">{stock.price}</p>
                                    </div>
                                     <button onClick={(e) => { e.stopPropagation(); removeStock(stock.symbol); }} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100" data-dev-name={`LeftSidebar.Watchlist.Remove.${stock.symbol}`} aria-label={`Remove ${stock.symbol}`}>
                                        <X size={12}/>
                                     </button>
                                </td>
                                <td>
                                    <Sparkline data={stock.history} isUp={stock.isUp}/>
                                </td>
                                <td className={`p-2 font-mono text-right ${stock.isUp ? 'text-green-400' : 'text-red-400'}`}>{stock.change}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <form onSubmit={addStock} className="p-2 border-t border-t-[#2A3040] flex items-center gap-2 flex-shrink-0" data-dev-name="LeftSidebar.Watchlist.AddSymbolForm">
                <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder="إضافة رمز"
                    className="flex-1 bg-[#1A1F2A] rounded-md p-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#3E8BF3] border border-[#2A3040] input-inset"
                    data-dev-name="LeftSidebar.Watchlist.AddSymbolInput"
                    aria-label="Add Symbol to Watchlist"
                />
                <button type="submit" className="p-2 rounded-md bg-[#3E8BF3] hover:bg-[#1E66D6] text-white" data-dev-name="LeftSidebar.Watchlist.AddSymbolButton" onClick={(e)=> (window.toast && window.toast('تم التنفيذ'), window.dispatchEvent(new CustomEvent('ui:action', { detail: { action: 'auto-button' } })))} aria-label="Add Symbol">
                    <Plus size={16} />
                </button>
            </form>
        </div>
    );
};

const ObjectTreePanel = ({ closePanel }) => {
    const { drawings, setDrawings } = useUIStore();

    const handleDelete = (id) => {
        setDrawings(drawings.filter(d => d.id !== id));
    };

    return (
        <div className="w-full bg-[#0D1017] flex flex-col text-sm h-full" data-dev-name="LeftSidebar.ObjectTreePanel">
            <div className="flex items-center justify-between p-3 border-b border-b-[#2A3040] flex-shrink-0">
                <h2 className="font-bold text-white">شجرة الكائنات</h2>
                <button onClick={closePanel} className="text-[#8A93A2] hover:text-white" data-dev-name="LeftSidebar.ObjectTree.CloseButton">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {drawings.length === 0 ? (
                    <div className="text-center text-xs text-[#8A93A2] py-8">لا توجد رسومات على المخطط.</div>
                ) : (
                    <ul className="space-y-2">
                        {drawings.map(d => (
                            <li key={d.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-[#1A1F2A] group">
                                <span className="capitalize text-white">{d.type.replace('-', ' ')}</span>
                                <button onClick={() => handleDelete(d.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100" data-dev-name={`LeftSidebar.ObjectTree.Delete.${d.id}`}>
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const ToolPopup = ({ anchorEl, onToolSelect, closePopup, activeTool, tools, title, dataDevName }) => {
    const popupRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.right + 8,
            });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                closePopup();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closePopup, anchorEl]);

    return ReactDOM.createPortal(
        <div
            ref={popupRef}
            className="fixed bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 p-2 w-52"
            style={{ top: position.top, left: position.left }}
            data-dev-name={dataDevName}
        >
            <h3 className="text-xs text-[#8A93A2] px-2 pb-2 border-b border-b-[#2A3040] mb-2 font-semibold">{title}</h3>
            <ul>
                {tools.map(tool => (
                    <li key={tool.id}>
                        <button
                            onClick={() => onToolSelect(tool.id)}
                            className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md ${activeTool === tool.id ? 'bg-[#3E8BF3] text-white' : 'text-[#E1E3E6] hover:bg-[#2A3040]'}`}
                            data-dev-name={`${dataDevName}.${tool.id}`}
                        >
                            <tool.icon size={16} />
                            <span>{tool.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );
};

const IconPickerPopup = ({ anchorEl, onIconSelect, closePopup }) => {
    const popupRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const icons = ['😀', '😂', '😍', '🤔', '😢', '😠', '👍', '👎', '📈', '📉', '💰', '🚀', '⭐', '❗', '❓', '💀'];

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.right + 8,
            });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                closePopup();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closePopup, anchorEl]);

    return ReactDOM.createPortal(
        <div
            ref={popupRef}
            className="fixed bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 p-2 w-52"
            style={{ top: position.top, left: position.left }}
            data-dev-name="LeftSidebar.IconPickerPopup"
        >
            <h3 className="text-xs text-[#8A93A2] px-2 pb-2 border-b border-b-[#2A3040] mb-2 font-semibold">Annotation Icons</h3>
            <div className="grid grid-cols-4 gap-2">
                {icons.map(icon => (
                    <button
                        key={icon}
                        onClick={() => onIconSelect(icon)}
                        className="text-2xl p-2 rounded-md hover:bg-[#2A3040] transition-colors"
                        title={`Select ${icon}`}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};


const LeftSidebar = ({ onStockChange, currentStock, onClearDrawings }) => {
    const { 
        rightbar, toggle, activeTool, setActiveTool, setSelectedIcon,
        isMagnetModeOn, toggleMagnetMode, isDrawingModeOn, toggleDrawingMode, 
        areDrawingsLocked, toggleLockDrawings 
    } = useUIStore();
    const { settings } = useSettingsStore();
    const isAiEnabled = settings.ai?.enabled ?? false;
    
    const isPanelOpen = rightbar.leftPanelOpen;
    const setPanelOpen = (isOpen) => {
        if (isOpen !== isPanelOpen) {
            toggle('leftPanelOpen');
        }
    }

    const tools = [
        { id: 'crosshair', icon: Crosshair, tooltip: 'تقاطع' },
        { id: 'trendline', icon: TrendingUp, tooltip: 'أدوات خط الاتجاه' },
        { id: 'shapes', icon: Shapes, tooltip: 'Geometric Shapes' },
        { id: 'text-note', icon: Type, tooltip: 'ملاحظة نصية' },
        { id: 'draw', icon: Pencil, tooltip: 'رسم' },
        { id: 'icon', icon: Smile, tooltip: 'أيقونة' }
    ];

    const bottomTools = [
        { id: 'measure', icon: Ruler, tooltip: 'قياس' },
        { id: 'zoom', icon: ZoomIn, tooltip: 'تكبير' },
        { id: 'magnet', icon: Magnet, tooltip: 'وضع المغناطيس' },
        { id: 'drawing-mode', icon: Pencil, tooltip: 'وضع الرسم' },
        { id: 'lock', icon: Lock, tooltip: 'قفل كل الرسومات' },
        { id: 'clear', icon: Trash2, tooltip: 'إزالة الرسومات' },
    ];

    const [activePopup, setActivePopup] = useState({ name: null, anchorEl: null });
    const [activePanelTab, setActivePanelTab] = useState('watchlist');
    
    const handlePopupToggle = (name, event) => {
        setActivePopup(prev => ({
            name: prev.name === name ? null : name,
            anchorEl: event.currentTarget
        }));
    };

    const handleToolSelection = (toolId) => {
        setActiveTool(toolId);
        setActivePopup({ name: null, anchorEl: null });
    };
    
    const handleIconSelect = (icon) => {
        setActiveTool('icon');
        setSelectedIcon(icon);
        setActivePopup({ name: null, anchorEl: null });
        window.toast?.('Click on the chart to place the icon.');
    };
    
    useEffect(() => {
        if(isPanelOpen) {
            // default to watchlist when opening
            setActivePanelTab('watchlist');
        }
    }, [isPanelOpen]);

    const lineTools = [
        { id: 'trendline', icon: TrendingUp, label: 'خط الاتجاه' },
        { id: 'arrow', icon: ArrowRight, label: 'سهم' },
        { id: 'ray', icon: MoveUpRight, label: 'شعاع' },
        { id: 'extended-line', icon: GitBranch, label: 'خط ممتد' },
        { id: 'horizontal-line', icon: Minus, label: 'خط أفقي' },
        { id: 'horizontal-ray', icon: MoveHorizontal, label: 'شعاع أفقي' },
        { id: 'vertical-line', icon: SeparatorVertical, label: 'خط عمودي' },
        { id: 'parallel-channel', icon: Equal, label: 'قناة متوازية' },
        { id: 'pitchfork', icon: GitFork, label: 'مذراة أندرو' },
        { id: 'fib-retracement', icon: GitFork, label: 'تصحيح فيبوناتشي' },
        { id: 'gann-fan', icon: GitCommitVertical, label: 'Gann Fan' },
        { id: 'fib-channel', icon: Layers, label: 'قناة فيبوناتشي' },
    ];
    if (isAiEnabled) {
      lineTools.push(
        { id: 'ai-trendline', icon: Sparkles, label: 'AI Trendline' },
        { id: 'ai-fib-retracement', icon: Star, label: 'AI Fib Retracement' },
      );
    }

     const shapeTools = [
        { id: 'rect', icon: RectangleHorizontal, label: 'Rectangle' },
        { id: 'ellipse', icon: EllipseIcon, label: 'Ellipse' },
        { id: 'triangle', icon: Triangle, label: 'Triangle' },
        { id: 'star', icon: Star, label: 'Star' },
        { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
        { id: 'heart', icon: Heart, label: 'Heart' },
        { id: 'diamond', icon: Diamond, label: 'Diamond' },
    ];

    const trendlineToolsIds = lineTools.map(t => t.id);
    const shapeToolsIds = shapeTools.map(t => t.id);
    
    const panelContent = () => {
        if (!isPanelOpen) return null;
        
        return (
            <div className="flex-1 flex flex-col border-r border-r-[#2A3040]">
                <div className="flex-shrink-0 border-b border-b-[#2A3040] flex">
                    <button onClick={() => setActivePanelTab('watchlist')} className={`flex-1 p-2 text-xs flex items-center justify-center gap-2 ${activePanelTab === 'watchlist' ? 'bg-[#1A1F2A] text-white' : 'text-[#8A93A2]'}`}><List size={14}/> قائمة المراقبة</button>
                    <button onClick={() => setActivePanelTab('objects')} className={`flex-1 p-2 text-xs flex items-center justify-center gap-2 ${activePanelTab === 'objects' ? 'bg-[#1A1F2A] text-white' : 'text-[#8A93A2]'}`}><Shapes size={14}/> الكائنات</button>
                </div>
                <div className="flex-1 overflow-hidden">
                    {activePanelTab === 'watchlist' && <Watchlist onStockChange={onStockChange} currentStock={currentStock} closePanel={() => setPanelOpen(false)} />}
                    {activePanelTab === 'objects' && <ObjectTreePanel closePanel={() => setPanelOpen(false)} />}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full" data-dev-name="LeftSidebar">
            <div className="w-[48px] bg-[#12161D] border-r border-r-[#2A3040] flex-shrink-0 flex flex-col items-center p-1.5 gap-1" data-dev-name="LeftSidebar.Toolbar">
                <Icon icon={PanelLeft} tooltip="تبديل قائمة المراقبة" onClick={() => toggle('leftPanelOpen')} active={isPanelOpen} data-dev-name="LeftSidebar.Toolbar.ToggleWatchlist"/>
                <div className="my-1 h-px w-full bg-[#2A3040]"></div>
                {tools.map((tool) => {
                    if (tool.id === 'trendline') {
                        return <Icon key={tool.id} icon={tool.icon} active={trendlineToolsIds.includes(activeTool) || activePopup.name === 'trendline'} tooltip={tool.tooltip} onClick={(e) => handlePopupToggle('trendline', e)} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />
                    }
                     if (tool.id === 'shapes') {
                        return <Icon key={tool.id} icon={tool.icon} active={shapeToolsIds.includes(activeTool) || activePopup.name === 'shapes'} tooltip={tool.tooltip} onClick={(e) => handlePopupToggle('shapes', e)} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />
                    }
                    if (tool.id === 'icon') {
                        return <Icon key={tool.id} icon={tool.icon} active={activeTool === 'icon' || activePopup.name === 'icon'} tooltip={tool.tooltip} onClick={(e) => handlePopupToggle('icon', e)} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />
                    }
                    return <Icon key={tool.id} icon={tool.icon} active={activeTool === tool.id} tooltip={tool.tooltip} onClick={() => setActiveTool(tool.id)} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />
                })}
                <div className="my-1 h-px w-full bg-[#2A3040]"></div>
                {bottomTools.map((tool) => {
                    if (tool.id === 'magnet') {
                        return <Icon key={tool.id} icon={tool.icon} active={isMagnetModeOn} tooltip={tool.tooltip} onClick={toggleMagnetMode} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />;
                    }
                    if (tool.id === 'drawing-mode') {
                        return <Icon key={tool.id} icon={tool.icon} active={isDrawingModeOn} tooltip={tool.tooltip} onClick={toggleDrawingMode} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />;
                    }
                    if (tool.id === 'lock') {
                        return <Icon key={tool.id} icon={tool.icon} active={areDrawingsLocked} tooltip={tool.tooltip} onClick={toggleLockDrawings} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />;
                    }
                    if (tool.id === 'clear') {
                        return <Icon key={tool.id} icon={tool.icon} tooltip={tool.tooltip} onClick={onClearDrawings} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />;
                    }
                    return <Icon key={tool.id} icon={tool.icon} active={activeTool === tool.id} tooltip={tool.tooltip} onClick={() => setActiveTool(tool.id)} data-dev-name={`LeftSidebar.Toolbar.Tool.${tool.id}`} />;
                })}
                <div className="flex-1"></div>
            </div>
            {panelContent()}
            {activePopup.name === 'trendline' && (
                <ToolPopup
                    anchorEl={activePopup.anchorEl}
                    onToolSelect={handleToolSelection}
                    closePopup={() => setActivePopup({ name: null, anchorEl: null })}
                    activeTool={activeTool}
                    tools={lineTools}
                    title="أدوات خط الاتجاه"
                    dataDevName="LeftSidebar.TrendlinePopup"
                />
            )}
            {activePopup.name === 'shapes' && (
                <ToolPopup
                    anchorEl={activePopup.anchorEl}
                    onToolSelect={handleToolSelection}
                    closePopup={() => setActivePopup({ name: null, anchorEl: null })}
                    activeTool={activeTool}
                    tools={shapeTools}
                    title="Geometric Shapes"
                    dataDevName="LeftSidebar.ShapePopup"
                />
            )}
            {activePopup.name === 'icon' && (
                <IconPickerPopup
                    anchorEl={activePopup.anchorEl}
                    onIconSelect={handleIconSelect}
                    closePopup={() => setActivePopup({ name: null, anchorEl: null })}
                />
            )}
        </div>
    );
};

export default LeftSidebar;