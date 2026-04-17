import { useState } from 'react';

function nk(k) {
  return k.toLowerCase().replace(/\s+/g, '');
}

function findCol(row, normalizedName) {
  return Object.keys(row).find((k) => nk(k) === normalizedName) ?? null;
}

function FieldList({ row, excludeKeys = [] }) {
  const excluded = new Set(excludeKeys.map(nk));
  const entries = Object.entries(row).filter(([k]) => !excluded.has(nk(k)));
  return (
    <div className="detail-metadata" style={{ marginBottom: 0 }}>
      {entries.map(([key, val]) => (
        <div key={key} className="meta-row">
          <span className="field-label">{key}</span>
          <span className="field-value">{String(val ?? '')}</span>
        </div>
      ))}
    </div>
  );
}

function ConceptDecisionsSection({ funcId, sections, linkedSheets }) {
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

  const count = matchingCDs.length;

  return (
    <div className="detail-section">
      <button className="section-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="section-title">ConceptDecisions ({count})</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && (
        <div className="section-body">
          {matchingCDs.map((cd, i) => {
            const cdIdCol = findCol(cd, 'conceptdecisionid') ?? findCol(cd, 'id');
            const cdId = cdIdCol ? String(cd[cdIdCol] ?? '') : String(i);

            const matchingLEs = leRows.filter((le) => {
              const leIdFk = findCol(le, 'conceptdecisionid');
              return leIdFk && String(le[leIdFk] ?? '') === cdId;
            });

            return (
              <div key={cdId || i} className="section-row" style={{ gap: 0 }}>
                <FieldList row={cd} />
                {matchingLEs.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="cd-sublabel">Logiske Elementer</div>
                    {matchingLEs.map((le, j) => {
                      const leIdCol =
                        findCol(le, 'logicalelementid') ??
                        findCol(le, 'logicalid') ??
                        findCol(le, 'id');
                      const leId = leIdCol ? String(le[leIdCol] ?? '') : String(j);

                      const matchingPEs = peRows.filter((pe) => {
                        const peFk = findCol(pe, 'logicalelementid') ?? findCol(pe, 'logicalid');
                        return peFk && String(pe[peFk] ?? '') === leId;
                      });

                      return (
                        <div key={leId || j} style={{ marginBottom: 8 }}>
                          <FieldList row={le} excludeKeys={['conceptdecisionid']} />
                          {matchingPEs.length > 0 && (
                            <div style={{ marginTop: 6 }}>
                              <div className="cd-sublabel">Fysiske Elementer</div>
                              {matchingPEs.map((pe, m) => {
                                const peKey = Object.values(pe).join('|') || String(m);
                                return (
                                  <FieldList
                                    key={peKey}
                                    row={pe}
                                    excludeKeys={['logicalelementid', 'logicalid']}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  .filter(([key]) => key !== 'functionId' && key.toLowerCase() !== 'functionid')
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

const HIDDEN_SECTIONS = new Set(['functionconceptallocation']);

function DetailPanel({ func, sections = {}, linkedSheets = {} }) {
  if (!func) {
    return (
      <div className="detail-panel detail-empty">
        <p>Velg en funksjon i treet til venstre.</p>
      </div>
    );
  }

  const relatedSections = Object.entries(sections)
    .filter(([title]) => !HIDDEN_SECTIONS.has(title.toLowerCase().replace(/\s+/g, '')))
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

      {func.metadata && Object.keys(func.metadata).length > 0 && (
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
        <ConceptDecisionsSection
          funcId={func.id}
          sections={sections}
          linkedSheets={linkedSheets}
        />
        {relatedSections.map(({ title, rows }) => (
          <SectionBlock key={title} title={title} rows={rows} />
        ))}
        {relatedSections.length === 0 &&
          !sections['FunctionConceptAllocation']?.some((r) => r.functionId === func.id) && (
            <p className="no-data">Ingen tilknyttede data for denne funksjonen.</p>
          )}
      </div>
    </div>
  );
}

export default DetailPanel;
