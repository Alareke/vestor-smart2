/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { t } = useLanguage();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg text-white">
                <h2 className="text-xl mb-4">{t('auth_modal_title')}</h2>
                <p className="text-gray-400 mb-6">{t('auth_modal_desc')}</p>
                <button onClick={onClose} className="bg-blue-600 px-4 py-2 rounded-lg">{t('auth_modal_close_button')}</button>
            </div>
        </div>
    );
};