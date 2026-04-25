import { useRef, useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './TraceabilityMatrix.css';

const LABEL_W  = 280;
const COL_W    = 40;
const ROW_H    = 34;
const SECTION_H = 28;
const SEP_H    = 8;
const HEADER_H = 160;

const SOURCE_COLORS = {
  internal:   '#6b9fd4',
  context:    '#8fa8c8',
  regulatory: '#e8a84a',
  hse:        '#e87070',
  customer:   '#7ec88a',
  concept:    '#b07ec8',
};

function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

function getField(row, key) {
  const k = Object.keys(row).find((k) => nk(k) === key);
  return k != null && row[k] != null ? String(row[k]) : '';
}

function flattenFunctions(nodes, result = []) {
  nodes.forEach((n) => {
    result.push(n);
    flattenFunctions(n.children, result);
  });
  return result;
}

function ReqDetailPanel({ req, onClose }) {
  const fields = [
    { key: 'requirementid',       label: 'ID' },
    { key: 'functionid',          label: 'Funksjon' },
    { key: 'sourcetype',          label: 'Kildetype' },
    { key: 'requirement',         label: 'Krav' },
    { key: 'requirementcategory', label: 'Kategori' },
    { key: 'verificationmethod',  label: 'Verifikasjonsmetode' },
    { key: 'status',              label: 'Status' },
  ];
  return (
    <div className="tm-side-panel">
      <div className="tm-side-header">
        <span className="tm-side-title">Kravdetalj</span>
        <button className="tm-side-close" onClick={onClose} title="Lukk">×</button>
      </div>
      <dl className="tm-side-dl">
        {fields.map(({ key, label }) => {
          const val = getField(req, key);
          if (!val) return null;
          const dot = key === 'sourcetype' ? SOURCE_COLORS[val.toLowerCase()] : null;
          return (
            <div key={key} className="tm-side-row">
              <dt>{label}</dt>
              <dd>
                {dot && <span className="tm-side-dot" style={{ color: dot }}>● </span>}
                {val}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default function TraceabilityMatrix({ model, selectedFunctionId, onNavigateToFunction }) {
  const bodyRef   = useRef(null);
  const headerRef = useRef(null);
  const [selectedReq, setSelectedReq]       = useState(null);
  const [selSourceTypes, setSelSourceTypes] = useState(new Set());

  // ── Data ──────────────────────────────────────────────────────────────

  const functions      = useMemo(() => flattenFunctions(model.getFunctionTree()), [model]);
  const allRequirements = useMemo(() => model.getAllRequirements(), [model]);

  const funcIdSet = useMemo(() => new Set(functions.map((f) => f.id)), [functions]);

  const leafFuncIds = useMemo(
    () => new Set(functions.filter((f) => f.children.length === 0).map((f) => f.id)),
    [functions]
  );

  // Direct requirement count per function (only valid allocations)
  const reqCountByFuncId = useMemo(() => {
    const m = new Map();
    allRequirements.forEach((req) => {
      const fid = getField(req, 'functionid');
      if (fid && funcIdSet.has(fid)) m.set(fid, (m.get(fid) ?? 0) + 1);
    });
    return m;
  }, [allRequirements, funcIdSet]);

  // Split requirements into three buckets
  const { orphanReqs, invalidReqs, validReqs } = useMemo(() => {
    const orphan = [], invalid = [], valid = [];
    allRequirements.forEach((req) => {
      const fid = getField(req, 'functionid');
      if (!fid)                   orphan.push(req);
      else if (!funcIdSet.has(fid)) invalid.push(req);
      else                          valid.push(req);
    });
    return { orphanReqs: orphan, invalidReqs: invalid, validReqs: valid };
  }, [allRequirements, funcIdSet]);

  const allSourceTypes = useMemo(() => {
    const types = new Set();
    validReqs.forEach((req) => {
      const st = getField(req, 'sourcetype');
      if (st) types.add(st);
    });
    return [...types].sort();
  }, [validReqs]);

  const filteredReqs = useMemo(() => {
    if (selSourceTypes.size === 0) return validReqs;
    return validReqs.filter((req) => selSourceTypes.has(getField(req, 'sourcetype')));
  }, [validReqs, selSourceTypes]);

  // O(1) cell lookup — built from ALL requirements (not just filtered)
  const linkedSet = useMemo(() => {
    const s = new Set();
    allRequirements.forEach((req) => {
      const rid = getField(req, 'requirementid');
      const fid = getField(req, 'functionid');
      if (rid && fid) s.add(`${rid}::${fid}`);
    });
    return s;
  }, [allRequirements]);

  // ── Flat row list for virtualizer ─────────────────────────────────────

  const allRows = useMemo(() => {
    const rows = [];
    const unallocated = orphanReqs.length + invalidReqs.length;
    if (unallocated > 0) {
      rows.push({ type: 'section-header', id: '__orphan-header__', count: unallocated });
      orphanReqs.forEach((req) =>
        rows.push({ type: 'orphan', req, id: `o-${getField(req, 'requirementid')}` })
      );
      invalidReqs.forEach((req) =>
        rows.push({ type: 'invalid', req, id: `i-${getField(req, 'requirementid')}` })
      );
      if (filteredReqs.length > 0) rows.push({ type: 'separator', id: '__sep__' });
    }
    filteredReqs.forEach((req) =>
      rows.push({ type: 'req', req, id: getField(req, 'requirementid') })
    );
    return rows;
  }, [orphanReqs, invalidReqs, filteredReqs]);

  // ── Virtualizers ──────────────────────────────────────────────────────

  const onBodyScroll = useCallback((e) => {
    if (headerRef.current) headerRef.current.scrollLeft = e.target.scrollLeft;
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => bodyRef.current,
    estimateSize: (i) => {
      const t = allRows[i]?.type;
      if (t === 'section-header') return SECTION_H;
      if (t === 'separator')      return SEP_H;
      return ROW_H;
    },
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    count: functions.length,
    horizontal: true,
    getScrollElement: () => bodyRef.current,
    estimateSize: () => COL_W,
    overscan: 3,
  });

  const totalW        = LABEL_W + columnVirtualizer.getTotalSize();
  const totalOrphans  = orphanReqs.length + invalidReqs.length;

  function toggleSourceType(st) {
    setSelSourceTypes((prev) => {
      const next = new Set(prev);
      if (next.has(st)) next.delete(st); else next.add(st);
      return next;
    });
  }

  if (allRequirements.length === 0 || functions.length === 0) {
    return (
      <div className="tm-empty">
        Ingen data å vise. Last opp en Excel-fil med funksjoner og krav.
      </div>
    );
  }

  return (
    <div className="tm-outer">

      {/* ── Filter toolbar ─────────────────────────────────────────────── */}
      <div className="tm-toolbar">
        {allSourceTypes.length > 0 && (
          <>
            <span className="tm-toolbar-label">Kildetype</span>
            <div className="tm-chips">
              {allSourceTypes.map((st) => {
                const active = selSourceTypes.has(st);
                const color  = SOURCE_COLORS[st.toLowerCase()];
                return (
                  <button
                    key={st}
                    className={`tm-chip${active ? ' active' : ''}`}
                    style={active && color
                      ? { borderColor: color, color, background: `${color}22` }
                      : {}}
                    onClick={() => toggleSourceType(st)}
                  >
                    {color && <span style={{ color }}>● </span>}
                    {st}
                  </button>
                );
              })}
            </div>
            {selSourceTypes.size > 0 && (
              <button className="tm-chip-clear" onClick={() => setSelSourceTypes(new Set())}>
                Nullstill
              </button>
            )}
            <div className="tm-toolbar-divider" />
          </>
        )}
        <span className="tm-row-count">
          {filteredReqs.length} av {validReqs.length} krav
        </span>
        {totalOrphans > 0 && (
          <span className="tm-orphan-badge" title="Krav uten gyldig funksjonskoblng">
            ⚠ {totalOrphans} uallokerte
          </span>
        )}
      </div>

      {/* ── Matrix + side panel ────────────────────────────────────────── */}
      <div className="tm-wrapper">
        <div className="tm-matrix">

          {/* Header */}
          <div ref={headerRef} className="tm-header-scroll">
            <div style={{ display: 'flex', width: totalW, height: HEADER_H }}>

              <div className="tm-corner-cell" style={{ width: LABEL_W, minWidth: LABEL_W }}>
                <span className="tm-corner-label">Krav / Funksjon</span>
                <span className="tm-corner-count">
                  {filteredReqs.length} krav · {functions.length} funksjoner
                  {totalOrphans > 0 && (
                    <span className="tm-corner-orphan"> · ⚠ {totalOrphans} uallokerte</span>
                  )}
                </span>
              </div>

              <div style={{ position: 'relative', width: columnVirtualizer.getTotalSize(), height: HEADER_H, flexShrink: 0 }}>
                {columnVirtualizer.getVirtualItems().map((vcol) => {
                  const func      = functions[vcol.index];
                  const isLeaf    = leafFuncIds.has(func.id);
                  const count     = reqCountByFuncId.get(func.id) ?? 0;
                  const isSelected = func.id === selectedFunctionId;
                  const noReqs    = isLeaf && count === 0;
                  return (
                    <div
                      key={vcol.key}
                      className={[
                        'tm-col-header',
                        isLeaf ? 'leaf' : 'parent',
                        isSelected ? 'selected' : '',
                        noReqs ? 'no-reqs' : '',
                      ].filter(Boolean).join(' ')}
                      style={{ position: 'absolute', left: vcol.start, width: vcol.size, height: HEADER_H }}
                      onClick={() => onNavigateToFunction(func.id)}
                      title={[
                        `${func.id} – ${func.name}`,
                        !isLeaf ? '(foreldrenode)' : '',
                        noReqs ? '⚠ Ingen krav allokert' : `${count} krav`,
                      ].filter(Boolean).join(' · ')}
                    >
                      {!isLeaf && <span className="tm-col-parent-mark">⊕</span>}
                      <span className="tm-col-count">
                        {count > 0 ? count : (isLeaf ? <span className="tm-col-count-zero">–</span> : null)}
                      </span>
                      <span className="tm-col-label">{func.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body */}
          <div ref={bodyRef} className="tm-body-scroll" onScroll={onBodyScroll}>
            <div style={{ position: 'relative', width: totalW, height: rowVirtualizer.getTotalSize() }}>
              {rowVirtualizer.getVirtualItems().map((vrow) => {
                const row       = allRows[vrow.index];
                const baseStyle = { position: 'absolute', top: vrow.start, left: 0, width: totalW };

                if (row.type === 'section-header') {
                  return (
                    <div key={vrow.key} className="tm-section-header" style={{ ...baseStyle, height: SECTION_H }}>
                      ⚠ Uallokerte krav ({row.count})
                    </div>
                  );
                }

                if (row.type === 'separator') {
                  return <div key={vrow.key} className="tm-separator" style={{ ...baseStyle, height: SEP_H }} />;
                }

                const req        = row.req;
                const reqId      = getField(req, 'requirementid');
                const reqText    = getField(req, 'requirement');
                const srcKey     = getField(req, 'sourcetype').toLowerCase();
                const dotColor   = SOURCE_COLORS[srcKey] ?? '#666';
                const isSelected = selectedReq && getField(selectedReq, 'requirementid') === reqId;
                const isOrphan   = row.type === 'orphan';
                const isInvalid  = row.type === 'invalid';
                const invalidFid = isInvalid ? getField(req, 'functionid') : null;

                return (
                  <div
                    key={vrow.key}
                    className={[
                      'tm-row',
                      isSelected ? 'selected' : '',
                      isOrphan   ? 'orphan'   : '',
                      isInvalid  ? 'invalid'  : '',
                      vrow.index % 2 === 0 ? '' : 'odd',
                    ].filter(Boolean).join(' ')}
                    style={{ ...baseStyle, height: ROW_H, display: 'flex' }}
                    onClick={() => setSelectedReq(isSelected ? null : req)}
                  >
                    <div
                      className="tm-req-label"
                      style={{ width: LABEL_W, minWidth: LABEL_W }}
                      title={isInvalid
                        ? `FunctionID "${invalidFid}" finnes ikke i funksjonstreet`
                        : `${reqId}: ${reqText}`}
                    >
                      {(isOrphan || isInvalid) && (
                        <span
                          className="tm-req-warn"
                          title={isInvalid ? `Ugyldig FunctionID: ${invalidFid}` : 'Ingen FunctionID satt'}
                        >⚠</span>
                      )}
                      <span className="tm-req-id">{reqId}</span>
                      <span className="tm-req-text">{reqText}</span>
                    </div>

                    <div style={{ position: 'relative', width: columnVirtualizer.getTotalSize(), height: ROW_H, flexShrink: 0 }}>
                      {!isOrphan && columnVirtualizer.getVirtualItems().map((vcol) => {
                        const func   = functions[vcol.index];
                        const linked = linkedSet.has(`${reqId}::${func.id}`);
                        const colSel = func.id === selectedFunctionId;
                        return (
                          <div
                            key={vcol.key}
                            className={`tm-cell${colSel ? ' col-selected' : ''}`}
                            style={{ position: 'absolute', left: vcol.start, width: vcol.size, height: ROW_H }}
                          >
                            {linked && <span className="tm-dot" style={{ color: dotColor }}>●</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedReq && (
          <ReqDetailPanel req={selectedReq} onClose={() => setSelectedReq(null)} />
        )}
      </div>
    </div>
  );
}
