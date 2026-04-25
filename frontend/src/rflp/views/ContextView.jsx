import { useMemo } from 'react';
import './ContextView.css';

function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

function getField(row, key) {
  const k = Object.keys(row).find((k) => nk(k) === key);
  return k != null && row[k] != null ? String(row[k]) : '';
}

const CTX_SHOWN = new Set(['contextid', 'functionid', 'contextdescription', 'contexttype']);

function buildFuncIndex(tree) {
  const ids = [];
  const names = {};
  function dfs(nodes) {
    nodes.forEach((n) => {
      ids.push(n.id);
      names[n.id] = n.name;
      dfs(n.children);
    });
  }
  dfs(tree);
  return { ids, names };
}

export default function ContextView({ model, selectedFunctionId, onNavigateToFunction }) {
  const allCtx = useMemo(() => model.getAllContextDescriptions(), [model]);
  const tree = useMemo(() => model.getFunctionTree(), [model]);

  const { orderedFuncIds, funcNames } = useMemo(() => {
    const { ids, names } = buildFuncIndex(tree);
    return {
      orderedFuncIds: ids.filter((id) => allCtx[id]?.length > 0 && (!selectedFunctionId || id === selectedFunctionId)),
      funcNames: names,
    };
  }, [tree, allCtx, model, selectedFunctionId]);

  if (orderedFuncIds.length === 0) {
    return (
      <div className="ctxv-empty">Ingen kontekstbeskrivelser funnet i datasettet.</div>
    );
  }

  return (
    <div className="ctxv-view">
      <div className="ctxv-header">
        <span className="ctxv-count">
          {orderedFuncIds.length} funksjon{orderedFuncIds.length !== 1 ? 'er' : ''} med kontekstbeskrivelser
          {selectedFunctionId && ` (${selectedFunctionId})`}
        </span>
      </div>
      <div className="ctxv-cards">
        {orderedFuncIds.map((funcId) => {
          const rows = allCtx[funcId];
          const funcName = funcNames[funcId] || funcId;

          return (
            <div key={funcId} className="ctxv-card">
              <div className="ctxv-card-header">
                <button
                  className="ctxv-func-link"
                  onClick={() => onNavigateToFunction(funcId)}
                  title="Åpne i Funksjonsoversikt"
                >
                  <span className="ctxv-func-id">{funcId}</span>
                  <span className="ctxv-func-name">{funcName}</span>
                </button>
              </div>

              <div className="ctxv-entries">
                {rows.map((row, i) => {
                  const ctxId = getField(row, 'contextid') || String(i);
                  const desc = getField(row, 'contextdescription');
                  const ctxType = getField(row, 'contexttype');

                  const extraChips = Object.entries(row).filter(
                    ([k]) => !CTX_SHOWN.has(nk(k))
                  );

                  return (
                    <div key={ctxId} className="ctxv-entry">
                      {ctxType && (
                        <span className="ctxv-type-badge">{ctxType}</span>
                      )}
                      {desc && <div className="ctxv-desc">{desc}</div>}
                      <div className="meta-chips">
                        <span className="meta-chip">
                          <span className="meta-chip-key">ContextID:</span>
                          {ctxId}
                        </span>
                        {extraChips.map(([key, val]) => (
                          <span key={key} className="meta-chip">
                            <span className="meta-chip-key">{key}:</span>
                            {String(val ?? '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
