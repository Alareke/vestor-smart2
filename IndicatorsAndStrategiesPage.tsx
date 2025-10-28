

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Rocket, MessageSquare, Flame, Clock, ChevronDown, UserPlus, Eye, Search } from 'lucide-react';

const DEFAULT_NEWS_IMAGE_URL = 'https://i.imgur.com/8383I48.png';

const IndicatorCard = (props: any) => {
    const { indicator, t, onIdeaClick } = props;
    return (
        <div onClick={() => onIdeaClick(indicator)} className="bg-gray-800/20 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer">
            <div className="p-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700/50">
                <img src={indicator.authorAvatarUrl} alt={indicator.author} className="w-10 h-10 rounded-full"/>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-900 dark:text-white">{indicator.author}</p>
                    <p className="text-xs text-gray-500">{indicator.time || indicator.date}</p>
                </div>
                <button onClick={(e) => e.stopPropagation()} className="flex-shrink-0 flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 border border-cyan-600/50 dark:border-cyan-400/50 px-3 py-1 rounded-full hover:bg-cyan-500/10 transition-colors">
                    <UserPlus size={14}/>
                    <span>{t('indicators_strategies_page_follow')}</span>
                </button>
            </div>
            <div className="relative">
                <img src={indicator.imageUrl || indicator.img || DEFAULT_NEWS_IMAGE_URL} alt={indicator.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL; }} />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(indicator.tags || []).map(tag => <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">{typeof tag === 'string' && tag.startsWith('tag_') ? t(tag) : tag}</span>)}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex-grow">{indicator.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Rocket size={16} />{indicator.likes.toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={16} />{indicator.comments}</span>
                        <span className="flex items-center gap-1.5"><Eye size={16} />{indicator.views || 0}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onIdeaClick(indicator); }} className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">{t('read_more_link')}</button>
                </div>
            </div>
        </div>
    );
};

const FeaturedIndicatorCard = ({ indicator, t, onIdeaClick }) => (
    <div onClick={() => onIdeaClick(indicator)} className="bg-gray-800/20 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-3xl overflow-hidden group transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col md:flex-row cursor-pointer">
        <div className="md:w-1/2 overflow-hidden">
            <img src={indicator.imageUrl || indicator.img || DEFAULT_NEWS_IMAGE_URL} alt={t(indicator.title)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = DEFAULT_NEWS_IMAGE_URL; }} />
        </div>
        <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <img src={indicator.authorAvatarUrl} alt={indicator.author} className="w-12 h-12 rounded-full"/>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{indicator.author}</p>
                    <p className="text-sm text-gray-500">{indicator.time || indicator.date}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {(indicator.tags || []).map(tag => <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">{typeof tag === 'string' && tag.startsWith('tag_') ? t(tag) : tag}</span>)}
            </div>
            <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-3 flex-grow">{indicator.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{indicator.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5"><Rocket size={18} />{indicator.likes.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><MessageSquare size={18} />{indicator.comments}</span>
                    <span className="flex items-center gap-1.5"><Eye size={18} />{indicator.views || 0}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onIdeaClick(indicator); }} className="font-semibold text-base text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-2">
                    {t('read_more_link')}
                </button>
            </div>
        </div>
    </div>
);

// FIX: Update default `onIdeaClick` prop to match expected signature with an argument, resolving type inconsistency.
export const IndicatorsAndStrategiesPage: React.FC<{ indicatorsData: any[], onIdeaClick: (idea: any) => void }> = ({ indicatorsData = [], onIdeaClick = (idea) => {} }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all_types_filter');
    const [sortOption, setSortOption] = useState('trending');
    const [searchTerm, setSearchTerm] = useState('');

    const filterOptions = [
        { key: 'all_types_filter' },
        { key: 'open_source_only_filter' }
    ];

    const filteredAndSortedData = useMemo(() => {
        let data = indicatorsData.filter(indicator => !indicator.featured);
        
        if (filter === 'open_source_only_filter') {
            data = data.filter(indicator => indicator.isOpenSource);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            data = data.filter(idea => {
                const title = idea.title ? (typeof idea.title === 'string' ? idea.title : t(idea.title)) : '';
                const description = idea.description ? (typeof idea.description === 'string' ? idea.description : t(idea.description)) : '';
                const author = idea.author ? (typeof idea.author === 'string' ? idea.author : t(idea.author)) : '';
                
                return title.toLowerCase().includes(lowercasedTerm) ||
                       description.toLowerCase().includes(lowercasedTerm) ||
                       author.toLowerCase().includes(lowercasedTerm) ||
                       (idea.tags && idea.tags.some(tag => {
                         const translatedTag = typeof tag === 'string' && tag.startsWith('tag_') ? t(tag) : tag;
                         return typeof translatedTag === 'string' && translatedTag.toLowerCase().includes(lowercasedTerm);
                       }))
            });
        }
        
        const parseViews = (viewsStr) => {
            if (typeof viewsStr === 'number') return viewsStr;
            if (typeof viewsStr !== 'string') return 0;
            const num = parseFloat(viewsStr);
            if (viewsStr.toLowerCase().includes('m')) return num * 1000000;
            if (viewsStr.toLowerCase().includes('k')) return num * 1000;
            return num;
        }

        switch (sortOption) {
            case 'popular':
                data.sort((a, b) => b.likes - a.likes);
                break;
            case 'newest':
                 data.sort((a, b) => b.id - a.id);
                break;
            case 'trending':
            default:
                data.sort((a, b) => (b.likes + parseViews(b.views || 0)) - (a.likes + parseViews(a.views || 0)));
                break;
        }
        return data;
    }, [filter, sortOption, searchTerm, t, indicatorsData]);

    const featuredIndicator = indicatorsData.find(indicator => indicator.featured);

    return (
        <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-full p-4 sm:p-6 md:p-8 font-sans">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-cyan-50 to-purple-50 dark:from-black dark:via-[#0b1220] dark:to-[#110f1a] -z-10"></div>
            <div className="max-w-screen-xl mx-auto">
                <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span>{t('nav_community')}</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white">{t('community_indicators_strategies_title')}</span>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('community_indicators_strategies_title')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{t('indicators_strategies_page_subtitle')}</p>
                </header>

                {featuredIndicator && (
                    <section className="mb-12">
                         <h2 className="text-2xl font-bold mb-4">{t('indicators_strategies_page_featured')}</h2>
                         <FeaturedIndicatorCard indicator={featuredIndicator} t={t} onIdeaClick={onIdeaClick} />
                    </section>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mb-8 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 rounded-b-2xl">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-sm">
                        {filterOptions.map(f => (
                             <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${filter === f.key ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                                {t(f.key)}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                         <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="appearance-none bg-gray-100 dark:bg-gray-800 rounded-full pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="trending">{t('indicators_strategies_page_sort_trending')}</option>
                            <option value="popular">{t('indicators_strategies_page_sort_popular')}</option>
                            <option value="newest">{t('indicators_strategies_page_sort_newest')}</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                    </div>
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input type="text" placeholder={t('indicators_strategies_page_search_placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAndSortedData.map(indicator => (
                        <IndicatorCard key={indicator.id} indicator={indicator} t={t} onIdeaClick={onIdeaClick} />
                    ))}
                </div>
            </div>
        </div>
    );
};