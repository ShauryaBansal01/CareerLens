const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'resumeController.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove GoogleGenAI and callGeminiWithRetry
code = code.replace(/const \{ GoogleGenAI \} = require\('@google\/genai'\);\n\nconst ai = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\n\nconst sleep = \(ms\) => new Promise\(resolve => setTimeout\(resolve, ms\)\);\n\nconst callGeminiWithRetry = async \(params, maxRetries = 4\) => \{[\s\S]*?\};\n/, '');

// 2. Update uploadResume extraction
code = code.replace(/const response = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: ([\s\S]*?),[\s\S]*?config: \{ responseMimeType: "application\/json" \}\n      \}\);/, 'const response = await req.ai.generateJSON($1);');
code = code.replace(/const parsedData = JSON\.parse\(response\.text\);/, 'const parsedData = response.data;');
code = code.replace(/console\.error\("Gemini Extraction Error:", aiError\);/, 'console.error("AI Extraction Error:", aiError);');

// 3. Update uploadResume latex
code = code.replace(/const latexResponse = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: latexPrompt\n        \}\);/, 'const latexResponse = await req.ai.generateText(latexPrompt);');
code = code.replace(/console\.error\("Gemini Latex Generation Error:", err\);/, 'console.error("AI Latex Generation Error:", err);');

// 4. Update improveResume
code = code.replace(/const response = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: prompt,[\s\S]*?config: \{ responseMimeType: "application\/json" \}\n    \}\);/, 'const response = await req.ai.generateJSON(prompt);');
code = code.replace(/const feedback = JSON\.parse\(response\.text\);/, 'const feedback = response.data;');

// 5. Update optimizeForCompany (note: uses ai.models.generateContent directly in original)
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: prompt,[\s\S]*?config: \{ responseMimeType: "application\/json" \}\n    \}\);/, 'const response = await req.ai.generateJSON(prompt);');
code = code.replace(/const optimization = JSON\.parse\(response\.text\);/, 'const optimization = response.data;');

// 6. Update generateLatexTemplate
code = code.replace(/const response = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: prompt\n    \}\);/, 'const response = await req.ai.generateText(prompt);');

// 7. Update tailorLatexToJob
code = code.replace(/const response = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: prompt\n    \}\);/, 'const response = await req.ai.generateText(prompt);');

// 8. Update generateCoverLetter
code = code.replace(/const response = await callGeminiWithRetry\(\{[\s\S]*?model: 'gemini-2\.5-flash',[\s\S]*?contents: prompt\n    \}\);/, 'const response = await req.ai.generateText(prompt);');

fs.writeFileSync(filePath, code);
console.log('Successfully refactored resumeController.js');
