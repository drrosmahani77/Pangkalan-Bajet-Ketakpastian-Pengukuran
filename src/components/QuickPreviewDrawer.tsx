import React from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { X, ExternalLink, Printer, ShieldCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface QuickPreviewDrawerProps {
  budget: UncertaintyBudget | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: (budget: UncertaintyBudget) => void;
  onOpenPrint: (budget: UncertaintyBudget) => void;
}

export const QuickPreviewDrawer: React.FC<QuickPreviewDrawerProps> = ({
  budget,
  isOpen,
  onClose,
  onOpenBuilder,
  onOpenPrint,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen || !budget) return null;

  const isEn = language === 'en';
  const isApproved = budget.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-2 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full h-[88vh] flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                {budget.testCode}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">v{budget.version} · {budget.category}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {budget.testName}
            </h4>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span>{budget.matrix}</span>
              <span>·</span>
              <span className="font-mono">{budget.unit}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
              budget.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
              budget.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' :
              budget.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {budget.status}
            </span>
            <span className="text-slate-400 text-[11px]">
              {budget.preparedDate}
            </span>
          </div>

          {/* Key Uncertainty Results Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('ucLabel')}
              </span>
              <div className="font-mono text-base font-bold text-slate-100 tabular-nums">
                ±{formatLabNumber(budget.results.combinedUncertainty, 5)} {budget.unit}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">
                {t('uExpandedLabel')}
              </span>
              <div className="font-mono text-xl font-black text-sky-300 tabular-nums">
                ±{formatLabNumber(budget.results.expandedUncertainty, 4)} {budget.unit}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2 text-[11px] font-mono text-slate-300">
              "{budget.results.reportedResult}"
            </div>
          </div>

          {/* Type A summary */}
          {budget.category === 'CHEMICAL' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-800 text-xs block">
                {t('tableRepSummary')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                <div>n = {budget.typeA.readings.length}</div>
                <div>Min (x̄) = {formatLabNumber(budget.typeA.mean, 4)}</div>
                <div>SD (s) = {formatLabNumber(budget.typeA.sd, 4)}</div>
                <div className="text-sky-700 font-bold">u_A = {formatLabNumber(budget.typeA.standardUncertainty, 5)}</div>
              </div>
            </div>
          )}

          {/* Type B summary */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 text-xs block">
              {t('tableCompSummary')} ({budget.typeBComponents.length})
            </span>
            <div className="space-y-1">
              {budget.typeBComponents.map((comp, idx) => (
                <div key={comp.id || idx} className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px]">
                  <span className="truncate max-w-[200px] text-slate-800 font-medium">{comp.source}</span>
                  <span className="font-mono text-slate-600 font-bold">u_i = {formatLabNumber(comp.standardUncertainty, 5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {budget.notes && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
              "{budget.notes}"
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => onOpenPrint(budget)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isEn ? 'Print A4' : 'Cetak A4'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenBuilder(budget)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span>{isEn ? 'Open in Builder' : 'Buka di Pembina'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
