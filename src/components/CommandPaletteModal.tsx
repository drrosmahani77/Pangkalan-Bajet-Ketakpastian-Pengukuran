import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UncertaintyBudget, UserRole } from '../types/labmu';
import { useLanguage } from '../utils/i18n';
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Wrench, 
  Globe, 
  UserCheck, 
  Calculator, 
  Printer, 
  RotateCcw, 
  X,
  ArrowRight,
  FileText
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: UncertaintyBudget[];
  currentRole: UserRole;
  onSelectBudget: (budget: UncertaintyBudget) => void;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onOpenEquipment: () => void;
  onToggleRole: () => void;
  onResetDemo: () => void;
}

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  run: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  budgets,
  currentRole,
  onSelectBudget,
  onCreateNew,
  onOpenTemplates,
  onOpenEquipment,
  onToggleRole,
  onResetDemo,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEn = language === 'en';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct command actions
  const allItems: PaletteItem[] = useMemo(() => {
    const actions: PaletteItem[] = [
      {
        id: 'create-new',
        category: t('cmdPaletteActions'),
        title: t('cmdCreateBudget'),
        icon: Plus,
        shortcut: 'N',
        run: () => { onCreateNew(); onClose(); },
      },
      {
        id: 'open-templates',
        category: t('cmdPaletteActions'),
        title: t('cmdOpenTemplates'),
        icon: FileSpreadsheet,
        shortcut: 'T',
        run: () => { onOpenTemplates(); onClose(); },
      },
      {
        id: 'open-equipment',
        category: t('cmdPaletteActions'),
        title: t('cmdOpenEqLib'),
        icon: Wrench,
        shortcut: 'E',
        run: () => { onOpenEquipment(); onClose(); },
      },
      {
        id: 'toggle-role',
        category: t('cmdPaletteActions'),
        title: `${t('cmdToggleRole')} (${currentRole})`,
        icon: UserCheck,
        shortcut: 'R',
        run: () => { onToggleRole(); onClose(); },
      },
      {
        id: 'toggle-lang',
        category: t('cmdPaletteActions'),
        title: `${t('cmdToggleLang')} (${language.toUpperCase()})`,
        icon: Globe,
        shortcut: 'L',
        run: () => { setLanguage(language === 'ms' ? 'en' : 'ms'); onClose(); },
      },
      {
        id: 'reset-demo',
        category: t('cmdPaletteActions'),
        title: t('cmdResetDemo'),
        icon: RotateCcw,
        shortcut: '',
        run: () => { onResetDemo(); onClose(); },
      },
    ];

    const budgetItems = budgets.map(b => ({
      id: `budget-${b.id}`,
      category: t('cmdPaletteMethods'),
      title: `${b.testCode} — ${b.testName}`,
      subtitle: `${b.category} · ${b.matrix} · U: ±${b.results.expandedUncertainty} ${b.unit}`,
      icon: FileText,
      shortcut: b.status,
      run: () => { onSelectBudget(b); onClose(); },
    }));

    if (!query.trim()) {
      return [...actions, ...budgetItems];
    }

    const q = query.toLowerCase();
    return [...actions, ...budgetItems].filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
      const matchCat = item.category.toLowerCase().includes(q);
      return matchTitle || matchSub || matchCat;
    });
  }, [query, budgets, currentRole, language, t]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('cmdPalettePlaceholder')}
            className="w-full bg-transparent text-sm focus:outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 rounded border border-slate-300">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 text-xs">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p>{isEn ? 'No commands or methods matching your query.' : 'Tiada arahan atau kaedah yang sepadan.'}</p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-sky-50 text-sky-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs truncate font-semibold">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ {isEn ? 'Navigate' : 'Pilih'}</span>
            <span>↵ {isEn ? 'Execute' : 'Buka'}</span>
          </div>
          <span>ISO/IEC 17025 Command Bar</span>
        </div>

      </div>
    </div>
  );
};
