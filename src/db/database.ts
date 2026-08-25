// Database layer — SQLite via better-sqlite3, shared with Python bot
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

// Safely get __dirname in both ESM and bundled CJS contexts
const getDirname = () => {
  try {
    return typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

function getProjectRoot() {
  let current = getDirname();
  while (current && current !== "/") {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

function findBestDbPath() {
  const cwdPath = path.resolve(process.cwd(), "Daltoon_Bot.db");
  const rootPath = path.resolve(getProjectRoot(), "Daltoon_Bot.db");
  const optPath = "/opt/daltoon-store/Daltoon_Bot.db";
  
  const candidates = [
    rootPath,
    optPath,
    cwdPath,
    "/root/Daltoon_Bot/Daltoon_Bot.db",
    "/root/daltoon/Daltoon_Bot.db"
  ];

  let bestPath = cwdPath;
  let maxRows = -1;

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const tempDb = new Database(candidate, { readonly: true });
        const rowCount = tempDb.prepare("SELECT COUNT(*) as c FROM kv").get() as { c: number };
        tempDb.close();
        if (rowCount.c > maxRows) {
          maxRows = rowCount.c;
          bestPath = candidate;
        }
      } catch (e) {
        // Ignore invalid DBs
      }
    }
  }

  // If no DB exists or all are empty, prefer rootPath
  if (maxRows <= 0 && rootPath) {
    return rootPath;
  }

  if (bestPath !== cwdPath) {
    console.log(`[Database] Auto-corrected DB path to: ${bestPath} (found ${maxRows} records)`);
  }

  return bestPath;
}

export const dbSqlitePath = findBestDbPath();
export const sqliteDb = new Database(dbSqlitePath);
sqliteDb.pragma("journal_mode = WAL");
sqliteDb.pragma("synchronous = NORMAL");
sqliteDb.exec("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)");


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

export interface DbSchema {
  isNewInstall?: boolean;
  users: any[];
  transactions: any[];
  subscription_keys: any[];
  inbounds: any[];
  servers?: any[];
  colleagueServers?: any[];
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
  user_notifications?: any[];
  settings: Record<string, string>;
  link_tokens?: Record<string, string>;
}

function normalizeDbRecords(db: any) {
  if (!db) return db;
  if (Array.isArray(db.users)) {
    db.users.forEach((u: any) => {
      if (u) {
        if (u.userId === undefined) {
          u.userId = u.user_id !== undefined ? (Number(u.user_id) || u.user_id) : u.telegram_id !== undefined ? (Number(u.telegram_id) || u.telegram_id) : u.id;
        }
        let bal = u.walletBalance ?? u.wallet_balance ?? u.balance ?? u.credit ?? 0;
        u.walletBalance = Number(bal) || 0;
        u.wallet_balance = u.walletBalance;
        u.balance = u.walletBalance;
        u.credit = u.walletBalance;
      }
    });
  }
  if (Array.isArray(db.subscription_keys)) {
    db.subscription_keys.forEach((s: any) => {
      if (s) {
        if (s.userId === undefined && s.user_id !== undefined) s.userId = s.user_id;
        if (s.clientName === undefined) s.clientName = s.client_name || s.name || s.email || s.remark || "";
        if (s.clientUuid === undefined) s.clientUuid = s.client_uuid || s.uuid || s.sub_id || "";
        if (s.trafficLimitGb === undefined) s.trafficLimitGb = Number(s.traffic_limit_gb || s.limit_gb || s.trafficLimit || 0);
        if (s.trafficUsedGb === undefined) s.trafficUsedGb = Number(s.traffic_used_gb || s.used_gb || s.trafficUsed || 0);
      }
    });
  }
  return db;
}

// In-memory cache for ultra-fast response times across MiniApp and Dashboard
let memoryDbCache: DbSchema | null = null;
let memoryDbCacheTimestamp = 0;
let memoryDbSnapshot: Record<string, string> = {};

// Function to read JSON Database, seeding with default templates if not found
export function readSqliteDb(forceFresh: boolean = false): DbSchema {
  if (!forceFresh && memoryDbCache && (Date.now() - memoryDbCacheTimestamp < 1000)) {
    return memoryDbCache;
  }
  try {
    const rows = sqliteDb.prepare("SELECT key, value FROM kv").all() as { key: string; value: string }[];
    
    // hasError check removed - errors now surface via try/catch from native better-sqlite3
    
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
          memoryDbSnapshot = {};
          for (const row of migratedRows) {
            memoryDbSnapshot[row.key] = row.value;
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
    memoryDbSnapshot = {};
    for (const row of rows) {
      memoryDbSnapshot[row.key] = row.value;
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

    if (db.subscription_keys && Array.isArray(db.subscription_keys)) {
      const seenIds = new Set<string>();
      for (const k of db.subscription_keys) {
        if (!k || typeof k !== "object") continue;
        const kId = String(k.id || "").trim();
        if (!kId || seenIds.has(kId)) {
          const newId = `SUB-${Date.now()}-${Math.floor(Math.random() * 90000 + 10000)}`;
          console.log(`[DB Deduplication] server.ts reassigned duplicate sub ID '${kId}' to '${newId}' for user ${k.userId}`);
          k.id = newId;
          seenIds.add(newId);
          modified = true;
        } else {
          seenIds.add(kId);
        }
      }
    }

    // Auto-heal missing users in db.users from subscription_keys and transactions
    if (Array.isArray(db.subscription_keys) || Array.isArray(db.transactions)) {
      if (!Array.isArray(db.users)) {
        db.users = [];
        modified = true;
      }
      const existingUserIds = new Set<number>();
      db.users.forEach((u: any) => {
        const uid = Number(u.userId || u.user_id || u.id);
        if (uid && !isNaN(uid) && uid > 0) existingUserIds.add(uid);
      });

      // Recover users from subscription keys (167+ configs)
      if (Array.isArray(db.subscription_keys)) {
        for (const k of db.subscription_keys) {
          if (!k || typeof k !== "object") continue;
          const uid = Number(k.userId || k.user_id);
          if (uid && !isNaN(uid) && uid > 0 && uid !== 100001 && !existingUserIds.has(uid)) {
            const reconstructedUser = {
              id: uid,
              userId: uid,
              user_id: uid,
              username: k.username || (k.clientName && !k.clientName.includes(" ") ? k.clientName : `user_${uid}`),
              firstName: k.firstName || k.clientName || `کاربر ${uid}`,
              lastName: "",
              fullName: k.clientName || `کاربر ${uid}`,
              walletBalance: 0,
              wallet_balance: 0,
              balance: 0,
              status: "active",
              role: "user",
              isAdmin: false,
              isOwner: false,
              isSuperAdmin: false,
              activePlansCount: 1,
              registeredAt: k.createdAt ? new Date(k.createdAt).toISOString() : new Date().toISOString(),
              createdAt: k.createdAt ? new Date(k.createdAt).toISOString() : new Date().toISOString()
            };
            db.users.push(reconstructedUser);
            existingUserIds.add(uid);
            modified = true;
            console.log(`[DB Auto-Healing] Reconstructed missing user ${uid} (${reconstructedUser.fullName}) from subscription keys`);
          }
        }
      }

      // Recover users from transactions
      if (Array.isArray(db.transactions)) {
        for (const t of db.transactions) {
          if (!t || typeof t !== "object") continue;
          const uid = Number(t.userId || t.user_id);
          if (uid && !isNaN(uid) && uid > 0 && uid !== 100001 && !existingUserIds.has(uid)) {
            const reconstructedUser = {
              id: uid,
              userId: uid,
              user_id: uid,
              username: t.username || `user_${uid}`,
              firstName: t.firstName || `کاربر ${uid}`,
              lastName: "",
              fullName: `کاربر ${uid}`,
              walletBalance: 0,
              wallet_balance: 0,
              balance: 0,
              status: "active",
              role: "user",
              isAdmin: false,
              isOwner: false,
              isSuperAdmin: false,
              activePlansCount: 0,
              registeredAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
              createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString()
            };
            db.users.push(reconstructedUser);
            existingUserIds.add(uid);
            modified = true;
            console.log(`[DB Auto-Healing] Reconstructed missing user ${uid} from transactions`);
          }
        }
      }

      // Re-calculate accurate activePlansCount for all users based on active keys
      if (Array.isArray(db.users) && Array.isArray(db.subscription_keys)) {
        const keyCounts = new Map<number, number>();
        db.subscription_keys.forEach((k: any) => {
          const uid = Number(k.userId || k.user_id);
          if (uid && (!k.status || k.status === "active")) {
            keyCounts.set(uid, (keyCounts.get(uid) || 0) + 1);
          }
        });
        db.users.forEach((u: any) => {
          const uid = Number(u.userId || u.user_id || u.id);
          if (uid) {
            u.activePlansCount = keyCounts.get(uid) || 0;
          }
        });
      }
    }

    // Calculate accurate referral counts based on actual referredBy
    if (db.users && Array.isArray(db.users)) {
      const refCountMap = new Map<string, number>();
      db.users.forEach((u: any) => {
        if (u.referredBy) {
          const refId = String(u.referredBy).trim();
          if (refId && refId !== "undefined" && refId !== "null" && refId !== "None") {
            refCountMap.set(refId, (refCountMap.get(refId) || 0) + 1);
          }
        }
      });

      db.users.forEach((u: any) => {
        const uid = String(u.userId || u.user_id || u.telegram_id || u.id || "").trim();
        if (uid) {
          u.referralCount = refCountMap.get(uid) || 0;
        }
      });
    }

    if (modified) {
      // Use writeSqliteDb instead of direct write to respect safeguards
      writeSqliteDb(db);
    }

    normalizeDbRecords(db);
    memoryDbCache = db as DbSchema;
    memoryDbCacheTimestamp = Date.now();
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

// Helper to extract database object from SQLite binary buffer (.db file)
export function extractDbFromSqliteBuffer(buf: Buffer): Record<string, any> {
  const tempPath = path.join(os.tmpdir(), `restore_${Date.now()}_${Math.random().toString(36).substring(2)}.db`);
  try {
    fs.writeFileSync(tempPath, buf);
    const tempDb = new Database(tempPath, { readonly: true });
    const result: Record<string, any> = {};
    
    const tables = tempDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    if (tables.some((t: any) => t.name === 'kv')) {
      const rows = tempDb.prepare("SELECT key, value FROM kv").all() as { key: string; value: string }[];
      for (const row of rows) {
        try {
          result[row.key] = JSON.parse(row.value);
        } catch {
          result[row.key] = row.value;
        }
      }
    } else {
      for (const { name: t } of tables) {
        if (t.startsWith('sqlite_')) continue;
        const rows = tempDb.prepare(`SELECT * FROM "${t}"`).all();
        const cols = (tempDb.prepare(`PRAGMA table_info("${t}")`).all() as any[]).map((c: any) => c.name);
        result[t] = rows.map((row: any) => {
          const obj: any = {};
          cols.forEach((col: string, i: number) => { obj[col] = row[col]; });
          return obj;
        });
      }
    }
    tempDb.close();
    return result;
  } finally {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) {}
  }
}
// Function to write back data
export function writeSqliteDb(data: DbSchema, isRestore: boolean = false): boolean {
  if (!data) return false;
  if ((data as any)._isReadError) {
    console.error(
      "[Database] Write aborted: Database is currently in an errored/unreadable state. Writing now would wipe data.",
    );
    return false;
  }

  // Safeguard: refuse to overwrite if existing database is large but new data is empty
  if (!isRestore) {
    try {
      let isExistingDbLarge = false;
      if (fs.existsSync(dbSqlitePath)) {
        const stats = fs.statSync(dbSqlitePath);
        if (stats.size > 2048) { // 2KB+ means it's not empty
          isExistingDbLarge = true;
        }
      }

      const rowCountRow = sqliteDb.prepare("SELECT COUNT(*) as count FROM kv").get() as { count: number };
      if (rowCountRow.count > 0 || isExistingDbLarge) {
        const hasUsers = Array.isArray(data.users) && data.users.length > 1; // Require >1 user if it was populated
        const hasTransactions = Array.isArray(data.transactions) && data.transactions.length > 0;
        const hasKeys = Array.isArray(data.subscription_keys) && data.subscription_keys.length > 0;
        const hasServers = Array.isArray(data.servers) && data.servers.length > 0;
        
        let hasToken = false;
        try {
          let cfg: any = data.settings?.panel_config;
          if (typeof cfg === "string") {
              cfg = JSON.parse(cfg);
          }
          hasToken = !!(cfg?.botToken && cfg.botToken.trim() !== "" && cfg.botToken !== "DUMMY_TOKEN");
        } catch(err) {}

        if (!hasUsers && !hasTransactions && !hasToken && !hasKeys && !hasServers) {
          console.error(`[Database] CRITICAL Safeguard: Refusing to overwrite populated database (file size check: ${isExistingDbLarge}) with empty/reset structure!`);
          return false;
        }
      }
    } catch (err) {}
  }

  try {
    if (isRestore) {
      memoryDbSnapshot = {};
      memoryDbCache = null;
      memoryDbCacheTimestamp = 0;
    }
    const insert = sqliteDb.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)");
    const transaction = sqliteDb.transaction((obj: any) => {
      let isAnyModified = false;
      for (const key of Object.keys(obj)) {
        if (key.startsWith("_")) continue;
        const val = typeof obj[key] === "string" ? obj[key] : JSON.stringify(obj[key]);
        insert.run(key, val);
        memoryDbSnapshot[key] = val;
        isAnyModified = true;
      }
      return isAnyModified;
    });
    transaction(data);
    if (!isRestore) {
      if (memoryDbCache) {
        memoryDbCache = { ...memoryDbCache, ...data } as any;
      } else {
        const fullData: any = {};
        for (const key of Object.keys(memoryDbSnapshot)) {
          try {
            fullData[key] = JSON.parse(memoryDbSnapshot[key]);
          } catch(e) {}
        }
        memoryDbCache = { ...fullData, ...data } as any;
      }
    } else {
      memoryDbCache = data;
    }
    memoryDbCacheTimestamp = Date.now();
    clearMiniappDataCache();
    return true;
  } catch (err: any) {
    console.error("[Database SQLite Write Error]", err.message);
    return false;
  }
}

export function isKeyForColleague(k: any, colAcc: any): boolean {
  if (!k || !colAcc) return false;
  const colIdStr = String(colAcc.id || "").trim();
  const kColIdStr = k.colleagueAccountId !== undefined && k.colleagueAccountId !== null ? String(k.colleagueAccountId).trim() : "";
  if (colIdStr && kColIdStr && colIdStr === kColIdStr) return true;
  
  const colUser = String(colAcc.username || "").trim().toLowerCase();
  const kColUser = String(k.colleagueUsername || "").trim().toLowerCase();
  if (colUser && kColUser && colUser === kColUser) return true;
  
  const prefix = String(colAcc.prefix || "").trim().toLowerCase();
  if (prefix) {
    for (const field of ["clientName", "planName", "email", "remark"]) {
      const val = String(k[field] || "").trim().toLowerCase();
      if (val && (val.startsWith(prefix) || val.includes(`${prefix}-`) || val.includes(`${prefix}_`))) {
        return true;
      }
    }
  }
  return false;
}

export function getSystemSettings(db?: any) {
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
    receiptBotToken: process.env.RECEIPT_BOT_TOKEN || "",
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
    hideBtnAddConfig: false,
    hideBtnConfigDetails: false,
    hideBtnSearchConfig: false,
    useMiniAppMode: false,
    startCommandMode: "miniapp",
    btnTextMiniApp: "🚀 ورود به برنامه هوشمند",
    btnTextDashSimple: "📱 داشبورد ساده",
    btnTextDashPro: "🚀 داشبورد حرفه‌ای",
    dashButtonsLayout: "single",
    dashButtonsOrder: "simple_first",
    hideBtnDashSimple: false,
    hideBtnDashPro: false,
    miniAppUrl: "",
    hideBtnMiniApp: false,
    miniAppSplashLogo: "",
    miniAppSplashEnabled: true,
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

  if (!Array.isArray(settings.servers) || settings.servers.length === 0) {
    if (data && Array.isArray(data.servers) && data.servers.length > 0) {
      settings.servers = data.servers;
    }
  }

  // Normalization for keys that might be saved under alternative names or casing
  settings.botToken =
    settings.botToken ||
    settings.bot_token ||
    settings.BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    "";

  settings.receiptBotToken =
    settings.receiptBotToken ||
    settings.receipt_bot_token ||
    settings.RECEIPT_BOT_TOKEN ||
    process.env.RECEIPT_BOT_TOKEN ||
    "";

  settings.ownerId =
    Number(
      settings.ownerId ||
      settings.owner_id ||
      settings.OWNER_ID ||
      process.env.OWNER_ID ||
      0
    );

  settings.botNickname =
    settings.botNickname ||
    settings.bot_nickname ||
    settings.BOT_NICKNAME ||
    "";

  if (
    !settings.sslPublicKeyPath ||
    !settings.sslPrivateKeyPath ||
    !fs.existsSync(settings.sslPublicKeyPath) ||
    !fs.existsSync(settings.sslPrivateKeyPath)
  ) {
    try {
      const targetDom = (settings.domainName || "").trim();
      let autoPub = "";
      let autoPriv = "";

      if (targetDom) {
        if (fs.existsSync(`/root/cert/${targetDom}/fullchain.pem`) && fs.existsSync(`/root/cert/${targetDom}/privkey.pem`)) {
          autoPub = `/root/cert/${targetDom}/fullchain.pem`;
          autoPriv = `/root/cert/${targetDom}/privkey.pem`;
        } else if (fs.existsSync(`/etc/letsencrypt/live/${targetDom}/fullchain.pem`) && fs.existsSync(`/etc/letsencrypt/live/${targetDom}/privkey.pem`)) {
          autoPub = `/etc/letsencrypt/live/${targetDom}/fullchain.pem`;
          autoPriv = `/etc/letsencrypt/live/${targetDom}/privkey.pem`;
        } else if (fs.existsSync(`/root/.acme.sh/${targetDom}_ecc/fullchain.cer`) && fs.existsSync(`/root/.acme.sh/${targetDom}_ecc/${targetDom}.key`)) {
          autoPub = `/root/.acme.sh/${targetDom}_ecc/fullchain.cer`;
          autoPriv = `/root/.acme.sh/${targetDom}_ecc/${targetDom}.key`;
        } else if (fs.existsSync(`/root/.acme.sh/${targetDom}/fullchain.cer`) && fs.existsSync(`/root/.acme.sh/${targetDom}/${targetDom}.key`)) {
          autoPub = `/root/.acme.sh/${targetDom}/fullchain.cer`;
          autoPriv = `/root/.acme.sh/${targetDom}/${targetDom}.key`;
        }
      }

      if (!autoPub || !autoPriv) {
        const rootCertDir = "/root/cert";
        if (fs.existsSync(rootCertDir)) {
          const dirs = fs.readdirSync(rootCertDir);
          for (const dir of dirs) {
            const pub = path.join(rootCertDir, dir, "fullchain.pem");
            const priv = path.join(rootCertDir, dir, "privkey.pem");
            if (fs.existsSync(pub) && fs.existsSync(priv)) {
              if (!settings.domainName) settings.domainName = dir;
              autoPub = pub;
              autoPriv = priv;
              break;
            }
          }
        }
      }

      if (autoPub && autoPriv) {
        settings.sslPublicKeyPath = autoPub;
        settings.sslPrivateKeyPath = autoPriv;
      }
    } catch (e) {}
  }

  if (!settings.botToken || String(settings.botToken).trim() === "" || settings.botToken === "DUMMY_TOKEN") {
    settings.botToken = (process.env.BOT_TOKEN || "").trim();
  }
  if (!settings.BOT_TOKEN || String(settings.BOT_TOKEN).trim() === "" || settings.BOT_TOKEN === "DUMMY_TOKEN") {
    settings.BOT_TOKEN = settings.botToken;
  }

  return settings;
}

// Cached miniapp data per-user (cleared on any DB write to stay fresh)
export const miniappDataCacheMap = new Map<number, { data: any; timestamp: number }>();
export const clearMiniappDataCache = () => { miniappDataCacheMap.clear(); };
