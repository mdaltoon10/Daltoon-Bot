// Admin CRUD routes extracted from server.ts
import type { Express } from "express";
import { readSqliteDb, writeSqliteDb } from "../db/database.js";
import { requireAdminAuth } from "../middleware/auth.js";

export function registerAdminRoutes(app: Express) {

  // --- GIFT CODES API ---
  app.get("/api/gift-codes", requireAdminAuth, (_req, res) => {
    const db = readSqliteDb();
    res.json(db.gift_codes || []);
  });

  app.post("/api/gift-codes", requireAdminAuth, (req, res) => {
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

  app.post("/api/gift-codes/delete", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.gift_codes) db.gift_codes = [];
    db.gift_codes = db.gift_codes.filter((c: any) => c.id !== req.body.id);
    writeSqliteDb(db);
    res.json({ success: true });
  });

  // --- PROMO CODES ENDPOINTS ---
  app.post("/api/promo-codes", requireAdminAuth, (req, res) => {
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

  app.post("/api/promo-codes/delete", requireAdminAuth, (req, res) => {
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

  // --- Plan Categories API ---
  app.get("/api/plan-categories", requireAdminAuth, (_req, res) => {
    try {
      const db = readSqliteDb();
      res.json({ success: true, categories: db.plan_categories || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/plan-categories", requireAdminAuth, (req, res) => {
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

  app.post("/api/plan-categories/delete", requireAdminAuth, (req, res) => {
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

  app.post("/api/plan-categories/reorder", requireAdminAuth, async (req, res) => {
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

  // --- Colleague Packages ---
  app.post("/api/colleague-packages/save", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.colleague_packages) db.colleague_packages = [];
    const { id, title, price, trafficGb, category, description, minCreateGb, durationDays, serverId } = req.body;
    if (!id || !title || price === undefined || trafficGb === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }
  
    const packageObj = {
      id,
      title,
      price: Number(price),
      trafficGb: Number(trafficGb),
      durationDays: durationDays !== undefined && !isNaN(Number(durationDays)) ? Number(durationDays) : 30,
      category: category || "",
      description: description || "",
      minCreateGb: minCreateGb ? Number(minCreateGb) : 1,
      serverId: serverId || "",
    };
  
    const existingIdx = db.colleague_packages.findIndex((p) => p.id === id);
    if (existingIdx !== -1) {
      db.colleague_packages[existingIdx] = packageObj;
    } else {
      db.colleague_packages.push(packageObj);
    }
    writeSqliteDb(db);
    res.json({ success: true, colleaguePackages: db.colleague_packages });
  });
  
  app.post("/api/colleague-packages/delete", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.colleague_packages) db.colleague_packages = [];
    db.colleague_packages = db.colleague_packages.filter(
      (p) => p.id !== req.body.id,
    );
    writeSqliteDb(db);
    res.json({ success: true, colleaguePackages: db.colleague_packages });
  });
  
  app.post("/api/colleague-packages/reorder", requireAdminAuth, (req, res) => {
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

  // --- Colleague Categories ---
  app.get("/api/colleague-categories", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    res.json(db.colleague_categories || []);
  });
  
  app.post("/api/colleague-categories/save", requireAdminAuth, (req, res) => {
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
  
  app.post("/api/colleague-categories/delete", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.colleague_categories) db.colleague_categories = [];
    db.colleague_categories = db.colleague_categories.filter(
      (c) => c.id !== req.body.id,
    );
    writeSqliteDb(db);
    res.json({ success: true, colleagueCategories: db.colleague_categories });
  });
  
  app.post("/api/colleague-categories/reorder", requireAdminAuth, (req, res) => {
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

  // --- Colleague Accounts CRUD ---
  app.post("/api/colleague-accounts/delete", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.colleague_accounts) db.colleague_accounts = [];
    db.colleague_accounts = db.colleague_accounts.filter(
      (a) => a.id !== req.body.id,
    );
    writeSqliteDb(db);
    res.json({ success: true, colleagueAccounts: db.colleague_accounts });
  });
  
  app.post("/api/colleague-accounts/reset", requireAdminAuth, (req, res) => {
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
  
  app.post("/api/colleague-accounts/edit", requireAdminAuth, (req, res) => {
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
  
  app.post("/api/colleague-accounts/reset-usage", requireAdminAuth, (req, res) => {
    const db = readSqliteDb();
    if (!db.colleague_accounts) db.colleague_accounts = [];
  
    const accIndex = db.colleague_accounts.findIndex((a) => a.id === req.body.id);
    if (accIndex !== -1) {
      db.colleague_accounts[accIndex].usedTrafficGb = 0;
      db.colleague_accounts[accIndex].realUsedTrafficGb = 0;
      db.colleague_accounts[accIndex].deletedTrafficGb = 0;
      db.colleague_accounts[accIndex].deletedRealTrafficGb = 0;
      writeSqliteDb(db);
      res.json({ success: true, colleagueAccounts: db.colleague_accounts });
    } else {
      res.json({ success: false, error: "Account not found" });
    }
  });

  // --- Custom Buttons ---
  app.post("/api/custom-buttons", requireAdminAuth, async (req, res) => {
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
  
  app.post("/api/custom-buttons/delete", requireAdminAuth, async (req, res) => {
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

  app.get("/api/vpn-plans", (req, res) => {
    try {
      const db = readSqliteDb();
      res.json({ success: true, vpnPlans: db.vpn_plans || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  
  app.post("/api/vpn-plans", requireAdminAuth, async (req, res) => {
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
  
  app.post("/api/vpn-plans/delete", requireAdminAuth, async (req, res) => {
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
  
  app.post("/api/vpn-plans/reorder", requireAdminAuth, async (req, res) => {
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

}
