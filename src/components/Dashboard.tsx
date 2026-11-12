import React, { useState, useMemo } from 'react';
import { UncertaintyBudget, UserRole, BudgetStatus } from '../types/labmu';
import { formatLabNumber } from '../utils/math';
import { 
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  Copy, 
  Trash2, 
  Eye, 
  Edit3, 
  Printer,
  CheckCircle2,
  GitBranch
} from 'lucide-react';

interface DashboardProps {
  budgets: UncertaintyBudget[];
  currentRole: UserRole;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onSelectBudget: (budget: UncertaintyBudget) => void;
  onCloneBudget: (budget: UncertaintyBudget) => void;
  onDeleteBudget: (id: string) => void;
  onPrintBudget: (budget: UncertaintyBudget) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  budgets,
  currentRole,
  onCreateNew,
  onOpenTemplates,
  onSelectBudget,
  onCloneBudget,
  onDeleteBudget,
  onPrintBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = budgets.length;
    const submitted = budgets.filter(b => b.status === 'SUBMITTED').length;
    const approved = budgets.filter(b => b.status === 'APPROVED').length;
    const draftOrRejected = budgets.filter(b => b.status === 'DRAFT' || b.status === 'REJECTED').length;

    return { total, submitted, approved, draftOrRejected };
  }, [budgets]);

  // Filtered List
  const filteredBudgets = useMemo(() => {
    return budgets.filter(item => {
      const matchesSearch = 
        item.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.matrix.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [budgets, searchQuery, selectedCategory, selectedStatus]);

  // Status Representation (Zero-Pill: Clean unboxed text with semantic glyph)
  const renderStatus = (status: BudgetStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Diluluskan
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Menunggu Semakan
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Perlu Pembetulan
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Draf
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Precision Workspace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pangkalan Bajet Ketakpastian Pengukuran
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pengurusan & verifikasi ketakpastian ISO/IEC 17025 Klausa 7.6 • Mod Aktif: <strong className={currentRole === 'ANALYST' ? 'text-sky-600' : 'text-amber-600'}>{currentRole === 'ANALYST' ? 'Analyst (Ahmad)' : 'Technical Manager (Dr. Siti)'}</strong>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Templat Pratetap</span>
          </button>

          {currentRole === 'ANALYST' && (
            <button
              type="button"
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bina Bajet Baharu</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Telemetry / Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-xl border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden shadow-2xs">
        
        {/* Total */}
        <div className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Jumlah Rekod Bajet
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400">kaedah</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-4 bg-amber-50/20">
          <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">
            Menunggu Kelulusan
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {metrics.submitted}
            </span>
            <span className="text-xs text-amber-600/70">
              {currentRole === 'MANAGER' ? 'perlu tindakan' : 'dalam semakan'}
            </span>
          </div>
        </div>

        {/* Approved */}
        <div className="p-4 bg-emerald-50/20">
          <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
            Diluluskan (Audit Lock)
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {metrics.approved}
            </span>
            <span className="text-xs text-emerald-600/70">sedia audit SAMM</span>
          </div>
        </div>

        {/* Draft / Revision */}
        <div className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Draf / Pembetulan
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-700">
              {metrics.draftOrRejected}
            </span>
            <span className="text-xs text-slate-400">belum muktamad</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mengikut kod SOP, nama ujian, atau matriks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 rounded-md border border-slate-200 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="CHEMICAL">Kimia (EURACHEM)</option>
            <option value="BIOLOGICAL">Biologi (ISO 19036)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draf</option>
            <option value="SUBMITTED">Menunggu Kelulusan</option>
            <option value="APPROVED">Diluluskan</option>
            <option value="REJECTED">Perlu Pembetulan</option>
          </select>
        </div>

      </div>

      {/* Laboratory Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 w-48">Kod SOP / Kaedah</th>
                <th className="py-2.5 px-4">Nama Parameter Pengujian</th>
                <th className="py-2.5 px-4 w-40">Kategori & Matriks</th>
                <th className="py-2.5 px-4 w-44">Ketakpastian Diperluas (U)</th>
                <th className="py-2.5 px-4 w-40">Status Rekod</th>
                <th className="py-2.5 px-4 text-right w-44">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Tiada rekod bajet dijumpai.</p>
                    <p className="text-xs mt-0.5">Sila semak penapis carian atau gunakan Templat Pratetap.</p>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map((item) => {
                  const isApproved = item.status === 'APPROVED';
                  const isSubmitted = item.status === 'SUBMITTED';
                  const isRejected = item.status === 'REJECTED';
                  const isDraft = item.status === 'DRAFT';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Code & Version */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {item.testCode}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            v{item.version}
                          </span>
                        </div>
                        {item.parentRecordId && (
                          <div className="flex items-center gap-1 text-[10px] text-sky-700 mt-0.5">
                            <GitBranch className="w-3 h-3 text-sky-500" />
                            <span>Klon daripada v{(parseFloat(item.version) - 1.0 > 0 ? (parseFloat(item.version) - 1.0) : 1.0).toFixed(1)}</span>
                          </div>
                        )}
                      </td>

                      {/* Name & Subtitle */}
                      <td className="py-3 px-4 align-top">
                        <div 
                          onClick={() => onSelectBudget(item)}
                          className="font-semibold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors"
                        >
                          {item.testName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>Disediakan: {item.preparedBy}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{item.preparedDate}</span>
                        </div>
                      </td>

                      {/* Category & Matrix */}
                      <td className="py-3 px-4 align-top">
                        <div className="text-xs text-slate-700 font-medium">
                          {item.category === 'CHEMICAL' ? 'Kimia (EURACHEM)' : 'Biologi (ISO 19036)'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.matrix}
                        </div>
                      </td>

                      {/* Expanded Uncertainty */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                          ± {formatLabNumber(item.results.expandedUncertainty, 4)} <span className="font-sans font-normal text-slate-500 text-[11px]">{item.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          k = 2 · 95% CL
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 align-top">
                        <div>{renderStatus(item.status)}</div>
                        {isApproved && item.approvedBy && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Oleh: {item.approvedBy}
                          </div>
                        )}
                        {isRejected && item.rejectionReason && (
                          <div className="text-[10px] text-rose-600 mt-0.5 italic line-clamp-1" title={item.rejectionReason}>
                            "{item.rejectionReason}"
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Print / View Report */}
                          <button
                            type="button"
                            onClick={() => onPrintBudget(item)}
                            title="Laporan PDF Rasmi ISO/IEC 17025"
                            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Clone as New Version (if Approved) */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => onCloneBudget(item)}
                              title={`Klon ke Versi Seterusnya v${(parseFloat(item.version) + 1.0).toFixed(1)}`}
                              className="p-1.5 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Primary Row Button: Edit, Review or View */}
                          <button
                            type="button"
                            onClick={() => onSelectBudget(item)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              isSubmitted && currentRole === 'MANAGER'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'
                                : isApproved
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isSubmitted && currentRole === 'MANAGER' ? (
                              'Semak'
                            ) : isApproved ? (
                              'Papar'
                            ) : (
                              'Sunting'
                            )}
                          </button>

                          {/* Delete - Draft or Rejected only */}
                          {(isDraft || isRejected) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Adakah anda pasti ingin memadam bajet [${item.testCode}]?`)) {
                                  onDeleteBudget(item.id);
                                }
                              }}
                              title="Padam Draf"
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
