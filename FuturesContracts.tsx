/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { FuturesPopover } from './FuturesPopover';

const CommodityIcon = ({ SvgComponent, bgColor }) => (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
        <SvgComponent className="w-5 h-5 text-white" />
    </div>
);

const ThreeBarsIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 18h16v-2.5H4v2.5zm0-5h16v-2.5H4v2.5zm0-5h16V5.5H4v2.5z" />
    </svg>
);
const PyramidSquaresIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 5h4v4h-4z M7 11h4v4H7z m6 0h4v4h-4z"/>
    </svg>
);
const NaturalGasIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <path d="M12.93,8.37a1,1,0,0,0-1.37.39,1,1,0,0,0-.05.58,10.12,10.12,0,0,1-1,5.63,1,1,0,0,0,.4,1.26,1,1,0,0,0,1.27-.41,11.53,11.53,0,0,0,1-6.19A1,1,0,0,0,12.93,8.37Z" fill="none"/>
        <path d="M17.4,12.2a1,1,0,0,0-1.39.5,6.38,6.38,0,0,1-1,3.41,1,1,0,0,0,1.68,1,7.83,7.83,0,0,0,1.19-4.14A1,1,0,0,0,17.4,12.2Z" fill="none"/>
        <path d="M12,2A10,10,0,0,0,6.33,19.11a1,1,0,0,0,1.08.2,1,1,0,0,0,.61-1,7.24,7.24,0,0,1,1-3.14,1,1,0,0,0-1.63-1.16A9.12,9.12,0,0,0,6,19.4a10,10,0,1,0,6-17.4Z" />
    </svg>
);
const OilDropIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
       <path d="M12,2a8,8,0,0,0-8,8c0,2.5,1.94,6.08,5.46,9.92a1,1,0,0,0,1.6,0C18.06,16.08,20,12.5,20,10A8,8,0,0,0,12,2Z"/>
    </svg>
);
const ULSDIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5,4H5.5A1.5,1.5,0,0,0,4,5.5v13A1.5,1.5,0,0,0,5.5,20h13A1.5,1.5,0,0,0,20,18.5V5.5A1.5,1.5,0,0,0,18.5,4ZM9,14H7V12h2Zm5,0H12V12h2Zm0-5H7V7h7Z"/>
    </svg>
);

const futuresData = {
    metals: [
        { id: 'silver', nameKey: 'futures_silver', price: '38.240', unitKey: 'futures_unit_usd_apz', change: -0.33, ticker: '!SI1', IconComponent: ThreeBarsIcon, iconBg: 'bg-slate-500' },
        { id: 'copper', nameKey: 'futures_copper', price: '5.7825', unitKey: 'futures_unit_usd_lbr', change: -0.04, ticker: '!HG1', IconComponent: PyramidSquaresIcon, iconBg: 'bg-orange-700' },
        { id: 'aluminum', nameKey: 'futures_aluminum', price: '2,595.50', unitKey: 'futures_unit_usd', change: +0.01, ticker: '!ALI1', IconComponent: PyramidSquaresIcon, iconBg: 'bg-gray-500' },
        { id: 'gold', nameKey: 'futures_gold', price: '3,336.1', unitKey: 'futures_unit_usd_apz', change: +0.01, ticker: '!GC1', IconComponent: ThreeBarsIcon, iconBg: 'bg-amber-500' },
        { id: 'platinum', nameKey: 'futures_platinum', price: '1,456.9', unitKey: 'futures_unit_usd_apz', change: +2.40, ticker: '!PL1', IconComponent: ThreeBarsIcon, iconBg: 'bg-slate-300' },
        { id: 'palladium', nameKey: 'futures_palladium', price: '1,284.0', unitKey: 'futures_unit_usd_apz', change: +2.34, ticker: '!PA1', IconComponent: ThreeBarsIcon, iconBg: 'bg-gray-400' },
    ],
    energy: [
        { id: 'crude_oil', nameKey: 'futures_crude_oil', price: '66.00', unitKey: 'futures_unit_usd_bll', change: +1.29, ticker: '!CL1', IconComponent: OilDropIcon, iconBg: 'bg-gray-800' },
        { id: 'brent_crude', nameKey: 'futures_brent_crude', price: '68.51', unitKey: 'futures_unit_usd_bll', change: +1.26, ticker: '!BRN1', IconComponent: OilDropIcon, iconBg: 'bg-gray-800' },
        { id: 'murban_crude', nameKey: 'futures_murban_crude', price: '70.06', unitKey: 'futures_unit_usd_bll', change: +0.98, ticker: '!ADM1', IconComponent: OilDropIcon, iconBg: 'bg-gray-800' },
        { id: 'natural_gas', nameKey: 'futures_natural_gas', price: '3.068', unitKey: 'futures_unit_usd_mmbtu', change: -1.35, ticker: '!NG1', IconComponent: NaturalGasIcon, iconBg: 'bg-sky-500' },
        { id: 'rbob_gasoline', nameKey: 'futures_rbob_gasoline', price: '2.0910', unitKey: 'futures_unit_usd_gll', change: +1.34, ticker: '!RB1', IconComponent: PyramidSquaresIcon, iconBg: 'bg-orange-500' },
        { id: 'ny_harbor', nameKey: 'futures_ny_harbor', price: '2.3993', unitKey: 'futures_unit_usd', change: +0.85, ticker: '!HO1', IconComponent: ULSDIcon, iconBg: 'bg-gray-800' },
    ]
};

const FuturesContractItem = (props: any) => {
    const { item, onMouseEnter, onMouseLeave } = props;
    const { t, language } = useLanguage();
    const isPositive = item.change >= 0;

    return (
        <button 
            className="w-full text-left py-3 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-[#1C2331] rounded-md px-2 -mx-2 cursor-pointer"
            onMouseEnter={(e) => onMouseEnter(e, {...item, unit: t(item.unitKey)})}
            onMouseLeave={onMouseLeave}
            title={t('view_details_for_tooltip', { stock: t(item.nameKey) })}
        >
            <div className="flex justify-between items-center">
                <div className={`${language === 'ar' ? 'text-right' : 'text-left'} min-w-0`}>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">{item.price} <span className="text-gray-500 text-xs">{t(item.unitKey)}</span></p>
                     <p className={`font-semibold text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-900 dark:text-white font-medium text-sm truncate">{t(item.nameKey)}</span>
                        <span className="text-orange-500 dark:text-orange-400 font-bold text-xs">{t('badge_dividend')}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="bg-gray-200 dark:bg-[#2A2E39] text-gray-800 dark:text-white text-xs font-mono px-2 py-1 rounded-md">{item.ticker}</div>
                        <CommodityIcon SvgComponent={item.IconComponent} bgColor={item.iconBg} />
                    </div>
                </div>
            </div>
        </button>
    );
};

const FuturesCategory = ({ titleKey, items, viewAllKey, onMouseEnter, onMouseLeave }) => {
    const { t, language } = useLanguage();
    const midPoint = Math.ceil(items.length / 2);
    const col1Items = items.slice(0, midPoint);
    const col2Items = items.slice(midPoint);

    return (
        <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t(titleKey)} {language === 'ar' ? '<' : '>'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="flex flex-col">
                    {col1Items.map(item => <FuturesContractItem key={item.id} item={item} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />)}
                </div>
                <div className="flex flex-col">
                    {col2Items.map(item => <FuturesContractItem key={item.id} item={item} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />)}
                </div>
            </div>
             <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm mt-6 block text-center hover:underline">
                {t(viewAllKey)} {language === 'ar' ? '<' : '>'}
            </a>
        </div>
    );
}

export const FuturesContracts = () => {
    const { language } = useLanguage();
    const [popoverState, setPopoverState] = useState({ visible: false, item: null, style: {} });
    const popoverTimeoutRef = useRef(null);

    const handleMouseEnter = useCallback((event, item) => {
        if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
        const rect = event.currentTarget.getBoundingClientRect();
        const popoverWidth = 320; 
        const popoverHeight = 240;
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

        setPopoverState({ visible: true, item, style: { top: `${top}px`, left: `${left}px` } });
    }, [language]);

    const handleMouseLeave = useCallback(() => {
        popoverTimeoutRef.current = setTimeout(() => {
            setPopoverState(s => ({ ...s, visible: false, item: null }));
        }, 200);
    }, []);

    const handlePopoverEnter = useCallback(() => {
         if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
    }, []);

    return (
        <section>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 md:p-6 bg-white dark:bg-black rounded-lg">
                <FuturesCategory 
                    titleKey="futures_metals_title" 
                    items={futuresData.metals} 
                    viewAllKey="futures_metals_view_all"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 my-4 md:my-0"></div>
                <FuturesCategory 
                    titleKey="futures_energy_title" 
                    items={futuresData.energy} 
                    viewAllKey="futures_energy_view_all"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
            {popoverState.visible && popoverState.item && createPortal(
                <FuturesPopover
                    item={popoverState.item}
                    style={popoverState.style}
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handleMouseLeave}
                />,
                document.body
            )}
        </section>
    );
};