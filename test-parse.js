// test-parse.js
const fs = require('fs');
let pdfPkg = require('pdf-parse');

// handle different export shapes (v2 may export default)
const pdf = (typeof pdfPkg === 'function') ? pdfPkg : (pdfPkg && pdfPkg.default) ? pdfPkg.default : null;

if (!pdf) {
  console.error('pdf-parse export not a function. pdfPkg keys:', Object.keys(pdfPkg || {}));
  process.exit(1);
}

const filePath = './kavay.pdf';

try {
  const d = fs.readFileSync(filePath);
  pdf(d).then(data => {
    console.log('node test: parsed text length =', (data.text || '').length);
    console.log('node test: first 300 chars:\n', (data.text || '').slice(0,300));
  }).catch(err => {
    console.error('node test parse error:', err);
  });
} catch (err) {
  console.error('node test read error:', err);
}
