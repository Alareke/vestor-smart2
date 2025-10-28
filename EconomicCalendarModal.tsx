/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Calendar, BarChart2, List, Clock, Globe, Crown, ChevronDown, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { InteractiveChart } from './InteractiveChart';

// --- DATA & TYPES ---

interface EconomicEvent {
    id: string;
    time: string;
    nameKey: string;
    country: string;
    impact: number;
    prev: string;
    forecast: string;
    actual: string;
    descriptionKey?: string;
    sourceKey?: string;
    sourceLink?: string;
    history?: { month: string, value: number }[];
    isSpecial?: boolean;
    category: 'economic' | 'dividends' | 'earnings';
}

interface DayEvents {
    dayKey: string;
    date: number;
    events: EconomicEvent[];
    eventCounts: { economic: number; dividends: number; earnings: number; };
}

// --- DYNAMIC DATA GENERATION ---

const eventNames = {
  economic: ['event_hcob_pmi', 'event_industrial_production_mom', 'event_retail_sales_mom', 'event_bill_auction_12', 'event_aig_construction_index', 'event_sp_global_composite_pmi'],
  dividends: ['dividend_stc', 'dividend_aramco', 'dividend_alrajhi', 'dividend_msft', 'dividend_aapl'],
  earnings: ['earnings_aapl', 'earnings_msft', 'earnings_nvda', 'earnings_googl', 'earnings_tsla']
};

const countries = ['us', 'de', 'sa', 'cn', 'jp', 'gb', 'fr', 'ca', 'au', 'eu'];

const generateRandomEvent = (category: 'economic' | 'dividends' | 'earnings', time: string, isPast: boolean): EconomicEvent => {
  const nameKey = eventNames[category][Math.floor(Math.random() * eventNames[category].length)];
  const country = countries[Math.floor(Math.random() * countries.length)];
  const impact = Math.floor(Math.random() * 3) + 1;
  const prev = (Math.random() * 10 - 2).toFixed(1) + '%';
  const forecast = (Math.random() * 10 - 2).toFixed(1) + '%';
  const actual = isPast ? (Math.random() * 10 - 2).toFixed(1) + '%' : '...';
  
  const history = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i],
      value: Math.random() * 15 - 5
  }));

  return {
    id: `${country}-${nameKey}-${category}-${Math.random()}`,
    time,
    country,
    nameKey,
    impact,
    prev,
    forecast,
    actual,
    category,
    history,
    descriptionKey: 'event_aig_construction_desc',
    sourceKey: 'source_aig',
    sourceLink: '#',
  };
};

const generateDynamicCalendarData = (t: (key: string) => string): DayEvents[] => {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday
  const currentHour = now.getHours();
  
  const daysOfWeekKeys = ['day_sunday', 'day_monday', 'day_tuesday', 'day_wednesday', 'day_thursday', 'day_friday', 'day_saturday'];

  const weekData: DayEvents[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() - currentDayOfWeek + i);
    
    const dayKey = daysOfWeekKeys[dayDate.getDay()];
    const events: EconomicEvent[] = [];

    if (dayDate.toDateString() === now.toDateString()) {
      // It's today, generate a rich list of events
      for (let hour = 8; hour < 23; hour++) {
        for (let minutePart = 0; minutePart < 2; minutePart++) {
            if (Math.random() > 0.4) {
                const minute = minutePart === 0 ? '00' : '30';
                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                const isPast = hour < currentHour;
                const categoryPool: ('economic' | 'dividends' | 'earnings')[] = ['economic', 'economic', 'economic', 'dividends', 'earnings'];
                const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
                events.push(generateRandomEvent(category, time, isPast));
            }
        }
      }
    } else {
      // Other days, generate a smaller list
       for (let j = 0; j < Math.floor(Math.random() * 8) + 5; j++) {
           const hour = Math.floor(Math.random() * 15) + 8;
           const minute = Math.random() > 0.5 ? '00' : '30';
           const time = `${hour.toString().padStart(2, '0')}:${minute}`;
           const categoryPool: ('economic' | 'dividends' | 'earnings')[] = ['economic', 'dividends', 'earnings'];
           const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
           events.push(generateRandomEvent(category, time, dayDate < now));
       }
    }

    events.sort((a, b) => a.time.localeCompare(b.time));
    
    const eventCounts = {
        economic: events.filter(e => e.category === 'economic').length,
        dividends: events.filter(e => e.category === 'dividends').length,
        earnings: events.filter(e => e.category === 'earnings').length,
    };

    weekData.push({
      dayKey,
      date: dayDate.getDate(),
      events,
      eventCounts,
    });
  }

  return weekData;
};


const VolatilityIcon = ({ level }: { level: number }) => (
    <div className="flex items-center gap-0.5 h-3">
        {[1, 2, 3].map(i => (
            <div key={i} className={`w-1 rounded-sm ${i <= level ? '#F97316' : '#4B5563'}`} style={{ height: `${4 + i * 2.5}px`, backgroundColor: i <= level ? '#F97316' : '#4B5563' }} />
        ))}
    </div>
);

const CountryFlag = ({ countryCode }: { countryCode: string }) => (
    <img src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`} alt={`${countryCode} flag`} className="w-5 h-5 rounded-full object-cover" />
);

export const EconomicCalendarModal = ({ isOpen, onClose, reminders, toggleReminder }: { isOpen: boolean; onClose: () => void; reminders: Set<string>; toggleReminder: (eventId: string) => void; }) => {
    const { t, language } = useLanguage();
    
    const calendarData = useMemo(() => generateDynamicCalendarData(t), [t]);
    const currentDayDate = useMemo(() => new Date().getDate(), []);

    const [selectedDay, setSelectedDay] = useState(currentDayDate);
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('economic');

    const dayData = useMemo(() => calendarData.find(d => d.date === selectedDay), [selectedDay, calendarData]);
    
    const filteredEvents = useMemo(() => {
        if (!dayData) return [];
        if (activeCategory === 'all_categories') return dayData.events;
        if (activeCategory === 'profits' || activeCategory === 'revenues') {
            return dayData.events.filter(e => e.category === 'earnings');
        }
        return dayData.events.filter(e => e.category === activeCategory);
    }, [dayData, activeCategory]);

    const animationClass = `animate-slide-in-up-full lg:animate-none ${language === 'ar' ? 'lg:animate-slide-in-left' : 'lg:animate-slide-in-right'}`;

    if (!isOpen) return null;

    return (
      <aside className={`fixed inset-x-0 bottom-0 top-14 lg:top-0 lg:relative lg:inset-auto w-full lg:w-[900px] bg-white dark:bg-black text-gray-900 dark:text-white flex-shrink-0 border-l border-gray-200 dark:border-gray-900 flex flex-col h-full lg:h-screen lg:sticky lg:top-0 z-40 ${animationClass}`}>
        {/* Header */}
        <header className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={20} className="text-gray-600 dark:text-gray-400" /></button>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('brand_name')}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    <span>(UTC+3) 14:15</span>
                </div>
                <button className="p-1 text-gray-500 dark:text-gray-400" title={t('tooltip_g20_filter')}><Globe size={20} /></button>
                <button className="p-1 text-gray-500 dark:text-gray-400" title={t('tooltip_crown_filter')}><Crown size={20} /></button>
            </div>
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('economic_calendar_title')}</h2>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400"><ChevronLeft size={20} /></button>
                    <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{t('calendar_date_range')}</span>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400"><ChevronRight size={20} /></button>
                </div>
                 <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{t('calendar_today')}</span>
                </button>
            </div>
        </header>

        {/* Day Scroller */}
        <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 flex gap-3 overflow-x-auto no-scrollbar">
            {calendarData.map(day => (
                <button key={day.date} onClick={() => { setSelectedDay(day.date); setExpandedEventId(null); }} className={`flex-shrink-0 w-40 p-3 rounded-xl transition-colors relative ${selectedDay === day.date ? 'bg-gray-100 dark:bg-[#2A2E39]' : 'bg-gray-50 dark:bg-[#131722] hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{t(day.dayKey)}</span>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{day.date}</span>
                    </div>
                    {day.date === currentDayDate && <div className="text-xs text-cyan-500 dark:text-cyan-400 font-bold mb-1 text-left">{t('calendar_today')}</div>}
                    <div className="text-right space-y-1 text-xs rtl:text-left">
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('calendar_economic')}</span> <span className="font-mono text-gray-900 dark:text-white">{day.eventCounts.economic}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('calendar_dividends')}</span> <span className="font-mono text-gray-900 dark:text-white">{day.eventCounts.dividends}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('calendar_earnings')}</span> <span className="font-mono text-gray-900 dark:text-white">{day.eventCounts.earnings}</span></div>
                    </div>
                    {selectedDay === day.date && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 dark:bg-white rounded-t-full"></div>}
                </button>
            ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">{t('calendar_all_categories')} <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" /></button>
                    <div className="w-px h-6 bg-gray-200 dark:border-gray-700"></div>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"><List size={20} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"><BarChart2 size={20} /></button>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#131722] p-1 rounded-full">
                    <button onClick={() => setActiveCategory('profits')} className={`px-4 py-1 rounded-full text-sm ${activeCategory === 'profits' ? 'bg-gray-200 dark:bg-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>{t('calendar_profits')}</button>
                    <button onClick={() => setActiveCategory('revenues')} className={`px-4 py-1 rounded-full text-sm ${activeCategory === 'revenues' ? 'bg-gray-200 dark:bg-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>{t('calendar_revenues')}</button>
                    <button onClick={() => setActiveCategory('dividends')} className={`px-4 py-1 rounded-full text-sm ${activeCategory === 'dividends' ? 'bg-gray-200 dark:bg-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>{t('calendar_dividends')}</button>
                    <button onClick={() => setActiveCategory('economic')} className={`px-4 py-1 rounded-full text-sm ${activeCategory === 'economic' ? 'bg-gray-900 text-white dark:bg-white dark:text-black font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>{t('calendar_economic')}</button>
                </div>
            </div>

            {/* Event Table */}
            <div className="p-3">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="text-gray-500 dark:text-gray-500 text-xs">
                            <th className="font-normal pb-2 text-right w-1/2 rtl:text-right">{/* Event Name */}</th>
                            <th className="font-normal pb-2 text-center">{t('economic_card_forecast')}</th>
                            <th className="font-normal pb-2 text-center">{t('economic_card_actual')}</th>
                            <th className="font-normal pb-2 text-center">{t('economic_card_previous')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={4} className="py-2">
                                <div className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#131722] p-2 rounded-md text-center">{dayData ? `${t(dayData.dayKey)}, ${dayData.date} أغسطس` : ''}</div>
                            </td>
                        </tr>
                        {filteredEvents.map((event) => (
                          <React.Fragment key={event.id}>
                            <tr
                                onClick={() => setExpandedEventId(prev => prev === event.id ? null : event.id)}
                                className={`cursor-pointer transition-colors ${expandedEventId === event.id ? 'bg-gray-100 dark:bg-[#1C2331]' : 'hover:bg-gray-50 dark:hover:bg-[#131722]'}`}
                            >
                                <td className="p-3 border-b border-gray-200 dark:border-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleReminder(event.id);
                                                }}
                                                className={`p-1.5 rounded-full transition-colors ${reminders.has(event.id) ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                title={reminders.has(event.id) ? t('remove_reminder_tooltip') : t('add_reminder_tooltip')}
                                            >
                                                <Bell size={16} fill={reminders.has(event.id) ? 'currentColor' : 'none'} />
                                            </button>
                                            <div className={`p-1.5 rounded-md ${event.isSpecial ? 'bg-red-100 dark:bg-red-600 text-red-800 dark:text-white' : 'text-gray-800 dark:text-white'}`}>{event.time}</div>
                                            <CountryFlag countryCode={event.country} />
                                            <span className="text-gray-500 dark:text-gray-400">{t(`country_${event.country}`)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-1 min-w-0 pl-4 rtl:pr-4">
                                            <span className="text-gray-900 dark:text-white truncate">{t(event.nameKey)}</span>
                                            <VolatilityIcon level={event.impact} />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 border-b border-gray-200 dark:border-gray-800/50 text-center font-mono">{event.forecast}</td>
                                <td className="p-3 border-b border-gray-200 dark:border-gray-800/50 text-center font-mono">{event.actual}</td>
                                <td className="p-3 border-b border-gray-200 dark:border-gray-800/50 text-center font-mono">{event.prev}</td>
                            </tr>
                            {expandedEventId === event.id && (
                                <tr className="bg-gray-50 dark:bg-[#1C2331] animate-fadeIn">
                                    <td colSpan={4} className="p-4 border-b-2 border-blue-500">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex flex-col sm:flex-row gap-6">
                                            <div className="w-full sm:w-1/2 space-y-4">
                                                {event.descriptionKey && <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">{t(event.descriptionKey)}</p>}
                                                {event.sourceKey && <a href={event.sourceLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm hover:underline">
                                                    {t(event.sourceKey)} <Globe size={14} />
                                                </a>}
                                                {event.history ? (
                                                    <div className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg">
                                                        <InteractiveChart
                                                            data={event.history}
                                                            series={[{ key: 'value', type: 'bar', color: '#3b82f6' }]}
                                                            xKey="month"
                                                            height={120}
                                                            margin={{ top: 15, right: 10, bottom: 20, left: 35 }}
                                                            yFormatLeft={(d) => d.toFixed(1)}
                                                            tooltipFormatter={(d) => `<div><strong>${d.month}</strong>: ${d.value}</div>`}
                                                        />
                                                    </div>
                                                ) : <div className="text-center text-gray-500 py-10">No chart data available.</div>}
                                            </div>
                                            <div className="w-full sm:w-1/2 space-y-4">
                                                <button className="w-full text-center py-2 bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                                                    {t('event_detail_add_to_calendar')}
                                                </button>
                                                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                    <div className="absolute h-full bg-blue-500 rounded-full" style={{width: '35%'}}></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                    <span>-16.00</span>
                                                    <span>0.00</span>
                                                    <span>-8.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                          </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </aside>
    );
};