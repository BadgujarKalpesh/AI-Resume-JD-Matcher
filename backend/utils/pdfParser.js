const fs = require('fs');
const pdfParse = require('pdf-parse');

async function parseResume(file) {
    if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }
    return fs.readFileSync(file.path, 'utf8');
}

module.exports = { parseResume };
