import React, { useState } from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { BarChart3, PieChart, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ParetoItem {
  id: string;
  name: string;
  category: string;
  ui: number;
  percentage: number;
  cumulative: number;
}

interface ParetoAnalysisChartProps {
  budget: UncertaintyBudget;
}

export const ParetoAnalysisChart: React.FC<ParetoAnalysisChartProps> = ({ budget }) => {
  const [activeView, setActiveView] = useState<'BAR' | 'TABLE'>('BAR');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Compute sorted items with cumulative percentage
  const items: ParetoItem[] = React.useMemo(() => {
    let raw: { id: string; name: string; category: string; ui: number; percentage: number }[] = [];

    if (budget.category === 'CHEMICAL') {
      if (budget.typeA.enabled && budget.typeA.readings.length >= 2) {
        raw.push({
          id: 'type-a-rep',
          name: 'Type A: Replikasi Ujian Makmal (s / √n)',
          category: 'Replikasi',
          ui: budget.typeA.standardUncertainty,
          percentage: budget.typeA.varianceContribution || 0,
        });
      }

      budget.typeBComponents.forEach(comp => {
        let cat = 'Peralatan';
        const srcLower = comp.source.toLowerCase();
        if (srcLower.includes('crm') || srcLower.includes('standard') || srcLower.includes('rujukan')) cat = 'Bahan Standard';
        else if (srcLower.includes('pipet') || srcLower.includes('kelalang') || srcLower.includes('buret') || srcLower.includes('volum')) cat = 'Volumetrik';
        else if (srcLower.includes('suhu') || srcLower.includes('persekitaran')) cat = 'Persekitaran';

        raw.push({
          id: comp.id,
          name: comp.source,
          category: cat,
          ui: comp.standardUncertainty,
          percentage: comp.varianceContribution || 0,
        });
      });
    } else {
      const bio = budget.biologyData;
      if (bio) {
        raw.push({
          id: 'bio-sr',
          name: 'sR (Kebolehulangan Replikasi Koloni CFU)',
          category: 'Replikasi',
          ui: bio.sR,
          percentage: bio.varianceContribution_sR || 0,
        });
        raw.push({
          id: 'bio-mat',
          name: 'uMat (Heterogeniti Matriks Sampel Makanan)',
          category: 'Matriks',
          ui: bio.uMat,
          percentage: bio.varianceContribution_uMat || 0,
        });
        raw.push({
          id: 'bio-inc',
          name: 'uInc (Variasi Pengeraman Suhu & Masa)',
          category: 'Pengeraman',
          ui: bio.uInc,
          percentage: bio.varianceContribution_uInc || 0,
        });
      }
    }

    // Sort descending by percentage
    raw.sort((a, b) => b.percentage - a.percentage);

    // Compute cumulative percentage
    let cum = 0;
    return raw.map(item => {
      cum += item.percentage;
      return {
        ...item,
        cumulative: Math.min(100, cum),
      };
    });
  }, [budget]);

  const topContributor = items[0];
  const itemsAbove80 = items.filter(it => it.cumulative <= 85 || it.percentage > 15);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Replikasi':
        return 'bg-sky-500 text-sky-700 border-sky-200';
      case 'Bahan Standard':
        return 'bg-emerald-500 text-emerald-700 border-emerald-200';
      case 'Volumetrik':
        return 'bg-purple-500 text-purple-700 border-purple-200';
      case 'Persekitaran':
        return 'bg-amber-500 text-amber-700 border-amber-200';
      case 'Matriks':
        return 'bg-teal-500 text-teal-700 border-teal-200';
      case 'Pengeraman':
        return 'bg-orange-500 text-orange-700 border-orange-200';
      default:
        return 'bg-indigo-500 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Analisis Pareto & Sumbangan Varians Ketakpastian (80/20 Rule)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Mengenal pasti sumber ralat utama yang mempengaruhi ketakpastian gabungan (u_c²).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('BAR')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'BAR' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carta Pareto
          </button>
          <button
            type="button"
            onClick={() => setActiveView('TABLE')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeView === 'TABLE' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadual Kumulatif
          </button>
        </div>
      </div>

      {/* Top insight alert */}
      {topContributor && (
        <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3 text-xs text-sky-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-sky-900">
              Penyumbang Ralat Dominan ({topContributor.percentage.toFixed(1)}%):
            </span>
            <p className="text-sky-800 text-[11px]">
              <strong>"{topContributor.name}"</strong> merupakan punca ralat terbesar dalam kaedah ini. Untuk mengurangkan nilai U secara signifikan, fokus penambahbaikan perlu diberikan kepada komponen ini (contoh: gunakan mikropipet yang lebih tinggi ketepatan atau tingkatkan bilangan replikasi).
            </p>
          </div>
        </div>
      )}

      {/* View: BAR CHART */}
      {activeView === 'BAR' ? (
        <div className="space-y-3 pt-1">
          {items.map((item, index) => {
            const isHovered = hoveredItem === item.id;
            return (
              <div 
                key={item.id} 
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`p-2.5 rounded-lg border transition-all ${
                  isHovered ? 'border-sky-300 bg-sky-50/30' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[11px] font-bold text-slate-400 w-4">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {item.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-slate-500">
                      u_i = {formatLabNumber(item.ui, 5)}
                    </span>
                    <span className="font-bold text-slate-900 w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-slate-400 text-[10px] w-16 text-right">
                      Kum: {item.cumulative.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar with 80% mark */}
                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      index === 0
                        ? 'bg-sky-600'
                        : index === 1
                        ? 'bg-indigo-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(2, item.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Peraturan 80/20 ISO: Ralat makmal lazimnya dikuasai oleh 1 hingga 2 komponen utama.</span>
            <span className="font-mono">Jumlah Varians: 100.0%</span>
          </div>
        </div>
      ) : (
        /* View: TABLE */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2 px-3">Kedudukan</th>
                <th className="py-2 px-3">Komponen Ketakpastian</th>
                <th className="py-2 px-3">Kategori</th>
                <th className="py-2 px-3 text-right">u_i</th>
                <th className="py-2 px-3 text-right">u_i² (Varians)</th>
                <th className="py-2 px-3 text-right">Sumbangan (%)</th>
                <th className="py-2 px-3 text-right">Kumulatif (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-400 font-bold">#{idx + 1}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.name}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700">{formatLabNumber(item.ui, 5)}</td>
                  <td className="py-2 px-3 text-right text-slate-500">{Math.pow(item.ui, 2).toExponential(3)}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{item.percentage.toFixed(2)}%</td>
                  <td className="py-2 px-3 text-right text-sky-700 font-semibold">{item.cumulative.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
