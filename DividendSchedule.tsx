/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SymbolIcon } from './SymbolIcon';

const DividendCard = (props: any) => {
    const { event, reminders, toggleReminder } = props;
    const { t } = useLanguage();
    const isReminderSet = reminders.has(event.id.toString());
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg w-72 md:w-80 flex-shrink-0 p-4 border border-gray-200 dark:border-gray-800/80 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 dark:text-gray-400 text-sm">{t(event.dateLabelKey)}</span>
                <div className="text-right rtl:text-left">
                    <div className="flex items-center gap-2 justify-end rtl:justify-start">
                         <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">{event.code}</span>
                         <SymbolIcon symbol={event.code} size={32} />
                    </div>
                    <h4 className="text-gray-900 dark:text-white font-semibold mt-1">{t(event.nameKey)}</h4>
                </div>
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="text-left rtl:text-right">
                    <span className="text-gray-500 text-xs">{t('dividend_expected')}</span>
                    <p className="text-gray-900 dark:text-white font-semibold mt-1">{event.expectedValue}</p>
                </div>
                 <div className="flex items-end gap-2">
                    <div className="text-right rtl:text-left">
                        <span className="text-gray-500 text-xs">{t('dividend_actual')}</span>
                        <p className="text-gray-900 dark:text-white font-semibold mt-1">{event.actualValue}</p>
                    </div>
                    <button
                        onClick={() => toggleReminder(event.id.toString())}
                        title={isReminderSet ? t('reminder_set_tooltip') : t('set_reminder_tooltip')}
                        className={`p-2 rounded-full transition-colors ${isReminderSet ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Bell size={18} fill={isReminderSet ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>
        </div>
    );
};


export const DividendSchedule = ({ reminders, toggleReminder }: { reminders: Set<string>; toggleReminder: (eventId: string) => void; }) => {
    const { t, language } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const dividendData = [
        { id: 1, code: 'JPM', nameKey: 'screener_stock_name_jpm', logo: 'https://s3-symbol-logo.tradingview.com/jpmorgan-chase.svg', dateLabelKey: 'date_tomorrow', expectedValue: `1.15 ${t('currency_usd')}`, actualValue: '—' },
        { id: 2, code: '1111', nameKey: 'stock_majmoaat_tadawul', logo: 'https://s3-symbol-logo.tradingview.com/saudi-tadawul-group.svg', dateLabelKey: 'date_tomorrow', expectedValue: `0.93 ${t('stock1_currency')}`, actualValue: '—' },
        { id: 3, code: 'KO', nameKey: 'screener_stock_name_ko', logo: 'https://s3-symbol-logo.tradingview.com/the-coca-cola-company.svg', dateLabelKey: 'date_tomorrow', expectedValue: `0.485 ${t('currency_usd')}`, actualValue: '—' },
        { id: 4, code: '3020', nameKey: 'stock_asment_alyamama', logo: 'https://s3-symbol-logo.tradingview.com/yamama-cement.svg', dateLabelKey: 'date_tomorrow', expectedValue: `0.82 ${t('stock1_currency')}`, actualValue: '—' },
        { id: 5, code: 'PG', nameKey: 'screener_stock_name_pg', logo: 'https://s3-symbol-logo.tradingview.com/procter-and-gamble.svg', dateLabelKey: 'date_tomorrow', expectedValue: `1.00 ${t('currency_usd')}`, actualValue: '—' },
    ];

    const handleScroll = (direction: 'backward' | 'forward') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320 + 24; // card width (w-80) + gap (gap-6)
            const scrollValue = direction === 'backward' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' });
        }
    };

    return (
        <section>
            <div className="flex flex-wrap gap-y-2 justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dividend_schedule_title')} {language === 'ar' ? '<' : '>'}</h2>
                 <a href="#" className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline">
                    {t('dividend_view_all')} {language === 'ar' ? '<' : '>'}
                </a>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => handleScroll('backward')} title={t('scroll_left_tooltip')} className="p-3 bg-white dark:bg-black rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}</button>
                <div ref={scrollContainerRef} className="flex-1 flex gap-6 overflow-x-auto no-scrollbar pb-2">
                    {dividendData.map((event) => <DividendCard key={event.id} event={event} reminders={reminders} toggleReminder={toggleReminder} />)}
                </div>
                <button onClick={() => handleScroll('forward')} title={t('scroll_right_tooltip')} className="p-3 bg-white dark:bg-black rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white self-center hidden md:block shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">{language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}</button>
            </div>
        </section>
    );
};