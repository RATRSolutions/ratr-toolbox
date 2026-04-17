import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function cleanSectionName(sheetName) {
  return sheetName.replace(/^\d+_/, '').replace(/_/g, ' ');
}

function normalizeKey(k) {
  return k.toLowerCase().replace(/\s+/g, '');
}

function getFunctionIdKey(rows) {
  if (!rows.length) return null;
  return Object.keys(rows[0]).find((k) => normalizeKey(k) === 'functionid') || null;
}

function parseSheetGeneric(sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = raw.findIndex((row) => row.some((cell) => cell !== '' && cell != null));
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

// Read sheet as raw arrays, find the header row with FunctionID, build objects manually
function parseSheet(sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = raw.findIndex((row) =>
    row.some((cell) => typeof cell === 'string' && normalizeKey(cell) === 'functionid')
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

function buildTree(rows) {
  const map = {};
  rows.forEach((row) => {
    map[row.id] = { ...row, children: [] };
  });
  const roots = [];
  rows.forEach((row) => {
    if (row.parentId && map[row.parentId]) {
      map[row.parentId].children.push(map[row.id]);
    } else {
      roots.push(map[row.id]);
    }
  });
  return roots;
}

export function useRflpData(file) {
  const [functions, setFunctions] = useState([]);
  const [sections, setSections] = useState({});
  const [linkedSheets, setLinkedSheets] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    setLoading(true);
    setError(null);
    setFunctions([]);
    setSections({});
    setLinkedSheets({});

    const reader = new FileReader();

    reader.onload = (e) => {
      if (cancelled) return;

      try {
        const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: true });

        if (!workbook.SheetNames.includes('10_Function')) {
          setError('Fant ikke fanen "10_Function" i Excel-filen.');
          return;
        }

        // Parse function sheet — auto-detect header row
        const funcRows = parseSheet(workbook.Sheets['10_Function']);
        const funcIdKey = getFunctionIdKey(funcRows);
        const parentIdKey = funcRows.length
          ? Object.keys(funcRows[0]).find((k) => normalizeKey(k) === 'parentid') || null
          : null;
        const nameKey = funcRows.length
          ? Object.keys(funcRows[0]).find((k) =>
              ['functionname', 'name', 'description', 'title'].includes(normalizeKey(k))
            ) || null
          : null;

        const rawFunctions = funcRows.map((row) => {
          const id = funcIdKey ? String(row[funcIdKey] ?? '') : '';
          const parentId = parentIdKey && row[parentIdKey] ? String(row[parentIdKey]) : null;
          const name = nameKey ? String(row[nameKey] ?? id) : id;
          const metadata = Object.fromEntries(
            Object.entries(row).filter(
              ([k]) => k !== funcIdKey && k !== parentIdKey && k !== nameKey
            )
          );
          return { id, parentId, name, metadata, children: [] };
        });

        const parsedFunctions = buildTree(rawFunctions);

        // Parse related sheets — auto-detect header row per sheet
        const parsedSections = {};
        workbook.SheetNames.forEach((sheetName) => {
          if (sheetName === '10_Function') return;
          const sheet = workbook.Sheets[sheetName];
          if (!sheet || !sheet['!ref']) return;

          const rows = parseSheet(sheet);
          if (!rows.length) return;

          const fkKey = getFunctionIdKey(rows);
          if (!fkKey) return;

          const sectionName = cleanSectionName(sheetName);
          parsedSections[sectionName] = rows.map(({ [fkKey]: fk, ...rest }) => ({
            ...rest,
            functionId: String(fk ?? ''),
          }));
        });

        const parsedLinkedSheets = {};
        ['51_ConceptDecisions', '60_LogicalElements', '70_PhysicalElements'].forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet || !sheet['!ref']) return;
          const rows = parseSheetGeneric(sheet);
          if (rows.length) parsedLinkedSheets[cleanSectionName(sheetName)] = rows;
        });

        setFunctions(parsedFunctions);
        setSections(parsedSections);
        setLinkedSheets(parsedLinkedSheets);
      } catch (err) {
        setError('Kunne ikke lese Excel-filen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      if (cancelled) return;

      setError('Kunne ikke lese filen.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { functions, sections, linkedSheets, loading, error };
}
