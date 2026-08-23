// Admin CRUD routes extracted from server.ts
import type { Express } from "express";
import { readSqliteDb, writeSqliteDb } from "../db/database.js";

export function registerAdminRoutes(app: Express) {

  // --- GIFT CODES API ---
  app.get("/api/gift-codes", (_req, res) => {
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
    db.gift_codes = db.gift_codes.filter((c: any) => c.id !== req.body.id);
    writeSqliteDb(db);
    res.json({ success: true });
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

  // --- Plan Categories API ---
  app.get("/api/plan-categories", (_req, res) => {
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

}