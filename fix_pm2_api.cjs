const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
app.get("/api/system/bot/status", (req, res) => {
  exec("pm2 jlist", (err, stdout, stderr) => {
    if (err) {
      return res.json({ status: "unknown", isRunning: true }); // Fallback
    }
    try {
      const pm2list = JSON.parse(stdout);
      const botProcess = pm2list.find((p) => p.name === "daltoon-bot");
      if (botProcess) {
        return res.json({ status: botProcess.pm2_env.status, isRunning: botProcess.pm2_env.status === "online" });
      }
      return res.json({ status: "not_found", isRunning: false });
    } catch (e) {
      return res.json({ status: "unknown", isRunning: true });
    }
  });
});

app.post("/api/system/bot/action", (req, res) => {
  const { action } = req.body;
  if (!["start", "stop", "restart"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }
  exec(\`pm2 \${action} daltoon-bot\`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: \`Action \${action} executed\` });
  });
});

// 9. System auto-update endpoints
`;

code = code.replace('// 9. System auto-update endpoints', newEndpoints);
fs.writeFileSync('server.ts', code);
