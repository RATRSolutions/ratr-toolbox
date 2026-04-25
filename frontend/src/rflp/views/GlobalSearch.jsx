import './GlobalSearch.css';

function highlight(text, query) {
  if (!text || !query) return text;
  const idx = String(text).toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const str = String(text);
  return (
    <>
      {str.slice(0, idx)}
      <mark className="search-highlight">{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  );
}

function getStr(row, key) {
  const found = Object.keys(row).find((k) => k.toLowerCase().replace(/\s+/g, '') === key);
  return found ? String(row[found] ?? '') : '';
}

function ResultSection({ title, count, children }) {
  if (count === 0) return null;
  return (
    <div className="search-section">
      <div className="search-section-header">
        <span className="search-section-title">{title}</span>
        <span className="search-section-count">{count}</span>
      </div>
      {children}
    </div>
  );
}

export default function GlobalSearch({ results, query, onNavigateToFunction, onSelectRequirement }) {
  const total =
    results.functions.length +
    results.requirements.length +
    results.conceptDecisions.length +
    results.contextDescriptions.length;

  if (total === 0) {
    return (
      <div className="search-results-empty">
        <p>Ingen treff for <strong>"{query}"</strong></p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <span className="search-results-summary">{total} treff for &ldquo;{query}&rdquo;</span>
      </div>

      <ResultSection title="Funksjoner" count={results.functions.length}>
        {results.functions.map((fn) => (
          <button
            key={fn.id}
            className="search-result-item"
            onClick={() => onNavigateToFunction(fn.id)}
          >
            <span className="search-result-id">{highlight(fn.id, query)}</span>
            <span className="search-result-main">{highlight(fn.name, query)}</span>
          </button>
        ))}
      </ResultSection>

      <ResultSection title="Krav" count={results.requirements.length}>
        {results.requirements.map((req, i) => {
          const id = getStr(req, 'requirementid');
          const text = getStr(req, 'requirement');
          const funcId = getStr(req, 'functionid');
          const sourceType = getStr(req, 'sourcetype');
          return (
            <button
              key={id || i}
              className="search-result-item"
              onClick={() => onSelectRequirement(req)}
            >
              <span className="search-result-id">{highlight(id, query)}</span>
              {funcId && <span className="search-result-badge">{funcId}</span>}
              {sourceType && <span className="search-result-badge">{sourceType}</span>}
              <span className="search-result-main">{highlight(text, query)}</span>
            </button>
          );
        })}
      </ResultSection>

      <ResultSection title="Konseptbeslutninger" count={results.conceptDecisions.length}>
        {results.conceptDecisions.map((cd, i) => {
          const id = getStr(cd, 'conceptdecisionid');
          const funcId = getStr(cd, 'functionid');
          const concept = getStr(cd, 'selectedconcept') || getStr(cd, 'concept') || getStr(cd, 'name');
          const rationale = getStr(cd, 'rationale') || getStr(cd, 'description');
          return (
            <button
              key={id || i}
              className="search-result-item"
              onClick={() => funcId && onNavigateToFunction(funcId, 'concept')}
            >
              <span className="search-result-id">{highlight(id, query)}</span>
              {funcId && <span className="search-result-badge">{funcId}</span>}
              {concept && <span className="search-result-main">{highlight(concept, query)}</span>}
              {rationale && (
                <span className="search-result-sub">{highlight(rationale, query)}</span>
              )}
            </button>
          );
        })}
      </ResultSection>

      <ResultSection title="Kontekstbeskrivelser" count={results.contextDescriptions.length}>
        {results.contextDescriptions.map((ctx, i) => {
          const funcId = getStr(ctx, 'functionid');
          const ctxType = getStr(ctx, 'contexttype') || getStr(ctx, 'type');
          const desc = getStr(ctx, 'description') || getStr(ctx, 'contextdescription');
          return (
            <button
              key={i}
              className="search-result-item"
              onClick={() => funcId && onNavigateToFunction(funcId, 'context')}
            >
              {funcId && <span className="search-result-id">{funcId}</span>}
              {ctxType && <span className="search-result-badge">{highlight(ctxType, query)}</span>}
              {desc && <span className="search-result-main">{highlight(desc, query)}</span>}
            </button>
          );
        })}
      </ResultSection>
    </div>
  );
}
