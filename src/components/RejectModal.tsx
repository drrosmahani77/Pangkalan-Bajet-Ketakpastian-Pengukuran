import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  testName: string;
  testCode: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  testName,
  testCode,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Sila nyatakan ulasan pembetulan atau sebab penolakan untuk juruanalisis.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">
              Tolak Bajet untuk Pembetulan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-xs text-slate-600">
            Kaedah: <strong className="font-mono text-slate-900">{testCode}</strong> · {testName}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 uppercase tracking-wider mb-1">
              Ulasan Semakan Pengurus (Audit Note) <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Sila sahkan nilai ketakpastian volumetrik menggunakan sijil kalibrasi terkini tahun 2026 atau tambah bacaan replikasi ke sekurang-kurangnya 5 titik..."
              className="w-full text-xs rounded-md border border-slate-200 p-2.5 focus:outline-hidden focus:border-slate-400 text-slate-800 placeholder:text-slate-400"
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Catatan ini akan direkodkan ke dalam Jejak Audit (Audit Trail) dan dipaparkan kepada Analyst.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
            >
              Sahkan Penolakan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
