import React from 'react';
import { BarChart3, Github, Table2, Layers } from 'lucide-react';

interface NavbarProps {
  filename?: string;
  sheets?: string[];
  activeSheet?: string;
  onSelectSheet?: (sheet: string) => void;
  activeTab: 'visualize' | 'data';
  setActiveTab: (tab: 'visualize' | 'data') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  filename,
  sheets = [],
  activeSheet,
  onSelectSheet,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              DataNerds <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">BI</span>
            </h1>
            <p className="text-xs text-slate-500">Open-Source Power BI Alternative for Excel</p>
          </div>
        </div>

        {/* Center: Tabs & Sheets */}
        <div className="flex items-center space-x-4">
          {filename && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('visualize')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'visualize'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Report Canvas
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'data'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Data View
              </button>
            </div>
          )}

          {sheets.length > 1 && onSelectSheet && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Sheet:</span>
              <select
                value={activeSheet}
                onChange={(e) => onSelectSheet(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {sheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right side: Repo link */}
        <div className="flex items-center space-x-3">
          <a
            href="https://github.com/AGAM1401/DataNerds"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
