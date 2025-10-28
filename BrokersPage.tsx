
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Star, ExternalLink, User, CheckCircle } from 'lucide-react';

const BybitLogo = () => (
    <div className="relative w-48 h-48 lg:w-56 lg:h-56 flex-shrink-0 flex items-center justify-center group">
        {/* Outlines */}
        <div className="absolute w-[95%] h-[95%] rounded-[2.5rem] border border-white/10 transform -rotate-[12deg] transition-transform duration-300 group-hover:-rotate-6"></div>
        <div className="absolute w-[95%] h-[95%] rounded-[2.5rem] border border-white/10 transform -rotate-6 transition-transform duration-300 group-hover:rotate-0"></div>
        
        {/* Main Card */}
        <div className="relative w-[95%] h-[95%] bg-[#1c2331] rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-105">
            <span className="font-bold text-5xl tracking-[0.1em] text-white">BYB<span className="text-yellow-400 font-black">I</span>T</span>
        </div>
    </div>
);

export const BrokersPage = () => {
    const { t, language } = useLanguage();

    return (
        <main className="bg-gradient-to-b from-[#0D1421] to-[#040914] py-16 px-4 md:px-6 relative overflow-hidden flex-1 flex items-center justify-center">
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className="text-[20vw] md:text-[15vw] lg:text-[12vw] font-black text-white/5 select-none whitespace-nowrap opacity-50">{t('brand_name_caps')}</h1>
            </div>

            <div className="max-w-screen-xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* Header */}
                <div className={`lg:w-2/5 w-full ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}>
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        {t('brokers_section_title')} {language === 'ar' ? '<' : '>'}
                    </h2>
                    <p className="text-lg text-gray-400">
                        {t('brokers_section_desc')}
                    </p>
                </div>
                
                {/* Broker Card */}
                <div className="lg:w-3/5 w-full bg-gradient-to-br from-[#1C2331]/60 to-transparent rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-10 backdrop-blur-sm border border-white/10 shadow-2xl">
                    <BybitLogo />
                    
                    <div className="flex-1 text-center lg:text-start w-full">
                        <h3 className="text-4xl font-extrabold text-white mb-1">{t('brokers_page_bybit')}</h3>
                        <p className="text-gray-400 mb-6">{t('bybit_desc')}</p>
                        
                        <div className="flex flex-wrap justify-center lg:justify-start items-start gap-x-6 gap-y-3 mb-8 text-white">
                            {/* Rating */}
                            <div className="text-center sm:text-start">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <span className="font-bold text-lg">4.7 • {t('bybit_rating_excellent')}</span>
                                    <CheckCircle size={18} className="text-green-400" />
                                </div>
                                <div className="flex text-yellow-400 mt-1 justify-center sm:justify-start">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="mx-px" />)}
                                </div>
                            </div>

                            {/* Accounts */}
                            <div className="text-center sm:text-start">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <span className="font-bold text-lg">247.6K</span>
                                    <User size={16} className="text-gray-400" />
                                </div>
                                <span className="text-gray-400 text-sm mt-1 block">{t('bybit_accounts')}</span>
                            </div>

                            {/* Reviews */}
                             <div className="text-center sm:text-start">
                                <span className="font-bold text-lg">19.3K</span>
                                <span className="text-gray-400 text-sm mt-1 block">{t('bybit_reviews')}</span>
                            </div>
                        </div>


                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <button className="px-6 py-3 rounded-xl border-2 border-gray-600 text-white font-semibold hover:bg-gray-800/50 transition-colors">
                                {t('bybit_learn_more')}
                            </button>
                            <button className="px-6 py-3 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                {t('bybit_open_account')}
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};