import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global API authorization and credentials interceptor
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    // Only intercept relative or local /api/ calls
    if (url.startsWith("/api/") || url.includes("/api/")) {
      const token = localStorage.getItem("daltoon_auth_token");
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : {}));

      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const updatedInit: RequestInit = {
        ...init,
        headers,
        credentials: init?.credentials || "same-origin",
      };

      try {
        const response = await originalFetch(input, updatedInit);
        // If an admin endpoint returns 401 unauthorized on custom domain
        if (
          response.status === 401 &&
          !url.includes("/api/login") &&
          !window.location.hostname.includes("run.app") &&
          !window.location.hostname.includes("localhost")
        ) {
          if (localStorage.getItem("daltoon_dashboard_auth") === "true") {
            console.warn("[Auth Interceptor] Session invalid or expired. Resetting auth state.");
            localStorage.removeItem("daltoon_dashboard_auth");
            localStorage.removeItem("daltoon_auth_token");
            window.dispatchEvent(new Event("daltoon_auth_expired"));
          }
        }
        return response;
      } catch (err) {
        throw err;
      }
    }

    return originalFetch(input, init);
  };
}

interface ErrorBoundaryProps {

  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 dir-rtl text-right font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">خطای غیرمنتظره در بارگذاری داشبورد</h2>
                <p className="text-xs text-slate-400">یک خروجی نامعتبر رخ داده است.</p>
              </div>
            </div>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono text-rose-300 break-all dir-ltr text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("daltoon_active_tab");
                window.location.reload();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg cursor-pointer text-sm"
            >
              🔄 بازنشانی و تلاش مجدد
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

