import React, { useState, useEffect, useMemo } from "react";
import { getThemeStyles } from "../utils/theme";
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
  Wallet
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
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card_to_card" | "admin_free">("wallet");
  const [cardReceiptImage, setCardReceiptImage] = useState<string>("");
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [deliveredSubKey, setDeliveredSubKey] = useState<any>(null);

  // Free Test State
  const [claimingTest, setClaimingTest] = useState<boolean>(false);
  const [testSuccessSub, setTestSuccessSub] = useState<any>(null);

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
  const [colleagueNewGb, setColleagueNewGb] = useState<number>(30);
  const [colleagueNewDays, setColleagueNewDays] = useState<number>(30);
  const [colleagueCreatingClient, setColleagueCreatingClient] = useState<boolean>(false);

  // UI Utilities
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);

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
        setIsAdmin(!!data.isAdmin || !!data.user?.isAdmin);
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Plans by selected category and server
  const filteredPlans = useMemo(() => {
    let list = vpnPlans;
    if (selectedCategory !== "all") {
      list = list.filter((p) => String(p.category) === String(selectedCategory));
    }
    return list;
  }, [vpnPlans, selectedCategory]);

  // Price Calculation for Custom Volume (Matching formula)
  const customCalculatedPrice = useMemo(() => {
    let priceGb = customPricing.defaultPricePerGb || 3000;
    let priceDay = customPricing.defaultPricePerDay || 2000;

    if (selectedServer && Array.isArray(customPricing.boxes)) {
      for (const box of customPricing.boxes) {
        if (box && Array.isArray(box.serverIds) && box.serverIds.includes(String(selectedServer.id))) {
          priceGb = Number(box.pricePerGb) || priceGb;
          priceDay = Number(box.pricePerDay) || priceDay;
          break;
        }
      }
    }
    return customGb * priceGb + customDays * priceDay;
  }, [customGb, customDays, selectedServer, customPricing]);

  // Final Price for Checkout (After Promo & Admin check)
  const checkoutPrice = useMemo(() => {
    if (isAdmin) return 0; // Admin has 100% free purchases
    const base = planMode === "custom" ? customCalculatedPrice : (selectedPlan?.price || 0);
    if (!appliedPromo) return base;
    let discount = 0;
    if (appliedPromo.discountPercent) {
      discount = Math.floor((base * Number(appliedPromo.discountPercent)) / 100);
    } else if (appliedPromo.discountAmount) {
      discount = Number(appliedPromo.discountAmount);
    }
    return Math.max(0, base - discount);
  }, [planMode, customCalculatedPrice, selectedPlan, appliedPromo, isAdmin]);

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
      showThemedModal("شناسه تراکنش اجباری است", "لطفاً شناسه پیگیری، شماره رسید یا مشخصات واریز کارت به کارت را در فیلد مربوطه وارد فرمایید.", "warning");
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
          customGb: planMode === "custom" ? customGb : undefined,
          customDays: planMode === "custom" ? customDays : undefined,
          clientUsername: clientUsername.trim() || `usr_${tgUser?.id}_${Math.random().toString(36).substring(2, 6)}`,
          paymentMethod: isAdmin ? "admin_free" : paymentMethod,
          promoCode: appliedPromo?.code || undefined,
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
          showThemedModal(
            "رسید ثبت شد",
            data.message || "رسید شما با موفقیت ثبت شد و اعلانی جهت تایید به مدیریت ارسال گردید. پس از تایید مدیریت، سرویس شما فعال خواهد شد.",
            "success",
            "باشه",
            () => {
              setPurchaseStep(1);
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

  // Claim Free Test Account
  const handleClaimFreeTest = async () => {
    if (!servers || servers.length === 0) {
      showThemedModal("سرور یافت نشد", "سرور فعالی برای دریافت تست یافت نشد.", "warning");
      return;
    }

    setClaimingTest(true);
    try {
      const defaultServer = selectedServer || servers[0];
      const { ok, data, error } = await safeFetchJson("/api/miniapp/free-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          serverId: String(defaultServer.id),
        }),
      });

      if (ok && data?.success && data?.subKey) {
        setTestSuccessSub(data.subKey);
        fetchMiniAppData();
        showThemedModal("تبریک!", "اکانت تست رایگان شما با موفقیت فعال شد.", "success");
      } else {
        showThemedModal("خطا در دریافت تست", error || data?.error || "خطا در دریافت تست رایگان", "error");
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
      showThemedModal("شناسه تراکنش الزامی است", "لطفاً شماره پیگیری یا مشخصات فیش واریز را وارد فرمایید.", "warning");
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
      const { ok, data, error } = await safeFetchJson("/api/miniapp/ticket/send", {
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
      const { ok, data } = await safeFetchJson("/api/miniapp/ticket/reply", {
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
        showThemedModal("ورود موفق", `ورود به حساب (${data.account.username}) انجام شد.`, "success");
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
        showThemedModal("ورود موفق", `همکار گرامی (${data.account.username}) خوش آمدید.`, "success");
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

    if (colleagueAccount.remainingTrafficGb < colleagueNewGb) {
      showThemedModal(
        "اتمام سهمیه حجم",
        `حجم درخواستی (${colleagueNewGb} GB) بیشتر از حجم مجاز باقیمانده شما (${colleagueAccount.remainingTrafficGb.toFixed(1)} GB) است.`,
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
          trafficGb: colleagueNewGb,
          durationDays: colleagueNewDays,
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
          remainingTrafficGb: Math.max(0, (prev.remainingTrafficGb || 0) - colleagueNewGb),
          allocatedTrafficGb: (prev.allocatedTrafficGb || 0) + colleagueNewGb
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
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 select-none relative overflow-x-hidden selection:bg-purple-500 selection:text-white"
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
        className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-lg"
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
                {isAdmin ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    <Crown className="w-3 h-3" /> مدیر کل
                  </span>
                ) : (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full font-medium">
                    نسخه مینی‌اپ
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
      <main className="max-w-md mx-auto px-4 pt-4 relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
              <div className="w-14 h-14 rounded-full border-4 border-t-purple-500 border-purple-500/20 animate-spin" />
            </div>
            <p className="text-sm text-slate-400 font-medium animate-pulse">
              در حال دریافت آخرین اطلاعات سرورها و پکیج‌ها...
            </p>
          </div>
        )}

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

        {/* ========================================================================= */}
        {/* TAB 1: PLANS & PURCHASE WIZARD                                            */}
        {/* ========================================================================= */}
        {activeTab === "plans" && !loading && (
          <div id="view-plans-wizard" className="space-y-4">
            {/* Free Test Account Card (If Enabled & Not Used) */}
            {testAccountSettings.enabled && !testAccountSettings.hasUsed && !testSuccessSub && purchaseStep === 1 && (
              <div
                id="card-free-test-banner"
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/40 p-4 shadow-xl shadow-emerald-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span className="text-xs font-bold text-emerald-300">
                        هدیه ویژه عضویت: تست رایگان
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      هم‌اکنون می‌توانید یک اکانت {testAccountSettings.trafficGb} گیگابایتی ({testAccountSettings.durationHours} ساعته) کاملاً رایگان دریافت کنید.
                    </p>
                  </div>
                  <button
                    id="btn-claim-free-test"
                    onClick={handleClaimFreeTest}
                    disabled={claimingTest}
                    className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {claimingTest ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    )}
                    <span>دریافت تست</span>
                  </button>
                </div>
              </div>
            )}

            {/* Test Success Modal View */}
            {testSuccessSub && (
              <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-emerald-950/30 border border-emerald-500/40 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-extrabold text-sm">اکانت تست شما آماده شد!</span>
                  </div>
                  <button
                    onClick={() => setTestSuccessSub(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    بستن
                  </button>
                </div>
                <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>لینک ساب‌اسکریپشن هوشمند:</span>
                    <button
                      onClick={() => copyToClipboard(testSuccessSub.subLink, "test-sub")}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                    >
                      {copiedId === "test-sub" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === "test-sub" ? "کپی شد" : "کپی لینک"}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono break-all bg-slate-900 p-2 rounded-xl border border-slate-800/80 select-all">
                    {testSuccessSub.subLink}
                  </div>
                </div>
              </div>
            )}

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
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                                  آنلاین
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                پروتکل اختصاصی {srv.protocol || "VLESS"} • پینگ پایدار
                              </p>
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

                <button
                  id="btn-step1-next"
                  onClick={() => setPurchaseStep(2)}
                  disabled={!selectedServer}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>مرحله بعد: انتخاب پلن</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
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
                    {planCategories.length > 0 && (
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
                        {planCategories.map((cat) => (
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
                                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
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
                                  <div className="text-base font-extrabold text-purple-400">
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
                        min="5"
                        max="300"
                        step="5"
                        value={customGb}
                        onChange={(e) => setCustomGb(Number(e.target.value))}
                        className="w-full accent-purple-500 bg-slate-800 rounded-lg h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>5 GB</span>
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
                        min="7"
                        max="180"
                        step="7"
                        value={customDays}
                        onChange={(e) => setCustomDays(Number(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>7 روز</span>
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
                      <span className="font-mono text-slate-200">
                        {clientUsername.trim() || `user_${tgUser?.id || "vpn"}`}
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

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Wallet Method */}
                      <button
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

                      {/* Card to Card Method */}
                      <button
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
                    </div>

                    {/* Card to Card Details Box & MANDATORY Receipt ID */}
                    {paymentMethod === "card_to_card" && (
                      <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-3.5 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                            <span>اطلاعات حساب جهت واریز:</span>
                            {systemSettings.cardNumber && (
                              <button
                                onClick={() => copyToClipboard(systemSettings.cardNumber, "card-num")}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                              >
                                {copiedId === "card-num" ? "کپی شد" : "کپی شماره کارت"}
                              </button>
                            )}
                          </div>
                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">شماره کارت:</span>
                              <span className="font-mono font-bold text-white tracking-wider">
                                {systemSettings.cardNumber || "۶۰۳۷-۹۹۷۵-****-****"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">به نام:</span>
                              <span className="font-bold text-slate-200">
                                {systemSettings.cardHolder || "مدیریت سرور"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* MANDATORY Receipt Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                            <span>شماره پیگیری یا لینک رسید واریز: <strong className="text-rose-400 font-extrabold">(اجباری *)</strong></span>
                          </label>
                          <input
                            type="text"
                            placeholder="مثلاً: شماره پیگیری ۱۲۳۴۵۶ یا نام واریزکننده"
                            value={cardReceiptImage}
                            onChange={(e) => setCardReceiptImage(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors ${
                              !cardReceiptImage.trim()
                                ? "border-amber-500/50 focus:border-amber-400"
                                : "border-emerald-500/50 focus:border-emerald-400"
                            }`}
                          />
                          {!cardReceiptImage.trim() ? (
                            <p className="text-[11px] text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>تا زمانی که شناسه یا مشخصات واریز را وارد نکنید، دکمه پرداخت فعال نمی‌شود.</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>مشخصات واریز وارد شد.</span>
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
                {subscriptions.map((sub) => {
                  const used = Number(sub.trafficUsedGb || 0);
                  const limit = Number(sub.trafficLimitGb || 30);
                  const percent = Math.min(100, Math.round((used / (limit || 1)) * 100));

                  return (
                    <div
                      key={sub.id}
                      id={`sub-card-${sub.id}`}
                      className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">
                              {sub.planName || "اشتراک اختصاصی"}
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
                              فعال
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {sub.clientName || sub.id}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveQrModal(sub.subLink)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
                          title="نمایش QR کد"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between text-xs text-slate-400 font-medium">
                          <span>مصرف حجم:</span>
                          <span className="text-slate-200">
                            {used.toFixed(1)} از {limit} گیگابایت ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent > 85 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-purple-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>انقضا: {sub.expireDate || "۳۰ روزه"}</span>
                          <span>وضعیت اتصال: پایدار</span>
                        </div>
                      </div>

                      {/* Sublink Copy Bar */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={sub.subLink || ""}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 select-all"
                        />
                        <button
                          onClick={() => copyToClipboard(sub.subLink, `sub-${sub.id}`)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-purple-600/30"
                        >
                          {copiedId === `sub-${sub.id}` ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === `sub-${sub.id}` ? "کپی شد" : "کپی"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                          <label className="text-xs font-bold text-slate-300">توکن امنیتی بازیابی:</label>
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

                        {/* Mandatory Card Receipt Input */}
                        {colleaguePaymentMethod === "card_to_card" && (
                          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-purple-900/40">
                            <div className="text-[11px] text-purple-300 font-bold">
                              💳 شماره کارت مقصد: {systemSettings.CARD_NUMBER || "۶۰۳۷۹۹۷۵۰۰۰۰۰۰۰۰"} ({systemSettings.CARD_HOLDER || "مدیریت"})
                            </div>
                            <input
                              type="text"
                              placeholder="شناسه پیگیری یا شماره فیش واریزی (اجباری) *"
                              value={colleagueCardReceipt}
                              onChange={(e) => setColleagueCardReceipt(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleColleagueBuyPackage}
                        disabled={buyingColleaguePkg || (colleaguePaymentMethod === "card_to_card" && !colleagueCardReceipt.trim())}
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
                                  <span className="font-bold text-white font-mono">{acc.username}</span>
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
                          {colleagueAccount?.username}
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
                    onClick={() => setIsColleagueCreateOpen(true)}
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

                  {colleagueClients.length === 0 ? (
                    <div className="p-6 text-center bg-slate-900/40 rounded-3xl border border-slate-800/60 text-slate-400 text-xs">
                      هنوز هیچ کانفیگی با این حساب همکار ایجاد نکرده‌اید.
                    </div>
                  ) : (
                    colleagueClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-white font-mono">
                              {client.clientName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              حجم: {client.trafficLimitGb} GB • انقضا: {client.expireDate || "نامشخص"}
                            </div>
                          </div>

                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            {client.status || "active"}
                          </span>
                        </div>

                        {client.subLink && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={client.subLink}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-purple-300 select-all"
                            />
                            <button
                              onClick={() => copyToClipboard(client.subLink, `col-sub-${client.id}`)}
                              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                            >
                              {copiedId === `col-sub-${client.id}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === `col-sub-${client.id}` ? "کپی شد" : "کپی"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Colleague Create Client Modal */}
                {isColleagueCreateOpen && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
                        <select
                          value={colleagueSelectedServer?.id || ""}
                          onChange={(e) => {
                            const found = [...colleagueServers, ...servers].find((s) => s.id === e.target.value);
                            if (found) setColleagueSelectedServer(found);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          {(colleagueServers.length > 0 ? colleagueServers : servers).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.flag} {s.name} {s.isColleague ? "(ویژه همکاران)" : ""}
                            </option>
                          ))}
                        </select>
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
                          <label className="text-xs font-bold text-slate-300">حجم (GB):</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={colleagueNewGb}
                            onChange={(e) => setColleagueNewGb(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">مدت (روز):</label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={colleagueNewDays}
                            onChange={(e) => setColleagueNewDays(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">شماره کارت مقصد:</span>
                    <span className="font-mono font-bold text-white tracking-wider">
                      {systemSettings.cardNumber || "۶۰۳۷-۹۹۷۵-****-****"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">به نام:</span>
                    <span className="font-bold text-slate-200">
                      {systemSettings.cardHolder || "مدیریت سرور"}
                    </span>
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

                {/* MANDATORY Deposit Receipt Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>شماره پیگیری یا فیش واریز: <strong className="text-rose-400 font-extrabold">(اجباری *)</strong></span>
                  </label>
                  <input
                    type="text"
                    placeholder="شماره پیگیری فیش بانکی..."
                    value={depositReceipt}
                    onChange={(e) => setDepositReceipt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
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
        {/* TAB 5: PROFILE & SUPPORT                                                  */}
        {/* ========================================================================= */}
        {activeTab === "profile" && !loading && (
          <div id="view-profile" className="space-y-4">
            {/* User Profile Card */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-purple-500/30">
                  {tgUser?.first_name ? tgUser.first_name[0] : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white">
                      {tgUser?.first_name || "کاربر"} {tgUser?.last_name || ""}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        👑 مدیر کل
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        کاربر فعال
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    شناسه کاربری: {tgUser?.id} {tgUser?.username ? `(@${tgUser.username})` : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">موجودی کیف پول:</div>
                  <div className="font-bold text-white mt-0.5">
                    {isAdmin ? "نامحدود" : `${Number(userData?.walletBalance || 0).toLocaleString("fa-IR")} ت`}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">سرویس‌های خریداری شده:</div>
                  <div className="font-bold text-purple-300 mt-0.5">
                    {subscriptions.length} سرویس
                  </div>
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl shadow-purple-950/60 text-center animate-fade-in">
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
      {/* BOTTOM NAVIGATION DOCK                                                    */}
      {/* ========================================================================= */}
      <nav
        id="miniapp-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 py-2 px-2 shadow-2xl"
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
