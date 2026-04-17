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
