/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  UncertaintyBudget, 
  BudgetCategory 
} from './types/labmu';
import { 
  loadStoredBudgets, 
  saveBudgets, 
  cloneApprovedBudget, 
  getInitialBudgets,
  STARTER_TEMPLATES 
} from './utils/storage';
import { calculateChemicalBudget, calculateBiologyBudget } from './utils/math';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { BudgetBuilder } from './components/BudgetBuilder';
import { PrintReport } from './components/PrintReport';
import { RejectModal } from './components/RejectModal';
import { TemplateModal } from './components/TemplateModal';
import { EquipmentLibraryModal } from './components/EquipmentLibraryModal';

type ActiveView = 'DASHBOARD' | 'BUILDER' | 'PRINT';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('ANALYST');
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  const [budgets, setBudgets] = useState<UncertaintyBudget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<UncertaintyBudget | null>(null);

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isGlobalEquipmentModalOpen, setIsGlobalEquipmentModalOpen] = useState(false);
  const [rejectingBudget, setRejectingBudget] = useState<UncertaintyBudget | null>(null);

  // Initialize budgets from localStorage
  useEffect(() => {
    const loaded = loadStoredBudgets();
    setBudgets(loaded);
  }, []);

  const handleBudgetsUpdate = (newBudgets: UncertaintyBudget[]) => {
    setBudgets(newBudgets);
    saveBudgets(newBudgets);
  };

  const handleResetDemo = () => {
    if (window.confirm('Adakah anda pasti ingin menetapkan semula semua data ke set contoh makmal lalai?')) {
      const initial = getInitialBudgets();
      handleBudgetsUpdate(initial);
      setActiveView('DASHBOARD');
      setSelectedBudget(null);
    }
  };

  // Create New Budget from Scratch
  const handleCreateNew = () => {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const newId = `budg-${Date.now()}`;

    const newBudget: UncertaintyBudget = {
      id: newId,
      testName: 'Penentuan Logam / Komponen Makmal',
      testCode: `SOP-CH-${Math.floor(100 + Math.random() * 900)}`,
      category: 'CHEMICAL',
      matrix: 'Sampel Air / Makanan',
      unit: 'mg/L',
      version: '1.0',
      parentRecordId: null,
      status: 'DRAFT',
      preparedBy: 'Ahmad (Analyst)',
      preparedDate: today,
      approvedBy: null,
      approvedDate: null,
      notes: 'Draf baharu persediaan bajet ketakpastian pengukuran.',
      typeA: {
        enabled: true,
        readings: [10.1, 10.2, 10.1, 10.3, 10.2],
        mean: 10.18,
        sd: 0.0837,
        standardUncertainty: 0.0374,
      },
      typeBComponents: [
        {
          id: `comp-${Date.now()}-1`,
          source: 'Kalibrasi Neraca Analitikal',
          value: 0.0002,
          unit: 'g',
          distribution: 'NORMAL_K2',
          divisor: 2.0,
          sensitivityCoefficient: 1.0,
          standardUncertainty: 0.0001,
        },
        {
          id: `comp-${Date.now()}-2`,
          source: 'Toleransi Had Pengeluar Pipet',
          value: 0.05,
          unit: 'mL',
          distribution: 'RECTANGULAR',
          divisor: 1.73205,
          sensitivityCoefficient: 1.0,
          standardUncertainty: 0.0288675,
        },
      ],
      results: {
        combinedUncertainty: 0.0473,
        coverageFactor: 2,
        expandedUncertainty: 0.0945,
        confidenceInterval: '95%',
        reportedResult: '10.18 ± 0.09 mg/L (k=2, 95% CL)',
      },
      auditLog: [
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: 'Ahmad (Analyst)',
          role: 'ANALYST',
          action: 'Membina draf bajet ketakpastian baharu v1.0',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newBudget, ...budgets];
    handleBudgetsUpdate(updated);
    setSelectedBudget(newBudget);
    setActiveView('BUILDER');
  };

  // Select Template
  const handleSelectTemplate = (template: typeof STARTER_TEMPLATES[0]) => {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const newId = `budg-${Date.now()}`;

    let calcA = { ...template.typeA };
    let calcB = [...template.typeBComponents];
    let calcResults = { ...template.results };
    let calcBio = template.biologyData ? { ...template.biologyData } : undefined;

    if (template.category === 'CHEMICAL') {
      const chem = calculateChemicalBudget(calcA, calcB);
      calcA = chem.typeA;
      calcB = chem.typeBComponents;
      calcResults = chem.results;
    } else if (template.category === 'BIOLOGICAL' && calcBio) {
      const bioRes = calculateBiologyBudget(calcBio);
      calcBio = bioRes;
      calcResults = {
        combinedUncertainty: bioRes.uBiol,
        coverageFactor: 2,
        expandedUncertainty: bioRes.expandedU,
        confidenceInterval: '95%',
        reportedResult: `${bioRes.meanLog.toFixed(2)} ± ${bioRes.expandedU.toFixed(2)} ${bioRes.unit} (k=2, 95% CL)`,
      };
    }

    const newBudget: UncertaintyBudget = {
      ...template,
      id: newId,
      version: '1.0',
      parentRecordId: null,
      status: 'DRAFT',
      preparedBy: 'Ahmad (Analyst)',
      preparedDate: today,
      approvedBy: null,
      approvedDate: null,
      rejectionReason: undefined,
      typeA: calcA,
      typeBComponents: calcB,
      biologyData: calcBio,
      results: calcResults,
      createdAt: now,
      updatedAt: now,
      auditLog: [
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: 'Ahmad (Analyst)',
          role: 'ANALYST',
          action: `Memilih templat pratetap [${template.testCode}] dan mencipta draf v1.0`,
        },
      ],
    };

    const updated = [newBudget, ...budgets];
    handleBudgetsUpdate(updated);
    setSelectedBudget(newBudget);
    setIsTemplateModalOpen(false);
    setActiveView('BUILDER');
  };

  // Save Draft (Analyst)
  const handleSaveDraft = (updatedBudget: UncertaintyBudget) => {
    const now = new Date().toISOString();
    const withAudit: UncertaintyBudget = {
      ...updatedBudget,
      updatedAt: now,
      auditLog: [
        ...(updatedBudget.auditLog || []),
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: currentRole === 'ANALYST' ? 'Ahmad (Analyst)' : 'Dr. Siti (Manager)',
          role: currentRole,
          action: 'Mengemaskini dan menyimpan draf bajet ketakpastian',
        },
      ],
    };

    const newBudgets = budgets.map(b => b.id === withAudit.id ? withAudit : b);
    handleBudgetsUpdate(newBudgets);
    setSelectedBudget(withAudit);
    alert('Draf berjaya disimpan.');
  };

  // Submit for Review (Analyst)
  const handleSubmitForReview = (updatedBudget: UncertaintyBudget) => {
    const now = new Date().toISOString();
    const submitted: UncertaintyBudget = {
      ...updatedBudget,
      status: 'SUBMITTED',
      rejectionReason: undefined,
      updatedAt: now,
      auditLog: [
        ...(updatedBudget.auditLog || []),
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: 'Ahmad (Analyst)',
          role: 'ANALYST',
          action: 'Menghantar bajet ketakpastian untuk semakan dan kelulusan pengurus (Submitted)',
        },
      ],
    };

    const newBudgets = budgets.map(b => b.id === submitted.id ? submitted : b);
    handleBudgetsUpdate(newBudgets);
    setSelectedBudget(submitted);
    alert('Bajet berjaya dihantar untuk semakan pengurus (Status: Menunggu Kelulusan).');
  };

  // Approve Record (Manager)
  const handleApprove = (budgetToApprove: UncertaintyBudget) => {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    const approved: UncertaintyBudget = {
      ...budgetToApprove,
      status: 'APPROVED',
      approvedBy: 'Dr. Siti (Technical Manager)',
      approvedDate: today,
      rejectionReason: undefined,
      updatedAt: now,
      auditLog: [
        ...(budgetToApprove.auditLog || []),
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: 'Dr. Siti (Technical Manager)',
          role: 'MANAGER',
          action: 'Meluluskan bajet ketakpastian pengukuran (Audit Lock diaktifkan sepenuhnya)',
        },
      ],
    };

    const newBudgets = budgets.map(b => b.id === approved.id ? approved : b);
    handleBudgetsUpdate(newBudgets);
    setSelectedBudget(approved);
    alert('Bajet ketakpastian pengukuran telah diluluskan secara rasmi (Status: Diluluskan). Audit Lock diaktifkan.');
  };

  // Open Reject Modal (Manager)
  const handleRejectRequest = (budgetToReject: UncertaintyBudget) => {
    setRejectingBudget(budgetToReject);
    setIsRejectModalOpen(true);
  };

  // Confirm Reject (Manager)
  const handleConfirmReject = (reason: string) => {
    if (!rejectingBudget) return;
    const now = new Date().toISOString();

    const rejected: UncertaintyBudget = {
      ...rejectingBudget,
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: now,
      auditLog: [
        ...(rejectingBudget.auditLog || []),
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          user: 'Dr. Siti (Technical Manager)',
          role: 'MANAGER',
          action: 'Menolak bajet ketakpastian untuk pembetulan semula oleh juruanalisis',
          notes: reason,
        },
      ],
    };

    const newBudgets = budgets.map(b => b.id === rejected.id ? rejected : b);
    handleBudgetsUpdate(newBudgets);
    setSelectedBudget(rejected);
    setIsRejectModalOpen(false);
    setRejectingBudget(null);
    alert('Bajet telah ditolak dengan ulasan semakan. Status bertukar ke "Perlu Pembetulan".');
  };

  // FR-006: Clone as New Version (e.g. v1.0 -> v2.0)
  const handleCloneAsNewVersion = (sourceBudget: UncertaintyBudget) => {
    const actorName = currentRole === 'ANALYST' ? 'Ahmad (Analyst)' : 'Dr. Siti (Technical Manager)';
    const cloned = cloneApprovedBudget(sourceBudget, actorName, currentRole);

    const updated = [cloned, ...budgets];
    handleBudgetsUpdate(updated);
    setSelectedBudget(cloned);
    setActiveView('BUILDER');
    alert(`Rekod berjaya diklon ke versi baharu v${cloned.version} berstatus Draf. Rekod asal v${sourceBudget.version} kekal selamat.`);
  };

  // Delete budget (Draft / Rejected only)
  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    handleBudgetsUpdate(updated);
    if (selectedBudget?.id === id) {
      setSelectedBudget(null);
      setActiveView('DASHBOARD');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        budgets={budgets}
        onBudgetsUpdate={handleBudgetsUpdate}
        onResetDemo={handleResetDemo}
        onNavigateHome={() => {
          setActiveView('DASHBOARD');
          setSelectedBudget(null);
        }}
        onOpenEquipmentLibrary={() => setIsGlobalEquipmentModalOpen(true)}
        activeViewTitle={
          activeView === 'BUILDER' && selectedBudget
            ? `${selectedBudget.testCode} · ${selectedBudget.testName}`
            : activeView === 'PRINT' && selectedBudget
            ? `Laporan Rasmi · ${selectedBudget.testCode}`
            : undefined
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeView === 'DASHBOARD' && (
          <Dashboard
            budgets={budgets}
            currentRole={currentRole}
            onCreateNew={handleCreateNew}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            onSelectBudget={(budget) => {
              setSelectedBudget(budget);
              setActiveView('BUILDER');
            }}
            onCloneBudget={handleCloneAsNewVersion}
            onDeleteBudget={handleDeleteBudget}
            onPrintBudget={(budget) => {
              setSelectedBudget(budget);
              setActiveView('PRINT');
            }}
          />
        )}

        {activeView === 'BUILDER' && selectedBudget && (
          <BudgetBuilder
            budget={selectedBudget}
            allBudgets={budgets}
            currentRole={currentRole}
            onSaveDraft={handleSaveDraft}
            onSubmitForReview={handleSubmitForReview}
            onApprove={handleApprove}
            onRejectRequest={handleRejectRequest}
            onCloneAsNewVersion={handleCloneAsNewVersion}
            onPrint={(b) => {
              setSelectedBudget(b);
              setActiveView('PRINT');
            }}
            onBack={() => {
              setActiveView('DASHBOARD');
              setSelectedBudget(null);
            }}
          />
        )}

        {activeView === 'PRINT' && selectedBudget && (
          <PrintReport
            budget={selectedBudget}
            onBack={() => setActiveView('BUILDER')}
          />
        )}

      </main>

      {/* Starter Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Global Equipment Registry Modal */}
      <EquipmentLibraryModal
        isOpen={isGlobalEquipmentModalOpen}
        onClose={() => setIsGlobalEquipmentModalOpen(false)}
        currentUnit="unit"
        onSelectEquipment={() => {
          setIsGlobalEquipmentModalOpen(false);
          alert('Instrumen dipilih. Untuk memasukkan ke dalam sesuatu kaedah pengujian, buka bajet berkenaan di Penyunting Bajet.');
        }}
      />

      {/* Rejection Modal for Manager */}
      {rejectingBudget && (
        <RejectModal
          isOpen={isRejectModalOpen}
          testName={rejectingBudget.testName}
          testCode={rejectingBudget.testCode}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectingBudget(null);
          }}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Non-printing Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>LabMU Pro v1.0</strong> — Sistem Anggaran Ketakpastian Pengukuran Makmal (ISO/IEC 17025)
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>EURACHEM / CITAC CG 4</span>
            <span>•</span>
            <span>ISO 19036:2019</span>
            <span>•</span>
            <span>Audit Trail & Role Separation</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
