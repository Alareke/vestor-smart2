/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand'

// FIX: Add translation system to provide the 't' function.
const translations = {
    en: {
        chart_type_area: "Area",
        chart_type_bars: "Bars",
        chart_type_candles: "Candles",
        chart_type_heikin_ashi: "Heikin Ashi",
        chart_type_line: "Line",
        clear_drawings_confirm: "This will remove all drawings from the current chart. This action cannot be undone.",
        clear_drawings_title: "Clear All Drawings?",
        common_cancel: "Cancel",
        common_confirm: "Confirm",
        common_dismiss: "Dismiss",
        common_not_now: "Not Now",
        common_price: "Price",
        common_quantity: "Quantity",
        common_refresh_page: "Refresh Page",
        common_side: "Side",
        common_symbol: "Symbol",
        error_boundary_description: "A critical error occurred in the application. Please refresh the page.",
        error_boundary_title: "Application Error",
        error_modal_description: "Something went wrong. Please refresh the page to continue. If the problem persists, contact support.",
        error_modal_details: "Error Details",
        error_modal_title: "An Error Occurred",
        header_add_symbol: "Add Symbol",
        header_alert: "Alert",
        header_bar_replay: "Bar Replay",
        header_change_language: "Change Language",
        header_chart_layout: "Chart Layout",
        header_chart_type_change: "Change Chart Type",
        header_create_alert: "Create Alert",
        header_fullscreen: "Fullscreen",
        header_indicators: "Indicators",
        header_layouts: "Layouts",
        header_layouts_templates: "Layouts & Templates",
        header_manage_layouts: "Manage Layouts",
        header_more_options: "More Options",
        header_publish: "Publish",
        header_publish_idea: "Publish Idea",
        header_quick_settings: "Quick Settings",
        header_redo: "Redo",
        header_replay: "Replay",
        header_settings: "Settings",
        header_snapshot: "Snapshot",
        header_toggle_dev_mode: "Toggle Dev Mode",
        header_toggle_watchlist: "Toggle Watchlist",
        header_undo: "Undo",
        header_zen_mode: "Zen Mode",
        layout_confirm_delete: "Are you sure you want to delete layout '{{name}}'?",
        layout_default_name: "Layout",
        layout_grid_view: "Grid View",
        layout_prompt_name: "Enter a name for the new layout:",
        layout_reset_default: "Reset to Default Layout",
        layout_save_as: "Save Layout As...",
        layout_single_pane: "Single Pane",
        mobile_menu_timeframe: "Timeframe",
        publish_prompt: "Share your idea about this chart:",
        publish_success: "Idea published successfully!",
        quota_modal_disable_button: "Yes, Disable AI Features",
        quota_modal_question: "Would you like to disable AI features for now to prevent further notifications?",
        quota_modal_title: "API Quota Exceeded",
        toast_ai_disabled: "AI features have been disabled.",
        toast_copied: "Copied to clipboard",
        toast_drawings_cleared: "All drawings have been cleared.",
        toast_drawings_locked: "Drawings are locked. Unlock to clear.",
        toast_layout_load_error: "Error: Could not load layout '{{name}}'.",
        toast_layout_loaded: "Layout '{{name}}' loaded.",
        toast_layout_reset: "Chart layout has been reset to default.",
        toast_layout_save_error: "Error: Could not save layout.",
        toast_layout_saved: "Layout '{{name}}' saved.",
        toast_pine_added: "Pine Script indicator added to chart.",
        trade_confirm_title_buy: "Confirm Buy Order",
        trade_confirm_title_sell: "Confirm Sell Order",
        zen_mode_exit: "Exit Zen Mode",
        zen_mode_exit_tooltip: "Exit Zen Mode (Esc)",
    },
    ar: {
        chart_type_area: "مساحة",
        chart_type_bars: "أعمدة",
        chart_type_candles: "شموع",
        chart_type_heikin_ashi: "هايكين آشي",
        chart_type_line: "خط",
        clear_drawings_confirm: "سيؤدي هذا إلى إزالة جميع الرسومات من الرسم البياني الحالي. لا يمكن التراجع عن هذا الإجراء.",
        clear_drawings_title: "مسح كل الرسومات؟",
        common_cancel: "إلغاء",
        common_confirm: "تأكيد",
        common_dismiss: "إغلاق",
        common_not_now: "ليس الآن",
        common_price: "السعر",
        common_quantity: "الكمية",
        common_refresh_page: "تحديث الصفحة",
        common_side: "الجانب",
        common_symbol: "الرمز",
        error_boundary_description: "حدث خطأ فادح في التطبيق. يرجى تحديث الصفحة.",
        error_boundary_title: "خطأ في التطبيق",
        error_modal_description: "حدث خطأ ما. يرجى تحديث الصفحة للمتابعة. إذا استمرت المشكلة، اتصل بالدعم.",
        error_modal_details: "تفاصيل الخطأ",
        error_modal_title: "حدث خطأ",
        header_add_symbol: "إضافة رمز",
        header_alert: "تنبيه",
        header_bar_replay: "إعادة الشريط",
        header_change_language: "تغيير اللغة",
        header_chart_layout: "تخطيط الرسم البياني",
        header_chart_type_change: "تغيير نوع الرسم البياني",
        header_create_alert: "إنشاء تنبيه",
        header_fullscreen: "ملء الشاشة",
        header_indicators: "المؤشرات",
        header_layouts: "التخطيطات",
        header_layouts_templates: "التخطيطات والقوالب",
        header_manage_layouts: "إدارة التخطيطات",
        header_more_options: "المزيد من الخيارات",
        header_publish: "نشر",
        header_publish_idea: "نشر فكرة",
        header_quick_settings: "إعدادات سريعة",
        header_redo: "إعادة",
        header_replay: "إعادة",
        header_settings: "الإعدادات",
        header_snapshot: "لقطة شاشة",
        header_toggle_dev_mode: "تبديل وضع المطور",
        header_toggle_watchlist: "تبديل قائمة المراقبة",
        header_undo: "تراجع",
        header_zen_mode: "وضع التركيز",
        layout_confirm_delete: "هل أنت متأكد أنك تريد حذف التخطيط '{{name}}'؟",
        layout_default_name: "تخطيط",
        layout_grid_view: "عرض شبكي",
        layout_prompt_name: "أدخل اسمًا للتخطيط الجديد:",
        layout_reset_default: "إعادة التعيين إلى التخطيط الافتراضي",
        layout_save_as: "حفظ التخطيط باسم...",
        layout_single_pane: "جزء واحد",
        mobile_menu_timeframe: "الإطار الزمني",
        publish_prompt: "شارك فكرتك حول هذا الرسم البياني:",
        publish_success: "تم نشر الفكرة بنجاح!",
        quota_modal_disable_button: "نعم، عطل ميزات الذكاء الاصطناعي",
        quota_modal_question: "هل ترغب في تعطيل ميزات الذكاء الاصطناعي الآن لمنع المزيد من الإشعارات؟",
        quota_modal_title: "تم تجاوز حصة API",
        toast_ai_disabled: "تم تعطيل ميزات الذكاء الاصطناعي.",
        toast_copied: "تم النسخ إلى الحافظة",
        toast_drawings_cleared: "تم مسح جميع الرسومات.",
        toast_drawings_locked: "الرسومات مقفلة. قم بإلغاء القفل للمسح.",
        toast_layout_load_error: "خطأ: لم يتمكن من تحميل التخطيط '{{name}}'.",
        toast_layout_loaded: "تم تحميل التخطيط '{{name}}'.",
        toast_layout_reset: "تمت إعادة تعيين تخطيط الرسم البياني إلى الوضع الافتراضي.",
        toast_layout_save_error: "خطأ: لم يتمكن من حفظ التخطيط.",
        toast_layout_saved: "تم حفظ التخطيط '{{name}}'.",
        toast_pine_added: "تمت إضافة مؤشر Pine Script إلى الرسم البياني.",
        trade_confirm_title_buy: "تأكيد أمر الشراء",
        trade_confirm_title_sell: "تأكيد أمر البيع",
        zen_mode_exit: "الخروج من وضع التركيز",
        zen_mode_exit_tooltip: "الخروج من وضع التركيز (Esc)",
    }
};

export function t(key: string, options?: { [key: string]: string | number }): string {
    const lang = useSettingsStore.getState().settings.general.language;
    const resources = lang === 'ar' ? translations.ar : translations.en;
    let translation = resources[key] || translations.en[key] || key;

    if (options) {
        Object.keys(options).forEach(optKey => {
            translation = translation.replace(new RegExp(`{{${optKey}}}`, 'g'), String(options[optKey]));
        });
    }

    return translation;
}


type RightbarState = {
  settingsOpen: boolean
  alertsOpen: boolean
  leftPanelOpen: boolean 
  indicatorsOpen: boolean
  layersOpen: boolean
  initialSettingsTab?: string;
}

type FullUIState = {
    rightbar: RightbarState,
    rightSidebarView: string | null,
    activeTool: string,
    selectedIcon: string | null,
    drawings: any[],
    drawingHistory: any[][],
    drawingRedoStack: any[][],
    alerts: any[],
    isMagnetModeOn: boolean,
    isDrawingModeOn: boolean,
    areDrawingsLocked: boolean,
    isTradingPanelPinned: boolean,
}

type UIStore = FullUIState & {
  toggle: (key: keyof Omit<RightbarState, 'initialSettingsTab'>, payload?: any) => void
  setRightSidebarView: (view: string | null) => void,
  setActiveTool: (tool: string) => void,
  setSelectedIcon: (icon: string | null) => void,
  setDrawings: (drawings: any[]) => void,
  setDrawingsFromLayout: (drawings: any[]) => void,
  undoDrawing: () => void,
  redoDrawing: () => void,
  addAlert: (alert: any) => void,
  removeAlert: (alertId: any) => void,
  toggleMagnetMode: () => void,
  toggleDrawingMode: () => void,
  toggleLockDrawings: () => void,
  toggleTradingPanelPin: () => void,
}

const defaultDrawingState = {
    drawings: [],
    drawingHistory: [],
    drawingRedoStack: [],
    isMagnetModeOn: false,
    isDrawingModeOn: false,
    areDrawingsLocked: false,
};

const initialState: FullUIState = {
    rightbar: {
        settingsOpen: false,
        alertsOpen: false,
        leftPanelOpen: false,
        indicatorsOpen: false,
        layersOpen: false,
    },
    rightSidebarView: null,
    activeTool: 'crosshair',
    selectedIcon: null,
    ...defaultDrawingState,
    alerts: [],
    isTradingPanelPinned: false,
};

function safeParseFromStorage<T>(key: string, fallback: T): T {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null || storedValue === 'undefined' || storedValue === 'null') {
            return fallback;
        }
        const parsed = JSON.parse(storedValue);
        return parsed ?? fallback;
    } catch (e) {
        console.warn(`Could not parse ${key} from localStorage`, e);
        return fallback;
    }
}


const loadState = (): FullUIState => {
    try {
        const uiState = safeParseFromStorage<Partial<FullUIState>>('vestor:uiState', {});
        const alerts = safeParseFromStorage<any[]>('vestor:alerts', []);

        // Radical fix: if 'drawings' property exists and is not an array, reset it.
        if (uiState.drawings === undefined || !Array.isArray(uiState.drawings)) {
            console.warn('Corrupted drawings state found in localStorage. Resetting.');
            uiState.drawings = [];
        }

        return {
            ...initialState,
            ...uiState,
            alerts: Array.isArray(alerts) ? alerts : [],
        };
    } catch (e) {
        // If parsing fails, it's a radical corruption. Clear the bad state and start fresh.
        console.error("Failed to parse UI state from localStorage, resetting.", e);
        localStorage.removeItem('vestor:uiState');
        localStorage.removeItem('vestor:alerts');
        return initialState;
    }
};

const saveState = (state: FullUIState) => {
    try {
        // Persist UI state without history or alerts
        const { drawingHistory, drawingRedoStack, alerts, ...restOfState } = state;
        localStorage.setItem('vestor:uiState', JSON.stringify(restOfState));
        // Persist alerts separately
        localStorage.setItem('vestor:alerts', JSON.stringify(alerts));
    } catch (e) {
        console.error("Failed to save state to localStorage:", e);
    }
};

export const useUIStore = create<UIStore>((set, get) => {
    
    const updateAndSave = (partialState: Partial<FullUIState>) => {
        // RADICAL FIX: Intercept any update to 'drawings' and ensure it's an array.
        if (partialState.drawings !== undefined && !Array.isArray(partialState.drawings)) {
            console.error('CRITICAL: Attempted to set drawings to a non-array value. Intercepted and corrected.', partialState.drawings);
            partialState.drawings = [];
        }

        const newState = { ...get(), ...partialState };
        saveState(newState);
        set(partialState);
    };

    return {
        ...loadState(),

        toggle: (key, payload) => {
            const rightbar = { ...get().rightbar, [key]: !get().rightbar[key] };
             if (key === 'settingsOpen' && rightbar.settingsOpen) {
                rightbar.initialSettingsTab = payload;
            }
            updateAndSave({ rightbar });
        },
        setRightSidebarView: (view) => updateAndSave({ rightSidebarView: view }),
        setActiveTool: (tool) => updateAndSave({ activeTool: tool }),
        setSelectedIcon: (icon) => updateAndSave({ selectedIcon: icon }),
        
        setDrawings: (drawings) => {
            const currentDrawings = get().drawings;
            // Only add to history if drawings actually changed
            if (JSON.stringify(currentDrawings) !== JSON.stringify(drawings)) {
                updateAndSave({ 
                    drawings, 
                    drawingHistory: [...get().drawingHistory, currentDrawings],
                    drawingRedoStack: [] 
                });
            }
        },
        setDrawingsFromLayout: (drawings) => {
            // When loading a layout, we clear the history
            updateAndSave({
                drawings,
                drawingHistory: [],
                drawingRedoStack: []
            });
        },
        undoDrawing: () => {
            const { drawingHistory, drawings, drawingRedoStack } = get();
            if (drawingHistory.length === 0) return;
            const lastState = drawingHistory[drawingHistory.length - 1];
            updateAndSave({
                drawings: lastState,
                drawingHistory: drawingHistory.slice(0, -1),
                drawingRedoStack: [drawings, ...drawingRedoStack]
            });
        },
        redoDrawing: () => {
            const { drawingRedoStack, drawings, drawingHistory } = get();
            if (drawingRedoStack.length === 0) return;
            const nextState = drawingRedoStack[0];
            updateAndSave({
                drawings: nextState,
                drawingHistory: [...drawingHistory, drawings],
                drawingRedoStack: drawingRedoStack.slice(1)
            });
        },
        
        addAlert: (alert) => updateAndSave({ alerts: [...get().alerts, { ...alert, id: Date.now() }] }),
        removeAlert: (alertId) => updateAndSave({ alerts: get().alerts.filter(a => a.id !== alertId) }),
        
        toggleMagnetMode: () => updateAndSave({ isMagnetModeOn: !get().isMagnetModeOn }),
        toggleDrawingMode: () => updateAndSave({ isDrawingModeOn: !get().isDrawingModeOn }),
        toggleLockDrawings: () => updateAndSave({ areDrawingsLocked: !get().areDrawingsLocked }),
        toggleTradingPanelPin: () => updateAndSave({ isTradingPanelPinned: !get().isTradingPanelPinned }),
    };
});


/** AUTO: search modal state + recent searches */
type SearchState = { open: boolean, q: string, recent: string[] }
type SearchStore = {
  search: SearchState
  setSearch: (p: Partial<SearchState>) => void
  addRecent: (sym: string) => void
}

export const useSearchStore = create<SearchStore>((set,get)=>({
  search: { open:false, q:'', recent: safeParseFromStorage<string[]>('ui:search:recent', []) },
  setSearch: (p)=>{
    const cur = get().search; 
    const next = { ...cur, ...p };
    // Automatically clear search query when closing the modal
    if (p.open === false) {
      next.q = '';
    }
    if ('recent' in p) localStorage.setItem('ui:search:recent', JSON.stringify(next.recent||[]));
    set({ search: next });
  },
  addRecent: (sym)=>{
    const cur = get().search;
    const rec = [sym].concat((cur.recent||[]).filter(x=>x!==sym)).slice(0,10);
    localStorage.setItem('ui:search:recent', JSON.stringify(rec));
    set({ search: { ...cur, recent: rec } });
  }
}));

/** Command Palette state management */
type CommandPaletteState = { open: boolean, q: string }
type CommandPaletteStore = {
  commandPalette: CommandPaletteState
  setCommandPalette: (p: Partial<CommandPaletteState>) => void
}
export const useCommandPaletteStore = create<CommandPaletteStore>((set, get) => ({
    commandPalette: { open: false, q: '' },
    setCommandPalette: (p) => {
        const cur = get().commandPalette;
        const next = { ...cur, ...p };
        if (p.open === false) {
            next.q = ''; // Clear query on close
        }
        set({ commandPalette: next });
    }
}));

/** App settings store */
export const defaultSettings = {
  theme: 'dark',
  ai: {
    enabled: false,
  },
  chart: {
    background: '#12161D',
    grid: 'rgba(42, 48, 64, 0.6)',
    showWatermark: true,
    autoScale: true,
    lockPriceToBarRatio: false, // Not implemented in lightweight-charts
    invertScale: false,
    scaleMode: 'normal', // 'normal', 'logarithmic', 'percentage', 'indexedTo100'
    scalePosition: 'right', // 'right', 'left'
    showPriceLabels: true, // AKA Ticks
    showGridLines: true,
    showPlusButton: true, // Not implemented
  },
  trading: {
    defaultQuantity: 50,
    instantPlacement: false,
  },
  general: {
    language: 'en',
    timezone: 'UTC',
  }
};

type Settings = typeof defaultSettings;

type SettingsStore = {
  settings: Settings;
  setSettings: (p: Partial<Settings> | ((s: Settings) => Settings)) => void;
  resetSettings: () => void;
}

const getInitialSettings = (): Settings => {
    const stored = safeParseFromStorage<Partial<Settings>>('vs_settings', null);
    if (stored) {
        // deep merge with defaults to prevent breakage on new settings
        return {
            ...defaultSettings,
            ...stored,
            ai: { ...defaultSettings.ai, ...(stored.ai || {}) },
            chart: { ...defaultSettings.chart, ...(stored.chart || {}) },
            trading: { ...defaultSettings.trading, ...(stored.trading || {}) },
            general: { ...defaultSettings.general, ...(stored.general || {}) },
        };
    }
    return defaultSettings;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: getInitialSettings(),
    setSettings: (p) => {
        const currentSettings = get().settings;
        const nextState = typeof p === 'function' ? p(currentSettings) : { ...currentSettings, ...p };
        localStorage.setItem('vs_settings', JSON.stringify(nextState));
        set({ settings: nextState });
    },
    resetSettings: () => {
        localStorage.removeItem('vs_settings');
        set({ settings: defaultSettings });
    }
}));

// Apply theme on initial load
try {
    document.documentElement.className = getInitialSettings().theme;
} catch(e) {
    console.error('Failed to apply initial theme', e);
}