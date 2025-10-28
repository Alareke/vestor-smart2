/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Maximize2, X, Activity, BarChart2, Code, BrainCircuit, Sparkles, Link, Plus, Brush } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useTradingStore } from './trading.ts';
import BrokeragePanel from './BrokeragePanel.jsx';
import ImageSketcher from './ImageSketcher.jsx';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VsLogo = () => (
    <div className="flex items-center gap-2" data-dev-name="BottomPanel.Logo">
        <span className="text-sm font-bold tracking-wider text-white">VESTOR SMART</span>
    </div>
);

const TabButton = ({ icon: Icon, label, isActive, onClick, onOpen }) => (
    <button
        onClick={isActive ? onClick : onOpen}
        className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
            isActive ? 'border-[#3E8BF3] text-white' : 'border-transparent text-[#8A93A2] hover:text-white'
        }`}
    >
        <Icon size={16} />
        <span>{label}</span>
    </button>
);

// FIX: Accept `onAddPineIndicator` prop to allow adding generated script to the chart.
const PineEditorPanel = ({ onAddPineIndicator }) => {
    const [code, setCode] = useState('// Your Pine Script here\n// Or use the AI generator button!');
    const [isLoading, setIsLoading] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);

    const handleGenerate = async () => {
        if (!promptText || promptText.trim() === '') return;

        setIsLoading(true);
        setOptimizationResult(null);
        try {
            const result = await ai.models.generateContent({
                contents: `Generate Pine Script v5 code for the following trading strategy. The script should be a 'strategy' and include a plot for any indicators used. Do not include any explanation, just the raw Pine Script code block. Strategy: "${promptText}"`,
            });
            
            let generatedCode = result.text.trim();
            const codeBlockRegex = /```(?:pinescript|pine)?\s*([\s\S]*?)```/;
            const match = generatedCode.match(codeBlockRegex);
            
            if (match && match[1]) {
                generatedCode = match[1];
            } else if (generatedCode.startsWith('```')) {
                generatedCode = generatedCode.substring(3, generatedCode.length - 3);
            }
            
            setCode(generatedCode.trim());
            window.toast?.("Pine Script generated successfully!");
        } catch (e) {
            console.error(e);
            window.errorToast?.("Failed to generate Pine Script.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOptimize = async () => {
        if (!code || code.trim() === '') {
            window.errorToast?.("Editor is empty. Nothing to optimize.");
            return;
        }
        setIsOptimizing(true);
        setOptimizationResult(null);
        try {
            const optimizationSchema = {
                type: Type.OBJECT,
                properties: {
                    improved_code: { type: Type.STRING, description: "The full, improved Pine Script v5 code." },
                    explanation: { type: Type.STRING, description: "A brief, markdown-formatted explanation of the improvements made." }
                },
                required: ['improved_code', 'explanation']
            };
            const result = await ai.models.generateContent({
                contents: `Analyze this Pine Script v5 code and suggest improvements to make the strategy more robust or profitable. For example, add a stop-loss, a take-profit, a volume filter, or different indicator parameters. Return the improved code and a brief explanation. Original code:\n\n${code}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: optimizationSchema,
                }
            });
            const data = JSON.parse(result.text);
            setCode(data.improved_code);
            setOptimizationResult(data.explanation);
            window.toast?.("Strategy optimized with AI!");

        } catch (e) {
            console.error(e);
            window.errorToast?.("Failed to optimize Pine Script.");
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1E222D]">
            <div className="flex-shrink-0 p-1 flex items-center justify-end gap-2 bg-[#12161D] border-b border-b-[#2A3040]">
                {/* FIX: Add button to apply the Pine Script code to the chart. */}
                <button onClick={() => onAddPineIndicator(code)} className="flex items-center gap-2 px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                    <Plus size={14}/> Add to Chart
                </button>
                <button onClick={handleGenerate} disabled={isLoading || isOptimizing} className="flex items-center gap-2 px-3 py-1 text-xs rounded-md bg-[#2A3040] hover:bg-[#383f52] text-white disabled:opacity-50 disabled:cursor-wait">
                    <BrainCircuit size={14} />
                    {isLoading ? 'Generating...' : 'Generate with AI'}
                </button>
                 <button onClick={handleOptimize} disabled={isLoading || isOptimizing} className="flex items-center gap-2 px-3 py-1 text-xs rounded-md bg-[#2A3040] hover:bg-[#383f52] text-white disabled:opacity-50 disabled:cursor-wait">
                    <Sparkles size={14} />
                    {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
                </button>
            </div>
            {optimizationResult && (
                <div className="p-3 bg-purple-900/20 border-b border-b-purple-500/20 text-xs text-purple-200 relative">
                    <button onClick={() => setOptimizationResult(null)} className="absolute top-1 right-1 p-0.5 text-purple-300 hover:text-white"><X size={14}/></button>
                    <strong className="font-bold text-sm mb-1 block">AI Optimization Suggestions:</strong>
                    <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: optimizationResult.replace(/\n/g, '<br/>') }} />
                </div>
            )}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language="plaintext" // Pine script is not a default language
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, lineNumbers: 'on', roundedSelection: false, readOnly: isLoading || isOptimizing }}
                />
            </div>
        </div>
    );
};

const TradingPanel = ({ stockSymbol, chartPriceData }) => {
    const { positions, history, closePosition } = useTradingStore();
    const [activeTab, setActiveTab] = useState('positions');

    const currentPrice = (chartPriceData && chartPriceData.length > 0) ? chartPriceData[chartPriceData.length - 1].close : 0;
    const currentTime = (chartPriceData && chartPriceData.length > 0) ? chartPriceData[chartPriceData.length - 1].time : new Date().toISOString().slice(0, 10);

    const handleClosePosition = (id) => {
        if(confirm(`Are you sure you want to close position #${id}?`)) {
            closePosition(id, currentPrice, currentTime);
            window.toast?.(`Position ${id} closed.`);
        }
    };
    
    const calculatePnl = (position) => {
        if (!currentPrice) return 0;
        return (currentPrice - position.entryPrice) * position.qty * (position.side === 'BUY' ? 1 : -1);
    };

    const renderPositions = () => (
        <table className="w-full text-xs text-left">
            <thead>
                <tr className="border-b border-b-[#2A3040] text-[#8A93A2]">
                    <th className="p-2 font-normal">Symbol</th><th className="p-2 font-normal">Side</th>
                    <th className="p-2 font-normal text-right">Qty</th><th className="p-2 font-normal text-right">Entry Price</th>
                    <th className="p-2 font-normal text-right">Current Price</th><th className="p-2 font-normal text-right">P/L</th>
                    <th className="p-2 font-normal text-right"></th>
                </tr>
            </thead>
            <tbody>
                {positions.length === 0 ? (
                    <tr><td colSpan="7" className="text-center p-4 text-[#8A93A2]">No open positions</td></tr>
                ) : positions.map(pos => {
                    const pnl = calculatePnl(pos);
                    return (
                    <tr key={pos.id} className="border-b border-b-[#2A3040]/50 hover:bg-[#2A3040]/30">
                        <td className="p-2">{pos.symbol}</td>
                        <td className={`p-2 font-bold ${pos.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{pos.side}</td>
                        <td className="p-2 text-right font-mono">{pos.qty}</td><td className="p-2 text-right font-mono">{pos.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{currentPrice.toFixed(2)}</td>
                        <td className={`p-2 text-right font-mono ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pnl.toFixed(2)}</td>
                        <td className="p-2 text-right"><button onClick={() => handleClosePosition(pos.id)} className="p-1 rounded bg-red-600/50 hover:bg-red-600 text-white"><X size={12} /></button></td>
                    </tr>
                )})}
            </tbody>
        </table>
    );
    
    const renderHistory = () => (
         <table className="w-full text-xs text-left">
            <thead>
                <tr className="border-b border-b-[#2A3040] text-[#8A93A2]">
                    <th className="p-2 font-normal">Symbol</th><th className="p-2 font-normal">Side</th>
                    <th className="p-2 font-normal text-right">Qty</th><th className="p-2 font-normal text-right">Entry Price</th>
                    <th className="p-2 font-normal text-right">Close Price</th><th className="p-2 font-normal text-right">P/L</th>
                    <th className="p-2 font-normal">Close Time</th>
                </tr>
            </thead>
            <tbody>
                {history.length === 0 ? (
                    <tr><td colSpan="7" className="text-center p-4 text-[#8A93A2]">No trading history</td></tr>
                ) : history.map(trade => (
                    <tr key={trade.id} className="border-b border-b-[#2A3040]/50 hover:bg-[#2A3040]/30">
                        <td className="p-2">{trade.symbol}</td>
                        <td className={`p-2 font-bold ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{trade.side}</td>
                        <td className="p-2 text-right font-mono">{trade.qty}</td>
                        <td className="p-2 text-right font-mono">{trade.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{trade.closePrice.toFixed(2)}</td>
                        <td className={`p-2 text-right font-mono ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trade.pnl.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono text-[#8A93A2]">{trade.closeTime}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="h-full flex flex-col text-white">
            <div className="flex-shrink-0 flex items-center border-b border-b-[#2A3040] px-2">
                <button onClick={() => setActiveTab('positions')} className={`px-3 py-2 text-sm ${activeTab === 'positions' ? 'border-b-2 border-blue-500 text-white' : 'text-[#8A93A2]'}`}>Positions ({positions.length})</button>
                <button onClick={() => setActiveTab('history')} className={`px-3 py-2 text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-white' : 'text-[#8A93A2]'}`}>History ({history.length})</button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'positions' && renderPositions()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </div>
    );
};

const BottomDock = ({ height, onResizeStart, onToggle, onMaximize, initialTab, stockSymbol, chartPriceData, onAddPineIndicator }) => {
    const [activeTab, setActiveTab] = useState('trading');
    const isCollapsed = height <= 40;

    useEffect(() => {
        if(initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const handleTabClick = (tab) => {
        if(isCollapsed) {
            onToggle(tab);
        }
        setActiveTab(tab);
    }
    
    const tabs = [
        { id: 'trading', label: 'Trading Panel', icon: Activity },
        { id: 'brokerage', label: 'Brokerage', icon: Link },
        { id: 'tester', label: 'Strategy Tester', icon: BarChart2 },
        { id: 'pine', label: 'Pine Editor', icon: Code },
        { id: 'sketch', label: 'Sketch Lab', icon: Brush },
    ];
    
    const renderContent = () => {
        if(isCollapsed) return null;

        switch(activeTab) {
            case 'trading':
                return <TradingPanel stockSymbol={stockSymbol} chartPriceData={chartPriceData.priceData} />;
            case 'brokerage':
                return <BrokeragePanel />;
            case 'tester':
                return <div className="p-4 text-center text-[#8A93A2]">Strategy Tester Results</div>;
            case 'pine':
                return <PineEditorPanel onAddPineIndicator={onAddPineIndicator} />;
            case 'sketch':
                return <ImageSketcher />;
            default:
                return null;
        }
    };

    return (
        <div 
            className="bg-[#12161D] border-t border-t-[#2A3040] flex-shrink-0 flex flex-col"
            style={{ height: `${height}px`, transition: 'height 0.2s ease-out' }}
            data-dev-name="BottomDock"
        >
            <div 
                className="bottom-dock-resizer"
                onMouseDown={onResizeStart}
            />
            <div className="flex items-center justify-between border-b border-b-[#2A3040] flex-shrink-0 h-[40px] pr-2">
                <div className="flex items-center">
                    {tabs.map(tab => (
                        <TabButton 
                            key={tab.id}
                            icon={tab.icon}
                            label={tab.label}
                            isActive={!isCollapsed && activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            onOpen={() => handleTabClick(tab.id)}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <VsLogo />
                    <button onClick={onMaximize} className="p-2 text-[#8A93A2] hover:text-white" title="Maximize Panel">
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={() => onToggle(activeTab)} className="p-2 text-[#8A93A2] hover:text-white" title="Close Panel">
                       <X size={16} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default BottomDock;