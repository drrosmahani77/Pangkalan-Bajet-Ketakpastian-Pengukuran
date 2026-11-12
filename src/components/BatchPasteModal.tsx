import React, { useState, useMemo } from 'react';
import { X, ClipboardPaste, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { formatLabNumber } from '../utils/math';

interface BatchPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'TYPE_A' | 'CFU';
  currentReadings: number[];
  unit: string;
  onApply: (numbers: number[], mode: 'REPLACE' | 'APPEND') => void;
}

export const BatchPasteModal: React.FC<BatchPasteModalProps> = ({
  isOpen,
  onClose,
  targetType,
  currentReadings,
  unit,
  onApply,
}) => {
  const [rawText, setRawText] = useState('');
  const [insertMode, setInsertMode] = useState<'REPLACE' | 'APPEND'>('REPLACE');

  // Parse pasted raw text into clean array of numbers
  const parsedData = useMemo(() => {
    if (!rawText.trim()) {
      return { numbers: [], invalidTokens: [] };
    }

    // Split by newline, comma, tab, semicolon or whitespace
    const tokens = rawText.split(/[\r\n,\t; ]+/).filter(t => t.trim().length > 0);
    const numbers: number[] = [];
    const invalidTokens: string[] = [];

    tokens.forEach(tok => {
      // Clean up common thousand separators or quotes
      const cleaned = tok.replace(/["']/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && isFinite(num)) {
        numbers.push(num);
      } else {
        invalidTokens.push(tok);
      }
    });

    return { numbers, invalidTokens };
  }, [rawText]);

  // Statistics of parsed data
  const stats = useMemo(() => {
    const nums = parsedData.numbers;
    if (nums.length === 0) return null;

    const count = nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    let sd = 0;
    if (count > 1) {
      const sumSq = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
      sd = Math.sqrt(sumSq / (count - 1));
    }

    return { count, min, max, mean, sd };
  }, [parsedData]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (parsedData.numbers.length === 0) return;
    onApply(parsedData.numbers, insertMode);
    setRawText('');
    onClose();
  };

  const handlePasteDemo = () => {
    if (targetType === 'TYPE_A') {
      setRawText(`10.12\n10.15\n10.18\n10.14\n10.16\n10.19`);
    } else {
      setRawText(`2400\t2600\t2550\t2480`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-paste-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="batch-paste-title" className="text-sm font-bold text-slate-900">
                Tampal Pukal dari Excel / LIMS Makmal
              </h2>
              <p className="text-xs text-slate-500">
                {targetType === 'TYPE_A' ? 'Bacaan Replikasi Type A' : 'Pengiraan Koloni Biologi (CFU)'} ({unit})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Tampal lajur data (Excel / CSV / teks berjarak):
              </label>
              <button
                type="button"
                onClick={handlePasteDemo}
                className="text-[11px] text-sky-600 hover:text-sky-800 underline font-medium"
              >
                Cuba Contoh Data
              </button>
            </div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Contoh salin dari Excel:&#10;10.15&#10;10.22&#10;10.18&#10;10.20"
              className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Invalid token warning */}
          {parsedData.invalidTokens.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {parsedData.invalidTokens.length} teks bukan nombor diabaikan (cth: "{parsedData.invalidTokens.slice(0, 3).join(', ')}").
              </span>
            </div>
          )}

          {/* Stats Preview */}
          {stats && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                <span className="font-semibold text-slate-800">
                  Pratonton Statistik ({stats.count} bacaan dikesan):
                </span>
                <span className="font-mono text-sky-700 font-bold">
                  Min (x̄) = {formatLabNumber(stats.mean, 4)} {unit}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600">
                <div>Minima: <strong>{stats.min}</strong></div>
                <div>Maksima: <strong>{stats.max}</strong></div>
                <div>SD (s): <strong>{formatLabNumber(stats.sd, 4)}</strong></div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate pt-1">
                Sampel: [{parsedData.numbers.slice(0, 8).join(', ')}{parsedData.numbers.length > 8 ? '...' : ''}]
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="space-y-1.5 pt-1">
            <span className="block font-semibold text-slate-700">Kaedah Kemasukan:</span>
            <div className="grid grid-cols-2 gap-2">
              <label 
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  insertMode === 'REPLACE' 
                    ? 'border-sky-500 bg-sky-50/50 text-sky-950 font-semibold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pasteMode"
                  checked={insertMode === 'REPLACE'}
                  onChange={() => setInsertMode('REPLACE')}
                  className="text-sky-600"
                />
                <div>
                  <div>Gantikan Semua</div>
                  <div className="text-[10px] text-slate-500 font-normal">Padam {currentReadings.length} sedia ada</div>
                </div>
              </label>

              <label 
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  insertMode === 'APPEND' 
                    ? 'border-sky-500 bg-sky-50/50 text-sky-950 font-semibold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pasteMode"
                  checked={insertMode === 'APPEND'}
                  onChange={() => setInsertMode('APPEND')}
                  className="text-sky-600"
                />
                <div>
                  <div>Tambah (Append)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Gabungkan dengan {currentReadings.length} sedia ada</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedData.numbers.length === 0}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Sahkan & Masukkan ({parsedData.numbers.length} Nilai)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
