import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { readSqliteDb, writeSqliteDb, getSystemSettings } from "../db/database.js";

// Cache the persistent server secret key in memory once loaded
let persistentAuthSecret: string | null = null;

export function getAuthSecret(): string {
  if (persistentAuthSecret && persistentAuthSecret.length >= 32) {
    return persistentAuthSecret;
  }

  try {
    const db = readSqliteDb();
    const settings = getSystemSettings(db);
    if (settings && typeof settings.authSecretKey === "string" && settings.authSecretKey.length >= 32) {
      const secret = settings.authSecretKey;
      persistentAuthSecret = secret;
      return secret;
    }

    // Generate a strong cryptographic secret and persist it to database
    const newSecret = crypto.randomBytes(48).toString("hex");
    persistentAuthSecret = newSecret;
    if (db) {
      if (!db.settings) db.settings = {};
      db.settings.authSecretKey = newSecret;
      writeSqliteDb(db);
    }
    return newSecret;
  } catch (e) {
    // Fallback if DB is temporarily locked
    if (!persistentAuthSecret) {
      persistentAuthSecret = "daltoon_sec_" + crypto.randomBytes(32).toString("hex");
    }
    return persistentAuthSecret || "daltoon_default_secret_key_32bytes_len";
  }
}

export interface AdminSession {
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Generate a tamper-proof cryptographically signed HMAC token for admin session
 */
export function generateAdminToken(username: string, role: string = "super_admin"): string {
  const secret = getAuthSecret();
  const payload: AdminSession = {
    username: username || "Daltoon",
    role: role || "super_admin",
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the cryptographic signature and expiration of an admin token
 */
export function verifyAdminToken(token: string): AdminSession | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  try {
    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: AdminSession = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts authentication token from HTTP headers, cookies, or query parameters
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === "string") {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 2. Custom X-Daltoon-Token header
  const customHeader = req.headers["x-daltoon-token"] || req.headers["x-auth-token"];
  if (typeof customHeader === "string" && customHeader.trim()) {
    return customHeader.trim();
  }

  // 3. Cookie: daltoon_session=<token>
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    const match = cookieHeader.match(/(?:^|;\s*)daltoon_session=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  // 4. Query param ?token=<token> (useful for export / backup download links)
  if (typeof req.query.token === "string" && req.query.token.trim()) {
    return req.query.token.trim();
  }

  return null;
}

/**
 * Public routes that do NOT require admin authentication
 */
const PUBLIC_API_PREFIXES = [
  "/api/login",
  "/api/logout",
  "/api/auth/verify",
  "/api/vpn-plans",
  "/api/health",
  "/api/system/version",
  "/api/system/check-update",
  "/api/miniapp",
  "/api/sub",
  "/copy",
];

export function isPublicEndpoint(path: string): boolean {
  if (!path) return false;
  // Non-api paths like /, /miniapp, static assets
  if (!path.startsWith("/api/")) return true;
  return PUBLIC_API_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Express middleware to strictly enforce admin authentication across all protected API routes
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // If endpoint is public, allow immediately
  if (isPublicEndpoint(req.path)) {
    return next();
  }

  // Dev preview environment bypass (only for cloud developer previews)
  const isDevPreview =
    process.env.NODE_ENV !== "production" &&
    (req.hostname.includes("ais-dev") ||
      req.hostname.includes("ais-pre") ||
      req.hostname.includes("googleusercontent.com") ||
      req.headers.host?.includes("run.app"));

  const token = extractTokenFromRequest(req);
  if (token) {
    const session = verifyAdminToken(token);
    if (session) {
      (req as any).adminUser = session;
      return next();
    }
  }

  if (isDevPreview) {
    (req as any).adminUser = { username: "Daltoon", role: "super_admin" };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: "احراز هویت الزامی است. لطفاً وارد حساب مدیریت خود شوید.",
    code: "UNAUTHORIZED",
  });
}

/**
 * Helper to set standard session cookie on response
 */
export function setAuthCookie(res: Response, token: string) {
  res.setHeader(
    "Set-Cookie",
    `daltoon_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
}

/**
 * Helper to clear session cookie on logout
 */
export function clearAuthCookie(res: Response) {
  res.setHeader(
    "Set-Cookie",
    "daltoon_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
}
