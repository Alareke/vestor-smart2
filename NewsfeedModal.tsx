/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Facebook, Twitter, Link as LinkIcon, Bookmark, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
// FIX: Corrected import to use 'allArticles' and alias it as 'newsArticles' as it was not an exported member.
import { allArticles as newsArticles } from './NewsPage/data';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';
const ARTICLES_PER_PAGE = 8;

const filterData = {
    market: [ { key: 'stocks', nameKey: 'newsfeed_market_stocks' }, { key: 'etfs', nameKey: 'newsfeed_market_etfs' }, { key: 'crypto', nameKey: 'newsfeed_market_crypto' }, { key: 'forex', nameKey: 'newsfeed_market_forex' }, { key: 'indices', nameKey: 'newsfeed_market_indices' }, { key: 'futures', nameKey: 'newsfeed_market_futures' }, { key: 'bonds', nameKey: 'newsfeed_market_bonds' }, { key: 'economy', nameKey: 'newsfeed_market_economy' } ],
    activity: [ { key: 'press_releases', nameKey: 'newsfeed_activity_press_releases' }, { key: 'financials', nameKey: 'newsfeed_activity_financials' }, { key: 'insider_trades', nameKey: 'newsfeed_activity_insider_trades' }, { key: 'esg', nameKey: 'newsfeed_activity_esg' }, { key: 'analyst_ratings', nameKey: 'newsfeed_activity_analyst_ratings' } ],
    region: [ { key: 'global', nameKey: 'newsfeed_region_global' }, { key: 'americas', nameKey: 'newsfeed_region_americas' }, { key: 'europe', nameKey: 'newsfeed_region_europe' }, { key: 'asia', nameKey: 'newsfeed_region_asia' }, { key: 'oceania', nameKey: 'newsfeed_region_oceania' }, { key: 'africa', nameKey: 'newsfeed_region_africa' } ],
    provider: [ { key: 'reuters', nameKey: 'newsfeed_provider_reuters' }, { key: 'afp', nameKey: 'newsfeed_provider_afp' }, { key: 'argaam', nameKey: 'newsfeed_provider_argaam' }, { key: 'beincrypto', nameKey: 'newsfeed_provider_beincrypto' }, { key: 'arabictrader', nameKey: 'newsfeed_provider_arabictrader' }, { key: 'cointelegraph', nameKey: 'newsfeed_provider_cointelegraph' }, { key: 'zawya', nameKey: 'newsfeed_provider_zawya' } ]
};

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const CheckboxItem = (props: any) => {
    const { label, checked, onChange } = props;
    return (
        <label className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-md cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-500 rounded-sm flex-shrink-0 flex items-center justify-center">
                {checked && <div className="w-3 h-3 bg-white dark:bg-gray-900 rounded-sm"></div>}
            </div>
            <span className="text-white text-sm">{label}</span>
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        </label>
    );
};

// FIX: Made children prop optional
const Accordion = ({ title, children }: { title: any, children?: React.ReactNode}) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-gray-800">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-white font-semibold">
                <span>{title}</span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-3 pt-0">{children}</div>}
        </div>
    )
};

const FilterSidebar = ({ t, onApply, initialFilters }) => {
    const [selectedMarkets, setSelectedMarkets] = useState(initialFilters.markets);
    const [selectedActivities, setSelectedActivities] = useState(initialFilters.activities);
    const [selectedRegions, setSelectedRegions] = useState(initialFilters.regions);
    const [selectedProviders, setSelectedProviders] = useState(initialFilters.providers);
    const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);

    const handleApply = () => {
        onApply({
            markets: selectedMarkets,
            activities: selectedActivities,
            regions: selectedRegions,
            providers: selectedProviders,
            searchTerm,
        });
    };

    const CheckboxFilterContent = ({ items, selected, setSelected }) => (
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {items.map(item => (
                <CheckboxItem
                    key={item.key}
                    label={t(item.nameKey)}
                    checked={selected.has(item.key)}
                    onChange={() => {
                        const newSet = new Set(selected);
                        if (newSet.has(item.key)) newSet.delete(item.key);
                        else newSet.add(item.key);
                        setSelected(newSet);
                    }}
                />
            ))}
        </div>
    );

    return (
        <aside className="w-full lg:w-72 flex-shrink-0 bg-[#1C2331] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-800">
            <div className="p-3 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white mb-3">{t('newsfeed_filters_title')}</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={t('newsfeed_search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#131722] border border-gray-600 rounded-md py-1.5 ps-8 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white" />
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-2 text-gray-500" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Accordion title={t('newsfeed_market_title')}>
                    <CheckboxFilterContent items={filterData.market} selected={selectedMarkets} setSelected={setSelectedMarkets} />
                </Accordion>
                <Accordion title={t('newsfeed_activity_title')}>
                    <CheckboxFilterContent items={filterData.activity} selected={selectedActivities} setSelected={setSelectedActivities} />
                </Accordion>
                <Accordion title={t('newsfeed_region_title')}>
                    <CheckboxFilterContent items={filterData.region} selected={selectedRegions} setSelected={setSelectedRegions} />
                </Accordion>
                <Accordion title={t('newsfeed_provider_title')}>
                     <CheckboxFilterContent items={filterData.provider} selected={selectedProviders} setSelected={setSelectedProviders} />
                </Accordion>
            </div>
            <div className="p-3 border-t border-gray-800">
                <button onClick={handleApply} className="w-full bg-cyan-600 text-white font-bold py-2 rounded-md hover:bg-cyan-700 transition-colors">{t('newsfeed_apply_filters_button')}</button>
            </div>
        </aside>
    );
};

const ArticleCard = (props: any) => {
    const { article, t } = props;
    const [isBookmarked, setIsBookmarked] = useState(false);
    return (
        <div className="bg-[#1C2331] border border-gray-800 rounded-lg flex flex-col group">
            {article.imageUrl && (
                <div className="aspect-video overflow-hidden">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL; }} />
                </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{article.source}</span>
                    <span>{article.timestamp}</span>
                </div>
                <h3 className="text-md font-bold text-white mb-3 flex-grow">{article.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                    {article.tags.map(tag => <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>)}
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-white"><Facebook size={18} /></button>
                        <button className="text-gray-400 hover:text-white"><Twitter size={18} /></button>
                        <button className="text-gray-400 hover:text-white"><LinkIcon size={18} /></button>
                    </div>
                    <button onClick={() => setIsBookmarked(!isBookmarked)} className={`text-gray-400 hover:text-white ${isBookmarked ? 'text-red-500' : ''}`}>
                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-[#1C2331] border border-gray-800 rounded-lg flex flex-col animate-pulse">
        <div className="aspect-video bg-gray-700"></div>
        <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
                <div className="h-4 w-12 bg-gray-700 rounded"></div>
            </div>
            <div className="h-5 w-full bg-gray-700 rounded mt-1"></div>
            <div className="h-5 w-3/4 bg-gray-700 rounded"></div>
            <div className="flex items-center gap-2 mt-2">
                <div className="h-5 w-12 bg-gray-700 rounded-full"></div>
                <div className="h-5 w-12 bg-gray-700 rounded-full"></div>
            </div>
        </div>
    </div>
);

export const NewsfeedModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const modalRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({
        markets: new Set<string>(),
        activities: new Set<string>(),
        regions: new Set<string>(),
        providers: new Set<string>(),
        searchTerm: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

    const handleApplyFilters = useCallback((newFilters) => {
        setIsLoading(true);
        setFilters(newFilters);
        setVisibleCount(ARTICLES_PER_PAGE);
        setTimeout(() => setIsLoading(false), 300);
    }, []);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ARTICLES_PER_PAGE);
    };

    const tabs = [
        { key: 'all', nameKey: 'newsfeed_tab_all' },
        { key: 'hot', nameKey: 'newsfeed_tab_hot' },
        { key: 'popular', nameKey: 'newsfeed_tab_popular' },
    ];

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    
    const translatedArticles = useMemo(() => newsArticles.map(a => ({...a, title: t(a.titleKey), content: t(a.contentKey), timestamp: t(a.timestampKey)})), [t]);

    const filteredArticles = useMemo(() => {
        return translatedArticles.filter(article => {
            const { markets, providers, searchTerm } = filters;
            
            if (markets.size > 0 && !markets.has(article.category)) {
                return false;
            }

            if (providers.size > 0 && !providers.has(article.source.toLowerCase())) {
                return false;
            }

            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const titleMatch = article.title.toLowerCase().includes(lowerSearchTerm);
                const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
                if (!titleMatch && !tagMatch) {
                    return false;
                }
            }
            return true;
        });
    }, [translatedArticles, filters]);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-[#131722] rounded-2xl shadow-2xl w-full max-w-7xl mx-auto flex flex-col lg:flex-row h-[90vh] max-h-[900px] border border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <FilterSidebar t={t} onApply={handleApplyFilters} initialFilters={filters} />

                <div className="flex-1 flex flex-col min-h-0">
                    <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeTab === tab.key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                                    {t(tab.nameKey)}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-800"><X size={20} /></button>
                    </header>
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {isLoading 
                                ? Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)
                                : filteredArticles.length > 0
                                    ? filteredArticles.slice(0, visibleCount).map(article => <ArticleCard key={article.id} article={article} t={t} />)
                                    : <div className="col-span-full text-center text-gray-500 py-20">{t('newsfeed_no_results')}</div>
                            }
                        </div>
                        {!isLoading && visibleCount < filteredArticles.length && (
                            <div className="text-center mt-8">
                                <button onClick={handleLoadMore} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                                    {t('newsfeed_load_more')}
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>,
        document.body
    );
};