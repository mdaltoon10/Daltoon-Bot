import React, { useEffect, useState } from "react";
import { Download, Smartphone, X, Check, Share } from "lucide-react";

interface PwaInstallBannerProps {
  lang?: "fa" | "en" | "ar" | "ru" | "tr" | "es";
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ lang = "fa" }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState<boolean>(false);

  useEffect(() => {
    const checkInstalledStatus = () => {
      // Check if app is running in standalone mode (launched from home screen as PWA)
      const isInStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      if (isInStandalone) {
        setIsStandalone(true);
        setShowBanner(false);
        return true;
      }

      // In browser mode, always show banner on page refresh
      setIsStandalone(false);
      setTimeout(() => {
        setShowBanner(true);
      }, 300);
      return false;
    };

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    checkInstalledStatus();

    // Capture standard PWA beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Listen for native installation completion
    const handleAppInstalled = () => {
      localStorage.setItem("daltoon_pwa_installed", "true");
      setIsStandalone(true);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Save install status in browser memory when user clicks install button
    localStorage.setItem("daltoon_pwa_installed", "true");

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
        setShowBanner(false);
        setDeferredPrompt(null);
      } else {
        setShowBanner(false);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      setShowAndroidInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Prompt Notification Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[99990] animate-bounce-once">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl rounded-2xl p-4 text-white relative overflow-hidden">
          {/* Top subtle glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            title="بستن"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3 mt-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center">
              <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
            </div>

            <div className="flex-1 pr-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
                <Smartphone size={16} className="text-amber-400" />
                <span>نصب اپلیکیشن دالتون بات</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                پنل مدیریت را به برنامه‌های گوشی خود اضافه کنید تا با سرعت بیشتر و بدون نیاز به مرورگر استفاده کنید.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  <span>{isIOS ? "راهنمای نصب" : "نصب مستقیم برنامه"}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition-colors"
                >
                  بعداً
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Setup Dialog */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                setShowBanner(false);
              }}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg text-amber-300">نصب در سیستم‌عامل آیفون (iOS)</h3>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۱
                </span>
                <span>در پایین مرورگر Safari روی دکمه <b>اشتراک‌گذاری (Share)</b> <Share size={14} className="inline mx-1 text-blue-400" /> بزنید.</span>
              </li>
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۲
                </span>
                <span>منو را به پایین بکشید و گزینه <b>Add to Home Screen</b> را انتخاب کنید.</span>
              </li>
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۳
                </span>
                <span>در بالا سمت راست روی گزینه <b>Add</b> کلیک کنید.</span>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                setShowBanner(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      {/* Android & Desktop Setup Dialog */}
      {showAndroidInstructions && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowAndroidInstructions(false);
                setShowBanner(false);
              }}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg text-amber-300">راهنمای نصب برنامه (اندروید و کامپیوتر)</h3>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۱
                </span>
                <span>در بالای صفحه (یا پایین) مرورگر روی <b>دکمه سه نقطه (منو)</b> بزنید.</span>
              </li>
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۲
                </span>
                <span>گزینه <b>Install App</b> یا <b>Add to Home Screen</b> (افزودن به صفحه اصلی) را انتخاب کنید.</span>
              </li>
              <li className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  ۳
                </span>
                <span>سپس روی دکمه‌ی تایید یا <b>Install</b> بزنید تا برنامه روی دستگاه شما نصب شود.</span>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowAndroidInstructions(false);
                setShowBanner(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
