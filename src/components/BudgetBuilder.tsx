import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UncertaintyBudget, 
  UserRole, 
  TypeBComponent, 
  DistributionType 
} from '../types/labmu';
import { 
  calculateChemicalBudget, 
  calculateBiologyBudget, 
  getDistributionDivisor, 
  getDistributionLabel, 
  formatLabNumber,
  formatIsoSignificantFigures
} from '../utils/math';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Copy, 
  Printer, 
  Plus, 
  Trash2, 
  AlertTriangle,
  FlaskConical,
  Dna,
  Calculator,
  Check,
  Sparkles,
  FileSpreadsheet,
  Wrench,
  GitCompare,
  Eye,
  HelpCircle,
  Layers,
  CheckCheck,
  RefreshCw,
  Clock,
  Lightbulb
} from 'lucide-react';

import { FormulaInspectorModal } from './FormulaInspectorModal';
import { ParetoAnalysisChart } from './ParetoAnalysisChart';
import { BatchPasteModal } from './BatchPasteModal';
import { EquipmentLibraryModal } from './EquipmentLibraryModal';
import { VersionDiffModal } from './VersionDiffModal';
import { SheetPreviewModal } from './SheetPreviewModal';

interface BudgetBuilderProps {
  budget: UncertaintyBudget;
  allBudgets?: UncertaintyBudget[];
  currentRole: UserRole;
  onSaveDraft: (updatedBudget: UncertaintyBudget) => void;
  onSubmitForReview: (updatedBudget: UncertaintyBudget) => void;
  onApprove: (budget: UncertaintyBudget) => void;
  onRejectRequest: (budget: UncertaintyBudget) => void;
  onCloneAsNewVersion: (budget: UncertaintyBudget) => void;
  onPrint: (budget: UncertaintyBudget) => void;
  onBack: () => void;
}

export const BudgetBuilder: React.FC<BudgetBuilderProps> = ({
  budget,
  allBudgets = [],
  currentRole,
  onSaveDraft,
  onSubmitForReview,
  onApprove,
  onRejectRequest,
  onCloneAsNewVersion,
  onPrint,
  onBack,
}) => {
  const [currentBudget, setCurrentBudget] = useState<UncertaintyBudget>(budget);
  const [newReadingInput, setNewReadingInput] = useState<string>('');
  const [newBioCfuInput, setNewBioCfuInput] = useState<string>('');

  // Modals state
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isBatchPasteOpen, setIsBatchPasteOpen] = useState(false);
  const [batchPasteTarget, setBatchPasteTarget] = useState<'TYPE_A' | 'CFU'>('TYPE_A');
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isSheetPreviewOpen, setIsSheetPreviewOpen] = useState(false);

  // UI 4: Significant figures vs Full precision toggle
  const [reportingFormat, setReportingFormat] = useState<'ISO_GUM' | 'RAW'>('ISO_GUM');

  // UX 2: Auto-save & unsaved state
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'UNSAVED'>('SAVED');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialBudgetRef = useRef<string>(JSON.stringify(budget));

  const isApproved = currentBudget.status === 'APPROVED';
  const isSubmitted = currentBudget.status === 'SUBMITTED';
  const isRejected = currentBudget.status === 'REJECTED';
  const isDraft = currentBudget.status === 'DRAFT';

  // Access control lock
  const isReadOnly = isApproved || (isSubmitted && currentRole === 'ANALYST') || (currentRole === 'MANAGER' && (isDraft || isRejected));

  // Find parent budget for Version Diff View
  const parentBudget = useMemo(() => {
    if (!currentBudget.parentRecordId) return null;
    return allBudgets.find(b => b.id === currentBudget.parentRecordId) || null;
  }, [currentBudget.parentRecordId, allBudgets]);

  useEffect(() => {
    setCurrentBudget(budget);
    initialBudgetRef.current = JSON.stringify(budget);
    setSaveStatus('SAVED');
  }, [budget]);

  // UX 2: Debounced Auto-Save
  const triggerDebouncedAutoSave = (updated: UncertaintyBudget) => {
    if (isReadOnly) return;
    setSaveStatus('UNSAVED');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('SAVING');
      // Save silently to avoid annoying alerts on auto-save
      setTimeout(() => {
        onSaveDraft(updated);
        setSaveStatus('SAVED');
      }, 500);
    }, 1200);
  };

  // Recalculations
  const handleRecalculateChemical = (
    typeA = currentBudget.typeA,
    typeB = currentBudget.typeBComponents
  ) => {
    const calculated = calculateChemicalBudget(typeA, typeB);
    const updated: UncertaintyBudget = {
      ...currentBudget,
      typeA: calculated.typeA,
      typeBComponents: calculated.typeBComponents,
      results: calculated.results,
      updatedAt: new Date().toISOString(),
    };
    setCurrentBudget(updated);
    triggerDebouncedAutoSave(updated);
  };

  const handleRecalculateBiology = (bioData = currentBudget.biologyData) => {
    if (!bioData) return;
    const bioResult = calculateBiologyBudget(bioData);
    const updated: UncertaintyBudget = {
      ...currentBudget,
      biologyData: bioResult,
      results: {
        combinedUncertainty: bioResult.uBiol,
        coverageFactor: 2,
        expandedUncertainty: bioResult.expandedU,
        confidenceInterval: '95%',
        reportedResult: `${bioResult.meanLog.toFixed(2)} ± ${bioResult.expandedU.toFixed(2)} ${bioResult.unit} (k=2, 95% CL)`,
      },
      updatedAt: new Date().toISOString(),
    };
    setCurrentBudget(updated);
    triggerDebouncedAutoSave(updated);
  };

  // Type A handlers
  const handleAddReading = () => {
    if (isReadOnly) return;
    const val = parseFloat(newReadingInput);
    if (isNaN(val)) return;

    const newReadings = [...currentBudget.typeA.readings, val];
    const newTypeA = {
      ...currentBudget.typeA,
      readings: newReadings,
    };
    setNewReadingInput('');
    handleRecalculateChemical(newTypeA);
  };

  const handleRemoveReading = (index: number) => {
    if (isReadOnly) return;
    const newReadings = currentBudget.typeA.readings.filter((_, i) => i !== index);
    const newTypeA = {
      ...currentBudget.typeA,
      readings: newReadings,
    };
    handleRecalculateChemical(newTypeA);
  };

  // UX 1: Batch paste applied
  const handleApplyBatchData = (numbers: number[], mode: 'REPLACE' | 'APPEND') => {
    if (isReadOnly) return;
    if (batchPasteTarget === 'TYPE_A') {
      const newReadings = mode === 'REPLACE' ? numbers : [...currentBudget.typeA.readings, ...numbers];
      const newTypeA = {
        ...currentBudget.typeA,
        enabled: true,
        readings: newReadings,
      };
      handleRecalculateChemical(newTypeA);
    } else {
      const prevBio = currentBudget.biologyData || {
        cfuReadings: [],
        logValues: [],
        meanLog: 0,
        sR: 0.02,
        uMat: 0.015,
        uInc: 0.012,
        uBiol: 0.028,
        expandedU: 0.056,
        unit: 'log10 CFU/g',
        lodAdvisory: false,
      };
      const newCFUs = mode === 'REPLACE' ? numbers : [...prevBio.cfuReadings, ...numbers];
      handleRecalculateBiology({
        ...prevBio,
        cfuReadings: newCFUs,
      });
    }
  };

  // Type B handlers
  const handleAddTypeB = () => {
    if (isReadOnly) return;
    const newComp: TypeBComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      source: 'Komponen Ketakpastian Baharu',
      value: 0.001,
      unit: currentBudget.unit || 'unit',
      distribution: 'RECTANGULAR',
      divisor: getDistributionDivisor('RECTANGULAR'),
      sensitivityCoefficient: 1.0,
      standardUncertainty: (0.001 / getDistributionDivisor('RECTANGULAR')) * 1.0,
    };
    const updated = [...currentBudget.typeBComponents, newComp];
    handleRecalculateChemical(undefined, updated);
  };

  const handleUpdateTypeB = (
    id: string,
    field: keyof TypeBComponent,
    value: any
  ) => {
    if (isReadOnly) return;
    const updated = currentBudget.typeBComponents.map(comp => {
      if (comp.id !== id) return comp;

      const mod = { ...comp, [field]: value };
      if (field === 'distribution') {
        mod.divisor = getDistributionDivisor(value as DistributionType);
      }
      const div = mod.divisor || 1.0;
      const val = isNaN(mod.value) ? 0 : Math.abs(mod.value);
      const ci = isNaN(mod.sensitivityCoefficient) ? 1.0 : mod.sensitivityCoefficient;
      mod.standardUncertainty = (val / div) * ci;
      return mod;
    });
    handleRecalculateChemical(undefined, updated);
  };

  const handleRemoveTypeB = (id: string) => {
    if (isReadOnly) return;
    const updated = currentBudget.typeBComponents.filter(c => c.id !== id);
    handleRecalculateChemical(undefined, updated);
  };

  // UX 3: Smart distribution keyword advisor
  const getAdvisorSuggestion = (source: string): { suggestedDist: DistributionType; reason: string } | null => {
    const s = source.toLowerCase();
    if (s.includes('pipet') || s.includes('buret') || s.includes('kelalang') || s.includes('flask') || s.includes('glassware')) {
      return {
        suggestedDist: 'TRIANGULAR',
        reason: 'Glassware volumetrik Kelas A tertakluk variasi suhu disyorkan taburan Segi Tiga (√6 ≈ 2.449).',
      };
    }
    if (s.includes('kalibrasi') || s.includes('sijil') || s.includes('crm') || s.includes('standard') || s.includes('rujukan')) {
      return {
        suggestedDist: 'NORMAL_K2',
        reason: 'Sijil kalibrasi piawai makmal SAMM/NIST biasanya bersandar tahap keyakinan 95% (k = 2.0).',
      };
    }
    if (s.includes('toleransi') || s.includes('pengeluar') || s.includes('had') || s.includes('spesifikasi')) {
      return {
        suggestedDist: 'RECTANGULAR',
        reason: 'Had toleransi pengeluar tanpa sijil taburan disyorkan Segi Empat Tepat (√3 ≈ 1.732).',
      };
    }
    return null;
  };

  // Biological CFU handlers
  const handleAddBioCfu = () => {
    if (isReadOnly) return;
    const cfu = parseFloat(newBioCfuInput);
    if (isNaN(cfu)) return;

    const prevBio = currentBudget.biologyData || {
      cfuReadings: [],
      logValues: [],
      meanLog: 0,
      sR: 0.02,
      uMat: 0.015,
      uInc: 0.012,
      uBiol: 0.028,
      expandedU: 0.056,
      unit: 'log10 CFU/g',
      lodAdvisory: false,
    };

    const newReadings = [...prevBio.cfuReadings, cfu];
    setNewBioCfuInput('');
    handleRecalculateBiology({
      ...prevBio,
      cfuReadings: newReadings,
    });
  };

  const handleRemoveBioCfu = (idx: number) => {
    if (isReadOnly || !currentBudget.biologyData) return;
    const newReadings = currentBudget.biologyData.cfuReadings.filter((_, i) => i !== idx);
    handleRecalculateBiology({
      ...currentBudget.biologyData,
      cfuReadings: newReadings,
    });
  };

  // Navigation guard
  const handleSafeBack = () => {
    if (saveStatus === 'UNSAVED' && !isReadOnly) {
      if (window.confirm('Terdapat perubahan yang belum disimpan. Adakah anda ingin menyimpan perubahan ini sebelum kembali?')) {
        onSaveDraft(currentBudget);
      }
    }
    onBack();
  };

  // Format ISO 7.2.6 info
  const sigFigInfo = useMemo(() => {
    const meanVal = currentBudget.category === 'CHEMICAL'
      ? (currentBudget.typeA.enabled && currentBudget.typeA.readings.length >= 2 ? currentBudget.typeA.mean : null)
      : (currentBudget.biologyData?.meanLog ?? null);

    return formatIsoSignificantFigures(
      meanVal,
      currentBudget.results.expandedUncertainty,
      currentBudget.unit,
      currentBudget.results.coverageFactor
    );
  }, [currentBudget]);

  const meanVal = currentBudget.category === 'CHEMICAL' ? currentBudget.typeA.mean : (currentBudget.biologyData?.meanLog || 0);
  const relativeU = meanVal > 0 ? (currentBudget.results.expandedUncertainty / Math.abs(meanVal)) * 100 : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Precision Workstation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSafeBack}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Kembali ke Pangkalan Bajet"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-800">{currentBudget.testCode}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">v{currentBudget.version}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-600">
                {currentBudget.status === 'APPROVED' ? 'Diluluskan (Audit Locked)' : currentBudget.status === 'SUBMITTED' ? 'Menunggu Kelulusan' : currentBudget.status === 'REJECTED' ? 'Perlu Pembetulan' : 'Draf Kajian'}
              </span>

              {/* UX 2: Auto-Save Status Badge */}
              {!isReadOnly && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors">
                  {saveStatus === 'SAVED' && (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      Tersimpan Automatik
                    </span>
                  )}
                  {saveStatus === 'SAVING' && (
                    <span className="text-amber-700 bg-amber-50 border border-amber-200 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Menyimpan...
                    </span>
                  )}
                  {saveStatus === 'UNSAVED' && (
                    <span className="text-slate-600 bg-slate-100 border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ada perubahan draf
                    </span>
                  )}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{currentBudget.testName}</span>
              {currentBudget.parentRecordId && (
                <button
                  type="button"
                  onClick={() => setIsDiffModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors"
                  title="Lihat Perbandingan dengan Versi Terdahulu"
                >
                  <GitCompare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Diff v{(parseFloat(currentBudget.version) - 1.0 > 0 ? (parseFloat(currentBudget.version) - 1.0) : 1.0).toFixed(1)}</span>
                </button>
              )}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* UI 2: Formula Inspector Trigger */}
          <button
            type="button"
            onClick={() => setIsFormulaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            title="Buka Pemeriksa Formula Matematik Interaktif"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Pemeriksa Formula</span>
          </button>

          {/* UI 5: Sheet Preview Canvas Trigger */}
          <button
            type="button"
            onClick={() => setIsSheetPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
            title="Pratonton Kanvas Laporan A4 WYSIWYG"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Laporan A4</span>
          </button>

          {/* Clone to Next Version (Available when Approved) */}
          {isApproved && (
            <button
              type="button"
              onClick={() => onCloneAsNewVersion(currentBudget)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-sky-600" />
              <span>Klon ke v{(parseFloat(currentBudget.version) + 1.0).toFixed(1)}</span>
            </button>
          )}

          {/* Analyst Actions for Draft & Rejected */}
          {currentRole === 'ANALYST' && (isDraft || isRejected) && (
            <>
              <button
                type="button"
                onClick={() => onSaveDraft(currentBudget)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Simpan Draf</span>
              </button>

              <button
                type="button"
                onClick={() => onSubmitForReview(currentBudget)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hantar Semakan</span>
              </button>
            </>
          )}

          {/* Manager Actions for Submitted Record */}
          {currentRole === 'MANAGER' && isSubmitted && (
            <>
              <button
                type="button"
                onClick={() => onRejectRequest(currentBudget)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Tolak (Reject)</span>
              </button>

              <button
                type="button"
                onClick={() => onApprove(currentBudget)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Luluskan (Approve)</span>
              </button>
            </>
          )}

        </div>

      </div>

      {/* Audit Lock / Review Notifications */}
      {isApproved && (
        <div className="bg-slate-100/90 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Rekod Dikunci (Audit Lock Aktif):</strong> Diluluskan oleh <strong>{currentBudget.approvedBy || 'Dr. Siti'}</strong> pada <span className="font-mono">{currentBudget.approvedDate || '2026-11-12'}</span> mengikut ISO/IEC 17025. Suntingan langsung dimatikan.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            Gunakan "Klon ke v{(parseFloat(currentBudget.version) + 1.0).toFixed(1)}" untuk kalibrasi baharu.
          </span>
        </div>
      )}

      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ulasan Semakan Pengurus Kualiti:</span>
            <p className="mt-0.5 italic text-rose-800">"{currentBudget.rejectionReason}"</p>
            {currentRole === 'ANALYST' && (
              <p className="text-[11px] text-rose-700 mt-1">
                Sila betulkan nilai di bawah, kemudian tekan butang <strong>"Hantar Semakan"</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid with Sticky Right Rail Layout (UI 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Form & Equations (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section 1: Method Metadata Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Maklumat Kaedah & Metadata Pengujian
              </h2>
              <span className="text-[11px] text-slate-400">
                Disediakan oleh: {currentBudget.preparedBy} ({currentBudget.preparedDate})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Nama Kaedah / Parameter Pengujian
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={currentBudget.testName}
                  onChange={(e) => {
                    const updated = { ...currentBudget, testName: e.target.value };
                    setCurrentBudget(updated);
                    triggerDebouncedAutoSave(updated);
                  }}
                  className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Kod SOP Makmal
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={currentBudget.testCode}
                  onChange={(e) => {
                    const updated = { ...currentBudget, testCode: e.target.value };
                    setCurrentBudget(updated);
                    triggerDebouncedAutoSave(updated);
                  }}
                  className="w-full font-mono text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Kategori Enjin
                </label>
                <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => {
                      const updated: UncertaintyBudget = { ...currentBudget, category: 'CHEMICAL' };
                      setCurrentBudget(updated);
                      handleRecalculateChemical(updated.typeA, updated.typeBComponents);
                    }}
                    className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                      currentBudget.category === 'CHEMICAL'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kimia
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => {
                      const bio = currentBudget.biologyData || {
                        cfuReadings: [2400, 2600],
                        logValues: [3.38, 3.41],
                        meanLog: 3.40,
                        sR: 0.0246,
                        uMat: 0.015,
                        uInc: 0.012,
                        uBiol: 0.0312,
                        expandedU: 0.0624,
                        unit: 'log10 CFU/g',
                        lodAdvisory: false,
                      };
                      const updated: UncertaintyBudget = { 
                        ...currentBudget, 
                        category: 'BIOLOGICAL',
                        unit: 'log10 CFU/g',
                        biologyData: bio 
                      };
                      setCurrentBudget(updated);
                      handleRecalculateBiology(bio);
                    }}
                    className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                      currentBudget.category === 'BIOLOGICAL'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Biologi
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Matriks Sampel
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={currentBudget.matrix}
                  onChange={(e) => {
                    const updated = { ...currentBudget, matrix: e.target.value };
                    setCurrentBudget(updated);
                    triggerDebouncedAutoSave(updated);
                  }}
                  className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Unit Pengukuran
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={currentBudget.unit}
                  onChange={(e) => {
                    const updated = { ...currentBudget, unit: e.target.value };
                    setCurrentBudget(updated);
                    triggerDebouncedAutoSave(updated);
                  }}
                  className="w-full font-mono text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Catatan Kaedah & Rujukan Standard
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={currentBudget.notes || ''}
                  onChange={(e) => {
                    const updated = { ...currentBudget, notes: e.target.value };
                    setCurrentBudget(updated);
                    triggerDebouncedAutoSave(updated);
                  }}
                  className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
                  placeholder="Contoh: Kaedah spektrometri ICP-MS mengikut piawaian APHA 3125 B"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Engine (Chemical vs Biological) */}
          {currentBudget.category === 'CHEMICAL' ? (
            <div className="space-y-6">
              
              {/* Part A: Type A Uncertainty */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Komponen Type A (Replikasi Siri Ujian)
                    </h2>
                    <span className="font-mono text-[11px] text-slate-500">
                      uA = s / √n
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* UX 1: Batch Paste Trigger */}
                    {!isReadOnly && currentBudget.typeA.enabled && (
                      <button
                        type="button"
                        onClick={() => {
                          setBatchPasteTarget('TYPE_A');
                          setIsBatchPasteOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                        title="Tampal data terus dari Excel atau CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                        <span>Tampal Pukal Excel</span>
                      </button>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={currentBudget.typeA.enabled}
                        onChange={(e) => {
                          const newTypeA = { ...currentBudget.typeA, enabled: e.target.checked };
                          handleRecalculateChemical(newTypeA);
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span className="text-slate-700 font-medium">Gunakan Type A</span>
                    </label>
                  </div>
                </div>

                {currentBudget.typeA.enabled ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {currentBudget.typeA.readings.map((reading, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono tabular-nums text-slate-800"
                        >
                          <span className="text-slate-400 text-[10px]">#{idx + 1}:</span>
                          <span className="font-bold">{reading}</span>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveReading(idx)}
                              className="text-slate-400 hover:text-rose-600 ml-1 text-sm font-bold"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}

                      {!isReadOnly && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            value={newReadingInput}
                            onChange={(e) => setNewReadingInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddReading();
                              }
                            }}
                            placeholder="Nilai bacaan..."
                            className="w-28 text-xs font-mono rounded border border-slate-200 px-2 py-1 focus:outline-hidden focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={handleAddReading}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200"
                          >
                            + Tambah
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Statistical Readout */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 rounded-lg border border-slate-200 divide-x divide-slate-200 text-xs">
                      <div className="p-2.5">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">Replikasi (n)</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {currentBudget.typeA.readings.length}
                        </span>
                        {currentBudget.typeA.readings.length < 2 && (
                          <span className="text-[10px] text-amber-700 block">Perlu n ≥ 2</span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">Min Ujian (x̄)</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {formatLabNumber(currentBudget.typeA.mean, 4)}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">Sisihan Piawai (s)</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {formatLabNumber(currentBudget.typeA.sd, 4)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-sky-50/40">
                        <span className="text-[10px] text-sky-800 uppercase font-bold block">Ketakpastian uA</span>
                        <span className="font-mono text-sm font-bold text-sky-900 tabular-nums">
                          {formatLabNumber(currentBudget.typeA.standardUncertainty, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Komponen Type A dimatikan. Hanya komponen Type B yang dimasukkan dalam bajet gabungan.
                  </p>
                )}
              </div>

              {/* Part B: Type B Uncertainty Spreadsheet Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Komponen Type B (Sijil Kalibrasi & Had Peralatan)
                    </h2>
                    <span className="font-mono text-[11px] text-slate-500">
                      uB = (a / Pembahagi) × ci
                    </span>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      {/* UX 5: Shared Equipment Registry Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsEquipmentModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium transition-colors"
                        title="Pilih instrumen berkalibrasi dari Pustaka Makmal"
                      >
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pustaka Peralatan Makmal</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                        <th className="py-2 px-3">Sumber Ketakpastian</th>
                        <th className="py-2 px-3 w-24">Nilai (±a)</th>
                        <th className="py-2 px-3 w-16">Unit</th>
                        <th className="py-2 px-3 min-w-[170px]">Taburan Kebarangkalian</th>
                        <th className="py-2 px-3 w-20">Pembahagi</th>
                        <th className="py-2 px-3 w-16">ci</th>
                        <th className="py-2 px-3 w-24 text-right">Ketakpastian (ui)</th>
                        <th className="py-2 px-3 w-20 text-right">Varians (%)</th>
                        {!isReadOnly && <th className="py-2 px-2 w-10 text-center"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentBudget.typeBComponents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-400 italic">
                            Tiada komponen Type B dimasukkan. Sila tambah baris atau pilih dari Pustaka Peralatan.
                          </td>
                        </tr>
                      ) : (
                        currentBudget.typeBComponents.map((comp) => {
                          const advisor = getAdvisorSuggestion(comp.source);
                          const isSuggestedDist = advisor && advisor.suggestedDist !== comp.distribution;

                          return (
                            <React.Fragment key={comp.id}>
                              <tr className="hover:bg-slate-50/70">
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    disabled={isReadOnly}
                                    value={comp.source}
                                    onChange={(e) => handleUpdateTypeB(comp.id, 'source', e.target.value)}
                                    className="w-full text-xs rounded border border-slate-200 px-2 py-1 disabled:bg-transparent disabled:border-transparent focus:outline-hidden focus:border-slate-400"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    step="any"
                                    disabled={isReadOnly}
                                    value={comp.value}
                                    onChange={(e) => handleUpdateTypeB(comp.id, 'value', parseFloat(e.target.value) || 0)}
                                    className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 tabular-nums disabled:bg-transparent disabled:border-transparent focus:outline-hidden focus:border-slate-400"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    disabled={isReadOnly}
                                    value={comp.unit}
                                    onChange={(e) => handleUpdateTypeB(comp.id, 'unit', e.target.value)}
                                    className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 disabled:bg-transparent disabled:border-transparent focus:outline-hidden focus:border-slate-400"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <select
                                    disabled={isReadOnly}
                                    value={comp.distribution}
                                    onChange={(e) => handleUpdateTypeB(comp.id, 'distribution', e.target.value as DistributionType)}
                                    className="w-full text-xs rounded border border-slate-200 px-2 py-1 disabled:bg-transparent disabled:border-transparent focus:outline-hidden focus:border-slate-400"
                                  >
                                    <option value="NORMAL_K1">Normal (k=1)</option>
                                    <option value="NORMAL_K2">Normal (k=2, 95% Sijil)</option>
                                    <option value="RECTANGULAR">Rectangular (±a / √3)</option>
                                    <option value="TRIANGULAR">Triangular (±a / √6)</option>
                                  </select>
                                </td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 tabular-nums">
                                  {comp.divisor.toFixed(4)}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    step="any"
                                    disabled={isReadOnly}
                                    value={comp.sensitivityCoefficient}
                                    onChange={(e) => handleUpdateTypeB(comp.id, 'sensitivityCoefficient', parseFloat(e.target.value) || 1.0)}
                                    className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 tabular-nums disabled:bg-transparent disabled:border-transparent focus:outline-hidden focus:border-slate-400"
                                  />
                                </td>
                                <td className="py-2 px-3 font-mono text-xs font-bold text-slate-800 text-right tabular-nums">
                                  {formatLabNumber(comp.standardUncertainty, 5)}
                                </td>
                                <td className="py-2 px-3 font-mono text-xs text-slate-600 text-right tabular-nums">
                                  {(comp.varianceContribution || 0).toFixed(1)}%
                                </td>
                                {!isReadOnly && (
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTypeB(comp.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>

                              {/* UX 3: Smart Keyword Advisor Banner */}
                              {!isReadOnly && isSuggestedDist && (
                                <tr>
                                  <td colSpan={9} className="bg-amber-50/60 px-3 py-1.5 border-b border-amber-100">
                                    <div className="flex items-center justify-between text-[11px] text-amber-900">
                                      <div className="flex items-center gap-1.5">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>
                                          <strong>Cadangan ISO/EURACHEM:</strong> {advisor.reason}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTypeB(comp.id, 'distribution', advisor.suggestedDist)}
                                        className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-semibold hover:bg-amber-300 text-[10px]"
                                      >
                                        Guna {advisor.suggestedDist}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddTypeB}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tambah Baris Komponen Type B</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* BIOLOGICAL MODE (ISO 19036) */
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Enjin Mikrobiologi Makanan (ISO 19036:2019)
                    </h2>
                    <span className="font-mono text-[11px] text-slate-500">
                      ubiol = √(sR² + umat² + uinc²)
                    </span>
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setBatchPasteTarget('CFU');
                        setIsBatchPasteOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                      <span>Tampal Pukal CFU</span>
                    </button>
                  )}
                </div>

                {currentBudget.biologyData?.lodAdvisory && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Amaran Batas Pengesanan (LOD):</strong> Bacaan koloni 0 CFU dikesan. Mengikut ISO 19036, sistem menggunakan pengesyoran batas pengesanan (&lt;1 CFU atau proxy 1) bagi menjamin kesinambungan tanpa ralat matematik.
                    </div>
                  </div>
                )}

                {/* Replicate CFUs */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Data Replikasi Koloni (CFU/g)
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentBudget.biologyData?.cfuReadings.map((cfu, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-mono tabular-nums text-slate-800"
                      >
                        <span className="text-slate-400 text-[10px]">Piring #{idx + 1}:</span>
                        <span className="font-bold">{cfu} CFU</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-700">log10 = {cfu > 0 ? Math.log10(cfu).toFixed(2) : '0'}</span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBioCfu(idx)}
                            className="text-slate-400 hover:text-rose-600 ml-1 text-sm font-bold"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}

                    {!isReadOnly && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={newBioCfuInput}
                          onChange={(e) => setNewBioCfuInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBioCfu();
                            }
                          }}
                          placeholder="Contoh: 2400"
                          className="w-28 text-xs font-mono rounded border border-slate-200 px-2 py-1 focus:outline-hidden focus:border-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddBioCfu}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200"
                        >
                          + Tambah CFU
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">sR (Reproducibility SD)</span>
                    <input
                      type="number"
                      step="any"
                      disabled={isReadOnly}
                      value={currentBudget.biologyData?.sR || 0}
                      onChange={(e) => {
                        const bio = { ...currentBudget.biologyData!, sR: parseFloat(e.target.value) || 0 };
                        handleRecalculateBiology(bio);
                      }}
                      className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 bg-white disabled:bg-slate-100 tabular-nums"
                    />
                    <span className="text-[10px] text-slate-400 block">Kebolehulangan log10 CFU/g</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">uMat (Matrix Heterogeneity)</span>
                    <input
                      type="number"
                      step="any"
                      disabled={isReadOnly}
                      value={currentBudget.biologyData?.uMat || 0}
                      onChange={(e) => {
                        const bio = { ...currentBudget.biologyData!, uMat: parseFloat(e.target.value) || 0 };
                        handleRecalculateBiology(bio);
                      }}
                      className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 bg-white disabled:bg-slate-100 tabular-nums"
                    />
                    <span className="text-[10px] text-slate-400 block">Ketakpastian matriks sampel (0.01–0.05)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">uInc (Incubation Uncertainty)</span>
                    <input
                      type="number"
                      step="any"
                      disabled={isReadOnly}
                      value={currentBudget.biologyData?.uInc || 0}
                      onChange={(e) => {
                        const bio = { ...currentBudget.biologyData!, uInc: parseFloat(e.target.value) || 0 };
                        handleRecalculateBiology(bio);
                      }}
                      className="w-full font-mono text-xs rounded border border-slate-200 px-2 py-1 bg-white disabled:bg-slate-100 tabular-nums"
                    />
                    <span className="text-[10px] text-slate-400 block">Variasi suhu pengeraman (0.01–0.02)</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Section 3: UI 3 - Hybrid Pareto Analysis Chart Component */}
          <ParetoAnalysisChart budget={currentBudget} />

          {/* Section 4: Audit Trail Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Jejak Audit & Sejarah Kelulusan (Audit Trail)
            </h3>

            <div className="space-y-1.5">
              {currentBudget.auditLog?.map((log) => (
                <div
                  key={log.id}
                  className="py-1.5 px-2.5 rounded bg-slate-50 border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                      {log.timestamp.slice(0, 16).replace('T', ' ')}
                    </span>
                    <span className="font-semibold text-slate-800">{log.user}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-700">{log.action}</span>
                  </div>
                  {log.notes && (
                    <span className="text-rose-600 italic text-[11px]">
                      "{log.notes}"
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: UI 1 - Sticky Calculation Rail / Floating HUD (1 col) */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-4">
          
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Ringkasan Metrologi</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                k = 2 (95%)
              </span>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">
                  Ketakpastian Gabungan (u_c)
                </span>
                <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
                  ±{formatLabNumber(currentBudget.results.combinedUncertainty, 5)} <span className="text-xs font-normal text-slate-400">{currentBudget.unit}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">
                  Ketakpastian Diperluas (U = 2 × u_c)
                </span>
                <div className="font-mono text-2xl font-black text-sky-400 tabular-nums">
                  ±{formatLabNumber(currentBudget.results.expandedUncertainty, 4)} <span className="text-xs font-normal text-sky-200">{currentBudget.unit}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-slate-400">Ketakpastian Relatif:</span>
                  <span className="font-bold text-amber-400">{relativeU.toFixed(2)}%</span>
                </div>
              </div>

              {/* UI 4: Sig Figs Formatted Reporting Statement */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Pelaporan ISO 17025:
                  </span>
                  {/* Format switcher */}
                  <button
                    type="button"
                    onClick={() => setReportingFormat(f => f === 'ISO_GUM' ? 'RAW' : 'ISO_GUM')}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 hover:text-white transition-colors"
                  >
                    {reportingFormat === 'ISO_GUM' ? '2 Sig Figs' : 'Nilai Penuh'}
                  </button>
                </div>

                <div className="font-mono text-xs font-bold text-white leading-relaxed">
                  {reportingFormat === 'ISO_GUM' ? sigFigInfo.reported : currentBudget.results.reportedResult}
                </div>

                <p className="text-[9.5px] text-slate-400 leading-tight">
                  {reportingFormat === 'ISO_GUM' ? sigFigInfo.explanation : 'Format 4 tempat perpuluhan piawai.'}
                </p>
              </div>

            </div>

            {/* Quick Rail Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormulaModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-sky-400" />
                <span>Pecahan Formula Lengkap</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSheetPreviewOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Pratonton Kanvas Laporan A4</span>
              </button>
            </div>

          </div>

          {/* Quick Shortcuts Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs shadow-2xs">
            <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wide">
              Bantuan Pantas Auditor:
            </span>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Piawaian: ISO/IEC 17025 Klausa 7.6</li>
              <li>EURACHEM / CITAC Guide CG4</li>
              <li>ISO 19036:2019 (Biologi)</li>
              <li>Faktor Liputan: k = 2 (95.45% CL)</li>
            </ul>
          </div>

        </div>

      </div>

      {/* MODAL 1: UI 2 - Formula Inspector */}
      <FormulaInspectorModal
        budget={currentBudget}
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      {/* MODAL 2: UX 1 - Batch Paste from Excel */}
      <BatchPasteModal
        isOpen={isBatchPasteOpen}
        onClose={() => setIsBatchPasteOpen(false)}
        targetType={batchPasteTarget}
        currentReadings={batchPasteTarget === 'TYPE_A' ? currentBudget.typeA.readings : (currentBudget.biologyData?.cfuReadings || [])}
        unit={currentBudget.unit}
        onApply={handleApplyBatchData}
      />

      {/* MODAL 3: UX 5 - Equipment Registry */}
      <EquipmentLibraryModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        currentUnit={currentBudget.unit}
        onSelectEquipment={(comp) => {
          const updated = [...currentBudget.typeBComponents, comp];
          handleRecalculateChemical(undefined, updated);
        }}
      />

      {/* MODAL 4: UX 4 - Version Diff View */}
      <VersionDiffModal
        currentBudget={currentBudget}
        parentBudget={parentBudget}
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        onApprove={onApprove}
        isManagerReview={currentRole === 'MANAGER' && isSubmitted}
      />

      {/* MODAL 5: UI 5 - Sheet Canvas Preview */}
      <SheetPreviewModal
        budget={currentBudget}
        isOpen={isSheetPreviewOpen}
        onClose={() => setIsSheetPreviewOpen(false)}
        onPrintNow={() => {
          setIsSheetPreviewOpen(false);
          onPrint(currentBudget);
        }}
      />

    </div>
  );
};
