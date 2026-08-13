import React, { useState, useEffect, useMemo } from "react";
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
  ChevronUp
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
  const [activeTab, setActiveTab] = useState<"plans" | "subs" | "wallet" | "profile" | "support">("plans");

  // Live Database State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tgUser, setTgUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
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
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card_to_card">("wallet");
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

      const res = await fetch(`/api/miniapp/data?${params.toString()}`);
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات از سرور");

      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
        setServers(data.servers || []);
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

        // Auto-select first server if available
        if (data.servers && data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
      } else {
        setErrorMessage(data.error || "خطای نامشخص در دریافت اطلاعات");
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

  // Price Calculation for Custom Volume (Matching bot.py formula)
  const customCalculatedPrice = useMemo(() => {
    let priceGb = customPricing.defaultPricePerGb || 3000;
    let priceDay = customPricing.defaultPricePerDay || 2000;

    if (selectedServer && customPricing.boxes && Array.isArray(customPricing.boxes)) {
      for (const box of customPricing.boxes) {
        if (box && Array.isArray(box.serverIds) && box.serverIds.includes(String(selectedServer.id))) {
          priceGb = Number(box.pricePerGb) || priceGb;
          priceDay = Number(box.pricePerDay) || priceDay;
          break;
        }
      }
    }

    const basePrice = (customGb * priceGb) + (customDays * priceDay);
    return Math.max(0, basePrice);
  }, [customGb, customDays, selectedServer, customPricing]);

  // Current Base Price before discount
  const currentBasePrice = useMemo(() => {
    if (planMode === "custom") {
      return customCalculatedPrice;
    }
    return selectedPlan ? Number(selectedPlan.price || 0) : 0;
  }, [planMode, customCalculatedPrice, selectedPlan]);

  // Final Payable Price after promo
  const currentFinalPrice = useMemo(() => {
    if (!appliedPromo) return currentBasePrice;
    const discount = appliedPromo.discountAmount || 0;
    return Math.max(0, currentBasePrice - discount);
  }, [currentBasePrice, appliedPromo]);

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setValidatingPromo(true);
    setPromoError(null);

    try {
      const res = await fetch("/api/miniapp/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          userId: tgUser?.id,
          originalPrice: currentBasePrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAppliedPromo(data);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
      } else {
        setPromoError(data.error || "کد تخفیف نامعتبر است.");
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
      alert("لطفاً ابتدا یک سرور انتخاب کنید.");
      setPurchaseStep(1);
      return;
    }

    if (planMode === "fixed" && !selectedPlan) {
      alert("لطفاً یک پلن انتخاب کنید.");
      setPurchaseStep(2);
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch("/api/miniapp/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username || `user_${tgUser?.id}`,
          serverId: String(selectedServer.id),
          planId: planMode === "custom" ? "custom" : selectedPlan.id,
          customGb: planMode === "custom" ? customGb : undefined,
          customDays: planMode === "custom" ? customDays : undefined,
          clientUsername: clientUsername.trim() || `usr_${tgUser?.id}_${Math.random().toString(36).substring(2, 6)}`,
          paymentMethod,
          promoCode: appliedPromo?.code || undefined,
          receiptImage: cardReceiptImage || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }

        if (data.subKey) {
          setDeliveredSubKey(data.subKey);
          setPurchaseStep(5); // Go to instant delivery view
          fetchMiniAppData(); // Refresh balance and subs
        } else if (data.pendingApproval) {
          alert(data.message || "رسید شما با موفقیت ثبت شد و در انتظار تایید مدیریت است.");
          setPurchaseStep(1);
          setActiveTab("wallet");
          fetchMiniAppData();
        }
      } else {
        alert(data.error || "خطا در انجام تراکنش");
      }
    } catch (err: any) {
      alert(err.message || "خطا در برقراری ارتباط با سرور");
    } finally {
      setPurchasing(false);
    }
  };

  // Claim Free Test Account
  const handleClaimFreeTest = async () => {
    if (!servers || servers.length === 0) {
      alert("سرور فعالی برای دریافت تست یافت نشد.");
      return;
    }

    setClaimingTest(true);
    try {
      const defaultServer = selectedServer || servers[0];
      const res = await fetch("/api/miniapp/free-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          serverId: String(defaultServer.id),
        }),
      });

      const data = await res.json();
      if (data.success && data.subKey) {
        setTestSuccessSub(data.subKey);
        fetchMiniAppData();
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
      } else {
        alert(data.error || "خطا در دریافت تست رایگان");
      }
    } catch (err: any) {
      alert(err.message || "خطا در ارتباط با سرور");
    } finally {
      setClaimingTest(false);
    }
  };

  // Submit Wallet Deposit (Card to Card)
  const handleSubmitDeposit = async () => {
    if (!depositAmount || depositAmount < 10000) {
      alert("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.");
      return;
    }

    setDepositing(true);
    setDepositMessage(null);
    try {
      const res = await fetch("/api/miniapp/wallet/deposit", {
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

      const data = await res.json();
      if (data.success) {
        setDepositMessage(data.message || "درخواست شارژ با موفقیت ثبت شد.");
        setDepositReceipt("");
        fetchMiniAppData();
      } else {
        alert(data.error || "خطا در ثبت درخواست شارژ");
      }
    } catch (err: any) {
      alert(err.message || "خطا در ارتباط با سرور");
    } finally {
      setDepositing(false);
    }
  };

  // Submit Support Ticket
  const handleSubmitTicket = async () => {
    if (!ticketMessage.trim()) {
      alert("لطفاً متن تیکت را وارد کنید.");
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await fetch("/api/miniapp/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tgUser?.id,
          username: tgUser?.username,
          subject: ticketSubject.trim() || "پشتیبانی سرویس",
          message: ticketMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicketSubject("");
        setTicketMessage("");
        fetchMiniAppData();
        alert("تیکت شما با موفقیت ثبت شد.");
      } else {
        alert(data.error || "خطا در ثبت تیکت");
      }
    } catch (err: any) {
      alert(err.message || "خطا در ارتباط با سرور");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Send Reply in Ticket
  const handleSendTicketReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    try {
      const res = await fetch("/api/miniapp/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          userId: tgUser?.id,
          message: replyMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyMessage("");
        fetchMiniAppData();
        if (activeTicketChat) {
          setActiveTicketChat((prev: any) => ({
            ...prev,
            messages: [
              ...(prev.messages || []),
              {
                id: "MSG-" + Date.now(),
                sender: "user",
                senderName: tgUser?.username || `کاربر ${tgUser?.id}`,
                text: replyMessage.trim(),
                timestamp: new Date().toISOString(),
              },
            ],
          }));
        }
      }
    } catch (err) {
      console.error("Ticket reply error:", err);
    }
  };

  const userBalance = Number(userData?.walletBalance || userData?.wallet_balance || 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none pb-24 dir-rtl" dir="rtl">
      {/* Optional Admin Back Header */}
      {onBack && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/20 px-4 py-2 flex items-center justify-between text-xs text-indigo-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            پیش‌نمایش زنده مینی‌اپ تلگرام (متصل به دیتابیس)
          </span>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-white rounded-lg transition-all font-semibold active:scale-95 flex items-center gap-1"
          >
            <span>بازگشت به داشبورد</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top App Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/20 text-base">
            {tgUser?.first_name ? tgUser.first_name[0] : "D"}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name || ""}`.trim() : systemSettings.botNickname || "ربات دالتون"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>{tgUser?.username ? `@${tgUser.username}` : "کاربر گرامی"}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-indigo-400">ID: {tgUser?.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-300 active:scale-95 transition-all"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {/* Wallet Balance Badge */}
          <div
            onClick={() => setActiveTab("wallet")}
            className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black text-emerald-400 transition-all active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{userBalance.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Loading Skeleton */}
        {loading && (
          <div className="p-8 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">در حال همگام‌سازی با دیتابیس داشبورد...</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">خطا در بارگذاری اطلاعات</p>
              <p>{errorMessage}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-[11px] font-semibold"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        )}

        {/* Free Test Promo Banner (If Enabled & Not Used) */}
        {!loading && testAccountSettings.enabled && !testAccountSettings.hasUsed && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/30 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Gift className="w-3 h-3 text-amber-300" />
                  هدیه ویژه کاربران جدید
                </span>
                <h3 className="text-sm font-bold text-white">تست رایگان {testAccountSettings.trafficGb} گیگابایت</h3>
                <p className="text-[11px] text-slate-300">
                  تست سرعت و کیفیت سرویس به مدت {testAccountSettings.durationHours} ساعت
                </p>
              </div>
              <button
                onClick={handleClaimFreeTest}
                disabled={claimingTest}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1"
              >
                {claimingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>دریافت تست</span>
              </button>
            </div>
          </div>
        )}

        {/* Test Success Popup Banner */}
        {testSuccessSub && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>کانفیگ تست شما با موفقیت ساخته شد!</span>
              </div>
              <button
                onClick={() => setTestSuccessSub(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={testSuccessSub.subLink}
                className="flex-1 bg-transparent text-[11px] font-mono text-slate-300 truncate outline-none"
              />
              <button
                onClick={() => copyToClipboard(testSuccessSub.subLink, "test-sub")}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                {copiedId === "test-sub" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PLANS & PURCHASE WIZARD (مراحل خرید کانفیگ دقیقا شبیه ربات تلگرام) */}
        {/* ========================================================================= */}
        {activeTab === "plans" && !loading && (
          <div className="space-y-4">
            {/* Step Wizard Progress Header */}
            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div
                onClick={() => setPurchaseStep(1)}
                className={`flex items-center gap-1.5 cursor-pointer ${purchaseStep >= 1 ? "text-indigo-400" : ""}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${purchaseStep === 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : purchaseStep > 1 ? "bg-indigo-600/30 text-indigo-300" : "bg-slate-800"}`}>
                  ۱
                </span>
                <span>سرور</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />

              <div
                onClick={() => selectedServer && setPurchaseStep(2)}
                className={`flex items-center gap-1.5 cursor-pointer ${purchaseStep >= 2 ? "text-indigo-400" : ""}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${purchaseStep === 2 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : purchaseStep > 2 ? "bg-indigo-600/30 text-indigo-300" : "bg-slate-800"}`}>
                  ۲
                </span>
                <span>پلن</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />

              <div
                onClick={() => (selectedPlan || planMode === "custom") && setPurchaseStep(3)}
                className={`flex items-center gap-1.5 cursor-pointer ${purchaseStep >= 3 ? "text-indigo-400" : ""}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${purchaseStep === 3 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : purchaseStep > 3 ? "bg-indigo-600/30 text-indigo-300" : "bg-slate-800"}`}>
                  ۳
                </span>
                <span>مشخصات</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />

              <div
                className={`flex items-center gap-1.5 ${purchaseStep >= 4 ? "text-indigo-400" : ""}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${purchaseStep === 4 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : purchaseStep > 4 ? "bg-indigo-600/30 text-indigo-300" : "bg-slate-800"}`}>
                  ۴
                </span>
                <span>پرداخت</span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: SERVER / LOCATION SELECTION (مرحله ۱: انتخاب لوکیشن) */}
            {/* ------------------------------------------------------------- */}
            {purchaseStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span>مرحله ۱: انتخاب لوکیشن و سرور</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">تعداد سرورها: {servers.length}</span>
                </div>

                {servers.length === 0 ? (
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">هیچ سرور فعالی در دیتابیس یافت نشد.</p>
                    <p className="text-[11px] text-slate-500">لطفاً در پنل ادمین سرور جدید اضافه کنید.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {servers.map((srv) => {
                      const isSelected = selectedServer?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => {
                            setSelectedServer(srv);
                            setPurchaseStep(2);
                            if (window.Telegram?.WebApp?.HapticFeedback) {
                              window.Telegram.WebApp.HapticFeedback.selectionChanged();
                            }
                          }}
                          className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10"
                              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl filter drop-shadow">{srv.flag || "🌐"}</span>
                            <div>
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{srv.name}</span>
                                {isSelected && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">انتخاب شده</span>}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  پروتکل {srv.protocol || "VLESS"}
                                </span>
                                <span>•</span>
                                <span>پینگ پایین</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-xl text-[11px] font-semibold text-slate-300">
                              انتخاب
                            </span>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------------------------- */}
            {/* STEP 2: CATEGORY & PLAN / CUSTOM SELECTION (مرحله ۲: انتخاب پلن ثابت یا دلخواه) */}
            {/* --------------------------------------------------------------------------------- */}
            {purchaseStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Selected Server Summary Bar */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedServer?.flag || "🌐"}</span>
                    <span className="text-white font-bold">{selectedServer?.name}</span>
                  </div>
                  <button
                    onClick={() => setPurchaseStep(1)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    تغییر سرور ↺
                  </button>
                </div>

                {/* Plan Mode Switcher (پلن‌های ثابت vs حجم دلخواه) */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setPlanMode("fixed")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      planMode === "fixed"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>پلن‌های استاندارد</span>
                  </button>

                  <button
                    onClick={() => setPlanMode("custom")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      planMode === "custom"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>حجم و زمان دلخواه</span>
                  </button>
                </div>

                {/* --- MODE A: FIXED PLANS --- */}
                {planMode === "fixed" && (
                  <div className="space-y-3">
                    {/* Category Filter Pills */}
                    {planCategories.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === "all"
                              ? "bg-slate-700 text-white border border-slate-600"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}
                        >
                          همه دسته‌ها
                        </button>
                        {planCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                              selectedCategory === cat.name
                                ? "bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 font-bold"
                                : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                          >
                            <span>{cat.emoji || "⚡️"}</span>
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Plans List from Database */}
                    {filteredPlans.length === 0 ? (
                      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl text-center space-y-2">
                        <p className="text-xs text-slate-400 font-semibold">هیچ پلنی در این دسته‌بندی یافت نشد.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredPlans.map((plan) => {
                          const isSelected = selectedPlan?.id === plan.id;
                          return (
                            <div
                              key={plan.id}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setPurchaseStep(3);
                                if (window.Telegram?.WebApp?.HapticFeedback) {
                                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                                }
                              }}
                              className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-3 ${
                                isSelected
                                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10"
                                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                                    {plan.tag || plan.category || "سرویس دالتون"}
                                  </span>
                                  <h4 className="text-sm font-bold text-white mt-1">{plan.name}</h4>
                                </div>
                                <div className="text-left">
                                  <span className="text-sm font-black text-emerald-400">
                                    {Number(plan.price).toLocaleString("fa-IR")}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-normal">تومان</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                                  <span>حجم: {plan.trafficGb} گیگابایت</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>مدت: {plan.durationDays} روز</span>
                                </div>
                              </div>

                              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                                <span>انتخاب و مرحله بعد</span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* --- MODE B: CUSTOM VOLUME BUILDER (ساخت کانفیگ با حجم و مدت دلخواه) --- */}
                {planMode === "custom" && (
                  <div className="space-y-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4 text-amber-400" />
                          حجم درخواستی:
                        </span>
                        <span className="text-base font-black text-amber-400">{customGb} گیگابایت</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        step="5"
                        value={customGb}
                        onChange={(e) => setCustomGb(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between gap-1.5 pt-1">
                        {[15, 30, 50, 80, 100].map((gb) => (
                          <button
                            key={gb}
                            onClick={() => setCustomGb(gb)}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold border transition-all ${
                              customGb === gb
                                ? "bg-indigo-600 text-white border-indigo-500"
                                : "bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white"
                            }`}
                          >
                            {gb}GB
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          مدت زمان اشتراک:
                        </span>
                        <span className="text-base font-black text-indigo-400">{customDays} روز</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="180"
                        step="5"
                        value={customDays}
                        onChange={(e) => setCustomDays(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between gap-1.5 pt-1">
                        {[15, 30, 60, 90].map((days) => (
                          <button
                            key={days}
                            onClick={() => setCustomDays(days)}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold border transition-all ${
                              customDays === days
                                ? "bg-indigo-600 text-white border-indigo-500"
                                : "bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white"
                            }`}
                          >
                            {days} روزه
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between bg-slate-950 p-3 rounded-xl">
                      <div>
                        <span className="text-[11px] text-slate-400 block">مبلغ محاسبه شده:</span>
                        <span className="text-base font-black text-emerald-400">
                          {customCalculatedPrice.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                      <button
                        onClick={() => setPurchaseStep(3)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                      >
                        <span>تایید و ادامه</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------------------------- */}
            {/* STEP 3: USERNAME & PROMO CODE (مرحله ۳: تنظیم نام کاربری کانفیگ و کد تخفیف) */}
            {/* --------------------------------------------------------------------------------- */}
            {purchaseStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">سرور انتخابی:</span>
                    <span className="text-white font-bold">{selectedServer?.flag} {selectedServer?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">پلن درخواستی:</span>
                    <span className="text-indigo-300 font-bold">
                      {planMode === "custom" ? `سفارشی (${customGb}GB - ${customDays} روز)` : selectedPlan?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-indigo-500/20">
                    <span className="text-slate-400">قیمت پایه:</span>
                    <span className="text-emerald-400 font-black">{currentBasePrice.toLocaleString("fa-IR")} تومان</span>
                  </div>
                </div>

                {/* Custom Client Username Input */}
                <div className="space-y-1.5 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>نام کاربری کانفیگ (اختیاری - انگلیسی):</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`مثلاً: user_${tgUser?.id || "123"}`}
                    value={clientUsername}
                    onChange={(e) => setClientUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    در صورت خالی گذاشتن، نام کاربری به صورت خودکار ایجاد می‌شود.
                  </p>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-pink-400" />
                    <span>کد تخفیف دارید؟</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="کد تخفیف را وارد کنید..."
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoCodeInput.trim()}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-indigo-300 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "اعمال کد"}
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{promoError}</span>
                    </p>
                  )}

                  {appliedPromo && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        کد تخفیف {appliedPromo.code} اعمال شد ({appliedPromo.discountPercent}٪ تخفیف)
                      </span>
                      <span className="font-bold">
                        -{appliedPromo.discountAmount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseStep(2)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={() => setPurchaseStep(4)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>مشاهده پیش‌فاکتور و پرداخت</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------------------- */}
            {/* STEP 4: INVOICE & PAYMENT CHECKOUT (مرحله ۴: پیش‌فاکتور و انتخاب روش پرداخت) */}
            {/* ----------------------------------------------------------------------------------- */}
            {purchaseStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Clean Invoice Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold text-indigo-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>پیش‌فاکتور نهایی خرید اشتراک</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">رسمی</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">لوکیشن سرور:</span>
                      <span className="text-white font-bold">{selectedServer?.flag} {selectedServer?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">پلن انتخابی:</span>
                      <span className="text-white font-bold">
                        {planMode === "custom" ? `سفارشی (${customGb}GB)` : selectedPlan?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">مدت اعتبار:</span>
                      <span className="text-white font-bold">
                        {planMode === "custom" ? `${customDays} روز` : `${selectedPlan?.durationDays} روز`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">نام کاربری:</span>
                      <span className="text-indigo-300 font-mono">
                        {clientUsername.trim() || `user_${tgUser?.id}`}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between">
                      <span className="text-slate-400">مبلغ کل:</span>
                      <span className="text-slate-300">{currentBasePrice.toLocaleString("fa-IR")} تومان</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-400">
                        <span>تخفیف ({appliedPromo.code}):</span>
                        <span>-{appliedPromo.discountAmount.toLocaleString("fa-IR")} تومان</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-white">مبلغ نهایی قابل پرداخت:</span>
                      <span className="text-base font-black text-emerald-400">
                        {currentFinalPrice.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 block">انتخاب روش پرداخت:</label>

                  {/* Option 1: Wallet */}
                  <div
                    onClick={() => setPaymentMethod("wallet")}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      paymentMethod === "wallet"
                        ? "bg-indigo-600/20 border-indigo-500 shadow-md"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">کیف پول دالتون (تحویل آنی)</h5>
                        <p className="text-[10px] text-slate-400">
                          موجودی شما: {userBalance.toLocaleString("fa-IR")} تومان
                        </p>
                      </div>
                    </div>
                    {userBalance >= currentFinalPrice ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        موجود
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">
                        کسری موجودی
                      </span>
                    )}
                  </div>

                  {/* Option 2: Card to Card */}
                  <div
                    onClick={() => setPaymentMethod("card_to_card")}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all space-y-3 ${
                      paymentMethod === "card_to_card"
                        ? "bg-indigo-600/20 border-indigo-500 shadow-md"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">کارت به کارت مستقیم</h5>
                          <p className="text-[10px] text-slate-400">واریز به حساب و ثبت رسید</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                        تایید ادمین
                      </span>
                    </div>

                    {paymentMethod === "card_to_card" && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">شماره کارت مقصد:</span>
                            <span className="font-mono text-xs font-bold text-white tracking-wider">
                              {systemSettings.cardNumber || "۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸"}
                            </span>
                            <span className="text-[10px] text-indigo-300 block mt-0.5">
                              به نام: {systemSettings.cardHolder || "مدیریت سرور"}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(systemSettings.cardNumber || "6037997512345678", "card-num")}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1"
                          >
                            {copiedId === "card-num" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>کپی</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 block">شماره پیگیری یا لینک رسید واریز:</label>
                          <input
                            type="text"
                            placeholder="مثلا: شماره پیگیری ۱۲۳۴۵۶ یا نام واریزکننده"
                            value={cardReceiptImage}
                            onChange={(e) => setCardReceiptImage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insufficient Wallet Warning */}
                {paymentMethod === "wallet" && userBalance < currentFinalPrice && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                    <span>موجودی کیف پول شما کافی نیست.</span>
                    <button
                      onClick={() => setActiveTab("wallet")}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg font-bold text-[11px]"
                    >
                      افزایش موجودی 💳
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseStep(3)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || (paymentMethod === "wallet" && userBalance < currentFinalPrice)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال ساخت کانفیگ روی سرور...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>پرداخت نهایی و دریافت کانفیگ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------------------------- */}
            {/* STEP 5: INSTANT DELIVERY & CONFIG DETAILS (مرحله ۵: تحویل آنی و نمایش کانفیگ) */}
            {/* ----------------------------------------------------------------------------------- */}
            {purchaseStep === 5 && deliveredSubKey && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-black text-white">سرویس شما با موفقیت فعال شد!</h3>
                  <p className="text-xs text-slate-300">
                    اشتراک شما روی سرور ساخته شد و آماده اتصال می‌باشد.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">نام پلن:</span>
                    <span className="text-white font-bold">{deliveredSubKey.planName}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">نام کاربری:</span>
                    <span className="text-indigo-300 font-mono font-bold">{deliveredSubKey.clientName}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">حجم اشتراک:</span>
                    <span className="text-amber-400 font-bold">{deliveredSubKey.trafficLimitGb} گیگابایت</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">تاریخ انقضا:</span>
                    <span className="text-white font-bold">{deliveredSubKey.expireDate}</span>
                  </div>

                  {/* Config Link Box */}
                  <div className="pt-2 space-y-1.5">
                    <label className="text-[11px] text-slate-400 block">لینک اتصال مستقیم / اشتراک:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={deliveredSubKey.subLink}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 truncate outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(deliveredSubKey.subLink, "del-sub")}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95"
                      >
                        {copiedId === "del-sub" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>کپی</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Code Action Button */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveQrModal(deliveredSubKey.subLink)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-4 h-4 text-purple-400" />
                      <span>نمایش کد QR</span>
                    </button>

                    <a
                      href={deliveredSubKey.subLink}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>اتصال سریع به برنامه</span>
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDeliveredSubKey(null);
                    setPurchaseStep(1);
                    setActiveTab("subs");
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all"
                >
                  مشاهده در لیست اشتراک‌های من
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY SUBSCRIPTIONS (سرویس‌ها و کانفیگ‌های فعال من از دیتابیس) */}
        {/* ========================================================================= */}
        {activeTab === "subs" && !loading && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                اشتراک‌های فعال شما
              </h3>
              <span className="text-[11px] text-slate-400">{subscriptions.length} سرویس</span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">شما هنوز هیچ اشتراک فعالی ندارید.</p>
                <button
                  onClick={() => {
                    setActiveTab("plans");
                    setPurchaseStep(1);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  خرید اولین اشتراک ⚡
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub, idx) => {
                  const used = Number(sub.trafficUsedGb || 0);
                  const limit = Number(sub.trafficLimitGb || 30);
                  const percent = Math.min(100, Math.round((used / (limit || 1)) * 100));

                  return (
                    <div
                      key={sub.id || idx}
                      className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 transition-all shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{sub.planName || "اشتراک اختصاصی"}</span>
                            <span className="text-[10px] font-mono text-indigo-400">({sub.clientName})</span>
                          </h4>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {sub.status === "active" ? "فعال و متصل" : "معلق"}
                          </p>
                        </div>
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">
                          انقضا: {sub.expireDate || "نامحدود"}
                        </span>
                      </div>

                      {/* Traffic Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                          <span>مصرف: {used.toFixed(1)} GB</span>
                          <span>کل: {limit} GB ({percent}٪)</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              percent > 85 ? "bg-red-500" : percent > 60 ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Link and Action Buttons */}
                      <div className="pt-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={sub.subLink}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 truncate outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(sub.subLink, `sub-${idx}`)}
                            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                          >
                            {copiedId === `sub-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>کپی</span>
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveQrModal(sub.subLink)}
                            className="flex-1 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5 text-purple-400" />
                            <span>کد QR</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab("plans");
                              setPurchaseStep(1);
                            }}
                            className="flex-1 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 rounded-xl text-[11px] font-semibold text-indigo-200 flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>تمدید اشتراک</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WALLET & DEPOSIT (کیف پول و شارژ آنلاین / کارت به کارت) */}
        {/* ========================================================================= */}
        {activeTab === "wallet" && !loading && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl text-center space-y-2 shadow-xl">
              <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">موجودی فعلی کیف پول</span>
              <p className="text-3xl font-black text-emerald-400 tracking-tight">
                {userBalance.toLocaleString("fa-IR")} <span className="text-sm font-normal text-slate-300">تومان</span>
              </p>
              <p className="text-[11px] text-slate-400">
                قابل استفاده برای خرید و تمدید تمام سرویس‌ها با تحویل آنی
              </p>
            </div>

            {/* Deposit Box */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-400" />
                افزایش موجودی (کارت به کارت)
              </h4>

              {/* Bank Card Info */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">شماره کارت مقصد:</span>
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    {systemSettings.cardNumber || "۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸"}
                  </span>
                  <span className="text-[10px] text-indigo-300 block mt-0.5">
                    به نام: {systemSettings.cardHolder || "مدیریت"}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(systemSettings.cardNumber || "6037997512345678", "dep-card")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1"
                >
                  {copiedId === "dep-card" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>کپی</span>
                </button>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">مبلغ شارژ دلخواه (تومان):</label>
                <input
                  type="number"
                  placeholder="مثلا ۱۰۰,۰۰۰"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                      depositAmount === amt
                        ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                        : "bg-slate-800 text-slate-400 border-slate-700/60 hover:text-white"
                    }`}
                  >
                    {(amt / 1000).toLocaleString("fa-IR")}ک
                  </button>
                ))}
              </div>

              {/* Receipt Reference */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">شماره پیگیری یا نام واریزکننده:</label>
                <input
                  type="text"
                  placeholder="شماره پیگیری فیش بانکی..."
                  value={depositReceipt}
                  onChange={(e) => setDepositReceipt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {depositMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{depositMessage}</span>
                </div>
              )}

              <button
                onClick={handleSubmitDeposit}
                disabled={depositing || !depositAmount}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                {depositing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                <span>ثبت درخواست شارژ حساب</span>
              </button>
            </div>

            {/* Transaction History Log */}
            {transactions.length > 0 && (
              <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-300">تراکنش‌های اخیر شما</h4>
                <div className="space-y-2">
                  {transactions.map((tx: any, idx: number) => (
                    <div
                      key={tx.id || idx}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{tx.description || "تراکنش مالی"}</p>
                        <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString("fa-IR")}</p>
                      </div>
                      <div className="text-left">
                        <span className={`font-black ${tx.type === "purchase" ? "text-red-400" : "text-emerald-400"}`}>
                          {tx.type === "purchase" ? "-" : "+"}{Number(tx.amount).toLocaleString("fa-IR")} تومان
                        </span>
                        <span className={`block text-[9px] font-bold ${tx.status === "approved" ? "text-emerald-400" : "text-amber-400"}`}>
                          {tx.status === "approved" ? "تایید شده" : "در انتظار تایید"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PROFILE (پروفایل و آمار کاربری از دیتابیس) */}
        {/* ========================================================================= */}
        {activeTab === "profile" && !loading && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <User className="w-4 h-4 text-blue-400" />
              اطلاعات حساب کاربری شما
            </h3>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">شناسه تلگرام:</span>
                <span className="font-mono text-indigo-400 font-bold">{tgUser?.id || "---"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">نام کاربری تلگرام:</span>
                <span className="text-white">{tgUser?.username ? `@${tgUser.username}` : "ثبت نشده"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">نام کامل:</span>
                <span className="text-white">{userData?.fullName || tgUser?.first_name || "کاربر گرامی"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">موجودی کیف پول:</span>
                <span className="text-emerald-400 font-black">{userBalance.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">تعداد اشتراک‌های فعال:</span>
                <span className="text-indigo-400 font-bold">{subscriptions.length} سرویس</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">وضعیت حساب:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  فعال و مجاز
                </span>
              </div>
            </div>

            {/* Support Link */}
            {systemSettings.supportUsername && (
              <a
                href={`https://t.me/${systemSettings.supportUsername.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition-all"
              >
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span>ارتباط مستقیم با ادمین در تلگرام</span>
              </a>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SUPPORT & TICKETS (سیستم پشتیبانی و تیکتینگ آنلاین متصل به DB) */}
        {/* ========================================================================= */}
        {activeTab === "support" && !loading && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <HelpCircle className="w-4 h-4 text-pink-400" />
              پشتیبانی و تیکت آنلاین
            </h3>

            {/* Submit New Ticket */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white">ارسال تیکت جدید به پشتیبانی</h4>

              <input
                type="text"
                placeholder="موضوع تیکت (مثلا: مشکل در اتصال به سرور آلمان)..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <textarea
                rows={3}
                placeholder="متن پیام یا سوال خود را به طور کامل بنویسید..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
              ></textarea>

              <button
                onClick={handleSubmitTicket}
                disabled={submittingTicket || !ticketMessage.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                {submittingTicket ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>ارسال تیکت پشتیبانی</span>
              </button>
            </div>

            {/* List of Previous Tickets */}
            {tickets.length > 0 && (
              <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-300">تیکت‌های قبلی شما ({tickets.length})</h4>
                <div className="space-y-2">
                  {tickets.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                        <span className="font-bold text-white">{t.subject}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.status === "closed" ? "bg-slate-800 text-slate-400" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {t.status === "closed" ? "بسته شده" : "در حال پیگیری"}
                        </span>
                      </div>

                      {/* Messages Thread */}
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {(t.messages || []).map((m: any, mIdx: number) => (
                          <div
                            key={m.id || mIdx}
                            className={`p-2 rounded-xl text-[11px] ${
                              m.sender === "admin"
                                ? "bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 mr-2"
                                : "bg-slate-900 text-slate-200 ml-2"
                            }`}
                          >
                            <span className="text-[9px] text-slate-400 font-bold block">
                              {m.sender === "admin" ? "پاسخ پشتیبان:" : "شما:"}
                            </span>
                            <p>{m.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Quick Reply in Ticket */}
                      {t.status !== "closed" && (
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="ارسال پاسخ..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none"
                          />
                          <button
                            onClick={() => handleSendTicketReply(t.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                          >
                            ارسال
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* QR Code Modal Popup */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="text-xs font-bold text-white">اسکن کد QR جهت اتصال</h4>
            <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrModal)}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              با استفاده از دوربین نرم‌افزار v2rayNG / Streisand / V2Box این کد را اسکن کنید.
            </p>
            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setActiveTab("plans");
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "plans" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">خرید کانفیگ</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("subs");
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative ${
            activeTab === "subs" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">سرویس‌های من</span>
          {subscriptions.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
              {subscriptions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("wallet");
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "wallet" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">کیف پول</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("profile");
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            activeTab === "profile" ? "text-indigo-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">پروفایل</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("support");
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged();
            }
          }}
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
