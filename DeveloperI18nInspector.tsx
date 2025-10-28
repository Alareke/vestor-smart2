/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertTriangle, Copy, Check, Download } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTranslationDebug } from '../i18n/TranslationDebugContext';
import { diffI18n, unflatten } from '../utils/i18n-inspector';

type DiffResult = {
    missingInAr: string[];
    missingInEn: string[];
};

export const DeveloperI18nInspector = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { missingKeys: unregisteredKeys, clearMissingKeys } = useTranslationDebug();

    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [diff, setDiff] = useState<DiffResult>({ missingInAr: [], missingInEn: [] });
    const [enJson, setEnJson] = useState(null);
    const [arJson, setArJson] = useState(null);
    const [updatedTranslations, setUpdatedTranslations] = useState<{ en: Record<string, string>, ar: Record<string, string> }>({ en: {}, ar: {} });
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStatus('loading');
            Promise.all([
                fetch('/i18n/locales/en/common.json').then(res => res.json()),
                fetch('/i18n/locales/ar/common.json').then(res => res.json())
            ]).then(([enData, arData]) => {
                setEnJson(enData);
                setArJson(arData);
                const { missingInCompare: missingInAr } = diffI18n(enData, arData);
                const { missingInCompare: missingInEn } = diffI18n(arData, enData);
                setDiff({ missingInAr, missingInEn });
                setStatus('ready');
            }).catch(err => {
                console.error("Failed to load translation files:", err);
                setStatus('error');
            });
        } else {
            // Reset state when modal is closed
            setUpdatedTranslations({ en: {}, ar: {} });
        }
    }, [isOpen]);
    
    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };
    
    const handleDownload = (lang: 'en' | 'ar') => {
        const baseJson = lang === 'en' ? enJson : arJson;
        
        const updatesForLang = { ...updatedTranslations[lang] };
        
        // Add missing keys from other lang
        if(lang === 'ar') {
            diff.missingInAr.forEach(key => {
                if(!updatesForLang[key]) updatesForLang[key] = updatedTranslations.ar[key] || '';
            })
        }
        if(lang === 'en') {
            diff.missingInEn.forEach(key => {
                 if(!updatesForLang[key]) updatesForLang[key] = updatedTranslations.en[key] || '';
            })
        }

        // Add unregistered keys
         unregisteredKeys.forEach(key => {
            if(!updatesForLang[key]) updatesForLang[key] = updatedTranslations[lang][key] || '';
        });

        // Create a deep copy to avoid mutating the original state
        const newJson = JSON.parse(JSON.stringify(baseJson));

        // Unflatten and merge updates
        const unflattenedUpdates = unflatten(updatesForLang);
        
        // Deep merge
        const mergeDeep = (target, source) => {
            for (const key in source) {
                if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                    mergeDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        mergeDeep(newJson, unflattenedUpdates);

        const blob = new Blob([JSON.stringify(newJson, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `common.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUpdate = (lang: 'en' | 'ar', key: string, value: string) => {
        setUpdatedTranslations(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [key]: value
            }
        }));
    };

    const renderSection = (title: string, keys: string[], sourceLang: 'en' | 'ar', targetLang: 'en' | 'ar') => {
        if (keys.length === 0) return null;
        const sourceJson = sourceLang === 'en' ? enJson : arJson;
        
        const getNestedValue = (obj, key) => key.split('.').reduce((o, i) => o?.[i], obj);

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title} ({keys.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                    {keys.map(key => {
                        const sourceValue = getNestedValue(sourceJson, key) || '';
                        const currentValue = updatedTranslations[targetLang][key] || '';
                        const copyKey = `${targetLang}-${key}`;

                        return (
                            <div key={key} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400">{key}</p>
                                    <button onClick={() => handleCopy(`"${key}": "${currentValue}"`, copyKey)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                                        {copiedKey === copyKey ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">{t('i18n_source_value')} ({sourceLang.toUpperCase()})</label>
                                        <input type="text" readOnly value={sourceValue} className="w-full bg-gray-200 dark:bg-gray-700 p-1 rounded-md text-sm text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">{t('i18n_target_value')} ({targetLang.toUpperCase()})</label>
                                        <input type="text" value={currentValue} onChange={(e) => handleUpdate(targetLang, key, e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 p-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (status === 'loading') return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" size={32}/></div>;
        if (status === 'error') return <div className="flex items-center justify-center h-full text-red-500"><AlertTriangle className="me-2"/> Error loading translation files.</div>;
        
        const hasIssues = diff.missingInAr.length > 0 || diff.missingInEn.length > 0 || unregisteredKeys.size > 0;

        return (
            <>
                {!hasIssues && (
                    <div className="text-center py-20 text-green-600 dark:text-green-400">
                        <p className="font-semibold">{t('i18n_all_clear')}</p>
                    </div>
                )}
                {renderSection(t('i18n_missing_in_ar'), diff.missingInAr, 'en', 'ar')}
                {renderSection(t('i18n_missing_in_en'), diff.missingInEn, 'ar', 'en')}
                {unregisteredKeys.size > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('i18n_unregistered_keys')} ({unregisteredKeys.size})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                           {[...unregisteredKeys].map(key => (
                               <div key={key} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                   <p className="font-mono text-xs text-red-600 dark:text-red-400 mb-2">{key}</p>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                       <div>
                                           <label className="text-xs text-gray-500">EN</label>
                                           <input type="text" value={updatedTranslations.en[key] || ''} onChange={(e) => handleUpdate('en', key, e.target.value)} placeholder="Add English value..." className="w-full bg-gray-100 dark:bg-gray-900 p-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white" />
                                       </div>
                                       <div>
                                           <label className="text-xs text-gray-500">AR</label>
                                           <input type="text" value={updatedTranslations.ar[key] || ''} onChange={(e) => handleUpdate('ar', key, e.target.value)} placeholder="أضف قيمة عربية..." className="w-full bg-gray-100 dark:bg-gray-900 p-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white" />
                                       </div>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🧠 {t('i18n_inspector_title')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><X size={24} /></button>
                </header>
                <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
                     <button onClick={() => { clearMissingKeys(); onClose(); }} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('cancel_button')}</button>
                    <button onClick={() => handleDownload('en')} className="flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-semibold py-2 px-4 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900"><Download size={16} /> {t('i18n_download_en')}</button>
                    <button onClick={() => handleDownload('ar')} className="flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-2 px-4 rounded-md hover:bg-green-200 dark:hover:bg-green-900"><Download size={16} /> {t('i18n_download_ar')}</button>
                </footer>
            </div>
        </div>,
        document.body
    );
};