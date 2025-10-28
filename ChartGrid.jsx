/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ChartArea from './ChartArea.jsx';

const chartTypes = [
    { type: 'Candlestick', name: 'Candles' },
    { type: 'Line', name: 'Line' },
    { type: 'Area', name: 'Area' },
    { type: 'Bar', name: 'Bars' },
];

const ChartGrid = ({ layout, stockSymbol, chartType, timeframe, timeRange, onTimeRangeChange, ...restOfProps }) => {
    if (layout === 'single') {
        return (
            <ChartArea 
                stockSymbol={stockSymbol} 
                chartType={chartType} 
                timeframe={timeframe}
                timeRange={timeRange}
                onTimeRangeChange={onTimeRangeChange}
                {...restOfProps} 
                isGridMode={false} 
            />
        );
    }

    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-px w-full h-full bg-[#2A3040]" data-dev-name="ChartGrid">
            {chartTypes.map(({ type, name }, index) => (
                <div key={type} className="flex flex-col bg-[#12161D] overflow-hidden">
                    <ChartArea 
                        stockSymbol={stockSymbol} 
                        chartType={type} 
                        timeframe={timeframe}
                        timeRange={timeRange}
                        onTimeRangeChange={onTimeRangeChange}
                        {...restOfProps} 
                        isGridMode={true} 
                        gridChartName={name}
                    />
                </div>
            ))}
        </div>
    );
};

export default ChartGrid;