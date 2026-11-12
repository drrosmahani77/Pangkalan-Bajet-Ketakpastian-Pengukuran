import React, { useState, useEffect } from 'react';
import { EquipmentItem, TypeBComponent, DistributionType } from '../types/labmu';
import { loadEquipmentList, saveEquipmentList } from '../utils/storage';
import { getDistributionDivisor, formatLabNumber } from '../utils/math';
import { 
  X, 
  Wrench, 
  Plus, 
  Search, 
  Check, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  Trash2
} from 'lucide-react';

interface EquipmentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (component: TypeBComponent) => void;
  currentUnit: string;
}

export const EquipmentLibraryModal: React.FC<EquipmentLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipment,
  currentUnit,
}) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state for adding custom equipment
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCat, setNewCat] = useState<EquipmentItem['category']>('PIPETTE');
  const [newCert, setNewCert] = useState('');
  const [newCalDate, setNewCalDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNextDate, setNewNextDate] = useState('');
  const [newValue, setNewValue] = useState<number>(0.001);
  const [newUnit, setNewUnit] = useState('mL');
  const [newDist, setNewDist] = useState<DistributionType>('RECTANGULAR');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loaded = loadEquipmentList();
      setEquipmentList(loaded);
      setIsAddingNew(false);
    }
  }, [isOpen]);

  const filteredItems = equipmentList.filter(item => {
    const matchQuery = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certificateNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchQuery && matchCat;
  });

  const handleInsert = (item: EquipmentItem) => {
    const divisor = getDistributionDivisor(item.distribution);
    const standardUncertainty = (item.statedUncertainty / divisor) * item.sensitivityCoefficient;

    const component: TypeBComponent = {
      id: `comp-eq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source: `${item.name} (${item.code}) [Sijil: ${item.certificateNo}]`,
      value: item.statedUncertainty,
      unit: item.unit || currentUnit,
      distribution: item.distribution,
      divisor,
      sensitivityCoefficient: item.sensitivityCoefficient || 1.0,
      standardUncertainty,
      equipmentId: item.id,
    };

    onSelectEquipment(component);
    onClose();
  };

  const handleAddNewEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    const newItem: EquipmentItem = {
      id: `eq-custom-${Date.now()}`,
      name: newName.trim(),
      code: newCode.trim(),
      category: newCat,
      certificateNo: newCert.trim() || 'CAL-DALAMAN-2026',
      calibrationDate: newCalDate,
      nextCalibrationDate: newNextDate || '2027-12-31',
      statedUncertainty: Number(newValue) || 0.001,
      unit: newUnit.trim() || currentUnit,
      distribution: newDist,
      sensitivityCoefficient: 1.0,
      notes: newNotes.trim() || 'Ditambah oleh pengguna makmal',
    };

    const updated = [newItem, ...equipmentList];
    setEquipmentList(updated);
    saveEquipmentList(updated);
    setIsAddingNew(false);
    // Reset
    setNewName('');
    setNewCode('');
  };

  const handleDeleteEquipment = (id: string, name: string) => {
    if (window.confirm(`Adakah anda pasti ingin memadam rekod instrumen [${name}] daripada pustaka makmal?`)) {
      const updated = equipmentList.filter(item => item.id !== id);
      setEquipmentList(updated);
      saveEquipmentList(updated);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-library-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 id="equipment-library-title" className="text-base font-bold text-slate-900">
                Pustaka Peralatan & Sijil Kalibrasi Makmal
              </h2>
              <p className="text-xs text-slate-500">
                Pilih radas yang telah ditentukur untuk disuntik terus ke dalam Komponen Type B.
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

        {/* Toolbar */}
        {!isAddingNew && (
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama peralatan, kod aset (EQ-BAL-01), atau nombor sijil..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="BALANCE">Neraca Analitikal</option>
              <option value="PIPETTE">Mikropipet</option>
              <option value="FLASK">Kelalang Volumetrik</option>
              <option value="BURETTE">Buret</option>
              <option value="CRM">Bahan Standard (CRM)</option>
              <option value="THERMOMETER">Suhu / Persekitaran</option>
            </select>

            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftar Radas Baharu</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-3">
          {isAddingNew ? (
            /* Add New Form */
            <form onSubmit={handleAddNewEquipment} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Borang Pendaftaran Radas / Bahan Standard Makmal Baharu
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                >
                  Kembali ke Senarai
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700">Nama Lengkap Peralatan / CRM *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Neraca Mikro Sartorius Cubis II"
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Kod Aset / Tag Makmal *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Contoh: EQ-BAL-05"
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Kategori Radas</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="BALANCE">Neraca Analitikal</option>
                    <option value="PIPETTE">Mikropipet</option>
                    <option value="FLASK">Kelalang Volumetrik</option>
                    <option value="BURETTE">Buret</option>
                    <option value="CRM">Bahan Standard (CRM)</option>
                    <option value="THERMOMETER">Termometer / Suhu</option>
                    <option value="OTHER">Lain-lain</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">No. Sijil Kalibrasi / Lot CRM</label>
                  <input
                    type="text"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="Contoh: CAL-SAMM-2026-99"
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Tarikh Kalibrasi Terkini</label>
                  <input
                    type="date"
                    value={newCalDate}
                    onChange={(e) => setNewCalDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Nilai Ketakpastian Dinyatakan (a) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Unit Pengukuran</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="g, mL, mg/L..."
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700">Jenis Taburan Kebarangkalian</label>
                  <select
                    value={newDist}
                    onChange={(e) => setNewDist(e.target.value as DistributionType)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white font-mono"
                  >
                    <option value="NORMAL_K2">Normal (k=2, Sijil Kalibrasi 95%)</option>
                    <option value="RECTANGULAR">Rectangular (Toleransi Had Pengeluar ±a / √3)</option>
                    <option value="TRIANGULAR">Triangular (Glassware Volumetrik ±a / √6)</option>
                    <option value="NORMAL_K1">Normal (k=1)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Simpan ke Pustaka
                </button>
              </div>
            </form>
          ) : (
            /* Items List */
            filteredItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-medium">Tiada peralatan dijumpai.</p>
                <p className="text-[11px] mt-1">Cuba kata kunci lain atau daftar radas baharu.</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>Sijil: <strong className="text-slate-700">{item.certificateNo}</strong></span>
                      <span>·</span>
                      <span>Ketakpastian (a): <strong className="text-indigo-700 font-bold">±{item.statedUncertainty} {item.unit}</strong></span>
                      <span>·</span>
                      <span className="text-slate-600">{item.distribution}</span>
                    </div>

                    {item.notes && (
                      <p className="text-[10px] text-slate-400 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleInsert(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors text-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Suntik ke Bajet</span>
                    </button>

                    {item.id.startsWith('eq-custom') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEquipment(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Padam Instrumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {equipmentList.length} instrumen & bahan rujukan berdaftar dalam makmal
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
