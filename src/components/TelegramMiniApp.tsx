import React, { useState, useEffect, useMemo, useRef } from "react";
import { CustomSelect } from "./CustomSelect";
import { getThemeStyles } from "../utils/theme";
import { formatDateTime } from "../utils/dateTimeUtils";
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
  ChevronLeft,
  ChevronRight,
  Info,
  Server,
  Sliders,
  Tag,
  AlertCircle,
  Clock,
  HardDrive,
  Send,
  MessageSquare,
  Lock,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  KeyRound,
  LogOut,
  X,
  Crown,
  Wallet,
  Calendar,
  Share2,
  Activity,
  Award,
  Search,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileText,
  Camera,
  RotateCcw,
  Ban,
  ArrowUpDown,
  Filter
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
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<"plans" | "subs" | "wallet" | "colleagues" | "profile" | "support">("plans");
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll position to top immediately when activeTab changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Custom Modal / Alert System (Replaces Native Alert)
  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    buttonText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    buttonText: "متوجه شدم",
  });

  const showThemedModal = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info", buttonText: string = "متوجه شدم", onConfirm?: () => void) => {
    setCustomModal({
      isOpen: true,
      type,
      title,
      message,
      buttonText,
      onConfirm
    });
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "success") window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      else if (type === "error") window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      else window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }
  };

  const closeThemedModal = () => {
    if (customModal.onConfirm) {
      customModal.onConfirm();
    }
    setCustomModal(prev => ({ ...prev, isOpen: false, onConfirm: undefined }));
  };

  // Live Database State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tgUser, setTgUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [userRoleTitle, setUserRoleTitle] = useState<string>("کاربر فعال");
  const [servers, setServers] = useState<any[]>([]);
  const [colleagueServers, setColleagueServers] = useState<any[]>([]);
  const [planCategories, setPlanCategories] = useState<any[]>([]);
  const [vpnPlans, setVpnPlans] = useState<any[]>([]);
  const [customPricing, setCustomPricing] = useState<any>({
    enabled: true,
    boxes: [],
    defaultPricePerGb: 3000,
    defaultPricePerDay: 2000,
  });
  const [testAccountSettings, setTestAccountSettings] = useState<any>({
    enabled: false,
    trafficGb: 1,
    durationHours: 24,
    hasUsed: false,
  });
  const [systemSettings, setSystemSettings] = useState<any>({});

  // Active Theme Computation synced with Dashboard
  const activeDashboardTheme = systemSettings?.dashboard_theme || systemSettings?.dashboardTheme || localStorage.getItem("dashboard_theme") || "default";
  const isLightMode = systemSettings?.theme_mode === "light" || localStorage.getItem("theme") === "light";

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [isLightMode]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subSearchQuery, setSubSearchQuery] = useState<string>("");
  const [subSortOrder, setSubSortOrder] = useState<"newest" | "oldest" | "highest_traffic" | "expiring_soon">("newest");
  const [subStatusFilter, setSubStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);

  // Computed filtered and sorted subscriptions (Newest first by default)
  const filteredSubscriptions = useMemo(() => {
    let list = [...subscriptions];

    // 1. Search Query filter (Client name, plan name, server name, id, UUID)
    if (subSearchQuery.trim()) {
      const q = subSearchQuery.trim().toLowerCase();
      list = list.filter((s: any) => {
        const clientName = String(s.clientName || s.remark || "").toLowerCase();
        const planName = String(s.planName || "").toLowerCase();
        const serverName = String(s.serverName || "").toLowerCase();
        const id = String(s.id || "").toLowerCase();
        const uuid = String(s.clientUuid || s.uuid || "").toLowerCase();
        const subLink = String(s.subLink || "").toLowerCase();
        return (
          clientName.includes(q) ||
          planName.includes(q) ||
          serverName.includes(q) ||
          id.includes(q) ||
          uuid.includes(q) ||
          subLink.includes(q)
        );
      });
    }

    // 2. Status filter
    if (subStatusFilter === "active") {
      list = list.filter((s: any) => (s.status || "").toLowerCase() === "active" && !s.disabled);
    } else if (subStatusFilter === "inactive") {
      list = list.filter((s: any) => (s.status || "").toLowerCase() !== "active" || s.disabled);
    }

    // 3. Sorting
    list.sort((a: any, b: any) => {
      if (subSortOrder === "newest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        const idA = typeof a.id === "number" ? a.id : parseInt(String(a.id).replace(/\D/g, ""), 10) || 0;
        const idB = typeof b.id === "number" ? b.id : parseInt(String(b.id).replace(/\D/g, ""), 10) || 0;
        return idB - idA;
      } else if (subSortOrder === "oldest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA && timeB && timeA !== timeB) return timeA - timeB;
        const idA = typeof a.id === "number" ? a.id : parseInt(String(a.id).replace(/\D/g, ""), 10) || 0;
        const idB = typeof b.id === "number" ? b.id : parseInt(String(b.id).replace(/\D/g, ""), 10) || 0;
        return idA - idB;
      } else if (subSortOrder === "highest_traffic") {
        const limitA = Number(a.trafficLimitGb || a.totalGb || 0);
        const limitB = Number(b.trafficLimitGb || b.totalGb || 0);
        return limitB - limitA;
      } else if (subSortOrder === "expiring_soon") {
        const usedPercentA = Number(a.trafficUsedGb || 0) / (Number(a.trafficLimitGb || 1));
        const usedPercentB = Number(b.trafficUsedGb || 0) / (Number(b.trafficLimitGb || 1));
        return usedPercentB - usedPercentA;
      }
      return 0;
    });

    return list;
  }, [subscriptions, subSearchQuery, subStatusFilter, subSortOrder]);

  const [tickets, setTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Purchase Wizard Flow States
  // Step 1: Server Selection | Step 2: Plan Selection | Step 3: Username & Promo | Step 4: Invoice & Payment | Step 5: Success Delivery
  const [purchaseStep, setPurchaseStep] = useState<number>(1);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [planMode, setPlanMode] = useState<"fixed" | "custom">("fixed");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Custom Volume State
  const [customGb, setCustomGb] = useState<number>(30);
  const [customDays, setCustomDays] = useState<number>(30);

  // Client Details & Promo
  const [clientUsername, setClientUsername] = useState<string>("");
  const [randomSuffix] = useState<string>(() => Math.random().toString(36).substring(2, 8));
  const fullClientUsername = useMemo(() => {
    const raw = clientUsername.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (raw) {
      return raw.includes("-") ? raw : `${raw}-${randomSuffix}`;
    }
    return `usr_${tgUser?.id || "vpn"}_${randomSuffix}`;
  }, [clientUsername, tgUser?.id, randomSuffix]);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card_to_card" | "admin_free">("wallet");
  const [cardReceiptImage, setCardReceiptImage] = useState<string>("");
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [deliveredSubKey, setDeliveredSubKey] = useState<any>(null);
  const [pendingReceiptPurchase, setPendingReceiptPurchase] = useState<{
    txId?: string;
    planName?: string;
    submittedAt: number;
    prevSubIds: string[];
  } | null>(null);

  // Allowed Payment Methods for Selected Server
  const allowedMethodsForServer = useMemo<string[]>(() => {
    if (
      !selectedServer ||
      !Array.isArray(selectedServer.allowedPaymentMethods) ||
      selectedServer.allowedPaymentMethods.length === 0
    ) {
      return ["wallet", "card_to_card", "plisio", "nowpayments", "cryptomus", "heleket", "stars"];
    }
    return selectedServer.allowedPaymentMethods;
  }, [selectedServer]);

  const isWalletAllowed = allowedMethodsForServer.includes("wallet");
  const isCardToCardAllowed = allowedMethodsForServer.includes("card_to_card");

  useEffect(() => {
    if (!isWalletAllowed && isCardToCardAllowed && paymentMethod === "wallet") {
      setPaymentMethod("card_to_card");
    } else if (!isCardToCardAllowed && isWalletAllowed && paymentMethod === "card_to_card") {
      setPaymentMethod("wallet");
    }
  }, [isWalletAllowed, isCardToCardAllowed, paymentMethod]);

  // Free Test State
  const [claimingTest, setClaimingTest] = useState<boolean>(false);
  const [testSuccessSub, setTestSuccessSub] = useState<any>(null);
  const [testCountdown, setTestCountdown] = useState<number>(20);

  // 20-Second Countdown for Free Test Account Delivery Box
  useEffect(() => {
    if (!testSuccessSub) return;
    if (testCountdown <= 0) {
      setTestSuccessSub(null);
      showThemedModal(
        "🎉 کانفیگ در سرویس‌های من ذخیره شد!",
        "فرصت ۲۰ ثانیه‌ای به پایان رسید. جهت مشاهده و کپی مجدد کانفیگ‌ها به بخش «سرویس‌های من» مراجعه کنید.",
        "info",
        "مشاهده سرویس‌های من",
        () => setActiveTab("subs")
      );
      return;
    }
    const timer = setInterval(() => {
      setTestCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testSuccessSub, testCountdown]);

  // Wallet Deposit State
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositReceipt, setDepositReceipt] = useState<string>("");
  const [depositing, setDepositing] = useState<boolean>(false);
  const [depositMessage, setDepositMessage] = useState<string | null>(null);

  // Support Ticket State
  const [ticketSubject, setTicketSubject] = useState<string>("");
  const [ticketMessage, setTicketMessage] = useState<string>("");
  const [submittingTicket, setSubmittingTicket] = useState<boolean>(false);
  const [activeTicketChat, setActiveTicketChat] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState<string>("");

  // Colleague Portal State
  const [colleagueLoggedIn, setColleagueLoggedIn] = useState<boolean>(false);
  const [colleagueAccount, setColleagueAccount] = useState<any>(null);
  const [colleagueClients, setColleagueClients] = useState<any[]>([]);
  const [colleaguePackages, setColleaguePackages] = useState<any[]>([]);
  const [userColleagueAccounts, setUserColleagueAccounts] = useState<any[]>([]);
  const [colleagueSubTab, setColleagueSubTab] = useState<"menu" | "login" | "packages" | "recover">("menu");
  const [colleagueUsernameInput, setColleagueUsernameInput] = useState<string>("");
  const [colleaguePasswordInput, setColleaguePasswordInput] = useState<string>("");
  const [colleagueLoggingIn, setColleagueLoggingIn] = useState<boolean>(false);

  // Colleague Package Purchase State
  const [selectedColleaguePkg, setSelectedColleaguePkg] = useState<any>(null);
  const [colleaguePrefixInput, setColleaguePrefixInput] = useState<string>("Col");
  const [colleagueTokenInput, setColleagueTokenInput] = useState<string>("");
  const [colleaguePaymentMethod, setColleaguePaymentMethod] = useState<"wallet" | "card_to_card" | "admin_free">("wallet");
  const [colleagueCardReceipt, setColleagueCardReceipt] = useState<string>("");
  const [buyingColleaguePkg, setBuyingColleaguePkg] = useState<boolean>(false);

  // Colleague Password Recovery State
  const [recoverTokenInput, setRecoverTokenInput] = useState<string>("");
  const [verifyingRecoveryToken, setVerifyingRecoveryToken] = useState<boolean>(false);
  const [verifiedRecoveryAccount, setVerifiedRecoveryAccount] = useState<any>(null);
  const [newColleagueUsername, setNewColleagueUsername] = useState<string>("");
  const [newColleaguePassword, setNewColleaguePassword] = useState<string>("");
  const [updatingColleagueCredentials, setUpdatingColleagueCredentials] = useState<boolean>(false);

  // Colleague Create Client Modal/State
  const [isColleagueCreateOpen, setIsColleagueCreateOpen] = useState<boolean>(false);
  const [colleagueSelectedServer, setColleagueSelectedServer] = useState<any>(null);
  const [colleagueNewClientName, setColleagueNewClientName] = useState<string>("");
  const [colleagueNewGb, setColleagueNewGb] = useState<string>("30");
  const [colleagueNewDays, setColleagueNewDays] = useState<string>("30");
  const [colleagueCreatingClient, setColleagueCreatingClient] = useState<boolean>(false);

  // Colleague Search/Sort & Profile Refresh States
  const [colleagueSearch, setColleagueSearch] = useState<string>("");
  const [colleagueSort, setColleagueSort] = useState<"newest" | "oldest">("newest");
  const [isProfileRefreshing, setIsProfileRefreshing] = useState<boolean>(false);

  // Reset Category and Plan selection when Server changes
  useEffect(() => {
    if (selectedServer) {
      setSelectedCategory("all");
      setSelectedPlan(null);
    }
  }, [selectedServer?.id]);

  // Instant scroll to top whenever tab or view step changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
      try {
        mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
      } catch (e) {}
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab, purchaseStep, colleagueSubTab]);

  // UI Utilities
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);

  // My Services Actions State (Change Link, Renew, Suspend/Active, Delete)
  const [renewModalKey, setRenewModalKey] = useState<any | null>(null);
  const [renewModalGb, setRenewModalGb] = useState<string>("30");
  const [renewModalDays, setRenewModalDays] = useState<string>("30");
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<"wallet" | "card_to_card">("wallet");
  const [renewCardReceiptImage, setRenewCardReceiptImage] = useState<string>("");
  const [renewSubmitting, setRenewSubmitting] = useState<boolean>(false);
  const [regeneratingKeyId, setRegeneratingKeyId] = useState<string | null>(null);
  const [togglingKeyId, setTogglingKeyId] = useState<string | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<any | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [fetchingSubLinksId, setFetchingSubLinksId] = useState<string | null>(null);

  const fetchLiveSubLinksForService = async (sub: any, forceRefresh: boolean = false) => {
    const subId = String(sub.id || sub.clientUuid || sub.uuid || "");
    if (!subId) return;

    setFetchingSubLinksId(subId);
    try {
      const res = await fetch("/api/miniapp/subscription-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyId: sub.id,
          clientName: sub.clientName || sub.email || sub.remark,
          clientUuid: sub.clientUuid || sub.uuid,
          serverId: sub.serverId,
          subLink: sub.subLink,
          forceRefresh: forceRefresh,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newConfigs = Array.isArray(data.vlessConfigs) ? data.vlessConfigs : [];
        const newLinks = Array.isArray(data.vlessLinks) ? data.vlessLinks : [];
        const newSubLink = data.subLink || sub.subLink;

        setSubscriptions((prev) =>
          prev.map((item) =>
            (sub.id && String(item.id) === String(sub.id)) || (sub.clientUuid && item.clientUuid === sub.clientUuid)
              ? {
                  ...item,
                  vlessConfigs: newConfigs.length > 0 ? newConfigs : item.vlessConfigs,
                  vlessLinks: newLinks.length > 0 ? newLinks : item.vlessLinks,
                  subLink: newSubLink || item.subLink,
                }
              : item
          )
        );
        setColleagueClients((prev) =>
          prev.map((item) =>
            (sub.id && String(item.id) === String(sub.id)) || (sub.clientUuid && item.clientUuid === sub.clientUuid)
              ? {
                  ...item,
                  vlessConfigs: newConfigs.length > 0 ? newConfigs : item.vlessConfigs,
                  vlessLinks: newLinks.length > 0 ? newLinks : item.vlessLinks,
                  subLink: newSubLink || item.subLink,
                }
              : item
          )
        );
      }
    } catch (e) {
      console.warn("Failed to fetch live links:", e);
    } finally {
      setFetchingSubLinksId(null);
    }
  };

  const handleToggleSubAccordion = async (sub: any) => {
    const subId = String(sub.id || sub.clientUuid || sub.uuid || "");
    if (expandedSubId === subId) {
      setExpandedSubId(null);
      return;
    }

    setExpandedSubId(subId);
    await fetchLiveSubLinksForService(sub, false);
  };

  // Action Handlers for My Services
  const handleMiniAppRegenerateUuid = async (sub: any) => {
    const subId = sub.id || sub.clientUuid;
    if (!subId || regeneratingKeyId) return;

    setRegeneratingKeyId(subId);
    try {
      const res = await fetch("/api/subscription-keys/regenerate-uuid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subId }),
      });
      const data = await res.json();
      if (data.success && (data.key || data.newUuid)) {
        const updatedKey = data.key || {};
        const newUuid = data.newUuid || updatedKey.clientUuid;
        const newSubLink = data.newSubLink || updatedKey.subLink;
        const newVless = data.vlessConfigs || updatedKey.vlessConfigs || [];

        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id || item.clientUuid === sub.clientUuid
              ? {
                  ...item,
                  clientUuid: newUuid || item.clientUuid,
                  subLink: newSubLink || item.subLink,
                  vlessConfigs: newVless.length > 0 ? newVless : item.vlessConfigs,
                }
              : item
          )
        );
        setColleagueClients((prev) =>
          prev.map((item) =>
            item.id === sub.id || item.clientUuid === sub.clientUuid
              ? {
                  ...item,
                  clientUuid: newUuid || item.clientUuid,
                  subLink: newSubLink || item.subLink,
                  vlessConfigs: newVless.length > 0 ? newVless : item.vlessConfigs,
                }
              : item
          )
        );

        showThemedModal(
          "🔄 تغییر لینک و آیدی موفقیت‌آمیز بود",
          "شناسه (UUID) و لینک ساب اشتراک شما با موفقیت در پنل سرور، ربات و سیستم بازنشانی شد. لینک جدید را کپی و در نرم‌افزار خود اعمال نمایید.",
          "success"
        );
      } else {
        showThemedModal(
          "خطا در تغییر لینک",
          data.error || "تغییر لینک با خطا مواجه شد. لطفاً مجدداً تلاش نمایید.",
          "error"
        );
      }
    } catch (err: any) {
      showThemedModal("خطای ارتباط", err?.message || "امکان برقراری ارتباط با سرور وجود ندارد.", "error");
    } finally {
      setRegeneratingKeyId(null);
    }
  };

  const handleMiniAppRenewSubmit = async () => {
    if (!renewModalKey || renewSubmitting) return;
    const subId = renewModalKey.id || renewModalKey.clientUuid;
    const addGb = Math.max(1, Number(renewModalGb) || 10);
    const addDays = Math.max(1, Number(renewModalDays) || 30);
    const effUserId = tgUser?.id || userData?.id || userData?.userId;

    const isFree = isAdmin || isOwner || userRole === "admin" || userRole === "owner";
    const finalMethod = isFree ? "admin_free" : renewPaymentMethod;

    if (!isFree && finalMethod === "card_to_card" && !renewCardReceiptImage.trim()) {
      showThemedModal("رسید واریز الزامی است", "لطفاً تصویر یا فیش واریز کارت به کارت را پیوست فرمایید.", "warning");
      return;
    }

    setRenewSubmitting(true);
    try {
      const res = await fetch("/api/subscription-keys/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subId,
          addGb,
          addDays,
          userId: effUserId,
          paymentMethod: finalMethod,
          receiptImage: renewCardReceiptImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.pendingReceipt) {
          setRenewModalKey(null);
          setRenewCardReceiptImage("");
          setActiveTab("wallet");
          fetchMiniAppData();
          showThemedModal(
            "⌛ ثبت فیش تمدید",
            data.message || "رسید تمدید اشتراک شما با موفقیت ثبت شد و پس از بررسی و تایید مدیریت، سرویس شما تمدید و فعال می‌گردد.",
            "info",
            "مشاهده تراکنش‌ها",
            () => {
              setActiveTab("wallet");
              fetchMiniAppData();
            }
          );
          return;
        }

        if (data.userBalance !== undefined) {
          setUserData((prev: any) => prev ? { ...prev, balance: data.userBalance, walletBalance: data.userBalance } : prev);
        }

        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === renewModalKey.id || item.clientUuid === renewModalKey.clientUuid
              ? {
                  ...item,
                  expireDate: data.key?.expireDate || item.expireDate,
                  trafficLimitGb: data.key?.trafficLimitGb || item.trafficLimitGb,
                  status: "active",
                  disabled: false,
                }
              : item
          )
        );
        setColleagueClients((prev) =>
          prev.map((item) =>
            item.id === renewModalKey.id || item.clientUuid === renewModalKey.clientUuid
              ? {
                  ...item,
                  expireDate: data.key?.expireDate || item.expireDate,
                  trafficLimitGb: data.key?.trafficLimitGb || item.trafficLimitGb,
                  status: "active",
                  disabled: false,
                }
              : item
          )
        );

        setRenewModalKey(null);
        setRenewCardReceiptImage("");
        const costStr = data.cost && data.cost > 0 ? ` به مبلغ ${Number(data.cost).toLocaleString()} تومان از کیف پول کسر و` : "";
        showThemedModal(
          "🎉 تمدید موفقیت‌آمیز اشتراک",
          `اشتراک شما با موفقیت${costStr} به میزان +${addGb} گیگابایت حجم و +${addDays} روز تمدید شد و وضعیت آن در پنل سرور و ربات فعال گردید.`,
          "success"
        );
      } else {
        showThemedModal("خطا در تمدید", data.error || "عملیات تمدید اشتراک با خطا مواجه شد.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای ارتباط", err?.message || "خطا در برقراری ارتباط با سرور جهت تمدید.", "error");
    } finally {
      setRenewSubmitting(false);
    }
  };

  const handleMiniAppToggleStatus = async (sub: any) => {
    const subId = sub.id || sub.clientUuid;
    if (!subId || togglingKeyId) return;

    const isCurrentlyActive = (sub.status || "active").toLowerCase() === "active" && !sub.disabled;
    const targetStatus = isCurrentlyActive ? "suspended" : "active";

    setTogglingKeyId(subId);
    try {
      const res = await fetch("/api/subscription-keys/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subId,
          status: targetStatus,
          clientUuid: sub.clientUuid || (sub.subLink ? (sub.subLink.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i) || [])[0] : ""),
          clientName: sub.clientName || sub.clientEmail || sub.planName || "",
          serverId: sub.serverId,
          subLink: sub.subLink,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id || item.clientUuid === sub.clientUuid
              ? { ...item, status: targetStatus, disabled: targetStatus === "suspended" }
              : item
          )
        );
        setColleagueClients((prev) =>
          prev.map((item) =>
            item.id === sub.id || item.clientUuid === sub.clientUuid
              ? { ...item, status: targetStatus, disabled: targetStatus === "suspended" }
              : item
          )
        );

        showThemedModal(
          targetStatus === "active" ? "🟢 اشتراک فعال شد" : "⏸ اشتراک معلق شد",
          targetStatus === "active"
            ? "دسترسی اشتراک شما در سرور، پنل و ربات با موفقیت فعال و برقرار شد."
            : "دسترسی اشتراک شما در سرور، پنل و ربات موقتاً به حالت تعلیق درآمد.",
          "success"
        );
      } else {
        showThemedModal("خطا در تغییر وضعیت", data.error || "تغییر وضعیت اشتراک انجام نشد.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای ارتباط", err?.message || "خطا در اتصال به سرور.", "error");
    } finally {
      setTogglingKeyId(null);
    }
  };

  const handleMiniAppDeleteSubmit = async () => {
    if (!confirmDeleteKey || deletingKeyId) return;
    const subId = confirmDeleteKey.id || confirmDeleteKey.clientUuid;

    setDeletingKeyId(subId);
    try {
      const res = await fetch("/api/subscription-keys/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subId,
          userId: tgUser?.id || userData?.id,
          clientName: confirmDeleteKey.clientName || confirmDeleteKey.email,
          clientUuid: confirmDeleteKey.clientUuid || confirmDeleteKey.uuid,
          serverId: confirmDeleteKey.serverId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.filter((item) => item.id !== confirmDeleteKey.id && item.clientUuid !== confirmDeleteKey.clientUuid)
        );
        setColleagueClients((prev) =>
          prev.filter((item) => item.id !== confirmDeleteKey.id && item.clientUuid !== confirmDeleteKey.clientUuid)
        );
        setConfirmDeleteKey(null);
        showThemedModal(
          "🗑️ کانفیگ حذف شد",
          "کانفیگ مورد نظر با موفقیت از پنل سرور، دیتابیس و لیست اشتراک‌های شما حذف گردید.",
          "success"
        );
      } else {
        showThemedModal("خطا در حذف کانفیگ", data.error || "حذف کانفیگ با خطا مواجه شد.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای ارتباط", err?.message || "خطا در برقراری ارتباط با سرور جهت حذف.", "error");
    } finally {
      setDeletingKeyId(null);
    }
  };

  useEffect(() => {
    if (customModal.isOpen || isColleagueCreateOpen || activeQrModal || renewModalKey || confirmDeleteKey) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [customModal.isOpen, isColleagueCreateOpen, activeQrModal, renewModalKey, confirmDeleteKey]);

  // Initialize Telegram User & Fetch Data
  useEffect(() => {
    let detectedUser: any = null;

    if (typeof window !== "undefined") {
      if (window.Telegram?.WebApp) {
        const wa = window.Telegram.WebApp;
        wa.ready();
        wa.expand();
        if (wa.initDataUnsafe?.user) {
          detectedUser = wa.initDataUnsafe.user;
        }
      }

      // Check URL search params for fallback
      const urlParams = new URLSearchParams(window.location.search);
      const tgIdParam = urlParams.get("tg_id") || urlParams.get("userId");
      if (tgIdParam && !detectedUser) {
        detectedUser = {
          id: Number(tgIdParam),
          username: urlParams.get("username") || `user_${tgIdParam}`,
          first_name: urlParams.get("first_name") || "کاربر",
          last_name: urlParams.get("last_name") || "",
        };
      }

      if (!detectedUser) {
        // Fallback for direct browser testing
        detectedUser = {
          id: 100001,
          username: "daltoon_guest",
          first_name: "کاربر",
          last_name: "مهمان",
        };
      }
    }

    setTgUser(detectedUser);
    fetchMiniAppData(detectedUser);
  }, []);

  // Safe network fetch helper to prevent "Unexpected end of JSON input" and unhandled 500s
  const safeFetchJson = async (url: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any; error?: string }> => {
    try {
      const res = await fetch(url, options);
      let parsed: any = null;
      try {
        const text = await res.text();
        if (text && text.trim()) {
          parsed = JSON.parse(text);
        }
      } catch (parseErr) {
        console.warn(`[SafeFetch] JSON parse issue from ${url}:`, parseErr);
      }

      if (!parsed) {
        return {
          ok: false,
          status: res.status,
          data: null,
          error: res.ok ? "پاسخی از سرور دریافت نشد." : `خطای سرور (کد وضعیت: ${res.status}). لطفاً تنظیمات سرور و پنل را بررسی کنید.`
        };
      }

      const isSuccess = res.ok && parsed.success !== false;
      return {
        ok: isSuccess,
        status: res.status,
        data: parsed,
        error: parsed.error || (!isSuccess ? `خطا در اجرای عملیات (${res.status})` : undefined)
      };
    } catch (netErr: any) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: netErr.message || "خطا در اتصال به شبکه یا سرور."
      };
    }
  };

  const fetchMiniAppData = async (userObj?: any) => {
    const user = userObj || tgUser;
    if (!user?.id) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams({
        tg_id: String(user.id),
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });

      const { ok, data, error } = await safeFetchJson(`/api/miniapp/data?${params.toString()}`);
      if (ok && data?.success) {
        setUserData(data.user);
        const adminFlag = !!data.isAdmin || !!data.user?.isAdmin || !!data.isOwner || !!data.user?.isOwner;
        const ownerFlag = !!data.isOwner || !!data.user?.isOwner || !!data.isSuperAdmin || !!data.user?.isSuperAdmin || data.user?.role === "super_admin" || data.user?.role === "owner";
        const superAdminFlag = ownerFlag || !!data.isSuperAdmin || !!data.user?.isSuperAdmin;

        setIsAdmin(adminFlag);
        setIsOwner(ownerFlag);
        setIsSuperAdmin(superAdminFlag);
        setUserRole(data.role || data.user?.role || (ownerFlag ? "super_admin" : (adminFlag ? "admin" : "user")));
        setUserRoleTitle(data.roleTitle || data.user?.roleTitle || (ownerFlag ? "مالک و سوپر ادمین" : (adminFlag ? "مدیر کل" : "کاربر فعال")));

        setServers(data.servers || []);
        setColleagueServers(data.colleagueServers || []);
        setPlanCategories(data.planCategories || []);
        setVpnPlans(data.vpnPlans || []);
        setCustomPricing(data.customPricing || {
          enabled: true,
          boxes: [],
          defaultPricePerGb: 3000,
          defaultPricePerDay: 2000,
        });
        setTestAccountSettings(data.testAccount || {
          enabled: false,
          trafficGb: 1,
          durationHours: 24,
          hasUsed: false,
        });
        setSystemSettings(data.settings || {});
        setSubscriptions(data.subscriptions || []);
        setTickets(data.tickets || []);
        setTransactions(data.transactions || []);
        setColleaguePackages(data.colleaguePackages || []);
        setUserColleagueAccounts(data.userColleagueAccounts || []);
        if (data.colleaguePackages && data.colleaguePackages.length > 0 && !selectedColleaguePkg) {
          setSelectedColleaguePkg(data.colleaguePackages[0]);
        }

        // Auto-select first server if available
        if (data.servers && data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
      } else {
        setErrorMessage(error || data?.error || "خطای نامشخص در دریافت اطلاعات");
      }
    } catch (err: any) {
      console.error("MiniApp fetch error:", err);
      setErrorMessage(err.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMiniAppData();
  };

  // Silent poller for real-time background sync and instant receipt approval delivery
  const silentFetchMiniAppData = async () => {
    if (!tgUser?.id) return;
    try {
      const params = new URLSearchParams({
        tg_id: String(tgUser.id),
        username: tgUser.username || "",
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
      });

      const { ok, data } = await safeFetchJson(`/api/miniapp/data?${params.toString()}`);
      if (ok && data?.success) {
        setUserData(data.user);
        setIsAdmin(!!data.isAdmin || !!data.user?.isAdmin);
        setServers(data.servers || []);
        setColleagueServers(data.colleagueServers || []);
        setPlanCategories(data.planCategories || []);
        setVpnPlans(data.vpnPlans || []);
        if (data.testAccount) setTestAccountSettings(data.testAccount);
        if (data.settings) setSystemSettings(data.settings);
        if (data.tickets) setTickets(data.tickets);
        if (data.transactions) setTransactions(data.transactions);
        if (data.colleaguePackages) setColleaguePackages(data.colleaguePackages);
        if (data.userColleagueAccounts) setUserColleagueAccounts(data.userColleagueAccounts);

        const newSubs = data.subscriptions || [];

        // Check if a pending receipt purchase was approved by admin
        if (pendingReceiptPurchase) {
          const matchingNewSub = newSubs.find((s: any) => {
            const isNewId = !pendingReceiptPurchase.prevSubIds.includes(s.id);
            const isRecent = s.createdAtMs && s.createdAtMs >= pendingReceiptPurchase.submittedAt - 15000;
            return isNewId || isRecent;
          });

          if (matchingNewSub) {
            setPendingReceiptPurchase(null);
            setDeliveredSubKey(matchingNewSub);
            setPurchaseStep(5);
            setActiveTab("plans");
            showThemedModal(
              "🎉 رسید شما تایید شد!",
              "سرویس شما توسط مدیریت تایید و بلافاصله فعال گردید. کانفیگ و لینک‌های اتصال روی صفحه آماده استفاده هستند.",
              "success"
            );
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
            }
          }
        }

        setSubscriptions(newSubs);
      }
    } catch (e) {
      // Silent error handling for background poller
    }
  };

  // Background poller effect
  useEffect(() => {
    if (!tgUser?.id) return;
    const intervalMs = pendingReceiptPurchase ? 3000 : 8000;
    const timer = setInterval(() => {
      silentFetchMiniAppData();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [tgUser?.id, pendingReceiptPurchase]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Available categories allowed for selected server
  const availableCategories = useMemo(() => {
    if (!selectedServer || !Array.isArray(selectedServer.planCategories) || selectedServer.planCategories.length === 0) {
      return planCategories;
    }
    const allowed = selectedServer.planCategories.map((c: string) => String(c).toLowerCase());
    return planCategories.filter((cat) =>
      allowed.some((a: string) => a === String(cat.id).toLowerCase() || a === String(cat.name).toLowerCase())
    );
  }, [planCategories, selectedServer]);

  // Filtered Plans by selected category and server
  const filteredPlans = useMemo(() => {
    let list = vpnPlans;

    if (selectedServer) {
      const allowedCats = Array.isArray(selectedServer.planCategories) && selectedServer.planCategories.length > 0
        ? selectedServer.planCategories.map((c: string) => String(c).toLowerCase())
        : null;

      list = list.filter((p: any) => {
        // If plan explicitly targets serverIds or serverId
        if (Array.isArray(p.serverIds) && p.serverIds.length > 0) {
          if (!p.serverIds.includes(String(selectedServer.id))) return false;
        } else if (p.serverId && String(p.serverId) !== String(selectedServer.id)) {
          return false;
        }

        // If server limits plan categories
        if (allowedCats && allowedCats.length > 0) {
          const planCat = String(p.category || "").toLowerCase();
          const matches = allowedCats.includes(planCat) ||
            availableCategories.some((c: any) => String(c.name).toLowerCase() === planCat && allowedCats.includes(String(c.id).toLowerCase()));
          if (!matches) return false;
        }

        return true;
      });
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => String(p.category).toLowerCase() === String(selectedCategory).toLowerCase());
    }

    return list;
  }, [vpnPlans, selectedCategory, selectedServer, availableCategories]);

  // Colleague Clients Filtered and Sorted
  const filteredColleagueClients = useMemo(() => {
    let list = [...colleagueClients];
    if (colleagueSearch.trim()) {
      const q = colleagueSearch.trim().toLowerCase();
      list = list.filter((c: any) =>
        (c.clientName || "").toLowerCase().includes(q) ||
        (c.subLink || "").toLowerCase().includes(q) ||
        (c.remark || "").toLowerCase().includes(q)
      );
    }
    list.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.id ? Number(a.id) || 0 : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.id ? Number(b.id) || 0 : 0);
      return colleagueSort === "newest" ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [colleagueClients, colleagueSearch, colleagueSort]);

  // Custom Pricing Box for selected server
  const customBox = useMemo(() => {
    if (!selectedServer) return null;
    const boxes = customPricing?.boxes || systemSettings?.panel_config?.customPricingBoxes || systemSettings?.customPricingBoxes || [];
    return boxes.find((b: any) => Array.isArray(b.serverIds) && b.serverIds.includes(String(selectedServer.id))) || null;
  }, [selectedServer, customPricing, systemSettings]);

  const minCustomGb = useMemo(() => {
    if (customBox?.minGb && Number(customBox.minGb) > 0) return Number(customBox.minGb);
    if (systemSettings?.minCreateGb && Number(systemSettings.minCreateGb) > 0) return Number(systemSettings.minCreateGb);
    if (systemSettings?.panel_config?.minCreateGb && Number(systemSettings.panel_config.minCreateGb) > 0) return Number(systemSettings.panel_config.minCreateGb);
    return 5;
  }, [customBox, systemSettings]);

  const minCustomDays = useMemo(() => {
    if (customBox?.minDays && Number(customBox.minDays) > 0) return Number(customBox.minDays);
    if (systemSettings?.minDays && Number(systemSettings.minDays) > 0) return Number(systemSettings.minDays);
    return 7;
  }, [customBox, systemSettings]);

  // Adjust custom sliders if current values are below min bounds
  useEffect(() => {
    if (customGb < minCustomGb) {
      setCustomGb(minCustomGb);
    }
  }, [minCustomGb]);

  useEffect(() => {
    if (customDays < minCustomDays) {
      setCustomDays(minCustomDays);
    }
  }, [minCustomDays]);

  // Price Calculation for Custom Volume (Matching formula)
  const customCalculatedPrice = useMemo(() => {
    let priceGb = customPricing.defaultPricePerGb || 3000;
    let priceDay = customPricing.defaultPricePerDay || 2000;

    if (customBox) {
      priceGb = Number(customBox.pricePerGb) || priceGb;
      priceDay = Number(customBox.pricePerDay) || priceDay;
    }
    return customGb * priceGb + customDays * priceDay;
  }, [customGb, customDays, customBox, customPricing]);

  // Final Price for Checkout (After Promo & Admin check)
  const checkoutPrice = useMemo(() => {
    if (isAdmin) return 0; // Admin has 100% free purchases
    const base = planMode === "custom" ? customCalculatedPrice : (selectedPlan?.price || 0);
    if (!appliedPromo) return base;
    let discount = 0;
    if (appliedPromo.discountAmount !== undefined) {
      discount = Number(appliedPromo.discountAmount);
    } else if (appliedPromo.discountPercent || appliedPromo.promo?.discountPercent) {
      const pct = Number(appliedPromo.discountPercent || appliedPromo.promo?.discountPercent);
      discount = Math.floor((base * pct) / 100);
    } else if (appliedPromo.promo?.discountAmount) {
      discount = Number(appliedPromo.promo?.discountAmount);
    } else if (appliedPromo.promo?.value) {
      const val = Number(appliedPromo.promo.value);
      if (appliedPromo.promo.type === "fixed_amount" || val > 100) {
        discount = val;
      } else {
        discount = Math.floor((base * val) / 100);
      }
    }
    return Math.max(0, base - discount);
  }, [planMode, customCalculatedPrice, selectedPlan, appliedPromo, isAdmin]);

  // Helper to read and compress image from file input
  const processImageFile = (
    file: File,
    onSuccess: (base64: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showThemedModal("فرمت نامعتبر", "لطفاً یک تصویر معتبر (PNG, JPG, JPEG) از گالری انتخاب فرمایید.", "warning");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showThemedModal("حجم بالا", "حجم تصویر باید کمتر از ۱۵ مگابایت باشد.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataStr = e.target?.result as string;
      if (!dataStr) return;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          onSuccess(compressed);
        } else {
          onSuccess(dataStr);
        }
      };
      img.onerror = () => {
        onSuccess(dataStr);
      };
      img.src = dataStr;
    };
    reader.readAsDataURL(file);
  };

  // Extract effective cards list from system settings
  const effectiveCards = useMemo(() => {
    const list: Array<{ number: string; holder?: string; bank?: string }> = [];
    if (Array.isArray(systemSettings?.cardNumbers) && systemSettings.cardNumbers.length > 0) {
      systemSettings.cardNumbers.forEach((c: any) => {
        if (typeof c === "string" && c.trim()) {
          list.push({ number: c.trim(), holder: systemSettings.cardHolder || "مدیریت", bank: systemSettings.bankName || "بانک" });
        } else if (c && typeof c === "object" && (c.number || c.cardNumber)) {
          list.push({
            number: String(c.number || c.cardNumber).trim(),
            holder: c.holder || c.cardHolder || systemSettings.cardHolder || "مدیریت",
            bank: c.bank || c.bankName || systemSettings.bankName || "بانک"
          });
        }
      });
    }
    if (list.length === 0 && systemSettings?.cardNumber) {
      list.push({
        number: String(systemSettings.cardNumber).trim(),
        holder: systemSettings.cardHolder || "مدیریت سرور",
        bank: systemSettings.bankName || "بانک مقصد"
      });
    }
    if (list.length === 0) {
      list.push({
        number: "۶۰۳۷-۹۹۷۵-۰۰۰۰-۰۰۰۰",
        holder: "مدیریت سرور",
        bank: "کارت بانکی"
      });
    }
    return list;
  }, [systemSettings]);

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError("لطفاً کد تخفیف را وارد کنید.");
      return;
    }

    setValidatingPromo(true);
    setPromoError(null);
    try {
      const basePrice = planMode === "custom" ? customCalculatedPrice : (selectedPlan?.price || 0);
      const { ok, data, error } = await safeFetchJson("/api/miniapp/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          userId: tgUser?.id,
          originalPrice: basePrice,
        }),
      });

      if (ok && data?.success) {
        setAppliedPromo(data);
        showThemedModal("تخفیف اعمال شد", `کد تخفیف با موفقیت اعمال شد. مبلغ تخفیف: ${Number(data.discountAmount || 0).toLocaleString("fa-IR")} تومان`, "success");
      } else {
        setPromoError(error || data?.error || "کد تخفیف نامعتبر است.");
        setAppliedPromo(null);
      }
    } catch (err: any) {
      setPromoError("خطا در بررسی کد تخفیف");
    } finally {
      setValidatingPromo(false);
    }
  };

  // Execute Purchase
  const handlePurchase = async () => {
    if (!selectedServer) {
      showThemedModal("انتخاب سرور", "لطفاً ابتدا یک سرور انتخاب کنید.", "warning");
      setPurchaseStep(1);
      return;
    }

    if (planMode === "fixed" && !selectedPlan) {
      showThemedModal("انتخاب پلن", "لطفاً یک پلن انتخاب کنید.", "warning");
      setPurchaseStep(2);
      return;
    }

    // Mandatory receipt check for card-to-card
    if (!isAdmin && paymentMethod === "card_to_card" && !cardReceiptImage.trim()) {
      showThemedModal("تصویر فیش یا رسید الزامی است", "لطفاً تصویر رسید پرداخت خود را از گالری انتخاب کرده یا کد پیگیری را در کادر مربوطه وارد فرمایید.", "warning");
      return;
    }

    setPurchasing(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username || `user_${tgUser?.id}`,
          serverId: String(selectedServer.id),
          planId: planMode === "custom" ? "custom" : selectedPlan.id,
          planName: planMode === "custom" ? `پلن دلخواه (${customGb}GB - ${customDays} روز)` : selectedPlan?.name,
          customGb: planMode === "custom" ? customGb : (selectedPlan?.trafficGb || 30),
          customDays: planMode === "custom" ? customDays : (selectedPlan?.durationDays || 30),
          clientUsername: fullClientUsername,
          paymentMethod: isAdmin ? "admin_free" : paymentMethod,
          promoCode: appliedPromo?.code || appliedPromo?.promo?.code || promoCodeInput.trim() || undefined,
          receiptImage: cardReceiptImage || undefined,
        }),
      });

      if (ok && data?.success) {
        if (data.subKey) {
          setDeliveredSubKey(data.subKey);
          setPurchaseStep(5); // Go to instant delivery view
          fetchMiniAppData(); // Refresh balance and subs
          showThemedModal("🎉 سرویس با موفقیت فعال شد!", "اشتراک شما بلافاصله ساخته شد و آماده اتصال است.", "success");
        } else if (data.pendingApproval) {
          const currentSubIds = (subscriptions || []).map((s: any) => s.id);
          setPendingReceiptPurchase({
            txId: data.transactionId,
            planName: planMode === "custom" ? `پلن دلخواه (${customGb}GB - ${customDays} روز)` : selectedPlan?.name,
            submittedAt: Date.now(),
            prevSubIds: currentSubIds,
          });

          // Reset all receipt & wizard states to prevent duplicate submission
          setCardReceiptImage("");
          setClientUsername("");
          setAppliedPromo(null);
          setPromoCodeInput("");
          setPurchaseStep(1);

          // Immediately switch active tab to wallet (transactions view)
          setActiveTab("wallet");
          fetchMiniAppData();

          showThemedModal(
            "رسید ثبت شد ⏳",
            data.message || "رسید شما با موفقیت ثبت شد و پس از بررسی و تایید مدیریت، سرویس شما فعال خواهد شد.",
            "success",
            "مشاهده تراکنش‌های در انتظار",
            () => {
              setActiveTab("wallet");
              fetchMiniAppData();
            }
          );
        }
      } else {
        showThemedModal("خطا در ایجاد سرویس", error || data?.error || "خطا در ساخت کانفیگ روی سرور. لطفاً اتصال پنل و سرورها را بررسی کنید.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در برقراری ارتباط با سرور", "error");
    } finally {
      setPurchasing(false);
    }
  };

  // Claim Free Test Account (One-Click Delivery)
  const handleClaimFreeTest = async (overrideServerId?: string) => {
    if (!testAccountSettings.enabled) {
      showThemedModal(
        "تست رایگان",
        testAccountSettings.disabledMessage || "اکانت تست رایگان فعلا موجود نیست.",
        "warning"
      );
      return;
    }

    if (testAccountSettings.hasUsed && !isAdmin) {
      showThemedModal(
        "تست رایگان",
        "❌ شما قبلاً اکانت تست رایگان خود را دریافت کرده‌اید!\nهر کاربر تنها یکبار مجاز به دریافت تست رایگان می‌باشد.",
        "warning"
      );
      return;
    }

    if (!servers || servers.length === 0) {
      showThemedModal("سرور یافت نشد", "سرور فعالی برای دریافت تست یافت نشد.", "warning");
      return;
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }

    setClaimingTest(true);
    try {
      const targetServer = overrideServerId
        ? servers.find((s) => String(s.id) === String(overrideServerId))
        : testAccountSettings.serverId
        ? servers.find((s) => String(s.id) === String(testAccountSettings.serverId)) || selectedServer || servers[0]
        : selectedServer || servers[0];

      const { ok, data, error } = await safeFetchJson("/api/miniapp/free-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          serverId: targetServer ? String(targetServer.id) : undefined,
        }),
      });

      if (ok && data?.success && data?.subKey) {
        setTestCountdown(20);
        setTestSuccessSub(data.subKey);
        setTestAccountSettings((prev: any) => ({ ...prev, hasUsed: true }));
        setSubscriptions((prev: any[]) => [data.subKey, ...prev.filter((k: any) => k.id !== data.subKey.id)]);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
        showThemedModal("تبریک! 🎉", "اکانت تست رایگان شما با ۱ کلیک با موفقیت صادر و فعال شد.", "success");
        fetchMiniAppData();
      } else {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
        }
        showThemedModal(
          "تست رایگان",
          error || data?.error || testAccountSettings.disabledMessage || "خطا در دریافت تست رایگان",
          "warning"
        );
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در دریافت اکانت تست", "error");
    } finally {
      setClaimingTest(false);
    }
  };
  // Submit Wallet Deposit (Card to Card)
  const handleSubmitDeposit = async () => {
    if (!depositAmount || depositAmount < 10000) {
      showThemedModal("مبلغ نامعتبر", "حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.", "warning");
      return;
    }

    if (!depositReceipt.trim()) {
      showThemedModal("تصویر فیش یا رسید الزامی است", "لطفاً تصویر فیش واریز را از گالری انتخاب کرده یا شناسه پیگیری را وارد فرمایید.", "warning");
      return;
    }

    setDepositing(true);
    setDepositMessage(null);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          amount: depositAmount,
          receiptImage: depositReceipt || "واریز کارت به کارت از طریق مینی‌اپ",
          paymentMethod: "card_to_card",
        }),
      });

      if (ok && data?.success) {
        setDepositMessage(data.message || "درخواست شارژ با موفقیت ثبت شد.");
        setDepositReceipt("");
        fetchMiniAppData();
        showThemedModal("رسید واریز ثبت شد", data.message || "درخواست افزایش موجودی شما با موفقیت ثبت گردید و اعلان آن به مدیر ارسال شد.", "success");
      } else {
        showThemedModal("خطا در ثبت شارژ", error || data?.error || "خطا در ثبت درخواست شارژ", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای شبکه", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setDepositing(false);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async () => {
    if (!ticketMessage.trim()) {
      showThemedModal("پیام خالی است", "لطفاً متن پیام پشتیبانی را وارد کنید.", "warning");
      return;
    }

    setSubmittingTicket(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          subject: ticketSubject.trim() || "درخواست پشتیبانی مینی‌اپ",
          message: ticketMessage.trim(),
        }),
      });

      if (ok && data?.success) {
        setTicketSubject("");
        setTicketMessage("");
        fetchMiniAppData();
        showThemedModal("تیکت ارسال شد", "پیام پشتیبانی شما ثبت شد و به زودی پاسخ داده خواهد شد.", "success");
      } else {
        showThemedModal("خطا در ارسال تیکت", error || data?.error || "خطا در ارسال تیکت پشتیبانی", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای شبکه", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Reply to Ticket
  const handleReplyTicket = async () => {
    if (!activeTicketChat || !replyMessage.trim()) return;

    try {
      const { ok, data } = await safeFetchJson("/api/miniapp/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicketChat.id,
          userId: tgUser?.id,
          message: replyMessage.trim(),
        }),
      });

      if (ok && data?.success) {
        setReplyMessage("");
        fetchMiniAppData();
        if (data.ticket) setActiveTicketChat(data.ticket);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Login for Owned Colleague Account
  const handleQuickLoginColleague = async (acc: any) => {
    setColleagueUsernameInput(acc.username);
    setColleaguePasswordInput(acc.password);
    setColleagueLoggingIn(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: acc.username,
          password: acc.password,
        }),
      });
      if (ok && data?.success) {
        setColleagueAccount(data.account);
        setColleagueClients(data.clients || []);
        setColleagueLoggedIn(true);
        if (colleagueServers.length > 0) {
          setColleagueSelectedServer(colleagueServers[0]);
        } else if (servers.length > 0) {
          setColleagueSelectedServer(servers[0]);
        }
        showThemedModal("ورود موفق", `همکار گرامی (${data.account.prefix || data.account.username}) خوش آمدید.`, "success");
      } else {
        showThemedModal("خطا در ورود", error || data?.error || "خطا در ورود به حساب همکار", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setColleagueLoggingIn(false);
    }
  };

  // Buy Colleague Package Flow
  const handleColleagueBuyPackage = async () => {
    if (!selectedColleaguePkg) {
      showThemedModal("انتخاب بسته", "لطفاً یک بسته همکار را انتخاب نمایید.", "warning");
      return;
    }

    if (!colleaguePrefixInput.trim()) {
      showThemedModal("پیشوند الزامی است", "لطفاً پیشوند دلخواه برای ساخت نام کاربری کاربران را مشخص کنید (مثلاً VIP یا Col).", "warning");
      return;
    }

    if (!colleagueTokenInput.trim()) {
      showThemedModal("توکن بازیابی الزامی است", "لطفاً یک توکن امنیتی دلخواه جهت بازیابی رمز عبور وارد نمایید.", "warning");
      return;
    }

    if (!isAdmin && colleaguePaymentMethod === "card_to_card" && !colleagueCardReceipt.trim()) {
      showThemedModal("شناسه تراکنش الزامی است", "لطفاً شناسه واریز یا شماره پیگیری تراکنش کارت به کارت را وارد کنید.", "warning");
      return;
    }

    setBuyingColleaguePkg(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/buy-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username || `user_${tgUser?.id}`,
          packageId: selectedColleaguePkg.id,
          prefix: colleaguePrefixInput.trim(),
          recoveryToken: colleagueTokenInput.trim(),
          paymentMethod: isAdmin ? "admin_free" : colleaguePaymentMethod,
          receiptImage: colleagueCardReceipt || undefined,
        }),
      });

      if (ok && data?.success) {
        if (data.account) {
          showThemedModal(
            "🎉 حساب همکار فعال شد!",
            `حساب همکاری شما با موفقیت ایجاد شد.\n👤 نام کاربری: ${data.account.username}\n🔑 رمز عبور: ${data.account.password}\n🛡 پیشوند: ${data.account.prefix}\nحجم پکیج: ${data.account.trafficGb} GB`,
            "success",
            "ورود به پنل همکار",
            () => {
              setColleagueAccount(data.account);
              setColleagueClients([]);
              setColleagueLoggedIn(true);
              if (colleagueServers.length > 0) setColleagueSelectedServer(colleagueServers[0]);
              fetchMiniAppData();
            }
          );
        } else if (data.pendingApproval) {
          showThemedModal("رسید ثبت شد", data.message || "رسید خرید بسته همکار ثبت شد و پس از تایید مدیریت فعال می‌گردد.", "success");
          fetchMiniAppData();
        }
      } else {
        showThemedModal("خطا در خرید بسته", error || data?.error || "خطا در پردازش خرید بسته همکار", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setBuyingColleaguePkg(false);
    }
  };

  // Colleague Password Recovery Flow - Step 1: Verify Token
  const handleVerifyRecoveryToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverTokenInput.trim()) {
      showThemedModal("توکن الزامی است", "لطفاً توکن امنیتی بازیابی خود را وارد نمایید.", "warning");
      return;
    }

    setVerifyingRecoveryToken(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recoveryToken: recoverTokenInput.trim(),
        }),
      });

      if (ok && data?.success && data.account) {
        setVerifiedRecoveryAccount(data.account);
        setNewColleagueUsername(data.account.username || "");
        setNewColleaguePassword("");
      } else {
        showThemedModal("خطای بازیابی", error || data?.error || "توکن امنیتی بازیابی یافت نشد یا نامعتبر است.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setVerifyingRecoveryToken(false);
    }
  };

  // Colleague Password Recovery Flow - Step 2: Update Credentials
  const handleUpdateColleagueCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColleagueUsername.trim() || !newColleaguePassword.trim()) {
      showThemedModal("اطلاعات ناقص", "لطفاً نام کاربری جدید و کلمه عبور جدید را وارد نمایید.", "warning");
      return;
    }

    setUpdatingColleagueCredentials(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/recover-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recoveryToken: recoverTokenInput.trim(),
          newUsername: newColleagueUsername.trim(),
          newPassword: newColleaguePassword.trim(),
        }),
      });

      if (ok && data?.success && data.account) {
        showThemedModal(
          "تغییر موفقیت‌آمیز",
          `اطلاعات حساب همکار شما با موفقیت بروزرسانی شد.\n👤 نام کاربری جدید: ${data.account.username}\n🔑 رمز عبور جدید: ${data.account.password}`,
          "success",
          "ورود به حساب",
          () => {
            setColleagueUsernameInput(data.account.username);
            setColleaguePasswordInput(data.account.password);
            setColleagueSubTab("login");
            setVerifiedRecoveryAccount(null);
            setRecoverTokenInput("");
            fetchMiniAppData();
          }
        );
      } else {
        showThemedModal("خطای بروزرسانی", error || data?.error || "خطا در بروزرسانی اطلاعات.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setUpdatingColleagueCredentials(false);
    }
  };

  // Colleague Login Flow
  const handleColleagueLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colleagueUsernameInput.trim() || !colleaguePasswordInput.trim()) {
      showThemedModal("اطلاعات ناقص", "لطفاً نام کاربری و کلمه عبور همکار را وارد کنید.", "warning");
      return;
    }

    setColleagueLoggingIn(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: colleagueUsernameInput.trim(),
          password: colleaguePasswordInput.trim(),
        }),
      });

      if (ok && data?.success) {
        setColleagueAccount(data.account);
        setColleagueClients(data.clients || []);
        setColleagueLoggedIn(true);
        if (colleagueServers.length > 0) {
          setColleagueSelectedServer(colleagueServers[0]);
        } else if (servers.length > 0) {
          setColleagueSelectedServer(servers[0]);
        }
        showThemedModal("ورود موفق", `همکار گرامی (${data.account.prefix || data.account.username}) خوش آمدید.`, "success");
      } else {
        showThemedModal("خطا در ورود", error || data?.error || "نام کاربری یا رمز عبور همکار اشتباه است.", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setColleagueLoggingIn(false);
    }
  };

  // Colleague Create Client (Free of charge for Colleague within package allowance)
  const handleColleagueCreateClient = async () => {
    if (!colleagueAccount) return;

    const reqGb = Number(colleagueNewGb) || 10;
    const reqDays = Number(colleagueNewDays) || 30;

    const pkg = (colleaguePackages || []).find((p: any) => p.id === colleagueAccount?.packageId);
    const minAllowedGb = Number(
      colleagueAccount?.minCreateGb ||
      pkg?.minCreateGb ||
      systemSettings?.colleagueMinCreateGb ||
      systemSettings?.minCreateGb ||
      0
    );
    if (minAllowedGb > 0 && reqGb < minAllowedGb) {
      showThemedModal(
        "حداقل حجم مجاز",
        `حداقل حجم مجاز برای ساخت هر کانفیگ همکار ${minAllowedGb} گیگابایت می‌باشد.`,
        "warning"
      );
      return;
    }

    if (Number(colleagueAccount.remainingTrafficGb || 0) < reqGb) {
      showThemedModal(
        "اتمام سهمیه حجم",
        `حجم درخواستی (${reqGb} GB) بیشتر از حجم مجاز باقیمانده شما (${Number(colleagueAccount.remainingTrafficGb || 0).toFixed(1)} GB) است.`,
        "error"
      );
      return;
    }

    const srv = colleagueSelectedServer || (colleagueServers.length > 0 ? colleagueServers[0] : servers[0]);
    if (!srv) {
      showThemedModal("انتخاب سرور", "لطفاً یک سرور انتخاب کنید.", "warning");
      return;
    }

    setColleagueCreatingClient(true);
    try {
      const { ok, data, error } = await safeFetchJson("/api/miniapp/colleague/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: colleagueAccount.id,
          serverId: String(srv.id),
          clientUsername: colleagueNewClientName.trim() || `usr_${Math.random().toString(36).substring(2, 6)}`,
          trafficGb: reqGb,
          durationDays: reqDays,
        }),
      });

      if (ok && data?.success) {
        setIsColleagueCreateOpen(false);
        setColleagueNewClientName("");
        if (data.client) {
          setColleagueClients(prev => [data.client, ...prev]);
        }
        // Update remaining traffic locally
        setColleagueAccount((prev: any) => ({
          ...prev,
          remainingTrafficGb: Math.max(0, (prev.remainingTrafficGb || 0) - reqGb),
          allocatedTrafficGb: (prev.allocatedTrafficGb || 0) + reqGb
        }));

        showThemedModal("✅ کانفیگ همکار ساخته شد", "کانفیگ با موفقیت در پنل سرور تعریف شد و در لیست کلاینت‌های شما قرار گرفت.", "success");
      } else {
        showThemedModal("خطا در ساخت کانفیگ", error || data?.error || "خطا در ایجاد سرویس همکار", "error");
      }
    } catch (err: any) {
      showThemedModal("خطای سرور", err.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setColleagueCreatingClient(false);
    }
  };

  // Helper for QR Code URL
  const getQrUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  };

  return (
    <div
      id="daltoon-miniapp-root"
      dir="rtl"
      className="fixed inset-0 w-full h-[100dvh] bg-slate-950 text-slate-100 font-sans select-none flex flex-col overflow-hidden selection:bg-purple-500 selection:text-white"
    >
      <style>{getThemeStyles(activeDashboardTheme)}</style>
      {/* Background Neon Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header
        id="miniapp-header"
        className="shrink-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-lg"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                id="btn-miniapp-back"
                onClick={onBack}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="بازگشت"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-bold">
                <Zap className="w-5 h-5 fill-white/20" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  {systemSettings.botNickname || "دالتون وی‌پی‌ان"}
                </span>
                {isOwner || isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> سوپر ادمین (مالک)
                  </span>
                ) : isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> مدیر سیستم
                  </span>
                ) : userData?.isColleague ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> نماینده همکار
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> کاربر فعال
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {tgUser?.first_name || "کاربر"} {tgUser?.last_name || ""} {tgUser?.username ? `(@${tgUser.username})` : ""}
              </p>
            </div>
          </div>

          {/* Quick Balance / Refresh Pill */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-header-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 transition-all active:scale-95 disabled:opacity-50"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            </button>

            <button
              id="btn-header-wallet-badge"
              onClick={() => setActiveTab("wallet")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold hover:border-purple-500/60 transition-all active:scale-95 shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAdmin ? "نامحدود" : Number(userData?.walletBalance || 0).toLocaleString("fa-IR")}</span>
              <span className="text-[10px] text-slate-400 font-normal">{isAdmin ? "" : "تومان"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainScrollRef} className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-8 overflow-y-auto overscroll-contain relative z-10">
        {/* Loading State */}
        {loading && (() => {
          const customLogoUrl = (systemSettings?.miniAppSplashLogo?.trim() || (typeof localStorage !== "undefined" ? localStorage.getItem("daltoon_mini_app_splash_logo")?.trim() : "")) || "";
          const hasCustomLogo = !!customLogoUrl;
          return (
            <div className="flex flex-col items-center justify-center py-16 space-y-5 animate-fadeIn">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 opacity-40 blur-lg animate-pulse" />
                <div className={`relative ${hasCustomLogo ? "bg-white p-3 rounded-3xl shadow-2xl" : ""}`}>
                  <img
                    src={hasCustomLogo ? customLogoUrl : "/icon.svg"}
                    alt="Mini App Loading Splash Logo"
                    className={`w-36 h-36 object-contain ${hasCustomLogo ? "rounded-2xl" : "rounded-3xl shadow-2xl border border-white/10"}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/icon.svg";
                    }}
                  />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-white tracking-wider font-mono uppercase">
                  {systemSettings?.botNickname || "Telegram Daltoon Bot"}
                </h2>
                <p className="text-xs text-gray-400 font-sans animate-pulse">
                  در حال دریافت آخرین اطلاعات سرورها و پکیج‌ها...
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-6 h-6 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
              </div>
            </div>
          );
        })()}

        {/* Global Error Banner */}
        {errorMessage && !loading && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchMiniAppData()}
              className="text-[11px] bg-rose-500/20 px-2 py-1 rounded-lg text-rose-200 hover:bg-rose-500/30 font-medium"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Live Pending Receipt Approval Pulse Banner */}
        {pendingReceiptPurchase && !loading && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-500/40 text-amber-200 text-xs shadow-xl flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>رسید پرداختی شما در انتظار تایید مدیریت است</span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  به محض تایید، سرویس به صورت خودکار و بدون نیاز به رفرش فعال می‌شود...
                </p>
              </div>
            </div>
            <button
              onClick={() => silentFetchMiniAppData()}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl text-[10px] font-bold shrink-0 border border-amber-500/30 active:scale-95 transition-all"
            >
              بررسی آنی
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PLANS & PURCHASE WIZARD                                            */}
        {/* ========================================================================= */}
        {activeTab === "plans" && !loading && (
          <div id="view-plans-wizard" className="space-y-4">
            {/* Purchase Step Progress Header */}
            {purchaseStep < 5 && (
              <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800/80">
                {[
                  { step: 1, label: "۱. لوکیشن" },
                  { step: 2, label: "۲. پلن" },
                  { step: 3, label: "۳. نام و تخفیف" },
                  { step: 4, label: "۴. فاکتور" },
                ].map((s) => (
                  <button
                    key={s.step}
                    disabled={s.step > purchaseStep}
                    onClick={() => setPurchaseStep(s.step)}
                    className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-xl transition-all ${
                      purchaseStep === s.step
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : purchaseStep > s.step
                        ? "text-purple-300 hover:bg-slate-800/60"
                        : "text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: PUBLIC SERVER SELECTION ONLY (Colleague servers separated) */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" />
                    <span>انتخاب موقعیت و سرور (مدیریت سرورها)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {servers.length} سرور عمومی فعال
                  </span>
                </div>

                {servers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                    هیچ سرور عمومی فعالی یافت نشد. لطفاً از پنل مدیریت سرور اضافه فرمایید.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {servers.map((srv) => {
                      const isSelected = selectedServer?.id === srv.id;
                      const isServerActive = srv.status !== "inactive" && !srv.disabled;
                      return (
                        <div
                          key={srv.id}
                          id={`server-card-${srv.id}`}
                          onClick={() => {
                            setSelectedServer(srv);
                            if (window.Telegram?.WebApp?.HapticFeedback) {
                              window.Telegram.WebApp.HapticFeedback.selectionChanged();
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-900/40 to-slate-900 border-purple-500/80 shadow-lg shadow-purple-950/50"
                              : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-xl shadow-inner">
                              {srv.flag}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">
                                  {srv.name}
                                </span>
                                {isServerActive ? (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    فعال
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    غیرفعال
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-purple-500 bg-purple-600 text-white"
                                  : "border-slate-700 bg-slate-800"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next Step Button (Placed immediately under server selection) */}
                <button
                  id="btn-step1-next"
                  onClick={() => setPurchaseStep(2)}
                  disabled={!selectedServer}
                  className="w-full mt-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>مرحله بعد: انتخاب پلن</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* ------------------------------------------------------------- */}
                {/* FREE TEST SECTION UNDER NEXT STEP BUTTON                      */}
                {/* ------------------------------------------------------------- */}
                <div
                  id="section-free-test-under-servers"
                  className="mt-3.5 rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-950 p-4 shadow-xl shadow-emerald-950/30 space-y-3.5 relative"
                >
                  {/* Top glowing accent */}
                  <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 shrink-0">
                        <Gift className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>تست رایگان کیفیت و سرعت</span>
                          </h4>
                          {testAccountSettings.enabled ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              فعال
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              غیرفعال
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {testAccountSettings.enabled ? (
                            <>
                              یک کانفیگ اختصاصی{" "}
                              <b className="text-emerald-300">
                                {testAccountSettings.trafficGb < 1
                                  ? `${Math.round(testAccountSettings.trafficGb * 1024)} مگابایتی`
                                  : `${testAccountSettings.trafficGb} گیگابایتی`}
                              </b>{" "}
                              (
                              <b className="text-emerald-300">
                                {testAccountSettings.durationDays
                                  ? `${testAccountSettings.durationDays} روزه`
                                  : `${testAccountSettings.durationHours} ساعته`}
                              </b>
                              ) بدون هزینه دریافت کنید.
                            </>
                          ) : (
                            <span className="text-slate-400">
                              {testAccountSettings.disabledMessage || "اکانت تست رایگان فعلا موجود نیست."}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Free Test Server & Specs Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">حجم تست:</div>
                        <div className="text-[11px] font-bold text-slate-200 truncate">
                          {testAccountSettings.trafficGb < 1
                            ? `${Math.round(testAccountSettings.trafficGb * 1024)} مگابایت`
                            : `${testAccountSettings.trafficGb} گیگابایت`}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">مدت اعتبار:</div>
                        <div className="text-[11px] font-bold text-slate-200 truncate">
                          {testAccountSettings.durationDays
                            ? `${testAccountSettings.durationDays} روز`
                            : `${testAccountSettings.durationHours} ساعت`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Claim Button / Status Action */}
                  <div className="pt-1">
                    {testAccountSettings.hasUsed && !isAdmin ? (
                      <button
                        onClick={() =>
                          showThemedModal(
                            "تست رایگان قبلاً دریافت شده",
                            "❌ شما قبلاً اکانت تست رایگان خود را دریافت کرده‌اید!\nهر کاربر تنها یکبار مجاز به دریافت تست رایگان می‌باشد.",
                            "warning"
                          )
                        }
                        className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 py-2.5 rounded-2xl text-xs font-bold border border-slate-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>شما قبلاً تست رایگان دریافت کرده‌اید (استفاده شده)</span>
                      </button>
                    ) : !testAccountSettings.enabled ? (
                      <button
                        onClick={() =>
                          showThemedModal(
                            "تست رایگان غیرفعال است",
                            testAccountSettings.disabledMessage || "اکانت تست رایگان فعلا موجود نیست.",
                            "warning"
                          )
                        }
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 py-2.5 rounded-2xl text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>تست رایگان موقتاً غیرفعال است (مشاهده پیام)</span>
                      </button>
                    ) : (
                      <button
                        id="btn-claim-free-test-under-servers"
                        onClick={() => handleClaimFreeTest()}
                        disabled={claimingTest}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-2xl text-xs shadow-xl shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {claimingTest ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>در حال ساخت و تحویل آنی کانفیگ...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-slate-950" />
                            <span>دریافت تست رایگان</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inlined Instant Delivery Card if just claimed */}
                  {testSuccessSub && (
                    <div className="mt-3 rounded-2xl bg-slate-950 border border-emerald-500/50 p-4 space-y-3 shadow-2xl animate-fade-in">
                      {/* Live 20-Second Countdown Timer Header */}
                      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span>فرصت کپی کانفیگ:</span>
                          </div>
                          <span className="font-mono text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                            {testCountdown} ثانیه
                          </span>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
                          <div
                            className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-sm shadow-emerald-400/50"
                            style={{ width: `${Math.max(0, (testCountdown / 20) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                          پس از ۲۰ ثانیه، این کادر به صورت خودکار بسته‌شده و کانفیگ در «سرویس‌های من» حفظ می‌شود.
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-extrabold text-xs">اکانت تست شما با موفقیت صادر شد!</span>
                        </div>
                        <button
                          onClick={() => {
                            setTestSuccessSub(null);
                            setActiveTab("subs");
                          }}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          بستن
                        </button>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white p-2.5 rounded-xl mx-auto w-36 h-36 flex items-center justify-center shadow-md">
                        <img
                          src={getQrUrl(testSuccessSub.subLink)}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Sub Link Copy Box */}
                      <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>لینک ساب‌اسکریپشن هوشمند:</span>
                          <button
                            onClick={() => copyToClipboard(testSuccessSub.subLink, "free-test-inline-sub")}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                          >
                            {copiedId === "free-test-inline-sub" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === "free-test-inline-sub" ? "کپی شد" : "کپی لینک"}</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-emerald-200 font-mono break-all bg-slate-950 p-2 rounded-lg border border-slate-800 select-all">
                          {testSuccessSub.subLink}
                        </div>
                      </div>

                      {/* Individual Direct VLESS Links */}
                      {((testSuccessSub.vlessConfigs && testSuccessSub.vlessConfigs.length > 0) || (testSuccessSub.vlessLinks && testSuccessSub.vlessLinks.length > 0)) && (
                        <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 space-y-2">
                          <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span>لینک‌های مستقیم اتصال (VLESS):</span>
                          </div>
                          <div className="space-y-1.5">
                            {(testSuccessSub.vlessLinks && testSuccessSub.vlessLinks.length > 0
                              ? testSuccessSub.vlessLinks
                              : (testSuccessSub.vlessConfigs || []).map((url: string, idx: number) => ({
                                  name: `کانفیگ VLESS ${idx + 1}`,
                                  url: url
                                }))
                            ).map((item: any, idx: number) => {
                              const vlessUrl = typeof item === "string" ? item : item.url;
                              const vlessName = typeof item === "string" ? `کانفیگ ${idx + 1}` : (item.name || `کانفیگ ${idx + 1}`);
                              const copyId = `test-vless-${idx}`;
                              return (
                                <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-300 font-mono truncate flex-1 select-all" dir="ltr">
                                    {vlessUrl}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(vlessUrl, copyId)}
                                    className="text-emerald-400 hover:text-emerald-300 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-[10px] font-bold shrink-0 flex items-center gap-1"
                                  >
                                    {copiedId === copyId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === copyId ? "کپی شد" : "کپی"}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Quick Connect Apps */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <a
                          href={`v2rayng://install-sub?url=${encodeURIComponent(testSuccessSub.subLink)}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-lg text-[10px] font-bold transition-all border border-slate-700/60"
                        >
                          v2rayNG
                        </a>
                        <a
                          href={`streisand://install-sub?url=${encodeURIComponent(testSuccessSub.subLink)}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-lg text-[10px] font-bold transition-all border border-slate-700/60"
                        >
                          Streisand
                        </a>
                        <a
                          href={`v2box://install-sub?url=${encodeURIComponent(testSuccessSub.subLink)}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-lg text-[10px] font-bold transition-all border border-slate-700/60"
                        >
                          V2Box
                        </a>
                      </div>

                      {/* Go to My Subscriptions */}
                      <button
                        onClick={() => {
                          setTestSuccessSub(null);
                          setActiveTab("subs");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>متوجه شدم (مشاهده در سرویس‌های من)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: PLAN MODE (FIXED OR CUSTOM VOLUME)                    */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 2 && (
              <div className="space-y-4">
                {/* Mode Selector Toggle */}
                <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setPlanMode("fixed")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      planMode === "fixed"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>پلن‌های آماده و پرفروش</span>
                  </button>
                  {customPricing.enabled && (
                    <button
                      onClick={() => setPlanMode("custom")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        planMode === "custom"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>سفارشی و دلخواه (گیگ)</span>
                    </button>
                  )}
                </div>

                {/* MODE A: FIXED PLANS */}
                {planMode === "fixed" && (
                  <div className="space-y-3">
                    {/* Category Filter Chips */}
                    {availableCategories.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            selectedCategory === "all"
                              ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                              : "bg-slate-900/60 text-slate-400 border border-slate-800"
                          }`}
                        >
                          همه دسته‌ها
                        </button>
                        {availableCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                              selectedCategory === cat.name
                                ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                                : "bg-slate-900/60 text-slate-400 border border-slate-800"
                            }`}
                          >
                            {cat.emoji} {cat.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredPlans.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                        هیچ پلنی در این دسته‌بندی تعریف نشده است.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {filteredPlans.map((plan) => {
                          const isSelected = selectedPlan?.id === plan.id;
                          return (
                            <div
                              key={plan.id}
                              id={`plan-card-${plan.id}`}
                              onClick={() => {
                                setSelectedPlan(plan);
                                if (window.Telegram?.WebApp?.HapticFeedback) {
                                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                                }
                              }}
                              className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border-purple-500 shadow-xl shadow-purple-950/60"
                                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-white">
                                      {plan.name}
                                    </span>
                                    {plan.tag && (
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                        plan.tag.includes("پرفروش")
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                          : plan.tag.includes("اقتصادی")
                                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                          : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                      }`}>
                                        {plan.tag}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                                    <span className="flex items-center gap-1">
                                      <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                                      <span>{plan.trafficGb} گیگابایت</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>{plan.durationDays} روزه</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-left">
                                  <div className={`text-base font-extrabold ${isAdmin ? "text-emerald-400 font-black" : "text-purple-400"}`}>
                                    {isAdmin ? "رایگان" : Number(plan.price).toLocaleString("fa-IR")}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {isAdmin ? "ویژه مدیر کل" : "تومان"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* MODE B: CUSTOM VOLUME SLIDERS */}
                {planMode === "custom" && (
                  <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4 space-y-5 shadow-xl">
                    {/* Traffic Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                          <span>حجم ترافیک:</span>
                        </span>
                        <span className="font-extrabold text-purple-300 text-sm">
                          {customGb} گیگابایت
                        </span>
                      </div>
                      <input
                        type="range"
                        min={minCustomGb}
                        max={Math.max(300, minCustomGb + 50)}
                        step="5"
                        value={customGb}
                        onChange={(e) => setCustomGb(Math.max(minCustomGb, Number(e.target.value)))}
                        className="w-full accent-purple-500 bg-slate-800 rounded-lg h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{minCustomGb} GB (حداقل)</span>
                        <span>100 GB</span>
                        <span>200 GB</span>
                        <span>300 GB</span>
                      </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>مدت اعتبار:</span>
                        </span>
                        <span className="font-extrabold text-indigo-300 text-sm">
                          {customDays} روزه
                        </span>
                      </div>
                      <input
                        type="range"
                        min={minCustomDays}
                        max={Math.max(180, minCustomDays + 30)}
                        step="1"
                        value={customDays}
                        onChange={(e) => setCustomDays(Math.max(minCustomDays, Number(e.target.value)))}
                        className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{minCustomDays} روز (حداقل)</span>
                        <span>30 روز</span>
                        <span>90 روز</span>
                        <span>180 روز</span>
                      </div>
                    </div>

                    {/* Calculated Price Summary */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400">قیمت محاسبه شده:</span>
                      <span className="font-extrabold text-sm text-purple-400">
                        {isAdmin ? "رایگان (مدیر کل)" : `${customCalculatedPrice.toLocaleString("fa-IR")} تومان`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Back / Next Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseStep(1)}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-2xl font-bold text-xs transition-all"
                  >
                    مرحله قبل
                  </button>
                  <button
                    id="btn-step2-next"
                    onClick={() => setPurchaseStep(3)}
                    disabled={planMode === "fixed" && !selectedPlan}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>مرحله بعد: نام کاربری</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: CLIENT USERNAME & PROMO CODE                          */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4 space-y-4 shadow-xl">
                  {/* Custom Client Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>نام دلخواه برای کانفیگ (اختیاری):</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder={`user_${tgUser?.id || "vpn"}`}
                      value={clientUsername}
                      onChange={(e) => setClientUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-left font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-purple-900/30 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">شناسه نهایی در پنل:</span>
                      <span className="font-mono text-purple-300 font-bold tracking-wide" dir="ltr">{fullClientUsername}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      تنها از حروف انگلیسی و اعداد استفاده کنید. در صورت خالی بودن، به صورت خودکار ایجاد می‌شود.
                    </p>
                  </div>

                  {/* Promo Code Input (Hidden for Admin) */}
                  {!isAdmin && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>کد تخفیف:</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="مثلاً: DALTOON"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-left font-mono uppercase text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={validatingPromo || !promoCodeInput.trim()}
                          className="bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 px-4 rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                        >
                          {validatingPromo ? "..." : "اعمال"}
                        </button>
                      </div>

                      {promoError && (
                        <p className="text-[11px] text-rose-400 font-medium">{promoError}</p>
                      )}
                      {appliedPromo && (
                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>کد {appliedPromo.code} فعال شد ({appliedPromo.discountPercent ? `${appliedPromo.discountPercent}%` : `${appliedPromo.discountAmount} تومان`} تخفیف)</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Back / Next Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseStep(2)}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-2xl font-bold text-xs transition-all"
                  >
                    مرحله قبل
                  </button>
                  <button
                    id="btn-step3-next"
                    onClick={() => setPurchaseStep(4)}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>مرحله بعد: پیش‌فاکتور نهایی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: FINAL INVOICE & PAYMENT METHOD                        */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 4 && (
              <div className="space-y-4">
                {/* Admin Special Notification Banner */}
                {isAdmin && (
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/60 shadow-xl shadow-amber-950/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <span>دسترسی ویژه مدیر کل - ساخت ۱۰۰٪ رایگان</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      شما به عنوان مدیر ربات شناسایی شدید. ایجاد هرگونه کانفیگ برای شما بدون نیاز به کسر موجودی یا فیش بانکی، کاملاً فوری و نامحدود انجام می‌گردد.
                    </p>
                  </div>
                )}

                {/* Invoice Summary Card */}
                <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                    پیش‌فاکتور نهایی خرید اشتراک
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">سرور و لوکیشن:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <span>{selectedServer?.flag}</span>
                        <span>{selectedServer?.name}</span>
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">پلن انتخابی:</span>
                      <span className="font-bold text-purple-300">
                        {planMode === "custom"
                          ? `کانفیگ دلخواه (${customGb} گیگ - ${customDays} روز)`
                          : selectedPlan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">نام کاربری کانفیگ:</span>
                      <span className="font-mono text-purple-300 font-bold" dir="ltr">
                        {fullClientUsername}
                      </span>
                    </div>

                    {appliedPromo && !isAdmin && (
                      <div className="flex justify-between text-emerald-400">
                        <span>تخفیف اعمال شده:</span>
                        <span>
                          {appliedPromo.discountAmount
                            ? `-${Number(appliedPromo.discountAmount).toLocaleString("fa-IR")} تومان`
                            : `-${appliedPromo.discountPercent}%`}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">مبلغ قابل پرداخت:</span>
                      <span className="text-base font-extrabold text-purple-400">
                        {isAdmin ? "۰ تومان (رایگان ویژه مدیر)" : `${checkoutPrice.toLocaleString("fa-IR")} تومان`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Normal User Payment Method Selector */}
                {!isAdmin && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300">انتخاب روش پرداخت:</h4>

                    <div
                      className={`grid gap-2.5 ${
                        isWalletAllowed && isCardToCardAllowed ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {/* Wallet Method */}
                      {isWalletAllowed && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("wallet")}
                          className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                            paymentMethod === "wallet"
                              ? "bg-purple-900/30 border-purple-500 shadow-md shadow-purple-950/40"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <CreditCard className="w-4 h-4 text-purple-400" />
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                paymentMethod === "wallet" ? "border-purple-500 bg-purple-600" : "border-slate-700"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">کیف پول داخلی</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              موجودی: {Number(userData?.walletBalance || 0).toLocaleString("fa-IR")} ت
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Card to Card Method */}
                      {isCardToCardAllowed && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card_to_card")}
                          className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                            paymentMethod === "card_to_card"
                              ? "bg-purple-900/30 border-purple-500 shadow-md shadow-purple-950/40"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <ExternalLink className="w-4 h-4 text-indigo-400" />
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                paymentMethod === "card_to_card" ? "border-purple-500 bg-purple-600" : "border-slate-700"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">کارت به کارت</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">ثبت رسید و تایید فوری</div>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Card to Card Details Box & Gallery Image Receipt */}
                    {paymentMethod === "card_to_card" && (
                      <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-3.5 space-y-3">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                            <span>اطلاعات کارت جهت واریز:</span>
                            <span className="text-[10px] text-slate-400">یک کارت را جهت انتقال انتخاب کنید</span>
                          </div>
                          
                          <div className="space-y-2">
                            {effectiveCards.map((c, idx) => (
                              <div key={idx} className="bg-slate-950/90 p-3 rounded-xl border border-indigo-900/40 space-y-1.5 text-xs shadow-inner">
                                <div className="flex justify-between items-center">
                                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{c.bank || "کارت بانکی مقصد"}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(c.number.replace(/\s+/g, ""), `card-${idx}`)}
                                    className="text-[10px] bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 px-2 py-1 rounded-lg border border-indigo-700/50 flex items-center gap-1 font-mono transition-all"
                                  >
                                    {copiedId === `card-${idx}` ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">کپی شد</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-indigo-400" />
                                        <span>کپی کارت</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="flex justify-between items-center pt-0.5">
                                  <span className="text-slate-400 text-[11px]">شماره کارت:</span>
                                  <span className="font-mono font-bold text-white tracking-widest text-sm dir-ltr select-all">
                                    {c.number}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400 text-[11px]">به نام:</span>
                                  <span className="font-medium text-slate-200">{c.holder || "مدیریت"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Gallery Image Receipt Upload & Preview */}
                        <div className="space-y-2 pt-1 border-t border-indigo-900/30">
                          <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>ارسال فیش واریزی از گالری:</span>
                            </span>
                            <strong className="text-rose-400 font-extrabold text-[10px]">(اجباری *)</strong>
                          </label>

                          {cardReceiptImage && cardReceiptImage.startsWith("data:image") ? (
                            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 space-y-2">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>تصویر رسید از گالری انتخاب شد</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCardReceiptImage("")}
                                  className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-900/50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>حذف</span>
                                </button>
                              </div>
                              <img
                                src={cardReceiptImage}
                                alt="رسید واریز"
                                className="w-full max-h-44 object-contain rounded-xl bg-slate-900"
                              />
                            </div>
                          ) : (
                            <div>
                              <input
                                id="purchase-receipt-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) processImageFile(file, (b64) => setCardReceiptImage(b64));
                                }}
                              />
                              <label
                                htmlFor="purchase-receipt-upload"
                                className="w-full flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 cursor-pointer transition-all gap-1.5 text-center group"
                              >
                                <div className="w-9 h-9 rounded-full bg-indigo-900/60 group-hover:bg-indigo-800 flex items-center justify-center text-indigo-300">
                                  <Upload className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-indigo-200">
                                  انتخاب تصویر فیش از گالری گوشی
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  فرمت‌های JPG، PNG (حداکثر ۱۵ مگابایت)
                                </span>
                              </label>
                            </div>
                          )}

                          {/* Alternative or Extra Tracking Text */}
                          <div className="pt-1 space-y-1">
                            <input
                              type="text"
                              placeholder="یا وارد کردن شماره پیگیری / کد تراکنش (اختیاری)"
                              value={cardReceiptImage.startsWith("data:image") ? "" : cardReceiptImage}
                              onChange={(e) => {
                                if (!cardReceiptImage.startsWith("data:image")) {
                                  setCardReceiptImage(e.target.value);
                                }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {!cardReceiptImage.trim() ? (
                            <p className="text-[11px] text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>لطفاً تصویر فیش واریز را انتخاب کنید تا دکمه ثبت فعال شود.</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>مشخصات فیش واریز آماده ارسال است.</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Back / Pay Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseStep(3)}
                    disabled={purchasing}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-2xl font-bold text-xs transition-all disabled:opacity-50"
                  >
                    مرحله قبل
                  </button>

                  <button
                    id="btn-final-purchase"
                    onClick={handlePurchase}
                    disabled={
                      purchasing ||
                      (!isAdmin && paymentMethod === "card_to_card" && !cardReceiptImage.trim()) ||
                      (!isAdmin && paymentMethod === "wallet" && Number(userData?.walletBalance || 0) < checkoutPrice)
                    }
                    className={`w-2/3 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 ${
                      isAdmin
                        ? "bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-slate-950 shadow-amber-500/20 hover:brightness-110"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30"
                    } disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {purchasing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isAdmin ? (
                      <Crown className="w-4 h-4 fill-slate-950" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>
                      {purchasing
                        ? "در حال پردازش..."
                        : isAdmin
                        ? "⚡ ساخت فوری و رایگان (ویژه مدیر)"
                        : paymentMethod === "card_to_card"
                        ? "ثبت نهایی رسید کارت به کارت"
                        : "پرداخت نهایی و دریافت کانفیگ"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: INSTANT DELIVERY VIEW (QR CODE & CONFIG / SUB LINK)   */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 5 && deliveredSubKey && (
              <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-purple-950/30 border border-purple-500/50 p-5 space-y-4 shadow-2xl animate-fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-white mt-2">
                    اشتراک شما با موفقیت ساخته شد!
                  </h3>
                  <p className="text-xs text-slate-400">
                    لینک ساب‌اسکریپشن هوشمند شما آماده اتصال به تمام نرم‌افزارهاست.
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
                  <img
                    src={getQrUrl(deliveredSubKey.subLink)}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Sub Link Copy Box */}
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>لینک اشتراک اختصاصی (Subscription):</span>
                    <button
                      onClick={() => copyToClipboard(deliveredSubKey.subLink, "delivered-sub")}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold"
                    >
                      {copiedId === "delivered-sub" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === "delivered-sub" ? "کپی شد" : "کپی لینک"}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-purple-200 font-mono break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800 select-all">
                    {deliveredSubKey.subLink}
                  </div>
                </div>

                {/* Direct VLESS Links Row by Row */}
                {((deliveredSubKey.vlessConfigs && deliveredSubKey.vlessConfigs.length > 0) || (deliveredSubKey.vlessLinks && deliveredSubKey.vlessLinks.length > 0)) && (
                  <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-bold flex items-center gap-1.5 text-purple-300">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>لینک‌های مستقیم پروتکل VLESS:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30">
                        {deliveredSubKey.vlessLinks?.length || deliveredSubKey.vlessConfigs?.length} اینباند
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(deliveredSubKey.vlessLinks && deliveredSubKey.vlessLinks.length > 0
                        ? deliveredSubKey.vlessLinks
                        : (deliveredSubKey.vlessConfigs || []).map((url: string, idx: number) => ({
                            name: `کانفیگ VLESS مستقیم ${idx + 1}`,
                            url: url
                          }))
                      ).map((item: any, idx: number) => {
                        const linkUrl = typeof item === "string" ? item : item.url;
                        const linkName = typeof item === "string" ? `کانفیگ ${idx + 1}` : (item.name || `کانفیگ ${idx + 1}`);
                        const copyKey = `deliv-vless-${idx}`;
                        return (
                          <div key={idx} className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between gap-2.5 hover:border-slate-700 transition-all">
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold text-slate-200 truncate">
                                {linkName}
                              </div>
                              <div className="text-[10px] text-purple-300/80 font-mono truncate select-all" dir="ltr">
                                {linkUrl}
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(linkUrl, copyKey)}
                              className="text-purple-300 hover:text-purple-200 px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl border border-purple-500/30 text-[11px] font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                            >
                              {copiedId === copyKey ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-purple-300" />
                              )}
                              <span>{copiedId === copyKey ? "کپی شد" : "کپی"}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick App Connect Links */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium">اتصال مستقیم به نرم‌افزارها:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`v2rayng://install-sub?url=${encodeURIComponent(deliveredSubKey.subLink)}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-xl text-[11px] font-bold transition-all border border-slate-700/60"
                    >
                      v2rayNG
                    </a>
                    <a
                      href={`streisand://install-sub?url=${encodeURIComponent(deliveredSubKey.subLink)}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-xl text-[11px] font-bold transition-all border border-slate-700/60"
                    >
                      Streisand
                    </a>
                    <a
                      href={`v2box://install-sub?url=${encodeURIComponent(deliveredSubKey.subLink)}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center rounded-xl text-[11px] font-bold transition-all border border-slate-700/60"
                    >
                      V2Box
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setPurchaseStep(1);
                      setActiveTab("subs");
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-lg"
                  >
                    مشاهده در سرویس‌های من
                  </button>
                  <button
                    onClick={() => {
                      setPurchaseStep(1);
                      setDeliveredSubKey(null);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl font-bold text-xs transition-all"
                  >
                    خرید مجدد
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY SERVICES / SUBSCRIPTIONS                                        */}
        {/* ========================================================================= */}
        {activeTab === "subs" && !loading && (
          <div id="view-my-subscriptions" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>سرویس‌ها و کانفیگ‌های فعال شما</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {subscriptions.length} اشتراک ثبت شده
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">هنوز سرویسی خریداری نکرده‌اید</h4>
                  <p className="text-xs text-slate-400">
                    می‌توانید از بخش خرید اشتراک، بهترین پلن را انتخاب و فعال نمایید.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
                >
                  مشاهده و خرید پلن‌ها
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search & Sort Controls Bar */}
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 space-y-2.5 shadow-lg">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={subSearchQuery}
                      onChange={(e) => setSubSearchQuery(e.target.value)}
                      placeholder="جستجوی کانفیگ (نام، سرور، آی‌دی، پلن)..."
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500/60 rounded-xl pr-9 pl-9 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                    {subSearchQuery && (
                      <button
                        onClick={() => setSubSearchQuery("")}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Status Chips & Sort Dropdown */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[11px] font-bold">
                      <button
                        onClick={() => setSubStatusFilter("all")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          subStatusFilter === "all"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        همه ({subscriptions.length})
                      </button>
                      <button
                        onClick={() => setSubStatusFilter("active")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          subStatusFilter === "active"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        فعال ({subscriptions.filter((s: any) => (s.status || "").toLowerCase() === "active" && !s.disabled).length})
                      </button>
                      <button
                        onClick={() => setSubStatusFilter("inactive")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          subStatusFilter === "inactive"
                            ? "bg-rose-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        معلق/پایان ({subscriptions.filter((s: any) => (s.status || "").toLowerCase() !== "active" || s.disabled).length})
                      </button>
                    </div>

                    {/* Custom Sort Selector Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsSortModalOpen(true)}
                      className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800/80 active:scale-95 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-purple-500/50 text-xs text-slate-200 font-bold transition-all shadow-sm group"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0 group-hover:text-purple-300 transition-colors" />
                      <span>
                        {subSortOrder === "newest" && "⚡ جدیدترین"}
                        {subSortOrder === "oldest" && "⏳ قدیمی‌ترین"}
                        {subSortOrder === "highest_traffic" && "📊 بیشترین حجم"}
                        {subSortOrder === "expiring_soon" && "⚠️ بیشترین مصرف"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Custom Bottom Sheet / Modal for Sort Options */}
                {isSortModalOpen && (
                  <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
                    onClick={() => setIsSortModalOpen(false)}
                  >
                    <div
                      className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl shadow-purple-950/50 animate-in slide-in-from-bottom-8 duration-250"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Pull handle bar */}
                      <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto" />

                      {/* Header */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
                            <ArrowUpDown className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-white">مرتب‌سازی اشتراک‌ها</h3>
                            <p className="text-[10.5px] text-slate-400">شیوه چینش و نمایش کانفیگ‌های خود را انتخاب کنید</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsSortModalOpen(false)}
                          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Options List */}
                      <div className="space-y-2 pt-1">
                        {[
                          {
                            id: "newest",
                            title: "جدیدترین (پیش‌فرض)",
                            emoji: "⚡",
                            desc: "نمایش اولویت با کانفیگ‌های تازه خریداری یا تمدید شده",
                            badge: "پیشنهادی",
                            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                          },
                          {
                            id: "oldest",
                            title: "قدیمی‌ترین",
                            emoji: "⏳",
                            desc: "نمایش از قدیمی‌ترین اشتراک‌ها به جدیدترین",
                          },
                          {
                            id: "highest_traffic",
                            title: "بیشترین حجم",
                            emoji: "📊",
                            desc: "نمایش به ترتیب بالاترین سقف ترافیک (گیگابایت)",
                          },
                          {
                            id: "expiring_soon",
                            title: "بیشترین مصرف",
                            emoji: "⚠️",
                            desc: "اولویت با کانفیگ‌های نزدیک به اتمام حجم یا مصرف بالا",
                          },
                        ].map((opt) => {
                          const isSelected = subSortOrder === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setSubSortOrder(opt.id as any);
                                setIsSortModalOpen(false);
                              }}
                              className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                                isSelected
                                  ? "bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/30 text-white"
                                  : "bg-slate-950/90 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                                    isSelected
                                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                                      : "bg-slate-900 border border-slate-800 text-slate-200"
                                  }`}
                                >
                                  {opt.emoji}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-white">{opt.title}</span>
                                    {opt.badge && (
                                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold border ${opt.badgeColor}`}>
                                        {opt.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 leading-tight">{opt.desc}</p>
                                </div>
                              </div>

                              {/* Radio Check Circle */}
                              <div className="shrink-0 pl-1">
                                {isSelected ? (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/40">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 hover:border-slate-500 transition-colors" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Close Button */}
                      <button
                        type="button"
                        onClick={() => setIsSortModalOpen(false)}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl border border-slate-700/80 transition-all shadow-md"
                      >
                        بستن و اعمال
                      </button>
                    </div>
                  </div>
                )}

                {filteredSubscriptions.length === 0 ? (
                  <div className="p-6 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">اشتراکی با این مشخصات یافت نشد</h4>
                      <p className="text-[11px] text-slate-400">
                        عبارت جستجو یا فیلترهای اعمال شده را تغییر دهید.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubSearchQuery("");
                        setSubStatusFilter("all");
                        setSubSortOrder("newest");
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 px-3.5 py-1.5 rounded-xl font-bold transition-all border border-slate-700"
                    >
                      پاک کردن فیلترها
                    </button>
                  </div>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const used = Number(sub.trafficUsedGb || 0);
                    const limit = Number(sub.trafficLimitGb || 30);
                    const percent = Math.min(100, Math.round((used / (limit || 1)) * 100));
                    const subIdStr = String(sub.id || sub.clientUuid);
                    const isExpanded = expandedSubId === subIdStr;

                    return (
                      <div
                        key={sub.id}
                        id={`sub-card-${sub.id}`}
                        className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden transition-all duration-300"
                      >
                        {/* Collapsed Header / Toggle Button */}
                        <div
                          onClick={() => handleToggleSubAccordion(sub)}
                          className="p-4 cursor-pointer hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 select-none"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-white truncate">
                                {sub.planName || "اشتراک اختصاصی"}
                              </span>
                              {sub.serverName && (
                                <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shrink-0">
                                  <span>{sub.serverFlag || "🌐"}</span>
                                  <span>{sub.serverName}</span>
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                (sub.status || "").toLowerCase() === "disabled" || (sub.status || "").toLowerCase() === "inactive" || (sub.status || "").toLowerCase() === "expired" || sub.disabled === true
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}>
                                {(sub.status || "").toLowerCase() === "disabled" || sub.disabled === true ? "غیرفعال" : (sub.status || "").toLowerCase() === "expired" ? "منقضی" : "فعال"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <p className="text-[11px] text-slate-400 font-mono truncate">
                                {sub.clientName || sub.id}
                              </p>
                              <span className="text-[11px] text-purple-300 font-extrabold font-mono shrink-0">
                                {used.toFixed(1)} / {limit} GB ({percent}%)
                              </span>
                            </div>

                            {/* Mini Usage Bar in Collapsed view */}
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percent > 85 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-purple-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Expand/Collapse Chevron Indicator */}
                          <div className="flex flex-col items-center justify-center gap-1 shrink-0 pl-1">
                            <div className={`p-2 rounded-2xl transition-all ${isExpanded ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold">
                              {isExpanded ? "بستن" : "جزئیات"}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Accordion Content */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5 animate-fade-in">
                            {/* Detailed Expiration & Connection Status */}
                            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                              <div className="flex justify-between text-xs text-slate-400 font-medium">
                                <span>تاریخ انقضا:</span>
                                <span className="text-white font-bold">{sub.expireDate ? formatDateTime(sub.expireDate, { timeZone: "Asia/Tehran", calendarSystem: "jalali", includeTime: false }) : "۳۰ روزه"}</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400 font-medium">
                                <span>وضعیت اتصال:</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  پایدار
                                </span>
                              </div>
                            </div>

                            {/* Sublink Copy Box */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 block">لینک ساب‌اسکریپشن (هوشمند):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  dir="ltr"
                                  value={sub.subLink || ""}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 select-all truncate text-left"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(sub.subLink, `sub-${sub.id}`);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-purple-600/30"
                                >
                                  {copiedId === `sub-${sub.id}` ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedId === `sub-${sub.id}` ? "کپی شد" : "کپی ساب"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons: QR, Change Link, Renew, Suspend/Active, Delete */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                              {/* Barcode QR Button */}
                              <button
                                onClick={() => setActiveQrModal(sub.subLink)}
                                className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                                title="نمایش بارکد QR"
                              >
                                <QrCode className="w-3.5 h-3.5 text-purple-400" />
                                <span>بارکد QR</span>
                              </button>

                              {/* Change Link Button */}
                              <button
                                type="button"
                                onClick={() => handleMiniAppRegenerateUuid(sub)}
                                disabled={regeneratingKeyId === (sub.id || sub.clientUuid)}
                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                title="تغییر لینک و شناسه اتصال"
                              >
                                <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${regeneratingKeyId === (sub.id || sub.clientUuid) ? 'animate-spin' : ''}`} />
                                <span>{regeneratingKeyId === (sub.id || sub.clientUuid) ? "در حال تغییر..." : "تغییر لینک"}</span>
                              </button>

                              {/* Renew Button */}
                              <button
                                onClick={() => {
                                  setRenewModalKey(sub);
                                  setRenewModalGb("30");
                                  setRenewModalDays("30");
                                }}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                                title="تمدید اشتراک"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تمدید</span>
                              </button>

                              {/* Suspend / Active Button */}
                              <button
                                onClick={() => handleMiniAppToggleStatus(sub)}
                                disabled={togglingKeyId === (sub.id || sub.clientUuid)}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 ${
                                  (sub.status || "").toLowerCase() === "active" && !sub.disabled
                                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>
                                  {togglingKeyId === (sub.id || sub.clientUuid)
                                    ? "در حال پردازش..."
                                    : (sub.status || "").toLowerCase() === "active" && !sub.disabled
                                    ? "تعلیق"
                                    : "فعال"}
                                </span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setConfirmDeleteKey(sub)}
                                className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] font-bold transition-colors mr-auto flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>

                            {/* Direct VLESS Links Section */}
                            <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800/80 space-y-2">
                              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-purple-300">
                                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                  <span>لینک‌های مستقیم VLESS:</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchLiveSubLinksForService(sub, true);
                                    }}
                                    disabled={fetchingSubLinksId === subIdStr}
                                    title="بروزرسانی اینباندها از لینک ساب"
                                    className="text-[10px] text-purple-400 hover:text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${fetchingSubLinksId === subIdStr ? "animate-spin text-amber-400" : ""}`} />
                                    <span>بروزرسانی</span>
                                  </button>
                                  <span className="text-slate-400 font-mono text-[10px]">
                                    {fetchingSubLinksId === subIdStr ? (
                                      <span className="text-amber-400 flex items-center gap-1">
                                        در حال استخراج...
                                      </span>
                                    ) : (
                                      `${sub.vlessLinks?.length || sub.vlessConfigs?.length || 0} اینباند`
                                    )}
                                  </span>
                                </div>
                              </div>

                              {fetchingSubLinksId === subIdStr && (!sub.vlessConfigs || sub.vlessConfigs.length === 0) ? (
                                <div className="p-3 text-center text-xs text-slate-400 space-y-1">
                                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400 mx-auto" />
                                  <p>در حال استخراج اینباندهای واقعی از ساب‌اسکریپشن...</p>
                                </div>
                              ) : ((sub.vlessConfigs && sub.vlessConfigs.length > 0) || (sub.vlessLinks && sub.vlessLinks.length > 0)) ? (
                                <div className="space-y-1.5">
                                  {(sub.vlessLinks && sub.vlessLinks.length > 0
                                    ? sub.vlessLinks
                                    : (sub.vlessConfigs || []).map((url: string, idx: number) => ({
                                        name: `کانفیگ VLESS ${idx + 1}`,
                                        url: url
                                      }))
                                  ).map((item: any, idx: number) => {
                                    const linkUrl = typeof item === "string" ? item : item.url;
                                    const copyKey = `sub-vless-${sub.id}-${idx}`;
                                    return (
                                      <div key={idx} className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-slate-300 font-mono truncate flex-1 select-all" dir="ltr">
                                          {linkUrl}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(linkUrl, copyKey);
                                          }}
                                          className="text-purple-300 hover:text-purple-200 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20 text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all"
                                        >
                                          {copiedId === copyKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                          <span>{copiedId === copyKey ? "کپی شد" : "کپی"}</span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 text-center py-2">
                                  لینک مستقیمی برای این سرور یافت نشد. می‌توانید از لینک ساب‌اسکریپشن فوق استفاده نمایید.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COLLEAGUES PORTAL (Specialized Login & Free Config Creation)        */}
        {/* ========================================================================= */}
        {activeTab === "colleagues" && !loading && (
          <div id="view-colleagues-portal" className="space-y-4">
            {!colleagueLoggedIn ? (
              <div className="space-y-4">
                {/* 1. Main 3-Row Menu Mode */}
                {colleagueSubTab === "menu" && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 p-5 text-center space-y-2 shadow-xl relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="w-12 h-12 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-base text-white">
                        بخش ویژه همکاران و نمایندگان
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        مدیریت پکیج‌های ترافیکی حجمی، ساخت کانفیگ اختصاصی و اتصال به سرورهای پرسرعت همکاران
                      </p>
                    </div>

                    {/* 3 Sequential Row Menu Items */}
                    <div className="space-y-3">
                      {/* Row 1: خرید بسته همکاری */}
                      <button
                        onClick={() => setColleagueSubTab("packages")}
                        className="w-full text-right p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/60 transition-all group relative overflow-hidden shadow-lg shadow-amber-500/5 active:scale-[0.99] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-amber-500/10">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                                خرید بسته همکاری
                              </span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                تخفیف عمده
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              خرید پکیج حجمی و دریافت آنی نام کاربری و پیشوند دلخواه
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:bg-slate-700 shrink-0 transition-all mr-2">
                          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* Row 2: ورود به حساب همکار (اگر از قبل بسته خریداری کرده اید) */}
                      <button
                        onClick={() => setColleagueSubTab("login")}
                        className="w-full text-right p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-500/60 transition-all group relative overflow-hidden shadow-lg shadow-purple-500/5 active:scale-[0.99] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/10">
                            <KeyRound className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                                ورود به حساب همکار
                              </span>
                              {userColleagueAccounts.length > 0 && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                                  {userColleagueAccounts.length} حساب فعال
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-purple-300/80 font-medium mt-0.5">
                              (اگر از قبل بسته خریداری کرده اید)
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ورود به پنل و ساخت نامحدود کانفیگ از سهمیه پکیج
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-300 group-hover:bg-slate-700 shrink-0 transition-all mr-2">
                          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                      </button>

                      {/* Row 3: بازیابی رمز عبور همکار */}
                      <button
                        onClick={() => setColleagueSubTab("recover")}
                        className="w-full text-right p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-500/60 transition-all group relative overflow-hidden shadow-lg shadow-indigo-500/5 active:scale-[0.99] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/10">
                            <RefreshCw className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">
                                بازیابی رمز عبور همکار
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              بازیابی آنی کلمه عبور با استفاده از توکن امنیتی اختصاصی
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 group-hover:bg-slate-700 shrink-0 transition-all mr-2">
                          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Dedicated Page 1: Buy Colleague Package */}
                {colleagueSubTab === "packages" && (
                  <div className="space-y-3">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setColleagueSubTab("menu")}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                        <span>بازگشت به منوی گزینه‌های همکار</span>
                      </div>
                      <span className="text-[10px] text-slate-500">منوی اصلی</span>
                    </button>

                    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
                      <div className="text-center space-y-1">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-base text-white">
                          خرید بسته ویژه همکاران
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          با خرید بسته همکار، یک حساب کاربری اختصاصی با پیشوند و توکن دلخواه شما تولید می‌شود و می‌توانید با آن کانفیگ‌های دلخواه بسازید.
                        </p>
                      </div>

                      {/* Colleague Packages List */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">انتخاب پکیج همکار:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {colleaguePackages.map((pkg) => {
                            const isSelected = selectedColleaguePkg?.id === pkg.id;
                            return (
                              <div
                                key={pkg.id}
                                onClick={() => setSelectedColleaguePkg(pkg)}
                                className={`p-3.5 rounded-2xl cursor-pointer border transition-all relative ${
                                  isSelected
                                    ? "bg-purple-950/60 border-purple-500 shadow-md shadow-purple-500/20"
                                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-bold text-xs text-white">{pkg.title}</div>
                                    <div className="text-[10px] text-purple-300 mt-0.5">
                                      حجم: {pkg.trafficGb} گیگ • مدت: {pkg.durationDays} روز
                                    </div>
                                  </div>
                                  <div className="text-right font-mono font-extrabold text-amber-400 text-xs">
                                    {Number(pkg.price || 0).toLocaleString("fa-IR")} ت
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                                  {pkg.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Account Settings: Prefix & Recovery Token */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">پیشوند کانفیگ‌ها:</label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="مثلاً VIP یا Col"
                            value={colleaguePrefixInput}
                            onChange={(e) => setColleaguePrefixInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">
                            توکن امنیتی بازیابی <span className="text-rose-400 font-extrabold text-[10px]">* (اجباری)</span>:
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="کد امنیتی دلخواه"
                            value={colleagueTokenInput}
                            onChange={(e) => setColleagueTokenInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs font-bold text-slate-300">روش پرداخت:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setColleaguePaymentMethod("wallet")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              colleaguePaymentMethod === "wallet"
                                ? "bg-purple-600/30 border-purple-500 text-purple-200"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>{isAdmin ? "رایگان (مدیریت)" : "موجودی کیف پول"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setColleaguePaymentMethod("card_to_card")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              colleaguePaymentMethod === "card_to_card"
                                ? "bg-purple-600/30 border-purple-500 text-purple-200"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>کارت به کارت</span>
                          </button>
                        </div>

                        {/* Mandatory Card Receipt Input & Gallery Uploader */}
                        {colleaguePaymentMethod === "card_to_card" && (
                          <div className="space-y-2.5 p-3 rounded-2xl bg-slate-950 border border-purple-900/40 text-xs">
                            <div className="space-y-1.5">
                              <div className="text-[11px] text-purple-300 font-bold flex items-center justify-between">
                                <span>💳 شماره کارت مقصد:</span>
                                <span className="text-[10px] text-slate-400">یک کارت را جهت انتقال انتخاب کنید</span>
                              </div>
                              <div className="space-y-1.5">
                                {effectiveCards.map((c, idx) => (
                                  <div key={idx} className="bg-slate-900/90 p-2.5 rounded-xl border border-purple-800/40 flex justify-between items-center text-xs">
                                    <div>
                                      <div className="text-purple-300 font-bold flex items-center gap-1">
                                        <CreditCard className="w-3 h-3 text-purple-400" />
                                        <span>{c.bank || "بانک مقصد"}</span>
                                        <span className="text-slate-400 text-[10px]">({c.holder || "مدیریت"})</span>
                                      </div>
                                      <div className="font-mono font-bold text-white tracking-wider text-[11px] dir-ltr select-all mt-0.5">
                                        {c.number}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(c.number.replace(/\s+/g, ""), `col-card-${idx}`)}
                                      className="text-[10px] bg-purple-950 hover:bg-purple-900 text-purple-200 px-2 py-1 rounded-lg border border-purple-700/50 flex items-center gap-1 font-mono transition-all"
                                    >
                                      {copiedId === `col-card-${idx}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">کپی شد</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-purple-300" />
                                          <span>کپی</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Gallery Image Upload for Colleague */}
                            <div className="space-y-2 pt-1 border-t border-purple-900/30">
                              <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                                  <span>ارسال تصویر فیش از گالری:</span>
                                </span>
                                <strong className="text-rose-400 font-extrabold text-[10px]">(اجباری *)</strong>
                              </label>

                              {colleagueCardReceipt && colleagueCardReceipt.startsWith("data:image") ? (
                                <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 bg-slate-900 p-2 space-y-1.5">
                                  <div className="flex items-center justify-between px-1">
                                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>تصویر رسید پیوست شد</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setColleagueCardReceipt("")}
                                      className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-900/50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>حذف</span>
                                    </button>
                                  </div>
                                  <img
                                    src={colleagueCardReceipt}
                                    alt="رسید واریز"
                                    className="w-full max-h-36 object-contain rounded-lg bg-slate-950"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <input
                                    id="colleague-receipt-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) processImageFile(file, (b64) => setColleagueCardReceipt(b64));
                                    }}
                                  />
                                  <label
                                    htmlFor="colleague-receipt-upload"
                                    className="w-full flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 cursor-pointer transition-all gap-1 text-center group"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-purple-900/60 group-hover:bg-purple-800 flex items-center justify-center text-purple-300">
                                      <Upload className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-purple-200">
                                      انتخاب تصویر فیش از گالری
                                    </span>
                                  </label>
                                </div>
                              )}

                              {/* Extra text input */}
                              <input
                                type="text"
                                placeholder="یا شناسه پیگیری / کد تراکنش (اختیاری)"
                                value={colleagueCardReceipt.startsWith("data:image") ? "" : colleagueCardReceipt}
                                onChange={(e) => {
                                  if (!colleagueCardReceipt.startsWith("data:image")) {
                                    setColleagueCardReceipt(e.target.value);
                                  }
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleColleagueBuyPackage}
                        disabled={buyingColleaguePkg || !colleagueTokenInput.trim() || (colleaguePaymentMethod === "card_to_card" && !colleagueCardReceipt.trim())}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 py-3 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {buyingColleaguePkg ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>
                          {isAdmin ? "فعال‌سازی فوری بسته همکار (رایگان ویژه ادمین)" : "تکمیل خرید و دریافت نام کاربری و رمز همکار"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Dedicated Page 2: Colleague Login */}
                {colleagueSubTab === "login" && (
                  <div className="space-y-3">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => setColleagueSubTab("menu")}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
                        <span>بازگشت به منوی گزینه‌های همکار</span>
                      </div>
                      <span className="text-[10px] text-slate-500">منوی اصلی</span>
                    </button>

                    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
                      <div className="text-center space-y-1.5">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-base text-white">
                          ورود به حساب اختصاصی همکار
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          با وارد کردن نام کاربری و کلمه عبور اختصاصی خود وارد شده و به صورت رایگان از سهمیه پکیج خود کانفیگ بسازید.
                        </p>
                      </div>

                      {/* Saved Accounts Quick Login */}
                      {userColleagueAccounts.length > 0 && (
                        <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-2xl space-y-2">
                          <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>حساب‌های فعال شما (ورود سریع یک‌کلیک):</span>
                          </div>
                          <div className="space-y-1.5">
                            {userColleagueAccounts.map((acc) => (
                              <button
                                key={acc.id}
                                onClick={() => handleQuickLoginColleague(acc)}
                                className="w-full text-right p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 flex items-center justify-between text-xs transition-all"
                              >
                                <div>
                                  <span className="font-bold text-white font-mono">{acc.prefix || acc.username}</span>
                                  <span className="text-[10px] text-purple-400 mr-2">
                                    ({acc.packageTitle} - {acc.remainingTrafficGb?.toFixed(1)} GB باقیمانده)
                                  </span>
                                </div>
                                <span className="text-[10px] bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded-lg font-bold">
                                  ورود ⚡
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleColleagueLogin} className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            <span>نام کاربری همکار:</span>
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="Colleague Username"
                            value={colleagueUsernameInput}
                            onChange={(e) => setColleagueUsernameInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-left font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>کلمه عبور همکار:</span>
                          </label>
                          <input
                            type="password"
                            dir="ltr"
                            placeholder="••••••••"
                            value={colleaguePasswordInput}
                            onChange={(e) => setColleaguePasswordInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-left font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={colleagueLoggingIn || !colleagueUsernameInput || !colleaguePasswordInput}
                          className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {colleagueLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                          <span>ورود به حساب همکار</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Dedicated Page 3: Password Recovery */}
                {colleagueSubTab === "recover" && (
                  <div className="space-y-3">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (verifiedRecoveryAccount) {
                          setVerifiedRecoveryAccount(null);
                        } else {
                          setColleagueSubTab("menu");
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
                        <span>
                          {verifiedRecoveryAccount ? "بازگشت به مرحله قبل (ورود توکن)" : "بازگشت به منوی گزینه‌های همکار"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {verifiedRecoveryAccount ? "ویرایش توکن" : "منوی اصلی"}
                      </span>
                    </button>

                    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
                      {!verifiedRecoveryAccount ? (
                        /* Step 1: Token Entry Only */
                        <>
                          <div className="text-center space-y-1.5">
                            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                              <KeyRound className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-white">
                              بازیابی کلمه عبور همکار
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              لطفاً توکن امنیتی بازیابی که هنگام خرید بسته تعیین کرده‌اید را وارد کنید.
                            </p>
                          </div>

                          <form onSubmit={handleVerifyRecoveryToken} className="space-y-3 pt-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-300">توکن امنیتی بازیابی:</label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="Security Token"
                                value={recoverTokenInput}
                                onChange={(e) => setRecoverTokenInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={verifyingRecoveryToken || !recoverTokenInput.trim()}
                              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              {verifyingRecoveryToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                              <span>بررسی و شناسایی توکن</span>
                            </button>
                          </form>
                        </>
                      ) : (
                        /* Step 2: Set New Username & New Password */
                        <>
                          <div className="text-center space-y-1.5">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-extrabold text-base text-white">
                              تنظیم نام کاربری و کلمه عبور جدید
                            </h3>
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium">
                              توکن بازیابی تایید شد ✓ ({verifiedRecoveryAccount.packageTitle || "حساب همکار"})
                            </div>
                          </div>

                          <form onSubmit={handleUpdateColleagueCredentials} className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-300">نام کاربری جدید همکار:</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  dir="ltr"
                                  placeholder="New Username"
                                  value={newColleagueUsername}
                                  onChange={(e) => setNewColleagueUsername(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                                />
                                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-300">کلمه عبور جدید همکار:</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  dir="ltr"
                                  placeholder="New Password"
                                  value={newColleaguePassword}
                                  onChange={(e) => setNewColleaguePassword(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                                />
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={updatingColleagueCredentials || !newColleagueUsername.trim() || !newColleaguePassword.trim()}
                              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                              {updatingColleagueCredentials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              <span>تایید و بروزرسانی حساب</span>
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Colleague Dashboard & Client Management */
              <div className="space-y-4">
                {/* Colleague Status Card */}
                <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-500/40 p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white">
                          همکار گرامی ({colleagueAccount?.prefix || colleagueAccount?.username}) خوش آمدید
                        </div>
                        <div className="text-[10px] text-purple-300">
                          {colleagueAccount?.packageTitle || "بسته همکار"} • پیشوند: {colleagueAccount?.prefix}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setColleagueLoggedIn(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs flex items-center gap-1 border border-slate-700"
                      title="خروج از حساب همکار"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>خروج</span>
                    </button>
                  </div>

                  {/* Volume Allowance Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">حجم کل پکیج</div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {colleagueAccount?.trafficGb} GB
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">تخصیص داده شده</div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">
                        {Number(colleagueAccount?.allocatedTrafficGb || 0).toFixed(1)} GB
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">حجم باقیمانده مجاز</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        {Number(colleagueAccount?.remainingTrafficGb || 0).toFixed(1)} GB
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const pkg = (colleaguePackages || []).find((p: any) => p.id === colleagueAccount?.packageId);
                      const minAllowedGb = Number(
                        colleagueAccount?.minCreateGb ||
                        pkg?.minCreateGb ||
                        systemSettings?.colleagueMinCreateGb ||
                        systemSettings?.minCreateGb ||
                        0
                      );
                      setColleagueNewGb(String(minAllowedGb > 0 ? minAllowedGb : 10));
                      setIsColleagueCreateOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3 rounded-2xl font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>➕ ساخت کانفیگ جدید برای همکار (رایگان)</span>
                  </button>
                </div>

                {/* Colleague Clients List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>کاربران ساخته شده توسط شما ({colleagueClients.length})</span>
                    </h4>
                  </div>

                  {/* Search Box & Sort Filter */}
                  {colleagueClients.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="جستجوی کانفیگ یا نام..."
                          value={colleagueSearch}
                          onChange={(e) => setColleagueSearch(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div className="w-28">
                        <CustomSelect
                          value={colleagueSort}
                          onChange={(val) => setColleagueSort(val as "newest" | "oldest")}
                          options={[
                            { value: "newest", label: "جدیدترین" },
                            { value: "oldest", label: "قدیمی‌ترین" },
                          ]}
                          title="مرتب‌سازی"
                          dir="rtl"
                          size="compact"
                        />
                      </div>
                    </div>
                  )}

                  {colleagueClients.length === 0 ? (
                    <div className="p-6 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                      هنوز هیچ کانفیگی با این حساب همکار ایجاد نکرده‌اید.
                    </div>
                  ) : filteredColleagueClients.length === 0 ? (
                    <div className="p-6 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                      هیچ کانفیگی مطابق با عبارت «{colleagueSearch}» یافت نشد.
                    </div>
                  ) : (
                    filteredColleagueClients.map((client) => {
                      const used = Number(client.trafficUsedGb || 0);
                      const limit = Number(client.trafficLimitGb || 10);
                      const percent = Math.min(100, Math.round((used / (limit || 1)) * 100));
                      const clientIdStr = String(client.id || client.clientUuid);
                      const isExpanded = expandedSubId === clientIdStr;

                      return (
                        <div
                          key={client.id || client.clientUuid}
                          className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden transition-all duration-300"
                        >
                          {/* Collapsed Header / Toggle Button */}
                          <div
                            onClick={() => handleToggleSubAccordion(client)}
                            className="p-4 cursor-pointer hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 select-none"
                          >
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-white truncate">
                                  {client.clientName || client.remark || "کانفیگ همکار"}
                                </span>
                                {client.serverName && (
                                  <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shrink-0">
                                    <span>{client.serverFlag || "🌐"}</span>
                                    <span>{client.serverName}</span>
                                  </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                  (client.status || "").toLowerCase() === "disabled" || (client.status || "").toLowerCase() === "inactive" || (client.status || "").toLowerCase() === "expired" || client.disabled === true
                                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                }`}>
                                  {(client.status || "").toLowerCase() === "disabled" || client.disabled === true ? "غیرفعال" : (client.status || "").toLowerCase() === "expired" ? "منقضی" : "فعال"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <p className="text-[11px] text-slate-400 font-mono truncate">
                                  {client.clientUuid || client.id}
                                </p>
                                <span className="text-[11px] text-purple-300 font-extrabold font-mono shrink-0">
                                  {used.toFixed(1)} / {limit} GB ({percent}%)
                                </span>
                              </div>

                              {/* Mini Usage Bar in Collapsed view */}
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-1">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    percent > 85 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-purple-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Expand/Collapse Chevron Indicator */}
                            <div className="flex flex-col items-center justify-center gap-1 shrink-0 pl-1">
                              <div className={`p-2 rounded-2xl transition-all ${isExpanded ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold">
                                {isExpanded ? "بستن" : "جزئیات"}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Accordion Content */}
                          {isExpanded && (
                            <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5 animate-fade-in">
                              {/* Detailed Expiration & Connection Status */}
                              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                                <div className="flex justify-between text-xs text-slate-400 font-medium">
                                  <span>تاریخ انقضا:</span>
                                  <span className="text-white font-bold">{client.expireDate ? formatDateTime(client.expireDate, { timeZone: "Asia/Tehran", calendarSystem: "jalali", includeTime: false }) : "۳۰ روزه"}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 font-medium">
                                  <span>وضعیت اتصال:</span>
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    پایدار
                                  </span>
                                </div>
                              </div>

                              {/* Sublink Copy Box */}
                              {client.subLink && (
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 block">لینک ساب‌اسکریپشن (هوشمند):</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      readOnly
                                      dir="ltr"
                                      value={client.subLink || ""}
                                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 select-all truncate text-left"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(client.subLink, `col-sub-${client.id}`);
                                      }}
                                      className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-purple-600/30"
                                    >
                                      {copiedId === `col-sub-${client.id}` ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>{copiedId === `col-sub-${client.id}` ? "کپی شد" : "کپی ساب"}</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons: QR, Change Link, Renew, Suspend/Active, Delete */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                                {/* Barcode QR Button */}
                                {client.subLink && (
                                  <button
                                    onClick={() => setActiveQrModal(client.subLink)}
                                    className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                                    title="نمایش بارکد QR"
                                  >
                                    <QrCode className="w-3.5 h-3.5 text-purple-400" />
                                    <span>بارکد QR</span>
                                  </button>
                                )}

                                {/* Change Link Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMiniAppRegenerateUuid(client)}
                                  disabled={regeneratingKeyId === (client.id || client.clientUuid)}
                                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                  title="تغییر لینک و شناسه اتصال"
                                >
                                  <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${regeneratingKeyId === (client.id || client.clientUuid) ? 'animate-spin' : ''}`} />
                                  <span>{regeneratingKeyId === (client.id || client.clientUuid) ? "در حال تغییر..." : "تغییر لینک"}</span>
                                </button>

                                {/* Renew Button */}
                                <button
                                  onClick={() => {
                                    setRenewModalKey(client);
                                    setRenewModalGb("30");
                                    setRenewModalDays("30");
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                                  title="تمدید اشتراک"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>تمدید</span>
                                </button>

                                {/* Suspend / Active Button */}
                                <button
                                  onClick={() => handleMiniAppToggleStatus(client)}
                                  disabled={togglingKeyId === (client.id || client.clientUuid)}
                                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 ${
                                    (client.status || "").toLowerCase() === "active" && !client.disabled
                                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>
                                    {togglingKeyId === (client.id || client.clientUuid)
                                      ? "در حال پردازش..."
                                      : (client.status || "").toLowerCase() === "active" && !client.disabled
                                      ? "تعلیق"
                                      : "فعال"}
                                  </span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setConfirmDeleteKey(client)}
                                  className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] font-bold transition-colors mr-auto flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف</span>
                                </button>
                              </div>

                              {/* Direct VLESS Links Section */}
                              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800/80 space-y-2">
                                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-purple-300">
                                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                    <span>لینک‌های مستقیم VLESS:</span>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fetchLiveSubLinksForService(client, true);
                                      }}
                                      disabled={fetchingSubLinksId === clientIdStr}
                                      title="بروزرسانی اینباندها از لینک ساب"
                                      className="text-[10px] text-purple-400 hover:text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${fetchingSubLinksId === clientIdStr ? "animate-spin text-amber-400" : ""}`} />
                                      <span>بروزرسانی</span>
                                    </button>
                                    <span className="text-slate-400 font-mono text-[10px]">
                                      {fetchingSubLinksId === clientIdStr ? (
                                        <span className="text-amber-400 flex items-center gap-1">
                                          در حال استخراج...
                                        </span>
                                      ) : (
                                        `${client.vlessLinks?.length || client.vlessConfigs?.length || 0} اینباند`
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {fetchingSubLinksId === clientIdStr && (!client.vlessConfigs || client.vlessConfigs.length === 0) ? (
                                  <div className="p-3 text-center text-xs text-slate-400 space-y-1">
                                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400 mx-auto" />
                                    <p>در حال استخراج اینباندهای واقعی از ساب‌اسکریپشن...</p>
                                  </div>
                                ) : ((client.vlessConfigs && client.vlessConfigs.length > 0) || (client.vlessLinks && client.vlessLinks.length > 0)) ? (
                                  <div className="space-y-1.5">
                                    {(client.vlessLinks && client.vlessLinks.length > 0
                                      ? client.vlessLinks
                                      : (client.vlessConfigs || []).map((url: string, idx: number) => ({
                                          name: `کانفیگ VLESS ${idx + 1}`,
                                          url: url
                                        }))
                                    ).map((item: any, idx: number) => {
                                      const linkUrl = typeof item === "string" ? item : item.url;
                                      const copyKey = `col-vless-${client.id}-${idx}`;
                                      return (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                                          <input
                                            type="text"
                                            readOnly
                                            value={linkUrl}
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 truncate select-all"
                                          />
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyToClipboard(linkUrl, copyKey);
                                            }}
                                            className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all"
                                          >
                                            {copiedId === copyKey ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedId === copyKey ? "کپی شد" : "کپی"}</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveQrModal(linkUrl);
                                            }}
                                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg shrink-0 transition-all"
                                            title="QR Code"
                                          >
                                            <QrCode className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="p-2 text-center text-[10px] text-slate-500">
                                    هیچ اینباند مستقیمی یافت نشد. می‌توانید از لینک ساب‌اسکریپشن بالای صفحه استفاده کنید.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Colleague Create Client Modal */}
                {isColleagueCreateOpen && (
                  <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>ساخت کانفیگ همکار</span>
                        </h4>
                        <button
                          onClick={() => setIsColleagueCreateOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Server Selection for Colleague */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">سرور:</label>
                        <CustomSelect
                          value={colleagueSelectedServer?.id || ""}
                          onChange={(val) => {
                            const found = [...colleagueServers, ...servers].find((s) => s.id === val);
                            if (found) setColleagueSelectedServer(found);
                          }}
                          options={(colleagueServers.length > 0 ? colleagueServers : servers).map((s) => ({
                            value: s.id,
                            label: `${s.flag} ${s.name} ${s.isColleague ? "(ویژه همکاران)" : ""}`,
                          }))}
                          title="انتخاب سرور"
                          dir="rtl"
                        />
                      </div>

                      {/* Client Name Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">
                          نام کاربر (پیشوند {colleagueAccount?.prefix}_ خودکار اضافه می‌شود):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="client1"
                          value={colleagueNewClientName}
                          onChange={(e) => setColleagueNewClientName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Volume & Days */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">
                            حجم (GB){Number(colleagueAccount?.minCreateGb || systemSettings?.colleagueMinCreateGb || systemSettings?.minCreateGb || 0) > 0 && (
                              <span className="text-[10px] text-amber-400 font-normal mr-1">
                                (حداقل {colleagueAccount?.minCreateGb || systemSettings?.colleagueMinCreateGb || systemSettings?.minCreateGb}G)
                              </span>
                            )}:
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="30"
                            value={colleagueNewGb}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setColleagueNewGb(val);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">مدت (روز):</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="30"
                            value={colleagueNewDays}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setColleagueNewDays(val);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleColleagueCreateClient}
                        disabled={colleagueCreatingClient}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3 rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {colleagueCreatingClient ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>تایید و ساخت فوری کانفیگ همکار</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WALLET & DEPOSIT                                                   */}
        {/* ========================================================================= */}
        {activeTab === "wallet" && !loading && (
          <div id="view-wallet" className="space-y-4">
            {/* Balance Overview Card */}
            <div className="rounded-3xl bg-gradient-to-br from-purple-900/60 via-indigo-950 to-slate-900 border border-purple-500/40 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-inner">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">موجودی کیف پول شما</div>
                    <div className="text-xl font-extrabold text-white">
                      {isAdmin ? "نامحدود (مدیر کل)" : `${Number(userData?.walletBalance || 0).toLocaleString("fa-IR")} تومان`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fetchMiniAppData()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="بروزرسانی موجودی"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span>تعداد سرویس‌های فعال:</span>
                <span className="font-bold text-purple-300">
                  {userData?.activePlansCount || subscriptions.length} سرویس
                </span>
              </div>
            </div>

            {/* Deposit Request Box (Card to Card) */}
            {!isAdmin && (
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-4 shadow-xl">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>افزایش موجودی کیف پول (کارت به کارت)</span>
                </h4>

                {/* Bank Card Info */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>اطلاعات کارت جهت واریز:</span>
                    <span className="text-[10px] text-slate-400">کارت مقصد را انتخاب کنید</span>
                  </div>
                  <div className="space-y-2">
                    {effectiveCards.map((c, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs shadow-inner">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            <span>{c.bank || "کارت بانکی مقصد"}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c.number.replace(/\s+/g, ""), `dep-card-${idx}`)}
                            className="text-[10px] bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 px-2 py-1 rounded-lg border border-purple-700/50 flex items-center gap-1 font-mono transition-all"
                          >
                            {copiedId === `dep-card-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">کپی شد</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-purple-400" />
                                <span>کپی کارت</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-slate-400 text-[11px]">شماره کارت:</span>
                          <span className="font-mono font-bold text-white tracking-widest text-sm dir-ltr select-all">
                            {c.number}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-[11px]">به نام:</span>
                          <span className="font-medium text-slate-200">{c.holder || "مدیریت"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount Selection Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">مبالغ پیشنهادی شارژ:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 200000, 300000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          depositAmount === amt
                            ? "bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {(amt / 1000).toLocaleString("fa-IR")} ت
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">یا مبلغ دلخواه (تومان):</label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Gallery Image Receipt Upload & Preview for Deposit */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>ارسال تصویر فیش شارژ از گالری:</span>
                    </span>
                    <strong className="text-rose-400 font-extrabold text-[10px]">(اجباری *)</strong>
                  </label>

                  {depositReceipt && depositReceipt.startsWith("data:image") ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تصویر فیش از گالری پیوست شد</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setDepositReceipt("")}
                          className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-900/50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                      <img
                        src={depositReceipt}
                        alt="رسید شارژ"
                        className="w-full max-h-44 object-contain rounded-xl bg-slate-900"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        id="deposit-receipt-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processImageFile(file, (b64) => setDepositReceipt(b64));
                        }}
                      />
                      <label
                        htmlFor="deposit-receipt-upload"
                        className="w-full flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 cursor-pointer transition-all gap-1.5 text-center group"
                      >
                        <div className="w-9 h-9 rounded-full bg-purple-900/60 group-hover:bg-purple-800 flex items-center justify-center text-purple-300">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-purple-200">
                          انتخاب تصویر فیش واریز از گالری
                        </span>
                        <span className="text-[10px] text-slate-400">
                          فرمت‌های تصویری JPG، PNG
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Alternative Tracking Text */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="یا وارد کردن شماره پیگیری / کد تراکنش (اختیاری)"
                      value={depositReceipt.startsWith("data:image") ? "" : depositReceipt}
                      onChange={(e) => {
                        if (!depositReceipt.startsWith("data:image")) {
                          setDepositReceipt(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitDeposit}
                  disabled={depositing || !depositAmount || depositAmount < 10000 || !depositReceipt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {depositing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>ارسال رسید شارژ برای تایید مدیریت</span>
                </button>
              </div>
            )}

            {/* Transactions History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">تاریخچه تراکنش‌های اخیر</h4>
              {transactions.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                  هیچ تراکنشی ثبت نشده است.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{tx.description || tx.type}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {tx.id} • {new Date(tx.date).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-purple-400">
                        {Number(tx.amount || 0).toLocaleString("fa-IR")} تومان
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          tx.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : tx.status === "pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {tx.status === "approved" ? "موفق" : tx.status === "pending" ? "در انتظار تایید" : "رد شده"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PROFILE & DETAILED USER STATS                                      */}
        {/* ========================================================================= */}
        {activeTab === "profile" && !loading && (
          <div id="view-profile" className="space-y-4">
            {/* User Profile Header Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30 border-2 border-purple-400/30">
                      {tgUser?.first_name ? tgUser.first_name[0] : "U"}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">
                        {tgUser?.first_name || "کاربر"} {tgUser?.last_name || ""}
                      </span>
                      {isOwner || isSuperAdmin ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-sm">
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> مالک و سوپر ادمین
                        </span>
                      ) : isAdmin ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> مدیر سیستم
                        </span>
                      ) : userData?.isColleague ? (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> نماینده همکار
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> کاربر فعال
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
                      <span>شناسه: {tgUser?.id || userData?.id || "نامشخص"}</span>
                      {tgUser?.username && <span className="text-purple-400">(@{tgUser.username})</span>}
                      <button
                        onClick={() => copyToClipboard(String(tgUser?.id || userData?.id || ""), "user-id")}
                        className="p-1 hover:text-white transition-colors text-slate-500"
                        title="کپی شناسه"
                      >
                        {copiedId === "user-id" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsProfileRefreshing(true);
                    await fetchMiniAppData();
                    setIsProfileRefreshing(false);
                    showThemedModal("بروزرسانی موفق", "اطلاعات حساب و پروفایل شما با موفقیت بروزرسانی شد.", "success");
                  }}
                  disabled={isProfileRefreshing}
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
                  title="بروزرسانی داده‌ها"
                >
                  <RefreshCw className={`w-4 h-4 ${isProfileRefreshing ? "animate-spin text-purple-400" : ""}`} />
                </button>
              </div>

              {/* Account Quick Status Line */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> تاریخ ورود / عضویت:
                </span>
                <span className="font-bold text-slate-200">
                  {userData?.createdAt ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(userData.createdAt)) : "امروز"}
                </span>
              </div>
            </div>

            {/* Comprehensive Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Date Joined */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>تاریخ عضویت</span>
                </div>
                <div className="text-xs font-extrabold text-white">
                  {userData?.createdAt ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(userData.createdAt)) : "امروز"}
                </div>
              </div>

              {/* 2. Invited Friends */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تعداد دعوت شدگان</span>
                </div>
                <div className="text-xs font-extrabold text-indigo-300">
                  {userData?.invitedCount || 0} نفر
                </div>
              </div>

              {/* 3. Wallet Balance */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>موجودی کیف پول</span>
                </div>
                <div className="text-xs font-extrabold text-emerald-300">
                  {isAdmin ? "نامحدود" : `${Number(userData?.walletBalance || 0).toLocaleString("fa-IR")} تومان`}
                </div>
              </div>

              {/* 4. Active Plans */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>سرویس‌های فعال</span>
                </div>
                <div className="text-xs font-extrabold text-amber-300">
                  {subscriptions.filter((s: any) => s.status === "active").length} سرویس
                </div>
              </div>

              {/* 5. Total Volume */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                  <span>کل ترافیک خریداری شده</span>
                </div>
                <div className="text-xs font-extrabold text-sky-300">
                  {userData?.totalTrafficGb || subscriptions.reduce((acc: number, s: any) => acc + Number(s.trafficLimitGb || s.traffic_limit_gb || s.totalGb || 0), 0)} GB
                </div>
              </div>

              {/* 6. Total Payments */}
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <CreditCard className="w-3.5 h-3.5 text-pink-400" />
                  <span>مجموع پرداختی‌ها</span>
                </div>
                <div className="text-xs font-extrabold text-pink-300">
                  {Number(userData?.totalDeposits || 0).toLocaleString("fa-IR")} تومان
                </div>
              </div>
            </div>

            {/* Dedicated Referral System & Invitation Link Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                  <Gift className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">سیستم دعوت از دوستان (زیرمجموعه‌گیری)</h4>
                  <p className="text-[11px] text-slate-400">با ارسال لینک اختصاصی زیر دوستان خود را دعوت کنید.</p>
                </div>
              </div>

              {/* Referral Link Box */}
              {(() => {
                const rawBot = systemSettings.botUsername || systemSettings.channelUsername || "DaltoonBot";
                const cleanBot = rawBot.replace(/^@/, '').replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '') || "DaltoonBot";
                const refLink = `https://t.me/${cleanBot}?start=ref_${tgUser?.id || userData?.id || ''}`;
                return (
                  <div className="space-y-2">
                    <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-purple-300 truncate select-all dir-ltr text-left w-full">
                        {refLink}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyToClipboard(refLink, "ref-link")}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        {copiedId === "ref-link" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                        <span>{copiedId === "ref-link" ? "کپی شد!" : "کپی لینک دعوت"}</span>
                      </button>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('🚀 به ربات پرسرعت دالتون وی‌پی‌ان بپیوندید و از اینترنت آزاد لذت ببرید!')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-purple-600/20"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>اشتراک‌گذاری در تلگرام</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Account Technical Details */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-400" />
                <span>مشخصات فنی و وضعیت حساب کاربری</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">سطح دسترسی حساب:</span>
                  <span className="font-bold text-purple-300">
                    {isOwner || isSuperAdmin
                      ? "👑 مالک و مدیر ارشد (Super Admin)"
                      : isAdmin
                      ? "🛡️ مدیر سیستم (Admin)"
                      : userData?.isColleague
                      ? "🤝 نماینده همکار (Colleague)"
                      : "👤 کاربر فعال"}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">کد معرف شما:</span>
                  <span className="font-mono font-bold text-indigo-300">ref_{tgUser?.id || userData?.id || "N/A"}</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">تعداد تیکت‌های پشتیبانی:</span>
                  <span className="font-bold text-white">{userData?.totalTicketsCount || tickets.length} تیکت</span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">وضعیت امنیت مینی‌اپ:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> احراز هویت شده
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Support Links */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">ارتباط و پشتیبانی سریع</h4>
              <div className="grid grid-cols-2 gap-2">
                {systemSettings.channelUsername && (
                  <a
                    href={`https://t.me/${systemSettings.channelUsername.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 text-center text-xs font-bold text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>کانال اطلاع‌رسانی</span>
                  </a>
                )}
                {systemSettings.supportUsername && (
                  <a
                    href={`https://t.me/${systemSettings.supportUsername.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 text-center text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>پی‌وی پشتیبان</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SUPPORT TICKETS                                                    */}
        {/* ========================================================================= */}
        {activeTab === "support" && !loading && (
          <div id="view-support" className="space-y-4">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-3 shadow-xl">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>ارسال تیکت جدید به پشتیبانی</span>
              </h4>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="موضوع تیکت (مثلاً: سوال در مورد نحوه اتصال)..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />

                <textarea
                  rows={3}
                  placeholder="متن پیام خود را بنویسید..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none"
                />

                <button
                  onClick={handleSubmitTicket}
                  disabled={submittingTicket || !ticketMessage.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingTicket ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>ارسال تیکت به کارشناسان</span>
                </button>
              </div>
            </div>

            {/* Previous Tickets */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">تیکت‌های قبلی شما</h4>
              {tickets.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                  هیچ تیکت پشتیبانی قبلی وجود ندارد.
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{t.subject || "درخواست پشتیبانی"}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          t.status === "answered"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {t.status === "answered" ? "پاسخ داده شد" : "در انتظار پاسخ"}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      {t.message || t.lastMessage}
                    </p>
                    {t.reply && (
                      <div className="bg-purple-950/30 border border-purple-500/30 p-2 rounded-xl text-[11px] text-purple-200">
                        <strong className="text-purple-400 font-bold block mb-1">پاسخ پشتیبان:</strong>
                        {t.reply}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* THEMED NOTIFICATION MODAL (Harmonized with Theme, Replaces Native Alert)   */}
      {/* ========================================================================= */}
      {customModal.isOpen && (
        <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl shadow-purple-950/60 text-center animate-fade-in my-auto">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
              {customModal.type === "success" && (
                <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-full h-full rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {customModal.type === "error" && (
                <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 w-full h-full rounded-2xl flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              {customModal.type === "warning" && (
                <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 w-full h-full rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {customModal.type === "info" && (
                <div className="bg-purple-500/20 text-purple-400 border border-purple-500/30 w-full h-full rounded-2xl flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-white">{customModal.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{customModal.message}</p>
            </div>

            <button
              onClick={closeThemedModal}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              {customModal.buttonText || "متوجه شدم"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QR CODE MODAL                                                             */}
      {/* ========================================================================= */}
      {activeQrModal && (
        <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl text-center animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-xs text-white">اسکن بارکد اشتراک</span>
              <button onClick={() => setActiveQrModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
              <img src={getQrUrl(activeQrModal)} alt="QR Code" className="w-full h-full object-contain" />
            </div>

            <button
              onClick={() => copyToClipboard(activeQrModal, "modal-qr-copy")}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedId === "modal-qr-copy" ? "لینک کپی شد" : "کپی لینک ساب‌اسکریپشن"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RENEW SUBSCRIPTION MODAL                                                  */}
      {/* ========================================================================= */}
      {renewModalKey && (
        <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-right animate-fade-in my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">تمدید و ارتقای اشتراک</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{renewModalKey.planName || renewModalKey.clientName || renewModalKey.id}</span>
                </div>
              </div>
              <button onClick={() => { setRenewModalKey(null); setRenewCardReceiptImage(""); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>حجم اضافه (گیگابایت):</span>
                <span className="text-emerald-400 font-mono">+{renewModalGb} GB</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["10", "20", "30", "50"].map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => setRenewModalGb(gb)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      renewModalGb === gb
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    +{gb} GB
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="1000"
                value={renewModalGb}
                onChange={(e) => setRenewModalGb(e.target.value)}
                placeholder="مقدار دلخواه گیگابایت..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 text-center font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Days Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>مدت زمان اضافه (روز):</span>
                <span className="text-indigo-400 font-mono">+{renewModalDays} روز</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {["30", "60", "90"].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRenewModalDays(days)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      renewModalDays === days
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-950"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {days} روز
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="365"
                value={renewModalDays}
                onChange={(e) => setRenewModalDays(e.target.value)}
                placeholder="مقدار دلخواه روز..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 text-center font-mono focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Summary Preview & Pricing Calculation */}
            {(() => {
              const gb = Math.max(0, Number(renewModalGb) || 0);
              const days = Math.max(0, Number(renewModalDays) || 0);
              let pricePerGb = 3000;
              let pricePerDay = 2000;
              const boxes = customPricing?.boxes || [];
              const srvId = renewModalKey?.serverId;
              const matchedBox = Array.isArray(boxes) ? boxes.find((b: any) => Array.isArray(b.serverIds) && b.serverIds.some((sid: any) => String(sid) === String(srvId))) : null;
              if (matchedBox) {
                if (matchedBox.pricePerGb) pricePerGb = Number(matchedBox.pricePerGb);
                if (matchedBox.pricePerDay) pricePerDay = Number(matchedBox.pricePerDay);
              } else {
                if (customPricing?.defaultPricePerGb) pricePerGb = Number(customPricing.defaultPricePerGb);
                if (customPricing?.defaultPricePerDay) pricePerDay = Number(customPricing.defaultPricePerDay);
              }
              const cost = (gb * pricePerGb) + (days * pricePerDay);
              const balance = Number(userData?.balance ?? userData?.walletBalance ?? 0);
              const isFree = isAdmin || isOwner || userRole === "admin" || userRole === "owner";
              const isInsufficient = !isFree && renewPaymentMethod === "wallet" && balance < cost && cost > 0;

              return (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>حجم کل جدید:</span>
                    <span className="font-bold text-emerald-300 font-mono">
                      {(Number(renewModalKey.trafficLimitGb || 0) + gb)} GB
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>نرخ محاسبه:</span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      گیگی {pricePerGb.toLocaleString()} + روزی {pricePerDay.toLocaleString()} ت
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-900">
                    <span className="font-bold">مبلغ فاکتور تمدید:</span>
                    <span className="font-extrabold text-amber-400 text-sm font-mono">
                      {isFree ? "رایگان (مدیر)" : `${cost.toLocaleString()} تومان`}
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  {!isFree && (
                    <div className="pt-2 border-t border-slate-900 space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 block">انتخاب روش پرداخت:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRenewPaymentMethod("wallet")}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            renewPaymentMethod === "wallet"
                              ? "bg-purple-500/20 border-purple-500/60 text-purple-200 shadow-md shadow-purple-950"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold">کیف پول</span>
                          <span className="text-[10px] text-slate-400 font-mono">{balance.toLocaleString()} ت</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenewPaymentMethod("card_to_card")}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            renewPaymentMethod === "card_to_card"
                              ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-950"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold">کارت به کارت</span>
                          <span className="text-[10px] text-slate-400">ارسال فیش واریزی</span>
                        </button>
                      </div>

                      {/* Wallet Balance Check */}
                      {renewPaymentMethod === "wallet" && isInsufficient && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 text-rose-300 text-[11px] flex items-center justify-between mt-2">
                          <span>⚠️ موجودی کیف پول کمتر از مبلغ تمدید است</span>
                          <button
                            type="button"
                            onClick={() => {
                              setRenewModalKey(null);
                              setActiveTab("wallet");
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md shadow-rose-600/30"
                          >
                            شارژ کیف پول
                          </button>
                        </div>
                      )}

                      {/* Card-to-Card Info & Upload */}
                      {renewPaymentMethod === "card_to_card" && (
                        <div className="mt-2 space-y-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span>اطلاعات کارت جهت واریز تمدید:</span>
                            </span>
                            <span className="text-[10px] text-slate-400">یک کارت را جهت انتقال انتخاب کنید</span>
                          </div>

                          {effectiveCards.length > 0 ? (
                            <div className="space-y-2">
                              {effectiveCards.map((c, idx) => (
                                <div key={idx} className="bg-slate-950/90 p-3 rounded-xl border border-emerald-900/40 space-y-1.5 text-xs shadow-inner">
                                  <div className="flex justify-between items-center">
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>{c.bank || "کارت بانکی مقصد"}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(c.number.replace(/\s+/g, ""), `renew-card-${idx}`)}
                                      className="text-[10px] bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-700/50 flex items-center gap-1 font-mono transition-all font-bold"
                                    >
                                      {copiedId === `renew-card-${idx}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">کپی شد</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-emerald-400" />
                                          <span>کپی شماره کارت</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="flex justify-between items-center pt-0.5">
                                    <span className="text-slate-400 text-[11px]">شماره کارت:</span>
                                    <span className="font-mono text-emerald-300 font-bold text-sm tracking-widest" dir="ltr">
                                      {c.number}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-[11px]">به نام:</span>
                                    <span className="text-slate-200 font-bold text-xs">{c.holder || "مدیریت سرور"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 text-center py-2 bg-slate-950/60 rounded-xl">
                              شماره کارتی در سیستم تنظیم نشده است. لطفاً با پشتیبانی در ارتباط باشید.
                            </div>
                          )}

                          {/* Upload Receipt */}
                          <div className="pt-1.5">
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">تصویر فیش یا رسید واریز:</label>
                            {renewCardReceiptImage ? (
                              <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 max-h-36 bg-black flex items-center justify-center">
                                <img src={renewCardReceiptImage} alt="Receipt" className="object-contain max-h-36 w-full" />
                                <button
                                  type="button"
                                  onClick={() => setRenewCardReceiptImage("")}
                                  className="absolute top-1 left-1 bg-rose-600/90 text-white p-1 rounded-lg text-[10px] flex items-center gap-1 hover:bg-rose-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>حذف</span>
                                </button>
                              </div>
                            ) : (
                              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all">
                                <Upload className="w-5 h-5 text-emerald-400" />
                                <span className="text-[11px] text-slate-300 font-bold">انتخاب عکس فیش از گالری</span>
                                <span className="text-[9px] text-slate-500">PNG, JPG یا JPEG تا ۱۵ مگابایت</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      processImageFile(file, (b64) => setRenewCardReceiptImage(b64));
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setRenewModalKey(null); setRenewCardReceiptImage(""); }}
                disabled={renewSubmitting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleMiniAppRenewSubmit}
                disabled={renewSubmitting}
                className="flex-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {renewSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {isAdmin || isOwner || userRole === "admin" || userRole === "owner"
                        ? "تمدید ویژه مدیر"
                        : renewPaymentMethod === "card_to_card"
                        ? "ارسال فیش و تمدید"
                        : "پرداخت از کیف پول و تمدید"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE SUBSCRIPTION CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {confirmDeleteKey && (
        <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl text-center animate-fade-in my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-white">تایید حذف اشتراک</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                آیا از حذف دائم اشتراک <span className="text-rose-300 font-bold font-mono">{confirmDeleteKey.planName || confirmDeleteKey.clientName || confirmDeleteKey.id}</span> اطمینان دارید؟
              </p>
              <p className="text-[11px] text-rose-400/90 font-medium">
                ⚠️ این کانفیگ از سرور، پنل و لیست ربات پاک خواهد شد و اتصال آن قطع می‌شود.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteKey(null)}
                disabled={deletingKeyId === (confirmDeleteKey.id || confirmDeleteKey.clientUuid)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleMiniAppDeleteSubmit}
                disabled={deletingKeyId === (confirmDeleteKey.id || confirmDeleteKey.clientUuid)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {deletingKeyId === (confirmDeleteKey.id || confirmDeleteKey.clientUuid) ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>بله، حذف شود</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM NAVIGATION DOCK                                                    */}
      {/* ========================================================================= */}
      <nav
        id="miniapp-bottom-nav"
        className="shrink-0 w-full z-[99999] bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 py-2.5 px-2 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
        style={{
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))"
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: "plans", label: "خرید پلن", icon: ShoppingBag },
            { id: "subs", label: "سرویس‌های من", icon: HardDrive },
            { id: "colleagues", label: "همکاران", icon: Users },
            { id: "wallet", label: "کیف پول", icon: CreditCard },
            { id: "profile", label: "پروفایل", icon: User },
            { id: "support", label: "پشتیبانی", icon: Headphones },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.selectionChanged();
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? "text-purple-400 font-extrabold"
                    : "text-slate-400 hover:text-slate-200 font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : "scale-100"}`} />
                <span className="text-[10px] mt-1 whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-5 h-1 bg-purple-500 rounded-full shadow-md shadow-purple-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
