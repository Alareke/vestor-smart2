
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { select } from 'd3-selection';
import { json } from 'd3-fetch';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import { geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import * as topojson from 'topojson-client';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';

const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const INFLATION_DATA_URL = '/data/inflationData.json';

const Tooltip = ({ tooltipData, t }) => {
    if (!tooltipData) return null;

    const { name, value, x, y, countryCode } = tooltipData;
    const flagUrl = countryCode ? `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png` : '';

    return (
        <div className="tooltip" style={{ position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(10px, -20px)' }}>
            <div className="flex items-center gap-2">
                {flagUrl && <img src={flagUrl} alt={`${name} flag`} className="w-5 h-auto rounded-sm" />}
                <strong className="text-gray-900 dark:text-white">{name}</strong>
            </div>
            {value !== null && value !== undefined ? (
                <span>{t('inflation_rate_label')}: {value.toFixed(1)}%</span>
            ) : (
                <span className="text-gray-500">{t('no_data')}</span>
            )}
        </div>
    );
};

export const InflationMap = () => {
    const { t } = useLanguage();
    const { resolvedTheme } = useTheme();
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);
    const [worldData, setWorldData] = useState(null);
    const [inflationData, setInflationData] = useState(null);
    const [status, setStatus] = useState('loading');
    const [tooltipData, setTooltipData] = useState(null);

    // Data loading effect
    useEffect(() => {
        Promise.all([
            json(WORLD_ATLAS_URL),
            json(INFLATION_DATA_URL)
        ]).then(([world, inflation]) => {
            setWorldData(topojson.feature(world, world.objects.countries));
            setInflationData(inflation);
            setStatus('ready');
        }).catch(err => {
            console.error("Failed to load map data:", err);
            setStatus('error');
        });
    }, []);

    // D3 rendering effect
    useEffect(() => {
        if (status !== 'ready' || !worldData || !svgRef.current || !wrapperRef.current) return;

        const svg = select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous render

        const { width, height } = wrapperRef.current.getBoundingClientRect();
        const projection = geoMercator().fitSize([width, height], worldData);
        const pathGenerator = geoPath().projection(projection);

        const colorScale = scaleSequential(interpolateYlOrRd).domain([0, 50]); // Cap at 50% for color range

        const numericToAlpha2 = {
            '840': 'us', '826': 'gb', '276': 'de', '250': 'fr', '156': 'cn', '392': 'jp', '124': 'ca', '036': 'au', '356': 'in', '643': 'ru', '076': 'br', '710': 'za', '682': 'sa', '218': 'ec', '032': 'ar', '792': 'tr', '818': 'eg', '566': 'ng', '586': 'pk'
        };

        // Graticule (map lines)
        svg.append('path')
            .datum(geoGraticule10())
            .attr('class', 'graticule')
            .attr('d', pathGenerator);

        // Countries
        svg.selectAll('.country')
            .data(worldData.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr('fill', d => {
                const rate = inflationData[d.properties.name];
                return rate !== undefined ? colorScale(rate) : (resolvedTheme === 'dark' ? '#2d3748' : '#e2e8f0');
            })
            .on('mousemove', (event, d) => {
                const countryName = d.properties.name;
                const inflationRate = inflationData[countryName];
                const countryId = d.id;
                setTooltipData({
                    name: countryName,
                    value: inflationRate,
                    x: event.pageX,
                    y: event.pageY,
                    countryCode: numericToAlpha2[countryId] || null
                });
            })
            .on('mouseout', () => {
                setTooltipData(null);
            });

    }, [worldData, inflationData, status, resolvedTheme]);

    return (
        <section className="map-section">
            <div className="map-app-container">
                <header className="map-header">
                    <h2>{t('inflation_map_title')}</h2>
                    <p>{t('inflation_map_subtitle')}</p>
                </header>
                <div ref={wrapperRef} className="map-wrapper">
                    {status === 'loading' && <div className="status-display">{t('loading_map_data')}</div>}
                    {status === 'error' && <div className="status-display">{t('error_loading_map_data')}</div>}
                    <div className="map-container-inner">
                         <svg ref={svgRef}></svg>
                    </div>
                </div>
                 {createPortal(<Tooltip tooltipData={tooltipData} t={t} />, document.body)}
            </div>
        </section>
    );
};