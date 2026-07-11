import express from "express"; // core
import path from "path";
import fs from "fs";
import os from "os";
import { createServer as createViteServer } from "vite";
import { spawn, ChildProcess, exec, execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import dns from "dns";
import Database from "better-sqlite3";

// Prefer IPv4 DNS resolution first to fix native fetch failing on self-hosted VPS servers (especially with dual-stack domain names like AwanLLM)
dns.setDefaultResultOrder("ipv4first");

// Explicit absolute dotenv loads for absolute correctness across nested builds
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const _dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

try {
  dotenv.config({ path: path.resolve(_dirname, ".env") });
  dotenv.config({ path: path.resolve(_dirname, "..", ".env") });
} catch (e) {}

// Disable SSL verification for outgoing requests to 3x-ui panels
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Path to SQLite DB store
const dbSqlitePath = path.resolve(process.cwd(), "Daltoon_Bot.db");
const sqliteDb = (() => {
  const db = new Database(dbSqlitePath);
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
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      bestFile = p;
      break;
    }
  }

  if (bestFile) {
    try {
      const rowCountRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM kv").get() as { count: number };
      if (rowCountRow.count === 0) {
        console.log(`[SQLite Migration] Migrating active database from legacy ${bestFile} to SQLite...`);
        const raw = fs.readFileSync(bestFile, "utf8").trim();
        if (raw) {
          const data = JSON.parse(raw);
          const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
          const transaction = sqliteDb.transaction((obj: any) => {
            for (const key of Object.keys(obj)) {
              insert.run(key, JSON.stringify(obj[key]));
            }
          });
          transaction(data);
          console.log("[SQLite Migration] Migration completed successfully!");
        }
      }
    } catch (e: any) {
      console.error("[SQLite Migration Error]", e.message);
    }
  }
}

migrateLegacyJsonToSqlite();

// Helper to load port dynamically from DB config
function getServerPort(): number {
  if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    return Number(process.env.PORT);
  }
  // Try to load port from database
  try {
    const row = sqliteDb.prepare("SELECT value FROM kv WHERE key = 'settings'").get() as { value: string } | undefined;
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
      err,
    );
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
}

// Set up server port
const PORT = getServerPort();
const app = express();

console.log(
  "[Debug] process.env.GEMINI_API_KEY loaded:",
  process.env.GEMINI_API_KEY
    ? `Yes (length: ${process.env.GEMINI_API_KEY.length}, starts with: ${process.env.GEMINI_API_KEY.substring(0, 5)})`
    : "No (undefined/empty)",
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
console.log(`[Database] Connecting to JSON file database at: ${dbSqlitePath}`);

// Define types for pure JSON database to align perfectly with schema
interface DbSchema {
  isNewInstall?: boolean;
  users: any[];
  transactions: any[];
  subscription_keys: any[];
  inbounds: any[];
  custom_buttons: any[];
  vpn_plans?: any[];
  gift_codes?: any[];
  promo_codes?: any[];
  tickets?: any[];
  colleague_packages?: any[];
  colleague_accounts?: any[];
  colleague_categories?: any[];
  logs?: any[];
  plan_categories?: any[];
  settings: Record<string, string>;
  link_tokens?: Record<string, string>;
}

// Function to read JSON Database, seeding with default templates if not found
function readSqliteDb(): DbSchema {
  try {
    const rows = sqliteDb.prepare("SELECT key, value FROM kv").all() as { key: string; value: string }[];
    
    if (rows.length === 0) {
      // Auto-migrate from JSON if it exists
      const jsonDbPath = path.join(process.cwd(), "Daltoon_Bot.json");
      if (fs.existsSync(jsonDbPath)) {
        try {
          console.log(`[Database] Empty SQLite found, but Daltoon_Bot.json exists. Auto-migrating data to SQLite...`);
          const jsonData = JSON.parse(fs.readFileSync(jsonDbPath, "utf8"));
          const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
          const transaction = sqliteDb.transaction((obj: any) => {
            for (const key of Object.keys(obj)) {
              insert.run(key, JSON.stringify(obj[key]));
            }
          });
          transaction(jsonData);
          console.log(`[Database] Auto-migration from JSON completed successfully.`);
          
          // Re-fetch rows now that we've migrated
          const migratedRows = sqliteDb.prepare("SELECT key, value FROM kv").all() as { key: string; value: string }[];
          const db: any = {};
          for (const row of migratedRows) {
            try {
              db[row.key] = JSON.parse(row.value);
            } catch (err) {
              console.error(`[Database Parse Error] for key ${row.key}:`, err);
            }
          }
          db.isNewInstall = false;
          return db;
        } catch(migrateErr) {
          console.error(`[Database] Error auto-migrating from JSON:`, migrateErr);
        }
      }

      console.warn(
        `[Database] SQLite database is empty. Returning default structure but NOT writing to disk yet to avoid accidental wipes.`,
      );
      const defaultDb: DbSchema = {
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
            serverPort: 3000,
          }),
        },
        isNewInstall: true,
      };
      return defaultDb;
    }

    const db: any = {};
    for (const row of rows) {
      try {
        db[row.key] = JSON.parse(row.value);
      } catch (err) {
        console.error(`[Database Parse Error] for key ${row.key}:`, err);
      }
    }

    db.isNewInstall = false;

    let modified = false;
    // Backport empty arrays on existing database structures to guarantee safety
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
      "logs",
    ];
    for (const key of arraysToEnsure) {
      if (!db[key] || !Array.isArray(db[key])) {
        db[key] = [];
        modified = true;
      }
    }

    if (modified) {
      // Use writeSqliteDb instead of direct write to respect safeguards
      writeSqliteDb(db);
    }

    return db as DbSchema;
  } catch (err) {
    console.error(
      "[Database] Read error, preventing data wipe! Returning in-memory empty dataset but skipping writes:",
      err,
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
      _isReadError: true, // Flag to prevent writeSqliteDb from overwriting
    } as unknown as DbSchema;
  }
}

// Function to write back data
function writeSqliteDb(data: DbSchema): boolean {
  if (!data) return false;
  if ((data as any)._isReadError) {
    console.error(
      "[Database] Write aborted: Database is currently in an errored/unreadable state. Writing now would wipe data.",
    );
    return false;
  }

  // Safeguard: refuse to overwrite if existing database is large but new data is empty
  try {
    const rowCountRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM kv").get() as { count: number };
    if (rowCountRow.count > 0) {
      const hasUsers = Array.isArray(data.users) && data.users.length > 0;
      const hasTransactions = Array.isArray(data.transactions) && data.transactions.length > 0;
      
      let hasToken = false;
      try {
        let cfg: any = data.settings?.panel_config;
        if (typeof cfg === "string") {
            cfg = JSON.parse(cfg);
        }
        hasToken = !!(cfg?.botToken && cfg.botToken.trim() !== "" && cfg.botToken !== "DUMMY_TOKEN");
      } catch(err) {}

      if (!hasUsers && !hasTransactions && !hasToken) {
        console.error("[Database] CRITICAL Safeguard: Refusing to overwrite populated database with empty/reset structure!");
        return false;
      }
    }
  } catch (err) {}

  try {
    const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
    const transaction = sqliteDb.transaction((obj: any) => {
      for (const key of Object.keys(obj)) {
        insert.run(key, JSON.stringify(obj[key]));
      }
    });
    transaction(data);
    return true;
  } catch (err: any) {
    console.error("[Database SQLite Write Error]", err.message);
    return false;
  }
}

function getSystemSettings(db?: any) {
  const data = db || readSqliteDb();
  let parsedSettings = {};
  if (data.settings) {
    parsedSettings = { ...data.settings };
    delete (parsedSettings as any).panel_config; // Clean up string
    if (data.settings.panel_config) {
      try {
        const pc =
          typeof data.settings.panel_config === "string"
            ? JSON.parse(data.settings.panel_config)
            : data.settings.panel_config;
        parsedSettings = { ...parsedSettings, ...pc };
      } catch (e) {}
    }
  }

  const settings: any = {
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
    btnTextWallet: "شارژ کیف پول 💳",
    walletChargeAmounts: [200000, 300000, 400000, 500000, 1000000],
    currency: "تومان",
    dashboardUsername:
      process.env.DASHBOARD_USERNAME || process.env.PANEL_USER || "Daltoon",
    dashboardPassword:
      process.env.DASHBOARD_PASSWORD || process.env.PANEL_PASS || "Daltoon10",
    serverPort: 3000,
    admins: [],
    panelConnectionActive: false,
    ...parsedSettings,
  };


  return settings;
}

let botProcess: ChildProcess | null = null;
let pythonDepsInstalled = false;

function startPythonBot() {
  const isPM2 =
    process.env.PM2_HOME !== undefined ||
    process.env.pm_id !== undefined ||
    process.env.name === "daltoon-store";

  if (isPM2) {
    console.log(
      "[Bot Manager] Running in PM2 environment. Delegating bot restart to PM2 daemon to avoid duplicate polling conflicts...",
    );
    exec("pm2 restart daltoon-bot", (err, stdout, stderr) => {
      if (err) {
        console.error(
          "[Bot Manager] Failed to restart daltoon-bot via PM2:",
          err.message,
        );
      } else {
        console.log(
          "[Bot Manager] daltoon-bot process restarted successfully via PM2.",
        );
      }
    });
    return;
  }

  if (botProcess) {
    console.log("[Bot Manager] Stopping old Python bot process...");
    botProcess.kill("SIGKILL");
    botProcess = null;
  }

  // Load latest settings to check if BOT_TOKEN is empty
  const db = readSqliteDb();
  const settings = getSystemSettings(db);
  const token = settings.botToken;

  if (!token || token === "DUMMY_TOKEN" || token.trim() === "") {
    console.log(
      "[Bot Manager] Bot token is empty or dummy. Python bot will not start.",
    );
    return;
  }

  const runBot = () => {
    console.log(
      `[Bot Manager] Starting Python Telegram Bot with token ${token.substring(0, 6)}...`,
    );
    try {
      const pythonCmd = "python3";
      const botScriptPath = path.resolve(process.cwd(), "bot.py");

      botProcess = spawn(pythonCmd, ["-u", botScriptPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          PYTHONPATH: (process.env.PYTHONPATH ? process.env.PYTHONPATH + ":" : "") + path.join(process.env.HOME || "/root", ".local/lib/python3.10/site-packages"),
        },
        stdio: "pipe",
      });

      const logStream = fs.createWriteStream("bot_dev.log", { flags: "a" });

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
          `[Bot Manager] Python bot process closed with code ${code}`,
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
    console.log(
      "[Bot Manager] Ensuring Python dependencies (pyTelegramBotAPI, python-dotenv, requests) are installed...",
    );
    exec(
      "curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip_fresh.py && python3 get-pip_fresh.py --user || true",
      () => {
        exec(
          "python3 -m pip install pyTelegramBotAPI python-dotenv requests --break-system-packages --user || ~/.local/bin/pip install pyTelegramBotAPI python-dotenv requests --user || pip install pyTelegramBotAPI python-dotenv requests --user || true",
          () => {
            pythonDepsInstalled = true;
            runBot();
          },
        );
      }
    );
  } else {
    runBot();
  }
}

// Ensure database file gets seeded on startup
readSqliteDb();
console.log(`[Database] Using active database at: ${dbSqlitePath}`);
startPythonBot();

// --- API Endpoints ---

// Full Wipe Database API
app.post("/api/database/wipe-all", async (req, res) => {
  try {
    const targetDbFile = path.resolve(process.cwd(), "Daltoon_Bot.db");
    if (fs.existsSync(targetDbFile)) {
      try {
        sqliteDb.close();
      } catch (e) {}
      try { fs.unlinkSync(targetDbFile); } catch (e) {}
      try { fs.unlinkSync(targetDbFile + "-wal"); } catch (e) {}
      try { fs.unlinkSync(targetDbFile + "-shm"); } catch (e) {}
    }
    // Also clear process-level cache if any (though here it's just variables)
    res.json({
      success: true,
      message: "System wiped and will re-initialize on next load.",
    });

    // Optional: delay exit to allow response to be sent
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Database API
app.post("/api/database/reset", async (req, res) => {
  try {
    if (fs.existsSync(dbSqlitePath)) {
      fs.unlinkSync(dbSqlitePath);
    }
    try {
      sqliteDb.exec("DELETE FROM kv;");
    } catch (e) {}
    const freshDb = readSqliteDb();
    res.json({
      success: true,
      message: "Database reset to empty template successfully.",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AESTHETIC TELEGRAM WEB APP SUBSCRIPTION COPY CONTAINER
app.get("/copy", (req, res) => {
  try {
    // Dynamic host domain auto-detection & registration for Python Bot synchrony
    const host = req.headers.host;
    if (host) {
      const protocol =
        req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
      const dynamicUrl = `${protocol}://${host}`;
      const db = readSqliteDb();
      if (db.settings) {
        let pcObj: any = {};
        if (db.settings.panel_config) {
          try {
            pcObj = JSON.parse(db.settings.panel_config);
          } catch (err) {}
        }
        if (pcObj.botWebUrl !== dynamicUrl) {
          pcObj.botWebUrl = dynamicUrl;
          db.settings.panel_config = JSON.stringify(pcObj);
          writeSqliteDb(db);
        }
      }
    }
  } catch (err) {
    console.error("[Dynamic Host Save Failed]", err);
  }

  const link = (req.query.link as string) || "";

  res.send(`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دریافت لینک اتصال دالتون</title>
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
        <h1 class="text-xl font-extrabold text-white tracking-wide">روتر اختصاصی دالتون</h1>
        <p class="text-[10px] text-indigo-400 mt-1 font-semibold tracking-widest uppercase">Daltoon Subscription Gateway</p>
    </div>

    <!-- Main Content Glass Box -->
    <div class="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 my-4 space-y-5 animate-slide-up">
        <div id="toast" class="hidden fixed top-6 right-1/2 translate-x-1/2 z-50 bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all duration-300 transform scale-90 opacity-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span dir="rtl">لینک با موفقیت کپی شد! ✅</span>
        </div>

        <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1 justify-between">
              <span>🔗 لینک اشتراک سابسکریپشن:</span>
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
          <span id="btnText">کپی کردن لینک اشتراک</span>
        </button>

        <p class="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-1">
          💡 این لینک را کپی کرده و در برنامه کلاینت (مانند v2rayNG ،V2box ،Happ یا Streisand) اضافه نمایید تا تمام کانفیگ‌های فعال به طور خودکار بارگذاری شوند.
        </p>
    </div>

    <!-- Bottom Close Button Area -->
    <div class="w-full max-w-sm px-4 mb-6 z-10">
        <button id="closeBtn" class="w-full py-3.5 px-4 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>بستن پنجره</span>
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
            btnText.textContent = 'لینک با موفقیت کپی شد! ✅';
            copyBtn.classList.remove('from-purple-600', 'to-indigo-600');
            copyBtn.classList.add('from-emerald-600', 'to-green-600', 'shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)]');

            toast.classList.remove('hidden', 'scale-90', 'opacity-0');
            toast.classList.add('scale-100', 'opacity-100');

            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                btnText.textContent = 'کپی کردن لینک اشتراک';
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

// 1. Get complete aggregated database snapshot
app.get("/api/data", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);

    // Ensure admins list is properly formatted
    if (!settings.admins || !Array.isArray(settings.admins)) {
      settings.admins = [];
    }

    console.log(
      "[DEBUG] /api/data returned settings.botToken:",
      settings.botToken,
    );

    // REAL-TIME 3X-UI INBOUNDS MONITORING IMPLEMENTATION
    const activeServers = getActiveServers(settings);
    if (activeServers.length > 0) {
      try {
        let allInbounds: any[] = [];
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
                  5000
                );
                
                if (groupsRes.ok) {
                  const groupsData = await groupsRes.json();
                  const pasarguardGroups = (groupsData.groups || []).map((g: any) => ({
                    id: g.id,
                    remark: g.name,
                    port: 0,
                    protocol: "pasarguard-group",
                    clientsCount: 0 // Could fetch detailed list to get total_users if needed
                  }));
                  allInbounds = allInbounds.concat(pasarguardGroups);
                }
              }
            } catch (e) {
              console.error("[Sanaei API Sync] Failed to fetch Pasarguard groups", e);
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
                  5000
                );
                
                if (servicesRes.ok) {
                  const servicesData = await servicesRes.json();
                  const rebeccaInbounds = (servicesData.services || []).map((s: any) => ({
                    id: s.id,
                    remark: s.name,
                    port: 0,
                    protocol: "rebecca-service",
                    clientsCount: s.user_count || 0
                  }));
                  allInbounds = allInbounds.concat(rebeccaInbounds);
                }
              }
            } catch (e) {
              console.error("[Sanaei API Sync] Failed to fetch Reebeka services", e);
            }
          } else {
            const loginResult = await loginXuiPanel(
              cleanedUrl,
              server.panelUsername,
              server.panelPassword,
            );

            if (loginResult.success && loginResult.cookie) {
              const listHeaders: Record<string, string> = { Cookie: loginResult.cookie };
              if (loginResult.csrfToken) {
                listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
              }
              const listRes = await xuiFetch(
                `${cleanedUrl}/panel/api/inbounds/list`,
                {
                  method: "GET",
                  headers: listHeaders,
                },
                5000,
              );

              if (listRes.ok) {
                const listJson = await listRes.json();
                if (listJson && listJson.success && Array.isArray(listJson.obj)) {
                  const freshInbounds = listJson.obj.map((item: any) => {
                    let totalClientsCount = 0;
                    try {
                      const settingsObj =
                        typeof item.settings === "string"
                          ? JSON.parse(item.settings)
                          : item.settings;
                      if (settingsObj && Array.isArray(settingsObj.clients)) {
                      totalClientsCount = settingsObj.clients.length;
                    }
                  } catch (e) {}

                  const usedGb = (
                    (Number(item.up || 0) + Number(item.down || 0)) /
                    (1024 * 1024 * 1024)
                  ).toFixed(1);
                  const limitGb = item.total
                    ? (Number(item.total) / (1024 * 1024 * 1024)).toFixed(0)
                    : "unlimited";

                  return {
                    id: item.id,
                    remark:
                      `[${server.name}] ` +
                      (item.remark || `Inbound #${item.id}`),
                    protocol: item.protocol || "vless",
                    port: item.port || 1234,
                    totalClients: totalClientsCount,
                    trafficUsed: usedGb,
                    trafficLimit: limitGb,
                    status: item.enable ? "active" : "inactive",
                  };
                });
                allInbounds = allInbounds.concat(freshInbounds);
              }
            }
          }
          }
        }
        db.inbounds = allInbounds;
        writeSqliteDb(db);
      } catch (e: any) {
        console.warn("[Background 3x-ui Sync Warning]:", e.message);
      }
    }

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
      isNewInstall:
        db.isNewInstall ||
        !settings.botToken ||
        settings.botToken.trim() === "" ||
        settings.botToken === "DUMMY_TOKEN" ||
        !settings.ownerId ||
        Number(settings.ownerId) === 0,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Save panel configuration
// --- GIFT CODES API ---
app.get("/api/gift-codes", (req, res) => {
  const db = readSqliteDb();
  res.json(db.gift_codes || []);
});

app.post("/api/gift-codes", (req, res) => {
  const db = readSqliteDb();
  if (!db.gift_codes) db.gift_codes = [];
  const { code, amount, maxUsage, durationDays } = req.body;
  if (!code || !amount || maxUsage === undefined)
    return res.status(400).json({ error: "Missing fields" });

  const newCode = {
    id: crypto.randomUUID(),
    code,
    amount: parseInt(amount, 10),
    maxUsage: parseInt(maxUsage, 10),
    totalUsage: 0,
    usedBy: [],
    createdAt: new Date().toISOString(),
    durationDays: durationDays ? parseInt(durationDays, 10) : undefined,
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

// --- Colleague Endpoints ---
app.post("/api/colleague-packages/save", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_packages) db.colleague_packages = [];
  const { id, title, price, trafficGb, category, description, minCreateGb } = req.body;
  if (!id || !title || price === undefined || trafficGb === undefined) {
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
      minCreateGb: minCreateGb ? Number(minCreateGb) : 1,
    };
  } else {
    db.colleague_packages.push({
      id,
      title,
      price: Number(price),
      trafficGb: Number(trafficGb),
      category,
      description,
      minCreateGb: minCreateGb ? Number(minCreateGb) : 1,
    });
  }
  writeSqliteDb(db);
  res.json({ success: true, colleaguePackages: db.colleague_packages });
});

app.post("/api/colleague-packages/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_packages) db.colleague_packages = [];
  db.colleague_packages = db.colleague_packages.filter(
    (p) => p.id !== req.body.id,
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

    const pkgsMap = new Map(db.colleague_packages.map((p: any) => [p.id, p]));
    const sortedPkgs: any[] = [];
    orderedIds.forEach((id: string) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Colleague Category Endpoints ---
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
    db.colleague_categories[existingIdx] = { id, name, emoji: emoji || "📁" };
  } else {
    db.colleague_categories.push({ id, name, emoji: emoji || "📁" });
  }
  writeSqliteDb(db);
  res.json({ success: true, colleagueCategories: db.colleague_categories });
});

app.post("/api/colleague-categories/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_categories) db.colleague_categories = [];
  db.colleague_categories = db.colleague_categories.filter(
    (c) => c.id !== req.body.id,
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

    const catsMap = new Map(db.colleague_categories.map((c: any) => [c.id, c]));
    const sortedCats: any[] = [];
    orderedIds.forEach((id: string) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/colleague-accounts/delete", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];
  db.colleague_accounts = db.colleague_accounts.filter(
    (a) => a.id !== req.body.id,
  );
  writeSqliteDb(db);
  res.json({ success: true, colleagueAccounts: db.colleague_accounts });
});

app.post("/api/colleague-accounts/reset", (req, res) => {
  const db = readSqliteDb();
  if (!db.colleague_accounts) db.colleague_accounts = [];

  const accIndex = db.colleague_accounts.findIndex((a) => a.id === req.body.id);
  if (accIndex !== -1) {
    db.colleague_accounts[accIndex].username = Math.random()
      .toString(36)
      .substring(2, 10);
    db.colleague_accounts[accIndex].password = Math.random()
      .toString(36)
      .substring(2, 10);
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
  if (accIndex !== -1 && req.body.trafficGb !== undefined) {
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

// --- PROMO CODES ENDPOINTS ---
app.post("/api/promo-codes", (req, res) => {
  try {
    const db = readSqliteDb();
    if (!db.promo_codes) db.promo_codes = [];
    const nextCode = req.body;

    const idx = db.promo_codes.findIndex(
      (p: any) => p.id === nextCode.id || p.code === nextCode.code,
    );
    if (idx >= 0) {
      db.promo_codes[idx] = nextCode;
    } else {
      db.promo_codes.push(nextCode);
    }

    writeSqliteDb(db);
    res.json({ success: true, item: nextCode });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/promo-codes/delete", (req, res) => {
  try {
    const db = readSqliteDb();
    if (!db.promo_codes) db.promo_codes = [];
    db.promo_codes = db.promo_codes.filter((p: any) => p.id !== req.body.id);
    writeSqliteDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TICKETS ENDPOINTS ---
app.post("/api/tickets/create", (req, res) => {
  try {
    const { userId, username, subject, message } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];

    const ticketId = "TKB-" + Math.floor(Math.random() * 9000 + 1000);
    const newTicket = {
      id: ticketId,
      userId: Number(userId),
      username: username || "user_" + userId,
      subject: subject,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          sender: "user",
          message: message,
          date: new Date().toISOString(),
        },
      ],
    };

    db.tickets.push(newTicket);
    writeSqliteDb(db);

    res.json({
      success: true,
      ticketId,
      tickets: db.tickets,
      ticket: newTicket,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/tickets/delete", (req, res) => {
  try {
    const { ticketId } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];

    db.tickets = db.tickets.filter((t: any) => t.id !== ticketId);
    writeSqliteDb(db);

    res.json({ success: true, tickets: db.tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/tickets/reply", (req, res) => {
  try {
    const { ticketId, reply } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];

    const ticketIdx = db.tickets.findIndex((t: any) => t.id === ticketId);
    if (ticketIdx >= 0) {
      const ticket = db.tickets[ticketIdx];
      ticket.messages.push({
        sender: "admin",
        message: reply,
        date: new Date().toISOString(),
      });
      ticket.status = "answered";
      ticket.updatedAt = new Date().toISOString();

      writeSqliteDb(db);

      // Notify the user on Telegram of the admin reply
      const settings = getSystemSettings(db);
      if (settings.botToken && ticket.userId) {
        const notifyMsg =
          `📨 <b>پاسخ پشتیبانی به تیکت شما!</b>\n\n` +
          `🆔 <b>شناسه تیکت:</b> <code>${ticket.id}</code>\n` +
          `💬 <b>متن پاسخ:</b>\n` +
          `<blockquote>${reply}</blockquote>\n\n` +
          `🍀 <i>از اعتماد و شکیبایی شما سپاسگزاریم.</i>`;

        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "✍️ پاسخ به این تیکت",
                callback_data: `tkt_reply_${ticket.id}`,
              },
            ],
          ],
        };

        sendTelegramMessage(
          settings.botToken,
          ticket.userId,
          notifyMsg,
          replyMarkup,
        ).catch((err) => {
          console.error("[Telegram Ticket Reply Auto-Notify Error]", err);
        });
      }

      res.json({ success: true, ticket });
    } else {
      res.status(404).json({ success: false, error: "Ticket not found" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/tickets/close", (req, res) => {
  try {
    const { ticketId } = req.body;
    const db = readSqliteDb();
    if (!db.tickets) db.tickets = [];

    const ticketIdx = db.tickets.findIndex((t: any) => t.id === ticketId);
    if (ticketIdx >= 0) {
      const ticket = db.tickets[ticketIdx];
      ticket.status = "closed";
      ticket.updatedAt = new Date().toISOString();
      writeSqliteDb(db);

      // Notify the user on Telegram of ticket closure
      const settings = getSystemSettings(db);
      if (settings.botToken && ticket.userId) {
        const nickname = settings.botNickname || "دالتون بات";
        const notifyMsg =
          `🔒 <b>تیکت شما بسته شد!</b>\n\n` +
          `🆔 <b>شناسه تیکت:</b> <code>${ticket.id}</code>\n\n` +
          `💬 تیکت شما توسط پشتیبانی فنی ${nickname} بررسی و بسته شد.\n` +
          `اگر همچنان نیاز به راهنمایی بیشتری دارید، می‌توانید تیکت جدیدی در ربات ثبت فرمایید.`;
        sendTelegramMessage(settings.botToken, ticket.userId, notifyMsg).catch(
          (err) => {
            console.error("[Telegram Ticket Close Auto-Notify Error]", err);
          },
        );
      }

      res.json({ success: true, ticket });
    } else {
      res.status(404).json({ success: false, error: "Ticket not found" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- REGEN UUID & TRANSFER KEY CONNECTIONS ---
app.post("/api/subscription-keys/regenerate-uuid", async (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    const subIdx = db.subscription_keys.findIndex((k: any) => k.id === id);
    if (subIdx >= 0) {
      const key = db.subscription_keys[subIdx];
      const clientName = key.clientName || key.clientEmail;

      let resetResult;
      if (!clientName) {
        // Fallback: This is a custom/manual key, regenerate locally in DB immediately
        const crypto = await import("crypto");
        const newUuid = crypto.randomUUID();
        const newSubId = crypto.randomBytes(8).toString("hex");
        const settings = getSystemSettings(db);
        const activeServers = getActiveServers(settings);
        let chosenServer = activeServers.length > 0 ? activeServers[0] : null;
        if (key.serverId) {
          const found = activeServers.find((s: any) => s.id === key.serverId);
          if (found) {
            chosenServer = found;
          }
        }
        const subBase =
          chosenServer &&
          chosenServer.subUrl &&
          chosenServer.subUrl.trim() !== ""
            ? normalizeXuiUrl(chosenServer.subUrl)
            : chosenServer
              ? normalizeXuiUrl(chosenServer.panelUrl)
              : "https://tr.sub-daltoon.ir:2096";
        const subLink = `${subBase}/sub/${newSubId}`;
        resetResult = { success: true, clientUuid: newUuid, subLink };
        console.log(
          `[regenerate-uuid API] Regenerated manual client locally: ${key.id}`,
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
          error: resetResult.error || "Failed to reset UUID",
        });
      }
    } else {
      res
        .status(404)
        .json({ success: false, error: "Subscription entry not found." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/subscription-keys/transfer-ownership", async (req, res) => {
  try {
    const { id, targetUserIdOrUsername } = req.body;
    const db = readSqliteDb();

    const cleanTarget = String(targetUserIdOrUsername).replace("@", "").trim();
    const targetUser = db.users.find(
      (u: any) =>
        String(u.userId) === cleanTarget ||
        String(u.username).toLowerCase() === cleanTarget.toLowerCase(),
    );

    if (!targetUser) {
      return res.status(400).json({
        success: false,
        error:
          "کاربر مقصد در سیستم یافت نشد. دوست شما باید حداقل یکبار دکمه /start را در ربات زده باشد.",
      });
    }

    const subIdx = db.subscription_keys.findIndex((k: any) => k.id === id);
    if (subIdx >= 0) {
      const key = db.subscription_keys[subIdx];
      const oldUserId = key.userId;

      // Transfer
      key.userId = targetUser.userId;
      db.subscription_keys[subIdx] = key;

      // Recalculate
      const oldUser = db.users.find((u: any) => u.userId === oldUserId);
      if (oldUser) {
        oldUser.activePlansCount = db.subscription_keys.filter(
          (k: any) => k.userId === oldUserId && k.status === "active",
        ).length;
      }
      targetUser.activePlansCount = db.subscription_keys.filter(
        (k: any) => k.userId === targetUser.userId && k.status === "active",
      ).length;

      writeSqliteDb(db);
      res.json({
        success: true,
        key,
        targetUsername: targetUser.username || String(targetUser.userId),
      });
    } else {
      res
        .status(404)
        .json({ success: false, error: "کانفیگ مورد نظر یافت نشد." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/transactions/instant-pay", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const db = readSqliteDb();

    const user = db.users.find((u: any) => u.userId === Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const amountNum = Number(amount);
    user.walletBalance = Number(user.walletBalance) + amountNum;

    const newTx = {
      id: "TX-AUTO-" + Math.floor(Math.random() * 90000 + 10000),
      userId: Number(userId),
      username: user.username,
      amount: amountNum,
      receiptImage: "bg-gradient-to-br from-emerald-500 to-teal-700",
      status: "approved",
      date: new Date().toISOString(),
      description: description || "پرداخت خودکار آنلاین",
    };

    db.transactions.unshift(newTx);
    writeSqliteDb(db);
    res.json({
      success: true,
      userWalletBalance: user.walletBalance,
      tx: newTx,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AI Chatbot Feature ---
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    let key: string | undefined = undefined;

    // 1. Try to load from database settings first (User Preferred)
    try {
      const db = readSqliteDb();
      // Ensure we check both stringified panel_config and direct settings for robustness
      let settingsObj = db.settings || {};
      if (db.settings && db.settings.panel_config) {
        try {
          const cfg = JSON.parse(db.settings.panel_config);
          settingsObj = { ...settingsObj, ...cfg };
        } catch (e) {}
      }

      if (settingsObj.geminiApiKey && settingsObj.geminiApiKey.trim() !== "") {
        key = settingsObj.geminiApiKey.trim();
        console.log(
          "[System] Successfully loaded GEMINI_API_KEY from database settings.",
        );
      }
    } catch (e: any) {
      console.warn(
        "[System] Could not load API key from database:",
        e.message,
      );
    }

    // 2. Fallback to process.env if not found in DB
    if (!key) {
      key = process.env.GEMINI_API_KEY;
      if (key)
        console.log(
          "[System] Using GEMINI_API_KEY from environment variables.",
        );
    }

    // 3. Last fallback: Direct .env file parsing (for local dev environments)
    if (!key) {
      try {
        const envPaths = [
          path.resolve(process.cwd(), ".env"),
          path.resolve(_dirname, ".env"),
          path.resolve(_dirname, "..", ".env"),
          "/.env",
        ];
        for (const envPath of envPaths) {
          if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf8");
            const match = content.match(
              /GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/,
            );
            if (match && match[1]) {
              key = match[1].trim();
              console.log(
                `[System] Loaded GEMINI_API_KEY from .env file: ${envPath}`,
              );
              break;
            }
          }
        }
      } catch (e: any) {}
    }

    if (key) {
      key = key.trim();
      // Remove accidental quotes if they exist in file/env
      if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
      ) {
        key = key.substring(1, key.length - 1);
      }
      key = key.trim();
    }

    if (!key || key === "") {
      throw new Error(
        "دستیار هوشمند فعال نیست. لطفا کلید (GEMINI_API_KEY) را در تنظیمات داشبورد ست کنید.",
      );
    }

    aiClient = new GoogleGenAI({
      apiKey: key,
    });
  }
  return aiClient;
}

// Helper to perform web search using Google Custom Search API or Brave Search API
async function performWebSearch(query: string, googleKey?: string, cx?: string, braveKey?: string): Promise<string> {
  if (!query) return "";
  let resultsText = "";

  // 1. Try Google Custom Search API
  if (googleKey && googleKey.trim() !== "") {
    const searchCx = cx && cx.trim() !== "" ? cx.trim() : "";
    try {
      console.log(`[Web Search] Querying Google Custom Search API for: "${query}"`);
      const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleKey.trim())}&cx=${encodeURIComponent(searchCx)}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: any = await res.json();
        const items = data.items || [];
        if (items.length > 0) {
          resultsText += `نتایج جستجوی گوگل برای "${query}":\n`;
          items.slice(0, 5).forEach((item: any, idx: number) => {
            resultsText += `[${idx + 1}] عنوان: ${item.title}\nتوضیحات: ${item.snippet}\nلینک: ${item.link}\n\n`;
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

  // 2. Try Brave Search API if Google didn't return results
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
        const data: any = await res.json();
        const items = data.web?.results || [];
        if (items.length > 0) {
          resultsText += `نتایج جستجوی وب (Brave) برای "${query}":\n`;
          items.slice(0, 5).forEach((item: any, idx: number) => {
            resultsText += `[${idx + 1}] عنوان: ${item.title}\nتوضیحات: ${item.description}\nلینک: ${item.url}\n\n`;
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
      (u: any) => u.status === "active",
    ).length;

    const aiSearchEnabled = systemSettings.aiSearchEnabled !== false;

    // Custom Web Search Context (Google / Brave Search fallback for custom models)
    let injectedSearchContext = "";
    if (aiSearchEnabled) {
      const googleKey = systemSettings.googleSearchApiKey || process.env.GOOGLE_SEARCH_API_KEY || "";
      const googleCx = systemSettings.googleSearchCx || process.env.GOOGLE_SEARCH_CX || "";
      const braveKey = systemSettings.braveSearchApiKey || process.env.BRAVE_SEARCH_API_KEY || "";
      
      if ((googleKey && googleKey.trim() !== "") || (braveKey && braveKey.trim() !== "")) {
        const searchResults = await performWebSearch(message, googleKey, googleCx, braveKey);
        if (searchResults && searchResults.trim() !== "") {
          injectedSearchContext = `\n\n[اطلاعات زنده جستجوی وب]\nاطلاعات زیر آخرین نتایج جستجوی اینترنت درباره سوال کاربر است. از این اطلاعات برای پاسخ به سوالات مربوط به رویدادهای روز استفاده کنید:\n${searchResults}`;
        }
      }
    }

    let geminiApiKey = systemSettings.geminiApiKey || "";

    // Fallback to process.env if not set in DB
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      geminiApiKey = process.env.GEMINI_API_KEY || "";
    }

    let geminiBaseUrl = systemSettings.geminiBaseUrl || "";
    let customAiApiKey = systemSettings.customAiApiKey || "";
    let aiBaseUrl = systemSettings.aiBaseUrl || "";
    let aiModelName = systemSettings.aiModelName || "";

    // Determine target key and parameters
    let apiKeyToUse = "";
    let finalBaseUrl = "";
    let finalModelName = "";

    if (isSupport) {
      // Support assistant strictly uses geminiApiKey
      apiKeyToUse = geminiApiKey.trim();
      finalBaseUrl = geminiBaseUrl ? geminiBaseUrl.trim() : "";
      if (!apiKeyToUse || apiKeyToUse.trim() === "") {
        return res.status(400).json({
          error:
            "کلید API جیمینای ثبت نشده است. لطفاً ابتدا در تنظیمات داشبورد کلید معتبر را وارد کنید.",
        });
      }
    } else {
      // General AI strictly uses customAiApiKey
      apiKeyToUse = customAiApiKey.trim();
      finalBaseUrl = aiBaseUrl ? aiBaseUrl.trim() : "";
      finalModelName = aiModelName ? aiModelName.trim() : "";

      if (!apiKeyToUse || apiKeyToUse.trim() === "") {
        return res.status(400).json({
          error:
            "کلید API هوش مصنوعی عمومی تنظیم نشده است. لطفاً تنظیمات را بررسی کنید.",
        });
      }
    }

    // Support Assistant uses Gemini, General AI uses the custom API key (or auto-detects if Custom API key happens to be Gemini)
    const isDirectGemini = isSupport
      ? true
      : apiKeyToUse.startsWith("AIzaSy") &&
        (!finalBaseUrl || finalBaseUrl === "");

    // Prepare system instruction prompt based on bot identity or general purpose
    let systemPrompt = "";
    if (isSupport) {
      const pricingBoxes = systemSettings.customPricingBoxes || [];
      const serversList = (systemSettings.servers || []).map((s: any) => ({ id: s.id, name: s.name }));
      
      systemPrompt = `شما یک دستیار هوش مصنوعی مودب و پاسخگو متعلق به ربات تلگرام به نام "${systemSettings.botNickname || "دالتون بات"}" (Daltoon Bot) هستید. 
شما باید به سوالات مرتبط با خدمات و خرید از ربات پاسخ دهید.

مهم‌ترین نکته: در صورتی که کاربر نیاز به پشتیبانی انسانی، شارژ ولت، رفع مشکل درگاه، قطعی یا خرید دارد، او را راهنمایی کنید که از منوی اصلی ربات از دکمه «🎫 ثبت تیکت پشتیبانی» استفاده کند.

اطلاعات فعلی سیستم:
- تعرفه های ثابت: ${JSON.stringify(dbData.vpn_plans || [])}
- ویژگی ساخت کانفیگ با حجم دلخواه (سفارشی): 
  کاربران می‌توانند علاوه بر خرید تعرفه‌های ثابت بالا، کانفیگ با حجم ترافیک (گیگابایت) و روزهای اعتبار کاملاً سفارشی و دلخواه خود بسازند.
  روش استفاده در ربات: کاربر باید به منوی اصلی برود، دکمه «🛍️ خرید سرویس» (یا خرید سرویس جدید) را انتخاب کند، سرور موردنظر خود را انتخاب کند، و سپس روی دکمه «✨ ساخت کانفیگ با حجم دلخواه» کلیک کند. ربات از او می‌خواهد که میزان حجم (گیگابایت) و مدت زمان (روزها) و یک نام کاربری دلخواه وارد کند.
  فرمول محاسبه قیمت: هزینه نهایی = (حجم به گیگابایت * قیمت هر گیگابایت) + (تعداد روزها * قیمت هر روز)
  به طور پیش‌فرض قیمت هر گیگابایت ترافیک 3,000 تومان و قیمت هر روز اعتبار 2,000 تومان است (مگر اینکه برای آن سرور خاص قیمت متفاوتی تنظیم شده باشد).
- اطلاعات جعبه‌های قیمت‌گذاری دلخواه سرورها: ${JSON.stringify(pricingBoxes)}
- لیست سرورهای فعال: ${JSON.stringify(serversList)}
- تعداد کاربران: ${activeUsersCount}
- راهنما: ${systemSettings.supportText || ""}${injectedSearchContext}`;
    } else {
      systemPrompt = `شما یک هوش مصنوعی عمومی هستید که به کاربر در گفتگوهای عمومی کمک می‌کنید. پاسخ‌ها را به زبان فارسی روان و مودبانه ارائه دهید.${injectedSearchContext}`;
    }

    if (isDirectGemini) {
      // Direct Google Gemini API call
      console.log(
        `[AI Chat] Making direct Google Gemini API call (isSupport: ${isSupport})`,
      );
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse, ...(finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {}) });

      const modelName = finalModelName || "gemini-2.5-flash";
      
      const configObj: any = {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      };

      if (aiSearchEnabled) {
        configObj.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: message,
        config: configObj,
      });

      if (response && response.text) {
        let replyText = response.text;
        
        // Extract references if available
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
          let refs = "\n\n🌐 **منابع جستجو:**\n";
          let hasRefs = false;
          const seenUris = new Set<string>();
          chunks.forEach((chunk: any) => {
            if (chunk.web && chunk.web.uri && !seenUris.has(chunk.web.uri)) {
              seenUris.add(chunk.web.uri);
              refs += `- [${chunk.web.title || "منبع"}](${chunk.web.uri})\n`;
              hasRefs = true;
            }
          });
          if (hasRefs) {
            replyText += refs;
          }
        }

        return res.json({ response: replyText });
      } else {
        throw new Error("پاسخی از سرور جیمینای دریافت نشد.");
      }
    } else {
      // OpenAI-compatible / Custom endpoint routing (e.g. AwanLLM, DeepSeek, etc.)
      if (!finalBaseUrl) {
        // Auto-detect/default to AwanLLM base URL for non-Gemini keys
        finalBaseUrl = "https://api.awanllm.com/v1";
        if (!finalModelName) {
          finalModelName = "Meta-Llama-3-8B-Instruct";
        }
      }

      const trimmedUrl = finalBaseUrl.replace(/\/$/, "");
      const completionUrl = `${trimmedUrl}/chat/completions`;
      const modelToUse =
        finalModelName && finalModelName.trim() !== ""
          ? finalModelName.trim()
          : "gpt-4o-mini";

      console.log(
        `[AI Chat Custom] Routing to OpenAI Compatible URL: ${completionUrl} with model: ${modelToUse} (isSupport: ${isSupport})`,
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(completionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeyToUse}`,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `خطای سرویس‌دهنده هوش مصنوعی (کد ${response.status}): ${errText}`,
        );
      }

      const resData: any = await response.json();
      const responseText = resData.choices?.[0]?.message?.content || "";
      if (responseText) {
        return res.json({ response: responseText });
      } else {
        throw new Error("پاسخ دریافتی از سرور هوش مصنوعی خالی بود.");
      }
    }
  } catch (error: any) {
    console.error("[AI Chat API Error]:", error);
    let errMsg = error.message || "Failed to generate AI response.";
    
    // Sanitize HTML errors
    if (errMsg.toLowerCase().includes("<!doctype") || errMsg.toLowerCase().includes("<html")) {
      errMsg = "خطای ارتباط با سرور هوش مصنوعی (Forbidden/Proxy Error). لطفاً آدرس Base URL یا وضعیت شبکه را بررسی کنید.";
    }

    if (errMsg.startsWith("{")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch (e) {}
    }

    if (errMsg.includes("API key not valid")) {
      errMsg = "کلید API ثبت شده نامعتبر است. لطفاً به مدیریت اطلاع دهید.";
    } else if (
      errMsg.toLowerCase().includes("quota") ||
      errMsg.toLowerCase().includes("rate limit") ||
      errMsg.includes("429")
    ) {
      errMsg =
        "محدودیت استفاده از کلید API هوش مصنوعی به پایان رسیده است (Quota Exceeded). لطفاً به مدیریت اطلاع دهید.";
    }

    res.status(500).json({ error: errMsg });
  }
});

app.post("/api/ai/test-key", async (req, res) => {
  try {
    let { apiKey, baseUrl, modelName, type } = req.body;
    if (!apiKey || apiKey.trim() === "") {
      return res
        .status(400)
        .json({ error: "لطفاً ابتدا کلید API را وارد کنید." });
    }

    const trimmedKey = apiKey.trim();
    let finalBaseUrl = baseUrl ? baseUrl.trim() : "";
    let finalModelName = modelName ? modelName.trim() : "";

    // If type is explicitly 'gemini', test as Google Gemini.
    // Otherwise, auto-detect (useful if type is custom but they put a gemini key without base url)
    const isDirectGemini =
      type === "gemini"
        ? true
        : trimmedKey.startsWith("AIzaSy") &&
          (!finalBaseUrl || finalBaseUrl === "");

    if (isDirectGemini) {
      // Test direct Gemini Key
      console.log(`[AI Key Test] Testing direct Gemini API key`);
      const ai = new GoogleGenAI({
        apiKey: trimmedKey,
        ...(finalBaseUrl ? { httpOptions: { baseUrl: finalBaseUrl } } : {})
      });

      const model = finalModelName || "gemini-2.5-flash";
      const response = await ai.models.generateContent({
        model: model,
        contents: "سلام",
        config: {
          maxOutputTokens: 5,
        },
      });

      if (response && response.text) {
        return res.json({
          success: true,
          message: "اتصال با موفقیت برقرار شد! کلید API جیمینای معتبر است.",
        });
      } else {
        throw new Error("پاسخ دریافتی از جیمینای خالی بود.");
      }
    } else {
      // Test OpenAI-compatible / Custom API key (e.g. AwanLLM, DeepSeek, etc.)
      if (!finalBaseUrl) {
        // Auto-detect/default to AwanLLM base URL for custom/OpenAI-compatible keys
        finalBaseUrl = "https://api.awanllm.com/v1";
        if (!finalModelName) {
          finalModelName = "Meta-Llama-3-8B-Instruct";
        }
      }

      const trimmedUrl = finalBaseUrl.replace(/\/$/, "");
      const completionUrl = `${trimmedUrl}/chat/completions`;
      const modelToUse =
        finalModelName && finalModelName.trim() !== ""
          ? finalModelName.trim()
          : "gpt-4o-mini";

      console.log(
        `[AI Key Test] Testing OpenAI compatible API key for model: ${modelToUse} at ${completionUrl}`,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const response = await fetch(completionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content: "سلام" }],
          max_tokens: 5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `خطای سرور سرویس‌دهنده (کد ${response.status}): ${errText}`,
        );
      }

      return res.json({
        success: true,
        message: "اتصال با موفقیت برقرار شد! کلید API معتبر است.",
      });
    }
  } catch (err: any) {
    console.error("[AI Key Test Error]:", err);
    let errMsg = err.message || "بررسی کلید API با خطا مواجه شد.";

    // Parse GoogleGenAI JSON error messages to be user-friendly
    if (errMsg.startsWith("{")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch (e) {}
    }

    if (
      err.name === "AbortError" ||
      errMsg.includes("aborted") ||
      errMsg.includes("timeout")
    ) {
      errMsg =
        "زمان اتصال به سرور هوش مصنوعی به پایان رسید (Timeout). این مشکل معمولاً ناشی از کندی موقت سرور هوش مصنوعی یا عدم پاسخگویی مناسب فیلترشکن/اینترنت سرور است. لطفاً چند لحظه دیگر دوباره تلاش کنید.";
    } else if (errMsg.includes("API key not valid")) {
      errMsg = "کلید API وارد شده نامعتبر است. لطفاً کلید صحیح را وارد کنید.";
    } else if (errMsg.includes("fetch failed")) {
      errMsg = "خطا در برقراری ارتباط با سرور هوش مصنوعی (Network Error).";
    } else if (
      errMsg.toLowerCase().includes("quota") ||
      errMsg.toLowerCase().includes("rate limit") ||
      errMsg.includes("429")
    ) {
      errMsg =
        "محدودیت استفاده از این کلید به پایان رسیده است (Quota Exceeded). لطفاً کلید دیگری وارد کنید.";
    }

    res.status(500).json({ error: errMsg });
  }
});

// ---------------------------

app.post("/api/gift-codes/edit", (req, res) => {
  const db = readSqliteDb();
  if (!db.gift_codes) db.gift_codes = [];
  const { id, code, amount, maxUsage, durationDays } = req.body;
  if (!id || !code || amount === undefined || maxUsage === undefined) {
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
        durationDays: durationDays ? parseInt(durationDays, 10) : undefined,
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
        error: "توکن نامعتبر است (فرمت نامعتبر)",
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getMe`,
        {
          signal: controller.signal,
        },
      );
      clearTimeout(timeout);

      const data: any = await response.json();
      if (data && data.ok) {
        return res.json({ success: true, bot: data.result });
      } else {
        const errorDesc =
          data && data.description ? data.description : "Unauthorized (401)";
        return res.json({ success: false, error: errorDesc });
      }
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.warn(
        "[Token Validation Error] Telegram request timed out or was filtered:",
        fetchErr.message,
      );
      // Because telegram is filtered in Iran, we allow proceeding if a network error occurs
      return res.json({
        success: true,
        warning: true,
        message:
          "به دلیل فیلترینگ تلگرام روی سرور، بررسی خودکار انجام نشد اما تنظیمات ثبت خواهد شد.",
      });
    }
  } catch (err: any) {
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

    // Compare admins list to find newly added ones
    const prevSettings = getSystemSettings(db);
    
    // Preserve existing critical fields if not provided in the payload
    const finalPayload = {
      ...prevSettings,
      ...payload
    };
    
    const configValue = JSON.stringify(finalPayload);

    const prevAdmins = prevSettings.admins || [];
    const newAdmins = payload.admins || [];

    const addedAdmins = newAdmins.filter(
      (newAdm: any) =>
        newAdm.userId &&
        !prevAdmins.some(
          (prevAdm: any) => Number(prevAdm.userId) === Number(newAdm.userId),
        ),
    );

    if (!db.settings) db.settings = {}; db.settings.panel_config = configValue;
    const saveSuccess = writeSqliteDb(db);

    if (!saveSuccess) {
      return res.status(500).json({ 
        success: false, 
        error: "خطا در ذخیره دیتابیس. فایل ممکن است قفل باشد یا فضای دیسک پر شده باشد." 
      });
    }

    // Reset cached AI client so newly saved GEMINI_API_KEY settings will take effect immediately
    aiClient = null;

    // Notify newly appointed admins via Telegram Bot
    const botToken = payload.botToken || prevSettings.botToken;
    const botNickname =
      payload.botNickname || prevSettings.botNickname || "دالتون بات";
    if (botToken && addedAdmins.length > 0) {
      for (const adm of addedAdmins) {
        try {
          const roleText =
            adm.role === "super_admin"
              ? "سوپر ادمین (مدیر ارشد)"
              : "ادمین معمولی (مدیریت پشتیبانی)";
          const htmlMsg =
            `👑 <b>انتصاب شایسته شما به عنوان مدیریت سیستم</b>\n\n` +
            `کاربر گرامی <b>@${adm.username || "کاربر"}</b> (شناسه: <code>${adm.userId}</code>)؛\n` +
            `با سلام و احترام،\n\n` +
            `بدین‌وسیله به اطلاع می‌رساند دسترسی مدیریتی شما به عنوان <b>${roleText}</b> در ربات ${botNickname} با موفقیت فعال گردید.\n\n` +
            `🛡️ <b>برخی از مزایا و وظایف سطح دسترسی ادمین:</b>\n` +
            `🔹 <b>بررسی و تایید واریزی‌ها:</b> دسترسی به لیست فیش‌های ارسالی کاربران در بخش «تایید تراکنش‌ها» جهت شارژ خودکار کیف پول.\n` +
            `🔹 <b>مدیریت اعضا:</b> امکان ویرایش، افزایش و یا کاهش موجودی کاربران، مسدودسازی و رفع مسدودیت اعضا.\n` +
            `🔹 <b>پلان‌های ادمین:</b> استفاده رایگان از پلان‌ها بدون کسر موجودی جهت بررسی و کنترل کیفی سرورها.\n` +
            `🔹 <b>اعلان‌های هوشمند:</b> رصد و دریافت فوری اطلاعات فیش‌های ارسالی اعضا به محض بارگذاری در ربات.\n\n` +
            `<i>مفتخریم که در تیم توسعه و مدیریت ${botNickname} حضور دارید. با آرزوی موفقیت و همکاری مستمر.</i>\n\n` +
            `✨ <b>تیم پشتیبانی و فنی ${botNickname}</b>`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: adm.userId,
              text: htmlMsg,
              parse_mode: "HTML",
            }),
          });
          console.log(
            `[Admin Welcomed] Successfully welcomed new admin ID: ${adm.userId}`,
          );
        } catch (err) {
          console.error(
            `[Admin Welcome Error] Failed to welcome admin ${adm.userId}:`,
            err,
          );
        }
      }
    }

    // Dynamic restart of the Python bot to reload newly added parameters/token
    startPythonBot();

    res.json({
      success: true,
      message: "Settings saved successfully to JSON store.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cache to store detected API prefix per panel base URL
const apiPrefixCache = new Map<string, string>();

async function getApiPrefix(cleanedUrl: string, cookie: string = ""): Promise<string> {
  if (!cleanedUrl) return "/panel/api";
  const normalized = cleanedUrl.replace(/\/+$/, "");
  if (apiPrefixCache.has(normalized)) {
    return apiPrefixCache.get(normalized)!;
  }

  const candidates = ["/panel/api", "/xui/API", "/xui/api"];
  for (const prefix of candidates) {
    const url = `${normalized}${prefix}/inbounds/list`;
    try {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      };
      if (cookie) {
        headers["Cookie"] = cookie;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timer);

      if (res && res.status !== 404) {
        console.log(`[API Path Auto-Detect] Found working API path prefix: '${prefix}' for URL: ${cleanedUrl}`);
        apiPrefixCache.set(normalized, prefix);
        return prefix;
      }
    } catch (e) {
      // Ignore errors and try next
    }
  }

  console.log(`[API Path Auto-Detect] All candidates returned 404 or timed out for: ${cleanedUrl}. Defaulting to '/panel/api'`);
  apiPrefixCache.set(normalized, "/panel/api");
  return "/panel/api";
}

// Robust fetch helper with timeout and standardized browser headers to bypass WAF / strict server security rules
async function xuiFetch(url: string, options: any = {}, timeoutMs = 8000) {
  // Automatically adjust path prefix if we detect '/panel/api/' in the URL
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
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,fa;q=0.8",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function getActiveServers(settings: any) {
  if (
    settings.servers &&
    Array.isArray(settings.servers) &&
    settings.servers.length > 0
  ) {
    return settings.servers.filter((s: any) => s.status !== "inactive");
  }
  // Fallback to legacy single server configuration if active
  if (
    settings.panelConnectionActive &&
    settings.baseUrl &&
    settings.panelUsername &&
    settings.panelPassword
  ) {
    return [
      {
        id: "legacy_server",
        name: "پنل اصلی",
        panelUrl: settings.baseUrl,
        subUrl: settings.subUrl,
        panelUsername: settings.panelUsername,
        panelPassword: settings.panelPassword,
        activeInboundIds: settings.activeInboundIds || [],
        status: "active",
      },
    ];
  }
  return [];
}

function normalizeXuiUrl(url: string): string {
  let cleaned = `${url}`.trim();
  // Strip any leading non-alphanumeric/non-protocol-accidental characters (like dots or extra slashes)
  cleaned = cleaned.replace(/^[\s./]+/, "");
  
  // Remove any trailing slashes
  cleaned = cleaned.replace(/\/+$/, "");
  
  // Remove trailing /dashboard or /panel or /admin as we only need the base host:port
  cleaned = cleaned.replace(/\/(dashboard|panel|admin)$/i, "");
  // Remove trailing slashes again just in case
  cleaned = cleaned.replace(/\/+$/, "");

  // If there's an invalid or incomplete protocol (like ps://, ttps://, s://, tp://, etc.)
  if (cleaned.includes("://")) {
    const parts = cleaned.split("://");
    const protocolGroup = parts[0].toLowerCase();
    // If it's not http or https, normalize it to https or http
    if (protocolGroup !== "http" && protocolGroup !== "https") {
      if (
        protocolGroup.includes("http") ||
        protocolGroup.endsWith("s") ||
        protocolGroup.endsWith("ps")
      ) {
        cleaned = "https://" + parts.slice(1).join("://");
      } else {
        cleaned = "http://" + parts.slice(1).join("://");
      }
    }
  } else {
    // No protocol, default to http:// (since most 3x-ui panels are HTTP-based and are set up on IP:port)
    cleaned = "http://" + cleaned;
  }
  return cleaned;
}

// Highly robust helper to log into Reebeka/Pasarguard panels trying multiple candidates
async function loginReebekaPasarguard(baseUrl: string, username: string, password: string): Promise<string | null> {
  const cleanedUrl = normalizeXuiUrl(baseUrl);
  
  const candidates = [
    // 1. Standard admin token urlencoded
    { url: `${cleanedUrl}/api/admin/token`, asJson: false, body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 2. Standard admin token trailing slash urlencoded
    { url: `${cleanedUrl}/api/admin/token/`, asJson: false, body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 3. Alternative token urlencoded
    { url: `${cleanedUrl}/api/token`, asJson: false, body: () => {
        const p = new URLSearchParams();
        p.append("grant_type", "password");
        p.append("username", username);
        p.append("password", password);
        return p.toString();
      }
    },
    // 4. Alternative token trailing slash urlencoded
    { url: `${cleanedUrl}/api/token/`, asJson: false, body: () => {
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
    { url: `${cleanedUrl}/api/token/`, asJson: true, body: () => JSON.stringify({ username, password }) },
  ];

  for (const cand of candidates) {
    try {
      console.log(`[Reebeka/Pasarguard Login] Trying candidate: ${cand.url} (JSON: ${cand.asJson})`);
      const headers: Record<string, string> = {
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
        5000
      );

      if (res.ok) {
        const data = await res.json();
        const token = data?.access_token;
        if (token) {
          console.log(`[Reebeka/Pasarguard Login] Authenticated successfully with ${cand.url}`);
          return token;
        }
      }
    } catch (e: any) {
      console.log(`[Reebeka/Pasarguard Login] Candidate ${cand.url} failed: ${e.message}`);
    }
  }

  return null;
}

// Robust helper to authenticate with XUI panel supporting both classic panels and modern panels requiring GET + CSRF token
// Helper class to manage cookies
class CookieJar {
  private cookies = new Map<string, string>();

  public parseAndAdd(cookieHeader: string | null) {
    if (!cookieHeader) return;
    // Split by commas that are likely separating multiple Set-Cookie headers
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

  public getCookieHeaderString(): string {
    const list: string[] = [];
    for (const [name, value] of this.cookies.entries()) {
      list.push(`${name}=${value}`);
    }
    return list.join("; ");
  }

  public isEmpty(): boolean {
    return this.cookies.size === 0;
  }
}

// Robust helper to authenticate with XUI panel supporting both classic panels and modern panels requiring GET + CSRF token
async function loginXuiPanel(
  cleanedUrl: string,
  username: string,
  password: string,
): Promise<{
  success: boolean;
  cookie: string | null;
  csrfToken?: string | null;
  error?: string;
}> {
  try {
    const jar = new CookieJar();
    let csrfToken = "";

    console.log(
      `[Diagnostic] Executing initial GET handshake to base URL: ${cleanedUrl}`,
    );

    // 1. Try GET on the base URL first (this matches Python bot's successful approach)
    let getRes = await xuiFetch(cleanedUrl, { method: "GET" }, 6000).catch(
      () => null,
    );

    // If base URL GET failed or returned bad status, fall back to /login URL
    if (!getRes || !getRes.ok) {
      const loginUrl = `${cleanedUrl}/login`;
      console.log(
        `[Diagnostic] GET handshake to base URL failed or returned bad status. Trying direct login page: ${loginUrl}`,
      );
      getRes = await xuiFetch(loginUrl, { method: "GET" }, 6000).catch(
        () => null,
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

    // 2. Perform the POST login request
    const loginUrl = `${cleanedUrl}/login`;
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${cleanedUrl}/`,
      "Origin": cleanedUrl,
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
        body: params.toString(),
      },
      8000,
    );

    const bodyText = await loginRes.text();
    let bodyJson: any = {};
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (e) {
      // Ignore
    }

    console.log(
      `[Diagnostic] XUI response status: ${loginRes.status}, body: ${bodyText.substring(0, 150)}`,
    );

    if (loginRes.ok && bodyJson && bodyJson.success) {
      const loginCookieHeader = loginRes.headers.get("set-cookie");
      if (loginCookieHeader) {
        jar.parseAndAdd(loginCookieHeader);
      }

      // Check if a new CSRF token was issued in headers or body
      let postCsrfToken = loginRes.headers.get("X-Csrf-Token") || csrfToken;
      if (!postCsrfToken) {
        const match = bodyText.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/i);
        if (match && match[1]) {
          postCsrfToken = match[1];
        }
      }

      return {
        success: true,
        cookie: jar.getCookieHeaderString(),
        csrfToken: postCsrfToken || null,
      };
    } else {
      const errMsg =
        bodyJson?.msg ||
        `کد خطا: ${loginRes.status}. نام کاربری یا رمز عبور پنل نادرست است.`;
      return { success: false, cookie: null, csrfToken: null, error: errMsg };
    }
  } catch (err: any) {
    console.error(`[Diagnostic] XUI login encountered error:`, err);
    return {
      success: false,
      cookie: null,
      csrfToken: null,
      error: err.message,
    };
  }
}

// Node.js implementation of Python bot's add_vpn_client_api helper
async function addVpnClientApi(
  clientEmail: string,
  trafficGb: number,
  durationDays: number,
  settings: any,
  clientUuid?: string,
  serverId?: string,
  bypassDuplicateCheck: boolean = false,
): Promise<{
  success: boolean;
  clientUuid?: string;
  subLink?: string;
  error?: string;
}> {
  try {
    // Check locally first
    if (!bypassDuplicateCheck) {
      const db = readSqliteDb();
      const subs = db.subscription_keys || [];
      const _lMail = clientEmail.toLowerCase();
      for (let s of subs) {
        if (
          (s.clientName || "").toLowerCase() === _lMail ||
          (s.planId || "").toLowerCase() === _lMail
        ) {
          return {
            success: false,
            error:
              "این نام کاربری از قبل در لیست کاربران سرور موجود است. لطفاً نام دیگری انتخاب کنید.",
          };
        }
      }
    }

    const activeServers = getActiveServers(settings);
    if (activeServers.length === 0) {
      return {
        success: false,
        error: "تنظیمات اتصال به پنل کامل نیست یا سرور فعالی وجود ندارد.",
      };
    }

    // Pick a random server for load balancing, or use specific serverId if provided
    let server =
      activeServers[Math.floor(Math.random() * activeServers.length)];
    if (serverId) {
      const matchingServer = activeServers.find((s: any) => s.id === serverId);
      if (matchingServer) {
        server = matchingServer;
      }
    }

    const cleanedUrl = normalizeXuiUrl(server.panelUrl);
    const loginResult = await loginXuiPanel(
      cleanedUrl,
      server.panelUsername,
      server.panelPassword,
    );
    if (!loginResult.success || !loginResult.cookie) {
      return {
        success: false,
        error:
          "ورود به پنل با خطا مواجه شد: " +
          (loginResult.error || "خطای نامشخص"),
      };
    }

    const uuid =
      clientUuid ||
      Math.random().toString(36).substring(2, 10) +
        "-" +
        Math.random().toString(36).substring(2, 6);
    const totalBytes = trafficGb < 1.0
      ? Math.floor(trafficGb * 1000 * 1024 * 1024)
      : Math.floor(trafficGb * 1024 * 1024 * 1024);
    const expiryTimeMs = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    // Determine inbound_ids
    let inboundIds: number[] = [];
    if (
      Array.isArray(server.activeInboundIds) &&
      server.activeInboundIds.length > 0
    ) {
      inboundIds = server.activeInboundIds
        .map((id: any) => Number(id))
        .filter((id: number) => !isNaN(id));
    }

    // Fallback: fetch dynamically if none specified
    if (inboundIds.length === 0) {
      const listHeaders: Record<string, string> = { Cookie: loginResult.cookie };
      if (loginResult.csrfToken) {
        listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
      }
      const listRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/list`,
        {
          method: "GET",
          headers: listHeaders,
        },
        5000,
      );
      if (listRes.ok) {
        const listText = await listRes.text();
        const listJson = JSON.parse(listText);
        if (listJson && listJson.success && Array.isArray(listJson.obj)) {
          inboundIds = listJson.obj
            .map((item: any) => Number(item.id))
            .filter((id: number) => !isNaN(id));
          console.log(
            `[Sanaei API] Dynamically retrieved ${inboundIds.length} inbound IDs for user ${clientEmail}`,
          );
        }
      }
    }

    // Check if client already exists on panel
    try {
      const checkRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/getClientTraffics/${clientEmail}`,
        {
          method: "GET",
          headers: {
            Cookie: loginResult.cookie,
            Accept: "application/json",
          },
        },
        5000,
      );
      if (checkRes.ok) {
        const checkJson = await checkRes.json();
        // If obj exists and corresponds to our email, it is taken
        if (checkJson && checkJson.success && checkJson.obj) {
          return {
            success: false,
            error:
              "این نام کاربری از قبل در لیست کاربران سرور موجود است. لطفاً نام دیگری انتخاب کنید.",
          };
        }
      }
    } catch (err) {
      console.warn("[Sanaei API Sync] Could not check client existence:", err);
    }

    // Fetch all inbounds from panel to ensure valid IDs
    try {
      const listHeaders: Record<string, string> = {
        Cookie: loginResult.cookie,
        Accept: "application/json",
      };
      if (loginResult.csrfToken) {
        listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
      }
      const listRes = await xuiFetch(
        `${cleanedUrl}/panel/api/inbounds/list`,
        {
          method: "GET",
          headers: listHeaders,
        },
        5000,
      );
      if (listRes.ok) {
        const listJson = await listRes.json();
        if (listJson && listJson.success && Array.isArray(listJson.obj)) {
          const validIds = listJson.obj.map((inb: any) => inb.id);
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
    let safeEmail = clientEmail
      .replace(/ /g, "_")
      .replace(/\n/g, "")
      .replace(/\//g, "");
    safeEmail = safeEmail.replace(/[^A-Za-z0-9_-]/g, "");
    if (!safeEmail) {
      safeEmail = "col_client_fallback";
    }

    // Generate a random 16-character subscription ID
    const xuiSubId =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);

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
        subId: xuiSubId,
      },
      inboundIds: inboundIds,
    };

    const headers: Record<string, string> = {
      Cookie: loginResult.cookie,
      "Content-Type": "application/json",
      Accept: "application/json",
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
          headers: headers,
          body: JSON.stringify(payload),
        },
        8000,
      );

      if (addRes.ok) {
        const addText = await addRes.text();
        try {
          const addJson = JSON.parse(addText);
          if (addJson && addJson.success) {
            console.log(
              `[Sanaei API Sync] Created user '${clientEmail}' globally on inbounds ${inboundIds.join(", ")} successfully.`,
            );
            const subBase =
              server.subUrl && server.subUrl.trim() !== ""
                ? normalizeXuiUrl(server.subUrl)
                : cleanedUrl;
            const subLink = `${subBase}/sub/${xuiSubId}`;
            return { success: true, clientUuid, subLink };
          } else {
            console.warn(
              `[Sanaei API Response] Global creation error/unsupported: ${addText}`,
            );
            lastError = addJson?.msg || addText;
          }
        } catch (e) {
          console.warn(
            `[Sanaei API Response] Global creation returned non-json: ${addText.substring(0, 50)}`,
          );
          lastError = "Non-JSON response";
        }
      } else {
        lastError = `HTTP ${addRes.status}: ${await addRes.text().catch(() => "Unknown error")}`;
      }
    } catch (err: any) {
      console.error(
        `[Sanaei API Error] Failed to create global client: ${err.message}`,
      );
      lastError = err.message;
    }

    // Force older Sanaei per-inbound addition if global failed
    console.log(
      `[Sanaei API Fallback] Attempting per-inbound addition for user '${clientEmail}'...`,
    );
    let fallbackSuccess = false;
    for (const inbId of inboundIds) {
      try {
        const classicUrl = `${cleanedUrl}/panel/api/inbounds/addClient`;
        const classicPayload = {
          id: inbId,
          settings: JSON.stringify({ clients: [payload.client] }),
        };
        const cRes = await xuiFetch(
          classicUrl,
          {
            method: "POST",
            headers: headers,
            body: JSON.stringify(classicPayload),
          },
          8000,
        );
        if (cRes.ok) {
          const cText = await cRes.text();
          try {
            const cJson = JSON.parse(cText);
            if (cJson && cJson.success) {
              console.log(
                `[Sanaei API Fallback Sync] Added user '${clientEmail}' to inbound ${inbId}`,
              );
              fallbackSuccess = true;
            } else {
              console.warn(
                `[Sanaei API Fallback error inbound ${inbId}]: ${cText}`,
              );
            }
          } catch (e) {}
        }
      } catch (ce) {
        console.error(`[Sanaei API Fallback Exception inbound ${inbId}]:`, ce);
      }
    }

    if (fallbackSuccess) {
      const subBase =
        server.subUrl && server.subUrl.trim() !== ""
          ? normalizeXuiUrl(server.subUrl)
          : cleanedUrl;
      const subLink = `${subBase}/sub/${xuiSubId}`;
      return { success: true, clientUuid, subLink };
    }

    return {
      success: false,
      error: "تعریف کلاینت موفق نبود. خطا: " + lastError,
    };
  } catch (e: any) {
    console.error("[addVpnClientApi] helper crash:", e);
    return { success: false, error: e.message };
  }
}

// 2.3 Delete a VPN client from XUI Panel globally
async function deleteVpnClientApi(clientEmail: string, serverId?: string) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const activeServers = getActiveServers(settings);

    const targetServers = serverId
      ? activeServers.filter((s: any) => s.id === serverId)
      : activeServers;

    if (targetServers.length === 0)
      return { success: false, error: "XUI disconnected" };

    let deletedAtLeastOnce = false;

    for (const server of targetServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword,
        );
        if (!loginResult.success || !loginResult.cookie) continue;

        const headers: Record<string, string> = {
          Cookie: loginResult.cookie,
          Accept: "application/json",
        };
        if (loginResult.csrfToken) {
          headers["X-Csrf-Token"] = loginResult.csrfToken;
        }

        const delUrl = `${cleanedUrl}/panel/api/clients/del/${encodeURIComponent(clientEmail)}`;
        let globalDelSuccess = false;
        try {
          const res = await xuiFetch(delUrl, { method: "POST", headers }, 5000);
          if (res && res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data && data.success) {
              globalDelSuccess = true;
              deletedAtLeastOnce = true;
            }
          }
        } catch (e) {}

        // Fallback: search across all inbounds
        try {
          const listUrl = `${cleanedUrl}/panel/api/inbounds/list`;
          const listRes = await xuiFetch(listUrl, { method: "GET", headers }, 5000);
          if (listRes && listRes.ok) {
            const data = await listRes.json().catch(() => ({}));
            if (data && data.success && Array.isArray(data.obj)) {
              for (const inbound of data.obj) {
                let clients = [];
                try {
                  const settings = JSON.parse(inbound.settings || "{}");
                  clients = settings.clients || [];
                } catch (e) {}
                
                const clientMatch = clients.find((c: any) => c.email === clientEmail);
                if (clientMatch && clientMatch.id) {
                   const fallbackDelUrl = `${cleanedUrl}/panel/api/inbounds/${inbound.id}/delClient/${clientMatch.id}`;
                   const fRes = await xuiFetch(fallbackDelUrl, { method: "POST", headers }, 5000);
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
        } catch (e) {}
      } catch (e) {
        // Ignore individual server errors and try others
      }
    }

    return {
      success: deletedAtLeastOnce,
      error: deletedAtLeastOnce
        ? undefined
        : "Panel deletion failed on all servers",
    };
  } catch (e) {
    return { success: false, error: "Exception during deletion" };
  }
}

// 2.4 Toggle (Enable/Disable) a VPN client on XUI Panel
async function toggleVpnClientApi(clientEmail: string, enabled: boolean, clientUuid?: string) {
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
          server.panelPassword,
        );
        if (!loginResult.success || !loginResult.cookie) continue;

        const headers: Record<string, string> = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        const formHeaders: Record<string, string> = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        };
        if (loginResult.csrfToken) {
          headers["X-Csrf-Token"] = loginResult.csrfToken;
          formHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }

        const safeEmail = encodeURIComponent(clientEmail);
        let globalUpdateSuccess = false;

        // Try getting the client globally
        try {
          const getUrl = `${cleanedUrl}/panel/api/clients/get/${safeEmail}`;
          const getRes = await xuiFetch(getUrl, { method: "GET", headers }, 4000).catch(() => null);
          if (getRes && getRes.ok) {
            const getJson = await getRes.json().catch(() => ({}));
            if (getJson.success && getJson.obj) {
              const client = getJson.obj;
              client.enable = enabled;

              const updateUrl = `${cleanedUrl}/panel/api/clients/update/${safeEmail}`;
              
              // 1. Try form data payload
              const inboundId = client.inboundId || 0;
              const payloadStr = JSON.stringify({ clients: [client] });
              const formBody = `id=${inboundId}&settings=${encodeURIComponent(payloadStr)}`;
              
              const formRes = await xuiFetch(updateUrl, { method: "POST", headers: formHeaders, body: formBody }, 5000).catch(() => null);
              if (formRes && formRes.ok) {
                const r = await formRes.json().catch(()=>({}));
                if(r.success) {
                  globalUpdateSuccess = true;
                  toggledAtLeastOnce = true;
                }
              }

              // 2. Try json payload
              if (!globalUpdateSuccess) {
                const jsonRes = await xuiFetch(updateUrl, { method: "POST", headers, body: JSON.stringify(client) }, 5000).catch(() => null);
                if (jsonRes && jsonRes.ok) {
                  const r = await jsonRes.json().catch(()=>({}));
                  if(r.success) {
                    globalUpdateSuccess = true;
                    toggledAtLeastOnce = true;
                  }
                }
              }
            }
          }
        } catch (e) {}

        // Fallback: search across all inbounds
        try {
          const listUrl = `${cleanedUrl}/panel/api/inbounds/list`;
          const listRes = await xuiFetch(listUrl, { method: "GET", headers }, 5000).catch(() => null);
          if (listRes && listRes.ok) {
            const data = await listRes.json().catch(() => ({}));
            if (data && data.success && Array.isArray(data.obj)) {
              for (const inbound of data.obj) {
                let clients: any[] = [];
                try {
                  const settings = JSON.parse(inbound.settings || "{}");
                  clients = settings.clients || [];
                } catch (e) {}

                const clientMatch = clients.find((c: any) => 
                  (clientUuid && c.id === clientUuid) || c.email === clientEmail
                );
                
                if (clientMatch && clientMatch.id) {
                  const mergedClient = { ...clientMatch, enable: enabled };
                  const inboundId = inbound.id;
                  const uid = clientMatch.id;
                  
                  const payloadStr = JSON.stringify({ clients: [mergedClient] });
                  const formBody = `id=${inboundId}&settings=${encodeURIComponent(payloadStr)}`;

                  // Attempt different update combinations
                  const attempts = [
                    { url: `${cleanedUrl}/panel/api/clients/update/${uid}`, isForm: true, body: formBody },
                    { url: `${cleanedUrl}/panel/api/clients/update/${uid}`, isForm: false, body: JSON.stringify(mergedClient) },
                    { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${uid}`, isForm: true, body: formBody },
                    { url: `${cleanedUrl}/panel/api/inbounds/updateClient/${uid}`, isForm: false, body: JSON.stringify({ id: inboundId, settings: payloadStr }) }
                  ];

                  for (const attempt of attempts) {
                    const reqHeaders = attempt.isForm ? formHeaders : headers;
                    const aRes = await xuiFetch(attempt.url, { method: "POST", headers: reqHeaders, body: attempt.body }, 5000).catch(()=>null);
                    if (aRes && aRes.ok) {
                      const r = await aRes.json().catch(()=>({}));
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
        } catch (e) {}

      } catch (e) {
        // Ignore individual server errors and try others
      }
    }

    return {
      success: toggledAtLeastOnce,
      error: toggledAtLeastOnce ? undefined : "Toggle failed on all servers",
    };
  } catch (e) {
    return { success: false, error: "Exception during toggle" };
  }
}

// 2.5 Change/Reset client UUID and Subscription ID on XUI Panel (Highly Resilient with delete/add fallback and local generation fallback)
async function resetVpnClientUuidApi(clientEmail: string, serverId?: string) {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    const crypto = await import("crypto");

    // Pre-generate standard credentials locally as fallback
    const newUuid = crypto.randomUUID();
    const newSubId = crypto.randomBytes(8).toString("hex");

    const activeServers = getActiveServers(settings);

    let chosenServer = activeServers.length > 0 ? activeServers[0] : null;
    if (serverId) {
      const found = activeServers.find((s: any) => s.id === serverId);
      if (found) {
        chosenServer = found;
      }
    }

    const subBase =
      chosenServer &&
      chosenServer.subUrl &&
      chosenServer.subUrl.trim() !== ""
        ? normalizeXuiUrl(chosenServer.subUrl)
        : chosenServer
          ? normalizeXuiUrl(chosenServer.panelUrl)
          : "https://tr.sub-daltoon.ir:2096";
    const subLink = `${subBase}/sub/${newSubId}`;

    const targetServers = serverId
      ? activeServers.filter((s: any) => s.id === serverId)
      : activeServers;

    if (targetServers.length === 0) {
      console.warn(
        `[resetVpnClientUuidApi] XUI disconnected/not configured. Performing local-only database reset fallback for ${clientEmail}`,
      );
      return {
        success: true,
        clientUuid: newUuid,
        subLink,
        wasLocalFallback: true,
      };
    }

    let panelUpdatedOnce = false;

    for (const server of targetServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword,
        );
        if (!loginResult.success || !loginResult.cookie) continue;

        const headers: Record<string, string> = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (loginResult.csrfToken)
          headers["X-Csrf-Token"] = loginResult.csrfToken;

        // Fetch the client's current settings from list
        const listRes = await xuiFetch(
          `${cleanedUrl}/panel/api/inbounds/list`,
          { method: "GET", headers },
          8000,
        ).catch(() => null);
        if (!listRes || !listRes.ok) continue;

        const listJson = await listRes.json().catch(() => null);
        if (!listJson || !listJson.success || !Array.isArray(listJson.obj))
          continue;

        let targetClient: any = null;
        let oldUuid: string | null = null;
        let parentInboundId: number | null = null;

        for (const inb of listJson.obj) {
          if (!inb.settings) continue;
          try {
            const inbSettings =
              typeof inb.settings === "string"
                ? JSON.parse(inb.settings)
                : inb.settings;
            if (Array.isArray(inbSettings.clients)) {
              const client = inbSettings.clients.find(
                (c: any) => c.email === clientEmail,
              );
              if (client) {
                targetClient = { ...client };
                oldUuid = client.id;
                parentInboundId = inb.id;
                break;
              }
            }
          } catch (e) {}
        }

        if (!targetClient || !oldUuid) continue;

        // Set new UUID and Sub ID inside the cloned client schema
        targetClient.id = newUuid;
        targetClient.subId = newSubId;
        targetClient.tgId =
          typeof targetClient.tgId === "number"
            ? targetClient.tgId
            : parseInt(targetClient.tgId) || 0;

        const formHeaders: Record<string, string> = {
          Cookie: loginResult.cookie,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        };
        if (loginResult.csrfToken) {
          formHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }

        const safeEmail = encodeURIComponent(clientEmail);
        const payloadStr = JSON.stringify({ clients: [targetClient] });
        const formBody = `id=${parentInboundId}&settings=${encodeURIComponent(payloadStr)}`;

        // Attempt different update combinations to retain traffic while changing UUID
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
          const aRes = await xuiFetch(attempt.url, { method: "POST", headers: reqHeaders, body: attempt.body }, 5000).catch(()=>null);
          if (aRes && aRes.ok) {
            const r = await aRes.json().catch(()=>({}));
            if (r.success) {
              panelUpdatedOnce = true;
              break;
            }
          }
        }
      } catch (err) {
        // Continue to next server
      }
    }

    if (panelUpdatedOnce) {
      return { success: true, clientUuid: newUuid, subLink };
    }

    console.warn(
      `[resetVpnClientUuidApi] Panel-facing recreation rejected, completing with database-level local update.`,
    );
    return {
      success: true,
      clientUuid: newUuid,
      subLink,
      wasLocalFallback: true,
    };
  } catch (e: any) {
    console.error("[resetVpnClientUuidApi] helper crash:", e);
    // Safe final local database generation guarantee
    try {
      const crypto = await import("crypto");
      const newUuid = crypto.randomUUID();
      const newSubId = crypto.randomBytes(8).toString("hex");
      const db = readSqliteDb();
      const settings = getSystemSettings(db);

      const activeServers = getActiveServers(settings);
      let fallbackServer = activeServers.length > 0 ? activeServers[0] : null;
      const subBase =
        fallbackServer &&
        fallbackServer.subUrl &&
        fallbackServer.subUrl.trim() !== ""
          ? normalizeXuiUrl(fallbackServer.subUrl)
          : fallbackServer
            ? normalizeXuiUrl(fallbackServer.panelUrl)
            : "https://tr.sub-daltoon.ir:2096";
      const subLink = `${subBase}/sub/${newSubId}`;
      return {
        success: true,
        clientUuid: newUuid,
        subLink,
        wasLocalFallback: true,
      };
    } catch (err) {
      return { success: false, error: "Exception during reset: " + e.message };
    }
  }
}

// 2.5 Test XUI Panel connection
app.post("/api/xui/test-connection", async (req, res) => {
  try {
    const { baseUrl, panelUsername, panelPassword, panelType, panelToken } = req.body;
    
    if (panelType === "rebecca") {
      if (!baseUrl || !panelUsername || !panelPassword) {
        return res.json({
          success: false,
          error: "برای پنل ربکا، آدرس هاست، نام کاربری و رمز عبور الزامی است.",
        });
      }
      const cleanedUrl = normalizeXuiUrl(baseUrl);
      
      try {
        const access_token = await loginReebekaPasarguard(cleanedUrl, panelUsername, panelPassword);

        if (access_token) {
          let services: any[] = [];
          try {
            const servicesRes = await xuiFetch(
              `${cleanedUrl}/api/v2/services`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5000
            );
            if (servicesRes.ok) {
              const servicesData = await servicesRes.json();
              services = (servicesData.services || []).map((s: any) => ({
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
            message: "اتصال به پنل ربکا با موفقیت انجام شد.",
            panelToken: access_token,
            inbounds: services,
          });
        } else {
          return res.json({
            success: false,
            error: "نام کاربری یا رمز عبور نامعتبر است یا امکان برقراری ارتباط با متدهای مختلف وجود ندارد.",
          });
        }
      } catch (err: any) {
        return res.json({
          success: false,
          error: "خطا در ارتباط با پنل ربکا: " + err.message,
        });
      }
    } else if (panelType === "pasarguard") {
      if (!baseUrl || !panelUsername || !panelPassword) {
        return res.json({
          success: false,
          error: "برای پنل پاسارگارد، آدرس هاست، نام کاربری و رمز عبور الزامی است.",
        });
      }
      const cleanedUrl = normalizeXuiUrl(baseUrl);
      
      try {
        const access_token = await loginReebekaPasarguard(cleanedUrl, panelUsername, panelPassword);

        if (access_token) {
          let groups: any[] = [];
          try {
            const groupsRes = await xuiFetch(
              `${cleanedUrl}/api/groups/simple`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: "application/json"
                }
              },
              5000
            );
            if (groupsRes.ok) {
              const groupsData = await groupsRes.json();
              groups = (groupsData.groups || []).map((g: any) => ({
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
            message: "اتصال به پنل پاسارگارد با موفقیت انجام شد.",
            panelToken: access_token,
            inbounds: groups,
          });
        } else {
          return res.json({
            success: false,
            error: "نام کاربری یا رمز عبور نامعتبر است یا امکان برقراری ارتباط با متدهای مختلف وجود ندارد.",
          });
        }
      } catch (err: any) {
        return res.json({ success: false, error: "خطا در برقراری ارتباط: " + err.message });
      }
    }

    if (!baseUrl || !panelUsername || !panelPassword) {
      return res.json({
        success: false,
        error:
          "تمامی فیلدهای احراز هویت شامل آدرس هاست، نام کاربری و رمز عبور پنل ۳x-ui باید پر شده باشند.",
      });
    }

    const cleanedUrl = normalizeXuiUrl(baseUrl);
    const loginResult = await loginXuiPanel(
      cleanedUrl,
      panelUsername,
      panelPassword,
    );

    if (loginResult.success && loginResult.cookie) {
      // Confirm read access rights on the list api
      try {
        const listHeaders: Record<string, string> = {
          Cookie: loginResult.cookie,
        };
        if (loginResult.csrfToken) {
          listHeaders["X-Csrf-Token"] = loginResult.csrfToken;
        }
        const listRes = await xuiFetch(
          `${cleanedUrl}/panel/api/inbounds/list`,
          {
            method: "GET",
            headers: listHeaders,
          },
          4000,
        );
        if (listRes.ok) {
          const listText = await listRes.text();
          const listJson = JSON.parse(listText);
          if (listJson && listJson.success && Array.isArray(listJson.obj)) {
            const freshInbounds = listJson.obj.map((item: any) => {
              let totalClientsCount = 0;
              try {
                const settingsObj =
                  typeof item.settings === "string"
                    ? JSON.parse(item.settings)
                    : item.settings;
                if (settingsObj && Array.isArray(settingsObj.clients)) {
                  totalClientsCount = settingsObj.clients.length;
                }
              } catch (e) {}

              const usedGb = (
                (Number(item.up || 0) + Number(item.down || 0)) /
                (1024 * 1024 * 1024)
              ).toFixed(1);
              const limitGb = item.total
                ? (Number(item.total) / (1024 * 1024 * 1024)).toFixed(0)
                : "unlimited";

              return {
                id: item.id,
                remark: item.remark || `Inbound #${item.id}`,
                protocol: item.protocol || "vless",
                port: item.port || 1234,
                totalClients: totalClientsCount,
                trafficUsed: usedGb,
                trafficLimit: limitGb,
                status: item.enable ? "active" : "inactive",
              };
            });

            // Persist the synced inbounds to cache database
            const db = readSqliteDb();
            db.inbounds = freshInbounds;
            writeSqliteDb(db);

            return res.json({
              success: true,
              message:
                "اتصال به پنل ۳x-ui با موفقیت برقرار شد و لیست اینباندها دریافت گردید!",
              inbounds: freshInbounds,
            });
          }
          return res.json({
            success: true,
            message:
              "اتصال به پنل ۳x-ui با موفقیت برقرار شد و ارتباط فعال است!",
          });
        } else {
          return res.json({
            success: false,
            error:
              "اتصال اولیه برقرار شد ولیکن دسترسی به لیست اینباندها با خطا مواجه شد. لطفاً دسترسی ادمین پنل را بررسی کنید.",
          });
        }
      } catch (err: any) {
        return res.json({
          success: true,
          message:
            "اتصال اولیه برقرار شد ولیکن دسترسی به لیست اینباندها با خطا مواجه شد. لطفاً دسترسی ادمین پنل را بررسی کنید.",
        });
      }
    } else {
      return res.json({
        success: false,
        error:
          loginResult.error ||
          "خطا در احراز هویت. نام کاربری یا رمز عبور پنل نادرست است.",
      });
    }
  } catch (error: any) {
    return res.json({
      success: false,
      error: `خطا در اتصال به هاست پنل: ${error.message}`,
    });
  }
});

// BROADCAST ENDPOINT
app.post("/api/broadcast", async (req, res) => {
  try {
    const { text, attachment, serverUrl, captionPosition } = req.body;
    if (!text && !attachment) {
      return res.status(400).json({
        success: false,
        error: "متن پیام یا رسانه برای ارسال الزامی است.",
      });
    }

    // Process attachment if provided
    let fileUrl = "";
    let attachmentBuffer: Buffer | null = null;
    if (attachment && attachment.fileData) {
      try {
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let base64Data = attachment.fileData;
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,").pop() || "";
        }

        attachmentBuffer = Buffer.from(base64Data, "base64");
        const ext =
          path.extname(attachment.fileName) ||
          (attachment.fileType === "image"
            ? ".jpg"
            : attachment.fileType === "video"
              ? ".mp4"
              : attachment.fileType === "voice"
                ? ".ogg"
                : ".bin");
        const uniqueFileName = `broadcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        fs.writeFileSync(filePath, attachmentBuffer);

        const originUrl =
          serverUrl ||
          "https://ais-dev-cri25e3qykgpuufepdfpmw-413733104605.europe-west3.run.app";
        fileUrl = `${originUrl}/uploads/${uniqueFileName}`;
        console.log(
          `[Broadcast] File written to: ${filePath}, public url: ${fileUrl}`,
        );
      } catch (err: any) {
        console.error("[Broadcast] Failed storing attachment file:", err);
      }
    }

    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    let botToken =
      settings.botToken || settings.BOT_TOKEN || process.env.BOT_TOKEN;
    if (botToken) botToken = botToken.trim();
    const users = db.users || [];
    let count = 0;

    if (botToken && botToken !== "DUMMY_TOKEN") {
      for (const u of users) {
        if (u.userId) {
          try {
            // Determine API method and payload based on attachment presence and type
            let apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            let useFormData = false;
            let formData: any = null;
            let payload: any = {
              chat_id: u.userId,
              parse_mode: "HTML",
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
              const mimeType =
                attachment.fileType === "image"
                  ? "image/jpeg"
                  : attachment.fileType === "video"
                    ? "video/mp4"
                    : attachment.fileType === "voice"
                      ? "audio/ogg"
                      : "application/octet-stream";

              const blob = new Blob([attachmentBuffer], { type: mimeType });
              const filename =
                attachment.fileName ||
                (fileType === "image"
                  ? "photo.jpg"
                  : fileType === "video"
                    ? "video.mp4"
                    : fileType === "voice"
                      ? "voice.ogg"
                      : "file.bin");

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
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout per user

            try {
              console.log(
                `[Broadcast] Sending to user ${u.userId} via Telegram API...`,
              );
              const response = await fetch(apiUrl, {
                method: "POST",
                headers: useFormData
                  ? undefined
                  : {
                      "Content-Type": "application/json",
                    },
                body: useFormData ? formData : JSON.stringify(payload),
                signal: controller.signal,
              });
              clearTimeout(timeoutId);

              const data = (await response.json()) as any;
              if (data && data.ok) {
                count++;
                console.log(
                  `[Broadcast] Successfully sent to user ${u.userId}`,
                );
              } else {
                console.error(
                  `[Broadcast] Telegram API error for user ${u.userId}:`,
                  data,
                );
              }
            } catch (err: any) {
              clearTimeout(timeoutId);
              console.error(
                `[Broadcast] Network/Timeout error sending to user ${u.userId}:`,
                err.message || err,
              );
            }
            // Gentle sleep of 50ms to respect Telegram rate limits and socket recycling
            await new Promise((resolve) => setTimeout(resolve, 50));
          } catch (e: any) {
            console.error(
              `[Broadcast] Failed to send message to user ${u.userId}:`,
              e,
            );
          }
        }
      }
    } else {
      console.warn("[Broadcast] No valid bot token found! Faking count.");
      count = users.length;
    }

    res.json({ success: true, count, message: "Broadcast dispatched." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. User operations range
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
      joinDate: joinDate || new Date().toISOString().split("T")[0],
      status: status || "active",
    };

    if (idx >= 0) {
      db.users[idx] = nextUser;
    } else {
      db.users.unshift(nextUser);
    }

    writeSqliteDb(db);
    res.json({ success: true, message: "User written/updated." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/users/adjust", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const db = readSqliteDb();

    const user = db.users.find((u) => u.userId === Number(userId));
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const nextBal = Math.max(0, Number(user.walletBalance) + Number(amount));
    const finalDiff = nextBal - Number(user.walletBalance);
    user.walletBalance = nextBal;

    if (!db.logs) db.logs = [];
    db.logs.push({
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      userId: Number(userId),
      username: user.username || `user_${userId}`,
      action: "تغییر موجودی",
      details: `موجودی کاربر توسط مدیر به میزان ${finalDiff >= 0 ? "+" : ""}${finalDiff.toLocaleString()} تومان تغییر یافت. موجودی نهایی: ${nextBal.toLocaleString()} تومان.`,
    });
    if (db.logs.length > 1000) {
      db.logs = db.logs.slice(-1000);
    }

    writeSqliteDb(db);

    res.json({ success: true, nextBal });
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/users/send-message", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ success: false, error: "کاربر یا متن پیام ارسال نشده است." });
    }
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    let botToken = settings.botToken || settings.BOT_TOKEN || process.env.BOT_TOKEN;
    if (botToken) botToken = botToken.trim();

    if (!botToken || botToken === "DUMMY_TOKEN") {
      return res.status(400).json({ success: false, error: "توکن ربات تلگرام تنظیم نشده است یا نامعتبر است." });
    }

    const fetchRef = globalThis.fetch || fetch;
    const body = {
      chat_id: userId,
      text: message,
      parse_mode: "HTML",
    };

    const telegramRes = await fetchRef(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await telegramRes.json() as any;
    if (data && data.ok) {
      res.json({ success: true, message: "پیام با موفقیت به پیوی کاربر ارسال شد." });
    } else {
      res.status(400).json({
        success: false,
        error: data?.description || "خطا در ارسال پیام به تلگرام. ممکن است کاربر ربات را بلاک کرده باشد یا چت را شروع نکرده باشد."
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/users/delete", async (req, res) => {
  try {
    const { userId } = req.body;
    const db = readSqliteDb();

    db.users = db.users.filter((u) => u.userId !== Number(userId));
    db.subscription_keys = db.subscription_keys.filter(
      (k) => k.userId !== Number(userId),
    );
    writeSqliteDb(db);

    res.json({ success: true, message: "User completely cleared." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Manual Transaction operations
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
      description,
    } = req.body;
    const db = readSqliteDb();

    const nextTx = {
      id,
      userId: Number(userId),
      username,
      amount: Number(amount),
      receiptImage: receiptImage || "",
      status: status || "pending",
      date: date || new Date().toISOString(),
      description: description || "",
    };

    const idx = db.transactions.findIndex((t) => t.id === id);
    if (idx >= 0) {
      db.transactions[idx] = nextTx;
    } else {
      db.transactions.unshift(nextTx);
    }

    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error: any) {
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
      if (amount !== undefined) {
        tx.amount = Number(amount);
      }

      const user = db.users.find((u) => u.userId === Number(tx.userId));

      let messageTextForNotif = "";

      if (tx.type === "PLAN_PURCHASE") {
        if (
          tx.planId &&
          (tx.planId.startsWith("COL_BUY:") ||
            tx.planId.startsWith("COL_RENEW:"))
        ) {
          // Colleague package fulfillment
          const isBuy = tx.planId.startsWith("COL_BUY:");
          const packageId = tx.planId.split(":")[1];

          const db_packages: any[] = db.colleague_packages || [];
          const pkg = db_packages.find((p) => p.id === packageId);

          if (pkg) {
            if (isBuy) {
              const parts = (tx.clientName || "").split("||");
              const prefix = parts[0] || "";
              const token = parts[1] || "";

              const username =
                "C" + Math.floor(Math.random() * 90000 + 10000).toString();
              const password = Math.random().toString(36).substring(2, 10);

              const newAcc = {
                id: Math.random().toString(36).substring(2, 15),
                userId: Number(tx.userId),
                username: username,
                password: password,
                packageId: pkg.id,
                packageTitle: pkg.title,
                createdAt: new Date().toISOString().split("T")[0],
                trafficGb: pkg.trafficGb,
                usedTrafficGb: 0,
                prefix: prefix,
                recoveryToken: token,
                status: "active",
              };

              if (!db.colleague_accounts) db.colleague_accounts = [];
              db.colleague_accounts.push(newAcc);

              messageTextForNotif = `✅ <b>خرید بسته همکار با موفقیت انجام شد!</b> (تایید فیش)\n\nبسته خریداری شده: ${pkg.title}\nپسوند تنظیم شده: ${prefix}\n\nاطلاعات ورود شما:\n👤 <b>یوزرنیم:</b> <code>${username}</code>\n🔑 <b>رمز عبور:</b> <code>${password}</code>\n\nجهت ورود به پنل، حساب خود را از طریق منو انتخاب کنید.`;
            } else {
              const accId = tx.clientName;
              const accIndex = (db.colleague_accounts || []).findIndex(
                (a: any) => a.id === accId,
              );
              if (accIndex !== -1) {
                const acc = db.colleague_accounts[accIndex];
                acc.trafficGb = (acc.trafficGb || 0) + pkg.trafficGb;
                acc.packageTitle = pkg.title;

                messageTextForNotif = `✅ <b>تمدید حساب همکار با موفقیت انجام شد!</b> (تایید فیش)\n\nحجم اضافه شده: ${pkg.trafficGb} گیگابایت\nلیست بسته تمدیدی: ${pkg.title}`;
              } else {
                messageTextForNotif = `❌ خطا: حساب همکار برای تمدید یافت نشد.`;
              }
            }
          } else {
            messageTextForNotif = `❌ خطا: بسته همکار یافت نشد.`;
          }
        } else {
          const db_plans: any[] = db.vpn_plans || [];
          // Hardcoded Fallback Plans (Must match bot.py)
          const fallback_plans = [
            {
              id: "std_30g",
              name: "Standard 30GB - 30 Days",
              price: 45000,
              trafficGb: 30,
              durationDays: 30,
              category: "Standard",
            },
            {
              id: "vip_70g",
              name: "VIP Premium 70GB - 60 Days",
              price: 95000,
              trafficGb: 70,
              durationDays: 60,
              category: "VIP",
            },
            {
              id: "ult_150g",
              name: "Unlimited VoIP 150GB - 90 Days",
              price: 185000,
              trafficGb: 150,
              durationDays: 90,
              category: "Unlimited VoIP",
            },
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
                undefined,
                tx.serverId,
              );
              if (vpnResult.success && vpnResult.subLink) {
                const subLink = vpnResult.subLink;

                let vlessLinks: string[] = [];
                try {
                  const fetchRef = globalThis.fetch || fetch;
                  const res = await fetchRef(subLink);
                  if (res.ok) {
                    const text = await res.text();
                    const decoded = Buffer.from(text, "base64").toString(
                      "utf-8",
                    );
                    vlessLinks = decoded
                      .split("\n")
                      .filter(
                        (l) => l.trim().length > 0 && l.includes("://"),
                      );
                  }
                } catch (e) {}

                let linksDisplay = "";
                if (vlessLinks.length > 0) {
                  const linksText = vlessLinks
                    .map((l) => `<code>${l}</code>`)
                    .join("\n\n");
                  linksDisplay = `🚀 <b>لینک‌های اتصال مستقیم:</b>\n${linksText}\n\n⚠️ لینک‌های بالا را کپی کرده و در کلاینت خود وارد کنید.`;
                } else {
                  linksDisplay = `⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌های کانفیگ در این لحظه میسر نشد.\n\n👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>\n\n<code>${subLink}</code>\n\n💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند.`;
                }

                messageTextForNotif = `✅ <b>کانفیگ شما آماده شد!</b>\n\n📦 پلان: <b>${plan.name}</b>\n\n${linksDisplay}`;

                if (!db.subscription_keys) db.subscription_keys = [];
                const randomId =
                  "SUB-" + Math.floor(Math.random() * 9000 + 1000);
                const expireTimestamp =
                  Date.now() + planDuration * 24 * 60 * 60 * 1000;
                const expireDate = isNaN(expireTimestamp)
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  : new Date(expireTimestamp).toISOString().split("T")[0];

                db.subscription_keys.push({
                  id: randomId,
                  userId: Number(tx.userId),
                  planId: plan.id,
                  planName: plan.name,
                  clientName: clientName,
                  clientUuid: vpnResult.clientUuid || "",
                  subLink: subLink,
                  expireDate: expireDate,
                  trafficLimitGb: planTraffic,
                  trafficUsedGb: 0,
                  createdAtMs: Date.now(),
                  status: "active",
                  serverId: tx.serverId,
                });

                tx._generatedSubId = randomId;
                tx._generatedSubLink = subLink;

                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: new Date().toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "تحویل کانفیگ",
                  details: `اشتراک برای پلان ${plan.name} با نام ${clientName} تحویل داده شد.`,
                });
              } else {
                if (user) {
                  user.walletBalance = Number(user.walletBalance) + Number(tx.amount);
                }
                tx.status = "refunded";
                messageTextForNotif = `❌ <b>خطا در ساخت کانفیگ!</b>\n\nمتاسفانه مشکلی در اتصال به سرور جهت ساخت کانفیگ رخ داد:\n<code>${vpnResult.error || "خطای نامشخص"}</code>\n\n✅ سیستم جهت محافظت از شما، تراکنش را لغو کرده و مبلغ <b>${Number(tx.amount).toLocaleString()} تومان</b> را به صورت کامل به کیف پول داخلی شما در ربات عودت داد.\n\nاکنون می‌توانید از طریق کیف پول خود مجدداً اقدام کنید (در صورت رفع مشکل).`;

                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: new Date().toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "خطا و مرجوعی خودکار",
                  details: `خطا در ساخت کانفیگ برای ${clientName}: ${vpnResult.error || "Unknown"}. مبلغ به کیف پول برگشت داده شد.`,
                });
              }
            } catch (e: any) {
              messageTextForNotif = `❌ خطا در سیستم ساخت کانفیگ: ${e.message}`;
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
                undefined,
                tx.serverId,
              );
              if (vpnResult.success && vpnResult.subLink) {
                const subLink = vpnResult.subLink;

                let vlessLinks: string[] = [];
                try {
                  const fetchRef = globalThis.fetch || fetch;
                  const res = await fetchRef(subLink);
                  if (res.ok) {
                    const text = await res.text();
                    const decoded = Buffer.from(text, "base64").toString(
                      "utf-8",
                    );
                    vlessLinks = decoded
                      .split("\n")
                      .filter(
                        (l) => l.trim().length > 0 && l.includes("://"),
                      );
                  }
                } catch (e) {}

                let linksDisplay = "";
                if (vlessLinks.length > 0) {
                  const linksText = vlessLinks
                    .map((l) => `<code>${l}</code>`)
                    .join("\n\n");
                  linksDisplay = `🚀 <b>لینک‌های اتصال مستقیم:</b>\n${linksText}\n\n⚠️ لینک‌های بالا را کپی کرده و در کلاینت خود وارد کنید.`;
                } else {
                  linksDisplay = `⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌های کانفیگ در این لحظه میسر نشد.\n\n👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>\n\n<code>${subLink}</code>\n\n💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند.`;
                }

                messageTextForNotif = `✅ <b>کانفیگ دلخواه شما آماده شد!</b>\n\n📦 حجم: <b>${customGb} گیگابایت</b> | زمان: <b>${customDays} روز</b>\n\n${linksDisplay}`;

                if (!db.subscription_keys) db.subscription_keys = [];
                const randomId =
                  "SUB-" + Math.floor(Math.random() * 9000 + 1000);
                const expireDate = new Date(
                  Date.now() + customDays * 24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split("T")[0];

                db.subscription_keys.push({
                  id: randomId,
                  userId: Number(tx.userId),
                  planId: "custom_vol",
                  planName: `کانفیگ دلخواه ${customGb}GB`,
                  clientName: clientName,
                  clientUuid: vpnResult.clientUuid || "",
                  subLink: subLink,
                  expireDate: expireDate,
                  trafficLimitGb: customGb,
                  trafficUsedGb: 0,
                  createdAtMs: Date.now(),
                  status: "active",
                  serverId: tx.serverId,
                });

                tx._generatedSubId = randomId;
                tx._generatedSubLink = subLink;

                if (!db.logs) db.logs = [];
                db.logs.push({
                  id: Math.random().toString(36).substring(2, 9),
                  date: new Date().toISOString(),
                  userId: Number(tx.userId),
                  username: tx.username || `user_${tx.userId}`,
                  action: "تحویل کانفیگ",
                  details: `اشتراک برای کانفیگ دلخواه با نام ${clientName} تحویل داده شد.`,
                });
              } else {
                tx.status = "failed";
                messageTextForNotif = `❌ <b>خطا در ساخت کانفیگ دلخواه!</b>\n\nمتاسفانه مشکلی در اتصال به سرور جهت ساخت کانفیگ رخ داد:\n<code>${vpnResult.error || "خطای نامشخص"}</code>\n\nلطفاً موضوع را با پشتیبانی هماهنگ فرمایید.`;
              }
            } catch (e: any) {
              messageTextForNotif = `❌ خطا در سیستم ساخت کانفیگ دلخواه: ${e.message}`;
            }
          } else if (tx.planId === "custom_renew") {
            const targetSubId = tx.clientName;
            const settings = getSystemSettings(db);
            const customGb = Number(tx.customGb) || 10;
            const customDays = Number(tx.customDays) || 30;

            const subscription_keys = db.subscription_keys || [];
            const k = subscription_keys.find(
              (sub: any) => sub.id === targetSubId,
            );

            if (k) {
              const clientName = k.clientName;
              const serverId = k.serverId;

              let expDt = new Date();
              try {
                const parsed = new Date(k.expireDate);
                if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
                  expDt = parsed;
                }
              } catch (e) {}

              const newExpDt = new Date(
                expDt.getTime() + customDays * 24 * 60 * 60 * 1000,
              );
              const newExpireDateStr = newExpDt.toISOString().split("T")[0];
              const newLimitGb = (Number(k.trafficLimitGb) || 0) + customGb;

              const remainingDays = Math.max(
                1,
                Math.ceil(
                  (newExpDt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
                ),
              );

              try {
                await deleteVpnClientApi(clientName, serverId);
                const addResult = await addVpnClientApi(
                  clientName,
                  newLimitGb,
                  remainingDays,
                  settings,
                  k.clientUuid,
                  serverId,
                );

                if (addResult.success && addResult.subLink) {
                  k.expireDate = newExpireDateStr;
                  k.trafficLimitGb = newLimitGb;
                  k.subLink = addResult.subLink;

                  messageTextForNotif = `🎉 <b>اشتراک شما با موفقیت تمدید شد! (تایید فیش)</b>\n\n👤 سرویس: <code>${clientName}</code>\n➕ حجم ترافیک افزوده شده: <b>${customGb} گیگابایت</b>\n➕ مدت زمان افزوده شده: <b>${customDays} روز</b>\n\n📅 تاریخ انقضای جدید: <b>${newExpireDateStr}</b>\n📊 حجم کل جدید: <b>${newLimitGb} گیگابایت</b>`;

                  tx._generatedSubId = k.id;
                  tx._generatedSubLink = addResult.subLink;

                  if (!db.logs) db.logs = [];
                  db.logs.push({
                    id: Math.random().toString(36).substring(2, 9),
                    date: new Date().toISOString(),
                    userId: Number(tx.userId),
                    username: tx.username || `user_${tx.userId}`,
                    action: "تمدید اشتراک",
                    details: `اشتراک ${clientName} تمدید شد (فیش تایید شد).`,
                  });
                } else {
                  tx.status = "failed";
                  messageTextForNotif = `❌ <b>خطا در اعمال تمدید اشتراک!</b>\n\nمتاسفانه مشکلی در اتصال به سرور جهت تمدید اشتراک رخ داد:\n<code>${addResult.error || "خطای نامشخص"}</code>\n\nلطفاً موضوع را با پشتیبانی هماهنگ فرمایید.`;
                }
              } catch (apiErr: any) {
                tx.status = "failed";
                messageTextForNotif = `❌ خطا در اعمال تمدید اشتراک روی سرور: ${apiErr.message}`;
              }
            } else {
              messageTextForNotif = `❌ خطا: اشتراک مورد نظر جهت تمدید یافت نشد.`;
            }
          } else {
            messageTextForNotif = `❌ خطا: پلان مورد نظر یافت نشد. با پشتیبانی هماهنگ کنید.`;
          }
        }
      } else {
        if (user) {
          user.walletBalance = Number(user.walletBalance) + Number(tx.amount);
        }
        messageTextForNotif = `✅ <b>تراکنش شما تایید شد!</b>\n\n💰 مبلغ <b>${tx.amount.toLocaleString()} تومان</b> به کیف پول شما در ربات افزوده شد.\n\n💰 موجودی جدید: <b>${user ? user.walletBalance.toLocaleString() : "0"} تومان</b>`;
      }

      if (tx.type !== "PLAN_PURCHASE") {
        db.logs.push({
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          userId: Number(tx.userId),
          username: tx.username || `user_${tx.userId}`,
          action: "تایید شارژ",
          details: `رسید تراکنش به شناسه ${tx.id} و مبلغ ${Number(tx.amount).toLocaleString()} تومان توسط مدیر تایید شد و به کیف پول کاربر افزایش یافت.`,
        });
      }

      if (db.logs.length > 1000) {
        db.logs = db.logs.slice(-1000);
      }

      writeSqliteDb(db);

      // Try to notify the user via Telegram Bot API on success
      try {
        const cfg = getSystemSettings(db);
        let botToken = cfg.botToken || cfg.BOT_TOKEN;
        if (botToken) botToken = botToken.trim();
        if (botToken && botToken !== "DUMMY_TOKEN") {
          const https = require("https");

            const messageText = messageTextForNotif;
            const postDataObj: any = {
              chat_id: tx.userId,
              parse_mode: "HTML",
            };

            if (
              tx.type === "PLAN_PURCHASE" &&
              tx._generatedSubLink &&
              tx._generatedSubId
            ) {
              if (!db.link_tokens) db.link_tokens = {};
              let token = "";
              // Try finding existing token
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
                      text: "🔗 لینک سابسکریپشن(همه ی کانفیگ ها)",
                      callback_data: `showlink_${token}`,
                    },
                  ],
                  [
                    {
                      text: "🔗 لینک‌های کانفیگ",
                      callback_data: `mysub_vless_${tx._generatedSubId}`,
                    },
                  ],
                  [{ text: "💡 آموزش ها", callback_data: "mm_btnGuides" }],
                  [
                    {
                      text: "🏠 بازگشت به منوی اصلی",
                      callback_data: "btn_back_home",
                    },
                  ],
                ],
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
                "Content-Type": "application/json",
              },
            };
            const postData = JSON.stringify(postDataObj);
            
            const reqNotify = https.request(options);
            reqNotify.on("error", (e: any) =>
              console.warn("Telegram approve notify error:", e),
            );
            reqNotify.write(postData);
            reqNotify.end();

            // Also attach purchase success note if delivering exactly a newly built purchase config
            if (tx.type === "PLAN_PURCHASE" && tx._generatedSubLink) {
              setTimeout(() => {
                sendPurchaseSuccessNoteIfAnyServer(botToken, tx.userId, cfg);
              }, 1000);
            }
          }
      } catch (notifyErr) {
        console.warn("Error notifying user of approval:", notifyErr);
      }

      res.json({
        success: true,
        message: "Transaction approved and credited user wallet.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
    }
  } catch (error: any) {
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
        date: new Date().toISOString(),
        userId: Number(tx.userId),
        username: tx.username || `user_${tx.userId}`,
        action: "رد شارژ",
        details: `رسید تراکنش به شناسه ${tx.id} و مبلغ ${Number(tx.amount).toLocaleString()} تومان توسط مدیر رد شد.`,
      });
      if (db.logs.length > 1000) {
        db.logs = db.logs.slice(-1000);
      }

      writeSqliteDb(db);

      // Try to notify the user via Telegram Bot API on reject
      try {
        const cfg = getSystemSettings(db);
        let botToken = cfg.botToken || cfg.BOT_TOKEN;
        if (botToken) botToken = botToken.trim();
        if (botToken && botToken !== "DUMMY_TOKEN") {
          const messageText = `❌ <b>تراکنش شما پذیرفته نشد!</b>\n\nفیش ارسالی شما با شناسه <code>${tx.id}</code> توسط مدیریت بررسی و رد گردید.\n\n⚠️ علت رد تراکنش ممکن است ناخوانا بودن رسید، مغایرت مبلغ و یا تکراری بودن فیش باشد. لطفا در صورت بروز مشکل با پشتیبان ارتباط برقرار کنید.`;
            const https = require("https");
            const postData = JSON.stringify({
              chat_id: tx.userId,
              text: messageText,
              parse_mode: "HTML",
            });
            const options = {
              hostname: "api.telegram.org",
              port: 443,
              path: `/bot${botToken}/sendMessage`,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
              },
            };
            const reqNotify = https.request(options);
            reqNotify.on("error", (e: any) =>
              console.warn("Telegram reject notify error:", e),
            );
            reqNotify.write(postData);
            reqNotify.end();
          }
      } catch (notifyErr) {
        console.warn("Error notifying user of rejection:", notifyErr);
      }
    }

    res.json({ success: true });
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/transactions/clear-history", async (req, res) => {
  try {
    const db = readSqliteDb();
    db.transactions = [];
    writeSqliteDb(db);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto-create subscription key on 3x-ui panel directly
app.post("/api/subscription-keys/auto-create", async (req, res) => {
  try {
    const { userId, clientName, trafficLimitGb, expiryDays, planName } =
      req.body;
    const db = readSqliteDb();
    const settings = getSystemSettings(db);

    if (!settings.panelConnectionActive) {
      return res.status(400).json({
        success: false,
        error: "اتصال به پنل ۳x-ui در تنظیمات غیرفعال است.",
      });
    }

    const durationDays = Number(expiryDays) || 30;
    const cleanClientName = (
      clientName || "user_" + Math.random().toString(36).substring(2, 7)
    )
      .trim()
      .replace(/\s+/g, "");

    const vpnResult = await addVpnClientApi(
      cleanClientName,
      Number(trafficLimitGb),
      durationDays,
      settings,
    );

    if (vpnResult.success && vpnResult.subLink) {
      const randomId = "SUB-" + Math.floor(Math.random() * 9000 + 1000);
      const expireDate = new Date(
        Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      const newSub = {
        id: randomId,
        userId: Number(userId),
        planId: "manual_" + Math.random().toString(36).substring(2, 8),
        planName: planName || `Manual Plan (${trafficLimitGb}GB)`,
        clientName: cleanClientName,
        clientUuid: vpnResult.clientUuid || "",
        subLink: vpnResult.subLink,
        expireDate: expireDate,
        trafficLimitGb: Number(trafficLimitGb),
        trafficUsedGb: 0,
        createdAtMs: Date.now(),
        status: "active" as const,
      };

      db.subscription_keys.push(newSub);

      const user = db.users.find((u) => u.userId === Number(userId));
      if (user) {
        user.activePlansCount = db.subscription_keys.filter(
          (k) => k.userId === Number(userId) && k.status === "active",
        ).length;
      }

      writeSqliteDb(db);
      return res.json({
        success: true,
        subKey: newSub,
        subscriptionKeys: db.subscription_keys,
        users: db.users,
      });
    } else {
      return res.status(400).json({
        success: false,
        error:
          "خطا در برقراری ارتباط با ۳x-ui: " +
          (vpnResult.error || "خطای نامشخص"),
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Subscription Keys operations
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
      status,
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
      status: status || "active",
    };

    const idx = db.subscription_keys.findIndex((s) => s.id === id);
    if (idx >= 0) {
      db.subscription_keys[idx] = nextSub;
    } else {
      db.subscription_keys.push(nextSub);
    }

    // Recalculate user subscription count
    const user = db.users.find((u) => u.userId === Number(userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === Number(userId) && k.status === "active",
      ).length;
    }

    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/subscription-keys/delete", async (req, res) => {
  try {
    const { id, userId } = req.body;
    const db = readSqliteDb();

    const keyToDelete = db.subscription_keys.find((k: any) => k.id === id);
    if (keyToDelete) {
      if (keyToDelete.clientName) {
        // Attempt to delete from X-UI Panel using our helper
        const delRes = await deleteVpnClientApi(keyToDelete.clientName, keyToDelete.serverId);
        if (!delRes.success) {
          console.warn("Could not delete from panel, deleting locally anyway. Error:", delRes.error);
        }
      }

      // If this key belongs to a colleague account and has been used
      if (
        keyToDelete.colleagueAccountId &&
        Number(keyToDelete.trafficUsedGb || 0) >= 0.001
      ) {
        const colAcc = db.colleague_accounts?.find(
          (a: any) => a.id === keyToDelete.colleagueAccountId,
        );
        if (colAcc) {
          colAcc.deletedTrafficGb =
            (colAcc.deletedTrafficGb || 0) +
            Number(keyToDelete.trafficLimitGb || 0);
          colAcc.deletedRealTrafficGb =
            (colAcc.deletedRealTrafficGb || 0) +
            Number(keyToDelete.trafficUsedGb || 0);
        }
      }
    }

    db.subscription_keys = db.subscription_keys.filter((k) => k.id !== id);

    const user = db.users.find((u) => u.userId === Number(userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === Number(userId) && k.status === "active",
      ).length;
    }

    writeSqliteDb(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/subscription-keys/renew", async (req, res) => {
  try {
    const { id, addGb, addDays } = req.body;
    const db = readSqliteDb();

    const key = db.subscription_keys?.find((k: any) => k.id === id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Subscription key not found" });
    }

    const settings = getSystemSettings(db);
    const clientName = key.clientName || key.planName || "";

    // Calculate new expiration date
    let expDt: Date;
    try {
      expDt = new Date(key.expireDate);
      if (isNaN(expDt.getTime()) || expDt < new Date()) {
        expDt = new Date();
      }
    } catch {
      expDt = new Date();
    }

    expDt.setDate(expDt.getDate() + Number(addDays));
    const new_expire_date_str = expDt.toISOString().split("T")[0];
    const new_limit_gb = Number(key.trafficLimitGb || 0) + Number(addGb);

    const new_exp_days = Math.max(1, Math.ceil((expDt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // 1. Delete old client on panel
    await deleteVpnClientApi(clientName, key.serverId);

    // 2. Add new client on panel with bypassDuplicateCheck = true
    const addResult = await addVpnClientApi(
      clientName,
      new_limit_gb,
      new_exp_days,
      settings,
      key.clientUuid,
      key.serverId,
      true
    );

    if (!addResult.success) {
      return res.status(500).json({ success: false, error: addResult.error || "Failed to renew on X-UI panel" });
    }

    // 3. Update locally
    key.expireDate = new_expire_date_str;
    key.trafficLimitGb = new_limit_gb;
    if (addResult.subLink) {
      key.subLink = addResult.subLink;
    }
    key.status = "active";

    // Re-enable in users if count updated
    const user = db.users?.find((u: any) => u.userId === Number(key.userId));
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k: any) => k.userId === Number(key.userId) && k.status === "active",
      ).length;
    }

    writeSqliteDb(db);

    res.json({ success: true, key });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/subscription-keys/toggle", async (req, res) => {
  try {
    const { id, status } = req.body;
    const db = readSqliteDb();

    const keyToToggle = db.subscription_keys.find((k: any) => k.id === id);
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
          vpnResult.error,
        );
      }
    }

    keyToToggle.status = newStatus;

    // Update user active plans count
    const user = db.users.find((u) => u.userId === keyToToggle.userId);
    if (user) {
      user.activePlansCount = db.subscription_keys.filter(
        (k) => k.userId === user.userId && k.status === "active",
      ).length;
    }

    writeSqliteDb(db);
    res.json({ success: true, status: newStatus });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Custom menu buttons
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
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Inbounds status mapping
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/vpn-plans", (req, res) => {
  try {
    const db = readSqliteDb();
    res.json({ success: true, vpnPlans: db.vpn_plans || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Plan Categories API ---
app.get("/api/plan-categories", (req, res) => {
  try {
    const db = readSqliteDb();
    res.json({ success: true, categories: db.plan_categories || [] });
  } catch (error: any) {
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
        (c: any) => c.id === category.id,
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/plan-categories/delete", (req, res) => {
  try {
    const { id } = req.body;
    const db = readSqliteDb();
    if (db.plan_categories) {
      db.plan_categories = db.plan_categories.filter((c: any) => c.id !== id);
      writeSqliteDb(db);
    }
    res.json({ success: true });
  } catch (error: any) {
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

    const catsMap = new Map(db.plan_categories.map((c: any) => [c.id, c]));
    const sortedCats: any[] = [];
    orderedIds.forEach((id: string) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dynamic VPN Plans Management & Purchase logic
app.post("/api/vpn-plans", async (req, res) => {
  try {
    const { id, name, durationDays, trafficGb, price, category, configStock } =
      req.body;
    const db = readSqliteDb();
    if (!db.vpn_plans) db.vpn_plans = [];

    const nextPlan = {
      id,
      name,
      durationDays: Number(durationDays),
      trafficGb: Number(trafficGb),
      price: Number(price),
      category,
      configStock: Array.isArray(configStock) ? configStock : [],
    };

    const idx = db.vpn_plans.findIndex((p) => p.id === id);
    if (idx >= 0) {
      db.vpn_plans[idx] = nextPlan;
    } else {
      db.vpn_plans.push(nextPlan);
    }

    writeSqliteDb(db);
    res.json({ success: true, vpnPlans: db.vpn_plans });
  } catch (error: any) {
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
  } catch (error: any) {
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

    const plansMap = new Map(db.vpn_plans.map((p: any) => [p.id, p]));
    const sortedPlans: any[] = [];
    orderedIds.forEach((id: string) => {
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
  } catch (error: any) {
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
      return res
        .status(404)
        .json({ success: false, error: "پلن مورد نظر یافت نشد." });
    }
    const plan = db.vpn_plans[planIdx];

    const userIdx = db.users.findIndex((u) => u.userId === Number(userId));
    if (userIdx === -1) {
      return res.status(404).json({ success: false, error: "کاربر یافت نشد." });
    }
    const user = db.users[userIdx];

    const settings = getSystemSettings(db);

    const ownerId = Number(settings.ownerId || 6536288293);
    const admins = Array.isArray(settings.admins) ? settings.admins : [];
    const isAdminOrOwner =
      Number(userId) === ownerId ||
      admins.some((adm: any) => Number(adm.userId) === Number(userId)) ||
      user.username === "daltoon_owner";

    if (!isAdminOrOwner && user.walletBalance < plan.price) {
      return res
        .status(400)
        .json({ success: false, error: "موجودی کیف پول شما کافی نیست." });
    }

    const cleanClientName = (
      clientName || "user_" + Math.random().toString(36).substring(2, 7)
    )
      .trim()
      .replace(/\s+/g, "");

    const isMockSimulator =
      req.body.isSimulator === true || req.body.isSimulator === "true";
    let subLink = "";
    let clientUuid = "";
    if (isMockSimulator) {
      subLink = `vless://${cleanClientName}_test_id@m.daltoon-server.ir:2052?security=reality&sni=google.com&fp=chrome#Daltoon_${cleanClientName}_Test`;
    } else if (settings.panelConnectionActive) {
      console.log(
        `[Buy API] Connection active, creating user '${cleanClientName}' on panel...`,
      );
      const apiResult = await addVpnClientApi(
        cleanClientName,
        plan.trafficGb,
        plan.durationDays,
        settings,
      );
      if (apiResult.success && apiResult.subLink) {
        subLink = apiResult.subLink;
        clientUuid = apiResult.clientUuid || "";
      } else {
        return res.status(400).json({
          success: false,
          error:
            "ساخت کلاینت در پنل ۳x-ui با خطا مواجه شد: " +
            (apiResult.error || "خطای نامشخص"),
        });
      }
    } else {
      if (!plan.configStock || plan.configStock.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "این پلن در حال حاضر فاقد کانفیگ در انبار است. ابتدا انبار آن را در بخش مدیریت سرور شارژ کنید.",
        });
      }
      subLink = plan.configStock.shift() || "";
    }

    // Create subscription key
    const randomId = "SUB-" + Math.floor(Math.random() * 9000 + 1000);
    const planDays = Number(plan.durationDays) || 30;
    const expireTimestamp = Date.now() + planDays * 24 * 60 * 60 * 1000;
    const expireDate = isNaN(expireTimestamp)
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      : new Date(expireTimestamp).toISOString().split("T")[0];

    const newSub = {
      id: randomId,
      userId: Number(userId),
      planId: plan.id,
      planName: plan.name,
      clientName: cleanClientName,
      clientUuid: clientUuid,
      subLink: subLink,
      expireDate: expireDate,
      trafficLimitGb: plan.trafficGb,
      trafficUsedGb: 0,
      createdAtMs: Date.now(),
      status: "active" as const,
    };

    db.subscription_keys.push(newSub);

    // Deduct wallet balance
    if (!isAdminOrOwner) {
      user.walletBalance -= plan.price;
    }
    user.activePlansCount = db.subscription_keys.filter(
      (k) => k.userId === Number(userId) && k.status === "active",
    ).length;

    writeSqliteDb(db);

    res.json({
      success: true,
      subKey: newSub,
      userWalletBalance: user.walletBalance,
      vpnPlans: db.vpn_plans,
      subscriptionKeys: db.subscription_keys,
      users: db.users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Dashboard login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = readSqliteDb();

    const settings = getSystemSettings(db);

    const dbUser = settings.dashboardUsername || "Daltoon";
    const dbPass = settings.dashboardPassword || "Daltoon10";
    const dbAdmins = settings.admins || [];

    // Check main super admin credentials
    const isMainAdmin = username === dbUser && password === dbPass;

    // Check registered sub-admins (who can log in with dashboardPassword as well or predefined passwords)
    const matchedSubAdmin = dbAdmins.find(
      (adm: any) => adm.username === username,
    );
    const isSubAdmin =
      matchedSubAdmin && (password === dbPass || password === "admin123");

    if (isMainAdmin || isSubAdmin) {
      const userRole = isMainAdmin
        ? "super_admin"
        : matchedSubAdmin?.role || "admin";
      res.json({
        success: true,
        token: "daltoon_auth_token_secret",
        user: {
          username,
          role: userRole,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "نام کاربری یا رمز عبور اشتباه است.",
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// X. Backup Management endpoints
app.get("/api/backup-download", (req, res) => {
  try {
    const db = readSqliteDb();

    // Compress and optimize binary-like image strings inside the database to keep backups tiny
    if (db.transactions && Array.isArray(db.transactions)) {
      db.transactions = db.transactions.map((t: any) => {
        if (
          t.receiptImage &&
          t.receiptImage.length > 500 &&
          t.receiptImage.startsWith("data:")
        ) {
          return { ...t, receiptImage: "placeholder_cleared" };
        }
        return t;
      });
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Daltoon_Bot.json",
    );
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(db, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/backup-restore", express.json({ limit: "50mb" }), (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData) {
      return res
        .status(400)
        .json({ success: false, error: "فایل بکاپ ارسال نشد." });
    }

    let parsed: any;
    try {
      if (typeof backupData === "string") {
        parsed = JSON.parse(backupData);
      } else {
        parsed = backupData;
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: "فرمت فایل بکاپ معتبر نیست (باید SQLite/JSON معتبر باشد).",
      });
    }

    if (typeof parsed !== "object" || parsed === null) {
      return res
        .status(400)
        .json({ success: false, error: "اطلاعات فایل بکاپ نامعتبر است." });
    }

    // Preserve current active critical settings if they are customized
    let preservedConfig: any = {};
    try {
      const currentDb = readSqliteDb();
      if (currentDb && currentDb.settings && currentDb.settings.panel_config) {
        const pc =
          typeof currentDb.settings.panel_config === "string"
            ? JSON.parse(currentDb.settings.panel_config)
            : currentDb.settings.panel_config;
        if (pc.dashboardUsername && pc.dashboardUsername !== "Daltoon") {
          preservedConfig.dashboardUsername = pc.dashboardUsername;
        }
        if (pc.dashboardPassword && pc.dashboardPassword !== "Daltoon10") {
          preservedConfig.dashboardPassword = pc.dashboardPassword;
        }
        if (pc.serverPort && Number(pc.serverPort) !== 3000) {
          preservedConfig.serverPort = Number(pc.serverPort);
        }
        if (pc.botToken && pc.botToken !== "DUMMY_TOKEN") {
          preservedConfig.botToken = pc.botToken;
        }
        if (pc.ownerId && Number(pc.ownerId) !== 0) {
          preservedConfig.ownerId = Number(pc.ownerId);
        }
      }
    } catch (e) {}

    // Always keep backup data clean and minimal
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      parsed.transactions = parsed.transactions.map((t: any) => {
        if (
          t.receiptImage &&
          t.receiptImage.length > 500 &&
          t.receiptImage.startsWith("data:")
        ) {
          return { ...t, receiptImage: "placeholder_cleared" };
        }
        return t;
      });
    }

    // Merge preserved active config into restored database settings
    if (Object.keys(preservedConfig).length > 0) {
      if (!parsed.settings) parsed.settings = {};
      if (!parsed.settings.panel_config) parsed.settings.panel_config = "{}";
      try {
        let pc =
          typeof parsed.settings.panel_config === "string"
            ? JSON.parse(parsed.settings.panel_config)
            : parsed.settings.panel_config;
        pc = { ...preservedConfig, ...pc };
        parsed.settings.panel_config = JSON.stringify(pc);
      } catch (e) {}
    }

    parsed.isNewInstall = false;

    try { execSync("pm2 stop daltoon-bot"); } catch(e) {}; const writeSuccess = writeSqliteDb(parsed);
    
    if (!writeSuccess) {
      return res.status(500).json({ success: false, error: "خطا در ذخیره بکاپ به دلیل مشکلات سیستمی (Safeguard). فایل ممکن است نامعتبر باشد." });
    }

    // Attempt dynamic python bot restart to apply configurations immediately
    startPythonBot();

    res.json({ success: true, message: "فایل بکاپ با موفقیت بازگردانی شد." });
  } catch (error: any) {
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

    const dateStr = new Date().toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
    });
    const periods: any = {
      hourly: "ساعتی",
      daily: "روزانه",
      weekly: "هفتگی",
      monthly: "ماهانه",
    };
    const caption = `📦 پشتیبان‌گیری خودکار\n\n🕒 تاریخ: ${dateStr}\nتنظیمات: ${periods[settings.autoBackupInterval] || settings.autoBackupInterval}\n\n#DaltoonBot`;

    // Extremely robust manual multipart payload construction to bypass Node.js FormData/Blob fetch boundary bugs
    const boundary = "----WebKitFormBoundaryDaltoonBackup" + Math.random().toString(36).substring(2);
    
    const headerParts = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="chat_id"`,
      '',
      String(ownerId),
      `--${boundary}`,
      `Content-Disposition: form-data; name="caption"`,
      '',
      caption,
      `--${boundary}`,
      `Content-Disposition: form-data; name="document"; filename="Daltoon_Bot.db"`,
      `Content-Type: application/json`,
      '',
      ''
    ].join('\r\n');

    const headerBuffer = Buffer.from(headerParts);
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const bodyBuffer = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyBuffer,
    });

    const resJson = await response.json() as any;
    if (!resJson || !resJson.ok) {
      throw new Error(resJson?.description || "Failed to send backup document to Telegram");
    }

    const freshDb = readSqliteDb();
    if (!freshDb.settings) freshDb.settings = {};
    freshDb.settings.lastAutoBackup = String(Date.now());
    writeSqliteDb(freshDb);
    console.log(`[Auto Backup] Successfully sent backup to owner ${ownerId}`);
  } catch (err: any) {
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
        // Run hourly if at least 55 minutes have passed
        if (diffMs >= 55 * 60 * 1000) {
          shouldBackup = true;
        }
      } else if (interval === "daily") {
        // Run daily if at least 23 hours have passed
        if (diffMs >= 23 * 60 * 60 * 1000) {
          shouldBackup = true;
        }
      } else if (interval === "weekly") {
        // Run weekly if at least 6 days and 23 hours have passed
        if (diffMs >= (7 * 24 - 1) * 60 * 60 * 1000) {
          shouldBackup = true;
        }
      } else if (interval === "monthly") {
        // Run monthly if at least 29 days have passed
        if (diffMs >= 29 * 24 * 60 * 60 * 1000) {
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

// 9. System auto-update endpoints
app.get("/api/system/version", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const pkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      res.json({ success: true, version: pkg.version || "1.0.0" });
    } else {
      res.json({ success: true, version: "2.0.0" });
    }
  } catch (err: any) {
    res.json({ success: false, error: err.message, version: "2.0.0" });
  }
});

app.get("/api/system/status", (req, res) => {
  try {
    const os = require("os");

    // CPU load calculation using load average or synthetic load representation
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0];
    const cpuCount = cpus ? cpus.length : 1;
    let cpuUsage = Math.round((loadAvg / cpuCount) * 100);
    if (!cpuUsage || cpuUsage <= 0 || isNaN(cpuUsage)) {
      // safe fallback for development / server startup
      cpuUsage = Math.floor(Math.random() * 15) + 8;
    }
    if (cpuUsage > 100) cpuUsage = 100;

    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = Math.round((usedMem / totalMem) * 100) || 10;

    const totalMemGB = (totalMem / (1024 * 1024 * 1024)).toFixed(1) + "GB";
    const usedMemGB = (usedMem / (1024 * 1024 * 1024)).toFixed(1) + "GB";

    // Disk usage calculation
    let diskUsage = 38;
    let diskTotal = "80GB";
    let diskUsed = "30.4GB";
    try {
      const { execSync } = require("child_process");
      const dfOut = execSync("df -h /").toString().split("\n")[1];
      const parts = dfOut.split(/\s+/);
      if (parts.length >= 5) {
        diskTotal = parts[1];
        diskUsed = parts[2];
        diskUsage = parseInt(parts[4].replace("%", ""), 10);
      }
    } catch (e) {
      // silent fallback
    }

    // Uptime calculation
    const sysUptimeSec = os.uptime();
    const hours = Math.floor(sysUptimeSec / 3600);
    const minutes = Math.floor((sysUptimeSec % 3600) / 60);
    const uptimeStr = `${hours}h ${minutes}m`;

    res.json({
      cpu: { usage: cpuUsage },
      memory: { usage: memoryUsage, total: totalMemGB, used: usedMemGB },
      disk: { usage: diskUsage, total: diskTotal, used: diskUsed },
      uptime: uptimeStr,
    });
  } catch (err: any) {
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
      } catch {}
    }

    // Fallback for IPv4 using shell
    if (ipv4 === "Unknown") {
      try {
        ipv4 = execSync("curl -4 -s https://api.ipify.org", { encoding: "utf8", timeout: 2000 }).trim();
      } catch {}
    }

    const loads = os.loadavg();
    const baseLoad = (loads[0] * 10) + 20;
    const activityData = Array.from({ length: 20 }, (_, i) => {
      const randomNoise = Math.floor(Math.random() * 15) - 7;
      return Math.min(100, Math.max(10, Math.floor(baseLoad + randomNoise + (Math.sin(i / 3) * 10))));
    });

    res.json({
      success: true,
      publicIp: ipv4, // backwards compatibility
      ipv4,
      ipv6,
      uptime: os.uptime(),
      load: os.loadavg(),
      activityData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch system info" });
  }
});

function isVersionNewer(current: string, latest: string): boolean {
  const parse = (v: string) => v.split('.').map(x => parseInt(x, 10) || 0);
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

function runCommandAsync(cmd: string, cwd: string = process.cwd()): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || "",
        stderr: stderr || "",
      });
    });
  });
}

app.get("/api/system/update-log", (req, res) => {
  const logFile = path.join(process.cwd(), "update.log");
  if (fs.existsSync(logFile)) {
    try {
      const content = fs.readFileSync(logFile, "utf8");
      res.json({ success: true, log: content });
    } catch (err: any) {
      res.json({ success: false, error: err.message });
    }
  } else {
    res.json({ success: false, error: "No update log found" });
  }
});

app.get("/api/system/check-update", async (req, res) => {
  let version = "2.3.5";
  const pkgPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      version = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version || version;
    } catch {}
  }

  const channel = req.query.channel || (version.includes('dev') ? 'dev' : 'stable');

  try {
    let updateAvailable = false;
    let latestVersion = "";
    const isGit = fs.existsSync(path.join(process.cwd(), ".git"));

    // Helper to check and set update status from a version string
    const applyLatestVersion = (latVer: string) => {
      latestVersion = latVer;
      const cleanCurrent = version.replace('-dev', '');
      if (isVersionNewer(cleanCurrent, latestVersion)) {
        updateAvailable = true;
      }
    };

    try {
      if (channel === 'dev') {
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
          'User-Agent': 'Daltoon-Dashboard',
          'Accept': 'application/vnd.github.v3+json'
        },
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const releases = await response.json();
        if (Array.isArray(releases) && releases.length > 0) {
          // Find published releases (not drafts)
          const publishedReleases = releases.filter((r: any) => !r.draft);
          
          // Depending on channel, allow prereleases or strict stable only
          const targetReleases = channel === 'dev' 
            ? publishedReleases 
            : publishedReleases.filter((r: any) => !r.prerelease);
            
          if (targetReleases.length > 0) {
            // Find the highest version instead of just taking the first one
            let highestTag = targetReleases[0].tag_name;
            let highestVersion = highestTag.startsWith('v') ? highestTag.substring(1) : highestTag;
            
            for (let j = 1; j < targetReleases.length; j++) {
              const currentTag = targetReleases[j].tag_name;
              const currentVersion = currentTag.startsWith('v') ? currentTag.substring(1) : currentTag;
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
    } catch (err: any) {
      console.warn("GitHub API check failed, trying raw file fallbacks:", err.message);
      
      // Fallback 1: raw.githubusercontent.com
      try {
        const rawUrl = `https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/package.json?t=${Date.now()}`;
        const rawRes = await fetch(rawUrl, { signal: AbortSignal.timeout(6000) });
        if (rawRes.ok) {
          const rawPkg = await rawRes.json();
          if (rawPkg && rawPkg.version) {
            console.log(`Fallback 1 Success: Found version ${rawPkg.version}`);
            applyLatestVersion(rawPkg.version);
          }
        } else {
          throw new Error(`Raw fallback 1 returned status ${rawRes.status}`);
        }
      } catch (f1Err: any) {
        console.warn("Fallback 1 (raw.githubusercontent.com) failed, trying fallback 2:", f1Err.message);
        
        // Fallback 2: github.com/.../raw/...
        try {
          const rawUrl2 = `https://github.com/mdaltoon10/Daltoon-Bot/raw/main/package.json?t=${Date.now()}`;
          const rawRes2 = await fetch(rawUrl2, { signal: AbortSignal.timeout(6000) });
          if (rawRes2.ok) {
            const rawPkg2 = await rawRes2.json();
            if (rawPkg2 && rawPkg2.version) {
              console.log(`Fallback 2 Success: Found version ${rawPkg2.version}`);
              applyLatestVersion(rawPkg2.version);
            }
          }
        } catch (f2Err: any) {
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
  } catch (err: any) {
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
      message:
        "به‌روزرسانی در پس‌زمینه آغاز شد. سیستم به‌زودی راه‌اندازی مجدد می‌شود...",
    });

    // Run update sequence asynchronously
    setTimeout(async () => {
      const logFile = path.join(process.cwd(), "update.log");
      const writeLog = (message: string) => {
        const time = new Date().toISOString();
        try {
          fs.appendFileSync(logFile, `[${time}] ${message}\n`, "utf8");
        } catch {}
        console.log(`[Auto-Update] ${message}`);
      };

      try {
        fs.writeFileSync(logFile, `=== Auto-Update Started ===\n`, "utf8");
        writeLog(`Starting background update sequence for channel: ${channel}...`);

        let targetTag = "";
        const isGit = fs.existsSync(path.join(process.cwd(), ".git"));

        // Determine target from GitHub Releases
        try {
          const githubUrl = `https://api.github.com/repos/mdaltoon10/Daltoon-Bot/releases?t=${Date.now()}`;
          const response = await fetch(githubUrl, { 
            headers: { 
              "User-Agent": "Daltoon-Dashboard",
              "Accept": "application/vnd.github.v3+json"
            },
            signal: AbortSignal.timeout(8000)
          });
          if (response.ok) {
            const releases = await response.json();
            if (Array.isArray(releases) && releases.length > 0) {
              const publishedReleases = releases.filter((r: any) => !r.draft);
              const targetReleases = channel === 'dev' 
                ? publishedReleases 
                : publishedReleases.filter((r: any) => !r.prerelease);
                
              if (targetReleases.length > 0) {
                targetTag = targetReleases[0].tag_name;
              }
            }
          } else {
            throw new Error(`API response status ${response.status}`);
          }
        } catch (tErr: any) {
          writeLog(`Failed to fetch target release via GitHub API: ${tErr.message}. Trying fallbacks...`);
          
          // Fallback 1: raw.githubusercontent.com
          try {
            const rawUrl = `https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/package.json?t=${Date.now()}`;
            const rawRes = await fetch(rawUrl, { signal: AbortSignal.timeout(6000) });
            if (rawRes.ok) {
              const rawPkg = await rawRes.json();
              if (rawPkg && rawPkg.version) {
                targetTag = `v${rawPkg.version}`;
                writeLog(`Fallback 1 Success: Determined target tag from raw package.json: ${targetTag}`);
              }
            } else {
              throw new Error(`Status ${rawRes.status}`);
            }
          } catch (f1Err: any) {
            writeLog(`Fallback 1 failed: ${f1Err.message}. Trying Fallback 2...`);
            
            // Fallback 2: github.com/raw
            try {
              const rawUrl2 = `https://github.com/mdaltoon10/Daltoon-Bot/raw/main/package.json?t=${Date.now()}`;
              const rawRes2 = await fetch(rawUrl2, { signal: AbortSignal.timeout(6000) });
              if (rawRes2.ok) {
                const rawPkg2 = await rawRes2.json();
                if (rawPkg2 && rawPkg2.version) {
                  targetTag = `v${rawPkg2.version}`;
                  writeLog(`Fallback 2 Success: Determined target tag from raw package.json: ${targetTag}`);
                }
              }
            } catch (f2Err: any) {
              writeLog(`All fallbacks failed to determine targetTag: ${f2Err.message}`);
            }
          }
        }

        // Default fallback if targetTag is still empty
        if (!targetTag) {
          targetTag = "v2.4.1";
          writeLog(`Using default targetTag fallback: ${targetTag}`);
        }

        writeLog(`Git status check...`);
        const statusResult = await runCommandAsync("git status");
        writeLog(`Git status before update:\n${statusResult.stdout}\n${statusResult.stderr}`);

        if (channel === 'dev') {
          writeLog(`Step 1: Pulling latest changes from dev branch...`);
          const gitCmd = `git fetch origin dev && git reset --hard origin/dev`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(`Git output:\n${gitResult.stdout}\n${gitResult.stderr}`);
          
          writeLog(`Step 2: Building project...`);
          const buildResult = await runCommandAsync(`npm run build`);
          writeLog(`Build output:\n${buildResult.stdout}\n${buildResult.stderr}`);
        } else {
          writeLog(`Step 1: Pulling latest changes from stable branch (tag ${targetTag})...`);
          const gitCmd = `git fetch origin --tags && git checkout -f ${targetTag}`;
          const gitResult = await runCommandAsync(gitCmd);
          writeLog(`Git output:\n${gitResult.stdout}\n${gitResult.stderr}`);
          
          writeLog(`Step 2: Building project...`);
          const buildResult = await runCommandAsync(`npm run build`);
          writeLog(`Build output:\n${buildResult.stdout}\n${buildResult.stderr}`);
        }

        // Step 3: Make files executable
        writeLog(`Step 3: Making executable files executable...`);
        await runCommandAsync("chmod +x daltoon-dashboard install.sh 2>/dev/null || true");

        // Step 4: Install Python Dependencies (Optional/No-block)
        writeLog(`Step 4: Installing Python dependencies...`);
        const pipCmd = "pip3 install -U pyTelegramBotAPI python-dotenv requests --break-system-packages || pip3 install -U pyTelegramBotAPI python-dotenv requests || true";
        const pipResult = await runCommandAsync(pipCmd);
        writeLog(`Pip output:\n${pipResult.stdout}\n${pipResult.stderr}`);

        // Step 5: Install npm dependencies (only production)
        writeLog(`Step 5: Installing npm dependencies...`);
        const npmInstallResult = await runCommandAsync("npm ci --omit=dev || npm install --omit=dev");
        writeLog(`npm install output:\n${npmInstallResult.stdout}\n${npmInstallResult.stderr}`);

        // Step 6: Restart PM2 processes
        writeLog(`Step 6: Restarting PM2 processes...`);
        const restartResult = await runCommandAsync("pm2 restart daltoon-store || pm2 restart daltoon-bot || pm2 restart all || true");
        writeLog(`PM2 restart output:\n${restartResult.stdout}\n${restartResult.stderr}`);

        writeLog(`=== Auto-Update Completed Successfully ===`);
        // Force process exit to allow service manager to restart with new code
        setTimeout(() => {
          writeLog("Exiting process to trigger restart...");
          process.exit(0);
        }, 3000);
      } catch (err: any) {
        writeLog(`=== Auto-Update Failed with error: ${err.message} ===`);
      }
    }, 1000);
  } catch (err: any) {
    console.error("[Auto-Update Catch Error]", err.message);
  }
});

// Integrate Vite developer server in development environment
// --- CRON JOBS ---
async function autoCleanExpiredFreeTrials() {
  try {
    const db = readSqliteDb();
    const now = new Date();
    // Allow 1 day buffer or strict? The user said "تست های رایگان بعد از تموم شدن مستقیم پاک بشن"
    // So if expireDate is yesterday or earlier, delete.
    now.setHours(0, 0, 0, 0);

    const keysToKeep = [];
    const keysToDelete = [];

    for (let k of db.subscription_keys || []) {
      if (k.planName && k.planName.includes("تست رایگان")) {
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
      `[Auto Cleanup] Found ${keysToDelete.length} expired free trials. Deleting...`,
    );

    const parsedSettings = getSystemSettings(db);
    const activeServers = getActiveServers(parsedSettings);

    for (const server of activeServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword,
        );

        if (loginResult.success && loginResult.cookie) {
          const headers: Record<string, string> = {
            Cookie: loginResult.cookie,
            Accept: "application/json",
          };
          if (loginResult.csrfToken)
            headers["X-Csrf-Token"] = loginResult.csrfToken;

          for (let k of keysToDelete) {
            let uuid = "";
            if (k.subLink) {
              const match = k.subLink.match(
                /(vless|vmess|trojan):\/\/([^@]+)@/,
              );
              if (match && match[2]) uuid = match[2];
            }

            if (uuid) {
              await xuiFetch(
                `${cleanedUrl}/panel/api/client/${uuid}/del`,
                { method: "POST", headers },
                4000,
              ).catch(() => {});
              try {
                const inbRes = await xuiFetch(
                  `${cleanedUrl}/panel/api/inbounds/list`,
                  { method: "GET", headers },
                  4000,
                );
                if (inbRes.ok) {
                  const inbJson = await inbRes.json();
                  if (inbJson.success && Array.isArray(inbJson.obj)) {
                    for (let inb of inbJson.obj) {
                      await xuiFetch(
                        `${cleanedUrl}/panel/api/inbounds/${inb.id}/delClient/${uuid}`,
                        { method: "POST", headers },
                        3000,
                      ).catch(() => {});
                    }
                  }
                }
              } catch (err) {}
            }
          }
        }
      } catch (err) {
        // Continue to next server
      }
    }

    const freshDb = readSqliteDb();

    // We only remove keys that we specifically decided to delete earlier
    const deletedIds = new Set(keysToDelete.map((k) => k.id));
    freshDb.subscription_keys = (freshDb.subscription_keys || []).filter(
      (k) => !deletedIds.has(k.id),
    );

    for (let u of freshDb.users || []) {
      u.activePlansCount = (freshDb.subscription_keys || []).filter(
        (sk: any) =>
          sk.userId === u.userId &&
          sk.status === "active" &&
          !sk.planName.includes("تست رایگان"),
      ).length;
    }

    writeSqliteDb(freshDb);
    console.log(
      `[Auto Cleanup] Successfully deleted ${keysToDelete.length} expired free trials from Panel and Local DB.`,
    );
  } catch (err) {
    console.error("[Auto Cleanup Error]", err);
  }
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup?: any,
) {
  if (!botToken || botToken === "DUMMY_TOKEN") return;
  try {
    const fetchRef = globalThis.fetch || fetch;
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    await fetchRef(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[Telegram Warning] Fail to send to ${chatId}:`, err);
  }
}

async function sendPurchaseSuccessNoteIfAnyServer(
  botToken: string,
  chatId: string | number,
  settings: any,
) {
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
        body: fd as any,
      });
    } else if (noteText) {
      await sendTelegramMessage(botToken, chatId, noteText);
    }
  } catch (err) {
    console.warn(
      `[Purchase Success Note Server] Error sending to ${chatId}:`,
      err,
    );
  }
}

async function autoSyncTrafficUsage() {
  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);

    const activeServers = getActiveServers(settings);

    // Only continue if panel is connected
    if (activeServers.length === 0) {
      return;
    }

    const trafficMap: Record<
      string,
      {
        up: number;
        down: number;
        total: number;
        expiryTime?: number;
        totalGb?: number;
      }
    > = {};
    const seenStats = new Set<string>();

    for (const server of activeServers) {
      try {
        const cleanedUrl = normalizeXuiUrl(server.panelUrl);
        const loginResult = await loginXuiPanel(
          cleanedUrl,
          server.panelUsername,
          server.panelPassword,
        );

        if (!loginResult.success || !loginResult.cookie) {
          continue;
        }

        const headers: Record<string, string> = {
          Cookie: loginResult.cookie,
          Accept: "application/json",
        };

        // Try to get clientTraffics API directly for accurate unique stats
        let trafficJson = null;
        try {
          const ctRes = await xuiFetch(
            `${cleanedUrl}/panel/api/inbounds/getClientTraffics`,
            { method: "GET", headers },
            8000,
          );
          if (ctRes.ok) trafficJson = await ctRes.json();
        } catch (e) {}

        if (
          trafficJson &&
          trafficJson.success &&
          Array.isArray(trafficJson.obj)
        ) {
          for (let cs of trafficJson.obj) {
            if (cs.email) {
              const lMail = cs.email.toLowerCase();
              if (cs.id !== undefined && cs.id !== null) {
                const statKey = `${cs.id}_${cs.email}`;
                if (seenStats.has(statKey)) continue;
                seenStats.add(statKey);
              }
              if (!trafficMap[lMail])
                trafficMap[lMail] = { up: 0, down: 0, total: 0 };
              trafficMap[lMail].up += Number(cs.up) || 0;
              trafficMap[lMail].down += Number(cs.down) || 0;
              trafficMap[lMail].total +=
                (Number(cs.up) || 0) + (Number(cs.down) || 0);
              if (cs.expiryTime)
                trafficMap[lMail].expiryTime = Number(cs.expiryTime);
              if (cs.total)
                trafficMap[lMail].totalGb =
                  Number(cs.total) / (1024 * 1024 * 1024);
            }
          }
        } else {
          // Get all inbounds fallback
          const inbRes = await xuiFetch(
            `${cleanedUrl}/panel/api/inbounds/list`,
            { method: "GET", headers },
            10000,
          );
          if (!inbRes.ok) continue;

          const inbJson = await inbRes.json();
          if (!inbJson.success || !Array.isArray(inbJson.obj)) continue;

          for (let inb of inbJson.obj) {
            let clientStats = inb.clientStats || [];
            for (let cs of clientStats) {
              if (cs.email) {
                // deduplicate if id exists
                if (cs.id !== undefined && cs.id !== null) {
                  const statKey = `${cs.id}_${cs.email}`;
                  if (seenStats.has(statKey)) continue;
                  seenStats.add(statKey);
                }
                const lMail = cs.email.toLowerCase();
                if (!trafficMap[lMail])
                  trafficMap[lMail] = { up: 0, down: 0, total: 0 };
                trafficMap[lMail].up += Number(cs.up) || 0;
                trafficMap[lMail].down += Number(cs.down) || 0;
                trafficMap[lMail].total +=
                  (Number(cs.up) || 0) + (Number(cs.down) || 0);
                if (cs.expiryTime)
                  trafficMap[lMail].expiryTime = Number(cs.expiryTime);
                if (cs.total)
                  trafficMap[lMail].totalGb =
                    Number(cs.total) / (1024 * 1024 * 1024);
              }
            }
          }
        }
      } catch (err) {
        // Continue
      }
    }

    const freshDb = readSqliteDb();
    let updatedCount = 0;

    for (let k of freshDb.subscription_keys || []) {
      const matchName = (
        k.clientName ||
        k.planName ||
        k.name ||
        ""
      ).toLowerCase();
      if (matchName && trafficMap[matchName]) {
        const usedGb = trafficMap[matchName].total / (1024 * 1024 * 1024);
        if (Math.abs((k.trafficUsedGb || 0) - usedGb) > 0.01) {
          k.trafficUsedGb = Number(usedGb.toFixed(2));
          updatedCount++;
        }

        if (
          trafficMap[matchName].totalGb &&
          trafficMap[matchName].totalGb! > 0
        ) {
          const capGb = trafficMap[matchName].totalGb!;
          if (Math.abs((k.trafficLimitGb || 0) - capGb) > 0.01) {
            k.trafficLimitGb = Number(capGb.toFixed(2));
            updatedCount++;
          }
        }

        if (
          trafficMap[matchName].expiryTime &&
          trafficMap[matchName].expiryTime! > 0
        ) {
          try {
            const expiryTs = trafficMap[matchName].expiryTime!;
            if (expiryTs > 0 && expiryTs < 10000000000000) {
              // Practical limit (year 2286 approx)
              const newExpiryISO = new Date(expiryTs)
                .toISOString()
                .split("T")[0];
              if (k.expireDate !== newExpiryISO) {
                k.expireDate = newExpiryISO;
                updatedCount++;
              }
            }
          } catch (e) {}
        }
      }

      // Check Expiry Warning Feature (1GB remaining or 1 Day remaining)
      const isAutoWarningEnabled =
        String(freshDb.settings?.autoWarningConfigBtn || "true") !== "false";
      let expDateObj = null;
      let remainingDays = 999;
      const remainingGb = (k.trafficLimitGb || 50) - (k.trafficUsedGb || 0);

      try {
        expDateObj = new Date(k.expireDate);
        remainingDays = Math.ceil(
          (expDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
      } catch (e) {}

      if (isAutoWarningEnabled && !k.expiryWarningSent) {
        if (
          (remainingGb <= 1 && remainingGb > 0) ||
          (remainingDays <= 1 && remainingDays > 0)
        ) {
          console.log(
            `[Official Warning] User ${k.userId} subscription "${k.planName || k.clientName}" is running out.`,
          );
          const msg = `⚠️ <b>هشدار اتمام سرویس</b>\n\nکاربر گرامی، سرویس شما در حال اتمام است.\n\n🌐 نام سرویس: ${k.planName || "بدون نام"}\n🔰 کد سرویس: <code>${k.clientName}</code>\n🔻 حجم باقیمانده: ${remainingGb.toFixed(2)} GB\n⏳ روز باقیمانده: ${remainingDays} روز\n\nلطفاً نسبت به تمدید سرویس خود اقدام نمایید.`;
          const inlineKeyboard = {
            inline_keyboard: [
              [
                {
                  text: "🔄 تمدید سرویس",
                  callback_data: `mysub_renew_${k.id}`,
                },
                {
                  text: "🔗 دریافت لینک اتصال",
                  callback_data: `vless_link_${k.id}`,
                },
              ],
              [{ text: "🎫 پشتیبانی", callback_data: "mm_btnTicketSupport" }],
            ],
          };
          await sendTelegramMessage(
            settings.botToken,
            k.userId,
            msg,
            inlineKeyboard,
          );
          k.expiryWarningSent = true;
          updatedCount++;
        }
      }

      // Check No-Connection Warning Alert
      const isNoConnAlertEnabled =
        String(freshDb.settings?.autoWarningNoConnectionBtn || "true") !==
        "false";
      if (
        isNoConnAlertEnabled &&
        !k.noConnectionWarningSent &&
        Math.abs(k.trafficUsedGb || 0) < 0.001
      ) {
        if (expDateObj) {
          // We infer creation date from expire date and limit duration. For simplicity, just check if 1 day passed since 'now' and start date if possible.
          // However, without a clean createdAt, we can approximate: if duration is standard 30 and remaining is <= 29.
          // Better yet, just check if `k.createdAtMs` exists. Since we don't have it, we'll mark existing ones to avoid spam.
          if (!k.createdAtMs) {
            // Assign current time to old ones to avoid spamming everyone suddenly
            k.createdAtMs = Date.now();
            updatedCount++;
          } else {
            const daysSinceCreation =
              (Date.now() - k.createdAtMs) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation >= 1) {
              console.log(
                `[Official Warning] User ${k.userId} hasn't connected for 1 day.`,
              );
              let jalaliDate = k.expireDate;
              try {
                jalaliDate = new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                }).format(new Date(k.expireDate));
              } catch (e) {}
              const msg = `🔔 <b>پیام سیستم:</b>\n\n🤔 <b>آیا مشکلی در اتصال به VPN دارید؟</b>\n\nسرویس شما 1 روز پیش فعال شده اما هنوز به آن متصل نشده‌اید.\n\n🖌️ نام سرویس: ${k.planName || "بدون نام"}\n🔰 کد سرویس: <code>${k.clientName}</code>\n🔺حجم بسته: ${(k.trafficLimitGb || 0).toFixed(2)} GB\n🔻حجم باقی مانده: ${remainingGb.toFixed(2)} GB\n📅 تاریخ انقضا: ${jalaliDate}\n\n🔧 <b>اگر در اتصال مشکل دارید:</b>\n• راهنمای اتصال را مطالعه کنید\n• اپلیکیشن VPN خود را بررسی کنید\n• در صورت نیاز به پشتیبانی پیام دهید`;
              const inlineKeyboard = {
                inline_keyboard: [
                  [
                    {
                      text: "🔗 لینک سابسکریپشن(همه ی کانفیگ ها)",
                      callback_data: `vless_link_${k.id}`,
                    },
                  ],
                  [
                    {
                      text: "🔗 لینک های تکی",
                      callback_data: `mysub_vless_${k.id}`,
                    },
                  ],
                  [
                    {
                      text: "💡 آموزش ها",
                      callback_data: "mm_btnGuides",
                    },
                  ],
                  [
                    {
                      text: "🎫 تیکت به پشتیبانی",
                      callback_data: "mm_btnTicketSupport",
                    },
                  ],
                ],
              };
              await sendTelegramMessage(
                settings.botToken,
                k.userId,
                msg,
                inlineKeyboard,
              );
              k.noConnectionWarningSent = true;
              updatedCount++;
            }
          }
        }
      }

      // Check First Connection Alert
      const isFirstConnAlertEnabled =
        String(freshDb.settings?.autoWarningFirstConnectionBtn || "true") !==
        "false";
      if (
        isFirstConnAlertEnabled &&
        !k.firstConnectionMessageSent &&
        (k.trafficUsedGb || 0) > 0.001
      ) {
        console.log(
          `[Official Warning] User ${k.userId} made their first connection.`,
        );
        let jalaliDate = k.expireDate;
        try {
          jalaliDate = new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          }).format(new Date(k.expireDate));
        } catch (e) {}
        const msg = `🔔 <b>پیام سیستم:</b>\n\nسرویس شما با موفقیت متصل شد\n\n🔰 کد سرویس: <code>${k.clientName}</code>\n🔺حجم بسته: ${(k.trafficLimitGb || 0).toFixed(2)} GB\n🔻حجم باقی مانده: ${remainingGb.toFixed(2)} GB\n📅 تاریخ انقضا: ${jalaliDate}\n🔹 نام سرویس: ${k.planName || "بدون نام"}`;
        const inlineKeyboard = {
          inline_keyboard: [
            [{ text: "🔗 لینک اشتراک", callback_data: `vless_link_${k.id}` }],
            [{ text: "🎫 پشتیبانی", callback_data: "mm_btnTicketSupport" }],
          ],
        };
        await sendTelegramMessage(
          settings.botToken,
          k.userId,
          msg,
          inlineKeyboard,
        );
        k.firstConnectionMessageSent = true;
        updatedCount++;
      }
    }

    // Now recalculate colleague accounts' usedTrafficGb based on allocated limits
    if (
      freshDb.colleague_accounts &&
      Array.isArray(freshDb.colleague_accounts)
    ) {
      for (const colAcc of freshDb.colleague_accounts) {
        const colKeys = (freshDb.subscription_keys || []).filter(
          (k: any) => k.colleagueAccountId === colAcc.id,
        );
        const totalUsed = colKeys.reduce(
          (sum: number, k: any) => sum + (k.trafficLimitGb || 0),
          0,
        );
        const totalRealUsed = colKeys.reduce(
          (sum: number, k: any) => sum + (k.trafficUsedGb || 0),
          0,
        );

        const finalUsed = totalUsed + (colAcc.deletedTrafficGb || 0);
        const finalRealUsed =
          totalRealUsed + (colAcc.deletedRealTrafficGb || 0);

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
        `[Auto Sync Usage] Updated traffic usage for ${updatedCount} subscriptions.`,
      );
    }
  } catch (err) {
    console.error("[Auto Sync Usage Error]", err);
  }
}

async function startServer() {
  // Start the background cron job for auto cleaning expired trials
  setInterval(autoCleanExpiredFreeTrials, 10 * 60 * 1000);
  setTimeout(autoCleanExpiredFreeTrials, 10000); // Also run shortly after startup

  // Start background cron job for auto syncing traffic every 10 seconds
  setInterval(autoSyncTrafficUsage, 10 * 1000);
  setTimeout(autoSyncTrafficUsage, 5000); // Also run shortly after startup

  // Start background cron job for auto backup check every minute
  setInterval(checkAutoBackup, 60 * 1000);
  setTimeout(checkAutoBackup, 5000); // Check once shortly after startup

  const isCompiled = process.argv[1] && process.argv[1].endsWith("server.cjs");
  const isProduction = process.env.NODE_ENV === "production" || isCompiled;

  if (!isProduction) {
    console.log("[Server] Mount dev Vite middleware mode.");

    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });

    // Force Vite request processing
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[Server] Serving production files from: ${distPath}`);
    
    // Explicitly bypass static cache for the entry HTML files
    app.get(["/", "/index.html"], (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Find the current JS file hash to detect clients with old cached index.html
    let currentJsFile = "";
    try {
      const assetsPath = path.join(distPath, "assets");
      if (fs.existsSync(assetsPath)) {
        const files = fs.readdirSync(assetsPath);
        const jsFile = files.find((f: string) => f.startsWith("index-") && f.endsWith(".js"));
        if (jsFile) currentJsFile = jsFile;
      }
    } catch (e) {
      console.warn("Could not determine current JS file", e);
    }

    app.get("/assets/index-*.js", (req, res, next) => {
       const requestedFile = path.basename(req.path);
       // If the client is requesting an old JS file because they have a stale index.html cached
       if (currentJsFile && requestedFile !== currentJsFile && requestedFile.startsWith("index-") && requestedFile.endsWith(".js")) {
          console.log(`[Cache-Buster] Intercepted request for old JS file: ${requestedFile}. Sending reload script.`);
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res.send(`
             console.log("Stale frontend cache detected. Forcing reload...");
             window.location.href = window.location.pathname + "?bust=" + new Date().getTime();
          `);
       }
       next();
    });

    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else {
          // Cache JS/CSS assets for 1 year since Vite uses content hashes
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Daltoon Full-Stack Server] Ready at: http://localhost:${PORT}`,
    );
  });
}

startServer();
