/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Lightbulb, RefreshCw, Loader2, AlertTriangle, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQuotaError } from '../i18n/AIContext';

interface Suggestion {
    title: string;
    rationale: string;
    risk: 'Low' | 'Medium' | 'High' | 'منخفضة' | 'متوسطة' | 'عالية';
    asset_class: string;
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

const RiskBadge = ({ risk, t }) => {
    const getRiskInfo = (riskValue: string) => {
        const r = riskValue.toLowerCase();
        if (r.includes('low') || r.includes('منخفضة')) {
            return {
                key: 'ai_suggestions_risk_low',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                Icon: ShieldCheck,
            };
        }
        if (r.includes('medium') || r.includes('متوسطة')) {
            return {
                key: 'ai_suggestions_risk_medium',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                Icon: TrendingUp,
            };
        }
        if (r.includes('high') || r.includes('عالية')) {
            return {
                key: 'ai_suggestions_risk_high',
                color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                Icon: Zap,
            };
        }
        return {
            key: null,
            color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            Icon: ShieldCheck,
        };
    };

    const { key, color, Icon } = getRiskInfo(risk);
    const riskText = key ? t(key) : risk;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
            <Icon size={14} />
            <span>{riskText}</span>
        </div>
    );
};

export const AISuggestions = () => {
    const { t, language } = useLanguage();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showQuotaErrorModal } = useQuotaError();

    const generateSuggestions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        await new Promise(res => setTimeout(res, Math.random() * 1000));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                        risk: { type: Type.STRING },
                        asset_class: { type: Type.STRING },
                    },
                    required: ["title", "rationale", "risk", "asset_class"],
                },
            };

            // FIX: Explicitly type the API response to resolve 'text' property error.
            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            }));
            
            const parsedSuggestions = JSON.parse(response.text);
            setSuggestions(parsedSuggestions);

        } catch (err: any) {
            const errorMessage = err?.message?.toLowerCase() || '';
            if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                showQuotaErrorModal();
                setError(null);
            } else {
                let errorKey = 'ai_suggestions_error'; // Default generic error
                if (errorMessage.includes('safety')) {
                    errorKey = 'ai_analysis_error_safety';
                } else if (err instanceof TypeError) { // Often indicates network issue
                    errorKey = 'ai_analysis_error_network';
                }
                setError(t(errorKey));
            }
        } finally {
            setIsLoading(false);
        }
    }, [t, language, showQuotaErrorModal]);

    useEffect(() => {
        generateSuggestions();
    }, [generateSuggestions]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-48 gap-3 text-gray-500 dark:text-gray-400">
                    <Loader2 size={24} className="animate-spin text-cyan-500" />
                    <span className="text-lg font-semibold">{t('ai_suggestions_loading')}</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-48 gap-3 text-red-500 dark:text-red-400">
                    <AlertTriangle size={24} />
                    <span className="text-lg font-semibold">{error}</span>
                </div>
            );
        }

        return (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col justify-between transform transition-transform hover:-translate-y-1">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">{suggestion.asset_class}</span>
                                <RiskBadge risk={suggestion.risk} t={t} />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{suggestion.rationale}</p>
                        </div>
                        <button className="mt-4 w-full text-center py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm">
                            {t('ai_suggestions_explore')}
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="bg-white dark:bg-black rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Lightbulb className="text-yellow-400" size={24} />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('section_ai_suggestions')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('ai_suggestions_subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={generateSuggestions}
                    disabled={isLoading}
                    title={t('ai_suggestions_refresh_tooltip')}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
            {renderContent()}
        </section>
    );
};