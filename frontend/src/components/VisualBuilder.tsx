import React, { useState, useEffect } from 'react';
import { ColumnMeta, AggregationResult } from '../types';
import { runAggregation } from '../services/api';
import { EChartRenderer } from './EChartRenderer';
import { BarChart, LineChart, PieChart, Activity, Code2, RefreshCw } from 'lucide-react';

interface VisualBuilderProps {
  datasetId: string;
  sheetName: string;
  columns: ColumnMeta[];
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  datasetId,
  sheetName,
  columns,
}) => {
  const stringCols = columns.filter((c) => c.type === 'string' || c.type === 'date');
  const numberCols = columns.filter((c) => c.type === 'number');

  const [dimension, setDimension] = useState<string>(stringCols[0]?.name || columns[0]?.name || '');
  const [metric, setMetric] = useState<string>(numberCols[0]?.name || '');
  const [aggregation, setAggregation] = useState<string>('SUM');
  const [chartType, setChartType] = useState<string>('bar');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AggregationResult | null>(null);

  // Auto-refresh when selections change
  const executeQuery = async () => {
    if (!dimension) return;
    setLoading(true);
    try {
      const data = await runAggregation({
        dataset_id: datasetId,
        sheet_name: sheetName,
        dimension,
        metric: metric || undefined,
        aggregation,
        chart_type: chartType,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (columns.length > 0) {
      executeQuery();
    }
  }, [dimension, metric, aggregation, chartType, datasetId, sheetName]);

  const chartTypes = [
    { id: 'bar', label: 'Column Bar', icon: BarChart },
    { id: 'horizontal_bar', label: 'Row Bar', icon: Activity },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'area', label: 'Area Chart', icon: Activity },
    { id: 'pie', label: 'Donut / Pie', icon: PieChart },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Control Panel (Power BI Fields & Visualizations pane) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-2">Visualizations</h3>
          <div className="grid grid-cols-3 gap-2">
            {chartTypes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setChartType(t.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                    chartType === t.id
                      ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] text-center leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Dimension (X-Axis / Category)
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Metric (Values / Y-Axis)
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">(Count rows)</option>
              {numberCols.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} (number)
                </option>
              ))}
            </select>
          </div>

          {metric && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Aggregation
              </label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="SUM">Sum</option>
                <option value="AVG">Average</option>
                <option value="COUNT">Count</option>
                <option value="MIN">Minimum</option>
                <option value="MAX">Maximum</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={executeQuery}
          disabled={loading}
          className="mt-auto w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Calculating...' : 'Recalculate'}
        </button>
      </div>

      {/* Main Chart Canvas */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-center min-h-[420px]">
          <EChartRenderer data={result} height="380px" />
        </div>

        {/* DuckDB Engine SQL preview */}
        {result?.sql_executed && (
          <div className="bg-slate-900 text-slate-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2 shadow-sm overflow-x-auto">
            <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                DuckDB Engine Generated Query
              </span>
              <code>{result.sql_executed}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
