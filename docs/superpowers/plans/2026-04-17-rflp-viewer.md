# RFLP Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg en read-only RFLP-viewer med kollapsbart funksjonstre og detaljpanel, drevet av Excel-filopplasting direkte i nettleseren.

**Architecture:** SheetJS parser Excel-filen i nettleseren (ingen backend-kall). En custom hook (`useRflpData`) håndterer all parsing og returnerer strukturerte data til visningskomponentene. Fast 25/75-splitt mellom funksjonstre og detaljpanel.

**Tech Stack:** React 18, Vite, SheetJS (`xlsx` npm-pakke), Google Fonts (allerede konfigurert)

> **Merk om testing:** Ingen test-oppsett. Verifikasjon gjøres i nettleseren etter hver oppgave med `http://localhost:5173`.

---

## Filstruktur

| Fil | Handling | Ansvar |
|-----|----------|--------|
| `frontend/src/App.jsx` | Modifiser | Legg til `/rflp-viewer` route |
| `frontend/src/pages/Home.jsx` | Modifiser | Legg til tredje verktøykort |
| `frontend/src/hooks/useRflpData.js` | Opprett | All Excel-parsing og datastruktur |
| `frontend/src/components/rflp/FileUpload.jsx` | Opprett | Filvelger med drag-and-drop |
| `frontend/src/components/rflp/FunctionTree.jsx` | Opprett | Kollapsbart funksjonstre |
| `frontend/src/components/rflp/DetailPanel.jsx` | Opprett | Høyre panel med kollapsbare seksjoner |
| `frontend/src/pages/RflpViewer.jsx` | Opprett | Hoved-side, koordinerer panelene |
| `frontend/src/pages/RflpViewer.css` | Opprett | All styling for RFLP Viewer |

---

## Task 1: Installer SheetJS + route + Home-kort

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Steg 1: Installer SheetJS**

```bash
cd /home/tom/projects/toolbox/frontend && npm install xlsx
```

Forventet: `added X packages` uten feil.

- [ ] **Steg 2: Legg til route i `frontend/src/App.jsx`**

Erstatt innholdet med:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MdToDocx from './pages/MdToDocx';
import Laeringsplan from './pages/Laeringsplan';
import RflpViewer from './pages/RflpViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/md-to-docx" element={<MdToDocx />} />
        <Route path="/laeringsplan" element={<Laeringsplan />} />
        <Route path="/rflp-viewer" element={<RflpViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

> `RflpViewer` finnes ikke ennå – Vite vil vise feil til den opprettes i Task 6. Det er forventet.

- [ ] **Steg 3: Oppdater `frontend/src/pages/Home.jsx`**

Erstatt `tools`-arrayen med:

```jsx
const tools = [
  {
    id: 'md-to-docx',
    title: 'md-to-docx',
    description: 'Konverter et Markdown-dokument til Word med en mal.',
    path: '/md-to-docx',
  },
  {
    id: 'laeringsplan',
    title: 'Læringsplan',
    description: 'Veikart for AI-assistert softwareutvikling.',
    path: '/laeringsplan',
  },
  {
    id: 'rflp-viewer',
    title: 'RFLP Viewer',
    description: 'Naviger og presenter RFLP-databaser fra Excel.',
    path: '/rflp-viewer',
  },
];
```

- [ ] **Steg 4: Commit**

```bash
git add frontend/src/App.jsx frontend/src/pages/Home.jsx frontend/package.json frontend/package-lock.json
git commit -m "feat: install SheetJS, add RFLP Viewer route and Home card"
```

---

## Task 2: useRflpData hook

**Files:**
- Create: `frontend/src/hooks/useRflpData.js`

- [ ] **Steg 1: Opprett mappen**

```bash
mkdir -p /home/tom/projects/toolbox/frontend/src/hooks
```

- [ ] **Steg 2: Opprett `frontend/src/hooks/useRflpData.js`**

```js
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function cleanSectionName(sheetName) {
  return sheetName.replace(/^\d+_/, '').replace(/_/g, ' ');
}

function getFunctionIdKey(rows) {
  if (!rows.length) return null;
  return Object.keys(rows[0]).find((k) => k.toLowerCase() === 'functionid') || null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setFunctions([]);
    setSections({});

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });

        if (!workbook.SheetNames.includes('10_Function')) {
          setError('Fant ikke fanen "10_Function" i Excel-filen.');
          setLoading(false);
          return;
        }

        // Parse function sheet
        const funcRows = XLSX.utils.sheet_to_json(workbook.Sheets['10_Function']);
        const funcIdKey = getFunctionIdKey(funcRows);
        const parentIdKey = funcRows.length
          ? Object.keys(funcRows[0]).find((k) => k.toLowerCase() === 'parentid') || null
          : null;
        const nameKey = funcRows.length
          ? Object.keys(funcRows[0]).find((k) =>
              ['functionname', 'name', 'description', 'title'].includes(k.toLowerCase())
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

        // Parse related sheets
        const parsedSections = {};
        workbook.SheetNames.forEach((sheetName) => {
          if (sheetName === '10_Function') return;
          const sheet = workbook.Sheets[sheetName];
          if (!sheet || !sheet['!ref']) return;

          const rows = XLSX.utils.sheet_to_json(sheet);
          if (!rows.length) return;

          const fkKey = getFunctionIdKey(rows);
          if (!fkKey) return;

          const sectionName = cleanSectionName(sheetName);
          parsedSections[sectionName] = rows.map((row) => ({
            ...row,
            functionId: String(row[fkKey] ?? ''),
          }));
        });

        setFunctions(parsedFunctions);
        setSections(parsedSections);
      } catch (err) {
        setError('Kunne ikke lese Excel-filen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Kunne ikke lese filen.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  return { functions, sections, loading, error };
}
```

- [ ] **Steg 3: Commit**

```bash
git add frontend/src/hooks/useRflpData.js
git commit -m "feat: add useRflpData hook for Excel parsing"
```

---

## Task 3: FileUpload-komponent

**Files:**
- Create: `frontend/src/components/rflp/FileUpload.jsx`

- [ ] **Steg 1: Opprett mappe**

```bash
mkdir -p /home/tom/projects/toolbox/frontend/src/components/rflp
```

- [ ] **Steg 2: Opprett `frontend/src/components/rflp/FileUpload.jsx`**

```jsx
import { useRef, useState } from 'react';

function FileUpload({ onLoad }) {
  const inputRef = useRef();
  const [formatError, setFormatError] = useState(null);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xlsm)$/i)) {
      setFormatError('Kun .xlsx og .xlsm støttes.');
      return;
    }
    setFormatError(null);
    onLoad(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <p className="upload-eyebrow">ratr solutions</p>
        <h1>RFLP Viewer</h1>
      </div>
      <div
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="upload-icon">⊞</p>
        <p className="upload-label">Last opp RFLP-database</p>
        <p className="upload-hint">Dra og slipp .xlsx eller .xlsm her, eller klikk for å velge</p>
      </div>
      {formatError && <p className="upload-error">{formatError}</p>}
    </div>
  );
}

export default FileUpload;
```

- [ ] **Steg 3: Commit**

```bash
git add frontend/src/components/rflp/FileUpload.jsx
git commit -m "feat: add FileUpload component for RFLP Viewer"
```

---

## Task 4: FunctionTree-komponent

**Files:**
- Create: `frontend/src/components/rflp/FunctionTree.jsx`

- [ ] **Steg 1: Opprett `frontend/src/components/rflp/FunctionTree.jsx`**

```jsx
import { useState } from 'react';

function TreeNode({ node, selectedId, onSelect, depth }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node${selectedId === node.id ? ' selected' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          className="tree-expand"
          onClick={() => setExpanded((e) => !e)}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          aria-label={expanded ? 'Kollaps' : 'Ekspander'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <button className="tree-label" onClick={() => onSelect(node.id)}>
          {node.name || node.id}
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FunctionTree({ functions, selectedId, onSelect, fileName }) {
  return (
    <div className="function-tree">
      <div className="tree-header">
        <span className="tree-header-label">Funksjoner</span>
        {fileName && <span className="tree-header-file">{fileName}</span>}
      </div>
      <div className="tree-body">
        {functions.length === 0 && (
          <p className="tree-empty">Ingen funksjoner funnet.</p>
        )}
        {functions.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

export default FunctionTree;
```

- [ ] **Steg 2: Commit**

```bash
git add frontend/src/components/rflp/FunctionTree.jsx
git commit -m "feat: add FunctionTree component"
```

---

## Task 5: DetailPanel-komponent

**Files:**
- Create: `frontend/src/components/rflp/DetailPanel.jsx`

- [ ] **Steg 1: Opprett `frontend/src/components/rflp/DetailPanel.jsx`**

```jsx
import { useState } from 'react';

function SectionBlock({ title, rows }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="detail-section">
      <button className="section-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="section-title">{title} ({rows.length})</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="section-body">
          {rows.map((row, i) => (
            <div key={i} className="section-row">
              {Object.entries(row)
                .filter(([key]) => key !== 'functionId' && key.toLowerCase() !== 'functionid')
                .map(([key, val]) => (
                  <div key={key} className="row-field">
                    <span className="field-label">{key}</span>
                    <span className="field-value">{String(val ?? '')}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ func, sections }) {
  if (!func) {
    return (
      <div className="detail-panel detail-empty">
        <p>Velg en funksjon i treet til venstre.</p>
      </div>
    );
  }

  const relatedSections = Object.entries(sections)
    .map(([title, rows]) => ({
      title,
      rows: rows.filter((r) => r.functionId === func.id),
    }))
    .filter(({ rows }) => rows.length > 0);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <p className="detail-id">{func.id}</p>
        <h2 className="detail-name">{func.name}</h2>
      </div>

      {Object.keys(func.metadata).length > 0 && (
        <div className="detail-metadata">
          {Object.entries(func.metadata).map(([key, val]) => (
            <div key={key} className="meta-row">
              <span className="field-label">{key}</span>
              <span className="field-value">{String(val ?? '')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="detail-sections">
        {relatedSections.length === 0 && (
          <p className="no-data">Ingen tilknyttede data for denne funksjonen.</p>
        )}
        {relatedSections.map(({ title, rows }) => (
          <SectionBlock key={title} title={title} rows={rows} />
        ))}
      </div>
    </div>
  );
}

export default DetailPanel;
```

- [ ] **Steg 2: Commit**

```bash
git add frontend/src/components/rflp/DetailPanel.jsx
git commit -m "feat: add DetailPanel component"
```

---

## Task 6: RflpViewer-side og CSS

**Files:**
- Create: `frontend/src/pages/RflpViewer.jsx`
- Create: `frontend/src/pages/RflpViewer.css`

- [ ] **Steg 1: Opprett `frontend/src/pages/RflpViewer.css`**

```css
/* ── Upload-side ───────────────────────────────── */
.upload-page {
  min-height: 100vh;
  background: #1a1a1a;
  color: #f5f3f0;
  font-family: 'Source Sans 3', Calibri, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
}

.upload-header {
  text-align: center;
  margin-bottom: 48px;
}

.upload-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #c97a1a;
  margin-bottom: 12px;
}

.upload-page h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #f5f3f0;
}

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 48px 64px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  max-width: 480px;
  width: 100%;
}

.upload-zone:hover {
  border-color: #c97a1a;
  background: rgba(201, 122, 26, 0.04);
}

.upload-icon {
  font-size: 2.5rem;
  color: #5e5c57;
  margin-bottom: 12px;
}

.upload-label {
  font-size: 16px;
  font-weight: 600;
  color: #f5f3f0;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 13px;
  color: #8a8a8a;
}

.upload-error {
  margin-top: 16px;
  color: #f87171;
  font-size: 14px;
}

/* ── Viewer-layout ─────────────────────────────── */
.rflp-viewer {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
  color: #f5f3f0;
  font-family: 'Source Sans 3', Calibri, sans-serif;
  overflow: hidden;
}

.rflp-tree-panel {
  width: 25%;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rflp-detail-panel {
  flex: 1;
  overflow-y: auto;
}

/* ── Loading / Error ───────────────────────────── */
.rflp-loading,
.rflp-error {
  min-height: 100vh;
  background: #1a1a1a;
  color: #f5f3f0;
  font-family: 'Source Sans 3', Calibri, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.rflp-error p {
  color: #f87171;
  font-size: 16px;
}

.rflp-error button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f5f3f0;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.15s;
}

.rflp-error button:hover {
  border-color: #c97a1a;
}

/* ── Funksjonstre ──────────────────────────────── */
.function-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tree-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.tree-header-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c97a1a;
}

.tree-header-file {
  display: block;
  font-size: 11px;
  color: #5e5c57;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-body {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.tree-empty {
  padding: 16px;
  font-size: 13px;
  color: #5e5c57;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 8px;
  cursor: pointer;
  transition: background 0.1s;
}

.tree-node:hover {
  background: #242424;
}

.tree-node.selected {
  background: rgba(201, 122, 26, 0.1);
  border-left: 2px solid #c97a1a;
}

.tree-expand {
  background: none;
  border: none;
  color: #5e5c57;
  font-size: 9px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  width: 16px;
  flex-shrink: 0;
}

.tree-label {
  background: none;
  border: none;
  color: #c8c5bf;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  padding: 3px 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node.selected .tree-label {
  color: #f5f3f0;
}

/* ── Detaljpanel ───────────────────────────────── */
.detail-panel {
  padding: 32px 40px 64px;
  min-height: 100%;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5e5c57;
  font-size: 14px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.detail-id {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c97a1a;
  margin-bottom: 8px;
}

.detail-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: #f5f3f0;
}

.detail-metadata {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
}

.meta-row {
  display: flex;
  gap: 16px;
  font-size: 13px;
  line-height: 1.5;
}

.field-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: #5e5c57;
  min-width: 140px;
  flex-shrink: 0;
  padding-top: 1px;
}

.field-value {
  color: #c8c5bf;
  flex: 1;
}

/* ── Seksjoner ─────────────────────────────────── */
.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-data {
  font-size: 14px;
  color: #5e5c57;
}

.detail-section {
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  overflow: hidden;
}

.section-toggle {
  width: 100%;
  background: #1e1e1e;
  border: none;
  color: #f5f3f0;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  transition: background 0.15s;
}

.section-toggle:hover {
  background: #242424;
}

.section-title {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c97a1a;
}

.chevron {
  font-size: 18px;
  color: #5e5c57;
  transition: transform 0.2s;
  display: inline-block;
}

.chevron.open {
  transform: rotate(90deg);
}

.section-body {
  padding: 8px 0;
  background: #1a1a1a;
}

.section-row {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-row:last-child {
  border-bottom: none;
}

.row-field {
  display: flex;
  gap: 16px;
  font-size: 13px;
}
```

- [ ] **Steg 2: Opprett `frontend/src/pages/RflpViewer.jsx`**

```jsx
import { useState } from 'react';
import { useRflpData } from '../hooks/useRflpData';
import FileUpload from '../components/rflp/FileUpload';
import FunctionTree from '../components/rflp/FunctionTree';
import DetailPanel from '../components/rflp/DetailPanel';
import './RflpViewer.css';

function findFunction(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findFunction(node.children, id);
    if (found) return found;
  }
  return null;
}

function RflpViewer() {
  const [file, setFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { functions, sections, loading, error } = useRflpData(file);

  if (!file) {
    return <FileUpload onLoad={setFile} />;
  }

  if (loading) {
    return (
      <div className="rflp-loading">
        <p>Leser Excel-fil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rflp-error">
        <p>{error}</p>
        <button onClick={() => { setFile(null); setSelectedId(null); }}>
          Last opp annen fil
        </button>
      </div>
    );
  }

  const selectedFunc = selectedId ? findFunction(functions, selectedId) : null;

  return (
    <div className="rflp-viewer">
      <div className="rflp-tree-panel">
        <FunctionTree
          functions={functions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          fileName={file?.name}
        />
      </div>
      <div className="rflp-detail-panel">
        <DetailPanel func={selectedFunc} sections={sections} />
      </div>
    </div>
  );
}

export default RflpViewer;
```

- [ ] **Steg 3: Verifiser i nettleseren**

Gå til `http://localhost:5173`. Sjekk:
- Forsiden viser tre verktøykort inkludert «RFLP Viewer»
- Klikk «RFLP Viewer» → upload-siden vises
- Last opp en `.xlsx`/`.xlsm` RFLP-fil
- Funksjonstre vises til venstre med hierarki
- Klikk på en funksjon → detaljpanelet viser metadata og seksjoner
- Seksjoner er kollapsbare
- Seksjoner uten data for valgt funksjon vises ikke

- [ ] **Steg 4: Commit**

```bash
git add frontend/src/pages/RflpViewer.jsx frontend/src/pages/RflpViewer.css
git commit -m "feat: add RflpViewer page and CSS"
```
