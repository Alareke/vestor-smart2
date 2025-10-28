/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSettingsStore, useUIStore } from './ui.ts';
import { RefreshCw, Check, ChevronLeft, Hexagon } from 'lucide-react';

const MenuItem = ({ children, onClick, shortcut, checked, className = '' }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-[#E1E3E6] hover:bg-[#2A3040] text-left rounded-sm ${className}`}
    >
        <div className="flex-1 flex items-center">
            {children}
        </div>
        <div className="flex items-center">
            {shortcut && <span className="text-[#8A93A2] mr-4">{shortcut}</span>}
            <div className="w-4 h-4 flex items-center justify-center">
                {checked && <Check size={16} />}
            </div>
        </div>
    </button>
);

const CheckboxItem = ({ children, checked, onChange, shortcut }) => (
     <button 
        onClick={() => onChange(!checked)} 
        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-[#E1E3E6] hover:bg-[#2A3040] text-left rounded-sm"
    >
        <div className="flex-1 flex items-center gap-2">
             <div className="w-4 h-4 flex items-center justify-center">
                {checked && <Check size={16} />}
            </div>
            {children}
        </div>
        {shortcut && <span className="text-[#8A93A2]">{shortcut}</span>}
    </button>
);


const Divider = () => <div className="h-px bg-[#2A3040] my-1" />;

const ChartScaleContextMenu = ({ isOpen, onClose, anchorEl }) => {
    const { settings, setSettings } = useSettingsStore();
    const { toggle } = useUIStore();
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && anchorEl && menuRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            setPosition({
                top: anchorRect.top - menuRect.height - 8,
                left: anchorRect.left + (anchorRect.width / 2) - (menuRect.width / 2),
            });
        }
    }, [isOpen, anchorEl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && anchorEl && !anchorEl.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, anchorEl]);

    if (!isOpen) return null;

    const handleChartSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            chart: {
                ...prev.chart,
                [key]: value
            }
        }));
    };
    
    const handleResetScale = () => {
        window.dispatchEvent(new CustomEvent('chart:reset_scale'));
        handleChartSettingChange('autoScale', true); // Ensure autoscale is re-enabled
        onClose();
    };

    const handleOpenSettings = () => {
        toggle('settingsOpen');
        onClose();
    };

    const scaleModes = [
        { id: 'normal', name: 'عادي' },
        { id: 'percentage', name: 'نسبة مئوية', shortcut: 'Alt + P' },
        { id: 'indexedTo100', name: 'مدرجة إلى 100' },
        { id: 'logarithmic', name: 'لوغاريتمي', shortcut: 'Alt + L' },
    ];

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="fixed bg-[#1A1F2A] border border-[#2A3040] rounded-md shadow-lg z-[100] p-1 w-64 animate-fade-in-up"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            <MenuItem onClick={handleResetScale}>
                <RefreshCw size={14} className="mr-2"/> إعادة تعيين مقياس السعر
            </MenuItem>

            <Divider />

            <CheckboxItem checked={settings.chart.autoScale} onChange={(val) => handleChartSettingChange('autoScale', val)}>
                تلقائي (تناسب البيانات مع حجم الشاشة)
            </CheckboxItem>
             <CheckboxItem checked={settings.chart.lockPriceToBarRatio} onChange={(val) => handleChartSettingChange('lockPriceToBarRatio', val)}>
                قفل نسبة السعر للعمود البياني
            </CheckboxItem>
            <CheckboxItem checked={settings.chart.invertScale} onChange={(val) => handleChartSettingChange('invertScale', val)} shortcut="Alt + I">
                عكس المقياس
            </CheckboxItem>

            <Divider />
            
            {scaleModes.map(mode => (
                <MenuItem
                    key={mode.id}
                    onClick={() => handleChartSettingChange('scaleMode', mode.id)}
                    checked={settings.chart.scaleMode === mode.id}
                    shortcut={mode.shortcut}
                >
                    {mode.name}
                </MenuItem>
            ))}

            <Divider />
            
            <MenuItem onClick={() => handleChartSettingChange('scalePosition', settings.chart.scalePosition === 'right' ? 'left' : 'right')}>
                حرك المقياس إلى {settings.chart.scalePosition === 'right' ? 'اليسار' : 'اليمين'}
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={() => handleChartSettingChange('showPriceLabels', !settings.chart.showPriceLabels)}>
                <ChevronLeft size={16} className="mr-2"/>
                عناوين
            </MenuItem>
            <MenuItem onClick={() => handleChartSettingChange('showGridLines', !settings.chart.showGridLines)}>
                <ChevronLeft size={16} className="mr-2"/>
                الخطوط
            </MenuItem>
            <CheckboxItem checked={settings.chart.showPlusButton} onChange={(val) => handleChartSettingChange('showPlusButton', val)}>
                زر زائد
            </CheckboxItem>
            
            <Divider />
            
            <MenuItem onClick={handleOpenSettings}>
                <Hexagon size={14} className="mr-2"/>
                المزيد من الإعدادات...
            </MenuItem>

        </div>,
        document.body
    );
};

export default ChartScaleContextMenu;