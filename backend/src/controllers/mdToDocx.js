const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPT_PATH = path.join(__dirname, '../scripts/md-to-docx.py');

function convertMdToDocx(req, res) {
  const mdFile = req.files?.md?.[0];
  const templateFile = req.files?.template?.[0];

  if (!mdFile || !templateFile) {
    return res.status(400).json({ error: 'Both md and template files are required' });
  }

  const outputPath = path.join(
    path.dirname(mdFile.path),
    `output-${Date.now()}.docx`
  );

  execFile(
    'python3',
    [SCRIPT_PATH, mdFile.path, templateFile.path, outputPath],
    (error, stdout, stderr) => {
      // Clean up uploaded files regardless of outcome
      fs.unlink(mdFile.path, () => {});
      fs.unlink(templateFile.path, () => {});

      if (error) {
        console.error('Conversion error:', stderr);
        return res.status(500).json({ error: stderr || 'Conversion failed' });
      }

      res.download(outputPath, 'converted.docx', (downloadErr) => {
        fs.unlink(outputPath, () => {});
        if (downloadErr) {
          console.error('Download error:', downloadErr);
        }
      });
    }
  );
}

module.exports = { convertMdToDocx };
