const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: "invalid" });
async function run() {
  try {
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'سلام',
    });
  } catch (e) {
    console.log("Is Error:", e instanceof Error);
    console.log("Keys:", Object.keys(e));
    console.log("Message:", e.message);
  }
}
run();
