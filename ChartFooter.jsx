/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const ChartFooter = ({ onTimeRangeChange }) => {
    const timeRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
    return (
        <div className="flex items-center justify-between px-2 pb-1 text-xs text-[#8A93A2]" data-dev-name="ChartArea.Footer">
            <div className="flex items-center gap-1">
                {timeRanges.map(range => 
                    <button 
                        key={range} 
                        onClick={() => onTimeRangeChange(range)}
                        className="hover:text-white hover:bg-[#2A3040] px-2 py-1 rounded-md transition-colors" 
                        data-dev-name={`ChartArea.Footer.TimeRange.${range}`}
                    >
                        {range}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span>15:45:22 (UTC+3)</span>
                <span>ADJ</span>
            </div>
        </div>
    )
};

export default ChartFooter;