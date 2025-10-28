/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useQuotaError } from '../i18n/AIContext';

const SentimentGauge = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    let colorClass, Icon;
    if (score > 65) {
        colorClass = "text-green-500";
        Icon = TrendingUp;
    } else if (score < 35) {
        colorClass = "text-red-500";
        Icon = TrendingDown;
    } else {
        colorClass = "text-yellow-500";
        Icon = Minus;
    }

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                />
            </svg>
            <div className={`absolute flex flex-col items-center justify-center ${colorClass}`}>
                <Icon size={28} />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
            </div>
        </div>
    );
};

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

export const SentimentAnalysis = ({ stockData }) => {
    const { t, language } = useLanguage();
    const [sentiment, setSentiment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showQuotaErrorModal } = useQuotaError();

    const fetchSentiment = useCallback(async () => {
        if (!stockData) return;
        setIsLoading(true);
        setError(null);
        await new Promise(res => setTimeout(res, Math.random() * 1000));

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                stockName: t(stockData.nameKey),
                lang: language === 'ar' ? 'Arabic' : 'English'
            });

            const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            summary: { type: Type.STRING }
                        },
                        required: ["score", "summary"]
                    }
                }
            }));

            const result = JSON.parse(response.text);
            setSentiment(result);

        } catch (err: any) {
            const errorMessage = err?.message?.toLowerCase() || '';
            if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                showQuotaErrorModal();
                setError(null); 
            } else {
                let errorKey = 'sentiment_analysis_error';
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

    }, [stockData, t, language, showQuotaErrorModal]);

    useEffect(() => {
        fetchSentiment();
    }, [fetchSentiment]);

    return (
        <div className="py-4 border-b border-gray-200 dark:border-gray-800 px-2 sm:px-3">
            <h3 className="text-gray-900 dark:text-white font-bold mb-3">{t('sentiment_analysis_title')}</h3>
            {isLoading && (
                <div className="flex items-center justify-center h-40 gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t('sentiment_analysis_loading')}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-40 gap-2 text-red-500">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {!isLoading && sentiment && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <SentimentGauge score={sentiment.score} />
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                        {sentiment.summary}
                    </p>
                </div>
            )}
        </div>
    );
};