import React, { useRef } from 'react';
import { UserRole, UncertaintyBudget } from '../types/labmu';
import { exportBudgetsToJSON, importBudgetsFromJSON } from '../utils/storage';
import { 
  Download, 
  Upload, 
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight,
  Wrench
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  budgets: UncertaintyBudget[];
  onBudgetsUpdate: (budgets: UncertaintyBudget[]) => void;
  onResetDemo: () => void;
  onNavigateHome: () => void;
  onOpenEquipmentLibrary?: () => void;
  activeViewTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  budgets,
  onBudgetsUpdate,
  onResetDemo,
  onNavigateHome,
  onOpenEquipmentLibrary,
  activeViewTitle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportBudgetsToJSON(budgets);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBudgetsFromJSON(content);
        if (result.success && result.data) {
          onBudgetsUpdate(result.data);
          alert(`Berjaya memulihkan ${result.data.length} rekod bajet ketakpastian.`);
        } else {
          alert(`Ralat pemulihan: ${result.error || 'Format fail tidak sah'}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-left group focus:outline-hidden"
          >
            <span className="font-bold text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
              LabMU <span className="text-sky-400 font-semibold">Pro</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-normal">
              / ISO/IEC 17025
            </span>
          </button>

          {activeViewTitle && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-800">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 truncate max-w-xs">{activeViewTitle}</span>
            </div>
          )}
        </div>

        {/* Zone 2 & 3: Role Switcher & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Equipment Registry Button */}
          {onOpenEquipmentLibrary && (
            <button
              type="button"
              onClick={onOpenEquipmentLibrary}
              title="Pustaka Peralatan Makmal & Sijil Kalibrasi"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pustaka Radas</span>
            </button>
          )}

          {/* FR-001: Role Switcher (Segmented Control without candy pills) */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onRoleChange('ANALYST')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === 'ANALYST'
                  ? 'bg-slate-800 text-sky-400 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Peranan Analyst: Penyediaan draf & input data ujian (Ahmad)"
            >
              <User className="w-3.5 h-3.5" />
              <span>Analyst</span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange('MANAGER')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === 'MANAGER'
                  ? 'bg-slate-800 text-amber-400 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Peranan Manager: Semakan, kelulusan & cetakan rasmi (Dr. Siti)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manager</span>
            </button>
          </div>

          {/* Quiet Data Backup / Restore Actions */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={handleExport}
              title="Eksport Pangkalan Data (Sandaran JSON)"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Sandaran</span>
            </button>

            <label
              title="Pulihkan Data daripada fail JSON"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Pulihkan</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetDemo}
              title="Set Semula ke Data Contoh Makmal"
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
