import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { KPICards } from './components/KPICards';
import { VisualBuilder } from './components/VisualBuilder';
import { DataPreviewGrid } from './components/DataPreviewGrid';
import { Dataset, KPICardData } from './types';
import { switchSheet, fetchKPIs } from './services/api';
import { FileSpreadsheet, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [kpis, setKpis] = useState<KPICardData[]>([]);
  const [activeTab, setActiveTab] = useState<'visualize' | 'data'>('visualize');

  const loadKPIs = async (datasetId: string, sheetName: string) => {
    try {
      const data = await fetchKPIs(datasetId, sheetName);
      setKpis(data);
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    loadKPIs(newDataset.dataset_id, newDataset.active_sheet);
  };

  const handleSelectSheet = async (sheetName: string) => {
    if (!dataset) return;
    try {
      const updated = await switchSheet(dataset.dataset_id, sheetName);
      setDataset({
        ...dataset,
        active_sheet: sheetName,
        preview: updated.preview,
      });
      loadKPIs(dataset.dataset_id, sheetName);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setDataset(null);
    setKpis([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        filename={dataset?.filename}
        sheets={dataset?.sheets}
        activeSheet={dataset?.active_sheet}
        onSelectSheet={handleSelectSheet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!dataset ? (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Open-Source Analytics for Excel
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                Connect your workbooks, slice & aggregate data with in-memory DuckDB queries, and build interactive Power-BI-style visualizations.
              </p>
            </div>
            <FileUploader onDatasetLoaded={handleDatasetLoaded} />
          </div>
        ) : (
          <div>
            {/* Header toolbar with Active File Info & Reset Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{dataset.filename}</h2>
                  <p className="text-xs text-slate-500">
                    Active Sheet: <span className="font-semibold text-slate-700">{dataset.active_sheet}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Dataset
              </button>
            </div>

            {/* KPI Summary Cards */}
            <KPICards kpis={kpis} />

            {/* View Switch: Report Canvas vs Data Table */}
            {activeTab === 'visualize' ? (
              <VisualBuilder
                datasetId={dataset.dataset_id}
                sheetName={dataset.active_sheet}
                columns={dataset.preview.columns}
              />
            ) : (
              <DataPreviewGrid preview={dataset.preview} />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        DataNerds Open-Source Project • Built with FastAPI, DuckDB, React & Apache ECharts
      </footer>
    </div>
  );
};
