import React, { useState, useEffect, useMemo } from 'react';
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
  formatLabNumber 
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
  Check
} from 'lucide-react';

interface BudgetBuilderProps {
  budget: UncertaintyBudget;
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

  const isApproved = currentBudget.status === 'APPROVED';
  const isSubmitted = currentBudget.status === 'SUBMITTED';
  const isRejected = currentBudget.status === 'REJECTED';
  const isDraft = currentBudget.status === 'DRAFT';

  // Access control lock
  const isReadOnly = isApproved || (isSubmitted && currentRole === 'ANALYST') || (currentRole === 'MANAGER' && (isDraft || isRejected));

  useEffect(() => {
    setCurrentBudget(budget);
  }, [budget]);

  // Recalculations
  const handleRecalculateChemical = (
    typeA = currentBudget.typeA,
    typeB = currentBudget.typeBComponents
  ) => {
    const calculated = calculateChemicalBudget(typeA, typeB);
    setCurrentBudget(prev => ({
      ...prev,
      typeA: calculated.typeA,
      typeBComponents: calculated.typeBComponents,
      results: calculated.results,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRecalculateBiology = (bioData = currentBudget.biologyData) => {
    if (!bioData) return;
    const bioResult = calculateBiologyBudget(bioData);
    setCurrentBudget(prev => ({
      ...prev,
      biologyData: bioResult,
      results: {
        combinedUncertainty: bioResult.uBiol,
        coverageFactor: 2,
        expandedUncertainty: bioResult.expandedU,
        confidenceInterval: '95%',
        reportedResult: `${bioResult.meanLog.toFixed(2)} ± ${bioResult.expandedU.toFixed(2)} ${bioResult.unit} (k=2, 95% CL)`,
      },
      updatedAt: new Date().toISOString(),
    }));
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

  const handleAddPresetTypeB = (presetType: 'BALANCE' | 'PIPETTE' | 'CRM' | 'FLASK') => {
    if (isReadOnly) return;
    let newComp: TypeBComponent;
    if (presetType === 'BALANCE') {
      newComp = {
        id: `comp-${Date.now()}`,
        source: 'Kalibrasi Neraca Analitikal (Analytical Balance)',
        value: 0.0002,
        unit: 'g',
        distribution: 'NORMAL_K2',
        divisor: 2.0,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.0001,
      };
    } else if (presetType === 'PIPETTE') {
      newComp = {
        id: `comp-${Date.now()}`,
        source: 'Toleransi Had Pengeluar Mikropipet 1000 µL',
        value: 0.001,
        unit: 'mL',
        distribution: 'RECTANGULAR',
        divisor: 1.73205,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.000577,
      };
    } else if (presetType === 'CRM') {
      newComp = {
        id: `comp-${Date.now()}`,
        source: 'Sijil Bahan Rujukan Disahkan (CRM Standard)',
        value: 0.0005,
        unit: currentBudget.unit,
        distribution: 'NORMAL_K2',
        divisor: 2.0,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.00025,
      };
    } else {
      newComp = {
        id: `comp-${Date.now()}`,
        source: 'Kelalang Volumetrik Kelas A (Kesan Suhu & Toleransi)',
        value: 0.0008,
        unit: 'mL',
        distribution: 'TRIANGULAR',
        divisor: 2.44949,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.000327,
      };
    }

    const updated = [...currentBudget.typeBComponents, newComp];
    handleRecalculateChemical(undefined, updated);
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

  // Acceptance Verification Data Loaders (AC-01, AC-02, AC-03)
  const loadAC01 = () => {
    const ac01Readings = [10.1, 10.2, 10.1, 10.3, 10.2];
    const newTypeA = {
      ...currentBudget.typeA,
      enabled: true,
      readings: ac01Readings,
    };
    handleRecalculateChemical(newTypeA);
  };

  const loadAC02 = () => {
    const ac02Comp: TypeBComponent = {
      id: `ac02-${Date.now()}`,
      source: 'Verifikasi AC-02 (Toleransi Rectangular ±0.05)',
      value: 0.05,
      unit: currentBudget.unit,
      distribution: 'RECTANGULAR',
      divisor: 1.73205,
      sensitivityCoefficient: 1.0,
      standardUncertainty: 0.0288675,
    };
    handleRecalculateChemical(undefined, [...currentBudget.typeBComponents, ac02Comp]);
  };

  const loadAC03 = () => {
    const bioData = {
      cfuReadings: [2400, 2600],
      logValues: [3.3802, 3.4150],
      meanLog: 3.3976,
      sR: 0.0246,
      uMat: 0.015,
      uInc: 0.012,
      uBiol: 0.0312,
      expandedU: 0.0624,
      unit: 'log10 CFU/g',
      lodAdvisory: false,
    };
    setCurrentBudget(prev => ({
      ...prev,
      category: 'BIOLOGICAL',
      unit: 'log10 CFU/g',
      biologyData: bioData,
    }));
    handleRecalculateBiology(bioData);
  };

  // Sorted Variance Items
  const varianceItems = useMemo(() => {
    if (currentBudget.category === 'CHEMICAL') {
      const items: { name: string; percentage: number; ui: number; type: string }[] = [];
      if (currentBudget.typeA.enabled && currentBudget.typeA.readings.length >= 2) {
        items.push({
          name: 'Type A: Replikasi Ujian Makmal',
          percentage: currentBudget.typeA.varianceContribution || 0,
          ui: currentBudget.typeA.standardUncertainty,
          type: 'Type A',
        });
      }
      currentBudget.typeBComponents.forEach(comp => {
        items.push({
          name: comp.source,
          percentage: comp.varianceContribution || 0,
          ui: comp.standardUncertainty,
          type: 'Type B',
        });
      });
      return items.sort((a, b) => b.percentage - a.percentage);
    } else {
      const bio = currentBudget.biologyData;
      if (!bio) return [];
      const items = [
        {
          name: 'sR (Kebolehulangan Replikasi Koloni)',
          percentage: bio.varianceContribution_sR || 0,
          ui: bio.sR,
          type: 'Reproducibility',
        },
        {
          name: 'uMat (Heterogeniti Matriks Sampel)',
          percentage: bio.varianceContribution_uMat || 0,
          ui: bio.uMat,
          type: 'Matrix',
        },
        {
          name: 'uInc (Variasi Pengeraman Suhu & Masa)',
          percentage: bio.varianceContribution_uInc || 0,
          ui: bio.uInc,
          type: 'Incubation',
        },
      ];
      return items.sort((a, b) => b.percentage - a.percentage);
    }
  }, [currentBudget]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Precision Workstation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
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
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {currentBudget.testName}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            type="button"
            onClick={() => onPrint(currentBudget)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors"
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

      {/* Acceptance Criteria Verifier Bar (Compact Testing Ribbon) */}
      <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Calculator className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">Verifikasi Kriteria Penerimaan PRD:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isReadOnly}
            onClick={loadAC01}
            className="px-2 py-1 text-[11px] font-mono text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 disabled:opacity-40"
            title="Muat siri bacaan: 10.1, 10.2, 10.1, 10.3, 10.2"
          >
            Uji AC-01 (Type A)
          </button>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={loadAC02}
            className="px-2 py-1 text-[11px] font-mono text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 disabled:opacity-40"
            title="Muat Rectangular ±0.05"
          >
            Uji AC-02 (Type B)
          </button>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={loadAC03}
            className="px-2 py-1 text-[11px] font-mono text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 disabled:opacity-40"
            title="Muat CFU 2400 & 2600"
          >
            Uji AC-03 (ISO 19036)
          </button>
        </div>
      </div>

      {/* Section 1: Method Metadata Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
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
              onChange={(e) => setCurrentBudget({ ...currentBudget, testName: e.target.value })}
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
              onChange={(e) => setCurrentBudget({ ...currentBudget, testCode: e.target.value })}
              className="w-full font-mono text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Kategori & Enjin Matematik
            </label>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => {
                  setCurrentBudget({ ...currentBudget, category: 'CHEMICAL' });
                  handleRecalculateChemical();
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
                  setCurrentBudget({ 
                    ...currentBudget, 
                    category: 'BIOLOGICAL',
                    unit: 'log10 CFU/g',
                    biologyData: bio 
                  });
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
              onChange={(e) => setCurrentBudget({ ...currentBudget, matrix: e.target.value })}
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
              onChange={(e) => setCurrentBudget({ ...currentBudget, unit: e.target.value })}
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
              onChange={(e) => setCurrentBudget({ ...currentBudget, notes: e.target.value })}
              className="w-full text-xs rounded-md border border-slate-200 px-2.5 py-1.5 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-hidden focus:border-slate-400"
              placeholder="Contoh: Kaedah spektrometri ICP-MS mengikut piawaian APHA 3125 B"
            />
          </div>

        </div>
      </div>

      {/* Section 2: Mathematical Calculations (Chemical vs Biology) */}
      {currentBudget.category === 'CHEMICAL' ? (
        
        <div className="space-y-6">
          
          {/* Part A: Type A Uncertainty */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Komponen Type A (Replikasi Siri Ujian)
                </h2>
                <span className="font-mono text-[11px] text-slate-500">
                  uA = s / √n
                </span>
              </div>

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
                          className="text-slate-400 hover:text-rose-600 ml-1"
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

                {/* Type A Statistical Readout Grid */}
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
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
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
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400 mr-1">Pratetap:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTypeB('BALANCE')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    + Neraca
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTypeB('PIPETTE')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    + Pipet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTypeB('CRM')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    + CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTypeB('FLASK')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    + Kelalang
                  </button>
                </div>
              )}
            </div>

            {/* High-density Table */}
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
                        Tiada komponen Type B dimasukkan. Sila tambah baris atau gunakan pratetap.
                      </td>
                    </tr>
                  ) : (
                    currentBudget.typeBComponents.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/70">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddTypeB}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Tambah Baris Komponen Type B</span>
              </button>
            )}
          </div>

        </div>
      ) : (
        
        /* BIOLOGICAL MODE (ISO 19036) */
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Enjin Mikrobiologi Makanan (ISO 19036:2019)
                </h2>
                <span className="font-mono text-[11px] text-slate-500">
                  ubiol = √(sR² + umat² + uinc²)
                </span>
              </div>
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
                        className="text-slate-400 hover:text-rose-600 ml-1"
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

      {/* Section 3: Summary Results & Variance Contribution Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metrology Readout */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Keputusan Ketakpastian
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                k = 2 · 95% CL
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium block">
                  Ketakpastian Piawai Gabungan (uc)
                </span>
                <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {formatLabNumber(currentBudget.results.combinedUncertainty, 5)} <span className="text-xs font-sans font-normal text-slate-500">{currentBudget.unit}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium block">
                  Ketakpastian Diperluas (U = uc × 2)
                </span>
                <div className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                  ± {formatLabNumber(currentBudget.results.expandedUncertainty, 5)} <span className="text-xs font-sans font-normal text-slate-500">{currentBudget.unit}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Pernyataan Rasmi ISO/IEC 17025 Klausa 7.8:
                </span>
                <p className="font-mono text-xs font-bold text-slate-900">
                  {currentBudget.results.reportedResult}
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
            Faktor liputan k = 2 bersamaan aras keyakinan lebih kurang 95%.
          </div>
        </div>

        {/* FR-004: Variance Contribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sumbangan Varians Komponen (% = ui² / uc² × 100)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Jumlah: 100.0%
              </span>
            </div>

            {varianceItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                Sila masukkan data komponen untuk melihat carta sumbangan varians.
              </div>
            ) : (
              <div className="space-y-3">
                {varianceItems.map((item, idx) => {
                  const isDominant = idx === 0 && item.percentage > 35;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate max-w-sm">
                          <span className="font-medium text-slate-800 truncate">
                            {item.name}
                          </span>
                          {isDominant && (
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                              Dominant
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-800 tabular-nums shrink-0">
                          {item.percentage.toFixed(1)}% <span className="text-slate-400 font-normal text-[10px]">(ui = {formatLabNumber(item.ui, 4)})</span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${Math.min(100, Math.max(2, item.percentage))}%` }}
                          className={`h-full rounded-full transition-all duration-200 ${
                            idx === 0 ? 'bg-slate-800' : idx === 1 ? 'bg-slate-600' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
            Mengenal pasti sumber ketakpastian utama bagi penambahbaikan kaedah (ISO/IEC 17025 Klausa 7.6).
          </div>
        </div>

      </div>

      {/* Section 4: Audit Trail Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Jejak Audit & Sejarah Kelulusan (Audit Trail)
        </h3>

        <div className="space-y-1.5">
          {currentBudget.auditLog?.map((log) => (
            <div
              key={log.id}
              className="py-1.5 px-2 rounded bg-slate-50 border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600"
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
  );
};
