/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Sparkles, X } from 'lucide-react';

// Centralized styles for different marker types to improve readability and maintainability.
const markerStyles = {
    info: { container: 'bg-[#3E8BF3] text-white', quantity: '', label: '', closeBg: 'hover:bg-blue-500' },
    'stop-loss': { container: '', quantity: 'bg-orange-400 text-black', label: 'bg-black text-orange-400', closeBg: 'bg-black hover:bg-gray-800' },
    'sell-stop': { container: '', quantity: 'bg-red-600 text-white', label: 'bg-red-500 text-white', closeBg: 'bg-red-500 hover:bg-red-600' },
    'take-profit': { container: '', quantity: 'bg-teal-600 text-white', label: 'bg-teal-500 text-white', closeBg: 'bg-teal-500 hover:bg-teal-600' },
    'buy-position': { container: 'border-l-4 border-green-500', quantity: 'bg-green-500 text-white', label: 'bg-[#2A3040] text-white', closeBg: 'bg-[#2A3040] hover:bg-red-500/50' },
    'sell-position': { container: 'border-l-4 border-red-500', quantity: 'bg-red-500 text-white', label: 'bg-[#2A3040] text-white', closeBg: 'bg-[#2A3040] hover:bg-red-500/50' },
};

/**
 * Renders a marker on the chart for events like AI insights, trades, or alerts.
 * It accepts position and data props to determine its appearance and location.
 */
const ChartMarker = ({ position, data, isHighlighted }) => {
    // Do not render if the position is not calculated (e.g., off-screen).
    if (!position || position.x === null || position.y === null) {
        return null;
    }

    const highlightClass = isHighlighted ? 'marker-highlight' : '';
    // Added a hover effect for better interactivity.
    const hoverEffect = 'transition-transform hover:scale-105';

    // Special rendering for AI-generated insight markers.
    if (data.type === 'ai-insight') {
        return (
            <div 
                className={`flex items-center gap-1.5 bg-[#1A1F2A] border border-[#9046FF] rounded-md px-2 py-1 text-white shadow-lg whitespace-nowrap ${highlightClass} ${hoverEffect}`} 
                style={{ 
                    position: 'absolute', 
                    top: position.y, 
                    left: position.x, 
                    transform: 'translateY(-50%)',
                    zIndex: isHighlighted ? 11 : 10 // Ensure highlighted markers are on top.
                }}
                data-dev-name={`ChartArea.Marker.AIInsight.${data.id}`}
            >
                <Sparkles size={12} className="text-[#9046FF]" />
                <span className="text-xs font-medium">{data.label}</span>
            </div>
        );
    }

    // Default rendering for trade-related markers.
    const styles = markerStyles[data.type] || {};
    
    const baseStyles = "flex items-center text-xs rounded-sm shadow-md overflow-hidden whitespace-nowrap cursor-pointer";
    const quantityStyles = "px-2 py-0.5 font-bold";
    const labelStyles = "px-2 py-0.5";
    const closeButtonStyles = "px-1 py-0.5 flex items-center justify-center";

    const handleClose = data.onClose || (() => window.dispatchEvent(new CustomEvent('ui:action', { detail: { source: 'auto', tool: '' } })));

    return (
        <div 
            className={`${baseStyles} ${styles.container} ${highlightClass} ${hoverEffect}`} 
            style={{ 
                position: 'absolute', 
                top: position.y, 
                left: position.x, 
                transform: 'translateY(-50%)',
                zIndex: isHighlighted ? 11 : 10 
            }} 
            data-dev-name={`ChartArea.Marker.${data.type}.${data.id}`}
        >
            {data.quantity && <div className={`${quantityStyles} ${styles.quantity}`}>{data.quantity}</div>}
            <div className={`${labelStyles} ${styles.label}`}>{data.label}</div>
            <button className={`${closeButtonStyles} ${styles.closeBg}`} onClick={handleClose}>
                <X size={12}/>
            </button>
        </div>
    );
};

export default ChartMarker;