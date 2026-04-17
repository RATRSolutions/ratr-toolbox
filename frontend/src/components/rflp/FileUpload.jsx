import { useRef, useState } from 'react';

function FileUpload({ onLoad }) {
  const inputRef = useRef();
  const [formatError, setFormatError] = useState(null);

  function handleFile(file) {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xlsm)$/i)) {
      setFormatError('Kun .xlsx og .xlsm støttes.');
      return;
    }
    setFormatError(null);
    onLoad(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <p className="upload-eyebrow">ratr solutions</p>
        <h1>RFLP Viewer</h1>
      </div>
      <div
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="upload-icon">⊞</p>
        <p className="upload-label">Last opp RFLP-database</p>
        <p className="upload-hint">Dra og slipp .xlsx eller .xlsm her, eller klikk for å velge</p>
      </div>
      {formatError && <p className="upload-error">{formatError}</p>}
    </div>
  );
}

export default FileUpload;
