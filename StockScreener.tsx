/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, ChevronUp, Hexagon, ChevronDown, Plus, MoreHorizontal, RefreshCw, ArrowDown, ArrowUp, Search, LayoutGrid, Cloud, List, Bot, Loader2 } from 'lucide-react';
import { IndexFilterModal } from './IndexFilterModal';
import { PriceFilterModal } from './PriceFilterModal';
import { InteractiveChart } from './InteractiveChart';
import { MarketSelectorModal } from './MarketSelectorModal';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

// FIX: Add withRetry helper function to handle API call retries.
// A helper for API calls with retry logic for rate limiting and network errors
async function withRetry<T>(fn: () => Promise<T>, retries = 10, delay = 5000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const message = err.message || err.toString();
            // Retry on 429 (rate limit) or generic XHR errors
            if (message.includes('429') || message.includes('xhr error')) {
                if (i < retries - 1) { // Don't wait on the last attempt
                    const waitTime = delay * Math.pow(2, i) + Math.random() * 1000; // Exponential backoff with jitter
                    await new Promise(res => setTimeout(res, waitTime));
                } else {
                    throw err; // Re-throw last error after all retries
                }
            } else {
                // Don't retry on other errors
                throw err;
            }
        }
    }
    throw lastError;
}

const screenerDataRaw = [
    { symbol: 'NVDA', logo: 'https://s3-symbol-logo.tradingview.com/nvidia.svg', nameKey: 'screener_stock_name_nvda', market: 'us', price: 175.03, changePct: -1.60, volume: '66.9M', relVolume: 0.43, marketCap: 4.27, marketCapUnit: 'T', p_e: 56.38, eps_ttm: 3.10, eps_dil_growth_ttm_yoy: 81.60, div_yield_ttm: 0.02, sectorKey: 'screener_sector_electronic_technology', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'MSFT', logo: 'https://s3-symbol-logo.tradingview.com/microsoft.svg', nameKey: 'screener_stock_name_msft', market: 'us', price: 527.90, changePct: -1.05, volume: '7.61M', relVolume: 0.36, marketCap: 3.92, marketCapUnit: 'T', p_e: 38.70, eps_ttm: 13.64, eps_dil_growth_ttm_yoy: 15.60, div_yield_ttm: 0.61, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'AAPL', logo: 'https://s3-symbol-logo.tradingview.com/apple.svg', nameKey: 'screener_stock_name_aapl', market: 'us', price: 205.42, changePct: -1.04, volume: '29.34M', relVolume: 0.59, marketCap: 3.07, marketCapUnit: 'T', p_e: 32.06, eps_ttm: 6.41, eps_dil_growth_ttm_yoy: -0.36, div_yield_ttm: 0.49, sectorKey: 'screener_sector_electronic_technology', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'AMZN', logo: 'https://s3-symbol-logo.tradingview.com/amazon.svg', nameKey: 'screener_stock_name_amzn', market: 'us', price: 219.09, changePct: -6.42, volume: '41.27M', relVolume: 1.00, marketCap: 2.33, marketCapUnit: 'T', p_e: 35.73, eps_ttm: 6.13, eps_dil_growth_ttm_yoy: 72.20, div_yield_ttm: 0.00, sectorKey: 'screener_sector_retail_trade', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'GOOG', logo: 'https://s3-symbol-logo.tradingview.com/google.svg', nameKey: 'screener_stock_name_goog', market: 'us', price: 190.24, changePct: -1.36, volume: '6.9M', relVolume: 0.24, marketCap: 2.29, marketCapUnit: 'T', p_e: 20.26, eps_ttm: 9.39, eps_dil_growth_ttm_yoy: 34.67, div_yield_ttm: 0.42, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'META', logo: 'https://s3-symbol-logo.tradingview.com/meta.svg', nameKey: 'screener_stock_name_meta', market: 'us', price: 757.71, changePct: -2.03, volume: '6.54M', relVolume: 0.45, marketCap: 1.9, marketCapUnit: 'T', p_e: 27.44, eps_ttm: 27.61, eps_dil_growth_ttm_yoy: 40.98, div_yield_ttm: 0.27, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'AVGO', logo: 'https://s3-symbol-logo.tradingview.com/broadcom.svg', nameKey: 'screener_stock_name_avgo', market: 'us', price: 290.10, changePct: -1.23, volume: '6.61M', relVolume: 0.38, marketCap: 1.36, marketCapUnit: 'T', p_e: 109.05, eps_ttm: 2.66, eps_dil_growth_ttm_yoy: 14.45, div_yield_ttm: 0.78, sectorKey: 'screener_sector_electronic_technology', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'MA', logo: 'https://s3-symbol-logo.tradingview.com/mastercard.svg', nameKey: 'screener_stock_name_ma', market: 'us', price: 560.46, changePct: -1.06, volume: '814.45K', relVolume: 0.33, marketCap: 1.18, marketCapUnit: 'T', p_e: 37.81, eps_ttm: 14.82, eps_dil_growth_ttm_yoy: 13.27, div_yield_ttm: 0.50, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'BRK.A', logo: 'https://s3-symbol-logo.tradingview.com/berkshire-hathaway.svg', nameKey: 'screener_stock_name_brka', market: 'us', price: 708710.03, changePct: -1.55, volume: '156', relVolume: 0.35, marketCap: 1.01, marketCapUnit: 'T', p_e: 12.59, eps_ttm: 56289.42, eps_dil_growth_ttm_yoy: 10.77, div_yield_ttm: 0.00, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'TSLA', logo: 'https://s3-symbol-logo.tradingview.com/tesla.svg', nameKey: 'screener_stock_name_tsla', market: 'us', price: 304.71, changePct: -1.15, volume: '27.6M', relVolume: 0.27, marketCap: 982.83, marketCapUnit: 'B', p_e: 176.46, eps_ttm: 1.73, eps_dil_growth_ttm_yoy: -51.50, div_yield_ttm: 0.00, sectorKey: 'screener_sector_consumer_durables', analystRatingKey: 'screener_rating_neutral' },
    { symbol: 'JPM', logo: 'https://s3-symbol-logo.tradingview.com/jpmorgan-chase.svg', nameKey: 'screener_stock_name_jpm', market: 'us', price: 289.51, changePct: -2.27, volume: '2.85M', relVolume: 0.34, marketCap: 804.58, marketCapUnit: 'B', p_e: 14.85, eps_ttm: 19.49, eps_dil_growth_ttm_yoy: 8.70, div_yield_ttm: 1.70, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'WMT', logo: 'https://s3-symbol-logo.tradingview.com/walmart.svg', nameKey: 'screener_stock_name_wmt', market: 'us', price: 98.69, changePct: 0.72, volume: '787.55K', relVolume: 0.27, marketCap: 787.55, marketCapUnit: 'B', p_e: 42.34, eps_ttm: 2.33, eps_dil_growth_ttm_yoy: -0.42, div_yield_ttm: 0.90, sectorKey: 'screener_sector_retail_trade', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'LLY', logo: 'https://s3-symbol-logo.tradingview.com/eli-lilly.svg', nameKey: 'screener_stock_name_lly', market: 'us', price: 757.91, changePct: 2.41, volume: '1.49M', relVolume: 0.40, marketCap: 718.29, marketCapUnit: 'B', p_e: 62.79, eps_ttm: 12.07, eps_dil_growth_ttm_yoy: 80.78, div_yield_ttm: 0.76, sectorKey: 'screener_sector_health_technology', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'ORCL', logo: 'https://s3-symbol-logo.tradingview.com/oracle.svg', nameKey: 'screener_stock_name_orcl', market: 'us', price: 247.75, changePct: -2.37, volume: '4.29M', relVolume: 0.48, marketCap: 695.89, marketCapUnit: 'B', p_e: 57.07, eps_ttm: 4.34, eps_dil_growth_ttm_yoy: 17.12, div_yield_ttm: 0.67, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'V', logo: 'https://s3-symbol-logo.tradingview.com/visa.svg', nameKey: 'screener_stock_name_v', market: 'us', price: 340.63, changePct: -1.40, volume: '10.13M', relVolume: 0.35, marketCap: 656.25, marketCapUnit: 'B', p_e: 33.63, eps_ttm: 10.13, eps_dil_growth_ttm_yoy: 0.66, div_yield_ttm: 0.66, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'JNJ', logo: 'https://s3-symbol-logo.tradingview.com/johnson-and-johnson.svg', nameKey: 'screener_stock_name_jnj', market: 'us', price: 150.25, changePct: 0.55, volume: '5.5M', relVolume: 0.8, marketCap: 358.00, marketCapUnit: 'B', p_e: 21.5, eps_ttm: 6.99, eps_dil_growth_ttm_yoy: 8.2, div_yield_ttm: 3.17, sectorKey: 'screener_sector_health_care', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'XOM', logo: 'https://s3-symbol-logo.tradingview.com/exxon-mobil.svg', nameKey: 'screener_stock_name_xom', market: 'us', price: 115.60, changePct: -0.20, volume: '15.1M', relVolume: 1.1, marketCap: 450.00, marketCapUnit: 'B', p_e: 11.2, eps_ttm: 10.32, eps_dil_growth_ttm_yoy: 5.5, div_yield_ttm: 3.32, sectorKey: 'screener_sector_energy', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'UNH', logo: 'https://s3-symbol-logo.tradingview.com/unitedhealth.svg', nameKey: 'screener_stock_name_unh', market: 'us', price: 502.10, changePct: 1.10, volume: '2.9M', relVolume: 0.9, marketCap: 465.00, marketCapUnit: 'B', p_e: 20.8, eps_ttm: 24.14, eps_dil_growth_ttm_yoy: 12.5, div_yield_ttm: 1.55, sectorKey: 'screener_sector_health_care', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'PG', logo: 'https://s3-symbol-logo.tradingview.com/procter-and-gamble.svg', nameKey: 'screener_stock_name_pg', market: 'us', price: 168.40, changePct: 0.30, volume: '6.2M', relVolume: 0.85, marketCap: 397.00, marketCapUnit: 'B', p_e: 26.5, eps_ttm: 6.35, eps_dil_growth_ttm_yoy: 7.1, div_yield_ttm: 2.29, sectorKey: 'screener_sector_consumer_staples', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'HD', logo: 'https://s3-symbol-logo.tradingview.com/home-depot.svg', nameKey: 'screener_stock_name_hd', market: 'us', price: 350.70, changePct: -1.50, volume: '3.1M', relVolume: 0.7, marketCap: 351.00, marketCapUnit: 'B', p_e: 22.1, eps_ttm: 15.87, eps_dil_growth_ttm_yoy: -2.5, div_yield_ttm: 2.51, sectorKey: 'screener_sector_consumer_discretionary', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'CVX', logo: 'https://s3-symbol-logo.tradingview.com/chevron.svg', nameKey: 'screener_stock_name_cvx', market: 'us', price: 158.90, changePct: -0.15, volume: '7.8M', relVolume: 1.0, marketCap: 290.00, marketCapUnit: 'B', p_e: 12.3, eps_ttm: 12.92, eps_dil_growth_ttm_yoy: 3.2, div_yield_ttm: 4.05, sectorKey: 'screener_sector_energy', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'COST', logo: 'https://s3-symbol-logo.tradingview.com/costco.svg', nameKey: 'screener_stock_name_cost', market: 'us', price: 845.20, changePct: 0.90, volume: '1.5M', relVolume: 0.75, marketCap: 374.00, marketCapUnit: 'B', p_e: 51.2, eps_ttm: 16.51, eps_dil_growth_ttm_yoy: 15.8, div_yield_ttm: 0.55, sectorKey: 'screener_sector_consumer_staples', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'KO', logo: 'https://s3-symbol-logo.tradingview.com/the-coca-cola-company.svg', nameKey: 'screener_stock_name_ko', market: 'us', price: 63.80, changePct: 0.25, volume: '12.3M', relVolume: 0.95, marketCap: 275.00, marketCapUnit: 'B', p_e: 25.1, eps_ttm: 2.54, eps_dil_growth_ttm_yoy: 6.3, div_yield_ttm: 3.04, sectorKey: 'screener_sector_consumer_staples', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'PEP', logo: 'https://s3-symbol-logo.tradingview.com/pepsico.svg', nameKey: 'screener_stock_name_pep', market: 'us', price: 167.50, changePct: 0.10, volume: '4.5M', relVolume: 0.8, marketCap: 230.00, marketCapUnit: 'B', p_e: 24.8, eps_ttm: 6.75, eps_dil_growth_ttm_yoy: 5.1, div_yield_ttm: 3.22, sectorKey: 'screener_sector_consumer_staples', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'BAC', logo: 'https://s3-symbol-logo.tradingview.com/bank-of-america.svg', nameKey: 'screener_stock_name_bac', market: 'us', price: 39.50, changePct: -1.80, volume: '35.2M', relVolume: 1.2, marketCap: 305.00, marketCapUnit: 'B', p_e: 12.1, eps_ttm: 3.26, eps_dil_growth_ttm_yoy: -5.8, div_yield_ttm: 2.43, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'ABBV', logo: 'https://s3-symbol-logo.tradingview.com/abbvie.svg', nameKey: 'screener_stock_name_abbv', market: 'us', price: 170.80, changePct: 1.25, volume: '6.1M', relVolume: 1.0, marketCap: 301.00, marketCapUnit: 'B', p_e: 50.1, eps_ttm: 3.41, eps_dil_growth_ttm_yoy: 10.2, div_yield_ttm: 3.63, sectorKey: 'screener_sector_health_care', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'ADBE', logo: 'https://s3-symbol-logo.tradingview.com/adobe.svg', nameKey: 'screener_stock_name_adbe', market: 'us', price: 525.50, changePct: -0.90, volume: '2.5M', relVolume: 0.8, marketCap: 235.00, marketCapUnit: 'B', p_e: 45.3, eps_ttm: 11.60, eps_dil_growth_ttm_yoy: 18.1, div_yield_ttm: 0.00, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_strong_buy' },

    // Saudi Stocks
    { symbol: '1120', logo: 'https://s3-symbol-logo.tradingview.com/al-rajhi-bank.svg', nameKey: 'screener_stock_name_alrajhi', market: 'sa', price: 95.30, changePct: -0.73, volume: '4.5M', relVolume: 0.8, marketCap: 107, marketCapUnit: 'B', p_e: 18.5, eps_ttm: 5.15, eps_dil_growth_ttm_yoy: 2.5, div_yield_ttm: 3.15, sectorKey: 'screener_sector_banking', analystRatingKey: 'screener_rating_buy' },
    { symbol: '2222', logo: 'https://s3-symbol-logo.tradingview.com/saudi-aramco.svg', nameKey: 'screener_stock_name_aramco', market: 'sa', price: 28.50, changePct: 0.35, volume: '15.2M', relVolume: 1.1, marketCap: 1890, marketCapUnit: 'B', p_e: 15.8, eps_ttm: 1.80, eps_dil_growth_ttm_yoy: 5.8, div_yield_ttm: 4.5, sectorKey: 'screener_sector_energy', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: '7010', logo: 'https://s3-symbol-logo.tradingview.com/saudi-telecom.svg', nameKey: 'screener_stock_name_stc_sa', market: 'sa', price: 38.15, changePct: 0.26, volume: '2.1M', relVolume: 0.7, marketCap: 76, marketCapUnit: 'B', p_e: 12.3, eps_ttm: 3.10, eps_dil_growth_ttm_yoy: 4.1, div_yield_ttm: 4.2, sectorKey: 'screener_sector_communication_services', analystRatingKey: 'screener_rating_buy' },
    { symbol: '2010', logo: 'https://s3-symbol-logo.tradingview.com/sabic.svg', nameKey: 'screener_stock_name_sabic_sa', market: 'sa', price: 85.40, changePct: -0.93, volume: '1.5M', relVolume: 0.9, marketCap: 68, marketCapUnit: 'B', p_e: 25.1, eps_ttm: 3.40, eps_dil_growth_ttm_yoy: -10.2, div_yield_ttm: 3.8, sectorKey: 'screener_sector_materials', analystRatingKey: 'screener_rating_neutral' },
    { symbol: '1211', logo: 'https://s3-symbol-logo.tradingview.com/maaden.svg', nameKey: 'screener_stock_name_maaden', market: 'sa', price: 53.70, changePct: -0.74, volume: '3.2M', relVolume: 1.2, marketCap: 44, marketCapUnit: 'B', p_e: 30.5, eps_ttm: 1.76, eps_dil_growth_ttm_yoy: 15.5, div_yield_ttm: 1.5, sectorKey: 'screener_sector_materials', analystRatingKey: 'screener_rating_buy' },

    // Canadian Stocks
    { symbol: 'RY', logo: 'https://s3-symbol-logo.tradingview.com/royal-bank-of-canada.svg', nameKey: 'screener_stock_name_ry', market: 'ca', price: 105.20, changePct: 0.50, volume: '3.1M', relVolume: 0.9, marketCap: 145, marketCapUnit: 'B', p_e: 12.5, eps_ttm: 8.41, eps_dil_growth_ttm_yoy: 5.2, div_yield_ttm: 3.9, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'SHOP', logo: 'https://s3-symbol-logo.tradingview.com/shopify.svg', nameKey: 'screener_stock_name_shop', market: 'ca', price: 65.80, changePct: -2.10, volume: '10.5M', relVolume: 1.2, marketCap: 84, marketCapUnit: 'B', p_e: 250.0, eps_ttm: 0.26, eps_dil_growth_ttm_yoy: 150.0, div_yield_ttm: 0.0, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'ENB', logo: 'https://s3-symbol-logo.tradingview.com/enbridge.svg', nameKey: 'screener_stock_name_enb', market: 'ca', price: 36.50, changePct: 0.15, volume: '5.2M', relVolume: 0.8, marketCap: 75, marketCapUnit: 'B', p_e: 17.0, eps_ttm: 2.14, eps_dil_growth_ttm_yoy: 3.1, div_yield_ttm: 6.5, sectorKey: 'screener_sector_energy', analystRatingKey: 'screener_rating_buy' },
    
    // UK Stocks
    { symbol: 'HSBA.L', logo: 'https://s3-symbol-logo.tradingview.com/hsbc.svg', nameKey: 'screener_stock_name_hsba', market: 'gb', price: 680.50, changePct: -0.25, volume: '20.1M', relVolume: 1.0, marketCap: 125, marketCapUnit: 'B', p_e: 6.5, eps_ttm: 104.69, eps_dil_growth_ttm_yoy: 10.5, div_yield_ttm: 7.2, sectorKey: 'screener_sector_finance', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'SHEL.L', logo: 'https://s3-symbol-logo.tradingview.com/shell.svg', nameKey: 'screener_stock_name_shel', market: 'gb', price: 2780.00, changePct: 0.80, volume: '8.2M', relVolume: 0.9, marketCap: 180, marketCapUnit: 'B', p_e: 9.0, eps_ttm: 308.89, eps_dil_growth_ttm_yoy: 4.5, div_yield_ttm: 4.1, sectorKey: 'screener_sector_energy', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'AZN.L', logo: 'https://s3-symbol-logo.tradingview.com/astrazeneca.svg', nameKey: 'screener_stock_name_azn', market: 'gb', price: 12400.00, changePct: 1.10, volume: '2.5M', relVolume: 1.1, marketCap: 190, marketCapUnit: 'B', p_e: 35.0, eps_ttm: 354.28, eps_dil_growth_ttm_yoy: 15.2, div_yield_ttm: 2.3, sectorKey: 'screener_sector_health_care', analystRatingKey: 'screener_rating_strong_buy' },

    // German Stocks
    { symbol: 'SAP.DE', logo: 'https://s3-symbol-logo.tradingview.com/sap.svg', nameKey: 'screener_stock_name_sap', market: 'de', price: 180.25, changePct: -1.50, volume: '2.1M', relVolume: 0.8, marketCap: 210, marketCapUnit: 'B', p_e: 60.0, eps_ttm: 3.00, eps_dil_growth_ttm_yoy: 20.1, div_yield_ttm: 1.2, sectorKey: 'screener_sector_technology_services', analystRatingKey: 'screener_rating_strong_buy' },
    { symbol: 'SIE.DE', logo: 'https://s3-symbol-logo.tradingview.com/siemens.svg', nameKey: 'screener_stock_name_sie', market: 'de', price: 175.50, changePct: 0.20, volume: '1.8M', relVolume: 0.7, marketCap: 140, marketCapUnit: 'B', p_e: 18.0, eps_ttm: 9.75, eps_dil_growth_ttm_yoy: 8.3, div_yield_ttm: 2.5, sectorKey: 'screener_sector_industrial', analystRatingKey: 'screener_rating_buy' },
    { symbol: 'VOW3.DE', logo: 'https://s3-symbol-logo.tradingview.com/volkswagen.svg', nameKey: 'screener_stock_name_vow', market: 'de', price: 115.80, changePct: -0.50, volume: '1.2M', relVolume: 0.9, marketCap: 60, marketCapUnit: 'B', p_e: 4.0, eps_ttm: 28.95, eps_dil_growth_ttm_yoy: -10.0, div_yield_ttm: 7.5, sectorKey: 'screener_sector_consumer_durables', analystRatingKey: 'screener_rating_neutral' },

    // Japanese Stocks
    { symbol: '7203.T', logo: 'https://s3-symbol-logo.tradingview.com/toyota.svg', nameKey: 'screener_stock_name_toyota', market: 'jp', price: 3500.00, changePct: 1.20, volume: '25M', relVolume: 1.1, marketCap: 48, marketCapUnit: 'T', p_e: 10.0, eps_ttm: 350.00, eps_dil_growth_ttm_yoy: 12.0, div_yield_ttm: 2.0, sectorKey: 'screener_sector_consumer_durables', analystRatingKey: 'screener_rating_buy' },
    { symbol: '6758.T', logo: 'https://s3-symbol-logo.tradingview.com/sony.svg', nameKey: 'screener_stock_name_sony', market: 'jp', price: 13500.00, changePct: -0.80, volume: '5M', relVolume: 0.9, marketCap: 16, marketCapUnit: 'T', p_e: 18.0, eps_ttm: 750.00, eps_dil_growth_ttm_yoy: 7.5, div_yield_ttm: 1.0, sectorKey: 'screener_sector_consumer_durables', analystRatingKey: 'screener_rating_buy' },
];

const screenerData = screenerDataRaw.map(stock => ({
    ...stock,
    fullMarketCap: stock.marketCap * (stock.marketCapUnit === 'T' ? 1e12 : 1e9)
}));

type Stock = typeof screenerData[0];
type StockKey = keyof Stock;

interface HeaderDefinition {
    key: StockKey;
    nameKey: string;
}

const ALL_COLUMNS = {
    symbol: { nameKey: 'screener_header_symbol' },
    price: { nameKey: 'screener_header_price' },
    changePct: { nameKey: 'screener_header_change_pct' },
    marketCap: { nameKey: 'screener_header_market_cap' },
    analystRating: { nameKey: 'screener_header_analyst_rating' },
    volume: { nameKey: 'screener_header_volume' },
    p_e: { nameKey: 'screener_header_p_e' },
    sector: { nameKey: 'screener_header_sector' },
    relVolume: { nameKey: 'screener_header_rel_volume' },
    eps_ttm: { nameKey: 'screener_header_eps_ttm' },
    div_yield_ttm: { nameKey: 'screener_header_div_yield_ttm' },
    eps_dil_growth_ttm_yoy: { nameKey: 'screener_header_eps_dil_growth_ttm_yoy' },
};

const DEFAULT_COLUMN_VISIBILITY = {
    symbol: true, price: true, changePct: true, marketCap: true,
    analystRating: true, volume: true, p_e: true, sector: true,
    relVolume: false, eps_ttm: false, div_yield_ttm: false, eps_dil_growth_ttm_yoy: false
};


const initialFilters = {
    market: 'world',
    indices: new Set<string>(),
    price: { min: null, max: null, preset: null },
    marketCap: { min: null, max: null },
    p_e: { min: null, max: null },
    div_yield_ttm: { min: null, max: null },
    sectorKey: null,
    analystRatingKey: null,
    searchTerm: '',
    aiSearchTerm: '',
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const FilterButton = (props) => {
    const { label, value, isActive, onClick, flag = false, flagCode = 'us', buttonRef = null } = props;
    return (
        <button 
            ref={buttonRef}
            onClick={onClick}
            className={`flex items-center gap-2 bg-transparent border ${isActive ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300'} px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800/60 whitespace-nowrap`}
        >
            {label}
            {value && <span className="font-bold flex items-center gap-1.5">
              {flag && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt={`${flagCode} flag`} className="w-4 h-auto rounded-sm"/>}
              {value}
            </span>}
            <ChevronDown size={16} className="text-gray-500" />
        </button>
    );
};

const AnalystRating = ({ ratingKey, t }) => {
    const ratingText = t(ratingKey);
    let colorClass = 'text-gray-600 dark:text-gray-300';
    let Icon = null;
    
    if (ratingKey.includes('strong_buy') || ratingKey.includes('buy')) {
        colorClass = 'text-green-600 dark:text-green-400';
        Icon = ArrowUp;
    } else if (ratingKey.includes('sell')) {
        colorClass = 'text-red-600 dark:text-red-400';
        Icon = ArrowDown;
    }
    
    const iconCount = ratingKey.includes('strong') ? 2 : 1;

    return (
        <div className={`flex items-center gap-1.5 font-semibold ${colorClass}`}>
            {Icon && Array.from({ length: iconCount }).map((_, i) => <Icon key={i} size={14} strokeWidth={2.5}/>)}
            <span>{ratingText}</span>
        </div>
    );
};

const generateStockChartData = (basePrice, isPositive, points = 30) => {
    const trend = (isPositive ? 1 : -1) * 0.005;
    const volatility = 0.02;
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        currentPrice *= 1 + trend + (Math.random() - 0.5) * volatility;
        return { x: i, y: currentPrice };
    });
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const StockCard = (props) => {
    const { stock, t, onSelect } = props;
    const chartPoints = useMemo(() => generateStockChartData(stock.price, stock.changePct >= 0, 20).map(d => d.y), [stock.price, stock.changePct]);

    const isPositive = stock.changePct >= 0;
    const color = isPositive ? '#22c55e' : '#ef4444';

    const svgWidth = 100;
    const svgHeight = 50;
    const minVal = Math.min(...chartPoints);
    const maxVal = Math.max(...chartPoints);
    const range = maxVal - minVal || 1;

    const getCoords = (value, index) => {
        const x = (index / (chartPoints.length - 1)) * svgWidth;
        const y = (svgHeight - 4) - ((value - minVal) / range) * (svgHeight - 8) + 4; // y-padding
        return { x, y };
    };

    const path = chartPoints.map((p, i) => {
        const { x, y } = getCoords(p, i);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    
    const gradientPath = path + ` L${svgWidth},${svgHeight} L0,${svgHeight} Z`;

    return (
        <div onClick={onSelect} className="bg-white dark:bg-[#1C2331] rounded-xl p-4 flex flex-col cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all duration-300 h-full border border-gray-200 dark:border-gray-800/50">
            {/* Header: Price Info */}
            <div className="flex items-center gap-3 text-lg">
                <p className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{stock.changePct.toFixed(2)}%
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                    {stock.price.toFixed(2)} <span className="text-gray-500 dark:text-gray-400">USD</span>
                </p>
            </div>

            {/* Chart */}
            <div className="flex-grow w-full relative my-3">
                <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`screenerCardGradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <path d={gradientPath} fill={`url(#screenerCardGradient-${stock.symbol})`} />
                    <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                <span>{t('popover_period_day')}</span>
            </div>
        </div>
    );
};

const ScreenerDetailPanel = ({ symbol, onClose, t }) => {
    const stock = screenerData.find(s => s.symbol === symbol);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');
    const chartData = useMemo(() => {
        if (!stock) return {};
        const isPositive = stock.changePct >= 0;
        return {
            '1D': generateStockChartData(stock.price, isPositive, 24 * 6).map((d, i) => ({ ...d, x: `T+${i*10}`})),
            '1W': generateStockChartData(stock.price, isPositive, 5 * 24).map((d, i) => ({ ...d, x: `D-${5-i}`})),
            '1M': generateStockChartData(stock.price, isPositive, 30).map((d, i) => ({ ...d, x: `Day ${i+1}`})),
            '1Y': generateStockChartData(stock.price, isPositive, 12).map((d, i) => ({ ...d, x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}))
        }
    }, [stock]);

    if (!stock) return null;
    const isPositive = stock.changePct >= 0;

    return (
        <div className="p-4 flex flex-col h-full bg-gray-50 dark:bg-[#131722]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <img src={stock.logo} alt={t(stock.nameKey)} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t(stock.nameKey)}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 -m-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl font-mono text-gray-900 dark:text-white">{stock.price.toFixed(2)}</p>
                <p className={`text-lg font-mono ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{isPositive && '+'}{stock.changePct.toFixed(2)}%</p>
            </div>
            <div className="h-64 w-full mb-4">
                 <InteractiveChart
                    data={chartData[activeTimeframe]}
                    series={[{ key: 'y', type: 'line', color: isPositive ? '#22c55e' : '#ef4444' }]}
                    xKey="x"
                    height={250}
                    margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
                    yFormatLeft={d => d.toFixed(2)}
                    tooltipFormatter={d => `<div><strong>${d.x}</strong>: ${d.y.toFixed(2)}</div>`}
                />
            </div>
             <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1C2331] rounded-full p-1 text-xs self-center">
                {['1D', '1W', '1M', '1Y'].map(tf => (
                    <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`px-3 py-1 rounded-full transition-colors ${activeTimeframe === tf ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{tf}</button>
                ))}
            </div>
            <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{t('screener_header_market_cap')}</span><span className="text-gray-900 dark:text-white font-mono">{stock.marketCap.toFixed(2)}{stock.marketCapUnit}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{t('screener_header_p_e')}</span><span className="text-gray-900 dark:text-white font-mono">{stock.p_e.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{t('screener_header_div_yield_ttm')}</span><span className="text-gray-900 dark:text-white font-mono">{stock.div_yield_ttm.toFixed(2)}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{t('screener_header_analyst_rating')}</span><AnalystRating ratingKey={stock.analystRatingKey} t={t}/></div>
            </div>
        </div>
    );
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const ColumnSettingsModal = (props) => {
    const { isOpen, onClose, t, columnVisibility, onColumnToggle, onReset } = props;
    if (!isOpen) return null;

    // FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
    const CheckboxItem = (props) => {
        const { label, checked, onChange } = props;
        return (
            <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <label className="relative flex items-center justify-center w-5 h-5">
                    <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" checked={checked} onChange={onChange} />
                    <span className="w-5 h-5 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors peer-checked:bg-cyan-500 peer-checked:border-cyan-500"></span>
                    <svg className="absolute w-4 h-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </label>
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C2331] rounded-lg p-6 w-96 text-gray-900 dark:text-white flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{t('screener_settings_modal_title')}</h3>
                    <button onClick={onClose} className="p-1 -m-1 text-gray-500 hover:text-gray-800 dark:hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex-grow space-y-2 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                    {Object.entries(ALL_COLUMNS).map(([key, { nameKey }]) => (
                        <CheckboxItem key={key} label={t(nameKey)} checked={columnVisibility[key]} onChange={() => onColumnToggle(key)} />
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                    <button onClick={onReset} className="text-sm text-blue-500 hover:underline">{t('screener_settings_reset_columns')}</button>
                </div>
            </div>
        </div>, document.body
    );
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const SkeletonRow = (props) => {
    const { columns } = props;
    return (
        <tr className="skeleton-row">
            {columns.map(col => (
                <td key={col.key} className="p-2">
                    <div className="skeleton-item h-6 w-full"></div>
                </td>
            ))}
            <td className="p-2"><div className="skeleton-item h-6 w-8 mx-auto"></div></td>
        </tr>
    );
};

export const StockScreener = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const [isInitiallyMobile, setIsInitiallyMobile] = useState(window.innerWidth < 1024);
    
    // Core states
    const [filters, setFilters] = useState(initialFilters);
    const [sortConfig, setSortConfig] = useState(() => {
        try {
            const savedSort = localStorage.getItem('stockScreenerSortConfig');
            return savedSort ? JSON.parse(savedSort) : { key: 'fullMarketCap', direction: 'descending' };
        } catch (e) {
            console.error("Failed to parse sort config from localStorage", e);
            return { key: 'fullMarketCap', direction: 'descending' };
        }
    });
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

    // UI states
    const [activeTab, setActiveTab] = useState('overview');
    const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(true);
    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState(DEFAULT_COLUMN_VISIBILITY);
    const [isLoading, setIsLoading] = useState(true);
    
    // Animation & Dragging states
    const [isClosing, setIsClosing] = useState(false);
    const [position, setPosition] = useState(isInitiallyMobile ? window.innerHeight : window.innerWidth);
    const [isDragging, setIsDragging] = useState(false);
    const [panelWidth, setPanelWidth] = useState(0);
    
    const screenerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ startX: 0, initialX: 0 });
    const indexButtonRef = useRef(null);
    const priceButtonRef = useRef(null);
    const marketButtonRef = useRef(null);
    
    const isMobileLayout = useMemo(() => isInitiallyMobile || (panelWidth > 0 && panelWidth < 768), [isInitiallyMobile, panelWidth]);

    // Effect to save sort config to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('stockScreenerSortConfig', JSON.stringify(sortConfig));
        } catch (e) {
            console.error("Failed to save sort config to localStorage", e);
        }
    }, [sortConfig]);

    const handleResetFilters = () => {
        setIsLoading(true);
        setFilters(initialFilters);
        setTimeout(() => setIsLoading(false), 500);
    };
    
    const handleSavePreset = () => {
        alert("Filter preset saved!\n" + JSON.stringify(filters, (key, value) => value instanceof Set ? [...value] : value, 2));
    };

    const handleApplyPriceFilter = (newPriceFilter) => {
        setIsLoading(true);
        setFilters(prev => ({ ...prev, price: { ...prev.price, ...newPriceFilter } }));
        setTimeout(() => setIsLoading(false), 500);
    };
    
    const handleApplyIndexFilter = (newIndices) => {
        setIsLoading(true);
        setFilters(prev => ({...prev, indices: newIndices}));
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleApplyMarketFilter = (market) => {
        setIsLoading(true);
        setFilters(prev => ({ ...prev, market: market.key }));
        setIsMarketModalOpen(false);
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleRemoveFilter = useCallback((key) => {
        setIsLoading(true);
        setFilters(prev => ({ ...prev, [key]: initialFilters[key]}));
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const handleAISearch = useCallback(async (query: string) => {
        if (!query) return;
        setIsLoading(true);
        setFilters(f => ({ ...f, aiSearchTerm: query }));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sectors = ["Electronic Technology", "Technology Services", "Retail Trade", "Finance", "Consumer Durables", "Health Technology", "Health Care", "Energy", "Consumer Staples", "Consumer Discretionary", "Banking", "Communication Services", "Materials"];
            const ratings = ["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"];

            Available filters:
            - div_yield_ttm: { "min": number, "max": number } (percentage)
            - p_e: { "min": number, "max": number }
            - sectorKey: string (must be one of [${sectors.map(s => `'screener_sector_${s.toLowerCase().replace(/ /g, '_')}'`).join(', ')}])
            - analystRatingKey: string (must be one of of [${ratings.map(r => `'screener_rating_${r.toLowerCase().replace(/ /g, '_')}'`).join(', ')}])
            
            Translate human-readable sectors/ratings to the corresponding key. E.g., "finance sector" becomes "screener_sector_finance". "high buy rating" could be "screener_rating_strong_buy".
            For numeric values like "over 3%" or "under 20", set min/max accordingly.
            Respond ONLY with the JSON object.`;

            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    div_yield_ttm: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } } },
                    p_e: { type: Type.OBJECT, properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } } },
                    sectorKey: { type: Type.STRING },
                    analystRatingKey: { type: Type.STRING },
                  }
                }
              }
            }));

            const aiFilters = JSON.parse(response.text);
            setFilters(prev => ({...prev, ...aiFilters}));

        } catch (error) {
            console.error("AI filter parsing error:", error);
            // Optionally show an error to the user
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [t]);

    const processedData = useMemo(() => {
        let filteredData = screenerData.filter(stock => {
            const lowerSearch = filters.searchTerm.toLowerCase();
            if (lowerSearch && !(stock.symbol.toLowerCase().includes(lowerSearch) || t(stock.nameKey).toLowerCase().includes(lowerSearch))) return false;
            if (filters.market !== 'world' && stock.market !== filters.market) return false;
            if (filters.price.min !== null && stock.price < filters.price.min) return false;
            if (filters.price.max !== null && stock.price > filters.price.max) return false;
            if (filters.p_e.min !== null && stock.p_e < filters.p_e.min) return false;
            if (filters.p_e.max !== null && stock.p_e > filters.p_e.max) return false;
            if (filters.div_yield_ttm.min !== null && stock.div_yield_ttm < filters.div_yield_ttm.min) return false;
            if (filters.div_yield_ttm.max !== null && stock.div_yield_ttm > filters.div_yield_ttm.max) return false;
            if (filters.sectorKey && stock.sectorKey !== filters.sectorKey) return false;
            if (filters.analystRatingKey && stock.analystRatingKey !== filters.analystRatingKey) return false;
            if (filters.indices.size > 0 && !filters.indices.has(stock.symbol)) return false;
            return true;
        });
        
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredData;
    }, [filters, sortConfig, t]);
    
    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsInitiallyMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const screenerElement = screenerRef.current;
        if (!screenerElement || !isOpen) return;
        const observer = new ResizeObserver(entries => { for (let entry of entries) { setPanelWidth(entry.contentRect.width); } });
        observer.observe(screenerElement);
        setPanelWidth(screenerElement.offsetWidth);
        return () => { observer.disconnect(); };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setPosition(isInitiallyMobile ? window.innerHeight : window.innerWidth);
            requestAnimationFrame(() => { setPosition(0); });
        }
    }, [isOpen, isInitiallyMobile]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setPosition(isInitiallyMobile ? window.innerHeight : window.innerWidth);
    }, [isInitiallyMobile]);

    const handleTransitionEnd = () => { if (isClosing) { onClose(); setIsClosing(false); } };
    
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') handleClose(); };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => { document.body.style.overflow = 'unset'; document.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen, handleClose]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isInitiallyMobile) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { startX: e.clientX, initialX: position };
    }, [position, isInitiallyMobile]);
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || isInitiallyMobile) return;
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newX = dragStartRef.current.initialX + deltaX;
        setPosition(Math.max(0, newX));
    }, [isDragging, isInitiallyMobile]);

    const handleMouseUp = useCallback(() => {
        if (isInitiallyMobile) return;
        setIsDragging(false);
        if (screenerRef.current && position > screenerRef.current.offsetWidth / 3) {
            handleClose();
        } else {
            setPosition(0);
        }
    }, [position, handleClose, isInitiallyMobile]);

    useEffect(() => {
        if (isDragging) {
            document.body.classList.add('grabbing');
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            document.body.classList.remove('grabbing');
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const requestSort = (key: StockKey) => {
        setIsLoading(true);
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setTimeout(() => setIsLoading(false), 500);
    };

    if (!isOpen && !isClosing) return null;

    const marketKeyToDisplay = {
        'world': t('country_world'), 'us': t('country_usa'), 'sa': t('country_saudi'), 'ca': t('country_canada'),
        'gb': t('country_uk'), 'de': t('country_germany'), 'jp': t('country_japan'), 'fr': t('country_france'),
        'in': t('country_india'), 'cn': t('country_china'), 'hk': t('country_hk'),
    };

    const filtersButtons = [
        { key: 'screener_filter_market', value: marketKeyToDisplay[filters.market], flag: filters.market !== 'world', flagCode: filters.market, isModal: true, onClick: () => setIsMarketModalOpen(p => !p), ref: marketButtonRef, isActive: isMarketModalOpen },
        { key: 'screener_filter_watchlist' }, { key: 'screener_filter_index', isModal: true, onClick: () => setIsIndexModalOpen(p => !p), ref: indexButtonRef, isActive: filters.indices.size > 0, value: filters.indices.size > 0 ? `${filters.indices.size}`: null },
        { key: 'screener_filter_price', isModal: true, onClick: () => setIsPriceModalOpen(p => !p), ref: priceButtonRef, isActive: filters.price.min !== null || filters.price.max !== null, value: filters.price.preset || (filters.price.min !== null || filters.price.max !== null ? '...' : null) }, { key: 'screener_filter_change_pct' }, { key: 'screener_filter_market_cap' },
        { key: 'screener_filter_p_e' }, { key: 'screener_filter_eps_dil_growth' }, { key: 'screener_filter_div_yield_pct' },
        { key: 'screener_filter_sector' }, { key: 'screener_filter_analyst_rating' }, { key: 'screener_filter_perf_pct' }, { key: 'screener_filter_revenue_growth' },
    ];
        
    const tabs = [
        { key: 'overview', nameKey: 'screener_tab_overview' }, { key: 'performance', nameKey: 'screener_tab_performance' }, { key: 'extended_hours', nameKey: 'screener_tab_extended_hours' },
        { key: 'valuation', nameKey: 'screener_tab_valuation' }, { key: 'dividends', nameKey: 'screener_tab_dividends' }, { key: 'profitability', nameKey: 'screener_tab_profitability' },
        { key: 'income_statement', nameKey: 'screener_tab_income_statement' }, { key: 'balance_sheet', nameKey: 'screener_tab_balance_sheet' }, { key: 'cash_flow', nameKey: 'screener_tab_cash_flow' },
        { key: 'per_share', nameKey: 'screener_tab_per_share' }, { key: 'technicals', nameKey: 'screener_tab_technicals' },
    ];

    const visibleColumns = Object.entries(ALL_COLUMNS).filter(([key]) => columnVisibility[key]).map(([key, value]) => ({...value, key}));
    
    const panelClasses = isInitiallyMobile ? "fixed inset-x-0 bottom-0 top-14 flex flex-col text-gray-900 dark:text-gray-300 bg-white dark:bg-black" : "absolute top-0 right-0 h-full w-[95vw] max-w-[1600px] flex flex-col text-gray-900 dark:text-gray-300 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800";
    const panelTransform = isInitiallyMobile ? { transform: `translateY(${position}px)` } : { transform: `translateX(${position}px)` };

    return createPortal(
      <>
      <div className="fixed inset-0 bg-black/70 z-40 text-sm font-sans" onClick={handleClose} aria-modal="true" role="dialog">
        <div ref={screenerRef} className={panelClasses} style={{ ...panelTransform, transition: isDragging ? 'none' : 'transform 0.3s ease-out', }} onTransitionEnd={handleTransitionEnd} onClick={(e) => e.stopPropagation()}>
          {!isInitiallyMobile && <div className="absolute top-0 left-0 w-4 h-full cursor-ew-resize z-20" onMouseDown={handleMouseDown} />}
          <header className="flex items-center justify-between flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsFilterPanelVisible(p => !p)} className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">{t('screener_title')} <ChevronDown size={20} className={`transition-transform ${isFilterPanelVisible ? 'rotate-180' : ''}`}/></button>
              <button onClick={handleSavePreset} className="text-gray-900 dark:text-white flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60"><Cloud size={18} className="text-blue-500 dark:text-blue-400" /> {t('screener_save_button')}</button>
            </div>
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 hover:text-gray-900 dark:hover:text-white"><Hexagon size={22} /></button>
              <button onClick={handleClose} className="p-2 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
            </div>
          </header>
          {isFilterPanelVisible && <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-800 space-y-2 animate-fade-in-up">
            <form onSubmit={e => { e.preventDefault(); handleAISearch(filters.aiSearchTerm); }} className="relative">
              <input type="text" value={filters.aiSearchTerm} onChange={e => setFilters(f => ({ ...f, aiSearchTerm: e.target.value }))} placeholder={t('screener_ai_search_placeholder')} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm" />
              <Bot size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
            </form>
            <div className="flex items-center gap-2 flex-wrap pb-1">
                {filtersButtons.map((filter) => (<FilterButton key={filter.key} label={t(filter.key)} value={filter.value} flag={filter.flag} flagCode={filter.flagCode} isActive={filter.isActive || false} onClick={filter.onClick || (() => {})} buttonRef={filter.ref} />))}
                <button className="p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"><Plus size={16} /></button>
                <button className="p-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"><MoreHorizontal size={16} /></button>
            </div>
          </div>}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between overflow-hidden">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 p-2">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}><List size={18}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}><LayoutGrid size={18}/></button>
              </div>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-800"></div>
              {tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.key ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t(tab.nameKey)}</button>))}
            </div>
            <div className="flex items-center p-2 flex-shrink-0">
              <button onClick={handleResetFilters} className="text-gray-500 dark:text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-full"><RefreshCw size={18} /></button>
            </div>
          </div>
          <main className="flex-1 flex overflow-hidden">
            <div className={`transition-all duration-300 overflow-auto custom-scrollbar ${selectedSymbol && !isMobileLayout ? 'w-1/2' : selectedSymbol && isMobileLayout ? 'hidden' : 'w-full'}`}>
              {viewMode === 'grid' ? (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {processedData.map(stock => <StockCard key={stock.symbol} stock={stock} t={t} onSelect={() => setSelectedSymbol(stock.symbol)} />)}
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead><tr className="sticky top-0 bg-white dark:bg-black z-10">{visibleColumns.map((header, idx) => (<th key={header.key} className={`p-2 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-xs whitespace-nowrap ${idx === 0 ? 'sticky left-0 bg-white dark:bg-black' : ''}`}><button onClick={() => requestSort(header.key as StockKey)} className="group flex items-center gap-1 hover:text-gray-900 dark:hover:text-white w-full text-left">{idx === 0 ? (<div className="flex items-center gap-2 flex-grow min-w-0"><Search size={18} className="text-gray-500 flex-shrink-0" /><input type="text" value={filters.searchTerm} onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))} onClick={(e) => e.stopPropagation()} placeholder={`${t(header.nameKey)} (${processedData.length})`} className="bg-transparent focus:outline-none w-full text-gray-900 dark:text-gray-300 placeholder:text-gray-500" /></div>) : (<span>{t(header.nameKey)}</span>)}{<span className={`sort-icon ${sortConfig.key === header.key ? 'active' : ''}`}>{sortConfig.key === header.key ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUp size={14} />}</span>}</button></th>))}<th className="p-2 border-b border-gray-200 dark:border-gray-800 w-12 sticky right-0 bg-white dark:bg-black"><button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center w-full"><Plus size={16}/></button></th></tr></thead>
                  <tbody>{isLoading ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} columns={visibleColumns} />) : processedData.map(stock => (<tr key={stock.symbol} onClick={() => setSelectedSymbol(stock.symbol)} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-gray-800/30 cursor-pointer ${selectedSymbol === stock.symbol ? 'bg-blue-50 dark:bg-blue-900/40' : ''}`}>{visibleColumns.map((header, idx) => (<td key={header.key} className={`p-2 text-left ${idx === 0 ? 'sticky left-0 bg-inherit' : ''}`}>{header.key === 'symbol' && <div className="flex items-center gap-2"><img src={stock.logo} alt={t(stock.nameKey)} className="w-7 h-7 rounded-full" /><div><span className="text-gray-900 dark:text-white font-semibold">{stock.symbol}</span>{panelWidth > 700 && <span className="text-gray-500 dark:text-gray-400 text-xs ms-2">{t(stock.nameKey)}</span>}</div></div>}{header.key === 'price' && <span className="font-mono text-gray-900 dark:text-white">{stock.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}{panelWidth > 550 && <span className="text-gray-500 ms-1">USD</span>}</span>}{header.key === 'changePct' && <span className={`font-mono ${stock.changePct >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{stock.changePct >= 0 && '+'}{stock.changePct.toFixed(2)}%</span>}{header.key === 'marketCap' && <span className="font-mono text-gray-900 dark:text-white">{`${stock.marketCap.toFixed(2)}${stock.marketCapUnit}`}{panelWidth > 750 && <span className="text-gray-500 ms-1">USD</span>}</span>}{header.key === 'analystRating' && <AnalystRating ratingKey={stock.analystRatingKey} t={t} />}{header.key === 'volume' && <span className="font-mono text-gray-900 dark:text-white">{stock.volume}</span>}{header.key === 'p_e' && <span className="font-mono text-gray-900 dark:text-white">{stock.p_e.toFixed(2)}</span>}{header.key === 'sector' && <button className="text-blue-600 dark:text-blue-400 hover:underline">{t(stock.sectorKey)}</button>}{header.key === 'relVolume' && <span className="font-mono text-gray-900 dark:text-white">{stock.relVolume.toFixed(2)}</span>}{header.key === 'eps_ttm' && <span className="font-mono text-gray-900 dark:text-white">{stock.eps_ttm.toFixed(2)} {panelWidth > 1350 && <span className="text-gray-500">USD</span>}</span>}{header.key === 'div_yield_ttm' && <span className="font-mono text-gray-900 dark:text-white">{stock.div_yield_ttm.toFixed(2)}%</span>}{header.key === 'eps_dil_growth_ttm_yoy' && <span className={`font-mono ${stock.eps_dil_growth_ttm_yoy >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{stock.eps_dil_growth_ttm_yoy >= 0 && '+'}{stock.eps_dil_growth_ttm_yoy.toFixed(2)}%</span>}</td>))}<td className="p-2 text-center sticky right-0 bg-inherit"><button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"><Plus size={16}/></button></td></tr>))}</tbody>
                </table>
              )}
            </div>
            {selectedSymbol && (
              <div className={`transition-all duration-300 overflow-auto custom-scrollbar border-l border-gray-200 dark:border-gray-800 ${isMobileLayout ? 'absolute inset-0 bg-white dark:bg-black z-10' : `w-1/2`}`}>
                <ScreenerDetailPanel symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} t={t} />
              </div>
            )}
          </main>
        </div>
        <IndexFilterModal isOpen={isIndexModalOpen} onClose={() => setIsIndexModalOpen(false)} anchorEl={indexButtonRef.current} onApply={handleApplyIndexFilter} currentSelection={filters.indices} />
        <PriceFilterModal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)} anchorEl={priceButtonRef.current} onApply={handleApplyPriceFilter} currentValues={filters.price} />
        <ColumnSettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)}
            t={t}
            columnVisibility={columnVisibility}
            onColumnToggle={(key) => setColumnVisibility(prev => ({...prev, [key]: !prev[key]}))}
            onReset={() => setColumnVisibility(DEFAULT_COLUMN_VISIBILITY)}
        />
         <MarketSelectorModal 
            isOpen={isMarketModalOpen} 
            onClose={() => setIsMarketModalOpen(false)}
            onMarketSelect={handleApplyMarketFilter}
            anchorEl={marketButtonRef.current}
        />
      </div>
      </>
      , document.body);
};