/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslationDebug } from '../i18n/TranslationDebugContext';
import { useDeveloperMode } from '../i18n/DeveloperModeContext';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const MissingTranslationsModal = () => {
    const { isDevMode } = useDeveloperMode();
    const { missingKeys, clearMissingKeys } = useTranslationDebug();
    const { t } = useLanguage();

    if (!isDevMode || missingKeys.size === 0) {
        return null;
    }

    return createPortal(
        <div className="fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-[1000] w-full max-w-md bg-yellow-50 border border-yellow-300 dark:bg-yellow-900/80 dark:border-yellow-700/50 backdrop-blur-sm rounded-lg shadow-2xl animate-fade-in-up">
            <header className="flex items-center justify-between p-3 border-b border-yellow-200 dark:border-yellow-800/50">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle size={20} />
                    <h2 className="font-bold text-lg">{t('dev_missing_translations_title')}</h2>
                </div>
                <button onClick={clearMissingKeys} title={t('dev_clear_list')} className="p-1 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full">
                    <Trash2 size={18} />
                </button>
            </header>
            <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1 font-mono text-sm text-yellow-900 dark:text-yellow-100">
                    {Array.from(missingKeys).map(key => (
                        <li key={key} className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md">{key}</li>
                    ))}
                </ul>
            </div>
            <footer className="p-2 text-center text-xs text-yellow-700 dark:text-yellow-400">
                {t('dev_found_missing_keys', { count: missingKeys.size })}
            </footer>
        </div>,
        document.body
    );
};