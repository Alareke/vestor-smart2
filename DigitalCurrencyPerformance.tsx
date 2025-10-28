/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { CryptoPopover } from './CryptoPopover';

const CurrencyItem = ({ currency, onMouseEnter, onMouseLeave, t }) => {
    const { language } = useLanguage();
    const isPositive = currency.change >= 0;
    const changeClass = isPositive ? 'bg-green-500' : 'bg-red-500';

    const formatPrice = (price) => {
        return price.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
    }

    return (
        <button 
            onMouseEnter={(e) => onMouseEnter(e, currency)}
            onMouseLeave={onMouseLeave}
            className={`flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md cursor-pointer w-full text-left`}
        >
             <div className="flex items-center gap-4">
                <span className={`text-white font-bold text-sm px-2 py-1 rounded-md w-[80px] text-center ${changeClass}`}>
                    {isPositive ? '+' : ''}{currency.change.toFixed(2)}%
                </span>
                <p className="text-gray-900 dark:text-white font-semibold text-sm w-28 text-start">{formatPrice(currency.price)}<span className="text-gray-500 dark:text-gray-400 ms-1">{t('currency_usd')}</span></p>
            </div>

            <div className="flex items-center gap-3">
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                   <h4 className="text-gray-900 dark:text-white font-semibold text-sm whitespace-nowrap">{currency.name}</h4>
                   <span className="text-gray-500 text-xs font-mono">{currency.code}</span>
                </div>
                <img src={currency.logo} alt={`${currency.name} logo`} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 object-contain p-0.5 shrink-0" />
            </div>
        </button>
    );
};

const CurrencyList = ({ titleKey, linkKey, currencies, onMouseEnter, onMouseLeave, t, language }) => {
    const renderCurrencyList = () => {
        const translatedCurrencies = currencies.map(currency => ({ ...currency, name: t(currency.nameKey) }));
        return translatedCurrencies.map((currency, index) => (
            <React.Fragment key={currency.code}>
                <CurrencyItem 
                    currency={currency} 
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    t={t}
                />
                {index < currencies.length - 1 && <hr className="border-gray-200 dark:border-gray-800 my-1" />}
            </React.Fragment>
        ));
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">{t(titleKey)} {language === 'ar' ? '<' : '>'}</h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                {renderCurrencyList()}
            </div>
            <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-4 block text-center hover:underline">
                {t(linkKey)} {language === 'ar' ? '<' : '>'}
            </a>
        </div>
    );
};

export const DigitalCurrencyPerformance = () => {
    const { t, language } = useLanguage();
    const [popoverState, setPopoverState] = useState({ visible: false, currency: null, style: {} });
    const popoverTimeoutRef = useRef(null);

     const handleMouseEnter = useCallback((event, currency) => {
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        const rect = event.currentTarget.getBoundingClientRect();
        const popoverWidth = 320; 
        const popoverHeight = 220;
        const gap = 8;
        
        let top = rect.top;
        if (top + popoverHeight > window.innerHeight) top = window.innerHeight - popoverHeight - gap;

        let left;
        if (language === 'ar') {
            left = rect.left - popoverWidth - gap;
            if (left < 0) left = rect.right + gap;
        } else {
            left = rect.right + gap;
            if (left + popoverWidth > window.innerWidth) left = rect.left - popoverWidth - gap;
        }

        setPopoverState({ visible: true, currency, style: { top: `${top}px`, left: `${left}px` } });
    }, [language]);

    const handleMouseLeave = useCallback(() => {
        popoverTimeoutRef.current = setTimeout(() => {
            setPopoverState(s => ({ ...s, visible: false, currency: null }));
        }, 200);
    }, []);

    const handlePopoverEnter = useCallback(() => {
         if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    }, []);

    const bestPerformers = {
        titleKey: 'performance_crypto_best_title',
        linkKey: 'performance_crypto_best_link',
        currencies: [
            { nameKey: 'crypto_ruff', code: 'RUFFUSD', price: 0.000365110, change: 297.73, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCRUFF.svg' },
            { nameKey: 'crypto_nbx', code: 'BYNUSD', price: 0.00121686, change: 133.18, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBYN.svg' },
            { nameKey: 'crypto_get_rich', code: 'RICHGUSD', price: 0.00033645, change: 85.47, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCRICHG.svg' },
            { nameKey: 'crypto_troll', code: 'TROLLSOUSD', price: 0.032694, change: 84.53, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCTROLLSO.svg' },
            { nameKey: 'crypto_lumishare', code: 'LUMISUSD', price: 0.0027688, change: 84.43, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCLUMIS.svg' },
            { nameKey: 'crypto_vibe_cat', code: 'VIBECUSD', price: 0.0149289, change: 79.71, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCVIBEC.svg' },
        ],
    };
    
    const worstPerformers = {
        titleKey: 'performance_crypto_worst_title',
        linkKey: 'performance_crypto_worst_link',
        currencies: [
            { nameKey: 'crypto_pawse', code: 'PAWSEUSD', price: 0.00000265, change: -65.51, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCPAWSE.svg' },
            { nameKey: 'crypto_ooki', code: 'OOKIUSD', price: 0.000002711, change: -52.52, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCOOKI.svg' },
            { nameKey: 'crypto_vertex', code: 'VRTXUSD', price: 0.0012484, change: -50.62, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCVRTX.svg' },
            { nameKey: 'crypto_imagen', code: 'IMAGEUSD', price: 0.0015605, change: -49.34, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCIMAGE.svg' },
            { nameKey: 'crypto_playermon', code: 'PYMUSD', price: 0.00024697, change: -45.55, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCPYM.svg' },
            { nameKey: 'crypto_unice', code: 'UNICEUSD', price: 0.00018005, change: -43.20, logo: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCUNICE.svg' },
        ],
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-10">
            <CurrencyList 
                {...worstPerformers}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                t={t}
                language={language}
            />
            <CurrencyList 
                {...bestPerformers}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                t={t}
                language={language}
            />
            {popoverState.visible && popoverState.currency && createPortal(
                <CryptoPopover
                    currency={popoverState.currency}
                    style={popoverState.style}
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handleMouseLeave}
                />,
                document.body
            )}
        </section>
    );
};