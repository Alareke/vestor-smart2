/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Twitter, Youtube, Facebook, Instagram, Globe, HelpCircle, Check, Smartphone, LogOut, Download, CreditCard, Mail, Bell, MessageSquare, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../i18n/ThemeContext';

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const NavItem = (props: any) => {
    const { label, isActive, onClick, isHeader = false } = props;
    if (isHeader) {
        return <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase">{label}</h3>;
    }
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300 hover:bg-gray-800/50'}`}
        >
            {label}
        </button>
    );
};

const SocialInput = ({ label, placeholder, Icon, name, value, onChange }) => (
    <div className="relative">
        <input 
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent border border-gray-600 rounded-md py-2 ps-3 pe-10 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <div className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400">
            <Icon size={20} />
        </div>
        <label className="absolute -top-2 start-2 bg-[#131722] px-1 text-xs text-gray-400">{label}</label>
    </div>
);

// FIX: Changed component to accept arbitrary props to fix TypeScript error with `key` prop.
const ToggleRow = (props: any) => {
    const { label, description, isChecked, onChange } = props;
    return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
        <div>
            <p className="font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
    </div>
);
};


const PublicProfileSection = ({ t }) => {
    const { theme, setTheme } = useTheme();
    const [profileData, setProfileData] = useState({
        username: "amralareke280",
        x_profile: "username@",
        youtube: "youtube.com/@YourChannel",
        facebook: "username@",
        instagram: "username@",
        website: ""
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleDataChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarUploadClick = () => fileInputRef.current?.click();

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setSaveStatus('saving');
        console.log("Saving data:", profileData);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };


    return (
        <div className="space-y-8">
            <input type="file" accept="image/jpeg,image/png,image/gif" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" />
            {/* Photo and Username */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-white">{t('billing_public_profile_title')}</h3>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-5xl font-bold flex-shrink-0 overflow-hidden">
                        {avatarPreview ? <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" /> : 'A'}
                    </div>
                    <div className="flex-grow">
                        <button onClick={handleAvatarUploadClick} className="bg-[#2A2E39] text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mb-2">{t('billing_public_profile_upload_button')}</button>
                        <p className="text-xs text-gray-500">{t('billing_public_profile_avatar_note')}</p>
                    </div>
                </div>
                <div className="mt-4 flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="block text-xs text-gray-400 mb-1">{t('billing_public_profile_username_label')}</label>
                        <p className="font-semibold text-white">{profileData.username}</p>
                    </div>
                    <button className="border border-gray-600 px-4 py-1.5 rounded-md text-sm hover:bg-gray-800/50">{t('billing_public_profile_change_username_button')}</button>
                </div>
            </div>
            
            {/* Appearance Section */}
            <div className="border-t border-gray-800 pt-8">
                <h3 className="font-bold text-lg mb-4 text-white">{t('settings_form_theme')}</h3>
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-full border border-gray-800">
                    {(['light', 'dark', 'system'] as Theme[]).map(themeOption => {
                        const isActive = theme === themeOption;
                        return (
                            <button 
                                key={themeOption} 
                                onClick={() => setTheme(themeOption)} 
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                                    isActive 
                                    ? 'bg-gray-700 text-white' 
                                    : 'text-gray-400 hover:bg-gray-800/50'
                                }`}
                            >
                                {themeOption === 'light' && <Sun size={16}/>}
                                {themeOption === 'dark' && <Moon size={16}/>}
                                {themeOption === 'system' && <Monitor size={16}/>}
                                {t(`settings_theme_${themeOption}`)}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-gray-800 pt-8">
                <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">{t('billing_social_links_title')} <HelpCircle size={16} className="text-gray-500" /></h3>
                 <div className="space-y-8">
                    <SocialInput label={t('billing_social_links_x')} placeholder={t('placeholder_username')} Icon={Twitter} name="x_profile" value={profileData.x_profile} onChange={handleDataChange} />
                    <SocialInput label={t('billing_social_links_youtube')} placeholder={t('placeholder_youtube')} Icon={Youtube} name="youtube" value={profileData.youtube} onChange={handleDataChange} />
                    <SocialInput label={t('billing_social_links_facebook')} placeholder={t('placeholder_username')} Icon={Facebook} name="facebook" value={profileData.facebook} onChange={handleDataChange}/>
                    <SocialInput label={t('billing_social_links_instagram')} placeholder={t('placeholder_username')} Icon={Instagram} name="instagram" value={profileData.instagram} onChange={handleDataChange}/>
                    <SocialInput label={t('billing_social_links_website')} placeholder={t('billing_social_links_website_placeholder')} Icon={Globe} name="website" value={profileData.website} onChange={handleDataChange} />
                </div>
                 <div className="mt-6 flex justify-end items-center gap-4">
                     {saveStatus === 'saving' && <span className="text-gray-400 text-xs animate-pulse">{t('settings_save_status_saving')}</span>}
                     {saveStatus === 'saved' && <span className="text-green-400 text-xs flex items-center gap-1"><Check size={16}/> {t('settings_save_status_saved')}</span>}
                    <button onClick={handleSave} disabled={saveStatus !== 'idle'} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-500 transition-colors disabled:bg-gray-800 disabled:text-gray-500">
                        {t('billing_social_links_save_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PrivacyPreferencesSection = ({ t }) => {
    const [privacySettings, setPrivacySettings] = useState({
        privateProfile: false,
        hideStatus: false,
        showIdeas: true,
        showScripts: true,
        allowFollowing: true,
    });

    const handleToggle = (key) => {
        setPrivacySettings(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-1 text-white">{t('billing_privacy_title')}</h3>
            <p className="text-sm text-gray-400 mb-6">{t('billing_privacy_desc')}</p>
            <div className="bg-[#131722] p-4 rounded-lg border border-gray-800">
                <ToggleRow label={t('billing_privacy_toggle1_label')} description={t('billing_privacy_toggle1_desc')} isChecked={privacySettings.privateProfile} onChange={() => handleToggle('privateProfile')} />
                <ToggleRow label={t('billing_privacy_toggle2_label')} description={t('billing_privacy_toggle2_desc')} isChecked={privacySettings.hideStatus} onChange={() => handleToggle('hideStatus')} />
                <ToggleRow label={t('billing_privacy_toggle3_label')} description={t('billing_privacy_toggle3_desc')} isChecked={privacySettings.showIdeas} onChange={() => handleToggle('showIdeas')} />
                <ToggleRow label={t('billing_privacy_toggle4_label')} description={t('billing_privacy_toggle4_desc')} isChecked={privacySettings.showScripts} onChange={() => handleToggle('showScripts')} />
                <ToggleRow label={t('billing_privacy_toggle5_label')} description={t('billing_privacy_toggle5_desc')} isChecked={privacySettings.allowFollowing} onChange={() => handleToggle('allowFollowing')} />
            </div>
        </div>
    );
};

const ActiveSessionsSection = ({ t }) => {
    const sessions = [
        { id: 1, browser: 'Chrome on Windows', location: 'Riyadh, Saudi Arabia', time: 'Online now', isCurrent: true },
        { id: 2, browser: 'iPhone App', location: 'Jeddah, Saudi Arabia', time: 'Active 2 hours ago', isCurrent: false },
        { id: 3, browser: 'Safari on macOS', location: 'Dubai, UAE', time: 'Active yesterday', isCurrent: false },
    ];
    
    return (
        <div>
            <h3 className="font-bold text-lg mb-1 text-white">{t('billing_sessions_title')}</h3>
            <p className="text-sm text-gray-400 mb-6">{t('billing_sessions_desc')}</p>
            <div className="bg-[#131722] p-4 rounded-lg border border-gray-800 space-y-4">
                {sessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                        <div className="flex items-center gap-4">
                            <Smartphone size={24} className="text-gray-400"/>
                            <div>
                                <p className="font-semibold text-white">{session.browser}</p>
                                <p className="text-xs text-gray-400">{session.location} • <span className={session.isCurrent ? 'text-green-400' : ''}>{session.time}</span></p>
                            </div>
                        </div>
                        {!session.isCurrent && (
                            <button className="text-sm text-red-500 hover:underline">{t('billing_sessions_logout_button')}</button>
                        )}
                    </div>
                ))}
            </div>
             <div className="mt-6 flex justify-end">
                <button className="flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-md text-white hover:bg-gray-800">
                    <LogOut size={16} />
                    {t('billing_sessions_logout_all_button')}
                </button>
            </div>
        </div>
    );
};

const CandlestickChartIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 flex-shrink-0">
        <path d="M8 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 15V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="6" y="9" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 16V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="14" y="8" width="4" height="8" rx="1" fill="currentColor"/>
    </svg>
);

const SubscriptionsSection = ({ t }) => {
    return (
        <div className="space-y-10">
            {/* Promo Card */}
            <div className="bg-black/50 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-8 p-8 overflow-hidden">
                <div className="md:w-1/2 text-center md:text-start rtl:md:text-right">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">{t('billing_promo_title')}</h2>
                    <p className="text-gray-300 mb-6">{t('billing_promo_desc')}</p>
                    <button className="bg-gradient-to-l from-[#8E2DE2] to-[#4A00E0] text-white font-bold py-3 px-8 rounded-lg text-center leading-tight hover:opacity-90 transition-opacity">
                        {t('billing_promo_button')}
                    </button>
                </div>
                <div className="md:w-1/2 w-full mt-6 md:mt-0 relative md:-mr-16 md:-my-16 rtl:md:-ml-16 rtl:md:mr-0">
                    <img 
                        src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800" 
                        alt="Trading chart on a screen"
                        className="rounded-lg shadow-2xl object-cover w-full"
                    />
                </div>
            </div>

            {/* Current Membership */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">{t('billing_current_membership_title')}</h3>
                <div className="bg-[#1C2331] p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-white">{t('billing_current_plan_name')}</p>
                        <p className="text-sm text-gray-400">{t('billing_current_plan_status')}</p>
                    </div>
                    <button className="bg-[#2A2E39] text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                        {t('billing_upgrade_button')}
                    </button>
                </div>
            </div>

            {/* Real-time Market Data */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">{t('billing_realtime_data_title')}</h3>
                <div className="bg-[#2A2E39] p-6 rounded-lg flex items-start gap-6">
                    <CandlestickChartIcon />
                    <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{t('billing_realtime_card_title')}</h4>
                        <p className="text-sm text-gray-400">
                            {t('billing_realtime_card_desc')}
                            <a href="#" className="text-blue-400 hover:underline ms-1">{t('billing_realtime_card_link')}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PaymentMethodSection = ({ t }) => (
    <div>
        <h3 className="font-bold text-lg mb-6 text-white">{t('billing_nav_payment_method')}</h3>
        <div className="bg-[#131722] p-6 rounded-lg border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <CreditCard size={24} className="text-gray-400" />
                <div>
                    <p className="font-semibold text-white">Visa **** 1234</p>
                    <p className="text-xs text-gray-400">Expires 12/26</p>
                </div>
            </div>
            <div className="flex gap-4">
                 <button className="text-sm text-blue-400 hover:underline">{t('billing_public_profile_change_username_button')}</button>
                 <button className="text-sm text-red-500 hover:underline">{t('settings_form_avatar_delete')}</button>
            </div>
        </div>
    </div>
);

const BillingHistorySection = ({ t }) => {
    const history = [
        { date: 'July 7, 2025', amount: '$14.95', status: 'Paid' },
        { date: 'June 7, 2025', amount: '$14.95', status: 'Paid' },
        { date: 'May 7, 2025', amount: '$14.95', status: 'Paid' },
    ];
    return (
        <div>
            <h3 className="font-bold text-lg mb-6 text-white">{t('billing_nav_billing_history')}</h3>
            <div className="bg-[#131722] rounded-lg border border-gray-800">
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-400 border-b border-gray-800">
                        <tr>
                            <th className="p-4 font-semibold">{t('billing_history_date')}</th>
                            <th className="p-4 font-semibold">{t('billing_history_amount')}</th>
                            <th className="p-4 font-semibold">{t('billing_history_status')}</th>
                            <th className="p-4 font-semibold">{t('billing_history_invoice')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800 last:border-b-0">
                                <td className="p-4 text-white">{item.date}</td>
                                <td className="p-4 text-white">{item.amount}</td>
                                <td className="p-4 text-green-400">{item.status}</td>
                                <td className="p-4"><button className="text-blue-400 hover:underline flex items-center gap-1"><Download size={14}/> PDF</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SubscriberStatusSection = ({ t }) => (
     <div>
        <h3 className="font-bold text-lg mb-6 text-white">{t('billing_nav_subscriber_status')}</h3>
        <div className="bg-[#131722] p-6 rounded-lg border border-gray-800 space-y-4">
             <p><span className="font-semibold text-white">{t('billing_subscriber_referral')}:</span> <a href="#" className="text-blue-400 hover:underline">vestorsmart.com/referral?u=...</a></p>
             <p><span className="font-semibold text-white">{t('billing_subscriber_coins')}:</span> 100 available</p>
        </div>
    </div>
);

const NotificationSettingsSection = ({ titleKey, descriptionKey, settings, t }) => {
    const [toggles, setToggles] = useState(settings.reduce((acc, s) => ({...acc, [s.key]: s.initialValue }), {}));
    const handleToggle = (key) => setToggles(prev => ({...prev, [key]: !prev[key]}));
    
    return (
        <div>
            <h3 className="font-bold text-lg mb-1 text-white">{t(titleKey)}</h3>
            <p className="text-sm text-gray-400 mb-6">{t(descriptionKey)}</p>
            <div className="bg-[#131722] p-4 rounded-lg border border-gray-800">
                {settings.map(setting => (
                     <ToggleRow key={setting.key} label={t(setting.labelKey)} description={t(setting.descKey)} isChecked={toggles[setting.key]} onChange={() => handleToggle(setting.key)} />
                ))}
            </div>
        </div>
    );
};

const alertDeliverySettings = [
    { key: 'inApp', labelKey: 'billing_alerts_in_app_label', descKey: 'billing_alerts_in_app_desc', initialValue: true },
    { key: 'push', labelKey: 'billing_alerts_push_label', descKey: 'billing_alerts_push_desc', initialValue: true },
    { key: 'email', labelKey: 'billing_alerts_email_label', descKey: 'billing_alerts_email_desc', initialValue: false },
    { key: 'sms', labelKey: 'billing_alerts_sms_label', descKey: 'billing_alerts_sms_desc', initialValue: false },
];
const socialNotificationSettings = [
    { key: 'newFollowers', labelKey: 'billing_social_new_followers_label', descKey: 'billing_social_new_followers_desc', initialValue: true },
    { key: 'likes', labelKey: 'billing_social_likes_label', descKey: 'billing_social_likes_desc', initialValue: true },
    { key: 'comments', labelKey: 'billing_social_comments_label', descKey: 'billing_social_comments_desc', initialValue: true },
    { key: 'mentions', labelKey: 'billing_social_mentions_label', descKey: 'billing_social_mentions_desc', initialValue: false },
];
const emailSubscriptionSettings = [
    { key: 'weeklySummary', labelKey: 'billing_email_weekly_summary_label', descKey: 'billing_email_weekly_summary_desc', initialValue: true },
    { key: 'productUpdates', labelKey: 'billing_email_product_updates_label', descKey: 'billing_email_product_updates_desc', initialValue: true },
    { key: 'communityHighlights', labelKey: 'billing_email_community_highlights_label', descKey: 'billing_email_community_highlights_desc', initialValue: false },
    { key: 'education', labelKey: 'billing_email_education_label', descKey: 'billing_email_education_desc', initialValue: true },
];


const PlaceholderSection = ({ sectionKey, t }) => {
    const title = t(sectionKey);
    return (
        <div>
            <h3 className="font-bold text-lg mb-1 text-white">{title}</h3>
            <p className="text-sm text-gray-400">{`Content for ${title} goes here.`}</p>
        </div>
    );
};

export const BillingSettingsModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const modalRef = useRef(null);
    const [activeSection, setActiveSection] = useState('public_profile');

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
    
    if (!isOpen) return null;
    
    const navSections = [
        { key: 'section1', titleKey: 'billing_nav_section1_title', isHeader: true },
        { key: 'public_profile', titleKey: 'billing_nav_public_profile' },
        { key: 'privacy', titleKey: 'billing_nav_privacy' },
        { key: 'section2', titleKey: 'billing_nav_section2_title', isHeader: true },
        { key: 'account_settings', titleKey: 'billing_nav_account_settings' },
        { key: 'active_sessions', titleKey: 'billing_nav_active_sessions' },
        { key: 'section3', titleKey: 'billing_nav_section3_title', isHeader: true },
        { key: 'subscriptions', titleKey: 'billing_nav_subscriptions' },
        { key: 'payment_method', titleKey: 'billing_nav_payment_method' },
        { key: 'billing_history', titleKey: 'billing_nav_billing_history' },
        { key: 'subscriber_status', titleKey: 'billing_nav_subscriber_status' },
        { key: 'section4', titleKey: 'billing_nav_section4_title', isHeader: true },
        { key: 'alert_delivery', titleKey: 'billing_nav_alert_delivery' },
        { key: 'social_notifications', titleKey: 'billing_nav_social_notifications' },
        { key: 'email_subscriptions', titleKey: 'billing_nav_email_subscriptions' },
    ];

    const renderContent = () => {
        switch(activeSection) {
            case 'public_profile': return <PublicProfileSection t={t} />;
            case 'privacy': return <PrivacyPreferencesSection t={t} />;
            case 'active_sessions': return <ActiveSessionsSection t={t} />;
            case 'subscriptions': return <SubscriptionsSection t={t} />;
            case 'payment_method': return <PaymentMethodSection t={t} />;
            case 'billing_history': return <BillingHistorySection t={t} />;
            case 'subscriber_status': return <SubscriberStatusSection t={t} />;
            case 'alert_delivery': return <NotificationSettingsSection titleKey="billing_nav_alert_delivery" descriptionKey="billing_alerts_delivery_desc" settings={alertDeliverySettings} t={t} />;
            case 'social_notifications': return <NotificationSettingsSection titleKey="billing_nav_social_notifications" descriptionKey="billing_social_notifications_desc" settings={socialNotificationSettings} t={t} />;
            case 'email_subscriptions': return <NotificationSettingsSection titleKey="billing_nav_email_subscriptions" descriptionKey="billing_email_subscriptions_desc" settings={emailSubscriptionSettings} t={t} />;
            default:
                const navItem = navSections.find(s => s.key === activeSection);
                return <PlaceholderSection sectionKey={navItem?.titleKey || ''} t={t} />;
        }
    };

    return createPortal(
         <div 
            ref={modalRef}
            className="fixed inset-0 bg-[#131722] z-50 text-white font-sans text-sm animate-slide-in-up-full overflow-y-auto custom-scrollbar"
            role="dialog"
            aria-modal="true"
        >
            <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">{t('brand_name')}</h2>
                    <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Right-side Navigation (in RTL) */}
                    <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                        <h2 className="text-2xl font-bold mb-4">{t('billing_settings_main_title')}</h2>
                        <nav className="space-y-1">
                            {navSections.map(item => (
                                <NavItem 
                                    key={item.key}
                                    label={t(item.titleKey)}
                                    isActive={activeSection === item.key}
                                    onClick={() => {
                                        if (!item.isHeader) {
                                            setActiveSection(item.key);
                                        }
                                    }}
                                    isHeader={item.isHeader}
                                />
                            ))}
                        </nav>
                    </aside>

                    {/* Left-side Content Area */}
                    <main className="flex-1 min-w-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
         </div>,
         document.body
    );
};