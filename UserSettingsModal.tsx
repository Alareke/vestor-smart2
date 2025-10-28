/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Settings, Tv2, Plus, Check, Sun, Moon, Monitor, UploadCloud, Edit, Trash2, Clock, Newspaper, BookOpen, User, Users, LineChart, Code } from 'lucide-react';
import { useTheme, type Theme } from '../i18n/ThemeContext';
import { useAI } from '../i18n/AIContext';
import type { WatchlistData } from '../data/watchlistData';
import { SymbolIcon } from './SymbolIcon';


const Stat = ({ value, label }) => (
    <div className="text-center">
        <p className="font-bold text-gray-900 dark:text-white text-lg">{value}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
    </div>
);

const NavTab = (props: any) => {
    const { isActive, onClick, children } = props;
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-md text-sm font-semibold flex items-center gap-3 transition-colors ${isActive ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
        >
            {children}
        </button>
    );
};

const SubNavTab = (props: any) => {
    const { label, isActive, onClick } = props;
    return (
        <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${isActive ? 'border-gray-800 dark:border-gray-200 text-gray-800 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
            {label}
        </button>
    );
};

const FormRow = ({ label, children, note = null }: { label: any, children?: React.ReactNode, note?: any }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
        <label className="sm:w-1/3 text-gray-600 dark:text-gray-400 text-sm sm:text-right flex-shrink-0 pt-2">{label}</label>
        <div className="sm:w-2/3">
            {children}
            {note && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{note}</p>}
        </div>
    </div>
);

const TextInput = ({ value = "", name, onChange, type = 'text', placeholder = '' }) => (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white" />
);

const SaveButton = ({ label, onClick, status, t }) => (
    <div className="flex items-center gap-4">
        {status === 'saving' && <span className="text-gray-500 dark:text-gray-400 text-xs animate-pulse">{t('settings_save_status_saving')}</span>}
        {status === 'saved' && <span className="text-green-500 dark:text-green-400 text-xs flex items-center gap-1"><Check size={16}/> {t('settings_save_status_saved')}</span>}
        <button onClick={onClick} disabled={status !== 'idle'} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {label}
        </button>
    </div>
);

interface PublishFormProps {
    t: (key: string, replacements?: Record<string, string | number>) => any;
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: any | null;
    // FIX: Added 'analysis' to formType to handle all creation types.
    formType: 'idea' | 'news' | 'analysis';
    watchlistData: WatchlistData;
}

const PublishForm = ({ t, onSave, onCancel, initialData = null, formType, watchlistData }: PublishFormProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [mediaPreview, setMediaPreview] = useState(initialData?.img || null);
    const [mediaType, setMediaType] = useState(initialData?.mediaType || 'image');
    const [tags, setTags] = useState(initialData?.tags?.map(tagKey => typeof tagKey === 'string' && tagKey.startsWith('tag_') ? t(tagKey) : tagKey).join(', ') || '');
    const [fileUploaded, setFileUploaded] = useState(false);
    const fileInputRef = useRef(null);

    // Idea specific
    const [ideaSection, setIdeaSection] = useState(initialData?.section || 'communityIdeas');

    // News specific
    const [newsSection, setNewsSection] = useState(initialData?.section || 'usStockNews');
    const [newsCountry, setNewsCountry] = useState(initialData?.country || 'us');
    const [newsIcon, setNewsIcon] = useState(initialData?.icon || 'BTC');
    
    // FIX: Added state for analysis section.
    const [analysisSection, setAnalysisSection] = useState(initialData?.section || 'tradingAnalysis');

    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    const isEditing = !!initialData;
    
    useEffect(() => {
        if(isEditing && initialData.status === 'scheduled' && initialData.publishAt) {
            const d = new Date(initialData.publishAt);
            const datePart = d.toISOString().split('T')[0];
            const timePart = d.toTimeString().split(' ')[0].substring(0, 5);
            setScheduleDate(datePart);
            setScheduleTime(timePart);
        }
    }, [initialData, isEditing]);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileUploaded(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        }
    };

    const handleSave = (status: 'draft' | 'scheduled' | 'published') => {
        if (!title || !description) {
            alert(t('please_fill_all_fields_alert'));
            return;
        }

        let publishAt = null;
        if (status === 'scheduled') {
            if (!scheduleDate || !scheduleTime) {
                alert(t('please_set_schedule_datetime_alert'));
                setIsScheduling(true);
                return;
            }
            publishAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
        }

        const commonData = {
            title, description, img: mediaPreview, mediaType,
            videoUrl: fileUploaded ? '' : (initialData?.videoUrl || ''),
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            status, publishAt,
        };

        // FIX: Added logic to handle saving analysis data.
        const finalData = formType === 'idea'
            ? { ...commonData, section: ideaSection }
            : formType === 'news'
                ? { ...commonData, section: newsSection, country: newsCountry, icon: newsIcon }
                : { ...commonData, section: analysisSection };
        
        onSave(isEditing ? { ...initialData, ...finalData } : finalData);
    };

    const cryptoSymbols = watchlistData?.digital_currencies?.items.map(item => item.symbol.replace(/USD|USDT/, '')) || ['BTC', 'ETH', 'SOL'];
    const uniqueCryptoSymbols = [...new Set(cryptoSymbols)];
    const countryOptions = [
        { key: 'us', nameKey: 'country_usa' }, { key: 'ca', nameKey: 'country_canada' },
        { key: 'gb', nameKey: 'country_uk' }, { key: 'de', nameKey: 'country_germany' },
        { key: 'fr', nameKey: 'country_france' }, { key: 'sa', nameKey: 'country_saudi' },
        { key: 'in', nameKey: 'country_india' }, { key: 'jp', nameKey: 'country_japan' },
        { key: 'cn', nameKey: 'country_china' }, { key: 'hk', nameKey: 'country_hk' },
        { key: 'au', nameKey: 'country_australia' },
    ];

    return (
        <form className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {isEditing ? t(formType === 'idea' ? 'edit_idea_title' : (formType === 'news' ? 'edit_news_title' : 'edit_analysis_title')) : t(formType === 'idea' ? 'publish_new_idea_title' : (formType === 'news' ? 'publish_new_news_title' : 'publish_new_analysis_title'))}
                </h3>
                 {!isEditing && <p className="text-sm text-gray-500 dark:text-gray-400">{t(formType === 'idea' ? 'publish_new_idea_desc' : (formType === 'news' ? 'publish_new_news_desc' : 'publish_new_analysis_desc'))}</p>}
            </div>
            
            <input type="file" accept="image/*,video/*" onChange={handleMediaChange} ref={fileInputRef} className="hidden" />

            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors relative group hover:border-cyan-500 dark:hover:border-cyan-400">
                {mediaPreview ? (
                    <>
                        {mediaType === 'video' ? ( <video src={mediaPreview as string} className="w-full h-full object-contain rounded-lg bg-black" controls /> ) : ( <img src={mediaPreview as string} alt="Preview" className="w-full h-full object-contain rounded-lg" /> )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 backdrop-blur-sm">{t('change_media_button')}</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setMediaPreview(null); setMediaType('image'); setFileUploaded(false); if (fileInputRef.current) { fileInputRef.current.value = ''; } }} className="bg-red-500/50 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500/70 backdrop-blur-sm">{t('remove_media_button')}</button>
                        </div>
                    </>
                ) : (
                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                         <div className="text-center text-gray-500">
                            <UploadCloud size={32} className="mx-auto" />
                            <p className="mt-2 font-semibold">{t('upload_media_cta')}</p>
                            <p className="text-xs">{t('upload_media_note')}</p>
                        </div>
                    </button>
                )}
            </div>
            
            {/* FIX: Added form elements for analysis creation/editing. */}
            {formType === 'idea' ? (
                <FormRow label={t('idea_form_publish_to_label')}>
                    <select name="section" value={ideaSection} onChange={(e) => setIdeaSection(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white">
                        <option value="communityIdeas">{t('section_community_ideas')}</option>
                        <option value="indicatorsAndStrategies">{t('section_indicators_and_strategies')}</option>
                        <option value="tradingAnalysis">{t('section_trading_analysis')}</option>
                    </select>
                </FormRow>
            ) : formType === 'news' ? (
                <>
                    <FormRow label={t('news_form_news_type_label')}>
                         <select name="section" value={newsSection} onChange={(e) => setNewsSection(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white">
                            <option value="usStockNews">{t('news_type_stocks')}</option>
                            <option value="digitalCurrencyNews">{t('news_type_digital_currencies')}</option>
                            <option value="forexNews">{t('news_type_forex')}</option>
                             <option value="futuresNews">{t('news_type_futures')}</option>
                        </select>
                    </FormRow>
                    {newsSection === 'usStockNews' && (
                        <FormRow label={t('news_form_country_label')}>
                             <select name="country" value={newsCountry} onChange={(e) => setNewsCountry(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white">
                                {countryOptions.map(opt => <option key={opt.key} value={opt.key}>{t(opt.nameKey)}</option>)}
                            </select>
                        </FormRow>
                    )}
                    {newsSection === 'digitalCurrencyNews' && (
                        <FormRow label={t('news_form_icon_label')}>
                             <select name="icon" value={newsIcon} onChange={(e) => setNewsIcon(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white">
                                {uniqueCryptoSymbols.map(symbol => <option key={symbol} value={symbol}>{symbol}</option>)}
                            </select>
                        </FormRow>
                    )}
                </>
            ) : (
                <FormRow label={t('analysis_form_publish_to_label')}>
                    <select name="section" value={analysisSection} onChange={(e) => setAnalysisSection(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white">
                        <option value="tradingAnalysis">{t('section_trading_analysis')}</option>
                        <option value="digitalCurrencyAnalysis">{t('analysis_section_digital_currency')}</option>
                        <option value="forexAnalysis">{t('analysis_section_forex')}</option>
                        <option value="futuresAnalysis">{t('analysis_section_futures')}</option>
                    </select>
                </FormRow>
            )}

            <FormRow label={t('idea_form_title_label')}><TextInput name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('idea_form_title_placeholder')} /></FormRow>
            <FormRow label={t('idea_form_desc_label')}><textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white" placeholder={t('idea_form_desc_placeholder')}/></FormRow>
            <FormRow label={t('idea_form_tags_label')}><TextInput name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('idea_form_tags_placeholder')} /></FormRow>
            
            {isScheduling && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4 animate-fadeIn">
                     <h4 className="font-semibold text-gray-900 dark:text-white">{t('idea_form_scheduled_datetime')}</h4>
                     <div className="flex flex-col sm:flex-row gap-4"><input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white" /><input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white" /></div>
                     <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsScheduling(false)} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('idea_form_cancel_schedule')}</button><button type="button" onClick={() => handleSave('scheduled')} className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">{t('idea_form_confirm_schedule')}</button></div>
                </div>
            )}

            {!isScheduling && (
                <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 flex-wrap">
                    <button type="button" onClick={onCancel} className="text-gray-600 dark:text-gray-400 font-bold py-2 px-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{t('cancel_button')}</button>
                    <button type="button" onClick={() => handleSave('draft')} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('idea_form_save_draft')}</button>
                    <div className="flex rounded-md shadow-sm">
                        <button type="button" onClick={() => handleSave('published')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-l-md hover:bg-blue-700 transition-colors border-r border-blue-500">{isEditing ? t('update_button') : t('idea_form_publish_now')}</button>
                        <button type="button" onClick={() => setIsScheduling(true)} className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 transition-colors"><Clock size={20} /></button>
                    </div>
                </div>
            )}
        </form>
    );
};

const ToggleSwitch = ({ id, checked, onChange }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
);


interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenBillingSettings: () => void;
    onSaveIdea: (idea: any) => void;
    communityIdeas: any[];
    indicatorsAndStrategies: any[];
    tradingAnalysis: any[];
    onDeleteIdea: (id: any, section: string) => void;
    userNews: any[];
    onSaveNews: (newsData: any) => void;
    onDeleteNews: (newsId: any) => void;
    watchlistData: WatchlistData;
    // FIX: Add missing props to the interface to resolve the TypeScript error.
    userAnalyses: any[];
    onSaveAnalysis: (analysisData: any) => void;
    onDeleteAnalysis: (analysisId: any) => void;
}

export const UserSettingsModal = ({
    isOpen, onClose, onOpenBillingSettings, onSaveIdea, communityIdeas,
    indicatorsAndStrategies, tradingAnalysis, onDeleteIdea, userNews,
    onSaveNews, onDeleteNews, watchlistData,
    // FIX: Destructure the newly added props.
    userAnalyses, onSaveAnalysis, onDeleteAnalysis
}: UserSettingsModalProps) => {
    const { t, language } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { isAIEnabled, toggleAIEnabled } = useAI();
    const [mainTab, setMainTab] = useState<'analysis' | 'ideas' | 'news' | 'scripts' | 'followers' | 'following' | 'settings'>('settings');
    const [subNavTab, setSubNavTab] = useState('profile');
    const [isConfirmDisableAIOpen, setIsConfirmDisableAIOpen] = useState(false);
    const modalRef = useRef(null);

    // --- IDEAS/NEWS STATE ---
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingItem, setEditingItem] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // FIX: Declare formType to handle different content creation forms.
    const [formType, setFormType] = useState<'idea' | 'news' | 'analysis' | null>('idea');

    const showSuccessToast = (messageKey) => {
        setToast({ show: true, message: t(messageKey) });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const userIdeas = [
        ...(communityIdeas || []),
        ...(indicatorsAndStrategies || []),
        ...(tradingAnalysis || []),
    ].filter(idea => idea.author === t('you_label')).sort((a,b) => b.id - a.id);
    
    const handleEditClick = (item, type) => { 
        setEditingItem(item); 
        setFormType(type);
        setView('form'); 
    };

    const handleAddNewClick = () => { 
        setEditingItem(null); 
        const newFormType = mainTab === 'ideas' ? 'idea' : (mainTab === 'news' ? 'news' : 'analysis');
        setFormType(newFormType);
        setView('form'); 
    };
    
    const handleBackToList = () => { setView('list'); setEditingItem(null); };

    const handleSave = (data) => {
        if (formType === 'idea') {
            onSaveIdea(data);
            if (data.status === 'draft') showSuccessToast('idea_draft_saved_success');
            else if (data.status === 'scheduled') showSuccessToast('idea_scheduled_success');
            else showSuccessToast(editingItem ? 'idea_updated_success' : 'idea_published_success');
        } else if (formType === 'news') {
            onSaveNews(data);
            if (data.status === 'draft') showSuccessToast('news_draft_saved_success');
            else if (data.status === 'scheduled') showSuccessToast('news_scheduled_success');
            else showSuccessToast(editingItem ? 'news_updated_success' : 'news_published_success');
        // FIX: Add handler for saving analysis.
        } else if (formType === 'analysis') {
            onSaveAnalysis(data);
            if (data.status === 'draft') showSuccessToast('analysis_draft_saved_success');
            else if (data.status === 'scheduled') showSuccessToast('analysis_scheduled_success');
            else showSuccessToast(editingItem ? 'analysis_updated_success' : 'analysis_published_success');
        }
        handleBackToList();
    };

    const handleAIToggle = () => {
        if (isAIEnabled) setIsConfirmDisableAIOpen(true);
        else toggleAIEnabled();
    };

    const handleConfirmDisableAI = () => {
        toggleAIEnabled();
        setIsConfirmDisableAIOpen(false);
    };

    // --- PROFILE TAB STATE ---
    const [profileData, setProfileData] = useState({ username: "amralareke280", signature: "", showSocial: true, twitterUser: "", youtubeLink: "", website: "" });
    const [avatarPreview, setAvatarPreview] = useState<string | null>('https://i.pravatar.cc/150?u=amralareke280');
    const [usernameChangesLeft, setUsernameChangesLeft] = useState(2);
    const [saveStatus, setSaveStatus] = useState({ public: 'idle', social: 'idle' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initialUsernameRef = useRef(profileData.username);
    
    useEffect(() => {
        if (!isOpen) return;
        setMainTab('settings');
        setView('list');
        setSubNavTab('profile');
        setEditingItem(null);
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => { document.body.style.overflow = 'unset'; document.removeEventListener('keydown', handleKeyDown); };
    }, [isOpen, onClose]);
    
    const handleProfileDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };
    
    const handleAvatarUploadClick = () => fileInputRef.current?.click();
    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => { setAvatarPreview(reader.result as string); }; reader.readAsDataURL(file); }
    };
    const handleAvatarDelete = () => setAvatarPreview(null);
    
    const handleUsernameChange = (e) => {
        if (usernameChangesLeft > 0 || e.target.value === initialUsernameRef.current) {
            setProfileData(prev => ({...prev, username: e.target.value}));
        }
    };

    const handleSavePublicInfo = () => {
        setSaveStatus(prev => ({...prev, public: 'saving'}));
        if (profileData.username !== initialUsernameRef.current) { setUsernameChangesLeft(prev => prev - 1); initialUsernameRef.current = profileData.username; }
        setTimeout(() => { console.log('Saved public info:', profileData); setSaveStatus(prev => ({...prev, public: 'saved'})); setTimeout(() => setSaveStatus(prev => ({...prev, public: 'idle'})), 2000); }, 1000);
    };
    
    let usernameNote = usernameChangesLeft <= 0 ? t('settings_username_no_changes_left') : t('settings_form_username_note', { 0: usernameChangesLeft });
    
    const navItems = [
        { key: 'analysis', labelKey: 'settings_tab_analysis', icon: LineChart },
        { key: 'ideas', labelKey: 'my_ideas_tab', icon: BookOpen },
        { key: 'news', labelKey: 'my_news_tab', icon: Newspaper },
        { key: 'scripts', labelKey: 'settings_tab_scripts', icon: Code },
        { key: 'followers', labelKey: 'settings_tab_followers', icon: Users },
        { key: 'following', labelKey: 'settings_tab_following', icon: User },
        { key: 'settings', labelKey: 'settings_tab_settings', icon: Settings },
    ];
    
    const renderContent = () => {
        switch (mainTab) {
            case 'settings':
                return (
                    <div>
                        <div className="border-b border-gray-200 dark:border-gray-800 px-4">
                            <div className="flex items-center gap-4">
                                <SubNavTab label={t('settings_subtab_profile')} isActive={subNavTab === 'profile'} onClick={() => setSubNavTab('profile')} />
                                <SubNavTab label={t('settings_subtab_account')} isActive={subNavTab === 'account'} onClick={onOpenBillingSettings} />
                                <SubNavTab label={t('settings_subtab_notifications')} isActive={subNavTab === 'notifications'} onClick={() => setSubNavTab('notifications')} />
                                <SubNavTab label={t('settings_subtab_security')} isActive={subNavTab === 'security'} onClick={() => setSubNavTab('security')} />
                            </div>
                        </div>
                        <div className="p-6">
                            {subNavTab === 'profile' && (
                                <div className="space-y-8 max-w-2xl">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings_public_info_title')}</h3>
                                    <FormRow label={t('settings_form_username')} note={usernameNote}>
                                        <TextInput value={profileData.username} onChange={handleUsernameChange} name="username" />
                                    </FormRow>
                                    <FormRow label={t('settings_form_avatar')} note={t('settings_form_avatar_note')}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-300 overflow-hidden">
                                                 {avatarPreview ? <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" /> : 'A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="file" accept="image/*" onChange={handleAvatarFileChange} ref={fileInputRef} className="hidden" />
                                                <button type="button" onClick={handleAvatarUploadClick} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">{t('settings_form_avatar_upload')}</button>
                                                <button type="button" onClick={handleAvatarDelete} className="text-sm text-red-500 hover:underline">{t('settings_form_avatar_delete')}</button>
                                            </div>
                                        </div>
                                    </FormRow>
                                     <FormRow label={t('settings_form_signature')}>
                                        <textarea value={profileData.signature} onChange={handleProfileDataChange} name="signature" rows={4} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white" />
                                    </FormRow>
                                    <FormRow label={t('settings_form_theme')}>
                                        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
                                            {(['light', 'dark', 'system'] as Theme[]).map(themeOption => {
                                                const isActive = theme === themeOption;
                                                return ( <button key={themeOption} onClick={() => setTheme(themeOption)} className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>
                                                        {themeOption === 'light' && <Sun size={16}/>}
                                                        {themeOption === 'dark' && <Moon size={16}/>}
                                                        {themeOption === 'system' && <Monitor size={16}/>}
                                                        {t(`settings_theme_${themeOption}`)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </FormRow>
                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings_ai_features_title')}</h3>
                                        <FormRow label={t('settings_ai_features_enable_label')} note={t('settings_ai_features_enable_note')}>
                                            <ToggleSwitch
                                                id="ai-features-toggle"
                                                checked={isAIEnabled}
                                                onChange={handleAIToggle}
                                            />
                                        </FormRow>
                                    </div>
                                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <SaveButton label={t('settings_form_save_button')} onClick={handleSavePublicInfo} status={saveStatus.public} t={t} />
                                    </div>
                                </div>
                            )}
                            {subNavTab === 'account' && <div>{t('settings_content_account_desc')}</div>}
                            {subNavTab === 'notifications' && <div>{t('settings_content_notifications_desc')}</div>}
                            {subNavTab === 'security' && <div>{t('settings_content_security_desc')}</div>}
                        </div>
                    </div>
                );

            case 'ideas':
            case 'news':
            // FIX: Added case for 'analysis' to handle this content type.
            case 'analysis': {
                if (view === 'form') {
                    return <PublishForm t={t} onSave={handleSave} onCancel={handleBackToList} initialData={editingItem} formType={formType} watchlistData={watchlistData}/>;
                }
                const items = mainTab === 'ideas' ? userIdeas : mainTab === 'news' ? userNews : userAnalyses;
                const noItemsText = mainTab === 'ideas' ? t('no_ideas_published') : (mainTab === 'news' ? t('no_news_published') : t('no_analyses_published'));
                const ctaText = mainTab === 'ideas' ? t('add_new_idea_cta') : (mainTab === 'news' ? t('add_new_news_cta') : t('add_new_analysis_cta'));
                const titleText = mainTab === 'ideas' ? t('my_ideas_tab') : (mainTab === 'news' ? t('my_news_tab') : t('my_analysis_tab'));
                const onDelete = mainTab === 'ideas' ? onDeleteIdea : (mainTab === 'news' ? onDeleteNews : onDeleteAnalysis);
                const itemType = mainTab === 'ideas' ? 'idea' : (mainTab === 'news' ? 'news' : 'analysis');

                return (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{titleText}</h3>
                            <button onClick={handleAddNewClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2">
                                <Plus size={16}/> {ctaText}
                            </button>
                        </div>
                        {items.length > 0 ? (
                            <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <img src={item.img} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-300 dark:bg-gray-700" />
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                                                    {item.status === 'draft' && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full font-semibold">{t('idea_status_draft')}</span>}
                                                    {item.status === 'scheduled' && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 rounded-full font-semibold">{t('idea_status_scheduled')}</span>}
                                                    <span>{item.status === 'published' ? item.date : (item.publishAt ? new Date(item.publishAt).toLocaleString(language, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <button onClick={() => handleEditClick(item, itemType)} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"><Edit size={14}/> {t('edit_button')}</button>
                                            <button onClick={() => onDelete(item.id, item.section)} className="flex items-center gap-1 text-sm text-red-600 dark:text-red-500 hover:underline"><Trash2 size={14}/> {t('delete_button')}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-gray-500 mb-4">{noItemsText}</p>
                                <button onClick={handleAddNewClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">{ctaText}</button>
                            </div>
                        )}
                    </div>
                );
            }

            default: {
                const navItem = navItems.find(item => item.key === mainTab);
                return (
                    <div className="text-center py-20 text-gray-500">
                        <h3 className="font-bold text-lg mb-2">{navItem ? t(navItem.labelKey) : mainTab}</h3>
                        <p>Content for this section is not yet available.</p>
                    </div>
                );
            }
        }
    };
    
    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
                <div ref={modalRef} className="bg-white dark:bg-[#131722] rounded-xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col h-[90vh] max-h-[800px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800"><div className="flex items-center gap-4"><div className="w-16 h-16 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-300">A</div><div><h2 className="text-xl font-bold text-gray-900 dark:text-white">amralareke280</h2><p className="text-sm text-gray-500 dark:text-gray-400">{t('settings_join_date')}</p></div></div><button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"><X size={24} /></button></header>
                    <div className="flex-1 flex flex-col md:flex-row min-h-0">
                        <aside className="flex-shrink-0 w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-4"><div className="flex justify-around md:justify-between mb-4"><Stat value="1.2k" label={t('settings_stat_followers')} /><Stat value="34" label={t('settings_stat_following')} /><Stat value="102" label={t('settings_stat_analysis')} /></div><nav className="space-y-2">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <NavTab key={item.key} isActive={mainTab === item.key} onClick={() => { setMainTab(item.key as any); setView('list'); }}>
                                        <Icon size={18}/>{t(item.labelKey)}
                                    </NavTab>
                                );
                            })}
                        </nav></aside>
                        <main className="flex-1 overflow-y-auto custom-scrollbar"><div className="p-6 relative">{toast.show && (<div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-100 dark:bg-green-900/80 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-semibold animate-bounce-in z-20">{toast.message}</div>)}{renderContent()}</div></main>
                    </div>
                </div>
            </div>
            {isConfirmDisableAIOpen && (<div className="fixed inset-0 bg-black/70 z-[51] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('confirm_disable_ai_title')}</h3><p className="text-gray-600 dark:text-gray-300 my-4">{t('confirm_disable_ai_message')}</p><div className="flex justify-end gap-3"><button onClick={() => setIsConfirmDisableAIOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">{t('no_button')}</button><button onClick={handleConfirmDisableAI} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('yes_button')}</button></div></div></div>)}
        </>,
        document.body
    );
};