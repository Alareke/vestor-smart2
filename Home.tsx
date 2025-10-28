/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GripVertical, X, Loader2 } from 'lucide-react';
import { RightToolbar } from './components/RightToolbar';
import { TopHeader } from './components/TopHeader';
import { MarketSummary } from './components/MarketSummary';
import { CommunityIdeas } from './components/CommunityIdeas';
import { useLanguage } from './i18n/LanguageContext';
import { CryptoTickerTape } from './components/CryptoTickerTape';
import { GoogleGenAI, Modality } from '@google/genai';

// Statically imported components
import { PersonalizedBriefing } from './components/PersonalizedBriefing';
// FIX: Correct import path to be relative.
import { IndicatorsAndStrategies } from './components/IndicatorsAndStrategies';
import { SaudiStocks } from './components/SaudiStocks';
// FIX: Correct import path to be relative.
import { TradingAnalysis } from './components/TradingAnalysis';
import { TopPerformingStocks } from './components/TopPerformingStocks';
import { PerformanceStocks } from './components/PerformanceStocks';
import { DividendSchedule } from './components/DividendSchedule';
import { UsStockNews } from './components/UsStockNews';
import { DigitalCurrencies } from './components/DigitalCurrencies';
import { DigitalCurrencyAnalysis } from './components/DigitalCurrencyAnalysis';
import { DigitalCurrencyPerformance } from './components/DigitalCurrencyPerformance';
import { DigitalCurrencyNews } from './components/DigitalCurrencyNews';
import { FuturesAnalysis } from './components/FuturesAnalysis';
import { FuturesContracts } from './components/FuturesContracts';
import { FuturesNews } from './components/FuturesNews';
import { ForexAnalysis } from './components/ForexAnalysis';
import { ForexHeatmap } from './components/ForexHeatmap';
import { ForexNews } from './components/ForexNews';
import { InflationMap } from './components/InflationMap';
import { Footer } from './components/Footer';
import { WatchlistPanel } from './components/WatchlistPanel';
import { AddSectionModal, sectionList } from './components/AddSectionModal';
import { AddSymbolModal } from './components/AddSymbolModal';
import { WatchlistSettingsModal } from './components/WatchlistSettingsModal';
import { ChatPanel } from './components/ChatPanel';
import { VerifyAccountModal } from './components/VerifyAccountModal';
import { StockScreener } from './components/StockScreener';
import { EconomicCalendarModal } from './components/EconomicCalendarModal';
import { SocialCommunicationModal } from './components/SocialCommunicationModal';
import { NotificationsPanel } from './components/NotificationsPanel';
import { UserSettingsModal } from './components/UserSettingsModal';
import { BillingSettingsModal } from './components/BillingSettingsModal';
import { HelpCenterPanel } from './components/HelpCenterPanel';
import { NewsfeedModal } from './components/NewsfeedModal';
import { ActivityPanel } from './components/ActivityPanel';
import { Portfolio } from './components/Portfolio';
import { OptionsStrategy } from './components/OptionsStrategy';
import { TradingAnalysisPage } from './components/TradingAnalysisPage';
import { IndicatorsAndStrategiesPage } from './components/IndicatorsAndStrategiesPage';
import { TheLeapPage } from './components/TheLeapPage';
import { CommunityPowerPage } from './components/CommunityPowerPage';
import { BestChartsModal } from './components/BestChartsModal';
import { ForexHeatmapModal } from './components/ForexHeatmapModal';
import { MarketsPage } from './components/MarketsPage';
import { NewsPage } from './components/NewsPage/NewsPage';
import { BrokersPage } from './components/BrokersPage';
import { AwardsPage } from './components/AwardsPage';
import { SmartversePage } from './components/SmartversePage';
import { YieldCurvesPage } from './components/YieldCurvesPage';
import { BybitPage } from './components/BybitPage';
import { PricesPage } from './components/PricesPage';
import { TranslateModal } from './components/TranslateModal';
import { IdeaDetailPage } from './components/IdeaDetailPage';
import { DeveloperI18nInspector } from './components/DeveloperI18nInspector';
import { MobileToolbar } from './components/MobileToolbar';

import { AssistantFAB } from './components/AssistantFAB';
import { AssistantModal } from './components/AssistantModal';
import { generateChartData, genericDetailsTemplate } from './data/chartData';
import { initialWatchlistData, initialDetailedWatchlistData } from './data/watchlistData';
import type { WatchlistData, WatchlistItem } from './data/watchlistData';
import { AISuggestions } from './components/AISuggestions';
import { MissingTranslationsModal } from './components/MissingTranslationsModal';
import { CommandPalette } from './components/CommandPalette';
import { useTheme } from './i18n/ThemeContext';
import { useAI } from './i18n/AIContext';
import { QuotaErrorModal } from './components/QuotaErrorModal';

// Derive sectionKeys from the single source of truth in AddSectionModal.tsx
const sectionKeys = sectionList.map(s => s.key);

// Generate initial state where all sections are visible
const initialSectionsState = sectionKeys.reduce((acc, key) => {
    acc[key] = true;
    return acc;
}, {});

// Create a master list of all symbols for searching
const allSymbolsForSearch = Object.values(initialWatchlistData)
    .flatMap(category => category.items)
    .map(item => ({
        ...item,
        typeKey: Object.keys(initialWatchlistData).find(key => initialWatchlistData[key].items.some(i => i.key === item.key))
    }));


export default function Home() {
  const { language, t } = useLanguage();
  const { setTheme } = useTheme();
  const { isAIEnabled } = useAI();
  
  const [panelWidth, setPanelWidth] = useState(384);
  const [activePanel, setActivePanel] = useState<'watchlist' | 'chat' | 'screener' | 'calendar' | 'social' | 'alerts' | 'help' | 'activity' | null>(null);
  const [sections, setSections] = useState<{[key: string]: boolean}>(initialSectionsState);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddSymbolModalOpen, setIsAddSymbolModalOpen] = useState(false);
  const [isWatchlistSettingsModalOpen, setIsWatchlistSettingsModalOpen] = useState(false);
  const [isVerifyAccountModalOpen, setIsVerifyAccountModalOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [isBillingSettingsModalOpen, setIsBillingSettingsModalOpen] = useState(false);
  const [isNewsfeedModalOpen, setIsNewsfeedModalOpen] = useState(false);
  const [isBestChartsModalOpen, setIsBestChartsModalOpen] = useState(false);
  const [isForexMapModalOpen, setIsForexMapModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isI18nInspectorOpen, setIsI18nInspectorOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [updatedSymbols, setUpdatedSymbols] = useState<Set<string>>(new Set());
  const [reminders, setReminders] = useState<Set<string>>(() => {
    try {
        const savedReminders = localStorage.getItem('event_reminders');
        return savedReminders ? new Set(JSON.parse(savedReminders)) : new Set();
    } catch {
        return new Set();
    }
  });

  const toggleReminder = (eventId: string) => {
    setReminders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(eventId)) {
            newSet.delete(eventId);
        } else {
            newSet.add(eventId);
        }
        try {
            localStorage.setItem('event_reminders', JSON.stringify(Array.from(newSet)));
        } catch (e) {
            console.error('Failed to save reminders to localStorage', e);
        }
        return newSet;
    });
  };

  useEffect(() => {
    try {
        const savedWidth = localStorage.getItem('panelWidth');
        if (savedWidth) {
            const parsedWidth = parseInt(savedWidth, 10);
            if(parsedWidth >= 320 && parsedWidth <= 600) {
                setPanelWidth(parsedWidth);
            }
        }
    } catch (e) {
        console.error('Failed to load panel width from localStorage', e);
    }
  }, []);

  const handleMouseDownOnResizer = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.classList.add('resizing-watchlist');

    const handleMouseMove = (moveEvent: MouseEvent) => {
        let newWidth;
        // The flex-direction is reversed for 'en', so the panel is on the right.
        if (language === 'en') {
            newWidth = window.innerWidth - moveEvent.clientX;
        } else { // For 'ar' and other RTL languages, panel is on the left.
            newWidth = moveEvent.clientX;
        }

        const constrainedWidth = Math.max(320, Math.min(newWidth, 600));
        setPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
        document.body.classList.remove('resizing-watchlist');
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        
        setPanelWidth(prevWidth => {
            try {
                localStorage.setItem('panelWidth', String(prevWidth));
            } catch(e) { console.error('Failed to save panel width to localStorage', e); }
            return prevWidth;
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  }, [language]);


  const [watchlistData, setWatchlistData] = useState<WatchlistData>(() => {
    try {
        const savedWatchlist = localStorage.getItem('watchlist_data');
        if (savedWatchlist) {
            const parsedData = JSON.parse(savedWatchlist);
            if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length > 0) {
                return parsedData;
            }
        }
    } catch (e) {
        console.error('Failed to load watchlist from localStorage', e);
    }
    return initialWatchlistData;
  });

   useEffect(() => {
        const intervalId = setInterval(() => {
            setWatchlistData(prevData => {
                const newData = JSON.parse(JSON.stringify(prevData));
                const updated = new Set<string>();
                
                Object.keys(newData).forEach(categoryKey => {
                    newData[categoryKey].items.forEach(item => {
                        // 30% chance to update each item
                        if (Math.random() < 0.3) {
                            const price = parseFloat(item.price.replace(/,/g, ''));
                            const changeFactor = (Math.random() - 0.5) * 0.05; // up to 2.5% change
                            const changeAmount = price * changeFactor;
                            const newPrice = price + changeAmount;
                            const oldPrice = newPrice - item.change;
                            
                            item.price = newPrice.toFixed(item.currency === 'JPY' ? 0 : 2);
                            item.change = item.change + changeAmount;
                            item.isPositive = item.change >= 0;
                            item.changePct = oldPrice !== 0 ? (item.change / oldPrice) * 100 : 0;
                            
                            updated.add(item.key);
                        }
                    });
                });
                
                if (updated.size > 0) {
                    setUpdatedSymbols(updated);
                    // Animation duration is 1s, clear after that
                    setTimeout(() => setUpdatedSymbols(new Set()), 1000);
                }

                return newData;
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(intervalId);
    }, []);

  const [detailedWatchlistData, setDetailedWatchlistData] = useState(initialDetailedWatchlistData);
  const [mainView, setMainView] = useState<'default' | 'portfolio' | 'options' | 'trading_analysis' | 'indicators_strategies' | 'the_leap' | 'community_power' | 'markets' | 'news' | 'brokers_page' | 'awards_page' | 'smartverse' | 'yield_curves' | 'bybit' | 'prices' | 'idea_detail'>('default');
  
  const [activeMarketTab, setActiveMarketTab] = useState('stocks');
  const [activeMarketTicker, setActiveMarketTicker] = useState('2222');

  const chartPeriodsValue = t('chart_periods');
  const chartPeriods = Array.isArray(chartPeriodsValue) ? chartPeriodsValue : [];
  const [activeTimeframe, setActiveTimeframe] = useState(chartPeriods[0] ?? '');
  
  // State for Drag and Drop & Layouts
  const [sectionOrder, setSectionOrder] = useState(sectionKeys);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ key: string | null, position: 'before' | 'after' } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
        const savedFavorites = localStorage.getItem('stock_favorites');
        if (savedFavorites) {
            return new Set(JSON.parse(savedFavorites));
        }
    } catch (e) {
        console.error('Failed to load favorites from localStorage', e);
    }
    return new Set();
  });

  const [layouts, setLayouts] = useState(() => {
    try {
        const savedLayouts = localStorage.getItem('dashboard_layouts');
        return savedLayouts ? JSON.parse(savedLayouts) : { [t('default_layout')]: { order: sectionKeys, visibility: initialSectionsState } };
    } catch {
        return { [t('default_layout')]: { order: sectionKeys, visibility: initialSectionsState } };
    }
  });
  const [activeLayoutName, setActiveLayoutName] = useState(t('default_layout'));
    
  const [communityIdeas, setCommunityIdeas] = useState([]);
  const [indicatorsAndStrategiesData, setIndicatorsAndStrategiesData] = useState([]);
  const [tradingAnalysisData, setTradingAnalysisData] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(true);

  const [userNews, setUserNews] = useState([]);
  const [userAnalyses, setUserAnalyses] = useState([]);


    const generateAndCacheImages = useCallback(async (data, setData, cacheKey) => {
        const fullCacheKey = `${cacheKey}_${language}`;
        try {
            const cachedImages = localStorage.getItem(fullCacheKey);
            if (cachedImages) {
                const parsedImages = JSON.parse(cachedImages);
                const isCacheValid = data.length > 0 && data.every(item => parsedImages[item.id]);
                if (isCacheValid) {
                    const updatedData = data.map(item => ({ ...item, img: parsedImages[item.id] }));
                    setData(updatedData);
                    return;
                }
            }
        } catch (e) { console.error("Failed to read image cache", e); }

        setData(d => d.map(item =>
            (item.img?.includes('picsum') || item.img?.includes('unsplash'))
                ? { ...item, isImageLoading: true }
                : item
        ));

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newImages = {};

        const promises = data.map(async (item) => {
            if (item.isImageLoading) {
                try {
                    
                    const response = await ai.models.generateContent({
                        config: {
                            responseModalities: [Modality.IMAGE],
                        },
                    });

                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64ImageBytes: string = part.inlineData.data;
                            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                            newImages[item.id] = imageUrl;
                            return { ...item, img: imageUrl, isImageLoading: false };
                        }
                    }
                    return { ...item, isImageLoading: false };
                } catch (e) {
                    console.error(`Failed to generate image for "${item.title}"`, e);
                    return { ...item, isImageLoading: false };
                }
            }
            return item;
        });
        
        const results = await Promise.all(promises);
        setData(results);

        try {
            if (Object.keys(newImages).length > 0) {
                localStorage.setItem(fullCacheKey, JSON.stringify(newImages));
            }
        } catch (e) { console.error("Failed to write to image cache", e); }
    }, [language, t]);

    useEffect(() => {
        const fetchDataAndImages = async () => {
            setIsContentLoading(true);
            try {
                const [communityRes, indicatorsRes, analysisRes] = await Promise.all([
                    fetch(`/data/${language}/community-ideas.json`),
                    fetch(`/data/${language}/indicators-strategies.json`),
                    fetch(`/data/${language}/trading-analysis.json`),
                ]);

                if (!communityRes.ok || !indicatorsRes.ok || !analysisRes.ok) {
                    throw new Error('Failed to fetch content data');
                }
                
                const communityData = await communityRes.json();
                const indicatorsData = await indicatorsRes.json();
                const analysisData = await analysisRes.json();

                if (isAIEnabled) {
                     // Using Promise.all to run image generation in parallel
                    await Promise.all([
                        generateAndCacheImages(communityData, setCommunityIdeas, 'communityIdeasImages'),
                        generateAndCacheImages(indicatorsData, setIndicatorsAndStrategiesData, 'indicatorsAndStrategiesImages'),
                        generateAndCacheImages(analysisData, setTradingAnalysisData, 'tradingAnalysisImages'),
                    ]);
                } else {
                    setCommunityIdeas(communityData);
                    setIndicatorsAndStrategiesData(indicatorsData);
                    setTradingAnalysisData(analysisData);
                }

            } catch (error) {
                console.error("Error fetching or processing content data:", error);
                // Fallback to empty arrays on error
                setCommunityIdeas([]);
                setIndicatorsAndStrategiesData([]);
                setTradingAnalysisData([]);
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchDataAndImages();
    }, [language, isAIEnabled, generateAndCacheImages]);
  
  const saveIdea = useCallback((ideaData: {id?: any; [key: string]: any}) => {
    const isUpdate = !!ideaData.id;

    const finalIdea: { [key: string]: any } = {
        author: t('you_label'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=current-user',
        ...ideaData,
        id: isUpdate ? ideaData.id : Date.now(),
        date: isUpdate ? t('edited_just_now_label') : (ideaData.status === 'published' ? t('just_now_label') : ''),
        tags: (ideaData.tags || []).map(tag => {
            if (typeof tag === 'string' && tag.startsWith('tag_')) return tag;
            return `tag_${(tag || '').toLowerCase().replace(/ /g, '_')}`;
        }),
    };

    if (!isUpdate) {
        finalIdea.likes = ideaData.likes || 0;
        finalIdea.comments = ideaData.comments || 0;
        finalIdea.views = ideaData.views || 0;
    }

    const updateState = (setter) => {
        setter(prev => {
            if (isUpdate) {
                // FIX: Specified a more concrete type for `item` to resolve TypeScript error about 'id' not existing on 'unknown'.
                return prev.map((item: { id: number | string }) => item.id === finalIdea.id ? finalIdea : item);
            }
            return [finalIdea, ...prev];
        });
    };

    switch (finalIdea.section) {
        case 'indicatorsAndStrategies':
            updateState(setIndicatorsAndStrategiesData);
            break;
        case 'tradingAnalysis':
            updateState(setTradingAnalysisData);
            break;
        case 'communityIdeas':
        default:
            updateState(setCommunityIdeas);
            break;
    }
  }, [t]);
  
  const deleteIdea = useCallback((ideaId, section) => {
    if (window.confirm(t('confirm_delete_idea'))) {
        switch(section) {
            case 'indicatorsAndStrategies':
                 // FIX: Add type to 'idea' parameter to resolve TypeScript error.
                 setIndicatorsAndStrategiesData(prev => prev.filter((idea: { id: any }) => idea.id !== ideaId));
                 break;
            case 'tradingAnalysis':
                 // FIX: Add type to 'idea' parameter to resolve TypeScript error. The error was reported on this line.
                 setTradingAnalysisData(prev => prev.filter((idea: { id: any }) => idea.id !== ideaId));
                 break;
            case 'communityIdeas':
            default:
                // FIX: Add type to 'idea' parameter to resolve TypeScript error.
                setCommunityIdeas(prev => prev.filter((idea: { id: any }) => idea.id !== ideaId));
                break;
        }
        return true;
    }
    return false;
  }, [t]);

  const saveAnalysis = useCallback((analysisData: any) => {
    const isUpdate = !!analysisData.id;

    const finalAnalysis = {
        author: t('you_label'),
        ...analysisData,
        id: isUpdate ? analysisData.id : Date.now(),
        date: isUpdate ? t('edited_just_now_label') : (analysisData.status === 'published' ? t('just_now_label') : ''),
    };

    setUserAnalyses(prev => {
        if (isUpdate) {
            return prev.map((a: { id: number | string }) => a.id === finalAnalysis.id ? finalAnalysis : a);
        }
        return [finalAnalysis, ...prev];
    });
  }, [t]);

  const deleteAnalysis = useCallback((analysisId: any) => {
    if (window.confirm(t('confirm_delete_analysis'))) {
      setUserAnalyses(prev => prev.filter(a => a.id !== analysisId));
      return true;
    }
    return false;
  }, [t]);
  
  const saveNews = useCallback((newsData: any) => {
    const isUpdate = !!newsData.id;

    const finalNews = {
        author: t('you_label'),
        authorAvatarUrl: 'https://i.pravatar.cc/150?u=current-user',
        ...newsData,
        id: isUpdate ? newsData.id : Date.now(),
        date: isUpdate ? t('edited_just_now_label') : (newsData.status === 'published' ? t('just_now_label') : ''),
        tags: (newsData.tags || []).map(tag => {
            if (typeof tag === 'string' && tag.startsWith('tag_')) return tag;
            return `tag_${(tag || '').toLowerCase().replace(/ /g, '_')}`;
        }),
    };
    
    setUserNews(prev => {
        if (isUpdate) {
            return prev.map((n: { id: number | string }) => n.id === finalNews.id ? finalNews : n);
        }
        return [finalNews, ...prev];
    });
  }, [t]);

  const deleteNews = useCallback((newsId) => {
    if (window.confirm(t('confirm_delete_idea'))) {
        setUserNews(prev => prev.filter(news => news.id !== newsId));
        return true;
    }
    return false;
  }, [t]);

  useEffect(() => {
    const checkScheduledPosts = () => {
      const now = new Date();
      const checkAndPublish = (items, setter) => {
        let changed = false;
        const updatedItems = items.map(item => {
          if (item.status === 'scheduled' && item.publishAt && new Date(item.publishAt) <= now) {
            changed = true;
            return { ...item, status: 'published', date: t('just_now_label') };
          }
          return item;
        });
        if (changed) {
          setter(updatedItems);
        }
      };
      
      checkAndPublish(communityIdeas, setCommunityIdeas);
      checkAndPublish(indicatorsAndStrategiesData, setIndicatorsAndStrategiesData);
      checkAndPublish(tradingAnalysisData, setTradingAnalysisData);
      checkAndPublish(userNews, setUserNews);
      checkAndPublish(userAnalyses, setUserAnalyses);
    };

    const intervalId = setInterval(checkScheduledPosts, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [communityIdeas, indicatorsAndStrategiesData, tradingAnalysisData, userNews, userAnalyses, t]);

  const publishedCommunityIdeas = useMemo(() => communityIdeas.filter(idea => idea.status === 'published'), [communityIdeas]);
  const publishedIndicators = useMemo(() => indicatorsAndStrategiesData.filter(idea => idea.status === 'published'), [indicatorsAndStrategiesData]);
  const publishedUserNews = useMemo(() => userNews.filter(news => news.status === 'published'), [userNews]);
  const publishedUserAnalyses = useMemo(() => userAnalyses.filter(analysis => analysis.status === 'published'), [userAnalyses]);

  const combinedTradingAnalysis = useMemo(() => [
      ...publishedUserAnalyses.filter(a => a.section === 'tradingAnalysis'),
      ...tradingAnalysisData.filter(idea => idea.status === 'published')
  ], [publishedUserAnalyses, tradingAnalysisData]);

  const toggleFavorite = (stockId: string) => {
    setFavorites(prevFavorites => {
        const newFavorites = new Set(prevFavorites);
        if (newFavorites.has(stockId)) {
            newFavorites.delete(stockId);
        } else {
            newFavorites.add(stockId);
        }
        try {
            localStorage.setItem('stock_favorites', JSON.stringify(Array.from(newFavorites)));
        } catch (e) {
            console.error('Failed to save favorites to localStorage', e);
        }
        return newFavorites;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(p => !p);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    try {
        localStorage.setItem('watchlist_data', JSON.stringify(watchlistData));
    } catch (e) {
        console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlistData]);

  const saveLayout = (name: string) => {
      const newLayouts = { ...layouts, [name]: { order: sectionOrder, visibility: sections } };
      setLayouts(newLayouts);
      localStorage.setItem('dashboard_layouts', JSON.stringify(newLayouts));
      setActiveLayoutName(name);
  };

  const loadLayout = (name: string) => {
      if (layouts[name]) {
          setSectionOrder(layouts[name].order);
          setSections(layouts[name].visibility);
          setActiveLayoutName(name);
      }
  };

  const deleteLayout = (name: string) => {
    if (name === t('default_layout')) return; // Cannot delete default
    const newLayouts = { ...layouts };
    delete newLayouts[name];
    setLayouts(newLayouts);
    localStorage.setItem('dashboard_layouts', JSON.stringify(newLayouts));
    if (activeLayoutName === name) {
        loadLayout(t('default_layout'));
    }
  };

  const marketData = useMemo(() => {
    const transformedData: {[key: string]: any[]} = {};
    const allCategories = new Set(Object.keys(watchlistData));
    ['indices', 'stocks', 'digital_currencies', 'futures', 'forex', 'bonds', 'etfs'].forEach(cat => allCategories.add(cat));

    for (const categoryKey of Array.from(allCategories)) {
        const category = watchlistData[categoryKey];
        transformedData[categoryKey] = category ? category.items.map(item => {
            const numericChange = Number(item.change);
            return {
                id: item.key,
                nameKey: item.nameKey,
                value: item.price,
                change: `${numericChange >= 0 ? '+' : ''}${numericChange.toFixed(2)}`,
                currencyKey: (item.currency || 'usd').toLowerCase(),
                iconUrl: item.iconUrl,
            };
        }) : [];
    }
    return transformedData;
  }, [watchlistData]);

  const currentTickerInfo = useMemo(() => {
    return Object.values(marketData).flat().find(item => item.id === activeMarketTicker);
  }, [activeMarketTicker, marketData]);

  const currentChartData = useMemo(() => {
      if (!currentTickerInfo) return null;
      const isStock = activeMarketTab === 'stocks' || activeMarketTab === 'indices';
      return generateChartData(parseFloat(currentTickerInfo.value.replace(/,/g, '')), parseFloat(currentTickerInfo.change), isStock, activeTimeframe);
  }, [currentTickerInfo, activeTimeframe, activeMarketTab]);
  
  useEffect(() => {
    if (mainView === 'prices') {
      document.body.classList.add('prices_page_body');
    } else {
      document.body.classList.remove('prices_page_body');
    }
    // Cleanup function
    return () => {
      document.body.classList.remove('prices_page_body');
    };
  }, [mainView]);

  const handleMarketTabChange = (tabKey: string) => {
    setActiveMarketTab(tabKey);
    const firstTickerId = marketData[tabKey]?.[0]?.id;
    if (firstTickerId) {
        setActiveMarketTicker(firstTickerId);
    }
  };

  const handleMarketTickerChange = (tickerId: string) => {
    setActiveMarketTicker(tickerId);
  };

  const toggleSection = (sectionKey: string) => {
    setSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };
  
  const resetSections = () => {
    setSections(initialSectionsState);
    setSectionOrder(sectionKeys);
  }

  const openAddSectionModal = () => setIsAddSectionModalOpen(true);
  const closeAddSectionModal = () => setIsAddSectionModalOpen(false);

  const openAddSymbolModal = () => setIsAddSymbolModalOpen(true);
  const closeAddSymbolModal = () => setIsAddSymbolModalOpen(false);

  const openWatchlistSettingsModal = () => setIsWatchlistSettingsModalOpen(true);
  const closeWatchlistSettingsModal = () => setIsWatchlistSettingsModalOpen(false);

  const openVerifyAccountModal = () => setIsVerifyAccountModalOpen(true);
  const closeVerifyAccountModal = () => setIsVerifyAccountModalOpen(false);

  const openUserSettingsModal = () => {
    setActivePanel(null); // Close any active side panel
    setIsUserSettingsModalOpen(true);
  };
  const closeUserSettingsModal = useCallback(() => setIsUserSettingsModalOpen(false), []);
  
  const openBillingSettingsModal = useCallback(() => {
    closeUserSettingsModal();
    setIsBillingSettingsModalOpen(true);
  }, [closeUserSettingsModal]);

  const closeBillingSettingsModal = () => setIsBillingSettingsModalOpen(false);

  const openNewsfeedModal = () => setIsNewsfeedModalOpen(true);
  const closeNewsfeedModal = () => setIsNewsfeedModalOpen(false);

  const openBestChartsModal = () => setIsBestChartsModalOpen(true);
  const closeBestChartsModal = () => setIsBestChartsModalOpen(false);

  const openForexMapModal = () => setIsForexMapModalOpen(true);
  const closeForexMapModal = () => setIsForexMapModalOpen(false);
  
  const openTranslateModal = () => setIsTranslateModalOpen(true);
  const closeTranslateModal = () => setIsTranslateModalOpen(false);

  const findSymbolByTicker = (ticker: string): WatchlistItem | undefined => {
      const upperTicker = ticker.toUpperCase();
      return allSymbolsForSearch.find(s => s.symbol.toUpperCase() === upperTicker);
  };

  const addSymbolToWatchlist = (symbolOrTicker: WatchlistItem | string) => {
    const symbolToAdd = typeof symbolOrTicker === 'string' ? findSymbolByTicker(symbolOrTicker) : symbolOrTicker;

    if (!symbolToAdd) {
        const symbolString = typeof symbolOrTicker === 'string' ? symbolOrTicker : symbolOrTicker.symbol;
        console.warn(`Symbol with ticker "${symbolString}" not found.`);
        return t('notifications.symbol_not_found', { symbol: symbolString });
    }

    const categoryKey = getCategoryFromType(symbolToAdd.typeKey);
    
    let alreadyExists = false;
    setWatchlistData(prevData => {
      const category = prevData[categoryKey];
      if (!category) return prevData;

      const isDuplicate = category.items.some(item => item.key === symbolToAdd.key);
      if (isDuplicate) {
          alreadyExists = true;
          return prevData;
      }

      const newCategory = {
        ...category,
        items: [symbolToAdd, ...category.items]
      };

      return {
        ...prevData,
        [categoryKey]: newCategory
      };
    });

    if (alreadyExists) return t('notifications.symbol_already_in_watchlist', { name: t(symbolToAdd.nameKey) });
    
    setDetailedWatchlistData(prevDetails => {
        if(prevDetails[symbolToAdd.key]) return prevDetails;
        
        const isStock = categoryKey === 'stocks';
        const chartData = generateChartData(parseFloat(symbolToAdd.price.replace(/,/g, '')), symbolToAdd.change, isStock);

        return {
            ...prevDetails,
            [symbolToAdd.key]: {
                ...genericDetailsTemplate,
                nameKey: symbolToAdd.nameKey,
                ...chartData,
            }
        };
    });
    return t('notifications.symbol_added_to_watchlist', { name: t(symbolToAdd.nameKey) });
  };

  const getCategoryFromType = (typeKey) => {
    if (!typeKey) return 'stocks';
    if (typeKey.includes('index')) return 'indices';
    if (typeKey.includes('stock')) return 'stocks';
    if (typeKey.includes('forex')) return 'forex';
    if (typeKey.includes('commodity') || typeKey.includes('futures')) return 'futures';
    if (typeKey.includes('crypto')) return 'digital_currencies';
    return 'stocks'; // Default category
  };


  const handleDragStart = (e: React.DragEvent, key: string) => {
    setTimeout(() => {
        setDraggingKey(key);
    }, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
      e.preventDefault();
      if (key === draggingKey || key === dropTarget?.key) {
          return;
      }
      
      const targetElement = e.currentTarget as HTMLDivElement;
      const rect = targetElement.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const newPosition = e.clientY < midpoint ? 'before' : 'after';

      if (dropTarget?.key !== key || dropTarget?.position !== newPosition) {
          setDropTarget({ key, position: newPosition });
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggingKey || !dropTarget) {
          handleDragEnd();
          return;
      }

      const fromKey = draggingKey;
      const toKey = dropTarget.key;
      const position = dropTarget.position;
      
      const currentOrder = [...sectionOrder];
      const fromIndex = currentOrder.indexOf(fromKey);
      
      if (fromIndex === -1) {
          handleDragEnd();
          return;
      }

      const [removed] = currentOrder.splice(fromIndex, 1);
      
      const toIndexOriginal = currentOrder.indexOf(toKey);
      let toIndex = toIndexOriginal;

      if (toIndex === -1) { // Dropping on a placeholder for an item that is no longer there
          handleDragEnd();
          return;
      }
      
      if (position === 'after') {
          toIndex += 1;
      }
      
      currentOrder.splice(toIndex, 0, removed);
      setSectionOrder(currentOrder);
      handleDragEnd();
  };

  const handleDragEnd = () => {
      setDraggingKey(null);
      setDropTarget(null);
  };


  const sectionComponents = {
        personalizedBriefing: isAIEnabled ? <PersonalizedBriefing watchlistData={watchlistData} onDismiss={() => toggleSection('personalizedBriefing')} /> : null,
        marketSummary: <MarketSummary 
            data={marketData} 
            activeTab={activeMarketTab} 
            activeTicker={activeMarketTicker} 
            onTabChange={handleMarketTabChange} 
            onTickerChange={handleMarketTickerChange}
            chartData={currentChartData}
            tickerInfo={currentTickerInfo}
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />,
        communityIdeas: <CommunityIdeas communityIdeasData={publishedCommunityIdeas} onIdeaClick={() => setMainView('trading_analysis')} onTitleClick={() => setMainView('trading_analysis')} />,
        aiSuggestions: isAIEnabled ? <AISuggestions /> : null,
        indicatorsAndStrategies: <IndicatorsAndStrategies indicatorsData={publishedIndicators} onIdeaClick={() => setMainView('indicators_strategies')} onTitleClick={() => setMainView('indicators_strategies')} />,
        saudiStocks: <SaudiStocks />,
        tradingAnalysis: <TradingAnalysis tradingAnalysisData={combinedTradingAnalysis} onIdeaClick={() => setMainView('trading_analysis')} onTitleClick={() => setMainView('trading_analysis')} />,
        topPerformingStocks: <TopPerformingStocks />,
        performanceStocks: <PerformanceStocks />,
        dividendSchedule: <DividendSchedule reminders={reminders} toggleReminder={toggleReminder} />,
        usStockNews: <UsStockNews userNews={publishedUserNews.filter(n => n.section === 'usStockNews')} onNewsClick={() => setMainView('news')} onTitleClick={() => setMainView('news')} />,
        digitalCurrencies: <DigitalCurrencies />,
        digitalCurrencyAnalysis: <DigitalCurrencyAnalysis userAnalyses={publishedUserAnalyses.filter(a => a.section === 'digitalCurrencyAnalysis')} />,
        digitalCurrencyPerformance: <DigitalCurrencyPerformance />,
        digitalCurrencyNews: <DigitalCurrencyNews userNews={publishedUserNews.filter(n => n.section === 'digitalCurrencyNews')} onNewsClick={() => setMainView('news')} onTitleClick={() => setMainView('news')} />,
        futuresAnalysis: <FuturesAnalysis userAnalyses={publishedUserAnalyses.filter(a => a.section === 'futuresAnalysis')} />,
        futuresContracts: <FuturesContracts />,
        futuresNews: <FuturesNews userNews={publishedUserNews.filter(n => n.section === 'futuresNews')} onNewsClick={() => setMainView('news')} onTitleClick={() => setMainView('news')} />,
        forexAnalysis: <ForexAnalysis userAnalyses={publishedUserAnalyses.filter(a => a.section === 'forexAnalysis')} />,
        forexHeatmap: <ForexHeatmap onOpenForexMapModal={openForexMapModal} />,
        forexNews: <ForexNews userNews={publishedUserNews.filter(n => n.section === 'forexNews')} onNewsClick={() => setMainView('news')} onTitleClick={() => setMainView('news')} />,
        inflationMap: <InflationMap />,
    };

  const renderMainContent = () => {
    if (isContentLoading && mainView === 'default') {
        return (
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
            </main>
        );
    }
    switch(mainView) {
      case 'portfolio':
        return <Portfolio />;
      case 'options':
        return <OptionsStrategy />;
      case 'trading_analysis':
        return <TradingAnalysisPage communityIdeas={[...publishedCommunityIdeas, ...combinedTradingAnalysis]} onIdeaClick={(idea) => { setSelectedIdea(idea); setMainView('idea_detail'); }} />;
      case 'indicators_strategies':
        return <IndicatorsAndStrategiesPage indicatorsData={publishedIndicators} onIdeaClick={(idea) => { setSelectedIdea(idea); setMainView('idea_detail'); }} />;
      case 'the_leap':
        return <TheLeapPage />;
      case 'community_power':
        return <CommunityPowerPage />;
      case 'idea_detail':
        return <IdeaDetailPage idea={selectedIdea} allIdeas={[...publishedCommunityIdeas, ...publishedIndicators, ...combinedTradingAnalysis]} onBack={() => { setMainView('default'); setSelectedIdea(null); }} />;
      case 'markets':
        return <MarketsPage />;
      case 'news':
        return <NewsPage />;
      case 'brokers_page':
        return <BrokersPage />;
      case 'awards_page':
        return <AwardsPage />;
      case 'smartverse':
        return <SmartversePage />;
      case 'yield_curves':
        return <YieldCurvesPage />;
      case 'prices':
        return <PricesPage />;
      case 'default':
      default:
        return (
          <>
            <main className="flex-1 p-4 md:p-6 space-y-6 pb-20 lg:pb-6">
                {sectionOrder.map((key) => {
                     if (!sections[key] || !sectionComponents[key]) return null;

                     const isDraggingThis = draggingKey === key;
                     const isDropTargetBefore = dropTarget?.key === key && dropTarget.position === 'before';
                     const isDropTargetAfter = dropTarget?.key === key && dropTarget.position === 'after';

                     return (
                        <React.Fragment key={key}>
                          {isDropTargetBefore && <div className="drop-placeholder" />}
                          <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, key)}
                              onDragOver={(e) => handleDragOver(e, key)}
                              onDrop={handleDrop}
                              onDragEnd={handleDragEnd}
                              className={isDraggingThis ? 'dragging-section' : ''}
                          >
                              <div className="relative group">
                                  <div title={t('drag_to_reorder_tooltip')} className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200/50 dark:bg-gray-900/50 p-1.5 rounded-full cursor-grab active:cursor-grabbing">
                                      <GripVertical size={18} className="text-gray-600 dark:text-gray-400" />
                                  </div>
                                  {sectionComponents[key]}
                              </div>
                          </div>
                          {isDropTargetAfter && <div className="drop-placeholder" />}
                        </React.Fragment>
                     );
                })}
            </main>
          </>
        );
    }
  };

  const isAnyPanelOpen = activePanel !== null;
  
  if (mainView === 'bybit') {
    return <BybitPage setMainView={setMainView} />;
  }
  
  if (mainView === 'prices') {
      return <PricesPage />;
  }

  return (
    <>
    <div style={{ '--panel-width': `${panelWidth}px` } as React.CSSProperties} className={`text-gray-900 dark:text-gray-300 font-sans flex flex-col lg:flex-row h-screen overflow-hidden ${language === 'en' ? 'lg:flex-row-reverse' : ''}`}>
      <RightToolbar 
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        onOpenTranslateModal={openTranslateModal}
        onOpenI18nInspector={() => setIsI18nInspectorOpen(true)}
      />
      <WatchlistPanel 
        isOpen={activePanel === 'watchlist'} 
        onAddSectionClick={openAddSectionModal}
        onAddSymbolClick={openAddSymbolModal}
        watchlistData={watchlistData}
        detailedWatchlistData={detailedWatchlistData}
        updatedSymbols={updatedSymbols}
      />
      <ChatPanel isOpen={activePanel === 'chat'} />
      <ActivityPanel
          isOpen={activePanel === 'activity'}
          onClose={() => setActivePanel(null)}
        />
      <SocialCommunicationModal
          isOpen={activePanel === 'social'}
          onClose={() => setActivePanel(null)}
        />
      <NotificationsPanel
          isOpen={activePanel === 'alerts'}
          onClose={() => setActivePanel(null)}
          onOpenSettings={openUserSettingsModal}
        />
      <HelpCenterPanel
        isOpen={activePanel === 'help'}
        onClose={() => setActivePanel(null)}
      />

      {isAnyPanelOpen && (
        <div
            onMouseDown={handleMouseDownOnResizer}
            className="watchlist-resizer"
            title={t('tooltip_resize')}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar`}>
        <div className="flex flex-col min-h-full">
            <TopHeader 
              setActivePanel={setActivePanel} 
              onOpenNewsfeed={openNewsfeedModal} 
              setMainView={setMainView} 
// FIX: Corrected function name 'onOpenBestChartsModal' to 'openBestChartsModal' to resolve reference error.
              onOpenBestCharts={openBestChartsModal} 
              onOpenUserSettings={openUserSettingsModal}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              layouts={layouts}
              activeLayoutName={activeLayoutName}
              onSaveLayout={saveLayout}
              onLoadLayout={loadLayout}
              onDeleteLayout={deleteLayout}
            />
            <CryptoTickerTape />
            <div key={mainView} className="flex-grow flex flex-col">
                {renderMainContent()}
            </div>
            <Footer />
        </div>
      </div>
      <EconomicCalendarModal
        isOpen={activePanel === 'calendar'}
        onClose={() => setActivePanel(null)}
        reminders={reminders}
        toggleReminder={toggleReminder}
      />
      <MobileToolbar activePanel={activePanel} setActivePanel={setActivePanel} onOpenTranslateModal={openTranslateModal} onOpenI18nInspector={() => setIsI18nInspectorOpen(true)} />
    </div>
    <AddSectionModal 
        isOpen={isAddSectionModalOpen}
        onClose={closeAddSectionModal}
        sections={sections}
        toggleSection={toggleSection}
        resetSections={resetSections}
      />
    <AddSymbolModal 
        isOpen={isAddSymbolModalOpen}
        onClose={closeAddSymbolModal}
        onAddSymbol={addSymbolToWatchlist}
        watchlistData={watchlistData}
    />
    <VerifyAccountModal
        isOpen={isVerifyAccountModalOpen}
        onClose={closeVerifyAccountModal}
    />
    <StockScreener
        isOpen={activePanel === 'screener'}
        onClose={() => setActivePanel(null)}
    />
    <NewsfeedModal
        isOpen={isNewsfeedModalOpen}
        onClose={closeNewsfeedModal}
    />
    <UserSettingsModal
        isOpen={isUserSettingsModalOpen}
        onClose={closeUserSettingsModal}
        onOpenBillingSettings={openBillingSettingsModal}
        onSaveIdea={saveIdea}
        communityIdeas={communityIdeas}
        indicatorsAndStrategies={indicatorsAndStrategiesData}
        tradingAnalysis={tradingAnalysisData}
        onDeleteIdea={deleteIdea}
        userNews={userNews}
        onSaveNews={saveNews}
        onDeleteNews={deleteNews}
        watchlistData={watchlistData}
        userAnalyses={userAnalyses}
        onSaveAnalysis={saveAnalysis}
        onDeleteAnalysis={deleteAnalysis}
    />
    <BillingSettingsModal
        isOpen={isBillingSettingsModalOpen}
        onClose={closeBillingSettingsModal}
    />
    <BestChartsModal
        isOpen={isBestChartsModalOpen}
        onClose={closeBestChartsModal}
    />
    <ForexHeatmapModal
        isOpen={isForexMapModalOpen}
        onClose={closeForexMapModal}
    />
    {isAIEnabled && <AssistantFAB onOpen={() => setIsAssistantModalOpen(true)} />}
    {isAIEnabled && <AssistantModal 
        isOpen={isAssistantModalOpen} 
        onClose={() => setIsAssistantModalOpen(false)}
        addSymbolToWatchlist={addSymbolToWatchlist}
        navigateTo={setMainView}
    />}
    <TranslateModal isOpen={isTranslateModalOpen} onClose={closeTranslateModal} />
    <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setMainView={setMainView}
        setTheme={setTheme}
        addSymbolToWatchlist={addSymbolToWatchlist}
        allSymbols={allSymbolsForSearch}
    />
    <MissingTranslationsModal />
    <QuotaErrorModal />
    <DeveloperI18nInspector isOpen={isI18nInspectorOpen} onClose={() => setIsI18nInspectorOpen(false)} />
    </>
  );
}