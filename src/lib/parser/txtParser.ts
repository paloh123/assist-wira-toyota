/**
 * TXT Parser for ASSIST files
 * Delimiter: semicolon (;)
 * Handles CRLF and LF line endings
 */

export interface WORawRow {
  outlet_code: string;
  wo_no: string;
  wo_date: string;
  chassis_no: string;
  operation_desc: string;
  labor_code: string;
  labor_amount: string;
  part_amount: string;
  oil_amount: string;
  tyre_amount: string;
  discount: string;
  other_amount: string;
  col13: string;
  col14: string;
  remark: string;
}

export interface INVRawRow {
  outlet_code: string;
  wo_no: string;
  invoice_no: string;
  date: string;
  part_no: string;
  part_desc: string;
  unit_price: string;
  qty: string;
  amount: string;
  discount: string;
  ppn: string;
  total: string;
  col13: string;
  po_no: string;
  col15: string;
  raw_col_a: string;
  raw_col_b: string;
}

export function parseTxt(content: string): string[][] {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  return lines.map((line) => line.split(';'));
}

export function parseWOFile(content: string): WORawRow[] {
  const rows = parseTxt(content);
  return rows.map((cols) => {
    const remarkIndex = cols.length >= 15 ? 14 : 13;

    return {
      outlet_code:   (cols[0] || '').trim(),
      wo_no:         (cols[1] || '').trim(),
      wo_date:       (cols[2] || '').trim(),
      chassis_no:    (cols[3] || '').trim(),
      operation_desc:(cols[4] || '').trim(),
      labor_code:    (cols[5] || '').trim(),
      labor_amount:  (cols[6] || '0').trim(),
      part_amount:   (cols[7] || '0').trim(),
      oil_amount:    (cols[8] || '0').trim(),
      tyre_amount:   (cols[9] || '0').trim(),
      discount:      (cols[10] || '0').trim(),
      other_amount:  (cols[11] || '0').trim(),
      col13:         (cols[12] || '').trim(),
      col14:         cols.length >= 15 ? (cols[13] || '').trim() : '',
      remark:        cols.slice(remarkIndex).join(';').trim(),
    };
  });
}

export function parseINVFile(content: string): INVRawRow[] {
  const rows = parseTxt(content);
  return rows.map((cols) => ({
    outlet_code: (cols[0] || '').trim(),
    wo_no:       (cols[1] || '').trim(),
    invoice_no:  (cols[2] || '').trim(),
    date:        (cols[3] || '').trim(),
    part_no:     (cols[4] || '').trim(),
    part_desc:   (cols[5] || '').trim(),
    unit_price:  (cols[6] || '0').trim(),
    qty:         (cols[7] || '0').trim(),
    amount:      (cols[8] || '0').trim(),
    discount:    (cols[9] || '0').trim(),
    ppn:         (cols[10] || '0').trim(),
    total:       (cols[11] || '0').trim(),
    col13:       (cols[12] || '').trim(),
    po_no:       (cols[13] || '').trim(),
    col15:       (cols[14] || '').trim(),
    raw_col_a:   (cols[15] || '').trim(),
    raw_col_b:   (cols[16] || '').trim(),
  }));
}

export function safeFloat(val: string): number {
  const parsed = parseFloat(val.replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}

export function safeInt(val: string): number {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseDate(val: string): Date | null {
  if (!val) return null;
  // Format: YYYY/MM/DD
  const clean = val.trim().replace(/\//g, '-');
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}
