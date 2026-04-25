import { useMemo } from 'react';
import './ConceptRationale.css';

function nk(k) {
  return String(k).toLowerCase().replace(/\s+/g, '');
}

function getField(row, key) {
  const k = Object.keys(row).find((k) => nk(k) === key);
  return k != null && row[k] != null ? String(row[k]) : '';
}

const CD_HANDLED = new Set([
  'conceptdecisionid', 'selectedconceptoptionid', 'selectedconceptname',
  'selectedconceptdescription', 'functionid', 'documentref', 'notes',
]);

const CO_SHOWN = new Set([
  'conceptoptionname', 'optionname', 'name', 'description', 'optiondescription',
  'status', 'selectionrationale', 'rejectionreason', 'rationale',
]);
const CO_SKIP = new Set(['conceptoptionid', 'conceptdecisionid']);

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

function ConceptOption({ opt, selectedOptId, totalOptions }) {
  const optId = getField(opt, 'conceptoptionid');
  const name =
    getField(opt, 'conceptoptionname') ||
    getField(opt, 'optionname') ||
    getField(opt, 'name');
  const desc =
    getField(opt, 'description') ||
    getField(opt, 'optiondescription');
  const status = getField(opt, 'status');
  const rationale =
    getField(opt, 'selectionrationale') ||
    getField(opt, 'rejectionreason') ||
    getField(opt, 'rationale');

  const isSelected = selectedOptId
    ? optId === selectedOptId
    : !!(status && status.toLowerCase().includes('select'));
  const isRejected = !isSelected && (
    selectedOptId
      ? totalOptions > 1
      : !!(status && (
        status.toLowerCase().includes('reject') ||
        status.toLowerCase().includes('forkast')
      ))
  );

  const extraChips = Object.entries(opt).filter(
    ([k]) => !CO_SKIP.has(nk(k)) && !CO_SHOWN.has(nk(k)) && !k.startsWith('_')
  );

  return (
    <div className={`cr-option${isSelected ? ' cr-option-selected' : ''}${isRejected ? ' cr-option-rejected' : ''}`}>
      {name && <div className="cr-option-name">{name}</div>}
      {status && (
        <span className={`co-status-badge${isSelected ? ' selected' : ''}${isRejected ? ' rejected' : ''}`}>
          {status}
        </span>
      )}
      {desc && <div className="cr-option-desc">{desc}</div>}
      {rationale && (
        <div className="co-rationale">
          <span className="co-rationale-label">Begrunnelse: </span>
          {rationale}
        </div>
      )}
      {extraChips.length > 0 && (
        <div className="meta-chips" style={{ marginTop: 6 }}>
          {extraChips.map(([key, val]) => (
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

export default function ConceptRationale({ model, selectedFunctionId, onNavigateToFunction }) {
  const allCDs = useMemo(() => model.getAllConceptDecisions(), [model]);
  const tree = useMemo(() => model.getFunctionTree(), [model]);

  const { orderedFuncIds, funcNames } = useMemo(() => {
    const { ids, names } = buildFuncIndex(tree);
    return {
      orderedFuncIds: ids.filter((id) => allCDs[id]?.length > 0 && (!selectedFunctionId || id === selectedFunctionId)),
      funcNames: names,
    };
  }, [tree, allCDs, model, selectedFunctionId]);

  if (orderedFuncIds.length === 0) {
    return (
      <div className="cr-empty">Ingen konseptbeslutninger funnet i datasettet.</div>
    );
  }

  return (
    <div className="cr-view">
      <div className="cr-header">
        <span className="cr-count">
          {orderedFuncIds.length} funksjon{orderedFuncIds.length !== 1 ? 'er' : ''} med konseptbeslutninger
          {selectedFunctionId && ` (${selectedFunctionId})`}
        </span>
      </div>
      <div className="cr-cards">
        {orderedFuncIds.map((funcId) => {
          const decisions = allCDs[funcId];
          const funcName = funcNames[funcId] || funcId;

          return (
            <div key={funcId} className="cr-card">
              <div className="cr-card-header">
                <button
                  className="cr-func-link"
                  onClick={() => onNavigateToFunction(funcId)}
                  title="Åpne i Funksjonsoversikt"
                >
                  <span className="cr-func-id">{funcId}</span>
                  <span className="cr-func-name">{funcName}</span>
                </button>
              </div>

              <div className="cr-decisions">
                {decisions.map((cd, i) => {
                  const cdId = getField(cd, 'conceptdecisionid') || String(i);
                  const cdName = getField(cd, 'selectedconceptname') || cdId;
                  const cdDesc = getField(cd, 'selectedconceptdescription');
                  const docRef = getField(cd, 'documentref');
                  const notes = getField(cd, 'notes');
                  const selectedOptId = getField(cd, 'selectedconceptoptionid');

                  const chips = Object.entries(cd).filter(
                    ([k]) => !CD_HANDLED.has(nk(k)) && !k.startsWith('_')
                  );

                  return (
                    <div key={cdId} className="cr-decision">
                      <div className="cr-decision-name">{cdName}</div>
                      {cdDesc && <div className="cr-decision-desc">{cdDesc}</div>}

                      {(docRef || notes) && (
                        <div className="cr-doc-ref">
                          {docRef && (
                            <span>
                              <span className="cr-doc-label">Dokumentref:</span>
                              {docRef}
                            </span>
                          )}
                          {notes && (
                            <span style={{ marginLeft: docRef ? 16 : 0 }}>
                              <span className="cr-doc-label">Notater:</span>
                              {notes}
                            </span>
                          )}
                        </div>
                      )}

                      {chips.length > 0 && (
                        <div className="meta-chips" style={{ marginBottom: 10 }}>
                          {chips.map(([key, val]) => (
                            <span key={key} className="meta-chip">
                              <span className="meta-chip-key">{key}:</span>
                              {String(val ?? '')}
                            </span>
                          ))}
                        </div>
                      )}

                      {cd._options?.length > 0 && (
                        <div className="cr-options">
                          <div className="cr-options-label">
                            Konseptalternativer ({cd._options.length})
                          </div>
                          <div className="cr-options-list">
                            {cd._options.map((opt, j) => (
                              <ConceptOption
                                key={getField(opt, 'conceptoptionid') || String(j)}
                                opt={opt}
                                selectedOptId={selectedOptId}
                                totalOptions={cd._options.length}
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
          );
        })}
      </div>
    </div>
  );
}
