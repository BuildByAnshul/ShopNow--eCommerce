import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractLocalPdfText(pdfBuffer) {
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Page ke saare text fragments ko join karein
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return {
        totalPages: pdf.numPages,
        text: fullText
    };
}

// ==================== CHALANE KA TARIKA ====================

// Apni PDF file ka naam yahan likhein (jo isi folder me honi chahiye)
const fileName = 'ANSHUL_RESUME.pdf';
const pdfPath = path.resolve(__dirname, fileName);

try {
    if (!fs.existsSync(pdfPath)) {
        console.error(`Error: File '${fileName}' nahi mili! Kripya ise isi folder me copy karein.`);
        process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    console.log("PDF parse ho rahi hai, kripya intezar karein...\n");

    extractLocalPdfText(pdfBuffer)
        .then(result => {
            console.log(`=== Parsing Complete ===`);
            console.log(`Total Pages: ${result.totalPages}\n`);
            console.log(result.text);
        })
        .catch(err => {
            console.error("Parsing ke dauran error aayi:", err);
        });

} catch (error) {
    console.error("File read karne me error:", error);
}
