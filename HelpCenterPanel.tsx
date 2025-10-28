/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Search, BookOpen, MessageCircleQuestion, Mail, ChevronLeft, ChevronRight, ReceiptText, CandlestickChart, AreaChart, BarChartHorizontalBig, PenTool, Repeat } from 'lucide-react';

const KnowledgeBaseView = ({ onBack, onClose, t }) => {
    const categories = [
        { key: 'help_kb_cat_billing', count: 59, Icon: ReceiptText },
        { key: 'help_kb_cat_data', count: 362, Icon: CandlestickChart },
        { key: 'help_kb_cat_charts', count: 194, Icon: AreaChart },
        { key: 'help_kb_cat_indicators', count: 190, Icon: BarChartHorizontalBig },
        { key: 'help_kb_cat_drawings', count: 78, Icon: PenTool },
        { key: 'help_kb_cat_trading', count: 154, Icon: Repeat },
    ];
    const { language } = useLanguage();
    const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"><BackIcon size={20} /></button>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('help_kb_breadcrumb_main')}</span>
                        <span className="mx-1">/</span>
                        <span className="text-gray-900 dark:text-white">{t('help_kb_breadcrumb_kb')}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"><X size={20} /></button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{t('help_kb_title')}</h2>
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('help_center_search_placeholder')}
                        className="w-full bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-full py-2.5 ps-10 pe-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-500"/>
                </div>
                
                <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-3">{t('help_kb_choose_problem')}</h4>
                    <div className="space-y-3">
                        {categories.map(cat => {
                            const Icon = cat.Icon;
                            return (
                                <button key={cat.key} className="w-full text-left bg-gray-100 dark:bg-[#262626] p-4 rounded-lg flex items-center gap-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <Icon size={24} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{t(cat.key)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('help_kb_article_count', { count: cat.count })}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

const MainHelpView = ({ t, onNavigate }) => {
     const popularCategories = [
        { key: 'help_center_cat_charts' },
        { key: 'help_center_cat_trading' },
        { key: 'help_center_cat_data' },
        { key: 'help_center_cat_alerts' },
        { key: 'help_center_cat_billing' },
    ];

    const supportOptions = [
        { key: 'kb', icon: BookOpen, titleKey: 'help_center_kb_title', descKey: 'help_center_kb_desc', view: 'knowledgeBase' },
        { key: 'chat', icon: MessageCircleQuestion, titleKey: 'help_center_chat_title', descKey: 'help_center_chat_desc', view: 'chatAssistant' },
        { key: 'support', icon: Mail, titleKey: 'help_center_support_title', descKey: 'help_center_support_desc', view: 'supportTickets' },
    ];

    return (
        <div className="flex flex-col h-full">
             {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('help_center_search_placeholder')}
                        className="w-full bg-gray-100 dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-full py-2.5 ps-10 pe-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-500"/>
                </div>

                {/* Popular Categories */}
                <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-3">{t('help_center_popular_categories')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {popularCategories.map(cat => (
                            <button key={cat.key} className="px-4 py-1.5 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                {t(cat.key)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Support Options */}
                <div className="space-y-4 pt-4">
                    {supportOptions.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button key={opt.key} onClick={() => onNavigate(opt.view)} className="w-full text-left bg-gray-100 dark:bg-[#262626] p-4 rounded-lg flex items-center gap-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <Icon size={28} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{t(opt.titleKey)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(opt.descKey)}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>

             {/* Footer */}
            <footer className="flex-shrink-0 p-4 text-center">
                <h2 className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">VESTOR SMART</h2>
            </footer>
        </div>
    );
};

export const HelpCenterPanel = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const [view, setView] = useState('main');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const modalRef = useRef(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [preMaximizeState, setPreMaximizeState] = useState({ position: { x: 0, y: 0 }, size: { width: 400, height: 700 } });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 400, height: 700 });
    const [isDragging, setIsDragging] = useState(false);
    const [resizeMode, setResizeMode] = useState<'none' | 'br' | 'l' | 'r'>('none');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const initialWidth = 400;
            const initialHeight = 700;
            setPosition({
                x: Math.max(0, window.innerWidth - initialWidth - 80), // Position near the right toolbar
                y: Math.max(0, window.innerHeight / 2 - initialHeight / 2),
            });
            setSize({ width: initialWidth, height: initialHeight });
            setView('main'); // Reset to main view on open
        }
    }, [isOpen]);

    const toggleMaximize = () => {
        if (isMaximized) {
            setSize(preMaximizeState.size);
            setPosition(preMaximizeState.position);
        } else {
            setPreMaximizeState({ size, position });
        }
        setIsMaximized(!isMaximized);
    };

    const handleDragMouseDown = useCallback((e: React.MouseEvent) => {
        if (isMaximized || isMobile) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }, [position, isMaximized, isMobile]);
    
    const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: 'br' | 'l' | 'r') => {
        if (isMaximized || isMobile) return;
        e.preventDefault();
        e.stopPropagation();
        setResizeMode(direction);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialSize(size);
        setInitialPosition(position);
    }, [size, position, isMaximized, isMobile]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            return;
        }
        
        if (resizeMode !== 'none') {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            switch (resizeMode) {
                case 'br':
                    setSize({ width: Math.max(350, initialSize.width + dx), height: Math.max(400, initialSize.height + dy) });
                    break;
                case 'l':
                    const newWidthL = initialSize.width - dx;
                    if (newWidthL >= 350) {
                        setSize(prev => ({...prev, width: newWidthL }));
                        setPosition(prev => ({ ...prev, x: initialPosition.x + dx }));
                    }
                    break;
                case 'r':
                    setSize(prev => ({ ...prev, width: Math.max(350, initialSize.width + dx) }));
                    break;
            }
        }
    }, [isDragging, resizeMode, dragStart, initialSize, initialPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setResizeMode('none');
    }, []);

    useEffect(() => {
        const isInteracting = isDragging || resizeMode !== 'none';
        const body = document.body;
        if (isInteracting) {
            if (resizeMode === 'l' || resizeMode === 'r') body.style.cursor = 'ew-resize';
            else if (resizeMode === 'br') body.style.cursor = 'nwse-resize';
            else body.style.cursor = 'grabbing';
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            body.style.cursor = 'default';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, resizeMode, handleMouseMove, handleMouseUp]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (view) {
            case 'knowledgeBase':
                return <KnowledgeBaseView onBack={() => setView('main')} onClose={onClose} t={t} />;
            case 'main':
            default:
                return <MainHelpView t={t} onNavigate={setView} />;
        }
    };

    const Header = () => (
         <header onMouseDown={handleDragMouseDown} className={`flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-transparent ${isMobile ? '' : 'cursor-move'}`}>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('help_center_title')}</h3>
            <div>
                 <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"><X size={20} /></button>
            </div>
        </header>
    );
    
    const modalStyle = isMobile ? {
        top: 0, left: 0, width: '100vw', height: '100vh', 
        animation: 'slide-in-up-full 0.3s ease-out'
    } : (isMaximized ? { 
        top: 0, left: 0, width: '100vw', height: '100vh', transition: 'width 0.3s, height 0.3s, top 0.3s, left 0.3s' 
    } : { 
        top: position.y, left: position.x, width: size.width, height: size.height, 
        transition: isDragging || resizeMode !== 'none' ? 'none' : 'width 0.3s, height 0.3s, top 0.3s, left 0.3s',
        animation: 'fade-in-up 0.3s ease-out'
    });

    return createPortal(
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
            <div
                ref={modalRef}
                style={modalStyle}
                className="absolute font-sans text-sm text-gray-700 dark:text-gray-300"
            >
                {!isMobile && <div onMouseDown={(e) => handleResizeMouseDown(e, 'l')} className="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-20" />}
                {!isMobile && <div onMouseDown={(e) => handleResizeMouseDown(e, 'r')} className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-20" />}
                <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] rounded-none lg:rounded-lg border-none lg:border lg:border-gray-300 dark:border-gray-700/60 shadow-2xl overflow-hidden">
                    {view === 'main' && <Header />}
                    {renderContent()}
                    {!isMobile && <div onMouseDown={(e) => handleResizeMouseDown(e, 'br')} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20" />}
                </div>
            </div>
        </div>,
        document.body
    );
};