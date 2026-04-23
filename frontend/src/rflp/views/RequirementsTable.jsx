import { useState, useMemo } from 'react';
import './RequirementsTable.css';

function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

function getField(row, key) {
  const k = Object.keys(row).find((k) => nk(k) === key);
  return k != null && row[k] != null ? String(row[k]) : '';
}

const SOURCE_COLORS = {
  internal:   { bg: 'rgba(107,159,212,0.15)', text: '#6b9fd4', border: 'rgba(107,159,212,0.3)' },
  context:    { bg: 'rgba(143,168,200,0.15)', text: '#8fa8c8', border: 'rgba(143,168,200,0.3)' },
  regulatory: { bg: 'rgba(232,168,74,0.15)',  text: '#e8a84a', border: 'rgba(232,168,74,0.3)'  },
  hse:        { bg: 'rgba(232,112,112,0.15)', text: '#e87070', border: 'rgba(232,112,112,0.3)' },
  customer:   { bg: 'rgba(126,200,138,0.15)', text: '#7ec88a', border: 'rgba(126,200,138,0.3)' },
  concept:    { bg: 'rgba(176,126,200,0.15)', text: '#b07ec8', border: 'rgba(176,126,200,0.3)' },
};

function SourceBadge({ value }) {
  if (!value) return <span className="req-badge req-badge-empty">—</span>;
  const c = SOURCE_COLORS[value.toLowerCase()] ?? { bg: 'rgba(255,255,255,0.06)', text: '#8a8a8a', border: 'rgba(255,255,255,0.12)' };
  return (
    <span className="req-badge" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {value}
    </span>
  );
}

function toggleSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

const COLUMNS = [
  { key: 'requirementid',       label: 'ID',                  mono: true  },
  { key: 'functionid',          label: 'Funksjon',            mono: true  },
  { key: 'sourcetype',          label: 'Kildetype',           badge: true },
  { key: 'requirement',         label: 'Krav',                wide: true  },
  { key: 'requirementcategory', label: 'Kategori',                        },
  { key: 'verificationmethod',  label: 'Verifikasjonsmetode',             },
  { key: 'parentid',            label: 'Foreldre-ID',         mono: true  },
  { key: 'status',              label: 'Status',                          },
];

export default function RequirementsTable({ model }) {
  const allReqs = useMemo(() => model.getAllRequirements(), [model]);

  const sourceTypes  = useMemo(() => unique(allReqs.map((r) => getField(r, 'sourcetype'))),          [allReqs]);
  const categories   = useMemo(() => unique(allReqs.map((r) => getField(r, 'requirementcategory'))), [allReqs]);
  const statuses     = useMemo(() => unique(allReqs.map((r) => getField(r, 'status'))),              [allReqs]);
  const functionIds  = useMemo(() => unique(allReqs.map((r) => getField(r, 'functionid'))),          [allReqs]);

  const [selSourceTypes, setSelSourceTypes]   = useState(new Set());
  const [selCategories,  setSelCategories]    = useState(new Set());
  const [selFunctionId,  setSelFunctionId]    = useState('');
  const [selStatus,      setSelStatus]        = useState('');
  const [search,         setSearch]           = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReqs.filter((req) => {
      if (selSourceTypes.size > 0 && !selSourceTypes.has(getField(req, 'sourcetype'))) return false;
      if (selCategories.size  > 0 && !selCategories.has(getField(req, 'requirementcategory'))) return false;
      if (selFunctionId && getField(req, 'functionid') !== selFunctionId) return false;
      if (selStatus     && getField(req, 'status')     !== selStatus)     return false;
      if (q) {
        const haystack = COLUMNS.map(({ key }) => getField(req, key)).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allReqs, selSourceTypes, selCategories, selFunctionId, selStatus, search]);

  const hasFilters = selSourceTypes.size > 0 || selCategories.size > 0 || selFunctionId || selStatus || search;

  function clearAll() {
    setSelSourceTypes(new Set());
    setSelCategories(new Set());
    setSelFunctionId('');
    setSelStatus('');
    setSearch('');
  }

  return (
    <div className="req-view">
      <div className="req-toolbar">
        <input
          type="text"
          className="req-search"
          placeholder="Søk i alle felt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="req-filter-row">
          <div className="req-filter-group">
            <span className="req-filter-label">Kildetype</span>
            <div className="req-chips">
              {sourceTypes.map((st) => {
                const active = selSourceTypes.has(st);
                const c = SOURCE_COLORS[st.toLowerCase()];
                return (
                  <button
                    key={st}
                    className={`req-chip${active ? ' active' : ''}`}
                    style={active && c ? { borderColor: c.border, color: c.text, background: c.bg } : {}}
                    onClick={() => setSelSourceTypes(toggleSet(selSourceTypes, st))}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="req-filter-group">
            <span className="req-filter-label">Kategori</span>
            <div className="req-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`req-chip${selCategories.has(cat) ? ' active' : ''}`}
                  onClick={() => setSelCategories(toggleSet(selCategories, cat))}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="req-filter-selects">
            <select
              className="req-select"
              value={selFunctionId}
              onChange={(e) => setSelFunctionId(e.target.value)}
            >
              <option value="">Alle funksjoner</option>
              {functionIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>

            <select
              className="req-select"
              value={selStatus}
              onChange={(e) => setSelStatus(e.target.value)}
            >
              <option value="">Alle statuser</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {hasFilters && (
              <button className="req-clear-btn" onClick={clearAll}>
                Nullstill
              </button>
            )}
          </div>
        </div>

        <div className="req-count">
          {filtered.length} av {allReqs.length} krav
        </div>
      </div>

      <div className="req-table-wrapper">
        {filtered.length === 0 ? (
          <div className="req-empty">Ingen krav matcher filteret.</div>
        ) : (
          <table className="req-table">
            <thead>
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => {
                const rid = getField(req, 'requirementid') || String(i);
                return (
                  <tr key={rid}>
                    {COLUMNS.map(({ key, mono, badge }) => {
                      const val = getField(req, key);
                      return (
                        <td key={key} className={mono ? 'mono' : badge ? 'badge-cell' : ''}>
                          {badge ? <SourceBadge value={val} /> : (val || <span className="req-empty-cell">—</span>)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
