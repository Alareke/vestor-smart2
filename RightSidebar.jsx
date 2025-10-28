/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoreHorizontal, X, Newspaper, AlarmClock, Layers, Flame, ChevronDown, Calculator, BrainCircuit, Activity, SendHorizonal, Bot, Sparkles, GitCommitVertical, Trash2, Plus, Shapes, List, BarChart, Lightbulb, Briefcase, AlertTriangle, RefreshCw, Check, Pin, PinOff } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { generateChartData } from './chartUtils.js';
import { useUIStore, t } from './ui.ts';
import { detectPatternsAI } from './patterns_ai.ts';
import { suggestIndicators } from './indicator_suggestions.ts';
import { generateBriefing } from './ai_briefing.ts';
import { useTradingStore } from './trading.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TradeConfirmationModal = ({ data, onConfirm, onCancel }) => {
    if (!data) return null;

    const { side, quantity, price, symbol } = data;
    const isBuy = side === 'BUY';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[10000]" aria-modal="true" role="dialog" data-dev-name="TradeConfirmationModal">
            <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 text-white animate-fade-in-up">
                <h3 className={`text-lg font-bold mb-4 text-center ${isBuy ? 'text-blue-400' : 'text-red-400'}`}>
                    {isBuy ? t('trade_confirm_title_buy') : t('trade_confirm_title_sell')}
                </h3>
                
                <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[#8A93A2]">{t('common_symbol')}</span>
                        <span className="font-mono text-white">{symbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#8A93A2]">{t('common_side')}</span>
                        <span className={`font-bold ${isBuy ? 'text-blue-400' : 'text-red-400'}`}>{side}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#8A93A2]">{t('common_quantity')}</span>
                        <span className="font-mono text-white">{quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#8A93A2]">{t('common_price')}</span>
                        <span className="font-mono text-white">{price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onCancel} 
                        className="w-full px-4 py-2 text-sm font-semibold text-[#E1E3E6] bg-[#2A3040] hover:bg-[#383f52] rounded-md transition-colors"
                    >
                        {t('common_cancel')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`w-full px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors ${isBuy ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {t('common_confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RightbarIcon = ({icon: Icon, active, onClick, tooltip, "data-dev-name": dataDevName}) => (
    <button onClick={onClick} className={`p-3 w-full flex justify-center items-center relative group ${active ? 'text-white' : 'text-[#9046FF]'} ${active ? '' : 'text-[#8A93A2] hover:text-white'}`} data-dev-name={dataDevName}>
        {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#9046FF]"></div>}
        <Icon size={24} />
        {tooltip && <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50">{tooltip}</span>}
    </button>
);

const OrderParamInput = ({ value, label }) => (
    <div className="flex flex-col gap-1">
        <div className="bg-[#1A1F2A] border border-[#2A3040] rounded p-2 text-center text-white text-sm input-inset">{value}</div>
        <label className="text-center text-[#8A93A2] text-[11px]">{label}</label>
    </div>
);

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div data-dev-name={`RightSidebar.Panel.Order.Accordion.${title.replace(' ', '')}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <input type="checkbox" className="accent-[#3E8BF3] bg-[#1A1F2A] rounded-sm" />
                    <label className="font-semibold text-white">{title}</label>
                </div>
                <ChevronDown size={16} className={`text-[#8A93A2] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`accordion-content ${isOpen ? 'accordion-open' : ''}`}>
                <div className="pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};


const OrderPanel = ({stockSymbol, onClose, chartPriceData}) => {
    const [tab, setTab] = useState('Order');
    const [orderType, setOrderType] = useState('Limit');
    const [quantity, setQuantity] = useState(50);
    const { openPosition } = useTradingStore();
    const { isTradingPanelPinned, toggleTradingPanelPin, setRightSidebarView } = useUIStore();
    const [confirmationData, setConfirmationData] = useState(null);

    const lastPriceData = chartPriceData?.priceData && chartPriceData.priceData.length > 0
        ? chartPriceData.priceData[chartPriceData.priceData.length - 1]
        : { close: 0, time: new Date().toISOString().slice(0, 10) };
    
    const bidPrice = lastPriceData.close;
    const askPrice = bidPrice * 1.0002;
    const spread = askPrice - bidPrice;

    const handleTrade = (side) => {
        openPosition({
            symbol: stockSymbol,
            side,
            qty: quantity,
            price: side === 'BUY' ? askPrice : bidPrice,
            time: lastPriceData.time,
        });
        window.toast?.(`${side} order for ${quantity} units of ${stockSymbol} placed.`);
    };

    const handleConfirmTrade = () => {
        if (confirmationData) {
            handleTrade(confirmationData.side);
            setConfirmationData(null);
        }
    };

    return (
        <div className="flex flex-col p-3 gap-4 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.Order">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold text-base">NASDAQ:{stockSymbol}, Trading</h2>
                <div className="flex items-center">
                    <button 
                        className="p-1 text-[#8A93A2] hover:text-white"
                        onClick={toggleTradingPanelPin}
                        title={isTradingPanelPinned ? "Unpin Panel" : "Pin Panel"}
                        data-dev-name="RightSidebar.Panel.Order.PinButton"
                    >
                        {isTradingPanelPinned ? <PinOff size={18} className="text-blue-400"/> : <Pin size={18} />}
                    </button>
                    <button className="p-1 text-[#8A93A2] hover:text-white" onClick={() => (window.toast && window.toast('Options coming soon!'))}><MoreHorizontal size={18}/></button>
                    <button className="p-1 text-[#8A93A2] hover:text-white" onClick={() => onClose()}><X size={18}/></button>
                </div>
            </div>

            <div className="flex bg-[#1A1F2A] rounded-md p-1" data-dev-name="RightSidebar.Panel.Order.TabControl">
                <button onClick={() => setTab('Order')} className={`flex-1 py-1 rounded-md text-sm ${tab === 'Order' ? 'bg-[#2A3040] text-white' : 'text-[#8A93A2]'}`}>Order</button>
                <button onClick={() => setTab('DOM')} className={`flex-1 py-1 rounded-md text-sm ${tab === 'DOM' ? 'bg-[#2A3040] text-white' : 'text-[#8A93A2]'}`}>DOM</button>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-px items-stretch" data-dev-name="RightSidebar.Panel.Order.SellBuy">
                <button className="btn-sell p-3 rounded-l-md flex flex-col items-center justify-center transition-transform active:scale-95" onClick={() => setConfirmationData({ side: 'SELL', quantity, price: bidPrice, symbol: stockSymbol })}>
                    <span className="font-bold text-white text-base">Sell {quantity}</span>
                    <span className="text-white/90 text-sm font-mono mt-1">@ {bidPrice.toFixed(2)}</span>
                </button>
                <div className="bg-[#1A1F2A] h-full flex items-center justify-center px-2 text-xs text-[#8A93A2] border-y border-y-[#2A3040] font-mono">{spread.toFixed(2)}</div>
                <button className="btn-buy p-3 rounded-r-md flex flex-col items-center justify-center transition-transform active:scale-95" onClick={() => setConfirmationData({ side: 'BUY', quantity, price: askPrice, symbol: stockSymbol })}>
                    <span className="font-bold text-white text-base">Buy {quantity}</span>
                    <span className="text-white/90 text-sm font-mono mt-1">@ {askPrice.toFixed(2)}</span>
                </button>
            </div>
             <div className="flex bg-[#1A1F2A] rounded-md p-1" data-dev-name="RightSidebar.Panel.Order.OrderType">
                <button onClick={() => setOrderType('Market')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'Market' ? 'bg-[#2A3040] text-white' : 'text-[#8A93A2]'}`}>Market</button>
                <button onClick={() => setOrderType('Limit')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'Limit' ? 'bg-[#2A3040] text-white' : 'text-[#8A93A2]'}`}>Limit</button>
                <button onClick={() => setOrderType('Stop')} className={`flex-1 py-1 rounded-md text-sm ${orderType === 'Stop' ? 'bg-[#2A3040] text-white' : 'text-[#8A93A2]'}`}>Stop</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-dev-name="RightSidebar.Panel.Order.PriceInputs">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-[#8A93A2]">Price</label>
                    <div className="flex items-center justify-between bg-[#1A1F2A] border border-[#2A3040] rounded p-2 text-sm input-inset">
                        <span>{bidPrice.toFixed(2)}</span>
                        <ChevronDown size={14} />
                    </div>
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-xs text-[#8A93A2]">Pips</label>
                    <div className="flex items-center justify-between bg-[#1A1F2A] border border-[#2A3040] rounded p-2 text-sm input-inset">
                        <span>ASK</span>
                        <ChevronDown size={14} />
                    </div>
                </div>
            </div>

             <div className="flex flex-col gap-2" data-dev-name="RightSidebar.Panel.Order.Quantity">
                <label className="text-xs text-[#8A93A2] flex items-center">Quantity <span className="text-white ml-1 mr-0.5">units</span> <ChevronDown size={12} className="inline-block" /></label>
                <div className="flex items-center justify-between bg-[#1A1F2A] border border-[#2A3040] rounded text-sm input-inset">
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                        className="bg-transparent w-full focus:outline-none p-2"
                    />
                    <Calculator size={14} className="mr-2 text-[#8A93A2]" />
                </div>
            </div>
            
             <div className="flex flex-col gap-4 mt-2">
                <Accordion title="Take Profit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <OrderParamInput value="75" label="Pips" />
                        <OrderParamInput value="0.75" label="Money" />
                        <OrderParamInput value="184.59" label="Price" />
                        <OrderParamInput value="0.00" label="%" />
                    </div>
                </Accordion>
                <Accordion title="Stop Loss">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <OrderParamInput value="75" label="Pips" />
                        <OrderParamInput value="0.25" label="Money" />
                        <OrderParamInput value="183.59" label="Price" />
                        <OrderParamInput value="0.00" label="%" />
                    </div>
                </Accordion>
            </div>
            <TradeConfirmationModal 
                data={confirmationData}
                onConfirm={handleConfirmTrade}
                onCancel={() => setConfirmationData(null)}
            />
        </div>
    )
}

const commandSchema = {
    type: Type.OBJECT,
    properties: {
        command_name: { type: Type.STRING, description: 'The name of the command, e.g., "add_indicator", "change_symbol". Null if not a command.' },
        parameters: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING },
                indicator_name: { type: Type.STRING, description: 'e.g., "EMA", "SMA", "RSI"' },
                periods: { type: Type.ARRAY, items: { type: Type.INTEGER } }
            },
            description: 'Parameters for the command.'
        }
    },
    required: ['is_command']
};


const AiChatPanel = ({stockSymbol, onClose, indicators, drawings, chartPriceData}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Build context string
        let context = `You are a helpful and concise financial analyst assistant for the VESTOR SMART trading terminal. The user is currently analyzing the stock with the symbol: ${stockSymbol}. Your answers should be brief, informative, and formatted with markdown.`;

        // Add indicator context
        if (indicators && indicators.length > 0) {
            const indicatorNames = indicators.map(ind => `${ind.name.toUpperCase()}(${ind.periods.join(',')})`).join(', ');
            context += `\n\nCurrent active indicators on the chart are: ${indicatorNames}.`;
        } else {
            context += `\n\nThere are no active indicators on the chart.`;
        }

        // Add drawing context
        if (drawings && drawings.length > 0) {
            const drawingCounts = drawings.reduce((acc, drawing) => {
                const type = drawing.type.replace('-', ' ');
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});
            const drawingSummary = Object.entries(drawingCounts).map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');
            context += `\n\nThe user has added the following drawings: ${drawingSummary}.`;
        } else {
            context += `\n\nThe user has not added any drawings to the chart.`;
        }
        
        // Add performance context
        if (chartPriceData?.priceData && chartPriceData.priceData.length > 4) {
            const recentData = chartPriceData.priceData.slice(-5);
            const lastCandle = recentData[recentData.length - 1];
            const firstCandle = recentData[0];
            if(lastCandle && firstCandle && firstCandle.close > 0) {
                const performance = (((lastCandle.close - firstCandle.close) / firstCandle.close) * 100).toFixed(2);
                context += `\n\nIn the last 5 periods, the price has changed by ${performance}%. The most recent closing price is ${lastCandle.close.toFixed(2)}.`;
            }
        }
        
        // Initialize a new chat session with the context
        chatRef.current = ai.chats.create({
            config: {
                systemInstruction: context,
            },
        });
        // Reset messages for the new session
        setMessages([{ role: 'model', text: `Hello! How can I help you with ${stockSymbol} today? You can ask me to add indicators like "/add a 20 period EMA".` }]);
        setError('');
    }, [stockSymbol, indicators, drawings, chartPriceData]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const processPotentialCommand = async (text) => {
        const commandText = text.trim();
        if (!commandText.startsWith('/')) return;

        const dispatchCommand = (commandData) => {
            window.dispatchEvent(new CustomEvent('chart:ai_action', { detail: commandData }));
            window.toast?.(`AI Action: ${commandData.command_name}`);
        };

        // 1. Simple Regex Parsing for explicit commands for faster response
        const addIndicatorRegex = /^\/add(?:_indicator)?\s+([A-Z]+)\s*\((\d+(?:,\s*\d+)*)\)/i;
        const changeSymbolRegex = /^\/change(?:_symbol)?\s+([A-Z0-9\.\^]+)/i;

        let match;

        match = commandText.match(addIndicatorRegex);
        if (match) {
            const [, indicatorName, periodsStr] = match;
            const periods = periodsStr.split(',').map(p => parseInt(p.trim(), 10));
            dispatchCommand({
                is_command: true,
                command_name: 'add_indicator',
                parameters: { indicator_name: indicatorName.toUpperCase(), periods }
            });
            return; // Command handled
        }

        match = commandText.match(changeSymbolRegex);
        if (match) {
            const [, symbol] = match;
            dispatchCommand({
                is_command: true,
                command_name: 'change_symbol',
                parameters: { symbol: symbol.toUpperCase() }
            });
            return; // Command handled
        }

        // 2. Fallback to AI for natural language commands
        const nlCommandText = commandText.substring(1).trim();
        try {
            const result = await ai.models.generateContent({
                contents: `Analyze the following user command for a trading chart application. Available commands are 'add_indicator' and 'change_symbol'. Command: "${nlCommandText}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: commandSchema,
                },
            });
            const resultText = result.text;
            if(resultText && resultText.trim() !== '') {
                const commandData = JSON.parse(resultText);
                if (commandData.is_command && commandData.command_name) {
                    dispatchCommand(commandData);
                }
            } else {
                console.warn("AI returned an empty response for command processing.");
            }
        } catch (e) {
            console.warn("Could not process AI command:", e);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !chatRef.current) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setLoading(true);
        setError('');

        // Process command in parallel, don't wait for it
        processPotentialCommand(userMessage.text);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: userMessage.text });
            let streamedText = '';
            for await (const chunk of stream) {
                streamedText += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = streamedText;
                    return newMessages;
                });
            }
        } catch (e) {
            console.error(e);
            const errorMessage = 'Could not get a response. Please check your API key or try again.';
            setError(errorMessage);
            setMessages(prev => prev.slice(0, -1)); // Remove the empty model message
        } finally {
            setLoading(false);
        }
    };
    
    const formatMessage = (text) => {
        let formattedText = text.replace(/\n/g, '<br />');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formattedText;
    };


    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full" data-dev-name="RightSidebar.Panel.AIChat">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><BrainCircuit size={18}/> AI Chat: {stockSymbol}</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-4" data-dev-name="RightSidebar.Panel.AIChat.MessageList">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <Bot size={20} className="text-[#9046FF] flex-shrink-0 mt-1"/>}
                        <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-[#3E8BF3] text-white' : 'bg-[#2A3040] text-white'}`}>
                            <div className="whitespace-pre-wrap font-sans leading-relaxed selection:bg-purple-500/50" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}></div>
                        </div>
                    </div>
                ))}
                {loading && messages[messages.length-1]?.role === 'model' && (
                     <div className="flex gap-2.5 justify-start">
                         <Bot size={20} className="text-[#9046FF] flex-shrink-0 mt-1"/>
                         <div className="px-3 py-2 rounded-lg bg-[#2A3040] text-white">
                             <div className="animate-pulse">...</div>
                         </div>
                     </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            {error && <div className="text-red-400 text-xs px-2">{error}</div>}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-1 bg-[#1A1F2A] rounded-md flex-shrink-0" data-dev-name="RightSidebar.Panel.AIChat.InputForm">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${stockSymbol}...`}
                    className="flex-1 bg-transparent focus:outline-none p-2 text-sm input-inset"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()} className="p-2 rounded-md bg-[#3E8BF3] hover:bg-[#1E66D6] disabled:bg-[#2A3040] disabled:text-[#8A93A2] disabled:cursor-not-allowed text-white" onClick={(e)=> (window.toast && window.toast('تم التنفيذ'), window.dispatchEvent(new CustomEvent('ui:action', { detail: { action: 'auto-button' } })))}>
                    <SendHorizonal size={16}/>
                </button>
            </form>
        </div>
    );
};

const AiNewsPanel = ({stockSymbol, onClose}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState('');
    const [sources, setSources] = useState([]);

    useEffect(() => {
        if (!stockSymbol) return;

        const fetchNewsAnalysis = async () => {
            setLoading(true);
            setError('');
            setSummary('');
            setSources([]);
            try {
                const result = await ai.models.generateContent({
                    contents: `Based on the latest news, what is the current market sentiment for ${stockSymbol}? Provide a brief summary.`,
                    config: {
                        tools: [{googleSearch: {}}]
                    }
                });
                
                const text = result.text;
                setSummary(text);

                const metadata = result.candidates?.[0]?.groundingMetadata;
                if (metadata?.groundingChunks) {
                    setSources(metadata.groundingChunks);
                }

            } catch(e) {
                console.error(e);
                setError('Could not fetch news analysis. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNewsAnalysis();
    }, [stockSymbol]);

    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.AINews">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Newspaper size={18}/> AI News & Analysis</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-4">
                {loading && (
                    <div className="space-y-4 animate-pulse p-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="mt-6 h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-8 bg-slate-700 rounded w-full"></div>
                            <div className="h-8 bg-slate-700 rounded w-full"></div>
                            <div className="h-8 bg-slate-700 rounded w-full"></div>
                        </div>
                    </div>
                )}
                {error && <div className="text-red-400 p-2">{error}</div>}
                {!loading && !error && (
                    <>
                        <div data-dev-name="RightSidebar.Panel.AINews.Summary">
                            <h3 className="font-bold text-white mb-2 text-base">Sentiment Summary</h3>
                            <p className="text-[#E1E3E6] whitespace-pre-wrap font-sans leading-relaxed">{summary || 'No summary available.'}</p>
                        </div>
                        {sources.length > 0 && (
                            <div data-dev-name="RightSidebar.Panel.AINews.Sources">
                                <h3 className="font-bold text-white mb-2 mt-4 text-base">Sources</h3>
                                <ul className="space-y-2 list-disc list-inside text-xs">
                                    {sources.map((source, index) => (
                                        source.web && <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline hover:text-blue-300 break-words">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const ConfidenceMeter = ({ value }) => {
    const percentage = Math.max(0, Math.min(100, value || 0));
    const color = percentage > 66 ? 'bg-green-500' : percentage > 33 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const AiTechnicalAnalysisPanel = ({ stockSymbol, chartPriceData, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const fetchAnalysis = useCallback(async () => {
        if (!stockSymbol || !chartPriceData || chartPriceData.priceData.length === 0) {
            setLoading(false);
            setError('Not enough chart data available for analysis.');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);
        
        try {
            const recentData = chartPriceData.priceData.slice(-90).map(p => ({
                time: p.time,
                open: p.open.toFixed(2),
                high: p.high.toFixed(2),
                low: p.low.toFixed(2),
                close: p.close.toFixed(2)
            }));
            
            const analysisSchema = {
                type: Type.OBJECT,
                properties: {
                    outlook: { type: Type.STRING, description: 'Overall outlook: "Bullish", "Bearish", or "Neutral"' },
                    confidence: { type: Type.INTEGER, description: 'Confidence score for the outlook, from 0 to 100.' },
                    support: { type: Type.STRING, description: 'Key support level (price).' },
                    resistance: { type: Type.STRING, description: 'Key resistance level (price).' },
                    patterns: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'List of identified technical chart patterns (e.g., "Double Top", "Head and Shoulders").'
                    },
                    summary: { type: Type.STRING, description: 'A brief 2-3 sentence summary of the technical analysis.' }
                },
                required: ['outlook', 'confidence', 'support', 'resistance', 'patterns', 'summary']
            };

            const result = await ai.models.generateContent({
                config: {
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema
                },
            });

            const text = result.text;
            if (!text || text.trim() === '') {
                throw new Error("AI returned an empty response for technical analysis.");
            }

            let analysisData;
            try {
                analysisData = JSON.parse(text);
            } catch (parseError) {
                console.error("Failed to parse AI analysis JSON:", parseError, "Raw text:", text);
                throw new Error("Received malformed data from the AI service. Please try again.");
            }
            setAnalysis(analysisData);

        } catch(e) {
            console.error(e);
            setError(e.message || 'Could not fetch technical analysis. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [stockSymbol, chartPriceData]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);
    
    const getOutlookColor = (outlook) => {
        switch (outlook?.toLowerCase()) {
            case 'bullish': return 'text-green-400';
            case 'bearish': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    }

    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.AITechnicalAnalysis">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Activity size={18}/> AI Analysis: {stockSymbol}</h2>
                 <div className="flex items-center">
                    <button onClick={fetchAnalysis} disabled={loading} className="p-1 text-[#8A93A2] hover:text-white disabled:opacity-50" title="Refresh Analysis">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
                </div>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-4">
                 {loading && (
                    <div className="space-y-6 animate-pulse p-2">
                        <div className="flex justify-between items-center">
                            <div className="h-5 bg-slate-700 rounded w-1/4"></div>
                            <div className="h-5 bg-slate-700 rounded w-1/3"></div>
                        </div>
                        <div className="h-3 bg-slate-700 rounded w-full"></div>
                        <div className="space-y-3 pt-4">
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                         <div className="space-y-3 pt-4">
                            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                             <div className="h-4 bg-slate-700 rounded w-full"></div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="text-center p-4 text-red-400 bg-red-500/10 rounded-md flex flex-col items-center gap-2">
                        <AlertTriangle size={24} />
                        <span>{error}</span>
                        <button onClick={fetchAnalysis} disabled={loading} className="text-xs mt-2 px-3 py-1 rounded-md bg-[#2A3040] hover:bg-[#383f52] text-white disabled:opacity-50">
                            Retry
                        </button>
                    </div>
                )}
                {!loading && !error && analysis && (
                    <div className="space-y-5 text-[#E1E3E6]">
                        <div data-dev-name="RightSidebar.Panel.AITechnicalAnalysis.Outlook">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-white text-base">Outlook</h3>
                                <span className={`font-bold text-base ${getOutlookColor(analysis.outlook)}`}>{analysis.outlook}</span>
                            </div>
                            <h4 className="text-xs text-[#8A93A2] mb-1">Confidence</h4>
                            <ConfidenceMeter value={analysis.confidence} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2" data-dev-name="RightSidebar.Panel.AITechnicalAnalysis.Levels">
                           <div>
                                <h4 className="font-semibold text-white mb-1">Support</h4>
                                <p className="text-xl font-mono text-green-400">{analysis.support}</p>
                           </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Resistance</h4>
                                <p className="text-xl font-mono text-red-400">{analysis.resistance}</p>
                           </div>
                        </div>

                        {analysis.patterns?.length > 0 && (
                             <div data-dev-name="RightSidebar.Panel.AITechnicalAnalysis.Patterns">
                                <h3 className="font-bold text-white mb-2">Patterns</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.patterns.map((pattern, i) => (
                                        <span key={i} className="bg-[#2A3040] text-xs px-2 py-1 rounded-md">{pattern}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div data-dev-name="RightSidebar.Panel.AITechnicalAnalysis.Summary">
                            <h3 className="font-bold text-white mb-2">Summary</h3>
                            <p className="whitespace-pre-wrap font-sans leading-relaxed text-sm">{analysis.summary}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AiAnnotationsPanel = ({ annotations, loading, error, stockSymbol, onAnnotationHover, onClose }) => {
    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.AIAnnotations">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Sparkles size={18}/> AI Annotations</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-2">
                {loading && (
                    <div className="space-y-4 animate-pulse p-2">
                        <div className="flex gap-4 items-center"><div className="h-4 bg-slate-700 rounded w-1/4"></div><div className="h-4 bg-slate-700 rounded w-3/4"></div></div>
                        <div className="flex gap-4 items-center"><div className="h-4 bg-slate-700 rounded w-1/4"></div><div className="h-4 bg-slate-700 rounded w-2/4"></div></div>
                        <div className="flex gap-4 items-center"><div className="h-4 bg-slate-700 rounded w-1/4"></div><div className="h-4 bg-slate-700 rounded w-3/4"></div></div>
                    </div>
                )}
                {error && <div className="text-red-400 p-2">{error}</div>}
                {!loading && !error && annotations && annotations.length > 0 && (
                     <ul className="space-y-1">
                        {annotations.map(item => (
                            <li 
                                key={item.id} 
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-[#2A3040]/50 transition-colors cursor-pointer" 
                                data-dev-name={`RightSidebar.Panel.AIAnnotations.Item.${item.id}`}
                                onMouseEnter={() => onAnnotationHover(item.id)}
                                onMouseLeave={() => onAnnotationHover(null)}
                            >
                                <div className="flex-shrink-0">
                                    <p className="font-mono text-slate-400 text-xs">{item.time}</p>
                                </div>
                                <div className="w-px bg-slate-700 self-stretch mx-1"></div>
                                <p className="text-white font-medium text-sm">{item.label}</p>
                            </li>
                        ))}
                    </ul>
                )}
                 {!loading && !error && (!annotations || annotations.length === 0) && (
                    <div className="text-center text-slate-400 p-4 h-full flex items-center justify-center">
                        <p>No significant events detected by AI for {stockSymbol}.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

const IndicatorsPanel = ({ indicators, setIndicators, onClose }) => {
    const [newIndicatorType, setNewIndicatorType] = useState('SMA');
    const [periods, setPeriods] = useState([20]);

    useEffect(() => {
        switch (newIndicatorType) {
            case 'SMA':
            case 'EMA':
                setPeriods([20]);
                break;
            case 'RSI':
                setPeriods([14]);
                break;
            case 'MACD':
                setPeriods([12, 26, 9]);
                break;
            default:
                setPeriods([20]);
        }
    }, [newIndicatorType]);

    const handlePeriodChange = (index, value) => {
        const newPeriods = [...periods];
        const val = parseInt(value, 10);
        newPeriods[index] = isNaN(val) ? 0 : val;
        setPeriods(newPeriods);
    };

    const handleAddIndicator = (e) => {
        e.preventDefault();
        const newIndicator = {
            id: `${newIndicatorType}-${periods.join('-')}-${Date.now()}`,
            name: newIndicatorType,
            periods: periods,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        };
        if (!indicators.some(ind => ind.name === newIndicator.name && JSON.stringify(ind.periods) === JSON.stringify(newIndicator.periods))) {
            setIndicators([...indicators, newIndicator]);
        } else {
            window.toast?.('Indicator already exists.');
        }
    };

    const handleRemoveIndicator = (id) => {
        setIndicators(indicators.filter(ind => ind.id !== id));
    };
    
    const periodLabels = {
        'MACD': ['Fast', 'Slow', 'Signal'],
        'RSI': ['Period'],
        'SMA': ['Period'],
        'EMA': ['Period']
    };

    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.Indicators">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><GitCommitVertical size={18}/> Indicators</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-2">
                {indicators.length > 0 ? (
                    indicators.map(ind => (
                        <div key={ind.id} className="flex items-center justify-between p-2 bg-[#2A3040] rounded-md text-white group">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: ind.color}}></div>
                                <span>{ind.name} ({ind.periods.join(', ')})</span>
                            </div>
                            <button onClick={() => handleRemoveIndicator(ind.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 p-4">No active indicators.</div>
                )}
            </div>
            <form onSubmit={handleAddIndicator} className="p-2 border-t border-[#2A3040] flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                    <select value={newIndicatorType} onChange={e => setNewIndicatorType(e.target.value)} className="bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm flex-1">
                        <option>SMA</option>
                        <option>EMA</option>
                        <option>RSI</option>
                        <option>MACD</option>
                    </select>
                    <button type="submit" className="p-2 rounded-md bg-[#3E8BF3] hover:bg-[#1E66D6] text-white flex items-center justify-center gap-2"><Plus size={16}/> Add</button>
                </div>
                <div className="flex items-center gap-2 w-full">
                     {periods.map((period, index) => (
                        <div key={index} className="flex-1">
                            <label className="text-xs text-[#8A93A2]">{periodLabels[newIndicatorType][index]}</label>
                            <input type="number" value={period} onChange={e => handlePeriodChange(index, e.target.value)} className="w-full bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm text-center"/>
                        </div>
                    ))}
                </div>
            </form>
        </div>
    )
}

const LayersPanel = () => {
    const { drawings, setDrawings, areDrawingsLocked, setRightSidebarView } = useUIStore();

    const handleDelete = (id) => {
        setDrawings(drawings.filter(d => d.id !== id));
    };

    const onClose = () => setRightSidebarView(null);

    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.Layers">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Shapes size={18}/> Layers / Objects</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm">
                {drawings.length === 0 ? (
                    <div className="text-center text-xs text-[#8A93A2] py-8">No drawings on the chart.</div>
                ) : (
                    <ul className="space-y-2">
                        {drawings.map(d => (
                            <li key={d.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-[#2A3040] group">
                                <span className="capitalize text-white">{d.type.replace('-', ' ')}</span>
                                <button
                                    onClick={() => handleDelete(d.id)}
                                    disabled={areDrawingsLocked}
                                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                                    data-dev-name={`RightSidebar.Layers.Delete.${d.id}`}
                                >
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

const AlarmsPanel = ({ onClose }) => (
    <div className="flex flex-col p-3 gap-3 text-sm h-full">
        <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold flex items-center gap-2 text-base"><AlarmClock size={18}/> Alarms</h2>
            <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 flex items-center justify-center text-slate-400">
            Alarm management coming soon.
        </div>
    </div>
);

const HotlistsPanel = ({ onClose }) => (
    <div className="flex flex-col p-3 gap-3 text-sm h-full">
        <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold flex items-center gap-2 text-base"><Flame size={18}/> Hotlists</h2>
            <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 flex items-center justify-center text-slate-400">
            Hotlists feature coming soon.
        </div>
    </div>
);

const AiHubPanel = ({ onViewChange, onClose }) => (
    <div className="flex flex-col p-3 gap-3 text-sm h-full" data-dev-name="RightSidebar.Panel.AIHub">
        <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold flex items-center gap-2 text-base"><Bot size={18}/> AI Hub</h2>
            <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-2">
            <p className="text-slate-400 mb-2">Select an AI tool to analyze the chart.</p>
            <button onClick={() => onViewChange('AIPatterns')} className="w-full text-left p-3 rounded-md bg-[#2A3040] hover:bg-[#383f52] transition-colors">
                <h3 className="font-semibold text-white flex items-center gap-2"><BarChart size={16}/> Detect Chart Patterns</h3>
                <p className="text-xs text-slate-400 mt-1 pl-6">Automatically identify technical patterns like "Head & Shoulders" on the chart.</p>
            </button>
            <button onClick={() => onViewChange('AIIndicatorSuggestions')} className="w-full text-left p-3 rounded-md bg-[#2A3040] hover:bg-[#383f52] transition-colors">
                <h3 className="font-semibold text-white flex items-center gap-2"><Lightbulb size={16} /> Suggest Indicators</h3>
                <p className="text-xs text-slate-400 mt-1 pl-6">Get suggestions for relevant indicators based on current market conditions.</p>
            </button>
        </div>
    </div>
);

const AiPatternsPanel = ({ chartPriceData, stockSymbol, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [patterns, setPatterns] = useState([]);
    const [error, setError] = useState('');

    const runAnalysis = useCallback(async () => {
        if (!chartPriceData || chartPriceData.priceData.length === 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        setPatterns([]);
        try {
            const result = await detectPatternsAI(chartPriceData.priceData);
            setPatterns(result);
        } catch (e) {
            setError('Failed to detect patterns. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [chartPriceData]);

    useEffect(() => {
        runAnalysis();
    }, [runAnalysis]);


    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full" data-dev-name="RightSidebar.Panel.AIPatterns">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><BarChart size={18}/> AI Pattern Detection</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-2">
                {loading && <div className="text-center p-4 text-slate-400">Analyzing chart data for patterns...</div>}
                {error && <div className="text-center p-4 text-red-400">{error}</div>}
                {!loading && !error && patterns.length > 0 && (
                    <ul className="space-y-2">
                        {patterns.map((p, i) => (
                           <li key={i} className="p-2 bg-[#2A3040] rounded-md text-white">
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-slate-400">Detected around: {p.at}</p>
                           </li>
                        ))}
                    </ul>
                )}
                {!loading && !error && patterns.length === 0 && (
                    <div className="text-center p-4 text-slate-400">AI analysis complete. No significant patterns were detected.</div>
                )}
            </div>
            <button onClick={runAnalysis} disabled={loading} className="w-full p-2 rounded-md bg-[#3E8BF3] hover:bg-[#1E66D6] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Analyzing...' : 'Re-run Analysis'}
            </button>
        </div>
    );
};

const AIIndicatorSuggestionsPanel = ({ chartPriceData, indicators, stockSymbol, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [addedIndicators, setAddedIndicators] = useState([]);

    const getSuggestions = useCallback(async () => {
        if (!chartPriceData) return;
        setLoading(true);
        setError('');
        setAddedIndicators([]); // Reset on refresh
        try {
            const result = await suggestIndicators(chartPriceData.priceData);
            setSuggestions(result);
        } catch (e) {
            setError('Could not get suggestions. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [chartPriceData]);

    useEffect(() => {
        getSuggestions();
    }, [getSuggestions]);
    
    // Sync added indicators with the main indicators list from props
    useEffect(() => {
        const currentIndicatorNames = indicators.map(ind => `${ind.name.toUpperCase()}(${ind.periods.join(', ')})`);
        setAddedIndicators(currentIndicatorNames);
    }, [indicators]);

    const handleAdd = (indicatorString) => {
        // Optimistically update UI
        setAddedIndicators(prev => [...prev, indicatorString]);
        
        const match = indicatorString.match(/([\w\s]+)\s*\((\d+(?:,\s*\d+)?)\)/);
        if (match) {
            const [, name, periodsStr] = match;
            const periods = periodsStr.split(',').map(p => parseInt(p.trim(), 10));
            
            const command = {
                command_name: 'add_indicator',
                parameters: { indicator_name: name.trim().toUpperCase(), periods }
            };
            window.dispatchEvent(new CustomEvent('chart:ai_action', { detail: command }));
            window.toast?.(`Added ${indicatorString}`);
        }
    };
    
    const SkeletonLoader = () => (
        <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-[#2A3040] rounded-md">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-full"></div>
                </div>
            ))}
        </div>
    );
    
    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full" data-dev-name="RightSidebar.Panel.AIIndicatorSuggestions">
             <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Lightbulb size={18}/> AI Indicator Suggestions</h2>
                <div className="flex items-center">
                    <button onClick={getSuggestions} disabled={loading} className="p-1 text-[#8A93A2] hover:text-white disabled:opacity-50" title="Refresh Suggestions">
                        <RefreshCw size={16} />
                    </button>
                    <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
                </div>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-2">
                {loading && <SkeletonLoader />}
                {error && (
                    <div className="text-center p-4 text-red-400 bg-red-500/10 rounded-md flex flex-col items-center gap-2">
                        <AlertTriangle size={24} />
                        <span>{error}</span>
                    </div>
                )}
                {!loading && !error && suggestions.length > 0 && (
                    <>
                        <p className="text-slate-400 mb-2">Based on recent market conditions, the AI suggests the following for {stockSymbol}:</p>
                        <ul className="space-y-2">
                           {suggestions.map((s, i) => {
                                const isAdded = addedIndicators.includes(s.name);
                                return (
                                <li key={i} className="p-3 bg-[#2A3040] rounded-md text-white">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold">{s.name}</span>
                                        <button 
                                            onClick={() => handleAdd(s.name)} 
                                            disabled={isAdded}
                                            className="text-xs px-2 py-1 rounded-md bg-[#3E8BF3] hover:bg-[#1E66D6] flex items-center gap-1.5 disabled:bg-[#2A3040] disabled:text-[#8A93A2] disabled:cursor-not-allowed"
                                        >
                                            {isAdded ? <><Check size={14}/> Added</> : <><Plus size={12}/> Add</>}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 pr-16">{s.description}</p>
                                </li>
                           );
                           })}
                        </ul>
                    </>
                )}
                 {!loading && !error && suggestions.length === 0 && (
                    <div className="text-center p-4 text-slate-400">No suggestions available at this time.</div>
                 )}
            </div>
        </div>
    );
};

const AiBriefingPanel = ({ stockSymbol, chartPriceData, indicators, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [briefing, setBriefing] = useState(null);

    useEffect(() => {
        if (!stockSymbol || !chartPriceData) {
            setLoading(false);
            return;
        };

        const fetchBriefing = async () => {
            if (!chartPriceData.priceData || chartPriceData.priceData.length < 30) {
                setError('Insufficient data for AI briefing.');
                setLoading(false);
                setBriefing(null);
                return;
            }
            setLoading(true);
            setError('');
            setBriefing(null);
            try {
                const result = await generateBriefing(stockSymbol, chartPriceData.priceData, indicators);
                setBriefing(result);
            } catch (e) {
                setError(e.message || 'Failed to generate AI Briefing.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchBriefing();
    }, [stockSymbol, chartPriceData, indicators]);
    
    const renderSection = (title, content) => (
        <div>
            <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
            {content}
        </div>
    );

    return (
        <div className="flex flex-col p-3 gap-3 text-sm h-full overflow-y-auto" data-dev-name="RightSidebar.Panel.AIBriefing">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="font-bold flex items-center gap-2 text-base"><Briefcase size={18}/> AI Analyst Briefing</h2>
                <button className="p-1 text-[#8A93A2] hover:text-white" onClick={onClose}><X size={18}/></button>
            </div>
            <div className="flex-1 bg-[#1A1F2A] rounded-md p-3 overflow-y-auto text-sm flex flex-col gap-5">
                {loading && (
                     <div className="space-y-6 animate-pulse p-2">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="space-y-2 pt-4">
                             <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                             <div className="h-3 bg-slate-700 rounded w-full"></div>
                             <div className="h-3 bg-slate-700 rounded w-full"></div>
                        </div>
                        <div className="space-y-2 pt-4">
                             <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                             <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                        </div>
                     </div>
                )}
                {error && <div className="text-red-400 p-2">{error}</div>}
                {!loading && !error && briefing && (
                    <>
                        {renderSection("Market Snapshot", <p className="text-[#E1E3E6] italic">{briefing.market_snapshot}</p>)}
                        
                        {briefing.key_drivers?.length > 0 && renderSection("Key Drivers", 
                            <ul className="list-disc list-inside space-y-1 text-[#E1E3E6]">
                                {briefing.key_drivers.map((driver, i) => <li key={i}>{driver}</li>)}
                            </ul>
                        )}

                        {briefing.technical_outlook && renderSection("Technical Outlook", 
                            <div className="space-y-3">
                                <p className="text-[#E1E3E6]">{briefing.technical_outlook.summary}</p>
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div>
                                        <h4 className="text-xs text-[#8A93A2] font-semibold">Support</h4>
                                        <p className="font-mono text-green-500">{briefing.technical_outlook.support}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-[#8A93A2] font-semibold">Resistance</h4>
                                        <p className="font-mono text-red-400">{briefing.technical_outlook.resistance}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {briefing.upcoming_events?.length > 0 && renderSection("Upcoming Events", 
                             <ul className="list-disc list-inside space-y-1 text-[#E1E3E6]">
                                {briefing.upcoming_events.map((event, i) => <li key={i}>{event}</li>)}
                            </ul>
                        )}

                        {briefing.indicator_synopsis && renderSection("Indicator Synopsis", <p className="text-[#E1E3E6]">{briefing.indicator_synopsis}</p>)}
                    </>
                )}
            </div>
        </div>
    );
}

const PanelWrapper = ({ view, activeView, children }) => {
    if (activeView !== view) return null;
    return (
        <div className="flex flex-col h-full w-full animate-panel-enter">
            {children}
        </div>
    );
};


const RightSidebar = ({ stockSymbol, chartPriceData, aiAnnotations, isAnnotationsLoading, annotationsError, onAnnotationHover, indicators, setIndicators }) => {
    const { rightSidebarView, setRightSidebarView, isTradingPanelPinned, drawings } = useUIStore();
    const activeView = isTradingPanelPinned ? 'Order' : rightSidebarView;
    const onViewChange = isTradingPanelPinned ? () => {} : setRightSidebarView;

    const closePanel = () => onViewChange('AIHub');
    
    const handlePanelClose = () => {
        if(isTradingPanelPinned) return; // Don't close if pinned
        setRightSidebarView(null);
    }

    return (
        <div className="flex h-full bg-[#12161D]" data-dev-name="RightSidebar">
            <div className="flex-1 border-l border-l-[#2A3040] flex-shrink-0 flex flex-col overflow-hidden" data-dev-name="RightSidebar.Content">
                 <PanelWrapper view="Annotations" activeView={activeView}><AiAnnotationsPanel annotations={aiAnnotations} loading={isAnnotationsLoading} error={annotationsError} stockSymbol={stockSymbol} onAnnotationHover={onAnnotationHover} onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="Analysis" activeView={activeView}><AiTechnicalAnalysisPanel stockSymbol={stockSymbol} chartPriceData={chartPriceData} onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="News" activeView={activeView}><AiNewsPanel stockSymbol={stockSymbol} onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="Order" activeView={activeView}><OrderPanel stockSymbol={stockSymbol} onClose={handlePanelClose} chartPriceData={chartPriceData} /></PanelWrapper>
                 <PanelWrapper view="Chat" activeView={activeView}><AiChatPanel stockSymbol={stockSymbol} onClose={() => onViewChange(null)} indicators={indicators} drawings={drawings} chartPriceData={chartPriceData} /></PanelWrapper>
                 <PanelWrapper view="Indicators" activeView={activeView}><IndicatorsPanel indicators={indicators} setIndicators={setIndicators} onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="Layers" activeView={activeView}><LayersPanel/></PanelWrapper>
                 <PanelWrapper view="Alarms" activeView={activeView}><AlarmsPanel onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="Hotlists" activeView={activeView}><HotlistsPanel onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="AIHub" activeView={activeView}><AiHubPanel onViewChange={onViewChange} onClose={() => onViewChange(null)} /></PanelWrapper>
                 <PanelWrapper view="AIPatterns" activeView={activeView}><AiPatternsPanel chartPriceData={chartPriceData} stockSymbol={stockSymbol} onClose={closePanel} /></PanelWrapper>
                 <PanelWrapper view="AIIndicatorSuggestions" activeView={activeView}><AIIndicatorSuggestionsPanel chartPriceData={chartPriceData} indicators={indicators} stockSymbol={stockSymbol} onClose={closePanel} /></PanelWrapper>
                 <PanelWrapper view="AIBriefing" activeView={activeView}><AiBriefingPanel stockSymbol={stockSymbol} chartPriceData={chartPriceData} indicators={indicators} onClose={() => onViewChange(null)} /></PanelWrapper>
            </div>
            <div className="w-[50px] bg-[#12161D] border-l border-l-[#2A3040] flex-shrink-0 flex-col items-center pt-2 relative hidden md:flex" data-dev-name="RightSidebar.Toolbar">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none"></div>
                <RightbarIcon icon={Layers} active={activeView === 'Order'} onClick={() => onViewChange('Order')} tooltip="Order Panel" data-dev-name="RightSidebar.Toolbar.Order"/>
                <RightbarIcon icon={AlarmClock} active={activeView === 'Alarms'} onClick={() => onViewChange('Alarms')} tooltip="Alarms" data-dev-name="RightSidebar.Toolbar.Alarms"/>
                <RightbarIcon icon={Flame} active={activeView === 'Hotlists'} onClick={() => onViewChange('Hotlists')} tooltip="Hotlists" data-dev-name="RightSidebar.Toolbar.Hotlists"/>
                <RightbarIcon icon={GitCommitVertical} active={activeView === 'Indicators'} onClick={() => onViewChange('Indicators')} tooltip="Indicators" data-dev-name="RightSidebar.Toolbar.Indicators"/>
                <div className="my-2 h-px w-full bg-[#2A3040]"></div>
                <RightbarIcon icon={Briefcase} active={activeView === 'AIBriefing'} onClick={() => onViewChange('AIBriefing')} tooltip="AI Analyst Briefing" data-dev-name="RightSidebar.Toolbar.AIBriefing"/>
                <RightbarIcon icon={Bot} active={['AIHub', 'AIPatterns'].includes(activeView)} onClick={() => onViewChange('AIHub')} tooltip="AI Hub" data-dev-name="RightSidebar.Toolbar.AIHub"/>
                <RightbarIcon icon={Lightbulb} active={activeView === 'AIIndicatorSuggestions'} onClick={() => onViewChange('AIIndicatorSuggestions')} tooltip="AI Indicator Suggestions" data-dev-name="RightSidebar.Toolbar.AIIndicatorSuggestions"/>
                <RightbarIcon icon={Sparkles} active={activeView === 'Annotations'} onClick={() => onViewChange('Annotations')} tooltip="AI Annotations" data-dev-name="RightSidebar.Toolbar.AIAnnotations"/>
                <RightbarIcon icon={Newspaper} active={activeView === 'News'} onClick={() => onViewChange('News')} tooltip="AI News & Analysis" data-dev-name="RightSidebar.Toolbar.AINews"/>
                <RightbarIcon icon={Activity} active={activeView === 'Analysis'} onClick={() => onViewChange('Analysis')} tooltip="AI Technical Analysis" data-dev-name="RightSidebar.Toolbar.AITechnicalAnalysis"/>
                <RightbarIcon icon={BrainCircuit} active={activeView === 'Chat'} onClick={() => onViewChange('Chat')} tooltip="AI Chat" data-dev-name="RightSidebar.Toolbar.AIChat"/>
            </div>
        </div>
    );
};

export default RightSidebar;