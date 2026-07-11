const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: 'سلام',
    });
    console.log(res.text);
  } catch (e) {
    console.error(e.message);
  }
}
run();
