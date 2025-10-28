/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Sparkles } from 'lucide-react';

interface AssistantFABProps {
    onOpen: () => void;
}

export const AssistantFAB = ({ onOpen }: AssistantFABProps) => {
    const { t } = useLanguage();

    return (
        <button
            onClick={onOpen}
            title={t('assistant_fab_tooltip')}
            className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out pulse-fab"
            aria-label={t('assistant_fab_tooltip')}
        >
            <Sparkles size={32} />
        </button>
    );
};