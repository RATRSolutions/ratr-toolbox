import { useState, useEffect } from 'react';
import { readExcelFile } from '../rflp/adapter/excelAdapter';
import { buildDataModel } from '../rflp/model/dataModel';
import FileUpload from '../components/rflp/FileUpload';
import FunctionTree from '../rflp/views/FunctionTree';
import DetailPanel from '../rflp/views/DetailPanel';
import RequirementsTable from '../rflp/views/RequirementsTable';
import './RflpViewer.css';

const TABS = [
  { id: 'functions', label: 'Funksjonsoversikt', enabled: true },
  { id: 'requirements', label: 'Kravspesifikasjon', enabled: true },
  { id: 'traceability', label: 'Traceability', enabled: false },
  { id: 'concept', label: 'Konseptbegrunnelse', enabled: false },
  { id: 'context', label: 'Kontekst', enabled: false },
];

function RflpViewer() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('functions');

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

  if (!file) {
    return <FileUpload onLoad={setFile} />;
  }

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

  return (
    <div className="rflp-viewer">
      <nav className="rflp-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rflp-tab${activeTab === tab.id ? ' active' : ''}${!tab.enabled ? ' disabled' : ''}`}
            onClick={() => tab.enabled && setActiveTab(tab.id)}
            disabled={!tab.enabled}
            title={!tab.enabled ? 'Ikke implementert ennå' : undefined}
          >
            {tab.label}
          </button>
        ))}
        <div className="rflp-tab-spacer" />
        <button
          className="rflp-tab-file-reset"
          onClick={() => { setFile(null); setSelectedId(null); }}
          title="Last opp ny fil"
        >
          {file?.name}
        </button>
      </nav>

      {activeTab === 'functions' && (
        <div className="rflp-view-content">
          <div className="rflp-tree-panel">
            <FunctionTree
              functions={functions}
              selectedId={selectedId}
              onSelect={setSelectedId}
              fileName={file?.name}
            />
          </div>
          <div className="rflp-detail-panel">
            <DetailPanel
              func={selectedFunc}
              ancestorPath={ancestorPath}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="rflp-full-panel">
          <RequirementsTable model={model} />
        </div>
      )}
    </div>
  );
}

export default RflpViewer;
