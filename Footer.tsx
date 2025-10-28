/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Twitter, Facebook, Linkedin, Youtube, Instagram, ChevronDown, Send } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer = () => {
    const { language, setLanguage, t } = useLanguage();

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef(null);
    
    const availableLanguages = [
        { code: 'ar', nameKey: 'language_arabic' },
        { code: 'en', nameKey: 'language_english' },
        { code: 'en-GB', nameKey: 'language_english_uk' },
        { code: 'fr', nameKey: 'language_french' },
        { code: 'hi', nameKey: 'language_hindi' },
        { code: 'zh', nameKey: 'language_chinese' },
        { code: 'pt', nameKey: 'language_portuguese' },
        { code: 'es', nameKey: 'translate_lang_es' },
        { code: 'tr', nameKey: 'language_turkish' },
        { code: 'it', nameKey: 'language_italian' }
    ];

    const handleLanguageSelect = (langCode: 'ar' | 'en' | 'hi' | 'zh' | 'pt' | 'en-GB' | 'fr' | 'es' | 'tr' | 'it') => {
        setLanguage(langCode);
        setIsLangMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) setIsLangMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const socialLinks = [
      { Icon: Twitter, title: t('follow_on_twitter_tooltip') },
      { Icon: Facebook, title: t('follow_on_facebook_tooltip') },
      { Icon: Linkedin, title: t('follow_on_linkedin_tooltip') },
      { Icon: Youtube, title: t('follow_on_youtube_tooltip') },
      { Icon: Instagram, title: t('follow_on_instagram_tooltip') },
    ];

    const currentLanguageName = t(availableLanguages.find(l => l.code === language)?.nameKey || 'language_english');

    return (
        <footer className="bg-gray-50 dark:bg-[#0D1421] text-gray-600 dark:text-gray-300 text-sm border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="max-w-screen-xl mx-auto px-6 py-12">
                {/* Top Section: Links & Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('brand_name')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t('footer_tagline')}</p>
                    </div>

                    {/* Links */}
                    <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
                         <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('footer_col1_title')}</h3>
                            <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col1_link1')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col1_link2')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col1_link3')}</a></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('footer_col2_title')}</h3>
                             <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col2_link1')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col2_link2')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col2_link3')}</a></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('footer_col3_title')}</h3>
                             <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col3_link1')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col3_link2')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col3_link3')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('footer_col_support_title')}</h3>
                             <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col_support_link1')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col_support_link2')}</a></li>
                                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer_col_support_link3')}</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Newsletter */}
                    <div className="lg:col-span-3">
                         <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('footer_newsletter_title')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('footer_newsletter_desc')}</p>
                        <form className="flex items-center">
                            <input type="email" placeholder={t('footer_newsletter_placeholder')} className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-l-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow text-gray-900 dark:text-white" />
                            <button type="submit" title={t('footer_newsletter_button')} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2.5 rounded-r-md transition-colors">
                                <Send size={20}/>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-left">
                        <p>{t('copyright')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {socialLinks.map(({ Icon, title }, index) => (
                            <a key={index} href="#" title={title} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Selector */}
                        <div className="relative" ref={langMenuRef}>
                             <button onClick={() => setIsLangMenuOpen(p => !p)} title={t('tooltip_change_language')} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-haspopup="true" aria-expanded={isLangMenuOpen}>
                                <span className="text-gray-800 dark:text-white">{currentLanguageName}</span>
                                <ChevronDown size={16} className={`transition-transform duration-300 text-gray-500 dark:text-gray-400 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLangMenuOpen && (
                                 <div className="animate-fade-in-up absolute bottom-full mb-2 end-0 bg-white dark:bg-[#1C2331] rounded-md shadow-lg w-44 py-1 z-30 ring-1 ring-black/5 dark:ring-white/10">
                                     {availableLanguages.map(lang => (
                                         <button key={lang.code} onClick={() => handleLanguageSelect(lang.code as 'ar' | 'en' | 'hi' | 'zh' | 'pt' | 'en-GB' | 'fr' | 'es' | 'tr' | 'it')} className="w-full text-start px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                             {t(lang.nameKey)}
                                         </button>
                                     ))}
                                 </div>
                            )}
                        </div>
                    </div>
                </div>

                 <div className="mt-8 flex justify-center gap-4">
                    
                </div>
            </div>
        </footer>
    );
};