import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CreditCard,
  User,
  HelpCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Gift,
  Headphones,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

interface TelegramMiniAppProps {
  onBack?: () => void;
}

export const TelegramMiniApp: React.FC<TelegramMiniAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"plans" | "subs" | "wallet" | "profile" | "support">("plans");
  const [tgUser, setTgUser] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      const wa = window.Telegram.WebApp;
      wa.ready();
      wa.expand();
      if (wa.initDataUnsafe?.user) {
        setTgUser(wa.initDataUnsafe.user);
      }
    }
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans select-none pb-20 dir-rtl" dir="rtl">
      {/* Optional Admin Preview Banner */}
      {onBack && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-indigo-500/30 px-4 py-2 flex items-center justify-between text-xs text-indigo-200">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            حالت پیش‌نمایش مینی‌اپ تلگرام
          </span>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-semibold active:scale-95 flex items-center gap-1"
          >
            <span>بازگشت به پنل مدیریت</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-700/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            {tgUser?.first_name ? tgUser.first_name[0] : "D"}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name || ""}` : "برنامه هوشمند ربات"}
            </h1>
            <p className="text-[11px] text-slate-400">
              {tgUser?.username ? `@${tgUser.username}` : "خوش آمدید ⚡"}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <CreditCard className="w-3.5 h-3.5" />
          <span>{walletBalance.toLocaleString("fa-IR")} تومان</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 shadow-xl shadow-indigo-950/40 border border-indigo-400/20">
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-amber-300" />
              سرویس‌های پرسرعت دالتون
            </span>
            <h2 className="text-base font-bold text-white">خرید و تمدید آنلاین اشتراک</h2>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              اتصال بدون قطعی، پهنای باند اختصاصی و پشتیبانی ۲۴ ساعته
            </p>
          </div>
          <Sparkles className="absolute -left-2 -bottom-2 w-24 h-24 text-white/10 pointer-events-none" />
        </div>

        {/* Tab 1: Plans */}
        {activeTab === "plans" && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              لیست پلن‌های فعال
            </h3>

            {/* Sample Plan Cards */}
            {[
              { id: 1, name: "اشتراک ۱ ماهه تک‌کاربره", traffic: "۳۰ گیگابایت", period: "۳۰ روزه", price: "۱۵۰,۰۰۰ تومان", tag: "پرفروش" },
              { id: 2, name: "اشتراک ۲ ماهه دوکاربره", traffic: "۶۰ گیگابایت", period: "۶۰ روزه", price: "۲۸۰,۰۰۰ تومان", tag: "اقتصادی" },
              { id: 3, name: "اشتراک ۳ ماهه نامحدود", traffic: "۱۰۰ گیگابایت", period: "۹۰ روزه", price: "۴۲۰,۰۰0 تومان", tag: "ویژه VIP" },
            ].map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 p-4 rounded-2xl space-y-3 transition-all shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                      {plan.tag}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{plan.name}</h4>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{plan.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>حجم: {plan.traffic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>مدت: {plan.period}</span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5">
                  <span>خرید آنلاین و تحویل آنی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: My Subscriptions */}
        {activeTab === "subs" && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              اشتراک‌های فعال شما
            </h3>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">سرویس آلمان VIP #۱۰۴۲</h4>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    فعال و متصل
                  </p>
                </div>
                <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg">۱۴ روز باقی‌مانده</span>
              </div>

              {/* Traffic Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>مصرف‌شده: ۱۸.۵ گیگ</span>
                  <span>کل: ۳۰ گیگ</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-[61%]"></div>
                </div>
              </div>

              {/* Config Link & Quick Copy */}
              <div className="pt-1 space-y-2">
                <label className="text-[11px] text-slate-400 block">لینک اتصال مستقیم (VLESS):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="vless://e4f80c21-831e-450a-b289-981249fa@de.daltoon.online:443?type=ws#Daltoon-Germany"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[11px] text-slate-300 font-mono truncate"
                  />
                  <button
                    onClick={() => copyToClipboard("vless://e4f80c21-831e-450a-b289-981249fa@de.daltoon.online:443?type=ws#Daltoon-Germany", 1)}
                    className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                  >
                    {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === 1 ? "کپی شد" : "کپی"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wallet */}
        {activeTab === "wallet" && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <CreditCard className="w-4 h-4 text-purple-400" />
              شارژ آنلاین کیف پول
            </h3>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-4">
              <div className="text-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">موجودی فعلی کیف پول</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{walletBalance.toLocaleString("fa-IR")} تومان</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">مبلغ شارژ سفارشی (تومان):</label>
                <input
                  type="number"
                  placeholder="مثلا ۱۰۰,۰۰۰"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["۵۰,۰۰۰", "۱۰۰,۰۰۰", "۲۰۰,۰۰۰"].map((amt, idx) => (
                  <button
                    key={idx}
                    className="py-2 bg-slate-700/50 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-600/50 active:scale-95 transition-all"
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>پرداخت مستقیم و شارژ حساب</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <User className="w-4 h-4 text-blue-400" />
              پروفایل و آمار حساب
            </h3>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-700/60">
                <span className="text-slate-400">شناسه تلگرام:</span>
                <span className="font-mono text-white">{tgUser?.id || "۱۲۳۴۵۶۷۸۹"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/60">
                <span className="text-slate-400">نام کاربر:</span>
                <span className="text-white">{tgUser?.first_name || "کاربر مهمان"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/60">
                <span className="text-slate-400">تاریخ عضویت:</span>
                <span className="text-white">۱۴۰۳/۰۵/۲۰</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">تعداد زیرمجموعه‌ها:</span>
                <span className="text-indigo-400 font-bold">۴ نفر</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Support */}
        {activeTab === "support" && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <HelpCircle className="w-4 h-4 text-pink-400" />
              پشتیبانی و تیکتینگ
            </h3>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                در صورت بروز هرگونه مشکل در اتصال یا خرید، پیام خود را ارسال کنید تا کارشناسان ما بررسی کنند.
              </p>

              <textarea
                rows={4}
                placeholder="متن پیام یا سوال خود را اینجا بنویسید..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-indigo-500"
              ></textarea>

              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5">
                <Headphones className="w-4 h-4" />
                <span>ارسال تیکت پشتیبانی</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-md border-t border-slate-700/80 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "plans" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">پلن‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab("subs")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "subs" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">اشتراک‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "wallet" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">کیف پول</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "profile" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">پروفایل</span>
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "support" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">پشتیبانی</span>
        </button>
      </nav>
    </div>
  );
};
