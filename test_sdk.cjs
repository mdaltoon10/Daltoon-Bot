const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ 
    apiKey: "dummy", 
    httpOptions: { baseUrl: "https://generativelanguage.googleapis.com" } 
});
ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hi'
}).then(console.log).catch(e => console.log("Caught:", e.message));
