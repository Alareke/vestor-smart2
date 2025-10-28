/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Search, Plus, Trash2, Crosshair, BarChart2, Check } from 'lucide-react';
import type { WatchlistData, WatchlistItem } from '../data/watchlistData';
import { SymbolIcon } from './SymbolIcon';

const filterPillsData = [
    { id: 'all', key: 'add_symbol_filter_all' }, { id: 'stocks', key: 'add_symbol_filter_stocks' }, { id: 'funds', key: 'add_symbol_filter_funds' },
    { id: 'futures', key: 'add_symbol_filter_futures' }, { id: 'forex', key: 'add_symbol_filter_forex' }, { id: 'digital_currencies', key: 'add_symbol_filter_crypto' },
    { id: 'indices', key: 'add_symbol_filter_indices' }, { id: 'bonds', key: 'add_symbol_filter_bonds' }, { id: 'economy', key: 'add_symbol_filter_economy' }, { id: 'options', key: 'add_symbol_filter_options'},
];

const symbolData = [
  // STOCKS (11)
  { id: 'nasdaq_msft', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_microsoft', ticker: 'MSFT', currency: 'USD', actionIcon: { type: 'logo', symbol: 'MSFT' }, category: 'stocks' },
  { id: 'nasdaq_aapl', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_apple', ticker: 'AAPL', currency: 'USD', actionIcon: { type: 'logo', symbol: 'AAPL' }, category: 'stocks' },
  { id: 'nasdaq_tsla', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_tesla', ticker: 'TSLA', currency: 'USD', actionIcon: { type: 'logo', symbol: 'TSLA' }, category: 'stocks' },
  { id: 'nasdaq_nvda', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_nvidia', ticker: 'NVDA', currency: 'USD', actionIcon: { type: 'logo', symbol: 'NVDA' }, category: 'stocks' },
  { id: 'nasdaq_amzn', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_amazon', ticker: 'AMZN', currency: 'USD', actionIcon: { type: 'logo', symbol: 'AMZN' }, category: 'stocks' },
  { id: 'nasdaq_meta', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_meta', ticker: 'META', currency: 'USD', actionIcon: { type: 'logo', symbol: 'META' }, category: 'stocks' },
  { id: 'nyse_jpm', providerKey: 'provider_nyse', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_jpmorgan', ticker: 'JPM', currency: 'USD', actionIcon: { type: 'logo', symbol: 'JPM' }, category: 'stocks' },
  { id: 'nyse_jnj', providerKey: 'provider_nyse', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_johnson', ticker: 'JNJ', currency: 'USD', actionIcon: { type: 'logo', symbol: 'JNJ' }, category: 'stocks' },
  { id: 'nyse_v', providerKey: 'provider_nyse', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_visa', ticker: 'V', currency: 'USD', actionIcon: { type: 'logo', symbol: 'V' }, category: 'stocks' },
  { id: 'nyse_dis', providerKey: 'provider_nyse', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_disney', ticker: 'DIS', currency: 'USD', actionIcon: { type: 'logo', symbol: 'DIS' }, category: 'stocks' },
  { id: 'nasdaq_go', providerKey: 'provider_nasdaq', typeKey: 'asset_type_stock', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_grocery_outlet', ticker: 'GO', currency: 'USD', actionIcon: { type: 'badge', text: 'GO', color: 'bg-red-600' }, category: 'stocks' },

  // FUNDS (10)
  { id: 'nyse_spy', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_spy', ticker: 'SPY', currency: 'USD', actionIcon: { type: 'logo', symbol: 'SPX' }, category: 'funds' },
  { id: 'nasdaq_qqq', providerKey: 'provider_nasdaq', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nasdaq.svg', descKey: 'symbol_desc_qqq', ticker: 'QQQ', currency: 'USD', actionIcon: { type: 'logo', symbol: 'NDX' }, category: 'funds' },
  { id: 'nyse_ivv', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_ivv', ticker: 'IVV', currency: 'USD', actionIcon: { type: 'badge', text: 'S&P', color: 'bg-black' }, category: 'funds' },
  { id: 'nyse_vti', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_vti', ticker: 'VTI', currency: 'USD', actionIcon: { type: 'badge', text: 'Total', color: 'bg-red-800' }, category: 'funds' },
  { id: 'nyse_vea', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_vea', ticker: 'VEA', currency: 'USD', actionIcon: { type: 'badge', text: 'Dev', color: 'bg-red-800' }, category: 'funds' },
  { id: 'nyse_vwo', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_vwo', ticker: 'VWO', currency: 'USD', actionIcon: { type: 'badge', text: 'EM', color: 'bg-red-800' }, category: 'funds' },
  { id: 'nyse_gld', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_gld', ticker: 'GLD', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/gold.svg' }, category: 'funds' },
  { id: 'nyse_arkk', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_arkk', ticker: 'ARKK', currency: 'USD', actionIcon: { type: 'badge', text: 'ARK', color: 'bg-black' }, category: 'funds' },
  { id: 'nyse_iwm', providerKey: 'provider_nyse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nyse.svg', descKey: 'symbol_desc_iwm', ticker: 'IWM', currency: 'USD', actionIcon: { type: 'badge', text: 'R2K', color: 'bg-black' }, category: 'funds' },
  { id: 'tse_233a', providerKey: 'provider_tse', typeKey: 'asset_type_fund_etf', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tse.svg', descKey: 'symbol_desc_nifty50', ticker: '233A', currency: 'INR', actionIcon: { type: 'badge', text: 'D', color: 'bg-red-500' }, category: 'funds' },

  // FUTURES (10)
  { id: 'cme_cl', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_crude_oil', ticker: 'CL1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/wti-crude-oil.svg' }, category: 'futures' },
  { id: 'cme_gc', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_gold', ticker: 'GC1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/gold.svg' }, category: 'futures' },
  { id: 'cme_si', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_silver', ticker: 'SI1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/silver.svg' }, category: 'futures' },
  { id: 'cme_ng', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_natgas', ticker: 'NG1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/natural-gas.svg' }, category: 'futures' },
  { id: 'cme_zc', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_corn', ticker: 'ZC1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/corn.svg' }, category: 'futures' },
  { id: 'cme_zw', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_wheat', ticker: 'ZW1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/wheat.svg' }, category: 'futures' },
  { id: 'cme_zs', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_soybeans', ticker: 'ZS1!', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/soybean.svg' }, category: 'futures' },
  { id: 'cme_6e', providerKey: 'provider_cme', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/cme.svg', descKey: 'symbol_desc_euro_fx', ticker: '6E1!', currency: 'USD', actionIcon: { type: 'forex', flags: ['EU'] }, category: 'futures' },
  { id: 'oanda_xauusd', providerKey: 'provider_oanda', typeKey: 'asset_type_commodity_cfd', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/oanda.svg', descKey: 'symbol_desc_gold', ticker: 'XAUUSD', currency: 'USD', actionIcon: { type: 'image', url: 'https://s3-symbol-logo.tradingview.com/commodity/gold.svg' }, category: 'futures' },
  { id: 'nse_nifty1', providerKey: 'provider_nse', typeKey: 'asset_type_futures', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/nse.svg', descKey: 'symbol_desc_nifty_index_futures', ticker: '!NIFTY1', currency: 'INR', actionIcon: { type: 'badge', text: '50', color: 'bg-blue-600' }, category: 'futures' },

  // FOREX (10)
  { id: 'forex_eurusd', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_eurusd', ticker: 'EURUSD', currency: 'USD', actionIcon: { type: 'forex', flags: ['EU', 'US'] }, category: 'forex' },
  { id: 'forex_gbpusd', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_gbpusd', ticker: 'GBPUSD', currency: 'USD', actionIcon: { type: 'forex', flags: ['GB', 'US'] }, category: 'forex' },
  { id: 'forex_usdjpy', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_usdjpy', ticker: 'USDJPY', currency: 'JPY', actionIcon: { type: 'forex', flags: ['US', 'JP'] }, category: 'forex' },
  { id: 'forex_audusd', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_audusd', ticker: 'AUDUSD', currency: 'USD', actionIcon: { type: 'forex', flags: ['AU', 'US'] }, category: 'forex' },
  { id: 'forex_usdcad', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_usdcad', ticker: 'USDCAD', currency: 'CAD', actionIcon: { type: 'forex', flags: ['US', 'CA'] }, category: 'forex' },
  { id: 'forex_usdchf', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_usdchf', ticker: 'USDCHF', currency: 'CHF', actionIcon: { type: 'forex', flags: ['US', 'CH'] }, category: 'forex' },
  { id: 'forex_nzdusd', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_nzdusd', ticker: 'NZDUSD', currency: 'USD', actionIcon: { type: 'forex', flags: ['NZ', 'US'] }, category: 'forex' },
  { id: 'forex_eurgbp', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_eurgbp', ticker: 'EURGBP', currency: 'GBP', actionIcon: { type: 'forex', flags: ['EU', 'GB'] }, category: 'forex' },
  { id: 'forex_eurjpy', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_eurjpy', ticker: 'EURJPY', currency: 'JPY', actionIcon: { type: 'forex', flags: ['EU', 'JP'] }, category: 'forex' },
  { id: 'forex_gbpchf', providerKey: 'provider_forex', typeKey: 'markets_forex_title', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/forex.svg', descKey: 'symbol_desc_gbpchf', ticker: 'GBPCHF', currency: 'CHF', actionIcon: { type: 'forex', flags: ['GB', 'CH'] }, category: 'forex' },

  // CRYPTO (11)
  { id: 'cbse_btcusd', providerKey: 'provider_cbse', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/coinbase.svg', descKey: 'symbol_desc_bitcoin', ticker: 'BTCUSD', currency: 'USD', actionIcon: { type: 'logo', symbol: 'BTC' }, category: 'digital_currencies' },
  { id: 'cbse_ethusd', providerKey: 'provider_cbse', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/coinbase.svg', descKey: 'symbol_desc_ethereum', ticker: 'ETHUSD', currency: 'USD', actionIcon: { type: 'logo', symbol: 'ETH' }, category: 'digital_currencies' },
  { id: 'binance_solusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_solana', ticker: 'SOLUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'SOL' }, category: 'digital_currencies' },
  { id: 'binance_xrpusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_xrp', ticker: 'XRPUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'XRP' }, category: 'digital_currencies' },
  { id: 'binance_adausdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_cardano', ticker: 'ADAUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'ADA' }, category: 'digital_currencies' },
  { id: 'binance_dogeusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_dogecoin', ticker: 'DOGEUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'DOGE' }, category: 'digital_currencies' },
  { id: 'binance_bnbusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_bnb', ticker: 'BNBUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'BNB' }, category: 'digital_currencies' },
  { id: 'binance_maticusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_polygon', ticker: 'MATICUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'MATIC' }, category: 'digital_currencies' },
  { id: 'binance_dotusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_polkadot', ticker: 'DOTUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'DOT' }, category: 'digital_currencies' },
  { id: 'binance_ltcusdt', providerKey: 'provider_binance', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/binance.svg', descKey: 'symbol_desc_litecoin', ticker: 'LTCUSDT', currency: 'USDT', actionIcon: { type: 'logo', symbol: 'LTC' }, category: 'digital_currencies' },
  { id: 'crypto_btcusd', providerKey: 'provider_crypto', typeKey: 'asset_type_spot_crypto', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/crypto.svg', descKey: 'symbol_desc_bitcoin', ticker: 'BTCUSD', currency: 'USD', actionIcon: { type: 'logo', symbol: 'BTC' }, category: 'digital_currencies' },

  // INDICES (10)
  { id: 'tvc_spx', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_spx', ticker: 'SPX', currency: 'USD', actionIcon: { type: 'logo', symbol: 'SPX' }, category: 'indices' },
  { id: 'tvc_ndx', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_ndx', ticker: 'NDX', currency: 'USD', actionIcon: { type: 'logo', symbol: 'NDX' }, category: 'indices' },
  { id: 'tvc_dji', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_dji', ticker: 'DJI', currency: 'USD', actionIcon: { type: 'logo', symbol: 'DJI' }, category: 'indices' },
  { id: 'tvc_dax', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_dax', ticker: 'DEU40', currency: 'EUR', actionIcon: { type: 'logo', symbol: 'DEU40' }, category: 'indices' },
  { id: 'tvc_ftse', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_ftse100', ticker: 'UK100', currency: 'GBP', actionIcon: { type: 'logo', symbol: 'UKX' }, category: 'indices' },
  { id: 'tvc_n225', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_n225', ticker: 'NI225', currency: 'JPY', actionIcon: { type: 'logo', symbol: 'NI225' }, category: 'indices' },
  { id: 'tvc_hsi', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_hsi', ticker: 'HSI', currency: 'HKD', actionIcon: { type: 'logo', symbol: 'HSI' }, category: 'indices' },
  { id: 'tvc_tasi', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_tasi', ticker: 'TASI', currency: 'SAR', actionIcon: { type: 'logo', symbol: 'TASI' }, category: 'indices' },
  { id: 'capitalcom_us500', providerKey: 'provider_capitalcom', typeKey: 'asset_type_index_cfd', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/capitalcom.svg', descKey: 'symbol_desc_us500', ticker: 'US500', currency: 'USD', actionIcon: { type: 'badge', text: '500', color: 'bg-red-500' }, category: 'indices' },
  { id: 'tvc_dxy', providerKey: 'provider_tvc', typeKey: 'asset_type_index', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_dxy', ticker: 'DXY', currency: 'Points', actionIcon: { type: 'forex', flags: ['US'] }, category: 'indices' },

  // BONDS (10)
  { id: 'tvc_us10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_us10y', ticker: 'US10Y', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'bonds' },
  { id: 'tvc_de10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_de10y', ticker: 'DE10Y', currency: '%', actionIcon: { type: 'forex', flags: ['DE'] }, category: 'bonds' },
  { id: 'tvc_us02y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_us02y', ticker: 'US02Y', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'bonds' },
  { id: 'tvc_us30y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_us30y', ticker: 'US30Y', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'bonds' },
  { id: 'tvc_gb10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_gb10y', ticker: 'GB10Y', currency: '%', actionIcon: { type: 'forex', flags: ['GB'] }, category: 'bonds' },
  { id: 'tvc_jp10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_jp10y', ticker: 'JP10Y', currency: '%', actionIcon: { type: 'forex', flags: ['JP'] }, category: 'bonds' },
  { id: 'tvc_fr10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_fr10y', ticker: 'FR10Y', currency: '%', actionIcon: { type: 'forex', flags: ['FR'] }, category: 'bonds' },
  { id: 'tvc_it10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_it10y', ticker: 'IT10Y', currency: '%', actionIcon: { type: 'forex', flags: ['IT'] }, category: 'bonds' },
  { id: 'tvc_es10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_es10y', ticker: 'ES10Y', currency: '%', actionIcon: { type: 'forex', flags: ['ES'] }, category: 'bonds' },
  { id: 'tvc_cn10y', providerKey: 'provider_tvc', typeKey: 'asset_type_bond', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_cn10y', ticker: 'CN10Y', currency: '%', actionIcon: { type: 'forex', flags: ['CN'] }, category: 'bonds' },

  // ECONOMY (10)
  { id: 'tvc_vix', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_vix', ticker: 'VIX', currency: 'Points', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },
  { id: 'tvc_usinfl', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_usinfl', ticker: 'USINFL', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },
  { id: 'tvc_usunrate', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_usunrate', ticker: 'USUNRATE', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },
  { id: 'tvc_usgdp', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_usgdp', ticker: 'USGDP', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },
  { id: 'tvc_fedfunds', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_fedfunds', ticker: 'FEDFUNDS', currency: '%', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },
  { id: 'tvc_deucpi', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_deucpi', ticker: 'DEUCPI', currency: '%', actionIcon: { type: 'forex', flags: ['DE'] }, category: 'economy' },
  { id: 'tvc_gbrcpi', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_gbrcpi', ticker: 'GBRCPI', currency: '%', actionIcon: { type: 'forex', flags: ['GB'] }, category: 'economy' },
  { id: 'tvc_jpncpi', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_jpncpi', ticker: 'JPNCPI', currency: '%', actionIcon: { type: 'forex', flags: ['JP'] }, category: 'economy' },
  { id: 'tvc_cnycpi', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_cnycpi', ticker: 'CNYCPI', currency: '%', actionIcon: { type: 'forex', flags: ['CN'] }, category: 'economy' },
  { id: 'tvc_dxy_econ', providerKey: 'provider_tvc', typeKey: 'asset_type_economic', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/tvc.svg', descKey: 'symbol_desc_dxy', ticker: 'DXY', currency: 'Points', actionIcon: { type: 'forex', flags: ['US'] }, category: 'economy' },

  // OPTIONS (10)
  { id: 'option_aapl_call', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_aapl_call', ticker: "AAPL C200 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'AAPL' }, category: 'options' },
  { id: 'option_tsla_put', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_tsla_put', ticker: "TSLA P250 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'TSLA' }, category: 'options' },
  { id: 'option_spy_call', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_spy_call', ticker: "SPY C550 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'SPY' }, category: 'options' },
  { id: 'option_qqq_put', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_qqq_put', ticker: "QQQ P450 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'QQQ' }, category: 'options' },
  { id: 'option_amzn_call', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_amzn_call', ticker: "AMZN C200 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'AMZN' }, category: 'options' },
  { id: 'option_goog_put', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_goog_put', ticker: "GOOG P180 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'GOOGL' }, category: 'options' },
  { id: 'option_msft_call', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_msft_call', ticker: "MSFT C450 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'MSFT' }, category: 'options' },
  { id: 'option_nvda_put', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_nvda_put', ticker: "NVDA P100 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'NVDA' }, category: 'options' },
  { id: 'option_jpm_call', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_jpm_call', ticker: "JPM C200 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'JPM' }, category: 'options' },
  { id: 'option_xom_put', providerKey: 'provider_options', typeKey: 'asset_type_option', iconUrl: 'https://s3-symbol-logo.tradingview.com/provider/options.svg', descKey: 'symbol_desc_xom_put', ticker: "XOM P100 '24", currency: 'USD', actionIcon: { type: 'logo', symbol: 'XOM' }, category: 'options' },
];

const ActionIcon = ({ icon, ticker }) => {
    switch (icon.type) {
        case 'badge': return <div className={`text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full ${icon.color}`}>{icon.text}</div>;
        case 'button': return <button className="p-2 text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"><icon.icon size={20}/></button>;
        case 'crypto': return <SymbolIcon symbol={ticker} size={28} />;
        case 'logo': return <SymbolIcon symbol={ticker} size={28} />;
        case 'image': return <SymbolIcon symbol={ticker} size={28} />;
        case 'forex': return <div className="flex -space-x-2">{icon.flags.map(flag => <img key={flag} src={`https://s3-symbol-logo.tradingview.com/country/${flag}.svg`} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" />)}</div>;
        default: return null;
    }
};

const SymbolRow: React.FC<{
    item: any;
    t: (key: string) => string;
    onAdd: (item: any) => void;
    isAdded: boolean;
    onMouseEnter: () => void;
}> = ({ item, t, onAdd, isAdded, onMouseEnter }) => {
    return (
        <div 
            onMouseEnter={onMouseEnter}
            className="flex items-center p-2.5 border-b border-gray-200 dark:border-gray-800/80 hover:bg-gray-100/50 dark:hover:bg-gray-800/20"
        >
            <button
                onClick={() => onAdd(item)}
                disabled={isAdded}
                className="p-1.5 rounded-full disabled:cursor-not-allowed text-blue-600 dark:text-blue-500 hover:bg-blue-500/10 transition-colors"
                aria-label={isAdded ? `Symbol ${item.ticker} added` : `Add symbol ${item.ticker}`}
            >
                {isAdded ? <Check size={20} className="text-green-500" /> : <Plus size={20} />}
            </button>
            <div className="flex items-center gap-2 mx-2">
                <button className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white"><Crosshair size={16} /></button>
                <button className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white"><Trash2 size={16} /></button>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SymbolIcon symbol={t(item.providerKey)} size={28} />
                <div>
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">{t(item.providerKey)}</span>
                    <span className="text-gray-500 text-xs ms-2">{t(item.typeKey)}</span>
                </div>
            </div>
            <div className="flex-1 text-gray-600 dark:text-gray-400 text-sm truncate px-4">{t(item.descKey)}</div>
            <div className="w-24 text-gray-900 dark:text-white font-semibold text-sm text-left">{item.ticker}</div>
            <div className="w-12 flex items-center justify-center">
                <ActionIcon icon={item.actionIcon} ticker={item.ticker} />
            </div>
        </div>
    );
}

const providerToCountry = {
    'provider_nasdaq': 'us',
    'provider_nyse': 'us',
    'provider_tse': 'jp',
    'provider_nse': 'in',
    'provider_cbse': 'us',
};

const SymbolDetails = ({ symbol, t, onAdd, isAdded }) => {
    let countryCodes: string[] = [];
    if (symbol.actionIcon.type === 'forex' && symbol.actionIcon.flags) {
        countryCodes = symbol.actionIcon.flags;
    } else if (['stocks', 'funds'].includes(symbol.category) && providerToCountry[symbol.providerKey]) {
        countryCodes = [providerToCountry[symbol.providerKey]];
    }

    return (
        <div className="p-6 flex flex-col items-center text-center h-full">
            <SymbolIcon symbol={symbol.ticker} size={64} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">{t(symbol.descKey)}</h3>
            <p className="text-sm text-gray-500 font-mono">{symbol.ticker}</p>

            <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4"></div>

            <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t('add_symbol_details_provider')}</span>
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <img src={symbol.iconUrl} className="w-5 h-5 rounded-full" />
                        <span>{t(symbol.providerKey)}</span>
                    </div>
                </div>
                {countryCodes.length > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">{t('add_symbol_details_countries')}</span>
                        <div className="flex items-center gap-1">
                            {countryCodes.map(code => (
                                <img key={code} src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`} alt={code} className="w-5 h-auto rounded-sm"/>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">{t('add_symbol_details_type')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{t(symbol.typeKey)}</span>
                </div>
            </div>

            <div className="mt-auto w-full pt-4">
                 <button
                    onClick={() => onAdd(symbol)}
                    disabled={isAdded}
                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    {isAdded ? (
                        <>
                            <Check size={20}/> {t('add_symbol_details_added')}
                        </>
                    ) : (
                         <>
                            <Plus size={20}/> {t('add_symbol_details_add_to_watchlist')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export const AddSymbolModal = ({ isOpen, onClose, onAddSymbol, watchlistData }: {
    isOpen: boolean;
    onClose: () => void;
    onAddSymbol: (symbol: WatchlistItem) => void;
    watchlistData: WatchlistData;
}) => {
    const { t } = useLanguage();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
    const [hoveredSymbol, setHoveredSymbol] = useState<any | null>(null);
    
    useEffect(() => {
        if (isOpen) {
            const allWatchlistSymbols = new Set(Object.values(watchlistData).flatMap(cat => cat.items.map(item => item.symbol)));
            setAddedSymbols(allWatchlistSymbols);
            setHoveredSymbol(null);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen, watchlistData]);

    const filteredSymbols = useMemo(() => {
        let symbols = symbolData;

        if (activeFilter !== 'all') {
            symbols = symbols.filter(symbol => symbol.category === activeFilter);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            symbols = symbols.filter(symbol => 
                t(symbol.descKey).toLowerCase().includes(lowercasedTerm) ||
                symbol.ticker.toLowerCase().includes(lowercasedTerm) ||
                t(symbol.providerKey).toLowerCase().includes(lowercasedTerm)
            );
        }

        return symbols;
    }, [activeFilter, searchTerm, t]);

    const convertModalSymbolToWatchlistItem = (modalSymbol: typeof symbolData[0]): WatchlistItem => {
        const price = (Math.random() * 200 + 10);
        const change = (Math.random() * 10 - 5);
        const changePct = (change / price) * 100;
        
        return {
            key: modalSymbol.ticker,
            symbol: modalSymbol.ticker,
            nameKey: modalSymbol.descKey,
            price: price.toFixed(2),
            change: change,
            changePct: changePct,
            isPositive: change >= 0,
            currency: modalSymbol.currency || 'USD',
            typeKey: modalSymbol.typeKey
        };
    };

    const handleAddClick = (item: any) => {
        const watchlistItem = convertModalSymbolToWatchlistItem(item);
        onAddSymbol(watchlistItem);
        setAddedSymbols(prev => new Set(prev).add(item.ticker));
    };

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#131722] rounded-xl shadow-2xl w-full max-w-5xl mx-auto flex flex-col h-[90vh] max-h-[700px]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('add_symbol_panel_title')}</h2>
                     <div className="relative w-full max-w-md mx-4">
                        <input
                            ref={searchInputRef}
                            type="text" 
                            placeholder={t('add_symbol_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-100 dark:bg-[#1C2331] text-gray-900 dark:text-gray-300 placeholder-gray-500 rounded-md py-2 ps-9 pe-4 w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-transparent focus:border-cyan-500" 
                        />
                        <Search className="absolute top-1/2 -translate-y-1/2 start-2.5 text-gray-500" size={18} />
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2">
                        {filterPillsData.map(pill => (
                            <button 
                                key={pill.id}
                                onClick={() => setActiveFilter(pill.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                                    activeFilter === pill.id 
                                    ? 'bg-gray-800 text-white dark:bg-white dark:text-black' 
                                    : 'bg-gray-200 text-gray-700 dark:bg-[#2A2E39] dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {t(pill.key)}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-1 flex overflow-hidden">
                    <div className="w-2/3 overflow-y-auto custom-scrollbar pr-1">
                        {filteredSymbols.length > 0 ? (
                            filteredSymbols.map(item => {
                                const isAdded = addedSymbols.has(item.ticker);
                                return <SymbolRow 
                                            key={item.id} 
                                            item={item} 
                                            t={t} 
                                            onAdd={handleAddClick} 
                                            isAdded={isAdded}
                                            onMouseEnter={() => setHoveredSymbol(item)}
                                        />;
                            })
                        ) : (
                            <div className="text-center p-16 text-gray-500">
                                <p>{t('add_symbol_modal_no_results')}</p>
                            </div>
                        )}
                    </div>
                    <div className="w-1/3 flex-shrink-0 border-s border-gray-200 dark:border-gray-800">
                        {hoveredSymbol ? (
                            <SymbolDetails 
                                symbol={hoveredSymbol} 
                                t={t} 
                                onAdd={handleAddClick}
                                isAdded={addedSymbols.has(hoveredSymbol.ticker)}
                            />
                        ) : (
                            <div className="p-6 h-full flex items-center justify-center text-center text-gray-500">
                                <p>{t('add_symbol_select_prompt')}</p>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="flex-shrink-0 bg-gray-50 dark:bg-black/50 p-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <span>{t('add_symbol_footer_text')}</span>
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-1.5 py-0.5 rounded-md mx-1">{t('key_enter')}</span>
                    +
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-1.5 py-0.5 rounded-md mx-1">{t('key_shift')}</span>
                    <span className="mx-1">{t('key_or')}</span>
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-1.5 py-0.5 rounded-md mx-1">{t('key_shift')}</span>
                    +
                    <span>{t('key_click')}</span>
                </footer>
            </div>
        </div>,
        document.body
    );
};