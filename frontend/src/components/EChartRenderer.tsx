import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { AggregationResult } from '../types';

interface EChartRendererProps {
  data: AggregationResult | null;
  height?: string;
}

export const EChartRenderer: React.FC<EChartRendererProps> = ({ data, height = "400px" }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    if (!data || data.categories.length === 0) {
      chart.clear();
      return () => window.removeEventListener('resize', handleResize);
    }

    const { chart_type, dimension, metric, aggregation, categories, values } = data;
    const titleText = metric ? `${aggregation} of ${metric} by ${dimension}` : `Count by ${dimension}`;

    let option: echarts.EChartsOption = {};

    switch (chart_type) {
      case 'pie':
        option = {
          title: { text: titleText, left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { orient: 'horizontal', bottom: 10 },
          series: [
            {
              name: dimension,
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
              data: categories.map((cat, i) => ({ name: cat, value: values[i] })),
            },
          ],
        };
        break;

      case 'line':
      case 'area':
        option = {
          title: { text: titleText, left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: categories, boundaryGap: chart_type === 'line' },
          yAxis: { type: 'value' },
          series: [
            {
              name: metric || dimension,
              type: 'line',
              smooth: true,
              data: values,
              areaStyle: chart_type === 'area' ? { opacity: 0.25, color: '#3b82f6' } : undefined,
              lineStyle: { width: 3, color: '#3b82f6' },
              itemStyle: { color: '#2563eb' },
            },
          ],
        };
        break;

      case 'horizontal_bar':
        option = {
          title: { text: titleText, left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: [...categories].reverse() },
          series: [
            {
              name: metric || dimension,
              type: 'bar',
              data: [...values].reverse(),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#3b82f6' },
                ]),
                borderRadius: [0, 4, 4, 0],
              },
            },
          ],
        };
        break;

      case 'bar':
      default:
        option = {
          title: { text: titleText, left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: categories, axisLabel: { interval: 0, rotate: 25 } },
          yAxis: { type: 'value' },
          series: [
            {
              name: metric || dimension,
              type: 'bar',
              data: values,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3b82f6' },
                  { offset: 1, color: '#60a5fa' },
                ]),
                borderRadius: [6, 6, 0, 0],
              },
            },
          ],
        };
        break;
    }

    chart.setOption(option, true);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
};
