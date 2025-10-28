/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const tickerData = [
    { pair: 'BTC/USD', price: '68,123.45', change: '+1.23%', isPositive: true },
    { pair: 'ETH/USD', price: '3,543.21', change: '-0.56%', isPositive: false },
    { pair: 'SOL/USD', price: '165.80', change: '+2.45%', isPositive: true },
    { pair: 'DOGE/USD', price: '0.1589', change: '-1.12%', isPositive: false },
    { pair: 'XRP/USD', price: '0.5234', change: '+0.89%', isPositive: true },
    { pair: 'ADA/USD', price: '0.4567', change: '-0.25%', isPositive: false },
    { pair: 'AVAX/USD', price: '35.90', change: '+3.10%', isPositive: true },
    { pair: 'SHIB/USD', price: '0.00002543', change: '-2.50%', isPositive: false },
    { pair: 'DOT/USD', price: '7.15', change: '+1.55%', isPositive: true },
    { pair: 'LINK/USD', price: '18.50', change: '+0.75%', isPositive: true },
    { pair: 'LTC/USD', price: '85.50', change: '+0.95%', isPositive: true },
    { pair: 'BCH/USD', price: '450.20', change: '-1.80%', isPositive: false },
    { pair: 'MATIC/USD', price: '0.7512', change: '+2.15%', isPositive: true },
    { pair: 'TRX/USD', price: '0.1234', change: '+0.50%', isPositive: true },
    { pair: 'ICP/USD', price: '12.80', change: '-3.20%', isPositive: false },
    { pair: 'ETC/USD', price: '25.60', change: '+1.20%', isPositive: true },
    { pair: 'NEAR/USD', price: '7.80', change: '+4.50%', isPositive: true },
    { pair: 'UNI/USD', price: '10.50', change: '-0.85%', isPositive: false },
    { pair: 'LEO/USD', price: '5.80', change: '+0.15%', isPositive: true },
    { pair: 'XLM/USD', price: '0.1120', change: '-0.90%', isPositive: false },
];

const TickerItem = ({ item }) => {
    const changeColor = item.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const Icon = item.isPositive ? TrendingUp : TrendingDown;
    return (
        <div className="inline-flex items-center gap-4 px-6 text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">{item.pair}</span>
            <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300 font-mono">{item.price}</span>
                <span className={`${changeColor} font-mono`}>{item.change}</span>
                <Icon size={16} className={changeColor} />
            </div>
        </div>
    );
};

export const CryptoTickerTape = () => {
    // Duplicate the data for a seamless loop, 4x for very wide screens
    const displayData = [...tickerData, ...tickerData, ...tickerData, ...tickerData];

    return (
        <div className="bg-gray-100 dark:bg-black border-b border-gray-200 dark:border-gray-800 flex-shrink-0 ticker-container hidden sm:block">
            <div className="py-2 ticker-wrapper">
                <div className="ticker-content">
                    {displayData.map((item, index) => (
                        <React.Fragment key={index}>
                            <TickerItem item={item} />
                            {index < displayData.length - 1 && <span className="text-gray-500 dark:text-gray-700">&#8226;</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};