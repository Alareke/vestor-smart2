/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Check, Users, BrainCircuit, Heart, Lock, Handshake, ChevronLeft, Trophy, Search, Instagram, Linkedin, Youtube, Twitter, Facebook, Globe, Users2, Zap, Palette, TestTube2, Copy, Send } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { Chat, GenerateContentResponse } from '@google/genai';


// Custom hook for detecting when an element is on screen
const useOnScreen = (options) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isVisible] as const;
};

const AnimatedSection = ({ children, className = "", threshold = 0.1 }: { children?: React.ReactNode, className?: string, threshold?: number }) => {
    const [ref, isVisible] = useOnScreen({ threshold });
    return (
        <section ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
            {children}
        </section>
    );
};

// FIX: Changed props to `any` to allow the `key` prop passed during list rendering.
const FeatureCard = (props: any) => {
    const { title, description, children, className = "" } = props;
    return (
        <div className={`bg-[#171717] border border-gray-800 rounded-2xl p-6 text-center flex flex-col items-center transition-all duration-300 hover:bg-gray-800/50 hover:-translate-y-2 hover:border-cyan-500/50 ${className}`}>
            {children}
            <h3 className="text-xl font-bold text-white mt-4 mb-2">{title}</h3>
            <p className="text-gray-400 text-sm flex-grow">{description}</p>
        </div>
    );
};

const CheckListItem = ({ text }) => (
    <li className="flex items-start gap-3">
        <Check size={20} className="text-green-400 flex-shrink-0 mt-1" />
        <span className="text-gray-300">{text}</span>
    </li>
);

const InteractiveLeaderboard = ({ t }) => {
    const leaderboardData = [
        { rank: 2, name: t('leaderboard_lisa'), pnlPct: '+96.91%', pnl: '+$93,904.21', avatar: 'L', color: 'bg-cyan-400' },
        { rank: 1, name: t('leaderboard_ethan'), pnlPct: '+115.48%', pnl: '+$111,904.32', avatar: 'E', color: 'bg-purple-500', isWinner: true },
        { rank: 3, name: t('leaderboard_alex'), pnlPct: '+73.11%', pnl: '+$70,267.98', avatar: 'A', color: 'bg-pink-500' },
        { rank: 4, name: t('leaderboard_phineas'), pnlPct: '+54.11%', pnl: '+$58,045.54', avatar: 'P', color: 'bg-blue-500' },
    ];

    return (
        <div className="mt-12 relative z-10 max-w-3xl mx-auto space-y-3" dir="ltr">
            {/* Floating elements */}
            <div className="absolute top-0 -left-16 bg-gray-800 p-2 rounded-lg text-xs shadow-lg animate-breathe hidden sm:block">Limit order placed<br/>BUY 11 CME:MBT1 at 92,770</div>
            <div className="absolute top-1/2 -right-16 bg-gray-800 p-2 rounded-lg text-xs shadow-lg animate-breathe animation-delay-1500 hidden sm:block">Limit order executed<br/>BUY 1 CME:MINIES1! at 5,836.50</div>
            
            {leaderboardData.sort((a, b) => a.isWinner ? -1 : b.isWinner ? 1 : a.rank - b.rank).map(item => (
                <div key={item.rank}
                     className={`rounded-xl p-4 flex items-center gap-4 shadow-lg transition-all duration-300 hover:scale-105 ${item.isWinner ? 'bg-white text-black shadow-white/30 scale-105' : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/80'}`}>
                    <span className={`w-6 text-center ${item.isWinner ? 'text-gray-500' : 'text-gray-400'}`}>{item.rank}</span>
                    <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center font-bold text-white flex-shrink-0`}>{item.avatar}</div>
                    <span className="font-bold flex-1 text-left">{item.name}</span>
                    <span className={`font-mono ${item.isWinner ? 'text-green-600' : 'text-green-400'}`}>{item.pnlPct}</span>
                    <span className={`font-mono font-bold text-lg w-32 text-right ${item.isWinner ? 'text-green-600' : 'text-green-400'}`}>{item.pnl}</span>
                </div>
            ))}
        </div>
    );
};


const BrokerMarquee = () => {
    const brokers = [
        { name: 'Pepperstone', logo: 'https://s3-symbol-logo.tradingview.com/provider/pepperstone.svg' },
        { name: 'Bybit', logo: 'https://s3-symbol-logo.tradingview.com/crypto/BYBIT.svg' },
        { name: 'TradeStation', logo: 'https://s3-symbol-logo.tradingview.com/provider/tradestation.svg' },
        { name: 'FXCM', logo: 'https://s3-symbol-logo.tradingview.com/provider/fxcm.svg' },
        { name: 'OANDA', logo: 'https://s3-symbol-logo.tradingview.com/provider/oanda.svg' },
        { name: 'ThinkMarkets', logo: 'https://s3-symbol-logo.tradingview.com/provider/thinkmarkets.svg' },
        { name: 'Interactive Brokers', logo: 'https://s3-symbol-logo.tradingview.com/provider/interactivebrokers.svg' },
        { name: 'Capital.com', logo: 'https://s3-symbol-logo.tradingview.com/capitalcom.svg' },
        { name: 'OKX', logo: 'https://s3-symbol-logo.tradingview.com/crypto/OKX.svg' },
    ];
    const duplicatedBrokers = [...brokers, ...brokers];

    return (
        <div className="w-full overflow-hidden relative h-48 flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
            <div className="flex w-max scroller">
                {duplicatedBrokers.map((broker, index) => (
                    <div key={index} className="w-36 h-24 bg-gray-800/50 rounded-2xl flex items-center justify-center p-4 mx-4 border border-gray-700/50">
                        <img src={broker.logo} alt={broker.name} className="max-w-full max-h-full object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
};

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


const initialMessages = [
    {
        id: 1,
        sender: 'Mark',
        avatar: 'M',
        avatarBg: 'bg-orange-500',
        meta: '8 minutes ago',
        isWizard: false,
        text: 'Hey, guys, can you help me with my script.'
    },
    {
        id: 2,
        sender: 'Jack_Pine',
        avatar: 'J',
        avatarBg: 'bg-green-500',
        meta: 'WIZARD',
        isWizard: true,
        text: 'Hi! Here is an example of code that can help you.',
        code: 'plot(close, color = #ff0000, title = "Close price")'
    }
];

const renderMessageContent = (message) => {
    const textParts = message.text.split(/(```(?:pinescript|javascript)?\n[\s\S]*?\n```)/g);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div>
            {textParts.map((part, index) => {
                if (part.trim() === '') return null;
                const isCodeBlock = part.startsWith('```');
                if (isCodeBlock) {
                    const codeContent = part.replace(/```(?:pinescript|javascript)?\n|```/g, '');
                    return (
                        <div key={index} className="bg-black rounded-lg p-3 font-mono text-sm mt-2 relative group">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span>Pine Script®</span>
                                <button onClick={() => handleCopy(codeContent)} className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <pre><code className="text-cyan-300 whitespace-pre-wrap">{codeContent}</code></pre>
                        </div>
                    )
                }
                return <p key={index} className="text-gray-300 whitespace-pre-wrap">{part}</p>
            })}

            {message.code && (
                 <div className="bg-black rounded-lg p-3 font-mono text-sm mt-2 relative group">
                    <div className="flex justify-between items-center text-gray-400 mb-2">
                        <span>Pine Script®</span>
                        <button onClick={() => handleCopy(message.code)} className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <Copy size={16} />
                        </button>
                    </div>
                    <pre><code className="text-cyan-300">plot(close, color = <span className="text-red-400">#ff0000</span>, title = <span className="text-yellow-300">"Close price"</span>)</code></pre>
                </div>
            )}
        </div>
    );
};

const ChartPlaceholder = () => (
    <div className="bg-black rounded-lg h-full flex items-center justify-center border border-gray-700">
        <svg width="80%" height="80%" viewBox="0 0 100 100" preserveAspectRatio="none" className="text-gray-700">
            <path d="M10 90 L30 70 L50 80 L70 50 L90 60" fill="none" stroke="currentColor" strokeWidth="2"/>
            <rect x="28" y="70" width="4" height="20" fill="currentColor" fillOpacity="0.5"/>
            <rect x="48" y="80" width="4" height="10" fill="currentColor" fillOpacity="0.5"/>
            <rect x="68" y="50" width="4" height="40" fill="currentColor" fillOpacity="0.5"/>
        </svg>
    </div>
);

const GlowingSymbol = ({ symbol, color, shadowColor }) => (
    <div className="relative">
        <div className={`font-['Inter'] text-7xl sm:text-8xl font-bold text-${color}`} style={{ textShadow: `0 0 25px ${shadowColor}` }}>{symbol}</div>
        <div className={`absolute inset-0 font-['Inter'] text-7xl sm:text-8xl font-bold text-${color} transform scale-y-[-1] opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]`}>{symbol}</div>
    </div>
);

const FinalCTA = ({ t }) => (
    <section className="py-32 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">أرباح جيدة من</h2>
        <h3 className="text-5xl sm:text-6xl md:text-7xl font-bold font-['Inter'] my-4">VESTOR SMART</h3>
        <div className="font-['Inter'] text-8xl font-bold my-8 tracking-tighter">+$13M</div>
        <div className="flex justify-center items-center gap-10 sm:gap-20 my-12">
            <GlowingSymbol symbol="$" color="green-400" shadowColor="rgba(74, 222, 128, 0.7)" />
            <GlowingSymbol symbol="$" color="green-400" shadowColor="rgba(74, 222, 128, 0.7)" />
            <GlowingSymbol symbol="♥" color="red-500" shadowColor="rgba(239, 68, 68, 0.7)" />
            <GlowingSymbol symbol="♥" color="red-500" shadowColor="rgba(239, 68, 68, 0.7)" />
        </div>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">تم تحقيقها من قبل مستخدمينا وأصدقائهم من خلال برنامج إحالة صديق وشريك.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 font-bold" dir="ltr">
            <button className="bg-white text-black px-6 py-3 rounded-full">Become a partner</button>
            <button className="border border-gray-600 text-white px-6 py-3 rounded-full">Refer a friend</button>
        </div>
    </section>
);

const HeroSection = ({ t }) => (
    <AnimatedSection className="text-center pt-16">
        <h1 className="text-5xl md:text-7xl font-bold">
            <span className="text-white">{t('community_power_page.hero.title_part1', {defaultValue: 'Community '})}</span>
            <span className="text-cyan-400">{t('community_power_page.hero.title_part2', {defaultValue: 'Power'})}</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">{t('community_power_page.hero.subtitle', {defaultValue: 'Harnessing the collective intelligence of millions of traders worldwide.'})}</p>
    </AnimatedSection>
);

const ProductShowcase = ({ t }) => {
    const features = [
        { icon: Users2, title: t('smartverse_feature_community_title'), description: t('smartverse_feature_community_desc') },
        { icon: Zap, title: t('smartverse_feature_speed_title'), description: t('smartverse_feature_speed_desc') },
        { icon: Palette, title: t('smartverse_feature_platform_title'), description: t('smartverse_feature_platform_desc') },
    ];
    return (
        <AnimatedSection>
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white">{t('community_product_showcase_title', {defaultValue: 'Our Products'})}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {features.map(feature => (
                    <FeatureCard key={feature.title} title={feature.title} description={feature.description}>
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                            <feature.icon className="text-cyan-400" size={36} />
                        </div>
                    </FeatureCard>
                ))}
            </div>
        </AnimatedSection>
    );
};

const CommunityPower = ({ t }) => (
    <AnimatedSection>
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white">{t('community_power_title', {defaultValue: 'The Power of Community'})}</h2>
            <p className="mt-4 text-gray-400">{t('community_power_subtitle', {defaultValue: 'Share, learn, and grow with millions of other traders.'})}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
                <h3 className="text-3xl font-bold text-white">Share Ideas, Get Feedback</h3>
                <p className="text-gray-400 mt-4">Publish your trading ideas and get instant feedback from a global community. Learn from others, refine your strategies, and grow as a trader.</p>
            </div>
            <div>
                <img src="../assets/placeholder.png" alt="Community" className="rounded-lg w-full" />
            </div>
        </div>
    </AnimatedSection>
);

const Metrics = () => {
    const stats = [
        { value: '50M+', label: 'Traders & Investors' },
        { value: '10M+', label: 'Custom Scripts & Ideas' },
        { value: '100+', label: 'Data Feeds' },
    ];
    return (
        <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                        <p className="text-4xl font-bold text-cyan-400">{stat.value}</p>
                        <p className="text-gray-400 mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>
        </AnimatedSection>
    );
};

const SocialTrading = () => (
    <AnimatedSection>
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Social Trading</h2>
            <p className="mt-4 text-gray-400">Follow successful traders, copy their strategies, and elevate your trading game.</p>
        </div>
        <BrokerMarquee />
    </AnimatedSection>
);

const TheLeap = ({ t }) => (
    <AnimatedSection className="text-center relative bg-gradient-to-b from-gray-900 to-black rounded-3xl p-10 overflow-hidden">
        <h2 className="text-7xl font-bold font-['Inter'] relative z-10">The Leap</h2>
        <p className="text-gray-300 text-lg mt-4 mb-8 max-w-2xl mx-auto relative z-10">{t('smartverse_leap_desc')}</p>
        <button className="border border-white rounded-full px-8 py-3 hover:bg-white hover:text-black transition-colors font-bold relative z-10">{t('smartverse_leap_cta')}</button>
        <InteractiveLeaderboard t={t} />
        <div className="mt-8 flex justify-center gap-4 text-sm text-gray-300 relative z-10">
            <div className="flex items-center gap-2"><Trophy size={16} /><span>{t('smartverse_leap_feature1')}</span></div>
            <div className="flex items-center gap-2"><Users size={16} /><span>{t('smartverse_leap_feature2')}</span></div>
            <div className="flex items-center gap-2"><BrainCircuit size={16} /><span>{t('smartverse_leap_feature3')}</span></div>
        </div>
    </AnimatedSection>
);

const PineScripting = ({ t }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            (chatContainerRef.current as HTMLDivElement).scrollTop = (chatContainerRef.current as HTMLDivElement).scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            sender: 'You',
            avatar: 'Y',
            avatarBg: 'bg-blue-500',
            meta: 'Just now',
            isWizard: false,
            text: input,
        };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    config: {
                        systemInstruction: "You are an expert in Pine Script, the programming language for VESTOR SMART. Your name is Jack_Pine. Answer questions concisely and provide code examples in markdown format where appropriate (using ```pinescript). Keep your answers brief and to the point.",
                    },
                    history: initialMessages.map(msg => ({
                        role: msg.sender === 'Jack_Pine' ? 'model' : 'user',
                        parts: [{ text: msg.text + (msg.code ? `\n\`\`\`pinescript\n${msg.code}\n\`\`\`` : '') }]
                    }))
                });
            }
            
            const responseStream = await withStreamRetry(() => chatRef.current!.sendMessageStream({ message: input }));
            
            let aiResponseText = '';
            const aiMessageId = Date.now() + 1;

            setMessages(prev => [...prev, {
                id: aiMessageId,
                sender: 'Jack_Pine',
                avatar: 'J',
                avatarBg: 'bg-green-500',
                text: '...',
                meta: 'WIZARD',
                isWizard: true,
            }]);

            for await (const chunk of responseStream) {
                aiResponseText += chunk.text;
                setMessages(prev => prev.map(m => m.id === aiMessageId ? {...m, text: aiResponseText } : m));
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'Jack_Pine',
                avatar: 'J',
                avatarBg: 'bg-green-500',
                text: 'Sorry, I encountered an error. Please check the console or try again.',
                meta: 'ERROR',
                isWizard: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <section className="py-20">
        <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                <span className="font-['Inter']" dir="ltr">, Pine</span> البرمجة معًا
            </h2>
            <p className="text-gray-400 text-lg mt-4 mb-12 max-w-4xl mx-auto">قوة التداول والبرمجة مجتمعة - هذا مجتمع عالمي ضخم من المبرمجين المبدعين. استكشف، وتعلم، وتعاون لتحويل أفكارك التحليلية للتداول إلى واقع.</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
            <div><ChartPlaceholder /></div>
            <div className="bg-gray-800 rounded-xl p-4 flex flex-col" dir="ltr">
                <h3 className="font-bold text-white mb-3">Pine Q&amp;A chat</h3>
                <div ref={chatContainerRef} className="flex-grow space-y-4 pr-2 -mr-2 overflow-y-auto h-80">
                   {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                             <div className={`w-8 h-8 rounded-full ${msg.avatarBg} flex-shrink-0 flex items-center justify-center font-bold text-sm`}>{msg.avatar}</div>
                             <div className="flex-1">
                                  <p className="font-bold text-sm">{msg.sender} <span className={msg.isWizard ? "text-blue-400 bg-blue-900/50 px-1.5 py-0.5 rounded-sm text-xs font-mono" : "text-gray-400 font-normal text-xs"}>{msg.meta}</span></p>
                                  {renderMessageContent(msg)}
                             </div>
                         </div>
                    ))}
                    {isLoading && messages[messages.length-1].sender !== 'Jack_Pine' && (
                         <div className="flex gap-2 animate-pulse">
                             <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center font-bold text-sm">J</div>
                             <div className="flex-1">
                                  <p className="font-bold text-sm">Jack_Pine <span className="text-blue-400 bg-blue-900/50 px-1.5 py-0.5 rounded-sm text-xs font-mono">WIZARD</span></p>
                                  <p className="text-gray-400">Typing...</p>
                             </div>
                         </div>
                    )}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 mt-2 border-t border-gray-700">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('pinescript_chat_placeholder')}
                        className="flex-grow bg-gray-900 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
                        disabled={isLoading}
                        aria-label="Ask about Pine Script"
                    />
                    <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors flex items-center justify-center" disabled={isLoading || !input.trim()} aria-label="Send message">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    </section>
    );
};

export const SmartversePage = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-black text-white" style={{ fontFamily: "'Tajawal', 'Inter', sans-serif" }} dir="rtl">
            <div className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="absolute top-[10%] -right-40 w-96 h-96 bg-cyan-900/50 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-purple-900/40 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
                </div>
                
                <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                    <HeroSection t={t} />
                    <ProductShowcase t={t} />
                    <CommunityPower t={t} />
                    <Metrics />
                    <SocialTrading />
                    <TheLeap t={t} />
                    <PineScripting t={t} />
                    <FinalCTA t={t} />
                </main>
            </div>
        </div>
    );
}