/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAI, useQuotaError } from '../i18n/AIContext';

export const QuotaErrorModal = () => {
    const { t } = useLanguage();
    const { toggleAIEnabled } = useAI();
    const { isQuotaErrorModalOpen, hideQuotaErrorModal } = useQuotaError();

    if (!isQuotaErrorModalOpen) {
        return null;
    }

    const handleDisableAI = () => {
        // Find the toggle in the settings and set it to false
        const aiFeaturesToggle = document.querySelector('input[type="checkbox"]');
        if (aiFeaturesToggle && (aiFeaturesToggle as HTMLInputElement).checked) {
            toggleAIEnabled();
        }
        hideQuotaErrorModal();
    };
    

    return createPortal(
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 animate-fade-in-up">
            <div 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto flex flex-col border border-yellow-400 dark:border-yellow-600"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
                    <AlertTriangle className="text-yellow-500" size={24} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('quota_error_title')}</h2>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">{t('quota_error_message')}</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{t('quota_error_prompt')}</p>
                </main>
                <footer className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                    <button 
                        onClick={hideQuotaErrorModal}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        {t('quota_error_no')}
                    </button>
                    <button 
                        onClick={handleDisableAI}
                        className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                    >
                        {t('quota_error_yes')}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};