import { UncertaintyBudget } from '../types/labmu';
import { calculateChemicalBudget, calculateBiologyBudget } from './math';

const STORAGE_KEY = 'labmu_pro_budgets_v1';

export const STARTER_TEMPLATES: Omit<UncertaintyBudget, 'id' | 'createdAt' | 'updatedAt' | 'auditLog'>[] = [
  {
    testName: 'Determination of Lead (Pb) in Drinking Water',
    testCode: 'SOP-CH-042',
    category: 'CHEMICAL',
    matrix: 'Potable Water / Air Minuman',
    unit: 'mg/L',
    version: '1.0',
    parentRecordId: null,
    status: 'APPROVED',
    preparedBy: 'Ahmad (Analyst)',
    preparedDate: '2026-11-10',
    approvedBy: 'Dr. Siti (Technical Manager)',
    approvedDate: '2026-11-12',
    notes: 'Penilaian ketakpastian menggunakan kaedah ICP-MS mengikut piawaian APHA 3125 B.',
    typeA: {
      enabled: true,
      readings: [0.052, 0.051, 0.053, 0.052, 0.054, 0.051],
      mean: 0.05217,
      sd: 0.00117,
      standardUncertainty: 0.000477,
    },
    typeBComponents: [
      {
        id: 'comp-1',
        source: 'Analytical Balance Calibration (Mettler Toledo)',
        value: 0.0002,
        unit: 'g',
        distribution: 'NORMAL_K2',
        divisor: 2.0,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.0001,
      },
      {
        id: 'comp-2',
        source: 'CRM Lead Standard Certificate (Cert. Ref. Mat.)',
        value: 0.0004,
        unit: 'mg/L',
        distribution: 'NORMAL_K2',
        divisor: 2.0,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.0002,
      },
      {
        id: 'comp-3',
        source: '1000 µL Micropipette Toleransi Pengeluar',
        value: 0.0005,
        unit: 'mL',
        distribution: 'RECTANGULAR',
        divisor: 1.73205,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.000289,
      },
      {
        id: 'comp-4',
        source: '100 mL Volumetric Flask Class A Pengaruh Suhu',
        value: 0.0006,
        unit: 'mL',
        distribution: 'TRIANGULAR',
        divisor: 2.44949,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.000245,
      },
    ],
    results: {
      combinedUncertainty: 0.000676,
      coverageFactor: 2,
      expandedUncertainty: 0.00135,
      confidenceInterval: '95%',
      reportedResult: '0.0522 ± 0.0014 mg/L (k=2, 95% CL)',
    },
  },
  {
    testName: 'Penentuan Kepekatan Asid Asetik Melalui Titratan',
    testCode: 'SOP-CH-015',
    category: 'CHEMICAL',
    matrix: 'Cuka Makanan / Vinegar',
    unit: '% (w/v)',
    version: '1.0',
    parentRecordId: null,
    status: 'SUBMITTED',
    preparedBy: 'Ahmad (Analyst)',
    preparedDate: '2026-11-12',
    approvedBy: null,
    approvedDate: null,
    notes: 'Menunggu semakan pengurus teknikal. Ujian ulangan 5 kali replikasi.',
    typeA: {
      enabled: true,
      readings: [4.98, 5.01, 4.99, 5.02, 5.00],
      mean: 5.00,
      sd: 0.0158,
      standardUncertainty: 0.00707,
    },
    typeBComponents: [
      {
        id: 'titr-1',
        source: 'Buret 50 mL Kelas A Toleransi',
        value: 0.05,
        unit: 'mL',
        distribution: 'TRIANGULAR',
        divisor: 2.44949,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.02041,
      },
      {
        id: 'titr-2',
        source: 'Kemolaran NaOH Standard (Sijil Pengeluar)',
        value: 0.002,
        unit: 'mol/L',
        distribution: 'RECTANGULAR',
        divisor: 1.73205,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.00115,
      },
      {
        id: 'titr-3',
        source: 'Penunjuk Titik Akhir (Visual Endpoint Discrepancy)',
        value: 0.02,
        unit: 'mL',
        distribution: 'RECTANGULAR',
        divisor: 1.73205,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.01155,
      },
    ],
    results: {
      combinedUncertainty: 0.0245,
      coverageFactor: 2,
      expandedUncertainty: 0.0490,
      confidenceInterval: '95%',
      reportedResult: '5.000 ± 0.049 % (w/v) (k=2, 95% CL)',
    },
  },
  {
    testName: 'Pengiraan Jumlah Bakteria Aerobik (Total Viable Count - ISO 19036)',
    testCode: 'SOP-MB-008',
    category: 'BIOLOGICAL',
    matrix: 'Produk Tenusu / Daging',
    unit: 'log10 CFU/g',
    version: '1.0',
    parentRecordId: null,
    status: 'APPROVED',
    preparedBy: 'Ahmad (Analyst)',
    preparedDate: '2026-11-09',
    approvedBy: 'Dr. Siti (Technical Manager)',
    approvedDate: '2026-11-11',
    notes: 'Pengiraan ketakpastian mikrobiologi makanan mengikut standard ISO 19036:2019.',
    typeA: {
      enabled: false,
      readings: [],
      mean: 0,
      sd: 0,
      standardUncertainty: 0,
    },
    typeBComponents: [],
    biologyData: {
      cfuReadings: [2400, 2600],
      logValues: [3.3802, 3.4150],
      meanLog: 3.3976,
      sR: 0.0246,
      uMat: 0.0150,
      uInc: 0.0120,
      uBiol: 0.0312,
      expandedU: 0.0624,
      unit: 'log10 CFU/g',
      lodAdvisory: false,
      varianceContribution_sR: 62.1,
      varianceContribution_uMat: 23.1,
      varianceContribution_uInc: 14.8,
    },
    results: {
      combinedUncertainty: 0.0312,
      coverageFactor: 2,
      expandedUncertainty: 0.0624,
      confidenceInterval: '95%',
      reportedResult: '3.40 ± 0.06 log10 CFU/g (k=2, 95% CL)',
    },
  },
  {
    testName: 'Penghitungan Escherichia coli dalam Sampel Makanan',
    testCode: 'SOP-MB-021',
    category: 'BIOLOGICAL',
    matrix: 'Ayam Mentah / Poultry',
    unit: 'log10 CFU/g',
    version: '1.0',
    parentRecordId: null,
    status: 'DRAFT',
    preparedBy: 'Ahmad (Analyst)',
    preparedDate: '2026-11-12',
    approvedBy: null,
    approvedDate: null,
    notes: 'Draf baharu untuk validasi kaedah pengesanan E. coli menggunakan medium TBX.',
    typeA: {
      enabled: false,
      readings: [],
      mean: 0,
      sd: 0,
      standardUncertainty: 0,
    },
    typeBComponents: [],
    biologyData: {
      cfuReadings: [450, 520],
      logValues: [2.6532, 2.7160],
      meanLog: 2.6846,
      sR: 0.0444,
      uMat: 0.0250,
      uInc: 0.0180,
      uBiol: 0.0541,
      expandedU: 0.1082,
      unit: 'log10 CFU/g',
      lodAdvisory: false,
      varianceContribution_sR: 67.3,
      varianceContribution_uMat: 21.4,
      varianceContribution_uInc: 11.3,
    },
    results: {
      combinedUncertainty: 0.0541,
      coverageFactor: 2,
      expandedUncertainty: 0.1082,
      confidenceInterval: '95%',
      reportedResult: '2.68 ± 0.11 log10 CFU/g (k=2, 95% CL)',
    },
  },
  {
    testName: 'Ujian Logam Berat Kadmium (Cd) dalam Air Sisa',
    testCode: 'SOP-CH-088',
    category: 'CHEMICAL',
    matrix: 'Industrial Wastewater',
    unit: 'mg/L',
    version: '1.0',
    parentRecordId: null,
    status: 'REJECTED',
    preparedBy: 'Ahmad (Analyst)',
    preparedDate: '2026-11-08',
    approvedBy: null,
    approvedDate: null,
    rejectionReason: 'Sila sahkan nilai ketakpastian mikropipet daripada sijil kalibrasi terkini tahun 2026 dan sertakan bacaan replikasi sekurang-kurangnya 5 titik.',
    notes: 'Ditolak semasa mesyuarat audit dalaman oleh Pengurus Kualiti.',
    typeA: {
      enabled: true,
      readings: [0.012, 0.014],
      mean: 0.013,
      sd: 0.00141,
      standardUncertainty: 0.001,
    },
    typeBComponents: [
      {
        id: 'cd-1',
        source: 'Standard Kalibrasi Cd (CRM Luput)',
        value: 0.001,
        unit: 'mg/L',
        distribution: 'NORMAL_K2',
        divisor: 2.0,
        sensitivityCoefficient: 1.0,
        standardUncertainty: 0.0005,
      },
    ],
    results: {
      combinedUncertainty: 0.00112,
      coverageFactor: 2,
      expandedUncertainty: 0.00224,
      confidenceInterval: '95%',
      reportedResult: '0.0130 ± 0.0022 mg/L (k=2, 95% CL)',
    },
  },
];

export function getInitialBudgets(): UncertaintyBudget[] {
  const now = new Date().toISOString();
  return STARTER_TEMPLATES.map((tpl, index) => {
    let recalculated = { ...tpl };
    if (tpl.category === 'CHEMICAL') {
      const chemRes = calculateChemicalBudget(tpl.typeA, tpl.typeBComponents);
      recalculated.typeA = chemRes.typeA;
      recalculated.typeBComponents = chemRes.typeBComponents;
      recalculated.results = chemRes.results;
    } else if (tpl.category === 'BIOLOGICAL' && tpl.biologyData) {
      const bioRes = calculateBiologyBudget(tpl.biologyData);
      recalculated.biologyData = bioRes;
      recalculated.results = {
        combinedUncertainty: bioRes.uBiol,
        coverageFactor: 2,
        expandedUncertainty: bioRes.expandedU,
        confidenceInterval: '95%',
        reportedResult: `${bioRes.meanLog.toFixed(2)} ± ${bioRes.expandedU.toFixed(2)} ${bioRes.unit} (k=2, 95% CL)`,
      };
    }

    return {
      ...recalculated,
      id: `budg-init-${index + 1}`,
      createdAt: now,
      updatedAt: now,
      auditLog: [
        {
          id: `audit-${index + 1}-1`,
          timestamp: tpl.preparedDate ? `${tpl.preparedDate}T09:00:00Z` : now,
          user: tpl.preparedBy,
          role: 'ANALYST',
          action: `Membina draf bajet ketakpastian v${tpl.version}`,
        },
        ...(tpl.status === 'APPROVED' && tpl.approvedBy
          ? [
              {
                id: `audit-${index + 1}-2`,
                timestamp: tpl.approvedDate ? `${tpl.approvedDate}T14:30:00Z` : now,
                user: tpl.approvedBy,
                role: 'MANAGER' as const,
                action: 'Menyemak dan meluluskan bajet ketakpastian (Audit Lock dimulakan)',
              },
            ]
          : []),
        ...(tpl.status === 'REJECTED' && tpl.rejectionReason
          ? [
              {
                id: `audit-${index + 1}-3`,
                timestamp: `${tpl.preparedDate}T16:00:00Z`,
                user: 'Dr. Siti (Technical Manager)',
                role: 'MANAGER' as const,
                action: 'Menolak bajet ketakpastian untuk semakan semula',
                notes: tpl.rejectionReason,
              },
            ]
          : []),
      ],
    };
  });
}

export function loadStoredBudgets(): UncertaintyBudget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialBudgets();
      saveBudgets(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialBudgets();
    saveBudgets(initial);
    return initial;
  } catch (err) {
    console.error('Error loading stored budgets, reinitializing:', err);
    const initial = getInitialBudgets();
    saveBudgets(initial);
    return initial;
  }
}

export function saveBudgets(budgets: UncertaintyBudget[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function exportBudgetsToJSON(budgets: UncertaintyBudget[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(budgets, null, 2));
  const downloadAnchor = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `LabMU_Pro_Backup_${timestamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBudgetsFromJSON(
  jsonString: string
): { success: boolean; data?: UncertaintyBudget[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Format JSON tidak sah. Data sandaran mestilah dalam format senarai (array).' };
    }

    // Basic schema validation
    for (const item of parsed) {
      if (!item.id || !item.testName || !item.category || !item.status) {
        return {
          success: false,
          error: 'Format data tidak lengkap: Setiap rekod memerlukan medan id, testName, category, dan status.',
        };
      }
    }

    saveBudgets(parsed);
    return { success: true, data: parsed };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal memproses fail JSON.' };
  }
}

/**
 * FR-006: Version Upgrade & Cloning
 * Clones an APPROVED record into a new DRAFT with incremented version (v1.0 -> v2.0)
 * Preserves parentRecordId to maintain the full audit genealogy.
 */
export function cloneApprovedBudget(
  source: UncertaintyBudget,
  actorName: string,
  actorRole: 'ANALYST' | 'MANAGER'
): UncertaintyBudget {
  const currentVerNumber = parseFloat(source.version) || 1.0;
  const nextVerNumber = (Math.floor(currentVerNumber) + 1.0).toFixed(1);
  const now = new Date().toISOString();
  const dateStr = now.slice(0, 10);

  const newId = `budg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const cloned: UncertaintyBudget = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    version: nextVerNumber,
    parentRecordId: source.id,
    status: 'DRAFT',
    preparedBy: actorName,
    preparedDate: dateStr,
    approvedBy: null,
    approvedDate: null,
    rejectionReason: undefined,
    createdAt: now,
    updatedAt: now,
    auditLog: [
      {
        id: `audit-${Date.now()}-1`,
        timestamp: now,
        user: actorName,
        role: actorRole,
        action: `Klon daripada Rekod Diluluskan [${source.testCode} v${source.version}] ke Versi Baharu v${nextVerNumber} (Draf)`,
      },
    ],
  };

  return cloned;
}
