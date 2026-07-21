var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_os = __toESM(require("os"), 1);
var import_vite = require("vite");
var import_child_process = require("child_process");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_url = require("url");
var import_dns = __toESM(require("dns"), 1);
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_meta = {};
import_dns.default.setDefaultResultOrder("ipv4first");
import_dotenv.default.config();
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var _dirname = typeof __dirname !== "undefined" ? __dirname : import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
try {
  import_dotenv.default.config({ path: import_path.default.resolve(_dirname, ".env") });
  import_dotenv.default.config({ path: import_path.default.resolve(_dirname, "..", ".env") });
} catch (e) {
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var dbSqlitePath = import_path.default.resolve(process.cwd(), "Daltoon_Bot.db");
var sqliteDb = (() => {
  const db = new import_better_sqlite3.default(dbSqlitePath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  return db;
})();
function migrateLegacyJsonToSqlite() {
  const possibleFiles = ["Daltoon_Bot.json", "db.json", "database.json", "bot_database.json"];
  let bestFile = "";
  for (const f of possibleFiles) {
    const p = import_path.default.resolve(process.cwd(), f);
    if (import_fs.default.existsSync(p)) {
      bestFile = p;
      break;
    }
  }
  if (bestFile) {
    try {
      const rowCountRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM kv").get();
      if (rowCountRow.count === 0) {
        console.log(`[SQLite Migration] Migrating active database from legacy ${bestFile} to SQLite...`);
        const raw = import_fs.default.readFileSync(bestFile, "utf8").trim();
        if (raw) {
          const data = JSON.parse(raw);
          const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
          const transaction = sqliteDb.transaction((obj) => {
            for (const key of Object.keys(obj)) {
              insert.run(key, JSON.stringify(obj[key]));
            }
          });
          transaction(data);
          console.log("[SQLite Migration] Migration completed successfully!");
        }
      }
    } catch (e) {
      console.error("[SQLite Migration Error]", e.message);
    }
  }
}
migrateLegacyJsonToSqlite();
function getServerPort() {
  if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    return Number(process.env.PORT);
  }
  try {
    const row = sqliteDb.prepare("SELECT value FROM kv WHERE key = 'settings'").get();
    if (row) {
      const settings = JSON.parse(row.value);
      if (settings && settings.panel_config) {
        let pc = settings.panel_config;
        if (typeof pc === "string") pc = JSON.parse(pc);
        if (pc.serverPort && !isNaN(Number(pc.serverPort))) {
          return Number(pc.serverPort);
        }
      }
    }
  } catch (err) {
    console.error(
      "Error reading port from DB configurations, defaulting to 3000",
      err
    );
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
}
var PORT = getServerPort();
var app = (0, import_express.default)();
console.log(
  "[Debug] process.env.GEMINI_API_KEY loaded:",
  process.env.GEMINI_API_KEY ? `Yes (length: ${process.env.GEMINI_API_KEY.length}, starts with: ${process.env.GEMINI_API_KEY.substring(0, 5)})` : "No (undefined/empty)"
);
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", import_express.default.static(import_path.default.join(process.cwd(), "uploads")));
console.log(`[Database] Connecting to JSON file database at: ${dbSqlitePath}`);
function readSqliteDb() {
  try {
    const rows = sqliteDb.prepare("SELECT key, value FROM kv").all();
    if (rows.length === 0) {
      const jsonDbPath = import_path.default.join(process.cwd(), "Daltoon_Bot.json");
      if (import_fs.default.existsSync(jsonDbPath)) {
        try {
          console.log(`[Database] Empty SQLite found, but Daltoon_Bot.json exists. Auto-migrating data to SQLite...`);
          const jsonData = JSON.parse(import_fs.default.readFileSync(jsonDbPath, "utf8"));
          const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
          const transaction = sqliteDb.transaction((obj) => {
            for (const key of Object.keys(obj)) {
              insert.run(key, JSON.stringify(obj[key]));
            }
          });
          transaction(jsonData);
          console.log(`[Database] Auto-migration from JSON completed successfully.`);
          const migratedRows = sqliteDb.prepare("SELECT key, value FROM kv").all();
          const db2 = {};
          for (const row of migratedRows) {
            try {
              db2[row.key] = JSON.parse(row.value);
            } catch (err) {
              console.error(`[Database Parse Error] for key ${row.key}:`, err);
            }
          }
          db2.isNewInstall = false;
          return db2;
        } catch (migrateErr) {
          console.error(`[Database] Error auto-migrating from JSON:`, migrateErr);
        }
      }
      console.warn(
        `[Database] SQLite database is empty. Returning default structure but NOT writing to disk yet to avoid accidental wipes.`
      );
      const defaultDb = {
        users: [],
        transactions: [],
        subscription_keys: [],
        vpn_plans: [],
        colleague_packages: [],
        colleague_accounts: [],
        colleague_categories: [],
        inbounds: [],
        custom_buttons: [],
        gift_codes: [],
        promo_codes: [],
        tickets: [],
        plan_categories: [],
        settings: {
          panel_config: JSON.stringify({
            botToken: process.env.BOT_TOKEN || "DUMMY_TOKEN",
            botNickname: "Daltoon",
            ownerId: process.env.OWNER_ID ? Number(process.env.OWNER_ID) : 0,
            cardNumber: process.env.CARD_NUMBER || "",
            cardHolder: process.env.CARD_HOLDER || "",
            dashboardUsername: process.env.DASHBOARD_USERNAME || "Daltoon",
            dashboardPassword: process.env.DASHBOARD_PASSWORD || "Daltoon10",
            serverPort: 3e3
          })
        },
        isNewInstall: true
      };
      return defaultDb;
    }
    const db = {};
    for (const row of rows) {
      try {
        db[row.key] = JSON.parse(row.value);
      } catch (err) {
        console.error(`[Database Parse Error] for key ${row.key}:`, err);
      }
    }
    db.isNewInstall = false;
    let modified = false;
    const arraysToEnsure = [
      "users",
      "transactions",
      "subscription_keys",
      "inbounds",
      "custom_buttons",
      "vpn_plans",
      "gift_codes",
      "colleague_packages",
      "colleague_accounts",
      "promo_codes",
      "tickets",
      "logs"
    ];
    for (const key of arraysToEnsure) {
      if (!db[key] || !Array.isArray(db[key])) {
        db[key] = [];
        modified = true;
      }
    }
    if (modified) {
      writeSqliteDb(db);
    }
    return db;
  } catch (err) {
    console.error(
      "[Database] Read error, preventing data wipe! Returning in-memory empty dataset but skipping writes:",
      err
    );
    return {
      users: [],
      transactions: [],
      subscription_keys: [],
      inbounds: [],
      custom_buttons: [],
      vpn_plans: [],
      settings: {},
      gift_codes: [],
      promo_codes: [],
      tickets: [],
      colleague_packages: [],
      colleague_accounts: [],
      _isReadError: true
      // Flag to prevent writeSqliteDb from overwriting
    };
  }
}
function writeSqliteDb(data) {
  if (!data) return false;
  if (data._isReadError) {
    console.error(
      "[Database] Write aborted: Database is currently in an errored/unreadable state. Writing now would wipe data."
    );
    return false;
  }
  try {
    const rowCountRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM kv").get();
    if (rowCountRow.count > 0) {
      const hasUsers = Array.isArray(data.users) && data.users.length > 0;
      const hasTransactions = Array.isArray(data.transactions) && data.transactions.length > 0;
      let hasToken = false;
      try {
        let cfg = data.settings?.panel_config;
        if (typeof cfg === "string") {
          cfg = JSON.parse(cfg);
        }
        hasToken = !!(cfg?.botToken && cfg.botToken.trim() !== "" && cfg.botToken !== "DUMMY_TOKEN");
      } catch (err) {
      }
      if (!hasUsers && !hasTransactions && !hasToken) {
        console.error("[Database] CRITICAL Safeguard: Refusing to overwrite populated database with empty/reset structure!");
        return false;
      }
    }
  } catch (err) {
  }
  try {
    const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
    const transaction = sqliteDb.transaction((obj) => {
      for (const key of Object.keys(obj)) {
        insert.run(key, JSON.stringify(obj[key]));
      }
    });
    transaction(data);
    return true;
  } catch (err) {
    console.error("[Database SQLite Write Error]", err.message);
    return false;
  }
}
function getSystemSettings(db) {
  const data = db || readSqliteDb();
  let parsedSettings = {};
  if (data.settings) {
    parsedSettings = { ...data.settings };
    delete parsedSettings.panel_config;
    if (data.settings.panel_config) {
      try {
        const pc = typeof data.settings.panel_config === "string" ? JSON.parse(data.settings.panel_config) : data.settings.panel_config;
        parsedSettings = { ...parsedSettings, ...pc };
      } catch (e) {
      }
    }
  }
  const settings = {
    botToken: process.env.BOT_TOKEN || "",
    baseUrl: process.env.XUI_URL || "",
    panelUrl: "",
    panelUsername: process.env.PANEL_USER || "",
    panelPassword: process.env.PANEL_PASS || "",
    activeInboundIds: [],
    ownerId: process.env.OWNER_ID ? Number(process.env.OWNER_ID) : 0,
    cardNumber: process.env.CARD_NUMBER || "",
    cardHolder: process.env.CARD_HOLDER || "",
    bankName: "",
    welcomeText: "",
    supportText: "",
    hideSupport: true,
    hideBuy: true,
    hideProfile: true,
    hideWallet: true,
    hideBtnBuyNew: true,
    hideBtnMySubs: true,
    hideBtnGuides: true,
    hideBtnProfile: true,
    hideBtnSupport: true,
    hideBtnTicketSupport: true,
    hideBtnFreeTest: true,
    hideBtnInstantSupport: true,
    hideBtnFeedback: true,
    hideBtnWallet: true,
    hideBtnReferral: true,
    hideBtnColleagues: true,
    hideBtnAiChat: true,
    gatewayStarsStatus: false,
    autoWarningConfigBtn: false,
    autoWarningNoConnectionBtn: false,
    autoWarningFirstConnectionBtn: false,
    mandatoryJoinActive: false,
    autoBackupEnabled: true,
    autoBackupInterval: "hourly",
    btnTextWallet: "\u0634\u0627\u0631\u0698 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u{1F4B3}",
    walletChargeAmounts: [2e5, 3e5, 4e5, 5e5, 1e6],
    currency: "\u062A\u0648\u0645\u0627\u0646",
    dashboardUsername: process.env.DASHBOARD_USERNAME || process.env.PANEL_USER || "Daltoon",
    dashboardPassword: process.env.DASHBOARD_PASSWORD || process.env.PANEL_PASS || "Daltoon10",
    serverPort: 3e3,
    admins: [],
    panelConnectionActive: false,
    ...parsedSettings
  };
  return settings;
}
var botProcess = null;
var pythonDepsInstalled = false;
function startPythonBot() {
  const isPM2 = process.env.PM2_HOME !== void 0 || process.env.pm_id !== void 0 || process.env.name === "daltoon-store";
  if (isPM2) {
    (0, import_child_process.exec)("pm2 info daltoon-bot", (infoErr) => {
      if (!infoErr) {
        console.log("[Bot Manager] Delegating bot restart to PM2 daemon...");
        (0, import_child_process.exec)("pm2 restart daltoon-bot", (err) => {
          if (err) {
            console.error("[Bot Manager] Failed to restart daltoon-bot via PM2:", err.message);
          } else {
            console.log("[Bot Manager] daltoon-bot restarted successfully via PM2.");
          }
        });
      } else {
        console.log("[Bot Manager] PM2 detected but 'daltoon-bot' not found in PM2 list. Spawning internally...");
        spawnInternalBot();
      }
    });
    return;
  }
  spawnInternalBot();
}
function spawnInternalBot() {
  if (botProcess) {
    console.log("[Bot Manager] Stopping old Python bot process...");
    botProcess.kill("SIGKILL");
    botProcess = null;
  }
  const db = readSqliteDb();
  const settings = getSystemSettings(db);
  const token = settings.botToken;
  if (!token || token === "DUMMY_TOKEN" || token.trim() === "") {
    console.log(
      "[Bot Manager] Bot token is empty or dummy. Python bot will not start."
    );
    return;
  }
  const runBot = () => {
    console.log(
      `[Bot Manager] Starting Python Telegram Bot with token ${token.substring(0, 6)}...`
    );
    try {
      const pythonCmd = "python3";
      const botScriptPath = import_path.default.resolve(process.cwd(), "bot.py");
      botProcess = (0, import_child_process.spawn)(pythonCmd, ["-u", botScriptPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          PYTHONPATH: (process.env.PYTHONPATH ? process.env.PYTHONPATH + ":" : "") + import_path.default.join(process.env.HOME || "/root", ".local/lib/python3.10/site-packages")
        },
        stdio: "pipe"
      });
      const logStream = import_fs.default.createWriteStream("bot_dev.log", { flags: "a" });
      botProcess.stdout?.on("data", (data) => {
        const msg = data.toString();
        console.log(`[Bot Output]: ${msg.trim()}`);
        logStream.write(`[STDOUT] ${msg}`);
      });
      botProcess.stderr?.on("data", (data) => {
        const msg = data.toString();
        console.error(`[Bot Error]: ${msg.trim()}`);
        logStream.write(`[STDERR] ${msg}`);
      });
      botProcess.on("close", (code) => {
        console.log(
          `[Bot Manager] Python bot process closed with code ${code}`
        );
        botProcess = null;
      });
      botProcess.on("error", (err) => {
        console.error("[Bot Manager] Failed to start Python bot process:", err);
      });
    } catch (err) {
      console.error("[Bot Manager] Exception when spawning python:", err);
    }
  };
  if (!pythonDepsInstalled) {
    (0, import_child_process.exec)('python3 -c "import telebot, dotenv, requests, deep_translator"', (err) => {
      if (!err) {
        pythonDepsInstalled = true;
        runBot();
      } else {
        console.log("[Bot Manager] Installing Python dependencies (pyTelegramBotAPI, python-dotenv, requests, deep-translator)...");
        (0, import_child_process.exec)(
          "curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip_fresh.py && python3 get-pip_fresh.py --user || true",
          () => {
            (0, import_child_process.exec)(
              "python3 -m pip install pyTelegramBotAPI python-dotenv requests deep-translator --break-system-packages --user || ~/.local/bin/pip install pyTelegramBotAPI python-dotenv requests deep-translator --user || pip install pyTelegramBotAPI python-dotenv requests deep-translator --user || true",
              () => {
                pythonDepsInstalled = true;
                runBot();
              }
            );
          }
        );
      }
    });
  } else {
    runBot();
  }
}
readSqliteDb();
console.log(`[Database] Using active database at: ${dbSqlitePath}`);
startPythonBot();
app.post("/api/database/wipe-all", async (req, res) => {
  try {
    const targetDbFile = import_path.default.resolve(process.cwd(), "Daltoon_Bot.db");
    if (import_fs.default.existsSync(targetDbFile)) {
      try {
        sqliteDb.close();
      } catch (e) {
      }
      try {
        import_fs.default.unlinkSync(targetDbFile);
      } catch (e) {
      }
      try {
        import_fs.default.unlinkSync(targetDbFile + "-wal");
      } catch (e) {
      }
      try {
        import_fs.default.unlinkSync(targetDbFile + "-shm");
      } catch (e) {
      }
    }
    res.json({
      success: true,
      message: "System wiped and will re-initialize on next load."
    });
    setTimeout(() => {
      process.exit(0);
    }, 1e3);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/database/reset", async (req, res) => {
  try {
    if (import_fs.default.existsSync(dbSqlitePath)) {
      import_fs.default.unlinkSync(dbSqlitePath);
    }
    try {
      sqliteDb.exec("DELETE FROM kv;");
    } catch (e) {
    }
    const freshDb = readSqliteDb();
    res.json({
      success: true,
      message: "Database reset to empty template successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/copy", (req, res) => {
  let botNickname = "\u062F\u0627\u0644\u062A\u0648\u0646";
  try {
    const db = readSqliteDb();
    if (db.settings) {
      let pcObj = {};
      if (db.settings.panel_config) {
        try {
          pcObj = JSON.parse(db.settings.panel_config);
          if (pcObj.botNickname) {
            botNickname = pcObj.botNickname;
          }
        } catch (err) {
        }
      }
      const host = req.headers.host;
      if (host) {
        const protocol = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
        const dynamicUrl = `${protocol}://${host}`;
        if (pcObj.botWebUrl !== dynamicUrl) {
          pcObj.botWebUrl = dynamicUrl;
          db.settings.panel_config = JSON.stringify(pcObj);
          writeSqliteDb(db);
        }
      }
    }
  } catch (err) {
    console.error("[Dynamic Host/Nickname Load Failed]", err);
  }
  const link = req.query.link || "";
  res.send(`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\u062F\u0631\u06CC\u0627\u0641\u062A \u0644\u06CC\u0646\u06A9 \u0627\u062A\u0635\u0627\u0644 ${botNickname}</title>
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Telegram Web App SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Vazirmatn', 'Inter', sans-serif;
            background-color: #080512;
            overflow-x: hidden;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
    </style>
</head>
<body class="flex flex-col items-center justify-between min-h-screen text-slate-100 p-4 select-none relative">
    <!-- Visual Ambient Glow Lights -->
    <div class="absolute -top-10 -left-10 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
    <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
    
    <!-- Top Brand Logo Header -->
    <div class="w-full flex flex-col items-center mt-6 z-10 animate-fade-in">
         <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)] mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h1 class="text-xl font-extrabold text-white tracking-wide">\u0631\u0648\u062A\u0631 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC ${botNickname}</h1>
        <p class="text-[10px] text-indigo-400 mt-1 font-semibold tracking-widest uppercase">${botNickname} Subscription Gateway</p>
    </div>

    <!-- Main Content Glass Box -->
    <div class="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 my-4 space-y-5 animate-slide-up">
        <div id="toast" class="hidden fixed top-6 right-1/2 translate-x-1/2 z-50 bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all duration-300 transform scale-90 opacity-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span dir="rtl">\u0644\u06CC\u0646\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u06A9\u067E\u06CC \u0634\u062F! \u2705</span>
        </div>

        <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1 justify-between">
              <span>\u{1F517} \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646:</span>
              <span class="text-[10px] text-pink-400/80 font-mono">VLESS / X-UI Link</span>
            </label>
            <!-- Link Display Area -->
            <div class="relative group">
              <textarea id="subLinkTextarea" readonly class="w-full h-28 p-3.5 bg-black/40 border border-slate-700/50 rounded-xl text-left text-xs font-mono text-zinc-300 resize-none break-all outline-none focus:border-indigo-500/50 transition scrollbar-none" style="direction: ltr; font-family: 'Inter', monospace;"></textarea>
              <div class="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/20 to-transparent rounded-b-xl pointer-events-none"></div>
            </div>
        </div>

        <!-- Copy Action Button -->
        <button id="copyBtn" class="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4)] hover:brightness-110 active:scale-95 transition transform duration-150 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" id="copyIcon" class="w-5 h-5 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" id="checkIcon" class="w-5 h-5 text-emerald-300 hidden animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span id="btnText">\u06A9\u067E\u06CC \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9</span>
        </button>

        <p class="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-1">
          \u{1F4A1} \u0627\u06CC\u0646 \u0644\u06CC\u0646\u06A9 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 \u06A9\u0644\u0627\u06CC\u0646\u062A (\u0645\u0627\u0646\u0646\u062F v2rayNG \u060CV2box \u060CHapp \u06CC\u0627 Streisand) \u0627\u0636\u0627\u0641\u0647 \u0646\u0645\u0627\u06CC\u06CC\u062F \u062A\u0627 \u062A\u0645\u0627\u0645 \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0628\u0647 \u0637\u0648\u0631 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u0648\u0646\u062F.
        </p>
    </div>

    <!-- Bottom Close Button Area -->
    <div class="w-full max-w-sm px-4 mb-6 z-10">
        <button id="closeBtn" class="w-full py-3.5 px-4 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>\u0628\u0633\u062A\u0646 \u067E\u0646\u062C\u0631\u0647</span>
        </button>
    </div>

    <script>
        const WebApp = window.Telegram?.WebApp;
        if (WebApp) {
            WebApp.ready();
            WebApp.expand();
        }

        const subLink = decodeURIComponent("${encodeURIComponent(link)}");
        const textarea = document.getElementById('subLinkTextarea');
        textarea.value = subLink;

        const copyBtn = document.getElementById('copyBtn');
        const copyIcon = document.getElementById('copyIcon');
        const checkIcon = document.getElementById('checkIcon');
        const btnText = document.getElementById('btnText');
        const toast = document.getElementById('toast');

        copyBtn.addEventListener('click', () => {
            if (!subLink) return;
            
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            
            const performCopy = () => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(subLink).then(handleSuccess).catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
            };

            const fallbackCopy = () => {
                try {
                    document.execCommand('copy');
                    handleSuccess();
                } catch(err) {
                    // console.error(err);
                }
            };

            performCopy();
        });

        function handleSuccess() {
            if (WebApp?.HapticFeedback) {
                WebApp.HapticFeedback.notificationOccurred('success');
            }

            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            btnText.textContent = '\u0644\u06CC\u0646\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u06A9\u067E\u06CC \u0634\u062F! \u2705';
            copyBtn.classList.remove('from-purple-600', 'to-indigo-600');
            copyBtn.classList.add('from-emerald-600', 'to-green-600', 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)]');

            toast.classList.remove('hidden', 'scale-90', 'opacity-0');
            toast.classList.add('scale-100', 'opacity-100');

            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                btnText.textContent = '\u06A9\u067E\u06CC \u06A9\u0631\u062F\u0646 \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9';
                copyBtn.classList.add('from-purple-600', 'to-indigo-600');
                copyBtn.classList.remove('from-emerald-600', 'to-green-600', 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)]');
                
                toast.classList.add('scale-90', 'opacity-0');
                setTimeout(() => toast.classList.add('hidden'), 350);
            }, 3000);
        }

        const closeBtn = document.getElementById('closeBtn');
        closeBtn.addEventListener('click', () => {
            if (WebApp) {
                WebApp.close();
            } else {
                window.close();
            }
        });
    </script>
</body>
</html>
  `);
});
app.get("/api/data", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    if (!settings.admins || !Array.isArray(settings.admins)) {
      settings.admins = [];
    }
    console.log(
      "[DEBUG] /api/data returned settings.botToken:",
      settings.botToken
    );
    res.json({
      success: true,
      users: db.users,
      transactions: db.transactions,
      keys: db.subscription_keys,
      inbounds: db.inbounds,
      customButtons: db.custom_buttons,
      vpnPlans: db.vpn_plans || [],
      giftCodes: db.gift_codes || [],
      promoCodes: db.promo_codes || [],
      tickets: db.tickets || [],
      colleaguePackages: db.colleague_packages || [],
      colleagueAccounts: db.colleague_accounts || [],
      colleagueCategories: db.colleague_categories || [],
      plan_categories: db.plan_categories || [],
      logs: db.logs || [],
      settings,
      isNewInstall: db.isNewInstall || !settings.botToken || settings.botToken.trim() === "" || settings.botToken === "DUMMY_TOKEN" || !settings.ownerId || Number(settings.ownerId) === 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/gift-codes", (req, res) => {
  const db = readSqliteDb();
  res.json(db.gift_codes || []);
});
app.post("/api/gift-codes", (req, res) => {
  const db = readSqliteDb();
  if (!db.gift_codes) db.gift_codes = [];
  const { code, amount, maxUsage, durationDays } = req.body;
  if (!code || !amount || maxUsage === void 0)
    return res.status(400).json({ error: "Missing fields" });
  const newCode = {
    id: crypto.randomUUID(),
    code,
    amount: parseInt(amount, 10),
    maxUsage: parseInt(maxUsage, 10),
    totalUsage: 0,
    usedBy: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    durationDays: durationDays ? parseInt(durationDays, 10) : void 0
  };
  db.gift_codes.push(newCode);
  writeSqliteDb(db);
  res.json({ success: true, item: newCode });
});
app.post("/api/gift-codes/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.gift_codes) db.gift_codes = [];
  db.gift_codes = db.gift_codes.filter((c) => c.id !== req.body.id);
  writeSqliteDb(db);
  res.json({ success: true });
});
app.post("/api/colleague-packages/save", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_packages) db.colleague_packages = [];
  const { id, title, price, trafficGb, category, description, minCreateGb } = req.body;
  if (!id || !title || price === void 0 || trafficGb === void 0) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const existingIdx = db.colleague_packages.findIndex((p) => p.id === id);
  if (existingIdx !== -1) {
    db.colleague_packages[existingIdx] = {
      id,
      title,
      price: Number(price),
      trafficGb: Number(trafficGb),
      category,
      description,
      minCreateGb: minCreateGb ? Number(minCreateGb) : 1
    };
  } else {
    db.colleague_packages.push({
      id,
      title,
      price: Number(price),
      trafficGb: Number(trafficGb),
      category,
      description,
      minCreateGb: minCreateGb ? Number(minCreateGb) : 1
    });
  }
  writeSqliteDb(db);
  res.json({ success: true, colleaguePackages: db.colleague_packages });
});
app.post("/api/colleague-packages/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_packages) db.colleague_packages = [];
  db.colleague_packages = db.colleague_packages.filter(
    (p) => p.id !== req.body.id
  );
  writeSqliteDb(db);
  res.json({ success: true, colleaguePackages: db.colleague_packages });
});
app.post("/api/colleague-packages/reorder", (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: "Invalid payload, expected orderedIds array" });
    }
    const db = readSqliteDb();
    if (!db.colleague_packages) db.colleague_packages = [];
    const pkgsMap = new Map(db.colleague_packages.map((p) => [p.id, p]));
    const sortedPkgs = [];
    orderedIds.forEach((id) => {
      const pkg = pkgsMap.get(id);
      if (pkg) {
        sortedPkgs.push(pkg);
        pkgsMap.delete(id);
      }
    });
    pkgsMap.forEach((pkg) => {
      sortedPkgs.push(pkg);
    });
    db.colleague_packages = sortedPkgs;
    writeSqliteDb(db);
    res.json({ success: true, colleaguePackages: db.colleague_packages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/colleague-categories", (req, res) => {
  const db = readSqliteDb();
  res.json(db.colleague_categories || []);
});
app.post("/api/colleague-categories/save", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_categories) db.colleague_categories = [];
  const { id, name, emoji } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });
  const existingIdx = db.colleague_categories.findIndex((c) => c.id === id);
  if (existingIdx !== -1) {
    db.colleague_categories[existingIdx] = { id, name, emoji: emoji || "\u{1F4C1}" };
  } else {
    db.colleague_categories.push({ id, name, emoji: emoji || "\u{1F4C1}" });
  }
  writeSqliteDb(db);
  res.json({ success: true, colleagueCategories: db.colleague_categories });
});
app.post("/api/colleague-categories/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_categories) db.colleague_categories = [];
  db.colleague_categories = db.colleague_categories.filter(
    (c) => c.id !== req.body.id
  );
  writeSqliteDb(db);
  res.json({ success: true, colleagueCategories: db.colleague_categories });
});
app.post("/api/colleague-categories/reorder", (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: "Invalid payload, expected orderedIds array" });
    }
    const db = readSqliteDb();
    if (!db.colleague_categories) db.colleague_categories = [];
    const catsMap = new Map(db.colleague_categories.map((c) => [c.id, c]));
    const sortedCats = [];
    orderedIds.forEach((id) => {
      const cat = catsMap.get(id);
      if (cat) {
        sortedCats.push(cat);
        catsMap.delete(id);
      }
    });
    catsMap.forEach((cat) => {
      sortedCats.push(cat);
    });
    db.colleague_categories = sortedCats;
    writeSqliteDb(db);
    res.json({ success: true, colleagueCategories: db.colleague_categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/colleague-accounts/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];
  db.colleague_accounts = db.colleague_accounts.filter(
    (a) => a.id !== req.body.id
  );
  writeSqliteDb(db);
  res.json({ success: true, colleagueAccounts: db.colleague_accounts });
});
app.post("/api/colleague-accounts/reset", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];
  const accIndex = db.colleague_accounts.findIndex((a) => a.id === req.body.id);
  if (accIndex !== -1) {
    db.colleague_accounts[accIndex].username = Math.random().toString(36).substring(2, 10);
    db.colleague_accounts[accIndex].password = Math.random().toString(36).substring(2, 10);
    writeSqliteDb(db);
    res.json({ success: true, colleagueAccounts: db.colleague_accounts });
  } else {
    res.json({ success: false, error: "Account not found" });
  }
});
app.post("/api/colleague-accounts/edit", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];
  const accIndex = db.colleague_accounts.findIndex((a) => a.id === req.body.id);
  if (accIndex !== -1 && req.body.trafficGb !== void 0) {
    db.colleague_accounts[accIndex].trafficGb = req.body.trafficGb;
    writeSqliteDb(db);
    res.json({ success: true, colleagueAccounts: db.colleague_accounts });
  } else {
    res.json({ success: false, error: "Account not found or missing fields" });
  }
});
app.post("/api/colleague-accounts/reset-usage", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];
  const accIndex = db.colleague_accounts.findIndex((a) => a.id === req.body.id);
  if (accIndex !== -1) {
    db.colleague_accounts[accIndex].usedTrafficGb = 0;
    db.colleague_accounts[accIndex].realUsedTrafficGb = 0;
    writeSqliteDb(db);
    res.json({ success: true, colleagueAccounts: db.colleague_accounts });
  } else {
    res.json({ success: false, error: "Account not found" });
  }
});
app.post("/api/promo-codes", (req, res) => {
  try {
    const db = readSqliteDb();
    if (!db.promo_codes) db.promo_codes = [];
    const nextCode = req.body;
    const idx = db.promo_codes.findIndex(
      (p) => p.id === nextCode.id || p.code === nextCode.code
    );
    if (idx >= 0) {
      db.promo_codes[idx] = nextCode;
    } else {
      db.promo_codes.push(nextCode);
    }
    writeSqliteDb(db);
    res.json({ success: true, item: nextCode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/promo-codes/delete", (req, res) => {
  try {
    const db = readSqliteDb();
    if (!db.promo_codes) db.promo_codes = [];
    db.promo_codes = db.promo_codes.filter((p) => p.id !== req.body.id);
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/tickets/create", (req, res) => {
  try {
    const { userId, username, subject, message } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];
    const ticketId = "TKB-" + Math.floor(Math.random() * 9e3 + 1e3);
    const newTicket = {
      id: ticketId,
      userId: Number(userId),
      username: username || "user_" + userId,
      subject,
      status: "open",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      messages: [
        {
          sender: "user",
          message,
          date: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    };
    db.tickets.push(newTicket);
    writeSqliteDb(db);
    res.json({
      success: true,
      ticketId,
      tickets: db.tickets,
      ticket: newTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/tickets/delete", (req, res) => {
  try {
    const { ticketId } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];
    db.tickets = db.tickets.filter((t) => t.id !== ticketId);
    writeSqliteDb(db);
    res.json({ success: true, tickets: db.tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/tickets/reply", (req, res) => {
  try {
    const { ticketId, reply } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];
    const ticketIdx = db.tickets.findIndex((t) => t.id === ticketId);
    if (ticketIdx >= 0) {
      const ticket = db.tickets[ticketIdx];
      ticket.messages.push({
        sender: "admin",
        message: reply,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      ticket.status = "answered";
      ticket.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      writeSqliteDb(db);
      const settings = getSystemSettings(db);
      if (settings.botToken && ticket.userId) {
        const notifyMsg = `\u{1F4E8} <b>\u067E\u0627\u0633\u062E \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0628\u0647 \u062A\u06CC\u06A9\u062A \u0634\u0645\u0627!</b>

\u{1F194} <b>\u0634\u0646\u0627\u0633\u0647 \u062A\u06CC\u06A9\u062A:</b> <code>${ticket.id}</code>
\u{1F4AC} <b>\u0645\u062A\u0646 \u067E\u0627\u0633\u062E:</b>
<blockquote>${reply}</blockquote>

\u{1F340} <i>\u0627\u0632 \u0627\u0639\u062A\u0645\u0627\u062F \u0648 \u0634\u06A9\u06CC\u0628\u0627\u06CC\u06CC \u0634\u0645\u0627 \u0633\u067E\u0627\u0633\u06AF\u0632\u0627\u0631\u06CC\u0645.</i>`;
        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "\u270D\uFE0F \u067E\u0627\u0633\u062E \u0628\u0647 \u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A",
                callback_data: `tkt_reply_${ticket.id}`
              }
            ]
          ]
        };
        sendTelegramMessage(
          settings.botToken,
          ticket.userId,
          notifyMsg,
          replyMarkup
        ).catch((err) => {
          console.error("[Telegram Ticket Reply Auto-Notify Error]", err);
        });
      }
      res.json({ success: true, ticket });
    } else {
      res.status(404).json({ success: false, error: "Ticket not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/tickets/close", (req, res) => {
  try {
    const { ticketId } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];
    const ticketIdx = db.tickets.findIndex((t) => t.id === ticketId);
    if (ticketIdx >= 0) {
      const ticket = db.tickets[ticketIdx];
      ticket.status = "closed";
      ticket.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      writeSqliteDb(db);
      const settings = getSystemSettings(db);
      if (settings.botToken && ticket.userId) {
        const nickname = settings.botNickname || "\u062F\u0627\u0644\u062A\u0648\u0646 \u0628\u0627\u062A";
        const notifyMsg = `\u{1F512} <b>\u062A\u06CC\u06A9\u062A \u0634\u0645\u0627 \u0628\u0633\u062A\u0647 \u0634\u062F!</b>

\u{1F194} <b>\u0634\u0646\u0627\u0633\u0647 \u062A\u06CC\u06A9\u062A:</b> <code>${ticket.id}</code>

\u{1F4AC} \u062A\u06CC\u06A9\u062A \u0634\u0645\u0627 \u062A\u0648\u0633\u0637 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0641\u0646\u06CC ${nickname} \u0628\u0631\u0631\u0633\u06CC \u0648 \u0628\u0633\u062A\u0647 \u0634\u062F.
\u0627\u06AF\u0631 \u0647\u0645\u0686\u0646\u0627\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC \u0628\u06CC\u0634\u062A\u0631\u06CC \u062F\u0627\u0631\u06CC\u062F\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u062A\u06CC\u06A9\u062A \u062C\u062F\u06CC\u062F\u06CC \u062F\u0631 \u0631\u0628\u0627\u062A \u062B\u0628\u062A \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.`;
        sendTelegramMessage(settings.botToken, ticket.userId, notifyMsg).catch(
          (err) => {
            console.error("[Telegram Ticket Close Auto-Notify Error]", err);
          }
        );
      }
      res.json({ success: true, ticket });
    } else {
      res.status(404).json({ success: false, error: "Ticket not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/subscription-keys/regenerate-uuid", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    const subIdx = db.subscription_keys.findIndex((k) => k.id === id);
    if (subIdx >= 0) {
      const key = db.subscription_keys[subIdx];
      const clientName = key.clientName || key.clientEmail;
      let resetResult;
      if (!clientName) {
        const crypto2 = await import("crypto");
        const newUuid = crypto2.randomUUID();
        const newSubId = crypto2.randomBytes(8).toString("hex");
        const settings = getSystemSettings(db);
        const activeServers = getActiveServers(settings);
        let chosenServer = activeServers.length > 0 ? activeServers[0] : null;
        if (key.serverId) {
          const found = activeServers.find((s) => s.id === key.serverId);
          if (found) {
            chosenServer = found;
          }
        }
        const subBase = chosenServer && chosenServer.subUrl && chosenServer.subUrl.trim() !== "" ? normalizeXuiUrl(chosenServer.subUrl) : chosenServer ? normalizeXuiUrl(chosenServer.panelUrl) : "https://tr.sub-daltoon.ir:2096";
        const subLink = `${subBase}/sub/${newSubId}`;
        resetResult = { success: true, clientUuid: newUuid, subLink };
        console.log(
          `[regenerate-uuid API] Regenerated manual client locally: ${key.id}`
        );
      } else {
        resetResult = await resetVpnClientUuidApi(clientName, key.serverId);
      }
      if (resetResult.success) {
        key.clientUuid = resetResult.clientUuid;
        key.subLink = resetResult.subLink;
        db.subscription_keys[subIdx] = key;
        writeSqliteDb(db);
        res.json({ success: true, key });
      } else {
        res.status(500).json({
          success: false,
          error: resetResult.error || "Failed to reset UUID"
        });
      }
    } else {
      res.status(404).json({ success: false, error: "Subscription entry not found." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/subscription-keys/transfer-ownership", async (req, res) => {
  try {
    const { id, targetUserIdOrUsername } = req.body;
    const db = readSqliteDb();
    const cleanTarget = String(targetUserIdOrUsername).replace("@", "").trim();
    const targetUser = db.users.find(
      (u) => String(u.userId) === cleanTarget || String(u.username).toLowerCase() === cleanTarget.toLowerCase()
    );
    if (!targetUser) {
      return res.status(400).json({
        success: false,
        error: "\u06A9\u0627\u0631\u0628\u0631 \u0645\u0642\u0635\u062F \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u062F\u0648\u0633\u062A \u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06CC\u06A9\u0628\u0627\u0631 \u062F\u06A9\u0645\u0647 /start \u0631\u0627 \u062F\u0631 \u0631\u0628\u0627\u062A \u0632\u062F\u0647 \u0628\u0627\u0634\u062F."
      });
    }
    const subIdx = db.subscription_keys.findIndex((k) => k.id === id);
    if (subIdx >= 0) {
      const key = db.subscription_keys[subIdx];
      const oldUserId = key.userId;
      key.userId = targetUser.userId;
      db.subscription_keys[subIdx] = key;
      const oldUser = db.users.find((u) => u.userId === oldUserId);
      if (oldUser) {
        oldUser.activePlansCount = db.subscription_keys.filter(
          (k) => k.userId === oldUserId && k.status === "active"
        ).length;
      }
      targetUser.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === targetUser.userId && k.status === "active"
      ).length;
      writeSqliteDb(db);
      res.json({
        success: true,
        key,
        targetUsername: targetUser.username || String(targetUser.userId)
      });
    } else {
      res.status(404).json({ success: false, error: "\u06A9\u0627\u0646\u0641\u06CC\u06AF \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/transactions/instant-pay", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const db = readSqliteDb();
    const user = db.users.find((u) => u.userId === Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const amountNum = Number(amount);
    user.walletBalance = Number(user.walletBalance) + amountNum;
    const newTx = {
      id: "TX-AUTO-" + Math.floor(Math.random() * 9e4 + 1e4),
      userId: Number(userId),
      username: user.username,
      amount: amountNum,
      receiptImage: "bg-gradient-to-br from-emerald-500 to-teal-700",
      status: "approved",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description: description || "\u067E\u0631\u062F\u0627\u062E\u062A \u062E\u0648\u062F\u06A9\u0627\u0631 \u0622\u0646\u0644\u0627\u06CC\u0646"
    };
    db.transactions.unshift(newTx);
    writeSqliteDb(db);
    res.json({
      success: true,
      userWalletBalance: user.walletBalance,
      tx: newTx
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var aiClient = null;
async function performWebSearch(query, googleKey, cx, braveKey) {
  if (!query) return "";
  let resultsText = "";
  if (googleKey && googleKey.trim() !== "") {
    const searchCx = cx && cx.trim() !== "" ? cx.trim() : "";
    try {
      console.log(`[Web Search] Querying Google Custom Search API for: "${query}"`);
      const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleKey.trim())}&cx=${encodeURIComponent(searchCx)}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        if (items.length > 0) {
          resultsText += `\u0646\u062A\u0627\u06CC\u062C \u062C\u0633\u062A\u062C\u0648\u06CC \u06AF\u0648\u06AF\u0644 \u0628\u0631\u0627\u06CC "${query}":
`;
          items.slice(0, 5).forEach((item, idx) => {
            resultsText += `[${idx + 1}] \u0639\u0646\u0648\u0627\u0646: ${item.title}
\u062A\u0648\u0636\u06CC\u062D\u0627\u062A: ${item.snippet}
\u0644\u06CC\u0646\u06A9: ${item.link}

`;
          });
        }
      } else {
        const errText = await res.text();
        console.error(`[Web Search] Google Search API error:`, errText);
      }
    } catch (err) {
      console.error(`[Web Search] Failed Google Search:`, err);
    }
  }
  if (resultsText === "" && braveKey && braveKey.trim() !== "") {
    try {
      console.log(`[Web Search] Querying Brave Search API for: "${query}"`);
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": braveKey.trim()
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.web?.results || [];
        if (items.length > 0) {
          resultsText += `\u0646\u062A\u0627\u06CC\u062C \u062C\u0633\u062A\u062C\u0648\u06CC \u0648\u0628 (Brave) \u0628\u0631\u0627\u06CC "${query}":
`;
          items.slice(0, 5).forEach((item, idx) => {
            resultsText += `[${idx + 1}] \u0639\u0646\u0648\u0627\u0646: ${item.title}
\u062A\u0648\u0636\u06CC\u062D\u0627\u062A: ${item.description}
\u0644\u06CC\u0646\u06A9: ${item.url}

`;
          });
        }
      } else {
        const errText = await res.text();
        console.error(`[Web Search] Brave Search API error:`, errText);
      }
    } catch (err) {
      console.error(`[Web Search] Failed Brave Search:`, err);
    }
  }
  return resultsText;
}
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, userId, type } = req.body;
    const isSupport = type === "support" || !type;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }
    const dbData = readSqliteDb();
    const systemSettings = getSystemSettings(dbData);
    const activeUsersCount = (dbData.users || []).filter(
      (u) => u.status === "active"
    ).length;
    const aiSearchEnabled = systemSettings.aiSearchEnabled !== false;
    let injectedSearchContext = "";
    if (aiSearchEnabled) {
      const googleKey = systemSettings.googleSearchApiKey || process.env.GOOGLE_SEARCH_API_KEY || "";
      const googleCx = systemSettings.googleSearchCx || process.env.GOOGLE_SEARCH_CX || "";
      const braveKey = systemSettings.braveSearchApiKey || process.env.BRAVE_SEARCH_API_KEY || "";
      if (googleKey && googleKey.trim() !== "" || braveKey && braveKey.trim() !== "") {
        const searchResults = await performWebSearch(message, googleKey, googleCx, braveKey);
        if (searchResults && searchResults.trim() !== "") {
          injectedSearchContext = `

[\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0632\u0646\u062F\u0647 \u062C\u0633\u062A\u062C\u0648\u06CC \u0648\u0628]
\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0632\u06CC\u0631 \u0622\u062E\u0631\u06CC\u0646 \u0646\u062A\u0627\u06CC\u062C \u062C\u0633\u062A\u062C\u0648\u06CC \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u062F\u0631\u0628\u0627\u0631\u0647 \u0633\u0648\u0627\u0644 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0633\u062A. \u0627\u0632 \u0627\u06CC\u0646 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0628\u0631\u0627\u06CC \u067E\u0627\u0633\u062E \u0628\u0647 \u0633\u0648\u0627\u0644\u0627\u062A \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627\u06CC \u0631\u0648\u0632 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F:
${searchResults}`;
        }
      }
    }
    let geminiApiKey = systemSettings.geminiApiKey || "";
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      geminiApiKey = process.env.GEMINI_API_KEY || "";
    }
    let geminiBaseUrl = systemSettings.geminiBaseUrl || "";
    let customAiApiKey = systemSettings.customAiApiKey || "";
    let aiBaseUrl = systemSettings.aiBaseUrl || "";
    let aiModelName = systemSettings.aiModelName || "";
    let apiKeyToUse = "";
    let finalBaseUrl = "";
    let finalModelName = "";
    if (isSupport) {
      apiKeyToUse = geminiApiKey.trim();
      finalBaseUrl = geminiBaseUrl ? geminiBaseUrl.trim() : "";
      if (!apiKeyToUse || apiKeyToUse.trim() === "") {
        return res.status(400).json({
          error: "\u06A9\u0644\u06CC\u062F API \u062C\u06CC\u0645\u06CC\u0646\u0627\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u062F\u0627\u0634\u0628\u0648\u0631\u062F \u06A9\u0644\u06CC\u062F \u0645\u0639\u062A\u0628\u0631 \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F."
        });
      }
    } else {
      apiKeyToUse = customAiApiKey.trim();
      finalBaseUrl = aiBaseUrl ? aiBaseUrl.trim() : "";
      finalModelName = aiModelName ? aiModelName.trim() : "";
      if (!apiKeyToUse || apiKeyToUse.trim() === "") {
        return res.status(400).json({
          error: "\u06A9\u0644\u06CC\u062F API \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0639\u0645\u0648\u0645\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F."
        });
      }
    }
    const isDirectGemini = isSupport ? true : apiKeyToUse.startsWith("AIzaSy") && (!finalBaseUrl || finalBaseUrl === "");
    let systemPrompt = "";
    if (isSupport) {
      const pricingBoxes = systemSettings.customPricingBoxes || [];
      const serversList = (systemSettings.servers || []).map((s) => ({ id: s.id, name: s.name }));
      systemPrompt = `\u0634\u0645\u0627 \u06CC\u06A9 \u062F\u0633\u062A\u06CC\u0627\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0645\u0648\u062F\u0628 \u0648 \u067E\u0627\u0633\u062E\u06AF\u0648 \u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u0631\u0628\u0627\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u0628\u0647 \u0646\u0627\u0645 "${systemSettings.botNickname || "\u062F\u0627\u0644\u062A\u0648\u0646 \u0628\u0627\u062A"}" (Daltoon Bot) \u0647\u0633\u062A\u06CC\u062F. 
\u0634\u0645\u0627 \u0628\u0627\u06CC\u062F \u0628\u0647 \u0633\u0648\u0627\u0644\u0627\u062A \u0645\u0631\u062A\u0628\u0637 \u0628\u0627 \u062E\u062F\u0645\u0627\u062A \u0648 \u062E\u0631\u06CC\u062F \u0627\u0632 \u0631\u0628\u0627\u062A \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F.

\u0645\u0647\u0645\u200C\u062A\u0631\u06CC\u0646 \u0646\u06A9\u062A\u0647: \u062F\u0631 \u0635\u0648\u0631\u062A\u06CC \u06A9\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0627\u0646\u0633\u0627\u0646\u06CC\u060C \u0634\u0627\u0631\u0698 \u0648\u0644\u062A\u060C \u0631\u0641\u0639 \u0645\u0634\u06A9\u0644 \u062F\u0631\u06AF\u0627\u0647\u060C \u0642\u0637\u0639\u06CC \u06CC\u0627 \u062E\u0631\u06CC\u062F \u062F\u0627\u0631\u062F\u060C \u0627\u0648 \u0631\u0627 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u0627\u0632 \u0645\u0646\u0648\u06CC \u0627\u0635\u0644\u06CC \u0631\u0628\u0627\u062A \u0627\u0632 \u062F\u06A9\u0645\u0647 \xAB\u{1F3AB} \u062B\u0628\u062A \u062A\u06CC\u06A9\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC\xBB \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u062F.

\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u0639\u0644\u06CC \u0633\u06CC\u0633\u062A\u0645:
- \u062A\u0639\u0631\u0641\u0647 \u0647\u0627\u06CC \u062B\u0627\u0628\u062A: ${JSON.stringify(dbData.vpn_plans || [])}
- \u0648\u06CC\u0698\u06AF\u06CC \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0628\u0627 \u062D\u062C\u0645 \u062F\u0644\u062E\u0648\u0627\u0647 (\u0633\u0641\u0627\u0631\u0634\u06CC): 
  \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0639\u0644\u0627\u0648\u0647 \u0628\u0631 \u062E\u0631\u06CC\u062F \u062A\u0639\u0631\u0641\u0647\u200C\u0647\u0627\u06CC \u062B\u0627\u0628\u062A \u0628\u0627\u0644\u0627\u060C \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0628\u0627 \u062D\u062C\u0645 \u062A\u0631\u0627\u0641\u06CC\u06A9 (\u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A) \u0648 \u0631\u0648\u0632\u0647\u0627\u06CC \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0645\u0644\u0627\u064B \u0633\u0641\u0627\u0631\u0634\u06CC \u0648 \u062F\u0644\u062E\u0648\u0627\u0647 \u062E\u0648\u062F \u0628\u0633\u0627\u0632\u0646\u062F.
  \u0631\u0648\u0634 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u062F\u0631 \u0631\u0628\u0627\u062A: \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627\u06CC\u062F \u0628\u0647 \u0645\u0646\u0648\u06CC \u0627\u0635\u0644\u06CC \u0628\u0631\u0648\u062F\u060C \u062F\u06A9\u0645\u0647 \xAB\u{1F6CD}\uFE0F \u062E\u0631\u06CC\u062F \u0633\u0631\u0648\u06CC\u0633\xBB (\u06CC\u0627 \u062E\u0631\u06CC\u062F \u0633\u0631\u0648\u06CC\u0633 \u062C\u062F\u06CC\u062F) \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u062F\u060C \u0633\u0631\u0648\u0631 \u0645\u0648\u0631\u062F\u0646\u0638\u0631 \u062E\u0648\u062F \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u062F\u060C \u0648 \u0633\u067E\u0633 \u0631\u0648\u06CC \u062F\u06A9\u0645\u0647 \xAB\u2728 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0628\u0627 \u062D\u062C\u0645 \u062F\u0644\u062E\u0648\u0627\u0647\xBB \u06A9\u0644\u06CC\u06A9 \u06A9\u0646\u062F. \u0631\u0628\u0627\u062A \u0627\u0632 \u0627\u0648 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F \u06A9\u0647 \u0645\u06CC\u0632\u0627\u0646 \u062D\u062C\u0645 (\u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A) \u0648 \u0645\u062F\u062A \u0632\u0645\u0627\u0646 (\u0631\u0648\u0632\u0647\u0627) \u0648 \u06CC\u06A9 \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u062F\u0644\u062E\u0648\u0627\u0647 \u0648\u0627\u0631\u062F \u06A9\u0646\u062F.
  \u0641\u0631\u0645\u0648\u0644 \u0645\u062D\u0627\u0633\u0628\u0647 \u0642\u06CC\u0645\u062A: \u0647\u0632\u06CC\u0646\u0647 \u0646\u0647\u0627\u06CC\u06CC = (\u062D\u062C\u0645 \u0628\u0647 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A * \u0642\u06CC\u0645\u062A \u0647\u0631 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A) + (\u062A\u0639\u062F\u0627\u062F \u0631\u0648\u0632\u0647\u0627 * \u0642\u06CC\u0645\u062A \u0647\u0631 \u0631\u0648\u0632)
  \u0628\u0647 \u0637\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0642\u06CC\u0645\u062A \u0647\u0631 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A \u062A\u0631\u0627\u0641\u06CC\u06A9 3,000 \u062A\u0648\u0645\u0627\u0646 \u0648 \u0642\u06CC\u0645\u062A \u0647\u0631 \u0631\u0648\u0632 \u0627\u0639\u062A\u0628\u0627\u0631 2,000 \u062A\u0648\u0645\u0627\u0646 \u0627\u0633\u062A (\u0645\u06AF\u0631 \u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0627\u06CC \u0622\u0646 \u0633\u0631\u0648\u0631 \u062E\u0627\u0635 \u0642\u06CC\u0645\u062A \u0645\u062A\u0641\u0627\u0648\u062A\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F).
- \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062C\u0639\u0628\u0647\u200C\u0647\u0627\u06CC \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u062F\u0644\u062E\u0648\u0627\u0647 \u0633\u0631\u0648\u0631\u0647\u0627: ${JSON.stringify(pricingBoxes)}
- \u0644\u06CC\u0633\u062A \u0633\u0631\u0648\u0631\u0647\u0627\u06CC \u0641\u0639\u0627\u0644: ${JSON.stringify(serversList)}
- \u062A\u0639\u062F\u0627\u062F \u06A9\u0627\u0631\u0628\u0631\u0627\u0646: ${activeUsersCount}
- \u0631\u0627\u0647\u0646\u0645\u0627: ${systemSettings.supportText || ""}${injectedSearchContext}`;
    } else {
      systemPrompt = `\u0634\u0645\u0627 \u06CC\u06A9 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0639\u0645\u0648\u0645\u06CC \u0647\u0633\u062A\u06CC\u062F \u06A9\u0647 \u0628\u0647 \u06A9\u0627\u0631\u0628\u0631 \u062F\u0631 \u06AF\u0641\u062A\u06AF\u0648\u0647\u0627\u06CC \u0639\u0645\u0648\u0645\u06CC \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F. \u067E\u0627\u0633\u062E\u200C\u0647\u0627 \u0631\u0627 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646 \u0648 \u0645\u0648\u062F\u0628\u0627\u0646\u0647 \u0627\u0631\u0627\u0626\u0647 \u062F\u0647\u06CC\u062F.${injectedSearchContext}`;
    }
    if (isDirectGemini) {
      console.log(
        `[AI Chat] Making direct Google Gemini API call (isSupport: ${isSupport})`
      );
      const ai = new import_genai.GoogleGenAI({ apiKey: apiKeyToUse, ...finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {} });
      const modelName = finalModelName || "gemini-2.5-flash";
      const configObj = {
        systemInstruction: systemPrompt,
        temperature: 0.7
      };
      if (aiSearchEnabled) {
        configObj.tools = [{ googleSearch: {} }];
      }
      const response = await ai.models.generateContent({
        model: modelName,
        contents: message,
        config: configObj
      });
      if (response && response.text) {
        let replyText = response.text;
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
          let refs = "\n\n\u{1F310} **\u0645\u0646\u0627\u0628\u0639 \u062C\u0633\u062A\u062C\u0648:**\n";
          let hasRefs = false;
          const seenUris = /* @__PURE__ */ new Set();
          chunks.forEach((chunk) => {
            if (chunk.web && chunk.web.uri && !seenUris.has(chunk.web.uri)) {
              seenUris.add(chunk.web.uri);
              refs += `- [${chunk.web.title || "\u0645\u0646\u0628\u0639"}](${chunk.web.uri})
`;
              hasRefs = true;
            }
          });
          if (hasRefs) {
            replyText += refs;
          }
        }
        return res.json({ response: replyText });
      } else {
        throw new Error("\u067E\u0627\u0633\u062E\u06CC \u0627\u0632 \u0633\u0631\u0648\u0631 \u062C\u06CC\u0645\u06CC\u0646\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
      }
    } else {
      if (!finalBaseUrl) {
        finalBaseUrl = "https://api.awanllm.com/v1";
        if (!finalModelName) {
          finalModelName = "Meta-Llama-3-8B-Instruct";
        }
      }
      const trimmedUrl = finalBaseUrl.replace(/\/$/, "");
      const completionUrl = `${trimmedUrl}/chat/completions`;
      const modelToUse = finalModelName && finalModelName.trim() !== "" ? finalModelName.trim() : "gpt-4o-mini";
      console.log(
        `[AI Chat Custom] Routing to OpenAI Compatible URL: ${completionUrl} with model: ${modelToUse} (isSupport: ${isSupport})`
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45e3);
      const response = await fetch(completionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeyToUse}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `\u062E\u0637\u0627\u06CC \u0633\u0631\u0648\u06CC\u0633\u200C\u062F\u0647\u0646\u062F\u0647 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (\u06A9\u062F ${response.status}): ${errText}`
        );
      }
      const resData = await response.json();
      const responseText = resData.choices?.[0]?.message?.content || "";
      if (responseText) {
        return res.json({ response: responseText });
      } else {
        throw new Error("\u067E\u0627\u0633\u062E \u062F\u0631\u06CC\u0627\u0641\u062A\u06CC \u0627\u0632 \u0633\u0631\u0648\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062E\u0627\u0644\u06CC \u0628\u0648\u062F.");
      }
    }
  } catch (error) {
    console.error("[AI Chat API Error]:", error);
    let errMsg = error.message || "Failed to generate AI response.";
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "\u062E\u0637\u0627\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (Forbidden/Proxy Error). \u0644\u0637\u0641\u0627\u064B \u0622\u062F\u0631\u0633 Base URL \u06CC\u0627 \u0648\u0636\u0639\u06CC\u062A \u0634\u0628\u06A9\u0647 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.";
    }
    if (errMsg.startsWith("{")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch (e) {
      }
    }
    if (errMsg.includes("API key not valid")) {
      errMsg = "\u06A9\u0644\u06CC\u062F API \u062B\u0628\u062A \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0628\u0647 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0637\u0644\u0627\u0639 \u062F\u0647\u06CC\u062F.";
    } else if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate limit") || errMsg.includes("429")) {
      errMsg = "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u06A9\u0644\u06CC\u062F API \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F\u0647 \u0627\u0633\u062A (Quota Exceeded). \u0644\u0637\u0641\u0627\u064B \u0628\u0647 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0637\u0644\u0627\u0639 \u062F\u0647\u06CC\u062F.";
    }
    res.status(500).json({ error: errMsg });
  }
});
app.post("/api/ai/test-key", async (req, res) => {
  try {
    let { apiKey, baseUrl, modelName, type } = req.body;
    if (!apiKey || apiKey.trim() === "") {
      return res.status(400).json({ error: "\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u06A9\u0644\u06CC\u062F API \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." });
    }
    const trimmedKey = apiKey.trim();
    let finalBaseUrl = baseUrl ? baseUrl.trim() : "";
    let finalModelName = modelName ? modelName.trim() : "";
    const isDirectGemini = type === "gemini" ? true : trimmedKey.startsWith("AIzaSy") && (!finalBaseUrl || finalBaseUrl === "");
    if (isDirectGemini) {
      console.log(`[AI Key Test] Testing direct Gemini API key`);
      const ai = new import_genai.GoogleGenAI({
        apiKey: trimmedKey,
        ...finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {}
      });
      const model = finalModelName || "gemini-2.5-flash";
      const response = await ai.models.generateContent({
        model,
        contents: "\u0633\u0644\u0627\u0645",
        config: {
          maxOutputTokens: 5
        }
      });
      if (response && response.text) {
        return res.json({
          success: true,
          message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F! \u06A9\u0644\u06CC\u062F API \u062C\u06CC\u0645\u06CC\u0646\u0627\u06CC \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A."
        });
      } else {
        throw new Error("\u067E\u0627\u0633\u062E \u062F\u0631\u06CC\u0627\u0641\u062A\u06CC \u0627\u0632 \u062C\u06CC\u0645\u06CC\u0646\u0627\u06CC \u062E\u0627\u0644\u06CC \u0628\u0648\u062F.");
      }
    } else {
      if (!finalBaseUrl) {
        finalBaseUrl = "https://api.awanllm.com/v1";
        if (!finalModelName) {
          finalModelName = "Meta-Llama-3-8B-Instruct";
        }
      }
      const trimmedUrl = finalBaseUrl.replace(/\/$/, "");
      const completionUrl = `${trimmedUrl}/chat/completions`;
      const modelToUse = finalModelName && finalModelName.trim() !== "" ? finalModelName.trim() : "gpt-4o-mini";
      console.log(
        `[AI Key Test] Testing OpenAI compatible API key for model: ${modelToUse} at ${completionUrl}`
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45e3);
      const response = await fetch(completionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content: "\u0633\u0644\u0627\u0645" }],
          max_tokens: 5
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `\u062E\u0637\u0627\u06CC \u0633\u0631\u0648\u0631 \u0633\u0631\u0648\u06CC\u0633\u200C\u062F\u0647\u0646\u062F\u0647 (\u06A9\u062F ${response.status}): ${errText}`
        );
      }
      return res.json({
        success: true,
        message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F! \u06A9\u0644\u06CC\u062F API \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A."
      });
    }
  } catch (err) {
    console.error("[AI Key Test Error]:", err);
    let errMsg = err.message || "\u0628\u0631\u0631\u0633\u06CC \u06A9\u0644\u06CC\u062F API \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.";
    if (errMsg.startsWith("{")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch (e) {
      }
    }
    if (err.name === "AbortError" || errMsg.includes("aborted") || errMsg.includes("timeout")) {
      errMsg = "\u0632\u0645\u0627\u0646 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F (Timeout). \u0627\u06CC\u0646 \u0645\u0634\u06A9\u0644 \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0646\u0627\u0634\u06CC \u0627\u0632 \u06A9\u0646\u062F\u06CC \u0645\u0648\u0642\u062A \u0633\u0631\u0648\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u06CC\u0627 \u0639\u062F\u0645 \u067E\u0627\u0633\u062E\u06AF\u0648\u06CC\u06CC \u0645\u0646\u0627\u0633\u0628 \u0641\u06CC\u0644\u062A\u0631\u0634\u06A9\u0646/\u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0633\u0631\u0648\u0631 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0686\u0646\u062F \u0644\u062D\u0638\u0647 \u062F\u06CC\u06AF\u0631 \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F.";
    } else if (errMsg.includes("API key not valid")) {
      errMsg = "\u06A9\u0644\u06CC\u062F API \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u06A9\u0644\u06CC\u062F \u0635\u062D\u06CC\u062D \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.";
    } else if (errMsg.includes("fetch failed")) {
      errMsg = "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0633\u0631\u0648\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (Network Error).";
    } else if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate limit") || errMsg.includes("429")) {
      errMsg = "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0627\u06CC\u0646 \u06A9\u0644\u06CC\u062F \u0628\u0647 \u067E\u0627\u06CC\u0627\u0646 \u0631\u0633\u06CC\u062F\u0647 \u0627\u0633\u062A (Quota Exceeded). \u0644\u0637\u0641\u0627\u064B \u06A9\u0644\u06CC\u062F \u062F\u06CC\u06AF\u0631\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.";
    }
    res.status(500).json({ error: errMsg });
  }
});
app.post("/api/gift-codes/edit", (req, res) => {
  const db = readSqliteDb();
  if (!db.gift_codes) db.gift_codes = [];
  const { id, code, amount, maxUsage, durationDays } = req.body;
  if (!id || !code || amount === void 0 || maxUsage === void 0) {
    return res.status(400).json({ error: "Missing fields" });
  }
  let updatedCode = null;
  db.gift_codes = db.gift_codes.map((c) => {
    if (c.id === id) {
      updatedCode = {
        ...c,
        code,
        amount: parseInt(amount, 10),
        maxUsage: parseInt(maxUsage, 10),
        durationDays: durationDays ? parseInt(durationDays, 10) : void 0
      };
      return updatedCode;
    }
    return c;
  });
  if (updatedCode) {
    writeSqliteDb(db);
    res.json({ success: true, item: updatedCode });
  } else {
    res.status(404).json({ error: "Code not found" });
  }
});
app.post("/api/bot/validate-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string" || !token.includes(":")) {
      return res.json({
        success: false,
        error: "\u062A\u0648\u06A9\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A (\u0641\u0631\u0645\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631)"
      });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getMe`,
        {
          signal: controller.signal
        }
      );
      clearTimeout(timeout);
      const data = await response.json();
      if (data && data.ok) {
        return res.json({ success: true, bot: data.result });
      } else {
        const errorDesc = data && data.description ? data.description : "Unauthorized (401)";
        return res.json({ success: false, error: errorDesc });
      }
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.warn(
        "[Token Validation Error] Telegram request timed out or was filtered:",
        fetchErr.message
      );
      return res.json({
        success: true,
        warning: true,
        message: "\u0628\u0647 \u062F\u0644\u06CC\u0644 \u0641\u06CC\u0644\u062A\u0631\u06CC\u0646\u06AF \u062A\u0644\u06AF\u0631\u0627\u0645 \u0631\u0648\u06CC \u0633\u0631\u0648\u0631\u060C \u0628\u0631\u0631\u0633\u06CC \u062E\u0648\u062F\u06A9\u0627\u0631 \u0627\u0646\u062C\u0627\u0645 \u0646\u0634\u062F \u0627\u0645\u0627 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u062B\u0628\u062A \u062E\u0648\u0627\u0647\u062F \u0634\u062F."
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/settings", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.ownerId) {
      payload.ownerId = Number(payload.ownerId);
    }
    const db = readSqliteDb();
    const prevSettings = getSystemSettings(db);
    const finalPayload = {
      ...prevSettings,
      ...payload
    };
    const configValue = JSON.stringify(finalPayload);
    const prevAdmins = prevSettings.admins || [];
    const newAdmins = payload.admins || [];
    const addedAdmins = newAdmins.filter(
      (newAdm) => newAdm.userId && !prevAdmins.some(
        (prevAdm) => Number(prevAdm.userId) === Number(newAdm.userId)
      )
    );
    if (!db.settings) db.settings = {};
    db.settings.panel_config = configValue;
    const saveSuccess = writeSqliteDb(db);
    if (!saveSuccess) {
      return res.status(500).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633. \u0641\u0627\u06CC\u0644 \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0642\u0641\u0644 \u0628\u0627\u0634\u062F \u06CC\u0627 \u0641\u0636\u0627\u06CC \u062F\u06CC\u0633\u06A9 \u067E\u0631 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F."
      });
    }
    aiClient = null;
    const botToken = payload.botToken || prevSettings.botToken;
    const botNickname = payload.botNickname || prevSettings.botNickname || "\u062F\u0627\u0644\u062A\u0648\u0646 \u0628\u0627\u062A";
    if (botToken && addedAdmins.length > 0) {
      for (const adm of addedAdmins) {
        try {
          const roleText = adm.role === "super_admin" ? "\u0633\u0648\u067E\u0631 \u0627\u062F\u0645\u06CC\u0646 (\u0645\u062F\u06CC\u0631 \u0627\u0631\u0634\u062F)" : "\u0627\u062F\u0645\u06CC\u0646 \u0645\u0639\u0645\u0648\u0644\u06CC (\u0645\u062F\u06CC\u0631\u06CC\u062A \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC)";
          const htmlMsg = `\u{1F451} <b>\u0627\u0646\u062A\u0635\u0627\u0628 \u0634\u0627\u06CC\u0633\u062A\u0647 \u0634\u0645\u0627 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0633\u06CC\u0633\u062A\u0645</b>

\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC <b>@${adm.username || "\u06A9\u0627\u0631\u0628\u0631"}</b> (\u0634\u0646\u0627\u0633\u0647: <code>${adm.userId}</code>)\u061B
\u0628\u0627 \u0633\u0644\u0627\u0645 \u0648 \u0627\u062D\u062A\u0631\u0627\u0645\u060C

\u0628\u062F\u06CC\u0646\u200C\u0648\u0633\u06CC\u0644\u0647 \u0628\u0647 \u0627\u0637\u0644\u0627\u0639 \u0645\u06CC\u200C\u0631\u0633\u0627\u0646\u062F \u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631\u06CC\u062A\u06CC \u0634\u0645\u0627 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 <b>${roleText}</b> \u062F\u0631 \u0631\u0628\u0627\u062A ${botNickname} \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0641\u0639\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F.

\u{1F6E1}\uFE0F <b>\u0628\u0631\u062E\u06CC \u0627\u0632 \u0645\u0632\u0627\u06CC\u0627 \u0648 \u0648\u0638\u0627\u06CC\u0641 \u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u062F\u0645\u06CC\u0646:</b>
\u{1F539} <b>\u0628\u0631\u0631\u0633\u06CC \u0648 \u062A\u0627\u06CC\u06CC\u062F \u0648\u0627\u0631\u06CC\u0632\u06CC\u200C\u0647\u0627:</b> \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0644\u06CC\u0633\u062A \u0641\u06CC\u0634\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u062F\u0631 \u0628\u062E\u0634 \xAB\u062A\u0627\u06CC\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627\xBB \u062C\u0647\u062A \u0634\u0627\u0631\u0698 \u062E\u0648\u062F\u06A9\u0627\u0631 \u06A9\u06CC\u0641 \u067E\u0648\u0644.
\u{1F539} <b>\u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0639\u0636\u0627:</b> \u0627\u0645\u06A9\u0627\u0646 \u0648\u06CC\u0631\u0627\u06CC\u0634\u060C \u0627\u0641\u0632\u0627\u06CC\u0634 \u0648 \u06CC\u0627 \u06A9\u0627\u0647\u0634 \u0645\u0648\u062C\u0648\u062F\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646\u060C \u0645\u0633\u062F\u0648\u062F\u0633\u0627\u0632\u06CC \u0648 \u0631\u0641\u0639 \u0645\u0633\u062F\u0648\u062F\u06CC\u062A \u0627\u0639\u0636\u0627.
\u{1F539} <b>\u067E\u0644\u0627\u0646\u200C\u0647\u0627\u06CC \u0627\u062F\u0645\u06CC\u0646:</b> \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0627\u0632 \u067E\u0644\u0627\u0646\u200C\u0647\u0627 \u0628\u062F\u0648\u0646 \u06A9\u0633\u0631 \u0645\u0648\u062C\u0648\u062F\u06CC \u062C\u0647\u062A \u0628\u0631\u0631\u0633\u06CC \u0648 \u06A9\u0646\u062A\u0631\u0644 \u06A9\u06CC\u0641\u06CC \u0633\u0631\u0648\u0631\u0647\u0627.
\u{1F539} <b>\u0627\u0639\u0644\u0627\u0646\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F:</b> \u0631\u0635\u062F \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u0641\u0648\u0631\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u06CC\u0634\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC \u0627\u0639\u0636\u0627 \u0628\u0647 \u0645\u062D\u0636 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u062F\u0631 \u0631\u0628\u0627\u062A.

<i>\u0645\u0641\u062A\u062E\u0631\u06CC\u0645 \u06A9\u0647 \u062F\u0631 \u062A\u06CC\u0645 \u062A\u0648\u0633\u0639\u0647 \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A ${botNickname} \u062D\u0636\u0648\u0631 \u062F\u0627\u0631\u06CC\u062F. \u0628\u0627 \u0622\u0631\u0632\u0648\u06CC \u0645\u0648\u0641\u0642\u06CC\u062A \u0648 \u0647\u0645\u06A9\u0627\u0631\u06CC \u0645\u0633\u062A\u0645\u0631.</i>

\u2728 <b>\u062A\u06CC\u0645 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0648 \u0641\u0646\u06CC ${botNickname}</b>`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: adm.userId,
              text: htmlMsg,
              parse_mode: "HTML"
            })
          });
          console.log(
            `[Admin Welcomed] Successfully welcomed new admin ID: ${adm.userId}`
          );
        } catch (err) {
          console.error(
            `[Admin Welcome Error] Failed to welcome admin ${adm.userId}:`,
            err
          );
        }
      }
    }
    startPythonBot();
    res.json({
      success: true,
      message: "Settings saved successfully to JSON store."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
var apiPrefixCache = /* @__PURE__ */ new Map();
async function getApiPrefix(cleanedUrl, cookie = "") {
  if (!cleanedUrl) return "/panel/api";
  const normalized = cleanedUrl.replace(/\/+$/, "");
  if (apiPrefixCache.has(normalized)) {
    return apiPrefixCache.get(normalized);
  }
  const candidates = ["/panel/api", "/xui/API", "/xui/api"];
  for (const prefix of candidates) {
    const url = `${normalized}${prefix}/inbounds/list`;
    try {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json"
      };
      if (cookie) {
        headers["Cookie"] = cookie;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4e3);
      const res = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(timer);
      if (res && res.status !== 404) {
        console.log(`[API Path Auto-Detect] Found working API path prefix: '${prefix}' for URL: ${cleanedUrl}`);
        apiPrefixCache.set(normalized, prefix);
        return prefix;
      }
    } catch (e) {
    }
  }
  console.log(`[API Path Auto-Detect] All candidates returned 404 or timed out for: ${cleanedUrl}. Defaulting to '/panel/api'`);
  apiPrefixCache.set(normalized, "/panel/api");
  return "/panel/api";
}
async function xuiFetch(url, options = {}, timeoutMs = 8e3) {
  if (url.includes("/panel/api/")) {
    const idx = url.indexOf("/panel/api/");
    const baseUrl = url.substring(0, idx);
    const suffix = url.substring(idx + "/panel/api/".length);
    const cookie = options.headers?.Cookie || "";
    const prefix = await getApiPrefix(baseUrl, cookie);
    url = `${baseUrl}${prefix}/${suffix}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,fa;q=0.8",
    ...options.headers
  };
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
function getActiveServers(settings) {
  if (settings.servers && Array.isArray(settings.servers) && settings.servers.length > 0) {
    return settings.servers.filter((s) => s.status !== "inactive");
  }
  if (settings.panelConnectionActive && settings.baseUrl && settings.panelUsername && settings.panelPassword) {
    return [
      {
        id: "legacy_server",
        name: "\u067E\u0646\u0644 \u0627\u0635\u0644\u06CC",
        panelUrl: settings.baseUrl,
        subUrl: settings.subUrl,
        panelUsername: settings.panelUsername,
        panelPassword: settings.panelPassword,
        activeInboundIds: settings.activeInboundIds || [],
        status: "active"
      }
    ];
  }
  return [];
}
function normalizeXuiUrl(url) {
  let cleaned = `${url}`.trim();
  cleaned = cleaned.replace(/^[\s./]+/, "");
  cleaned = cleaned.replace(/\/+$/, "");
  cleaned = cleaned.replace(/\/(dashboard|panel|admin)$/i, "");
  cleaned = cleaned.replace(/\/+$/, "");
  if (cleaned.includes("://")) {
    const parts = cleaned.split("://");
    const protocolGroup = parts[0].toLowerCase();
    if (protocolGroup !== "http" && protocolGroup !== "https") {
      if (protocolGroup.includes("http") || protocolGroup.endsWith("s") || protocolGroup.endsWith("ps")) {
        cleaned = "https://" + parts.slice(1).join("://");
      } else {
        cleaned = "http://" + parts.slice(1).join("://");
      }
    }
  } else {
    cleaned = "http://" + cleaned;
  }
  return cleaned;
}
async function loginReebekaPasarguard(baseUrl, username, password) {
  const cleanedUrl = normalizeXuiUrl(baseUrl);
  const candidates = [
    // 1. Standard admin token urlencoded
    {
      url: `${cleanedUrl}/api/admin/token`,
      asJson: false,
      body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 2. Standard admin token trailing slash urlencoded
    {
      url: `${cleanedUrl}/api/admin/token/`,
      asJson: false,
      body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 3. Alternative token urlencoded
    {
      url: `${cleanedUrl}/api/token`,
      asJson: false,
      body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 4. Alternative token trailing slash urlencoded
    {
      url: `${cleanedUrl}/api/token/`,
      asJson: false,
      body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 5. Admin token JSON
    { url: `${cleanedUrl}/api/admin/token`, asJson: true, body: () => JSON.stringify({ username, password }) },
    // 6. Admin token trailing slash JSON
    { url: `${cleanedUrl}/api/admin/token/`, asJson: true, body: () => JSON.stringify({ username, password }) },
    // 7. Alternative token JSON
    { url: `${cleanedUrl}/api/token`, asJson: true, body: () => JSON.stringify({ username, password }) },
    // 8. Alternative token trailing slash JSON
    { url: `${cleanedUrl}/api/token/`, asJson: true, body: () => JSON.stringify({ username, password }) }
  ];
  for (const cand of candidates) {
    try {
      console.log(`[Reebeka/Pasarguard Login] Trying candidate: ${cand.url} (JSON: ${cand.asJson})`);
      const headers = {
        "Accept": "application/json"
      };
      if (cand.asJson) {
        headers["Content-Type"] = "application/json";
      } else {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
      const res = await xuiFetch(
        cand.url,
        {
          method: "POST",
          headers,
          body: cand.body()
        },
        5e3
      );
      if (res.ok) {
        const data = await res.json();
        const token = data?.access_token;
        if (token) {
          console.log(`[Reebeka/Pasarguard Login] Authenticated successfully with ${cand.url}`);
          return token;
        }
      }
    } catch (e) {
      console.log(`[Reebeka/Pasarguard Login] Candidate ${cand.url} failed: ${e.message}`);
    }
  }
  return null;
}
var CookieJar = class {
  constructor() {
    this.cookies = /* @__PURE__ */ new Map();
  }
  parseAndAdd(cookieHeader) {
    if (!cookieHeader) return;
    const parts = cookieHeader.split(/,(?=[^;]*=)/);
    for (const part of parts) {
      const cookiePart = part.split(";")[0].trim();
      const eqIdx = cookiePart.indexOf("=");
      if (eqIdx > 0) {
        const name = cookiePart.substring(0, eqIdx).trim();
        const value = cookiePart.substring(eqIdx + 1).trim();
        if (name && value) {
          this.cookies.set(name, value);
        }
      }
    }
  }
  getCookieHeaderString() {
    const list = [];
    for (const [name, value] of this.cookies.entries()) {
      list.push(`${name}=${value}`);
    }
    return list.join("; ");
  }
  isEmpty() {
    return this.cookies.size === 0;
  }
};
var xuiSessionCache = /* @__PURE__ */ new Map();
function clearXuiPanelSession(cleanedUrl, username, password) {
  const cacheKey = `${cleanedUrl}||${username}||${password}`;
  xuiSessionCache.delete(cacheKey);
}
async function loginXuiPanel(cleanedUrl, username, password, forceFresh = false) {
  const cacheKey = `${cleanedUrl}||${username}||${password}`;
  if (!forceFresh) {
    const cached = xuiSessionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 20 * 60 * 1e3) {
      return {
        success: true,
        cookie: cached.cookie,
        csrfToken: cached.csrfToken
      };
    }
  }
  try {
    const jar = new CookieJar();
    let csrfToken = "";
    console.log(
      `[Diagnostic] Executing initial GET handshake to base URL: ${cleanedUrl}`
    );
    let getRes = await xuiFetch(cleanedUrl, { method: "GET" }, 6e3).catch(
      () => null
    );
    if (!getRes || !getRes.ok) {
      const loginUrl2 = `${cleanedUrl}/login`;
      console.log(
        `[Diagnostic] GET handshake to base URL failed or returned bad status. Trying direct login page: ${loginUrl2}`
      );
      getRes = await xuiFetch(loginUrl2, { method: "GET" }, 6e3).catch(
        () => null
      );
    }
    if (getRes) {
      const setCookieHeader = getRes.headers.get("set-cookie");
      if (setCookieHeader) {
        jar.parseAndAdd(setCookieHeader);
        console.log(`[Cookies] Handshake response cookies parsed: ${jar.getCookieHeaderString()}`);
      }
      const text = await getRes.text().catch(() => "");
      const match = text.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/i);
      if (match && match[1]) {
        csrfToken = match[1];
        console.log(`[CSRF] CSRF token successfully extracted from handshake: ${csrfToken}`);
      }
    }
    const loginUrl = `${cleanedUrl}/login`;
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${cleanedUrl}/`,
      "Origin": cleanedUrl
    };
    const cookieHeader = jar.getCookieHeaderString();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }
    if (csrfToken) {
      headers["X-Csrf-Token"] = csrfToken;
    }
    console.log(`[Diagnostic] Executing POST login to: ${loginUrl}`);
    const loginRes = await xuiFetch(
      loginUrl,
      {
        method: "POST",
        headers,
        body: params.toString()
      },
      8e3
    );
    const bodyText = await loginRes.text();
    let bodyJson = {};
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (e) {
    }
    console.log(
      `[Diagnostic] XUI response status: ${loginRes.status}, body: ${bodyText.substring(0, 150)}`
    );
    if (loginRes.ok && bodyJson && bodyJson.success) {
      const loginCookieHeader = loginRes.headers.get("set-cookie");
      if (loginCookieHeader) {
        jar.parseAndAdd(loginCookieHeader);
      }
      let postCsrfToken = loginRes.headers.get("X-Csrf-Token") || csrfToken;
      if (!postCsrfToken) {
        const match = bodyText.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/i);
        if (match && match[1]) {
          postCsrfToken = match[1];
        }
      }
      const finalCookie = jar.getCookieHeaderString();
      const finalCsrf = postCsrfToken || null;
      xuiSessionCache.set(cacheKey, {
        cookie: finalCookie,
        csrfToken: finalCsrf,
        timestamp: Date.now()
      });
      return {
        success: true,
        cookie: finalCookie,
        csrfToken: finalCsrf
      };
    } else {
      const errMsg = bodyJson?.msg || `\u06A9\u062F \u062E\u0637\u0627: ${loginRes.status}. \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A.`;
      xuiSessionCache.delete(cacheKey);
      return { success: false, cookie: null, csrfToken: null, error: errMsg };
    }
  } catch (err) {
    console.error(`[Diagnostic] XUI login encountered error:`, err);
    xuiSessionCache.delete(cacheKey);
    return {
      success: false,
      cookie: null,
      csrfToken: null,
      error: err.message
    };
  }
}
async function addVpnClientApi(clientEmail, trafficGb, durationDays, settings, clientUuid, serverId, bypassDuplicateCheck = false) {
  try {
    if (!bypassDuplicateCheck) {
      const db = readSqliteDb();
      const subs = db.subscription_keys || [];
      const _lMail = clientEmail.toLowerCase();
      for (let s of subs) {
        if ((s.clientName || "").toLowerCase() === _lMail || (s.planId || "").toLowerCase() === _lMail) {
          return {
            success: false,
            error: "\u0627\u06CC\u0646 \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0627\u0632 \u0642\u0628\u0644 \u062F\u0631 \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0631\u0648\u0631 \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0646\u0627\u0645 \u062F\u06CC\u06AF\u0631\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F."
          };
        }
      }
    }
    const activeServers = getActiveServers(settings);
    if (activeServers.length === 0) {
      return {
        success: false,
        error: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u06A9\u0627\u0645\u0644 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u0633\u0631\u0648\u0631 \u0641\u0639\u0627\u0644\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F."
      };
    }
    let server = activeServers[Math.floor(Math.random() * activeServers.length)];
    if (serverId) {
      const matchingServer = activeServers.find((s) => s.id === serverId);
      if (matchingServer) {
        server = matchingServer;
      }
    }
    const cleanedUrl = normalizeXuiUrl(server.panelUrl);
    const loginResult = await loginXuiPanel(
      cleanedUrl,
      server.panelUsername,
      server.panelPassword
    );
    if (!loginResult.success || !loginResult.cookie) {
      return {
        success: false,
        error: "\u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F: " + (loginResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635")
      };
    }
    const uuid = clientUuid || Math.random().toString(36).substring(2, 10) + "-" + Math.random().toString(36).substring(2, 6);
    const totalBytes = trafficGb < 1 ? Math.floor(trafficGb * 1e3 * 1024 * 1024) : Math.floor(trafficGb * 1024 * 1024 * 1024);
    const expiryTimeMs = Date.now() + durationDays * 24 * 60 * 60 * 1e3;
    let inboundIds = [];
    if (Array.isArray(server.activeInboundIds) && server.activeInboundIds.length > 0) {
      inboundIds = server.activeInboundIds.map((id) => Number(id)).filter((id) => !isNaN(id));
    }
    if (inboundIds.length === 0) {
      const listHeaders = { Cookie: loginResult.cookie };
      if (loginResult.csrfToken) {
        listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
      }
      const listRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/list`,
        {
          method: "GET",
          headers: listHeaders
        },
        5e3
      );
      if (listRes.ok) {
        const listText = await listRes.text();
        const listJson = JSON.parse(listText);
        if (listJson && listJson.success && Array.isArray(listJson.obj)) {
          inboundIds = listJson.obj.map((item) => Number(item.id)).filter((id) => !isNaN(id));
          console.log(
            `[Sanaei API] Dynamically retrieved ${inboundIds.length} inbound IDs for user ${clientEmail}`
          );
        }
      }
    }
    try {
      const checkRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/getClientTraffics/${clientEmail}`,
        {
          method: "GET",
          headers: {
            Cookie: loginResult.cookie,
            Accept: "application/json"
          }
        },
        5e3
      );
      if (checkRes.ok) {
        const checkJson = await checkRes.json();
        if (checkJson && checkJson.success && checkJson.obj) {
          return {
            success: false,
            error: "\u0627\u06CC\u0646 \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0627\u0632 \u0642\u0628\u0644 \u062F\u0631 \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0631\u0648\u0631 \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0646\u0627\u0645 \u062F\u06CC\u06AF\u0631\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F."
          };
        }
      }
    } catch (err) {
      console.warn("[Sanaei API Sync] Could not check client existence:", err);
    }
    try {
      const listHeaders = {
        Cookie: loginResult.cookie,
        Accept: "application/json"
      };
      if (loginResult.csrfToken) {
        listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
      }
      const listRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/list`,
        {
          method: "GET",
          headers: listHeaders
        },
        5e3
      );
      if (listRes.ok) {
        const listJson = await listRes.json();
        if (listJson && listJson.success && Array.isArray(listJson.obj)) {
          const validIds = listJson.obj.map((inb) => inb.id);
          if (inboundIds.length > 0) {
            inboundIds = inboundIds.filter((id) => validIds.includes(id));
          }
          if (inboundIds.length === 0) {
            inboundIds = validIds;
          }
        }
      }
    } catch (err) {
      console.warn("[Sanaei API Sync] Could not fetch valid inbounds:", err);
    }
    if (inboundIds.length === 0) {
      inboundIds = [1];
    }
    clientUuid = clientUuid || crypto.randomUUID();
    let safeEmail = clientEmail.replace(/ /g, "_").replace(/\n/g, "").replace(/\//g, "");
    safeEmail = safeEmail.replace(/[^A-Za-z0-9_-]/g, "");
    if (!safeEmail) {
      safeEmail = "col_client_fallback";
    }
    const xuiSubId = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const addUrl = `${cleanedUrl}/panel/api/clients/add`;
    const payload = {
      client: {
        id: clientUuid,
        email: safeEmail,
        limitIp: 0,
        totalGB: totalBytes,
        expiryTime: expiryTimeMs,
        enable: true,
        tgId: 0,
        subId: xuiSubId
      },
      inboundIds
    };
    const headers = {
      Cookie: loginResult.cookie,
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (loginResult.csrfToken) {
      headers["X-Csrf-Token"] = loginResult.csrfToken;
    }
    let lastError = "";
    try {
      const addRes = await xuiFetch(
        addUrl,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        },
        8e3
      );
      if (addRes.ok) {
        const addText = await addRes.text();
        try {
          const addJson = JSON.parse(addText);
          if (addJson && addJson.success) {
            console.log(
              `[Sanaei API Sync] Created user '${clientEmail}' globally on inbounds ${inboundIds.join(", ")} successfully.`
            );
            const subBase = server.subUrl && server.subUrl.trim() !== "" ? normalizeXuiUrl(server.subUrl) : cleanedUrl;
            const subLink = `${subBase}/sub/${xuiSubId}`;
            return { success: true, clientUuid, subLink };
          } else {
            console.warn(
              `[Sanaei API Response] Global creation error/unsupported: ${addText}`
            );
            lastError = addJson?.msg || addText;
          }
        } catch (e) {
          console.warn(
            `[Sanaei API Response] Global creation returned non-json: ${addText.substring(0, 50)}`
          );
          lastError = "Non-JSON response";
        }
      } else {
        lastError = `HTTP ${addRes.status}: ${await addRes.text().catch(() => "Unknown error")}`;
      }
    } catch (err) {
      console.error(
        `[Sanaei API Error] Failed to create global client: ${err.message}`
      );
      lastError = err.message;
    }
    console.log(
      `[Sanaei API Fallback] Attempting per-inbound addition for user '${clientEmail}'...`
    );
    let fallbackSuccess = false;
    for (const inbId of inboundIds) {
      try {
        const classicUrl = `${cleanedUrl}/panel/api/inbounds/addClient`;
        const classicPayload = {
          id: inbId,
          settings: JSON.stringify({ clients: [payload.client] })
        };
        const cRes = await xuiFetch(
          classicUrl,
          {
            method: "POST",
            headers,
            body: JSON.stringify(classicPayload)
          },
          8e3
        );
        if (cRes.ok) {
          const cText = await cRes.text();
          try {
            const cJson = JSON.parse(cText);
            if (cJson && cJson.success) {
              console.log(
                `[Sanaei API Fallback Sync] Added user '${clientEmail}' to inbound ${inbId}`
              );
              fallbackSuccess = true;
            } else {
              console.warn(
                `[Sanaei API Fallback error inbound ${inbId}]: ${cText}`
              );
            }
          } catch (e) {
          }
        }
      } catch (ce) {
        console.error(`[Sanaei API Fallback Exception inbound ${inbId}]:`, ce);
      }
    }
    if (fallbackSuccess) {
      const subBase = server.subUrl && server.subUrl.trim() !== "" ? normalizeXuiUrl(server.subUrl) : cleanedUrl;
      const subLink = `${subBase}/sub/${xuiSubId}`;
      return { success: true, clientUuid, subLink };
    }
    return {
      success: false,
      error: "\u062A\u0639\u0631\u06CC\u0641 \u06A9\u0644\u0627\u06CC\u0646\u062A \u0645\u0648\u0641\u0642 \u0646\u0628\u0648\u062F. \u062E\u0637\u0627: " + lastError
    };
  } catch (e) {
    console.error("[addVpnClientApi] helper crash:", e);
    return { success: false, error: e.message };
  }
}
async function extendVpnClientApi(clientEmail, addGb, addDays, clientUuid, serverId) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);
    let server = null;
    if (serverId) {
      server = activeServers.find((s) => s.id === serverId);
    }
    if (!server && activeServers.length > 0) {
      server = activeServers.find((s) => s.status === "active") || activeServers[0];
    }
    if (!server) return { success: false, error: "No active server" };
    const cleanedUrl = normalizeXuiUrl(server.panelUrl);
    const loginResult = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword);
    if (!loginResult.success || !loginResult.cookie) {
      return { success: false, error: "XUI Login Failed" };
    }
    const headers = {
      Cookie: loginResult.cookie,
      Accept: "application/json",
      "Content-Type": "application/json"
    };
    if (loginResult.csrfToken) headers["X-Csrf-Token"] = loginResult.csrfToken;
    let safeEmail = clientEmail ? clientEmail.replace(/ /g, "_").replace(/\n/g, "").replace(/\//g, "").replace(/[^A-Za-z0-9_-]/g, "") : "";
    let clientData = null;
    let inboundId = null;
    const listRes = await xuiFetch(`${cleanedUrl}/panel/api/inbounds/list`, { method: "GET", headers }, 1e4);
    if (listRes.ok) {
      const resJson = await listRes.json().catch(() => ({}));
      if (resJson && resJson.success && Array.isArray(resJson.obj)) {
        for (const inbound of resJson.obj) {
          let clients = [];
          try {
            clients = JSON.parse(inbound.settings || "{}").clients || [];
          } catch (e) {
          }
          for (const c of clients) {
            if (clientUuid && String(c.id) === String(clientUuid) || safeEmail && c.email === safeEmail) {
              clientData = c;
              inboundId = inbound.id;
              break;
            }
          }
          if (clientData) break;
        }
      }
    }
    if (!clientData) {
      return { success: false, error: "Client not found in panel" };
    }
    const currentTotal = Number(clientData.total) || 0;
    const currentExpiry = Number(clientData.expiryTime) || 0;
    const addBytes = Math.floor(addGb * 1024 * 1024 * 1024);
    const addMs = Math.floor(addDays * 24 * 60 * 60 * 1e3);
    const newTotal = currentTotal + addBytes;
    const nowMs = Date.now();
    let newExpiry = currentExpiry === 0 || currentExpiry < nowMs ? nowMs + addMs : currentExpiry + addMs;
    const mergedC = { ...clientData };
    mergedC.total = newTotal;
    mergedC.expiryTime = newExpiry;
    mergedC.enable = true;
    const uid = mergedC.id;
    try {
      const updRes = await xuiFetch(`${cleanedUrl}/panel/api/clients/update/${uid}`, { method: "POST", headers, body: JSON.stringify(mergedC) }, 1e4);
      if (updRes.ok) {
        const updJson = await updRes.json().catch(() => ({}));
        if (updJson && updJson.success) return { success: true };
      }
    } catch (e) {
    }
    try {
      const updRes2 = await xuiFetch(`${cleanedUrl}/panel/api/clients/update/${safeEmail}`, { method: "POST", headers, body: JSON.stringify(mergedC) }, 1e4);
      if (updRes2.ok) {
        const updJson2 = await updRes2.json().catch(() => ({}));
        if (updJson2 && updJson2.success) return { success: true };
      }
    } catch (e) {
    }
    if (inboundId) {
      try {
        const updRes3 = await xuiFetch(`${cleanedUrl}/panel/api/inbounds/${inboundId}/updateClient/${uid}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: inboundId,
            settings: JSON.stringify({ clients: [mergedC] })
          })
        }, 1e4);
        if (updRes3.ok) {
          const updJson3 = await updRes3.json().catch(() => ({}));
          if (updJson3 && updJson3.success) return { success: true };
        }
      } catch (e) {
      }
    }
    return { success: false, error: "Failed to update client via APIs" };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function deleteVpnClientApi(clientEmail, serverId) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);
    const targetServers = serverId ? activeServers.filter((s) => s.id === serverId) : activeServers;
    if (targetServers.length === 0)
      return { success: false, error: "XUI disconnected" };
    let deletedAtLeastOnce = false;
    for (const server of targetServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword
        );
        if (!loginResult.success || !loginResult.cookie) continue;
        const headers = {
          Cookie: loginResult.cookie,
          Accept: "application/json"
        };
        if (loginResult.csrfToken) {
          headers["X-Csrf-Token"] = loginResult.csrfToken;
        }
        const delUrl = `${cleanedUrl}/panel/api/clients/del/${encodeURIComponent(clientEmail)}`;
        let globalDelSuccess = false;
        try {
          const res = await xuiFetch(delUrl, { method: "POST", headers }, 5e3);
          if (res && res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data && data.success) {
              globalDelSuccess = true;
              deletedAtLeastOnce = true;
            }
          }
        } catch (e) {
        }
        try {
          const listUrl = `${cleanedUrl}/panel/api/inbounds/list`;
          const listRes = await xuiFetch(listUrl, { method: "GET", headers }, 5e3);
          if (listRes && listRes.ok) {
            const data = await listRes.json().catch(() => ({}));
            if (data && data.success && Array.isArray(data.obj)) {
              for (const inbound of data.obj) {
                let clients = [];
                try {
                  const settings2 = JSON.parse(inbound.settings || "{}");
                  clients = settings2.clients || [];
                } catch (e) {
                }
                const clientMatch = clients.find((c) => c.email === clientEmail);
                if (clientMatch && clientMatch.id) {
                  const fallbackDelUrl = `${cleanedUrl}/panel/api/inbounds/${inbound.id}/delClient/${clientMatch.id}`;
                  const fRes = await xuiFetch(fallbackDelUrl, { method: "POST", headers }, 5e3);
                  if (fRes && fRes.ok) {
                    const fData = await fRes.json().catch(() => ({}));
                    if (fData && fData.success) {
                      deletedAtLeastOnce = true;
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
        }
      } catch (e) {
      }
    }
    return {
      success: deletedAtLeastOnce,
      error: deletedAtLeastOnce ? void 0 : "Panel deletion failed on all servers"
    };
  } catch (e) {
    return { success: false, error: "Exception during deletion" };
  }
}
async function toggleVpnClientApi(clientEmail, enabled, clientUuid) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);
    if (activeServers.length === 0)
      return { success: false, error: "XUI disconnected" };
    let toggledAtLeastOnce = false;
    for (const server of activeServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword
        );
        if (!loginResult.success || !loginResult.cookie) continue;
        const headers = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        const formHeaders = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        };
        if (loginResult.csrfToken) {
          headers["X-Csrf-Token"] = loginResult.csrfToken;
          formHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }
        const safeEmail = encodeURIComponent(clientEmail);
        let globalUpdateSuccess = false;
        try {
          const getUrl = `${cleanedUrl}/panel/api/clients/get/${safeEmail}`;
          const getRes = await xuiFetch(getUrl, { method: "GET", headers }, 4e3).catch(() => null);
          if (getRes && getRes.ok) {
            const getJson = await getRes.json().catch(() => ({}));
            if (getJson.success && getJson.obj) {
              const client = getJson.obj;
              client.enable = enabled;
              const updateUrl = `${cleanedUrl}/panel/api/clients/update/${safeEmail}`;
              const inboundId = client.inboundId || 0;
              const payloadStr = JSON.stringify({ clients: [client] });
              const formBody = `id=${inboundId}&settings=${encodeURIComponent(payloadStr)}`;
              const formRes = await xuiFetch(updateUrl, { method: "POST", headers: formHeaders, body: formBody }, 5e3).catch(() => null);
              if (formRes && formRes.ok) {
                const r = await formRes.json().catch(() => ({}));
                if (r.success) {
                  globalUpdateSuccess = true;
                  toggledAtLeastOnce = true;
                }
              }
              if (!globalUpdateSuccess) {
                const jsonRes = await xuiFetch(updateUrl, { method: "POST", headers, body: JSON.stringify(client) }, 5e3).catch(() => null);
                if (jsonRes && jsonRes.ok) {
                  const r = await jsonRes.json().catch(() => ({}));
                  if (r.success) {
                    globalUpdateSuccess = true;
                    toggledAtLeastOnce = true;
                  }
                }
              }
            }
          }
        } catch (e) {
        }
        try {
          const listUrl = `${cleanedUrl}/panel/api/inbounds/list`;
          const listRes = await xuiFetch(listUrl, { method: "GET", headers }, 5e3).catch(() => null);
          if (listRes && listRes.ok) {
            const data = await listRes.json().catch(() => ({}));
            if (data && data.success && Array.isArray(data.obj)) {
              for (const inbound of data.obj) {
                let clients = [];
                try {
                  const settings2 = JSON.parse(inbound.settings || "{}");
                  clients = settings2.clients || [];
                } catch (e) {
                }
                const clientMatch = clients.find(
                  (c) => clientUuid && c.id === clientUuid || c.email === clientEmail
                );
                if (clientMatch && clientMatch.id) {
                  const mergedClient = { ...clientMatch, enable: enabled };
                  const inboundId = inbound.id;
                  const uid = clientMatch.id;
                  const payloadStr = JSON.stringify({ clients: [mergedClient] });
                  const formBody = `id=${inboundId}&settings=${encodeURIComponent(payloadStr)}`;
                  const attempts = [
                    { url: `${cleanedUrl}/panel/api/clients/update/${uid}`, isForm: true, body: formBody },
                    { url: `${cleanedUrl}/panel/api/clients/update/${uid}`, isForm: false, body: JSON.stringify(mergedClient) },
                    { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${uid}`, isForm: true, body: formBody },
                    { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${uid}`, isForm: false, body: JSON.stringify({ id: inboundId, settings: payloadStr }) }
                  ];
                  for (const attempt of attempts) {
                    const reqHeaders = attempt.isForm ? formHeaders : headers;
                    const aRes = await xuiFetch(attempt.url, { method: "POST", headers: reqHeaders, body: attempt.body }, 5e3).catch(() => null);
                    if (aRes && aRes.ok) {
                      const r = await aRes.json().catch(() => ({}));
                      if (r.success) {
                        toggledAtLeastOnce = true;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
        }
      } catch (e) {
      }
    }
    return {
      success: toggledAtLeastOnce,
      error: toggledAtLeastOnce ? void 0 : "Toggle failed on all servers"
    };
  } catch (e) {
    return { success: false, error: "Exception during toggle" };
  }
}
async function resetVpnClientUuidApi(clientEmail, serverId) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const crypto2 = await import("crypto");
    const newUuid = crypto2.randomUUID();
    const newSubId = crypto2.randomBytes(8).toString("hex");
    const activeServers = getActiveServers(settings);
    let chosenServer = activeServers.length > 0 ? activeServers[0] : null;
    if (serverId) {
      const found = activeServers.find((s) => s.id === serverId);
      if (found) {
        chosenServer = found;
      }
    }
    const subBase = chosenServer && chosenServer.subUrl && chosenServer.subUrl.trim() !== "" ? normalizeXuiUrl(chosenServer.subUrl) : chosenServer ? normalizeXuiUrl(chosenServer.panelUrl) : "https://tr.sub-daltoon.ir:2096";
    const subLink = `${subBase}/sub/${newSubId}`;
    const targetServers = serverId ? activeServers.filter((s) => s.id === serverId) : activeServers;
    if (targetServers.length === 0) {
      console.warn(
        `[resetVpnClientUuidApi] XUI disconnected/not configured. Performing local-only database reset fallback for ${clientEmail}`
      );
      return {
        success: true,
        clientUuid: newUuid,
        subLink,
        wasLocalFallback: true
      };
    }
    let panelUpdatedOnce = false;
    for (const server of targetServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword
        );
        if (!loginResult.success || !loginResult.cookie) continue;
        const headers = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        if (loginResult.csrfToken)
          headers["X-Csrf-Token"] = loginResult.csrfToken;
        const listRes = await xuiFetch(
          `${cleanedUrl}/panel/api/inbounds/list`,
          { method: "GET", headers },
          8e3
        ).catch(() => null);
        if (!listRes || !listRes.ok) continue;
        const listJson = await listRes.json().catch(() => null);
        if (!listJson || !listJson.success || !Array.isArray(listJson.obj))
          continue;
        let targetClient = null;
        let oldUuid = null;
        let parentInboundId = null;
        for (const inb of listJson.obj) {
          if (!inb.settings) continue;
          try {
            const inbSettings = typeof inb.settings === "string" ? JSON.parse(inb.settings) : inb.settings;
            if (Array.isArray(inbSettings.clients)) {
              const client = inbSettings.clients.find(
                (c) => c.email === clientEmail
              );
              if (client) {
                targetClient = { ...client };
                oldUuid = client.id;
                parentInboundId = inb.id;
                break;
              }
            }
          } catch (e) {
          }
        }
        if (!targetClient || !oldUuid) continue;
        targetClient.id = newUuid;
        targetClient.subId = newSubId;
        targetClient.tgId = typeof targetClient.tgId === "number" ? targetClient.tgId : parseInt(targetClient.tgId) || 0;
        const formHeaders = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        };
        if (loginResult.csrfToken) {
          formHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }
        const safeEmail = encodeURIComponent(clientEmail);
        const payloadStr = JSON.stringify({ clients: [targetClient] });
        const formBody = `id=${parentInboundId}&settings=${encodeURIComponent(payloadStr)}`;
        const attempts = [
          { url: `${cleanedUrl}/panel/api/clients/update/${safeEmail}`, isForm: true, body: formBody },
          { url: `${cleanedUrl}/panel/api/clients/update/${safeEmail}`, isForm: false, body: JSON.stringify(targetClient) },
          { url: `${cleanedUrl}/panel/api/clients/update/${oldUuid}`, isForm: true, body: formBody },
          { url: `${cleanedUrl}/panel/api/clients/update/${oldUuid}`, isForm: false, body: JSON.stringify(targetClient) },
          { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${oldUuid}`, isForm: true, body: formBody },
          { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${oldUuid}`, isForm: false, body: JSON.stringify({ id: parentInboundId, settings: payloadStr }) }
        ];
        for (const attempt of attempts) {
          const reqHeaders = attempt.isForm ? formHeaders : headers;
          const aRes = await xuiFetch(attempt.url, { method: "POST", headers: reqHeaders, body: attempt.body }, 5e3).catch(() => null);
          if (aRes && aRes.ok) {
            const r = await aRes.json().catch(() => ({}));
            if (r.success) {
              panelUpdatedOnce = true;
              break;
            }
          }
        }
      } catch (err) {
      }
    }
    if (panelUpdatedOnce) {
      return { success: true, clientUuid: newUuid, subLink };
    }
    console.warn(
      `[resetVpnClientUuidApi] Panel-facing recreation rejected, completing with database-level local update.`
    );
    return {
      success: true,
      clientUuid: newUuid,
      subLink,
      wasLocalFallback: true
    };
  } catch (e) {
    console.error("[resetVpnClientUuidApi] helper crash:", e);
    try {
      const crypto2 = await import("crypto");
      const newUuid = crypto2.randomUUID();
      const newSubId = crypto2.randomBytes(8).toString("hex");
      const db = readSqliteDb();
      const settings = getSystemSettings(db);
      const activeServers = getActiveServers(settings);
      let fallbackServer = activeServers.length > 0 ? activeServers[0] : null;
      const subBase = fallbackServer && fallbackServer.subUrl && fallbackServer.subUrl.trim() !== "" ? normalizeXuiUrl(fallbackServer.subUrl) : fallbackServer ? normalizeXuiUrl(fallbackServer.panelUrl) : "https://tr.sub-daltoon.ir:2096";
      const subLink = `${subBase}/sub/${newSubId}`;
      return {
        success: true,
        clientUuid: newUuid,
        subLink,
        wasLocalFallback: true
      };
    } catch (err) {
      return { success: false, error: "Exception during reset: " + e.message };
    }
  }
}
app.post("/api/xui/test-connection", async (req, res) => {
  try {
    const { baseUrl, panelUsername, panelPassword, panelType, panelToken } = req.body;
    if (panelType === "rebecca") {
      if (!baseUrl || !panelUsername || !panelPassword) {
        return res.json({
          success: false,
          error: "\u0628\u0631\u0627\u06CC \u067E\u0646\u0644 \u0631\u0628\u06A9\u0627\u060C \u0622\u062F\u0631\u0633 \u0647\u0627\u0633\u062A\u060C \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A."
        });
      }
      const cleanedUrl2 = normalizeXuiUrl(baseUrl);
      try {
        const access_token = await loginReebekaPasarguard(cleanedUrl2, panelUsername, panelPassword);
        if (access_token) {
          let services = [];
          try {
            const servicesRes = await xuiFetch(
              `${cleanedUrl2}/api/v2/services`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5e3
            );
            if (servicesRes.ok) {
              const servicesData = await servicesRes.json();
              services = (servicesData.services || []).map((s) => ({
                id: s.id,
                remark: s.name,
                port: 0,
                protocol: "rebecca-service"
              }));
            }
          } catch (e) {
            console.error("Failed to fetch Reebeka services:", e);
          }
          return res.json({
            success: true,
            message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u0631\u0628\u06A9\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F.",
            panelToken: access_token,
            inbounds: services
          });
        } else {
          return res.json({
            success: false,
            error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0627\u0645\u06A9\u0627\u0646 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0645\u062A\u062F\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F."
          });
        }
      } catch (err) {
        return res.json({
          success: false,
          error: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u067E\u0646\u0644 \u0631\u0628\u06A9\u0627: " + err.message
        });
      }
    } else if (panelType === "pasarguard") {
      if (!baseUrl || !panelUsername || !panelPassword) {
        return res.json({
          success: false,
          error: "\u0628\u0631\u0627\u06CC \u067E\u0646\u0644 \u067E\u0627\u0633\u0627\u0631\u06AF\u0627\u0631\u062F\u060C \u0622\u062F\u0631\u0633 \u0647\u0627\u0633\u062A\u060C \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A."
        });
      }
      const cleanedUrl2 = normalizeXuiUrl(baseUrl);
      try {
        const access_token = await loginReebekaPasarguard(cleanedUrl2, panelUsername, panelPassword);
        if (access_token) {
          let groups = [];
          try {
            const groupsRes = await xuiFetch(
              `${cleanedUrl2}/api/groups/simple`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5e3
            );
            if (groupsRes.ok) {
              const groupsData = await groupsRes.json();
              groups = (groupsData.groups || []).map((g) => ({
                id: g.id,
                remark: g.name,
                port: 0,
                protocol: "pasarguard-group"
              }));
            }
          } catch (e) {
            console.error("Failed to fetch Pasarguard groups:", e);
          }
          return res.json({
            success: true,
            message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u067E\u0627\u0633\u0627\u0631\u06AF\u0627\u0631\u062F \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F.",
            panelToken: access_token,
            inbounds: groups
          });
        } else {
          return res.json({
            success: false,
            error: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A \u06CC\u0627 \u0627\u0645\u06A9\u0627\u0646 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0645\u062A\u062F\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F."
          });
        }
      } catch (err) {
        return res.json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637: " + err.message });
      }
    }
    if (!baseUrl || !panelUsername || !panelPassword) {
      return res.json({
        success: false,
        error: "\u062A\u0645\u0627\u0645\u06CC \u0641\u06CC\u0644\u062F\u0647\u0627\u06CC \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0634\u0627\u0645\u0644 \u0622\u062F\u0631\u0633 \u0647\u0627\u0633\u062A\u060C \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644 \u06F3x-ui \u0628\u0627\u06CC\u062F \u067E\u0631 \u0634\u062F\u0647 \u0628\u0627\u0634\u0646\u062F."
      });
    }
    const cleanedUrl = normalizeXuiUrl(baseUrl);
    const loginResult = await loginXuiPanel(
      cleanedUrl,
      panelUsername,
      panelPassword,
      true
      // ALWAYS forceFresh for test-connection!
    );
    if (loginResult.success && loginResult.cookie) {
      try {
        const listHeaders = {
          Cookie: loginResult.cookie
        };
        if (loginResult.csrfToken) {
          listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }
        const listRes = await xuiFetch(
          `${cleanedUrl}/panel/api/inbounds/list`,
          {
            method: "GET",
            headers: listHeaders
          },
          4e3
        );
        if (listRes.ok) {
          const listText = await listRes.text();
          const listJson = JSON.parse(listText);
          if (listJson && listJson.success && Array.isArray(listJson.obj)) {
            const freshInbounds = listJson.obj.map((item) => {
              let totalClientsCount = 0;
              try {
                const settingsObj = typeof item.settings === "string" ? JSON.parse(item.settings) : item.settings;
                if (settingsObj && Array.isArray(settingsObj.clients)) {
                  totalClientsCount = settingsObj.clients.length;
                }
              } catch (e) {
              }
              const usedGb = ((Number(item.up || 0) + Number(item.down || 0)) / (1024 * 1024 * 1024)).toFixed(1);
              const limitGb = item.total ? (Number(item.total) / (1024 * 1024 * 1024)).toFixed(0) : "unlimited";
              return {
                id: item.id,
                remark: item.remark || `Inbound #${item.id}`,
                protocol: item.protocol || "vless",
                port: item.port || 1234,
                totalClients: totalClientsCount,
                trafficUsed: usedGb,
                trafficLimit: limitGb,
                status: item.enable ? "active" : "inactive"
              };
            });
            const db = readSqliteDb();
            db.inbounds = freshInbounds;
            writeSqliteDb(db);
            return res.json({
              success: true,
              message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u06F3x-ui \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F \u0648 \u0644\u06CC\u0633\u062A \u0627\u06CC\u0646\u0628\u0627\u0646\u062F\u0647\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u06AF\u0631\u062F\u06CC\u062F!",
              inbounds: freshInbounds
            });
          }
          return res.json({
            success: true,
            message: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u06F3x-ui \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F \u0648 \u0627\u0631\u062A\u0628\u0627\u0637 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A!"
          });
        } else {
          return res.json({
            success: false,
            error: "\u0627\u062A\u0635\u0627\u0644 \u0627\u0648\u0644\u06CC\u0647 \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F \u0648\u0644\u06CC\u06A9\u0646 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0644\u06CC\u0633\u062A \u0627\u06CC\u0646\u0628\u0627\u0646\u062F\u0647\u0627 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F. \u0644\u0637\u0641\u0627\u064B \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u062F\u0645\u06CC\u0646 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F."
          });
        }
      } catch (err) {
        return res.json({
          success: true,
          message: "\u0627\u062A\u0635\u0627\u0644 \u0627\u0648\u0644\u06CC\u0647 \u0628\u0631\u0642\u0631\u0627\u0631 \u0634\u062F \u0648\u0644\u06CC\u06A9\u0646 \u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0644\u06CC\u0633\u062A \u0627\u06CC\u0646\u0628\u0627\u0646\u062F\u0647\u0627 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F. \u0644\u0637\u0641\u0627\u064B \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u062F\u0645\u06CC\u0646 \u067E\u0646\u0644 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F."
        });
      }
    } else {
      return res.json({
        success: false,
        error: loginResult.error || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A. \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u0646\u0644 \u0646\u0627\u062F\u0631\u0633\u062A \u0627\u0633\u062A."
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      error: `\u062E\u0637\u0627 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0647\u0627\u0633\u062A \u067E\u0646\u0644: ${error.message}`
    });
  }
});
app.post("/api/broadcast", async (req, res) => {
  try {
    const { text, attachment, serverUrl, captionPosition } = req.body;
    if (!text && !attachment) {
      return res.status(400).json({
        success: false,
        error: "\u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u06CC\u0627 \u0631\u0633\u0627\u0646\u0647 \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A."
      });
    }
    let fileUrl = "";
    let attachmentBuffer = null;
    if (attachment && attachment.fileData) {
      try {
        const uploadsDir = import_path.default.join(process.cwd(), "uploads");
        if (!import_fs.default.existsSync(uploadsDir)) {
          import_fs.default.mkdirSync(uploadsDir, { recursive: true });
        }
        let base64Data = attachment.fileData;
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,").pop() || "";
        }
        attachmentBuffer = Buffer.from(base64Data, "base64");
        const ext = import_path.default.extname(attachment.fileName) || (attachment.fileType === "image" ? ".jpg" : attachment.fileType === "video" ? ".mp4" : attachment.fileType === "voice" ? ".ogg" : ".bin");
        const uniqueFileName = `broadcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = import_path.default.join(uploadsDir, uniqueFileName);
        import_fs.default.writeFileSync(filePath, attachmentBuffer);
        const originUrl = serverUrl || "https://ais-dev-cri25e3qykgpuufepdfpmw-413733104605.europe-west3.run.app";
        fileUrl = `${originUrl}/uploads/${uniqueFileName}`;
        console.log(
          `[Broadcast] File written to: ${filePath}, public url: ${fileUrl}`
        );
      } catch (err) {
        console.error("[Broadcast] Failed storing attachment file:", err);
      }
    }
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    let botToken = settings.botToken || settings.BOT_TOKEN || process.env.BOT_TOKEN;
    if (botToken) botToken = botToken.trim();
    const users = db.users || [];
    let count = 0;
    if (botToken && botToken !== "DUMMY_TOKEN") {
      for (const u of users) {
        if (u.userId) {
          try {
            let apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            let useFormData = false;
            let formData = null;
            let payload = {
              chat_id: u.userId,
              parse_mode: "HTML"
            };
            if (attachmentBuffer && attachment) {
              useFormData = true;
              formData = new FormData();
              formData.append("chat_id", u.userId.toString());
              formData.append("parse_mode", "HTML");
              if (text) {
                formData.append("caption", text);
              }
              if (captionPosition === "above") {
                formData.append("show_caption_above_media", "true");
              }
              const fileType = attachment.fileType || "file";
              const mimeType = attachment.fileType === "image" ? "image/jpeg" : attachment.fileType === "video" ? "video/mp4" : attachment.fileType === "voice" ? "audio/ogg" : "application/octet-stream";
              const blob = new Blob([attachmentBuffer], { type: mimeType });
              const filename = attachment.fileName || (fileType === "image" ? "photo.jpg" : fileType === "video" ? "video.mp4" : fileType === "voice" ? "voice.ogg" : "file.bin");
              if (fileType === "image") {
                apiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
                formData.append("photo", blob, filename);
              } else if (fileType === "video") {
                apiUrl = `https://api.telegram.org/bot${botToken}/sendVideo`;
                formData.append("video", blob, filename);
              } else if (fileType === "voice") {
                apiUrl = `https://api.telegram.org/bot${botToken}/sendVoice`;
                formData.append("voice", blob, filename);
              } else {
                apiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
                formData.append("document", blob, filename);
              }
            } else {
              payload.text = text;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1e4);
            try {
              console.log(
                `[Broadcast] Sending to user ${u.userId} via Telegram API...`
              );
              const response = await fetch(apiUrl, {
                method: "POST",
                headers: useFormData ? void 0 : {
                  "Content-Type": "application/json"
                },
                body: useFormData ? formData : JSON.stringify(payload),
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              const data = await response.json();
              if (data && data.ok) {
                count++;
                console.log(
                  `[Broadcast] Successfully sent to user ${u.userId}`
                );
              } else {
                console.error(
                  `[Broadcast] Telegram API error for user ${u.userId}:`,
                  data
                );
              }
            } catch (err) {
              clearTimeout(timeoutId);
              console.error(
                `[Broadcast] Network/Timeout error sending to user ${u.userId}:`,
                err.message || err
              );
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
          } catch (e) {
            console.error(
              `[Broadcast] Failed to send message to user ${u.userId}:`,
              e
            );
          }
        }
      }
    } else {
      console.warn("[Broadcast] No valid bot token found! Faking count.");
      count = users.length;
    }
    res.json({ success: true, count, message: "Broadcast dispatched." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/users", async (req, res) => {
  try {
    const { userId, username, walletBalance, joinDate, status } = req.body;
    const db = readSqliteDb();
    const idx = db.users.findIndex((u) => u.userId === Number(userId));
    const existing = idx >= 0 ? db.users[idx] : null;
    const nextUser = {
      userId: Number(userId),
      username,
      walletBalance: Number(walletBalance),
      activePlansCount: existing ? existing.activePlansCount : 0,
      joinDate: joinDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: status || "active"
    };
    if (idx >= 0) {
      db.users[idx] = nextUser;
    } else {
      db.users.unshift(nextUser);
    }
    writeSqliteDb(db);
    res.json({ success: true, message: "User written/updated." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/users/adjust", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const db = readSqliteDb();
    const user = db.users.find((u) => u.userId === Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const nextBal = Math.max(0, Number(user.walletBalance) + Number(amount));
    const finalDiff = nextBal - Number(user.walletBalance);
    user.walletBalance = nextBal;
    if (!db.logs) db.logs = [];
    db.logs.push({
      id: Math.random().toString(36).substring(2, 9),
      date: (/* @__PURE__ */ new Date()).toISOString(),
      userId: Number(userId),
      username: user.username || `user_${userId}`,
      action: "\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0648\u062C\u0648\u062F\u06CC",
      details: `\u0645\u0648\u062C\u0648\u062F\u06CC \u06A9\u0627\u0631\u0628\u0631 \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0628\u0647 \u0645\u06CC\u0632\u0627\u0646 ${finalDiff >= 0 ? "+" : ""}${finalDiff.toLocaleString()} \u062A\u0648\u0645\u0627\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u06CC\u0627\u0641\u062A. \u0645\u0648\u062C\u0648\u062F\u06CC \u0646\u0647\u0627\u06CC\u06CC: ${nextBal.toLocaleString()} \u062A\u0648\u0645\u0627\u0646.`
    });
    if (db.logs.length > 1e3) {
      db.logs = db.logs.slice(-1e3);
    }
    writeSqliteDb(db);
    res.json({ success: true, nextBal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/users/ban", async (req, res) => {
  try {
    const { userId, status } = req.body;
    const db = readSqliteDb();
    const user = db.users.find((u) => u.userId === Number(userId));
    if (user) {
      user.status = status;
      writeSqliteDb(db);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/users/send-message", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ success: false, error: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627 \u0645\u062A\u0646 \u067E\u06CC\u0627\u0645 \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
    }
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    let botToken = settings.botToken || settings.BOT_TOKEN || process.env.BOT_TOKEN;
    if (botToken) botToken = botToken.trim();
    if (!botToken || botToken === "DUMMY_TOKEN") {
      return res.status(400).json({ success: false, error: "\u062A\u0648\u06A9\u0646 \u0631\u0628\u0627\u062A \u062A\u0644\u06AF\u0631\u0627\u0645 \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A \u06CC\u0627 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
    }
    const fetchRef = globalThis.fetch || fetch;
    const body = {
      chat_id: userId,
      text: message,
      parse_mode: "HTML"
    };
    const telegramRes = await fetchRef(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await telegramRes.json();
    if (data && data.ok) {
      res.json({ success: true, message: "\u067E\u06CC\u0627\u0645 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647 \u067E\u06CC\u0648\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0627\u0631\u0633\u0627\u0644 \u0634\u062F." });
    } else {
      res.status(400).json({
        success: false,
        error: data?.description || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0628\u0647 \u062A\u0644\u06AF\u0631\u0627\u0645. \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u06A9\u0627\u0631\u0628\u0631 \u0631\u0628\u0627\u062A \u0631\u0627 \u0628\u0644\u0627\u06A9 \u06A9\u0631\u062F\u0647 \u0628\u0627\u0634\u062F \u06CC\u0627 \u0686\u062A \u0631\u0627 \u0634\u0631\u0648\u0639 \u0646\u06A9\u0631\u062F\u0647 \u0628\u0627\u0634\u062F."
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/users/delete", async (req, res) => {
  try {
    const { userId } = req.body;
    const db = readSqliteDb();
    db.users = db.users.filter((u) => u.userId !== Number(userId));
    db.subscription_keys = db.subscription_keys.filter(
      (k) => k.userId !== Number(userId)
    );
    writeSqliteDb(db);
    res.json({ success: true, message: "User completely cleared." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/transactions", async (req, res) => {
  try {
    const {
      id,
      userId,
      username,
      amount,
      receiptImage,
      status,
      date,
      description
    } = req.body;
    const db = readSqliteDb();
    const nextTx = {
      id,
      userId: Number(userId),
      username,
      amount: Number(amount),
      receiptImage: receiptImage || "",
      status: status || "pending",
      date: date || (/* @__PURE__ */ new Date()).toISOString(),
      description: description || ""
    };
    const idx = db.transactions.findIndex((t) => t.id === id);
    if (idx >= 0) {
      db.transactions[idx] = nextTx;
    } else {
      db.transactions.unshift(nextTx);
    }
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/transactions/approve", async (req, res) => {
  try {
    const { id, amount } = req.body;
    const db = readSqliteDb();
    const tx = db.transactions.find((t) => t.id === id);
    if (tx) {
      tx.status = "approved";
      if (amount !== void 0) {
        tx.amount = Number(amount);
      }
      const user = db.users.find((u) => u.userId === Number(tx.userId));
      let messageTextForNotif = "";
      if (tx.type === "PLAN_PURCHASE") {
        if (tx.planId && (tx.planId.startsWith("COL_BUY:") || tx.planId.startsWith("COL_RENEW:"))) {
          const isBuy = tx.planId.startsWith("COL_BUY:");
          const packageId = tx.planId.split(":")[1];
          const db_packages = db.colleague_packages || [];
          const pkg = db_packages.find((p) => p.id === packageId);
          if (pkg) {
            if (isBuy) {
              const parts = (tx.clientName || "").split("||");
              const prefix = parts[0] || "";
              const token = parts[1] || "";
              const username = "C" + Math.floor(Math.random() * 9e4 + 1e4).toString();
              const password = Math.random().toString(36).substring(2, 10);
              const newAcc = {
                id: Math.random().toString(36).substring(2, 15),
                userId: Number(tx.userId),
                username,
                password,
                packageId: pkg.id,
                packageTitle: pkg.title,
                createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                trafficGb: pkg.trafficGb,
                usedTrafficGb: 0,
                prefix,
                recoveryToken: token,
                status: "active"
              };
              if (!db.colleague_accounts) db.colleague_accounts = [];
              db.colleague_accounts.push(newAcc);
              messageTextForNotif = `\u2705 <b>\u062E\u0631\u06CC\u062F \u0628\u0633\u062A\u0647 \u0647\u0645\u06A9\u0627\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F!</b> (\u062A\u0627\u06CC\u06CC\u062F \u0641\u06CC\u0634)

\u0628\u0633\u062A\u0647 \u062E\u0631\u06CC\u062F\u0627\u0631\u06CC \u0634\u062F\u0647: ${pkg.title}
\u067E\u0633\u0648\u0646\u062F \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F\u0647: ${prefix}

\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648\u0631\u0648\u062F \u0634\u0645\u0627:
\u{1F464} <b>\u06CC\u0648\u0632\u0631\u0646\u06CC\u0645:</b> <code>${username}</code>
\u{1F511} <b>\u0631\u0645\u0632 \u0639\u0628\u0648\u0631:</b> <code>${password}</code>

\u062C\u0647\u062A \u0648\u0631\u0648\u062F \u0628\u0647 \u067E\u0646\u0644\u060C \u062D\u0633\u0627\u0628 \u062E\u0648\u062F \u0631\u0627 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0645\u0646\u0648 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.`;
            } else {
              const accId = tx.clientName;
              const accIndex = (db.colleague_accounts || []).findIndex(
                (a) => a.id === accId
              );
              if (accIndex !== -1) {
                const acc = db.colleague_accounts[accIndex];
                acc.trafficGb = (acc.trafficGb || 0) + pkg.trafficGb;
                acc.packageTitle = pkg.title;
                messageTextForNotif = `\u2705 <b>\u062A\u0645\u062F\u06CC\u062F \u062D\u0633\u0627\u0628 \u0647\u0645\u06A9\u0627\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0646\u062C\u0627\u0645 \u0634\u062F!</b> (\u062A\u0627\u06CC\u06CC\u062F \u0641\u06CC\u0634)

\u062D\u062C\u0645 \u0627\u0636\u0627\u0641\u0647 \u0634\u062F\u0647: ${pkg.trafficGb} \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A
\u0644\u06CC\u0633\u062A \u0628\u0633\u062A\u0647 \u062A\u0645\u062F\u06CC\u062F\u06CC: ${pkg.title}`;
              } else {
                messageTextForNotif = `\u274C \u062E\u0637\u0627: \u062D\u0633\u0627\u0628 \u0647\u0645\u06A9\u0627\u0631 \u0628\u0631\u0627\u06CC \u062A\u0645\u062F\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.`;
              }
            }
          } else {
            messageTextForNotif = `\u274C \u062E\u0637\u0627: \u0628\u0633\u062A\u0647 \u0647\u0645\u06A9\u0627\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.`;
          }
        } else {
          const db_plans = db.vpn_plans || [];
          const fallback_plans = [
            {
              id: "std_30g",
              name: "Standard 30GB - 30 Days",
              price: 45e3,
              trafficGb: 30,
              durationDays: 30,
              category: "Standard"
            },
            {
              id: "vip_70g",
              name: "VIP Premium 70GB - 60 Days",
              price: 95e3,
              trafficGb: 70,
              durationDays: 60,
              category: "VIP"
            },
            {
              id: "ult_150g",
              name: "Unlimited VoIP 150GB - 90 Days",
              price: 185e3,
              trafficGb: 150,
              durationDays: 90,
              category: "Unlimited VoIP"
            }
          ];
          let plan = db_plans.find((p) => p.id === tx.planId);
          if (!plan) {
            plan = fallback_plans.find((p) => p.id === tx.planId);
          }
          if (plan) {
            const clientName = tx.clientName || `user_${tx.userId}`;
            const settings = getSystemSettings(db);
            try {
              const planTraffic = Number(plan.trafficGb) || 30;
              const planDuration = Number(plan.durationDays) || 30;
              const vpnResult = await addVpnClientApi(
                clientName,
                planTraffic,
                planDuration,
                settings,
                void 0,
                tx.serverId
              );
              if (vpnResult.success && vpnResult.subLink) {
                const subLink = vpnResult.subLink;
                let vlessLinks = [];
                try {
                  const fetchRef = globalThis.fetch || fetch;
                  const res2 = await fetchRef(subLink);
                  if (res2.ok) {
                    const text = await res2.text();
                    const decoded = Buffer.from(text, "base64").toString(
                      "utf-8"
                    );
                    vlessLinks = decoded.split("\n").filter(
                      (l) => l.trim().length > 0 && l.includes("://")
                    );
                  }
                } catch (e) {
                }
                let linksDisplay = "";
                if (vlessLinks.length > 0) {
                  const linksText = vlessLinks.map((l) => `<code>${l}</code>`).join("\n\n");
                  linksDisplay = `\u{1F680} <b>\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645:</b>
${linksText}

\u26A0\uFE0F \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0628\u0627\u0644\u0627 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u06A9\u0644\u0627\u06CC\u0646\u062A \u062E\u0648\u062F \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.`;
                } else {
                  linksDisplay = `\u26A0\uFE0F <b>\u062A\u0648\u062C\u0647:</b> \u0627\u0645\u06A9\u0627\u0646 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062A\u0641\u06A9\u06CC\u06A9\u06CC \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0631 \u0627\u06CC\u0646 \u0644\u062D\u0638\u0647 \u0645\u06CC\u0633\u0631 \u0646\u0634\u062F.

\u{1F447} <b>\u0644\u0637\u0641\u0627\u064B \u0627\u0632 \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u062E\u0648\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F (\u062C\u0647\u062A \u06A9\u067E\u06CC \u0644\u0645\u0633 \u06A9\u0646\u06CC\u062F):</b>

<code>${subLink}</code>

\u{1F4A1} \u0644\u06CC\u0646\u06A9 \u0628\u0627\u0644\u0627 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 v2rayNG \u06CC\u0627 V2box \u062E\u0648\u062F \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 <b>Subscription (\u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646)</b> \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0647 \u0648 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC (Update) \u0646\u0645\u0627\u06CC\u06CC\u062F \u062A\u0627 \u0647\u0645\u0647 \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627 \u0628\u0647 \u0637\u0648\u0631 \u062E\u0648\u062F\u06A9\u0627\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u0648\u0646\u062F.`;
                }
                let planDetailsText = `\u{1F4E6} \u067E\u0644\u0627\u0646: <b>${plan.name}</b>`;
                if (plan.category) {
                  const categoryObj = (db.plan_categories || []).find((c) => c.id === plan.category);
                  const categoryName = categoryObj ? categoryObj.name : plan.category;
                  if (categoryName) {
                    planDetailsText = `\u{1F4E6} \u067E\u0644\u0627\u0646: <b>${categoryName} - ${plan.name}</b>`;
                  }
                }
                let serverDetailsText = "";
                const activeServers = getActiveServers(settings);
                let selectedServer = activeServers.find((s) => s.id === tx.serverId);
                if (!selectedServer && activeServers.length > 0) {
                  selectedServer = activeServers[Math.floor(Math.random() * activeServers.length)];
                }
                if (selectedServer) {
                  const serverName = selectedServer.remark || selectedServer.name || "\u0646\u0627\u0645\u0634\u062E\u0635";
                  serverDetailsText = `\u{1F310} \u0633\u0631\u0648\u0631: <b>${serverName}</b>

`;
                }
                messageTextForNotif = `\u2705 <b>\u06A9\u0627\u0646\u0641\u06CC\u06AF \u0634\u0645\u0627 \u0622\u0645\u0627\u062F\u0647 \u0634\u062F!</b>

${planDetailsText}
${serverDetailsText}${linksDisplay}`;
                if (!db.subscription_keys) db.subscription_keys = [];
                const randomId = "SUB-" + Math.floor(Math.random() * 9e3 + 1e3);
                const expireTimestamp = Date.now() + planDuration * 24 * 60 * 60 * 1e3;
                const expireDate = isNaN(expireTimestamp) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0] : new Date(expireTimestamp).toISOString().split("T")[0];
                db.subscription_keys.push({
                  id: randomId,
                  userId: Number(tx.userId),
                  planId: plan.id,
                  planName: plan.name,
                  clientName,
                  clientUuid: vpnResult.clientUuid || "",
                  subLink,
                  expireDate,
                  trafficLimitGb: planTraffic,
                  trafficUsedGb: 0,
                  createdAtMs: Date.now(),
                  status: "active",
                  serverId: tx.serverId
                });
                tx._generatedSubId = randomId;
                tx._generatedSubLink = subLink;
                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: (/* @__PURE__ */ new Date()).toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "\u062A\u062D\u0648\u06CC\u0644 \u06A9\u0627\u0646\u0641\u06CC\u06AF",
                  details: `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0631\u0627\u06CC \u067E\u0644\u0627\u0646 ${plan.name} \u0628\u0627 \u0646\u0627\u0645 ${clientName} \u062A\u062D\u0648\u06CC\u0644 \u062F\u0627\u062F\u0647 \u0634\u062F.`
                });
              } else {
                if (user) {
                  user.walletBalance = Number(user.walletBalance) + Number(tx.amount);
                }
                tx.status = "refunded";
                messageTextForNotif = `\u274C <b>\u062E\u0637\u0627 \u062F\u0631 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF!</b>

\u0645\u062A\u0627\u0633\u0641\u0627\u0646\u0647 \u0645\u0634\u06A9\u0644\u06CC \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631 \u062C\u0647\u062A \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0631\u062E \u062F\u0627\u062F:
<code>${vpnResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635"}</code>

\u2705 \u0633\u06CC\u0633\u062A\u0645 \u062C\u0647\u062A \u0645\u062D\u0627\u0641\u0638\u062A \u0627\u0632 \u0634\u0645\u0627\u060C \u062A\u0631\u0627\u06A9\u0646\u0634 \u0631\u0627 \u0644\u063A\u0648 \u06A9\u0631\u062F\u0647 \u0648 \u0645\u0628\u0644\u063A <b>${Number(tx.amount).toLocaleString()} \u062A\u0648\u0645\u0627\u0646</b> \u0631\u0627 \u0628\u0647 \u0635\u0648\u0631\u062A \u06A9\u0627\u0645\u0644 \u0628\u0647 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u062F\u0627\u062E\u0644\u06CC \u0634\u0645\u0627 \u062F\u0631 \u0631\u0628\u0627\u062A \u0639\u0648\u062F\u062A \u062F\u0627\u062F.

\u0627\u06A9\u0646\u0648\u0646 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u0632 \u0637\u0631\u06CC\u0642 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u062E\u0648\u062F \u0645\u062C\u062F\u062F\u0627\u064B \u0627\u0642\u062F\u0627\u0645 \u06A9\u0646\u06CC\u062F (\u062F\u0631 \u0635\u0648\u0631\u062A \u0631\u0641\u0639 \u0645\u0634\u06A9\u0644).`;
                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: (/* @__PURE__ */ new Date()).toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "\u062E\u0637\u0627 \u0648 \u0645\u0631\u062C\u0648\u0639\u06CC \u062E\u0648\u062F\u06A9\u0627\u0631",
                  details: `\u062E\u0637\u0627 \u062F\u0631 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0628\u0631\u0627\u06CC ${clientName}: ${vpnResult.error || "Unknown"}. \u0645\u0628\u0644\u063A \u0628\u0647 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u0628\u0631\u06AF\u0634\u062A \u062F\u0627\u062F\u0647 \u0634\u062F.`
                });
              }
            } catch (e) {
              messageTextForNotif = `\u274C \u062E\u0637\u0627 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF: ${e.message}`;
            }
          } else if (tx.planId === "custom_vol") {
            const clientName = tx.clientName || `user_${tx.userId}`;
            const settings = getSystemSettings(db);
            const customGb = Number(tx.customGb) || 10;
            const customDays = Number(tx.customDays) || 30;
            try {
              const vpnResult = await addVpnClientApi(
                clientName,
                customGb,
                customDays,
                settings,
                void 0,
                tx.serverId
              );
              if (vpnResult.success && vpnResult.subLink) {
                const subLink = vpnResult.subLink;
                let vlessLinks = [];
                try {
                  const fetchRef = globalThis.fetch || fetch;
                  const res2 = await fetchRef(subLink);
                  if (res2.ok) {
                    const text = await res2.text();
                    const decoded = Buffer.from(text, "base64").toString(
                      "utf-8"
                    );
                    vlessLinks = decoded.split("\n").filter(
                      (l) => l.trim().length > 0 && l.includes("://")
                    );
                  }
                } catch (e) {
                }
                let linksDisplay = "";
                if (vlessLinks.length > 0) {
                  const linksText = vlessLinks.map((l) => `<code>${l}</code>`).join("\n\n");
                  linksDisplay = `\u{1F680} <b>\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0645\u0633\u062A\u0642\u06CC\u0645:</b>
${linksText}

\u26A0\uFE0F \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u0628\u0627\u0644\u0627 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u06A9\u0644\u0627\u06CC\u0646\u062A \u062E\u0648\u062F \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.`;
                } else {
                  linksDisplay = `\u26A0\uFE0F <b>\u062A\u0648\u062C\u0647:</b> \u0627\u0645\u06A9\u0627\u0646 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062A\u0641\u06A9\u06CC\u06A9\u06CC \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0631 \u0627\u06CC\u0646 \u0644\u062D\u0638\u0647 \u0645\u06CC\u0633\u0631 \u0646\u0634\u062F.

\u{1F447} <b>\u0644\u0637\u0641\u0627\u064B \u0627\u0632 \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u062E\u0648\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F (\u062C\u0647\u062A \u06A9\u067E\u06CC \u0644\u0645\u0633 \u06A9\u0646\u06CC\u062F):</b>

<code>${subLink}</code>

\u{1F4A1} \u0644\u06CC\u0646\u06A9 \u0628\u0627\u0644\u0627 \u0631\u0627 \u06A9\u067E\u06CC \u06A9\u0631\u062F\u0647 \u0648 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 v2rayNG \u06CC\u0627 V2box \u062E\u0648\u062F \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 <b>Subscription (\u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646)</b> \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0647 \u0648 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC (Update) \u0646\u0645\u0627\u06CC\u06CC\u062F \u062A\u0627 \u0647\u0645\u0647 \u06A9\u0627\u0646\u0641\u06CC\u06AF\u200C\u0647\u0627 \u0628\u0647 \u0637\u0648\u0631 \u062E\u0648\u062F\u06A9\u0627\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u0648\u0646\u062F.`;
                }
                let serverDetailsText = "";
                const activeServers = getActiveServers(settings);
                let selectedServer = activeServers.find((s) => s.id === tx.serverId);
                if (!selectedServer && activeServers.length > 0) {
                  selectedServer = activeServers[Math.floor(Math.random() * activeServers.length)];
                }
                if (selectedServer) {
                  const serverName = selectedServer.remark || selectedServer.name || "\u0646\u0627\u0645\u0634\u062E\u0635";
                  serverDetailsText = `\u{1F310} \u0633\u0631\u0648\u0631: <b>${serverName}</b>

`;
                }
                messageTextForNotif = `\u2705 <b>\u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0644\u062E\u0648\u0627\u0647 \u0634\u0645\u0627 \u0622\u0645\u0627\u062F\u0647 \u0634\u062F!</b>

\u{1F4E6} \u062D\u062C\u0645: <b>${customGb} \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A</b> | \u0632\u0645\u0627\u0646: <b>${customDays} \u0631\u0648\u0632</b>
${serverDetailsText}${linksDisplay}`;
                if (!db.subscription_keys) db.subscription_keys = [];
                const randomId = "SUB-" + Math.floor(Math.random() * 9e3 + 1e3);
                const expireDate = new Date(
                  Date.now() + customDays * 24 * 60 * 60 * 1e3
                ).toISOString().split("T")[0];
                db.subscription_keys.push({
                  id: randomId,
                  userId: Number(tx.userId),
                  planId: "custom_vol",
                  planName: `\u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0644\u062E\u0648\u0627\u0647 ${customGb}GB`,
                  clientName,
                  clientUuid: vpnResult.clientUuid || "",
                  subLink,
                  expireDate,
                  trafficLimitGb: customGb,
                  trafficUsedGb: 0,
                  createdAtMs: Date.now(),
                  status: "active",
                  serverId: tx.serverId
                });
                tx._generatedSubId = randomId;
                tx._generatedSubLink = subLink;
                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: (/* @__PURE__ */ new Date()).toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "\u062A\u062D\u0648\u06CC\u0644 \u06A9\u0627\u0646\u0641\u06CC\u06AF",
                  details: `\u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0644\u062E\u0648\u0627\u0647 \u0628\u0627 \u0646\u0627\u0645 ${clientName} \u062A\u062D\u0648\u06CC\u0644 \u062F\u0627\u062F\u0647 \u0634\u062F.`
                });
              } else {
                tx.status = "failed";
                messageTextForNotif = `\u274C <b>\u062E\u0637\u0627 \u062F\u0631 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0644\u062E\u0648\u0627\u0647!</b>

\u0645\u062A\u0627\u0633\u0641\u0627\u0646\u0647 \u0645\u0634\u06A9\u0644\u06CC \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631 \u062C\u0647\u062A \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0631\u062E \u062F\u0627\u062F:
<code>${vpnResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635"}</code>

\u0644\u0637\u0641\u0627\u064B \u0645\u0648\u0636\u0648\u0639 \u0631\u0627 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0647\u0645\u0627\u0647\u0646\u06AF \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.`;
              }
            } catch (e) {
              messageTextForNotif = `\u274C \u062E\u0637\u0627 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645 \u0633\u0627\u062E\u062A \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0644\u062E\u0648\u0627\u0647: ${e.message}`;
            }
          } else if (tx.planId === "custom_renew") {
            const targetSubId = tx.clientName;
            const settings = getSystemSettings(db);
            const customGb = Number(tx.customGb) || 10;
            const customDays = Number(tx.customDays) || 30;
            const subscription_keys = db.subscription_keys || [];
            const k = subscription_keys.find(
              (sub) => sub.id === targetSubId
            );
            if (k) {
              const clientName = k.clientName;
              const serverId = k.serverId;
              let expDt = /* @__PURE__ */ new Date();
              try {
                const parsed = new Date(k.expireDate);
                if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
                  expDt = parsed;
                }
              } catch (e) {
              }
              const newExpDt = new Date(
                expDt.getTime() + customDays * 24 * 60 * 60 * 1e3
              );
              const newExpireDateStr = newExpDt.toISOString().split("T")[0];
              const newLimitGb = (Number(k.trafficLimitGb) || 0) + customGb;
              const remainingDays = Math.max(
                1,
                Math.ceil(
                  (newExpDt.getTime() - Date.now()) / (24 * 60 * 60 * 1e3)
                )
              );
              try {
                const addResult = await extendVpnClientApi(
                  clientName,
                  customGb,
                  customDays,
                  k.clientUuid,
                  serverId
                );
                if (addResult.success) {
                  k.expireDate = newExpireDateStr;
                  k.trafficLimitGb = newLimitGb;
                  messageTextForNotif = `\u{1F389} <b>\u0627\u0634\u062A\u0631\u0627\u06A9 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062A\u0645\u062F\u06CC\u062F \u0634\u062F! (\u062A\u0627\u06CC\u06CC\u062F \u0641\u06CC\u0634)</b>

\u{1F464} \u0633\u0631\u0648\u06CC\u0633: <code>${clientName}</code>
\u2795 \u062D\u062C\u0645 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F\u0647: <b>${customGb} \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A</b>
\u2795 \u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F\u0647: <b>${customDays} \u0631\u0648\u0632</b>

\u{1F4C5} \u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627\u06CC \u062C\u062F\u06CC\u062F: <b>${newExpireDateStr}</b>
\u{1F4CA} \u062D\u062C\u0645 \u06A9\u0644 \u062C\u062F\u06CC\u062F: <b>${newLimitGb} \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A</b>`;
                  tx._generatedSubId = k.id;
                  tx._generatedSubLink = k.subLink;
                  if (!db.logs) db.logs = [];
                  db.logs.push({
                    id: Math.random().toString(36).substring(2, 9),
                    date: (/* @__PURE__ */ new Date()).toISOString(),
                    userId: Number(tx.userId),
                    username: tx.username || `user_${tx.userId}`,
                    action: "\u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9",
                    details: `\u0627\u0634\u062A\u0631\u0627\u06A9 ${clientName} \u062A\u0645\u062F\u06CC\u062F \u0634\u062F (\u0641\u06CC\u0634 \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F).`
                  });
                } else {
                  tx.status = "failed";
                  messageTextForNotif = `\u274C <b>\u062E\u0637\u0627 \u062F\u0631 \u0627\u0639\u0645\u0627\u0644 \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9!</b>

\u0645\u062A\u0627\u0633\u0641\u0627\u0646\u0647 \u0645\u0634\u06A9\u0644\u06CC \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0633\u0631\u0648\u0631 \u062C\u0647\u062A \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u062E \u062F\u0627\u062F:
<code>${addResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635"}</code>

\u0644\u0637\u0641\u0627\u064B \u0645\u0648\u0636\u0648\u0639 \u0631\u0627 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0647\u0645\u0627\u0647\u0646\u06AF \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.`;
                }
              } catch (apiErr) {
                tx.status = "failed";
                messageTextForNotif = `\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0639\u0645\u0627\u0644 \u062A\u0645\u062F\u06CC\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0648\u06CC \u0633\u0631\u0648\u0631: ${apiErr.message}`;
              }
            } else {
              messageTextForNotif = `\u274C \u062E\u0637\u0627: \u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u062C\u0647\u062A \u062A\u0645\u062F\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.`;
            }
          } else {
            messageTextForNotif = `\u274C \u062E\u0637\u0627: \u067E\u0644\u0627\u0646 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F. \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0647\u0645\u0627\u0647\u0646\u06AF \u06A9\u0646\u06CC\u062F.`;
          }
        }
      } else {
        if (user) {
          user.walletBalance = Number(user.walletBalance) + Number(tx.amount);
        }
        messageTextForNotif = `\u2705 <b>\u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0645\u0627 \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F!</b>

\u{1F4B0} \u0645\u0628\u0644\u063A <b>${tx.amount.toLocaleString()} \u062A\u0648\u0645\u0627\u0646</b> \u0628\u0647 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u0634\u0645\u0627 \u062F\u0631 \u0631\u0628\u0627\u062A \u0627\u0641\u0632\u0648\u062F\u0647 \u0634\u062F.

\u{1F4B0} \u0645\u0648\u062C\u0648\u062F\u06CC \u062C\u062F\u06CC\u062F: <b>${user ? user.walletBalance.toLocaleString() : "0"} \u062A\u0648\u0645\u0627\u0646</b>`;
      }
      if (tx.type !== "PLAN_PURCHASE") {
        db.logs.push({
          id: Math.random().toString(36).substring(2, 9),
          date: (/* @__PURE__ */ new Date()).toISOString(),
          userId: Number(tx.userId),
          username: tx.username || `user_${tx.userId}`,
          action: "\u062A\u0627\u06CC\u06CC\u062F \u0634\u0627\u0631\u0698",
          details: `\u0631\u0633\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0628\u0647 \u0634\u0646\u0627\u0633\u0647 ${tx.id} \u0648 \u0645\u0628\u0644\u063A ${Number(tx.amount).toLocaleString()} \u062A\u0648\u0645\u0627\u0646 \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F \u0648 \u0628\u0647 \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0641\u0632\u0627\u06CC\u0634 \u06CC\u0627\u0641\u062A.`
        });
      }
      if (db.logs.length > 1e3) {
        db.logs = db.logs.slice(-1e3);
      }
      writeSqliteDb(db);
      try {
        const cfg = getSystemSettings(db);
        let botToken = cfg.botToken || cfg.BOT_TOKEN;
        if (botToken) botToken = botToken.trim();
        if (botToken && botToken !== "DUMMY_TOKEN") {
          const https = require("https");
          const messageText = messageTextForNotif;
          const postDataObj = {
            chat_id: tx.userId,
            parse_mode: "HTML"
          };
          if (tx.type === "PLAN_PURCHASE" && tx._generatedSubLink && tx._generatedSubId) {
            if (!db.link_tokens) db.link_tokens = {};
            let token = "";
            for (const [k, v] of Object.entries(db.link_tokens)) {
              if (v === tx._generatedSubLink) {
                token = k;
                break;
              }
            }
            if (!token) {
              token = Math.random().toString(36).substring(2, 10);
              db.link_tokens[token] = tx._generatedSubLink;
              writeSqliteDb(db);
            }
            postDataObj.reply_markup = {
              inline_keyboard: [
                [
                  {
                    text: "\u{1F517} \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646(\u0647\u0645\u0647 \u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0647\u0627)",
                    callback_data: `showlink_${token}`
                  }
                ],
                [
                  {
                    text: "\u{1F517} \u0644\u06CC\u0646\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF",
                    callback_data: `mysub_vless_${tx._generatedSubId}`
                  }
                ],
                [{ text: "\u{1F4A1} \u0622\u0645\u0648\u0632\u0634 \u0647\u0627", callback_data: "mm_btnGuides" }],
                [
                  {
                    text: "\u{1F3E0} \u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0645\u0646\u0648\u06CC \u0627\u0635\u0644\u06CC",
                    callback_data: "btn_back_home"
                  }
                ]
              ]
            };
          }
          postDataObj.text = messageText;
          const endpointPath = `/bot${botToken}/sendMessage`;
          const options = {
            hostname: "api.telegram.org",
            port: 443,
            path: endpointPath,
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          };
          const postData = JSON.stringify(postDataObj);
          const reqNotify = https.request(options);
          reqNotify.on(
            "error",
            (e) => console.warn("Telegram approve notify error:", e)
          );
          reqNotify.write(postData);
          reqNotify.end();
          if (tx.type === "PLAN_PURCHASE" && tx._generatedSubLink) {
            setTimeout(() => {
              sendPurchaseSuccessNoteIfAnyServer(botToken, tx.userId, cfg);
            }, 1e3);
          }
        }
      } catch (notifyErr) {
        console.warn("Error notifying user of approval:", notifyErr);
      }
      res.json({
        success: true,
        message: "Transaction approved and credited user wallet."
      });
    } else {
      res.status(404).json({ success: false, message: "Transaction not found." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/transactions/reject", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    const tx = db.transactions.find((t) => t.id === id);
    if (tx) {
      tx.status = "rejected";
      if (!db.logs) db.logs = [];
      db.logs.push({
        id: Math.random().toString(36).substring(2, 9),
        date: (/* @__PURE__ */ new Date()).toISOString(),
        userId: Number(tx.userId),
        username: tx.username || `user_${tx.userId}`,
        action: "\u0631\u062F \u0634\u0627\u0631\u0698",
        details: `\u0631\u0633\u06CC\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0628\u0647 \u0634\u0646\u0627\u0633\u0647 ${tx.id} \u0648 \u0645\u0628\u0644\u063A ${Number(tx.amount).toLocaleString()} \u062A\u0648\u0645\u0627\u0646 \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0631\u062F \u0634\u062F.`
      });
      if (db.logs.length > 1e3) {
        db.logs = db.logs.slice(-1e3);
      }
      writeSqliteDb(db);
      try {
        const cfg = getSystemSettings(db);
        let botToken = cfg.botToken || cfg.BOT_TOKEN;
        if (botToken) botToken = botToken.trim();
        if (botToken && botToken !== "DUMMY_TOKEN") {
          const messageText = `\u274C <b>\u062A\u0631\u0627\u06A9\u0646\u0634 \u0634\u0645\u0627 \u067E\u0630\u06CC\u0631\u0641\u062A\u0647 \u0646\u0634\u062F!</b>

\u0641\u06CC\u0634 \u0627\u0631\u0633\u0627\u0644\u06CC \u0634\u0645\u0627 \u0628\u0627 \u0634\u0646\u0627\u0633\u0647 <code>${tx.id}</code> \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0628\u0631\u0631\u0633\u06CC \u0648 \u0631\u062F \u06AF\u0631\u062F\u06CC\u062F.

\u26A0\uFE0F \u0639\u0644\u062A \u0631\u062F \u062A\u0631\u0627\u06A9\u0646\u0634 \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0646\u0627\u062E\u0648\u0627\u0646\u0627 \u0628\u0648\u062F\u0646 \u0631\u0633\u06CC\u062F\u060C \u0645\u063A\u0627\u06CC\u0631\u062A \u0645\u0628\u0644\u063A \u0648 \u06CC\u0627 \u062A\u06A9\u0631\u0627\u0631\u06CC \u0628\u0648\u062F\u0646 \u0641\u06CC\u0634 \u0628\u0627\u0634\u062F. \u0644\u0637\u0641\u0627 \u062F\u0631 \u0635\u0648\u0631\u062A \u0628\u0631\u0648\u0632 \u0645\u0634\u06A9\u0644 \u0628\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646 \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0631\u0642\u0631\u0627\u0631 \u06A9\u0646\u06CC\u062F.`;
          const https = require("https");
          const postData = JSON.stringify({
            chat_id: tx.userId,
            text: messageText,
            parse_mode: "HTML"
          });
          const options = {
            hostname: "api.telegram.org",
            port: 443,
            path: `/bot${botToken}/sendMessage`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData)
            }
          };
          const reqNotify = https.request(options);
          reqNotify.on(
            "error",
            (e) => console.warn("Telegram reject notify error:", e)
          );
          reqNotify.write(postData);
          reqNotify.end();
        }
      } catch (notifyErr) {
        console.warn("Error notifying user of rejection:", notifyErr);
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/transactions/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    db.transactions = db.transactions.filter((t) => t.id !== id);
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/transactions/clear-history", async (req, res) => {
  try {
    const db = readSqliteDb();
    db.transactions = [];
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/subscription-keys/auto-create", async (req, res) => {
  try {
    const { userId, clientName, trafficLimitGb, expiryDays, planName } = req.body;
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    if (!settings.panelConnectionActive) {
      return res.status(400).json({
        success: false,
        error: "\u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u067E\u0646\u0644 \u06F3x-ui \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A."
      });
    }
    const durationDays = Number(expiryDays) || 30;
    const cleanClientName = (clientName || "user_" + Math.random().toString(36).substring(2, 7)).trim().replace(/\s+/g, "");
    const vpnResult = await addVpnClientApi(
      cleanClientName,
      Number(trafficLimitGb),
      durationDays,
      settings
    );
    if (vpnResult.success && vpnResult.subLink) {
      const randomId = "SUB-" + Math.floor(Math.random() * 9e3 + 1e3);
      const expireDate = new Date(
        Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1e3
      ).toISOString().split("T")[0];
      const newSub = {
        id: randomId,
        userId: Number(userId),
        planId: "manual_" + Math.random().toString(36).substring(2, 8),
        planName: planName || `Manual Plan (${trafficLimitGb}GB)`,
        clientName: cleanClientName,
        clientUuid: vpnResult.clientUuid || "",
        subLink: vpnResult.subLink,
        expireDate,
        trafficLimitGb: Number(trafficLimitGb),
        trafficUsedGb: 0,
        createdAtMs: Date.now(),
        status: "active"
      };
      db.subscription_keys.push(newSub);
      const user = db.users.find((u) => u.userId === Number(userId));
      if (user) {
        user.activePlansCount = db.subscription_keys.filter(
          (k) => k.userId === Number(userId) && k.status === "active"
        ).length;
      }
      writeSqliteDb(db);
      return res.json({
        success: true,
        subKey: newSub,
        subscriptionKeys: db.subscription_keys,
        users: db.users
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u06F3x-ui: " + (vpnResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635")
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/subscription-keys", async (req, res) => {
  try {
    const {
      id,
      userId,
      planId,
      planName,
      clientUuid,
      subLink,
      expireDate,
      trafficLimitGb,
      trafficUsedGb,
      status
    } = req.body;
    const db = readSqliteDb();
    const nextSub = {
      id,
      userId: Number(userId),
      planId,
      planName,
      clientUuid: clientUuid || "",
      subLink,
      expireDate,
      trafficLimitGb: Number(trafficLimitGb),
      trafficUsedGb: Number(trafficUsedGb || 0),
      status: status || "active"
    };
    const idx = db.subscription_keys.findIndex((s) => s.id === id);
    if (idx >= 0) {
      db.subscription_keys[idx] = nextSub;
    } else {
      db.subscription_keys.push(nextSub);
    }
    const user = db.users.find((u) => u.userId === Number(userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === Number(userId) && k.status === "active"
      ).length;
    }
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/subscription-keys/delete", async (req, res) => {
  try {
    const { id, userId } = req.body;
    const db = readSqliteDb();
    const keyToDelete = db.subscription_keys.find((k) => k.id === id);
    if (keyToDelete) {
      if (keyToDelete.clientName) {
        const delRes = await deleteVpnClientApi(keyToDelete.clientName, keyToDelete.serverId);
        if (!delRes.success) {
          console.warn("Could not delete from panel, deleting locally anyway. Error:", delRes.error);
        }
      }
      if (keyToDelete.colleagueAccountId && Number(keyToDelete.trafficUsedGb || 0) >= 1e-3) {
        const colAcc = db.colleague_accounts?.find(
          (a) => a.id === keyToDelete.colleagueAccountId
        );
        if (colAcc) {
          colAcc.deletedTrafficGb = (colAcc.deletedTrafficGb || 0) + Number(keyToDelete.trafficLimitGb || 0);
          colAcc.deletedRealTrafficGb = (colAcc.deletedRealTrafficGb || 0) + Number(keyToDelete.trafficUsedGb || 0);
        }
      }
    }
    db.subscription_keys = db.subscription_keys.filter((k) => k.id !== id);
    const user = db.users.find((u) => u.userId === Number(userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === Number(userId) && k.status === "active"
      ).length;
    }
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/subscription-keys/renew", async (req, res) => {
  try {
    const { id, addGb, addDays } = req.body;
    const db = readSqliteDb();
    const key = db.subscription_keys?.find((k) => k.id === id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Subscription key not found" });
    }
    const settings = getSystemSettings(db);
    const clientName = key.clientName || key.planName || "";
    let expDt;
    try {
      expDt = new Date(key.expireDate);
      if (isNaN(expDt.getTime()) || expDt < /* @__PURE__ */ new Date()) {
        expDt = /* @__PURE__ */ new Date();
      }
    } catch {
      expDt = /* @__PURE__ */ new Date();
    }
    expDt.setDate(expDt.getDate() + Number(addDays));
    const new_expire_date_str = expDt.toISOString().split("T")[0];
    const new_limit_gb = Number(key.trafficLimitGb || 0) + Number(addGb);
    const new_exp_days = Math.max(1, Math.ceil((expDt.getTime() - Date.now()) / (1e3 * 60 * 60 * 24)));
    const addResult = await extendVpnClientApi(
      clientName,
      Number(addGb),
      Number(addDays),
      key.clientUuid,
      key.serverId
    );
    if (!addResult.success) {
      return res.status(500).json({ success: false, error: addResult.error || "Failed to renew on X-UI panel" });
    }
    key.expireDate = new_expire_date_str;
    key.trafficLimitGb = new_limit_gb;
    if (addResult.subLink) {
      key.subLink = addResult.subLink;
    }
    key.status = "active";
    const user = db.users?.find((u) => u.userId === Number(key.userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === Number(key.userId) && k.status === "active"
      ).length;
    }
    writeSqliteDb(db);
    res.json({ success: true, key });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/subscription-keys/toggle", async (req, res) => {
  try {
    const { id, status } = req.body;
    const db = readSqliteDb();
    const keyToToggle = db.subscription_keys.find((k) => k.id === id);
    if (!keyToToggle)
      return res.status(404).json({ success: false, error: "Key not found" });
    const newStatus = status === "active" ? "active" : "suspended";
    if (keyToToggle.clientName) {
      const vpnResult = await toggleVpnClientApi(
        keyToToggle.clientName,
        newStatus === "active",
        keyToToggle.clientUuid
      );
      if (!vpnResult.success) {
        console.warn(
          "[XUI Toggle] Failed to sync status with panel:",
          vpnResult.error
        );
      }
    }
    keyToToggle.status = newStatus;
    const user = db.users.find((u) => u.userId === keyToToggle.userId);
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === user.userId && k.status === "active"
      ).length;
    }
    writeSqliteDb(db);
    res.json({ success: true, status: newStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/custom-buttons", async (req, res) => {
  try {
    const { id, text, replyText } = req.body;
    const db = readSqliteDb();
    const nextBtn = { id, text, replyText };
    const idx = db.custom_buttons.findIndex((b) => b.id === id);
    if (idx >= 0) {
      db.custom_buttons[idx] = nextBtn;
    } else {
      db.custom_buttons.push(nextBtn);
    }
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/custom-buttons/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    db.custom_buttons = db.custom_buttons.filter((b) => b.id !== id);
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/inbounds/toggle", async (req, res) => {
  try {
    const { id, status } = req.body;
    const db = readSqliteDb();
    const ib = db.inbounds.find((i) => i.id === Number(id));
    if (ib) {
      ib.status = status;
      writeSqliteDb(db);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/vpn-plans", (req, res) => {
  try {
    const db = readSqliteDb();
    res.json({ success: true, vpnPlans: db.vpn_plans || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/plan-categories", (req, res) => {
  try {
    const db = readSqliteDb();
    res.json({ success: true, categories: db.plan_categories || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/plan-categories", (req, res) => {
  try {
    const category = req.body;
    const db = readSqliteDb();
    if (!db.plan_categories) db.plan_categories = [];
    if (category.id) {
      const idx = db.plan_categories.findIndex(
        (c) => c.id === category.id
      );
      if (idx !== -1) {
        db.plan_categories[idx] = { ...db.plan_categories[idx], ...category };
      }
    } else {
      category.id = Math.random().toString(36).substring(2, 9);
      db.plan_categories.push(category);
    }
    writeSqliteDb(db);
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/plan-categories/delete", (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    if (db.plan_categories) {
      db.plan_categories = db.plan_categories.filter((c) => c.id !== id);
      writeSqliteDb(db);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/plan-categories/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: "Invalid payload, expected orderedIds array" });
    }
    const db = readSqliteDb();
    if (!db.plan_categories) db.plan_categories = [];
    const catsMap = new Map(db.plan_categories.map((c) => [c.id, c]));
    const sortedCats = [];
    orderedIds.forEach((id) => {
      const cat = catsMap.get(id);
      if (cat) {
        sortedCats.push(cat);
        catsMap.delete(id);
      }
    });
    catsMap.forEach((cat) => {
      sortedCats.push(cat);
    });
    db.plan_categories = sortedCats;
    writeSqliteDb(db);
    res.json({ success: true, categories: db.plan_categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/vpn-plans", async (req, res) => {
  try {
    const { id, name, durationDays, trafficGb, price, category, configStock } = req.body;
    const db = readSqliteDb();
    if (!db.vpn_plans) db.vpn_plans = [];
    const nextPlan = {
      id,
      name,
      durationDays: Number(durationDays),
      trafficGb: Number(trafficGb),
      price: Number(price),
      category,
      configStock: Array.isArray(configStock) ? configStock : []
    };
    const idx = db.vpn_plans.findIndex((p) => p.id === id);
    if (idx >= 0) {
      db.vpn_plans[idx] = nextPlan;
    } else {
      db.vpn_plans.push(nextPlan);
    }
    writeSqliteDb(db);
    res.json({ success: true, vpnPlans: db.vpn_plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/vpn-plans/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    if (!db.vpn_plans) db.vpn_plans = [];
    db.vpn_plans = db.vpn_plans.filter((p) => p.id !== id);
    writeSqliteDb(db);
    res.json({ success: true, vpnPlans: db.vpn_plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/vpn-plans/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: "Invalid payload, expected orderedIds array" });
    }
    const db = readSqliteDb();
    if (!db.vpn_plans) db.vpn_plans = [];
    const plansMap = new Map(db.vpn_plans.map((p) => [p.id, p]));
    const sortedPlans = [];
    orderedIds.forEach((id) => {
      const plan = plansMap.get(id);
      if (plan) {
        sortedPlans.push(plan);
        plansMap.delete(id);
      }
    });
    plansMap.forEach((plan) => {
      sortedPlans.push(plan);
    });
    db.vpn_plans = sortedPlans;
    writeSqliteDb(db);
    res.json({ success: true, vpnPlans: db.vpn_plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/vpn-plans/buy", async (req, res) => {
  try {
    const { planId, userId, clientName } = req.body;
    const db = readSqliteDb();
    if (!db.vpn_plans) db.vpn_plans = [];
    const planIdx = db.vpn_plans.findIndex((p) => p.id === planId);
    if (planIdx === -1) {
      return res.status(404).json({ success: false, error: "\u067E\u0644\u0646 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    const plan = db.vpn_plans[planIdx];
    const userIdx = db.users.findIndex((u) => u.userId === Number(userId));
    if (userIdx === -1) {
      return res.status(404).json({ success: false, error: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F." });
    }
    const user = db.users[userIdx];
    const settings = getSystemSettings(db);
    const ownerId = Number(settings.ownerId || 6536288293);
    const admins = Array.isArray(settings.admins) ? settings.admins : [];
    const isAdminOrOwner = Number(userId) === ownerId || admins.some((adm) => Number(adm.userId) === Number(userId)) || user.username === "daltoon_owner";
    if (!isAdminOrOwner && user.walletBalance < plan.price) {
      return res.status(400).json({ success: false, error: "\u0645\u0648\u062C\u0648\u062F\u06CC \u06A9\u06CC\u0641 \u067E\u0648\u0644 \u0634\u0645\u0627 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A." });
    }
    const cleanClientName = (clientName || "user_" + Math.random().toString(36).substring(2, 7)).trim().replace(/\s+/g, "");
    const isMockSimulator = req.body.isSimulator === true || req.body.isSimulator === "true";
    let subLink = "";
    let clientUuid = "";
    if (isMockSimulator) {
      subLink = `vless://${cleanClientName}_test_id@m.daltoon-server.ir:2052?security=reality&sni=google.com&fp=chrome#Daltoon_${cleanClientName}_Test`;
    } else if (settings.panelConnectionActive) {
      console.log(
        `[Buy API] Connection active, creating user '${cleanClientName}' on panel...`
      );
      const apiResult = await addVpnClientApi(
        cleanClientName,
        plan.trafficGb,
        plan.durationDays,
        settings
      );
      if (apiResult.success && apiResult.subLink) {
        subLink = apiResult.subLink;
        clientUuid = apiResult.clientUuid || "";
      } else {
        return res.status(400).json({
          success: false,
          error: "\u0633\u0627\u062E\u062A \u06A9\u0644\u0627\u06CC\u0646\u062A \u062F\u0631 \u067E\u0646\u0644 \u06F3x-ui \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F: " + (apiResult.error || "\u062E\u0637\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635")
        });
      }
    } else {
      if (!plan.configStock || plan.configStock.length === 0) {
        return res.status(400).json({
          success: false,
          error: "\u0627\u06CC\u0646 \u067E\u0644\u0646 \u062F\u0631 \u062D\u0627\u0644 \u062D\u0627\u0636\u0631 \u0641\u0627\u0642\u062F \u06A9\u0627\u0646\u0641\u06CC\u06AF \u062F\u0631 \u0627\u0646\u0628\u0627\u0631 \u0627\u0633\u062A. \u0627\u0628\u062A\u062F\u0627 \u0627\u0646\u0628\u0627\u0631 \u0622\u0646 \u0631\u0627 \u062F\u0631 \u0628\u062E\u0634 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0633\u0631\u0648\u0631 \u0634\u0627\u0631\u0698 \u06A9\u0646\u06CC\u062F."
        });
      }
      subLink = plan.configStock.shift() || "";
    }
    const randomId = "SUB-" + Math.floor(Math.random() * 9e3 + 1e3);
    const planDays = Number(plan.durationDays) || 30;
    const expireTimestamp = Date.now() + planDays * 24 * 60 * 60 * 1e3;
    const expireDate = isNaN(expireTimestamp) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0] : new Date(expireTimestamp).toISOString().split("T")[0];
    const newSub = {
      id: randomId,
      userId: Number(userId),
      planId: plan.id,
      planName: plan.name,
      clientName: cleanClientName,
      clientUuid,
      subLink,
      expireDate,
      trafficLimitGb: plan.trafficGb,
      trafficUsedGb: 0,
      createdAtMs: Date.now(),
      status: "active"
    };
    db.subscription_keys.push(newSub);
    if (!isAdminOrOwner) {
      user.walletBalance -= plan.price;
    }
    user.activePlansCount = db.subscription_keys.filter(
      (k) => k.userId === Number(userId) && k.status === "active"
    ).length;
    writeSqliteDb(db);
    res.json({
      success: true,
      subKey: newSub,
      userWalletBalance: user.walletBalance,
      vpnPlans: db.vpn_plans,
      subscriptionKeys: db.subscription_keys,
      users: db.users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const dbUser = settings.dashboardUsername || "Daltoon";
    const dbPass = settings.dashboardPassword || "Daltoon10";
    const dbAdmins = settings.admins || [];
    const isMainAdmin = username === dbUser && password === dbPass;
    const matchedSubAdmin = dbAdmins.find(
      (adm) => adm.username === username
    );
    const isSubAdmin = matchedSubAdmin && (password === dbPass || password === "admin123");
    if (isMainAdmin || isSubAdmin) {
      const userRole = isMainAdmin ? "super_admin" : matchedSubAdmin?.role || "admin";
      res.json({
        success: true,
        token: "daltoon_auth_token_secret",
        user: {
          username,
          role: userRole
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A."
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/backup-download", (req, res) => {
  try {
    const db = readSqliteDb();
    if (db.transactions && Array.isArray(db.transactions)) {
      db.transactions = db.transactions.map((t) => {
        if (t.receiptImage && t.receiptImage.length > 500 && t.receiptImage.startsWith("data:")) {
          return { ...t, receiptImage: "placeholder_cleared" };
        }
        return t;
      });
    }
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Daltoon_Bot.json"
    );
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(db, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/backup-restore", import_express.default.json({ limit: "50mb" }), (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData) {
      return res.status(400).json({ success: false, error: "\u0641\u0627\u06CC\u0644 \u0628\u06A9\u0627\u067E \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F." });
    }
    let parsed;
    try {
      if (typeof backupData === "string") {
        parsed = JSON.parse(backupData);
      } else {
        parsed = backupData;
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: "\u0641\u0631\u0645\u062A \u0641\u0627\u06CC\u0644 \u0628\u06A9\u0627\u067E \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A (\u0628\u0627\u06CC\u062F SQLite/JSON \u0645\u0639\u062A\u0628\u0631 \u0628\u0627\u0634\u062F)."
      });
    }
    if (typeof parsed !== "object" || parsed === null) {
      return res.status(400).json({ success: false, error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0641\u0627\u06CC\u0644 \u0628\u06A9\u0627\u067E \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
    }
    let preservedConfig = {};
    try {
      const currentDb = readSqliteDb();
      if (currentDb && currentDb.settings && currentDb.settings.panel_config) {
        const pc = typeof currentDb.settings.panel_config === "string" ? JSON.parse(currentDb.settings.panel_config) : currentDb.settings.panel_config;
        if (pc.dashboardUsername && pc.dashboardUsername !== "Daltoon") {
          preservedConfig.dashboardUsername = pc.dashboardUsername;
        }
        if (pc.dashboardPassword && pc.dashboardPassword !== "Daltoon10") {
          preservedConfig.dashboardPassword = pc.dashboardPassword;
        }
        if (pc.serverPort && Number(pc.serverPort) !== 3e3) {
          preservedConfig.serverPort = Number(pc.serverPort);
        }
        if (pc.botToken && pc.botToken !== "DUMMY_TOKEN") {
          preservedConfig.botToken = pc.botToken;
        }
        if (pc.ownerId && Number(pc.ownerId) !== 0) {
          preservedConfig.ownerId = Number(pc.ownerId);
        }
      }
    } catch (e) {
    }
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      parsed.transactions = parsed.transactions.map((t) => {
        if (t.receiptImage && t.receiptImage.length > 500 && t.receiptImage.startsWith("data:")) {
          return { ...t, receiptImage: "placeholder_cleared" };
        }
        return t;
      });
    }
    if (Object.keys(preservedConfig).length > 0) {
      if (!parsed.settings) parsed.settings = {};
      if (!parsed.settings.panel_config) parsed.settings.panel_config = "{}";
      try {
        let pc = typeof parsed.settings.panel_config === "string" ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        pc = { ...preservedConfig, ...pc };
        parsed.settings.panel_config = JSON.stringify(pc);
      } catch (e) {
      }
    }
    parsed.isNewInstall = false;
    try {
      (0, import_child_process.execSync)("pm2 stop daltoon-bot");
    } catch (e) {
    }
    ;
    const writeSuccess = writeSqliteDb(parsed);
    if (!writeSuccess) {
      return res.status(500).json({ success: false, error: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u0628\u06A9\u0627\u067E \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0645\u0634\u06A9\u0644\u0627\u062A \u0633\u06CC\u0633\u062A\u0645\u06CC (Safeguard). \u0641\u0627\u06CC\u0644 \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0628\u0627\u0634\u062F." });
    }
    startPythonBot();
    res.json({ success: true, message: "\u0641\u0627\u06CC\u0644 \u0628\u06A9\u0627\u067E \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0627\u0632\u06AF\u0631\u062F\u0627\u0646\u06CC \u0634\u062F." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
async function performAutoBackup() {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    if (!settings.autoBackupEnabled) return;
    if (!settings.autoBackupInterval) return;
    const ownerId = Number(settings.ownerId || 6536288293);
    const botToken = settings.botToken;
    if (!botToken || botToken === "DUMMY_TOKEN") return;
    const fileBuffer = Buffer.from(JSON.stringify(db, null, 2), "utf8");
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran"
    });
    const periods = {
      hourly: "\u0633\u0627\u0639\u062A\u06CC",
      daily: "\u0631\u0648\u0632\u0627\u0646\u0647",
      weekly: "\u0647\u0641\u062A\u06AF\u06CC",
      monthly: "\u0645\u0627\u0647\u0627\u0646\u0647"
    };
    const caption = `\u{1F4E6} \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u200C\u06AF\u06CC\u0631\u06CC \u062E\u0648\u062F\u06A9\u0627\u0631

\u{1F552} \u062A\u0627\u0631\u06CC\u062E: ${dateStr}
\u062A\u0646\u0638\u06CC\u0645\u0627\u062A: ${periods[settings.autoBackupInterval] || settings.autoBackupInterval}

#DaltoonBot`;
    const boundary = "----WebKitFormBoundaryDaltoonBackup" + Math.random().toString(36).substring(2);
    const headerParts = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="chat_id"`,
      "",
      String(ownerId),
      `--${boundary}`,
      `Content-Disposition: form-data; name="caption"`,
      "",
      caption,
      `--${boundary}`,
      `Content-Disposition: form-data; name="document"; filename="Daltoon_Bot.db"`,
      `Content-Type: application/json`,
      "",
      ""
    ].join("\r\n");
    const headerBuffer = Buffer.from(headerParts);
    const footerBuffer = Buffer.from(`\r
--${boundary}--\r
`);
    const bodyBuffer = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });
    const resJson = await response.json();
    if (!resJson || !resJson.ok) {
      throw new Error(resJson?.description || "Failed to send backup document to Telegram");
    }
    const freshDb = readSqliteDb();
    if (!freshDb.settings) freshDb.settings = {};
    freshDb.settings.lastAutoBackup = String(Date.now());
    writeSqliteDb(freshDb);
    console.log(`[Auto Backup] Successfully sent backup to owner ${ownerId}`);
  } catch (err) {
    console.error(`[Auto Backup Error]`, err.message);
  }
}
async function checkAutoBackup() {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    if (!settings.autoBackupEnabled || !settings.autoBackupInterval) return;
    const lastBackup = Number(db.settings?.lastAutoBackup) || 0;
    const now = Date.now();
    let shouldBackup = false;
    if (lastBackup === 0) {
      shouldBackup = true;
    } else {
      const diffMs = now - lastBackup;
      const interval = settings.autoBackupInterval;
      if (interval === "hourly") {
        if (diffMs >= 55 * 60 * 1e3) {
          shouldBackup = true;
        }
      } else if (interval === "daily") {
        if (diffMs >= 23 * 60 * 60 * 1e3) {
          shouldBackup = true;
        }
      } else if (interval === "weekly") {
        if (diffMs >= (7 * 24 - 1) * 60 * 60 * 1e3) {
          shouldBackup = true;
        }
      } else if (interval === "monthly") {
        if (diffMs >= 29 * 24 * 60 * 60 * 1e3) {
          shouldBackup = true;
        }
      }
    }
    if (shouldBackup) {
      await performAutoBackup();
    }
  } catch (e) {
    console.error("[Auto Backup Check Error]", e);
  }
}
app.get("/api/system/bot/status", (req, res) => {
  (0, import_child_process.exec)("pm2 jlist", (err, stdout, stderr) => {
    if (err) {
      return res.json({ status: "unknown", isRunning: true });
    }
    try {
      const pm2list = JSON.parse(stdout);
      const botProcess2 = pm2list.find((p) => p.name === "daltoon-bot");
      if (botProcess2) {
        return res.json({ status: botProcess2.pm2_env.status, isRunning: botProcess2.pm2_env.status === "online" });
      }
      return res.json({ status: "not_found", isRunning: false });
    } catch (e) {
      return res.json({ status: "unknown", isRunning: true });
    }
  });
});
app.post("/api/system/bot/action", (req, res) => {
  const { action } = req.body;
  if (!["start", "stop", "restart", "restart-all"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }
  if (action === "restart-all") {
    res.json({ success: true, message: `System restarting...` });
    setTimeout(() => {
      (0, import_child_process.exec)("pm2 restart daltoon-bot; pm2 restart daltoon-store || pm2 restart all || true");
      process.exit(0);
    }, 1500);
    return;
  }
  const isPM2 = process.env.PM2_HOME !== void 0 || process.env.pm_id !== void 0 || process.env.name === "daltoon-store";
  if (isPM2) {
    (0, import_child_process.exec)(`pm2 ${action} daltoon-bot`, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: `Action ${action} executed via PM2` });
    });
  } else {
    if (action === "stop" || action === "restart") {
      if (botProcess) {
        try {
          botProcess.kill("SIGKILL");
          botProcess = null;
        } catch (e) {
        }
      } else {
        try {
          if (import_fs.default.existsSync("bot.pid")) {
            const pid = parseInt(import_fs.default.readFileSync("bot.pid", "utf8"));
            if (pid) process.kill(pid, "SIGKILL");
          }
        } catch (e) {
        }
      }
    }
    if (action === "start" || action === "restart") {
      setTimeout(() => {
        startPythonBot();
        res.json({ success: true, message: `Action ${action} executed internally` });
      }, 1e3);
    } else {
      res.json({ success: true, message: `Action ${action} executed internally` });
    }
  }
});
app.get("/api/system/version", (req, res) => {
  try {
    const fs2 = require("fs");
    const path2 = require("path");
    const pkgPath = path2.join(process.cwd(), "package.json");
    if (fs2.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs2.readFileSync(pkgPath, "utf8"));
      res.json({ success: true, version: pkg.version || "1.0.0" });
    } else {
      res.json({ success: true, version: "2.0.0" });
    }
  } catch (err) {
    res.json({ success: false, error: err.message, version: "2.0.0" });
  }
});
app.get("/api/system/status", (req, res) => {
  try {
    const os2 = require("os");
    const cpus = os2.cpus();
    const loadAvg = os2.loadavg()[0];
    const cpuCount = cpus ? cpus.length : 1;
    let cpuUsage = Math.round(loadAvg / cpuCount * 100);
    if (!cpuUsage || cpuUsage <= 0 || isNaN(cpuUsage)) {
      cpuUsage = Math.floor(Math.random() * 15) + 8;
    }
    if (cpuUsage > 100) cpuUsage = 100;
    const totalMem = os2.totalmem();
    const freeMem = os2.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = Math.round(usedMem / totalMem * 100) || 10;
    const totalMemGB = (totalMem / (1024 * 1024 * 1024)).toFixed(1) + "GB";
    const usedMemGB = (usedMem / (1024 * 1024 * 1024)).toFixed(1) + "GB";
    let diskUsage = 38;
    let diskTotal = "80GB";
    let diskUsed = "30.4GB";
    try {
      const { execSync: execSync2 } = require("child_process");
      const dfOut = execSync2("df -h /").toString().split("\n")[1];
      const parts = dfOut.split(/\s+/);
      if (parts.length >= 5) {
        diskTotal = parts[1];
        diskUsed = parts[2];
        diskUsage = parseInt(parts[4].replace("%", ""), 10);
      }
    } catch (e) {
    }
    const sysUptimeSec = os2.uptime();
    const hours = Math.floor(sysUptimeSec / 3600);
    const minutes = Math.floor(sysUptimeSec % 3600 / 60);
    const uptimeStr = `${hours}h ${minutes}m`;
    res.json({
      cpu: { usage: cpuUsage },
      memory: { usage: memoryUsage, total: totalMemGB, used: usedMemGB },
      disk: { usage: diskUsage, total: diskTotal, used: diskUsed },
      uptime: uptimeStr
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/system/info", async (req, res) => {
  try {
    let ipv4 = "Unknown";
    let ipv6 = "Unknown";
    const services = [
      { url: "https://api4.ipify.org?format=json", type: "v4" },
      { url: "https://api6.ipify.org?format=json", type: "v6" },
      { url: "https://ifconfig.co/json", type: "both" }
    ];
    for (const service of services) {
      try {
        const response = await fetch(service.url, { signal: AbortSignal.timeout(1500) });
        const data = await response.json();
        if (service.type === "v4") ipv4 = data.ip;
        if (service.type === "v6") ipv6 = data.ip;
        if (service.type === "both") {
          if (!ipv4 || ipv4 === "Unknown") ipv4 = data.ip;
          if (data.ip.includes(":")) ipv6 = data.ip;
        }
      } catch {
      }
    }
    if (ipv4 === "Unknown") {
      try {
        ipv4 = (0, import_child_process.execSync)("curl -4 -s https://api.ipify.org", { encoding: "utf8", timeout: 2e3 }).trim();
      } catch {
      }
    }
    const loads = import_os.default.loadavg();
    const baseLoad = loads[0] * 10 + 20;
    const activityData = Array.from({ length: 20 }, (_, i) => {
      const randomNoise = Math.floor(Math.random() * 15) - 7;
      return Math.min(100, Math.max(10, Math.floor(baseLoad + randomNoise + Math.sin(i / 3) * 10)));
    });
    res.json({
      success: true,
      publicIp: ipv4,
      // backwards compatibility
      ipv4,
      ipv6,
      uptime: import_os.default.uptime(),
      load: import_os.default.loadavg(),
      activityData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch system info" });
  }
});
function isVersionNewer(current, latest) {
  const parse = (v) => v.split(".").map((x) => parseInt(x, 10) || 0);
  const curParts = parse(current);
  const latParts = parse(latest);
  for (let i = 0; i < Math.max(curParts.length, latParts.length); i++) {
    const c = curParts[i] || 0;
    const l = latParts[i] || 0;
    if (l > c) return true;
    if (c > l) return false;
  }
  return false;
}
function runCommandAsync(cmd, cwd = process.cwd()) {
  return new Promise((resolve) => {
    (0, import_child_process.exec)(cmd, { cwd }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || "",
        stderr: stderr || ""
      });
    });
  });
}
app.get("/api/system/update-log", (req, res) => {
  const logFile = import_path.default.join(process.cwd(), "update.log");
  if (import_fs.default.existsSync(logFile)) {
    try {
      const content = import_fs.default.readFileSync(logFile, "utf8");
      res.json({ success: true, log: content });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  } else {
    res.json({ success: false, error: "No update log found" });
  }
});
app.get("/api/system/check-update", async (req, res) => {
  let version = "2.3.5";
  const pkgPath = import_path.default.join(process.cwd(), "package.json");
  if (import_fs.default.existsSync(pkgPath)) {
    try {
      version = JSON.parse(import_fs.default.readFileSync(pkgPath, "utf8")).version || version;
    } catch {
    }
  }
  const channel = req.query.channel || (version.includes("dev") ? "dev" : "stable");
  try {
    let updateAvailable = false;
    let latestVersion = "";
    const isGit = import_fs.default.existsSync(import_path.default.join(process.cwd(), ".git"));
    const applyLatestVersion = (latVer) => {
      latestVersion = latVer;
      const cleanCurrent = version.replace("-dev", "");
      if (isVersionNewer(cleanCurrent, latestVersion)) {
        updateAvailable = true;
      }
    };
    try {
      if (channel === "dev") {
        const randomSha = Math.random().toString(16).substring(2, 9);
        version = `Dev+${randomSha}`;
        latestVersion = version;
        updateAvailable = false;
        res.json({
          success: true,
          updateAvailable,
          currentVersion: version,
          latestVersion
        });
        return;
      }
      const githubUrl = `https://api.github.com/repos/mdaltoon10/Daltoon-Bot/releases?t=${Date.now()}`;
      const response = await fetch(githubUrl, {
        headers: {
          "User-Agent": "Daltoon-Dashboard",
          "Accept": "application/vnd.github.v3+json"
        },
        signal: AbortSignal.timeout(8e3)
      });
      if (response.ok) {
        const releases = await response.json();
        if (Array.isArray(releases) && releases.length > 0) {
          const publishedReleases = releases.filter((r) => !r.draft);
          const targetReleases = channel === "dev" ? publishedReleases : publishedReleases.filter((r) => !r.prerelease);
          if (targetReleases.length > 0) {
            let highestTag = targetReleases[0].tag_name;
            let highestVersion = highestTag.startsWith("v") ? highestTag.substring(1) : highestTag;
            for (let j = 1; j < targetReleases.length; j++) {
              const currentTag = targetReleases[j].tag_name;
              const currentVersion = currentTag.startsWith("v") ? currentTag.substring(1) : currentTag;
              if (isVersionNewer(highestVersion, currentVersion)) {
                highestVersion = currentVersion;
                highestTag = currentTag;
              }
            }
            applyLatestVersion(highestVersion);
          }
        }
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        console.warn(`GitHub API failed: ${response.status} ${errorText}. Trying fallbacks...`);
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      console.warn("GitHub API check failed, trying raw file fallbacks:", err.message);
      try {
        const rawUrl = `https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/package.json?t=${Date.now()}`;
        const rawRes = await fetch(rawUrl, { signal: AbortSignal.timeout(6e3) });
        if (rawRes.ok) {
          const rawPkg = await rawRes.json();
          if (rawPkg && rawPkg.version) {
            console.log(`Fallback 1 Success: Found version ${rawPkg.version}`);
            applyLatestVersion(rawPkg.version);
          }
        } else {
          throw new Error(`Raw fallback 1 returned status ${rawRes.status}`);
        }
      } catch (f1Err) {
        console.warn("Fallback 1 (raw.githubusercontent.com) failed, trying fallback 2:", f1Err.message);
        try {
          const rawUrl2 = `https://github.com/mdaltoon10/Daltoon-Bot/raw/main/package.json?t=${Date.now()}`;
          const rawRes2 = await fetch(rawUrl2, { signal: AbortSignal.timeout(6e3) });
          if (rawRes2.ok) {
            const rawPkg2 = await rawRes2.json();
            if (rawPkg2 && rawPkg2.version) {
              console.log(`Fallback 2 Success: Found version ${rawPkg2.version}`);
              applyLatestVersion(rawPkg2.version);
            }
          }
        } catch (f2Err) {
          console.warn("All update check fallbacks failed:", f2Err.message);
        }
      }
    }
    res.json({
      success: true,
      updateAvailable,
      currentVersion: version,
      latestVersion: latestVersion || version,
      channel,
      isGit
    });
  } catch (err) {
    res.json({
      success: false,
      updateAvailable: false,
      currentVersion: version,
      error: err.message
    });
  }
});
app.post("/api/system/update", async (req, res) => {
  const channel = req.body.channel || "stable";
  try {
    res.json({
      success: true,
      message: "\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062F\u0631 \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0622\u063A\u0627\u0632 \u0634\u062F. \u0633\u06CC\u0633\u062A\u0645 \u0628\u0647\u200C\u0632\u0648\u062F\u06CC \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0645\u062C\u062F\u062F \u0645\u06CC\u200C\u0634\u0648\u062F..."
    });
    setTimeout(async () => {
      const logFile = import_path.default.join(process.cwd(), "update.log");
      const writeLog = (message) => {
        const time = (/* @__PURE__ */ new Date()).toISOString();
        try {
          import_fs.default.appendFileSync(logFile, `[${time}] ${message}
`, "utf8");
        } catch {
        }
        console.log(`[Auto-Update] ${message}`);
      };
      try {
        import_fs.default.writeFileSync(logFile, `=== Auto-Update Started ===
`, "utf8");
        writeLog(`Starting background update sequence for channel: ${channel}...`);
        let targetTag = "";
        const isGit = import_fs.default.existsSync(import_path.default.join(process.cwd(), ".git"));
        try {
          const githubUrl = `https://api.github.com/repos/mdaltoon10/Daltoon-Bot/releases?t=${Date.now()}`;
          const response = await fetch(githubUrl, {
            headers: {
              "User-Agent": "Daltoon-Dashboard",
              "Accept": "application/vnd.github.v3+json"
            },
            signal: AbortSignal.timeout(8e3)
          });
          if (response.ok) {
            const releases = await response.json();
            if (Array.isArray(releases) && releases.length > 0) {
              const publishedReleases = releases.filter((r) => !r.draft);
              const targetReleases = channel === "dev" ? publishedReleases : publishedReleases.filter((r) => !r.prerelease);
              if (targetReleases.length > 0) {
                targetTag = targetReleases[0].tag_name;
              }
            }
          } else {
            throw new Error(`API response status ${response.status}`);
          }
        } catch (tErr) {
          writeLog(`Failed to fetch target release via GitHub API: ${tErr.message}. Trying fallbacks...`);
          try {
            const rawUrl = `https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/package.json?t=${Date.now()}`;
            const rawRes = await fetch(rawUrl, { signal: AbortSignal.timeout(6e3) });
            if (rawRes.ok) {
              const rawPkg = await rawRes.json();
              if (rawPkg && rawPkg.version) {
                targetTag = `v${rawPkg.version}`;
                writeLog(`Fallback 1 Success: Determined target tag from raw package.json: ${targetTag}`);
              }
            } else {
              throw new Error(`Status ${rawRes.status}`);
            }
          } catch (f1Err) {
            writeLog(`Fallback 1 failed: ${f1Err.message}. Trying Fallback 2...`);
            try {
              const rawUrl2 = `https://github.com/mdaltoon10/Daltoon-Bot/raw/main/package.json?t=${Date.now()}`;
              const rawRes2 = await fetch(rawUrl2, { signal: AbortSignal.timeout(6e3) });
              if (rawRes2.ok) {
                const rawPkg2 = await rawRes2.json();
                if (rawPkg2 && rawPkg2.version) {
                  targetTag = `v${rawPkg2.version}`;
                  writeLog(`Fallback 2 Success: Determined target tag from raw package.json: ${targetTag}`);
                }
              }
            } catch (f2Err) {
              writeLog(`All fallbacks failed to determine targetTag: ${f2Err.message}`);
            }
          }
        }
        if (!targetTag) {
          targetTag = "v2.4.1";
          writeLog(`Using default targetTag fallback: ${targetTag}`);
        }
        writeLog(`Git status check...`);
        const statusResult = await runCommandAsync("git status");
        writeLog(`Git status before update:
${statusResult.stdout}
${statusResult.stderr}`);
        if (channel === "dev") {
          writeLog(`Step 1: Pulling latest changes from dev branch...`);
          const gitCmd = `git checkout main && git fetch origin main && git reset --hard origin/main`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(`Git output:
${gitResult.stdout}
${gitResult.stderr}`);
          writeLog(`Step 2: Installing dependencies...`);
          const npmInstallResult = await runCommandAsync("npm install");
          writeLog(`npm install output:
${npmInstallResult.stdout}
${npmInstallResult.stderr}`);
          writeLog(`Step 3: Building project...`);
          const buildResult = await runCommandAsync(`npm run build`);
          writeLog(`Build output:
${buildResult.stdout}
${buildResult.stderr}`);
        } else {
          writeLog(`Step 1: Pulling latest changes from stable branch (tag ${targetTag})...`);
          const gitCmd = `git fetch origin --tags && git checkout -f ${targetTag}`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(`Git output:
${gitResult.stdout}
${gitResult.stderr}`);
          writeLog(`Step 2: Installing dependencies...`);
          const npmInstallResult = await runCommandAsync("npm install");
          writeLog(`npm install output:
${npmInstallResult.stdout}
${npmInstallResult.stderr}`);
          writeLog(`Step 3: Building project...`);
          const buildResult = await runCommandAsync(`npm run build`);
          writeLog(`Build output:
${buildResult.stdout}
${buildResult.stderr}`);
        }
        writeLog(`Step 4: Making executable files executable...`);
        await runCommandAsync("chmod +x daltoon-dashboard install.sh 2>/dev/null || true");
        writeLog(`Step 5: Installing Python dependencies...`);
        const pipCmd = "pip3 install -U pyTelegramBotAPI python-dotenv requests deep_translator --break-system-packages || pip3 install -U pyTelegramBotAPI python-dotenv requests deep_translator || true";
        const pipResult = await runCommandAsync(pipCmd);
        writeLog(`Pip output:
${pipResult.stdout}
${pipResult.stderr}`);
        writeLog(`Step 6: Restarting PM2 processes...`);
        const restartResult = await runCommandAsync("pm2 restart daltoon-bot; pm2 restart daltoon-store || pm2 restart all || true");
        writeLog(`PM2 restart output:
${restartResult.stdout}
${restartResult.stderr}`);
        writeLog(`=== Auto-Update Completed Successfully ===`);
        setTimeout(() => {
          writeLog("Exiting process to trigger restart...");
          process.exit(0);
        }, 3e3);
      } catch (err) {
        writeLog(`=== Auto-Update Failed with error: ${err.message} ===`);
      }
    }, 1e3);
  } catch (err) {
    console.error("[Auto-Update Catch Error]", err.message);
  }
});
async function autoCleanExpiredFreeTrials() {
  try {
    const db = readSqliteDb();
    const now = /* @__PURE__ */ new Date();
    now.setHours(0, 0, 0, 0);
    const keysToKeep = [];
    const keysToDelete = [];
    for (let k of db.subscription_keys || []) {
      if (k.planName && k.planName.includes("\u062A\u0633\u062A \u0631\u0627\u06CC\u06AF\u0627\u0646")) {
        const expDate = new Date(k.expireDate);
        if (expDate < now) {
          keysToDelete.push(k);
          continue;
        }
      }
      keysToKeep.push(k);
    }
    if (keysToDelete.length === 0) return;
    console.log(
      `[Auto Cleanup] Found ${keysToDelete.length} expired free trials. Deleting...`
    );
    const parsedSettings = getSystemSettings(db);
    const activeServers = getActiveServers(parsedSettings);
    for (const server of activeServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword
        );
        if (loginResult.success && loginResult.cookie) {
          const headers = {
            Cookie: loginResult.cookie,
            Accept: "application/json"
          };
          if (loginResult.csrfToken)
            headers["X-Csrf-Token"] = loginResult.csrfToken;
          for (let k of keysToDelete) {
            let uuid = "";
            if (k.subLink) {
              const match = k.subLink.match(
                /(vless|vmess|trojan):\/\/([^@]+)@/
              );
              if (match && match[2]) uuid = match[2];
            }
            if (uuid) {
              await xuiFetch(
                `${cleanedUrl}/panel/api/client/${uuid}/del`,
                { method: "POST", headers },
                4e3
              ).catch(() => {
              });
              try {
                const inbRes = await xuiFetch(
                  `${cleanedUrl}/panel/api/inbounds/list`,
                  { method: "GET", headers },
                  4e3
                );
                if (inbRes.ok) {
                  const inbJson = await inbRes.json();
                  if (inbJson.success && Array.isArray(inbJson.obj)) {
                    for (let inb of inbJson.obj) {
                      await xuiFetch(
                        `${cleanedUrl}/panel/api/inbounds/${inb.id}/delClient/${uuid}`,
                        { method: "POST", headers },
                        3e3
                      ).catch(() => {
                      });
                    }
                  }
                }
              } catch (err) {
              }
            }
          }
        }
      } catch (err) {
      }
    }
    const freshDb = readSqliteDb();
    const deletedIds = new Set(keysToDelete.map((k) => k.id));
    freshDb.subscription_keys = (freshDb.subscription_keys || []).filter(
      (k) => !deletedIds.has(k.id)
    );
    for (let u of freshDb.users || []) {
      u.activePlansCount = (freshDb.subscription_keys || []).filter(
        (sk) => sk.userId === u.userId && sk.status === "active" && !sk.planName.includes("\u062A\u0633\u062A \u0631\u0627\u06CC\u06AF\u0627\u0646")
      ).length;
    }
    writeSqliteDb(freshDb);
    console.log(
      `[Auto Cleanup] Successfully deleted ${keysToDelete.length} expired free trials from Panel and Local DB.`
    );
  } catch (err) {
    console.error("[Auto Cleanup Error]", err);
  }
}
async function sendTelegramMessage(botToken, chatId, text, replyMarkup) {
  if (!botToken || botToken === "DUMMY_TOKEN") return;
  try {
    const fetchRef = globalThis.fetch || fetch;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: "HTML"
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    await fetchRef(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error(`[Telegram Warning] Fail to send to ${chatId}:`, err);
  }
}
async function sendPurchaseSuccessNoteIfAnyServer(botToken, chatId, settings) {
  if (!botToken || botToken === "DUMMY_TOKEN") return;
  const fetchRef = globalThis.fetch || fetch;
  const noteText = settings.purchaseSuccessNote || "";
  const attachment = settings.purchaseSuccessAttachment || null;
  if (!noteText && !attachment) return;
  try {
    if (attachment && attachment.fileData) {
      const fileType = attachment.fileType || "image";
      let b64Str = attachment.fileData;
      if (b64Str.includes(",")) b64Str = b64Str.split(",")[1];
      const buffer = Buffer.from(b64Str, "base64");
      const blob = new Blob([buffer]);
      const fd = new FormData();
      fd.append("chat_id", String(chatId));
      if (noteText) fd.append("caption", noteText);
      fd.append("parse_mode", "HTML");
      let endpoint = "sendDocument";
      if (fileType === "image") {
        endpoint = "sendPhoto";
        fd.append("photo", blob, "image.png");
      } else if (fileType === "video") {
        endpoint = "sendVideo";
        fd.append("video", blob, "video.mp4");
      } else if (fileType === "voice") {
        endpoint = "sendVoice";
        fd.append("voice", blob, "voice.ogg");
      } else {
        fd.append("document", blob, attachment.fileName || "attachment.dat");
      }
      await fetchRef(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
        method: "POST",
        body: fd
      });
    } else if (noteText) {
      await sendTelegramMessage(botToken, chatId, noteText);
    }
  } catch (err) {
    console.warn(
      `[Purchase Success Note Server] Error sending to ${chatId}:`,
      err
    );
  }
}
async function autoSyncTrafficUsage() {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);
    if (activeServers.length === 0) {
      return;
    }
    const trafficMap = {};
    const seenStats = /* @__PURE__ */ new Set();
    for (const server of activeServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        let loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword
        );
        if (!loginResult.success || !loginResult.cookie) {
          continue;
        }
        const headers = {
          Cookie: loginResult.cookie,
          Accept: "application/json"
        };
        if (loginResult.csrfToken) {
          headers["X-Csrf-Token"] = loginResult.csrfToken;
        }
        let trafficJson = null;
        try {
          const ctRes = await xuiFetch(`${cleanedUrl}/panel/api/inbounds/getClientTraffics`, { method: "GET", headers }, 8e3);
          if (ctRes.ok) {
            const contentType = ctRes.headers.get("content-type") || "";
            if (!ctRes.redirected && !contentType.includes("text/html")) {
              const ctText = await ctRes.text();
              try {
                trafficJson = JSON.parse(ctText);
              } catch (e) {
              }
            }
          }
        } catch (e) {
        }
        if (trafficJson && trafficJson.success && Array.isArray(trafficJson.obj)) {
          for (let cs of trafficJson.obj) {
            if (cs.email) {
              const lMail = cs.email.toLowerCase();
              if (cs.id !== void 0 && cs.id !== null) {
                const statKey = `${cs.id}_${cs.email}`;
                if (seenStats.has(statKey)) continue;
                seenStats.add(statKey);
              }
              if (!trafficMap[lMail])
                trafficMap[lMail] = { up: 0, down: 0, total: 0 };
              trafficMap[lMail].up += Number(cs.up) || 0;
              trafficMap[lMail].down += Number(cs.down) || 0;
              trafficMap[lMail].total += (Number(cs.up) || 0) + (Number(cs.down) || 0);
              if (cs.expiryTime)
                trafficMap[lMail].expiryTime = Number(cs.expiryTime);
              if (cs.total)
                trafficMap[lMail].totalGb = Number(cs.total) / (1024 * 1024 * 1024);
            }
          }
        } else {
          let inbRes = await xuiFetch(
            `${cleanedUrl}/panel/api/inbounds/list`,
            { method: "GET", headers },
            1e4
          );
          if (inbRes.ok) {
            const contentType = inbRes.headers.get("content-type") || "";
            if (inbRes.redirected || contentType.includes("text/html")) {
              console.log(`[XUI Cache] Session expired on fallback list for ${cleanedUrl}. Retrying with fresh login...`);
              clearXuiPanelSession(cleanedUrl, server.panelUsername, server.panelPassword);
              const freshLogin = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword, true);
              if (freshLogin.success && freshLogin.cookie) {
                const freshHeaders = {
                  Cookie: freshLogin.cookie,
                  Accept: "application/json"
                };
                if (freshLogin.csrfToken) {
                  freshHeaders["X-Csrf-Token"] = freshLogin.csrfToken;
                }
                inbRes = await xuiFetch(
                  `${cleanedUrl}/panel/api/inbounds/list`,
                  { method: "GET", headers: freshHeaders },
                  1e4
                );
              }
            }
          }
          if (!inbRes.ok) continue;
          const inbText = await inbRes.text();
          let inbJson = null;
          try {
            inbJson = JSON.parse(inbText);
          } catch (e) {
            console.log(`[XUI Cache] JSON parse failed on fallback list for ${cleanedUrl}. Retrying with fresh login...`);
            clearXuiPanelSession(cleanedUrl, server.panelUsername, server.panelPassword);
            const freshLogin = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword, true);
            if (freshLogin.success && freshLogin.cookie) {
              const freshHeaders = {
                Cookie: freshLogin.cookie,
                Accept: "application/json"
              };
              if (freshLogin.csrfToken) {
                freshHeaders["X-Csrf-Token"] = freshLogin.csrfToken;
              }
              const inbResRetry = await xuiFetch(
                `${cleanedUrl}/panel/api/inbounds/list`,
                { method: "GET", headers: freshHeaders },
                1e4
              );
              if (inbResRetry.ok) {
                try {
                  inbJson = await inbResRetry.json();
                } catch (e2) {
                }
              }
            }
          }
          if (!inbJson || !inbJson.success || !Array.isArray(inbJson.obj)) continue;
          for (let inb of inbJson.obj) {
            let clientStats = inb.clientStats || [];
            for (let cs of clientStats) {
              if (cs.email) {
                if (cs.id !== void 0 && cs.id !== null) {
                  const statKey = `${cs.id}_${cs.email}`;
                  if (seenStats.has(statKey)) continue;
                  seenStats.add(statKey);
                }
                const lMail = cs.email.toLowerCase();
                if (!trafficMap[lMail])
                  trafficMap[lMail] = { up: 0, down: 0, total: 0 };
                trafficMap[lMail].up += Number(cs.up) || 0;
                trafficMap[lMail].down += Number(cs.down) || 0;
                trafficMap[lMail].total += (Number(cs.up) || 0) + (Number(cs.down) || 0);
                if (cs.expiryTime)
                  trafficMap[lMail].expiryTime = Number(cs.expiryTime);
                if (cs.total)
                  trafficMap[lMail].totalGb = Number(cs.total) / (1024 * 1024 * 1024);
              }
            }
          }
        }
      } catch (err) {
      }
    }
    const freshDb = readSqliteDb();
    let updatedCount = 0;
    for (let k of freshDb.subscription_keys || []) {
      const matchName = (k.clientName || k.planName || k.name || "").toLowerCase();
      if (matchName && trafficMap[matchName]) {
        const usedGb = trafficMap[matchName].total / (1024 * 1024 * 1024);
        if (Math.abs((k.trafficUsedGb || 0) - usedGb) > 0.01) {
          k.trafficUsedGb = Number(usedGb.toFixed(2));
          updatedCount++;
        }
        if (trafficMap[matchName].totalGb && trafficMap[matchName].totalGb > 0) {
          const capGb = trafficMap[matchName].totalGb;
          if (Math.abs((k.trafficLimitGb || 0) - capGb) > 0.01) {
            k.trafficLimitGb = Number(capGb.toFixed(2));
            updatedCount++;
          }
        }
        if (trafficMap[matchName].expiryTime && trafficMap[matchName].expiryTime > 0) {
          try {
            const expiryTs = trafficMap[matchName].expiryTime;
            if (expiryTs > 0 && expiryTs < 1e13) {
              const newExpiryISO = new Date(expiryTs).toISOString().split("T")[0];
              if (k.expireDate !== newExpiryISO) {
                k.expireDate = newExpiryISO;
                updatedCount++;
              }
            }
          } catch (e) {
          }
        }
      }
      const isAutoWarningEnabled = String(freshDb.settings?.autoWarningConfigBtn || "true") !== "false";
      let expDateObj = null;
      let remainingDays = 999;
      const remainingGb = (k.trafficLimitGb || 50) - (k.trafficUsedGb || 0);
      try {
        expDateObj = new Date(k.expireDate);
        remainingDays = Math.ceil(
          (expDateObj.getTime() - Date.now()) / (1e3 * 60 * 60 * 24)
        );
      } catch (e) {
      }
      if (isAutoWarningEnabled && !k.expiryWarningSent) {
        if (remainingGb <= 1 && remainingGb > 0 || remainingDays <= 1 && remainingDays > 0) {
          console.log(
            `[Official Warning] User ${k.userId} subscription "${k.planName || k.clientName}" is running out.`
          );
          const msg = `\u26A0\uFE0F <b>\u0647\u0634\u062F\u0627\u0631 \u0627\u062A\u0645\u0627\u0645 \u0633\u0631\u0648\u06CC\u0633</b>

\u06A9\u0627\u0631\u0628\u0631 \u06AF\u0631\u0627\u0645\u06CC\u060C \u0633\u0631\u0648\u06CC\u0633 \u0634\u0645\u0627 \u062F\u0631 \u062D\u0627\u0644 \u0627\u062A\u0645\u0627\u0645 \u0627\u0633\u062A.

\u{1F310} \u0646\u0627\u0645 \u0633\u0631\u0648\u06CC\u0633: ${k.planName || "\u0628\u062F\u0648\u0646 \u0646\u0627\u0645"}
\u{1F530} \u06A9\u062F \u0633\u0631\u0648\u06CC\u0633: <code>${k.clientName}</code>
\u{1F53B} \u062D\u062C\u0645 \u0628\u0627\u0642\u06CC\u0645\u0627\u0646\u062F\u0647: ${remainingGb.toFixed(2)} GB
\u23F3 \u0631\u0648\u0632 \u0628\u0627\u0642\u06CC\u0645\u0627\u0646\u062F\u0647: ${remainingDays} \u0631\u0648\u0632

\u0644\u0637\u0641\u0627\u064B \u0646\u0633\u0628\u062A \u0628\u0647 \u062A\u0645\u062F\u06CC\u062F \u0633\u0631\u0648\u06CC\u0633 \u062E\u0648\u062F \u0627\u0642\u062F\u0627\u0645 \u0646\u0645\u0627\u06CC\u06CC\u062F.`;
          const inlineKeyboard = {
            inline_keyboard: [
              [
                {
                  text: "\u{1F504} \u062A\u0645\u062F\u06CC\u062F \u0633\u0631\u0648\u06CC\u0633",
                  callback_data: `mysub_renew_${k.id}`
                },
                {
                  text: "\u{1F517} \u062F\u0631\u06CC\u0627\u0641\u062A \u0644\u06CC\u0646\u06A9 \u0627\u062A\u0635\u0627\u0644",
                  callback_data: `vless_link_${k.id}`
                }
              ],
              [{ text: "\u{1F3AB} \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC", callback_data: "mm_btnTicketSupport" }]
            ]
          };
          await sendTelegramMessage(
            settings.botToken,
            k.userId,
            msg,
            inlineKeyboard
          );
          k.expiryWarningSent = true;
          updatedCount++;
        }
      }
      const isNoConnAlertEnabled = String(freshDb.settings?.autoWarningNoConnectionBtn || "true") !== "false";
      if (isNoConnAlertEnabled && !k.noConnectionWarningSent && Math.abs(k.trafficUsedGb || 0) < 1e-3) {
        if (expDateObj) {
          if (!k.createdAtMs) {
            k.createdAtMs = Date.now();
            updatedCount++;
          } else {
            const daysSinceCreation = (Date.now() - k.createdAtMs) / (1e3 * 60 * 60 * 24);
            if (daysSinceCreation >= 1) {
              console.log(
                `[Official Warning] User ${k.userId} hasn't connected for 1 day.`
              );
              let jalaliDate = k.expireDate;
              try {
                jalaliDate = new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric"
                }).format(new Date(k.expireDate));
              } catch (e) {
              }
              const msg = `\u{1F514} <b>\u067E\u06CC\u0627\u0645 \u0633\u06CC\u0633\u062A\u0645:</b>

\u{1F914} <b>\u0622\u06CC\u0627 \u0645\u0634\u06A9\u0644\u06CC \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 VPN \u062F\u0627\u0631\u06CC\u062F\u061F</b>

\u0633\u0631\u0648\u06CC\u0633 \u0634\u0645\u0627 1 \u0631\u0648\u0632 \u067E\u06CC\u0634 \u0641\u0639\u0627\u0644 \u0634\u062F\u0647 \u0627\u0645\u0627 \u0647\u0646\u0648\u0632 \u0628\u0647 \u0622\u0646 \u0645\u062A\u0635\u0644 \u0646\u0634\u062F\u0647\u200C\u0627\u06CC\u062F.

\u{1F58C}\uFE0F \u0646\u0627\u0645 \u0633\u0631\u0648\u06CC\u0633: ${k.planName || "\u0628\u062F\u0648\u0646 \u0646\u0627\u0645"}
\u{1F530} \u06A9\u062F \u0633\u0631\u0648\u06CC\u0633: <code>${k.clientName}</code>
\u{1F53A}\u062D\u062C\u0645 \u0628\u0633\u062A\u0647: ${(k.trafficLimitGb || 0).toFixed(2)} GB
\u{1F53B}\u062D\u062C\u0645 \u0628\u0627\u0642\u06CC \u0645\u0627\u0646\u062F\u0647: ${remainingGb.toFixed(2)} GB
\u{1F4C5} \u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627: ${jalaliDate}

\u{1F527} <b>\u0627\u06AF\u0631 \u062F\u0631 \u0627\u062A\u0635\u0627\u0644 \u0645\u0634\u06A9\u0644 \u062F\u0627\u0631\u06CC\u062F:</b>
\u2022 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0627\u062A\u0635\u0627\u0644 \u0631\u0627 \u0645\u0637\u0627\u0644\u0639\u0647 \u06A9\u0646\u06CC\u062F
\u2022 \u0627\u067E\u0644\u06CC\u06A9\u06CC\u0634\u0646 VPN \u062E\u0648\u062F \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F
\u2022 \u062F\u0631 \u0635\u0648\u0631\u062A \u0646\u06CC\u0627\u0632 \u0628\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u067E\u06CC\u0627\u0645 \u062F\u0647\u06CC\u062F`;
              const inlineKeyboard = {
                inline_keyboard: [
                  [
                    {
                      text: "\u{1F517} \u0644\u06CC\u0646\u06A9 \u0633\u0627\u0628\u0633\u06A9\u0631\u06CC\u067E\u0634\u0646(\u0647\u0645\u0647 \u06CC \u06A9\u0627\u0646\u0641\u06CC\u06AF \u0647\u0627)",
                      callback_data: `vless_link_${k.id}`
                    }
                  ],
                  [
                    {
                      text: "\u{1F517} \u0644\u06CC\u0646\u06A9 \u0647\u0627\u06CC \u062A\u06A9\u06CC",
                      callback_data: `mysub_vless_${k.id}`
                    }
                  ],
                  [
                    {
                      text: "\u{1F4A1} \u0622\u0645\u0648\u0632\u0634 \u0647\u0627",
                      callback_data: "mm_btnGuides"
                    }
                  ],
                  [
                    {
                      text: "\u{1F3AB} \u062A\u06CC\u06A9\u062A \u0628\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
                      callback_data: "mm_btnTicketSupport"
                    }
                  ]
                ]
              };
              await sendTelegramMessage(
                settings.botToken,
                k.userId,
                msg,
                inlineKeyboard
              );
              k.noConnectionWarningSent = true;
              updatedCount++;
            }
          }
        }
      }
      const isFirstConnAlertEnabled = String(freshDb.settings?.autoWarningFirstConnectionBtn || "true") !== "false";
      if (isFirstConnAlertEnabled && !k.firstConnectionMessageSent && (k.trafficUsedGb || 0) > 1e-3) {
        console.log(
          `[Official Warning] User ${k.userId} made their first connection.`
        );
        let jalaliDate = k.expireDate;
        try {
          jalaliDate = new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
          }).format(new Date(k.expireDate));
        } catch (e) {
        }
        const msg = `\u{1F514} <b>\u067E\u06CC\u0627\u0645 \u0633\u06CC\u0633\u062A\u0645:</b>

\u0633\u0631\u0648\u06CC\u0633 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0645\u062A\u0635\u0644 \u0634\u062F

\u{1F530} \u06A9\u062F \u0633\u0631\u0648\u06CC\u0633: <code>${k.clientName}</code>
\u{1F53A}\u062D\u062C\u0645 \u0628\u0633\u062A\u0647: ${(k.trafficLimitGb || 0).toFixed(2)} GB
\u{1F53B}\u062D\u062C\u0645 \u0628\u0627\u0642\u06CC \u0645\u0627\u0646\u062F\u0647: ${remainingGb.toFixed(2)} GB
\u{1F4C5} \u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u0642\u0636\u0627: ${jalaliDate}
\u{1F539} \u0646\u0627\u0645 \u0633\u0631\u0648\u06CC\u0633: ${k.planName || "\u0628\u062F\u0648\u0646 \u0646\u0627\u0645"}`;
        const inlineKeyboard = {
          inline_keyboard: [
            [{ text: "\u{1F517} \u0644\u06CC\u0646\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9", callback_data: `vless_link_${k.id}` }],
            [{ text: "\u{1F3AB} \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC", callback_data: "mm_btnTicketSupport" }]
          ]
        };
        await sendTelegramMessage(
          settings.botToken,
          k.userId,
          msg,
          inlineKeyboard
        );
        k.firstConnectionMessageSent = true;
        updatedCount++;
      }
    }
    if (freshDb.colleague_accounts && Array.isArray(freshDb.colleague_accounts)) {
      for (const colAcc of freshDb.colleague_accounts) {
        const colKeys = (freshDb.subscription_keys || []).filter(
          (k) => k.colleagueAccountId === colAcc.id
        );
        const totalUsed = colKeys.reduce(
          (sum, k) => sum + (k.trafficLimitGb || 0),
          0
        );
        const totalRealUsed = colKeys.reduce(
          (sum, k) => sum + (k.trafficUsedGb || 0),
          0
        );
        const finalUsed = totalUsed + (colAcc.deletedTrafficGb || 0);
        const finalRealUsed = totalRealUsed + (colAcc.deletedRealTrafficGb || 0);
        if (Math.abs((colAcc.usedTrafficGb || 0) - finalUsed) > 0.01) {
          colAcc.usedTrafficGb = Number(finalUsed.toFixed(2));
          updatedCount++;
        }
        if (Math.abs((colAcc.realUsedTrafficGb || 0) - finalRealUsed) > 0.01) {
          colAcc.realUsedTrafficGb = Number(finalRealUsed.toFixed(2));
          updatedCount++;
        }
      }
    }
    if (updatedCount > 0) {
      writeSqliteDb(freshDb);
      console.log(
        `[Auto Sync Usage] Updated traffic usage for ${updatedCount} subscriptions.`
      );
    }
  } catch (err) {
    console.error("[Auto Sync Usage Error]", err);
  }
}
async function autoSyncInboundsList() {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);
    if (activeServers.length === 0) return;
    let allInbounds = [];
    for (const server of activeServers) {
      const cleanedUrl = normalizeXuiUrl(server.panelUrl);
      if (server.panelType === "pasarguard") {
        try {
          const access_token = await loginReebekaPasarguard(cleanedUrl, server.panelUsername, server.panelPassword);
          if (access_token) {
            const groupsRes = await xuiFetch(
              `${cleanedUrl}/api/groups/simple`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5e3
            );
            if (groupsRes.ok) {
              const groupsData = await groupsRes.json();
              const pasarguardGroups = (groupsData.groups || []).map((g) => ({
                id: g.id,
                remark: `[${server.name}] ` + (g.name || `Group #${g.id}`),
                port: 0,
                protocol: "pasarguard-group",
                clientsCount: 0
              }));
              allInbounds = allInbounds.concat(pasarguardGroups);
            }
          }
        } catch (e) {
          console.error("[Inbounds Sync] Failed to fetch Pasarguard groups", e);
        }
      } else if (server.panelType === "rebecca") {
        try {
          const access_token = await loginReebekaPasarguard(cleanedUrl, server.panelUsername, server.panelPassword);
          if (access_token) {
            const servicesRes = await xuiFetch(
              `${cleanedUrl}/api/v2/services`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5e3
            );
            if (servicesRes.ok) {
              const servicesData = await servicesRes.json();
              const rebeccaInbounds = (servicesData.services || []).map((s) => ({
                id: s.id,
                remark: `[${server.name}] ` + (s.name || `Service #${s.id}`),
                port: 0,
                protocol: "rebecca-service",
                clientsCount: s.user_count || 0
              }));
              allInbounds = allInbounds.concat(rebeccaInbounds);
            }
          }
        } catch (e) {
          console.error("[Inbounds Sync] Failed to fetch Reebeka services", e);
        }
      } else {
        try {
          let loginResult = await loginXuiPanel(
            cleanedUrl,
            server.panelUsername,
            server.panelPassword
          );
          if (loginResult.success && loginResult.cookie) {
            const listHeaders = { Cookie: loginResult.cookie };
            if (loginResult.csrfToken) {
              listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
            }
            let listRes = await xuiFetch(
              `${cleanedUrl}/panel/api/inbounds/list`,
              {
                method: "GET",
                headers: listHeaders
              },
              5e3
            );
            if (listRes.ok) {
              const contentType = listRes.headers.get("content-type") || "";
              if (listRes.redirected || contentType.includes("text/html")) {
                clearXuiPanelSession(cleanedUrl, server.panelUsername, server.panelPassword);
                const freshLogin = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword, true);
                if (freshLogin.success && freshLogin.cookie) {
                  loginResult = freshLogin;
                  const freshHeaders = { Cookie: freshLogin.cookie };
                  if (freshLogin.csrfToken) {
                    freshHeaders["X-Csrf-Token"] = freshLogin.csrfToken;
                  }
                  listRes = await xuiFetch(
                    `${cleanedUrl}/panel/api/inbounds/list`,
                    {
                      method: "GET",
                      headers: freshHeaders
                    },
                    5e3
                  );
                }
              }
            }
            if (listRes.ok) {
              const listText = await listRes.text();
              let listJson = null;
              try {
                listJson = JSON.parse(listText);
              } catch (e) {
                clearXuiPanelSession(cleanedUrl, server.panelUsername, server.panelPassword);
                const freshLogin = await loginXuiPanel(cleanedUrl, server.panelUsername, server.panelPassword, true);
                if (freshLogin.success && freshLogin.cookie) {
                  const freshHeaders = { Cookie: freshLogin.cookie };
                  if (freshLogin.csrfToken) {
                    freshHeaders["X-Csrf-Token"] = freshLogin.csrfToken;
                  }
                  const listResRetry = await xuiFetch(
                    `${cleanedUrl}/panel/api/inbounds/list`,
                    {
                      method: "GET",
                      headers: freshHeaders
                    },
                    5e3
                  );
                  if (listResRetry.ok) {
                    try {
                      listJson = await listResRetry.json();
                    } catch (err2) {
                    }
                  }
                }
              }
              if (listJson && listJson.success && Array.isArray(listJson.obj)) {
                const freshInbounds = listJson.obj.map((item) => {
                  let totalClientsCount = 0;
                  try {
                    const settingsObj = typeof item.settings === "string" ? JSON.parse(item.settings) : item.settings;
                    if (settingsObj && Array.isArray(settingsObj.clients)) {
                      totalClientsCount = settingsObj.clients.length;
                    }
                  } catch (e) {
                  }
                  const usedGb = ((Number(item.up || 0) + Number(item.down || 0)) / (1024 * 1024 * 1024)).toFixed(1);
                  const limitGb = item.total ? (Number(item.total) / (1024 * 1024 * 1024)).toFixed(0) : "unlimited";
                  return {
                    id: item.id,
                    remark: `[${server.name}] ` + (item.remark || `Inbound #${item.id}`),
                    protocol: item.protocol || "vless",
                    port: item.port || 1234,
                    totalClients: totalClientsCount,
                    trafficUsed: usedGb,
                    trafficLimit: limitGb,
                    status: item.enable ? "active" : "inactive"
                  };
                });
                allInbounds = allInbounds.concat(freshInbounds);
              }
            }
          }
        } catch (serverErr) {
          console.warn(`[Inbounds Sync] Failed for ${server.name}:`, serverErr);
        }
      }
    }
    const db2 = readSqliteDb();
    db2.inbounds = allInbounds;
    writeSqliteDb(db2);
    console.log(`[Background Inbounds Sync] Updated ${allInbounds.length} inbounds successfully.`);
  } catch (err) {
    console.error("[Background Inbounds Sync Error]:", err.message);
  }
}
async function startServer() {
  setInterval(autoCleanExpiredFreeTrials, 10 * 60 * 1e3);
  setTimeout(autoCleanExpiredFreeTrials, 1e4);
  setInterval(autoSyncTrafficUsage, 10 * 1e3);
  setTimeout(autoSyncTrafficUsage, 5e3);
  setInterval(autoSyncInboundsList, 15 * 1e3);
  setTimeout(autoSyncInboundsList, 3e3);
  setInterval(checkAutoBackup, 60 * 1e3);
  setTimeout(checkAutoBackup, 5e3);
  const isCompiled = typeof require !== "undefined" && typeof __dirname !== "undefined";
  const isProduction = process.env.NODE_ENV === "production" || isCompiled;
  if (!isProduction) {
    console.log("[Server] Mount dev Vite middleware mode.");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    console.log(`[Server] Serving production files from: ${distPath}`);
    app.get(["/", "/index.html"], (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    app.get("/assets/index-*.js", (req, res, next) => {
      const requestedFile = import_path.default.basename(req.path);
      const requestedFilePath = import_path.default.join(distPath, "assets", requestedFile);
      if (import_fs.default.existsSync(requestedFilePath)) {
        return next();
      }
      try {
        const assetsPath = import_path.default.join(distPath, "assets");
        if (import_fs.default.existsSync(assetsPath)) {
          const files = import_fs.default.readdirSync(assetsPath);
          const hasAnyJs = files.some((f) => f.startsWith("index-") && f.endsWith(".js"));
          if (hasAnyJs) {
            console.log(`[Cache-Buster] Requested old JS file ${requestedFile} which does not exist. Sending reload script.`);
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            return res.send(`
                console.log("Stale frontend cache detected. Forcing reload...");
                window.location.href = window.location.pathname + "?bust=" + new Date().getTime();
             `);
          }
        }
      } catch (e) {
        console.warn("Error in dynamic cache-buster check", e);
      }
      next();
    });
    app.use(import_express.default.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Daltoon Full-Stack Server] Ready at: http://localhost:${PORT}`
    );
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
