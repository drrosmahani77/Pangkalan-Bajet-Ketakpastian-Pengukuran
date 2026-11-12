import React, { useState, useMemo } from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { Sliders, RotateCcw, ArrowRight, TrendingDown, Sparkles, Check } from 'lucide-react';

interface WhatIfSimulatorProps {
  budget: UncertaintyBudget;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ budget }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Find dominant Type B component
  const sortedTypeB = useMemo(() => {
    return [...budget.typeBComponents].sort((a, b) => b.standardUncertainty - a.standardUncertainty);
  }, [budget.typeBComponents]);

  const dominantComponent = sortedTypeB[0] || null;

  // Simulator controls state
  const originalN = budget.typeA.readings.length > 0 ? budget.typeA.readings.length : 5;
  const [simulatedN, setSimulatedN] = useState<number>(originalN);
  const [topBReductionPct, setTopBReductionPct] = useState<number>(0); // 0% to 80%

  // Compute simulated results
  const simulatedResults = useMemo(() => {
    // 1. Simulated Type A
    let simUA2 = 0;
    if (budget.typeA.enabled && simulatedN >= 2) {
      const s = budget.typeA.sd || 0.0837;
      const simUA = s / Math.sqrt(simulatedN);
      simUA2 = Math.pow(simUA, 2);
    }

    // 2. Simulated Type B sum
    let simTypeB2 = 0;
    budget.typeBComponents.forEach(comp => {
      let ui = comp.standardUncertainty;
      if (dominantComponent && comp.id === dominantComponent.id && topBReductionPct > 0) {
        // Reduced by selected percentage
        ui = ui * (1 - topBReductionPct / 100);
      }
      simTypeB2 += Math.pow(ui, 2);
    });

    const simUc = Math.sqrt(simUA2 + simTypeB2);
    const k = budget.results.coverageFactor || 2;
    const simU = simUc * k;

    const baseU = budget.results.expandedUncertainty;
    const diff = simU - baseU;
    const pctChange = baseU > 0 ? (diff / baseU) * 100 : 0;

    return {
      simUc,
      simU,
      diff,
      pctChange,
    };
  }, [budget, simulatedN, topBReductionPct, dominantComponent]);

  const isSimulatedActive = simulatedN !== originalN || topBReductionPct > 0;

  const handleReset = () => {
    setSimulatedN(originalN);
    setTopBReductionPct(0);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('whatIfTitle')}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t('whatIfSubtitle')}
          </p>
        </div>

        {isSimulatedActive && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('whatIfReset')}</span>
          </button>
        )}
      </div>

      {/* Simulator Sliders & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Slider 1: Replicate count n */}
        {budget.category === 'CHEMICAL' && budget.typeA.enabled && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {t('whatIfSimulateN')}
              </span>
              <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded text-[11px]">
                n = {simulatedN} {simulatedN !== originalN ? `(Asal: ${originalN})` : ''}
              </span>
            </div>

            <input
              type="range"
              min={2}
              max={25}
              step={1}
              value={simulatedN}
              onChange={(e) => setSimulatedN(parseInt(e.target.value, 10))}
              className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>n = 2 (Minimum)</span>
              <span>n = 10 (Saranan ISO)</span>
              <span>n = 25</span>
            </div>
          </div>
        )}

        {/* Slider 2: Dominant Type B optimization */}
        {dominantComponent && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={dominantComponent.source}>
                {t('whatIfSimulateTopB')}: <strong className="text-indigo-900">{dominantComponent.source}</strong>
              </span>
              <span className="font-mono font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                -{topBReductionPct}% ralat
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={topBReductionPct}
              onChange={(e) => setTopBReductionPct(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Asal)</span>
              <span>-40% (Kalibrasi Baharu)</span>
              <span>-80% (Alat Berkejituan Tinggi)</span>
            </div>
          </div>
        )}

      </div>

      {/* Simulated KPI Output Comparison Card */}
      <div className={`p-3.5 rounded-xl border transition-all ${
        isSimulatedActive 
          ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {t('whatIfBaselineU')}
            </span>
            <div className="font-mono text-base font-bold text-slate-700 tabular-nums">
              ±{formatLabNumber(budget.results.expandedUncertainty, 4)} {budget.unit}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                {t('whatIfProjectedU')}
              </span>
              <div className="font-mono text-lg font-black text-indigo-950 tabular-nums">
                ±{formatLabNumber(simulatedResults.simU, 4)} {budget.unit}
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {t('whatIfReduction')}
            </span>
            <div className={`font-mono text-base font-black tabular-nums flex items-center sm:justify-end gap-1 ${
              simulatedResults.pctChange < 0 ? 'text-emerald-700' : 'text-slate-600'
            }`}>
              {simulatedResults.pctChange < 0 && <TrendingDown className="w-4 h-4" />}
              <span>{simulatedResults.pctChange.toFixed(1)}%</span>
            </div>
          </div>

        </div>

        {isSimulatedActive && simulatedResults.pctChange < -5 && (
          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t('whatIfApplyAdvice')} <strong>{Math.abs(simulatedResults.pctChange).toFixed(1)}%</strong> ({isEn ? 'from' : 'daripada'} ±{formatLabNumber(budget.results.expandedUncertainty, 4)} {isEn ? 'to' : 'kepada'} ±{formatLabNumber(simulatedResults.simU, 4)} {budget.unit}).
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
