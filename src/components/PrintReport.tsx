import React from 'react';
import { UncertaintyBudget } from '../types/labmu';
import { formatLabNumber, getDistributionLabel } from '../utils/math';
import { ArrowLeft, Printer, ShieldCheck, FlaskConical } from 'lucide-react';

interface PrintReportProps {
  budget: UncertaintyBudget;
  onBack: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ budget, onBack }) => {
  const isApproved = budget.status === 'APPROVED';
  const isChemical = budget.category === 'CHEMICAL';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Non-printing Control Header */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Editor</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Susun atur sedia untuk cetakan format A4 atau simpanan fail PDF.
          </span>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Eksport PDF</span>
          </button>
        </div>
      </div>

      {/* Official A4 Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 max-w-4xl mx-auto text-slate-900 print:border-none print:p-0 print:m-0 print:max-w-none shadow-xs">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                <FlaskConical className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-900">
                  Makmal Pengujian Kimia & Biologi Berakreditasi
                </h1>
                <p className="text-xs font-medium text-slate-600 tracking-wide">
                  Standard Sistem Pengurusan Kualiti Makmal ISO/IEC 17025:2017
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Laporan Rasmi Anggaran Ketakpastian Pengukuran (Measurement Uncertainty Budget Report)
                </p>
              </div>
            </div>

            {/* Stamp */}
            <div className="text-right shrink-0">
              {isApproved ? (
                <div className="border border-emerald-700 text-emerald-800 bg-emerald-50/50 px-3 py-1 rounded text-center">
                  <div className="flex items-center gap-1 justify-center text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>DILULUSKAN</span>
                  </div>
                  <div className="text-[9px] font-mono text-emerald-700">
                    ISO/IEC 17025 VERIFIED
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-amber-600 text-amber-800 bg-amber-50/40 px-3 py-1 rounded text-center">
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {budget.status === 'SUBMITTED' ? 'MENUNGGU KELULUSAN' : 'DRAF KAJIAN'}
                  </div>
                  <div className="text-[9px] font-mono text-amber-700">
                    STATUS: {budget.status}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 1: Method Identification Grid */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded mb-2.5">
            1. Maklumat Kaedah & Metadata Pengujian
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Parameter / Nama Kaedah</span>
              <span className="font-semibold text-slate-900">{budget.testName}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Kod SOP Makmal</span>
              <span className="font-mono font-bold text-slate-900">{budget.testCode}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Kategori & Piawaian</span>
              <span className="font-medium text-slate-900">
                {budget.category === 'CHEMICAL' ? 'Kimia (EURACHEM / CITAC)' : 'Biologi (ISO 19036:2019)'}
              </span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Versi Dokumen</span>
              <span className="font-mono font-bold text-slate-900">v{budget.version}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Matriks Sampel</span>
              <span className="font-medium text-slate-900">{budget.matrix}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Unit Pengukuran</span>
              <span className="font-mono font-bold text-slate-900">{budget.unit}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Disediakan Oleh</span>
              <span className="font-medium text-slate-900">{budget.preparedBy}</span>
            </div>

            <div className="border border-slate-200 p-2 rounded">
              <span className="text-[10px] uppercase font-medium text-slate-400 block">Tarikh Kelulusan</span>
              <span className="font-mono font-medium text-slate-900">
                {budget.approvedDate || 'Belum Diluluskan'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Uncertainty Budget Table */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded mb-2.5">
            2. Jadual Bajet Ketakpastian Pengukuran (Uncertainty Budget Table)
          </h2>

          <table className="w-full text-left border-collapse text-[11px] border border-slate-300">
            <thead>
              <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
                <th className="py-1.5 px-2.5 border-r border-slate-300">Komponen Sumber</th>
                <th className="py-1.5 px-2 border-r border-slate-300 w-14">Jenis</th>
                <th className="py-1.5 px-2 border-r border-slate-300 w-20">Nilai (±a)</th>
                <th className="py-1.5 px-2 border-r border-slate-300">Taburan</th>
                <th className="py-1.5 px-2 border-r border-slate-300 w-16 text-center">Pembahagi</th>
                <th className="py-1.5 px-2 border-r border-slate-300 w-12 text-center">ci</th>
                <th className="py-1.5 px-2 border-r border-slate-300 w-22 text-right">Ketakpastian ui</th>
                <th className="py-1.5 px-2 text-right w-16">Varians %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isChemical ? (
                <>
                  {budget.typeA.enabled && budget.typeA.readings.length >= 2 && (
                    <tr className="bg-slate-50/40">
                      <td className="py-1.5 px-2.5 border-r border-slate-200 font-medium">
                        Kebolehulangan Kaedah (Replikasi Siri Ujian, n = {budget.typeA.readings.length})
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">Type A</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-mono tabular-nums">
                        s = {formatLabNumber(budget.typeA.sd, 4)}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200">Normal (s / √n)</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono tabular-nums">
                        √{budget.typeA.readings.length}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-mono font-bold text-right tabular-nums">
                        {formatLabNumber(budget.typeA.standardUncertainty, 5)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-right tabular-nums">
                        {(budget.typeA.varianceContribution || 0).toFixed(1)}%
                      </td>
                    </tr>
                  )}

                  {budget.typeBComponents.map((comp) => (
                    <tr key={comp.id}>
                      <td className="py-1.5 px-2.5 border-r border-slate-200">{comp.source}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600">Type B</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-mono tabular-nums">{comp.value} {comp.unit}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200">{getDistributionLabel(comp.distribution)}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono tabular-nums">{comp.divisor.toFixed(4)}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono tabular-nums">{comp.sensitivityCoefficient.toFixed(2)}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-mono font-bold text-right tabular-nums">{formatLabNumber(comp.standardUncertainty, 5)}</td>
                      <td className="py-1.5 px-2 font-mono text-right tabular-nums">{(comp.varianceContribution || 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-medium">
                      sR (Sisihan Piawai Kebolehulangan Replikasi Koloni)
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">ISO 19036</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono tabular-nums">
                      {formatLabNumber(budget.biologyData?.sR, 4)} log10
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200">Normal Log10</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono font-bold text-right tabular-nums">
                      {formatLabNumber(budget.biologyData?.sR, 5)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right tabular-nums">
                      {(budget.biologyData?.varianceContribution_sR || 0).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-medium">
                      uMat (Ketakpastian Heterogeniti Matriks Sampel)
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">ISO 19036</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono tabular-nums">
                      {formatLabNumber(budget.biologyData?.uMat, 4)} log10
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200">Normal Log10</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono font-bold text-right tabular-nums">
                      {formatLabNumber(budget.biologyData?.uMat, 5)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right tabular-nums">
                      {(budget.biologyData?.varianceContribution_uMat || 0).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-medium">
                      uInc (Ketakpastian Suhu dan Masa Pengeraman)
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">ISO 19036</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono tabular-nums">
                      {formatLabNumber(budget.biologyData?.uInc, 4)} log10
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200">Normal Log10</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-center font-mono">1.0</td>
                    <td className="py-1.5 px-2 border-r border-slate-200 font-mono font-bold text-right tabular-nums">
                      {formatLabNumber(budget.biologyData?.uInc, 5)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right tabular-nums">
                      {(budget.biologyData?.varianceContribution_uInc || 0).toFixed(1)}%
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Summary Mathematical Calculation */}
        <div className="mb-6 p-3.5 rounded border border-slate-300 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            3. Ringkasan Pengiraan Ketakpastian Gabungan & Diperluas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium block">
                Ketakpastian Gabungan (uc)
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                {formatLabNumber(budget.results.combinedUncertainty, 5)} {budget.unit}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium block">
                Faktor Liputan (k)
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                k = 2.0 (Aras Keyakinan ~95%)
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium block">
                Ketakpastian Diperluas (U)
              </span>
              <span className="font-mono text-xs font-extrabold text-slate-900 tabular-nums">
                ± {formatLabNumber(budget.results.expandedUncertainty, 5)} {budget.unit}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-medium block">
                Piawaian Rujukan
              </span>
              <span className="font-medium text-slate-800">
                {isChemical ? 'EURACHEM / CITAC CG 4' : 'ISO 19036:2019'}
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Pernyataan Pelaporan Keputusan Rasmi ISO/IEC 17025 Klausa 7.8:
            </span>
            <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">
              Keputusan Ujian = {budget.results.reportedResult}
            </p>
          </div>
        </div>

        {/* Section 4: Dual-Party Signatures Block */}
        <div className="print-break-inside-avoid mt-6 pt-4 border-t-2 border-slate-900">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
            4. Pengesahan & Blok Tandatangan Dua Pihak (Dual Sign-off Block)
          </h2>

          <div className="grid grid-cols-2 gap-6 text-xs">
            
            {/* Analyst Signature */}
            <div className="border border-slate-300 p-3.5 rounded space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block border-b border-slate-200 pb-1">
                Disediakan Oleh (Analyst / Pegawai Sains)
              </span>
              
              <div className="h-12 flex items-end">
                <span className="font-serif italic text-sm text-slate-700 font-bold border-b border-dashed border-slate-400 w-full pb-1">
                  {budget.preparedBy}
                </span>
              </div>

              <div className="space-y-0.5 text-[11px] text-slate-600">
                <div>Nama: <strong className="text-slate-900">{budget.preparedBy}</strong></div>
                <div>Jawatan: <span className="text-slate-700">Pegawai Sains / Juruanalisis Makmal</span></div>
                <div>Tarikh: <span className="font-mono text-slate-900">{budget.preparedDate}</span></div>
              </div>
            </div>

            {/* Manager Signature */}
            <div className={`border p-3.5 rounded space-y-3 ${isApproved ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-300'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block border-b border-slate-200 pb-1">
                Disahkan & Diluluskan Oleh (Technical / Quality Manager)
              </span>

              <div className="h-12 flex items-end">
                {isApproved ? (
                  <span className="font-serif italic text-sm text-emerald-800 font-bold border-b border-dashed border-emerald-500 w-full pb-1">
                    {budget.approvedBy || 'Dr. Siti'}
                  </span>
                ) : (
                  <span className="text-slate-400 italic text-xs border-b border-dashed border-slate-300 w-full pb-1">
                    [Menunggu Kelulusan Pengurus Teknikal]
                  </span>
                )}
              </div>

              <div className="space-y-0.5 text-[11px] text-slate-600">
                <div>Nama: <strong className="text-slate-900">{budget.approvedBy || 'Dr. Siti'}</strong></div>
                <div>Jawatan: <span className="text-slate-700">Pengurus Teknikal & Kualiti (Technical Manager)</span></div>
                <div>Tarikh Kelulusan: <span className="font-mono text-slate-900">{budget.approvedDate || '-'}</span></div>
              </div>
            </div>

          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2">
            Laporan dijana secara automatik oleh sistem LabMU Pro v1.0 • Pematuhan ISO/IEC 17025, EURACHEM/CITAC Guide, ISO 19036 • Cetakan Sah Makmal
          </div>
        </div>

      </div>

    </div>
  );
};
