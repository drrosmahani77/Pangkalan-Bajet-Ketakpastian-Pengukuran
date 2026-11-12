import React, { useState } from 'react';
import { formatLabNumber } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { AlertCircle, Target } from 'lucide-react';

interface ReplicateScatterPlotProps {
  readings: number[];
  mean: number;
  sd: number;
  unit: string;
  onRemoveReading?: (index: number) => void;
}

export const ReplicateScatterPlot: React.FC<ReplicateScatterPlotProps> = ({
  readings,
  mean,
  sd,
  unit,
  onRemoveReading,
}) => {
  const { t, language } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (readings.length < 2) return null;

  const isEn = language === 'en';
  const minVal = Math.min(...readings);
  const maxVal = Math.max(...readings);
  
  // Calculate spread with buffer
  const spread = Math.max(0.0001, maxVal - minVal);
  const plotMin = minVal - spread * 0.15;
  const plotMax = maxVal + spread * 0.15;
  const totalRange = plotMax - plotMin;

  const toPct = (val: number) => {
    return Math.max(2, Math.min(98, ((val - plotMin) / totalRange) * 100));
  };

  // Detect potential outliers (|x - mean| > 2.5 * sd)
  const outliers = readings.filter(r => Math.abs(r - mean) > 2.5 * sd);

  return (
    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Target className="w-3.5 h-3.5 text-sky-600" />
          <span>{t('dotPlotTitle')}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span>Min: {formatLabNumber(mean, 4)} {unit}</span>
          <span>·</span>
          <span>s: {formatLabNumber(sd, 4)}</span>
        </div>
      </div>

      {/* Interactive Scatter Axis Track */}
      <div className="relative h-12 flex items-center px-2 select-none">
        
        {/* Horizontal Axis Baseline */}
        <div className="absolute left-2 right-2 h-1 bg-slate-200 rounded-full" />

        {/* 1-Sigma Zone */}
        {sd > 0 && (
          <div
            className="absolute h-4 bg-sky-200/40 border-x border-sky-400/50 rounded-sm pointer-events-none"
            style={{
              left: `${toPct(mean - sd)}%`,
              width: `${Math.max(2, toPct(mean + sd) - toPct(mean - sd))}%`,
            }}
            title="±1s (68.3% coverage)"
          />
        )}

        {/* Mean Indicator Notch */}
        <div
          className="absolute -top-1 bottom-1 w-0.5 bg-sky-600 z-10 pointer-events-none"
          style={{ left: `${toPct(mean)}%` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-sky-700 bg-sky-50 px-1 rounded shadow-2xs">
            x̄
          </div>
        </div>

        {/* Points on axis */}
        {readings.map((r, i) => {
          const isOutlier = Math.abs(r - mean) > 2.5 * sd;
          const isHovered = hoveredIndex === i;
          const pos = toPct(r);
          const dev = r - mean;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="absolute -translate-x-1/2 cursor-pointer z-20 group"
              style={{ left: `${pos}%` }}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-transform ${
                isOutlier 
                  ? 'bg-rose-500 border-white ring-2 ring-rose-400' 
                  : isHovered 
                  ? 'bg-sky-600 border-white scale-125 ring-2 ring-sky-300' 
                  : 'bg-slate-800 border-white hover:scale-115'
              }`} />

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none animate-in fade-in duration-100">
                  <div>#{i + 1}: <strong>{r} {unit}</strong></div>
                  <div className="text-slate-300">
                    Δ = {dev >= 0 ? '+' : ''}{formatLabNumber(dev, 4)} ({((dev / sd)).toFixed(1)}s)
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Axis range values & Outlier Alert */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
        <span>{formatLabNumber(minVal, 3)} {unit}</span>
        <span>x̄ = {formatLabNumber(mean, 4)}</span>
        <span>{formatLabNumber(maxVal, 3)} {unit}</span>
      </div>

      {outliers.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-[11px] text-rose-800 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{t('outlierWarning')}</span>
        </div>
      )}
    </div>
  );
};
