import ExcelJS from 'exceljs';

export async function buildDetailedReport(rows: any[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Detailed');
  const columns = Object.keys(rows[0] || {}).map((k) => ({ header: k, key: k }));
  ws.columns = columns as any;
  ws.addRows(rows);
  return wb;
}

export async function buildSummaryReport(rows: any[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Summary');
  ws.columns = [
    { header: 'Department', key: 'dept' },
    { header: 'Status', key: 'status' },
    { header: 'Count', key: 'count' },
  ] as any;
  ws.addRows(rows);
  return wb;
}
