/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Send, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { Chat, GenerateContentResponse } from '@google/genai';
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

export const ChatPanel = ({ isOpen }) => {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showQuotaErrorModal } = useQuotaError();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                config: {
                    systemInstruction: `You are a helpful AI assistant for a financial trading application called VESTOR SMART. Keep your answers concise and friendly. Your answers should be in ${language === 'ar' ? 'Arabic' : 'English'}.`,
                },
            });
            setMessages([{
                id: Date.now(),
                text: t('chat_welcome_message'),
                sender: 'assistant'
            }]);
        } else if (!isOpen) {
            // Reset chat when panel is closed
            chatRef.current = null;
            setMessages([]);
        }
    }, [isOpen, t, language]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);
        setInput('');

        const currentChat = chatRef.current; // Capture ref value
        if (!currentChat) {
            const errorId = Date.now() + 1;
            setMessages(prev => [...prev, {
                id: errorId,
                text: t('chat_api_error'),
                sender: 'assistant'
            }]);
            setIsSending(false);
            return;
        }

        const assistantMessageId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: assistantMessageId,
            text: '',
            sender: 'assistant',
            isLoading: true
        }]);

        try {
            const responseStream = await withStreamRetry(() => currentChat.sendMessageStream({ message: input }));

            let fullResponse = '';
            for await (const chunk of responseStream) {
                fullResponse += chunk.text;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantMessageId ? { ...msg, text: fullResponse } : msg
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
                setMessages(prev => {
                    const updatedMessages = prev.filter(msg => msg.id !== assistantMessageId);
                    return [...updatedMessages, {
                        id: assistantMessageId,
                        text: t(errorKey),
                        sender: 'assistant'
                    }];
                });
            }
        } finally {
            setIsSending(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }
    
    const animationClass = `animate-slide-in-up-full lg:animate-none ${language === 'ar' ? 'lg:animate-slide-in-left' : 'lg:animate-slide-in-right'}`;

    return (
        <aside className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[var(--panel-width)] bg-white dark:bg-[#1C2331] text-white flex-shrink-0 border-l border-gray-200 dark:border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Bot size={20} />
                    {t('ai_assistant_title')}
                </h2>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 max-w-lg ${msg.sender === 'user' ? 'ms-auto flex-row-reverse' : 'me-auto'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-purple-600'}`}>
                            {msg.sender === 'user' ? t('chat_user_you') : <Bot size={18} />}
                        </div>
                        <div className={`p-3 text-sm ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                            {msg.isLoading && msg.text.length === 0 ? (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="ai-loader"><span></span><span></span><span></span></div>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat_panel_input_placeholder')}
                        disabled={isSending}
                        className="bg-gray-100 dark:bg-gray-800 w-full rounded-full border border-gray-300 dark:border-gray-600 py-3 ps-4 pe-14 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none disabled:opacity-60"
                    />
                    <button type="submit" disabled={isSending || !input.trim()} title={t('tooltip_send')} className="absolute top-1/2 -translate-y-1/2 end-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </footer>
        </aside>
    );
};