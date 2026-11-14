// materials.js
// Idealised elastic‑to‑brittle failure model for educational purposes.
// Units convention:
//   Young’s modulus (youngGPa) given in GPa → convert to MPa by ×1000.
//   Cross‑sectional area areaMM2 is in mm².
//   Length lengthMM in mm.
//   Force forceN in N.
//   Stress = forceN / areaMM2  → N/mm² = MPa.
//   Strain = stressMPa / modulusMPa (dimensionless).
//   Extension = strain × lengthMM (mm).
//   Failure occurs when stressMPa ≥ strengthMPa.

export const MATERIALS = [
  { id: "a", name: "Material A", youngGPa: 200, strengthMPa: 150 },
  { id: "b", name: "Material B", youngGPa: 100, strengthMPa: 300 },
];

/**
 * Compute an idealised elastic‑to‑brittle response.
 * @param {Object} material – must contain youngGPa and strengthMPa (finite positive numbers).
 * @param {number} forceN – applied force, finite and nonnegative.
 * @param {number} [areaMM2=10] – cross‑sectional area, finite positive.
 * @param {number} [lengthMM=1000] – member length, finite positive.
 * @returns {{stressMPa:number,failed:boolean,strain:number|null,extensionMM:number|null,failureForceN:number}}
 */
export function materialResponse(
  material,
  forceN,
  areaMM2 = 10,
  lengthMM = 1000,
) {
  const { youngGPa, strengthMPa } = material ?? {};
  const modulusMPa = youngGPa * 1000;

  // Validate inputs – all must be finite positives except forceN may be zero for idle state
  if (
    !Number.isFinite(youngGPa) ||
    !Number.isFinite(modulusMPa) ||
    modulusMPa <= 0
  ) {
    throw new RangeError("invalid youngGPa");
  }
  if (!Number.isFinite(strengthMPa) || strengthMPa <= 0) {
    throw new RangeError("invalid strengthMPa");
  }
  if (!Number.isFinite(forceN) || forceN < 0) {
    throw new RangeError("forceN must be non‑negative finite");
  }
  if (!Number.isFinite(areaMM2) || areaMM2 <= 0) {
    throw new RangeError("areaMM2 must be positive finite");
  }
  if (!Number.isFinite(lengthMM) || lengthMM <= 0) {
    throw new RangeError("lengthMM must be positive finite");
  }

  const stressMPa = forceN / areaMM2;
  const failed = stressMPa >= strengthMPa;
  const failureForceN = strengthMPa * areaMM2;

  let strain = null;
  let extensionMM = null;

  if (!failed) {
    strain = stressMPa / modulusMPa;
    extensionMM = strain * lengthMM;
  }

  return { stressMPa, failed, strain, extensionMM, failureForceN };
}
