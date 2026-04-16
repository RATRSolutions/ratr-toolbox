import { useState } from 'react';

function MdToDocx() {
  const [mdFile, setMdFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleConvert(e) {
    e.preventDefault();
    if (!mdFile || !templateFile) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('md', mdFile);
    formData.append('template', templateFile);

    try {
      const res = await fetch('/api/md-to-docx', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus({ type: 'error', message: err.error || 'Conversion failed' });
        return;
      }

      // Trigger file download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.docx';
      a.click();
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'Conversion successful – file downloaded.' });
    } catch {
      setStatus({ type: 'error', message: 'Could not reach backend' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '480px' }}>
      <h1>md-to-docx</h1>
      <p>Convert a Markdown file to Word using a DOCX template.</p>

      <form onSubmit={handleConvert}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <div style={{ marginBottom: '0.25rem' }}>Markdown file (.md)</div>
            <input
              type="file"
              accept=".md"
              onChange={(e) => setMdFile(e.target.files[0])}
            />
          </label>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            <div style={{ marginBottom: '0.25rem' }}>Template (.docx)</div>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => setTemplateFile(e.target.files[0])}
            />
          </label>
        </div>

        <button type="submit" disabled={!mdFile || !templateFile || loading}>
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>

      {status && (
        <p style={{ marginTop: '1rem', color: status.type === 'error' ? 'red' : 'green' }}>
          {status.message}
        </p>
      )}
    </div>
  );
}

export default MdToDocx;
