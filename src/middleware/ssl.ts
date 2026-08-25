import * as fs from "fs";
import type { Request, Response, NextFunction } from "express";
import { readSqliteDb, writeSqliteDb, getSystemSettings } from "../db/database.js";

export function createSslMiddleware(PORT: number) {
  return function sslEnforcer(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Always immediately bypass API endpoints, websockets, static files, and internal assets
      const path = req.path || "";
      if (
        path.startsWith("/api") ||
        path.startsWith("/ws") ||
        path.startsWith("/uploads") ||
        path.startsWith("/receipts") ||
        path.startsWith("/assets") ||
        path.startsWith("/@vite") ||
        path.startsWith("/src") ||
        path.includes(".")
      ) {
        return next();
      }

      const rawHost = req.headers.host || req.hostname || "";
      const hostname = rawHost.split(":")[0].toLowerCase().trim();

      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[?[a-fA-F0-9:]+\]?$/.test(hostname);
      const isLocalOrDev = !hostname || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" ||
                           hostname.endsWith(".local") || hostname.endsWith(".run.app") ||
                           hostname.endsWith(".cloudrun.app") || hostname.endsWith(".google.com") ||
                           hostname.endsWith(".aistudio.google.com");

      const db = readSqliteDb();
      const settings = getSystemSettings(db);
      let pubKey = settings.sslPublicKeyPath;
      let privKey = settings.sslPrivateKeyPath;
      let hasValidCert = pubKey && privKey && fs.existsSync(pubKey) && fs.existsSync(privKey);

      // Check if connection is already HTTPS
      const protoHeader = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
      const cfVisitor = String(req.headers["cf-visitor"] || "");
      const isHttps =
        req.secure ||
        protoHeader === "https" ||
        cfVisitor.includes('"scheme":"https"') ||
        req.headers["x-forwarded-ssl"] === "on" ||
        req.headers["front-end-https"] === "on";

      if (!isIp && !isLocalOrDev) {
        if (!hasValidCert) {
          let autoPub = "";
          let autoPriv = "";
          if (fs.existsSync(`/root/cert/${hostname}/fullchain.pem`) && fs.existsSync(`/root/cert/${hostname}/privkey.pem`)) {
            autoPub = `/root/cert/${hostname}/fullchain.pem`;
            autoPriv = `/root/cert/${hostname}/privkey.pem`;
          } else if (fs.existsSync(`/etc/letsencrypt/live/${hostname}/fullchain.pem`) && fs.existsSync(`/etc/letsencrypt/live/${hostname}/privkey.pem`)) {
            autoPub = `/etc/letsencrypt/live/${hostname}/fullchain.pem`;
            autoPriv = `/etc/letsencrypt/live/${hostname}/privkey.pem`;
          } else if (fs.existsSync(`/root/.acme.sh/${hostname}_ecc/fullchain.cer`) && fs.existsSync(`/root/.acme.sh/${hostname}_ecc/${hostname}.key`)) {
            autoPub = `/root/.acme.sh/${hostname}_ecc/fullchain.cer`;
            autoPriv = `/root/.acme.sh/${hostname}_ecc/${hostname}.key`;
          } else if (fs.existsSync(`/root/.acme.sh/${hostname}/fullchain.cer`) && fs.existsSync(`/root/.acme.sh/${hostname}/${hostname}.key`)) {
            autoPub = `/root/.acme.sh/${hostname}/fullchain.cer`;
            autoPriv = `/root/.acme.sh/${hostname}/${hostname}.key`;
          }

          if (autoPub && autoPriv) {
            console.log(`[Domain SSL Auto-Detect] Found SSL certificates for '${hostname}' on disk. Updating DB settings...`);
            if (!db.settings) db.settings = {};
            db.settings.domainName = hostname;
            db.settings.sslPublicKeyPath = autoPub;
            db.settings.sslPrivateKeyPath = autoPriv;
            const pc = typeof db.settings.panel_config === 'string' ? JSON.parse(db.settings.panel_config || '{}') : (db.settings.panel_config || {});
            pc.domainName = hostname;
            pc.sslPublicKeyPath = autoPub;
            pc.sslPrivateKeyPath = autoPriv;
            pc.sslCertificateStatus = 'active';
            db.settings.panel_config = JSON.stringify(pc);
            writeSqliteDb(db);
            hasValidCert = true;
          }
        }

        if (hasValidCert && !isHttps) {
          const hostHeader = req.headers.host || hostname;
          return res.redirect(301, `https://${hostHeader}${req.originalUrl || req.url}`);
        }
      } else if (isIp && !isLocalOrDev) {
        const configuredDomain = settings.domainName;
        if (hasValidCert && configuredDomain && configuredDomain.trim() !== '') {
          const isAssetOrApi = req.path.startsWith('/api') || 
                               req.path.startsWith('/uploads') || 
                               req.path.startsWith('/receipts') || 
                               req.path.includes('.') || 
                               req.path.startsWith('/@vite') || 
                               req.path.startsWith('/src');

          if (!isAssetOrApi) {
            const bypass = req.query.bypass_ip_warning === 'true' || (req.headers.cookie && req.headers.cookie.includes('bypass_ip_warning=true'));
            if (!bypass) {
              const redirectPort = (PORT === 443 || PORT === 80) ? "" : `:${PORT}`;
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              return res.status(403).send(`\
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>هشدار امنیتی | دالتون استور</title>
  <style>
    body {
      font-family: Tahoma, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      max-width: 500px;
      width: 100%;
      padding: 32px;
      text-align: center;
    }
    .icon {
      color: #d97706;
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .btn-primary {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      transition: background-color 0.2s;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    .btn-secondary {
      display: inline-block;
      color: #64748b;
      text-decoration: underline;
      font-size: 12px;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
    }
    .btn-secondary:hover {
      color: #334155;
    }
    .alert-box {
      background-color: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
      color: #92400e;
      margin-top: 20px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>اتصال غیر امن (ورود با IP)</h1>
    <p>
      شما گواهی امنیتی <strong>SSL</strong> و دامنه اختصاصی برای این پنل تعریف کرده‌اید.<br>
      جهت حفظ امنیت اطلاعات و جلوگیری از شنود داده‌ها، اکیداً توصیه می‌شود از طریق دامنه امن خود وارد شوید.
    </p>
    
    <a href="https://${configuredDomain}${redirectPort}${req.originalUrl || req.url}" class="btn-primary">
      ورود امن از طریق دامنه (${configuredDomain})
    </a>
    
    <br>
    
    <button onclick="bypassWarning()" class="btn-secondary">
      ادامه با آی‌پی و پذیرش ریسک امنیتی
    </button>
    
    <div class="alert-box">
      <strong>📌 نکته مهم:</strong> ورود مستقیم با آی‌پی از طریق پروتکل HTTPS به دلیل عدم تطابق آدرس آی‌پی با گواهی دامنه، باعث نمایش هشدار "Connection is not private" در مرورگر شما می‌شود. بهترین راهکار همیشه ورود از طریق دامنه امن فوق است.
    </div>
  </div>

  <script>
    function bypassWarning() {
      document.cookie = "bypass_ip_warning=true; Path=/; Max-Age=86400; SameSite=Lax";
      window.location.reload();
    }
  </script>
</body>
</html>
            `);
            }
          }
        }
      }
    } catch (err) {
      console.error("[Domain SSL Enforcer Error]", err);
    }
    next();
  };
}