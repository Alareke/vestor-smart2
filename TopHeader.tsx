/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Menu, X, ChevronDown, CalendarDays, CandlestickChart, LayoutGrid, Newspaper, Briefcase, AreaChart, GitBranch, ChevronRight, ChevronLeft, Map, Lightbulb, Mountain, Trophy, Globe, Flag, Bookmark, Clock, MessageSquare, Radar, Rss, Bell, HelpCircle, User, GitCompareArrows, FilePlus2, Star, Download, Building2, Bot, Sun, Moon, Monitor, Command, Save, Trash2, Edit } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AuthModal } from './AuthModal';
import { useTheme, type Theme } from '../i18n/ThemeContext';

const menuConfig = {
    featured: {
        key: 'best_charts',
        icon: <CandlestickChart className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />,
        titleKey: 'products_best_charts_title',
        descKey: 'products_best_charts_desc',
    },
    sections: [
        {
            titleKey: 'products_section_tools',
            items: [
                { key: 'platforms', icon: <LayoutGrid size={24} />, titleKey: 'products_platforms_title', descKey: 'products_platforms_desc',
                  submenu: { headerKey: 'products_submenu_header_platforms', items: [
                    { titleKey: 'products_submenu_platforms_stocks', panelId: 'screener' }, { titleKey: 'products_submenu_platforms_etfs', panelId: 'screener' },
                    { titleKey: 'products_submenu_platforms_bonds', panelId: 'screener' }, { titleKey: 'products_submenu_platforms_crypto', panelId: 'screener' },
                    { titleKey: 'products_submenu_platforms_cex', panelId: 'screener' }, { titleKey: 'products_submenu_platforms_dex', panelId: 'screener' },
                    { titleKey: 'products_submenu_platforms_pine', beta: true, panelId: 'screener' },
                  ]}
                },
                { key: 'calendars', icon: <CalendarDays size={24} />, titleKey: 'products_calendars_title', descKey: 'products_calendars_desc', 
                  submenu: { headerKey: 'products_calendars_title', items: [
                     { titleKey: 'products_link_economic_calendar', panelId: 'calendar' }, { titleKey: 'products_link_earnings_calendar', panelId: 'calendar' },
                  ]}
                },
                { key: 'newsfeed', icon: <Newspaper size={24} />, titleKey: 'products_newsfeed_title', descKey: 'products_newsfeed_desc', action: 'openNewsfeed' },
                { key: 'portfolio', icon: <Briefcase size={24} />, titleKey: 'products_portfolio_title', descKey: 'products_portfolio_desc', beta: true },
                { key: 'yield_curves', icon: <AreaChart size={24} />, titleKey: 'products_yield_curves_title', descKey: 'products_yield_curves_desc' },
                { key: 'options', icon: <GitBranch size={24} />, titleKey: 'products_options_title', descKey: 'products_options_desc' },
                { key: 'heatmaps', icon: <Map size={24} />, titleKey: 'products_submenu_header_heatmaps', descKey: 'products_heatmaps_desc',
                    submenu: { headerKey: 'products_submenu_header_heatmaps', items: [
                        { titleKey: 'products_submenu_heatmaps_stocks' },
                        { titleKey: 'products_submenu_heatmaps_etfs' },
                        { titleKey: 'products_submenu_heatmaps_crypto' },
                    ]}
                },
            ]
        },
        {
            titleKey: 'products_section_company_info',
            items: [
                { key: 'prices', titleKey: 'products_link_prices', isSimple: true },
                { key: 'features', titleKey: 'products_link_features', isSimple: true },
                { key: 'latest_updates', titleKey: 'products_link_latest_updates', isSimple: true },
                { key: 'market_data', titleKey: 'products_link_market_data', isSimple: true },
            ]
        }
    ]
};

const communityMenuConfig = [
    { 
        key: 'trading_analysis', 
        icon: Lightbulb, 
        titleKey: 'community_trading_analysis_title', 
        descKey: 'community_trading_analysis_desc' 
    },
    { 
        key: 'indicators_strategies', 
        icon: Mountain,
        titleKey: 'community_indicators_strategies_title', 
        descKey: 'community_indicators_strategies_desc' 
    },
    { 
        key: 'the_leap', 
        icon: Trophy, 
        titleKey: 'community_the_leap_title', 
        descKey: 'community_the_leap_desc',
        isSpecial: true
    },
];

const communityMenuLinks = [
    { key: 'company_info', titleKey: 'community_link_company_info' },
    { key: 'community_power', titleKey: 'community_link_community_power' },
];

const marketsMenuConfig = {
    topItems: [
        { key: 'whole_world', icon: Globe, titleKey: 'markets_whole_world_title', descKey: 'markets_whole_world_desc' },
        { key: 'countries', icon: Flag, titleKey: 'markets_countries_title', descKey: 'markets_countries_desc' },
        { key: 'news', icon: Newspaper, titleKey: 'markets_news_title', descKey: 'markets_news_desc' },
    ],
    assetsHeaderKey: 'markets_assets_header',
    assetItems: [
        { key: 'indices', titleKey: 'markets_indices_title' },
        { key: 'stocks', titleKey: 'markets_stocks_title' },
        { key: 'digital_currencies', titleKey: 'markets_digital_currencies_title' },
        { key: 'futures', titleKey: 'markets_futures_title' },
        { key: 'forex', titleKey: 'markets_forex_title' },
        { key: 'gov_bonds', titleKey: 'markets_gov_bonds_title' },
        { key: 'corp_bonds', titleKey: 'markets_corp_bonds_title' },
        { key: 'etfs', titleKey: 'markets_etfs_title' },
        { key: 'world_economy', titleKey: 'markets_world_economy_title' },
    ]
};

const mobileToolbarIcons = [
  { id: 'watchlist', icon: Bookmark, 'aria-label-key': 'watchlist_tooltip' },
  { id: 'activity', icon: Clock, 'aria-label-key': 'my_activity_tooltip' },
// FIX: Changed chat icon to Bot for consistency
  { id: 'chat', icon: Bot, 'aria-label-key': 'chat_tooltip' },
  { id: 'screener', icon: Radar, 'aria-label-key': 'radar_tooltip' },
  { id: 'calendar', icon: CalendarDays, 'aria-label-key': 'calendar_tooltip' },
  { id: 'social', icon: Rss, 'aria-label-key': 'social_tooltip' },
  { id: 'alerts', icon: Bell, 'aria-label-key': 'alerts_tooltip' },
  { id: 'help', icon: HelpCircle, 'aria-label-key': 'help_tooltip' },
];

const BrokersDropdown = ({ t, closeMenu, setMainView }) => {
    return (
        <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white z-40 w-80 p-4 space-y-4"
        >
            <div className="flex items-center gap-4">
                <GitCompareArrows size={32} className="text-gray-600 dark:text-gray-300" />
                <div>
                    <h2 className="text-lg font-bold">{t('brokers_page_title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('brokers_page_subtitle')}</p>
                </div>
            </div>

            <div className="border-t border-blue-500/20 dark:border-blue-500/50"></div>

            <div className="space-y-3">
                <button 
                    onClick={() => { setMainView('brokers_page'); closeMenu(); }}
                    className="flex items-start gap-4 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-full text-left"
                >
                    <FilePlus2 size={24} className="text-gray-500 dark:text-gray-400 mt-1" />
                    <div>
                        <p className="font-semibold">{t('brokers_page_open_account')}</p>
                        <p className="text-xs text-gray-500">{t('brokers_page_open_account_desc')}</p>
                    </div>
                </button>
                <button onClick={() => { setMainView('awards_page'); closeMenu(); }} className="flex items-start gap-4 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-full text-left">
                    <Trophy size={24} className="text-gray-500 dark:text-gray-400 mt-1" />
                    <div>
                        <p className="font-semibold">{t('brokers_page_awards')}</p>
                        <p className="text-xs text-gray-500">{t('brokers_page_awards_desc')}</p>
                    </div>
                </button>
            </div>

            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase px-2.5 mb-2">{t('brokers_page_best_platinum')}</h3>
                <button onClick={() => { setMainView('bybit'); closeMenu(); }} title={t('open_account_tooltip', { broker: 'Bybit' })} className="w-full text-left bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                        <p className="text-lg font-bold">{t('brokers_page_bybit')}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                            </div>
                            <span className="font-bold text-lg">4.7</span>
                        </div>
                    </div>
                    <img src="https://s3-symbol-logo.tradingview.com/crypto/BYBIT.svg" alt="Bybit logo" className="w-12 h-12 rounded-md bg-white p-1" />
                </button>
            </div>
            
            <div className="space-y-1 pt-2">
                 <button onClick={() => { setMainView('brokers_page'); closeMenu(); }} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-medium">{t('brokers_page_information')}</button>
                 <button onClick={() => { setMainView('smartverse'); closeMenu(); }} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-medium">{t('brokers_page_trading_area')}</button>
            </div>
        </div>
    );
};

const MarketsDropdown = ({ t, closeMenu, language, setMainView }) => {
    const [isCountriesOpen, setIsCountriesOpen] = useState(false);

    const countries = [
        { key: 'sa', countryKey: 'country_saudi', flagCode: 'sa' },
        { key: 'us', countryKey: 'country_usa', flagCode: 'us' },
        { key: 'ca', countryKey: 'country_canada', flagCode: 'ca' },
        { key: 'gb', countryKey: 'country_uk', flagCode: 'gb' },
        { key: 'de', countryKey: 'country_germany', flagCode: 'de' },
        { key: 'in', countryKey: 'country_india', flagCode: 'in' },
        { key: 'jp', countryKey: 'country_japan', flagCode: 'jp' },
        { key: 'cn', countryKey: 'country_china', flagCode: 'cn' },
        { key: 'hk', countryKey: 'country_hk', flagCode: 'hk' },
        { key: 'au', countryKey: 'country_australia', flagCode: 'au' },
    ];
    
    return (
        <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white z-40 w-80 p-2"
        >
            {marketsMenuConfig.topItems.map((item, index) => (
                <React.Fragment key={item.key}>
                    {item.key === 'countries' ? (
                        <div>
                            <button
                                onClick={() => setIsCountriesOpen(p => !p)}
                                className={`flex items-start gap-4 p-2.5 rounded-lg w-full text-left transition-colors ${isCountriesOpen ? 'bg-gray-100 dark:bg-gray-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                            >
                                <item.icon size={24} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(item.descKey)}</p>
                                </div>
                                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isCountriesOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCountriesOpen && (
                                <div className="pl-8 pt-2 pb-1 space-y-1">
                                     <h3 className="px-2.5 py-2 text-xs font-semibold text-gray-500 uppercase">{t('markets_countries_by_country_header')}</h3>
                                     {countries.map(country => (
                                        <button key={country.key} onClick={closeMenu} className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                            <img src={`https://s3-symbol-logo.tradingview.com/country/${country.flagCode.toUpperCase()}.svg`} alt={t(country.countryKey)} className="w-6 h-6 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{t(country.countryKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                if (item.key === 'whole_world') setMainView('markets');
                                if (item.key === 'news') setMainView('news');
                                closeMenu();
                            }}
                            className="flex items-start gap-4 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-full text-left">
                            <item.icon size={24} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(item.descKey)}</p>
                            </div>
                        </button>
                    )}
                    {index < marketsMenuConfig.topItems.length - 1 && <div className="my-1 border-t border-gray-200 dark:border-gray-700/50"></div>}
                </React.Fragment>
            ))}
            <div className="my-2 border-t border-gray-200 dark:border-gray-700/50"></div>
            <h3 className="px-2.5 py-2 text-xs font-semibold text-gray-500 uppercase">{t(marketsMenuConfig.assetsHeaderKey)}</h3>
            {marketsMenuConfig.assetItems.map(item => (
                <button key={item.key} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-full text-left font-medium text-gray-900 dark:text-white text-base">
                    <span>{t(item.titleKey)}</span>
                    {language === 'ar' ? <ChevronLeft size={18} className="text-gray-500"/> : <ChevronRight size={18} className="text-gray-500" />}
                </button>
            ))}
        </div>
    );
};


const CommunityDropdown = ({ t, closeMenu, setMainView }) => {
    
    const handleItemClick = (item) => {
        if (item.key === 'trading_analysis') setMainView('trading_analysis');
        else if (item.key === 'indicators_strategies') setMainView('indicators_strategies');
        else if (item.key === 'the_leap') setMainView('the_leap');
        closeMenu();
    };

    const handleLinkClick = (link) => {
        if (link.key === 'community_power') setMainView('community_power');
        closeMenu();
    };
    
    return (
        <div 
            onClick={(e) => { e.stopPropagation(); }}
            className="animate-fade-in-up absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white z-40 w-96 p-2"
        >
            {communityMenuConfig.map(item => (
                 <button onClick={() => handleItemClick(item)} key={item.key} className="flex items-start gap-4 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-full text-left">
                    <item.icon size={24} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center flex-wrap gap-2">
                            {item.isSpecial && <span className="text-xs bg-blue-600 text-white font-bold px-2 py-1 rounded-md">{t('by_tradestation')}</span>}
                            <span>{t(item.titleKey)}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(item.descKey)}</p>
                    </div>
                 </button>
            ))}
            <div className="my-2 border-t border-gray-200 dark:border-gray-700/50"></div>
            {communityMenuLinks.map(link => (
                <button onClick={() => handleLinkClick(link)} key={link.key} className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors font-medium text-gray-500 dark:text-gray-400 text-sm">
                    {t(link.titleKey)}
                </button>
            ))}
        </div>
    );
};


// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const DropdownItem = (props: any) => {
    const { icon, title, desc, beta = false, hasSubmenu = false, onMouseEnter, isActive, onClick } = props;
    const { language, t } = useLanguage();
    return (
        <button onClick={onClick} onMouseEnter={onMouseEnter} className={`flex items-center gap-4 p-2.5 rounded-lg transition-colors w-full text-left ${isActive ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}>
            <div className="text-gray-500 dark:text-gray-400">{icon}</div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-900 dark:text-white">{title} {beta && <span className="text-xs bg-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full ms-2">{t('beta_badge')}</span>}</p>
                {desc && <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>}
            </div>
            {hasSubmenu && (language === 'ar' ? <ChevronLeft size={20} className="text-gray-500" /> : <ChevronRight size={20} className="text-gray-500" />)}
        </button>
    );
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const SimpleLink = (props: any) => {
    const { title, onMouseEnter, onClick } = props;
    return (
        <button onClick={onClick} onMouseEnter={onMouseEnter} className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors font-medium text-gray-900 dark:text-white text-base">
            {title}
        </button>
    );
};

const ProductsDropdown = ({ t, closeMenu, setActivePanel, onOpenNewsfeed, setMainView, onOpenBestCharts }) => {
    const { language } = useLanguage();
    const firstItem = menuConfig.sections[0].items[0];
    const [activeSubmenu, setActiveSubmenu] = useState('submenu' in firstItem ? firstItem.submenu : null);
    const [activeSubmenuKey, setActiveSubmenuKey] = useState(firstItem.key);

    const handleMouseEnter = (item: (typeof menuConfig.sections)[number]['items'][number]) => {
        if ('submenu' in item && item.submenu) {
            setActiveSubmenu(item.submenu);
            setActiveSubmenuKey(item.key);
        } else {
            setActiveSubmenu(null);
            setActiveSubmenuKey(null);
        }
    };

    const handleItemClick = (item: any) => {
        if (item.action === 'openNewsfeed') { onOpenNewsfeed(); closeMenu(); }
        if (item.key === 'portfolio') { setMainView('portfolio'); closeMenu(); }
        if (item.key === 'options') { setMainView('options'); closeMenu(); }
        if (item.key === 'yield_curves') { setMainView('yield_curves'); closeMenu(); }
        if (item.key === 'prices') { setMainView('prices'); closeMenu(); }
    };
    
    return (
        <div 
            onClick={(e) => { e.stopPropagation(); }}
            className="animate-fade-in-up absolute top-full mt-2 start-0 w-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white z-40 flex overflow-hidden max-h-[calc(100vh-100px)]"
        >
            <div className="w-[360px] flex-shrink-0 overflow-y-auto custom-scrollbar">
                <button
                    onClick={() => { onOpenBestCharts(); closeMenu(); }}
                    className="block w-full text-left p-4 bg-gray-100/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        {menuConfig.featured.icon}
                        <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{t(menuConfig.featured.titleKey)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t(menuConfig.featured.descKey)}</p>
                        </div>
                    </div>
                </button>
                
                <div className="p-2">
                    {menuConfig.sections.map((section, sectionIndex) => (
                        <div key={section.titleKey}>
                            <h3 className="px-2.5 py-2 text-xs font-semibold text-gray-500 uppercase">{t(section.titleKey)}</h3>
                            {section.items.map(item => item.isSimple ? (
                                <SimpleLink 
                                    key={item.key} 
                                    title={t(item.titleKey)}
                                    onMouseEnter={() => handleMouseEnter(item)}
                                    onClick={() => handleItemClick(item)}
                                />
                            ) : (
                                <DropdownItem 
                                    key={item.key}
                                    icon={item.icon}
                                    title={t(item.titleKey)}
                                    desc={'descKey' in item ? t(item.descKey) : undefined}
                                    beta={'beta' in item ? (item as { beta?: boolean }).beta : false}
                                    hasSubmenu={'submenu' in item && !!item.submenu}
                                    onMouseEnter={() => handleMouseEnter(item)}
                                    onClick={() => handleItemClick(item)}
                                    isActive={activeSubmenuKey === item.key}
                                />
                            ))}
                            {sectionIndex < menuConfig.sections.length - 1 && <div className="my-2 border-t border-gray-200 dark:border-gray-700/50"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {activeSubmenu && (
                <div className="w-[240px] flex-shrink-0 border-s border-gray-200 dark:border-gray-700/50 p-2 overflow-y-auto custom-scrollbar">
                    <h3 className="px-2.5 py-2 text-base font-bold text-gray-900 dark:text-white">{t(activeSubmenu.headerKey)}</h3>
                    {activeSubmenu.items.map(subItem => (
                         <button
                            key={subItem.titleKey}
                            onClick={() => {
                                if ('panelId' in subItem && subItem.panelId) setActivePanel(subItem.panelId);
                                closeMenu();
                            }}
                            className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors font-medium text-gray-900 dark:text-white text-base">
                            {t(subItem.titleKey)} {'beta' in subItem && subItem.beta && <span className="text-xs bg-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full ms-2">{t('beta_badge')}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TopHeader = ({ setActivePanel, onOpenNewsfeed, setMainView, onOpenBestCharts, onOpenUserSettings, onOpenCommandPalette, layouts, activeLayoutName, onSaveLayout, onLoadLayout, onDeleteLayout }) => {
    const { t, language } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
    const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);
    const [isMarketsMenuOpen, setIsMarketsMenuOpen] = useState(false);
    const [isBrokersMenuOpen, setIsBrokersMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

    const productsMenuRef = useRef(null);
    const communityMenuRef = useRef(null);
    const marketsMenuRef = useRef(null);
    const brokersMenuRef = useRef(null);
    const moreMenuRef = useRef(null);
    const themeMenuRef = useRef(null);
    const layoutMenuRef = useRef(null);

    const [mobileNav, setMobileNav] = useState({
        products: false, community: false, markets: false, brokers: false, more: false,
    });
    
    const MoreDropdown = ({ t, language, closeMenu, setActivePanel, setMainView }) => {
        const [activeSubmenuKey, setActiveSubmenuKey] = useState(null);
    
        const moreMenuConfig = {
            mainItems: [
                { key: 'help', icon: HelpCircle, titleKey: 'more_menu_help_title', descKey: 'more_menu_help_desc', panelId: 'help' },
                { key: 'downloads', icon: Download, titleKey: 'more_menu_downloads_title', descKey: 'more_menu_downloads_desc', href: '#' },
                { key: 'for_business', icon: Briefcase, titleKey: 'more_menu_business_title', descKey: 'more_menu_business_desc', href: '#' },
                { 
                    key: 'company', 
                    icon: Building2, 
                    titleKey: 'more_menu_company_title', 
                    descKey: 'more_menu_company_desc',
                    submenu: {
                        company: [
                            // TODO: Implement routes
                            { key: 'about', titleKey: 'nav.company.about', href: '#' },
                            { key: 'hashtag', titleKey: 'nav.company.hashtag', href: '#' },
                            { key: 'mission', titleKey: 'nav.company.mission', href: '#' },
                            { key: 'careers', titleKey: 'nav.company.careers', href: '#' },
                            { key: 'blog', titleKey: 'nav.company.blog', href: '#' },
                            { key: 'brokers', titleKey: 'nav.company.brokers', action: () => setMainView('brokers_page') },
                            { key: 'accessibility', titleKey: 'nav.company.accessibility', href: '#' },
                        ],
                        merch: [
                             // TODO: Implement routes
                            { key: 'store', titleKey: 'nav.merch.store', href: '#' },
                            { key: 'tarot', titleKey: 'nav.merch.tarot', href: '#' },
                            { key: 'c63', titleKey: 'nav.merch.c63', href: '#' },
                        ]
                    }
                },
            ]
        };
    
        const handleMouseEnter = (item) => {
            setActiveSubmenuKey(item.submenu ? item.key : null);
        };
    
        const handleMainItemClick = (item) => {
            if (item.panelId) setActivePanel(item.panelId);
            if (!item.submenu) closeMenu();
        };
        
        const activeSubmenu = activeSubmenuKey ? moreMenuConfig.mainItems.find(i => i.key === activeSubmenuKey)?.submenu : null;
    
        return (
            <div 
                onClick={(e) => e.stopPropagation()}
                onMouseLeave={() => setActiveSubmenuKey(null)}
                className="animate-fade-in-up absolute top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white z-40 flex overflow-hidden"
            >
                <div className="w-80 flex-shrink-0 p-2">
                    {moreMenuConfig.mainItems.map(item => (
                        <button 
                            key={item.key}
                            onClick={() => handleMainItemClick(item)}
                            onMouseEnter={() => handleMouseEnter(item)}
                            className={`flex items-start gap-4 p-2.5 rounded-lg w-full text-left transition-colors ${activeSubmenuKey === item.key ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                        >
                            <item.icon size={24} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(item.descKey)}</p>
                            </div>
                            {item.submenu && (language === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
                        </button>
                    ))}
                </div>
    
                {activeSubmenu && (
                    <div className="w-64 border-s border-gray-200 dark:border-gray-700/50 p-2 overflow-y-auto custom-scrollbar">
                        {activeSubmenu.company.map(subItem => (
                             <button
                                key={subItem.key}
                                aria-label={t(subItem.titleKey)}
                                onClick={() => {
                                    if (subItem.action) subItem.action();
                                    closeMenu();
                                }}
                                className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors font-medium text-gray-900 dark:text-white text-sm"
                            >
                                {t(subItem.titleKey)}
                            </button>
                        ))}
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700/50"></div>
                        <h3 className="px-2.5 py-2 text-xs font-semibold text-gray-500 uppercase">{t('nav.merch.title')}</h3>
                         {activeSubmenu.merch.map(subItem => (
                             <button
                                key={subItem.key}
                                aria-label={t(subItem.titleKey)}
                                onClick={() => {
                                    // TODO: Handle href navigation
                                    closeMenu();
                                }}
                                className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors font-medium text-gray-900 dark:text-white text-sm"
                            >
                                {t(subItem.titleKey)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handleSaveLayout = () => {
        if (name) {
            onSaveLayout(name);
        }
    };

    const toggleMobileNav = (key) => setMobileNav(prev => ({ ...prev, [key]: !prev[key] }));

    const handleMobileItemClick = (item) => {
        if (item.action === 'openNewsfeed') onOpenNewsfeed();
        if (item.key === 'portfolio') setMainView('portfolio');
        if (item.key === 'options') setMainView('options');
        if (item.key === 'yield_curves') setMainView('yield_curves');
        if (item.key === 'prices') setMainView('prices');
        setIsMobileMenuOpen(false);
    };

    const handleMobileSubItemClick = (subItem) => {
        if ('panelId' in subItem && subItem.panelId) setActivePanel(subItem.panelId);
        setIsMobileMenuOpen(false);
    };
    
    const handleMobileCommunityItemClick = (item) => {
        if (item.key === 'trading_analysis') setMainView('trading_analysis');
        else if (item.key === 'indicators_strategies') setMainView('indicators_strategies');
        else if (item.key === 'the_leap') setMainView('the_leap');
        setIsMobileMenuOpen(false);
    };

    const handleMobileCommunityLinkClick = (link) => {
        if (link.key === 'community_power') setMainView('community_power');
        setIsMobileMenuOpen(false);
    };
    
    const handleMobileMoreItemClick = (item) => {
        if (item.panelId) setActivePanel(item.panelId);
        setIsMobileMenuOpen(false);
    };
    
    const handleToolbarIconClick = (panelId) => {
        setActivePanel(panelId);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productsMenuRef.current && !productsMenuRef.current.contains(event.target)) setIsProductsMenuOpen(false);
            if (communityMenuRef.current && !communityMenuRef.current.contains(event.target)) setIsCommunityMenuOpen(false);
            if (marketsMenuRef.current && !marketsMenuRef.current.contains(event.target)) setIsMarketsMenuOpen(false);
            if (brokersMenuRef.current && !brokersMenuRef.current.contains(event.target)) setIsBrokersMenuOpen(false);
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setIsMoreMenuOpen(false);
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) setIsThemeMenuOpen(false);
            if (layoutMenuRef.current && !layoutMenuRef.current.contains(event.target)) setIsLayoutMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themeOptions = [
        { name: 'light', icon: Sun, key: 'theme_light' },
        { name: 'dark', icon: Moon, key: 'theme_dark' },
        { name: 'system', icon: Monitor, key: 'theme_system' }
    ];

    const CurrentThemeIcon = useMemo(() => {
        return {
            light: Sun,
            dark: Moon,
            system: Monitor
        }[theme] || Monitor;
    }, [theme]);

    const MobileNavLink = ({ titleKey, navKey }) => (
        <button onClick={() => toggleMobileNav(navKey)} className={`flex justify-between items-center w-full py-4 px-6 hover:bg-gray-100 dark:hover:bg-gray-800/50 text-lg border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-300`}>
            <span>{t(titleKey)}</span>
            <ChevronDown size={20} className={`transition-transform ${mobileNav[navKey] ? 'rotate-180' : ''}`} />
        </button>
    );
    
    return (
        <>
            <header className="bg-white dark:bg-black px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-y-2 sticky top-0 z-30">
                <div className="flex items-center">
                    <button onClick={() => setMainView('default')} className="flex items-center" title={t('go_to_homepage_tooltip')}>
                        <span className="font-bold text-lg">{t('brand_name')}</span>
                    </button>
                </div>

                <div className="hidden md:flex flex-grow items-center justify-center gap-2">
                    <div className="relative">
                        <button onClick={onOpenCommandPalette} className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-full py-2 ps-4 pe-4 w-64 text-left flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-800">
                           <div className="flex items-center gap-3">
                             <Search size={18} />
                             <span>{t('searchPlaceholder_short')}</span>
                           </div>
                           <div className="kbd-shortcut">⌘K</div>
                        </button>
                    </div>

                     <div className="relative" ref={layoutMenuRef}>
                        <button onClick={() => setIsLayoutMenuOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-sm">
                            <LayoutGrid size={16} />
                            <span>{activeLayoutName}</span>
                            <ChevronDown size={16} />
                        </button>
                        {isLayoutMenuOpen && (
                            <div className="animate-fade-in-up absolute top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-50">
                                <button onClick={handleSaveLayout} className="w-full flex items-center gap-3 p-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Save size={16} /> {t('layout_save_current')}
                                </button>
                                <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                                <p className="px-2 py-1 text-xs font-semibold text-gray-500">{t('layout_saved_layouts')}</p>
                                {Object.keys(layouts).map(name => (
                                    <div key={name} className="flex items-center justify-between group">
                                        <button onClick={() => { onLoadLayout(name); setIsLayoutMenuOpen(false); }} className="flex-grow text-left p-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            {name}
                                        </button>
                                        {name !== t('default_layout') && (
                                             <button onClick={() => onDeleteLayout(name)} className="p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <nav className="flex items-center gap-6 text-gray-700 dark:text-gray-300 text-sm">
                        <div className="relative" ref={productsMenuRef}>
                            <button onClick={() => setIsProductsMenuOpen(p => !p)} title={t('nav_products_tooltip')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                                {t('nav_products')} <ChevronDown size={16} className={`transition-transform duration-200 ${isProductsMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProductsMenuOpen && <ProductsDropdown t={t} closeMenu={() => setIsProductsMenuOpen(false)} setActivePanel={setActivePanel} onOpenNewsfeed={onOpenNewsfeed} setMainView={setMainView} onOpenBestCharts={onOpenBestCharts} />}
                        </div>
                        <div className="relative" ref={communityMenuRef}>
                            <button onClick={() => setIsCommunityMenuOpen(p => !p)} title={t('nav_community_tooltip')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                                {t('nav_community')} <ChevronDown size={16} className={`transition-transform duration-200 ${isCommunityMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCommunityMenuOpen && <CommunityDropdown t={t} closeMenu={() => setIsCommunityMenuOpen(false)} setMainView={setMainView} />}
                        </div>
                        <div className="relative" ref={marketsMenuRef}>
                             <button onClick={() => setIsMarketsMenuOpen(p => !p)} title={t('nav_markets_tooltip')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                                {t('nav_markets')} <ChevronDown size={16} className={`transition-transform duration-200 ${isMarketsMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isMarketsMenuOpen && <MarketsDropdown t={t} closeMenu={() => setIsMarketsMenuOpen(false)} language={language} setMainView={setMainView} />}
                        </div>
                        <div className="relative" ref={brokersMenuRef}>
                            <button onClick={() => setIsBrokersMenuOpen(p => !p)} title={t('nav_brokers_tooltip')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                                {t('nav_brokers')} <ChevronDown size={16} className={`transition-transform duration-200 ${isBrokersMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isBrokersMenuOpen && <BrokersDropdown t={t} closeMenu={() => setIsBrokersMenuOpen(false)} setMainView={setMainView} />}
                        </div>
                        <button onClick={() => setMainView('awards_page')} title={t('nav_awards_tooltip')} className="hover:text-gray-900 dark:hover:text-white">{t('nav_awards')}</button>
                        <div className="relative" ref={moreMenuRef}>
                            <button onClick={() => setIsMoreMenuOpen(p => !p)} title={t('nav_more_tooltip')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                                {t('nav_more')} <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isMoreMenuOpen && <MoreDropdown t={t} language={language} closeMenu={() => setIsMoreMenuOpen(false)} setActivePanel={setActivePanel} setMainView={setMainView} />}
                        </div>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button title={t('upgrade_now_tooltip')} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                            {t('upgrade_now')}
                        </button>
                        <div className="relative" ref={themeMenuRef}>
                            <button onClick={() => setIsThemeMenuOpen(p => !p)} title={t('theme_switcher_tooltip')} className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <CurrentThemeIcon size={20} />
                            </button>
                            {isThemeMenuOpen && (
                                <div className="animate-fade-in-up absolute top-full mt-2 end-0 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-2 z-50">
                                    {themeOptions.map(({ name, icon: Icon, key }) => (
                                        <button
                                            key={name}
                                            onClick={() => {
                                                setTheme(name as Theme);
                                                setIsThemeMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${
                                                theme === name
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{t(key)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onOpenUserSettings} title={t('settings_title')}>
                            <div className="w-9 h-9 bg-purple-200 dark:bg-purple-800/40 rounded-full flex items-center justify-center font-bold text-purple-700 dark:text-purple-300">A</div>
                        </button>
                    </div>
                </div>

                <div className="md:hidden flex items-center gap-4">
                    <button onClick={onOpenCommandPalette} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><Search size={22} /></button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <Menu size={24} />
                    </button>
                </div>
            </header>
            
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in-up" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-0 end-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-black overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                            <button onClick={() => setMainView('default')} className="flex items-center" title={t('go_to_homepage_tooltip')}>
                                <span className="font-bold text-lg">{t('brand_name')}</span>
                            </button>
                             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -m-2 text-gray-500 dark:text-gray-300"><X size={24} /></button>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-800">
                            <MobileNavLink titleKey="nav_products" navKey="products" />
                            {mobileNav.products && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {menuConfig.sections[0].items.map(item => (
                                             <button key={item.key} onClick={() => handleMobileItemClick(item)} className="text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                                <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                                <p className="text-xs text-gray-500">{t(item.descKey)}</p>
                                             </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                             <MobileNavLink titleKey="nav_community" navKey="community" />
                             {mobileNav.community && (
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                     {communityMenuConfig.map(item => (
                                        <button key={item.key} onClick={() => handleMobileCommunityItemClick(item)} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                            <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                        </button>
                                    ))}
                                </div>
                             )}
                              <MobileNavLink titleKey="nav_markets" navKey="markets" />
                              {mobileNav.markets && (
                                 <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                    {marketsMenuConfig.assetItems.map(item => (
                                        <button key={item.key} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                            <p className="font-semibold text-gray-900 dark:text-white">{t(item.titleKey)}</p>
                                        </button>
                                    ))}
                                </div>
                              )}
                               <MobileNavLink titleKey="nav_brokers" navKey="brokers" />
                               {mobileNav.brokers && (
                                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                    <button onClick={() => { setMainView('brokers_page'); setIsMobileMenuOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                        <p className="font-semibold text-gray-900 dark:text-white">{t('brokers_page_open_account')}</p>
                                    </button>
                                     <button onClick={() => { setMainView('awards_page'); setIsMobileMenuOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
                                        <p className="font-semibold text-gray-900 dark:text-white">{t('brokers_page_awards')}</p>
                                    </button>
                                  </div>
                               )}
                                <MobileNavLink titleKey="nav_more" navKey="more" />
                                {mobileNav.more && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                        {/* Mobile 'More' items would be simplified here */}
                                    </div>
                                )}
                        </div>

                        <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
                            {mobileToolbarIcons.map(item => (
                                 <button key={item.id} onClick={() => handleToolbarIconClick(item.id)} className="flex flex-col items-center gap-1.5 text-gray-600 dark:text-gray-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <item.icon size={22} />
                                    <span className="text-xs">{t(item['aria-label-key'])}</span>
                                 </button>
                            ))}
                        </div>
                        
                        <div className="p-4 flex flex-col gap-3">
                            <button onClick={onOpenUserSettings} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                                <div className="w-9 h-9 bg-purple-200 dark:bg-purple-800/40 rounded-full flex items-center justify-center font-bold text-purple-700 dark:text-purple-300">A</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">amralareke280</p>
                                    <p className="text-xs text-gray-500">{t('settings_join_date')}</p>
                                </div>
                            </button>
                            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg text-center">
                                {t('upgrade_now')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};