import React, { useState, useEffect } from "react";
import { Language } from "../locales";
import { Bot, UserCog, User, Key, ArrowRight, Info } from "lucide-react";
import { PanelSettings } from "../types";

interface SetupModalProps {
  lang: Language;
  onComplete: (settingsUpdate: Partial<PanelSettings>) => void;
}

export default function SetupModal({ lang, onComplete }: SetupModalProps) {
  const [nickname, setNickname] = useState(() => sessionStorage.getItem("setup_nickname") || "");
  const [botToken, setBotToken] = useState(() => sessionStorage.getItem("setup_botToken") || "");
  const [ownerId, setOwnerId] = useState(() => sessionStorage.getItem("setup_ownerId") || "");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("setup_nickname", nickname);
  }, [nickname]);

  useEffect(() => {
    sessionStorage.setItem("setup_botToken", botToken);
  }, [botToken]);

  useEffect(() => {
    sessionStorage.setItem("setup_ownerId", ownerId);
  }, [ownerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !botToken.trim() || !ownerId.trim()) {
      setError(lang === "fa" ? "لطفا تمامی فیلدها را پر کنید." : "Please fill out all fields.");
      return;
    }
    
    if (isNaN(Number(ownerId))) {
      setError(lang === "fa" ? "آیدی عددی باید فقط شامل اعداد باشد." : "Owner ID must be a number.");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/bot/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken.trim() })
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(lang === "fa" 
          ? `❌ توکن وارد شده نامعتبر است یا توسط BotFather منقضی/پاک شده است! تلگرام خطای روبرو را گزارش داد: ${data.error}`
          : `❌ The token entered is invalid or has expired/been deleted by BotFather! Telegram reported: ${data.error}`
        );
        setIsValidating(false);
        return;
      }
    } catch (err: any) {
      console.warn("Base validation connection issue:", err.message);
    }

    setIsValidating(false);
    
    sessionStorage.removeItem("setup_nickname");
    sessionStorage.removeItem("setup_botToken");
    sessionStorage.removeItem("setup_ownerId");

    const guidesTextDefault = lang === "fa" 
      ? `🌐 راهنمای فعال‌سازی و اتصال به سرویس (لینک سابسکریپشن)

کاربر گرامی، ضمن تشکر از انتخاب و اعتماد شما، روش فعال‌سازی و راه‌اندازی سرویس به شرح زیر می‌باشد:

۱. نرم‌افزار متناسب با سیستم‌عامل خود را دانلود و نصب کنید:
• اندروید: v2rayNG
• آیفون (iOS): V2box یا Streisand
• ویندوز: Nekoray یا v2rayN

۲. لینک اشتراک (سابسکریپشن) دریافتی از ربات را کپی نمایید.

۳. وارد نرم‌افزار شده و پیوند کپی شده را اضافه نمایید (معمولاً دکمه + و انتخاب گزینه Import from clipboard یا Add Subscription).

۴. روی گزینه Update Subscription کلیک کنید تا تمام سرورها بارگذاری شوند.

۵. یکی از سرورها را انتخاب کرده و اتصال را برقرار نمایید. در صورت وجود هرگونه مشکل با ما در ارتباط باشید.`
      : "Connection Guides...";

    const defaultWelcomeText = lang === "fa"
      ? `<b>🛍️ به فروشگاه ${nickname.trim()} خوش آمدید!</b>\n\nبهترین و معتبرترین پلن‌ها و اشتراک‌ها را با تحویل آنی و ضمانت بازگشت وجه تهیه فرمایید.\n\n🆔 شناسه تلگرام شما: <code>{tg_id}</code>\n💰 موجودی کیف پول: <code>{wallet_balance}</code> تومان\n\n👇 لطفا گزینه مورد نظر خود را از منوی زیر انتخاب نمایید:`
      : `<b>🛍️ Welcome to ${nickname.trim()} !</b>\n\nGet the best and most reliable plans and subscriptions with instant delivery and money-back guarantee.\n\n🆔 Your Telegram ID: <code>{tg_id}</code>\n💰 Wallet Balance: <code>{wallet_balance}</code>\n\n👇 Please select your desired option from the menu below:`;

    const defaultSupportText = lang === "fa"
      ? `📞 <b>پشتیبانی ${nickname.trim()}:</b>\n\nمشتری گرامی! در صورت وجود هرگونه سوال، پیگیری خرید یا پشتیبانی قبل و بعد از فروش در خدمت شما هستیم.\n\n👤 پشتیبانی تلگرام: @mDaltoon\n\nپاسخگویی فعال: ۲۴ ساعته شبانه‌روز`
      : `📞 <b>Support for ${nickname.trim()}:</b>\n\nDear customer! If you have any questions, purchase tracking, or pre- and post-sales support, we are at your service.\n\n👤 Telegram Support: @mDaltoon\n\nActive response: 24/7`;

    onComplete({
      botToken: botToken.trim(),
      botNickname: nickname.trim(),
      ownerId: Number(ownerId.trim()),
      welcomeText: defaultWelcomeText,
      supportText: defaultSupportText,
      btnTextGuides: lang === "fa" ? "💡 راهنمای اتصال" : "💡 Connection Guides",
      guidesText: guidesTextDefault,
      isFreeTestActive: false,
      hideBtnFreeTest: true,
      hideBtnAiChat: true,
      hideBtnColleagues: true,
      hideBtnReferral: true,
      hideBtnFeedback: true,
      hideBtnTicketSupport: true,
      hideBtnInstantSupport: true,
      hideBtnSupport: true,
      hideBtnBuyNew: true,
      hideBtnMySubs: true,
      hideBtnGuides: true,
      hideBtnProfile: true,
      hideBtnWallet: true,
      
      hideSupport: false, 
      hideBuy: false, 
      hideProfile: false, 
      hideWallet: true,
      admins: [
        {
          id: Math.random().toString(36).substring(2, 9),
          userId: Number(ownerId.trim()),
          username: "Owner",
          role: "super_admin",
          createdAt: new Date().toISOString()
        }
      ]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in animate-duration-300">
        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
              <UserCog className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {lang === "fa" ? "راه‌اندازی اولیه دالتون بات" : "Daltoon Bot Initial Setup"}
              </h2>
              <p className="text-xs text-indigo-300/80 font-medium font-sans">
                {lang === "fa" ? "توسعه یافته توسط mDaltoon" : "Developed by mDaltoon"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs md:text-sm font-medium leading-relaxed font-sans">
              {error}
            </div>
          )}

          {/* Backup Restore Option */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              📥 {lang === "fa" ? "آیا فایل پشتیبان (بکاپ) دارید؟" : "Have a database backup?"}
            </h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              {lang === "fa"
                ? "اگر از قبل فایل بکاپ (پسوند JSON) دارید، آن را بارگذاری کنید تا همه تنظیمات، کاربران، سرورها و پیام‌های قبلی شما با یک کلیک بازگردند."
                : "If you have a previous backup file (JSON), upload it to restore all your previous settings, users, servers, and channels immediately."}
            </p>
            <label className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 py-2.5 px-4 rounded-lg border border-emerald-500/30 transition-all text-xs font-semibold cursor-pointer w-full text-center">
              <span>{lang === "fa" ? "📁 انتخاب و بارگذاری فایل بکاپ (JSON)" : "📁 Select & Restore Backup JSON"}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                disabled={isValidating}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setIsValidating(true);
                  setError(null);
                  
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const content = ev.target?.result;
                    if (typeof content === 'string') {
                      try {
                        const fb = await fetch("/api/backup-restore", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ backupData: content })
                        });
                        const rJson = await fb.json();
                        if (rJson.success) {
                          setError(lang === "fa" ? "✅ بکاپ با موفقیت بازگردانی شد! صفحه در حال بروزرسانی است..." : "✅ Backup successfully restored! Reloading dashboard...");
                          setTimeout(() => window.location.reload(), 2000);
                        } else {
                          setError(rJson.error || (lang === "fa" ? "خطا در بازگردانی بکاپ" : "Error restoring backup"));
                          setIsValidating(false);
                        }
                      } catch(er: any) {
                        setError(er.message);
                        setIsValidating(false);
                      }
                    } else {
                      setIsValidating(false);
                    }
                  }
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                {lang === "fa" ? "نام ربات / لقب شما (Nickname)" : "Bot/Store Nickname"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                disabled={isValidating}
                onChange={e => setNickname(e.target.value)}
                placeholder={lang === "fa" ? "مثال: فروشگاه پروکسی من" : "e.g. My Proxy Store"}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1.5 font-sans">
                {lang === "fa" ? "این نام در پیام‌های خوش‌آمدگویی و داخل ربات به جای Daltoon قرار می‌گیرد." : "This name will be placed in welcome messages instead of Daltoon."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                {lang === "fa" ? "توکن ربات تلگرام" : "Telegram Bot Token"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={botToken}
                disabled={isValidating}
                onChange={e => setBotToken(e.target.value)}
                placeholder="1234567890:AAH..."
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono placeholder:text-gray-600 disabled:opacity-50"
                dir="ltr"
              />
              <p className="text-[11px] text-emerald-400/80 mt-1.5 flex items-center gap-1 font-sans">
                <Info className="w-3 h-3" />
                {lang === "fa" ? "توکن ربات خود را از BotFather@ دریافت کنید." : "Get your token from @BotFather."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                {lang === "fa" ? "آیدی عددی مالک (Owner ID)" : "Owner Numeric ID"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ownerId}
                disabled={isValidating}
                onChange={e => setOwnerId(e.target.value)}
                placeholder={lang === "fa" ? "فقط عدد (مثلا: 123456789)" : "Numbers only"}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono placeholder:text-gray-600 disabled:opacity-50"
                dir="ltr"
              />
              <p className="mt-1.5 text-xs text-indigo-300 font-medium flex items-center gap-1 font-sans">
                <Info className="w-3 h-3" />
                {lang === "fa" ? "آیدی عددی خود را می‌توانید از ربات تلگرامی infouserbot@ دریافت کنید." : "Get your numeric ID from @infouserbot in Telegram."}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:text-gray-300 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <span className="font-sans">{lang === "fa" ? "در حال بررسی اتصال به تلگرام..." : "Verifying Telegram Bot Token..."}</span>
            ) : (
              <span className="flex items-center gap-2 font-sans justify-center w-full">
                {lang === "fa" ? "ذخیره و ورود به داشبورد" : "Save and Enter Dashboard"}
                <ArrowRight className="w-5 h-5 rtl:hidden" />
                <ArrowRight className="w-5 h-5 hidden rtl:block rotate-180" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
