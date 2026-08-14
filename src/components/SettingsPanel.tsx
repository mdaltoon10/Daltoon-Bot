import { translateText, Language, translations } from "../lang/locales";
import React, { useState, useEffect, useRef } from "react"; // React hooks
import { PanelSettings, CustomButton, VpnPlan, InboundInfo } from "../types";
import ConfirmationModal from "./ConfirmationModal";
import { formatDateTime, COMMON_TIMEZONES, CalendarSystem } from "../utils/dateTimeUtils";
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
  Clock,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  MousePointer,
  Smartphone,
  Search
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
  const t = { ...translations.en, ...translations[lang] };
  // Form state
  const [botToken, setBotToken] = useState(settings.botToken || "");
  const [receiptBotToken, setReceiptBotToken] = useState(settings.receiptBotToken || "");
  const [botNickname, setBotNickname] = useState(settings.botNickname || "");
  const [currency, setCurrency] = useState(settings.currency || "تومان");
  const [ownerId, setOwnerId] = useState(
    settings.ownerId ? settings.ownerId.toString() : "",
  );
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || "");
  const [geminiBaseUrl, setGeminiBaseUrl] = useState(settings.geminiBaseUrl || "");
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

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showRestartAlert, setShowRestartAlert] = useState(false);

  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingCustom, setTestingCustom] = useState(false);
  const [customTestResult, setCustomTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestGeminiKey = async () => {
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      setGeminiTestResult({ success: false, message: translateText("Please enter the Gemini API Key first.", "لطفاً ابتدا کلید API جیمینای را وارد کنید.", lang) });
      return;
    }
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const response = await fetch("/api/ai/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: geminiApiKey, baseUrl: geminiBaseUrl, type: "gemini" })
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
      setCustomTestResult({ success: false, message: translateText("Please enter the AI API Key first.", "لطفاً ابتدا کلید API هوش مصنوعی را وارد کنید.", lang) });
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

  // Broadcast buttons selection state
  interface BroadcastSelectedButton {
    id: string;
    type: "miniapp" | "main" | "custom" | "url";
    text: string;
    url?: string;
    callbackData?: string;
    color?: string;
    index?: number;
    key?: string;
    replyText?: string;
  }
  const [broadcastButtons, setBroadcastButtons] = useState<BroadcastSelectedButton[]>([]);
  const [broadcastButtonLayout, setBroadcastButtonLayout] = useState<"single" | "pair">("single");
  const [buttonSearchQuery, setButtonSearchQuery] = useState("");
  const [adhocUrlButtons, setAdhocUrlButtons] = useState<BroadcastSelectedButton[]>([]);
  const [showAddCustomLinkModal, setShowAddCustomLinkModal] = useState(false);
  const [customLinkLabel, setCustomLinkLabel] = useState("");
  const [customLinkUrl, setCustomLinkUrl] = useState("");

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

  const [domainName, setDomainName] = useState(settings.domainName || "");
  const [sslPublicKeyPath, setSslPublicKeyPath] = useState(settings.sslPublicKeyPath || "");
  const [sslPrivateKeyPath, setSslPrivateKeyPath] = useState(settings.sslPrivateKeyPath || "");
  const [sslAutoRenewal, setSslAutoRenewal] = useState(settings.sslAutoRenewal !== false);
  const [sslStatus, setSslStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [sslMessage, setSslMessage] = useState("");

  useEffect(() => {
    if (settings) {
      if (settings.domainName !== undefined) setDomainName(settings.domainName || "");
      if (settings.sslPublicKeyPath !== undefined) setSslPublicKeyPath(settings.sslPublicKeyPath || "");
      if (settings.sslPrivateKeyPath !== undefined) setSslPrivateKeyPath(settings.sslPrivateKeyPath || "");
      if (settings.dashboardUsername !== undefined) setDashboardUsername(settings.dashboardUsername || "Daltoon");
      if (settings.dashboardPassword !== undefined) setDashboardPassword(settings.dashboardPassword || "Daltoon");
      if (settings.serverPort !== undefined) setServerPort(settings.serverPort || 3000);
      if (settings.sslAutoRenewal !== undefined) setSslAutoRenewal(settings.sslAutoRenewal !== false);
    }
  }, [
    settings?.domainName,
    settings?.sslPublicKeyPath,
    settings?.sslPrivateKeyPath,
    settings?.dashboardUsername,
    settings?.dashboardPassword,
    settings?.serverPort,
    settings?.sslAutoRenewal
  ]);

  const [timeZone, setTimeZone] = useState(settings.timeZone || "Asia/Tehran");
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(
    settings.calendarSystem || "jalali"
  );
  const [currentTimePreview, setCurrentTimePreview] = useState<string>("");

  useEffect(() => {
    const updatePreview = () => {
      setCurrentTimePreview(formatDateTime(new Date(), { timeZone, calendarSystem, includeTime: true }));
    };
    updatePreview();
    const interval = setInterval(updatePreview, 1000);
    return () => clearInterval(interval);
  }, [timeZone, calendarSystem]);

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
      receiptBotToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      geminiBaseUrl,
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
      tgChannel,
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
      timeZone,
      calendarSystem,
    });
  };

  const handleRemoveAdmin = (id: string) => {
    const nextAdmins = adminsList.filter((adm) => adm.id !== id);
    setAdminsList(nextAdmins);

    // Auto-save on admin removal
    onSaveSettings({
      ...settings,
      botToken,
      receiptBotToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      geminiBaseUrl,
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
      tgChannel,
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
          buttons: broadcastButtons,
          buttonLayout: broadcastButtonLayout,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBroadcastStatus({
          type: "success",
          msg:
            translateText("📣 Broadcast message dispatched successfully to all ", "📣 پیام همگانی با موفقیت برای تمامی کاربران فعال ارسال شد (", lang) + (data.count || 0) + translateText(" registered users!", " پیام ارسالی).", lang),
        });
        setBroadcastText("");
        setActiveAttachment(null);
        setBroadcastButtons([]);
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

  
  
  const [tgChannel, setTgChannel] = useState(
    settings.tgChannel || "@example_channel",
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

  // Telegram WebApp / Mini App Mode state
  const [useMiniAppMode, setUseMiniAppMode] = useState(
    !!settings.useMiniAppMode
  );
  const [btnTextMiniApp, setBtnTextMiniApp] = useState(
    settings.btnTextMiniApp || "🚀 ورود به برنامه هوشمند"
  );
  const [miniAppUrl, setMiniAppUrl] = useState(
    settings.miniAppUrl || ""
  );
  const [hideBtnMiniApp, setHideBtnMiniApp] = useState(
    !!settings.hideBtnMiniApp
  );
  const [primaryButtonColors, setPrimaryButtonColors] = useState<Record<string, string>>(
    settings.primaryButtonColors || {}
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
      receiptBotToken,
      botNickname,
      currency,
      ownerId: parseInt(ownerId) || 0,
      geminiApiKey,
      geminiBaseUrl,
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
      tgChannel,
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
      timeZone,
      calendarSystem,
      domainName,
      sslPublicKeyPath,
      sslPrivateKeyPath,
      sslAutoRenewal,
      sslCertificateStatus: (sslPublicKeyPath && sslPrivateKeyPath) ? "active" : "not_configured",
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
      useMiniAppMode,
      btnTextMiniApp,
      miniAppUrl,
      hideBtnMiniApp,
      primaryButtonColors,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentButtonColors = settings.primaryButtonColors || {};

  const allMainBotButtons: BroadcastSelectedButton[] = [
    {
      id: "btnMiniApp",
      key: "btnMiniApp",
      type: "miniapp",
      text: settings.btnTextMiniApp || "📱 ورود به مینی اپ",
      color: currentButtonColors["btnMiniApp"] || "purple",
      url: settings.miniAppUrl || "",
    },
    {
      id: "btnBuyNew",
      key: "btnBuyNew",
      type: "main",
      text: settings.btnTextBuyNew || "🛒 خرید اشتراک جدید",
      callbackData: "mm_btnBuyNew",
      color: currentButtonColors["btnBuyNew"] || "none",
    },
    {
      id: "btnMySubs",
      key: "btnMySubs",
      type: "main",
      text: settings.btnTextMySubs || "🔑 اشتراک‌های من",
      callbackData: "mm_btnMySubs",
      color: currentButtonColors["btnMySubs"] || "none",
    },
    {
      id: "btnWallet",
      key: "btnWallet",
      type: "main",
      text: settings.btnTextWallet || "💳 کیف پول و شارژ",
      callbackData: "mm_btnWallet",
      color: currentButtonColors["btnWallet"] || "none",
    },
    {
      id: "btnTicketSupport",
      key: "btnTicketSupport",
      type: "main",
      text: settings.btnTextTicketSupport || "🎫 پشتیبانی و تیکت",
      callbackData: "mm_btnTicketSupport",
      color: currentButtonColors["btnTicketSupport"] || "none",
    },
    {
      id: "btnSupport",
      key: "btnSupport",
      type: "main",
      text: settings.btnTextSupport || "👨‍💻 پشتیبانی آنلاین",
      callbackData: "mm_btnSupport",
      color: currentButtonColors["btnSupport"] || "none",
    },
    {
      id: "btnReferral",
      key: "btnReferral",
      type: "main",
      text: settings.btnTextReferral || "👥 زیرمجموعه‌گیری",
      callbackData: "mm_btnReferral",
      color: currentButtonColors["btnReferral"] || "none",
    },
    {
      id: "btnGuides",
      key: "btnGuides",
      type: "main",
      text: settings.btnTextGuides || "📚 راهنمای اتصال",
      callbackData: "mm_btnGuides",
      color: currentButtonColors["btnGuides"] || "none",
    },
    {
      id: "btnFreeTest",
      key: "btnFreeTest",
      type: "main",
      text: settings.btnTextFreeTest || "🧪 تست رایگان",
      callbackData: "mm_btnFreeTest",
      color: currentButtonColors["btnFreeTest"] || "none",
    },
    {
      id: "btnColleagues",
      key: "btnColleagues",
      type: "main",
      text: settings.btnTextColleagues || "👔 پنل همکاران",
      callbackData: "mm_btnColleagues",
      color: currentButtonColors["btnColleagues"] || "none",
    },
    {
      id: "btnAiChat",
      key: "btnAiChat",
      type: "main",
      text: settings.btnTextAiChat || "🤖 چت هوشمند",
      callbackData: "mm_btnAiChat",
      color: currentButtonColors["btnAiChat"] || "none",
    },
    {
      id: "btnAddConfig",
      key: "btnAddConfig",
      type: "main",
      text: settings.btnTextAddConfig || "➕ افزودن کانفیگ",
      callbackData: "mm_btnAddConfig",
      color: currentButtonColors["btnAddConfig"] || "none",
    },
    {
      id: "btnConfigDetails",
      key: "btnConfigDetails",
      type: "main",
      text: settings.btnTextConfigDetails || "📊 وضعیت کانفیگ",
      callbackData: "mm_btnConfigDetails",
      color: currentButtonColors["btnConfigDetails"] || "none",
    },
    {
      id: "btnSearchConfig",
      key: "btnSearchConfig",
      type: "main",
      text: settings.btnTextSearchConfig || "🔍 جستجوی کانفیگ",
      callbackData: "mm_btnSearchConfig",
      color: currentButtonColors["btnSearchConfig"] || "none",
    },
  ];

  const allCustomButtons: BroadcastSelectedButton[] = (customButtons || []).map((cb, idx) => ({
    id: `custom_${cb.id || idx}`,
    type: "custom",
    text: cb.text,
    replyText: cb.replyText,
    index: idx,
    url: cb.replyText?.startsWith("http") ? cb.replyText : undefined,
    callbackData: cb.replyText?.startsWith("http") ? undefined : `mm_custom_${idx}`,
    color: cb.replyText?.startsWith("http") ? "primary" : "none",
  }));

  const allDashboardButtons: BroadcastSelectedButton[] = [
    ...allMainBotButtons,
    ...allCustomButtons,
    ...adhocUrlButtons,
  ];

  const filteredDashboardButtons = allDashboardButtons.filter((btn) =>
    btn.text.toLowerCase().includes(buttonSearchQuery.toLowerCase().trim())
  );

  const toggleSelectBroadcastButton = (btn: BroadcastSelectedButton) => {
    setBroadcastButtons((prev) => {
      const exists = prev.some((b) => b.id === btn.id);
      if (exists) {
        return prev.filter((b) => b.id !== btn.id);
      } else {
        return [...prev, btn];
      }
    });
  };

  const getBroadcastButtonColorStyle = (color?: string, isMiniApp?: boolean) => {
    if (isMiniApp || color === "purple") {
      return "bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-indigo-900/90 text-purple-100 border-purple-500/60 shadow-purple-950/50 hover:from-purple-800 hover:to-indigo-800";
    }
    switch (color) {
      case "success":
        return "bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-emerald-950/50 hover:bg-emerald-900";
      case "danger":
        return "bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-rose-950/50 hover:bg-rose-900";
      case "primary":
        return "bg-indigo-950/90 text-indigo-200 border-indigo-500/60 shadow-indigo-950/50 hover:bg-indigo-900";
      case "none":
      default:
        return "bg-slate-900/90 text-slate-200 border-slate-700/80 shadow-slate-950/40 hover:bg-slate-800";
    }
  };

  const getBroadcastButtonBadgeStyle = (color?: string, isMiniApp?: boolean) => {
    if (isMiniApp || color === "purple") return "bg-purple-950/90 text-purple-200 border-purple-500/50";
    switch (color) {
      case "success": return "bg-emerald-950/90 text-emerald-200 border-emerald-500/50";
      case "danger": return "bg-rose-950/90 text-rose-200 border-rose-500/50";
      case "primary": return "bg-indigo-950/90 text-indigo-200 border-indigo-500/50";
      default: return "bg-slate-900 text-slate-300 border-slate-700";
    }
  };

  const getBroadcastButtonBadgeLabel = (color?: string, isMiniApp?: boolean) => {
    if (isMiniApp || color === "purple") return "🟣 بنفش مینی‌اپ";
    switch (color) {
      case "success": return "🟢 سبز";
      case "danger": return "🔴 قرمز";
      case "primary": return "🔵 آبی";
      default: return "⚪ بدون رنگ";
    }
  };

  return (
    <div id="settings-tab" className="max-w-4xl mx-auto space-y-6">
      {/* Broadcast Message Card */}
      <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          {translateText("📣 Send Telegram Broadcast Message", "📣 ارسال اطلاعیه همگانی (برادکست)", lang)}
        </h3>
        <p className="text-xs text-gray-400">
          {translateText("Compose and dispatch an official announcement, discount code, or network status update to all registered Telegram bot users.", "متن اطلاعیه، پیام یا بنر تبلیغاتی خود را بنویسید تا مستقیماً به چت تمام اعضای تعامل‌یافته با بازخورد سریع ربات ارسال گردد.", lang)}
        </p>

        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-medium text-gray-400">
                {translateText("Compose Message Text", "متن پیام اطلاعیه", lang)}
              </span>
            </div>
            <textarea
              ref={broadcastAreaRef}
              rows={3}
              placeholder={
                translateText("e.g., Server maintenance completed successfully!", "مثلا: 🚨 به روزرسانی سرورها انجام شد؛ برای دریافت اکانت جدید به پشتیبانی مراجعه فرمایید.", lang)
              }
              className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 font-sans"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
            />
            <div className="flex justify-end gap-1" dir="ltr">
              <button
                type="button"
                onClick={() => applyFormat("bold")}
                title={translateText("Bold Text", "ضخیم کردن (Bold)", lang)}
                className="p-1 px-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition text-[10px] font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormat("italic")}
                title={translateText("Italic Text", "مورب کردن (Italic)", lang)}
                className="p-1 px-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition text-[10px] italic font-serif"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormat("code")}
                title={
                  translateText("Apply Mono Format (One-click copy)", "مونو کردن (کپی با یک کلیک)", lang)
                }
                className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 border border-gray-700 transition"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("clear")}
                title={translateText("Clear Format", "پاکسازی استایل", lang)}
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
                {t.attachMedia}
              </span>

              <button
                type="button"
                onClick={() => triggerUpload("image")}
                title={translateText("Upload Image", "ارسال تصویر", lang)}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-450 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.mediaImage}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("video")}
                title={translateText("Upload Video", "ارسال فیلم/ویدئو", lang)}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-455 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.mediaVideo}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("voice")}
                title={translateText("Upload Voice", "ارسال ویس/صوت", lang)}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-460 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.mediaVoice}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpload("file")}
                title={translateText("Upload File/Doc", "ارسال فایل/سند", lang)}
                className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-465 text-xs transition cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.mediaFile}</span>
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
                      {translateText(activeAttachment.fileType, activeAttachment.fileType === "image" ? "تصوير" : activeAttachment.fileType === "video" ? "فیلم/ویدئو" : activeAttachment.fileType === "voice" ? "ویس" : "فایل", lang)}
                    </span>
                    <span>
                      {translateText("Ready to broadcast...", "آماده ارسال...", lang)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAttachment(null)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition cursor-pointer"
                title={translateText("Remove Attachment", "حذف پیوست", lang)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Caption Position Selection */}
          {activeAttachment && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-indigo-500/10 text-xs animate-fadeIn mt-2 space-y-2.5" dir="rtl">
              <span className="text-gray-400 font-medium block">
                {translateText("Text position relative to media:", "موقعیت نمایش متن همراه رسانه:", lang)}
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
                  <span>{translateText("Below media (default)", "زیر رسانه (پیش‌فرض)", lang)}</span>
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
                  <span>{translateText("Above media", "بالای رسانه", lang)}</span>
                </label>
              </div>
            </div>
          )}

          {/* 🔘 Bot Buttons Attachment & Selection for Broadcast */}
          <div className="p-4 rounded-xl bg-[#111827] border border-indigo-500/20 space-y-4 animate-fadeIn mt-3" dir="rtl">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs text-white">
                  {translateText("Attach Bot Buttons (Inline Keyboard)", "انتخاب دکمه‌های ربات جهت پیوست زیر پیام", lang)}
                </span>
                {broadcastButtons.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {broadcastButtons.length} {translateText("selected", "دکمه تیک خورده", lang)}
                  </span>
                )}
              </div>

              {/* Button Layout selector (Pair vs Single) */}
              {broadcastButtons.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">چیدمان ارسال:</span>
                  <button
                    type="button"
                    onClick={() => setBroadcastButtonLayout("single")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                      broadcastButtonLayout === "single"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                    }`}
                  >
                    👤 تکی (سطری)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastButtonLayout("pair")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                      broadcastButtonLayout === "pair"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                    }`}
                  >
                    👥 دوتایی (کنارهم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastButtons([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 mr-1 underline cursor-pointer"
                  >
                    حذف تیک همه
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              تمامی دکمه‌های تعریف شده در داشبورد ربات در لیست زیر قرار دارند. دکمه‌هایی که تیک بزنید، دقیقا زیر پیام همگانی در تلگرام ارسال خواهند شد:
            </p>

            {/* 🔍 Search Bar & Quick Select Controls */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی سریع دکمه..."
                  value={buttonSearchQuery}
                  onChange={(e) => setButtonSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastButtons((prev) => {
                      const newButtons = [...prev];
                      filteredDashboardButtons.forEach((btn) => {
                        if (!newButtons.some((b) => b.id === btn.id)) {
                          newButtons.push(btn);
                        }
                      });
                      return newButtons;
                    });
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
                >
                  ✓ تیک زدن همه
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastButtons((prev) =>
                      prev.filter((b) => !filteredDashboardButtons.some((f) => f.id === b.id))
                    );
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition cursor-pointer"
                >
                  ✕ برداشتن تیک
                </button>
              </div>
            </div>

            {/* 📜 SCROLLABLE LIST OF ALL DEFINED BUTTONS */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-gray-950 border border-gray-800 custom-scrollbar">
              {filteredDashboardButtons.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  دکمه‌ای با این مشخصات یافت نشد.
                </div>
              ) : (
                filteredDashboardButtons.map((btn) => {
                  const isSelected = broadcastButtons.some((b) => b.id === btn.id);
                  return (
                    <label
                      key={btn.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-xs select-none ${
                        isSelected
                          ? "bg-indigo-950/70 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30"
                          : "bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectBroadcastButton(btn)}
                          className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer shrink-0"
                        />
                        <span className="font-medium truncate">{btn.text}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Type badge */}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/80">
                          {btn.type === "miniapp"
                            ? "📱 مینی‌اپ"
                            : btn.type === "main"
                            ? "🤖 اصلی"
                            : btn.type === "custom"
                            ? "⚙️ سفارشی"
                            : "🔗 لینک"}
                        </span>
                        {/* Color badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getBroadcastButtonBadgeStyle(
                            btn.color,
                            btn.type === "miniapp"
                          )}`}
                        >
                          {getBroadcastButtonBadgeLabel(btn.color, btn.type === "miniapp")}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* 🔗 Ad-hoc URL Button Creator */}
            <div className="pt-2 border-t border-gray-800/60">
              {!showAddCustomLinkModal ? (
                <button
                  type="button"
                  onClick={() => setShowAddCustomLinkModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>افزودن دکمه لینک اختصاصی جدید به این پیام...</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-gray-950 border border-indigo-500/30 space-y-2.5 animate-fadeIn">
                  <span className="text-xs font-semibold text-indigo-300 block">
                    ساخت دکمه لینک اختصاصی (شیشه‌ای)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="عنوان دکمه (مثلا: 📢 عضویت در کانال)"
                      value={customLinkLabel}
                      onChange={(e) => setCustomLinkLabel(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="لینک مقصد (مثلاً: https://t.me/your_channel)"
                      value={customLinkUrl}
                      onChange={(e) => setCustomLinkUrl(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomLinkModal(false);
                        setCustomLinkLabel("");
                        setCustomLinkUrl("");
                      }}
                      className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs cursor-pointer"
                    >
                      لغو
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customLinkLabel.trim() || !customLinkUrl.trim()) return;
                        const newUrlBtn: BroadcastSelectedButton = {
                          id: `url_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          type: "url",
                          text: customLinkLabel.trim(),
                          url: customLinkUrl.trim(),
                          color: "primary",
                        };
                        setAdhocUrlButtons((prev) => [...prev, newUrlBtn]);
                        setBroadcastButtons((prev) => [...prev, newUrlBtn]);
                        setCustomLinkLabel("");
                        setCustomLinkUrl("");
                        setShowAddCustomLinkModal(false);
                      }}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      افزودن و تیک زدن
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 📱 LIVE TELEGRAM PREVIEW BOX */}
            <div className="mt-4 pt-3 border-t border-indigo-950/60 space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                پیش‌نمایش زنده پیام و دکمه‌های زیرین در تلگرام:
              </span>
              <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-800 space-y-3 max-w-lg mx-auto shadow-xl">
                {/* Sender Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                    🤖
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">
                      {settings.botNickname || "ربات تلگرام"}
                    </div>
                    <div className="text-[9px] text-indigo-400">پیام همگانی (Broadcast)</div>
                  </div>
                </div>

                {/* Media Attachment Preview if any */}
                {activeAttachment && (
                  <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-48 flex items-center justify-center">
                    {activeAttachment.fileType === "image" && (
                      <img
                        src={activeAttachment.fileData}
                        alt="Media Preview"
                        className="max-h-48 w-full object-cover"
                      />
                    )}
                    {activeAttachment.fileType === "video" && (
                      <div className="p-6 text-indigo-400 flex flex-col items-center gap-1">
                        <Film className="w-8 h-8" />
                        <span className="text-[11px]">ویدئوی ضمیمه‌شده</span>
                      </div>
                    )}
                    {activeAttachment.fileType === "voice" && (
                      <div className="p-4 text-emerald-400 flex items-center gap-2">
                        <Mic className="w-6 h-6" />
                        <span className="text-[11px]">ویس صوتی ضمیمه‌شده</span>
                      </div>
                    )}
                    {activeAttachment.fileType === "file" && (
                      <div className="p-4 text-amber-400 flex items-center gap-2">
                        <Paperclip className="w-6 h-6" />
                        <span className="text-[11px]">فایل ضمیمه‌شده</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text */}
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans min-h-[20px]">
                  {broadcastText ? (
                    <span>{broadcastText}</span>
                  ) : (
                    <span className="text-slate-600 italic">متن پیام شما در اینجا قرار خواهد گرفت...</span>
                  )}
                </div>

                {/* Selected Buttons rendered underneath */}
                {broadcastButtons.length > 0 ? (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] text-slate-500 font-medium">دکمه‌های شیشه‌ای زیر پیام:</div>
                    <div className={broadcastButtonLayout === "pair" ? "grid grid-cols-2 gap-1.5" : "flex flex-col gap-1.5"}>
                      {broadcastButtons.map((btn) => (
                        <div
                          key={btn.id}
                          className={`p-2 rounded-xl text-center text-xs font-bold border flex items-center justify-between px-3 shadow-sm transition-all ${getBroadcastButtonColorStyle(
                            btn.color,
                            btn.type === "miniapp"
                          )}`}
                        >
                          <span className="flex-1 text-center truncate">{btn.text}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectBroadcastButton(btn);
                            }}
                            className="w-4 h-4 rounded-full bg-black/40 hover:bg-rose-500 hover:text-white text-slate-400 flex items-center justify-center text-[10px] transition shrink-0 ml-1 cursor-pointer"
                            title="حذف این دکمه"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 text-center py-1 border-t border-slate-800/50">
                    هیچ دکمه‌ای انتخاب نشده است (پیام بدون دکمه ارسال می‌شود).
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  {translateText("Broadcasting...", "در حال ارسال...", lang)}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {t.sendBroadcastBtn}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ Dashboard Security, Admins Control & SSL Certificate Management (TOP OF SETTINGS PAGE) */}
      <div className="bg-[#111827] border border-indigo-500/30 p-5 rounded-xl space-y-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display font-medium text-lg text-white">
              {translateText("Dashboard Security, Admins & SSL Certificate", "امنیّت داشبورد، مدیریت ادمین‌ها و سرتیفیکت SSL", lang)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border ${
              sslPublicKeyPath && sslPrivateKeyPath
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : domainName
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {sslPublicKeyPath && sslPrivateKeyPath
                ? translateText("SSL Active 🔒", "سرتیفیکت فعال 🔒", lang)
                : domainName
                ? translateText("SSL Warning ⚠️", "هشدار سرتیفیکت ⚠️", lang)
                : translateText("No SSL / HTTP", "بدون سرتیفیکت", lang)}
            </span>
          </div>
        </div>

        {/* 1. Main Dashboard Credentials & Port Row */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            {translateText("1. Dashboard Access & Server Credentials", "۱. اطلاعات ورود داشبورد و پورت اجرایی سرور", lang)}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0b101d] border border-gray-800/80 p-4 rounded-xl">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Dashboard Login User", "نام کاربری ورود داشبورد", lang)}
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                value={dashboardUsername}
                onChange={(e) => setDashboardUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Dashboard Login Pass", "رمز عبور ورود داشبورد", lang)}
              </label>
              <input
                type="password"
                required
                className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest"
                value={dashboardPassword}
                onChange={(e) => setDashboardPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Linux Server Port", "پورت سرور لینوکس", lang)}
              </label>
              <input
                type="number"
                min="1"
                max="65535"
                required
                className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={serverPort}
                onChange={(e) =>
                  setServerPort(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {translateText("Requires restart.", "تغییر پورت پس از اجرای مجدد.", lang)}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Auto Refresh (Seconds)", "رفرش خودکار (ثانیه)", lang)}
              </label>
              <input
                type="number"
                min="0"
                max="3600"
                className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={autoRefreshInterval}
                onChange={(e) =>
                  setAutoRefreshInterval(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {translateText("0 means disabled", "صفر یعنی غیرفعال", lang)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SSL Certificate & Domain Settings Box */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              {translateText("2. SSL Certificate & Domain Configuration", "۲. آدرس دامنه و کلیدهای سرتیفیکت SSL", lang)}
            </span>
          </h4>

          {/* Warning banner if domain set but SSL empty */}
          {domainName.trim() !== "" && (!sslPublicKeyPath.trim() || !sslPrivateKeyPath.trim()) && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {translateText("⚠️ SSL Certificate Required for Domain", "⚠️ هشدار عدم وجود سرتیفیکت برای دامنه!", lang)}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                  {translateText(
                    "Domain name is set, but Public/Private SSL key paths are empty! In case of empty certificates, dashboard will fail to load securely. Please populate certificate paths or obtain via script/CLI.",
                    "آدرس دامنه مشخص شده اما کادرهای سرتیفیکت (Public key path و Private key path) خالی هستند! در صورت خالی بودن سرتیفیکت، داشبورد با دامنه بالا نمی‌آید و ارور می‌دهد. لطفاً کادرها را پر کنید یا از کلید سرور استفاده نمایید.",
                    lang
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0b101d] border border-gray-800/80 p-4 rounded-xl">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                {translateText("Domain Name", "آدرس دامنه (Domain Name)", lang)}
              </label>
              <input
                type="text"
                placeholder="e.g. panel.example.com"
                className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {translateText("e.g. sub.domain.com", "مثال: sub.domain.com", lang)}
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {translateText("Public key path", "Public key path (کلید عمومی)", lang)}
              </label>
              <input
                type="text"
                placeholder="/etc/letsencrypt/live/domain/fullchain.pem"
                className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-300 font-mono"
                value={sslPublicKeyPath}
                onChange={(e) => setSslPublicKeyPath(e.target.value)}
              />
              <span className="text-[10px] text-gray-500 mt-1 block font-mono">
                fullchain.pem
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                {translateText("Private key path", "Private key path (کلید اختصاصی)", lang)}
              </label>
              <input
                type="text"
                placeholder="/etc/letsencrypt/live/domain/privkey.pem"
                className="w-full bg-[#13192e] border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-300 font-mono"
                value={sslPrivateKeyPath}
                onChange={(e) => setSslPrivateKeyPath(e.target.value)}
              />
              <span className="text-[10px] text-gray-500 mt-1 block font-mono">
                privkey.pem
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-[#0b101d] border border-gray-800/80 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-2 justify-end">
              {sslStatus !== "idle" && (
                <span className={`text-[11px] font-bold px-2 py-1 rounded ${sslStatus === "success" ? "text-emerald-400 bg-emerald-500/10" : sslStatus === "error" ? "text-rose-400 bg-rose-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                  {sslMessage}
                </span>
              )}
              <button
                type="button"
                onClick={async () => {
                  setSslStatus("verifying");
                  setSslMessage(lang === "fa" ? "در حال بررسی..." : "Verifying...");
                  try {
                    const res = await fetch("/api/settings/verify-ssl", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        domain: domainName,
                        pubKey: sslPublicKeyPath,
                        privKey: sslPrivateKeyPath
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setSslStatus("success");
                      setSslMessage(lang === "fa" ? "با موفقیت ذخیره شد" : "Saved successfully");
                      onSaveSettings({
                        ...settings,
                        domainName,
                        sslPublicKeyPath,
                        sslPrivateKeyPath
                      });
                    } else {
                      setSslStatus("error");
                      setSslMessage(lang === "fa" ? "اشتباه است" : "Incorrect configuration");
                    }
                  } catch (err) {
                    setSslStatus("error");
                    setSslMessage("Network Error");
                  }
                }}
                disabled={sslStatus === "verifying"}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {translateText("Save", "ذخیره", lang)}
              </button>

              <button
                type="button"
                onClick={() => setShowRestartConfirm(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                {translateText("Restart", "ریستارت", lang)}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Admin Management Section */}
        <div className="space-y-4 pt-2 border-t border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300">
            {translateText("👥 Manage Bot & Dashboard Admins", "👥 مدیریت ادمین‌های بات و دالتون بات", lang)}
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Add form */}
            <div className="lg:col-span-5 bg-[#0b101d] border border-gray-800/60 p-4 rounded-xl space-y-3.5">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                {translateText("👤 Register New Admin", "👤 ثبت ادمین جدید", lang)}
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                    {translateText("Admin Username (No @)", "نام کاربری ادمین (بدون @)", lang)}
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
                    {translateText("Telegram User ID", "شناسه عددی تلگرام ادمین", lang)}
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
                    {translateText("Admin Privilege Role", "سطح دسترسی", lang)}
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
                      {translateText("General Admin", "ادمین معمولی", lang)}
                    </option>
                    <option value="super_admin">
                      {translateText("Super Admin", "سوپر ادمین", lang)}
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddAdmin}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {translateText("Add to Admins List", "افزودن به لیست ادمین‌ها", lang)}
                </button>
              </div>
            </div>

            {/* List table */}
            <div className="lg:col-span-7 bg-[#0b101d] border border-gray-800/60 p-4 rounded-xl flex flex-col justify-between max-h-[290px] overflow-y-auto">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 flex justify-between items-center uppercase tracking-wider">
                  <span>
                    {translateText("Registered Admins List", "لیست ادمین‌های فعال", lang)}
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
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>ID: {adm.userId}</span>
                          <span>•</span>
                          <span>{adm.createdAt}</span>
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
                                translateText("Are you sure you want to delete this admin?", "آیا از حذف این ادمین اطمینان دارید؟", lang),
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

      {/* AI Support and Smart Assistant Section */}
      <div className="bg-[#111827] border border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-indigo-600/10 transition-colors"></div>

        <h3 className="font-display font-medium text-lg text-white flex items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>
              {t.smartAiTitle}
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
          {translateText("Enable Gemini AI as a 24/7 support assistant. Users can chat with the bot, and it answers based on your prices and connection guides.", "فعال‌سازی هوش مصنوعی (Gemini) به عنوان پشتیبان ۲۴ ساعته. کاربران می‌توانند سوالات خود را بپرسند و ربات بر اساس تعرفه‌ها و راهنما پاسخ می‌دهد.", lang)}
        </p>

        {!hideBtnAiChat && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn relative">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {translateText("Button label in Telegram menu:", "عنوان دکمه در منوی ربات:", lang)}
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
                {translateText("Gemini API Key:", "کلید API جیمینای (Gemini API Key):", lang)}
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
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {translateText("Gemini API Base URL (Proxy/Optional):", "آدرس Base URL جیمینای (پراکسی/اختیاری):", lang)}
              </label>
              <input
                type="text"
                placeholder="https://generativelanguage.googleapis.com"
                className="w-full bg-[#0a0e17] border border-gray-800 rounded-lg p-2.5 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={geminiBaseUrl}
                onChange={(e) => setGeminiBaseUrl(e.target.value)}
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
                  ? translateText("Gemini API Key is configured.", "کلید API جیمینای شناسایی شد.", lang)
                  : translateText("Missing Gemini API Secret Key.", "خطا: کلید API ربات (Gemini) ست نشده است.", lang)}
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
                {translateText("🔍 Test Gemini API Key Connection", "🔍 بررسی و تست اتصال کلید جیمینای", lang)}
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
              {t.mandatoryJoinTitle}
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
          {translateText("When active, any user starting the bot must be subscribed to the designated Telegram channel to access features.", "وقتی این ویژگی فعال باشد، تمامی کاربرانی که وارد ربات تلگرام می‌شوند ابتدا باید در کانال تعیین‌شده عضو شوند تا اجازه استفاده از امکانات ربات را پیدا کنند.", lang)}
        </p>

        {mandatoryJoinActive && (
          <div className="space-y-4 pt-2 animate-fadeIn" dir="rtl">
            {/* Multi-channels List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  {translateText("Telegram channels for mandatory join (user must join all):", "کانال‌های تلگرام جهت عضویت اجباری (کاربر باید در تمامی آن‌ها عضو شود):", lang)}
                </label>
                <button
                  type="button"
                  onClick={() => setMandatoryJoinChannels([...mandatoryJoinChannels, ""])}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.addChannelBtn}
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
                          translateText("@example_channel or full invite link", "@example_channel یا لینک کامل", lang)
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
                {t.mandatoryJoinMsgLabel}
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#111827] border border-gray-750 hover:border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                placeholder={
                  translateText("e.g., Please sub to our channel to unlock the bot's features!", "مثلا: کاربر گرامی، برای استفاده از ربات لطفا ابتدا در کانال رسمی ما عضو شوید.", lang)
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
            {t.mandatoryJoinBtn}
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
              {translateText("Auto Database Backup", "پشتیبان‌گیری خودکار (بکاپ)", lang)}
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
          {translateText("Periodically backup the Daltoon_Bot.db and send it to the system owner's Telegram account.", "بکاپ‌های دوره‌ای باعث اطمینان خاطر شما از حفظ اطلاعات سیستم می‌شود. فایل بکاپ به تلگرام Owner ارسال می‌گردد.", lang)}
        </p>

        {autoBackupEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fadeIn">
            {/* Interval selection */}
            <div className="space-y-1.5 text-right font-sans" dir="rtl">
              <label className="text-xs font-semibold text-gray-300">
                {translateText("Backup Interval:", "دوره زمانی پشتیبان‌گیری:", lang)}
              </label>
              <select
                className="w-full bg-[#111827] border border-gray-750 hover:border-gray-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-sans"
                value={autoBackupInterval}
                onChange={(e) => setAutoBackupInterval(e.target.value)}
                dir="ltr"
              >
                <option value="hourly">
                  {translateText("Hourly", "ساعتی (Hourly)", lang)}
                </option>
                <option value="daily">
                  {translateText("Daily", "روزانه (Daily)", lang)}
                </option>
                <option value="weekly">
                  {translateText("Weekly", "هفتگی (Weekly)", lang)}
                </option>
                <option value="monthly">
                  {translateText("Monthly", "ماهانه (Monthly)", lang)}
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
            {translateText("Save Backup Settings", "ذخیره تنظیمات بکاپ", lang)}
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
            {translateText("🎨 QR Code Customization & Styling", "🎨 شخصی‌سازی و زیباسازی کدهای QR", lang)}
          </h3>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {translateText("Customize your QR Codes with custom branding colors, watermarks/logos, or use custom generation APIs.", "کدهای QR ربات خود را با رنگ برندینگ خود، درج لوگو/واترمارک اختصاصی در مرکز، یا فرمت‌های سفارشی کاملاً دگرگون کنید.", lang)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* QR Code Color */}
          <div className="space-y-1.5 text-right font-sans" dir="rtl">
            <label className="text-xs font-semibold text-gray-300">
              {translateText("QR Code Color (Hex):", "رنگ کدهای QR (کد هگز):", lang)}
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
              {translateText("Type 'none' or leave empty to use the JSON template's original color.", "برای استفاده از رنگ قالب JSON کلمه none را بنویسید یا کادر را خالی بگذارید.", lang)}
            </p>
          </div>

          {/* QR Code Logo (Watermark) */}
          <div className="space-y-1.5 text-right font-sans" dir="rtl">
            <label className="text-xs font-semibold text-gray-300">
              {translateText("Center Logo/Watermark Image URL:", "لینک عکس لوگو/واترمارک مرکز:", lang)}
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
              {translateText("URL of a transparent PNG icon to be embedded in the center.", "لینک آیکون یا لوگویی که مایلید در مرکز کد QR حک شود.", lang)}
            </p>
          </div>
        </div>

        {/* Custom API Template URL */}
        <div className="space-y-1.5 text-right font-sans pt-1" dir="rtl">
          <label className="text-xs font-semibold text-gray-300">
            {translateText("Advanced QR Template (JSON Config or Custom API URL):", "تمپلیت پیشرفته QR (فرمت JSON یا لینک دلخواه):", lang)}
          </label>
          <textarea
            placeholder={`{\n  "body": "mosaic",\n  "eye": "frame13",\n  "eyeBall": "ball14",\n  "bodyColor": "#000000"\n}`}
            className="w-full bg-[#111827] border border-gray-750 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 font-mono h-24"
            value={qrTemplate}
            onChange={(e) => setQrTemplate(e.target.value)}
            dir="ltr"
          />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            {translateText("Paste QRCode-Monkey JSON config, or use a custom API URL with placeholders {text}, {color}, {logo_url}.", "می‌توانید کدهای JSON ساخته شده توسط qrcode-monkey.com را اینجا قرار دهید تا کدها با ظاهر کاستوم تولید شوند! (همچنین لینک API ساده هم پشتیبانی می‌شود. متغیرها: {text}، {color} و {logo_url})", lang)}
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1.5"
          >
            {translateText("Save QR Settings", "ذخیره تنظیمات QR", lang)}
          </button>
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
                {translateText("Receipt Verification Bot Token (Optional)", "توکن اختصاصی ربات تایید رسیدها (اختیاری)", lang)}
              </label>
              <input
                type="text"
                placeholder={translateText("e.g. 123456789:ABCdefGhI...", "مثال: 123456789:ABCdefGhI...", lang)}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={receiptBotToken}
                onChange={(e) => setReceiptBotToken(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {translateText(
                  "If set, payment receipt messages and direct approval/rejection buttons will be sent to this secondary bot instead of the main bot, preventing admin spam in the main chat.",
                  "در صورت تنظیم، پیام‌های بررسی و دکمه‌های تایید/رد فوری فیش‌های واریزی به این ربات دوم ارسال می‌شوند تا از شلوغی و تداخل در ربات اصلی جلوگیری شود.",
                  lang
                )}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Store Name / Bot Nickname", "نام فروشگاه / ربات (جهت نمایش)", lang)}
              </label>
              <input
                type="text"
                placeholder={
                  translateText("e.g. My Proxy Store", "مثال: فروشگاه پروکسی من", lang)
                }
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm w-full text-white font-medium focus:ring-1 focus:ring-indigo-500"
                value={botNickname}
                onChange={(e) => setBotNickname(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {translateText("This name replaces the {nickname} variable in bot messages.", "این نام در پیام‌های ربات (مثل خوش‌آمدگویی یا خرید) جایگزین متغیر {nickname} می‌شود.", lang)}
              </p>
            </div>

            
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("System & Bot Currency", "واحد پول سیستم و ربات (Currency)", lang)}
              </label>
              <input
                type="text"
                required
                placeholder={translateText("e.g. Toman, USD, TL", "مثال: تومان، ریال، USD, TL", lang)}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-medium focus:ring-1 focus:ring-indigo-500"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {translateText("All amounts, invoices, revenue metrics, and bot simulators will use and display this currency.", "تمام مبالغ، فاکتورها، گزارش‌های درآمد و شبیه‌سازهای ربات با این واحد پول پردازش و نمایش داده می‌شوند.", lang)}
              </p>
            </div>

            {/* Time Zone & Calendar System Box */}
            <div className="md:col-span-2 bg-[#0b101d] border border-indigo-500/30 p-4 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">
                    {translateText("Time Zone & Calendar System", "منطقه زمانی و سیستم تقویم (Time Zone & Calendar)", lang)}
                  </h4>
                </div>
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg text-xs font-mono text-indigo-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentTimePreview || formatDateTime(new Date(), { timeZone, calendarSystem })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {translateText("Select Time Zone", "منطقه زمانی (Time Zone)", lang)}
                  </label>
                  <select
                    className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {translateText("All dashboard logs, bot messages, and expiry dates adjust to this time zone.", "تمامی زمان‌ها، گزارشات و لایسنس‌ها بر اساس منطقه زمانی انتخابی تنظیم و محاسبه می‌شوند.", lang)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {translateText("Calendar System", "سیستم تقویم (Calendar System)", lang)}
                  </label>
                  <select
                    className="w-full bg-[#13192e] border border-gray-750 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    value={calendarSystem}
                    onChange={(e) => setCalendarSystem(e.target.value as CalendarSystem)}
                  >
                    <option value="jalali">
                      {translateText("Solar (شمسی)", "شمسی", lang)}
                    </option>
                    <option value="gregorian">
                      {translateText("Gregorian (میلادی)", "میلادی", lang)}
                    </option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {translateText("Choose how dates are displayed across the bot and admin panel.", "نمایش تاریخ در ربات و پنل مدیریت (شمسی یا میلادی).", lang)}
                  </p>
                </div>
              </div>
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
                {translateText("📢 Telegram Channel ID (e.g., @example_channel)", "📢 آیدی کانال تلگرام (مثال: @example_channel)", lang)}
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
                {t.webhookStatusLabel}
              </label>
              <div className="flex items-center gap-2 bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-emerald-400 font-semibold font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {translateText("Active / Online", "فعال و آنلاین", lang)}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Power className="w-4 h-4 text-indigo-400" />
                    {translateText("Auto Usage/Time Warning", "هشدار خودکار اتمام حجم/زمان", lang)}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {translateText("Bot automatically alerts users when less than 1 GB or 1 Day of their plan remains.", "ربات به صورت خودکار در صورتی که کمتر از ۱ گیگابایت یا ۱ روز از طرح کاربر باقی مانده باشد، پیامی جهت تمدید ارسال خواهد کرد.", lang)}
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
                    {translateText("No Connection Alert (1 Day)", "اخطار عدم اتصال پس از ۱ روز", lang)}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {translateText("Bot will alert the user if they haven't connected 1 day after getting their subscription.", "در صورتی که روز بعد از خرید، کاربر هنوز حجمی مصرف نکرده باشد، پیگیری ربات فعال می‌شود.", lang)}
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
                    {translateText("First Connection Alert", "اطلاع رسانی اولین اتصال", lang)}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {translateText("When a user connects successfully for the first time, they receive an alert with their sub link.", "هنگامی که کاربر برای اولین بار با موفقیت به کانفیگ متصل شود، پیام خوش آمدگویی و لینک اشتراک برای او ارسال می شود.", lang)}
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

        {/* Electronic Payment Gateways */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            {translateText("Electronic Gateways & Services", "درگاه‌های پرداخت الکترونیک و سرویس‌ها", lang)}
          </h3>
          <p className="text-xs text-gray-400">
            {translateText("Professional management of crypto keys and automation mechanisms.", "مدیریت حرفه‌ای کلیدهای پرداخت ارزی، کریپتو و تنظیمات اتوماسیون (تمامی کلیدها به صورت امن نگهداری می‌شوند).", lang)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("Plisio Secret Key (API)", "کد امنیتی Plisio (API Key)", lang)}
              </label>
              <input
                type="text"
                placeholder="API Key..."
                className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg p-2.5 text-xs text-indigo-300 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={gatewayPlisioWallet}
                onChange={(e) => setGatewayPlisioWallet(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {translateText("NowPayments API Key", "کد امنیتی NowPayments (API Key)", lang)}
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
                {translateText("Cryptomus Key", "کد امنیتی Cryptomus (API Key)", lang)}
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
                {translateText("Cryptomus Merchant", "نشان تجاری Cryptomus (Merchant ID)", lang)}
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
                {translateText("Heleket Token", "درگاه پرداخت Heleket (توکن / آدرس)", lang)}
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
                  {translateText("Enable Gateway: Telegram Stars", "پشتیبانی از درگاه Telegram Stars (ستاره‌های تلگرام)", lang)}
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
              {translateText("Add New Card", "افزودن کارت جدید", lang)}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {translateText("You can register one or multiple bank cards to be displayed in the bot's card-to-card message.", "می‌توانید یک یا چند کارت بانکی را جهت نمایش در پیام کارت به کارت ربات ثبت نمایید.", lang)}
          </p>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {cardNumbers.map((card, index) => (
              <div 
                key={index} 
                className="bg-[#1f2937]/30 border border-gray-800 p-4 rounded-xl relative space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-800/50 pb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    {translateText("Card #", "کارت شماره ", lang) + (index + 1)}
                  </span>
                  {cardNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmConfig({
                          isOpen: true,
                          message: translateText("Are you sure you want to delete this bank card?", "آیا از حذف این کارت بانکی اطمینان دارید؟", lang),
                          action: () => handleRemoveCard(index),
                        })
                      }
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/20 transition-all cursor-pointer"
                      title={translateText("Remove Card", "حذف کارت", lang)}
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
                      placeholder={translateText("e.g., Melli, Saman", "مثلا ملی، سامان", lang)}
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
                      placeholder={translateText("Cardholder full name", "نام و نام خانوادگی صاحب کارت", lang)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telegram WebApp / Mini App Mode Card */}
        <div className="bg-[#111827] border border-indigo-500/30 p-5 rounded-xl space-y-4 shadow-lg shadow-indigo-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
                  <span>{translateText("Telegram WebApp / Mini App Mode", "تنظیمات Telegram Web / Mini App", lang)}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-medium">
                    {translateText("New", "جدید", lang)}
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {translateText("Hide standard inline buttons and display a single modern Mini App button", "با فعال شدن این گزینه، تمام دکمه‌های شیشه‌ای کیبورد ناپدید شده و دکمه ورود به مینی‌اپ جایگزین می‌شود", lang)}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useMiniAppMode}
                onChange={(e) => setUseMiniAppMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {useMiniAppMode && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="leading-relaxed">
                  {translateText(
                    "Mini App Mode is ACTIVE: All main keyboard inline buttons are replaced by a single WebApp button in the Telegram bot.",
                    "حالت مینی‌اپ فعال است: تمامی دکمه‌های شیشه‌ای کیبورد اصلی ناپدید شده و تنها یک دکمه برای هدایت کاربر به مینی‌اپ در ربات نمایش داده می‌شود.",
                    lang
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Button Title Input & Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>{translateText("Mini App Button Title", "عنوان دکمه مینی‌اپ", lang)}</span>
                    <span className="text-[11px] text-indigo-400 font-normal">{translateText("Select Color", "انتخاب رنگ دکمه", lang)}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-[#1f2937] border border-gray-700/80 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      value={btnTextMiniApp}
                      onChange={(e) => setBtnTextMiniApp(e.target.value)}
                      placeholder={translateText("e.g. 🚀 Open Smart WebApp", "مثلا: 🚀 ورود به برنامه هوشمند", lang)}
                    />
                    <select
                      className="bg-[#1f2937] border border-gray-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[105px] font-medium"
                      value={primaryButtonColors["btnMiniApp"] || "none"}
                      onChange={(e) => setPrimaryButtonColors({ ...primaryButtonColors, btnMiniApp: e.target.value })}
                      dir={lang === "fa" ? "rtl" : "ltr"}
                      title={translateText("Select button color", "انتخاب رنگ دکمه", lang)}
                    >
                      <option value="none">{translateText("No Color", "بدون رنگ", lang)}</option>
                      <option value="success">{translateText("Green", "🟢 سبز", lang)}</option>
                      <option value="danger">{translateText("Red", "🔴 قرمز", lang)}</option>
                      <option value="primary">{translateText("Blue", "🔵 آبی", lang)}</option>
                    </select>
                  </div>
                </div>

                {/* Mini App Web URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 block">
                    {translateText("Mini App Web URL", "آدرس مینی‌اپ (Telegram WebApp URL)", lang)}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#1f2937] border border-gray-700/80 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-mono"
                    value={miniAppUrl}
                    onChange={(e) => setMiniAppUrl(e.target.value)}
                    placeholder={translateText("https://your-domain.com/miniapp (Empty = auto-detect)", "مثلا https://domain.com/miniapp (خالی بگذارید تا از آدرس پنل استفاده شود)", lang)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] uppercase font-mono text-gray-500">
              {translateText("Local Cache DB: SQLite 'Daltoon_Bot.db'", "دیتابیس درگاه محلی: SQLite 'Daltoon_Bot.db'", lang)}
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

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl space-y-4 shadow-sm mt-6">
        <h3 className="font-display font-medium text-lg text-red-400 flex items-center gap-2">
          <Database className="w-5 h-5" />
          {translateText("Danger Zone", "منطقه خطر", lang)}
        </h3>

        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            {translateText("Wipe all users, transactions, plans, and settings. This will re-initialize the system.", "حذف کامل تمامی اطلاعات کاربران، تراکنش‌ها و تنظیمات. سیستم به حالت اولیه باز می‌گردد.", lang)}
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmConfig({
                isOpen: true,
                message:
                  translateText("Are you sure you want to completely wipe the database? This will delete all users, plans, and settings.", "آیا از حذف کامل دیتابیس و ریست کردن تمامی اطلاعات اطمینان دارید؟ تمامی تنظیمات، پلن‌ها و کاربران حذف خواهند شد.", lang),
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
            {translateText("Full Database Wipe", "حذف کامل دیتابیس", lang)}
          </button>
        </div>
      </div>

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

      <ConfirmationModal
        isOpen={showRestartConfirm}
        title={lang === "fa" ? "ریستارت داشبورد" : "Restart Dashboard"}
        message={lang === "fa" ? "آیا از ریستارت داشبورد مطمئن هستید؟" : "Are you sure you want to restart dashboard?"}
        lang={lang}
        isDangerous={true}
        confirmText={lang === "fa" ? "تایید و ریستارت" : "Confirm Restart"}
        cancelText={lang === "fa" ? "انصراف" : "Cancel"}
        onCancel={() => setShowRestartConfirm(false)}
        onConfirm={async () => {
          setShowRestartConfirm(false);
          await fetch("/api/system/bot/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "restart-all" })
          });
          setShowRestartAlert(true);
        }}
      />

      <ConfirmationModal
        isOpen={showRestartAlert}
        title={lang === "fa" ? "پیام سیستم" : "System Message"}
        message={lang === "fa" ? "دستور ریستارت ارسال شد. لطفاً چند ثانیه صبر کنید و صفحه را رفرش کنید." : "Restart command sent. Please wait a few seconds and refresh."}
        lang={lang}
        isAlert={true}
        confirmText={lang === "fa" ? "متوجه شدم" : "OK"}
        onConfirm={() => setShowRestartAlert(false)}
      />
    </div>
  );
}
