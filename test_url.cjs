const { GoogleGenAI } = require('@google/genai');
try {
const ai = new GoogleGenAI({ apiKey: "AIzaSy_dummy", httpOptions: { baseUrl: "htp:/malformed" } });
ai.models.generateContent({ model: "gemini-2.5-flash", contents: "test" }).catch(e => console.log("Catch:", e.message));
} catch(e) {
  console.log("Sync catch:", e.message);
}
