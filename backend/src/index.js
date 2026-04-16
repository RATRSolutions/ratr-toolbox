const express = require('express');
const mdToDocxRouter = require('./routes/md-to-docx');

const app = express();
const PORT = 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/md-to-docx', mdToDocxRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
