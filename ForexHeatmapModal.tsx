/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const ForexHeatmapModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const modalRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
    const dragStartRef = useRef({ x: 0, y: 0, modalX: 0, modalY: 0, modalWidth: 0 });
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Center the modal on first open
    useEffect(() => {
        if (isOpen && !isMobile) {
            const initialWidth = Math.min(1200, window.innerWidth * 0.8);
            const initialHeight = Math.min(800, window.innerHeight * 0.85);
            
            setSize({ width: initialWidth, height: initialHeight });
            setPosition({
                x: window.innerWidth / 2 - initialWidth / 2,
                y: window.innerHeight / 2 - initialHeight / 2,
            });
        }
    }, [isOpen, isMobile]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setIsLoading(true), 300);
            return;
        }
        
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0 || isMobile) return;
        setIsDragging(true);
        dragStartRef.current = { ...dragStartRef.current, x: e.clientX, y: e.clientY, modalX: position.x, modalY: position.y };
        e.preventDefault();
    }, [position, isMobile]);
    
    const handleMouseDownResize = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
        if (e.button !== 0 || isMobile) return;
        e.stopPropagation();
        setIsResizing(direction);
        dragStartRef.current = { x: e.clientX, y: e.clientY, modalX: position.x, modalY: position.y, modalWidth: size.width };
    }, [position, size, isMobile]);


    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setPosition({
                x: dragStartRef.current.modalX + dx,
                y: dragStartRef.current.modalY + dy
            });
        } else if (isResizing) {
            const dx = e.clientX - dragStartRef.current.x;
            if (isResizing === 'right') {
                const newWidth = dragStartRef.current.modalWidth + dx;
                if (newWidth > 400) setSize(s => ({ ...s, width: newWidth }));
            } else if (isResizing === 'left') {
                const newWidth = dragStartRef.current.modalWidth - dx;
                if (newWidth > 400) {
                    setSize(s => ({ ...s, width: newWidth }));
                    setPosition(p => ({ ...p, x: dragStartRef.current.modalX + dx }));
                }
            }
        }
    }, [isDragging, isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(null);
    }, []);

    useEffect(() => {
        const isInteracting = isDragging || isResizing;
        if (isInteracting) {
            document.body.style.userSelect = 'none';
            if (isResizing) {
                document.body.style.cursor = 'ew-resize';
            }
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    if (!isOpen) return null;

    const isInteracting = isDragging || isResizing;
    
    const modalStyle: React.CSSProperties = isMobile ? {
        top: 0, left: 0, width: '100vw', height: '100vh',
        animation: 'slide-in-up-full 0.4s ease-out forwards'
    } : {
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        animation: !isInteracting && (size.width > 0) ? 'fade-in-up 0.3s forwards' : 'none',
        minWidth: '400px',
        minHeight: '300px'
    };

    return createPortal(
        <div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-none sm:rounded-xl shadow-2xl flex flex-col text-gray-900 dark:text-gray-100 dark:text-white absolute"
                 style={modalStyle}
            >
                {/* Resize Handles */}
                {!isMobile && <div onMouseDown={(e) => handleMouseDownResize(e, 'left')} className="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-10" />}
                {!isMobile && <div onMouseDown={(e) => handleMouseDownResize(e, 'right')} className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-10" />}

                <header 
                    onMouseDown={handleMouseDownDrag}
                    className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-800 ${isMobile ? '' : 'cursor-move'}`}
                >
                    <h2 className="text-xl font-bold select-none">{t('forex_heatmap_title')}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white transition-colors cursor-pointer">
                        <X size={24} />
                    </button>
                </header>
                <div className="flex-1 relative bg-white dark:bg-gray-900 dark:bg-black">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 dark:bg-gray-900 z-10">
                            <Loader2 size={48} className="animate-spin text-cyan-500 dark:text-cyan-400" />
                        </div>
                    )}
                    <iframe
                        src="https://vestorsmart-forcx-map.netlify.app/"
                        className="w-full h-full border-0"
                        title={t('forex_heatmap_title')}
                        onLoad={() => setIsLoading(false)}
                        style={{ pointerEvents: isInteracting ? 'none' : 'auto' }}
                    ></iframe>
                </div>
            </div>
        </div>,
        document.body
    );
};