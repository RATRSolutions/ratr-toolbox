import { useState } from 'react';

function nk(k) {
  return k.toLowerCase().replace(/\s+/g, '');
}

function findCol(row, normalizedName) {
  return Object.keys(row).find((k) => nk(k) === normalizedName) ?? null;
}

function findVal(row, normalizedName) {
  const col = findCol(row, normalizedName);
  return col ? row[col] : null;
}

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
      {intentValue && <div className="functional-intent">{intentValue}</div>}
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
            <button key={child.id} className="subfunction-item" onClick={() => onSelect?.(child.id)}>
              <span className="node-id-tag">{child.id}</span>
              <span>{child.name || child.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubItemFields({ row, excludeKeys = [] }) {
  const excluded = new Set(excludeKeys.map(nk));
  const entries = Object.entries(row).filter(([k]) => !excluded.has(nk(k)));
  return (
    <div className="cd-sub-item-fields">
      {entries.map(([key, val]) => (
        <div key={key} className="row-field">
          <span className="field-label">{key}</span>
          <span className="field-value">{String(val ?? '')}</span>
        </div>
      ))}
    </div>
  );
}

function ConceptDecisionsBlock({ funcId, sections, linkedSheets }) {
  const [open, setOpen] = useState(false);

  const allocRows = sections['FunctionConceptAllocation'] ?? [];
  const cdRows = linkedSheets['ConceptDecisions'] ?? [];
  const leRows = linkedSheets['LogicalElements'] ?? [];
  const peRows = linkedSheets['PhysicalElements'] ?? [];

  const cdIdColInAlloc = allocRows.length
    ? Object.keys(allocRows[0]).find((k) => nk(k) !== 'functionid' && k !== 'functionId') ?? null
    : null;

  const cdIds = new Set(
    allocRows
      .filter((r) => r.functionId === funcId)
      .map((r) => (cdIdColInAlloc ? String(r[cdIdColInAlloc] ?? '') : ''))
      .filter(Boolean)
  );

  if (cdIds.size === 0) return null;

  const matchingCDs = cdRows.filter((cd) => {
    const idCol = findCol(cd, 'conceptdecisionid') ?? findCol(cd, 'id');
    return idCol && cdIds.has(String(cd[idCol] ?? ''));
  });

  if (matchingCDs.length === 0) return null;

  return (
    <div className="detail-section">
      <button className="section-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="section-title">Konseptbeslutninger ({matchingCDs.length})</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="section-body">
          {matchingCDs.map((cd, i) => {
            const cdIdCol = findCol(cd, 'conceptdecisionid') ?? findCol(cd, 'id');
            const cdId = cdIdCol ? String(cd[cdIdCol] ?? '') : String(i);
            const cdName = findVal(cd, 'name') ?? findVal(cd, 'conceptdecisionname') ?? cdId;
            const cdDesc = findVal(cd, 'description') ?? findVal(cd, 'descriptiontext') ?? null;

            const otherFields = Object.entries(cd).filter(([k]) => {
              const norm = nk(k);
              return !['conceptdecisionid', 'id', 'name', 'conceptdecisionname',
                        'description', 'descriptiontext'].includes(norm);
            });

            const matchingLEs = leRows.filter((le) => {
              const fk = findCol(le, 'conceptdecisionid');
              return fk && String(le[fk] ?? '') === cdId;
            });

            return (
              <div key={cdId || i} className="cd-entry">
                <div className="cd-name">{cdName}</div>
                {cdDesc && <div className="cd-description">{cdDesc}</div>}
                {otherFields.length > 0 && (
                  <div className="meta-chips" style={{ marginBottom: 10 }}>
                    {otherFields.map(([key, val]) => (
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
                        const leIdCol =
                          findCol(le, 'logicalelementid') ??
                          findCol(le, 'logicalid') ??
                          findCol(le, 'id');
                        const leId = leIdCol ? String(le[leIdCol] ?? '') : String(j);

                        const matchingPEs = peRows.filter((pe) => {
                          const peFk =
                            findCol(pe, 'logicalelementid') ?? findCol(pe, 'logicalid');
                          return peFk && String(pe[peFk] ?? '') === leId;
                        });

                        return (
                          <div key={leId || j} className="cd-sub-item">
                            <SubItemFields row={le} excludeKeys={['conceptdecisionid']} />
                            {matchingPEs.length > 0 && (
                              <div className="cd-sub-section" style={{ marginTop: 8 }}>
                                <div className="cd-sublabel">
                                  Fysiske Elementer ({matchingPEs.length})
                                </div>
                                <div className="cd-sub-items">
                                  {matchingPEs.map((pe, m) => (
                                    <div
                                      key={Object.values(pe).join('|') || m}
                                      className="cd-sub-item"
                                      style={{ background: '#2a2a2a' }}
                                    >
                                      <SubItemFields
                                        row={pe}
                                        excludeKeys={['logicalelementid', 'logicalid']}
                                      />
                                    </div>
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

const SKIP_SECTIONS = new Set(['functionconceptallocation', 'requirements', 'contextdescription']);

function DetailPanel({ func, sections = {}, linkedSheets = {}, onSelect }) {
  if (!func) {
    return (
      <div className="detail-panel detail-empty">
        <p>Velg en funksjon i treet til venstre.</p>
      </div>
    );
  }

  const reqRows = (sections['Requirements'] ?? []).filter((r) => r.functionId === func.id);
  const ctxRows = (sections['ContextDescription'] ?? []).filter((r) => r.functionId === func.id);

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
        <ConceptDecisionsBlock funcId={func.id} sections={sections} linkedSheets={linkedSheets} />
        {reqRows.length > 0 && <SectionBlock title="Krav" rows={reqRows} />}
        {ctxRows.length > 0 && <SectionBlock title="Kontekstbeskrivelser" rows={ctxRows} />}
        {otherSections.map(({ title, rows }) => (
          <SectionBlock key={title} title={title} rows={rows} />
        ))}
      </div>
    </div>
  );
}

export default DetailPanel;
