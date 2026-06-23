/**
 * Filter Engine
 * Decides which rows are valid for import based on prefix rules
 *
 * Valid WO_No prefixes:  GW-
 * Valid INV_No prefixes: GF-
 * Invalid:               BW-, BPB-, and anything else
 */

const VALID_WO_PREFIXES = ['GW-'];
const VALID_INV_PREFIXES = ['GF-'];

export function isValidWONo(wo_no: string): boolean {
  if (!wo_no) return false;
  const upper = wo_no.toUpperCase();
  return VALID_WO_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

export function isValidINVNo(invoice_no: string): boolean {
  if (!invoice_no) return false;
  const upper = invoice_no.toUpperCase();
  return VALID_INV_PREFIXES.some((prefix) => upper.startsWith(prefix));
}

export function getSkipReason(wo_no: string): string {
  if (!wo_no) return 'WO_No kosong';
  const upper = wo_no.toUpperCase();
  if (upper.startsWith('BW-')) return 'Prefix BW- tidak valid';
  if (upper.startsWith('BPB-')) return 'Prefix BPB- tidak valid';
  return `Prefix tidak dikenal: ${wo_no.substring(0, 6)}`;
}
