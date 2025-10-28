/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type TranslationDebugContextValue = {
    missingKeys: Set<string>;
    addMissingKey: (key: string) => void;
    clearMissingKeys: () => void;
};

const TranslationDebugContext = createContext<TranslationDebugContextValue | undefined>(undefined);

export const TranslationDebugProvider = ({ children }: { children?: ReactNode }) => {
    const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());

    const addMissingKey = useCallback((key: string) => {
        setMissingKeys(prev => {
            if (prev.has(key)) return prev;
            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    }, []);

    const clearMissingKeys = useCallback(() => {
        setMissingKeys(new Set());
    }, []);

    const value = { missingKeys, addMissingKey, clearMissingKeys };

    return (
        <TranslationDebugContext.Provider value={value}>
            {children}
        </TranslationDebugContext.Provider>
    );
};

export const useTranslationDebug = (): TranslationDebugContextValue => {
    const context = useContext(TranslationDebugContext);
    if (!context) {
        throw new Error('useTranslationDebug must be used within a TranslationDebugProvider');
    }
    return context;
};