/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This creates mock data and is used as a fallback.
const generateMockData = (symbol, timeframe = '1D') => {
    const dailyData = [];
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let price = 150 + (seed % 50);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (365 * 5)); // 5 years of data

    for (let i = 0; i < 365 * 5; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        // Skip weekends for more realistic daily data
        if (date.getDay() === 0 || date.getDay() === 6) {
            continue;
        }
        const simpleDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        const fluctuation = (Math.random() - (0.45 + (seed % 10) * 0.01)) * 4;
        const open = price;
        const close = open + fluctuation;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        price = close;

        const volume = Math.random() * 1000000 + 500000;
        
        dailyData.push({ date: date, time: simpleDate, open, high, low, close, volume });
    }

    let priceData;
    if (timeframe === '1D') {
        priceData = dailyData;
    } else {
        const aggregatedData = [];
        let currentGroup = [];
        
        const getGroupKey = (date) => {
            if (timeframe === '1W') {
                const startOfWeek = new Date(date);
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
                startOfWeek.setDate(diff);
                return startOfWeek.toISOString().slice(0, 10);
            }
            if (timeframe === '1M') {
                return date.toISOString().slice(0, 7); // YYYY-MM
            }
            return date.toISOString().slice(0, 10);
        };

        for (const candle of dailyData) {
            if (currentGroup.length === 0) {
                currentGroup.push(candle);
                continue;
            }

            const currentKey = getGroupKey(currentGroup[0].date);
            const newKey = getGroupKey(candle.date);

            if (currentKey === newKey) {
                currentGroup.push(candle);
            } else {
                const first = currentGroup[0];
                const last = currentGroup[currentGroup.length - 1];
                aggregatedData.push({
                    time: first.time,
                    open: first.open,
                    high: Math.max(...currentGroup.map(c => c.high)),
                    low: Math.min(...currentGroup.map(c => c.low)),
                    close: last.close,
                    volume: currentGroup.reduce((sum, c) => sum + c.volume, 0)
                });
                currentGroup = [candle];
            }
        }
        if (currentGroup.length > 0) {
             const first = currentGroup[0];
            const last = currentGroup[currentGroup.length - 1];
            aggregatedData.push({
                time: first.time,
                open: first.open,
                high: Math.max(...currentGroup.map(c => c.high)),
                low: Math.min(...currentGroup.map(c => c.low)),
                close: last.close,
                volume: currentGroup.reduce((sum, c) => sum + c.volume, 0)
            });
        }
        priceData = aggregatedData;
    }

    const volumeData = priceData.map(p => ({
        time: p.time,
        value: p.volume,
        color: p.close >= p.open ? 'rgba(62, 139, 243, 0.5)' : 'rgba(247, 82, 95, 0.5)'
    }));

    return {
        priceData,
        volumeData
    };
};

const formatYahooData = (yahooResponse) => {
    const result = yahooResponse?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        console.error("Invalid Yahoo Finance data structure", yahooResponse);
        throw new Error('Invalid Yahoo Finance data structure');
    }
    const { timestamp, indicators } = result;
    const { open, high, low, close, volume } = indicators.quote[0];

    const validIndices = [];
    for (let i = 0; i < timestamp.length; i++) {
        if (open[i] !== null && high[i] !== null && low[i] !== null && close[i] !== null && volume[i] !== null) {
            validIndices.push(i);
        }
    }

    const priceData = validIndices.map(i => ({
        time: new Date(timestamp[i] * 1000).toISOString().split('T')[0],
        open: open[i],
        high: high[i],
        low: low[i],
        close: close[i],
        volume: volume[i],
    }));

    const volumeData = priceData.map(p => ({
        time: p.time,
        value: p.volume,
        color: p.close >= p.open ? 'rgba(62, 139, 243, 0.5)' : 'rgba(247, 82, 95, 0.5)'
    }));

    return { priceData, volumeData };
};

const mapTimeRangeToYahoo = (tr) => {
    const map = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo',
        'YTD': 'ytd', '1Y': '1y', '5Y': '5y', 'All': 'max'
    };
    return map[tr] || '1y'; // default to 1 year
};

const mapTimeframeToYahoo = (tf) => {
    const map = {
        '1m': '1m', '5m': '5m', '15m': '15m',
        '1h': '1h', '4h': '1h', // Fallback for 4h as it's not directly supported
        '1D': '1d', '1d': '1d',
        '1W': '1wk', '1w': '1wk',
        '1M': '1mo',
    };
    if (tf === '4h') {
        console.warn("Yahoo provider doesn't support 4h timeframe, falling back to 1h.");
    }
    return map[tf] || '1d';
};

const mapTimeframeToBinance = (tf) => {
    const map = {
        '1m': '1m', '5m': '5m', '15m': '15m',
        '1h': '1h', '4h': '4h',
        '1D': '1d', '1d': '1d',
        '1W': '1w', '1w': '1w',
        '1M': '1M',
    };
    return map[tf] || '1d';
};

const formatBinanceData = (binanceResponse) => {
    // Handle error object from Binance (e.g., { "code": -1121, "msg": "Invalid symbol." })
    if (binanceResponse && typeof binanceResponse === 'object' && !Array.isArray(binanceResponse) && binanceResponse.msg) {
        throw new Error(binanceResponse.msg);
    }

    if (!Array.isArray(binanceResponse)) {
        console.error("Invalid Binance data structure", binanceResponse);
        throw new Error('Invalid Binance data structure');
    }

    const priceData = binanceResponse.map(d => ({
        time: new Date(d[0]).toISOString().split('T')[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
    }));

    const volumeData = priceData.map(p => ({
        time: p.time,
        value: p.volume,
        color: p.close >= p.open ? 'rgba(62, 139, 243, 0.5)' : 'rgba(247, 82, 95, 0.5)'
    }));

    return { priceData, volumeData };
};


export const getChartData = async (symbol, timeframe = '1D', provider = 'mock', timeRange = '1Y') => {
    switch (provider) {
        case 'yahoo':
            try {
                const interval = mapTimeframeToYahoo(timeframe);
                const range = mapTimeRangeToYahoo(timeRange);
                // Note: Direct calls to Yahoo may be unstable or subject to CORS issues. A backend proxy is recommended for production.
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=${interval}&useYfid=true&range=${range}`);
                if (!response.ok) {
                    throw new Error(`Yahoo API request failed with status ${response.status}`);
                }
                const data = await response.json();
                if(data?.chart?.error) {
                    throw new Error(data.chart.error.description || 'Unknown Yahoo Finance error');
                }
                return formatYahooData(data);
            } catch (error) {
                console.error(`Failed to fetch from Yahoo for ${symbol}:`, error);
                window.errorToast?.(`Yahoo failed: ${error.message}. Using mock data.`);
                return generateMockData(symbol, timeframe);
            }
        
        case 'binance':
            try {
                const interval = mapTimeframeToBinance(timeframe);
                const binanceSymbol = symbol.toUpperCase().replace(/USD$/, 'USDT');
                
                // Using a public CORS proxy to bypass browser restrictions during development.
                // These proxies can be unreliable and are NOT for production use. A dedicated backend proxy is required for a real application.
                const binanceApiUrl = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=1000`;
                // Switched to a different proxy to resolve potential regional blocks from Binance.
                const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(binanceApiUrl)}`;
                
                const response = await fetch(proxiedUrl);
                
                if (!response.ok) {
                    let errorText = `Proxy request failed with status ${response.status} ${response.statusText}`;
                     try {
                        const body = await response.text();
                        errorText = body || errorText;
                    } catch (e) { /* ignore */ }
                    throw new Error(errorText);
                }
                
                const data = await response.json();
                
                return formatBinanceData(data);
            } catch (error) {
                console.error(`Failed to fetch from Binance for ${symbol}:`, error);
                
                const apiErrorMessage = error.message || 'Unknown error';

                if (apiErrorMessage.toLowerCase().includes('restricted location')) {
                    window.errorToast?.(`Binance API Error: Service unavailable in this region. Falling back to mock data.`);
                } else if (apiErrorMessage.toLowerCase().includes('invalid symbol')) {
                    window.errorToast?.(`Binance API Error: Symbol '${symbol}' not found. Falling back to mock data.`);
                } else {
                    window.errorToast?.(`Binance API Error: ${apiErrorMessage}. Falling back to mock data.`);
                }
                
                return generateMockData(symbol, timeframe);
            }

        case 'kraken':
            // Kraken provider is not fully implemented, using mock data as a fallback.
            return generateMockData(symbol, timeframe);

        case 'mock':
        default:
            // Using a timeout to simulate network latency for mock data as well.
            return new Promise(resolve => {
                setTimeout(() => resolve(generateMockData(symbol, timeframe)), 200);
            });
    }
};

// Main function to fetch chart data, now async and provider-aware.
// For backward compatibility in case some components still use it directly, though they should be updated.
export const generateChartData = (symbol, timeframe) => {
    console.warn("Synchronous `generateChartData` is deprecated. Use async `getChartData` instead.");
    return generateMockData(symbol, timeframe);
};


export const initialStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '171.83', change: '+1.85%', isUp: true, history: [165, 168, 167, 170, 171, 169, 172] },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: '183.01', change: '-0.55%', isUp: false, history: [190, 188, 185, 186, 184, 182, 183] },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '179.24', change: '+0.89%', isUp: true, history: [175, 176, 175, 177, 178, 179, 179] },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: '185.57', change: '-1.21%', isUp: false, history: [190, 189, 188, 187, 186, 185, 185] },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: '449.78', change: '+0.32%', isUp: true, history: [440, 442, 445, 443, 448, 447, 450] },
];