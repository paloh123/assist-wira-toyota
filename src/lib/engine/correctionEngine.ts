/**
 * Correction Engine
 * Auto-corrects operation_type and part_no
 *
 * Rules for operation_type:
 * - Contains "1000 KM"              → SBI
 * - Contains "KM" (but not 1000 KM) → SBE
 * - Contains "OLI" | "ENGINE OIL" | "OIL" → OIL
 * - Default                         → GR
 *
 * Rules for part_no:
 * - "00000000000" → "0"
 */

export type OperationType = 'SBE' | 'SBI' | 'GR' | 'OIL';

export function fixOperationType(operation_desc: string): OperationType {
  if (!operation_desc) return 'GR';

  const upper = operation_desc.toUpperCase();

  // OIL check first (specific keyword match)
  if (
    upper.includes('ENGINE OIL') ||
    upper.includes('OLI') ||
    (upper.includes('OIL') && !upper.includes('KM'))
  ) {
    return 'OIL';
  }

  // 1000 KM → SBI (must be checked before generic KM)
  if (upper.includes('1000 KM') || upper.includes('1000KM')) {
    return 'SBI';
  }

  // KM → SBE
  if (upper.includes('KM')) {
    return 'SBE';
  }

  return 'GR';
}

export function fixPartNo(part_no: string): string {
  if (!part_no) return '';
  const trimmed = part_no.trim();
  // Replace all-zero patterns like 00000000000
  if (/^0+$/.test(trimmed) && trimmed.length > 1) {
    return '0';
  }
  return trimmed;
}
