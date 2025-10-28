/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Chart Data Generation
export const generateChartData = (startValue: number, change: number, isStock = true, timeframe = '1Y') => {
    const dataPoints = { 'Day': 48, '1M': 60, '3M': 90, '1Y': 120, '5Y': 250, 'All': 500 }[timeframe] || 120;
    const volatility = isStock ? 0.025 : 0.008;
    const trend = change / startValue / dataPoints;

    const data = [];
    let lastClose = startValue;

    for (let i = 0; i < dataPoints; i++) {
        const open = lastClose;
        const randomFactor = Math.random() - 0.5;
        let close = open * (1 + trend + randomFactor * volatility * 2);
        if(close <= 0) close = open * 0.98;

        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        
        const baseVolume = 1_000_000;
        const volume = baseVolume * (1 + Math.random() * 2) * (1 + Math.abs(randomFactor) * 5);

        data.push({
            open, high, low, close,
            volume,
            volumeColor: close >= open ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        });

        lastClose = close;
    }
    
    let xAxisLabels = [];
    const now = new Date();
    switch (timeframe) {
        case 'Day':
            xAxisLabels = ['09:00', '11:00', '13:00', '15:00', '17:00'];
            break;
        case '1M':
            xAxisLabels = Array.from({ length: 4 }, (_, i) => {
                const date = new Date(now);
                date.setDate(now.getDate() - (3 - i) * 7);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            break;
        case '1Y':
             xAxisLabels = Array.from({ length: 4 }, (_, i) => {
                const date = new Date(now);
                date.setMonth(now.getMonth() - (3 - i) * 3);
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            });
            break;
        default:
             xAxisLabels = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - (4 - i)));
            break;
    }

    return {
        data,
        xAxisLabels,
        color: change >= 0 ? '#22c55e' : '#ef4444',
    };
};

// Generic Stock Details Template
export const genericDetailsTemplate = {
    exchange: 'NASDAQ',
    sectorKey: 'stock_detail_aapl_sector',
    marketStatusKey: 'stock_detail_market_open',
    newsAlertKey: 'stock_detail_news_alert',
    keyStats: {
        earningsReportLabelKey: 'earnings_report_label',
        earningsReportValueKey: 'earnings_report_value',
        volumeLabelKey: 'volume_label',
        volumeValue: '6.03M',
        avgVolumeLabelKey: 'avg_volume_label',
        avgVolumeValue: '51.44M',
        marketCapLabelKey: 'market_cap_label',
        marketCapValue: '3.18T',
        dividendYieldLabelKey: 'dividend_yield_label',
        dividendYieldValue: '0.49%',
        peRatioLabelKey: 'pe_ratio_label',
        peRatioValue: '33.38',
    },
    performance: {
        ytd: '25.67',
        '1y': '45.12',
        '6m': '18.90',
        '3m': '8.23',
        '1m': '5.60',
        '1w': '-1.25'
    },
    technicalAnalysis: {
        value: 80,
        labelKey: 'strong_buy'
    },
    analystRatings: {
        value: 90,
        labelKey: 'strong_buy',
        targetPrice: '250.00',
        targetChangePct: 21.69
    },
    profile: {
        websiteLabelKey: 'website_label',
        websiteValue: 'apple.com',
        employeesLabelKey: 'employees_label',
        employeesValue: '161',
        employeesValueSuffixKey: 'employees_value_suffix',
        isinLabelKey: 'isin_label',
        isinValue: 'US0378331005',
        figiLabelKey: 'figi_label',
        figiValue: 'BBG000B9XRY4',
        descriptionKey: 'description_text_aapl'
    },
    earningsData: [
        { quarter: 'Q2 24', actual: 1.53, expected: 1.51 },
        { quarter: 'Q3 24', actual: 1.33, expected: 1.32 },
        { quarter: 'Q4 24', actual: 2.18, expected: 2.10 },
        { quarter: 'Q1 25', actual: 2.25, expected: 2.21 },
    ],
    incomeStatementData: [
      { quarter: "Q3 '23", revenue: 81.8, netProfit: 19.88, netMargin: 24.3 },
      { quarter: "Q4 '23", revenue: 89.5, netProfit: 22.96, netMargin: 25.6 },
      { quarter: "Q1 '24", revenue: 119.58, netProfit: 33.92, netMargin: 28.4 },
      { quarter: "Q2 '24", revenue: 90.75, netProfit: 23.64, netMargin: 26.0 },
    ],
    ownershipData: [
      { month: 'Jan', '2023': 58.2, '2024': 60.1, '2025': 62.5 },
      { month: 'Feb', '2023': 58.5, '2024': 60.3, '2025': 62.8 },
      { month: 'Mar', '2023': 58.9, '2024': 60.7, '2025': 63.1 },
      { month: 'Apr', '2023': 59.1, '2024': 61.2, '2025': 63.5 },
    ],
};