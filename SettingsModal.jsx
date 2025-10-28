/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { X, Palette, CandlestickChart, Sliders, Info, Keyboard, Save, BrainCircuit } from 'lucide-react';
import { useUIStore, useSettingsStore, defaultSettings } from './ui.ts';

// Reusable components for the settings panels
const SettingsSection = ({ title, description, children }) => (
    <div className="mb-8 last:mb-0">
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        {description && <p className="text-xs text-[#8A93A2] mb-4 max-w-lg">{description}</p>}
        <div className="space-y-4 rounded-md border border-[#2A3040] p-4 bg-[#12161D]/50">
            {children}
        </div>
    </div>
);

const SettingRow = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 border-b border-[#2A3040] last:border-b-0 gap-2">
        <label className="text-sm text-[#E1E3E6] flex-shrink-0">{label}</label>
        <div>{children}</div>
    </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-[#2A3040] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

const ColorSetting = ({ value, onChange }) => (
    <div className="relative w-8 h-8 rounded-md border border-[#383f52] overflow-hidden cursor-pointer">
        <div className="w-full h-full" style={{ backgroundColor: value }} />
        <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>
);

// Settings Panels
const AppearanceSettings = ({ settings, onChange }) => {
    const themes = [{ id: 'dark', name: 'Dark' }, { id: 'light', name: 'Light' }];
    return (
        <div>
            <SettingsSection title="Theme" description="Choose a color theme for the entire application.">
                 <div className="flex gap-4">
                    {themes.map(theme => (
                        <button key={theme.id} onClick={() => onChange('theme', theme.id)} className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${settings.theme === theme.id ? 'border-blue-500 bg-[#2A3040]/50' : 'border-transparent bg-[#12161D] hover:border-[#2A3040]'}`}>
                           <div className={`w-full h-16 rounded mb-2 transition-colors ${theme.id === 'light' ? 'bg-gray-200 border border-gray-300' : 'bg-[#0D1017] border border-[#2A3040]'}`}></div>
                           <span className="font-semibold text-white">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </SettingsSection>
            <SettingsSection title="Chart Colors" description="Customize the colors of your chart area for better visibility.">
                <SettingRow label="Background Color">
                    <ColorSetting value={settings.chart.background} onChange={(val) => onChange('chart', 'background', val)} />
                </SettingRow>
                 <SettingRow label="Grid Lines Color">
                    <ColorSetting value={settings.chart.grid} onChange={(val) => onChange('chart', 'grid', val)} />
                </SettingRow>
            </SettingsSection>
        </div>
    );
};

const ChartSettings = ({ settings, onChange }) => {
    return (
        <SettingsSection title="Chart Behavior" description="Control how the chart displays information and behaves.">
            <SettingRow label="Show Watermark">
                <ToggleSwitch checked={settings.chart.showWatermark} onChange={(val) => onChange('chart', 'showWatermark', val)} />
            </SettingRow>
            {/* Add more chart settings here */}
        </SettingsSection>
    )
};

const TradingSettings = ({ settings, onChange }) => (
    <SettingsSection title="Trading Defaults" description="Set your default trading parameters to speed up order placement.">
        <SettingRow label="Default Order Quantity">
            <input 
                type="number" 
                value={settings.trading.defaultQuantity} 
                onChange={e => onChange('trading', 'defaultQuantity', parseInt(e.target.value, 10) || 0)}
                className="w-24 bg-[#12161D] border border-[#2A3040] rounded-md p-2 text-sm text-right input-inset"
            />
        </SettingRow>
        <SettingRow label="Instant Order Placement (One-Click)">
             <ToggleSwitch checked={settings.trading.instantPlacement} onChange={(val) => onChange('trading', 'instantPlacement', val)} />
        </SettingRow>
    </SettingsSection>
);

const AISettings = ({ settings, onChange }) => (
    <SettingsSection title="AI Features" description="Enable or disable AI-powered features like chat, news analysis, and pattern detection.">
            <ToggleSwitch checked={settings.ai.enabled} onChange={(val) => onChange('ai', 'enabled', val)} />
        </SettingRow>
        <div className="text-xs text-[#8A93A2] pt-4">
        </div>
    </SettingsSection>
);

const AboutPanel = () => (
     <SettingsSection title="About VESTOR SMART">
        <div className="text-sm space-y-2">
            <p><span className="font-bold">Version:</span> 1.0.0</p>
            <p><span className="font-bold">Build Date:</span> {new Date().toLocaleDateString()}</p>
            <p className="pt-2">VESTOR SMART is a powerful, AI-enhanced trading terminal designed for modern traders. For support, please visit our website.</p>
        </div>
    </SettingsSection>
);

const HotkeysPanel = () => (
    <SettingsSection title="Keyboard Shortcuts" description="View and customize keyboard shortcuts to navigate the app faster.">
        <SettingRow label="Open Search"><button className="px-2 py-1 text-xs bg-[#12161D] border border-[#2A3040] rounded-md hover:bg-[#2A3040] hover:border-blue-500"><code>/</code> or <code>Ctrl+K</code></button></SettingRow>
        <SettingRow label="Change Chart Type"><button className="px-2 py-1 text-xs bg-[#12161D] border border-[#2A3040] rounded-md hover:bg-[#2A3040] hover:border-blue-500"><code>T</code></button></SettingRow>
        <SettingRow label="Save Layout"><button className="px-2 py-1 text-xs bg-[#12161D] border border-[#2A3040] rounded-md hover:bg-[#2A3040] hover:border-blue-500"><code>S</code></button></SettingRow>
        <SettingRow label="Reload Chart"><button className="px-2 py-1 text-xs bg-[#12161D] border border-[#2A3040] rounded-md hover:bg-[#2A3040] hover:border-blue-500"><code>R</code></button></SettingRow>
        <SettingRow label="Delete Selected Drawing"><button className="px-2 py-1 text-xs bg-[#12161D] border border-[#2A3040] rounded-md hover:bg-[#2A3040] hover:border-blue-500"><code>Delete</code> or <code>Backspace</code></button></SettingRow>
    </SettingsSection>
);

export default function SettingsModal(){
  const { rightbar, toggle } = useUIStore()
  const { settings, setSettings, resetSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('appearance');
  // Create a deep copy for local edits
  const [localSettings, setLocalSettings] = useState(() => JSON.parse(JSON.stringify(settings)));
  
  // When the modal opens, set the active tab
  useEffect(() => {
    if (rightbar.settingsOpen) {
      setActiveTab(rightbar.initialSettingsTab || 'appearance');
    }
  }, [rightbar.settingsOpen, rightbar.initialSettingsTab]);
  
  // Resync local state if modal is reopened or global state changes
  useEffect(() => {
    if (rightbar.settingsOpen) {
      setLocalSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [rightbar.settingsOpen, settings]);
  
  // Apply theme change immediately for visual feedback
  useEffect(() => {
    if (rightbar.settingsOpen) {
      document.documentElement.className = localSettings.theme;
    }
  }, [localSettings.theme, rightbar.settingsOpen]);

  const handleClose = () => {
    // Revert to original theme if changes are not saved
    document.documentElement.className = settings.theme;
    toggle('settingsOpen');
  };
  
  const handleSave = () => {
    setSettings(localSettings);
    toggle('settingsOpen');
    window.toast?.('Settings saved!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
        setLocalSettings(JSON.parse(JSON.stringify(defaultSettings)));
        window.toast?.('Settings have been reset. Click Save to apply.');
    }
  };
  
  const handleSettingChange = (category, key, value) => {
      if (category === 'theme') { // Special case for top-level theme
          setLocalSettings(prev => ({ ...prev, theme: key }));
          return;
      }
      setLocalSettings(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              [key]: value,
          },
      }));
  };

  if (!rightbar.settingsOpen) return null

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette, content: <AppearanceSettings settings={localSettings} onChange={handleSettingChange} /> },
    { id: 'chart', label: 'Chart', icon: CandlestickChart, content: <ChartSettings settings={localSettings} onChange={handleSettingChange} /> },
    { id: 'trading', label: 'Trading', icon: Sliders, content: <TradingSettings settings={localSettings} onChange={handleSettingChange} /> },
    { id: 'ai', label: 'AI', icon: BrainCircuit, content: <AISettings settings={localSettings} onChange={handleSettingChange} /> },
    { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard, content: <HotkeysPanel /> },
    { id: 'about', label: 'About', icon: Info, content: <AboutPanel /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4 animate-fade-in-up" data-dev-name="SettingsModal" onClick={handleClose}>
        <div className="bg-[#1A1F2A] border border-[#2A3040] rounded-lg shadow-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] md:h-[70vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-b-[#2A3040] flex-shrink-0">
                <h2 className="text-lg font-bold text-white">Settings</h2>
                <button onClick={handleClose} className="p-1 rounded-full text-[#8A93A2] hover:text-white hover:bg-[#2A3040]">
                    <X size={20} />
                </button>
            </header>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-r-[#2A3040] p-2 md:p-4 flex flex-row md:flex-col gap-1 md:gap-2 bg-[#12161D]/50 overflow-x-auto md:overflow-x-visible">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 w-full p-2 rounded-md text-sm text-left transition-colors flex-shrink-0 ${activeTab === tab.id ? 'bg-[#3E8BF3] text-white' : 'text-[#E1E3E6] hover:bg-[#2A3040]'}`}>
                            <tab.icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </aside>
                <main className="flex-1 overflow-y-auto p-3 sm:p-6 text-sm text-[#E1E3E6]">
                    {tabs.find(t => t.id === activeTab)?.content}
                </main>
            </div>
             <footer className="flex items-center justify-end p-4 border-t border-t-[#2A3040] flex-shrink-0 gap-3 bg-[#12161D]/50">
                 <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold text-[#8A93A2] hover:text-white rounded-md">Reset to Defaults</button>
                 <button onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-[#E1E3E6] bg-[#2A3040] hover:bg-[#383f52] rounded-md">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#3E8BF3] hover:bg-[#1E66D6] rounded-md flex items-center gap-2"><Save size={16}/> Save Changes</button>
            </footer>
        </div>
    </div>
  );
};