import React from 'react';
import { STARTER_TEMPLATES } from '../utils/storage';
import { X, ArrowRight } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: typeof STARTER_TEMPLATES[0]) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Pilih Templat Pratetap Kaedah Makmal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Muatkan konfigurasi bajet piawai untuk mempercepat penyediaan (&lt;15 minit).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {STARTER_TEMPLATES.map((tpl, idx) => {
            const isChemical = tpl.category === 'CHEMICAL';
            return (
              <div
                key={idx}
                onClick={() => onSelectTemplate(tpl)}
                className="group p-3 rounded-lg border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span className="font-bold text-slate-900">{tpl.testCode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 font-sans font-medium">
                      {isChemical ? 'Kimia (EURACHEM)' : 'Biologi (ISO 19036)'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tpl.unit}</span>
                  </div>

                  <h3 className="font-semibold text-xs text-slate-900 group-hover:text-sky-700 transition-colors">
                    {tpl.testName}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Matriks: <span className="text-slate-700">{tpl.matrix}</span> — "{tpl.notes}"
                  </p>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded border border-slate-200 group-hover:border-slate-900 transition-colors">
                    Pilih
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
