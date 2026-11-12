import React from 'react';
import { DataPreview } from '../types';

interface DataPreviewGridProps {
  preview: DataPreview;
}

export const DataPreviewGrid: React.FC<DataPreviewGridProps> = ({ preview }) => {
  const { columns, rows, total_rows, total_columns } = preview;

  const typeColors: Record<string, string> = {
    number: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    string: 'bg-blue-100 text-blue-800 border-blue-200',
    date: 'bg-purple-100 text-purple-800 border-purple-200',
    boolean: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Dataset Preview</h3>
          <p className="text-xs text-slate-500">
            Showing top {rows.length} of {total_rows.toLocaleString()} rows • {total_columns} columns
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-bold text-slate-400 w-12 text-center">#</th>
              {columns.map((col) => (
                <th key={col.name} className="py-2.5 px-4 font-bold tracking-tight">
                  <div className="flex items-center gap-1.5">
                    <span>{col.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full border font-semibold ${
                        typeColors[col.type] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {col.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-2 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.name} className="py-2 px-4 text-slate-700 whitespace-nowrap">
                    {String(row[col.name] !== undefined ? row[col.name] : '')}
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
