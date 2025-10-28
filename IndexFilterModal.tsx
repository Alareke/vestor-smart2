/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Search, Trash2, CheckSquare } from 'lucide-react';

// Custom Icons for Indices
const IconTasi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#3b82f6" d="M12 2L2 22h20L12 2zm0 4.55L17.52 19H6.48L12 6.55z"/><path fill="#1e40af" d="M4.47 20l7.53-13.04L19.53 20H4.47z"/></svg>;
const IconTisi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#22c55e"/><circle cx="9" cy="10" r="1.5" fill="white"/><circle cx="15" cy="10" r="1.5" fill="white"/><path d="M9 14h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconTmti = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="4" y="4" width="16" height="16" rx="3" fill="#f97316"/><rect x="7" y="10" width="3" height="6" fill="white"/><rect x="11" y="7" width="3" height="9" fill="white"/><rect x="15" y="13" width="3" height="3" fill="white"/></svg>;
const IconTeni = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#38bdf8" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconThei = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#ef4444" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconTcgi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#dc2626" d="M4 18h16v-2H4v2zm2-4h12v-2H6v2zm2-4h8V8H8v2zm2-4h4V4h-4v2z"/><circle cx="18" cy="6" r="3" fill="white"/></svg>;
const IconTtsi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#84cc16" d="M4 4h16v16H4z" /><path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2"/></svg>;
const IconTfbi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#f59e0b"/><path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM2 9h20M5 5h14v4H5z" fill="white"/></svg>;
const IconTrli = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#ca8a04"/><rect x="6" y="9" width="12" height="6" fill="white" rx="1"/><rect x="8" y="7" width="8" height="2" fill="white" rx="1"/></svg>;
const IconTrmi = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#166534" d="M3 12l9-9 9 9v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path fill="white" d="M9 21V12h6v9z"/></svg>;
const IconTdai = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#a16207"/><rect x="6" y="9" width="12" height="6" fill="white" rx="1"/><rect x="8" y="7" width="8" height="2" fill="white" rx="1"/></svg>;
const IconTbni = () => <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#22c55e"/><circle cx="9" cy="10" r="1.5" fill="white"/><circle cx="15" cy="10" r="1.5" fill="white"/><path d="M9 14h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>;


const indexList = [
  { nameKey: 'index_tasi_name', ticker: 'TASI', Icon: IconTasi },
  { nameKey: 'index_tbni_name', ticker: 'TBNI', Icon: IconTbni },
  { nameKey: 'index_tisi_name', ticker: 'TISI', Icon: IconTisi },
  { nameKey: 'index_tmti_name', ticker: 'TMTI', Icon: IconTmti },
  { nameKey: 'index_teni_name', ticker: 'TENI', Icon: IconTeni },
  { nameKey: 'index_thei_name', ticker: 'THEI', Icon: IconThei },
  { nameKey: 'index_tcgi_name', ticker: 'TCGI', Icon: IconTcgi },
  { nameKey: 'index_ttsi_name', ticker: 'TTSI', Icon: IconTtsi },
  { nameKey: 'index_tfbi_name', ticker: 'TFBI', Icon: IconTfbi },
  { nameKey: 'index_trli_name', ticker: 'TRLI', Icon: IconTrli },
  { nameKey: 'index_trmi_name', ticker: 'TRMI', Icon: IconTrmi },
  { nameKey: 'index_tdai_name', ticker: 'TDAI', Icon: IconTdai },
];


export const IndexFilterModal = ({ isOpen, onClose, anchorEl, onApply, currentSelection }) => {
    const { t, language } = useLanguage();
    const modalRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndices, setSelectedIndices] = useState(new Set(currentSelection));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                onApply(selectedIndices);
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl, onApply, selectedIndices]);

    const filteredIndices = useMemo(() => {
        if (!searchTerm) return indexList;
        return indexList.filter(index =>
            t(index.nameKey).toLowerCase().includes(searchTerm.toLowerCase()) ||
            index.ticker.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, t]);

    const handleSelect = (ticker) => {
        const newSet = new Set(selectedIndices);
        if (newSet.has(ticker)) {
            newSet.delete(ticker);
        } else {
            newSet.add(ticker);
        }
        setSelectedIndices(newSet);
        onApply(newSet); // Apply immediately on change
    };
    
    const handleSelectAll = () => {
        let newSet;
        if (selectedIndices.size === indexList.length) {
            newSet = new Set();
        } else {
            newSet = new Set(indexList.map(i => i.ticker));
        }
        setSelectedIndices(newSet);
        onApply(newSet);
    };

    const handleDelete = () => {
        const newSet = new Set();
        setSelectedIndices(newSet);
        onApply(newSet);
    };

    if (!isOpen) return null;

    return createPortal(
        <div 
            ref={modalRef}
            style={{
                top: anchorEl ? (anchorEl.offsetTop + anchorEl.offsetHeight + 4) + 'px' : '0px',
                left: anchorEl ? (language === 'ar' ? 'auto' : (anchorEl.offsetLeft) + 'px') : '0px',
                right: anchorEl ? (language === 'ar' ? (window.innerWidth - anchorEl.offsetLeft - anchorEl.offsetWidth) + 'px' : 'auto') : '0px',
            }}
            className="absolute z-30 w-[320px] bg-white dark:bg-gray-900 dark:bg-[#1C2331] rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 dark:border-gray-700 flex flex-col text-gray-900 dark:text-gray-100 dark:text-white animate-fade-in-up"
        >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
                <h3 className="text-center font-semibold text-gray-800 dark:text-gray-300">{t('screener_index_modal_title')}</h3>
            </div>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
                <div className="relative">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('screener_index_search_placeholder')}
                           className="w-full bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-1.5 ps-8 pe-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-2 text-gray-500"/>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-72 p-1">
                {filteredIndices.map(index => (
                    <div key={index.ticker} className="flex items-center justify-between p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-md">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100 dark:text-white">{t(index.nameKey)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">• {index.ticker}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <index.Icon />
                            <input type="checkbox"
                                checked={selectedIndices.has(index.ticker)}
                                onChange={() => handleSelect(index.ticker)}
                                className="w-5 h-5 bg-transparent border-2 border-gray-400 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-blue-500 text-blue-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 flex justify-end items-center gap-4">
                <button onClick={handleSelectAll} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white">
                    <CheckSquare size={16} /> {t('screener_index_select_all')}
                </button>
                 <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white">
                    <Trash2 size={16} /> {t('screener_index_delete')}
                </button>
            </div>
        </div>
    , document.body);
};