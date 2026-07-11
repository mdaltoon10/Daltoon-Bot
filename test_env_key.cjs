const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hi'
}).then(res => console.log(res.text)).catch(e => console.log("Caught:", e.message));
