/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Search, Plus, CandlestickChart, AreaChart, BarChart3, LineChart,
  GitCommitVertical, AppWindow, AlarmClock, Rewind, Undo, Redo,
  ChevronDown, Camera, Frame, Zap, Hexagon, Save, FolderOpen, PanelTop,
  Square, Code, Trash2, LayoutGrid, BarChart, Waves, Maximize, GitCommit, Check, MoreVertical, SlidersHorizontal,
  Globe, Share2
} from 'lucide-react';
import { useUIStore, useSettingsStore } from './ui.ts';
import { t } from './ui.ts';

const VestorSmartLogo = () => {
    return (
        <img
            src="https://i.ibb.co/DgTDSpjZ/3-vestor.png"
            alt="Vestor Smart Logo"
            width="64"
            className="flex-shrink-0"
        />
    );
};

const LanguageSwitcher = () => {
    const { settings, setSettings } = useSettingsStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const currentLang = settings.general.language;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
    ];

    const changeLanguage = (langCode) => {
        setSettings(prev => ({
            ...prev,
            general: { ...prev.general, language: langCode },
        }));
        localStorage.setItem("vestor_lang", langCode);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <IconButton icon={Globe} onClick={() => setIsOpen(p => !p)} title={t('header_change_language')} data-dev-name="Header.LanguageSwitcherButton" />
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 text-sm">
                    <ul className="py-1">
                        {languages.map(lang => (
                             <li key={lang.code}>
                                <button
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040] ${currentLang === lang.code ? 'font-bold' : ''}`}
                                >
                                    <span>{lang.name}</span>
                                    {currentLang === lang.code && <Check size={16} className="text-blue-400" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
};


const IconButton = ({
  icon: Icon,
  className = '',
  size = 18,
  onClick,
  active,
  title,
  disabled,
  "data-dev-name": dataDevName
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-md text-[#8A93A2] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'bg-[#2A3040] !text-white' : 'hover:bg-[#1A1F2A]'} ${className}`}
    data-dev-name={dataDevName}
  >
    <Icon size={size} />
  </button>
);

const TextButton = ({
  children,
  className = '',
  onClick,
  title,
  "data-dev-name": dataDevName
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-2 py-1 text-[#8A93A2] hover:text-white text-sm rounded-md hover:bg-[#1A1F2A] ${className}`}
    data-dev-name={dataDevName}
  >
    {children}
  </button>
);

const LayoutDropdown = ({ closeDropdown, onSaveLayout, onLoadLayout, onResetLayout, onDeleteLayout, layouts, activeLayoutName }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);
  
  const handleSave = () => {
    if (newName) {
        onSaveLayout(newName);
        closeDropdown();
    }
  }
  
  const handleDelete = (e, name) => {
      e.stopPropagation();
      if(confirm(t('layout_confirm_delete', { name }))) {
          onDeleteLayout(name);
      }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-56 bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 text-sm"
      data-dev-name="Header.LayoutDropdown"
    >
      <ul className="py-2">
        <li>
          <button onClick={handleSave} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]">
            <Save size={16} /><span>{t('layout_save_as')}</span>
          </button>
        </li>
        <li>
          <button onClick={onResetLayout} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]">
            <PanelTop size={16} /><span>{t('layout_reset_default')}</span>
          </button>
        </li>
        {layouts.length > 0 && <div className="h-px bg-[#2A3040] my-2"></div>}
        {layouts.map((name) => {
            const isActive = name === activeLayoutName;
            return (
                <li key={name}>
                  <button onClick={() => { onLoadLayout(name); closeDropdown(); }} className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-[#E1E3E6] group transition-colors ${isActive ? 'bg-[#3E8BF3] text-white hover:bg-[#3E8BF3]' : 'hover:bg-[#2A3040]'}`}>
                    <div className={`flex items-center gap-3 ${isActive ? 'font-bold' : ''}`}>
                        {isActive ? <Check size={16} /> : <FolderOpen size={16} />}
                        <span>{name}</span>
                    </div>
                    <div onClick={(e) => handleDelete(e, name)} className="p-1 rounded-md text-transparent group-hover:text-[#8A93A2] hover:!text-red-400"><Trash2 size={14}/></div>
                  </button>
                </li>
            );
        })}
      </ul>
    </div>
  );
};

const LayoutSelectionDropdown = ({ onLayoutChange, closeDropdown, currentLayout }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  const layouts = [
    { id: 'single', name: t('layout_single_pane'), icon: Square },
    { id: 'grid', name: t('layout_grid_view'), icon: LayoutGrid },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-48 bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 text-sm"
      data-dev-name="Header.LayoutSelectionDropdown"
    >
      <ul className="py-1">
        {layouts.map((layout) => (
          <li key={layout.id}>
            <button
              type="button"
              onClick={() => {
                onLayoutChange(layout.id);
                closeDropdown();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040] rounded-md mx-1 ${currentLayout === layout.id ? '!bg-[#3E8BF3] text-white' : ''}`}
              data-dev-name={`Header.LayoutSelectionDropdown.${layout.id}`}
            >
              <layout.icon size={16} />
              <span>{layout.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChartTypeDropdown = ({ onChartTypeChange, closeDropdown, currentChartType }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  const chartTypes = [
    { id: 'Candlestick', name: t('chart_type_candles'), icon: CandlestickChart },
    { id: 'Bar', name: t('chart_type_bars'), icon: BarChart3 },
    { id: 'Line', name: t('chart_type_line'), icon: LineChart },
    { id: 'Area', name: t('chart_type_area'), icon: AreaChart },
    { id: 'HeikinAshi', name: t('chart_type_heikin_ashi'), icon: Waves },
  ];

  return (
    <div
        ref={dropdownRef}
        className="absolute top-full left-0 mt-2 w-48 bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 text-sm"
        data-dev-name="Header.ChartTypeDropdown"
      >
        <ul className="py-1">
          {chartTypes.map((chart) => (
            <li key={chart.id}>
              <button
                type="button"
                onClick={() => { onChartTypeChange(chart.id); closeDropdown(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040] rounded-md mx-1 ${currentChartType === chart.id ? '!bg-[#3E8BF3] text-white' : ''}`}
                data-dev-name={`Header.ChartTypeDropdown.${chart.id}`}
              >
                <chart.icon size={16} />
                <span>{chart.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
  );
};

const MobileMenuDropdown = ({
    closeDropdown, onTimeframeChange, onChartLayoutChange, onChartTypeChange,
    onToggleZenMode, onToggleFullscreen, onSaveLayout, onUndo, onRedo,
    onToggleReplayMode, handlePublish, currentStock
}) => {
    const dropdownRef = useRef(null);
    const { toggle, setRightSidebarView, drawingHistory, drawingRedoStack } = useUIStore();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeDropdown]);

    const handleAction = (action) => {
        action();
        closeDropdown();
    };
    
    const handleSave = () => {
      if (newName) onSaveLayout(newName);
    }

    return (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-50 text-sm">
            <div className="p-2">
                <p className="text-xs text-[#8A93A2] px-2 font-bold uppercase">{t('mobile_menu_timeframe')}</p>
                <div className="flex justify-around mt-1">
                    <TextButton onClick={() => handleAction(() => onTimeframeChange('1D'))}>1D</TextButton>
                    <TextButton onClick={() => handleAction(() => onTimeframeChange('1W'))}>W</TextButton>
                    <TextButton onClick={() => handleAction(() => onTimeframeChange('1M'))}>M</TextButton>
                </div>
            </div>
            <div className="h-px bg-[#2A3040] my-1"></div>
            <ul className="py-1">
                <li><button onClick={() => handleAction(() => onChartLayoutChange('single'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Square size={16} /> {t('layout_single_pane')}</button></li>
                <li><button onClick={() => handleAction(() => onChartLayoutChange('grid'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><LayoutGrid size={16} /> {t('layout_grid_view')}</button></li>
                <li><button onClick={() => handleAction(() => onChartTypeChange('Candlestick'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><CandlestickChart size={16} /> {t('chart_type_candles')}</button></li>
                <li><button onClick={() => handleAction(() => setRightSidebarView('Indicators'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><GitCommit size={16}/> {t('header_indicators')}</button></li>
            </ul>
            <div className="h-px bg-[#2A3040] my-1"></div>
             <ul className="py-1">
                <li><button onClick={() => handleAction(() => handleSave())} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Save size={16}/> {t('layout_save_as')}</button></li>
                <li><button onClick={() => handleAction(() => setRightSidebarView('Alarms'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><AlarmClock size={16}/> {t('header_alert')}</button></li>
                <li><button onClick={() => handleAction(onToggleReplayMode)} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Rewind size={16}/> {t('header_replay')}</button></li>
                <li className="flex items-center">
                    <button onClick={() => handleAction(onUndo)} disabled={drawingHistory.length === 0} className="flex-1 w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040] disabled:opacity-50"><Undo size={16} /> {t('header_undo')}</button>
                    <button onClick={() => handleAction(onRedo)} disabled={drawingRedoStack.length === 0} className="flex-1 w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040] disabled:opacity-50"><Redo size={16} /> {t('header_redo')}</button>
                </li>
            </ul>
             <div className="h-px bg-[#2A3040] my-1"></div>
             <ul className="py-1">
                <li><button onClick={() => handleAction(() => window.dispatchEvent(new CustomEvent('chart:screenshot')))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Camera size={16} /> {t('header_snapshot')}</button></li>
                <li><button onClick={() => handleAction(() => toggle('settingsOpen'))} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><SlidersHorizontal size={16} /> {t('header_settings')}</button></li>
                <li><button onClick={() => handleAction(onToggleZenMode)} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Maximize size={16} /> {t('header_zen_mode')}</button></li>
                <li><button onClick={() => handleAction(onToggleFullscreen)} className="w-full flex items-center gap-3 px-3 py-2 text-[#E1E3E6] hover:bg-[#2A3040]"><Frame size={16} /> {t('header_fullscreen')}</button></li>
            </ul>
             <div className="h-px bg-[#2A3040] my-1"></div>
             <div className="p-2">
                 <button
                    type="button"
                    className="w-full bg-[#3E8BF3] hover:bg-[#1E66D6] text-white text-sm font-semibold px-4 py-2 rounded-md"
                    onClick={() => handleAction(handlePublish)}
                >
                    {t('header_publish')}
                </button>
            </div>
        </div>
    );
};


export default function Header({
  currentStock,
  chartLayout,
  onChartLayoutChange,
  chartType,
  onChartTypeChange,
  onTimeframeChange,
  isReplayMode,
  onToggleReplayMode,
  isDevMode,
  onToggleDevMode,
  onToggleFullscreen,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
  onResetLayout,
  onToggleZenMode,
  activeLayoutName,
  savedLayouts,
  onUndo,
  onRedo,
}) {
  const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);
  const [isLayoutSelectionOpen, setIsLayoutSelectionOpen] = useState(false);
  const [isChartTypeOpen, setIsChartTypeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggle, setRightSidebarView, drawingHistory, drawingRedoStack } = useUIStore();
  const { settings } = useSettingsStore();
  
  const chartTypes = [
    { id: 'Candlestick', icon: CandlestickChart },
    { id: 'Bar', icon: BarChart3 },
    { id: 'Line', icon: LineChart },
    { id: 'Area', icon: AreaChart },
    { id: 'HeikinAshi', icon: Waves },
  ];
  const CurrentChartIcon = chartTypes.find(c => c.id === chartType)?.icon || BarChart;
  
  const openSearch = () => window.dispatchEvent(new CustomEvent('search:open'));

  const handlePublish = () => {
    window.dispatchEvent(new CustomEvent('chart:screenshot'));
    setTimeout(() => {
        if (idea) {
            console.log("PUBLISHED IDEA:", { idea, symbol: currentStock, timeframe: 'Current' });
            window.toast?.(t('publish_success'));
        }
    }, 200);
  };

  return (
    <div className="h-[56px] bg-[#12161D] flex items-center justify-between px-2 sm:px-4 flex-shrink-0" data-dev-name="Header">
      <div className="flex items-center gap-1 sm:gap-2">
        <IconButton icon={Menu} onClick={() => toggle('leftPanelOpen')} title={t('header_toggle_watchlist')} data-dev-name="Header.MenuButton" />
        
        <div className="flex items-center gap-2">
            <VestorSmartLogo />
            <h1 className="text-lg font-bold tracking-wider text-white hidden sm:block font-tajawal">Vestor Smart</h1>
        </div>
        
        <div className="h-6 w-px bg-[#2A3040] mx-1 hidden sm:block"></div>

        <div
          className="flex items-center gap-1 bg-[#1A1F2A] rounded-md p-1 cursor-pointer hover:bg-[#2A3040] transition-colors"
          data-dev-name="Header.StockSearch"
          onClick={openSearch}
        >
          <Search size={16} className="text-[#8A93A2] ml-1" />
          <span
            className="bg-transparent text-white w-14 focus:outline-none text-sm uppercase px-1 text-center"
            data-dev-name="Header.StockSearch.Display"
          >
            {currentStock}
          </span>
        </div>
        <IconButton icon={Plus} onClick={openSearch} title={t('header_add_symbol')} data-dev-name="Header.AddSymbolButton" className="hidden sm:flex" />
        <div className="h-6 w-px bg-[#2A3040] mx-1 hidden md:block"></div>
        <TextButton className="hidden md:block" data-dev-name="Header.Timeframe.1h" onClick={() => onTimeframeChange('1D')}>1D</TextButton>
        <div className="relative hidden md:block">
          <IconButton
            icon={chartLayout === 'grid' ? LayoutGrid : Square}
            onClick={() => setIsLayoutSelectionOpen(prev => !prev)}
            active={isLayoutSelectionOpen}
            title={t('header_chart_layout')}
            data-dev-name="Header.LayoutSelectionButton"
          />
          {isLayoutSelectionOpen && (
            <LayoutSelectionDropdown
              onLayoutChange={onChartLayoutChange}
              closeDropdown={() => setIsLayoutSelectionOpen(false)}
              currentLayout={chartLayout}
            />
          )}
        </div>
        {chartLayout === 'single' && (
           <div className="relative hidden md:block">
             <button
                onClick={() => setIsChartTypeOpen(p => !p)}
                title={t('header_chart_type_change')}
                className={`flex items-center gap-2 p-2 rounded-md text-[#8A93A2] hover:text-white transition-colors ${isChartTypeOpen ? 'bg-[#2A3040] !text-white' : 'hover:bg-[#1A1F2A]'}`}
                data-dev-name="Header.ChartTypeButton"
             >
                <CurrentChartIcon size={18}/>
                <ChevronDown size={14}/>
            </button>
            {isChartTypeOpen && <ChartTypeDropdown onChartTypeChange={onChartTypeChange} closeDropdown={() => setIsChartTypeOpen(false)} currentChartType={chartType}/>}
           </div>
        )}
        <TextButton className="hidden md:flex" onClick={() => setRightSidebarView('Indicators')} title={t('header_indicators')} data-dev-name="Header.IndicatorsButton"><GitCommit size={16} className="inline-block rtl:ml-1 ltr:mr-1"/>{t('header_indicators')}</TextButton>
        <IconButton icon={AppWindow} onClick={() => setIsLayoutDropdownOpen(p => !p)} title={t('header_layouts_templates')} data-dev-name="Header.TemplatesButton" className="hidden md:flex" />
        <div className="h-6 w-px bg-[#2A3040] mx-1 hidden md:block"></div>
        <TextButton className="hidden md:block" data-dev-name="Header.Interval.M" onClick={() => onTimeframeChange('1M')}>M</TextButton>
        <TextButton className="hidden md:block" data-dev-name="Header.Interval.W" onClick={() => onTimeframeChange('1W')}>W</TextButton>
        <div className="h-6 w-px bg-[#2A3040] mx-1 hidden md:block"></div>
        <div className="items-center gap-1 hidden md:flex" data-dev-name="Header.Alert">
          <IconButton icon={AlarmClock} onClick={() => setRightSidebarView('Alarms')} title={t('header_create_alert')} />
          <TextButton onClick={() => setRightSidebarView('Alarms')} title={t('header_create_alert')}>{t('header_alert')}</TextButton>
        </div>
        <div className="items-center gap-1 hidden md:flex" data-dev-name="Header.Replay">
          <IconButton icon={Rewind} onClick={onToggleReplayMode} active={isReplayMode} title={t('header_bar_replay')}/>
          <TextButton onClick={onToggleReplayMode} className={isReplayMode ? 'text-blue-400' : ''} title={t('header_bar_replay')}>{t('header_replay')}</TextButton>
        </div>
        <div className="h-6 w-px bg-[#2A3040] mx-1 hidden md:block"></div>
        <IconButton icon={Undo} onClick={onUndo} disabled={drawingHistory.length === 0} title={t('header_undo')} data-dev-name="Header.UndoButton" className="hidden md:flex" />
        <IconButton icon={Redo} onClick={onRedo} disabled={drawingRedoStack.length === 0} title={t('header_redo')} data-dev-name="Header.RedoButton" className="hidden md:flex" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <div className="relative hidden md:block">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
            className={`flex items-center p-1 rounded-md cursor-pointer ${isLayoutDropdownOpen ? 'bg-[#1A1F2A]' : 'hover:bg-[#1A1F2A]'}`}
            title={t('header_manage_layouts')}
            data-dev-name="Header.LayoutButton"
          >
            <span className="px-2 py-1 text-[#8A93A2] hover:text-white text-sm rounded-md truncate max-w-36" title={activeLayoutName || t('header_layouts')}>{activeLayoutName || t('header_layouts')}</span>
            <ChevronDown size={16} className="text-[#8A93A2] mr-1" />
          </div>
          {isLayoutDropdownOpen && <LayoutDropdown 
            closeDropdown={() => setIsLayoutDropdownOpen(false)} 
            onSaveLayout={onSaveLayout} 
            onLoadLayout={onLoadLayout} 
            onResetLayout={onResetLayout} 
            onDeleteLayout={onDeleteLayout}
            layouts={savedLayouts}
            activeLayoutName={activeLayoutName}
          />}
        </div>
        <IconButton icon={Code} onClick={onToggleDevMode} active={isDevMode} title={t('header_toggle_dev_mode')} data-dev-name="Header.DevModeToggle" className="hidden md:flex" />
        <IconButton icon={Zap} onClick={() => toggle('settingsOpen')} title={t('header_quick_settings')} data-dev-name="Header.QuickSettingsButton" className="hidden md:flex" />
        <IconButton icon={Hexagon} onClick={() => toggle('settingsOpen')} title={t('header_settings')} data-dev-name="Header.SettingsButton" className="hidden md:flex" />
        <IconButton icon={Maximize} onClick={onToggleZenMode} title={t('header_zen_mode')} data-dev-name="Header.ZenModeButton" className="hidden md:flex" />
        <IconButton icon={Frame} onClick={onToggleFullscreen} title={t('header_fullscreen')} data-dev-name="Header.FullscreenButton" className="hidden md:flex" />
        <IconButton icon={Camera} title={t('header_snapshot')} onClick={() => window.dispatchEvent(new CustomEvent('chart:screenshot'))} data-dev-name="Header.ScreenshotButton" className="hidden md:flex" />
        <button
          type="button"
          className="bg-[#3E8BF3] hover:bg-[#1E66D6] text-white text-sm font-semibold px-4 py-2 rounded-md ml-2 hidden md:block"
          data-dev-name="Header.PublishButton"
          title={t('header_publish_idea')}
          onClick={handlePublish}
        >
          {t('header_publish')}
        </button>

        {/* Mobile More Menu */}
        <div className="relative md:hidden">
            <IconButton icon={MoreVertical} onClick={() => setIsMobileMenuOpen(p => !p)} active={isMobileMenuOpen} title={t('header_more_options')} />
            {isMobileMenuOpen && (
                <MobileMenuDropdown
                    closeDropdown={() => setIsMobileMenuOpen(false)}
                    onTimeframeChange={onTimeframeChange}
                    onChartLayoutChange={onChartLayoutChange}
                    onChartTypeChange={onChartTypeChange}
                    onToggleZenMode={onToggleZenMode}
                    onToggleFullscreen={onToggleFullscreen}
                    onSaveLayout={onSaveLayout}
                    onUndo={onUndo}
                    onRedo={onRedo}
                    onToggleReplayMode={onToggleReplayMode}
                    handlePublish={handlePublish}
                    currentStock={currentStock}
                />
            )}
        </div>
      </div>
    </div>
  );
}