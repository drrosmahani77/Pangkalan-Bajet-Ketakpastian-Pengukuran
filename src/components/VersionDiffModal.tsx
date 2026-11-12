import React from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { 
  X, 
  GitCompare, 
  ArrowRight, 
  Plus, 
  Minus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface VersionDiffModalProps {
  currentBudget: UncertaintyBudget;
  parentBudget?: UncertaintyBudget | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (budget: UncertaintyBudget) => void;
  isManagerReview?: boolean;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  currentBudget,
  parentBudget,
  isOpen,
  onClose,
  onApprove,
  isManagerReview = false,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  if (!isOpen) return null;

  if (!parentBudget) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">{t('noParentTitle')}</h3>
          <p className="text-xs text-slate-500">
            {t('noParentDesc', { v: currentBudget.version })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  // Calculate delta differences
  const deltaU = currentBudget.results.expandedUncertainty - parentBudget.results.expandedUncertainty;
  const deltaUc = currentBudget.results.combinedUncertainty - parentBudget.results.combinedUncertainty;
  const deltaMean = currentBudget.typeA.mean - parentBudget.typeA.mean;

  // Type B components comparison
  const parentCompMap = new Map(parentBudget.typeBComponents.map(c => [c.source.trim().toLowerCase(), c]));
  const currentCompMap = new Map(currentBudget.typeBComponents.map(c => [c.source.trim().toLowerCase(), c]));

  const addedComponents = currentBudget.typeBComponents.filter(c => !parentCompMap.has(c.source.trim().toLowerCase()));
  const removedComponents = parentBudget.typeBComponents.filter(c => !currentCompMap.has(c.source.trim().toLowerCase()));
  
  const modifiedComponents: {
    source: string;
    oldVal: number;
    newVal: number;
    oldUi: number;
    newUi: number;
    distChanged: boolean;
  }[] = [];

  currentBudget.typeBComponents.forEach(curr => {
    const parent = parentCompMap.get(curr.source.trim().toLowerCase());
    if (parent) {
      if (
        Math.abs(curr.value - parent.value) > 1e-9 ||
        curr.distribution !== parent.distribution ||
        Math.abs(curr.sensitivityCoefficient - parent.sensitivityCoefficient) > 1e-9
      ) {
        modifiedComponents.push({
          source: curr.source,
          oldVal: parent.value,
          newVal: curr.value,
          oldUi: parent.standardUncertainty,
          newUi: curr.standardUncertainty,
          distChanged: curr.distribution !== parent.distribution,
        });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-diff-title"
      >
        {/* Header */}
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="version-diff-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{t('diffTitle')}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  v{parentBudget.version} ➔ v{currentBudget.version}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {t('diffSubtitle', { code: parentBudget.testCode })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Delta KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('deltaMeanTitle')}</span>
              <div className="flex items-center gap-2 font-mono text-base font-bold text-slate-900">
                <span>{formatLabNumber(parentBudget.typeA.mean, 4)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatLabNumber(currentBudget.typeA.mean, 4)}</span>
              </div>
              <p className={`text-[11px] font-mono font-medium ${deltaMean > 0 ? 'text-amber-600' : deltaMean < 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                Delta: {deltaMean >= 0 ? '+' : ''}{formatLabNumber(deltaMean, 4)} {currentBudget.unit}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('deltaUcTitle')}</span>
              <div className="flex items-center gap-2 font-mono text-base font-bold text-slate-900">
                <span>{formatLabNumber(parentBudget.results.combinedUncertainty, 4)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatLabNumber(currentBudget.results.combinedUncertainty, 4)}</span>
              </div>
              <p className={`text-[11px] font-mono font-medium ${deltaUc > 0 ? 'text-rose-600' : deltaUc < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                Delta: {deltaUc >= 0 ? '+' : ''}{formatLabNumber(deltaUc, 4)} {currentBudget.unit}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('deltaUTitle')}</span>
              <div className="flex items-center gap-2 font-mono text-base font-bold text-slate-900">
                <span>±{formatLabNumber(parentBudget.results.expandedUncertainty, 4)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-indigo-700">±{formatLabNumber(currentBudget.results.expandedUncertainty, 4)}</span>
              </div>
              <p className={`text-[11px] font-mono font-bold ${deltaU > 0 ? 'text-rose-600' : deltaU < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                Delta: {deltaU >= 0 ? '+' : ''}{formatLabNumber(deltaU, 4)} ({((deltaU / (parentBudget.results.expandedUncertainty || 1)) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Section: Type A Replicate Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center justify-between">
              <span>{t('secTypeADiff')}</span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                {parentBudget.typeA.readings.length} {isEn ? 'readings' : 'bacaan'} ➔ {currentBudget.typeA.readings.length} {isEn ? 'readings' : 'bacaan'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">{isEn ? 'Original' : 'Versi Asal'} v{parentBudget.version}</span>
                <div className="text-slate-700 mt-1 truncate">
                  [{parentBudget.typeA.readings.join(', ')}]
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                  <span>SD (s): {formatLabNumber(parentBudget.typeA.sd, 4)}</span>
                  <span>u_A: {formatLabNumber(parentBudget.typeA.standardUncertainty, 5)}</span>
                </div>
              </div>

              <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
                <span className="text-[10px] text-sky-800 block uppercase font-sans font-semibold">{isEn ? 'New Version' : 'Versi Baharu'} v{currentBudget.version}</span>
                <div className="text-sky-950 font-bold mt-1 truncate">
                  [{currentBudget.typeA.readings.join(', ')}]
                </div>
                <div className="mt-2 text-[11px] text-sky-800 flex justify-between">
                  <span>SD (s): {formatLabNumber(currentBudget.typeA.sd, 4)}</span>
                  <span className="font-bold">u_A: {formatLabNumber(currentBudget.typeA.standardUncertainty, 5)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Type B Component Differences */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              {t('secTypeBDiff', { mod: modifiedComponents.length, add: addedComponents.length, rem: removedComponents.length })}
            </h3>

            {/* Modified */}
            {modifiedComponents.map((mod, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-amber-950">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>{mod.source}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono">
                    {t('chipModified')}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-amber-900 pt-1">
                  <span>{isEn ? 'Value' : 'Nilai'}: <del className="text-slate-400">{mod.oldVal}</del> ➔ <strong className="text-amber-800">{mod.newVal}</strong></span>
                  <span>·</span>
                  <span>u_i: <del className="text-slate-400">{formatLabNumber(mod.oldUi, 5)}</del> ➔ <strong>{formatLabNumber(mod.newUi, 5)}</strong></span>
                </div>
              </div>
            ))}

            {/* Added */}
            {addedComponents.map((add, i) => (
              <div key={i} className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-950">
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{add.source}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono">
                    {t('chipAdded')}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-emerald-900">
                  {isEn ? 'Value' : 'Nilai'}: {add.value} {add.unit} ({add.distribution}) ➔ u_i = {formatLabNumber(add.standardUncertainty, 5)}
                </div>
              </div>
            ))}

            {/* Removed */}
            {removedComponents.map((rem, i) => (
              <div key={i} className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-rose-950">
                  <div className="flex items-center gap-1.5">
                    <Minus className="w-3.5 h-3.5 text-rose-600" />
                    <span className="line-through">{rem.source}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-mono">
                    {t('chipRemoved')}
                  </span>
                </div>
              </div>
            ))}

            {modifiedComponents.length === 0 && addedComponents.length === 0 && removedComponents.length === 0 && (
              <p className="text-slate-500 text-[11px] italic">
                {t('noTypeBChanges')}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {isEn ? 'Master Audit Log preserved under ISO/IEC 17025 Clause 8.4' : 'Log Audit Induk Terpelihara mengikut ISO/IEC 17025 Klausa 8.4'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              {t('close')}
            </button>
            {isManagerReview && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(currentBudget);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('btnApproveVersion', { v: currentBudget.version })}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
