/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

// Helper to get setting from localStorage or default
const getInitialAIEnabled = (): boolean => {
    try {
        const stored = localStorage.getItem('ai_features_enabled');
        // Default to false if not set
        return stored === null ? false : stored === 'true';
    } catch (e) {
        console.error("Could not access localStorage for AI preference.", e);
        return false; // Default to false on error
    }
};

type AIContextValue = {
    isAIEnabled: boolean;
    toggleAIEnabled: () => void;
};

const AIContext = createContext<AIContextValue | undefined>(undefined);

export const AIProvider = ({ children }: { children?: ReactNode }) => {
    const [isAIEnabled, setIsAIEnabledState] = useState<boolean>(getInitialAIEnabled);

    const toggleAIEnabled = useCallback(() => {
        setIsAIEnabledState(prev => {
            const newState = !prev;
            try {
                localStorage.setItem('ai_features_enabled', String(newState));
            } catch (e) {
                console.error("Could not save AI preference to localStorage.", e);
            }
            // If we are disabling, we might want to reload to ensure all components depending on it are removed.
            if (!newState) {
                window.location.reload();
            }
            return newState;
        });
    }, []);

    const value = {
        isAIEnabled,
        toggleAIEnabled,
    };

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = (): AIContextValue => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};

// --- New Quota Error Context ---

type QuotaErrorContextValue = {
    isQuotaErrorModalOpen: boolean;
    showQuotaErrorModal: () => void;
    hideQuotaErrorModal: () => void;
};

const QuotaErrorContext = createContext<QuotaErrorContextValue | undefined>(undefined);

export const QuotaErrorProvider = ({ children }: { children?: ReactNode }) => {
    const [isQuotaErrorModalOpen, setIsQuotaErrorModalOpen] = useState(false);
    const showQuotaErrorModal = useCallback(() => setIsQuotaErrorModalOpen(true), []);
    const hideQuotaErrorModal = useCallback(() => setIsQuotaErrorModalOpen(false), []);

    const value = { isQuotaErrorModalOpen, showQuotaErrorModal, hideQuotaErrorModal };

    return (
        <QuotaErrorContext.Provider value={value}>
            {children}
        </QuotaErrorContext.Provider>
    );
};

export const useQuotaError = (): QuotaErrorContextValue => {
    const context = useContext(QuotaErrorContext);
    if (context === undefined) {
        throw new Error('useQuotaError must be used within a QuotaErrorProvider');
    }
    return context;
};