import * as XLSX from 'xlsx';

function parseSheet(sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = raw.findIndex(
    (row) => row.filter((cell) => cell !== '' && cell != null).length >= 2
  );
  if (headerIdx === -1) return [];
  const headers = raw[headerIdx];
  return raw
    .slice(headerIdx + 1)
    .filter((row) => row.some((cell) => cell !== '' && cell != null))
    .map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        let val = row[i] ?? null;
        if (val instanceof Date) val = val.toLocaleDateString('nb-NO');
        if (header) obj[header] = val;
      });
      return obj;
    });
}

export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: true });

        if (!workbook.SheetNames.includes('10_Function')) {
          reject(new Error('Fant ikke fanen "10_Function" i Excel-filen.'));
          return;
        }

        const sheets = {};
        workbook.SheetNames.forEach((name) => {
          const sheet = workbook.Sheets[name];
          if (sheet && sheet['!ref']) {
            const rows = parseSheet(sheet);
            if (rows.length > 0) sheets[name] = rows;
          }
        });

        resolve(sheets);
      } catch (err) {
        reject(new Error('Kunne ikke lese Excel-filen: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('Kunne ikke lese filen.'));
    reader.readAsArrayBuffer(file);
  });
}
