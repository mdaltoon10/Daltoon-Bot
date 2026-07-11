const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const stateInjection = `
  const [isBotRunning, setIsBotRunning] = useState(true);
  const [isBotStatusLoading, setIsBotStatusLoading] = useState(false);
  const [botActionLoading, setBotActionLoading] = useState(false);

  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        setIsBotStatusLoading(true);
        const res = await fetch("/api/system/bot/status");
        if (res.ok) {
          const data = await res.json();
          setIsBotRunning(data.isRunning);
        }
      } catch (err) {
        console.error("Error fetching bot status", err);
      } finally {
        setIsBotStatusLoading(false);
      }
    };
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBotAction = async (action) => {
    try {
      setBotActionLoading(true);
      const res = await fetch("/api/system/bot/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setIsBotRunning(action === 'start' || action === 'restart');
      }
    } catch (err) {
      console.error(\`Error performing action \${action}\`, err);
    } finally {
      setTimeout(() => setBotActionLoading(false), 2000);
    }
  };

  const currency = settings?.currency || (translateText("Toman", "تومان", lang));
`;

code = code.replace(
  '  const currency = settings?.currency || (translateText("Toman", "تومان", lang));',
  stateInjection
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
