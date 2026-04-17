import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

function nk(k) {
  return k.toLowerCase().replace(/\s+/g, '');
}

function findCol(row, normalizedName) {
  return Object.keys(row).find((k) => nk(k) === normalizedName) ?? null;
}

function findVal(row, normalizedName) {
  const col = findCol(row, normalizedName);
  return col != null ? row[col] : null;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

const EXCLUDED_META = new Set([
  'functionpath', 'owner', 'effectivefrom', 'effectiveto', 'iscurrent',
]);

function MetadataBlock({ metadata }) {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const intentKey = Object.keys(metadata).find((k) => nk(k) === 'functionalintent');
  const intentValue = intentKey ? metadata[intentKey] : null;

  const chips = Object.entries(metadata).filter(([k]) => {
    const norm = nk(k);
    return norm !== 'functionalintent' && !EXCLUDED_META.has(norm);
  });

  if (!intentValue && chips.length === 0) return null;

  return (
    <div className="detail-metadata-block">
      {intentValue && (
        <>
          <div className="meta-section-label">Funksjonell Intent</div>
          <div className="functional-intent">{intentValue}</div>
        </>
      )}
      {chips.length > 0 && (
        <div className="meta-chips">
          {chips.map(([key, val]) => (
            <span key={key} className="meta-chip">
              <span className="meta-chip-key">{key}:</span>
              {String(val ?? '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Underfunksjoner ────────────────────────────────────────────────────────────

function SubfunctionsBlock({ children, onSelect }) {
  const [open, setOpen] = useState(false);
  if (!children || children.length === 0) return null;

  return (
    <div className="detail-section">
      <button className="section-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="section-title">Underfunksjoner ({children.length})</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="section-body">
          {children.map((child) => (
            <button
              key={child.id}
              className="subfunction-item"
              onClick={() => onSelect?.(child.id)}
            >
              <span className="node-id-tag">{child.id}</span>
              <span>{child.name || child.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Konseptbeslutninger ────────────────────────────────────────────────────────

const CD_SKIP = new Set([
  'conceptdecisionid', 'selectedconceptoptionid', 'selectedconceptname',
  'selectedconceptdescription',
]);
const LE_SKIP = new Set([
  'logicalid', 'conceptdecisionid', 'logicalname', 'description',
  'parentid', 'owner', 'createddate', 'effectivefrom', 'effectiveto', 'iscurrent',
]);
const PE_SKIP = new Set([
  'physicalid', 'logicalid', 'physicalname', 'description',
  'parentid', 'owner', 'createddate', 'effectivefrom', 'effectiveto', 'iscurrent',
]);

function ElementCard({ row, nameKey, skipKeys, indent = false }) {
  const name = findVal(row, nameKey);
  const desc = findVal(row, 'description');
  const chips = Object.entries(row).filter(([k]) => !skipKeys.has(nk(k)));

  return (
    <div className="cd-sub-item" style={indent ? { background: '#2a2a2a' } : {}}>
      {name && <div className="cd-name">{name}</div>}
      {desc && <div className="cd-description">{desc}</div>}
      {chips.length > 0 && (
        <div className="meta-chips">
          {chips.map(([key, val]) => (
            <span key={key} className="meta-chip">
              <span className="meta-chip-key">{key}:</span>
              {String(val ?? '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConceptDecisionsBlock({ funcId, sections, linkedSheets, isOpen, onToggle, blockRef, highlightId }) {
  const allocRows = sections['FunctionConceptAllocation'] ?? [];
  const cdRows = linkedSheets['ConceptDecisions'] ?? [];
  const leRows = linkedSheets['LogicalElements'] ?? [];
  const peRows = linkedSheets['PhysicalElements'] ?? [];

  const cdIdColInAlloc = allocRows.length
    ? Object.keys(allocRows[0]).find((k) => nk(k) !== 'functionid' && k !== 'functionId') ?? null
    : null;

  const cdIds = useMemo(() => new Set(
    allocRows
      .filter((r) => r.functionId === funcId)
      .map((r) => (cdIdColInAlloc ? String(r[cdIdColInAlloc] ?? '') : ''))
      .filter(Boolean)
  ), [allocRows, funcId, cdIdColInAlloc]);

  if (cdIds.size === 0) return null;

  const matchingCDs = cdRows.filter((cd) => {
    const idCol = findCol(cd, 'conceptdecisionid');
    return idCol && cdIds.has(String(cd[idCol] ?? ''));
  });

  if (matchingCDs.length === 0) return null;

  return (
    <div className="detail-section" ref={blockRef}>
      <button className="section-toggle" onClick={onToggle}>
        <span className="section-title">Konseptbeslutninger ({matchingCDs.length})</span>
        <span className={`chevron${isOpen ? ' open' : ''}`}>›</span>
      </button>
      {isOpen && (
        <div className="section-body">
          {matchingCDs.map((cd, i) => {
            const cdIdCol = findCol(cd, 'conceptdecisionid');
            const cdId = cdIdCol ? String(cd[cdIdCol] ?? '') : String(i);
            const cdName = findVal(cd, 'selectedconceptname') ?? cdId;
            const cdDesc = findVal(cd, 'selectedconceptdescription');
            const cdChips = Object.entries(cd).filter(([k]) => !CD_SKIP.has(nk(k)));

            const matchingLEs = leRows.filter((le) => {
              const fk = findCol(le, 'conceptdecisionid');
              return fk && String(le[fk] ?? '') === cdId;
            });

            return (
              <div
                key={cdId || i}
                className={`cd-entry${highlightId === cdId ? ' row-highlighted' : ''}`}
              >
                <div className="cd-name">{cdName}</div>
                {cdDesc && <div className="cd-description">{cdDesc}</div>}
                {cdChips.length > 0 && (
                  <div className="meta-chips" style={{ marginBottom: matchingLEs.length ? 12 : 0 }}>
                    {cdChips.map(([key, val]) => (
                      <span key={key} className="meta-chip">
                        <span className="meta-chip-key">{key}:</span>
                        {String(val ?? '')}
                      </span>
                    ))}
                  </div>
                )}
                {matchingLEs.length > 0 && (
                  <div className="cd-sub-section">
                    <div className="cd-sublabel">Logiske Elementer ({matchingLEs.length})</div>
                    <div className="cd-sub-items">
                      {matchingLEs.map((le, j) => {
                        const leId = String(findVal(le, 'logicalid') ?? j);
                        const matchingPEs = peRows.filter((pe) => {
                          const fk = findCol(pe, 'logicalid');
                          return fk && String(pe[fk] ?? '') === leId;
                        });
                        return (
                          <div key={leId}>
                            <ElementCard row={le} nameKey="logicalname" skipKeys={LE_SKIP} />
                            {matchingPEs.length > 0 && (
                              <div className="cd-sub-section" style={{ marginTop: 8, paddingLeft: 12 }}>
                                <div className="cd-sublabel">
                                  Fysiske Elementer ({matchingPEs.length})
                                </div>
                                <div className="cd-sub-items">
                                  {matchingPEs.map((pe, m) => (
                                    <ElementCard
                                      key={String(findVal(pe, 'physicalid') ?? m)}
                                      row={pe}
                                      nameKey="physicalname"
                                      skipKeys={PE_SKIP}
                                      indent
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Kontekstbeskrivelser ───────────────────────────────────────────────────────

function ContextDescriptionBlock({ rows, ctxToReqIds, onNavigate, isOpen, onToggle, blockRef, highlightId }) {
  if (!rows.length) return null;

  return (
    <div className="detail-section" ref={blockRef}>
      <button className="section-toggle" onClick={onToggle}>
        <span className="section-title">Kontekstbeskrivelser ({rows.length})</span>
        <span className={`chevron${isOpen ? ' open' : ''}`}>›</span>
      </button>
      {isOpen && (
        <div className="section-body">
          {rows.map((row, i) => {
            const ctxId = String(findVal(row, 'contextid') ?? i);
            const desc = findVal(row, 'contextdescription');
            const ctxType = findVal(row, 'contexttype');
            const linkedReqIds = ctxToReqIds[ctxId] ?? [];

            return (
              <div
                key={ctxId}
                className={`section-row${highlightId === ctxId ? ' row-highlighted' : ''}`}
                style={{ gap: 6 }}
              >
                {desc && <div className="compact-main-text">{desc}</div>}
                <div className="meta-chips">
                  <span className="meta-chip">
                    <span className="meta-chip-key">ContextID:</span>
                    {ctxId}
                  </span>
                  {ctxType && (
                    <span className="meta-chip">
                      <span className="meta-chip-key">ContextType:</span>
                      {ctxType}
                    </span>
                  )}
                  {linkedReqIds.length > 0 && (
                    <span className="meta-chip">
                      <span className="meta-chip-key">AssociatedRequirements:</span>
                      <button
                        className="source-link"
                        onClick={() => onNavigate('req', linkedReqIds[0])}
                      >
                        {linkedReqIds[0]}
                      </button>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Krav ──────────────────────────────────────────────────────────────────────

const REQ_LABEL_KEYS = new Set([
  'requirementid', 'sourcetype', 'requirementcategory', 'verificationmethod', 'status',
]);

function RequirementsBlock({ rows, onNavigate, isOpen, onToggle, blockRef, highlightId }) {
  const [filterSourceType, setFilterSourceType] = useState(null);

  const sourceTypes = useMemo(
    () => [...new Set(rows.map((r) => String(findVal(r, 'sourcetype') ?? '')).filter(Boolean))].sort(),
    [rows]
  );

  const filteredRows = filterSourceType
    ? rows.filter((r) => String(findVal(r, 'sourcetype') ?? '') === filterSourceType)
    : rows;

  if (!rows.length) return null;

  return (
    <div className="detail-section" ref={blockRef}>
      <button className="section-toggle" onClick={onToggle}>
        <span className="section-title">
          Krav ({filterSourceType ? `${filteredRows.length}/` : ''}{rows.length})
        </span>
        <span className={`chevron${isOpen ? ' open' : ''}`}>›</span>
      </button>
      {isOpen && sourceTypes.length > 1 && (
        <div className="section-filters">
          <button
            className={`tree-filter-btn${!filterSourceType ? ' active' : ''}`}
            onClick={() => setFilterSourceType(null)}
          >
            Alle
          </button>
          {sourceTypes.map((st) => (
            <button
              key={st}
              className={`tree-filter-btn${filterSourceType === st ? ' active' : ''}`}
              onClick={() => setFilterSourceType(filterSourceType === st ? null : st)}
            >
              {st}
            </button>
          ))}
        </div>
      )}
      {isOpen && (
        <div className="section-body">
          {filteredRows.map((row, i) => {
            const reqId = String(findVal(row, 'requirementid') ?? i);
            const req = findVal(row, 'requirement');
            const sourceType = String(findVal(row, 'sourcetype') ?? '');
            const sourceRef = String(findVal(row, 'sourceref') ?? '');

            const isContextLink = sourceType === 'Context' && sourceRef;
            const isConceptLink = sourceType === 'Concept' && sourceRef;

            return (
              <div
                key={reqId}
                className={`section-row${highlightId === reqId ? ' row-highlighted' : ''}`}
                style={{ gap: 6 }}
              >
                {req && <div className="compact-main-text">{req}</div>}
                <div className="meta-chips">
                  {Object.entries(row)
                    .filter(([k]) => REQ_LABEL_KEYS.has(nk(k)))
                    .map(([key, val]) => {
                      const norm = nk(key);
                      if (norm === 'sourcetype' && (isContextLink || isConceptLink)) {
                        return (
                          <span key={key} className="meta-chip">
                            <span className="meta-chip-key">{key}:</span>
                            <button
                              className="source-link"
                              onClick={() =>
                                onNavigate(isContextLink ? 'ctx' : 'cd', sourceRef)
                              }
                            >
                              {String(val ?? '')} → {sourceRef}
                            </button>
                          </span>
                        );
                      }
                      return (
                        <span key={key} className="meta-chip">
                          <span className="meta-chip-key">{key}:</span>
                          {String(val ?? '')}
                        </span>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Generisk seksjon (fallback) ────────────────────────────────────────────────

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
          {rows.map((row, i) => {
            const stableKey = Object.entries(row)
              .filter(([k]) => k !== 'functionId')
              .map(([, v]) => String(v ?? ''))
              .join('|') || String(i);
            return (
              <div key={stableKey} className="section-row">
                {Object.entries(row)
                  .filter(([key]) => key !== 'functionId' && nk(key) !== 'functionid')
                  .map(([key, val]) => (
                    <div key={key} className="row-field">
                      <span className="field-label">{key}</span>
                      <span className="field-value">{String(val ?? '')}</span>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Hoved ─────────────────────────────────────────────────────────────────────

const SKIP_SECTIONS = new Set([
  'functionconceptallocation', 'requirements', 'contextdescription',
]);

function DetailPanel({ func, sections = {}, linkedSheets = {}, onSelect }) {
  const [cdOpen, setCdOpen] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [highlightCdId, setHighlightCdId] = useState(null);
  const [highlightCtxId, setHighlightCtxId] = useState(null);
  const [highlightReqId, setHighlightReqId] = useState(null);

  const cdRef = useRef(null);
  const ctxRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    setCdOpen(false);
    setCtxOpen(false);
    setReqOpen(false);
    setHighlightCdId(null);
    setHighlightCtxId(null);
    setHighlightReqId(null);
  }, [func?.id]);

  const navigate = useCallback((type, id) => {
    const config = {
      cd:  { setOpen: setCdOpen,  setHL: setHighlightCdId,  ref: cdRef },
      ctx: { setOpen: setCtxOpen, setHL: setHighlightCtxId, ref: ctxRef },
      req: { setOpen: setReqOpen, setHL: setHighlightReqId, ref: reqRef },
    }[type];
    if (!config) return;
    config.setOpen(true);
    config.setHL(id);
    setTimeout(() => {
      config.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => config.setHL(null), 2500);
    }, 60);
  }, []);

  // All hooks must be called before any conditional return
  const reqRows = useMemo(
    () => func ? (sections['Requirements'] ?? []).filter((r) => r.functionId === func.id) : [],
    [func, sections]
  );
  const ctxRows = useMemo(
    () => func ? (sections['ContextDescription'] ?? []).filter((r) => r.functionId === func.id) : [],
    [func, sections]
  );
  const ctxToReqIds = useMemo(() => {
    const map = {};
    reqRows.forEach((req) => {
      const sourceType = String(findVal(req, 'sourcetype') ?? '');
      const sourceRef = String(findVal(req, 'sourceref') ?? '');
      const reqId = String(findVal(req, 'requirementid') ?? '');
      if (sourceType === 'Context' && sourceRef && reqId) {
        if (!map[sourceRef]) map[sourceRef] = [];
        map[sourceRef].push(reqId);
      }
    });
    return map;
  }, [reqRows]);

  if (!func) {
    return (
      <div className="detail-panel detail-empty">
        <p>Velg en funksjon i treet til venstre.</p>
      </div>
    );
  }

  const otherSections = Object.entries(sections)
    .filter(([title]) => !SKIP_SECTIONS.has(nk(title)))
    .map(([title, rows]) => ({ title, rows: rows.filter((r) => r.functionId === func.id) }))
    .filter(({ rows }) => rows.length > 0);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <p className="detail-id">{func.id}</p>
        <h2 className="detail-name">{func.name}</h2>
      </div>

      <MetadataBlock metadata={func.metadata} />

      <div className="detail-sections">
        <SubfunctionsBlock children={func.children} onSelect={onSelect} />
        <ConceptDecisionsBlock
          funcId={func.id}
          sections={sections}
          linkedSheets={linkedSheets}
          isOpen={cdOpen}
          onToggle={() => setCdOpen((o) => !o)}
          blockRef={cdRef}
          highlightId={highlightCdId}
        />
        <ContextDescriptionBlock
          rows={ctxRows}
          ctxToReqIds={ctxToReqIds}
          onNavigate={navigate}
          isOpen={ctxOpen}
          onToggle={() => setCtxOpen((o) => !o)}
          blockRef={ctxRef}
          highlightId={highlightCtxId}
        />
        <RequirementsBlock
          rows={reqRows}
          onNavigate={navigate}
          isOpen={reqOpen}
          onToggle={() => setReqOpen((o) => !o)}
          blockRef={reqRef}
          highlightId={highlightReqId}
        />
        {otherSections.map(({ title, rows }) => (
          <SectionBlock key={title} title={title} rows={rows} />
        ))}
      </div>
    </div>
  );
}

export default DetailPanel;
