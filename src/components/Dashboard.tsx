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
  Printer,
  GitBranch,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface DashboardProps {
  budgets: UncertaintyBudget[];
  currentRole: UserRole;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onSelectBudget: (budget: UncertaintyBudget) => void;
  onCloneBudget: (budget: UncertaintyBudget) => void;
  onDeleteBudget: (id: string) => void;
  onPrintBudget: (budget: UncertaintyBudget) => void;
  onQuickPreview?: (budget: UncertaintyBudget) => void;
}

type SortColumn = 'CODE' | 'NAME' | 'CATEGORY' | 'UNCERTAINTY' | 'STATUS';
type SortDirection = 'ASC' | 'DESC';
type QuickFilterTab = 'ALL' | 'CHEMICAL' | 'BIOLOGICAL' | 'SUBMITTED' | 'APPROVED';

export const Dashboard: React.FC<DashboardProps> = ({
  budgets,
  currentRole,
  onCreateNew,
  onOpenTemplates,
  onSelectBudget,
  onCloneBudget,
  onDeleteBudget,
  onPrintBudget,
  onQuickPreview,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [quickTab, setQuickTab] = useState<QuickFilterTab>('ALL');
  const [sortColumn, setSortColumn] = useState<SortColumn>('CODE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = budgets.length;
    const submitted = budgets.filter(b => b.status === 'SUBMITTED').length;
    const approved = budgets.filter(b => b.status === 'APPROVED').length;
    const draftOrRejected = budgets.filter(b => b.status === 'DRAFT' || b.status === 'REJECTED').length;
    const chemical = budgets.filter(b => b.category === 'CHEMICAL').length;
    const biological = budgets.filter(b => b.category === 'BIOLOGICAL').length;

    return { total, submitted, approved, draftOrRejected, chemical, biological };
  }, [budgets]);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortColumn(col);
      setSortDirection('ASC');
    }
  };

  const handleQuickTabSelect = (tab: QuickFilterTab) => {
    setQuickTab(tab);
    if (tab === 'ALL') {
      setSelectedCategory('ALL');
      setSelectedStatus('ALL');
    } else if (tab === 'CHEMICAL') {
      setSelectedCategory('CHEMICAL');
      setSelectedStatus('ALL');
    } else if (tab === 'BIOLOGICAL') {
      setSelectedCategory('BIOLOGICAL');
      setSelectedStatus('ALL');
    } else if (tab === 'SUBMITTED') {
      setSelectedCategory('ALL');
      setSelectedStatus('SUBMITTED');
    } else if (tab === 'APPROVED') {
      setSelectedCategory('ALL');
      setSelectedStatus('APPROVED');
    }
  };

  // Filtered & Sorted List
  const filteredBudgets = useMemo(() => {
    const list = budgets.filter(item => {
      const matchesSearch = 
        item.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.matrix.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case 'CODE':
          cmp = a.testCode.localeCompare(b.testCode);
          break;
        case 'NAME':
          cmp = a.testName.localeCompare(b.testName);
          break;
        case 'CATEGORY':
          cmp = a.category.localeCompare(b.category);
          break;
        case 'UNCERTAINTY':
          cmp = a.results.expandedUncertainty - b.results.expandedUncertainty;
          break;
        case 'STATUS':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'ASC' ? cmp : -cmp;
    });

    return list;
  }, [budgets, searchQuery, selectedCategory, selectedStatus, sortColumn, sortDirection]);

  // Status Representation
  const renderStatus = (status: BudgetStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {t('statusApproved')}
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {t('statusSubmitted')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {t('statusRejected')}
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {t('statusDraft')}
          </span>
        );
    }
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return sortDirection === 'ASC' ? (
      <ArrowUp className="w-3 h-3 text-sky-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-sky-600" />
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Precision Workspace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t('dashTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dashSubtitle')} • {t('activeMode')}: <strong className={currentRole === 'ANALYST' ? 'text-sky-600' : 'text-amber-600'}>{currentRole === 'ANALYST' ? t('analystName') : t('managerName')}</strong>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('presetTemplates')}</span>
          </button>

          {currentRole === 'ANALYST' && (
            <button
              type="button"
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('createNewBudget')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Telemetry / Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-xl border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden shadow-2xs">
        
        {/* Total */}
        <div 
          onClick={() => handleQuickTabSelect('ALL')}
          className="p-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
        >
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            {t('totalBudgets')}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400">{t('methodsCount')}</span>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          onClick={() => handleQuickTabSelect('SUBMITTED')}
          className={`p-4 cursor-pointer transition-colors ${quickTab === 'SUBMITTED' ? 'bg-amber-100/40 ring-1 ring-inset ring-amber-300' : 'bg-amber-50/20 hover:bg-amber-50/60'}`}
        >
          <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">
            {t('pendingReview')}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {metrics.submitted}
            </span>
            <span className="text-xs text-amber-600/70">
              {currentRole === 'MANAGER' ? t('actionRequired') : t('inReview')}
            </span>
          </div>
        </div>

        {/* Approved */}
        <div 
          onClick={() => handleQuickTabSelect('APPROVED')}
          className={`p-4 cursor-pointer transition-colors ${quickTab === 'APPROVED' ? 'bg-emerald-100/40 ring-1 ring-inset ring-emerald-300' : 'bg-emerald-50/20 hover:bg-emerald-50/60'}`}
        >
          <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
            {t('approvedLock')}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {metrics.approved}
            </span>
            <span className="text-xs text-emerald-600/70">{t('readyAudit')}</span>
          </div>
        </div>

        {/* Draft / Revision */}
        <div className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            {t('draftOrRevision')}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-700">
              {metrics.draftOrRejected}
            </span>
            <span className="text-xs text-slate-400">{t('notFinalized')}</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar with Quick Tabs */}
      <div className="flex flex-col gap-3">
        
        {/* Interactive Quick Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => handleQuickTabSelect('ALL')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              quickTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('allRecords')} ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => handleQuickTabSelect('CHEMICAL')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              quickTab === 'CHEMICAL'
                ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('chemicalTab')} ({metrics.chemical})
          </button>
          <button
            type="button"
            onClick={() => handleQuickTabSelect('BIOLOGICAL')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              quickTab === 'BIOLOGICAL'
                ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('biologicalTab')} ({metrics.biological})
          </button>
          <button
            type="button"
            onClick={() => handleQuickTabSelect('SUBMITTED')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              quickTab === 'SUBMITTED'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('pendingReview')} ({metrics.submitted})
          </button>
          <button
            type="button"
            onClick={() => handleQuickTabSelect('APPROVED')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              quickTab === 'APPROVED'
                ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('approvedLock')} ({metrics.approved})
          </button>
        </div>

        {/* Detailed Search & Dropdown Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 rounded-md border border-slate-200 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('categoryFilter')}</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setQuickTab('ALL');
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">{t('allCategories')}</option>
              <option value="CHEMICAL">{t('chemEurachem')}</option>
              <option value="BIOLOGICAL">{t('bioIso')}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setQuickTab('ALL');
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">{t('allStatuses')}</option>
              <option value="DRAFT">{t('statusDraft')}</option>
              <option value="SUBMITTED">{t('statusSubmitted')}</option>
              <option value="APPROVED">{t('statusApproved')}</option>
              <option value="REJECTED">{t('statusRejected')}</option>
            </select>
          </div>
        </div>

      </div>

      {/* Laboratory Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider select-none">
                <th 
                  onClick={() => handleSort('CODE')}
                  className="py-2.5 px-4 w-48 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('colSopCode')}</span>
                    {renderSortIcon('CODE')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('NAME')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('colParameter')}</span>
                    {renderSortIcon('NAME')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('CATEGORY')}
                  className="py-2.5 px-4 w-40 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('colCategoryMatrix')}</span>
                    {renderSortIcon('CATEGORY')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('UNCERTAINTY')}
                  className="py-2.5 px-4 w-44 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('colExpandedU')}</span>
                    {renderSortIcon('UNCERTAINTY')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('STATUS')}
                  className="py-2.5 px-4 w-40 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('colStatus')}</span>
                    {renderSortIcon('STATUS')}
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right w-44">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">{t('noRecordsFound')}</p>
                    <p className="text-xs mt-0.5">{t('noRecordsHint')}</p>
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
                            <span>{t('clonedFrom')} v{(parseFloat(item.version) - 1.0 > 0 ? (parseFloat(item.version) - 1.0) : 1.0).toFixed(1)}</span>
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
                          <span>{t('preparedBy')}: {item.preparedBy}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{item.preparedDate}</span>
                        </div>
                      </td>

                      {/* Category & Matrix */}
                      <td className="py-3 px-4 align-top">
                        <div className="text-xs text-slate-700 font-medium">
                          {item.category === 'CHEMICAL' ? t('chemEurachem') : t('bioIso')}
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
                            {t('approvedBy')}: {item.approvedBy}
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
                          
                          {/* Quick Preview Drawer Eye Button */}
                          {onQuickPreview && (
                            <button
                              type="button"
                              onClick={() => onQuickPreview(item)}
                              title={t('quickPreview')}
                              className="p-1.5 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Print / View Report */}
                          <button
                            type="button"
                            onClick={() => onPrintBudget(item)}
                            title="Laporan PDF Rasmi ISO/IEC 17025"
                            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Clone as New Version (if Approved) */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => onCloneBudget(item)}
                              title={`Klon ke Versi Seterusnya v${(parseFloat(item.version) + 1.0).toFixed(1)}`}
                              className="p-1.5 rounded text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Primary Row Button: Edit, Review or View */}
                          <button
                            type="button"
                            onClick={() => onSelectBudget(item)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                              isSubmitted && currentRole === 'MANAGER'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'
                                : isApproved
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isSubmitted && currentRole === 'MANAGER' ? (
                              t('review')
                            ) : isApproved ? (
                              t('view')
                            ) : (
                              t('edit')
                            )}
                          </button>

                          {/* Delete - Draft or Rejected only */}
                          {(isDraft || isRejected) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(t('deleteDraftConfirm', { code: item.testCode }))) {
                                  onDeleteBudget(item.id);
                                }
                              }}
                              title={t('delete')}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
