const fs = require('fs');
const pdfParse = require('pdf-parse');

(async () => {
  try {
    const buffer = fs.readFileSync('../vite-job/package.json'); // not a pdf, will fail. We need a real PDF to test.
    console.log('Test file created.');
  } catch (e) {
    console.error(e);
  }
})();
