import React, { useState, useEffect } from "react";
import { PanelSettings, ConfigDeliveryMode } from "../types";
import { translateText, Language } from "../lang/locales";
import {
  Send,
  Layers,
  Link as LinkIcon,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
  QrCode,
  Eye,
  Copy,
  CheckCircle2,
  FileText,
  Sliders,
  HelpCircle,
  Smartphone,
  Info
} from "lucide-react";

interface ConfigDeliverySettingsProps {
  settings: PanelSettings;
  onSaveSettings: (newSettings: PanelSettings) => void;
  lang: Language;
}

const SEPARATOR_PRESETS = [
  { label: "🔸 الماس نارنجی (استاندارد)", value: "🔸━━━━━━━━━━━━━━━━━━🔸" },
  { label: "⚡️ صاعقه نئون", value: "⚡️ ────────────── ⚡️" },
  { label: "✨ ستاره درخشان", value: "✨➖➖➖➖➖➖➖➖✨" },
  { label: "💎 الماس کریستال", value: "💎 ════════════════ 💎" },
  { label: "🌐 شبکه جهانی", value: "🌐 ••••••••••••••••• 🌐" },
  { label: "🚀 راکت پرسرعت", value: "🚀 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 🚀" },
  { label: "🔥 آتش کلاسیک", value: "🔥 ---------------- 🔥" },
  { label: "✂️ خط برش", value: "✂️ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✂️" },
];

export default function ConfigDeliverySettings({
  settings,
  onSaveSettings,
  lang,
}: ConfigDeliverySettingsProps) {
  const [deliveryMode, setDeliveryMode] = useState<ConfigDeliveryMode>(
    settings.configDeliveryMode || "both"
  );
  const [headerText, setHeaderText] = useState<string>(
    settings.configDeliveryHeader || "🎉 <b>خرید شما با موفقیت انجام شد!</b>"
  );
  const [subText, setSubText] = useState<string>(
    settings.configDeliverySubText ||
      "👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>"
  );
  const [directText, setDirectText] = useState<string>(
    settings.configDeliveryDirectText || "🚀 <b>لینک‌های اتصال مستقیم:</b>"
  );
  const [separator, setSeparator] = useState<string>(
    settings.configDeliverySeparator || "🔸━━━━━━━━━━━━━━━━━━🔸"
  );
  const [footerText, setFooterText] = useState<string>(
    settings.configDeliveryFooter ||
      "💡 لینک سابسکریپشن را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان Subscription وارد کرده و بروزرسانی نمایید."
  );
  const [showQr, setShowQr] = useState<boolean>(
    settings.configDeliveryShowQr !== false
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.configDeliveryMode) setDeliveryMode(settings.configDeliveryMode);
      if (settings.configDeliveryHeader) setHeaderText(settings.configDeliveryHeader);
      if (settings.configDeliverySubText) setSubText(settings.configDeliverySubText);
      if (settings.configDeliveryDirectText) setDirectText(settings.configDeliveryDirectText);
      if (settings.configDeliverySeparator) setSeparator(settings.configDeliverySeparator);
      if (settings.configDeliveryFooter !== undefined) setFooterText(settings.configDeliveryFooter);
      if (settings.configDeliveryShowQr !== undefined) setShowQr(settings.configDeliveryShowQr);
    }
  }, [settings]);

  const handleSave = () => {
    const updatedSettings: PanelSettings = {
      ...settings,
      configDeliveryMode: deliveryMode,
      configDeliveryHeader: headerText.trim(),
      configDeliverySubText: subText.trim(),
      configDeliveryDirectText: directText.trim(),
      configDeliverySeparator: separator.trim() || "🔸━━━━━━━━━━━━━━━━━━🔸",
      configDeliveryFooter: footerText.trim(),
      configDeliveryShowQr: showQr,
    };
    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setDeliveryMode("both");
    setHeaderText("🎉 <b>خرید شما با موفقیت انجام شد!</b>");
    setSubText(
      "👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>"
    );
    setDirectText("🚀 <b>لینک‌های اتصال مستقیم:</b>");
    setSeparator("🔸━━━━━━━━━━━━━━━━━━🔸");
    setFooterText(
      "💡 لینک سابسکریپشن را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان Subscription وارد کرده و بروزرسانی نمایید."
    );
    setShowQr(true);
  };

  // Sample Mock Data for Preview
  const sampleSubLink = "https://sub.daltoon.app/api/v1/client/sub/9fa8e734c21?token=daltoon_vip";
  const sampleDirectLinks = [
    "vless://9fa8e734-c21a-4d22-9218-bb7189a81882@ir-mci.daltoon.net:2052?security=none&type=ws&path=%2Fdaltoon-vless#IR-MCI-Direct-VLESS+%F0%9F%9A%80",
    "vmess://eyJ2IjoiMiIsInBzIjoiSVItTVROLVR1bm5lbC1WTUVTUyDiqoEiLCJhZGQiOiJpci1tdG4uZGFsdG9vbi5uZXQiLCJwb3J0IjoiMjA4MiIsInR5cGUiOiJ3cyIsImhvc3QiOiJpcm10bi5hcHAiLCJwYXRoIjoiL2RhbHRvb24tdm1lc3MiLCJzY3kiOiJhdXRvIn0=",
    "trojan://9fa8e734-c21a-4d22-9218-bb7189a81882@mci-vip.daltoon.net:443?security=tls&sni=mci-vip.daltoon.net&type=tcp#MCI-VIP-Trojan+%F0%9F%92%8E",
  ];

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, "");
  };

  const cleanSep = separator.trim() || "🔸━━━━━━━━━━━━━━━━━━🔸";

  const handleCopyPreviewText = () => {
    let text = `${stripHtml(headerText)}\n\n`;
    text += `🛒 اشتراک: VIP 1 Month\n👤 شناسه: user_vip_123\n⏳ انقضا: ۳۰ روز (تا ۱۴۰۵/۰۶/۲۵)\n💬 حجم بسته: ۵۰ گیگابایت\n\n`;

    if (deliveryMode === "both" || deliveryMode === "subscription_only") {
      text += `${stripHtml(subText)}\n\n${sampleSubLink}\n\n`;
    }

    if (deliveryMode === "both" || deliveryMode === "direct_only") {
      text += `${stripHtml(directText)}\n`;
      text += sampleDirectLinks.join(`\n\n${cleanSep}\n\n`);
      text += "\n\n";
    }

    if (footerText.trim()) {
      text += `━━━━━━━━━━━━━━━━━━\n${stripHtml(footerText)}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] p-5 sm:p-6 rounded-2xl space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 rounded-xl shadow-inner">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              {translateText("Config Delivery & Output Format", "قالب و نحوه تحویل کانفیگ به مشتری", lang)}
              <span className="bg-purple-500/10 text-purple-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-500/20">
                Delivery Format
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              {translateText(
                "Configure how generated VPN configs, subscription links, separators, and instructions are presented to users in the Telegram bot.",
                "نحوه چینش و ارسال لینک‌های سابسکریپشن، کانفیگ‌های مستقیم، شکلک جداکننده و متون راهنما هنگام خرید یا تحویل سرویس در ربات تلگرام را مدیریت کنید.",
                lang
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1f2937]/80 hover:bg-[#1f2937] text-gray-300 text-xs font-semibold rounded-xl border border-gray-700/60 transition-colors cursor-pointer"
            title={translateText("Reset to default templates", "بازگردانی به قالب‌های پیش‌فرض", lang)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{translateText("Defaults", "پیش‌فرض‌ها", lang)}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200">{translateText("Saved!", "ذخیره شد!", lang)}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{translateText("Save Settings", "ذخیره تنظیمات تحویل", lang)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left/Top is Options & Form, Right/Bottom is Live Telegram Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Mode Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 3: Both (Recommended) */}
              <button
                type="button"
                onClick={() => setDeliveryMode("both")}
                className={`relative p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                  deliveryMode === "both"
                    ? "bg-purple-600/15 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40"
                    : "bg-[#161f30] border-gray-800 hover:border-gray-700 hover:bg-[#1a253a]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      deliveryMode === "both"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      deliveryMode === "both"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {translateText("Recommended", "پیش‌فرض و کامل", lang)}
                  </span>
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      deliveryMode === "both" ? "text-purple-200" : "text-gray-300"
                    }`}
                  >
                    {translateText("Both Links (Sub + Direct)", "سابسکریپشن + مستقیم", lang)}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    {translateText(
                      "Delivers smart subscription link along with all direct vless/vmess configs.",
                      "ارسال همزمان لینک سابسکریپشن و تمام کانفیگ‌های تفکیکی مستقیم با جداکننده",
                      lang
                    )}
                  </p>
                </div>
                {deliveryMode === "both" && (
                  <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                )}
              </button>

              {/* Option 1: Subscription Only */}
              <button
                type="button"
                onClick={() => setDeliveryMode("subscription_only")}
                className={`relative p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                  deliveryMode === "subscription_only"
                    ? "bg-indigo-600/15 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40"
                    : "bg-[#161f30] border-gray-800 hover:border-gray-700 hover:bg-[#1a253a]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      deliveryMode === "subscription_only"
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      deliveryMode === "subscription_only"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {translateText("Clean & Light", "سبک و ساده", lang)}
                  </span>
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      deliveryMode === "subscription_only"
                        ? "text-indigo-200"
                        : "text-gray-300"
                    }`}
                  >
                    {translateText("Subscription Only", "فقط لینک سابسکریپشن", lang)}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    {translateText(
                      "Sends only the dedicated subscription link with QR code & quick copy button.",
                      "ارسال صرفاً لینک سابسکریپشن هوشمند همراه دکمه کپی و بارکد اختصاصی",
                      lang
                    )}
                  </p>
                </div>
              </button>

              {/* Option 2: Direct Links Only */}
              <button
                type="button"
                onClick={() => setDeliveryMode("direct_only")}
                className={`relative p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                  deliveryMode === "direct_only"
                    ? "bg-amber-600/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40"
                    : "bg-[#161f30] border-gray-800 hover:border-gray-700 hover:bg-[#1a253a]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      deliveryMode === "direct_only"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      deliveryMode === "direct_only"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {translateText("Direct Configs", "اتصال مستقیم", lang)}
                  </span>
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      deliveryMode === "direct_only" ? "text-amber-200" : "text-gray-300"
                    }`}
                  >
                    {translateText("Direct Links Only", "فقط لینک‌های معمولی", lang)}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    {translateText(
                      "Sends all individual config links separated by your custom emoji divider.",
                      "ارسال تک‌تک کانفیگ‌های تفکیکی استخراج شده سرور بدون لینک سابسکریپشن",
                      lang
                    )}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Customizable Text Templates */}
          <div className="space-y-4 pt-2 border-t border-gray-800/80">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              {translateText("Custom Message Texts & Dividers", "ویرایش متون ارسالی و شکلک بین کانفیگ‌ها", lang)}
            </h4>

            {/* Header / Title */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                {translateText("Delivery Message Header / Title", "متن سربرگ و تبریک خرید", lang)}
              </label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="🎉 <b>خرید شما با موفقیت انجام شد!</b>"
                className="w-full bg-[#161f30] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 font-sans"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                {translateText("Supports HTML tags like <b>bold</b>, <code>code</code>, <i>italic</i>.", "پشتیبانی از تگ‌های HTML نظیر <b>پررنگ</b>، <code>کد</code> و ...", lang)}
              </p>
            </div>

            {/* Subscription Section Label (if enabled) */}
            {(deliveryMode === "both" || deliveryMode === "subscription_only") && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                  {translateText("Subscription Section Label", "متن بالای لینک سابسکریپشن", lang)}
                </label>
                <input
                  type="text"
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  placeholder="👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید:</b>"
                  className="w-full bg-[#161f30] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            )}

            {/* Direct Links Section Label (if enabled) */}
            {(deliveryMode === "both" || deliveryMode === "direct_only") && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                  {translateText("Direct Configs Section Label", "متن بالای کانفیگ‌های مستقیم", lang)}
                </label>
                <input
                  type="text"
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  placeholder="🚀 <b>لینک‌های اتصال مستقیم:</b>"
                  className="w-full bg-[#161f30] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            )}

            {/* Separator / Emoji between configs (if direct configs enabled) */}
            {(deliveryMode === "both" || deliveryMode === "direct_only") && (
              <div className="space-y-2 bg-[#161f30]/60 p-3.5 rounded-xl border border-gray-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {translateText("Separator Emoji / Divider Between Configs", "شکلک یا خط جداکننده بین کانفیگ‌ها", lang)}
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {translateText("Customizable", "قابل شخصی‌سازی کامل", lang)}
                  </span>
                </div>

                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="🔸━━━━━━━━━━━━━━━━━━🔸"
                  className="w-full bg-[#0f172a] border border-gray-750 rounded-xl p-2.5 text-xs text-amber-300 font-mono text-center placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
                />

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1.5">
                    {translateText("Quick preset styles (click to apply):", "قالب‌ها و شکلک‌های آماده (جهت انتخاب کلیک کنید):", lang)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SEPARATOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSeparator(preset.value)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                          separator === preset.value
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                            : "bg-gray-800/80 hover:bg-gray-700 text-gray-300 border-gray-700/60"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer / Instructions Text */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
                {translateText("Footer Guidance Note (Optional)", "متن پاورقی و راهنمای تکمیلی مشتری (اختیاری)", lang)}
              </label>
              <textarea
                rows={2}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="💡 لینک سابسکریپشن را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان Subscription وارد کرده و بروزرسانی نمایید."
                className="w-full bg-[#161f30] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* QR Code Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#161f30]/60 rounded-xl border border-gray-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    {translateText("Send QR Code Image", "ارسال تصویر QR Code بارکد هوشمند", lang)}
                  </h5>
                  <p className="text-[10px] text-gray-400 font-sans">
                    {translateText("Generates and attaches a scannable QR code along with the message.", "ارسال بارکد جهت اسکن سریع در نرم‌افزارهای موبایل و کامپیوتر", lang)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
                  showQr
                    ? "bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                    : "bg-slate-800"
                }`}
                style={{ direction: "ltr" }}
              >
                <div
                  className="absolute flex items-center justify-center h-4 w-4 rounded-full bg-white transition-all duration-300 ease-in-out"
                  style={{
                    left: showQr ? "22px" : "2px",
                    top: "2px",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Telegram Preview Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-400" />
              {translateText("Live Telegram Preview", "پیش‌نمایش زنده در تلگرام", lang)}
            </span>

            <button
              type="button"
              onClick={handleCopyPreviewText}
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {copiedPreview ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">{translateText("Copied", "کپی شد", lang)}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{translateText("Copy Text", "کپی متن", lang)}</span>
                </>
              )}
            </button>
          </div>

          {/* Telegram Phone Simulator Container */}
          <div className="bg-[#0b141d] rounded-3xl border border-gray-800 p-3 sm:p-4 shadow-2xl space-y-3 relative overflow-hidden">
            {/* Simulated Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5 text-gray-400 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-white text-xs">
                    <span>{settings.botNickname || "Daltoon Bot"}</span>
                    <span className="text-[10px] text-blue-400">✓</span>
                  </div>
                  <span className="text-[9px] text-gray-400">bot</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-mono">14:02</div>
            </div>

            {/* QR Code Banner in Preview if active */}
            {showQr && (
              <div className="bg-[#182533] p-3 rounded-2xl border border-gray-700/60 flex flex-col items-center justify-center text-center space-y-1.5 shadow-inner">
                <div className="w-24 h-24 bg-white p-2 rounded-xl shadow flex items-center justify-center">
                  {/* Mock QR visual */}
                  <div className="w-full h-full border-2 border-dashed border-gray-900 flex flex-col items-center justify-center text-[9px] font-mono text-gray-800 font-bold leading-tight">
                    <QrCode className="w-12 h-12 text-slate-900" />
                    <span>QR PREVIEW</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-300 font-medium font-sans">
                  {translateText("📸 Scan with phone camera or v2ray client", "📸 اسکن مستقیم با دوربین یا نرم‌افزار", lang)}
                </span>
              </div>
            )}

            {/* Telegram Message Bubble */}
            <div className="bg-[#182533] text-gray-100 p-3.5 rounded-2xl rounded-tr-sm border border-gray-700/40 text-xs leading-relaxed space-y-3 font-sans shadow-lg">
              {/* Header Title */}
              <div
                className="font-bold text-sm text-purple-300 leading-snug"
                dangerouslySetInnerHTML={{ __html: headerText || "🎉 <b>خرید شما با موفقیت انجام شد!</b>" }}
              />

              {/* Service Info Block */}
              <div className="bg-[#101924]/80 p-2.5 rounded-xl border border-gray-800/80 space-y-1 text-[11px] text-gray-300 font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-400">🛒 اشتراک:</span>
                  <span className="font-bold text-white">VIP 1 Month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">👤 شناسه:</span>
                  <span className="font-mono text-indigo-300">user_vip_123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">⏳ انقضا:</span>
                  <span className="text-emerald-400 font-bold">۳۰ روز (تا ۱۴۰۵/۰۶/۲۵)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">💬 حجم بسته:</span>
                  <span className="text-amber-400 font-bold">۵۰ گیگابایت</span>
                </div>
              </div>

              {/* Subscription Link Block (If enabled) */}
              {(deliveryMode === "both" || deliveryMode === "subscription_only") && (
                <div className="space-y-1.5">
                  <div
                    className="text-[11px] font-bold text-indigo-300"
                    dangerouslySetInnerHTML={{
                      __html:
                        subText ||
                        "👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>",
                    }}
                  />
                  <div className="bg-[#0f172a] p-2.5 rounded-xl border border-indigo-900/50 font-mono text-[10px] text-indigo-200 break-all select-all leading-tight">
                    <code>{sampleSubLink}</code>
                  </div>
                </div>
              )}

              {/* Direct Config Links Block (If enabled) */}
              {(deliveryMode === "both" || deliveryMode === "direct_only") && (
                <div className="space-y-2">
                  <div
                    className="text-[11px] font-bold text-amber-300"
                    dangerouslySetInnerHTML={{
                      __html: directText || "🚀 <b>لینک‌های اتصال مستقیم:</b>",
                    }}
                  />
                  <div className="space-y-2">
                    {sampleDirectLinks.map((link, idx) => (
                      <React.Fragment key={idx}>
                        <div className="bg-[#0f172a] p-2.5 rounded-xl border border-gray-800 font-mono text-[9.5px] text-amber-200/90 break-all select-all leading-tight">
                          <code>{link}</code>
                        </div>
                        {idx < sampleDirectLinks.length - 1 && (
                          <div className="text-center font-mono text-[10px] text-amber-400/90 select-none py-0.5">
                            {cleanSep}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Note */}
              {footerText.trim() && (
                <div className="border-t border-gray-700/60 pt-2 text-[10.5px] text-gray-400 font-sans leading-normal">
                  <p>{footerText}</p>
                </div>
              )}
            </div>

            {/* Simulated Telegram Inline Action Buttons */}
            <div className="space-y-1.5 pt-1">
              {(deliveryMode === "both" || deliveryMode === "subscription_only") && (
                <button
                  type="button"
                  className="w-full bg-[#242f3d] hover:bg-[#2c3848] text-blue-400 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>📋 کپی آسان لینک سابسکریپشن (کلیک کنید)</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  className="bg-[#242f3d] hover:bg-[#2c3848] text-blue-400 font-bold text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>🔗 لینک‌های کانفیگ</span>
                </button>
                <button
                  type="button"
                  className="bg-[#242f3d] hover:bg-[#2c3848] text-blue-400 font-bold text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>💡 آموزش‌ها</span>
                </button>
              </div>

              <button
                type="button"
                className="w-full bg-[#242f3d] hover:bg-[#2c3848] text-gray-300 font-semibold text-xs py-1.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <span>🏠 منوی اصلی</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
