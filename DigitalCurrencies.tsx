/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { CurrencyIcon } from './CurrencyIcon';
import { SymbolIcon } from './SymbolIcon';

const CurrencyCard = (props: any) => {
    const { currency } = props;
    const { t } = useLanguage();
    const isPositive = currency.change >= 0;
    
    const formatPrice = (price) => {
      if (price >= 1000) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
      return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg w-60 flex-shrink-0 p-4 border border-gray-200 dark:border-gray-800/80 flex flex-col justify-between h-40 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
                 <div className="text-left rtl:text-right">
                    <h4 className="text-gray-900 dark:text-white font-semibold">{currency.id}</h4>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t(currency.nameKey)}</span>
                </div>
                <SymbolIcon symbol={currency.id.replace('USD','')} size={36} />
            </div>
            <div className="text-left rtl:text-right">
                <div className="flex items-baseline gap-1">
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{formatPrice(currency.price)}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CurrencyIcon code="USD" size={14} title={t('currency_usd')} />
                        <span>{t('currency_usd')}</span>
                    </div>
                </div>
                <p className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{isPositive ? '+' : ''}{currency.change.toFixed(2)}%</p>
            </div>
        </div>
    );
};


export const DigitalCurrencies = () => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const currencyData = [
        { id: 'BTCUSD', nameKey: 'crypto_btc', price: 68123.45, change: 1.09, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg' },
        { id: 'ETHUSD', nameKey: 'crypto_eth', price: 3543.21, change: -2.34, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg' },
        { id: 'SOLUSD', nameKey: 'crypto_solana_name', price: 165.80, change: 2.79, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL.svg' },
        { id: 'XRPUSD', nameKey: 'crypto_xrp_name', price: 0.5234, change: 0.23, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP.svg' },
        { id: 'DOGEUSD', nameKey: 'crypto_doge', price: 0.15892, change: -1.96, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCDOGE.svg' },
        { id: 'ADAUSD', nameKey: 'crypto_cardano_name', price: 0.4567, change: -1.72, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCADA.svg' },
        { id: 'LINKUSD', nameKey: 'crypto_link', price: 18.986, change: 3.11, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCLINK.svg' },
        { id: 'LTCUSD', nameKey: 'crypto_ltc', price: 85.65, change: 0.61, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCLTC.svg' },
    ];
    const displayData = language === 'ar' ? currencyData.slice().reverse() : currencyData;


    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 240 + 16;
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('digital_currencies_title')} {language === 'ar' ? '<' : '>'}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('digital_currencies_subtitle')}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-black rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {displayData.map((currency, index) => <CurrencyCard key={`${currency.id}-${index}`} currency={currency} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-black rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
        </section>
    );
};