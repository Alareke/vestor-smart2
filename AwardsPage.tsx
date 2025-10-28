

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Award, Trophy, Globe, Building, Target, Bot, ShieldCheck, Cpu, Star, BarChart, Code, DollarSign, Gem, Users, MapPin, CheckCircle, GitBranch } from 'lucide-react';

const SectionHeader = ({ title, subtitle }) => (
    <div className="text-center mb-12 animate-fadeIn">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>
    </div>
);

const AwardCard = (props: any) => {
    const { logo, title, company, glowColor, Icon } = props;
    const glowClass = `award-card-glow-${glowColor}`;
    return (
        <div className={`relative bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-2 award-card ${glowClass}`}>
            <div className="w-20 h-20 mb-5 rounded-full bg-gray-100 dark:bg-black/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                {logo ? (
                    <img src={logo} alt={company} className="w-12 h-12 object-contain" loading="lazy" decoding="async" />
                ) : (
                    <Icon className={`w-10 h-10 text-${glowColor}-500 dark:text-${glowColor}-400`} />
                )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">{company}</p>
        </div>
    );
};


const BestOfBestCard = ({ logo, title, company }) => (
    <div className="relative bg-gradient-to-br from-yellow-300/20 via-white to-yellow-300/20 dark:from-yellow-900/30 dark:via-black dark:to-black rounded-3xl p-8 border-2 border-yellow-400/50 dark:border-yellow-700/50 flex flex-col items-center text-center shadow-2xl shadow-yellow-500/10">
        <div className="absolute inset-0 bg-[url('../assets/placeholder.png')] opacity-[0.02] mix-blend-overlay"></div>
        <img src={logo} alt={company} className="w-24 h-24 object-contain mb-4 bg-black/5 dark:bg-white/10 rounded-full p-2" loading="lazy" decoding="async" />
        <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-300 mb-2">{title}</h3>
        <p className="text-xl text-gray-800 dark:text-white font-semibold">{company}</p>
    </div>
);


export const AwardsPage = () => {
    const { t } = useLanguage();
    const [activeYear, setActiveYear] = useState(2024);

    const awardSections = [
        {
            titleKey: 'awards_global_champions_title',
            subtitleKey: 'awards_global_champions_subtitle',
            glow: 'cyan',
            awards: [
                { logo: 'https://s3-symbol-logo.tradingview.com/thinkmarkets--600.svg', titleKey: 'awards_newcomer_of_year', companyKey: 'awards_company_thinkmarkets', Icon: Star },
                { logo: 'https://s3-symbol-logo.tradingview.com/fxcm--600.svg', titleKey: 'awards_social_champion_of_year', companyKey: 'awards_company_fxcm', Icon: Users },
                { logo: null, titleKey: 'awards_most_trusted_tech', companyKey: 'awards_company_tradenation', Icon: ShieldCheck },
                { logo: 'https://s3-symbol-logo.tradingview.com/forex.svg', titleKey: 'awards_winning_trading_platform', companyKey: 'awards_company_forexcom', Icon: Trophy },
            ]
        },
        {
            titleKey: 'awards_by_asset_class_title',
            subtitleKey: 'awards_by_asset_class_subtitle',
            glow: 'purple',
            awards: [
                { logo: 'https://s3-symbol-logo.tradingview.com/provider/interactivebrokers.svg', titleKey: 'awards_multi_asset', companyKey: 'awards_company_interactivebrokers', Icon: Gem },
                { logo: 'https://s3-symbol-logo.tradingview.com/moomoo.svg', titleKey: 'awards_stocks', companyKey: 'awards_company_moomoo', Icon: BarChart },
                { logo: 'https://s3-symbol-logo.tradingview.com/provider/dhan.svg', titleKey: 'awards_options', companyKey: 'awards_company_dhan', Icon: GitBranch },
                { logo: null, titleKey: 'awards_futures', companyKey: 'awards_company_ampfutures', Icon: Code },
                { logo: 'https://s3-symbol-logo.tradingview.com/crypto/OKX.svg', titleKey: 'awards_digital_currency_exchange', companyKey: 'awards_company_okx', Icon: Cpu },
                { logo: 'https://s3-symbol-logo.tradingview.com/eightcap.svg', titleKey: 'awards_forex_cfd', companyKey: 'awards_company_eightcap', Icon: DollarSign },
            ]
        },
         {
            titleKey: 'awards_by_region_title',
            subtitleKey: 'awards_by_region_subtitle',
            glow: 'green',
            awards: [
                { logo: 'https://s3-symbol-logo.tradingview.com/tastytrade--600.svg', titleKey: 'awards_north_america', companyKey: 'awards_company_tastytrade', Icon: MapPin },
                { logo: 'https://s3-symbol-logo.tradingview.com/provider/tradestation.svg', titleKey: 'awards_europe', companyKey: 'awards_company_tradestation', Icon: MapPin },
                { logo: 'https://s3-symbol-logo.tradingview.com/capitalcom.svg', titleKey: 'awards_middle_east', companyKey: 'awards_company_capitalcom', Icon: MapPin },
                { logo: 'https://s3-symbol-logo.tradingview.com/fyers.svg', titleKey: 'awards_south_asia', companyKey: 'awards_company_fyers', Icon: MapPin },
                { logo: null, titleKey: 'awards_south_east_asia', companyKey: 'awards_company_dnse', Icon: MapPin },
            ]
        },
        {
            titleKey: 'awards_forex_cfd_by_region_title',
            subtitleKey: 'awards_forex_cfd_by_region_subtitle',
            glow: 'blue',
            awards: [
                { logo: 'https://s3-symbol-logo.tradingview.com/ic-markets.svg', titleKey: 'awards_apac', companyKey: 'awards_company_icmarkets', Icon: Globe },
                { logo: 'https://s3-symbol-logo.tradingview.com/oanda.svg', titleKey: 'awards_amer', companyKey: 'awards_company_oanda', Icon: Globe },
                { logo: 'https://s3-symbol-logo.tradingview.com/pepperstone.svg', titleKey: 'awards_emea', companyKey: 'awards_company_pepperstone', Icon: Globe },
            ]
        }
    ];

    return (
        <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-['Tajawal'] min-h-screen" dir={t('lang_direction')}>
            <div className="container mx-auto px-4 py-16">
                {/* Main Header */}
                <header className="text-center mb-16 animate-fadeIn">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{t('awards_page_main_title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">{t('awards_page_subtitle')}</p>
                    <div className="flex justify-center gap-2 mt-8">
                        {[2020, 2021, 2022, 2023, 2024].map(year => (
                            <button key={year} onClick={() => setActiveYear(year)} className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 ${activeYear === year ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg shadow-gray-500/20 dark:shadow-white/20' : 'bg-gray-200 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                                {year}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Best of the Best */}
                <section className="mb-24">
                    <SectionHeader title={t('awards_best_of_the_best_title')} subtitle={t('awards_best_of_the_best_subtitle')} />
                    <div className="max-w-md mx-auto">
                        <BestOfBestCard logo="https://s3-symbol-logo.tradingview.com/easymarkets--600.svg" title={t('awards_best_broker_of_year')} company={t('awards_company_easymarkets')} />
                    </div>
                </section>
                
                {awardSections.map(section => (
                    <section key={section.titleKey} className="mb-24">
                        <SectionHeader title={t(section.titleKey)} subtitle={t(section.subtitleKey)} />
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${section.awards.length === 5 ? 'lg:grid-cols-5' : ''} ${section.awards.length === 6 ? 'lg:grid-cols-3' : ''}`}>
                             {section.awards.map(award => (
                                <AwardCard key={award.companyKey} {...award} title={t(award.titleKey)} company={t(award.companyKey)} glowColor={section.glow} />
                            ))}
                        </div>
                    </section>
                ))}


                <footer className="text-center mt-24">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t('brand_name')}</h3>
                </footer>
            </div>
        </div>
    );
};