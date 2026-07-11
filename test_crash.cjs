const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ 
    apiKey: "AIzaSy_dummy", 
    httpOptions: { baseUrl: "https://invalid.domain.that.does.not.exist.com" } 
});
async function run() {
  try {
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'سلام',
    });
    console.log(res.text);
  } catch (e) {
    console.error("ERROR CAUGHT:", e.message);
  }
}
run();
