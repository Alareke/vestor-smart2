/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const AnalysisCard = (props: any) => {
    const { analysis } = props;
    const { t } = useLanguage();
    const [likeCount, setLikeCount] = useState(analysis.likes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = () => {
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        setIsLiked(!isLiked);
    };

    return (
        <div className="bg-white dark:bg-black rounded-lg w-72 sm:w-80 md:w-[420px] flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-800">
            <img src={analysis.img || DEFAULT_NEWS_IMAGE_URL} alt={analysis.title} className="w-full h-56 object-cover" loading="lazy" decoding="async" 
                onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_NEWS_IMAGE_URL) {
                        e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL;
                    }
                }}
            />
            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-md">{analysis.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-line">
                    {analysis.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-50