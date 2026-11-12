import React from 'react';
import { KPICardData } from '../types';
import { TrendingUp, Database, Rows } from 'lucide-react';

interface KPICardsProps {
  kpis: KPICardData[];
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  if (!kpis || kpis.length === 0) return null;

  const icons = [Rows, Database, TrendingUp, TrendingUp];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const IconComponent = icons[idx % icons.length];
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <IconComponent className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {kpi.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
