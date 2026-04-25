import { useState, useEffect, useMemo } from 'react';
import { readExcelFile } from '../rflp/adapter/excelAdapter';
import { buildDataModel } from '../rflp/model/dataModel';
import FileUpload from '../components/rflp/FileUpload';
import FunctionTree from '../rflp/views/FunctionTree';
import DetailPanel from '../rflp/views/DetailPanel';
import RequirementsTable from '../rflp/views/RequirementsTable';
import ConceptRationale from '../rflp/views/ConceptRationale';
import ContextView from '../rflp/views/ContextView';
import TraceabilityMatrix from '../rflp/views/TraceabilityMatrix';
import GlobalSearch from '../rflp/views/GlobalSearch';
import './RflpViewer.css';

const TABS = [
  { id: 'functions',    label: 'Funksjonsoversikt',  enabled: true },
  { id: 'requirements', label: 'Kravspesifikasjon',   enabled: true },
  { id: 'traceability', label: 'Traceability',         enabled: true },
  { id: 'concept',      label: 'Konseptbegrunnelse',  enabled: true },
  { id: 'context',      label: 'Kontekst',             enabled: true },
];

function RflpViewer() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('functions');
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setModel(null);
    setSelectedId(null);

    readExcelFile(file)
      .then((sheets) => {
        if (!cancelled) setModel(buildDataModel(sheets));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [file]);

  useEffect(() => {
    const before = () => { document.title = ''; };
    const after = () => { document.title = 'Verktøykasse – ratr solutions'; };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!model || !searchQuery.trim()) return null;
    return model.search(searchQuery);
  }, [model, searchQuery]);

  if (!file) return <FileUpload onLoad={setFile} />;

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

  if (!model) return null;

  const functions = model.getFunctionTree();
  const selectedFunc = selectedId ? model.getFunction(selectedId) : null;
  const ancestorPath = selectedId ? model.getAncestorPath(selectedId) : [];

  function navigateToFunction(funcId, tab = 'functions') {
    setSelectedId(funcId);
    setActiveTab(tab);
    setSearchQuery('');
  }

  function handleSelectRequirement(req) {
    const funcIdKey = Object.keys(req).find((k) => k.toLowerCase().replace(/\s+/g, '') === 'functionid');
    if (funcIdKey) setSelectedId(req[funcIdKey]);
    setActiveTab('requirements');
    setSearchQuery('');
  }

  return (
    <div className="rflp-viewer">
      <nav className="rflp-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rflp-tab${activeTab === tab.id && !searchQuery ? ' active' : ''}${!tab.enabled ? ' disabled' : ''}`}
            onClick={() => { tab.enabled && setActiveTab(tab.id); setSearchQuery(''); }}
            disabled={!tab.enabled}
            title={!tab.enabled ? 'Ikke implementert ennå' : undefined}
          >
            {tab.label}
          </button>
        ))}
        <div className="rflp-tab-spacer" />
        <div className="rflp-search-wrapper">
          <span className="rflp-search-icon">⌕</span>
          <input
            className="rflp-search-input"
            type="search"
            placeholder="Søk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Global søk"
          />
        </div>
        <button
          className="rflp-print-btn"
          onClick={() => window.print()}
          title="Skriv ut / eksporter"
        >
          Skriv ut
        </button>
        <button
          className="rflp-tab-file-reset"
          onClick={() => { setFile(null); setSelectedId(null); setSearchQuery(''); }}
          title="Last opp ny fil"
        >
          {file?.name}
        </button>
      </nav>

      <div className="rflp-main">
        <div className={`rflp-tree-panel${treeCollapsed ? ' collapsed' : ''}`}>
          <div className="rflp-tree-panel-inner">
            {selectedId && (
              <button
                className="rflp-clear-filter"
                onClick={() => setSelectedId(null)}
                title="Vis alle funksjoner"
              >
                × Vis alle
              </button>
            )}
            <FunctionTree
              functions={functions}
              selectedId={selectedId}
              onSelect={setSelectedId}
              fileName={file?.name}
            />
          </div>
          <button
            className="rflp-tree-collapse-btn"
            onClick={() => setTreeCollapsed((c) => !c)}
            title={treeCollapsed ? 'Vis funksjonstre' : 'Skjul funksjonstre'}
          >
            {treeCollapsed ? '›' : '‹'}
          </button>
        </div>

        <div className="rflp-content-panel">
          <div className="rflp-print-header">
            {searchResults
              ? `Søkeresultater: "${searchQuery}"`
              : TABS.find((t) => t.id === activeTab)?.label}
          </div>

          {searchResults ? (
            <GlobalSearch
              results={searchResults}
              query={searchQuery}
              onNavigateToFunction={navigateToFunction}
              onSelectRequirement={handleSelectRequirement}
            />
          ) : (
            <>
              {activeTab === 'functions' && (
                <div className="rflp-detail-panel">
                  <DetailPanel
                    func={selectedFunc}
                    ancestorPath={ancestorPath}
                    onSelect={setSelectedId}
                  />
                </div>
              )}

              {activeTab === 'requirements' && (
                <RequirementsTable model={model} selectedFunctionId={selectedId} />
              )}

              {activeTab === 'concept' && (
                <ConceptRationale
                  model={model}
                  selectedFunctionId={selectedId}
                  onNavigateToFunction={navigateToFunction}
                />
              )}

              {activeTab === 'context' && (
                <ContextView
                  model={model}
                  selectedFunctionId={selectedId}
                  onNavigateToFunction={navigateToFunction}
                />
              )}

              {activeTab === 'traceability' && (
                <TraceabilityMatrix
                  model={model}
                  selectedFunctionId={selectedId}
                  onNavigateToFunction={navigateToFunction}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RflpViewer;
