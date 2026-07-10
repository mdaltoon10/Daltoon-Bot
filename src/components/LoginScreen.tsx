import React, { useState, useEffect } from "react";
import {
  Lock,
  User,
  KeyRound,
  Server,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  Layers,
  Sparkles,
} from "lucide-react";
import { Language } from "../locales";

interface LoginScreenProps {
  onLoginSuccess: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  appVersion: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  lang,
  setLang,
  appVersion,
}) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/vpn-plans")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.vpnPlans)) {
          setPlans(data.vpnPlans);
        }
      })
      .catch((err) => console.error("Error fetching packages on login", err));
  }, []);

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("daltoon_remember_me") === "true";
  });

  const [username, setUsername] = useState(() => {
    const remember = localStorage.getItem("daltoon_remember_me") === "true";
    return remember ? localStorage.getItem("daltoon_saved_username") || "" : "";
  });

  const [password, setPassword] = useState(() => {
    const remember = localStorage.getItem("daltoon_remember_me") === "true";
    return remember ? localStorage.getItem("daltoon_saved_password") || "" : "";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    fa: {
      title: "ورود به مدیریت دالتون بات",
      subtitle: "لطفاً نام کاربری و رمز عبور مدیریت یا ادمین را وارد نمایید",
      usernameLabel: "نام کاربری",
      passwordLabel: "رمز عبور",
      usernamePl: "مانند: admin",
      passwordPl: "•••",
      loginBtn: "ورود به مدیریت",
      loggingIn: "در حال بررسی اطلاعات...",
      invalidCreds: "اطلاعات ورود اشتباه است، لطفاً به سرور لینوکس متصل شده یا مجدد تلاش کنید.",
      rememberMe: "مرا به خاطر بسپار",
    },
    en: {
      title: "Daltoon Bot Admin Panel",
      subtitle: "Please enter your administrative credentials to log in",
      usernameLabel: "Username",
      passwordLabel: "Password",
      usernamePl: "e.g., admin",
      passwordPl: "•••",
      loginBtn: "Sign In",
      loggingIn: "Authenticating...",
      invalidCreds: "Invalid credentials. Please verify your config or try again.",
      rememberMe: "Remember Me",
    },
    ar: {
      title: "تسجيل الدخول إلى دالتون بات",
      subtitle: "يرجى إدخال بيانات المشرف لتسجيل الدخول",
      usernameLabel: "اسم المستخدم",
      passwordLabel: "كلمة المرور",
      usernamePl: "مثال: admin",
      passwordPl: "•••",
      loginBtn: "تسجيل الدخول",
      loggingIn: "جاري التحقق...",
      invalidCreds: "بيانات الاعتماد غير صالحة.",
      rememberMe: "تذكرني",
    },
    ru: {
      title: "Панель управления Daltoon",
      subtitle: "Пожалуйста, введите учетные данные администратора",
      usernameLabel: "Имя пользователя",
      passwordLabel: "Пароль",
      usernamePl: "например, admin",
      passwordPl: "•••",
      loginBtn: "Войти",
      loggingIn: "Аутентификация...",
      invalidCreds: "Неверные учетные данные.",
      rememberMe: "Запомнить меня",
    },
    tr: {
      title: "Daltoon Bot Yönetim Paneli",
      subtitle: "Lütfen yönetici kimlik bilgilerini girin",
      usernameLabel: "Kullanıcı Adı",
      passwordLabel: "Şifre",
      usernamePl: "örneğin: admin",
      passwordPl: "•••",
      loginBtn: "Giriş Yap",
      loggingIn: "Doğrulanıyor...",
      invalidCreds: "Geçersiz kimlik bilgileri.",
      rememberMe: "Beni Hatırla",
    },
    es: {
      title: "Panel de Daltoon Bot",
      subtitle: "Ingrese sus credenciales de administrador",
      usernameLabel: "Usuario",
      passwordLabel: "Contraseña",
      usernamePl: "ej., admin",
      passwordPl: "•••",
      loginBtn: "Iniciar Sesión",
      loggingIn: "Autenticando...",
      invalidCreds: "Credenciales inválidas.",
      rememberMe: "Recordarme",
    }
  }[lang] || {
      title: "Daltoon Bot Admin Panel",
      subtitle: "Please enter your administrative credentials to log in",
      usernameLabel: "Username",
      passwordLabel: "Password",
      usernamePl: "e.g., admin",
      passwordPl: "•••",
      loginBtn: "Sign In",
      loggingIn: "Authenticating...",
      invalidCreds: "Invalid credentials. Please verify your config or try again.",
      rememberMe: "Remember Me",
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("daltoon_dashboard_auth", "true");
        localStorage.setItem("daltoon_dashboard_username", username);
        localStorage.setItem(
          "daltoon_dashboard_role",
          data.user?.role || "admin",
        );
        localStorage.setItem("daltoon_last_interaction", String(Date.now()));

        if (rememberMe) {
          localStorage.setItem("daltoon_remember_me", "true");
          localStorage.setItem("daltoon_saved_username", username.trim());
          localStorage.setItem("daltoon_saved_password", password.trim());
        } else {
          localStorage.removeItem("daltoon_remember_me");
          localStorage.removeItem("daltoon_saved_username");
          localStorage.removeItem("daltoon_saved_password");
        }

        onLoginSuccess();
      } else {
        setError(data.message || t.invalidCreds);
      }
    } catch (err) {
      setError(
        lang === "fa"
          ? "خطا در برقراری ارتباط با سرور."
          : "Could not reach full-stack server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#030305] text-gray-100 flex flex-col items-center justify-center py-10 px-4 gap-6 relative overflow-hidden select-none font-sans"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      {/* Background Decorative Grids and Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none pulse-glow-bg"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none pulse-glow-bg"></div>

      <div className="w-full max-w-md glass-panel border border-white/5 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] p-6 md:p-8 relative z-10 transition duration-300">
        {/* Language Selection floating in Card Corner */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-purple-400">
            <Server className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            <span className="font-mono text-xs font-bold tracking-wider">
              v{appVersion} pro
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/5 hover:border-purple-500/20 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {lang === "fa" && "🇮🇷 فارسی"}
                {lang === "en" && "🇬🇧 English"}
                {lang === "ar" && "🇸🇦 العربية"}
                {lang === "ru" && "🇷🇺 Русский"}
                {lang === "tr" && "🇹🇷 Türkçe"}
                {lang === "es" && "🇪🇸 Español"}
              </span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
                  {[
                    { code: "fa", label: "🇮🇷 فارسی" },
                    { code: "en", label: "🇬🇧 English" },
                    { code: "ar", label: "🇸🇦 العربية" },
                    { code: "ru", label: "🇷🇺 Русский" },
                    { code: "tr", label: "🇹🇷 Türkçe" },
                    { code: "es", label: "🇪🇸 Español" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code as any);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${lang === l.code ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.25)] mb-4 border border-purple-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-purple-200 to-gray-300 bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* error alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 animate-pulse">
            <div className="shrink-0 mt-0.5 font-bold">⚠️</div>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 px-1">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 ${lang === "fa" ? "right-3" : "left-3"} flex items-center pointer-events-none text-gray-400`}
              >
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePl}
                className={`w-full bg-black/40 border border-white/5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 py-2.5 ${
                  lang === "fa" ? "pr-10 pl-4" : "pl-10 pr-4"
                } rounded-xl text-sm font-medium font-mono placeholder:text-gray-500 text-gray-100 outline-none transition`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 px-1">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 ${lang === "fa" ? "right-3" : "left-3"} flex items-center pointer-events-none text-gray-400`}
              >
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPl}
                className={`w-full bg-black/40 border border-white/5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 py-2.5 ${
                  lang === "fa" ? "pr-10 pl-11" : "pl-10 pr-11"
                } rounded-xl text-sm font-medium font-mono text-gray-100 outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${lang === "fa" ? "left-3" : "right-3"} flex items-center text-gray-400 hover:text-purple-400 transition cursor-pointer`}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 py-1">
            <label className="flex items-center gap-2.5 text-xs text-gray-400 hover:text-gray-300 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-black/40 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 w-4 h-4 cursor-pointer transition"
              />
              <span>{t.rememberMe}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 disabled:from-purple-800 disabled:to-indigo-800 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-[0_4px_30px_rgba(168,85,247,0.25)] hover:shadow-[0_4px_30px_rgba(168,85,247,0.35)] transition duration-200 mt-6 cursor-pointer flex items-center justify-center gap-2 border border-purple-400/20"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>{t.loggingIn}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>{t.loginBtn}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-white/5 text-center space-y-2">
          <p className="text-[10px] text-gray-500 font-mono">
            {lang === "fa"
              ? "رمز عبور و یوزرهای ادمین را با استفاده از دستور daltoon-dashboard بازیابی کنید."
              : "Modify credentials or add sub-admins anytime using the daltoon-dashboard server tool."}
          </p>
        </div>
      </div>
    </div>
  );
};
