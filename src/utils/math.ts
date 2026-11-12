import { DistributionType, TypeAData, TypeBComponent, BiologyData, BudgetResults } from '../types/labmu';

/**
 * Returns exact mathematical divisor for ISO/IEC 17025 probability distributions.
 * - Normal (k=1): 1.0
 * - Normal (k=2, 95% Sijil Kalibrasi): 2.0
 * - Rectangular (Had toleransi pengeluar): sqrt(3) ≈ 1.73205
 * - Triangular (Volumetrik glassware): sqrt(6) ≈ 2.44949
 */
export function getDistributionDivisor(dist: DistributionType): number {
  switch (dist) {
    case 'NORMAL_K1':
      return 1.0;
    case 'NORMAL_K2':
      return 2.0;
    case 'RECTANGULAR':
      return Math.sqrt(3); // 1.7320508...
    case 'TRIANGULAR':
      return Math.sqrt(6); // 2.4494897...
    default:
      return 1.0;
  }
}

export function getDistributionLabel(dist: DistributionType): string {
  switch (dist) {
    case 'NORMAL_K1':
      return 'Normal (k=1)';
    case 'NORMAL_K2':
      return 'Normal (k=2, 95% Sijil Kalibrasi)';
    case 'RECTANGULAR':
      return 'Rectangular / Segiempat Tepat (±a / √3)';
    case 'TRIANGULAR':
      return 'Triangular / Segitiga (±a / √6)';
    default:
      return dist;
  }
}

/**
 * Type A Uncertainty calculation from replicate readings.
 * Returns { mean, sd, standardUncertainty }
 */
export function calculateTypeA(readings: number[]): {
  mean: number;
  sd: number;
  standardUncertainty: number;
} {
  const validReadings = readings.filter(r => !isNaN(r) && isFinite(r));
  const n = validReadings.length;

  if (n < 2) {
    return {
      mean: n === 1 ? validReadings[0] : 0,
      sd: 0,
      standardUncertainty: 0,
    };
  }

  // Mean
  const sum = validReadings.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Sample Standard Deviation: s = sqrt( sum((xi - mean)^2) / (n - 1) )
  const sumSqDiff = validReadings.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = sumSqDiff / (n - 1);
  const sd = Math.sqrt(variance);

  // Standard Uncertainty: uA = s / sqrt(n)
  const standardUncertainty = sd / Math.sqrt(n);

  return {
    mean,
    sd,
    standardUncertainty,
  };
}

/**
 * Type B Uncertainty calculation
 * uB = (value / divisor) * sensitivityCoefficient
 */
export function calculateTypeBComponent(
  value: number,
  dist: DistributionType,
  sensitivityCoefficient: number = 1.0
): { divisor: number; standardUncertainty: number } {
  const divisor = getDistributionDivisor(dist);
  const val = isNaN(value) ? 0 : Math.abs(value);
  const ci = isNaN(sensitivityCoefficient) ? 1.0 : sensitivityCoefficient;
  const standardUncertainty = (val / divisor) * ci;

  return {
    divisor,
    standardUncertainty,
  };
}

/**
 * Chemical Mode Combined & Expanded Uncertainty calculation with Variance Contribution
 */
export function calculateChemicalBudget(
  typeA: TypeAData,
  typeBComponents: TypeBComponent[]
): {
  typeA: TypeAData;
  typeBComponents: TypeBComponent[];
  results: BudgetResults;
} {
  // 1. Recalculate Type A
  let calculatedTypeA = { ...typeA };
  if (typeA.enabled && typeA.readings.length >= 2) {
    const resA = calculateTypeA(typeA.readings);
    calculatedTypeA = {
      ...calculatedTypeA,
      mean: resA.mean,
      sd: resA.sd,
      standardUncertainty: resA.standardUncertainty,
    };
  } else if (!typeA.enabled) {
    calculatedTypeA.standardUncertainty = 0;
  }

  // 2. Recalculate Type B components
  const updatedTypeB = typeBComponents.map(comp => {
    const { divisor, standardUncertainty } = calculateTypeBComponent(
      comp.value,
      comp.distribution,
      comp.sensitivityCoefficient
    );
    return {
      ...comp,
      divisor,
      standardUncertainty,
    };
  });

  // 3. Combined Uncertainty uc = sqrt( uA^2 + sum(uB_i^2) )
  const uASq = (calculatedTypeA.enabled && calculatedTypeA.readings.length >= 2) 
    ? Math.pow(calculatedTypeA.standardUncertainty, 2) 
    : 0;

  const sumUBsq = updatedTypeB.reduce((acc, comp) => acc + Math.pow(comp.standardUncertainty, 2), 0);
  const totalVariance = uASq + sumUBsq;
  const combinedUncertainty = Math.sqrt(totalVariance);

  // 4. Expanded Uncertainty U = uc * 2 (k = 2, 95% Confidence Level)
  const coverageFactor = 2;
  const expandedUncertainty = combinedUncertainty * coverageFactor;

  // 5. Variance Contribution (% = (ui^2 / uc^2) * 100)
  if (totalVariance > 0) {
    if (calculatedTypeA.enabled && calculatedTypeA.readings.length >= 2) {
      calculatedTypeA.varianceContribution = (uASq / totalVariance) * 100;
    } else {
      calculatedTypeA.varianceContribution = 0;
    }

    updatedTypeB.forEach(comp => {
      const compVar = Math.pow(comp.standardUncertainty, 2);
      comp.varianceContribution = (compVar / totalVariance) * 100;
    });
  } else {
    calculatedTypeA.varianceContribution = 0;
    updatedTypeB.forEach(comp => {
      comp.varianceContribution = 0;
    });
  }

  // Format reported result e.g. "0.0522 ± 0.0010"
  const meanVal = calculatedTypeA.enabled && calculatedTypeA.readings.length >= 2 ? calculatedTypeA.mean : null;
  const reportedResult = formatReportedResult(meanVal, expandedUncertainty);

  return {
    typeA: calculatedTypeA,
    typeBComponents: updatedTypeB,
    results: {
      combinedUncertainty,
      coverageFactor,
      expandedUncertainty,
      confidenceInterval: '95%',
      reportedResult,
    },
  };
}

/**
 * Biological Mode Calculation (ISO 19036)
 * Log transformation: yi = log10(Ci)
 * uBiol = sqrt( sR^2 + uMat^2 + uInc^2 )
 * U = 2 * uBiol (unit log10 CFU/g)
 */
export function calculateBiologyBudget(bio: {
  cfuReadings: number[];
  sR?: number;
  uMat?: number;
  uInc?: number;
}): BiologyData {
  const cfuReadings = bio.cfuReadings || [];
  let lodAdvisory = false;
  const zeroReplacedValue = 1; // 1 CFU/g for LOD advisory

  const logValues: number[] = [];
  for (const cfu of cfuReadings) {
    if (cfu <= 0) {
      lodAdvisory = true;
      // Use zeroReplacedValue (log10(1) = 0) to avoid -Infinity
      logValues.push(0);
    } else {
      logValues.push(Math.log10(cfu));
    }
  }

  // Calculate Mean Log and empirical sR from replicate plate counts if sR not manually forced
  let meanLog = 0;
  let computedSR = 0;
  if (logValues.length >= 2) {
    meanLog = logValues.reduce((a, b) => a + b, 0) / logValues.length;
    const sumSqDiff = logValues.reduce((acc, val) => acc + Math.pow(val - meanLog, 2), 0);
    computedSR = Math.sqrt(sumSqDiff / (logValues.length - 1));
  } else if (logValues.length === 1) {
    meanLog = logValues[0];
  }

  // Use provided sR if specified (> 0), otherwise use computed replicate SD
  const sR = bio.sR !== undefined && bio.sR > 0 ? bio.sR : computedSR;
  const uMat = bio.uMat || 0;
  const uInc = bio.uInc || 0;

  const totalVariance = Math.pow(sR, 2) + Math.pow(uMat, 2) + Math.pow(uInc, 2);
  const uBiol = Math.sqrt(totalVariance);
  const expandedU = 2 * uBiol;

  let varianceContribution_sR = 0;
  let varianceContribution_uMat = 0;
  let varianceContribution_uInc = 0;

  if (totalVariance > 0) {
    varianceContribution_sR = (Math.pow(sR, 2) / totalVariance) * 100;
    varianceContribution_uMat = (Math.pow(uMat, 2) / totalVariance) * 100;
    varianceContribution_uInc = (Math.pow(uInc, 2) / totalVariance) * 100;
  }

  return {
    cfuReadings,
    logValues,
    meanLog,
    sR,
    uMat,
    uInc,
    uBiol,
    expandedU,
    unit: 'log10 CFU/g',
    lodAdvisory,
    zeroReplacedValue,
    varianceContribution_sR,
    varianceContribution_uMat,
    varianceContribution_uInc,
  };
}

/**
 * Format numbers cleanly for laboratory documentation (up to 4-5 sig figs / decimals)
 */
export function formatLabNumber(num: number | undefined | null, decimals: number = 4): string {
  if (num === undefined || num === null || isNaN(num)) return '-';
  if (num === 0) return '0.0000';
  
  // If number is very small (< 0.0001), show in scientific or high precision
  if (Math.abs(num) < 0.0001 && num !== 0) {
    return num.toExponential(3);
  }
  return Number(num).toFixed(decimals);
}

export function formatReportedResult(mean: number | null, expandedU: number): string {
  if (expandedU === 0) return 'Belum dikira';
  
  if (mean !== null && !isNaN(mean)) {
    // Choose appropriate decimal places based on magnitude of expandedU
    let dec = 4;
    if (expandedU >= 1) dec = 2;
    else if (expandedU >= 0.01) dec = 3;
    else if (expandedU >= 0.001) dec = 4;
    else dec = 5;

    return `${mean.toFixed(dec)} ± ${expandedU.toFixed(dec)}`;
  }
  return `± ${formatLabNumber(expandedU, 4)}`;
}

/**
 * ISO/GUM Standard (JCGM 100:2008 & EURACHEM CITAC Guide CG4):
 * 1. Expanded uncertainty U is quoted to at most two significant digits (2 sig figs).
 * 2. The mean/reported value is rounded to the same decimal place as U.
 */
export function formatIsoSignificantFigures(
  mean: number | null,
  expandedU: number,
  unit: string = '',
  k: number = 2
): {
  reported: string;
  roundedMean: string;
  roundedU: string;
  decimalPlaces: number;
  explanation: string;
} {
  if (expandedU <= 0 || isNaN(expandedU)) {
    return {
      reported: mean !== null ? `${mean.toFixed(4)} ${unit}` : '0.0000',
      roundedMean: mean !== null ? mean.toFixed(4) : '0.0000',
      roundedU: '0.0000',
      decimalPlaces: 4,
      explanation: 'Tiada ketakpastian bernilai positif untuk pembundaran 2 angka bererti.',
    };
  }

  // Find the order of magnitude of expandedU
  // e.g. for U = 0.0945 -> order is -2 (since 10^-2 = 0.01)
  const order = Math.floor(Math.log10(expandedU));
  // Round U to 2 significant digits:
  // decimal places needed = -(order - 1)
  const decimalPlaces = Math.max(0, 1 - order);

  const roundedU = Number(expandedU.toFixed(decimalPlaces));
  const roundedUStr = roundedU.toFixed(decimalPlaces);

  let roundedMeanStr = '-';
  if (mean !== null && !isNaN(mean)) {
    roundedMeanStr = mean.toFixed(decimalPlaces);
  }

  const unitSuffix = unit ? ` ${unit}` : '';
  const reported = mean !== null && !isNaN(mean)
    ? `${roundedMeanStr} ± ${roundedUStr}${unitSuffix} (k=${k}, 95% CL)`
    : `± ${roundedUStr}${unitSuffix} (k=${k}, 95% CL)`;

  return {
    reported,
    roundedMean: roundedMeanStr,
    roundedU: roundedUStr,
    decimalPlaces,
    explanation: `Mengikut klausa ISO/GUM 7.2.6, nilai ketakpastian diperluas U dibundarkan kepada 2 angka bererti (${roundedUStr}), dan min diselaraskan kepada ${decimalPlaces} tempat perpuluhan yang sama (${roundedMeanStr}).`,
  };
}
