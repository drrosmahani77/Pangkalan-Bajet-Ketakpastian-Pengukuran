import React, { useState } from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber, formatIsoSignificantFigures } from '../utils/math';
import { useLanguage } from '../utils/i18n';
import { X, Calculator, Sparkles, BookOpen, Check, Layers, ChevronRight } from 'lucide-react';

interface FormulaInspectorModalProps {
  budget: UncertaintyBudget;
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaInspectorModal: React.FC<FormulaInspectorModalProps> = ({
  budget,
  isOpen,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TYPE_A' | 'TYPE_B' | 'COMBINED' | 'EXPANDED'>('OVERVIEW');

  if (!isOpen) return null;

  const isChemical = budget.category === 'CHEMICAL';
  const typeA = budget.typeA;
  const n = typeA.readings.length;
  const mean = typeA.mean;
  const sd = typeA.sd;
  const uA = typeA.enabled && n >= 2 ? typeA.standardUncertainty : 0;
  const uc = budget.results.combinedUncertainty;
  const k = budget.results.coverageFactor || 2;
  const U = budget.results.expandedUncertainty;
  const relativeU = mean > 0 ? (U / mean) * 100 : 0;
  const sigFigInfo = formatIsoSignificantFigures(mean > 0 ? mean : null, U, budget.unit, k);
  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="formula-inspector-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 id="formula-inspector-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{t('formulaInspectorTitle')}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                  {isEn ? 'ISO/IEC 17025 Clause 7.6' : 'ISO/IEC 17025 Klausa 7.6'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {t('formulaInspectorSub', { code: budget.testCode, name: budget.testName })}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tabFlowOverview')}
          </button>
          {isChemical && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('TYPE_A')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'TYPE_A'
                    ? 'border-sky-600 text-sky-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('tabStep1TypeA')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TYPE_B')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'TYPE_B'
                    ? 'border-sky-600 text-sky-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('tabStep2TypeB')}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('COMBINED')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'COMBINED'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tabStep3Combined')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPANDED')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'EXPANDED'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tabStep4Expanded')}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50">
                  <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wide">
                    1. Pengukuran Model
                  </span>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                    y = f(x₁, x₂, ..., xₙ)
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">
                    Nilai Min Anggaran: <strong className="font-mono">{formatLabNumber(mean, 4)} {budget.unit}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                  <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide">
                    2. Ketakpastian Piawai Gabungan
                  </span>
                  <p className="mt-1 font-mono text-sm font-bold text-indigo-900">
                    u_c = ±{formatLabNumber(uc, 5)} {budget.unit}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">
                    GUM Akar Kuasa Dua Jumlah Varians
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                    3. Ketakpastian Diperluas Rasmi
                  </span>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-900">
                    U = ±{formatLabNumber(U, 4)} {budget.unit}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-1">
                    Faktor liputan k = {k} (Tahap keyakinan ~95%)
                  </p>
                </div>
              </div>

              {/* Reported statement */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kenyataan Pelaporan Laporan Makmal ISO 17025 (Klausa 7.8.3.1):</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-900 select-all">
                  "{sigFigInfo.reported}"
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {sigFigInfo.explanation}
                </p>
              </div>

              {/* ISO reference box */}
              <div className="p-4 rounded-xl border border-slate-200 text-slate-600 flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-1">
                  <strong className="text-slate-800">Rujukan Metrologi Standard:</strong>
                  <p>
                    • <strong>JCGM 100:2008</strong>: Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM).
                  </p>
                  <p>
                    • <strong>EURACHEM / CITAC Guide CG4</strong>: Quantifying Uncertainty in Analytical Measurement (3rd Edition).
                  </p>
                  <p>
                    • <strong>ISO 19036:2019</strong>: Microbiology of the food chain — Estimation of measurement uncertainty for quantitative determinations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TYPE A */}
          {activeTab === 'TYPE_A' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
                <h3 className="font-bold text-sky-900 text-sm">Pengiraan Ketakpastian Jenis A (Type A Repeatability)</h3>
                <p className="text-slate-600 mt-1">
                  Diperoleh daripada analisis statistik siri pemerhatian bebas ({n} bacaan replikasi).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <span className="font-semibold text-slate-800 block text-xs">Langkah 1: Nilai Min (Mean)</span>
                  <div className="bg-slate-50 p-3 rounded-lg font-mono text-center text-xs">
                    x̄ = (1/n) · ∑ xᵢ
                  </div>
                  <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                    <div>Jumlah bacaan (n) = {n}</div>
                    <div>Hasil tambah (∑xᵢ) = {typeA.readings.reduce((a, b) => a + b, 0).toFixed(4)}</div>
                    <div className="text-sky-700 font-bold">Nilai Min (x̄) = {formatLabNumber(mean, 4)} {budget.unit}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <span className="font-semibold text-slate-800 block text-xs">Langkah 2: Sisihan Piawai Sampel (s)</span>
                  <div className="bg-slate-50 p-3 rounded-lg font-mono text-center text-xs">
                    s = √ [ ∑(xᵢ - x̄)² / (n - 1) ]
                  </div>
                  <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                    <div>Darjah kebebasan (df = n - 1) = {n > 1 ? n - 1 : 0}</div>
                    <div className="text-sky-700 font-bold">Sisihan Piawai (s) = {formatLabNumber(sd, 5)} {budget.unit}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <span className="font-semibold text-emerald-900 block text-xs">
                  Langkah 3: Ketakpastian Piawai Jenis A (u_A)
                </span>
                <div className="bg-white p-3 rounded-lg border border-emerald-200 font-mono text-center text-xs text-emerald-950 font-bold">
                  u_A = s / √n = {formatLabNumber(sd, 5)} / √{n} = {formatLabNumber(uA, 6)} {budget.unit}
                </div>
                <p className="text-[11px] text-emerald-800">
                  Sumbangan kepada jumlah varians makmal: <strong>{(typeA.varianceContribution || 0).toFixed(2)}%</strong>
                </p>
              </div>
            </div>
          )}

          {/* TAB: TYPE B */}
          {activeTab === 'TYPE_B' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
                <h3 className="font-bold text-indigo-900 text-sm">Pengiraan Ketakpastian Jenis B (Type B Systematic/Instrumental)</h3>
                <p className="text-slate-600 mt-1">
                  Formula asas: <span className="font-mono font-bold text-slate-800">u_i = ( a_i / Divisor ) × c_i</span>
                </p>
              </div>

              <div className="space-y-3">
                {budget.typeBComponents.map((comp, idx) => {
                  let divisorExplanation = 'Pembahagi 2.0 untuk 95% keyakinan normal';
                  if (comp.distribution === 'RECTANGULAR') divisorExplanation = '√3 ≈ 1.73205 untuk had toleransi segi empat tepat';
                  if (comp.distribution === 'TRIANGULAR') divisorExplanation = '√6 ≈ 2.44949 untuk glassware volumetrik segi tiga';

                  return (
                    <div key={comp.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {comp.source}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {comp.distribution}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                        <div>Had Nilai (a): <strong>{comp.value} {comp.unit}</strong></div>
                        <div>Pembahagi (Div): <strong>{comp.divisor.toFixed(5)}</strong></div>
                        <div>Pekali (c_i): <strong>{comp.sensitivityCoefficient}</strong></div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 italic">{divisorExplanation}</span>
                        <div className="font-mono font-bold text-indigo-700">
                          u_i = ({comp.value} / {comp.divisor.toFixed(3)}) × {comp.sensitivityCoefficient} = {formatLabNumber(comp.standardUncertainty, 6)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: COMBINED */}
          {activeTab === 'COMBINED' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
                <h3 className="font-bold text-indigo-900 text-sm">Ketakpastian Piawai Gabungan (Combined Standard Uncertainty - u_c)</h3>
                <p className="text-slate-600 mt-1">
                  Berdasarkan Hukum Penyebaran Ketakpastian (Law of Propagation of Uncertainty, JCGM 100:2008 Klausa 5.1).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-center space-y-2">
                <div className="text-slate-800 font-bold text-sm">
                  u_c = √ [ u_A² + u_B1² + u_B2² + ... + u_Bn² ]
                </div>
                <div className="text-slate-600 text-[11px]">
                  Semua komponen ditukar kepada sisihan piawai setara (standard uncertainty) sebelum digabungkan.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="font-semibold text-slate-800 block text-xs">Pecahan Jumlah Kuasa Dua Varians:</span>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                  {typeA.enabled && n >= 2 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>u_A² (Repeatability):</span>
                      <span>({formatLabNumber(uA, 6)})² = {Math.pow(uA, 2).toExponential(4)}</span>
                    </div>
                  )}
                  {budget.typeBComponents.map(comp => (
                    <div key={comp.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="truncate max-w-xs">{comp.source}:</span>
                      <span>({formatLabNumber(comp.standardUncertainty, 6)})² = {Math.pow(comp.standardUncertainty, 2).toExponential(4)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 font-bold text-indigo-900 bg-indigo-50/50 px-2 rounded">
                    <span>Jumlah Varians (Total Variance):</span>
                    <span>{Math.pow(uc, 2).toExponential(4)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 font-bold text-emerald-900 bg-emerald-50/50 px-2 rounded text-xs">
                    <span>Akar Kuasa Dua (u_c = √Total):</span>
                    <span>±{formatLabNumber(uc, 5)} {budget.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPANDED */}
          {activeTab === 'EXPANDED' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <h3 className="font-bold text-emerald-900 text-sm">Ketakpastian Diperluas (Expanded Uncertainty - U)</h3>
                <p className="text-slate-600 mt-1">
                  Memberikan selang di mana nilai sebenar dijangkakan berada dengan tahap keyakinan 95%.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-white font-mono text-center space-y-2">
                <div className="text-sm font-bold text-emerald-950">
                  U = k · u_c = 2 · {formatLabNumber(uc, 5)} = {formatLabNumber(U, 4)} {budget.unit}
                </div>
                <p className="text-[11px] text-slate-500">
                  Faktor liputan k = 2 sepadan dengan taburan normal pada tahap keyakinan 95.45% (ISO/IEC 17025 standard).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[11px] text-slate-500">Ketakpastian Diperluas Relatif (%U_rel)</span>
                  <div className="text-lg font-bold font-mono text-slate-800">
                    {relativeU.toFixed(2)}%
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Formula: (U / |x̄|) × 100%
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="text-[11px] text-slate-500">Selang Keyakinan 95%</span>
                  <div className="text-sm font-bold font-mono text-slate-800">
                    [{(mean - U).toFixed(4)}, {(mean + U).toFixed(4)}] {budget.unit}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Had Bawah dan Had Atas Nilai Diukur
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {isEn ? 'ISO/GUM 7.2.6 Rounding Format Enabled' : 'Format Pembundaran ISO/GUM 7.2.6 Diaktifkan'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            {t('closeInspector')}
          </button>
        </div>
      </div>
    </div>
  );
};
