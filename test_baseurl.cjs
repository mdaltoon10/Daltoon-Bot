const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY, 
    httpOptions: { baseUrl: "https://generativelanguage.googleapis.com" } 
});
async function run() {
  try {
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'سلام',
    });
    console.log(res.text);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
