import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Could not reach backend'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Verktøykasse</h1>
      <p>Backend status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;
