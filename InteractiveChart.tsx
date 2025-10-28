/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect } from 'react';
import { select, pointer } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { line, curveMonotoneX } from 'd3-shape';
import { useTheme } from '../i18n/ThemeContext';

// Define types for chart props
interface Series {
    key: string;
    type: 'bar' | 'line' | 'scatter';
    color: string;
    yAxis?: 'left' | 'right';
    isHollow?: boolean;
    barGroup?: string;
}

interface ChartProps {
    data: any[];
    series: Series[];
    xKey: string;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number; };
    yFormatLeft?: (d: any) => string;
    yFormatRight?: (d: any) => string;
    tooltipFormatter?: (d: any) => string;
}

export const InteractiveChart = ({
    data,
    series,
    xKey,
    height = 200,
    margin = { top: 20, right: 40, bottom: 30, left: 40 },
    yFormatLeft = d => `${d}`,
    yFormatRight = d => `${d}`,
    tooltipFormatter,
}: ChartProps) => {
    const svgRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous renders

        const containerWidth = svg.node().getBoundingClientRect().width;
        if (containerWidth === 0) return;

        const innerWidth = containerWidth - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Define theme-aware colors
        const gridColor = isDark ? "#2A2E39" : "#E5E7EB";
        const textColor = isDark ? "#9ca3af" : "#6B7281";
        const tooltipBg = isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.95)";
        const tooltipBorder = isDark ? "#4A5568" : "#D1D5DB";
        const tooltipColor = isDark ? "white" : "#1F2937";
        const hollowStrokeColor = isDark ? "white" : "black";

        // Scales
        const xScale = scaleBand()
            .domain(data.map(d => d[xKey]))
            .range([0, innerWidth])
            .padding(0.6);

        const seriesLeft = series.filter(s => s.yAxis !== 'right');
        const seriesRight = series.filter(s => s.yAxis === 'right');

        const yDomainLeft = [
            0,
            max(data, d => Math.max(0, ...seriesLeft.map(s => d[s.key]))) * 1.1 || 10
        ];
        const yScaleLeft = scaleLinear().domain(yDomainLeft).range([innerHeight, 0]);

        const yDomainRight = [
             min(data, d => Math.min(0, ...seriesRight.map(s => d[s.key]))) * 1.1 || 0,
            max(data, d => Math.max(0, ...seriesRight.map(s => d[s.key]))) * 1.1 || 10
        ];
        const yScaleRight = scaleLinear().domain(yDomainRight).range([innerHeight, 0]);

        // Axes
        const xAxis = axisBottom(xScale).tickSize(0).tickPadding(10);
        const yAxisLeft = axisLeft(yScaleLeft).ticks(4).tickFormat(yFormatLeft).tickSize(-innerWidth);
        const yAxisRight = axisRight(yScaleRight).ticks(4).tickFormat(yFormatRight).tickSize(0);

        chart.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("fill", textColor)
            .style("font-size", "10px");
        
        if (seriesLeft.length > 0) {
            chart.append("g")
                .call(yAxisLeft)
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line")
                    .attr("stroke", gridColor)
                    .attr("stroke-dasharray", "2,2"))
                .call(g => g.selectAll(".tick text")
                    .attr("x", -4)
                    .style("fill", textColor)
                    .style("font-size", "10px"));
        }
        
        if (seriesRight.length > 0) {
            chart.append("g")
                .attr("transform", `translate(${innerWidth}, 0)`)
                .call(yAxisRight)
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick text")
                    .attr("x", 4)
                    .style("fill", textColor)
                    .style("font-size", "10px"));
        }
        
        // --- Draw series ---
        const barSeries = series.filter(s => s.type === 'bar');
        const barGroups = [...new Set(barSeries.map(s => s.barGroup || s.key))];
        
        const xSubgroup = scaleBand()
            .domain(barSeries.map(s => s.key))
            .range([0, xScale.bandwidth()])
            .padding(0.05);

        series.forEach(s => {
            const yScale = s.yAxis === 'right' ? yScaleRight : yScaleLeft;
            
            if (s.type === 'bar') {
                chart.selectAll(`.bar-${s.key}`)
                    .data(data)
                    .enter().append("rect")
                    .attr("class", `bar-${s.key}`)
                    .attr("x", d => xScale(d[xKey]) + (s.barGroup ? xSubgroup(s.key) : 0) )
                    .attr("y", d => yScale(d[s.key]))
                    .attr("width", s.barGroup ? xSubgroup.bandwidth() : xScale.bandwidth())
                    .attr("height", d => innerHeight - yScale(d[s.key]))
                    .attr("fill", s.color);
            }

            if (s.type === 'line') {
                const lineGenerator = line()
                    .x(d => xScale(d[xKey]) + xScale.bandwidth() / 2)
                    .y(d => yScale(d[s.key]))
                    .curve(curveMonotoneX);

                chart.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", s.color)
                    .attr("stroke-width", 1.5)
                    .attr("d", lineGenerator);
                
                chart.selectAll(`.dot-${s.key}`)
                    .data(data)
                    .enter().append("circle")
                    .attr("class", `dot-${s.key}`)
                    .attr("cx", d => xScale(d[xKey]) + xScale.bandwidth() / 2)
                    .attr("cy", d => yScale(d[s.key]))
                    .attr("r", 2.5)
                    .attr("fill", s.color);
            }

            if (s.type === 'scatter') {
                 chart.selectAll(`.scatter-group-${s.key}`)
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(d[xKey]) + xScale.bandwidth() / 2)
                    .attr('cy', d => yScale(d[s.key]))
                    .attr('r', 4)
                    .attr('fill', s.isHollow ? 'none' : s.color)
                    .attr('stroke', s.isHollow ? hollowStrokeColor : 'none')
                    .attr('stroke-width', s.isHollow ? 1.5 : 0);
            }
        });

        // Tooltip
        const tooltip = select("body").append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", tooltipBg)
            .style("border", `1px solid ${tooltipBorder}`)
            .style("border-radius", "8px")
            .style("padding", "8px 12px")
            .style("color", tooltipColor)
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "10");

        const crosshair = chart.append("line")
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", textColor)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .style("display", "none");

        chart.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => {
                tooltip.style("visibility", "visible");
                crosshair.style("display", null);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
                crosshair.style("display", "none");
            })
            .on("mousemove", (event) => {
                const [x] = pointer(event, chart.node());
                
                const eachBand = xScale.step();
                const index = Math.floor((x / eachBand));
                const d = data[index];
                
                if (d) {
                    const tooltipX = xScale(d[xKey]) + xScale.bandwidth() / 2 + margin.left;
                    
                    crosshair
                        .attr("x1", xScale(d[xKey]) + xScale.bandwidth() / 2)
                        .attr("x2", xScale(d[xKey]) + xScale.bandwidth() / 2);

                    tooltip
                        .html(tooltipFormatter ? tooltipFormatter(d) : "")
                        .style("visibility", "visible")
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 15) + "px");
                }
            });

        // Cleanup function to remove tooltip from body
        return () => {
            tooltip.remove();
        };

    }, [data, series, xKey, height, margin, yFormatLeft, yFormatRight, tooltipFormatter, theme]);

    return <svg ref={svgRef} width="100%" height={height}></svg>;
};