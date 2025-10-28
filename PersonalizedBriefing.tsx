/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Sparkles, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { WatchlistData } from '../data/watchlistData';
import { useQuotaError } from '../i18n/AIContext';

interface PersonalizedBriefingProps {
    watchlistData: WatchlistData;
    onDismiss: () => void;
}

// A helper for API calls with retry logic for rate limiting and network errors
async function withRetry<T>(fn: () => Promise<T>, retries = 10, delay = 5000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const message = err.message || err.toString();
            // Retry on 429 (rate limit) or generic XHR errors
            if (message.includes('429') || message.includes('xhr error')) {
                if (i < retries - 1) { // Don't wait on the last attempt
                    const waitTime = delay * Math.pow(2, i) + Math.random() * 1000; // Exponential backoff with jitter
                    await new Promise(res => setTimeout(res, waitTime));
                } else {
                    throw err; // Re-throw last error after all retries
                }
            } else {
                // Don't retry on other errors
                throw err;
            }
        }
    }
    throw lastError;
}

export const PersonalizedBriefing = ({ watchlistData, onDismiss }: PersonalizedBriefingProps) => {
    const { t } = useLanguage();
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showQuotaErrorModal } = useQuotaError();

    const generateBriefing = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        await new Promise(res => setTimeout(res, Math.random() * 1000));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const watchlistSummary = Object.values(watchlistData)
                .flatMap(cat => cat.items)
                .map(item => `${t(item.nameKey)} (${item.symbol})`)
                .join(', ');

            
            // FIX: Explicitly type the API response to resolve 'text' property error.
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
            }));

            setBriefing(response.text);
        } catch (err: any) {
            const errorMessage = err?.message?.toLowerCase() || '';
            if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                showQuotaErrorModal();
                setError(null);
            } else {
                let errorKey = 'daily_briefing_error';
                if (errorMessage.includes('safety')) {
                    errorKey = 'ai_analysis_error_safety';
                } else if (err instanceof TypeError) {
                    errorKey = 'ai_analysis_error_network';
                }
                setError(t(errorKey));
            }
        } finally {
            setIsLoading(false);
        }
    }, [watchlistData, t, showQuotaErrorModal]);

    useEffect(() => {
        generateBriefing();
    }, [generateBriefing]);

    return (
        <section className="bg-gradient-to-tr from-blue-50 dark:from-blue-900/20 via-white dark:via-black to-white dark:to-black p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-800 relative">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="text-blue-600 dark:text-blue-400" size={22} />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('daily_briefing_title')}</h2>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <RefreshCw size={16} className="animate-spin" />
                            <span>{t('daily_briefing_loading')}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{briefing}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={generateBriefing} disabled={isLoading} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50" aria-label="Refresh briefing">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={onDismiss} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Dismiss briefing">
                        <X size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};