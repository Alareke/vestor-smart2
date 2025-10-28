import React from 'react';
import { Bell, RefreshCw, Layers, Activity, List, SlidersHorizontal, Hexagon } from 'lucide-react';
import { useUIStore } from './ui.ts';
import ChartScaleContextMenu from './ChartScaleContextMenu.jsx';

export default function RightToolbar() {
    const { toggle, setRightSidebarView } = useUIStore();
    
    const Btn = ({ title, onClick, children, "data-dev-name": dataDevName }) => (
        <button 
            title={title} 
            onClick={onClick} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2A3040]/50 hover:bg-[#3E8BF3] text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1A1F2A]"
            data-dev-name={dataDevName}
        >
            {children}
        </button>
    );

    const toggleDock = (tab) => window.dispatchEvent(new CustomEvent('dock:toggle', { detail: { tab } }));

    return (
        <>
            <aside 
                className="fixed bottom-16 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 p-2 bg-[#1A1F2A]/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg z-50"
                data-dev-name="FloatingToolbar"
            >
                <Btn title="التنبيهات" onClick={() => toggle('alertsOpen')} data-dev-name="FloatingToolbar.Alerts"><Bell size={18} /></Btn>
                <Btn title="إعادة التحميل" onClick={() => window.dispatchEvent(new CustomEvent('chart:reload'))} data-dev-name="FloatingToolbar.Reload"><RefreshCw size={18} /></Btn>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <Btn title="التداول" onClick={() => toggleDock('trading')} data-dev-name="FloatingToolbar.Trading"><Activity size={18} /></Btn>
                <Btn title="قائمة المراقبة" onClick={() => toggle('leftPanelOpen')} data-dev-name="FloatingToolbar.Watchlist"><List size={18} /></Btn>
                <Btn 
                    title="إعدادات المخطط" 
                    onClick={() => toggle('settingsOpen', 'chart')} 
                    data-dev-name="FloatingToolbar.ChartSettings"
                >
                    <SlidersHorizontal size={18} />
                </Btn>
                <Btn title="الإعدادات" onClick={() => toggle('settingsOpen')} data-dev-name="FloatingToolbar.Settings"><Hexagon size={18} /></Btn>
                <Btn title="الطبقات" onClick={() => setRightSidebarView('Layers')} data-dev-name="FloatingToolbar.Layers"><Layers size={18} /></Btn>
            </aside>
        </>
    );
}