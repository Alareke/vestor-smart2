/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { generateChartData, genericDetailsTemplate } from './chartData';

// Types
export interface WatchlistItem {
    key: string;
    symbol: string;
    nameKey: string;
    price: string;
    change: number;
    changePct: number;
    isPositive: boolean;
    typeKey?: string;
    prefixType?: 'dot' | 'none';
    dividend?: boolean;
    badge?: number;
    badgeColor?: string;
    currency: string;
    iconUrl?: string;
    iconType?: 'forex' | 'image';
    flags?: string[];
}

export interface WatchlistCategory {
    titleKey: string;
    items: WatchlistItem[];
}

export interface WatchlistData {
    [key: string]: WatchlistCategory;
}


// Default Watchlist Data
export const initialWatchlistData: WatchlistData = {
    indices: {
        titleKey: 'category_indices',
        items: [
            { key: 'MT30', symbol: 'MT30', nameKey: 'mt30_name', price: '1,397.24', change: -1.36, changePct: -0.10, isPositive: false, prefixType: 'dot', iconUrl: '/assets/icons/indices/TASI.svg', currency: 'SAR', typeKey: 'index' },
            { key: 'SPX', symbol: 'SPX', nameKey: 'spx_name', price: '6,289.97', change: 51.98, changePct: 0.83, isPositive: true, prefixType: 'dot', iconUrl: '/assets/icons/indices/SPX.svg', currency: 'USD', typeKey: 'index' },
            { key: 'NDX', symbol: 'NDX', nameKey: 'ndq_name', price: '22,763.31', change: -455.51, changePct: -1.96, isPositive: false, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/index/NDX.svg', currency: 'USD', typeKey: 'index' },
            { key: 'DJI', symbol: 'DJI', nameKey: 'dji_name', price: '43,893.52', change: 305.11, changePct: 0.70, isPositive: true, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/index/DJI.svg', currency: 'USD', typeKey: 'index'},
            { key: 'NIFTY', symbol: 'NIFTY', nameKey: 'nifty_name', price: '25,237.40', change: 111.95, changePct: 0.44, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/index/NIFTY_50.svg', currency: 'INR', typeKey: 'index' },
            { key: 'DEU40', symbol: 'DEU40', nameKey: 'dax_name', price: '18,496.71', change: 147.96, changePct: 0.81, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/index/DEU40.svg', currency: 'EUR', typeKey: 'index' },
            { key: 'NI225', symbol: 'NI225', nameKey: 'nikkei_name', price: '38,596.47', change: -106.38, changePct: -0.28, isPositive: false, iconUrl: 'https://s3-symbol-logo.tradingview.com/index/NI225.svg', currency: 'JPY', typeKey: 'index' },
            { key: 'UKX', symbol: 'UKX', nameKey: 'ftse_name', price: '8,230.55', change: 25.10, changePct: 0.31, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/index/UKX.svg', currency: 'GBP', typeKey: 'index' },
        ],
    },
    stocks: {
        titleKey: 'category_stocks',
        items: [
            { key: '2222', symbol: '2222', nameKey: 'stock_2222_name', price: '28.50', change: 0.10, changePct: 0.35, isPositive: true, dividend: true, iconUrl: '/assets/icons/stocks/saudi-aramco.svg', currency: 'SAR', typeKey: 'stock' },
            { key: '1150', symbol: '1150', nameKey: 'stock_1150_name', price: '25.82', change: -0.42, changePct: -1.60, isPositive: false, dividend: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/alinma-bank.svg', currency: 'SAR', typeKey: 'stock' },
            { key: '1120', symbol: '1120', nameKey: 'stock_1120_name', price: '95.30', change: -0.70, changePct: -0.73, isPositive: false, dividend: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/al-rajhi-bank.svg', currency: 'SAR', typeKey: 'stock' },
            { key: '7010', symbol: '7010', nameKey: 'stock_stc_name', price: '38.15', change: 0.10, changePct: 0.26, isPositive: true, dividend: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/saudi-telecom.svg', currency: 'SAR', typeKey: 'stock' },
            { key: '2010', symbol: '2010', nameKey: 'screener_stock_name_sabic_sa', price: '85.40', change: -0.93, changePct: -1.08, isPositive: false, dividend: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/sabic.svg', currency: 'SAR', typeKey: 'stock' },
            { key: 'AAPL', symbol: 'AAPL', nameKey: 'stock_aapl_name', price: '205.42', change: -2.16, changePct: -1.04, isPositive: false, prefixType: 'dot', iconUrl: '/assets/icons/stocks/AAPL.svg', currency: 'USD', typeKey: 'stock' },
            { key: 'TSLA', symbol: 'TSLA', nameKey: 'stock_tsla_name', price: '304.71', change: -3.55, changePct: -1.15, isPositive: false, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/tesla.svg', currency: 'USD', typeKey: 'stock' },
            { key: 'MSFT', symbol: 'MSFT', nameKey: 'stock_msft_name', price: '445.70', change: 1.12, changePct: 0.25, isPositive: true, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/microsoft.svg', currency: 'USD', typeKey: 'stock' },
            { key: 'GOOGL', symbol: 'GOOGL', nameKey: 'stock_googl_name', price: '179.22', change: -1.88, changePct: -1.04, isPositive: false, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/google.svg', currency: 'USD', typeKey: 'stock' },
            { key: 'AMZN', symbol: 'AMZN', nameKey: 'screener_stock_name_amzn', price: '189.08', change: 2.55, changePct: 1.37, isPositive: true, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/amazon.svg', currency: 'USD', typeKey: 'stock' },
            { key: 'NVDA', symbol: 'NVDA', nameKey: 'screener_stock_name_nvda', price: '120.88', change: 2.55, changePct: 2.15, isPositive: true, prefixType: 'dot', iconUrl: 'https://s3-symbol-logo.tradingview.com/nvidia.svg', currency: 'USD', typeKey: 'stock' },
        ],
    },
    forex: {
        titleKey: 'category_forex',
        items: [
            { key: 'EURUSD', symbol: 'EURUSD', nameKey: 'forex_eurusd_name', price: '1.2058', change: 0.002, changePct: 0.17, isPositive: true, iconType: 'forex', flags: ['EU', 'US'], currency: 'USD', typeKey: 'forex' },
            { key: 'GBPUSD', symbol: 'GBPUSD', nameKey: 'forex_gbpusd_name', price: '1.3879', change: -0.001, changePct: -0.07, isPositive: false, iconType: 'forex', flags: ['GB', 'US'], currency: 'USD', typeKey: 'forex' },
            { key: 'USDJPY', symbol: 'USDJPY', nameKey: 'forex_usdjpy_name', price: '109.83', change: 0.15, changePct: 0.14, isPositive: true, iconType: 'forex', flags: ['US', 'JP'], currency: 'JPY', typeKey: 'forex' },
            { key: 'USDCAD', symbol: 'USDCAD', nameKey: 'forex_usdcad_name', price: '1.3700', change: -0.0025, changePct: -0.18, isPositive: false, iconType: 'forex', flags: ['US', 'CA'], currency: 'CAD', typeKey: 'forex' },
            { key: 'AUDUSD', symbol: 'AUDUSD', nameKey: 'forex_audusd_name', price: '0.6650', change: 0.0030, changePct: 0.45, isPositive: true, iconType: 'forex', flags: ['AU', 'US'], currency: 'USD', typeKey: 'forex' },
            { key: 'USDCHF', symbol: 'USDCHF', nameKey: 'forex_usdchf_name', price: '0.9150', change: 0.0010, changePct: 0.11, isPositive: true, iconType: 'forex', flags: ['US', 'CH'], currency: 'CHF', typeKey: 'forex' },
        ],
    },
    futures: {
        titleKey: 'category_futures',
        items: [
            { key: 'USOIL', symbol: 'USOIL', nameKey: 'futures_usoil_name', price: '65.80', change: 1.20, changePct: 1.86, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/commodity/wti-crude-oil.svg', currency: 'USD', typeKey: 'futures' },
            { key: 'UKOIL', symbol: 'UKOIL', nameKey: 'futures_ukoil_name', price: '68.90', change: 1.10, changePct: 1.62, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/commodity/brent-crude-oil.svg', currency: 'USD', typeKey: 'futures' },
            { key: 'GOLD', symbol: 'GOLD', nameKey: 'futures_gold_name', price: '3,336.1', change: 0.30, changePct: 0.01, isPositive: true, iconUrl: '/assets/icons/commodities/GOLD.svg', currency: 'USD', typeKey: 'futures' },
            { key: 'SILVER', symbol: 'SILVER', nameKey: 'futures_silver_name', price: '29.50', change: -0.25, changePct: -0.84, isPositive: false, iconUrl: 'https://s3-symbol-logo.tradingview.com/commodity/silver.svg', currency: 'USD', typeKey: 'futures' },
            { key: 'NATGAS', symbol: 'NATGAS', nameKey: 'futures_natgas_name', price: '2.90', change: 0.05, changePct: 1.75, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/commodity/natural-gas.svg', currency: 'USD', typeKey: 'futures' },
            { key: 'COPPER', symbol: 'COPPER', nameKey: 'futures_copper', price: '4.50', change: 0.02, changePct: 0.45, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/commodity/copper.svg', currency: 'USD', typeKey: 'futures' },
        ],
    },
    digital_currencies: {
        titleKey: 'category_crypto',
        items: [
            { key: 'BTCUSD', symbol: 'BTCUSD', nameKey: 'crypto_btcusd_name', price: '114,231', change: 114.23, changePct: 0.10, isPositive: true, iconUrl: '/assets/icons/crypto/BTC.svg', currency: 'USD', typeKey: 'crypto' },
            { key: 'ETHUSD', symbol: 'ETHUSD', nameKey: 'crypto_ethusd_name', price: '3,575.24', change: -80.93, changePct: -2.22, isPositive: false, iconUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg', currency: 'USD', typeKey: 'crypto' },
            { key: 'BTCUSDT', symbol: 'BTCUSDT', nameKey: 'crypto_btcusdt_name', price: '114,233', change: 137.08, changePct: 0.12, isPositive: true, iconUrl: '/assets/icons/crypto/BTC.svg', currency: 'USDT', typeKey: 'crypto' },
            { key: 'SOLUSD', symbol: 'SOLUSD', nameKey: 'crypto_solana_name', price: '165.80', change: 4.50, changePct: 2.79, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL.svg', currency: 'USD', typeKey: 'crypto' },
            { key: 'ADAUSD', symbol: 'ADAUSD', nameKey: 'crypto_cardano_name', price: '0.4567', change: -0.008, changePct: -1.72, isPositive: false, iconUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCADA.svg', currency: 'USD', typeKey: 'crypto' },
            { key: 'XRPUSD', symbol: 'XRPUSD', nameKey: 'crypto_xrp_name', price: '0.5234', change: 0.0012, changePct: 0.23, isPositive: true, iconUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP.svg', currency: 'USD', typeKey: 'crypto' },
            { key: 'DOGEUSD', symbol: 'DOGEUSD', nameKey: 'crypto_doge_name', price: '0.1589', change: -0.002, changePct: -1.24, isPositive: false, iconUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOGE.svg', currency: 'USD', typeKey: 'crypto' },
        ],
    }
};

// Default Detailed Watchlist Data
export const initialDetailedWatchlistData = {
    'AAPL': {
        ...genericDetailsTemplate,
        nameKey: 'stock_aapl_name',
        ...generateChartData(205.42, -1.04, true),
    },
    'TSLA': {
        ...genericDetailsTemplate,
        nameKey: 'stock_tsla_name',
        sectorKey: 'stock_detail_tsla_sector',
        descriptionKey: 'description_text_tsla',
        ...generateChartData(304.71, -1.15, true),
    },
    '2222': {
        ...genericDetailsTemplate,
        nameKey: 'stock_2222_name',
        exchange: 'TADAWUL',
        sectorKey: 'stock_detail_2222_sector',
        descriptionKey: 'description_text_2222',
        ...generateChartData(28.50, 0.35, true),
    },
    '1150': {
        ...genericDetailsTemplate,
        nameKey: 'stock_1150_name',
        exchange: 'TADAWUL',
        sectorKey: 'stock_detail_1150_sector',
        descriptionKey: 'description_text_1150',
        ...generateChartData(25.82, -1.60, true),
    },
    '1120': {
        ...genericDetailsTemplate,
        nameKey: 'stock_1120_name',
        exchange: 'TADAWUL',
        sectorKey: 'stock_detail_1120_sector',
        descriptionKey: 'description_text_1120',
        ...generateChartData(95.30, -0.73, true),
    },
    'MSFT': {
        ...genericDetailsTemplate,
        nameKey: 'stock_msft_name',
        ...generateChartData(445.70, 0.25, true),
    },
    'GOOGL': {
        ...genericDetailsTemplate,
        nameKey: 'stock_googl_name',
        ...generateChartData(179.22, -1.04, true),
    },
    '2010': {
        ...genericDetailsTemplate,
        nameKey: 'screener_stock_name_sabic_sa',
        exchange: 'TADAWUL',
        ...generateChartData(85.40, -1.08, true),
    },
};