/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { SlidersHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const filterOptions = [
    { type: 'price', titleKey: 'price_filter_100_plus', descKey: 'price_filter_100_plus_desc', min: 100, max: null, preset: '100+' },
    { type: 'price', titleKey: 'price_filter_10_to_100', descKey: 'price_filter_10_to_100_desc', min: 10, max: 100, preset: '10-100' },
    { type: 'price', titleKey: 'price_filter_10_less', descKey: 'price_filter_10_less_desc', min: null, max: 10, preset: '<10' },
    { type: 'price', titleKey: 'price_filter_5_less', descKey: 'price_filter_5_less_desc', min: null, max: 5, preset: '<5' },
    { type: 'tech', titleKey: 'price_filter_above_ema_50', descKey: 'price_filter_above_ema_50_desc', preset: 'ema50+' },
    { type: 'tech', titleKey: 'price_filter_below_ema_50', descKey: 'price_filter_below_ema_50_desc', preset: 'ema50-' },
    { type: 'tech', titleKey: 'price_filter_bb_upper', descKey: 'price_filter_bb_upper_desc', preset: 'bb_upper' },
    { type: 'tech', titleKey: 'price_filter_bb_lower', descKey: 'price_filter_bb_lower_desc', preset: 'bb_lower' },
];

export const PriceFilterModal = ({ isOpen, onClose, anchorEl, onApply, currentValues }) => {
    const { t, language } = useLanguage();
    const modalRef = useRef(null);
    const [min, setMin] = useState(currentValues.min || '');
    const [max, setMax] = useState(currentValues.max || '');
    const [showManualSetup, setShowManualSetup] = useState(false);

    const handlePresetClick = (preset) => {
        // Technical indicators filtering logic is not yet implemented.
        if (preset.type === 'price') {
            const newFilter = { min: preset.min, max: preset.max, preset: preset.preset };
            onApply(newFilter);
        } else {
            // Placeholder for technical filters
            console.log("Technical filter selected:", preset.preset);
        }
        onClose();
    };

    const handleManualApply = () => {
        onApply({
            min: min === '' ? null : parseFloat(min),
            max: max === '' ? null : parseFloat(max),
            preset: null
        });
    };
    
    const handleDelete = () => {
        onApply({ min: null, max: null, preset: null });
        setMin('');
        setMax('');
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);
    
     useEffect(() => {
        if (isOpen) {
            setMin(currentValues.min ?? '');
            setMax(currentValues.max ?? '');
            // Do not reset manual setup view if user has entered values
            if (currentValues.min === null && currentValues.max === null) {
                setShowManualSetup(false);
            }
        }
    }, [currentValues, isOpen]);
    
    const style: React.CSSProperties = useMemo(() => {
        const baseStyle: React.CSSProperties = { position: 'absolute' };
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            if (language === 'ar') {
                return {
                    ...baseStyle,
                    top: `${rect.bottom + 4}px`,
                    right: `${window.innerWidth - rect.right}px`,
                };
            } else {
                return {
                    ...baseStyle,
                    top: `${rect.bottom + 4}px`,
                    left: `${rect.left}px`,
                };
            }
        }
        return baseStyle;
    }, [anchorEl, language]);

    if (!isOpen) return null;

    const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft;

    return createPortal(
        <div 
            ref={modalRef}
            style={style}
            className="z-30 w-80 bg-white dark:bg-gray-900 dark:bg-[#1C2331] rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 dark:border-gray-700 flex flex-col text-gray-900 dark:text-gray-100 dark:text-white animate-fade-in-up"
        >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 flex items-center">
                 {showManualSetup && (
                    <button onClick={() => setShowManualSetup(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                        <BackIcon size={20} />
                    </button>
                )}
                <h3 className="text-center font-semibold text-gray-800 dark:text-gray-300 flex-grow">{t('screener_price_modal_title')}</h3>
            </div>
            
            {showManualSetup ? (
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder={t('price_filter_min_placeholder')} value={min} onChange={e => setMin(e.target.value)} onBlur={handleManualApply} className="w-full bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <span className="text-gray-500">-</span>
                        <input type="number" placeholder={t('price_filter_max_placeholder')} value={max} onChange={e => setMax(e.target.value)} onBlur={handleManualApply} className="w-full bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                     <p className="text-xs text-gray-500 text-center">{t('price_filter_apply_note')}</p>
                </div>
            ) : (
                <div className="p-3 space-y-1">
                    {filterOptions.map(opt => (
                        <button key={opt.titleKey} onClick={() => handlePresetClick(opt)} className="w-full text-right p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md transition-colors">
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100 dark:text-white">{t(opt.titleKey)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t(opt.descKey)}</p>
                        </button>
                    ))}
                    <div className="!my-2 border-t border-gray-200 dark:border-gray-700 dark:border-gray-700/50"></div>
                    <button onClick={() => setShowManualSetup(true)} className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-white">
                        <SlidersHorizontal size={20} className="text-gray-600 dark:text-gray-400" />
                        <span>{t('price_filter_manual_setup')}</span>
                    </button>
                    <button onClick={handleDelete} className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-white">
                        <Trash2 size={20} className="text-gray-600 dark:text-gray-400" />
                        <span>{t('price_filter_delete')}</span>
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
};