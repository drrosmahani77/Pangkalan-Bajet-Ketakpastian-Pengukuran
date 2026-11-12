import React, { useState, useRef, useMemo } from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { Activity, Eye, Info, Sparkles, Sliders } from 'lucide-react';

interface UncertaintyCurveChartProps {
  budget: UncertaintyBudget;
}

export const UncertaintyCurveChart: React.FC<UncertaintyCurveChartProps> = ({ budget }) => {
  const { t, language } = useLanguage();
  const [centerMode, setCenterMode] = useState<'MEAN' | 'ZERO'>('MEAN');
  const [hoverData, setHoverData] = useState<{
    xVal: number;
    zScore: number;
    density: number;
    svgX: number;
    svgY: number;
  } | null>(null);

  const isEn = language === 'en';
  const svgRef = useRef<SVGSVGElement>(null);

  // Mean & standard uncertainty
  const isChemical = budget.category === 'CHEMICAL';
  const meanVal = isChemical && budget.typeA.enabled && budget.typeA.readings.length > 0 
    ? budget.typeA.mean 
    : (budget.biologyData ? budget.biologyData.meanLog : 0);
  
  const uc = Math.max(0.00001, budget.results.combinedUncertainty || 0.01);
  const k = budget.results.coverageFactor || 2;
  const U = budget.results.expandedUncertainty || (k * uc);

  const center = centerMode === 'MEAN' ? meanVal : 0;
  const lowerBound = center - U;
  const upperBound = center + U;

  // Domain range: ±3.5 sigma for complete visual bell curve
  const minX = center - 3.5 * uc;
  const maxX = center + 3.5 * uc;
  const rangeX = maxX - minX;

  // Normal distribution PDF: f(x) = (1 / (sigma * sqrt(2*pi))) * exp(-0.5 * ((x - mu)/sigma)^2)
  const normalPdf = (x: number, mu: number, sigma: number) => {
    const factor = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
    return factor * Math.exp(exponent);
  };

  const peakDensity = normalPdf(center, center, uc);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 25, right: 30, bottom: 45, left: 30 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Convert (x, y) to SVG coords
  const toSvgX = (x: number) => {
    return padding.left + ((x - minX) / rangeX) * plotWidth;
  };

  const toSvgY = (density: number) => {
    return padding.top + plotHeight - (density / peakDensity) * plotHeight;
  };

  // Generate curve path points (80 samples for smooth SVG curve)
  const { fullCurvePath, shadedAreaPath, lowerBoundSvgX, upperBoundSvgX, centerSvgX } = useMemo(() => {
    const points: [number, number][] = [];
    const steps = 80;

    for (let i = 0; i <= steps; i++) {
      const x = minX + (i / steps) * rangeX;
      const y = normalPdf(x, center, uc);
      points.push([toSvgX(x), toSvgY(y)]);
    }

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt[0]} ${pt[1]}` : `${acc} L ${pt[0]} ${pt[1]}`;
    }, '');

    // Shaded path between [-U, +U] (k=2, 95.45% coverage)
    const shadedPoints: [number, number][] = [];
    const shadedSteps = 50;
    const xLow = center - U;
    const xHigh = center + U;

    for (let i = 0; i <= shadedSteps; i++) {
      const x = xLow + (i / shadedSteps) * (xHigh - xLow);
      const y = normalPdf(x, center, uc);
      shadedPoints.push([toSvgX(x), toSvgY(y)]);
    }

    const baselineY = padding.top + plotHeight;
    const shadedD = `M ${toSvgX(xLow)} ${baselineY} ` +
      shadedPoints.map(pt => `L ${pt[0]} ${pt[1]}`).join(' ') +
      ` L ${toSvgX(xHigh)} ${baselineY} Z`;

    return {
      fullCurvePath: pathD,
      shadedAreaPath: shadedD,
      lowerBoundSvgX: toSvgX(lowerBound),
      upperBoundSvgX: toSvgX(upperBound),
      centerSvgX: toSvgX(center),
    };
  }, [center, uc, U, minX, rangeX]);

  // Handle interactive hover over SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scale = svgWidth / rect.width;
    const svgMouseX = clientX * scale;

    if (svgMouseX < padding.left || svgMouseX > padding.left + plotWidth) {
      setHoverData(null);
      return;
    }

    const ratio = (svgMouseX - padding.left) / plotWidth;
    const xVal = minX + ratio * rangeX;
    const zScore = (xVal - center) / uc;
    const density = normalPdf(xVal, center, uc);
    const svgY = toSvgY(density);

    setHoverData({
      xVal,
      zScore,
      density,
      svgX: svgMouseX,
      svgY,
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
      
      {/* Header with mode toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('curveTitle')}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t('curveSubtitle')}
          </p>
        </div>

        {/* Center mode segmented control */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCenterMode('MEAN')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              centerMode === 'MEAN' 
                ? 'bg-white shadow-2xs text-slate-900 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('curveCenterMean')}
          </button>
          <button
            type="button"
            onClick={() => setCenterMode('ZERO')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              centerMode === 'ZERO' 
                ? 'bg-white shadow-2xs text-slate-900 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('curveCenterZero')}
          </button>
        </div>
      </div>

      {/* Visual Canvas Container */}
      <div className="relative bg-slate-50/50 rounded-xl border border-slate-200/80 p-2 sm:p-3 overflow-hidden select-none">
        
        {/* Metric indicators above graph */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-[11px] font-mono text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500/30 border border-sky-500 inline-block" />
            <span className="font-semibold text-sky-950">{t('curveCoverage95')}:</span>
            <span className="font-bold text-sky-800">
              [{formatLabNumber(lowerBound, 4)}, {formatLabNumber(upperBound, 4)}] {budget.unit}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>u_c = ±{formatLabNumber(uc, 5)}</span>
            <span>·</span>
            <span>U = ±{formatLabNumber(U, 4)}</span>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair min-w-[500px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Subtle gradient fill for 95% coverage band */}
              <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* Shaded 95% coverage interval [-2uc, +2uc] */}
            <path
              d={shadedAreaPath}
              fill="url(#coverageGradient)"
              stroke="#0284c7"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Full Gaussian Bell Curve line */}
            <path
              d={fullCurvePath}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Center Mean Line (x = mu) */}
            <line
              x1={centerSvgX}
              y1={padding.top}
              x2={centerSvgX}
              y2={padding.top + plotHeight}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Lower Bound line (x = mu - U) */}
            <line
              x1={lowerBoundSvgX}
              y1={padding.top + plotHeight * 0.25}
              x2={lowerBoundSvgX}
              y2={padding.top + plotHeight}
              stroke="#f43f5e"
              strokeWidth="1.5"
            />

            {/* Upper Bound line (x = mu + U) */}
            <line
              x1={upperBoundSvgX}
              y1={padding.top + plotHeight * 0.25}
              x2={upperBoundSvgX}
              y2={padding.top + plotHeight}
              stroke="#f43f5e"
              strokeWidth="1.5"
            />

            {/* X-axis tick labels */}
            <text
              x={centerSvgX}
              y={padding.top + plotHeight + 16}
              textAnchor="middle"
              className="text-[10px] font-mono fill-slate-800 font-bold"
            >
              {centerMode === 'MEAN' ? `ȳ = ${formatLabNumber(center, 3)}` : '0'}
            </text>

            <text
              x={lowerBoundSvgX}
              y={padding.top + plotHeight + 16}
              textAnchor="middle"
              className="text-[9.5px] font-mono fill-rose-600 font-semibold"
            >
              -U ({formatLabNumber(lowerBound, 3)})
            </text>

            <text
              x={upperBoundSvgX}
              y={padding.top + plotHeight + 16}
              textAnchor="middle"
              className="text-[9.5px] font-mono fill-rose-600 font-semibold"
            >
              +U ({formatLabNumber(upperBound, 3)})
            </text>

            <text
              x={padding.left}
              y={padding.top + plotHeight + 32}
              textAnchor="start"
              className="text-[9px] font-mono fill-slate-400"
            >
              -3.5σ
            </text>

            <text
              x={padding.left + plotWidth}
              y={padding.top + plotHeight + 32}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-400"
            >
              +3.5σ
            </text>

            {/* Interactive hover crosshair and tooltip */}
            {hoverData && (
              <g>
                {/* Vertical hairline probe */}
                <line
                  x1={hoverData.svgX}
                  y1={padding.top}
                  x2={hoverData.svgX}
                  y2={padding.top + plotHeight}
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Tracking circle on curve */}
                <circle
                  cx={hoverData.svgX}
                  cy={hoverData.svgY}
                  r="4"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Floating tooltip badge */}
                <g transform={`translate(${Math.min(svgWidth - 140, Math.max(padding.left + 10, hoverData.svgX - 60))}, 10)`}>
                  <rect
                    width="125"
                    height="36"
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.92"
                  />
                  <text x="8" y="15" fill="#e2e8f0" className="text-[9px] font-mono">
                    x: {formatLabNumber(hoverData.xVal, 4)} {budget.unit}
                  </text>
                  <text x="8" y="28" fill="#38bdf8" className="text-[9.5px] font-mono font-bold">
                    z: {hoverData.zScore >= 0 ? '+' : ''}{hoverData.zScore.toFixed(2)}σ (k={Math.abs(hoverData.zScore).toFixed(2)})
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Footnote hint */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 px-2">
          <span>{t('curveInteractiveHover')}</span>
          <span className="font-mono text-slate-400">P(|X - ȳ| ≤ 2u_c) = 95.45%</span>
        </div>

      </div>

    </div>
  );
};
