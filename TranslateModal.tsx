/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import 'useCallback' from React to resolve reference error.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Languages, Loader2, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';
import { useLanguage } from '../i18n/LanguageContext';

const languageOptions = [
    { code: 'auto', nameKey: 'translate_lang_detect' },
    { code: 'en', nameKey: 'translate_lang_en' },
    { code: 'ar', nameKey: 'translate_lang_ar' },
    { code: 'es', nameKey: 'translate_lang_es' },
    { code: 'fr', nameKey: 'translate_lang_fr' },
    { code: 'de', nameKey: 'translate_lang_de' },
];

// A helper for streaming API calls with retry logic for rate limiting and network errors
async function withStreamRetry(fn: () => Promise<AsyncGenerator<GenerateContentResponse>>, retries = 10, delay = 5000): Promise<AsyncGenerator<GenerateContentResponse>> {
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

export const TranslateModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [fromLang, setFromLang] = useState('auto');
    const [toLang, setToLang] = useState('ar');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const [isCopied, setIsCopied] = useState(false);


    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleTranslate = useCallback(async (text: string, from: string, to: string) => {
        if (!text.trim()) {
            setTranslatedText('');
            return;
        }

        setIsLoading(true);
        setError('');
        setTranslatedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const sourceLanguage = t(languageOptions.find(l => l.code === from)?.nameKey || 'translate_lang_detect');
            const targetLanguage = t(languageOptions.find(l => l.code === to)?.nameKey || 'translate_lang_en');


            const responseStream = await withStreamRetry(() => ai.models.generateContentStream({
            }));

            let fullResponse = '';
            for await (const chunk of responseStream) {
                fullResponse += chunk.text;
                setTranslatedText(fullResponse);
            }
        } catch (err: any) {
            setError(t('translate_api_error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleTranslate(inputText, fromLang, toLang);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [inputText, fromLang, toLang, handleTranslate]);


    const handleSwapLanguages = () => {
        if (fromLang === 'auto') return;
        const tempFrom = fromLang;
        setFromLang(toLang);
        setToLang(tempFrom);
        setInputText(translatedText);
        setTranslatedText(inputText);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-[#131722] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[80vh] max-h-[700px] border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Languages size={20} />
                        {t('translate_modal_title')}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={20} />
                    </button>
                </header>

                <main className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
                    <div className="flex-shrink-0 flex items-center justify-between gap-2 sm:gap-4">
                        <select value={fromLang} onChange={e => setFromLang(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-900 dark:text-white">
                            {languageOptions.map(lang => <option key={lang.code} value={lang.code}>{t(lang.nameKey)}</option>)}
                        </select>
                        <button onClick={handleSwapLanguages} disabled={fromLang === 'auto'} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ArrowLeftRight size={20} />
                        </button>
                        <select value={toLang} onChange={e => setToLang(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-900 dark:text-white">
                            {languageOptions.filter(l => l.code !== 'auto').map(lang => <option key={lang.code} value={lang.code}>{t(lang.nameKey)}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                        <div className="relative flex flex-col">
                           <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={t('translate_input_placeholder')}
                                className="w-full h-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none custom-scrollbar text-gray-900 dark:text-white"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">{inputText.length} / 5000</div>
                        </div>
                        <div className="relative w-full h-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                            {isLoading && translatedText.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            )}
                            {error && <p className="text-red-500">{error}</p>}
                            
                            <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{translatedText}</p>
                            {isLoading && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse"></span>}
                            
                            {!isLoading && translatedText && (
                                <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>,
        document.body
    );
};