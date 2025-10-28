/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CandlestickChart, BarChart, GitCompare, Code, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';

// --- DATA & TYPES ---

const countries = [
    { key: 'saudi', nameKey: 'country_saudi' },
    { key: 'usa', nameKey: 'country_usa' },
    { key: 'canada', nameKey: 'country_canada' },
    { key: 'uk', nameKey: 'country_uk' },
    { key: 'germany', nameKey: 'country_germany' },
    { key: 'india', nameKey: 'country_india' },
    { key: 'japan', nameKey: 'country_japan' },
    { key: 'china', nameKey: 'country_china' },
    { key: 'hk', nameKey: 'country_hk' },
    { key: 'australia', nameKey: 'country_australia' },
];

const marketCategories = [
    { key: 'indices', nameKey: 'markets_indices_title' },
    { key: 'stocks', nameKey: 'markets_stocks_title' },
    { key: 'futures', nameKey: 'markets_futures_title' },
    { key: 'bonds', nameKey: 'markets_gov_bonds_title' },
];

const generateRandomData = (base = 50, points = 13, volatility = 10) =>
  Array.from({ length: points }, (_, i) => ({
    x: i,
    y:
      base +
      (Math.random() - 0.5) * volatility * (i / 2) +
      Math.sin(i / 3) * (volatility / 3) +
      Math.random() * 5,
  }));

const generateTimeframedData = (colorTheme: 'green' | 'red' | 'purple') => {
  let base = 50 + Math.random() * 40;
  if (colorTheme === 'purple') base = 20 + Math.random() * 20;

  const generateSet = (volatility: number, length: number) => {
    const data = generateRandomData(base, length, volatility);
    return colorTheme === 'red' ? data.reverse() : data;
  };
  return {
    'يوم': generateSet(10, 13),
    '3 أشهر': generateSet(15, 30),
    '1 سنة': generateSet(25, 52),
    '5 سنوات': generateSet(40, 60),
    'الكل': generateSet(60, 80),
  };
};

const initialChartDataGreen = generateTimeframedData('green');
const initialChartDataRed = generateTimeframedData('red');
const initialChartDataPurple = generateTimeframedData('purple');

// --- DATA (كما هي) ---
const indices = [ { name: 'مؤشر قطاع مالي متنوع', value: '6,279.700 SAR', change: '+0.86%', isPositive: true }, { name: 'Market Capped Index (NomuC)', value: '26,891.390 SAR', change: '+0.51%', isPositive: true }, { name: 'Tadawul 30', value: '1,397.240 SAR', change: '-0.10%', isPositive: false }, { name: 'Tadawul All Share (TASI)', value: '10,839.450 SAR', change: '+0.06%', isPositive: true, active: true }, ];
const globalIndices = [ { name: 'FTSE 100', symbol: 'UKX', value: '9,104.31 GBP', change: '+0.39%', isPositive: true, logo: '🇬🇧', badge: { text: '100', color: 'bg-blue-500' } }, { name: 'Japan 225', symbol: 'NI225', value: '40,250.65 JPY', change: '-1.25%', isPositive: false, logo: '🇯🇵', badge: { text: '225', color: 'bg-red-500' } }, { name: 'Dow Jones', symbol: 'DJI', value: '43,893.52 USD', change: '+0.70%', isPositive: true, logo: '🇺🇸', badge: { text: '30', color: 'bg-sky-500' } }, { name: 'Nasdaq 100', symbol: 'NDX', value: '22,763.31 USD', change: '-1.96%', isPositive: false, logo: '🇺🇸', badge: { text: '100', color: 'bg-purple-500' } }, { name: 'S&P 500', symbol: 'SPX', value: '6,289.97 USD', change: '+0.83%', isPositive: true, logo: '🇺🇸', badge: { text: '500', color: 'bg-green-500' } }, ];
const saudiStocks = [ { name: 'Al Rajhi Bank', symbol: '1120', value: '95.15 SAR', change: '+0.69%', isPositive: true, logo: 'https://placehold.co/32x32/7E57C2/FFFFFF/png?text=R' }, { name: 'Saudi Telecom', symbol: 'stc', value: '41.72 SAR', change: '-0.34%', isPositive: false, logo: 'https://placehold.co/32x32/4CAF50/FFFFFF/png?text=S' }, { name: 'Saudi Aramco', symbol: 'aramco', value: '23.91 SAR', change: '-1.39%', isPositive: false, logo: 'https://placehold.co/32x32/1E88E5/FFFFFF/png?text=A' }, { name: 'Saudi National Bank', symbol: 'SNB', value: '54.75 SAR', change: '-0.37%', isPositive: false, logo: 'https://placehold.co/32x32/FFC107/FFFFFF/png?text=N', active: true }, ];
const communityInterests = [ { name: 'أرامكو', symbol: '1322', value: '65.45 SAR', change: '+1.71%', isPositive: true }, { name: 'صناعات كهربائية', symbol: '1303', value: '9.13 SAR', change: '+3.40%', isPositive: true }, { name: 'معادن', symbol: '1211', value: '52.20 SAR', change: '+2.15%', isPositive: true }, { name: 'الأهلي', symbol: '1180', value: '36.26 SAR', change: '-2.79%', isPositive: false }, { name: 'الإنماء', symbol: '1150', value: '26.02 SAR', change: '0.00%', isPositive: null, active: true } ];
const mostVolatileStocks = [ { name: 'نادك', value: '73.00 SAR', change: '-10.32%', symbol: '9644' }, { name: 'دار الأركان', value: '26.74 SAR', change: '-9.97%', symbol: '4193' }, { name: 'زين', value: '11.71 SAR', change: '-5.56%', symbol: '8170' } ];
const mostActiveStocks = [ { name: 'الراجحي', value: '45.64 SAR', change: '+8.56%', symbol: '9611' }, { name: 'سابك', value: '13.48 SAR', change: '+3.69%', symbol: '9639' }, { name: 'الدرع العربي', value: '13.92 SAR', change: '-4.20%', symbol: '8070' } ];
const worstPerformingStocks = [ { name: 'عذيب', value: '73.00 SAR', change: '-10.32%' }, { name: 'دار الأركان', value: '26.74 SAR', change: '-9.97%' }, { name: 'الإنماء', value: '11.71 SAR', change: '-5.56%' } ];
const bestPerformingStocks = [ { name: 'شمس', value: '1.03 SAR', change: '+9.57%' }, { name: 'أسيج', value: '32.80 SAR', change: '+9.33%' }, { name: 'باحة', value: '39.68 SAR', change: '+6.38%' } ];
const dividendSchedule = [ { day: 'اليوم', symbol: '2010', name: 'OJI HOLDINGS CORP', type: 'توزيع', dividend: '0.19 SAR' }, { day: 'اليوم', symbol: '4002', name: 'عراقي فلاحية', type: 'توزيع', dividend: '-0.17 SAR' }, { day: 'غداً', symbol: '2060', name: 'CHYODA CORP', type: 'توزيع', dividend: '-0.19 SAR' }, { day: 'غداً', symbol: '4322', name: 'توزيع', type: 'توزيع', dividend: '...'}, { day: 'غداً', symbol: '7010', name: 'سابك للمغذيات الزراعية', type: 'توزيع', dividend: '1.50 SAR'}, { day: 'بعد غد', symbol: '1182', name: 'مصرف الراجحي', type: 'توزيع', dividend: '1.00 SAR'}, { day: 'بعد غد', symbol: '2222', name: 'أرامكو السعودية', type: 'توزيع', dividend: '0.23 SAR'}, { day: 'بعد غد', symbol: '4004', name: 'بنك البلاد', type: 'توزيع', dividend: '0.50 SAR'}, { day: 'الأسبوع القادم', symbol: '7020', name: 'المتقدمة', type: 'توزيع', dividend: '0.75 SAR'}, { day: 'الأسبوع القادم', symbol: '1120', name: 'بنك الجزيرة', type: 'توزيع', dividend: '0.45 SAR'} ];
const globalStocks = [ { name: 'LVMH', value: '462.70 EUR', change: '+0.23%', isPositive: true, logo: 'https://placehold.co/32x32/1E90FF/FFFFFF/png?text=LVMH' }, { name: 'TSMC', value: '1,135 TWD', change: '-0.44%', isPositive: false, logo: 'https://placehold.co/32x32/FF4500/FFFFFF/png?text=TSMC' }, { name: 'Saudi Aramco', value: '23.91 SAR', change: '-0.37%', isPositive: false, logo: 'https://placehold.co/32x32/1E88E5/FFFFFF/png?text=A' }, { name: 'مايكروسوفت', value: '531.22 USD', change: '+1.36%', isPositive: true, logo: 'https://placehold.co/32x32/F25022/FFFFFF/png?text=M', active: true } ];
const largestByValue = [ { value: '2.1 M', name: '.Walmart Inc', symbol: 'WMT', change: '+0.64%', isPositive: true, logo: 'https://placehold.co/32x32/0071CE/FFFFFF/png?text=W' }, { value: '968.9 K', name: 'BYD COMPANY LTD', symbol: '002594', change: '-0.87%', isPositive: false, logo: 'https://placehold.co/32x32/D82028/FFFFFF/png?text=BYD' }, { value: '679.5 K', name: 'VOLKSWAGEN AG', symbol: 'VOW', change: '+0.05%', isPositive: true, logo: 'https://placehold.co/32x32/1A5F9E/FFFFFF/png?text=VW' }, { value: '608 K', name: 'TATA CONSULTANCY SERV', symbol: 'TCS', change: '+2.38%', isPositive: true, logo: 'https://placehold.co/32x32/3D3D3D/FFFFFF/png?text=TCS' } ];
const largestByMarketCap = [ { value: '4.28 T USD', name: 'NVIDIA Corporation', symbol: 'NVDA', change: '+1.27%', isPositive: true, logo: 'https://placehold.co/32x32/76B900/FFFFFF/png?text=N' }, { value: '3.94 T USD', name: 'Amazon.com, Inc', symbol: 'AMZN', change: '+1.36%', isPositive: true, logo: 'https://placehold.co/32x32/FF9900/000000/png?text=A' }, { value: '3.07 T USD', name: 'Accenture plc', symbol: 'ACN', change: '+1.60%', isPositive: true, logo: 'https://placehold.co/32x32/A100FF/FFFFFF/png?text=A' }, { value: '2.32 T USD', name: 'Meta Platforms, Inc', symbol: 'META', change: '+1.89%', isPositive: true, logo: 'https://placehold.co/32x32/0062E0/FFFFFF/png?text=M' } ];
const globalDividendSchedule = [ { day: 'اليوم', type: 'توزيع', symbol: '3861', name: 'OJI HOLDINGS CORP', dividend: '0.18 SAR'}, { day: 'اليوم', type: 'توزيع', symbol: '6366', name: 'CHIYODA CORP', dividend: '0.16 SAR'}, { day: 'غداً', type: 'توزيع', symbol: '2296', name: 'ITCHAN YONEKYU HOLDINGS INC', dividend: '0.78 SAR'}, { day: 'غداً', type: 'توزيع', symbol: '4203', name: 'SUMITOMO BAKELITE CO', dividend: '0.59 SAR'} ];
const cryptoIndices = [ { name: 'Binance Coin', value: '757.39 USD', change: '+0.84%', isPositive: true, logo: 'https://placehold.co/32x32/F0B90B/000000/png?text=B' }, { name: 'Ethereum', value: '3,574.05 USD', change: '-2.23%', isPositive: false, logo: 'https://placehold.co/32x32/627EEA/FFFFFF/png?text=E' }, { name: 'Bitcoin', value: '114,339.18 USD', change: '+0.14%', isPositive: true, logo: 'https://placehold.co/32x32/F7931A/FFFFFF/png?text=B', active: true } ];
const cryptoCommunity = [ { name: 'XRPUSD', value: '3.01519 USD', change: '-2.23%', isPositive: false }, { name: 'SOLUSD', value: '164.54 USD', change: '-1.57%', isPositive: false }, { name: 'ETHUSD', value: '3,575.24 USD', change: '-2.22%', isPositive: false }, { name: 'DOGEUSD', value: '0.20216 USD', change: '+1.70%', isPositive: true }, { name: 'ADAUSD', value: '0.45 USD', change: '+1.10%', isPositive: true }, { name: 'LINKUSD', value: '18.50 USD', change: '-0.50%', isPositive: false }, { name: 'BTCUSD', value: '114,231 USD', change: '+0.10%', isPositive: true, active: true } ];
const tvlRanking = [ { name: 'Aave', symbol: 'AAVE', value: '55.62 B USD', change: '+1.17%', isPositive: true, logo: 'https://placehold.co/32x32/B6509E/FFFFFF/png?text=A' }, { name: 'Lido DAO', symbol: 'LDOUSD', value: '30.45 B USD', change: '+1.45%', isPositive: true, logo: 'https://placehold.co/32x32/00A3FF/FFFFFF/png?text=L' }, { name: 'Ethena', symbol: 'ENAUSD', value: '10.41 B USD', change: '+4.45%', isPositive: true, logo: 'https://placehold.co/32x32/5E5E5E/FFFFFF/png?text=E' }, { name: 'Uniswap', symbol: 'UNI', value: '5.22 B USD', change: '+3.32%', isPositive: true, logo: 'https://placehold.co/32x32/FF007A/FFFFFF/png?text=U'}, { name: 'MakerDAO', symbol: 'MKR', value: '8.5 B USD', change: '-0.25%', isPositive: false, logo: 'https://placehold.co/32x32/1AAB9B/FFFFFF/png?text=M'} ];
const cryptoMarketCapRanking = [ { name: 'Bitcoin', value: '114,339.18 USD', change: '+0.14%', isPositive: true, logo: 'https://placehold.co/32x32/F7931A/FFFFFF/png?text=B' }, { name: 'Ethereum', value: '3,574.05 USD', change: '+2.23%', isPositive: true, logo: 'https://placehold.co/32x32/627EEA/FFFFFF/png?text=E' }, { name: 'XRP', value: '3.0144 USD', change: '+2.27%', isPositive: true, logo: 'https://placehold.co/32x32/000000/FFFFFF/png?text=X' }, { name: 'Solana', value: '164.54 USD', change: '+1.63%', isPositive: true, logo: 'https://placehold.co/32x32/9945FF/FFFFFF/png?text=S'}, { name: 'Tether', value: '1.00 USD', change: '0.00%', isPositive: null, logo: 'https://placehold.co/32x32/26A17B/FFFFFF/png?text=T'} ];
const worstCrypto = [ { name: 'Primex Finance', symbol: 'PMXUSD', value: '0.002 USD', change: '-100.00%' }, { name: 'Spellfire', symbol: 'SPELLFIRE', value: '0.0002327 USD', change: '-80.59%' }, { name: 'DeVip', symbol: 'DEVAP', value: '0.0000323 USD', change: '-58.49%' }, { name: 'Satoshis', symbol: 'SATS', value: '0.0000001 USD', change: '-52.16%'} ];
const bestCrypto = [ { name: 'MYX Finance', symbol: 'MYXUSD', value: '0.34198 USD', change: '+169.70%' }, { name: 'motion', symbol: 'MOTIONZUSD', value: '0.0027572 USD', change: '+158.24%' }, { name: 'Evan', symbol: 'EVAN', value: '0.0019478 USD', change: '+155.29%' }, { name: 'Bitbull', symbol: 'BITBULL', value: '0.0000612 USD', change: '+129.67%'} ];
const futuresIndices = [ { name: 'Platinum Futures', value: '1,343.5 USD / APZ', change: '+2.02%', isPositive: true, logo: 'https://placehold.co/32x32/E5E4E2/000000/png?text=P' }, { name: 'Copper Futures', value: '4,456.50 USD / LBR', change: '+0.46%', isPositive: true, logo: 'https://placehold.co/32x32/B87333/FFFFFF/png?text=C' }, { name: 'Silver Futures', value: '37.380 USD / APZ', change: '+1.22%', isPositive: true, logo: 'https://placehold.co/32x32/C0C0C0/000000/png?text=S' }, { name: 'Gold Futures', value: '3,429.5 USD / APZ', change: '+0.87%', isPositive: true, logo: 'https://placehold.co/32x32/FFD700/000000/png?text=G', active: true } ];
const agriculturalFutures = [ { name: 'Cotton No. 2 Futures', value: '67.13 USD', change: '+1.16%', isPositive: true }, { name: 'Coffee C Futures', value: '293.20 USD', change: '-3.20%', isPositive: false }, { name: 'W. Wheat Futures', value: '388.24 USD', change: '-0.26%', isPositive: false }, { name: 'Corn Futures', value: '450.75 USD', change: '+0.50%', isPositive: true }, { name: 'Lumber Futures', value: '550.00 USD', change: '-1.80%', isPositive: false } ];
const energyFutures = [ { name: 'Natural Gas Futures', value: '3.007 USD', change: '-2.47%', isPositive: false }, { name: 'Soybean Futures', value: '989.0 USD', change: '-1.69%', isPositive: false }, { name: 'Crude Oil Futures', value: '68.25 USD', change: '-2.04%', isPositive: false }, { name: 'Brent Crude Futures', value: '72.50 USD', change: '-2.10%', isPositive: false }, { name: 'Gasoline Futures', value: '2.15 USD', change: '+0.80%', isPositive: true } ];
const forexIndices = [ { name: 'GBP في SAR', value: '4.9879 SAR', change: '+0.22%', isPositive: true }, { name: 'JPY في SAR', value: '0.02510 SAR', change: '+0.20%', isPositive: true }, { name: 'EUR في SAR', value: '4.5450 SAR', change: '-0.02%', isPositive: false }, { name: 'USD في SAR', value: '3.751100 SAR', change: '0.00%', isPositive: null, active: true } ];
const currencyIndices = [ { name: 'اليورو', value: '115.77 USD', change: '+0.15%', logo: 'https://placehold.co/40x40/003399/FFFFFF/png?text=E', isPositive: true }, { name: 'الدولار الأمريكي', value: '98.699 USD', change: '+0.06%', logo: 'https://placehold.co/40x40/008000/FFFFFF/png?text=D', isPositive: true }, { name: 'الجنيه البريطاني', value: '133.01 USD', change: '+0.15%', logo: 'https://placehold.co/40x40/CF142B/FFFFFF/png?text=P', isPositive: true } ];
const majorCurrencies = [ { name: 'USD في JPY', value: '147.287 JPY', change: '+0.18%', isPositive: true }, { name: 'USD في EUR', value: '1.15779 USD', change: '+0.18%', isPositive: true }, { name: 'USD في AUD', value: '0.64849 USD', change: '-0.25%', isPositive: false } ];
const yieldCurveData = {
  labels: ['1M','2Y','3Y','4Y','5Y','6Y','7Y','8Y','9Y','10Y','12Y','15Y','20Y','25Y','30Y'],
  datasets: [
    { name: 'أمريكا', color: '#4A90E2', data: [ {x:0,y:4.8},{x:1,y:4.2},{x:2,y:4.0},{x:3,y:3.8},{x:4,y:3.6},{x:5,y:3.5},{x:6,y:3.4},{x:7,y:3.3},{x:8,y:3.2},{x:9,y:3.1},{x:10,y:3.0},{x:11,y:2.9},{x:12,y:2.8} ] },
    { name: 'السعودية', color: '#50E3C2', data: [ {x:0,y:5.2},{x:1,y:5.1},{x:2,y:5.0},{x:3,y:4.9},{x:4,y:4.8},{x:5,y:4.7},{x:6,y:4.6},{x:7,y:4.5},{x:8,y:4.4},{x:9,y:4.3},{x:10,y:4.2},{x:11,y:4.1},{x:12,y:4.0} ] },
    { name: 'ألمانيا', color: '#F5A623', data: [ {x:0,y:2.5},{x:1,y:2.6},{x:2,y:2.7},{x:3,y:2.8},{x:4,y:2.9},{x:5,y:3.0},{x:6,y:3.1},{x:7,y:3.2},{x:8,y:3.3},{x:9,y:3.4},{x:10,y:3.5},{x:11,y:3.6},{x:12,y:3.7} ] },
    { name: 'بريطانيا', color: '#BD10E0', data: [ {x:0,y:3.0},{x:1,y:3.2},{x:2,y:3.4},{x:3,y:3.6},{x:4,y:3.8},{x:5,y:3.9},{x:6,y:4.0},{x:7,y:4.1},{x:8,y:4.2},{x:9,y:4.3},{x:10,y:4.4},{x:11,y:4.5},{x:12,y:4.6} ] },
  ],
};
const keyBonds = [ { name: 'أمريكا', yield: '4.210%', value: '100.313%', change: '+0.05%', flag: '🇺🇸' }, { name: 'الاتحاد الأوروبي', yield: '2.642%', value: '99.629%', change: '+0.20%', flag: '🇪🇺' }, { name: 'ألمانيا', yield: '4.519%', value: '99.847%', change: '+0.01%', flag: '🇩🇪' } ];
const usBonds = [ { name: 'سنة 1', yield: '3.852%', value: '3.700%', change: '-0.55%', flag: '🇺🇸' }, { name: 'سنة 5', yield: '3.696%', value: '100.340%', change: '-0.03%', flag: '🇺🇸' }, { name: 'سنة 10', yield: '3.752%', value: '100.555%', change: '+0.05%', flag: '🇺🇸' } ];
const corporateBonds = [ { name: 'PET. MEX. 16/46 MTN', date: 'أكتوبر 23', yield: '9.98%' }, { name: 'LUMEN TECHN. 24/32 REGS', date: 'أكتوبر 15', yield: '9.98%' }, { name: 'SAEUFSB26646', date: 'يونيو 15', yield: '9.99%' }, { name: 'UNH2P4259435', date: 'أغسطس 15', yield: '10.00%' } ];
const longTermBonds = [ { name: 'GACI F.INV. 22/2122 MTN', date: 'أكتوبر 13', yield: '6.68%' }, { name: 'NORFOLK STH. 21/2121', date: 'مايو 21', yield: '6.45%' }, { name: 'SOUTHERN 18/2118', date: 'أغسطس 18', yield: '6.18%' } ];
const shortTermBonds = [ { name: 'American Honda Finance Corp. FRN 03-OCT-2025', date: 'أكتوبر 3', yield: '4.63%' }, { name: 'American Honda Finance Corp. 5.8% 03-OCT-2025', date: 'أكتوبر 3', yield: '5.03%' }, { name: 'Roup Ltd. (New York Branch) 5.871% 03-OCT-2025', date: 'أكتوبر 3', yield: '4.61%' } ];
const etfIndices = [ { name: 'Invesco QQQ Trust, Series 1', value: '560.29 USD', change: '+1.16%', isPositive: true, logo: 'https://placehold.co/32x32/002060/FFFFFF/png?text=Q' }, { name: 'Vanguard Total Stock Market ETF', value: '308.30 USD', change: '+0.84%', isPositive: true, logo: 'https://placehold.co/32x32/961523/FFFFFF/png?text=V' }, { name: 'iShares Bitcoin Trust', value: '64.88 USD', change: '+1.03%', isPositive: true, logo: 'https://placehold.co/32x32/000000/FFFFFF/png?text=I' }, { name: 'SPDR S&P 500 ETF Trust', value: '627.00 USD', change: '+0.87%', isPositive: true, logo: 'https://placehold.co/32x32/343A40/FFFFFF/png?text=S', active: true }, ];
const economicData = [ { name: 'سعر الفائدة في المملكة العربية السعودية', value: '5%', change: '2020', isPositive: true }, { name: 'الناتج المحلي الإجمالي السعودي', value: '1.2T SAR', change: '2021', isPositive: true }, { name: 'الناتج المحلي الإجمالي للربع السنوي', value: '1.3%', change: '2022', isPositive: false }, { name: 'الناتج المحلي الإجمالي السعودي', value: '1.24T USD', change: '2023', isPositive: true, active: true }, ];
const heatmapData = {
  headers: ['الناتج المحلي الإجمالي على أساس سنوي','الحساب الجاري إلى الناتج المحلي الإجمالي','معدل البطالة','معدل التضخم','معدل الفائدة','نسبة الدين الحكومي إلى الناتج المحلي','الميزانية إلى الناتج المحلي الإجمالي'],
  countries: [
    { name: 'أمريكا', flag: '🇺🇸', values: [2, 5.2, 3.1, -5.8, -6.2, 124.3, 0.7], total: '29.18T USD' },
    { name: 'بن الرئيس', flag: '🇨🇳', values: [5.2, 1.4, 2, -5.8, -5.8, 88.3, 6.8], total: '18.74T USD' },
    { name: 'الاتحاد الأوروبي', flag: '🇪🇺', values: [0.4, 1.4, 2.1, -3.1, -2.8, 82.5, 3.7], total: '16.41T USD' },
    { name: 'ألمانيا', flag: '🇩🇪', values: [1.6, 7.4, 2, -4.8, -5.5, 236.7, 1], total: '4.66T USD' },
  ],
};
const economicCalendar = [ { day: 'اليوم', time: '17:00', name: 'Factory Orders ex Transportation', country: '🇺🇸', active: true, previous: '0.2%', forecast: '0.2%', actual: '24:31' }, { day: 'اليوم', time: '17:00', name: 'Factory Orders MoM', country: '🇺🇸', previous: '8.2%', forecast: '-4.9%', actual: '24:31' }, { day: 'اليوم', time: '18:30', name: 'Month Bill Auction-3', country: '🇺🇸', previous: '4.235%', forecast: '-', actual: '-' }, { day: 'غداً', time: '18:30', name: 'Month Bill Auction-6', country: '🇺🇸', previous: '4.12%', forecast: '-', actual: '-' } ];

// --- TYPES ---
interface SectionHeaderProps { title: string; linkText?: string; tag?: string; }
interface CarouselProps { children?: React.ReactNode; }
interface TickerCardProps { name: string; value: string; change: string; isPositive: boolean | null; active?: boolean; symbol?: string; logo?: string; badge?: { text: string; color: string; }; onClick?: () => void; }
interface CommunityTickerCardProps { name: string; symbol?: string; value: string; change: string; isPositive: boolean | null; active?: boolean; onClick?: () => void; }
interface MainChartProps { id: string; data: { x: number; y: number }[]; lineColor: string; activeTimeframe: string; onTimeframeChange: (timeframe: string) => void; xLabels: string[]; isDark: boolean; }
interface PerformanceListItem { name: string; value: string; change: string; symbol?: string; }
interface PerformanceListProps { title: string; items: PerformanceListItem[]; positive: boolean; linkText?: string; }
interface EventCardProps { day: string; time?: string; name: string; symbol?: string; dividend?: string; type?: string; active?: boolean; }
interface CompanyListItemProps { value: string; name: string; symbol: string; change: string; isPositive: boolean; logo?: string; }
interface TwoColumnListProps { title: string; linkText?: string; items: any[]; renderItem: (item: any) => React.ReactNode; }
interface CryptoRankItemProps { logo: string; name: string; symbol: string; value: string; change: string; isPositive: boolean; }
interface BondListItemProps { name: string; yield: string; value: string; change: string; flag: string; }
interface YieldCurveChartProps { datasets: { name: string; color: string; data: {x: number, y: number}[] }[]; labels: string[]; visibleDatasets: string[]; onToggleDataset: (name: string) => void; }
interface CorporateBondCardProps { name: string; date: string; yield: string; }
interface LongShortBondItemProps { name: string; date: string; yield: string; }
interface EconomicHeatmapProps { data: { headers: string[]; countries: { name: string; flag: string; values: (number|string)[]; total: string; }[] } }
interface EconomicCalendarCardProps { day: string; time: string; name: string; country: string; active?: boolean; previous: string; forecast: string; actual: string; }
interface CurrencyIndexCardProps { name: string; value: string; change: string; isPositive: boolean | null; logo: string; onClick?: () => void; }

// --- SUB-COMPONENTS ---
const SectionHeader = (props: any) => {
    const { title, linkText, tag } = props;
    return (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {tag && <span className="bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">{tag}</span>}
    </div>
    <a href="#" className="text-sm text-blue-500 dark:text-blue-400 hover:underline flex-shrink-0">{linkText || 'الكل &gt;'}</a>
  </div>
);
}

const Carousel = ({ children }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  };
  return (
    <div className="relative">
      <button onClick={() => scroll(1)} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors hidden md:block shadow-md" aria-label="Scroll right"><ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" /></button>
      <button onClick={() => scroll(-1)} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors hidden md:block shadow-md" aria-label="Scroll left"><ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" /></button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">{children}</div>
    </div>
  );
};

const TickerCard = (props: any) => {
  const { name, value, change, isPositive, active, symbol, logo, badge, onClick } = props;
  return (
  <div onClick={onClick} className={`flex-shrink-0 w-56 sm:w-64 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${active ? 'bg-blue-50 dark:bg-[#292E39] border-blue-500 dark:border-gray-500 scale-105 shadow-lg' : 'bg-white dark:bg-[#141922] border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 hover:bg-gray-50 dark:hover:bg-[#1C212B]'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>{name}</span>
        {badge && <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${badge.color}`}>{badge.text}</div>}
      </div>
      {logo && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-white font-bold">
          {logo.startsWith('http') ? <img src={logo} alt={name} className="w-8 h-8 rounded-full" loading="lazy" decoding="async" /> : <span>{logo}</span>}
        </div>
      )}
    </div>
    <p className={`mt-2 text-xl font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-200'}`}>{value}</p>
    <div className="flex justify-between items-baseline">
      <p className={`text-lg font-semibold ${isPositive === true ? 'text-green-500 dark:text-green-400' : isPositive === false ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{change}</p>
      {symbol && <p className="text-sm text-gray-500 dark:text-gray-500">{symbol}</p>}
    </div>
  </div>
);
};

const CommunityTickerCard = (props: any) => {
  const { name, symbol, value, change, isPositive, active, onClick } = props;
  return (
  <div onClick={onClick} className={`flex-shrink-0 w-48 sm:w-52 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${active ? 'bg-blue-50 dark:bg-[#292E39] border-blue-500 dark:border-gray-500 scale-105 shadow-lg' : 'bg-white dark:bg-[#141922] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 hover:bg-gray-50 dark:hover:bg-[#1C212B]'}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-base font-bold text-gray-900 dark:text-white">{name}</p>
        {symbol && <p className="text-sm text-gray-400">{symbol}</p>}
      </div>
      <div className={`w-3 h-3 rounded-full mt-1 ${isPositive === true ? 'bg-green-500' : isPositive === false ? 'bg-red-500' : 'bg-gray-500'}`}></div>
    </div>
    <div className="mt-6 text-right">
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className={`text-base font-semibold ${isPositive === true ? 'text-green-500 dark:text-green-400' : isPositive === false ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{change}</p>
    </div>
  </div>
);
};
// ... (The rest of the sub-components will be similarly fixed by changing their props to `(props: any)` and destructuring inside)

const EventCard = (props: any) => {
    const { day, time, name, symbol, dividend, type } = props;
    return (
  <div className="flex-shrink-0 w-52 sm:w-60 p-4 rounded-2xl bg-white dark:bg-[#1C212B] border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#292E39] transition-colors duration-300 cursor-pointer">
    <div>
      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
        <span>{day}</span>
        {symbol && <span className="text-gray-900 dark:text-white font-semibold">{symbol}</span>}
      </div>
      <p className="text-gray-900 dark:text-white font-bold mt-2 h-10">{name}</p>
    </div>
    <div className="flex justify-between items-center mt-4 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{type}</span>
      <span className="text-gray-900 dark:text-white font-semibold">{dividend}</span>
    </div>
  </div>
);
};

const CompanyListItem = (props: any) => {
  const { value, name, symbol, change, isPositive, logo } = props;
  return (
  <div className="flex justify-between items-center py-3 px-2 -mx-2 rounded-lg border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
    <span className="text-gray-900 dark:text-white w-1/5">{value}</span>
    <div className="flex-1">
      <p className="text-gray-900 dark:text-white font-semibold">{name}</p>
      <p className="text-gray-500 text-sm">{symbol}</p>
    </div>
    <div className="flex items-center gap-3 w-1/4 justify-end">
      <span className={`font-semibold ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{change}</span>
      {logo && <img src={logo} alt={name} className="w-6 h-6 rounded-full" loading="lazy" decoding="async" />}
    </div>
  </div>
);
};

const CryptoRankItem = (props: any) => {
  const { logo, name, symbol, value, change, isPositive } = props;
  return (
  <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-lg border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
    <div className="flex items-center gap-3">
      <img src={logo} alt={name} className="w-8 h-8 rounded-full" loading="lazy" decoding="async" />
      <div>
        <p className="text-gray-900 dark:text-white font-semibold">{name}</p>
        <p className="text-gray-500 text-sm">{symbol}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-gray-900 dark:text-white">{value}</p>
      <p className={`text-sm ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{change}</p>
    </div>
  </div>
);
};

const BondListItem = (props: any) => {
  const { name, yield: bondYield, value, change, flag } = props;
  return (
  <div className="flex items-center py-2 px-2 -mx-2 rounded-lg border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
    <div className="w-1/3">
      <p className="text-gray-900 dark:text-white font-bold">{bondYield}</p>
      <p className={`text-sm ${change.startsWith('+') ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}>{change}</p>
    </div>
    <div className="flex-1">
      <p className="text-gray-900 dark:text-white">{value}</p>
      <p className="text-gray-500 text-xs">نسبة</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-gray-900 dark:text-white text-sm">{name}</span>
      <span className="text-xl">{flag}</span>
    </div>
  </div>
);
};

const CorporateBondCard = (props: any) => {
  const { name, date, yield: bondYield } = props;
  return (
  <div className="flex-shrink-0 w-56 sm:w-64 p-4 rounded-2xl bg-white dark:bg-[#1C212B] border border-gray-200 dark:border-gray-800 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#292E39] transition-colors duration-300 cursor-pointer">
    <p className="text-gray-900 dark:text-white font-bold h-12">{name}</p>
    <div className="flex justify-between items-center mt-4 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{date}</span>
      <span className="text-gray-900 dark:text-white font-semibold">{bondYield}</span>
    </div>
  </div>
);
};

const LongShortBondItem = (props: any) => {
  const { name, date, yield: bondYield } = props;
  return (
  <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-lg border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
    <div>
      <p className="text-gray-900 dark:text-white font-semibold">{name}</p>
      <p className="text-gray-500 text-xs">{date}</p>
    </div>
    <span className="text-gray-900 dark:text-white font-bold">{bondYield}</span>
  </div>
);
};

const EconomicCalendarCard = (props: any) => {
  const { day, time, name, country, active, previous, forecast, actual } = props;
  return (
  <div className={`flex-shrink-0 w-60 sm:w-72 p-4 rounded-2xl bg-white dark:bg-[#1C212B] border border-gray-200 dark:border-gray-800 flex flex-col justify-between ${active ? 'border-r-4 border-red-500' : ''} hover:bg-gray-50 dark:hover:bg-[#292E39] transition-colors duration-300 cursor-pointer`}>
    <div>
      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
        <span>{country} {day}</span>
        <span className={`${active ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}>{time}</span>
      </div>
      <p className="text-gray-900 dark:text-white font-bold mt-2 h-10">{name}</p>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4">
      <div>
        <p className="text-gray-500 dark:text-gray-400">السابق</p>
        <p className="text-gray-900 dark:text-white font-semibold">{previous}</p>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400">التقدير</p>
        <p className="text-gray-900 dark:text-white font-semibold">{forecast}</p>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400">الفعلي</p>
        <p className="text-gray-900 dark:text-white font-semibold">{actual}</p>
      </div>
    </div>
  </div>
);
};

const CurrencyIndexCard = (props: any) => {
  const { name, value, change, isPositive, logo, onClick } = props;
  return (
  <div onClick={onClick} className="flex justify-between items-center py-3 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <img src={logo} alt={name} className="w-10 h-10 rounded-full" loading="lazy" decoding="async" />
      <div>
        <p className="text-gray-900 dark:text-white font-semibold">{name}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{value}</p>
      </div>
    </div>
    <span className={`text-lg font-bold ${isPositive === true ? 'text-green-500 dark:text-green-400' : isPositive === false ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
      {change}
    </span>
  </div>
);
};
// --- (The rest of the components as before, but with the 'any' prop fix if they are used in a loop with a key)
const MainChart = (props: any) => {
  const { id, data, lineColor, activeTimeframe, onTimeframeChange, xLabels, isDark } = props;
  const axisColor = isDark ? "#6C788A" : "#9CA3AF";
  const tooltipBgColor = isDark ? '#1C212B' : '#FFFFFF';
  const tooltipBorderColor = isDark ? '#6C788A' : '#E5E7EB';
  const tooltipTextColor = isDark ? '#FFFFFF' : '#1F2937';

  const chartGradientEndColor = isDark ? '#141922' : '#FFFFFF';

  const timeframes = ['يوم', '3 أشهر', '1 سنة', '5 سنوات', 'الكل'];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`}} className="p-2 rounded-lg shadow-lg">
          <p style={{ color: tooltipTextColor }}>{`Value: ${Number(payload[0].value ?? 0).toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const getXAxisLabels = () => {
    const dataLength = data.length;
    if (dataLength < xLabels.length) return xLabels.slice(0, dataLength);
    return xLabels;
  };

  return (
    <div className="bg-white dark:bg-[#141922] p-3 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={`chartGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartGradientEndColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="x"
              tickFormatter={(_, index) => getXAxisLabels()[index % getXAxisLabels().length] || ''}
              stroke={axisColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={axisColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              orientation="right"
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeDasharray: '3 3' }} />
            <Area type="monotone" dataKey="y" stroke={lineColor} fillOpacity={1} fill={`url(#chartGradient-${id})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 sm:gap-2">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-gray-100 dark:bg-[#292E39] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><CandlestickChart size={20} /></button>
          <button className="p-2 bg-gray-100 dark:bg-[#292E39] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><BarChart size={20} /></button>
          <button className="p-2 bg-gray-100 dark:bg-[#292E39] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><GitCompare size={20} /></button>
          <button className="p-2 bg-gray-100 dark:bg-[#292E39] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Code size={20} /></button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#292E39] rounded-full p-1 text-xs sm:text-sm">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 sm:px-4 rounded-full transition-colors ${activeTimeframe === tf ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PerformanceList = (props: any) => {
    const { title, items, positive, linkText } = props;
    return (
  <div className="w-full">
    <div className="flex justify-between items-baseline mb-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <a href="#" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">{linkText || 'الكل &gt;'}</a>
    </div>
    <div className="space-y-3">
      {items.map((item: any, index: number) => (
        <div key={index} className="flex justify-between items-center text-gray-900 dark:text-white p-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-md font-bold ${positive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'}`}>{item.change}</span>
            <div>
              <p className="text-gray-900 dark:text-white">{item.name}</p>
              {item.symbol && <p className="text-xs text-gray-500">{item.symbol}</p>}
            </div>
          </div>
          <span className="text-gray-900 dark:text-white">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);
};

const TwoColumnList = (props: any) => {
    const { title, linkText, items, renderItem } = props;
    return(
  <div>
    <div className="flex justify-between items-baseline mb-2">
      <h4 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h4>
      {linkText && <a href="#" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">{linkText}</a>}
    </div>
    <div>
      {items.map((item: any, index: number) => renderItem({...item, key: index}))}
    </div>
  </div>
);
};

const YieldCurveChart = (props: any) => {
  const { datasets, labels, visibleDatasets, onToggleDataset } = props;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const axisColor = isDark ? "#6C788A" : "#9CA3AF";

  const combinedData = labels.map((_: any, idx: number) => {
    const row: Record<string, number | null> = { x: idx };
    datasets.forEach((ds: any) => {
      const point = ds.data.find((p: any) => p.x === idx);
      row[ds.name] = point ? point.y : null;
    });
    return row;
  });

  return (
    <div className="bg-white dark:bg-[#141922] p-3 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">منحنى العائد</h3>
          <p className="text-gray-500 dark:text-gray-400">صناديق المؤشرات المتداولة للسندات</p>
        </div>
        <button className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">تخصيص المنتجات</button>
      </div>
      <div className="h-[250px] sm:h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="x"
              tickFormatter={(tick: number) => labels[tick] ?? ''}
              stroke={axisColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={axisColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              orientation="right"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tickFormatter={(tick) => `${Number(tick).toFixed(1)}%`}
            />
            <Tooltip />
            <Legend
              onClick={(payload: any) => {
                const key = (payload && (payload.value as string)) || '';
                if (key) onToggleDataset(key);
              }}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-gray-800 dark:text-white">{value}</span>}
            />
            {datasets.map((ds: any) => (
              <Line
                key={ds.name}
                type="monotone"
                dataKey={ds.name}
                stroke={ds.color}
                strokeWidth={2}
                dot={false}
                hide={!visibleDatasets.includes(ds.name)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const EconomicHeatmap = (props: any) => {
    const { data } = props;
  const getColor = (value: number) => {
    if (value > 5) return 'bg-green-500/80';
    if (value > 0) return 'bg-green-500/40';
    if (value < -5) return 'bg-red-500/80';
    if (value < 0) return 'bg-red-500/40';
    return 'bg-gray-200 dark:bg-gray-700/50';
  };
  return (
    <div className="bg-white dark:bg-[#141922] p-3 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <SectionHeader title="خريطة حرارة المؤشرات الاقتصادية" linkText="شاهد المزيد من الإحصاءات العالمية &gt;" />
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs sm:text-sm min-w-[700px]">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="font-normal p-2 text-right">الناتج المحلي الإجمالي الاسمي</th>
              {data.headers.map((h: any, i: number) => <th key={i} className="font-normal p-2 w-24 sm:w-28">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.countries.map((c: any) => (
              <tr key={c.name} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <td className="p-2 text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">{c.flag}</span>
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold">{c.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">{c.total}</p>
                    </div>
                  </div>
                </td>
                {c.values.map((v: any, i: number) => (
                  <td key={i} className="p-1 sm:p-2">
                    <div className={`rounded-md p-2 text-white font-bold ${getColor(Number(v))}`}>
                      {Number(v).toFixed(1)}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN ---
export const MarketsPage = () => {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [openAccordion, setOpenAccordion] = useState<string | null>('saudi');
  const [activeSubCategory, setActiveSubCategory] = useState<{ country: string; category: string } | null>({ country: 'saudi', category: 'indices' });

  const findInitialActive = (arr: any[]) => arr.find((i) => i.active) || arr[0];

  const [activeIndex, setActiveIndex] = useState(findInitialActive(indices));
  const [activeGlobalIndex, setActiveGlobalIndex] = useState(findInitialActive(globalIndices));
  const [activeSaudiStock, setActiveSaudiStock] = useState(findInitialActive(saudiStocks));

  // Charts
  const [indicesChartData, setIndicesChartData] = useState(initialChartDataGreen);
  const [indicesTimeframe, setIndicesTimeframe] = useState('يوم');

  const [activeCommunityInterest, setActiveCommunityInterest] = useState(findInitialActive(communityInterests));
  const [communityChartData, setCommunityChartData] = useState(initialChartDataRed);
  const [communityTimeframe, setCommunityTimeframe] = useState('يوم');

  const [activeGlobalStock, setActiveGlobalStock] = useState(findInitialActive(globalStocks));
  const [globalStockChartData, setGlobalStockChartData] = useState(initialChartDataRed);
  const [globalStockTimeframe, setGlobalStockTimeframe] = useState('يوم');

  const [activeCryptoIndex, setActiveCryptoIndex] = useState(findInitialActive(cryptoIndices));
  const [cryptoChartData, setCryptoChartData] = useState(initialChartDataPurple);
  const [cryptoTimeframe, setCryptoTimeframe] = useState('يوم');

  const [activeFuture, setActiveFuture] = useState(findInitialActive(futuresIndices));
  const [futuresChartData, setFuturesChartData] = useState(initialChartDataGreen);
  const [futuresTimeframe, setFuturesTimeframe] = useState('يوم');

  const [activeForex, setActiveForex] = useState(findInitialActive(forexIndices));
  const [forexChartData, setForexChartData] = useState(initialChartDataRed);
  const [forexTimeframe, setForexTimeframe] = useState('يوم');

  const [activeEtf, setActiveEtf] = useState(findInitialActive(etfIndices));
  const [etfChartData, setEtfChartData] = useState(initialChartDataGreen);
  const [etfTimeframe, setEtfTimeframe] = useState('يوم');

  const [activeEconomy, setActiveEconomy] = useState(findInitialActive(economicData));
  const [economyChartData, setEconomyChartData] = useState(initialChartDataGreen);
  const [economyTimeframe, setEconomyTimeframe] = useState('يوم');

  const [visibleYields, setVisibleYields] = useState(yieldCurveData.datasets.map((d) => d.name));
  const toggleYieldVisibility = (name: string) => {
    setVisibleYields((current) => (current.includes(name) ? current.filter((d) => d !== name) : [...current, name]));
  };

  const [activeBottomFilter, setActiveBottomFilter] = useState('الكل');

  // Handlers
  const handleChartUpdate =
    (
      setActiveItem: React.Dispatch<React.SetStateAction<any>>,
      setChartData: React.Dispatch<React.SetStateAction<any>>,
      colorTheme: 'green' | 'red' | 'purple'
    ) =>
    (item: any) => {
      setActiveItem(item);
      setChartData(generateTimeframedData(colorTheme));
    };

  const handleIndexClick = handleChartUpdate(setActiveIndex, setIndicesChartData, 'green');
  const handleCommunityClick = handleChartUpdate(setActiveCommunityInterest, setCommunityChartData, 'red');
  const handleGlobalStockClick = handleChartUpdate(setActiveGlobalStock, setGlobalStockChartData, 'red');
  const handleCryptoClick = handleChartUpdate(setActiveCryptoIndex, setCryptoChartData, 'purple');
  const handleFutureClick = handleChartUpdate(setActiveFuture, setFuturesChartData, 'green');
  const handleForexClick = handleChartUpdate(setActiveForex, setForexChartData, 'red');
  const handleEtfClick = handleChartUpdate(setActiveEtf, setEtfChartData, 'green');
  const handleEconomyClick = handleChartUpdate(setActiveEconomy, setEconomyChartData, 'green');

  return (
    <div className="bg-gray-50 dark:bg-[#0A0F18] text-gray-900 dark:text-[#E6E8EA] font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <main className="flex-1 p-2 sm:p-4 md:p-8 space-y-12 md:space-y-16">
          <header className="text-center space-y-4">
            <h1 className="text-xl md:text-2xl font-bold text-blue-500 dark:text-blue-400 tracking-widest">VESTOR SMART</h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">كل الأسواق في مكان واحد</h2>
          </header>

          {/* Indices */}
          <section>
            <SectionHeader title="المؤشرات" linkText="جميع المؤشرات &gt;" />
            <Carousel>
              {indices.map((item, i) => (
                <TickerCard key={i} {...item} active={activeIndex.name === item.name} onClick={() => handleIndexClick(item)} />
              ))}
            </Carousel>
            <div className="mt-6">
              <MainChart
                id="indices"
                data={indicesChartData[indicesTimeframe]}
                xLabels={['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']}
                lineColor="#16A34A"
                activeTimeframe={indicesTimeframe}
                onTimeframeChange={setIndicesTimeframe}
                isDark={isDark}
              />
            </div>
          </section>

          {/* Global Indices */}
          <section>
            <SectionHeader title="المؤشرات العالمية" linkText="جميع المؤشرات العالمية &gt;" />
            <Carousel>
              {globalIndices.map((item, i) => (
                <TickerCard key={i} {...item} active={activeGlobalIndex.name === item.name} onClick={() => setActiveGlobalIndex(item)} />
              ))}
            </Carousel>
          </section>

          {/* Saudi Stocks */}
          <section>
            <SectionHeader title="الأسهم السعودية" linkText="جميع الأسهم السعودية &gt;" tag="AURA" />
            <Carousel>
              {saudiStocks.map((item, i) => (
                <TickerCard key={i} {...item} active={activeSaudiStock.name === item.name} onClick={() => setActiveSaudiStock(item)} />
              ))}
            </Carousel>
          </section>

          {/* Community Interests */}
          <section>
            <SectionHeader title="اهتمامات المجتمع" linkText="الكل &gt;" />
            <Carousel>
              {communityInterests.map((item, i) => (
                <CommunityTickerCard key={i} {...item} active={activeCommunityInterest.name === item.name} onClick={() => handleCommunityClick(item)} />
              ))}
            </Carousel>
            <div className="mt-6">
              <MainChart
                id="community"
                data={communityChartData[communityTimeframe]}
                xLabels={['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']}
                lineColor="#EF4444"
                activeTimeframe={communityTimeframe}
                onTimeframeChange={setCommunityTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>

          {/* Stock Performance */}
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              <PerformanceList title="الاسهم الاكثر تقلبا" items={mostVolatileStocks} positive={false} />
              <PerformanceList title="الاسهم الاكثر حجما" items={mostActiveStocks} positive={true} />
            </div>
            <a href="#" className="text-sm text-blue-500 dark:text-blue-400 mt-4 block text-center hover:underline">شاهد جميع الأسهم ذات التغيرات الأكثر في الأسعار &gt;</a>
          </section>

          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              <PerformanceList title="أسوأ الأسهم أداءً" items={worstPerformingStocks} positive={false} />
              <PerformanceList title="أفضل الأسهم أداءً" items={bestPerformingStocks} positive={true} />
            </div>
            <a href="#" className="text-sm text-blue-500 dark:text-blue-400 mt-4 block text-center hover:underline">شاهد جميع الأسهم ذات النمو اليومي الأكبر &gt;</a>
          </section>

          {/* Dividend Schedule */}
          <section>
            <SectionHeader title="جدول العوائد والمواعيد" linkText="مشاهدة جميع الأحداث &gt;" />
            <Carousel>{dividendSchedule.map((item, i) => <EventCard key={i} {...item} />)}</Carousel>
          </section>

          {/* Global Stocks */}
          <section>
            <SectionHeader title="الأسهم العالمية" linkText="جميع الأسهم العالمية &gt;" />
            <Carousel>
              {globalStocks.map((item, i) => (
                <TickerCard key={i} {...item} active={activeGlobalStock.name === item.name} onClick={() => handleGlobalStockClick(item)} />
              ))}
            </Carousel>
            <div className="mt-6">
              <MainChart
                id="global-stocks"
                data={globalStockChartData[globalStockTimeframe]}
                xLabels={['16:30', '18:00', '19:30', '21:00', '22:30']}
                lineColor="#EF4444"
                activeTimeframe={globalStockTimeframe}
                onTimeframeChange={setGlobalStockTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>

          {/* Largest Companies */}
          <section>
            <div className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0 border border-gray-200 dark:border-gray-800">
              <TwoColumnList title="أكبر المشغلين في العالم" linkText="شاهد جميع أكبر أربعين شركة في العالم &gt;" items={largestByValue} renderItem={(item) => <CompanyListItem key={item.name} {...item} />} />
              <TwoColumnList title="القيمة السوقية" linkText="شاهد جميع الشركات الكبرى في العالم &gt;" items={largestByMarketCap} renderItem={(item) => <CompanyListItem key={item.name} {...item} />} />
            </div>
          </section>

          {/* Global Dividend Schedule */}
          <section>
            <SectionHeader title="جدول العوائد والمواعيد" linkText="مشاهدة جميع الأحداث &gt;" />
            <Carousel>{globalDividendSchedule.map((item, i) => <EventCard key={i} {...item} />)}</Carousel>
          </section>

          {/* Crypto */}
          <section>
            <SectionHeader title="العملات الرقمية" linkText="جميع العملات الرقمية &gt;" />
            <Carousel>{cryptoIndices.map((item, i) => <TickerCard key={i} {...item} active={activeCryptoIndex.name === item.name} onClick={() => handleCryptoClick(item)} />)}</Carousel>
            <div className="mt-6">
              <MainChart
                id="crypto"
                data={cryptoChartData[cryptoTimeframe]}
                xLabels={['اكتوبر', 'نوفمبر', 'ديسمبر', '2025', 'يناير']}
                lineColor="#A855F7"
                activeTimeframe={cryptoTimeframe}
                onTimeframeChange={setCryptoTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>
          <section>
            <SectionHeader title="اهتمامات المجتمع" />
            <Carousel>{cryptoCommunity.map((item, i) => <CommunityTickerCard key={i} {...item} active={activeCryptoIndex.name === item.name} onClick={() => handleCryptoClick(item)} />)}</Carousel>
          </section>
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0 border border-gray-200 dark:border-gray-800">
            <TwoColumnList title="تصنيف TVL" linkText="شاهد جميع العملات ذات القيمة المقفلة الأعلى &gt;" items={tvlRanking} renderItem={(item) => <CryptoRankItem key={item.name} {...item} />} />
            <TwoColumnList title="ترتيب بالقيمة السوقية للعملات الرقمية" linkText="شاهد جميع العملات &gt;" items={cryptoMarketCapRanking} renderItem={(item) => <CryptoRankItem key={item.name} {...item} />} />
          </section>
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              <PerformanceList title="أسوأ العملات الرقمية أداءً" items={worstCrypto} positive={false} linkText="شاهد جميع العملات ذات أكبر انخفاض يومي &gt;" />
              <PerformanceList title="أفضل العملات الرقمية أداءً" items={bestCrypto} positive={true} linkText="شاهد جميع العملات ذات أكبر نمو يومي &gt;" />
            </div>
          </section>

          {/* Futures & Commodities */}
          <section>
            <SectionHeader title="العقود الآجلة والسلع" linkText="جميع العقود الآجلة &gt;" />
            <Carousel>{futuresIndices.map((item, i) => <TickerCard key={i} {...item} active={activeFuture.name === item.name} onClick={() => handleFutureClick(item)} />)}</Carousel>
            <div className="mt-6">
              <MainChart
                id="futures"
                data={futuresChartData[futuresTimeframe]}
                xLabels={['01:00', '04:30', '07:30', '10:30', '13:30', '16:30']}
                lineColor="#16A34A"
                activeTimeframe={futuresTimeframe}
                onTimeframeChange={setFuturesTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>
          <section>
            <SectionHeader title="العقود الزراعية" linkText="شاهد جميع العقود الزراعية المستقبلية &gt;" />
            <Carousel>{agriculturalFutures.map((item, i) => <CommunityTickerCard key={i} {...item} active={activeFuture.name === item.name} onClick={() => handleFutureClick(item)} />)}</Carousel>
          </section>
          <section>
            <SectionHeader title="العقود الآجلة للطاقة" linkText="شاهد جميع العقود الآجلة للطاقة &gt;" />
            <Carousel>{energyFutures.map((item, i) => <CommunityTickerCard key={i} {...item} active={activeFuture.name === item.name} onClick={() => handleFutureClick(item)} />)}</Carousel>
          </section>

          {/* Forex */}
          <section>
            <SectionHeader title="الفوركس والعملات" linkText="جميع أزواج العملات &gt;" />
            <Carousel>{forexIndices.map((item, i) => <TickerCard key={i} {...item} active={activeForex.name === item.name} onClick={() => handleForexClick(item)} />)}</Carousel>
            <div className="mt-6">
              <MainChart
                id="forex"
                data={forexChartData[forexTimeframe]}
                xLabels={['سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر', '2025']}
                lineColor="#EF4444"
                activeTimeframe={forexTimeframe}
                onTimeframeChange={setForexTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0 border border-gray-200 dark:border-gray-800">
            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">مؤشرات العملات</h4>
              <div className="space-y-2">
                {currencyIndices.map((item, i) => (
                  <CurrencyIndexCard key={i} {...item} onClick={() => handleForexClick(item)} />
                ))}
              </div>
            </div>
            <TwoColumnList title="رئيسي" items={majorCurrencies} renderItem={(item) => <CommunityTickerCard key={item.name} {...item} active={activeForex.name === item.name} onClick={() => handleForexClick(item)} />} />
          </section>

          {/* Bonds */}
          <section>
            <YieldCurveChart datasets={yieldCurveData.datasets} labels={yieldCurveData.labels} visibleDatasets={visibleYields} onToggleDataset={toggleYieldVisibility} />
          </section>
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0 border border-gray-200 dark:border-gray-800">
            <TwoColumnList title="السندات الرئيسية لـ 10 سنوات" linkText="شاهد جميع السندات الرئيسية لمدة 10 سنوات &gt;" items={keyBonds} renderItem={(item) => <BondListItem key={item.name} {...item} />} />
            <TwoColumnList title="السندات الأمريكية" linkText="شاهد جميع السندات الأمريكية &gt;" items={usBonds} renderItem={(item) => <BondListItem key={item.name} {...item} />} />
          </section>
          <section>
            <SectionHeader title="سندات الشركات" />
            <Carousel>{corporateBonds.map((item, i) => <CorporateBondCard key={i} {...item} />)}</Carousel>
          </section>
          <section className="bg-white dark:bg-[#141922] p-4 sm:p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0 border border-gray-200 dark:border-gray-800">
            <TwoColumnList title="طويلة الأجل" linkText="اطلع على جميع سندات ذات أجل استحقاق طويل الأجل &gt;" items={longTermBonds} renderItem={(item) => <LongShortBondItem key={item.name} {...item} />} />
            <TwoColumnList title="قصيرة الأجل" linkText="اطلع على جميع سندات ذات أجل استحقاق قصير الأجل &gt;" items={shortTermBonds} renderItem={(item) => <LongShortBondItem key={item.name} {...item} />} />
          </section>

          {/* ETFs */}
          <section>
            <SectionHeader title="صناديق الاستثمار المتداولة" />
            <Carousel>{etfIndices.map((item, i) => <TickerCard key={i} {...item} active={activeEtf.name === item.name} onClick={() => handleEtfClick(item)} />)}</Carousel>
            <div className="mt-6">
              <MainChart
                id="etf"
                data={etfChartData[etfTimeframe]}
                xLabels={['16:30', '17:30', '18:30', '19:30', '20:30', '21:30']}
                lineColor="#16A34A"
                activeTimeframe={etfTimeframe}
                onTimeframeChange={setEtfTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>

          {/* Economy */}
          <section>
            <SectionHeader title="اقتصاد" />
            <Carousel>{economicData.map((item, i) => <TickerCard key={i} {...item} active={activeEconomy.name === item.name} onClick={() => handleEconomyClick(item)} />)}</Carousel>
            <div className="mt-6">
              <MainChart
                id="economy"
                data={economyChartData[economyTimeframe]}
                xLabels={['2014', '2016', '2018', '2020', '2022', '2023']}
                lineColor="#16A34A"
                activeTimeframe={economyTimeframe}
                onTimeframeChange={setEconomyTimeframe}
                 isDark={isDark}
              />
            </div>
          </section>
          <section>
            <EconomicHeatmap data={heatmapData} />
          </section>
          <section>
            <SectionHeader title="جدول الأعمال الاقتصادي" />
            <Carousel>{economicCalendar.map((item, i) => <EconomicCalendarCard key={i} {...item} />)}</Carousel>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2 bg-white dark:bg-[#141922] p-2 rounded-full border border-gray-200 dark:border-gray-800">
              {['الكل', 'سندات الشركات', 'سندات الحكومات', 'صناديق المؤشرات المتداولة', 'الفوركس', 'العملات الرقمية', 'الأسهم العالمية', 'الأسهم السعودية'].map((filter) => (
                <button key={filter} onClick={() => setActiveBottomFilter(filter)} className={`text-xs sm:text-sm px-3 py-1 rounded-full transition-colors ${activeBottomFilter === filter ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{filter}</button>
              ))}
              <button className="text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors">شاهد جميع أحداث السوق &gt;</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};