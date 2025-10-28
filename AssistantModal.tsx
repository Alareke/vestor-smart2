/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { Chat, GenerateContentResponse } from '@google/genai';
import { useLanguage } from '../i18n/LanguageContext';
import { useQuotaError } from '../i18n/AIContext';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'assistant';
    isLoading?: boolean;
}

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

// FIX: Add addSymbolToWatchlist and navigateTo to component props to fix type error in Home.tsx.
export const AssistantModal = ({ isOpen, onClose, addSymbolToWatchlist, navigateTo }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef(null);
    const { showQuotaErrorModal } = useQuotaError();

    useEffect(() => {
        if (isOpen) {
            // Initialize chat on open
            setMessages([
                { id: Date.now(), text: t('assistant_welcome_message'), sender: 'assistant' }
            ]);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                config: {
                },
            });
        } else {
            // Reset on close
            setMessages([]);
            setInput('');
            setIsLoading(false);
            chatRef.current = null;
        }
    }, [isOpen, t]);

    useEffect(() => {
        messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);


        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInput('');

        const assistantMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: assistantMessageId, text: '', sender: 'assistant', isLoading: true }]);

        const currentChat = chatRef.current; // Capture ref value
        if (!currentChat) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessageId ? { ...msg, text: t('chat_api_error'), isLoading: false } : msg
                )
            );
            setIsLoading(false);
            return;
        }

        try {
            
            let fullResponse = '';
            for await (const chunk of responseStream) {
                fullResponse += chunk.text;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId ? { ...msg, text: fullResponse, isLoading: true } : msg
                    )
                );
            }
            
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessageId ? { ...msg, isLoading: false } : msg
                )
            );

        } catch (error: any) {
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                showQuotaErrorModal();
                setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
            } else {
                let errorKey = 'chat_api_error';
                if (errorMessage.includes('safety')) {
                    errorKey = 'ai_analysis_error_safety';
                } else if (error instanceof TypeError) {
                    errorKey = 'ai_analysis_error_network';
                }
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId ? { ...msg, text: t(errorKey), isLoading: false } : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const handleSuggestionClick = (promptKey: string) => {
        const promptText = t(promptKey);
        handleSendMessage(promptText);
    };

    if (!isOpen) return null;

    const suggestedPrompts = ['assistant_prompt1', 'assistant_prompt2', 'assistant_prompt3'];

    return createPortal(
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 animate-fade-in-up"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-gray-900 rounded-2xl shadow-2xl w-full h-full sm:w-full sm:max-w-2xl sm:h-[90vh] sm:max-h-[700px] flex flex-col border border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label="robot">🤖</span>
                        {t('assistant_modal_title')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <main ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 max-w-lg ${msg.sender === 'user' ? 'ms-auto flex-row-reverse' : 'me-auto'}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-purple-600'}`}>
                                {msg.sender === 'user' ? t('chat_user_you') : '🤖'}
                            </div>
                            <div className={`p-3 text-sm ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                                {msg.isLoading && msg.text.length === 0 ? (
                                     <div className="flex items-center gap-2 text-gray-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>{t('assistant_thinking')}</span>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-gray-800">
                    {messages.length <= 1 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-3">
                             {suggestedPrompts.map(promptKey => (
                                <button
                                    key={promptKey}
                                    onClick={() => handleSuggestionClick(promptKey)}
                                    className="bg-gray-800/60 text-gray-300 text-xs px-3 py-1.5 rounded-full hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    {t(promptKey)}
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('assistant_input_placeholder')}
                            disabled={isLoading}
                            className="bg-[#1C2331] w-full rounded-full border border-gray-700 py-3 ps-4 pe-14 text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none disabled:opacity-60"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="absolute top-1/2 -translate-y-1/2 end-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </footer>
            </div>
        </div>,
        document.body
    );
};