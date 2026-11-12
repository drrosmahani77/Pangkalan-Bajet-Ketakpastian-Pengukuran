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
  Wrench,
  Globe
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

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
  const { t, language, setLanguage } = useLanguage();
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
          alert(t('backupSuccess', { n: result.data.length }));
        } else {
          alert(`${t('backupError')}: ${result.error || 'Format tidak sah'}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ms' ? 'en' : 'ms');
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
              {t('navBrandSub')}
            </span>
          </button>

          {activeViewTitle && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-800">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 truncate max-w-xs">{activeViewTitle}</span>
            </div>
          )}
        </div>

        {/* Zone 2 & 3: Role Switcher, Language Toggle & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher Button (BM <-> EN) */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'ms' ? 'Tukar ke Bahasa Inggeris (Switch to English)' : 'Tukar ke Bahasa Melayu (Switch to Malay)'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-sky-300" />
            <span className="tracking-wide">{language === 'ms' ? 'EN' : 'BM'}</span>
          </button>

          {/* Equipment Registry Button */}
          {onOpenEquipmentLibrary && (
            <button
              type="button"
              onClick={onOpenEquipmentLibrary}
              title="Pustaka Peralatan Makmal & Sijil Kalibrasi"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('equipmentLibNav')}</span>
            </button>
          )}

          {/* FR-001: Role Switcher */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onRoleChange('ANALYST')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === 'ANALYST'
                  ? 'bg-slate-800 text-sky-400 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Peranan Analyst (Ahmad)"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('roleAnalyst')}</span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange('MANAGER')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === 'MANAGER'
                  ? 'bg-slate-800 text-amber-400 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Peranan Manager (Dr. Siti)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('roleManager')}</span>
            </button>
          </div>

          {/* Quiet Data Backup / Restore Actions */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={handleExport}
              title="Eksport Pangkalan Data"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t('backup')}</span>
            </button>

            <label
              title="Pulihkan Data"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t('restore')}</span>
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
              title="Set Semula"
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
