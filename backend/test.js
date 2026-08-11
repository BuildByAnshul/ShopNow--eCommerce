const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/fill-form', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }
        const fields = req.body.fields ? JSON.parse(req.body.fields) : [];

        console.log("Step 1: Reading PDF file...");
        const dataBuffer = fs.readFileSync(req.file.path);

        console.log("Step 2: Extracting text from PDF using pdf-parse...");
        const data = await pdfParse(dataBuffer);
        const resumeText = data.text;

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        console.log("Step 3: Matching resume with form fields using Gemini...");
        const prompt = `
        Tumhe is candidate ke resume me se information extract karke diye gaye form fields me fill karna hai.
        
        [CANDIDATE RESUME]
        ${resumeText}
        
        [FORM FIELDS]
        ${JSON.stringify(fields, null, 2)}
        
        [RULES]
        1. Har form field ke liye, uski type aur label ke hisab se resume se best matching value dhoondo.
        2. Output STRICTLY ek valid JSON format me hona chahiye jisme key 'fieldId' aur value 'extractedValue' ho.
        3. Agar kisi field ke liye value nahi milti hai to uski value "" (empty string) rakho.
        4. Sirf JSON return karo, bina kisi markdown (jaise \`\`\`json) ya extra text ke.
        
        Example JSON Output:
        {
          "field_1690000000": "Anshul Vishwakarma",
          "field_1690000001": "anshulvishwakarma.se@gmail.com"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt
        });

        let jsonText = response.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }

        const parsedData = JSON.parse(jsonText);
        console.log("Extraction complete!");

        res.json(parsedData);

    } catch (error) {
        console.error("Error processing resume:", error);
        res.status(500).json({ error: 'Failed to process resume' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`AI Form Fill Server running on http://localhost:${PORT}`);
});