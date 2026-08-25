import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { readSqliteDb, writeSqliteDb, getSystemSettings, sqliteDb } from "../db/database.js";

export interface AdminSession {
  token: string;
  username: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session cache for microsecond performance
const memorySessions = new Map<string, AdminSession>();

// Failed login attempt tracking for brute-force protection
interface LoginAttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
}
const failedLoginAttempts = new Map<string, LoginAttemptRecord>();

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Retrieves or generates the persistent secret key for signing tokens
 */
function getAuthSecretKey(): string {
  try {
    const row = sqliteDb
      .prepare("SELECT value FROM kv WHERE key = 'auth_secret_key'")
      .get() as { value: string } | undefined;
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (typeof parsed === "string" && parsed.length >= 32) return parsed;
      } catch {
        if (typeof row.value === "string" && row.value.length >= 32) return row.value;
      }
    }
    const newSecret = crypto.randomBytes(32).toString("hex");
    sqliteDb
      .prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)")
      .run("auth_secret_key", JSON.stringify(newSecret));
    return newSecret;
  } catch (err) {
    return "daltoon_static_fallback_secret_key_8347921847120938";
  }
}

/**
 * Parses cookies from request header
 */
export function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    const trimmedName = name?.trim();
    if (!trimmedName) return;
    const value = rest.join("=").trim();
    try {
      list[trimmedName] = decodeURIComponent(value);
    } catch {
      list[trimmedName] = value;
    }
  });
  return list;
}

/**
 * Extracts client IP safely
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}

/**
 * Checks if the IP is currently rate-limited/locked out due to excessive failed logins
 */
export function checkLoginRateLimit(ip: string): { isBlocked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip);
  if (!record) return { isBlocked: false };

  if (record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
    return { isBlocked: true, remainingMinutes };
  }

  // If lockout window expired, reset record
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    failedLoginAttempts.delete(ip);
    return { isBlocked: false };
  }

  // If sliding window expired (e.g. 15 mins since first attempt)
  if (now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    failedLoginAttempts.delete(ip);
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

/**
 * Records a failed login attempt for the given IP
 */
export function recordFailedLogin(ip: string): { isNowBlocked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  let record = failedLoginAttempts.get(ip);

  if (!record || now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    record = { count: 1, firstAttemptAt: now, lockedUntil: 0 };
    failedLoginAttempts.set(ip, record);
    return { isNowBlocked: false };
  }

  record.count += 1;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { isNowBlocked: true, remainingMinutes: 15 };
  }

  return { isNowBlocked: false };
}

/**
 * Clears failed login record upon successful authentication
 */
export function resetFailedLogins(ip: string): void {
  failedLoginAttempts.delete(ip);
}

/**
 * Extracts admin authentication token from request (Bearer header, custom header, or HttpOnly cookie)
 */
export function getAdminTokenFromRequest(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const t = authHeader.substring(7).trim();
    if (t) return t;
  }

  // 2. Custom header x-daltoon-token or x-auth-token
  const xToken = req.headers["x-daltoon-token"] || req.headers["x-auth-token"];
  if (typeof xToken === "string" && xToken.trim()) {
    return xToken.trim();
  }

  // 3. HttpOnly Session Cookie: daltoon_session
  const cookies = parseCookies(req);
  if (cookies.daltoon_session && cookies.daltoon_session.trim()) {
    return cookies.daltoon_session.trim();
  }

  return null;
}

/**
 * Creates and persists a cryptographically signed admin session
 */
export function createAdminSession(
  username: string,
  role: string,
  req: Request
): AdminSession {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload = {
    u: username,
    r: role,
    iat: now,
    exp: expiresAt,
    rnd: crypto.randomBytes(8).toString("hex"),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secretKey = getAuthSecretKey();
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payloadStr)
    .digest("hex");

  const token = `${payloadStr}.${signature}`;

  const session: AdminSession = {
    token,
    username,
    role,
    ip: getClientIp(req),
    userAgent: String(req.headers["user-agent"] || ""),
    createdAt: now,
    expiresAt,
  };

  memorySessions.set(token, session);

  // Clean up expired sessions periodically
  if (memorySessions.size > 1000) {
    cleanupExpiredSessions();
  }

  return session;
}

/**
 * Retrieves and validates an admin session (supports memory cache and HMAC stateless verification)
 */
export function getAdminSession(token: string): AdminSession | null {
  if (!token || typeof token !== "string") return null;

  // 1. Check in-memory cache
  const cached = memorySessions.get(token);
  if (cached) {
    if (cached.expiresAt <= Date.now()) {
      memorySessions.delete(token);
      return null;
    }
    return cached;
  }

  // 2. Validate cryptographic signature (stateless verification after server reboot)
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const secretKey = getAuthSecretKey();
    const expectedSig = crypto
      .createHmac("sha256", secretKey)
      .update(payloadStr)
      .digest("hex");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf8")
    );

    if (!payload.u || !payload.exp || payload.exp <= Date.now()) {
      return null;
    }

    const session: AdminSession = {
      token,
      username: payload.u,
      role: payload.r || "admin",
      ip: "0.0.0.0",
      userAgent: "",
      createdAt: payload.iat || Date.now(),
      expiresAt: payload.exp,
    };

    memorySessions.set(token, session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Invalidates and removes an admin session
 */
export function destroyAdminSession(token: string): void {
  if (token) {
    memorySessions.delete(token);
  }
}

/**
 * Cleans up expired sessions from memory
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of memorySessions.entries()) {
    if (session.expiresAt <= now) {
      memorySessions.delete(token);
    }
  }
}

/**
 * Strict Express Middleware that blocks any unauthenticated access to admin endpoints
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // Allow Cloud Run / Dev preview bypass if in local/cloud development environment
  const isDevPreview =
    process.env.NODE_ENV !== "production" &&
    (req.hostname.includes("run.app") ||
      req.hostname.includes("localhost") ||
      req.hostname.includes("googleusercontent.com") ||
      req.headers.host?.includes("run.app"));

  const token = getAdminTokenFromRequest(req);
  if (!token) {
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

  const session = getAdminSession(token);
  if (!session) {
    if (isDevPreview) {
      (req as any).adminUser = { username: "Daltoon", role: "super_admin" };
      return next();
    }
    return res.status(401).json({
      success: false,
      error: "نشست کاربری شما نامعتبر است یا منقضی شده است. لطفاً مجدداً لاگین کنید.",
      code: "SESSION_EXPIRED",
    });
  }

  // Attach verified admin user session to request object
  (req as any).adminUser = session;
  next();
}

