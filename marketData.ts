/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const marketData = {
    indices: [
        { id: 'TASI', nameKey: 'stock1_name', value: '10,839.45', change: '+6.14', currencyKey: 'sar' },
        { id: 'MT30', nameKey: 'stock2_name', value: '1,397.24', change: '-1.36', currencyKey: 'sar' },
        { id: 'SPX', nameKey: 'stock4_name', value: '6,289.97', change: '+51.98', currencyKey: 'usd' },
        { id: 'NDX', nameKey: 'ndq_name', value: '22,763.31', change: '-455.51', currencyKey: 'usd' },
        { id: 'DJI', nameKey: 'dji_name', value: '43,893.52', change: '+305.11', currencyKey: 'usd' },
        { id: 'FTSE', nameKey: 'ftse_name', value: '8,230.55', change: '+25.10', currencyKey: 'gbp' },
        { id: 'DAX', nameKey: 'dax_name', value: '18,500.12', change: '-50.23', currencyKey: 'eur' },
        { id: 'NI225', nameKey: 'nikkei_name', value: '38,596.47', change: '-106.38', currencyKey: 'jpy' },
    ],
    stocks: [
        { id: 'ARAMCO', nameKey: 'stock_aramco_name', value: '28.50', change: '+0.10', currencyKey: 'sar' },
        { id: 'ALRAJHI', nameKey: 'stock_alrajhi_name', value: '95.30', change: '-0.70', currencyKey: 'sar' },
        { id: 'STC', nameKey: 'stock_stc_name', value: '38.15', change: '+0.10', currencyKey: 'sar' },
        { id: 'AAPL', nameKey: 'stock_aapl_name', value: '205.42', change: '-2.16', currencyKey: 'usd' },
        { id: 'MSFT', nameKey: 'stock_msft_name', value: '445.70', change: '+1.12', currencyKey: 'usd' },
        { id: 'GOOGL', nameKey: 'stock_googl_name', value: '179.22', change: '-1.88', currencyKey: 'usd' },
        { id: 'TSLA', nameKey: 'stock_tsla_name', value: '304.71', change: '-3.55', currencyKey: 'usd' },
        { id: 'NVDA', nameKey: 'stock_nvda_name', value: '120.88', change: '+2.55', currencyKey: 'usd' },
    ],
    digital_currencies: [
        { id: 'BTC', nameKey: 'crypto_bitcoin_name', value: '68,123.45', change: '+114.23', currencyKey: 'usd' },
        { id: 'ETH', nameKey: 'crypto_ethereum_name', value: '3,575.24', change: '-80.93', currencyKey: 'usd' },
        { id: 'USDT', nameKey: 'crypto_tether_name', value: '1.00', change: '+0.00', currencyKey: 'usd' },
        { id: 'BNB', nameKey: 'crypto_binance_coin_name', value: '757.39', change: '+6.31', currencyKey: 'usd' },
        { id: 'SOL', nameKey: 'crypto_solana_name', value: '165.80', change: '+4.50', currencyKey: 'usd' },
        { id: 'XRP', nameKey: 'crypto_xrp_name', value: '0.5234', change: '-0.012', currencyKey: 'usd' },
        { id: 'DOGE', nameKey: 'crypto_doge_name', value: '0.1589', change: '+0.005', currencyKey: 'usd' },
        { id: 'ADA', nameKey: 'crypto_cardano_name', value: '0.4567', change: '-0.008', currencyKey: 'usd' },
    ],
    futures: [
        { id: 'USOIL', nameKey: 'futures_oil_name', value: '65.80', change: '+1.20', currencyKey: 'usd' },
        { id: 'GOLD', nameKey: 'futures_gold_name', value: '3,336.1', change: '+0.30', currencyKey: 'usd' },
        { id: 'SILVER', nameKey: 'futures_silver_name', value: '29.50', change: '-0.25', currencyKey: 'usd' },
        { id: 'NATGAS', nameKey: 'futures_natgas_name', value: '2.90', change: '+0.05', currencyKey: 'usd' },
        { id: 'CORN', nameKey: 'futures_corn_name', value: '450.75', change: '+2.25', currencyKey: 'usd' },
    ],
    forex: [
        { id: 'SARUSD', nameKey: 'forex_sar_usd_name', value: '3.7511', change: '+0.0000', currencyKey: 'usd' },
        { id: 'EURUSD', nameKey: 'forex_eur_usd_name', value: '1.0850', change: '+0.0020', currencyKey: 'usd' },
        { id: 'GBPUSD', nameKey: 'forex_gbpusd_name', value: '1.2710', change: '-0.0015', currencyKey: 'usd' },
        { id: 'USDJPY', nameKey: 'forex_usdjpy_name', value: '157.20', change: '+0.15', currencyKey: 'jpy' },
        { id: 'AUDUSD', nameKey: 'forex_audusd_name', value: '0.6650', change: '+0.0030', currencyKey: 'usd' },
    ],
    bonds: [
        { id: 'US10Y', nameKey: 'bonds_us10y_name', value: '4.210', change: '+0.013', currencyKey: 'pct' },
        { id: 'DE10Y', nameKey: 'bonds_de10y_name', value: '2.650', change: '-0.021', currencyKey: 'pct' },
        { id: 'GB10Y', nameKey: 'bonds_uk10y_name', value: '4.050', change: '+0.016', currencyKey: 'pct' },
        { id: 'JP10Y', nameKey: 'bonds_jp10y_name', value: '0.975', change: '+0.005', currencyKey: 'pct' },
        { id: 'SA10Y', nameKey: 'bonds_sa10y_name', value: '4.550', change: '-0.010', currencyKey: 'pct' },
    ],
    etfs: [
        { id: 'SPY', nameKey: 'etf_spy_name', value: '627.00', change: '+5.42', currencyKey: 'usd' },
        { id: 'QQQ', nameKey: 'etf_qqq_name', value: '560.29', change: '+6.42', currencyKey: 'usd' },
        { id: 'GLD', nameKey: 'etf_gld_name', value: '309.43', change: '+0.23', currencyKey: 'usd' },
        { id: 'VTI', nameKey: 'etf_vti_name', value: '308.30', change: '+2.56', currencyKey: 'usd' },
        { id: 'ARKK', nameKey: 'etf_arkk_name', value: '45.50', change: '-0.75', currencyKey: 'usd' },
    ],
};