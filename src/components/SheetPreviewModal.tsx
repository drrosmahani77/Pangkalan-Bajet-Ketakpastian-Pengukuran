import React from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber, formatIsoSignificantFigures } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

interface SheetPreviewModalProps {
  budget: UncertaintyBudget;
  isOpen: boolean;
  onClose: () => void;
  onPrintNow: () => void;
}

export const SheetPreviewModal: React.FC<SheetPreviewModalProps> = ({
  budget,
  isOpen,
  onClose,
  onPrintNow,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen) return null;

  const isApproved = budget.status === 'APPROVED';
  const isChemical = budget.category === 'CHEMICAL';
  const isEn = language === 'en';
  const sigFigInfo = formatIsoSignificantFigures(
    budget.typeA.enabled && budget.typeA.readings.length >= 2 ? budget.typeA.mean : null,
    budget.results.expandedUncertainty,
    budget.unit,
    budget.results.coverageFactor
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="bg-slate-200/90 rounded-2xl shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[96vh] overflow-hidden border border-slate-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-preview-title"
      >
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 id="sheet-preview-title" className="text-sm font-bold flex items-center gap-2">
                <span>{t('sheetPreviewTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono border border-slate-700">
                  ISO/IEC 17025 A4 Format
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {budget.testCode} — v{budget.version} ({budget.status})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrintNow}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('btnExportPdf')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Realistic A4 Paper Viewport */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-700/30">
          
          {/* Simulated A4 Paper (aspect ratio ~1:1.414) */}
          <div className="relative w-full max-w-[760px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 border border-slate-300 min-h-[1050px] flex flex-col justify-between text-xs font-sans">
            
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 z-0 select-none">
              <span className="text-8xl font-black font-mono tracking-widest rotate-[-35deg] text-slate-900 uppercase">
                {budget.status === 'APPROVED' ? 'ISO 17025 ACCREDITED' : budget.status}
              </span>
            </div>

            {/* Document Content */}
            <div className="relative z-10 space-y-6">
              
              {/* Laboratory Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-slate-950">
                      {t('labHeaderTitle')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {t('labHeaderSub')}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {t('labHeaderSub2')}
                  </p>
                </div>

                <div className="text-right text-[11px] font-mono space-y-0.5 shrink-0 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>{t('docNoLabel')} <strong>MU-REP-{budget.testCode}</strong></div>
                  <div>{t('methodVerLabel')} <strong>v{budget.version}</strong></div>
                  <div>{t('effectiveDateLabel')} <strong>{budget.approvedDate || budget.preparedDate}</strong></div>
                  <div>{t('statusLabel')} <strong className={isApproved ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{budget.status}</strong></div>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center py-2 bg-slate-100 rounded border border-slate-200">
                <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {t('officialReportTitle')}
                </h1>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                  {isEn ? 'Method' : 'Kaedah'}: {budget.testName} ({budget.testCode})
                </p>
              </div>

              {/* Metadata Table */}
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-50 p-2 font-semibold w-1/4 border-r border-slate-300">{t('tableParamHeader')}</td>
                    <td className="p-2 w-1/4 border-r border-slate-300">{budget.testName}</td>
                    <td className="bg-slate-50 p-2 font-semibold w-1/4 border-r border-slate-300">{t('tableCatMatrixHeader')}</td>
                    <td className="p-2 w-1/4">{budget.category === 'CHEMICAL' ? (isEn ? 'Chemical' : 'Kimia') : (isEn ? 'Biological' : 'Biologi')} ({budget.matrix})</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-50 p-2 font-semibold border-r border-slate-300">{t('tableStdRefHeader')}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{budget.testCode}</td>
                    <td className="bg-slate-50 p-2 font-semibold border-r border-slate-300">{t('tableUnitHeader')}</td>
                    <td className="p-2 font-mono font-bold">{budget.unit}</td>
                  </tr>
                </tbody>
              </table>

              {/* Type A Summary (if Chemical) */}
              {isChemical && budget.typeA.enabled && (
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 border-b border-slate-300 pb-1">
                    {t('tableRepSummary')}
                  </h3>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>{isEn ? 'Replicates' : 'Replikasi'} (n): <strong>{budget.typeA.readings.length}</strong></div>
                    <div>{isEn ? 'Mean' : 'Min'} (x̄): <strong>{formatLabNumber(budget.typeA.mean, 4)}</strong></div>
                    <div>{isEn ? 'Std Deviation' : 'Sisihan Piawai'} (s): <strong>{formatLabNumber(budget.typeA.sd, 4)}</strong></div>
                    <div className="text-sky-800 font-bold">u_A (s/√n): <strong>{formatLabNumber(budget.typeA.standardUncertainty, 5)}</strong></div>
                  </div>
                </div>
              )}

              {/* Type B Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 border-b border-slate-300 pb-1">
                  {t('tableCompSummary')}
                </h3>
                <table className="w-full text-[10.5px] border-collapse border border-slate-300 font-mono">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-left">
                      <th className="p-1.5 border-r border-slate-300">{isEn ? 'Uncertainty Source' : 'Sumber Ralat (Source)'}</th>
                      <th className="p-1.5 border-r border-slate-300">{isEn ? 'Value (±a)' : 'Nilai (±a)'}</th>
                      <th className="p-1.5 border-r border-slate-300">{isEn ? 'Distribution' : 'Taburan'}</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">{isEn ? 'Divisor' : 'Pembahagi'}</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">c_i</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">u_i</th>
                      <th className="p-1.5 text-right">{isEn ? '% Variance' : '% Varians'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isChemical && budget.typeA.enabled && (
                      <tr className="border-b border-slate-200">
                        <td className="p-1.5 border-r border-slate-300 font-sans font-medium">{isEn ? 'Test Repeatability (Type A)' : 'Replikasi Ujian (Type A)'}</td>
                        <td className="p-1.5 border-r border-slate-300">{formatLabNumber(budget.typeA.sd, 4)}</td>
                        <td className="p-1.5 border-r border-slate-300 font-sans">Normal (k=1)</td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono">√{budget.typeA.readings.length}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right">1.0</td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-bold">{formatLabNumber(budget.typeA.standardUncertainty, 5)}</td>
                        <td className="p-1.5 text-right">{(budget.typeA.varianceContribution || 0).toFixed(1)}%</td>
                      </tr>
                    )}
                    {budget.typeBComponents.map(comp => (
                      <tr key={comp.id} className="border-b border-slate-200">
                        <td className="p-1.5 border-r border-slate-300 font-sans font-medium">{comp.source}</td>
                        <td className="p-1.5 border-r border-slate-300">{comp.value}</td>
                        <td className="p-1.5 border-r border-slate-300 font-sans">{comp.distribution}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right">{comp.divisor.toFixed(4)}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right">{comp.sensitivityCoefficient}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-bold">{formatLabNumber(comp.standardUncertainty, 5)}</td>
                        <td className="p-1.5 text-right">{(comp.varianceContribution || 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Final Statement & Calculations */}
              <div className="p-4 rounded border-2 border-slate-800 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>{isEn ? 'Combined Std Uncertainty' : 'Ketakpastian Piawai Gabungan'} (u_c): ±{formatLabNumber(budget.results.combinedUncertainty, 5)} {budget.unit}</span>
                  <span>{isEn ? 'Coverage Factor' : 'Faktor Liputan'}: k = {budget.results.coverageFactor} (95% CL)</span>
                </div>
                <div className="text-center py-2 font-mono text-sm font-extrabold text-slate-950">
                  {t('reportedStatementBox')} {sigFigInfo.reported}
                </div>
                <p className="text-[10px] text-slate-600 text-center italic">
                  {t('footnoteText')}
                </p>
              </div>

              {/* ISO Sign-off Section */}
              <div className="pt-4 grid grid-cols-2 gap-8 border-t border-slate-300 text-[11px]">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] block">{t('signPreparedBy')}</span>
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end pb-1 font-mono font-semibold text-slate-800">
                    {budget.preparedBy}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {t('dateLabel')} {budget.preparedDate}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] block">{t('signApprovedBy')}</span>
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end pb-1 font-mono font-semibold text-slate-800">
                    {budget.approvedBy || (isApproved ? 'Dr. Siti (Technical Manager)' : (isEn ? 'PENDING APPROVAL' : 'MENUNGGU KELULUSAN'))}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {t('dateLabel')} {budget.approvedDate || (isApproved ? '2026-11-12' : '-')}
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Sheet Footer */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>LabMU Pro ISO/IEC 17025 Compliance Engine</span>
              <span>{t('pageNumber')}</span>
              <span>{isEn ? 'Printed' : 'Dicetak'}: {new Date().toISOString().slice(0, 10)}</span>
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {isEn ? 'Tip: Click "Print / Export PDF" to save as vector-quality A4 document.' : 'Tip: Klik butang "Cetak / Eksport PDF" untuk menyimpan sebagai PDF berkualiti A4 vektor.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              {t('closePreview')}
            </button>
            <button
              type="button"
              onClick={onPrintNow}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printNow')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
