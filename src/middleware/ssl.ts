import type { Request, Response, NextFunction } from "express";

/**
 * Clean SSL / Domain Middleware:
 * Allows seamless access over both HTTP and HTTPS, Domain and IP,
 * preventing any breaking 301 redirect loops or browser handshake failures.
 */
export function createSslMiddleware(PORT: number) {
  return function sslEnforcer(req: Request, res: Response, next: NextFunction) {
    return next();
  };
}
