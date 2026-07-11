import React, { useState, useEffect, useRef } from "react"; // React hooks
import { PanelSettings, CustomButton, VpnPlan, InboundInfo } from "../types";
import { Language, translations } from "../locales";
import ConfirmationModal from "./ConfirmationModal";
import {
  Settings,
  Key,
  Database,
  CreditCard,
  Lock,
  Save,
  Check,
  FileText,
  Cpu,
  PlusCircle,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Command,
  Send,
  Power,
  Activity,
  RefreshCw,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Film,
  FileUp,
  X,
  Code,
  Brain,
  Globe,
} from "lucide-react";

interface SettingsPanelProps {
  settings: PanelSettings;
  onSaveSettings: (settings: PanelSettings) => void;
  lang: Language;
  customButtons: CustomButton[];
  setCustomButtons: React.Dispatch<React.SetStateAction<CustomButton[]>>;
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  lang,
  customButtons,
  setCustomButtons,
}: SettingsPanelProps) {
  const t = translations[lang];
  // Form state
  const [botToken, setBotToken] = useState(settings.botToken || "");
  const [botNickname, setBotNickname] = useState(settings.botNickname || "");
  const [currency, setCurrency] = useState(settings.currency || "تومان");
  const [ownerId, setOwnerId] = useState(
    settings.ownerId ? settings.ownerId.toString() : "",
  );
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || "");
  const [customAiApiKey, setCustomAiApiKey] = useState(settings.customAiApiKey || "");
  const [aiBaseUrl, setAiBaseUrl] = useState(settings.aiBaseUrl || "");
  const [aiModelName, setAiModelName] = useState(settings.aiModelName || "");
  const [hideBtnAiChat, setHideBtnAiChat] = useState(
    settings.hideBtnAiChat !== undefined ? settings.hideBtnAiChat : true,
  );
  const [btnTextAiChat, setBtnTextAiChat] = useState(
    settings.btnTextAiChat || "🤖 چت با ربات",
  );
  const [simulatorMode, setSimulatorMode] = useState(
    settings.simulatorMode || false,
  );

  const [aiSearchEnabled, setAiSearchEnabled] = useState(
    settings.aiSearchEnabled !== undefined ? settings.aiSearchEnabled : true,
  );
  const [googleSearchApiKey, setGoogleSearchApiKey] = useState(settings.googleSearchApiKey || "");
  const [googleSearchCx, setGoogleSearchCx] = useState(settings.googleSearchCx || "");
  const [braveSearchApiKey, setBraveSearchApiKey] = useState(settings.braveSearchApiKey || "");

  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingCustom, setTestingCustom] = useState(false);
  const [customTestResult, setCustomTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestGeminiKey = async () => {
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      setGeminiTestResult({ success: false, message: lang === "fa" ? "لطفاً ابتدا کلید API جیمینای را وارد کنید." : "Please enter the Gemini API Key first." });
      return;
    }
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const response = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiApiKey, type: "gemini" })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGeminiTestResult({ success: true, message: data.message || "کلید معتبر است!" });
      } else {
        setGeminiTestResult({ success: false, message: data.error || "کلید نامعتبر است." });
      }
    } catch (err: any) {
      setGeminiTestResult({ success: false, message: err.message || "خطا در برقراری ارتباط با سرور." });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestCustomKey = async () => {
    if (!customAiApiKey || customAiApiKey.trim() === "") {
      setCustomTestResult({ success: false, message: lang === "fa" ? "لطفاً ابتدا کلید API هوش مصنوعی را وارد کنید." : "Please enter the AI API Key first." });
      return;
    }
    setTestingCustom(true);
    setCustomTestResult(null);
    try {
      const response = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: customAiApiKey,
          baseUrl: aiBaseUrl,
          modelName: aiModelName,
          type: "custom"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCustomTestResult({ success: true, message: data.message || "کلید معتبر است!" });
      } else {
        setCustomTestResult({ success: false, message: data.error || "کلید نامعتبر است." });
      }
    } catch (err: any) {
      setCustomTestResult({ success: false, message: err.message || "خطا در برقراری ارتباط با سرور." });
    } finally {
      setTestingCustom(false);
    }
  };

  const [purchaseSuccessNote, setPurchaseSuccessNote] = useState(
    settings.purchaseSuccessNote || "",
  );

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{
    isOpen: boolean;
    action: (() => void) | null;
    message: string;
  }>({ isOpen: false, action: null, message: "" });

  // Broadcast text states
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<{
    fileData: string;
    fileName: string;
    fileType: "image" | "video" | "voice" | "file";
  } | null>(null);
  const [captionPosition, setCaptionPosition] = useState<"below" | "above">("below");
  const [activeUploadType, setActiveUploadType] = useState<
    "image" | "video" | "voice" | "file"
  >("file");
  const broadcastAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dashboard credentials, Port, and Admins management
  const [dashboardUsername, setDashboardUsername] = useState(
    settings.dashboardUsername || "Daltoon",
  );
  const [dashboardPassword, setDashboardPassword] = useState(
    settings.dashboardPassword || "Daltoon",
  );
  const [serverPort, setServerPort] = useState<number | string>(
    settings.serverPort || 3000,
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<
    number | string
  >(
    settings.autoRefreshInterval !== undefined
      ? settings.autoRefreshInterval
      : 0,
  );

  const [adminsList, setAdminsList] = useState<
    Array<{
      id: string;
      userId: number;
      username: string;
      role: "admin" | "super_admin";
      createdAt: string;
    }>
  >(() => {
    return settings.admins || [];
  });
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminId, setNewAdminId] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">(
    "admin",
  );

  const handleAddAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminId.trim()) return;

    const added: (typeof adminsList)[0] = {
      id: "adm-" + Date.now(),
      userId: Number(newAdminId) || 0,
      username: newAdminUser.replace("@", "").trim(),
      role: newAdminRole,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const nextAdmins = [...adminsList, added];
    setAdminsList(nextAdmins);
    setNewAdminUser("");
    setNewAdminId("");

    // Auto-save on admin addition
    onSaveSettings({
      ...settings,
      botToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      customAiApiKey,
      aiBaseUrl,
      aiModelName,
      aiSearchEnabled,
      googleSearchApiKey,
      googleSearchCx,
      braveSearchApiKey,
      cardNumber,
      cardHolder: bankOwner,
      bankName,
      cardNumbers,
      welcomeText,
      supportText,
      tgChannel,
      supportHandle,
      hideSupport,
      hideBuy,
      hideProfile,
      hideWallet,
      dashboardUsername,
      dashboardPassword,
      serverPort: Number(serverPort) || 3000,
      autoRefreshInterval: Number(autoRefreshInterval) || 0,
      purchaseSuccessNote,
      purchaseSuccessAttachment: activePurchaseAttachment,
      admins: nextAdmins,
    });
  };

  const handleRemoveAdmin = (id: string) => {
    const nextAdmins = adminsList.filter((adm) => adm.id !== id);
    setAdminsList(nextAdmins);

    // Auto-save on admin removal
    onSaveSettings({
      ...settings,
      botToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      customAiApiKey,
      aiBaseUrl,
      aiModelName,
      aiSearchEnabled,
      googleSearchApiKey,
      googleSearchCx,
      braveSearchApiKey,
      cardNumber,
      cardHolder: bankOwner,
      bankName,
      cardNumbers,
      welcomeText,
      supportText,
      tgChannel,
      supportHandle,
      hideSupport,
      hideBuy,
      hideProfile,
      hideWallet,
      dashboardUsername,
      dashboardPassword,
      serverPort: Number(serverPort) || 3000,
      autoRefreshInterval: Number(autoRefreshInterval) || 0,
      purchaseSuccessNote,
      purchaseSuccessAttachment: activePurchaseAttachment,
      admins: nextAdmins,
    });
  };

  const triggerUpload = (type: "image" | "video" | "voice" | "file") => {
    if (fileInputRef.current) {
      if (type === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (type === "video") {
        fileInputRef.current.accept = "video/*";
      } else if (type === "voice") {
        fileInputRef.current.accept = "audio/*";
      } else {
        fileInputRef.current.accept = "*/*";
      }
      setActiveUploadType(type);
      fileInputRef.current.click();
    }
  };

  const applyFormat = (tag: string) => {
    if (!broadcastAreaRef.current) return;
    const area = broadcastAreaRef.current;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const text = broadcastText;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    if (!selectedText) return;

    let newText = "";
    if (tag === "code")
      newText = `${before}<code>${selectedText}</code>${after}`;
    else if (tag === "bold")
      newText = `${before}<b>${selectedText}</b>${after}`;
    else if (tag === "italic")
      newText = `${before}<i>${selectedText}</i>${after}`;
    else if (tag === "clear") {
      const clean = selectedText.replace(/<[^>]*>/g, "");
      newText = `${before}${clean}${after}`;
    }

    setBroadcastText(newText);
    setTimeout(() => {
      if (broadcastAreaRef.current) {
        broadcastAreaRef.current.focus();
      }
    }, 10);
  };

  const handleSendBroadcast = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!broadcastText.trim() && !activeAttachment) return;
    setIsBroadcasting(true);
    setBroadcastStatus(null);
    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: broadcastText.trim(),
          attachment: activeAttachment,
          captionPosition,
          serverUrl: window.location.origin,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBroadcastStatus({
          type: "success",
          msg:
            lang === "fa"
              ? `📣 پیام همگانی با موفقیت برای تمامی کاربران فعال ارسال شد (${data.count || 0} پیام ارسالی).`
              : `📣 Broadcast message dispatched successfully to all ${data.count || 0} registered users!`,
        });
        setBroadcastText("");
        setActiveAttachment(null);
      } else {
        setBroadcastStatus({
          type: "error",
          msg: data.error || "Failed sending broadcast.",
        });
      }
    } catch (err) {
      setBroadcastStatus({
        type: "error",
        msg: "Failed connecting to server.",
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Custom Bot Configurable fields
  const [cardNumber, setCardNumber] = useState(settings.cardNumber || "");
  const [bankName, setBankName] = useState(settings.bankName || "");
  const [bankOwner, setBankOwner] = useState(settings.cardHolder || "");
  const [cardNumbers, setCardNumbers] = useState<any[]>(() => {
    if (settings.cardNumbers && Array.isArray(settings.cardNumbers) && settings.cardNumbers.length > 0) {
      return settings.cardNumbers;
    }
    if (settings.cardNumber) {
      return [{
        bankName: settings.bankName || "",
        number: settings.cardNumber,
        holder: settings.cardHolder || ""
      }];
    }
    return [{ bankName: "", number: "", holder: "" }];
  });

  useEffect(() => {
    const first = cardNumbers[0] || {};
    setCardNumber(first.number || "");
    setBankName(first.bankName || "");
    setBankOwner(first.holder || "");
  }, [cardNumbers]);

  const handleAddCard = () => {
    setCardNumbers([...cardNumbers, { bankName: "", number: "", holder: "" }]);
  };

  const handleRemoveCard = (index: number) => {
    const updated = cardNumbers.filter((_, idx) => idx !== index);
    if (updated.length === 0) {
      setCardNumbers([{ bankName: "", number: "", holder: "" }]);
    } else {
      setCardNumbers(updated);
    }
  };

  const handleCardFieldChange = (index: number, field: string, value: string) => {
    const updated = cardNumbers.map((c, idx) => {
      if (idx === index) {
        return { ...c, [field]: value };
      }
      return c;
    });
    setCardNumbers(updated);
  };

  const [welcomeText, setWelcomeText] = useState(
    settings.welcomeText ||
      `<b>🛍️ به فروشگاه دالتون بات (Daltoon Bot) خوش آمدید!</b>\n\nبهترین و معتبرترین پلن‌ها و اشتراک‌ها را با تحویل آنی و ضمانت بازگشت وجه تهیه فرمایید.\n\n🆔 شناسه تلگرام شما: <code>{tg_id}</code>\n💰 موجودی کیف پول: <code>{wallet_balance}</code> تومان\n\n👇 لطفا گزینه مورد نظر خود را از منوی زیر انتخاب نمایید:`,
  );

  const [supportText, setSupportText] = useState(
    settings.supportText ||
      `📞 <b>پشتیبانی دالتون بات (Daltoon Bot):</b>\n\nمشتری گرامی! در صورت وجود هرگونه سوال، پیگیری خرید یا پشتیبانی قبل و بعد از فروش در خدمت شما هستیم.\n\n👤 پشتیبانی تلگرام: @example_support\n📢 کانال تلگرام دالتون بات: @example_channel\n\nپاسخگویی فعال: ۲۴ ساعته شبانه‌روز`,
  );

  const [tgChannel, setTgChannel] = useState(
    settings.tgChannel || "@example_channel",
  );
  const [supportHandle, setSupportHandle] = useState(
    settings.supportHandle || "@example_owner",
  );

  const [hideSupport, setHideSupport] = useState(!!settings.hideSupport);
  const [hideBuy, setHideBuy] = useState(!!settings.hideBuy);
  const [hideProfile, setHideProfile] = useState(!!settings.hideProfile);
  const [hideWallet, setHideWallet] = useState(!!settings.hideWallet);

  // Advanced Payment Gateways and Extras
  const [gatewayPlisioWallet, setGatewayPlisioWallet] = useState(
    settings.gatewayPlisioWallet || "",
  );
  const [gatewayNowpaymentsKey, setGatewayNowpaymentsKey] = useState(
    settings.gatewayNowpaymentsKey || "",
  );
  const [gatewayCryptomusKey, setGatewayCryptomusKey] = useState(
    settings.gatewayCryptomusKey || "",
  );
  const [gatewayCryptomusMerchantId, setGatewayCryptomusMerchantId] = useState(
    settings.gatewayCryptomusMerchantId || "",
  );
  const [gatewayHeleketWallet, setGatewayHeleketWallet] = useState(
    settings.gatewayHeleketWallet || "",
  );
  const [gatewayStarsStatus, setGatewayStarsStatus] = useState(
    settings.gatewayStarsStatus !== undefined
      ? settings.gatewayStarsStatus
      : true,
  );
  const [autoWarningConfigBtn, setAutoWarningConfigBtn] = useState(
    settings.autoWarningConfigBtn !== undefined
      ? settings.autoWarningConfigBtn
      : true,
  );
  const [autoWarningNoConnectionBtn, setAutoWarningNoConnectionBtn] = useState(
    settings.autoWarningNoConnectionBtn !== undefined
      ? settings.autoWarningNoConnectionBtn
      : true,
  );
  const [autoWarningFirstConnectionBtn, setAutoWarningFirstConnectionBtn] =
    useState(
      settings.autoWarningFirstConnectionBtn !== undefined
        ? settings.autoWarningFirstConnectionBtn
        : true,
    );

  // Mandatory Join config state
  const [mandatoryJoinActive, setMandatoryJoinActive] = useState(
    settings.mandatoryJoinActive !== undefined
      ? settings.mandatoryJoinActive
      : false,
  );
  
  // Custom QR Code style state variables
  const [qrTemplate, setQrTemplate] = useState(settings.qrTemplate || "");
  const [qrColor, setQrColor] = useState(settings.qrColor || "");
  const [qrLogo, setQrLogo] = useState(settings.qrLogo || "");
  const [mandatoryJoinChannels, setMandatoryJoinChannels] = useState<string[]>(() => {
    if (settings.mandatoryJoinChannels && Array.isArray(settings.mandatoryJoinChannels) && settings.mandatoryJoinChannels.length > 0) {
      return settings.mandatoryJoinChannels;
    }
    if (settings.mandatoryJoinChannel) {
      return [settings.mandatoryJoinChannel];
    }
    return [""];
  });
  const [mandatoryJoinChannel, setMandatoryJoinChannel] = useState(
    settings.mandatoryJoinChannel || "",
  );

  useEffect(() => {
    setMandatoryJoinChannel(mandatoryJoinChannels[0] || "");
  }, [mandatoryJoinChannels]);

  const [mandatoryJoinText, setMandatoryJoinText] = useState(
    settings.mandatoryJoinText ||
      "لطفا جهت استفاده از امکانات ربات ابتدا عضو کانال ما شده و سپس روی گزینه تایید کلیک کنید.",
  );

  // Auto Backup config state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    settings.autoBackupEnabled !== undefined
      ? settings.autoBackupEnabled
      : false,
  );
  const [autoBackupInterval, setAutoBackupInterval] = useState(
    settings.autoBackupInterval || "daily",
  );

  const [activePurchaseAttachment, setActivePurchaseAttachment] = useState<{
    fileData: string;
    fileName: string;
    fileType: "image" | "video" | "voice" | "file";
  } | null>(settings.purchaseSuccessAttachment || null);
  const purchaseAttachmentInputRef = useRef<HTMLInputElement>(null);
  const [activePurchaseUploadType, setActivePurchaseUploadType] = useState<
    "image" | "video" | "voice" | "file"
  >("image");

  const triggerPurchaseUpload = (
    type: "image" | "video" | "voice" | "file",
  ) => {
    if (purchaseAttachmentInputRef.current) {
      if (type === "image")
        purchaseAttachmentInputRef.current.accept = "image/*";
      else if (type === "video")
        purchaseAttachmentInputRef.current.accept = "video/*";
      else if (type === "voice")
        purchaseAttachmentInputRef.current.accept = "audio/*";
      else purchaseAttachmentInputRef.current.accept = "*/*";
      setActivePurchaseUploadType(type);
      purchaseAttachmentInputRef.current.click();
    }
  };

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      botToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      customAiApiKey,
      aiBaseUrl,
      aiModelName,
      aiSearchEnabled,
      googleSearchApiKey,
      googleSearchCx,
      braveSearchApiKey,
      cardNumber,
      cardHolder: bankOwner,
      bankName,
      cardNumbers,
      welcomeText,
      supportText,
      tgChannel,
      supportHandle,
      hideSupport,
      hideBuy,
      hideProfile,
      hideWallet,
      hideBtnAiChat,
      btnTextAiChat,
      dashboardUsername,
      dashboardPassword,
      serverPort: Number(serverPort) || 3000,
      autoRefreshInterval: Number(autoRefreshInterval) || 0,
      purchaseSuccessNote,
      purchaseSuccessAttachment: activePurchaseAttachment,
      simulatorMode,
      admins: adminsList,
      gatewayPlisioWallet,
      gatewayNowpaymentsKey,
      gatewayCryptomusKey,
      gatewayCryptomusMerchantId,
      gatewayHeleketWallet,
      gatewayStarsStatus,
      autoWarningConfigBtn,
      autoWarningNoConnectionBtn,
      autoWarningFirstConnectionBtn,
      mandatoryJoinActive,
      mandatoryJoinChannel,
      mandatoryJoinChannels,
      mandatoryJoinText,
      autoBackupEnabled,
      autoBackupInterval,
      qrTemplate,
      qrColor,
      qrLogo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div id="settings-tab" className="max-w-4xl mx-auto space-y-6">
      {/* Broadcast Message Card */}
      <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          {lang === "fa"
            ? "📣 ارسال اطلاعیه همگانی (برادکست)"
            : "📣 Send Telegram Broadcast Message"}
        </h3>
        <p className="text-xs text-gray-400">
          {lang === "fa"
            ? "متن اطلاعیه، پیام یا بنر تبلیغاتی خود را بنویسید تا مستقیماً به چت تمام اعضای تعامل‌یافته با بازخورد سریع ربات ارسال گردد."
            : "Compose and dispatch an official announcement, discount code, or network status update to all registered Telegram bot users."}
        </p>

        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <textarea
              ref={broadcastAreaRef}
              rows={3}
              placeholder={
                lang === "fa"
                  ? "مثلا: 🚨 به روزرسانی سرورها انجام شد؛ برای دریافت اکانت جدید به پشتیبانی مراجعه فرمایید."
                  : "e.g., Server maintenance completed successfully!"
              }
              className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 font-sans"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
            />
            <div className="flex justify-end gap-1" dir="ltr">
              <button
                type="button"
                onClick={() => applyFormat("bold")}
                title={lang === "fa" ? "ضخیم کردن (Bold)" : "Bold Text"}
                className="p-1 px-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition text-[10px] font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormat("italic")}
                title={lang === "fa" ? "مورب کردن (Italic)" : "Italic Text"}
                className="p-1 px-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition text-[10px] italic font-serif"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormat("code")}
                title={
                  lang === "fa"
                    ? "مونو کردن (کپی با یک کلیک)"
                    : "Apply Mono Format (One-click copy)"
                }
                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 border border-gray-700 transition"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("clear")}
                title={lang === "fa" ? "پاکسازی استایل" : "Clear Format"}
                className="p-1.5 rounded-md bg-gray-800 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 border border-gray-700 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Media Attachment Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-indigo-950/40">
            <div className="flex items-center gap-2" dir="rtl">
              <span className="text-[11px] text-gray-500 ml-1">
                {lang === "fa" ? "افزودن رسانه:" : "Attach media:"}
              </span>

              <button
                type="button"
                onClick={() => triggerUpload("image")}
                title={lang === "fa" ? "ارسال تصویر" : "Upload Image"}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-450 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{lang === "fa" ? "تصویر" : "Image"}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("video")}
                title={lang === "fa" ? "ارسال فیلم/ویدئو" : "Upload Video"}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-455 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === "fa" ? "فیلم/ویدئو" : "Video"}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("voice")}
                title={lang === "fa" ? "ارسال ویس/صوت" : "Upload Voice"}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-460 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === "fa" ? "ویس" : "Voice"}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("file")}
                title={lang === "fa" ? "ارسال فایل/سند" : "Upload File/Doc"}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-465 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "fa" ? "فایل" : "File"}</span>
              </button>
            </div>

            {/* Hidden Input field for robust cross-browser uploads */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setActiveAttachment({
                    fileData: reader.result as string,
                    fileName: file.name,
                    fileType: activeUploadType,
                  });
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Attachment Preview Panel */}
          {activeAttachment && (
            <div
              className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-indigo-500/20 text-xs text-right animate-fadeIn mt-2"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                {activeAttachment.fileType === "image" && (
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-gray-800 bg-gray-950 shrink-0">
                    <img
                      src={activeAttachment.fileData}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {activeAttachment.fileType === "video" && (
                  <div className="w-11 h-11 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/15">
                    <Film className="w-4 h-4" />
                  </div>
                )}
                {activeAttachment.fileType === "voice" && (
                  <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/15">
                    <Mic className="w-4 h-4" />
                  </div>
                )}
                {activeAttachment.fileType === "file" && (
                  <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/15">
                    <Paperclip className="w-4 h-4" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold text-white max-w-[220px] truncate">
                    {activeAttachment.fileName}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 capitalize">
                      {lang === "fa"
                        ? activeAttachment.fileType === "image"
                          ? "تصوير"
                          : activeAttachment.fileType === "video"
                            ? "فیلم/ویدئو"
                            : activeAttachment.fileType === "voice"
                              ? "ویس"
                              : "فایل"
                        : activeAttachment.fileType}
                    </span>
                    <span>
                      {lang === "fa"
                        ? "آماده ارسال..."
                        : "Ready to broadcast..."}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAttachment(null)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition cursor-pointer"
                title={lang === "fa" ? "حذف پیوست" : "Remove Attachment"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Caption Position Selection */}
          {activeAttachment && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-indigo-500/10 text-xs animate-fadeIn mt-2 space-y-2.5" dir="rtl">
              <span className="text-gray-400 font-medium block">
                {lang === "fa" ? "موقعیت نمایش متن همراه رسانه:" : "Text position relative to media:"}
              </span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition">
                  <input
                    type="radio"
                    name="captionPosition"
                    value="below"
                    checked={captionPosition === "below"}
                    onChange={() => setCaptionPosition("below")}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span>{lang === "fa" ? "زیر رسانه (پیش‌فرض)" : "Below media (default)"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition">
                  <input
                    type="radio"
                    name="captionPosition"
                    value="above"
                    checked={captionPosition === "above"}
                    onChange={() => setCaptionPosition("above")}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span>{lang === "fa" ? "بالای رسانه" : "Above media"}</span>
                </label>
              </div>
            </div>
          )}

          {broadcastStatus && (
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed ${
                broadcastStatus.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {broadcastStatus.msg}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSendBroadcast}
              disabled={
                isBroadcasting || (!broadcastText.trim() && !activeAttachment)
              }
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                broadcastText.trim() || activeAttachment
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isBroadcasting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {lang === "fa" ? "در حال ارسال..." : "Broadcasting..."}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {lang === "fa"
                    ? "ارسال پیام به تمامی اعضا"
                    : "Broadcast Message to All"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Support and Smart Assistant Section */}
      <div className="bg-[#111827] border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-indigo-600/10 transition-colors"></div>

        <h3 className="font-display font-medium text-lg text-white flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>
              {lang === "fa"
                ? "🤖 دستیار هوشمند و پشتیبانی هوش مصنوعی"
                : "🤖 Smart AI Support Assistant"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHideBtnAiChat(!hideBtnAiChat)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
              !hideBtnAiChat
                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                : "bg-slate-800"
            }`}
            style={{ direction: "ltr" }}
          >
            <div
              className="absolute flex items-center justify-center h-4 w-4 rounded-full bg-white transition-all duration-300 ease-in-out"
              style={{
                left: !hideBtnAiChat ? "22px" : "2px",
                top: "2px",
                color: !hideBtnAiChat ? "#059669" : "#94a3b8",
              }}
            >
              <Power className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          </button>
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl relative">
          {lang === "fa"
            ? "فعال‌سازی هوش مصنوعی (Gemini) به عنوان پشتیبان ۲۴ ساعته. کاربران می‌توانند سوالات خود را بپرسند و ربات بر اساس تعرفه‌ها و راهنما پاسخ می‌دهد."
            : "Enable Gemini AI as a 24/7 support assistant. Users can chat with the bot, and it answers based on your prices and connection guides."}
        </p>

        {!hideBtnAiChat && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn relative">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {lang === "fa"
                  ? "عنوان دکمه در منوی ربات:"
                  : "Button label in Telegram menu:"}
              </label>
              <input
                type="text"
                className="w-full bg-[#0a0e17] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                value={btnTextAiChat}
                onChange={(e) => setBtnTextAiChat(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {lang === "fa"
                  ? "کلید API جیمینای (Gemini API Key):"
                  : "Gemini API Key:"}
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                className="w-full bg-[#0a0e17] border border-gray-800 rounded-lg p-2.5 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div
                className={`p-2.5 rounded-lg border text-[10px] font-medium flex items-center gap-2 ${
                  geminiApiKey
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    geminiApiKey
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-rose-500"
                  }`}
                ></div>
                {geminiApiKey
                  ? lang === "fa"
                    ? "کلید API جیمینای شناسایی شد."
                    : "Gemini API Key is configured."
                  : lang === "fa"
                    ? "خطا: کلید API ربات (Gemini) ست نشده است."
                    : "Missing Gemini API Secret Key."}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2 mt-2">
              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={testingGemini}
                className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600 disabled:bg-indigo-600/10 text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-500 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingGemini ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {lang === "fa" ? "🔍 بررسی و تست اتصال کلید جیمینای" : "🔍 Test Gemini API Key Connection"}
              </button>

              {geminiTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-medium animate-fadeIn mt-2 leading-relaxed max-w-full overflow-hidden ${
                    geminiTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  }`}
                >
                  <div className="flex items-start gap-1.5 font-semibold flex-wrap break-all break-words max-w-full">
                    <span className="shrink-0">{geminiTestResult.success ? "🟢" : "🔴"}</span>
                    <span className="break-all break-words whitespace-pre-wrap flex-1 min-w-0">{geminiTestResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      <div className="bg-[#111827] border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-display font-medium text-lg text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>
              {lang === "fa"
                ? "📢 عضویت کانال اجباری"
                : "📢 Mandatory Channel Join"}
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setMandatoryJoinActive(!mandatoryJoinActive)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
              mandatoryJoinActive
                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                : "bg-slate-800"
            }`}
            style={{ direction: "ltr" }}
          >
            <div
              className="absolute flex items-center justify-center h-4 w-4 rounded-full bg-white transition-all duration-300 ease-in-out"
              style={{
                left: mandatoryJoinActive ? "22px" : "2px",
                top: "2px",
                color: mandatoryJoinActive ? "#059669" : "#94a3b8",
              }}
            >
              <Power className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          </button>
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed">
          {lang === "fa"
            ? "وقتی این ویژگی فعال باشد، تمامی کاربرانی که وارد ربات تلگرام می‌شوند ابتدا باید در کانال تعیین‌شده عضو شوند تا اجازه استفاده از امکانات ربات را پیدا کنند."
            : "When active, any user starting the bot must be subscribed to the designated Telegram channel to access features."}
        </p>

        {mandatoryJoinActive && (
          <div className="space-y-4 pt-2 animate-fadeIn" dir="rtl">
            {/* Multi-channels List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  {lang === "fa"
                    ? "کانال‌های تلگرام جهت عضویت اجباری (کاربر باید در تمامی آن‌ها عضو شود):"
                    : "Telegram channels for mandatory join (user must join all):"}
                </label>
                <button
                  type="button"
                  onClick={() => setMandatoryJoinChannels([...mandatoryJoinChannels, ""])}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === "fa" ? "افزودن کانال" : "Add Channel"}
                </button>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {mandatoryJoinChannels.map((chan, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-mono">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        className="w-full bg-[#111827] border border-gray-750 hover:border-gray-700 rounded-lg p-2.5 pr-8 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                        placeholder={
                          lang === "fa"
                            ? "@example_channel یا لینک کامل"
                            : "@example_channel or full invite link"
                        }
                        value={chan}
                        onChange={(e) => {
                          const updated = [...mandatoryJoinChannels];
                          updated[idx] = e.target.value;
                          setMandatoryJoinChannels(updated);
                        }}
                      />
                    </div>
                    {mandatoryJoinChannels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setMandatoryJoinChannels(mandatoryJoinChannels.filter((_, i) => i !== idx));
                        }}
                        className="text-red-400 hover:text-red-300 p-2.5 rounded bg-red-950/20 border border-red-900/30 hover:border-red-800 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message payload */}
            <div
              className="space-y-1.5 text-right font-sans"
              dir="rtl"
            >
              <label className="text-xs font-semibold text-gray-300">
                {lang === "fa"
                  ? "متن پیام درخواستی برای عضویت اجباری:"
                  : "Custom message displayed to unsubscribed users:"}
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#111827] border border-gray-750 hover:border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                placeholder={
                  lang === "fa"
                    ? "مثلا: کاربر گرامی، برای استفاده از ربات لطفا ابتدا در کانال رسمی دالتون عضو شوید."
                    : "e.g., Please sub to our channel to unlock the bot's features!"
                }
                value={mandatoryJoinText}
                onChange={(e) => setMandatoryJoinText(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Save button specific to This Action */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1.5"
          >
            {lang === "fa"
              ? "ذخیره تنظیمات عضویت اجباری"
              : "Save Mandatory Join Config"}
          </button>
        </div>
      </div>

      {/* Auto Backup Config */}
      <div className="bg-[#181f2a] border border-[#2d3748] rounded-xl p-5 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full group-hover:bg-blue-400 transition-colors"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-display font-bold text-gray-200">
              {lang === "fa"
                ? "پشتیبان‌گیری خودکار (بکاپ)"
                : "Auto Database Backup"}
            </h3>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
              autoBackupEnabled
                ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.35)]"
                : "bg-slate-800"
            }`}
            style={{ direction: "ltr" }}
          >
            <div
              className="absolute flex items-center justify-center h-4 w-4 rounded-full bg-white transition-all duration-300 ease-in-out"
              style={{
                left: autoBackupEnabled ? "22px" : "2px",
                top: "2px",
                color: autoBackupEnabled ? "#3b82f6" : "#94a3b8",
              }}
            >
              <Power className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {lang === "fa"
            ? "بکاپ‌های دوره‌ای باعث اطمینان خاطر شما از حفظ اطلاعات سیستم می‌شود. فایل بکاپ به تلگرام Owner ارسال می‌گردد."
            : "Periodically backup the Daltoon_Bot.db and send it to the system owner's Telegram account."}
        </p>

        {autoBackupEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn">
            {/* Interval selection */}
            <div className="space-y-1.5 text-right font-sans" dir="rtl">
              <label className="text-xs font-semibold text-gray-300">
                {lang === "fa"
                  ? "دوره زمانی پشتیبان‌گیری:"
                  : "Backup Interval:"}
              </label>
              <select
                className="w-full bg-[#111827] border border-gray-750 hover:border-gray-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-sans"
                value={autoBackupInterval}
                onChange={(e) => setAutoBackupInterval(e.target.value)}
                dir="ltr"
              >
                <option value="hourly">
                  {lang === "fa" ? "ساعتی (Hourly)" : "Hourly"}
                </option>
                <option value="daily">
                  {lang === "fa" ? "روزانه (Daily)" : "Daily"}
                </option>
                <option value="weekly">
                  {lang === "fa" ? "هفتگی (Weekly)" : "Weekly"}
                </option>
                <option value="monthly">
                  {lang === "fa" ? "ماهانه (Monthly)" : "Monthly"}
                </option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1.5"
          >
            {lang === "fa" ? "ذخیره تنظیمات بکاپ" : "Save Backup Settings"}
          </button>
        </div>
      </div>

      {/* QR Code Customization Card */}
      <div id="qr-code-config" className="bg-[#1e293b]/40 border border-slate-700/50 p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <h3 className="font-display font-bold text-gray-200">
            {lang === "fa"
              ? "🎨 شخصی‌سازی و زیباسازی کدهای QR"
              : "🎨 QR Code Customization & Styling"}
          </h3>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {lang === "fa"
            ? "کدهای QR ربات خود را با رنگ برندینگ خود، درج لوگو/واترمارک اختصاصی در مرکز، یا فرمت‌های سفارشی کاملاً دگرگون کنید."
            : "Customize your QR Codes with custom branding colors, watermarks/logos, or use custom generation APIs."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* QR Code Color */}
          <div className="space-y-1.5 text-right font-sans" dir="rtl">
            <label className="text-xs font-semibold text-gray-300">
              {lang === "fa" ? "رنگ کدهای QR (کد هگز):" : "QR Code Color (Hex):"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="#111827 (Leave empty or type 'none' to use JSON template color)"
                className="flex-1 bg-[#111827] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-sans"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                dir="ltr"
              />
              <input
                type="color"
                className="w-10 h-10 bg-[#111827] border border-gray-750 rounded-lg p-1 cursor-pointer"
                value={/^#[0-9A-Fa-f]{6}$/.test(qrColor.startsWith("#") ? qrColor : `#${qrColor}`) ? (qrColor.startsWith("#") ? qrColor : `#${qrColor}`) : "#111827"}
                onChange={(e) => setQrColor(e.target.value)}
                disabled={qrColor.toLowerCase() === "none"}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {lang === "fa" ? "برای استفاده از رنگ قالب JSON کلمه none را بنویسید یا کادر را خالی بگذارید." : "Type 'none' or leave empty to use the JSON template's original color."}
            </p>
          </div>

          {/* QR Code Logo (Watermark) */}
          <div className="space-y-1.5 text-right font-sans" dir="rtl">
            <label className="text-xs font-semibold text-gray-300">
              {lang === "fa" ? "لینک عکس لوگو/واترمارک مرکز:" : "Center Logo/Watermark Image URL:"}
            </label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              className="w-full bg-[#111827] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-sans"
              value={qrLogo}
              onChange={(e) => setQrLogo(e.target.value)}
              dir="ltr"
            />
            <p className="text-[10px] text-gray-500">
              {lang === "fa" ? "لینک آیکون یا لوگویی که مایلید در مرکز کد QR حک شود." : "URL of a transparent PNG icon to be embedded in the center."}
            </p>
          </div>
        </div>

        {/* Custom API Template URL */}
        <div className="space-y-1.5 text-right font-sans pt-1" dir="rtl">
          <label className="text-xs font-semibold text-gray-300">
            {lang === "fa" ? "تمپلیت پیشرفته QR (فرمت JSON یا لینک دلخواه):" : "Advanced QR Template (JSON Config or Custom API URL):"}
          </label>
          <textarea
            placeholder={`{\n  "body": "mosaic",\n  "eye": "frame13",\n  "eyeBall": "ball14",\n  "bodyColor": "#000000"\n}`}
            className="w-full bg-[#111827] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-mono h-24"
            value={qrTemplate}
            onChange={(e) => setQrTemplate(e.target.value)}
            dir="ltr"
          />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {lang === "fa" 
              ? "می‌توانید کدهای JSON ساخته شده توسط qrcode-monkey.com را اینجا قرار دهید تا کدها با ظاهر کاستوم تولید شوند! (همچنین لینک API ساده هم پشتیبانی می‌شود. متغیرها: {text}، {color} و {logo_url})" 
              : "Paste QRCode-Monkey JSON config, or use a custom API URL with placeholders {text}, {color}, {logo_url}."}
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1.5"
          >
            {lang === "fa" ? "ذخیره تنظیمات QR" : "Save QR Settings"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl space-y-4 shadow-sm mb-6">
        <h3 className="font-display font-medium text-lg text-red-400 flex items-center gap-2">
          <Database className="w-5 h-5" />
          {lang === "fa" ? "منطقه خطر و تست" : "Danger Zone & Testing"}
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-xs text-gray-400">
              {lang === "fa"
                ? "حالت شبیه‌ساز: در صورت فعال بودن، اگر اتصال به پنل سنایی قطع باشد، ربات لینک‌های تستی تولید می‌کند."
                : "Simulator Mode: If enabled, the bot will generate mock links when panel connection fails."}
            </p>
            <button
              type="button"
              onClick={() => setSimulatorMode(!simulatorMode)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-2 ${
                simulatorMode
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  : "bg-gray-800 text-gray-500 border-gray-700"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {lang === "fa"
                ? simulatorMode
                  ? "حالت شبیه‌ساز: روشن"
                  : "حالت شبیه‌ساز: خاموش"
                : `Simulator: ${simulatorMode ? "ON" : "OFF"}`}
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-xs text-gray-400">
              {lang === "fa"
                ? "حذف کامل تمامی اطلاعات کاربران، تراکنش‌ها و تنظیمات. سیستم به حالت اولیه باز می‌گردد."
                : "Wipe all users, transactions, plans, and settings. This will re-initialize the system."}
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmConfig({
                  isOpen: true,
                  message:
                    lang === "fa"
                      ? "آیا از حذف کامل دیتابیس و ریست کردن تمامی اطلاعات اطمینان دارید؟ تمامی تنظیمات، پلن‌ها و کاربران حذف خواهند شد."
                      : "Are you sure you want to completely wipe the database? This will delete all users, plans, and settings.",
                  action: async () => {
                    try {
                      const res = await fetch("/api/database/wipe-all", {
                        method: "POST",
                      });
                      if (res.ok) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error("Failed to wipe database.");
                    }
                  },
                });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 transition cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {lang === "fa"
                ? "حذف کامل دیتابیس و تنظیمات"
                : "Full Database Wipe"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Telegram Bot Details */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            {t.botSettingsTitle}
          </h3>
          <p className="text-xs text-gray-400">{t.botSettingsDesc}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {t.botTokenLabel}
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "نام فروشگاه / ربات (جهت نمایش)"
                  : "Store Name / Bot Nickname"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa" ? "مثال: دالتون استور" : "e.g. Daltoon Store"
                }
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm w-full text-white font-medium focus:ring-1 focus:ring-indigo-500"
                value={botNickname}
                onChange={(e) => setBotNickname(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {lang === "fa"
                  ? "این نام در پیام‌های ربات (مثل خوش‌آمدگویی یا خرید) جایگزین متغیر {nickname} می‌شود."
                  : "This name replaces the {nickname} variable in bot messages."}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "واحد پول سیستم و ربات (Currency)"
                  : "System & Bot Currency"}
              </label>
              <input
                type="text"
                required
                placeholder={lang === "fa" ? "مثال: تومان، ریال، USD, TL" : "e.g. Toman, USD, TL"}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-medium focus:ring-1 focus:ring-indigo-500"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {lang === "fa"
                  ? "تمام مبالغ، فاکتورها، گزارش‌های درآمد و شبیه‌سازهای ربات با این واحد پول پردازش و نمایش داده می‌شوند."
                  : "All amounts, invoices, revenue metrics, and bot simulators will use and display this currency."}
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {t.ownerAdminIdLabel}
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-indigo-500 font-mono"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "📢 آیدی کانال تلگرام (مثال: @example_channel)"
                  : "📢 Telegram Channel ID (e.g., @example_channel)"}
              </label>
              <input
                type="text"
                placeholder="@example_channel"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={tgChannel}
                onChange={(e) => setTgChannel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "👤 آیدی پشتیبان فنی تلگرام (مثال: @example_owner)"
                  : "👤 Technical Support Handle (e.g., @example_owner)"}
              </label>
              <input
                type="text"
                placeholder="@example_owner"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={supportHandle}
                onChange={(e) => setSupportHandle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {t.webhookStatusLabel}
              </label>
              <div className="flex items-center gap-2 bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-emerald-400 font-semibold font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {lang === "fa" ? "فعال و آنلاین" : "Active / Online"}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Power className="w-4 h-4 text-indigo-400" />
                    {lang === "fa"
                      ? "هشدار خودکار اتمام حجم/زمان"
                      : "Auto Usage/Time Warning"}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "fa"
                      ? "ربات به صورت خودکار در صورتی که کمتر از ۱ گیگابایت یا ۱ روز از طرح کاربر باقی مانده باشد، پیامی جهت تمدید ارسال خواهد کرد."
                      : "Bot automatically alerts users when less than 1 GB or 1 Day of their plan remains."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoWarningConfigBtn(!autoWarningConfigBtn)}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-350 ease-in-out focus:outline-none items-center ${
                    autoWarningConfigBtn
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-400"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  style={{ direction: "ltr" }}
                >
                  <div
                    className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ml-0.5 ${
                      autoWarningConfigBtn
                        ? "translate-x-[24px] text-emerald-600"
                        : "translate-x-0 text-slate-400"
                    }`}
                  >
                    <Power className="w-3 h-3 stroke-[3.0]" />
                  </div>
                </button>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Power className="w-4 h-4 text-indigo-400" />
                    {lang === "fa"
                      ? "اخطار عدم اتصال پس از ۱ روز"
                      : "No Connection Alert (1 Day)"}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "fa"
                      ? "در صورتی که روز بعد از خرید، کاربر هنوز حجمی مصرف نکرده باشد، پیگیری ربات فعال می‌شود."
                      : "Bot will alert the user if they haven't connected 1 day after getting their subscription."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAutoWarningNoConnectionBtn(!autoWarningNoConnectionBtn)
                  }
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-350 ease-in-out focus:outline-none items-center ${
                    autoWarningNoConnectionBtn
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-400"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  style={{ direction: "ltr" }}
                >
                  <div
                    className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ml-0.5 ${
                      autoWarningNoConnectionBtn
                        ? "translate-x-[24px] text-emerald-600"
                        : "translate-x-0 text-slate-400"
                    }`}
                  >
                    <Power className="w-3 h-3 stroke-[3.0]" />
                  </div>
                </button>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Power className="w-4 h-4 text-indigo-400" />
                    {lang === "fa"
                      ? "اطلاع رسانی اولین اتصال"
                      : "First Connection Alert"}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "fa"
                      ? "هنگامی که کاربر برای اولین بار با موفقیت به کانفیگ متصل شود، پیام خوش آمدگویی و لینک اشتراک برای او ارسال می شود."
                      : "When a user connects successfully for the first time, they receive an alert with their sub link."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAutoWarningFirstConnectionBtn(
                      !autoWarningFirstConnectionBtn,
                    )
                  }
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-350 ease-in-out focus:outline-none items-center ${
                    autoWarningFirstConnectionBtn
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-400"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  style={{ direction: "ltr" }}
                >
                  <div
                    className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ml-0.5 ${
                      autoWarningFirstConnectionBtn
                        ? "translate-x-[24px] text-emerald-600"
                        : "translate-x-0 text-slate-400"
                    }`}
                  >
                    <Power className="w-3 h-3 stroke-[3.0]" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Security and Admin Management */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            {lang === "fa"
              ? "امنیت داشبورد و کنترل ادمین‌ها"
              : "Dashboard Security & Admins Control"}
          </h3>
          <p className="text-xs text-gray-400">
            {lang === "fa"
              ? "نام کاربری، رمز عبور ورود، پورت اجرایی سرور و ادمین‌های مجاز بات دالتون را تنظیم نمایید:"
              : "Set dashboard login, server listening port, and registered Telegram bot/dashboard sub-admins:"}
          </p>

          {/* Main Credentials & Port Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-800 pb-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "نام کاربری ورود داشبورد"
                  : "Dashboard Login User"}
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={dashboardUsername}
                onChange={(e) => setDashboardUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "رمز عبور ورود داشبورد"
                  : "Dashboard Login Pass"}
              </label>
              <input
                type="password"
                required
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest leading-loose"
                value={dashboardPassword}
                onChange={(e) => setDashboardPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa" ? "پورت سرور لینوکس" : "Linux Server Port"}
              </label>
              <input
                type="number"
                min="1"
                max="65535"
                required
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={serverPort}
                onChange={(e) =>
                  setServerPort(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {lang === "fa"
                  ? "تغییر پورت پس از اجرای مجدد."
                  : "Requires restart."}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "رفرش خودکار داشبورد (ثانیه)"
                  : "Auto Refresh (Seconds)"}
              </label>
              <input
                type="number"
                min="0"
                max="3600"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={autoRefreshInterval}
                onChange={(e) =>
                  setAutoRefreshInterval(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {lang === "fa" ? "صفر یعنی غیرفعال" : "0 means disabled"}
                {autoRefreshInterval !== "" &&
                  Number(autoRefreshInterval) > 0 &&
                  typeof autoRefreshInterval === "number" && (
                    <span className="text-emerald-400 font-medium block mt-1">
                      {lang === "fa"
                        ? `${Math.floor(autoRefreshInterval / 60) > 0 ? `${Math.floor(autoRefreshInterval / 60)} دقیقه ` : ""}${autoRefreshInterval % 60 > 0 ? `${autoRefreshInterval % 60} ثانیه` : ""}`
                        : `${Math.floor(autoRefreshInterval / 60) > 0 ? `${Math.floor(autoRefreshInterval / 60)} min ` : ""}${autoRefreshInterval % 60 > 0 ? `${autoRefreshInterval % 60} sec` : ""}`}
                    </span>
                  )}
              </span>
            </div>
          </div>

          {/* Admin Management Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-gray-300">
              {lang === "fa"
                ? "👥 مدیریت ادمین‌های بات و دالتون بات"
                : "👥 Manage Bot & Dashboard Admins"}
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Add form */}
              <div className="lg:col-span-5 bg-[#0b101d] border border-gray-800/60 p-4 rounded-xl space-y-3.5">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                  {lang === "fa"
                    ? "👤 ثبت ادمین جدید"
                    : "👤 Register New Admin"}
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                      {lang === "fa"
                        ? "نام کاربری ادمین (بدون @)"
                        : "Admin Username (No @)"}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2 text-xs text-white"
                      placeholder="e.g. general_admin"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                      {lang === "fa"
                        ? "شناسه عددی تلگرام ادمین"
                        : "Telegram User ID"}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                      placeholder="e.g. 504192821"
                      value={newAdminId}
                      onChange={(e) => setNewAdminId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                      {lang === "fa" ? "سطح دسترسی" : "Admin Privilege Role"}
                    </label>
                    <select
                      className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2 text-xs text-white outline-none cursor-pointer"
                      value={newAdminRole}
                      onChange={(e) =>
                        setNewAdminRole(
                          e.target.value as "admin" | "super_admin",
                        )
                      }
                    >
                      <option value="admin">
                        {lang === "fa" ? "ادمین معمولی" : "General Admin"}
                      </option>
                      <option value="super_admin">
                        {lang === "fa" ? "سوپر ادمین" : "Super Admin"}
                      </option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAdmin}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {lang === "fa"
                      ? "افزودن به لیست ادمین‌ها"
                      : "Add to Admins List"}
                  </button>
                </div>
              </div>

              {/* List table */}
              <div className="lg:col-span-7 bg-[#0b101d] border border-gray-800/60 p-4 rounded-xl flex flex-col justify-between max-h-[290px] overflow-y-auto">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 flex justify-between items-center uppercase tracking-wider">
                    <span>
                      {lang === "fa"
                        ? "لیست ادمین‌های فعال"
                        : "Registered Admins List"}
                    </span>
                    <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-mono">
                      {adminsList.length}
                    </span>
                  </span>

                  <div className="space-y-2 mt-2 max-h-[190px] overflow-y-auto no-scrollbar pr-1">
                    {adminsList.map((adm) => (
                      <div
                        key={adm.id}
                        className="bg-[#111827] border border-gray-800/80 p-2.5 rounded-lg flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white flex items-center gap-1">
                            <span>@{adm.username}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-wider uppercase ${
                                adm.role === "super_admin"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"
                              }`}
                            >
                              {adm.role}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            ID: {adm.userId} • {adm.createdAt}
                          </p>
                        </div>

                        {adminsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmConfig({
                                isOpen: true,
                                action: () => handleRemoveAdmin(adm.id),
                                message:
                                  lang === "fa"
                                    ? "آیا از حذف این ادمین اطمینان دارید؟"
                                    : "Are you sure you want to delete this admin?",
                              })
                            }
                            className="text-rose-400 hover:text-white hover:bg-rose-500/15 p-1 rounded transition cursor-pointer shrink-0"
                            title="Remove Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Electronic Payment Gateways */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            {lang === "fa"
              ? "درگاه‌های پرداخت الکترونیک و سرویس‌ها"
              : "Electronic Gateways & Services"}
          </h3>
          <p className="text-xs text-gray-400">
            {lang === "fa"
              ? "مدیریت حرفه‌ای کلیدهای پرداخت ارزی، کریپتو و تنظیمات اتوماسیون (تمامی کلیدها به صورت امن نگهداری می‌شوند)."
              : "Professional management of crypto keys and automation mechanisms."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "آدرس کیف پول Plisio (تتر TRC20/TON)"
                  : "Plisio Wallet Base"}
              </label>
              <input
                type="text"
                placeholder="TXABC..."
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayPlisioWallet}
                onChange={(e) => setGatewayPlisioWallet(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "کد امنیتی NowPayments (API Key)"
                  : "NowPayments API Key"}
              </label>
              <input
                type="text"
                placeholder="NP-xxxxxxxx..."
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayNowpaymentsKey}
                onChange={(e) => setGatewayNowpaymentsKey(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "کد امنیتی Cryptomus (API Key)"
                  : "Cryptomus Key"}
              </label>
              <input
                type="password"
                placeholder="************"
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayCryptomusKey}
                onChange={(e) => setGatewayCryptomusKey(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "نشان تجاری Cryptomus (Merchant ID)"
                  : "Cryptomus Merchant"}
              </label>
              <input
                type="text"
                placeholder="xxxx-xxxx-xxxx"
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayCryptomusMerchantId}
                onChange={(e) => setGatewayCryptomusMerchantId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "درگاه پرداخت Heleket (توکن / آدرس)"
                  : "Heleket Token"}
              </label>
              <input
                type="text"
                placeholder="HK-ABC..."
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayHeleketWallet}
                onChange={(e) => setGatewayHeleketWallet(e.target.value)}
              />
            </div>

            <div className="flex flex-col justify-center space-y-4 pt-2 border-t border-[#1f2937] md:border-t-0 md:pt-0">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-800"
                  checked={gatewayStarsStatus}
                  onChange={(e) => setGatewayStarsStatus(e.target.checked)}
                />
                <span className="text-xs text-gray-300 font-medium font-sans">
                  {lang === "fa"
                    ? "پشتیبانی از درگاه Telegram Stars (ستاره‌های تلگرام)"
                    : "Enable Gateway: Telegram Stars"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card instruction parameters */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              {t.cardPaymentTitle}
            </h3>
            <button
              type="button"
              onClick={handleAddCard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              {lang === "fa" ? "افزودن کارت جدید" : "Add New Card"}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {lang === "fa" 
              ? "می‌توانید یک یا چند کارت بانکی را جهت نمایش در پیام کارت به کارت ربات ثبت نمایید." 
              : "You can register one or multiple bank cards to be displayed in the bot's card-to-card message."}
          </p>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {cardNumbers.map((card, index) => (
              <div 
                key={index} 
                className="bg-[#1f2937]/30 border border-gray-800 p-4 rounded-xl relative space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    {lang === "fa" ? `کارت شماره ${index + 1}` : `Card #${index + 1}`}
                  </span>
                  {cardNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(index)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/20 transition-all"
                      title={lang === "fa" ? "حذف کارت" : "Remove Card"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                      {t.cardNumberLabel}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-sm font-semibold text-white font-mono focus:ring-1 focus:ring-indigo-500"
                      value={card.number || ""}
                      onChange={(e) => handleCardFieldChange(index, "number", e.target.value)}
                      placeholder="6273-8110-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                      {t.bankNameLabel}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                      value={card.bankName || ""}
                      onChange={(e) => handleCardFieldChange(index, "bankName", e.target.value)}
                      placeholder={lang === "fa" ? "مثلا ملی، سامان" : "e.g., Melli, Saman"}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                      {t.holderNameLabel}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                      value={card.holder || ""}
                      onChange={(e) => handleCardFieldChange(index, "holder", e.target.value)}
                      placeholder={lang === "fa" ? "نام و نام خانوادگی صاحب کارت" : "Cardholder full name"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] uppercase font-mono text-gray-500">
              {lang === "fa"
                ? "دیتابیس درگاه محلی: SQLite 'Daltoon_Bot.db'"
                : "Local Cache DB: SQLite 'Daltoon_Bot.db'"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> {t.parametersFlushed}
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              {t.btnSaveConfig}
            </button>
          </div>
        </div>
      </form>

      <ConfirmationModal
        isOpen={deleteConfirmConfig.isOpen}
        message={deleteConfirmConfig.message}
        lang={lang}
        isDangerous={true}
        onCancel={() =>
          setDeleteConfirmConfig({ isOpen: false, action: null, message: "" })
        }
        onConfirm={() => {
          if (deleteConfirmConfig.action) {
            deleteConfirmConfig.action();
          }
          setDeleteConfirmConfig({ isOpen: false, action: null, message: "" });
        }}
      />
    </div>
  );
}
