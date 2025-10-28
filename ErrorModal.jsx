

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useDeveloperMode } from '../i18n/DeveloperModeContext';
import { AlertTriangle } from 'lucide-react';

// Fallbacks are now managed inside LanguageContext for robustness.
// This component now relies on the `t` function provided by the context.

export const ErrorModal = ({ error }) => {
    const { t } = useLanguage();
    const { isDevMode } = useDeveloperMode();
    
    return (
        <div className="fixed inset-0 bg-red-900/90 z-[9999] flex items-center justify-center p-4 text-white font-sans">
            <div className="w-full max-w-2xl bg-red-800/50 border border-red-600 rounded-lg p-8 text-center shadow-2xl">
                <AlertTriangle size={48} className="mx-auto text-red-300 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">{t('error_translation_critical_title')}</h1>
                <p className="text-red-200 mb-6">{t(error.messageKey)}</p>
                <p className="text-red-200 mb-6">{t('error_translation_action_suggestion')}</p>
                
                {isDevMode && error.details && (
                    <div className="mt-6 p-4 bg-black/30 rounded-lg text-left text-sm">
                        <h3 className="font-bold mb-2 text-red-200">{t('error_translation_details')}</h3>
                        <pre className="text-red-200 whitespace-pre-wrap font-mono text-xs">{error.details}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};