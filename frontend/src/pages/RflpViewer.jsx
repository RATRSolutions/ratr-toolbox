import { useState } from 'react';
import { useRflpData } from '../hooks/useRflpData';
import FileUpload from '../components/rflp/FileUpload';
import FunctionTree from '../components/rflp/FunctionTree';
import DetailPanel from '../components/rflp/DetailPanel';
import './RflpViewer.css';

function findFunction(nodes, id) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findFunction(node.children, id);
    if (found) return found;
  }
  return null;
}

function RflpViewer() {
  const [file, setFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { functions, sections, linkedSheets, loading, error } = useRflpData(file);

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

  const selectedFunc = selectedId ? findFunction(functions, selectedId) : null;

  return (
    <div className="rflp-viewer">
      <div className="rflp-tree-panel">
        <FunctionTree
          functions={functions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          fileName={file?.name}
        />
      </div>
      <div className="rflp-detail-panel">
        <DetailPanel func={selectedFunc} sections={sections} linkedSheets={linkedSheets} />
      </div>
    </div>
  );
}

export default RflpViewer;
