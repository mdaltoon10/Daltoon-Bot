import React, { useState, useEffect, useRef } from "react";
import { User, VpnPlan, Transaction, SubscriptionKey, CustomButton, PanelSettings, Ticket, PlanCategory } from "../types";
import { Language, translations } from "../locales";
import { copyTextToClipboard } from "../utils/clipboard";
import { 
  Send, 
  Smartphone, 
  UserCheck, 
  Wallet, 
  ShieldCheck, 
  ShoppingBag, 
  LifeBuoy, 
  RefreshCw, 
  FileCheck, 
  Camera 
} from "lucide-react";

const ConfigGlassButton: React.FC<{ link: string; lang: Language }> = ({ link, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyTextToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`relative w-full my-2.5 py-3 px-4 rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 border shadow-lg backdrop-blur-md group cursor-pointer text-xs font-semibold select-none
        ${copied 
          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10 font-bold" 
          : "bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/25 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 shadow-indigo-500/5 hover:shadow-indigo-500/10"
        }
        hover:scale-[1.015] active:scale-[0.985]
      `}
    >
      <div className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
      {copied ? (
        <>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{lang === "fa" ? "کپی شد! ✅" : "Copied! ✅"}</span>
        </>
      ) : (
        <>
          <span className="text-[13px] group-hover:rotate-12 transition-transform duration-300">🔗</span>
          <span>{lang === "fa" ? "کپی لینک اشتراک" : "Copy Subscription Link"}</span>
        </>
      )}
    </button>
  );
};

interface BotSimulatorProps {
  users: User[];
  plans: VpnPlan[];
  setVpnPlans: React.Dispatch<React.SetStateAction<VpnPlan[]>>;
  transactions: Transaction[];
  keys: SubscriptionKey[];
  setKeys: React.Dispatch<React.SetStateAction<SubscriptionKey[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  tickets?: Ticket[];
  setTickets?: React.Dispatch<React.SetStateAction<Ticket[]>>;
  activeUserId: number;
  setActiveUserId: (id: number) => void;
  updateUserBalance: (userId: number, newBalance: number) => void;
  addNewTransaction: (tx: Transaction) => void;
  addNewSubscriptionKey: (key: SubscriptionKey) => void;
  lang: Language;
  customButtons: CustomButton[];
  settings?: PanelSettings;
  planCategories?: PlanCategory[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  keyboard?: string[][]; // Custom Telegram reply keyboard
  inlineButtons?: ({ text: string; action: string } | { text: string; action: string }[])[]; // Custom Telegram inline markup
  imageUrl?: string; // Optional dynamic QR Code image
}

export default function BotSimulator({
  users,
  plans,
  setVpnPlans,
  transactions,
  keys,
  setKeys,
  setUsers,
  tickets = [],
  setTickets,
  activeUserId,
  setActiveUserId,
  updateUserBalance,
  addNewTransaction,
  addNewSubscriptionKey,
  lang,
  customButtons,
  settings,
  planCategories = []
}: BotSimulatorProps) {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<VpnPlan | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<"idle" | "confirm_plan" | "ask_client_name" | "sending">("idle");
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  
  // Local Simulator Sandboxes (Ensures the chatbot is strictly local and educational without writing to persistent DB)
  const [simulatedUsers, setSimulatedUsers] = useState<User[]>([]);
  const [simulatedKeys, setSimulatedKeys] = useState<SubscriptionKey[]>([]);

  // Sync simulated state from incoming props
  useEffect(() => {
    if (users && users.length > 0) {
      setSimulatedUsers(users);
    }
  }, [users]);

  useEffect(() => {
    if (keys && keys.length > 0) {
      setSimulatedKeys(keys);
    }
  }, [keys]);

  // Support ticket flow states
  const [supportStep, setSupportStep] = useState<"idle" | "ask_subject" | "ask_message">("idle");
  const [ticketSubject, setTicketSubject] = useState("");
  const [adminNotification, setAdminNotification] = useState<{ id: string; username: string; subject: string } | null>(null);

  // Invoice form fields
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [transferringKeyId, setTransferringKeyId] = useState<string | null>(null);

  // Custom config/renew flow states
  const [customVolServerId, setCustomVolServerId] = useState<string | null>(null);
  const [customVolStep, setCustomVolStep] = useState<"idle" | "ask_username" | "ask_gb" | "ask_days" | "confirm">("idle");
  const [customVolUsername, setCustomVolUsername] = useState("");
  const [customVolGb, setCustomVolGb] = useState<number>(30);
  const [customVolDays, setCustomVolDays] = useState<number>(30);

  const [renewingSubId, setRenewingSubId] = useState<string | null>(null);
  const [renewStep, setRenewStep] = useState<"idle" | "ask_gb" | "ask_days" | "confirm">("idle");
  const [renewGbVal, setRenewGbVal] = useState<number>(30);
  const [renewDaysVal, setRenewDaysVal] = useState<number>(30);

  useEffect(() => {
    setInvoiceDesc(lang === "fa" ? "واریز کارت به کارت" : "Card-to-Card Transfer");
  }, [lang]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUser = simulatedUsers.find(u => u.userId === activeUserId) || users.find(u => u.userId === activeUserId) || users[0] || { userId: 6536288293, username: "GuestUser", walletBalance: 0 };

  useEffect(() => {
    // Scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Construct reply keyboard dynamically with custom menu buttons
  const getKeyboard = () => {
    const layout = settings?.keyboardLayout || "stepped";
    const defaultOrder = [
      "btnBuyNew", "btnMySubs", "btnGuides", "btnProfile", "btnWallet", "btnSupport", "btnTicketSupport", "btnFreeTest", "btnAiChat", "btnInstantSupport", "btnFeedback", "btnReferral", "btnColleagues"
    ];
    let order = [...(settings?.mainButtonsOrder || defaultOrder)];
    
    if (!order.includes("btnWallet")) order.push("btnWallet");
    if (!order.includes("btnReferral")) order.push("btnReferral");
    if (!order.includes("btnTicketSupport")) order.push("btnTicketSupport");

    const buttons: { key: string, text: string }[] = [];
    
    order.forEach(key => {
      if (key === "btnBuyNew" && !settings?.hideBtnBuyNew) buttons.push({ key, text: settings?.btnTextBuyNew || "🛒 خرید اشتراک جدید" });
      else if (key === "btnMySubs" && !settings?.hideBtnMySubs) buttons.push({ key, text: settings?.btnTextMySubs || "🗂 اشتراک های من / تمدید" });
      else if (key === "btnGuides" && !settings?.hideBtnGuides) buttons.push({ key, text: settings?.btnTextGuides || "💡 آموزش ها" });
      else if (key === "btnColleagues" && !settings?.hideBtnColleagues) buttons.push({ key, text: settings?.btnTextColleagues || "بسته ویژه همکاران" });
      else if (key === "btnAiChat" && !settings?.hideBtnAiChat) buttons.push({ key, text: settings?.btnTextAiChat || "🤖 چت با ربات" });
      else if (key === "btnProfile" && !settings?.hideBtnProfile) buttons.push({ key, text: settings?.btnTextProfile || "👤 حساب کاربری" });
      else if (key === "btnWallet" && !settings?.hideBtnWallet) buttons.push({ key, text: settings?.btnTextWallet || "💵 کیف پول + شارژ" });
      else if (key === "btnSupport" && !settings?.hideBtnSupport) buttons.push({ key, text: settings?.btnTextSupport || "🎧 پشتیبانی" });
      else if (key === "btnTicketSupport" && !settings?.hideBtnTicketSupport) buttons.push({ key, text: settings?.btnTextTicketSupport || "🎫 تیکت به پشتیبانی" });
      else if (key === "btnFreeTest" && !settings?.hideBtnFreeTest) buttons.push({ key, text: settings?.btnTextFreeTest || "🎁 موجودی رایگان" });
      else if (key === "btnInstantSupport" && !settings?.hideBtnInstantSupport) buttons.push({ key, text: settings?.btnTextInstantSupport || "🤖 پشتیبانی آنی" });
      else if (key === "btnFeedback" && !settings?.hideBtnFeedback) buttons.push({ key, text: settings?.btnTextFeedback || "💌 بازخورد کاربر ها" });
      else if (key === "btnReferral" && !settings?.hideBtnReferral) buttons.push({ key, text: settings?.btnTextReferral || "👥 زیرمجموعه گیری" });
    });

    const dynamicKeyboard: string[][] = [];
    if (layout === "vertical") {
      buttons.forEach(b => dynamicKeyboard.push([b.text]));
    } else {
      let idx = 0;
      while (idx < buttons.length) {
        if (layout === "stepped" && (buttons[idx].key === "btnBuyNew" || buttons[idx].key === "btnColleagues")) {
          dynamicKeyboard.push([buttons[idx].text]);
          idx += 1;
          continue;
        }
        
        if (idx + 1 < buttons.length) {
          if (layout === "stepped" && (buttons[idx + 1].key === "btnBuyNew" || buttons[idx + 1].key === "btnColleagues")) {
            dynamicKeyboard.push([buttons[idx].text]);
            idx += 1;
          } else {
            dynamicKeyboard.push([buttons[idx].text, buttons[idx + 1].text]);
            idx += 2;
          }
        } else {
          dynamicKeyboard.push([buttons[idx].text]);
          idx += 1;
        }
      }
    }

    // Convert custom menu buttons to rows of 2
    const customLabels = (customButtons || []).map(cb => cb.text);
    const customRows: string[][] = [];
    for (let i = 0; i < customLabels.length; i += 2) {
      customRows.push(customLabels.slice(i, i + 2));
    }
    
    return [...dynamicKeyboard, ...customRows];
  };

  useEffect(() => {
    // Set initial welcome message when user or custom buttons change
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: `${t.welcomeBotMsg}\n\nUser ID: ${currentUser.userId}\nusername: @${currentUser.username}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        keyboard: getKeyboard()
      }
    ]);
    setSelectedPlanToBuy(null);
    setShowInvoiceUpload(false);
    
    // Simulate auto warning
    const isAutoWarningEnabled = settings?.autoWarningConfigBtn !== false;
    if (isAutoWarningEnabled) {
      const activeUserKeys = simulatedKeys.filter(k => k.userId === currentUser.userId);
      activeUserKeys.forEach(k => {
        const total = k.trafficLimitGb || 50;
        const used = k.trafficUsedGb || 0;
        const remainingGb = total - used;
        let remainingDays = 999;
        try {
          const expDate = new Date(k.expireDate);
          const diffTime = expDate.getTime() - Date.now();
          remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch(e) {}
        
        if ((remainingGb <= 1 && remainingGb > 0) || (remainingDays <= 1 && remainingDays > 0)) {
           setTimeout(() => {
             addBotReply(lang === "fa" 
               ? `⚠️ <b>اخطار رسمی اتمام سرویس:</b>\n\nمشترک گرامی، سرویس <b>${k.planName}</b> شما رو به اتمام است.\n\nباقیمانده حجم: ${remainingGb.toFixed(2)} گیگابایت\nباقیمانده زمان: ${remainingDays} روز\n\nجهت جلوگیری از قطع شدن دسترسی، لطفاً هرچه سریع‌تر از منوی مدیریت اشتراک‌ها اقدام به تمدید نمایید.` 
               : `⚠️ <b>Official Expiry Warning:</b>\n\nYour service <b>${k.planName}</b> is about to expire.\n\nRemaining: ${remainingGb.toFixed(2)} GB / ${remainingDays} Days.\n\nPlease renew to avoid interruption.`, 
               1500, undefined, [[{ text: lang === "fa" ? "💳 تمدید این سرویس" : "💳 Renew Now", action: `manage_sub_${k.id}` }]]);
           }, 2000);
        }
      });
    }

  }, [activeUserId, lang, customButtons, settings]);

  const addBotReply = (text: string, delayMs = 600, keyboard?: string[][], inlineButtons?: ({ text: string; action: string } | { text: string; action: string }[])[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          keyboard: keyboard || getKeyboard(),
          inlineButtons
        }
      ]);
    }, delayMs);
  };


  const handleUserAction = (text: string) => {
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);

    // Handle Custom Volume Step Handlers
    if (customVolStep !== "idle") {
      const input = text.trim();
      if (input.includes("انصراف") || input.includes("Cancel") || input.includes("بازگشت") || input.includes("منوی اصلی")) {
        setCustomVolStep("idle");
        setCustomVolServerId(null);
        addBotReply(lang === "fa" ? "❌ عملیات ساخت کانفیگ دلخواه لغو شد." : "❌ Custom config creation cancelled.", 500, getKeyboard());
        return;
      }

      if (customVolStep === "ask_username") {
        const safeNameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
        if (!safeNameRegex.test(input)) {
          addBotReply(
            lang === "fa"
              ? "⚠️ <b>نام وارد شده نامعتبر است!</b>\n\nنام کاربری باید فقط شامل حروف انگلیسی، اعداد و خط تیره بین ۳ تا ۱۵ کاراکتر باشد (بدون فاصله).\n\nلطفاً یک نام انگلیسی معتبر بنویسید:"
              : "⚠️ <b>Invalid Username!</b>\n\nUsername must contain English letters, numbers, hyphens and be between 3 and 15 chars (no spaces).\n\nPlease write a valid English name:",
            500,
            [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
          );
          return;
        }
        setCustomVolUsername(input);
        setCustomVolStep("ask_gb");
        addBotReply(
          lang === "fa"
            ? `👤 نام کاربری: <code>${input}</code>\n\n🔻 لطفاً ترافیک مورد نیاز خود را به <b>گیگابایت (GB)</b> وارد کنید:\n⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)`
            : `👤 Username: <code>${input}</code>\n\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):`,
          500,
          [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
        );
        return;
      }

      if (customVolStep === "ask_gb") {
        const gb = parseInt(input);
        if (isNaN(gb) || gb <= 0 || gb > 1000) {
          addBotReply(
            lang === "fa"
              ? "❌ <b>خطا: ترافیک نامعتبر است!</b>\n\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۱۰۰۰) وارد کنید:"
              : "❌ <b>Error: Invalid traffic limit!</b>\n\nPlease enter a valid integer (between 1 and 1000):",
            500,
            [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
          );
          return;
        }
        setCustomVolGb(gb);
        setCustomVolStep("ask_days");
        addBotReply(
          lang === "fa"
            ? `👤 نام کاربری: <code>${customVolUsername}</code>\n` +
              `🔻 حجم انتخابی: <code>${gb} GB</code>\n\n` +
              `⏳ لطفاً تعداد روزهای فعال بودن اشتراک را به <b>روز (Days)</b> وارد کنید:\n` +
              `⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)`
            : `👤 Username: <code>${customVolUsername}</code>\n` +
              `🔻 Selected Volume: <code>${gb} GB</code>\n\n` +
              `⏳ Please enter duration in <b>Days</b> (e.g. <code>30</code>):`,
          500,
          [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
        );
        return;
      }

      if (customVolStep === "ask_days") {
        const days = parseInt(input);
        if (isNaN(days) || days <= 0 || days > 365) {
          addBotReply(
            lang === "fa"
              ? "❌ <b>خطا: تعداد روزها نامعتبر است!</b>\n\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۳۶۵) وارد کنید:"
              : "❌ <b>Error: Invalid duration!</b>\n\nPlease enter a valid integer (between 1 and 365):",
            500,
            [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
          );
          return;
        }
        setCustomVolDays(days);
        setCustomVolStep("confirm");

        // Calculate price based on customPricingBoxes
        let priceGb = 3000;
        let priceDay = 2000;
        if (settings?.customPricingBoxes) {
          const box = settings.customPricingBoxes.find(b => b.serverIds?.includes(customVolServerId || ""));
          if (box) {
            priceGb = box.pricePerGb ?? 3000;
            priceDay = box.pricePerDay ?? 2000;
          }
        }

        const totalPrice = (customVolGb * priceGb) + (days * priceDay);

        let serverName = "سرور انتخابی";
        if (settings?.servers) {
          const s = settings.servers.find(srv => String(srv.id) === customVolServerId);
          if (s) serverName = s.name;
        }

        const invoiceText = lang === "fa"
          ? `📊 <b>پیش‌فاکتور ساخت کانفیگ دلخواه</b>\n\n` +
            `🌐 سرور: <b>${serverName}</b>\n` +
            `👤 نام کاربری: <code>${customVolUsername}</code>\n` +
            `🔻 حجم درخواستی: <b>${customVolGb} گیگابایت</b>\n` +
            `⏳ مدت زمان: <b>${days} روز</b>\n\n` +
            `💵 هزینه هر گیگابایت: ${priceGb.toLocaleString()} تومان\n` +
            `💵 هزینه هر روز: ${priceDay.toLocaleString()} تومان\n` +
            `──────────────────\n` +
            `💰 <b>جمع کل: ${totalPrice.toLocaleString()} تومان</b>\n\n` +
            `⚠️ هزینه ساخت مستقیماً از موجودی کیف پول شما کسر خواهد شد.`
          : `📊 <b>Custom Config Pre-Invoice</b>\n\n` +
            `🌐 Server: <b>${serverName}</b>\n` +
            `👤 Username: <code>${customVolUsername}</code>\n` +
            `🔻 Traffic: <b>${customVolGb} GB</b>\n` +
            `⏳ Duration: <b>${days} Days</b>\n\n` +
            `💰 <b>Total Price: ${totalPrice.toLocaleString()} Toman</b>`;

        addBotReply(
          invoiceText,
          500,
          undefined,
          [
            [
              { text: lang === "fa" ? "✅ تایید و پرداخت از کیف پول" : "✅ Confirm & Pay", action: `confirm_buy_cust_val:${customVolServerId}:${customVolUsername}:${customVolGb}:${days}:${totalPrice}` },
              { text: lang === "fa" ? "❌ لغو" : "❌ Cancel", action: "btn_back_home" }
            ]
          ]
        );
        return;
      }
    }

    // Handle Custom Renewal Step Handlers
    if (renewStep !== "idle") {
      const input = text.trim();
      if (input.includes("انصراف") || input.includes("Cancel") || input.includes("بازگشت") || input.includes("منوی اصلی")) {
        setRenewStep("idle");
        setRenewingSubId(null);
        addBotReply(lang === "fa" ? "❌ عملیات تمدید لغو شد." : "❌ Renewal cancelled.", 500, getKeyboard());
        return;
      }

      if (renewStep === "ask_gb") {
        const gb = parseInt(input);
        if (isNaN(gb) || gb <= 0 || gb > 1000) {
          addBotReply(
            lang === "fa"
              ? "❌ <b>خطا: ترافیک نامعتبر است!</b>\n\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۱۰۰۰) وارد کنید:"
              : "❌ <b>Error: Invalid traffic limit!</b>\n\nPlease enter a valid integer (between 1 and 1000):",
            500,
            [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
          );
          return;
        }
        setRenewGbVal(gb);
        setRenewStep("ask_days");
        addBotReply(
          lang === "fa"
            ? "⏳ <b>انتخاب مدت زمان تمدید:</b>\n\nلطفاً تعداد روزهای اضافی جهت تمدید اشتراک را به <b>روز (Days)</b> وارد کنید (مثلاً <code>30</code>):"
            : "⏳ <b>Select Renewal Duration:</b>\n\nPlease enter additional days (e.g. <code>30</code>):",
          500,
          [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
        );
        return;
      }

      if (renewStep === "ask_days") {
        const days = parseInt(input);
        if (isNaN(days) || days <= 0 || days > 365) {
          addBotReply(
            lang === "fa"
              ? "❌ <b>خطا: تعداد روزها نامعتبر است!</b>\n\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۳۶۵) وارد کنید:"
              : "❌ <b>Error: Invalid duration!</b>\n\nPlease enter a valid integer (between 1 and 365):",
            500,
            [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
          );
          return;
        }
        setRenewDaysVal(days);
        setRenewStep("confirm");

        const sub = simulatedKeys.find(k => k.id === renewingSubId);
        if (!sub) {
          setRenewStep("idle");
          setRenewingSubId(null);
          addBotReply("❌ خطا: اشتراک یافت نشد.", 500, getKeyboard());
          return;
        }

        const serverId = (sub as any).serverId || "";
        let priceGb = 3000;
        let priceDay = 2000;
        if (settings?.customPricingBoxes) {
          const box = settings.customPricingBoxes.find(b => b.serverIds?.includes(serverId));
          if (box) {
            priceGb = box.pricePerGb ?? 3000;
            priceDay = box.pricePerDay ?? 2000;
          }
        }

        const totalPrice = (renewGbVal * priceGb) + (days * priceDay);

        const invoiceText = lang === "fa"
          ? `🔄 <b>پیش‌فاکتور تمدید و ارتقای اشتراک</b>\n\n` +
            `👤 نام کاربری سرویس: <code>${sub.clientName || sub.planName}</code>\n` +
            `➕ حجم ترافیک اضافی: <b>${renewGbVal} گیگابایت</b>\n` +
            `➕ مدت زمان تمدید: <b>${days} روز</b>\n\n` +
            `💵 قیمت هر گیگابایت: ${priceGb.toLocaleString()} تومان\n` +
            `💵 قیمت هر روز: ${priceDay.toLocaleString()} تومان\n` +
            `──────────────────\n` +
            `💰 <b>جمع کل هزینه تمدید: ${totalPrice.toLocaleString()} تومان</b>\n\n` +
            `👇 لطفا یکی از روش‌های پرداخت زیر را جهت تمدید فوری انتخاب نمایید:`
          : `🔄 <b>Renewal Pre-Invoice</b>\n\n` +
            `👤 Service: <code>${sub.clientName || sub.planName}</code>\n` +
            `➕ Extra Volume: <b>${renewGbVal} GB</b>\n` +
            `➕ Extra Duration: <b>${days} Days</b>\n\n` +
            `💰 <b>Total Price: ${totalPrice.toLocaleString()} Toman</b>\n\nPlease select your payment method below:`;

        addBotReply(
          invoiceText,
          500,
          undefined,
          [
            [
              { text: lang === "fa" ? "✅ پرداخت از کیف پول" : "✅ Pay from Wallet", action: `confirm_renew_cust_val:${renewingSubId}:${renewGbVal}:${days}:${totalPrice}` },
              { text: lang === "fa" ? "💳 کارت به کارت مستقیم" : "💳 Card-to-Card Pay", action: `renew_direct_card:${renewingSubId}:${renewGbVal}:${days}:${totalPrice}` }
            ],
            [
              { text: lang === "fa" ? "❌ لغو" : "❌ Cancel", action: `manage_sub_${renewingSubId}` }
            ]
          ]
        );
        return;
      }
    }

    // Handle support ticket subject input
    if (supportStep === "ask_subject") {
      const subject = text.trim();
      if (subject.includes("انصراف") || subject.includes("Cancel") || subject.includes("بازگشت") || subject.includes("منوی اصلی")) {
        setSupportStep("idle");
        addBotReply(lang === "fa" ? "❌ فرآیند ثبت تیکت لغو شد." : "❌ Ticket filing cancelled.", 500, getKeyboard());
        return;
      }
      setTicketSubject(subject);
      setSupportStep("ask_message");
      addBotReply(
        lang === "fa"
          ? `📝 <b>موضوع تیکت شما:</b> "${subject}"\n\nحالا لطفاً پیام خود را همراه جزئیات شرح دهید تا به واحد فنی ارسال گردد:`
          : `📝 <b>Subject:</b> "${subject}"\n\nNow description of your issue. Please type your detailed message here:`,
        600,
        [
          [lang === "fa" ? "❌ انصراف از ثبت تیکت" : "❌ Cancel Ticket"]
        ]
      );
      return;
    }

    // Handle support message input & register ticket
    if (supportStep === "ask_message") {
      const message = text.trim();
      if (message.includes("انصراف") || message.includes("Cancel") || message.includes("بازگشت") || message.includes("منوی اصلی")) {
        setSupportStep("idle");
        addBotReply(lang === "fa" ? "❌ فرآیند ثبت تیکت لغو شد." : "❌ Ticket filing cancelled.", 500, getKeyboard());
        return;
      }
      setSupportStep("idle");
      addBotReply(lang === "fa" ? "⏳ در حال فرستادن اطلاعات تیکت و ثبت در سامانه پرونده‌ها..." : "⏳ Submitting ticket to dashboard agents...", 500);

      // Call API to create a live, real ticket
      fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.userId,
          username: currentUser.username,
          subject: ticketSubject,
          message: message
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (setTickets) {
            setTickets(data.tickets);
          }
          addBotReply(
            lang === "fa"
              ? `✅ <b>تیکت شما با موفقیت در سامانه پیگیری ثبت گردید!</b>\n\n🎟️ <b>شناسه پرونده:</b> <code>${data.ticket.id}</code>\n📂 <b>موضوع:</b> ${data.ticket.subject}\n\nپیام شما برای بخش پشتیبانی دالتون ارسال شد. پاسخ کارشناس به زودی در همین ربات ظاهر خواهد شد.`
              : `✅ <b>Ticket filed successfully!</b>\n\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\n📂 <b>Subject:</b> ${data.ticket.subject}\n\nOur service agents will review and reply swiftly.`,
            800,
            getKeyboard()
          );

          // Trigger admin DMs desktop notification float!
          setAdminNotification({
            id: data.ticket.id,
            username: currentUser.username,
            subject: data.ticket.subject
          });
        } else {
          addBotReply(
            lang === "fa" ? `❌ خطا در ثبت تیکت: ${data.error}` : `❌ Failed to submit ticket: ${data.error}`,
            600,
            getKeyboard()
          );
        }
      })
      .catch(() => {
        addBotReply(lang === "fa" ? "❌ خطایی در اتصال به سامانه رخ داد." : "❌ Network error registering ticket.", 500, getKeyboard());
      });
      return;
    }

    // Handle Transfer ownership receiver input
    if (transferringKeyId) {
      const targetUser = text.trim();
      const subId = transferringKeyId;
      setTransferringKeyId(null);

      if (targetUser.includes("انصراف") || targetUser.includes("Cancel") || targetUser.includes("بازگشت") || targetUser.includes("منوی اصلی")) {
        addBotReply(lang === "fa" ? "❌ عملیات انتقال مالکیت لغو شد." : "❌ Ownership transfer cancelled.", 500, getKeyboard());
        return;
      }

      addBotReply(lang === "fa" ? "⏳ در حال اعتبارسنجی کاربر مقصد و انتقال مالکیت..." : "⏳ Initiating ownership transfer...", 500);

      setTimeout(() => {
        setSimulatedKeys(prev => prev.filter(k => k.id !== subId));
        addBotReply(
          lang === "fa"
            ? `🎉 <b>انتقال با موفقیت انجام شد! (شبیه‌ساز آموزشی ✨)</b>\n\nسرویس شما به عنوان هدیه با موفقیت به پنل کاربر <b>@${targetUser}</b> منتقل شد و از حساب شما کسر گردید.\n\n⚠️ <i>محیط آزمایشی شبیه‌ساز: اطلاعات دیتابیس بدون تغییر باقی مانده است.</i>`
            : `🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\n\nThis subscription has been successfully gifted to @${targetUser}.\n\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>`,
          800,
          getKeyboard()
        );
      }, 700);
      return;
    }

    // Check plan cancellation
    if (selectedPlanToBuy && (text.includes("انصراف") || text.includes("بازگشت") || text.includes("منوی اصلی") || text.includes("منصرف") || text.includes("Cancel") || text.includes("cancel") || text.includes("برگشت") || text.includes("انصراف و برگشت"))) {
      setSelectedPlanToBuy(null);
      setPurchaseStep("idle");
      addBotReply(t.buyCancelConfirmation, 500, [
        [t.btnBuyPlan, t.btnMyAccount],
        [t.btnTopUp, t.btnSupport]
      ]);
      return;
    }

    if (selectedPlanToBuy && purchaseStep === "ask_client_name") {
      const clientNameInput = text.trim();
      const safeNameRegex = /^[a-zA-Z0-9_-]{3,15}$/;
      if (!safeNameRegex.test(clientNameInput)) {
        addBotReply(
          lang === "fa"
            ? "⚠️ <b>نام وارد شده نامعتبر است!</b>\n\nنام کاربری باید فقط شامل حروف انگلیسی، اعداد، خط تیره و بین ۳ تا ۱۵ کاراکتر باشد (بدون فاصله یا حروف فارسی).\n\nلطفاً یک نام انگلیسی معتبر بنویسید:"
            : "⚠️ <b>Invalid Username!</b>\n\nUsername must contain English letters, numbers, hyphens, and be between 3 and 15 characters long (no spaces/Persian).\n\nPlease write a valid English name:",
          500,
          [[lang === "fa" ? "🏠 بازگشت به منوی اصلی" : "🏠 Main Menu"]]
        );
        return;
      }

      setPurchaseStep("sending");
      addBotReply(
        lang === "fa"
          ? "⏳ در حال ساخت کانفیگ اختصاصی شما روی پروتکل‌های فعال چندگانه در هسته ۳x-ui و ثبت سابسکریپشن..."
          : "⏳ Generating your dedicated configurations on multiple active inbounds in the 3x-ui core...",
        500,
        []
      );

      setTimeout(() => {
        const isUserAdminOrOwner = currentUser.userId === 6536288293 || currentUser.username === "daltoon_owner";
        const price = isUserAdminOrOwner ? 0 : selectedPlanToBuy.price;
        const newBal = currentUser.walletBalance - price;

        if (newBal < 0) {
          setSelectedPlanToBuy(null);
          setPurchaseStep("idle");
          addBotReply(
            lang === "fa"
              ? "❌ موجودی کیف پول شبیه‌ساز شما کافی نیست. لطفاً ابتدا کیف پول خود را شارژ آزمایشی کرده و مجدداً امتحان کنید."
              : "❌ Insufficient sandbox balance. Please recharge your test wallet first.",
            500,
            getKeyboard()
          );
          return;
        }

        const randomSubId = "SUB-" + Math.floor(Math.random() * 9000 + 1000);
        const expireDate = new Date(Date.now() + selectedPlanToBuy.durationDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const mockSub = {
          id: randomSubId,
          userId: currentUser.userId,
          planId: selectedPlanToBuy.id,
          planName: selectedPlanToBuy.name,
          subLink: `vless://mock_vless_uuid_${randomSubId}@server.example.com:2052?security=reality&sni=google.com&fp=chrome#Mock_${randomSubId}`,
          expireDate,
          trafficLimitGb: selectedPlanToBuy.trafficGb,
          trafficUsedGb: 0,
          status: "active" as const,
          serverId: (selectedPlanToBuy as any)._serverId
        };

        // Update simulated states
        setSimulatedUsers(prev => prev.map(u => u.userId === currentUser.userId ? { ...u, walletBalance: newBal } : u));
        setSimulatedKeys(prev => [mockSub, ...prev]);

        setSelectedPlanToBuy(null);
        setPurchaseStep("idle");

        const deliveryNote = settings?.purchaseSuccessNote ? `\n\n${settings.purchaseSuccessNote}` : "";
        const confirmMsg = lang === "fa"
          ? `🎉 <b>خرید آزمایشی شما با موفقیت انجام شد!</b>\n\n` +
            `👤 نام کاربری سرویس شما: <code>${clientNameInput}</code>\n` +
            `💳 هزینه کسر شده: ${isUserAdminOrOwner ? "۰ تومان (ویژه ادمین 👑)" : price.toLocaleString() + " تومان"}\n` +
            `💰 موجودی باقیمانده کیف پول آزمایشی: ${newBal.toLocaleString()} تومان\n\n` +
            `🔑 <b>کانفیگ VLESS اختصاصی (آزمایشی) صادر شد:</b>\n` +
            `• مسیر اشتراک:\n\n` +
            `<code>${mockSub.subLink}</code>\n\n` +
            `⚠️ <i>توجه: کل سیستم شبیه‌ساز کاملاً آموزشی است و هیچ تأثیری بر کیف پول دیتابیس واقعی ندارد.</i>${deliveryNote}`
          : `🎉 <b>Simulated subscription purchased!</b>\n\n` +
            `👤 Username: <code>${clientNameInput}</code>\n` +
            `💳 Price Deducted: ${isUserAdminOrOwner ? "0 (Admin Free 👑)" : price.toLocaleString() + " Toman"}\n` +
            `💰 Simulated Wallet Balance: ${newBal.toLocaleString()} Toman\n\n` +
            `🔑 <b>Simulated configuration generated:</b>\n` +
            `<code>${mockSub.subLink}</code>\n\n` +
            `⚠️ <i>Notice: This educational sandbox does not consume physical key structures.</i>${deliveryNote}`;

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockSub.subLink)}`;

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "bot",
              text: confirmMsg,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              keyboard: getKeyboard(),
              inlineButtons: [
                [
                  { text: lang === "fa" ? "🔗 دریافت لینک ساب" : "🔗 Get Sub Link", action: `get_sub_link_${randomSubId}` },
                  { text: lang === "fa" ? "🔗 لینک‌های vless" : "🔗 Vless Links", action: `get_vless_links_${randomSubId}` }
                ]
              ],
              imageUrl: qrUrl
            }
          ]);
        }, 1000);
      }, 1000);
      return;
    }

    // Process Bot Response Logic
    const matchedCustom = (customButtons || []).find(cb => cb.text === text || text.includes(cb.text));
    if (matchedCustom) {
      addBotReply(matchedCustom.replyText, 600);
      return;
    }

    if (text === (settings?.btnTextBuyNew || "🛒 خرید اشتراک جدید") || text.includes("خرید") || text.includes("Buy") || text.includes("Plan")) {
        const activeServers = (settings?.servers || []).filter((s: any) => s.status === 'active');
        
        if (activeServers.length > 0) {
          const inlineServers = activeServers.map((s: any) => ([
            { text: `🌐 [${s.panelType === "rebecca" ? "Reebeka" : "Sanaei"}] ${s.name}`, action: `srvsel_${s.id}` }
          ]));
          
          inlineServers.push([
            { text: lang === "fa" ? "🔙 بازگشت" : "🔙 Back", action: "btn_back_home" },
            { text: lang === "fa" ? "🏠 منوی اصلی" : "🏠 Main Menu", action: "btn_back_home" }
          ]);
          
          addBotReply(
            lang === "fa" 
              ? "🌐 لطفا سرور مورد نظر خود را انتخاب کنید:" 
              : "🌐 Please select your preferred server:",
            800,
            undefined,
            inlineServers
          );
        } else {
          // Fallback to categories directly if no servers
          const cats = new Set<string>();
          plans.forEach(p => cats.add(p.category || (lang === "fa" ? "سایر" : "Others")));
          const definedCats = planCategories || [];
          
          const inlineCats: any[] = [];
          definedCats.forEach(c => {
            if (plans.some(p => p.category?.toLowerCase() === c.name.toLowerCase())) {
              inlineCats.push({ text: `${c.emoji || "⚡"} ${c.name}`, action: `plcat_${c.name}` });
              cats.delete(c.name);
            }
          });
          cats.forEach(c => {
            inlineCats.push({ text: `⚡ ${c}`, action: `plcat_${c}` });
          });

          inlineCats.push([
            { text: lang === "fa" ? "🔙 بازگشت" : "🔙 Back", action: "btn_back_home" },
            { text: lang === "fa" ? "🏠 منوی اصلی" : "🏠 Main Menu", action: "btn_back_home" }
          ]);

          addBotReply(
            lang === "fa" 
              ? "لطفا یکی از دسته‌بندی‌های زیر را برای مشاهده طرح‌ها انتخاب کنید:" 
              : "Please select one of the following categories to view plans:",
            800,
            undefined,
            inlineCats
          );
        }
    } 
    else if (text === (settings?.btnTextProfile || "👤 حساب کاربری") || text.includes("👤") || text.includes("حساب") || text.includes("Account")) {
      const activeUserKeys = simulatedKeys.filter(k => k.userId === currentUser.userId);
      
      let faJoinDate = "نامشخص";
      let enJoinDate = "Unknown";
      if (currentUser?.joinDate) {
        try {
          const jdDate = new Date(currentUser.joinDate);
          faJoinDate = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(jdDate);
          enJoinDate = currentUser.joinDate;
        } catch (e) {
          console.error(e);
        }
      }

      // Profile Info (without active plans details string, we'll keep it simple profile)
      addBotReply(
        lang === "fa"
          ? `📄 <b>اطلاعات حساب کاربری شما:</b>\n\n💰 موجودی: ${(currentUser.walletBalance || 0).toLocaleString()} تومان\n👤 آیدی عددی: <code>${currentUser.userId}</code>\n📦 تعداد سرویس ها: ${activeUserKeys.length}\n🗓 تاریخ ورود به بات: ${faJoinDate}\n\n🔹 جهت شارژ کیف پول خود، می‌توانید به بخش مربوطه در منوی اصلی ربات مراجعه فرمایید.`
          : `📄 <b>My Account Profile:</b>\n\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\n👤 User ID: <code>${currentUser.userId}</code>\n📦 Active Services: ${activeUserKeys.length}\n🗓 Join Date: ${enJoinDate}\n\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu.`,
        600,
        undefined,
        [
          { text: lang === "fa" ? "🎁 اعمال کد هدیه" : "🎁 Redeem Code", action: "btn_gift_code" },
          [
            { text: lang === "fa" ? "🔙 بازگشت" : "🔙 Back", action: "btn_back_home" },
            { text: lang === "fa" ? "🏠 منوی اصلی" : "🏠 Main Menu", action: "btn_back_home" }
          ]
        ]
      );
    }
    else if (text === (settings?.btnTextMySubs || "🗂 اشتراک های من / تمدید") || text.includes("اشتراک های من") || text.includes("🗂")) {
      const activeUserKeys = simulatedKeys.filter(k => k.userId === currentUser.userId);
      if (activeUserKeys.length > 0) {
        const inlineSubsButtons = activeUserKeys.map((k, idx) => [
          { text: lang === "fa" ? `⚙️ مدیریت: ${k.planName} (${idx + 1})` : `⚙️ Manage: ${k.planName} (${idx + 1})`, action: `manage_sub_${k.id}` }
        ]);
        addBotReply(
          lang === "fa"
            ? `🗂 <b>تعداد اشتراک‌های فعال شما: ${activeUserKeys.length} سرویس</b>\n\nجهت تمدید ساب، ابطال و تغییر کلید خصوصی (Reset UUID)، یا انتقال مالکیت به دوست روی دکمه مدیریت آن ضربه بزنید:`
            : `🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\n\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:`,
          600,
          undefined,
          inlineSubsButtons
        );
      } else {
        addBotReply(
          lang === "fa"
            ? "❌ شما تا کنون هیچ سرویس اشتراکی در حساب خود دریافت نکرده‌اید."
            : "❌ You have no active subscriptions registered." ,
          600
        );
      }
    }
    else if (text === (settings?.btnTextFreeTest || "🎁 موجودی رایگان") || text.includes("🎁") || text.includes("رایگان") || text.includes("Free")) {
        if (settings?.isFreeTestActive === false) {
           addBotReply(settings?.freeTestDisabledMessage || (lang === "fa" ? "اکانت تست رایگان فعلا موجود نیست." : "Free test is not available right now."), 500);
        } else {
           const freeGb = settings?.freeTestGb !== undefined ? settings?.freeTestGb : 0.1;
          const freeDays = settings?.freeTestDays !== undefined ? settings?.freeTestDays : 1;
          const freeGbStr = freeGb < 1 ? `${Math.round(freeGb * 1024)} مگابایت` : `${freeGb} گیگابایت`;
          const freeDaysStr = `${freeDays} روزه`;
          addBotReply(lang === "fa" ? `⏳ در حال ساخت اکانت تست رایگان ${freeDaysStr} (${freeGbStr})...` : `⏳ Generating ${freeDaysStr} (${freeGbStr}) test account...`, 500, []);
           
           setTimeout(() => {
             const randomSubId = "TEST-" + Math.floor(Math.random() * 9000 + 1000);
             const expireDate = new Date(Date.now() + freeDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
             
             const mockSub = {
               id: randomSubId,
               userId: currentUser.userId,
               planId: "free_test",
               planName: `تست رایگان ${freeGbStr} - ${freeDaysStr}`,
               subLink: `vless://mock_test_uuid_${randomSubId}@server.example.com:2052?security=reality&sni=google.com&fp=chrome#Test_${randomSubId}`,
               expireDate,
               trafficLimitGb: freeGb,
               trafficUsedGb: 0,
               status: "active" as const
             };
     
             // Update simulated states exclusively
             setSimulatedKeys(prev => [mockSub, ...prev]);
             
             const confirmMsg = lang === "fa"
               ? `🎉 <b>اکانت تست رایگان شما با موفقیت ساخته شد!</b>\n\n` +
                 `👤 نام کاربری سرویس: <code>test_${currentUser.username || currentUser.userId}</code>\n` +
                 `⏳ اعتبار: ${freeDaysStr}\n` +
                 `حجم: ${freeGbStr}\n\n` +
                 `🔑 <b>کانفیگ VLESS اختصاصی (آزمایشی) صادر شد:</b>\n` +
                 `<code>${mockSub.subLink}</code>\n\n` +
                 `⚠️ <i>توجه: کل سیستم شبیه‌ساز کاملاً آموزشی است.</i>`
               : `🎉 <b>Simulated Free Test generated!</b>\n\n` +
                 `👤 Username: <code>test_${currentUser.username || currentUser.userId}</code>\n` +
                 `⏳ Duration: ${freeDaysStr} - ${freeGbStr}\n\n` +
                 `🔑 <b>Simulated configuration generated:</b>\n` +
                 `<code>${mockSub.subLink}</code>\n\n` +
                 `⚠️ <i>Notice: This is an educational sandbox.</i>`;
     
             addBotReply(confirmMsg, 1000, getKeyboard(), [
               [
                 { text: lang === "fa" ? "🔗 دریافت لینک ساب" : "🔗 Get Sub Link", action: `get_sub_link_${randomSubId}` },
                 { text: lang === "fa" ? "🔗 لینک‌های vless" : "🔗 Vless Links", action: `get_vless_links_${randomSubId}` }
               ]
             ]);
           }, 1500);
        }
    }
    else if (text === (settings?.btnTextInstantSupport || "🤖 پشتیبانی آنی") || text.includes("🤖")) {
        addBotReply(lang === "fa" ? "🤖 پاسخگوی خودکار غیرفعال است. لطفا به پشتیبانی انسانی پیام دهید." : "Instant support AI offline.", 500);
    }
    else if (text === (settings?.btnTextFeedback || "💌 بازخورد کاربر ها") || text.includes("💌") || text.includes("Feedback")) {
        addBotReply(lang === "fa" ? "💌 با تشکر از بازخورد شما. نظرات شما ثبت خواهد شد." : "Thank you for your feedback.", 500);
    }
    else if (text === (settings?.btnTextGuides || "💡 آموزش ها") || text.includes("💡") || text.includes("آموزش")) {
        const defaultGuideText = lang === "fa" 
          ? "🌐 <b>راهنمای فعال‌سازی و اتصال به سرویس (لینک سابسکریپشن)</b>\n\nکاربر گرامی، ضمن تشکر از انتخاب و اعتماد شما، روش فعال‌سازی و راه‌اندازی سرویس به شرح زیر می‌باشد:\n\n۱. نرم‌افزار متناسب با سیستم‌عامل خود را دانلود و نصب کنید:\n• اندروید: v2rayNG\n• آیفون (iOS): V2box یا Streisand\n• ویندوز: Nekoray یا v2rayN\n\n۲. لینک اشتراک (سابسکریپشن) دریافتی از ربات را کپی نمایید.\n\n۳. وارد نرم‌افزار شده و پیوند کپی شده را اضافه نمایید (معمولاً دکمه + و انتخاب گزینه Import from clipboard یا Add Subscription).\n\n۴. روی گزینه Update Subscription کلیک کنید تا تمام سرورها بارگذاری شوند.\n\n۵. یکی از سرورها را انتخاب کرده و اتصال را برقرار نمایید. در صورت بروز هرگونه مشکل با دکمه پشتیبانی در تماس باشید."
          : "Tutorials coming soon.";
        addBotReply(settings?.guidesText || defaultGuideText, 400);
    }
    else if (text === (settings?.btnTextReferral || "👥 زیرمجموعه گیری") || text.includes("👥") || text.includes("زیرمجموعه")) {
      const botUsername = settings?.botTelegramHandle || "your_bot_id";
      const percent = settings?.referralRewardPercent ?? 5;
      const amount = settings?.referralBaseAmount ?? 100000;
      const calculatedReward = Math.max(0, Math.round((amount * percent) / 100));
      const uid = currentUser.userId;
      const link = `https://t.me/${botUsername}?start=${uid}`;
      
      let defaultMsgFa = `برای کسب موجودی هدیه، دوستان و آشنایان خودتون رو با لینک پایین به ربات دعوت کنید 👥\n\n` + 
          `در ضمن کد معرف اختصاصی شما {uid} می باشد.\n\n` + 
          `{link}\n\n` +
          `🎁 با دعوت از هر دوست، {reward} تومان (معادل {percent}% مبلغ پایه) پاداش دریافت می‌کنید.\n\n` + 
          `📊 آمار دعوت شما\n` + 
          `• افراد وارد شده با لینک: 0\n` + 
          `• پاداش دریافت شده: 0 تومان`;
          
      let defaultMsgEn = `To earn rewards, invite your friends with your dedicated link 👥\n\n` +
          `Your Referral ID is {uid}.\n\n` +
          `{link}\n\n` +
          `🎁 For every successful invite, you get {reward} Toman (equivalent to {percent}% of base amount).\n\n` +
          `📊 Referral Stats:\n` +
          `• Invited Users: 0\n` +
          `• Total Rewards: 0`;

      let rawTemplate = settings?.referralMessage || (lang === "fa" ? defaultMsgFa : defaultMsgEn);
      
      const purchasePercent = settings?.referralPurchasePercent ?? 5;

      let replyText = rawTemplate
        .replace(/{uid}/g, uid.toString())
        .replace(/{link}/g, link)
        .replace(/{percent}/g, percent.toString())
        .replace(/{purchase_percent}/g, purchasePercent.toString())
        .replace(/{amount}/g, amount.toLocaleString())
        .replace(/{reward}/g, calculatedReward.toLocaleString());

      addBotReply(replyText, 600);
    }
    else if (text === (settings?.btnTextWallet || "💵 کیف پول + شارژ") || text === "💳 شارژ کیف پول" || text.includes("شارژ") || text.includes("Wallet") || text === "💵 کیف پول + شارژ" || text.includes("کیف پول")) {
      if (lang === "fa") {
        addBotReply(
          `💳 <b>بخش شارژ و افزایش موجودی کیف پول دالتون:</b>\n\n💰 موجودی فعلی: <b>${currentUser.walletBalance.toLocaleString()} تومان</b>\n\nلطفاً مبلغی که مایل هستید جهت شارژ واریز کنید را از دکمه‌های زیر انتخاب نمایید:\nپس از انتخاب، اطلاعات پرداخت مرتبط با آن برای شما فرستاده می‌شود.`,
          800,
          undefined,
          [
            [
              { text: "💵 ۱۰۰,۰۰۰ تومان", action: "charge_100000" },
              { text: "💵 ۲۰۰,۰۰۰ تومان", action: "charge_200000" }
            ],
            [
              { text: "💵 ۳۰۰,۰۰۰ تومان", action: "charge_300000" },
              { text: "💵 ۵۰۰,۰۰۰ تومان", action: "charge_500000" }
            ],
            { text: "🔥 ۱,۰۰۰,۰۰۰ تومان", action: "charge_1000000" },
            { text: "🔗 افزایش موجودی دلخواه (وارد کردن مبلغ)", action: "charge_custom_amount" },
            [
              { text: "🔙 بازگشت", action: "btn_back_home" },
              { text: "🏠 منوی اصلی", action: "btn_back_home" }
            ]
          ] as any
        );
      } else {
        addBotReply(
          `💳 Deposit Wallet: \n\n💰 Current Balance: <b>${currentUser.walletBalance.toLocaleString()} Toman</b>\n\nPlease select the amount to recharge:`,
          800,
          undefined,
          [
            [
              { text: "💵 100k Toman", action: "charge_100000" },
              { text: "💵 200k Toman", action: "charge_200000" }
            ],
            [
              { text: "💵 300k Toman", action: "charge_300000" },
              { text: "💵 500k Toman", action: "charge_500000" }
            ],
            { text: "🔥 1M Toman", action: "charge_1000000" },
            { text: "🔗 Custom Amount", action: "charge_custom_amount" },
            [
              { text: "🔙 Back", action: "btn_back_home" },
              { text: "🏠 Main Menu", action: "btn_back_home" }
            ]
          ] as any
        );
      }
    } 
    else if (text === (settings?.btnTextTicketSupport || "🎫 تیکت به پشتیبانی")) {
      setSupportStep("ask_subject");
      addBotReply(
        lang === "fa"
          ? "🎟️ <b>ثبت تیکت دیجیتال پشتیبانی:</b>\n\nدر این بخش شما یک پرونده الکترونیکی با دپارتمان پشتیبانی دالتون ایجاد می‌کنید.\n\nلطفاً <b>موضوع تیکت خود</b> (به عنوان مثال: قطع بودن سرور، عدم تمدید، شارژ نادرست کیف پول و...) را وارد کنید:"
          : "🎟️ <b>File Support Ticket:</b>\n\nPlease type the <b>Subject</b> of your support request (e.g. Server down, subscription issue, etc.):",
        500,
        [
          [lang === "fa" ? "❌ انصراف از ثبت تیکت" : "❌ Cancel Ticket"]
        ]
      );
    }
    else if (text.includes("📞") || text.includes("پشتیبانی") || text.includes("Support") || text.includes("support") || text.includes("🎧") || text.includes("تیکت") || text.includes("Ticket")) {
      addBotReply(
        lang === "fa" 
          ? "🎧 <b>مرکز پشتیبانی و تیکتینگ هوشمند دالتون:</b>\n\nهم‌اکنون پشتیبانی ما به صورت ۲۴ ساعته فعال است. شما می‌توانید مستقیماً با تیم پشتیبانی چت کنید یا یک تیکت رسمی ثبت نمایید تا به طور دقیق پرونده شما بررسی شود.\n\nلطفاً یکی از گزینه‌های زیر را انتخاب نمایید:"
          : "🎧 <b>DalToon Support & Ticketing Center:</b>\n\nOur support operations are live 24/7. You can contact support directly or register an official ticket trace.\n\nPlease choose one of the options below:",
        500,
        undefined,
        [
          [
            { text: lang === "fa" ? "🎟️ ثبت تیکت دیجیتال" : "🎟️ File Support Ticket", action: "btn_create_ticket" },
            { text: lang === "fa" ? "💬 پشتیبانی مستقیم تلگرام" : "💬 Chat with Support Agent", action: "btn_direct_support" }
          ],
          [
            { text: lang === "fa" ? "🔙 منوی اصلی" : "🔙 Main Menu", action: "btn_back_home" }
          ]
        ]
      );
    } 

    else {
      // General fallbacks
      addBotReply(
        lang === "fa"
          ? "دستور ارسال شده متوجه نشدم. لطفا از دکمه‌های منوی زیر استفاده کنید. 👇"
          : "Command not recognized. Please use one of the action buttons on the visual keyboard panel below. 👇",
        500,
        [
          [t.btnBuyPlan, t.btnMyAccount],
          [t.btnTopUp, t.btnSupport]
        ]
      );
    }
  };

  const handleInlineClick = (action: string) => {
    // Mimic clicking standard inline telegram button
    if (action === "btn_back_home") {
      addBotReply(lang === "fa" ? "✔️ شما به منوی اصلی بازگشتید." : "Returned to main menu.", 500, getKeyboard());
      return;
    }

    if (action.startsWith("srvsel_")) {
      const serverId = action.replace("srvsel_", "");
      
      const cats = new Set<string>();
      plans.forEach(p => cats.add(p.category || (lang === "fa" ? "سایر" : "Others")));
      const definedCats = planCategories || [];
      
      const inlineCats: any[] = [];
      definedCats.forEach(c => {
        if (plans.some(p => p.category?.toLowerCase() === c.name.toLowerCase())) {
          inlineCats.push({ text: `${c.emoji || "⚡"} ${c.name}`, action: `plcat_${serverId}:${c.name}` });
          cats.delete(c.name);
        }
      });
      cats.forEach(c => {
        inlineCats.push({ text: `⚡ ${c}`, action: `plcat_${serverId}:${c}` });
      });

      if (serverId) {
        inlineCats.push([
          { text: lang === "fa" ? "✨ ساخت کانفیگ با حجم دلخواه" : "✨ Create Custom Volume Config", action: `custom_vol_${serverId}` }
        ]);
      }

      inlineCats.push([
        { text: lang === "fa" ? "🔙 بازگشت به لیست سرورها" : "🔙 Back to Servers", action: (settings?.btnTextBuyNew || "🛒 خرید اشتراک جدید") },
        { text: lang === "fa" ? "🏠 منوی اصلی" : "🏠 Main Menu", action: "btn_back_home" }
      ]);

      addBotReply(
        lang === "fa" 
          ? "لطفا یکی از دسته‌بندی‌های زیر را برای مشاهده طرح‌ها انتخاب کنید:" 
          : "Please select one of the following categories to view plans:",
        800,
        undefined,
        inlineCats
      );
      return;
    }

    if (action.startsWith("plcat_")) {
      let serverId = "";
      let catName = action.replace("plcat_", "");
      
      if (catName.includes(":")) {
        const parts = catName.split(":");
        serverId = parts[0];
        catName = parts[1];
      } else if (catName.startsWith("srv_")) {
        const parts = catName.split("_");
        serverId = parts[0] + "_" + parts[1];
        catName = parts.slice(2).join("_");
      } else {
        const servers = settings?.servers || [];
        let matched = false;
        for (const srv of servers) {
          const srvIdStr = String(srv.id);
          if (catName.startsWith(srvIdStr + "_")) {
            serverId = srvIdStr;
            catName = catName.substring(srvIdStr.length + 1);
            matched = true;
            break;
          }
        }
        if (!matched && catName.includes("_")) {
          const idx = catName.indexOf("_");
          serverId = catName.substring(0, idx);
          catName = catName.substring(idx + 1);
        }
      }
      
      const filteredPlans = plans.filter(p => (p.category || (lang === "fa" ? "سایر" : "Others")).toLowerCase() === catName.toLowerCase());
      
      const inlinePlans: any[] = filteredPlans.map(p => ({
        text: `⚡ ${p.name} - ${p.price.toLocaleString()} ${lang === "fa" ? "تومان" : "Toman"}`,
        action: serverId ? `buy_${serverId}_${p.id}` : `buy_${p.id}`
      }));
      
      if (serverId) {
        inlinePlans.push([
          { text: lang === "fa" ? "✨ ساخت کانفیگ با حجم دلخواه" : "✨ Create Custom Volume Config", action: `custom_vol_${serverId}` }
        ]);
      }

      inlinePlans.push([
        { text: lang === "fa" ? "🔙 بازگشت به دسته‌بندی‌ها" : "🔙 Back to Categories", action: serverId ? `srvsel_${serverId}` : (settings?.btnTextBuyNew || "🛒 خرید اشتراک جدید") },
        { text: lang === "fa" ? "🏠 منوی اصلی" : "🏠 Main Menu", action: "btn_back_home" }
      ]);
      
      addBotReply(
        lang === "fa"
          ? `⚡️ <b>پلن‌های بخش ${catName}</b>\n\nلطفاً یکی از تعرفه‌های معتبر زیر را انتخاب کنید تا فرآیند فعال‌سازی فوری آغاز شود:`
          : `⚡️ <b>${catName} Plans</b>\n\nPlease select one of the following premium plans:`,
        800,
        undefined,
        inlinePlans
      );
      return;
    }

    if (action.startsWith("btn_sub_link_")) {
      const subId = action.substring(13);
      const k = keys.find(item => item.id === subId);
      const link = k ? k.subLink : `https://tr.sub-daltoon.ir:2096/sub/simulated_${subId}`;
      
      addBotReply(
        lang === "fa" 
          ? `🔗 <b>لینک اتصال و اشتراک اختصاصی شما:</b>\n\n👇 <b>جهت کپی کردن، روی باکس زیر کلیک یا لمس کنید:</b>\n\n<code>${link}</code>\n\n💡 این لینک را کپی کرده و در برنامه مورد نظر خود (مانند v2rayNG) وارد نمایید.`
          : `🔗 <b>Your Subscription Link:</b>\n\n👇 <b>Click the block below to copy:</b>\n\n<code>${link}</code>\n\n💡 Paste this link into your client application (e.g. v2rayNG).`,
        300
      );
      return;
    }

    if (action.startsWith("get_sub_link_")) {
      const subId = action.substring(13);
      const k = simulatedKeys.find(item => item.id === subId);
      const link = k ? k.subLink : `https://tr.sub-daltoon.ir:2096/sub/simulated_${subId}`;
      addBotReply(
        lang === "fa"
          ? `🔗 <b>لینک اتصال و اشتراک اختصاصی سرویس شما:</b>\n\n` +
            `👤 نام سرویس: <code>${k?.clientName || "DaltoonService"}</code>\n\n` +
            `👇 <b>لینک سابسکریپشن شما (جهت کپی لمس کنید):</b>\n\n` +
            `<code>${link}</code>\n\n` +
            `💡 این لینک را کپی کرده و در نرم‌افزارهای خود (v2rayNG، V2box، Happ و...) وارد نمایید تا کانفیگ‌ها به طور خودکار بارگذاری شوند.`
          : `🔗 <b>Your Exclusive Subscription Link:</b>\n\n` +
            `👤 Service: <code>${k?.clientName || "DaltoonService"}</code>\n\n` +
            `👇 <b>Your Subscription URL (tap to copy):</b>\n\n` +
            `<code>${link}</code>\n\n` +
            `💡 Copy this link and import it into v2rayNG, V2box, Happ, etc.`,
        300,
        undefined,
        [
          [
            { text: lang === "fa" ? "🔗 لینک‌های vless" : "🔗 Vless Links", action: `get_vless_links_${subId}` },
            { text: lang === "fa" ? "🔙 بازگشت به مدیریت" : "🔙 Back to Manage", action: `manage_sub_${subId}` }
          ]
        ]
      );
      return;
    }

    if (action.startsWith("get_vless_links_")) {
      const subId = action.substring(16);
      const k = simulatedKeys.find(item => item.id === subId);
      const uuid = k?.clientUuid || "f39281a1-9b1d-4050-b498-3882aef1277a";
      const name = k?.clientName || "DaltoonService";
      
      const vlinks = [
        `vless://${uuid}@m.daltoon-server.ir:2053?security=tls&type=ws&path=%2F#Vless-Irancell-${name}-⚡`,
        `vless://${uuid}@m.daltoon-server.ir:2083?security=tls&type=ws&path=%2F#Vless-HamrahAval-${name}-🚀`,
        `vless://${uuid}@m.daltoon-server.ir:2053?security=reality&type=tcp&sni=google.com&fp=chrome#Vless-Germany-${name}-🇩🇪`
      ];

      addBotReply(
        lang === "fa"
          ? `⚡ <b>لیست کانفیگ‌های معمولی VLESS سرویس شما:</b>\n\n` +
            `👤 نام سرویس: <code>${name}</code>\n\n` +
            `👇 <b>جهت کپی کردن، روی هر لینک ضربه بزنید یا لمس کنید:</b>\n\n` +
            vlinks.map(l => `<code>${l}</code>`).join("\n\n") +
            `\n\n💡 این لینک‌ها را کپی کرده و مستقیماً در نرم‌افزارهای V2ray خود وارد نمایید.`
          : `⚡ <b>Your Configs:</b>\n\n` +
            `👤 Service: <code>${name}</code>\n\n` +
            `👇 <b>Tap any config to copy:</b>\n\n` +
            vlinks.map(l => `<code>${l}</code>`).join("\n\n") +
            `\n\n💡 Paste these links directly into your V2ray application.`,
        300,
        undefined,
        [
          [
            { text: lang === "fa" ? "🔗 دریافت لینک ساب" : "🔗 Get Sub Link", action: `get_sub_link_${subId}` },
            { text: lang === "fa" ? "🔙 بازگشت به مدیریت" : "🔙 Back to Manage", action: `manage_sub_${subId}` }
          ]
        ]
      );
      return;
    }

    if (action === "upload_receipt") {
      setShowInvoiceUpload(true);
      return;
    }

    if (action === "btn_wallet_shortcut") {
      handleUserAction("💳 شارژ کیف پول");
      return;
    }

    if (action === "btn_gift_code") {
      addBotReply(lang === "fa" ? "🎁 قابلیت اعمال کد هدیه در شبیه‌ساز غیرفعال است." : "Gift codes not available in demo.", 500);
      return;
    }

    if (action === "btn_direct_support") {
      addBotReply(
        lang === "fa"
          ? "💬 جهت گفتگوی مستقیم تلگرام به آیدی <b>@daltoon_support</b> پیام دهید. تیم ما پس از بررسی پیام شما، فوراً گفتگو را آغاز خواهد کرد."
          : "💬 Send a message to <b>@daltoon_support</b> on Telegram for direct support assistance.",
        500,
        getKeyboard()
      );
      return;
    }

    if (action === "btn_create_ticket") {
      setSupportStep("ask_subject");
      addBotReply(
        lang === "fa"
          ? "🎟️ <b>ثبت تیکت دیجیتال پشتیبانی:</b>\n\nدر این بخش شما یک پرونده الکترونیکی با دپارتمان پشتیبانی دالتون ایجاد می‌کنید.\n\nلطفاً <b>موضوع تیکت خود</b> (به عنوان مثال: قطع بودن سرور، عدم تمدید، شارژ نادرست کیف پول و...) را وارد کنید:"
          : "🎟️ <b>File Support Ticket:</b>\n\nPlease type the <b>Subject</b> of your support request (e.g. Server down, subscription issue, etc.):",
        500,
        [
          [lang === "fa" ? "❌ انصراف از ثبت تیکت" : "❌ Cancel Ticket"]
        ]
      );
      return;
    }

    // --- OPTION 3: INTERACTIVE SUBSCRIPTION MANAGER ---
    if (action.startsWith("manage_sub_")) {
      const subId = action.substring(11);
      const k = simulatedKeys.find(item => item.id === subId);
      if (k) {
        const total = k.trafficLimitGb || 50;
        const used = k.trafficUsedGb || 0;
        const remaining = Math.max(0, total - used);
        let remainingDays = "نامشخص";
        try {
          const expDate = new Date(k.expireDate);
          const now = new Date();
          const diffTime = expDate.getTime() - now.getTime();
          remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))).toString();
        } catch(e) {}

        const detailsText = lang === "fa"
          ? `⚙️ <b>مدیریت لایسنس: ${k.planName}</b>\n━━━━━━━━━━━━━━━━━━\n` +
            `⏳ <b>تاریخ انقضا:</b> ${k.expireDate}\n` +
            `📅 <b>روز باقیمانده:</b> ${remainingDays} روز\n` +
            `🌐 <b>حجم کل:</b> ${total} گیگابایت\n` +
            `📉 <b>حجم مصرفی:</b> ${used.toFixed(2)} گیگابایت\n` +
            `🪫 <b>حجم باقیمانده:</b> ${remaining.toFixed(2)} گیگابایت\n\n` +
            `🔗 <b>لینک سابسکریپشن شما:</b>\n<code>${k.subLink}</code>\n━━━━━━━━━━━━━━━━━━\n` +
            `⚠️ <b>سیستم مدیریت امنیت لایسنس:</b>\n` +
            `• <b>تغییر UUID:</b> اگر حس می‌کنید اتصال لو رفته، UUID را ریست کنید تا لینک ساب جدید تمیز بگیرید.\n` +
            `• <b>انتقال مالکیت:</b> انتقال کلید خریداری شده به پنل دوست دیگر.`
          : `⚙️ <b>Manage License: ${k.planName}</b>\n━━━━━━━━━━━━━━━━━━\n` +
            `⏳ <b>Expiration:</b> ${k.expireDate}\n` +
            `📅 <b>Remaining days:</b> ${remainingDays} days\n` +
            `🌐 <b>Total Volume:</b> ${total} GB\n` +
            `📉 <b>Used Volume:</b> ${used.toFixed(2)} GB\n` +
            `🪫 <b>Remaining Volume:</b> ${remaining.toFixed(2)} GB\n\n` +
            `🔗 <b>Subscription URL:</b>\n<code>${k.subLink}</code>\n━━━━━━━━━━━━━━━━━━`;

        addBotReply(
          detailsText,
          500,
          undefined,
          [
            [
              { text: lang === "fa" ? "🔗 دریافت لینک ساب" : "🔗 Get Sub Link", action: `get_sub_link_${k.id}` },
              { text: lang === "fa" ? "🔗 لینک‌های vless" : "🔗 Vless Links", action: `get_vless_links_${k.id}` }
            ],
            [
              { text: lang === "fa" ? "🔄 تغییر کلید (Reset UUID)" : "🔄 Reset UUID", action: `warn_regen_${k.id}` },
              { text: lang === "fa" ? "🎁 انتقال مالکیت به دوست" : "🎁 Transfer Owner", action: `warn_transfer_${k.id}` }
            ],
            [
              { text: lang === "fa" ? "💳 تمدید با حجم و روز دلخواه" : "💳 Custom Renewal", action: `warn_renew_${k.id}` }
            ],
            [
              { text: lang === "fa" ? "🔙 برگشت به منوی کل" : "🔙 Core Menu", action: "btn_back_home" }
            ]
          ]
        );
      }
      return;
    }

    if (action.startsWith("custom_vol_")) {
      const serverId = action.replace("custom_vol_", "");
      setCustomVolServerId(serverId);
      setCustomVolStep("ask_username");
      addBotReply(
        lang === "fa"
          ? "✨ <b>فرآیند ساخت کانفیگ با مشخصات دلخواه</b>\n\nلطفاً <b>نام کاربری (Username)</b> انگلیسی مورد نظر خود را بنویسید:\n⚠️ نام کاربری فقط شامل حروف انگلیسی، اعداد و خط تیره باشد (بدون فاصله):"
          : "✨ <b>Create Custom Configuration</b>\n\nPlease type your desired English <b>Username</b> (English letters, numbers, hyphens, no spaces):",
        500,
        [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
      );
      return;
    }

    if (action.startsWith("confirm_buy_cust_val:")) {
      const parts = action.split(":");
      const serverId = parts[1];
      const username = parts[2];
      const gb = parseInt(parts[3]);
      const days = parseInt(parts[4]);
      const price = parseInt(parts[5]);

      setCustomVolStep("idle");
      setCustomVolServerId(null);
      addBotReply(lang === "fa" ? "⏳ در حال ساخت اکانت دلخواه شما و ارتباط با پنل..." : "⏳ Provisioning your custom client on 3x-ui panel...", 500);

      setTimeout(() => {
        const isUserAdminOrOwner = currentUser.userId === 6536288293 || currentUser.username === "daltoon_owner";
        const finalPrice = isUserAdminOrOwner ? 0 : price;
        const newBal = currentUser.walletBalance - finalPrice;

        if (newBal < 0) {
          addBotReply(
            lang === "fa"
              ? "❌ موجودی کیف پول شما برای خرید کافی نیست."
              : "❌ Insufficient funds in your simulated wallet.",
            500,
            getKeyboard()
          );
          return;
        }

        const randomSubId = "SUB-" + Math.floor(Math.random() * 9000 + 1000);
        const expireDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const mockSub = {
          id: randomSubId,
          userId: currentUser.userId,
          planId: "custom_vol",
          planName: lang === "fa" ? `کانفیگ دلخواه (${gb}GB)` : `Custom Config (${gb}GB)`,
          clientName: username,
          subLink: `vless://mock_vless_uuid_${randomSubId}@server.example.com:2052?security=reality&sni=google.com&fp=chrome#Mock_${username}`,
          expireDate,
          trafficLimitGb: gb,
          trafficUsedGb: 0,
          status: "active" as const,
          serverId
        };

        setSimulatedUsers(prev => prev.map(u => u.userId === currentUser.userId ? { ...u, walletBalance: newBal } : u));
        setSimulatedKeys(prev => [mockSub, ...prev]);

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockSub.subLink)}`;

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "bot",
              text: lang === "fa"
                ? `🎉 <b>خرید آزمایشی کانفیگ دلخواه با موفقیت انجام شد!</b>\n\n👤 نام کاربری: <code>${username}</code>\n💬 حجم: <b>${gb} گیگابایت</b>\n⏳ مدت زمان: <b>${days} روز</b>\n💳 هزینه: ${isUserAdminOrOwner ? "۰ تومان (ویژه ادمین 👑)" : price.toLocaleString() + " تومان"}\n💰 موجودی کیف پول: ${newBal.toLocaleString()} تومان\n\n🔑 <b>لینک سابسکریپشن:</b>\n<code>${mockSub.subLink}</code>\n\n⚠️ <i>محیط آزمایشی شبیه‌ساز: تراکنش واقعی اعمال نشده است.</i>`
                : `🎉 <b>Custom subscription purchased!</b>\n\n👤 Username: <code>${username}</code>\n💬 Traffic: <b>${gb} GB</b>\n⏳ Duration: <b>${days} Days</b>\n💰 Total Price: ${price.toLocaleString()} Toman\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\n\n🔑 <b>Subscription link:</b>\n<code>${mockSub.subLink}</code>`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              keyboard: getKeyboard(),
              inlineButtons: [
                [
                  { text: lang === "fa" ? "🔗 دریافت لینک ساب" : "🔗 Get Sub Link", action: `get_sub_link_${randomSubId}` },
                  { text: lang === "fa" ? "🔗 لینک‌های vless" : "🔗 Vless Links", action: `get_vless_links_${randomSubId}` }
                ]
              ],
              imageUrl: qrUrl
            }
          ]);
        }, 1000);
      }, 1000);
      return;
    }

    if (action.startsWith("warn_renew_")) {
      const subId = action.substring(11);
      setRenewingSubId(subId);
      setRenewStep("ask_gb");
      addBotReply(
        lang === "fa"
          ? "🔄 <b>تمدید اشتراک با ترافیک و روز دلخواه:</b>\n\n🔻 لطفاً مقدار ترافیک اضافی مورد نیاز خود را به <b>گیگابایت (GB)</b> وارد کنید:\n⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)"
          : "🔄 <b>Renew Subscription with Custom Volume and Duration:</b>\n\n🔻 Please enter extra traffic limit in <b>GB</b> (e.g. <code>30</code>):",
        500,
        [[lang === "fa" ? "❌ انصراف" : "❌ Cancel"]]
      );
      return;
    }

    if (action.startsWith("renew_direct_card:")) {
      const parts = action.split(":");
      const subId = parts[1];
      const gb = parseInt(parts[2]);
      const days = parseInt(parts[3]);
      const price = parseInt(parts[4]);

      const sub = simulatedKeys.find(k => k.id === subId);
      if (!sub) {
        addBotReply("❌ خطا: اشتراک یافت نشد.", 500, getKeyboard());
        return;
      }

      const cardNumbersList = settings?.cardNumbers || [];
      let bankDetailsFa = "";
      let bankDetailsEn = "";
      if (Array.isArray(cardNumbersList) && cardNumbersList.length > 0) {
        bankDetailsFa = cardNumbersList.map((c: any, idx: number) => 
          `💳 ${idx + 1}. ${c.bankName || c.bank || "بانک"}:\n` +
          `<code>${c.number || c.cardNumber || ""}</code>\n` +
          `👤 به نام: <b>${c.holder || c.cardHolder || ""}</b>`
        ).join("\n\n");
        bankDetailsEn = cardNumbersList.map((c: any, idx: number) => 
          `💳 ${idx + 1}. ${c.bankName || c.bank || "Bank"}:\n` +
          `<code>${c.number || c.cardNumber || ""}</code>\n` +
          `👤 Owner: <b>${c.holder || c.cardHolder || ""}</b>`
        ).join("\n\n");
      } else {
        const cardNo = settings?.cardNumber || "۶۲۷۳-۸۱۱۰-۱۲۳۴-۵۶۷۸";
        const cardName = settings?.cardHolder || "مدیریت دالتون";
        bankDetailsFa = `💳 شماره کارت: <code>${cardNo}</code>\n👤 نام صاحب حساب: <b>${cardName}</b>`;
        bankDetailsEn = `💳 Card: <code>${cardNo}</code>\n👤 Owner: <b>${cardName}</b>`;
      }

      const msgText = lang === "fa"
        ? `💳 <b>فاکتور کارت‌به‌کارت مستقیم جهت تمدید اشتراک:</b>\n\n` +
          `👤 نام کاربری سرویس: <code>${sub.clientName || sub.planName}</code>\n` +
          `➕ حجم ترافیک اضافی: <b>${gb} گیگابایت</b>\n` +
          `➕ مدت زمان تمدید: <b>${days} روز</b>\n\n` +
          `💰 <b>مبلغ قابل پرداخت: ${price.toLocaleString()} تومان</b>\n\n` +
          `──────────────────\n` +
          `📌 <b>مشخصات حساب بانکی جهت واریز:</b>\n` +
          `${bankDetailsFa}\n\n` +
          `👇 پس از انجام کارت‌به‌کارت، روی دکمه زیر ضربه بزنید و تصویر فیش واریز را بارگذاری نمایید تا تمدید توسط ادمین تأیید شود:`
        : `💳 <b>Direct Card-to-Card Invoice for Renewal:</b>\n\n` +
          `👤 Service: <code>${sub.clientName || sub.planName}</code>\n` +
          `➕ Extra Volume: <b>${gb} GB</b>\n` +
          `➕ Extra Duration: <b>${days} Days</b>\n\n` +
          `💰 <b>Amount Due: ${price.toLocaleString()} Toman</b>\n\n` +
          `──────────────────\n` +
          `📌 <b>Bank Details:</b>\n` +
          `${bankDetailsEn}\n\n` +
          `👇 After making the payment, click below to upload your transaction slip:`;

      addBotReply(
        msgText,
        500,
        undefined,
        [
          [
            { text: lang === "fa" ? "📸 ارسال فیش واریز" : "📸 Send Receipt", action: `renew_manual_slip:${subId}:${gb}:${days}:${price}` }
          ],
          [
            { text: lang === "fa" ? "🔙 برگشت" : "🔙 Back", action: `manage_sub_${subId}` }
          ]
        ]
      );
      return;
    }

    if (action.startsWith("renew_manual_slip:")) {
      const parts = action.split(":");
      const subId = parts[1];
      const gb = parts[2];
      const days = parts[3];
      const price = parts[4];

      const sub = simulatedKeys.find(k => k.id === subId);
      const subName = sub ? (sub.clientName || sub.planName) : subId;

      setInvoiceAmount(price);
      setInvoiceDesc(
        lang === "fa"
          ? `تمدید مستقیم ساب ${subName} (${gb}گیگابایت - ${days}روز)`
          : `Direct Renewal for sub ${subName} (${gb}GB - ${days}days)`
      );
      setShowInvoiceUpload(true);
      return;
    }

    if (action.startsWith("confirm_renew_cust_val:")) {
      const parts = action.split(":");
      const subId = parts[1];
      const gb = parseInt(parts[2]);
      const days = parseInt(parts[3]);
      const price = parseInt(parts[4]);

      setRenewStep("idle");
      setRenewingSubId(null);
      addBotReply(lang === "fa" ? "⏳ در حال اعمال تمدید و به‌روزرسانی سرویس شما..." : "⏳ Applying renewal and updating your service...", 500);

      setTimeout(() => {
        const isUserAdminOrOwner = currentUser.userId === 6536288293 || currentUser.username === "daltoon_owner";
        const finalPrice = isUserAdminOrOwner ? 0 : price;
        const newBal = currentUser.walletBalance - finalPrice;

        if (newBal < 0) {
          addBotReply(
            lang === "fa"
              ? "❌ موجودی کیف پول شما برای تمدید کافی نیست."
              : "❌ Insufficient funds in your simulated wallet.",
            500,
            getKeyboard()
          );
          return;
        }

        setSimulatedUsers(prev => {
          const next = prev.map(u => u.userId === currentUser.userId ? { ...u, walletBalance: newBal } : u);
          if (setUsers) setUsers(next);
          return next;
        });

        setSimulatedKeys(prev => {
          const next = prev.map(k => {
            if (k.id === subId) {
              let currentExp = new Date(k.expireDate);
              if (isNaN(currentExp.getTime()) || currentExp < new Date()) {
                currentExp = new Date();
              }
              currentExp.setDate(currentExp.getDate() + days);
              const nextExpireDate = currentExp.toISOString().split("T")[0];
              const nextTrafficLimitGb = (k.trafficLimitGb || 0) + gb;
              return {
                ...k,
                expireDate: nextExpireDate,
                trafficLimitGb: nextTrafficLimitGb,
                status: "active" as const
              };
            }
            return k;
          });
          if (setKeys) setKeys(next);
          return next;
        });

        if (updateUserBalance && finalPrice > 0) {
          updateUserBalance(currentUser.userId, -finalPrice);
        }

        // Hit actual persistent API endpoint to renew X-UI connection in real-time
        fetch("/api/subscription-keys/renew", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: subId, addGb: gb, addDays: days })
        }).then(res => res.json())
          .then(data => {
            if (data.success && data.key) {
              if (setKeys) {
                setKeys(prev => prev.map(k => k.id === subId ? data.key : k));
              }
            }
          }).catch(err => console.warn("Failed syncing bot renewal to X-UI panel:", err));

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "bot",
              text: lang === "fa"
                ? `🎉 <b>سرویس آزمایشی شما با موفقیت تمدید شد! ✨</b>\n\n💬 ترافیک اضافه شده: <b>${gb} گیگابایت</b>\n⏳ روز اضافه شده: <b>${days} روز</b>\n💳 هزینه کسر شده: ${isUserAdminOrOwner ? "۰ تومان (ویژه ادمین 👑)" : price.toLocaleString() + " تومان"}\n💰 موجودی کیف پول: ${newBal.toLocaleString()} تومان\n\nسرویس شما با موفقیت ارتقا و در سرور تمدید شد. کانکشن‌های قبلی همچنان فعال هستند.`
                : `🎉 <b>Service successfully renewed! ✨</b>\n\n💬 Added Traffic: <b>${gb} GB</b>\n⏳ Added Duration: <b>${days} Days</b>\n💰 Price: ${price.toLocaleString()} Toman\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              keyboard: getKeyboard(),
              inlineButtons: [
                [
                  { text: lang === "fa" ? "🔙 بازگشت به مدیریت" : "🔙 Back to Manage", action: `manage_sub_${subId}` }
                ]
              ]
            }
          ]);
        }, 1000);
      }, 1000);
      return;
    }

    if (action.startsWith("warn_regen_")) {
      const subId = action.substring(11);
      addBotReply(
        lang === "fa"
          ? "⚠️ <b>هشدار تعویض شناسه اتصال (Reset UUID)</b>\n\nبا تغییر شناسه، اتصال روی تمام برنامه‌های کلاینت قبلی شما باطل شده و فوراً قطع می‌گردد.\nآیا مایل به تولید لینک اتصال جدید هستید؟"
          : "⚠️ <b>Change UUID Warning</b>\n\nDoing this invalidates the old config URL globally. Are you sure you wish to rotate?",
        500,
        undefined,
        [
          [
            { text: lang === "fa" ? "✅ بله، کلید جدید صادر شود" : "✅ Yes, issue new UUID", action: `confirm_regen_${subId}` },
            { text: lang === "fa" ? "❌ انصراف" : "❌ Cancel", action: `manage_sub_${subId}` }
          ]
        ]
      );
      return;
    }

    if (action.startsWith("confirm_regen_")) {
      const subId = action.substring(14);
      addBotReply(lang === "fa" ? "⏳ در حال باطل ساختن لایسنس قبلی و تخصیص شناسه اتصال جدید..." : "⏳ Rotating encryption credentials...", 500);
      
      setTimeout(() => {
        const fakeUuid = "mock-uuid-" + Math.floor(Math.random() * 100000);
        const nextSubLink = `vless://${fakeUuid}@server.example.com:2052?security=reality&sni=google.com&fp=chrome#Mock_${subId}`;

        setSimulatedKeys(prev => prev.map(item => item.id === subId ? { ...item, subLink: nextSubLink } : item));

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(nextSubLink)}`;
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "bot",
              text: lang === "fa"
                ? `🎉 <b>کلید اتصال شما بازنشانی شد! (شبیه‌ساز آموزشی ✨)</b>\n\n🔑 آدرس سابسکریپشن نوین شما:\n\n<code>${nextSubLink}</code>\n\n⚠️ لینک قبلی دیگر متصل نخواهد شد. لطفاً پیوند بالا را کپی و در نرم‌افزار ایمپورت کنید.\n\n⚠️ <i>توجه: کلید جدید تفریحی بوده و تأثیری بر کلید اشتراک دیتابیس واقعی ندارد.</i>`
                : `🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\n\nNew URL:\n\n<code>${nextSubLink}</code>\n\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              keyboard: getKeyboard(),
              imageUrl: qrUrl
            }
          ]);
        }, 1000);
      }, 700);
      return;
    }

    if (action.startsWith("warn_transfer_")) {
      const subId = action.substring(14);
      setTransferringKeyId(subId);
      addBotReply(
        lang === "fa"
          ? "🎁 <b>مراحل هدیه دادن و انتقال مالکیت لایسنس سرویس</b>\n\nلطفاً <b>آیدی عددی تلگرام</b> یا <b>آیدی تلگرامی</b> کاربر مقصد را (به انگلیسی، بدون علامت @) در همین چت ارسال کنید:\n\nمثال: <code>6536288293</code> یا <code>reza_vpn</code>\n\n⚠️ توجه: پس از انتقال مالکیت، این کانفیگ و حجم و روزهایش متعلق به آیدی مقصد شده و از دسترسی شما خارج می‌شود."
          : "🎁 <b>Gift Subscription Transfer</b>\n\nPlease enter the destination <b>Telegram User ID</b> or <b>Username</b> (no @) into this chat:",
        500,
        [
          [lang === "fa" ? "🏠 بازگشت به منوی اصلی" : "🏠 Main Menu"]
        ]
      );
      return;
    }

    // --- OPTION 4: AUTOMATED VALUE-ADDED PAYMENT GATEWAYS ---
    if (action.startsWith("charge_")) {
      const amount = parseInt(action.substring(7));
      addBotReply(
        lang === "fa"
          ? `💳 <b>فاکتور شارژ کیف پول - مبلغ ${amount.toLocaleString()} تومان</b>\n\nلطفاً جهت پرداخت آنی و شارژ کاملاً خودکار، یکی از درگاه‌های الکترونیکی یا روش انتقال دستی زیر را انتخاب کنید:`
          : `💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\n\nPlease choose an instant payment gateway below for automatic real-time account delivery:`,
        600,
        undefined,
        [
          [
            { text: "⭐️ ستاره‌های تلگرام (Telegram Stars)", action: `gateway_stars_${amount}` }
          ],
          [
            { text: "🟢 Plisio (کریپتو)", action: `gateway_plisio_${amount}` },
            { text: "🟡 NowPayments (ارزی)", action: `gateway_nowpayments_${amount}` }
          ],
          [
            { text: "🔵 Cryptomus", action: `gateway_cryptomus_${amount}` },
            { text: "🟣 Heleket", action: `gateway_heleket_${amount}` }
          ],
          [
            { text: "📸 انتقال دستی (فیش کارت‌به‌کارت)", action: `manual_slip_${amount}` }
          ],
          [
            { text: "🔙 برگشت", action: "btn_back_home" }
          ]
        ] as any
      );
      return;
    }

    if (action.startsWith("manual_slip_")) {
      const amountStr = action.substring(12);
      setInvoiceAmount(amountStr);
      setShowInvoiceUpload(true);
      return;
    }

    if (action.startsWith("gateway_stars_")) {
      const amount = action.substring(14);
      const starsCost = Math.max(1, Math.round(parseInt(amount) / 1500));
      addBotReply(
        lang === "fa"
          ? `⭐️ <b>شارژ آنلاین با ستاره‌های تلگرام (Telegram Stars)</b>\n\n💵 مبلغ شارژ: ${parseInt(amount).toLocaleString()} تومان\n💎 تعرفه: <b>${starsCost} ستاره تلگرام ⭐️</b>\n\n👇 جهت پرداخت و افزایش اعتبار آنی حساب خود روی دکمه پرداخت زیر ضربه بزنید:`
          : `⭐️ <b>Telegram Stars Payment Gateway</b>\n\n💵 Amount: ${parseInt(amount).toLocaleString()} T\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\n\n👇 Complete payment instantly via stars below:`,
        500,
        undefined,
        [
          [
            { text: `⭐️ پرداخت فوری ${starsCost} ستاره تلگرام`, action: `pay_stars_success_${amount}` }
          ],
          [
            { text: "❌ انصراف", action: "btn_back_home" }
          ]
        ]
      );
      return;
    }

    if (action.startsWith("gateway_plisio_") || action.startsWith("gateway_nowpayments_") || action.startsWith("gateway_cryptomus_") || action.startsWith("gateway_heleket_")) {
      let isPlisio = action.startsWith("gateway_plisio_");
      let isNowpay = action.startsWith("gateway_nowpayments_");
      let isCryptomus = action.startsWith("gateway_cryptomus_");
      let isHeleket = action.startsWith("gateway_heleket_");

      let amountStr = isPlisio 
        ? action.substring(15) 
        : isNowpay 
          ? action.substring(20) 
          : isCryptomus 
            ? action.substring(18) 
            : action.substring(16);

      let gatewayName = isPlisio ? "Plisio" : isNowpay ? "NowPayments" : isCryptomus ? "Cryptomus" : "Heleket";
      
      const parsedAmount = parseInt(amountStr);
      const usdtCost = (parsedAmount / 70000).toFixed(2);
      const actionName = `pay_crypto_success_${gatewayName.toLowerCase()}_${amountStr}`;

      addBotReply(
        lang === "fa"
          ? `🌐 <b>درگاه مستقیم ارزی مدرن (${gatewayName})</b>\n\n💵 مبلغ سفارش: ${parsedAmount.toLocaleString()} تومان\n💰 ارزش تتر: <b>${usdtCost} USDT</b>\n\n👇 روی دکمه زیر کلیک کرده تا وارد فاکتور سیستم ${gatewayName} شوید:`
          : `🌐 <b>${gatewayName} Instant Terminal</b>\n\n💵 Price: ${parsedAmount.toLocaleString()} T\n💰 Cost: <b>${usdtCost} USDT</b>\n\n👇 Complete the checkout below via ${gatewayName}:`,
        500,
        undefined,
        [
          [
            { text: `🔗 ورود به پرداخت ${gatewayName}`, action: actionName }
          ],
          [
            { text: "❌ انصراف", action: "btn_back_home" }
          ]
        ]
      );
      return;
    }

    // Handle gate checkout status callback replies
    if (action.startsWith("pay_stars_success_") || action.startsWith("pay_crypto_success_")) {
      let isStars = action.startsWith("pay_stars_success_");
      let amountStr = "";
      let gatewayName = "ارزی رمزارزی";

      if (isStars) {
        amountStr = action.substring(18);
        gatewayName = "ستاره‌های تلگرام (Stars)";
      } else {
        // e.g. pay_crypto_success_plisio_100000
        const segments = action.replace("pay_crypto_success_", "").split("_");
        gatewayName = segments[0].toUpperCase();
        amountStr = segments[1];
      }
      
      const amount = parseInt(amountStr);
      addBotReply(lang === "fa" ? "⏳ در حال استعلام وضعیت پرداخت از بستر بلاک‌چین..." : "⏳ Confirming receipt state...", 500);

      setTimeout(() => {
        const newBal = currentUser.walletBalance + amount;
        
        // Update simulated state
        setSimulatedUsers(prev => prev.map(u => u.userId === currentUser.userId ? { ...u, walletBalance: newBal } : u));

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "bot",
              text: lang === "fa"
                ? `🎉 <b>پرداخت آزمایشی شبیه‌ساز با موفقیت تایید شد! ✨</b>\n\n💰 اعتبار آزمایشی کیف پول شما به صورت <b>آنی و کاملاً خودکار</b> به مبلغ <b>${amount.toLocaleString()} تومان</b> از طریق <b>${gatewayName}</b> افزایش یافت.\n\n💵 موجودی فعلی (محلی): ${newBal.toLocaleString()} تومان\n\n⚠️ <i>توجه: کل فرآیند تراکنش صرفاً شبیه‌ساز آموزشی است و تغییری در حساب‌های دیتابیس واقعی ادمین یا کاربر ایجاد نکرده است.</i>`
                : `🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\n\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\n\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\n\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              keyboard: getKeyboard()
            }
          ]);
        }, 800);
      }, 700);
      return;
    }

    if (action.startsWith("buy_")) {
      const stripped = action.replace("buy_", "");
      let serverId = "";
      let planId = "";
      if (stripped.startsWith("srv_")) {
        const parts = stripped.split("_");
        serverId = parts[0] + "_" + parts[1];
        planId = parts.slice(2).join("_");
      } else {
        planId = stripped;
      }
      
      const matchedPlan = plans.find(p => p.id === planId);
      if (matchedPlan) {
        setSelectedPlanToBuy(matchedPlan);
        setPurchaseStep("confirm_plan");
        // Store the selected server id in a data attribute or global state if we needed it to construct the link.
        // For simulation, we'll append it to the plan object temporarily for reference
        (matchedPlan as any)._serverId = serverId;
        
        const isUserAdminOrOwner = currentUser.userId === 6536288293 || currentUser.username === "daltoon_owner";
        const hasEnough = isUserAdminOrOwner || (currentUser.walletBalance >= matchedPlan.price);
        
        if (hasEnough) {
          addBotReply(
            lang === "fa"
              ? isUserAdminOrOwner
                ? `🛒 تأیید نهایی سفارش (دسترسی ویژه ادمین - رایگان):\n\nکانفیگ انتخابی: ${matchedPlan.name}\nقیمت: رایگان برای مدیریت 👑\n\nشما به عنوان ادمین دسترسی نامحدود دارید و نیازی به کسر موجودی کیف پول نیست.\nآیا مایلید این بسته را فعال بسازید؟`
                : `🛒 تأیید نهایی سفارش:\n\nکانفیگ انتخابی: ${matchedPlan.name}\nقیمت: ${matchedPlan.price.toLocaleString()} تومان\n\nکیف پول شما موجودی کافی دارد (${currentUser.walletBalance.toLocaleString()} تومان).\nآیا مایلید از کیف پول پرداخت کنید؟`
              : isUserAdminOrOwner
                ? `🛒 Confirm Purchase Order (Admin Special Access - Free):\n\nSelected Config: ${matchedPlan.name}\nPrice: FREE FOR ADMIN 👑\n\nAs an administrator, your orders are processed for free without wallet deduction.\nProceed to activate this package?`
                : `🛒 Confirm Purchase Order:\n\nSelected Config: ${matchedPlan.name}\nPrice: ${matchedPlan.price.toLocaleString()} Toman\n\nYour wallet balance is sufficient (${currentUser.walletBalance.toLocaleString()} Toman).\nProceed to checkout using your balance?`,
            600,
            [
              [lang === "fa" ? "✅ بله، خرید نهایی شود" : "Yes, complete buy", lang === "fa" ? "❌ انصراف و برگشت به منو" : "Cancel and back"]
            ]
          );
        } else {
          addBotReply(
            lang === "fa"
              ? `❌ عدم موجودی کافی!\n\nکانفیگ انتخابی: ${matchedPlan.name}\nقیمت: ${matchedPlan.price.toLocaleString()} تومان\nموجودی فعلی شما: ${currentUser.walletBalance.toLocaleString()} تومان\n\nبرای تکمیل خرید، لطفا ابتدا کیف پول خود را شارژ کنید.`
              : `❌ Insufficient Funds!\n\nSelected Config: ${matchedPlan.name}\nPrice: ${matchedPlan.price.toLocaleString()} Toman\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\n\nPlease top up your wallet first to purchase this plan.`,
            600,
            [
              [t.btnTopUp, t.buyCancel]
            ]
          );
        }
      }
    }
  };

  const handleKeyboardClick = (text: string) => {
    // If we are confirming checkout
    if ((text === "✅ بله، خرید نهایی شود" || text === "Yes, complete buy") && selectedPlanToBuy && purchaseStep === "confirm_plan") {
      setPurchaseStep("ask_client_name");
      const isUserAdminOrOwner = currentUser.userId === 6536288293 || currentUser.username === "daltoon_owner";
      const paymentMsg = lang === "fa"
        ? `✍️ <b>لطفاً یک نام دلخواه (بدون فاصله، انگلیسی) برای کانفیگ خود بفرستید:</b>\n\n` +
          `• طرح انتخابی: <code>${selectedPlanToBuy.name}</code>\n` +
          `• هزینه طرح: ${isUserAdminOrOwner ? "پیش‌نمایش مدیریت (رایگان 👑)" : selectedPlanToBuy.price.toLocaleString() + " تومان"}\n\n` +
          `⚠️ قوانین نام‌گذاری:\n` +
          `۱. فقط از حروف و اعداد انگلیسی استفاده نمایید (مثال: <code>aria_vpn</code>)\n` +
          `۲. از فاصله (space)، علامت یا حروف فارسی استفاده نکنید.`
        : `✍️ <b>Please send a preferred username (no space, English only) for your configuration:</b>\n\n` +
          `• Selected Plan: <code>${selectedPlanToBuy.name}</code>\n` +
          `• Plan Cost: ${isUserAdminOrOwner ? "FREE for Admin 👑" : selectedPlanToBuy.price.toLocaleString() + " Toman"}\n\n` +
          `⚠️ Rules:\n` +
          `1. Use English letters & numbers (eg: <code>aria_vpn</code>)\n` +
          `2. Do not use space or special signs.`;

      addBotReply(paymentMsg, 500, [
        [lang === "fa" ? "🏠 بازگشت به منوی اصلی" : "🏠 Main Menu"]
      ]);
      return;
    }

    handleUserAction(text);
  };

  const handleInvoiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(invoiceAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.warn(lang === "fa" ? "لطفا مبلغ معتبری وارد کنید." : "Please enter a valid amount.");
      return;
    }

    const gradients = [
      "from-indigo-500 to-purple-700",
      "from-teal-500 to-cyan-600",
      "from-purple-500 to-pink-600",
      "from-blue-600 to-indigo-700"
    ];
    const randomGrad = `bg-gradient-to-br ${gradients[Math.floor(Math.random() * gradients.length)]}`;

    const newTx: Transaction = {
      id: "TX-" + Math.floor(Math.random() * 9000 + 1000),
      userId: currentUser.userId,
      username: currentUser.username,
      amount: amountNum,
      receiptImage: randomGrad,
      status: "pending",
      date: new Date().toISOString(),
      description: invoiceDesc
    };

    addNewTransaction(newTx);
    setShowInvoiceUpload(false);
    setInvoiceAmount("");

    // Add user message to chat saying receipt submitted
    const msg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: lang === "fa" 
        ? `💸 ارسال فیش واریز کارت به کارت\n💵 مبلغ: ${amountNum.toLocaleString()} تومان\n📝 توضیحات: ${invoiceDesc}`
        : `💸 Card-to-card slip uploaded\n💵 Price: ${amountNum.toLocaleString()} Toman\n📝 Detail: ${invoiceDesc}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, msg]);

    // Bot responds
    addBotReply(
      lang === "fa"
        ? `✅ فیش شما دریافت شد!\n\nکد رهگیری تراکنش: ${newTx.id}\nمبلغ: ${amountNum.toLocaleString()} تومان\n\nپشتیبانی دالتون فیش شما را تایید خواهد کرد. به محض تایید، کیف پول شما شارژ شده و اطلاع‌رسانی می‌شود. سپاس از شکیبایی شما 🙏`
        : `✅ Receipt uploaded successfully!\n\nReference Code: ${newTx.id}\nAmount: ${amountNum.toLocaleString()} Toman\n\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!`,
      1000,
      [
        [t.btnBuyPlan, t.btnMyAccount],
        [t.btnTopUp, t.btnSupport]
      ]
    );
  };

  return (
    <div id="bot-sim-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Selector and explanation */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl block space-y-4 h-fit">
        <div>
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            {t.botEmulatorTitle}
          </h3>
          <p className="text-xs text-gray-400">{t.botEmulatorDesc}</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{t.selectUserPersona}</label>
          <div className="grid grid-cols-1 gap-1.5">
            {users.map((u) => (
              <button
                key={u.userId}
                onClick={() => setActiveUserId(u.userId)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                  u.userId === activeUserId 
                    ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                    : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className={`w-4 h-4 ${u.userId === activeUserId ? "text-indigo-400" : "text-gray-500"}`} />
                  <div>
                    <span className="block font-semibold">@{u.username}</span>
                    <span className="text-[10px] text-gray-500 font-mono">ID: {u.userId}</span>
                  </div>
                </div>

                <div className="text-right text-[10px]">
                  <span className="block font-semibold text-emerald-400 font-display">{u.walletBalance.toLocaleString()} {lang === "fa" ? "ت" : "T"}</span>
                  <span className="text-slate-500">{u.status === "active" ? (lang === "fa" ? "فعال" : "active") : (lang === "fa" ? "مسدود" : "banned")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1f2937]/50 p-4 border border-slate-800 rounded-lg text-xs space-y-2 text-gray-400">
          <p className="font-semibold text-gray-300">{t.howToTestTitle}</p>
          <ol className="list-decimal pl-4 space-y-1.5 font-sans leading-relaxed">
            <li>{t.howToTestStep1}</li>
            <li>{t.howToTestStep2}</li>
            <li>{t.howToTestStep3}</li>
            <li>{t.howToTestStep4}</li>
            <li>{t.howToTestStep5}</li>
            <li>{t.howToTestStep6}</li>
          </ol>
        </div>
      </div>

      {/* Smartphone emulator frame */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center">
        <div className="w-full max-w-[370px] aspect-[9/18.5] bg-[#0c0d14] rounded-[38px] border-[5px] border-[#1e293b] shadow-[0_0_60px_rgba(0,0,0,0.7)] relative flex flex-col overflow-hidden">
          
          {/* Phone Top Notch Speaker */}
          <div className="absolute top-0 inset-x-0 h-5 flex items-center justify-center z-30 pointer-events-none">
            <div className="w-20 h-3 bg-[#1e293b] rounded-b-xl flex justify-center items-center">
              <div className="w-6 h-0.5 bg-black rounded-full mb-0.5"></div>
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-[#111827] border-b border-[#1f2937] pt-6 p-2 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none">
                DL
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-white leading-tight whitespace-nowrap">{lang === "fa" ? "ربات تلگرام دالتون بات 🤖" : "Daltoon Bot 🤖"}</h4>
                <p className="text-[9px] text-emerald-400 flex items-center gap-1 leading-none mt-0.5">
                  <span className="h-1 w-1 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                  {lang === "fa" ? "ربات فعال است" : "Bot active"}
                </p>
              </div>
            </div>

            <span className="text-[9px] font-mono font-medium py-0.5 px-1.5 bg-slate-800 text-slate-400 rounded">
              {lang === "fa" ? "سازنده: @mDaltoon" : "Creator: @mDaltoon"}
            </span>
          </div>

          {/* Chat Pane */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/75 select-text">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    m.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-xs" 
                      : "bg-[#111827] text-gray-200 border border-[#1f2937] rounded-tl-xs whitespace-pre-wrap font-sans"
                  }`}>
                    <div className="break-words">
                      {m.sender === "bot" ? (
                        (() => {
                          const parts = m.text.split(/(\n|<\/?b>|<\/?code>)/g);
                          let isBold = false;
                          let isCode = false;
                          return parts.map((part, i) => {
                            if (part === "<b>") { isBold = true; return null; }
                            if (part === "</b>") { isBold = false; return null; }
                            if (part === "<code>") { isCode = true; return null; }
                            if (part === "</code>") { isCode = false; return null; }
                            if (part === "\n") return <br key={i} />;
                            if (isCode) {
                              const trimmed = part.trim();
                              const isConfigOrSubLink = 
                                trimmed.startsWith("vless://") ||
                                trimmed.startsWith("vmess://") ||
                                trimmed.startsWith("trojan://") ||
                                trimmed.startsWith("ss://") ||
                                trimmed.startsWith("shadowsocks://") ||
                                trimmed.startsWith("http://") ||
                                trimmed.startsWith("https://");

                              if (isConfigOrSubLink) {
                                return (
                                  <ConfigGlassButton 
                                    key={i} 
                                    link={trimmed} 
                                    lang={lang} 
                                  />
                                );
                              }

                              return (
                                <code 
                                  key={i} 
                                  onClick={() => {
                                    copyTextToClipboard(part);
                                  }}
                                  className="bg-slate-900/95 text-pink-400 px-1.5 py-0.5 rounded font-mono text-[10px] break-all border border-slate-800 select-all hover:bg-slate-805 cursor-pointer block mt-1 mb-1 shadow-inner text-center"
                                  title="Copy code"
                                >
                                  {part}
                                </code>
                              );
                            }
                            if (isBold) return <strong key={i} className="font-extrabold text-[#f3f4f6]">{part}</strong>;
                            return part;
                          });
                        })()
                      ) : (
                        m.text
                      )}
                    </div>

                    {m.imageUrl && (
                      <div className="mt-3 flex flex-col items-center bg-white p-2 rounded-xl border border-[#374151]/40 shadow-md">
                        <img 
                          src={m.imageUrl} 
                          alt="QR Code" 
                          referrerPolicy="no-referrer"
                          className="w-40 h-40 object-contain" 
                        />
                        <span className="text-[9px] text-slate-500 font-sans mt-1">
                          {lang === "fa" ? "📷 برای اتصال اسکن نمایید" : "📷 Scan to connect"}
                        </span>
                      </div>
                    )}
                    
                    <span className={`block text-[8px] text-right mt-1.5 ${m.sender === "user" ? "text-indigo-200" : "text-gray-500"} font-mono`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>

                {/* Render inline buttons inside chat if bot posted them */}
                {m.sender === "bot" && m.inlineButtons && m.inlineButtons.length > 0 && (
                  <div className="flex flex-col gap-1 max-w-[85%] mt-1 pl-2">
                    {m.inlineButtons.map((btn, index) => {
                      if (Array.isArray(btn)) {
                        return (
                          <div key={index} className="flex gap-1 w-full">
                            {btn.map((subBtn, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => handleInlineClick(subBtn.action)}
                                className="flex-1 text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold rounded-lg text-[11px] border border-slate-800 cursor-pointer transition flex items-center justify-center gap-1.5"
                              >
                                {subBtn.text.includes("ارسال") || subBtn.text.includes("Upload") || subBtn.text.includes("upload") ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : null}
                                {subBtn.text}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={index}
                          onClick={() => handleInlineClick(btn.action)}
                          className="w-full text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold rounded-lg text-[11px] border border-slate-800 cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          {btn.text.includes("ارسال") || btn.text.includes("Upload") || btn.text.includes("upload") ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : null}
                          {btn.text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#111827] text-gray-500 rounded-2xl p-2.5 px-4 text-xs border border-[#1f2937] rounded-tl-none">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Receipt Submission Form Overlay */}
          {showInvoiceUpload && (
            <div className="absolute inset-x-0 bottom-0 top-1/4 bg-slate-900 border-t border-[#1f2937] z-20 flex flex-col p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-[#2d3748] pb-2">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  {lang === "fa" ? "اطلاعات حواله واریز کارت به کارت" : "Card-to-Card Receipt Details"}
                </span>
                <button 
                  onClick={() => setShowInvoiceUpload(false)}
                  className="text-xs text-rose-400 hover:text-white"
                >
                  {t.cancelBtn}
                </button>
              </div>

              <form onSubmit={handleInvoiceFormSubmit} className="space-y-4 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">{t.formAmountLabel}</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 135000"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-sm text-white font-display focus:ring-1 focus:ring-indigo-500"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">{t.formDescLabel}</label>
                    <input
                      type="text"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Card-to-Card to Melli bank"
                      value={invoiceDesc}
                      onChange={(e) => setInvoiceDesc(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-500 space-y-1 font-mono text-[9px] text-center">
                    <p className="text-gray-400">📎 SCREENSHOT ATTACHMENT MOCKED</p>
                    <p>{t.mockSubmitNotice}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <FileCheck className="w-4 h-4" />
                  {t.submitReceiptBtn}
                </button>
              </form>
            </div>
          )}

          {/* Interactive Bot Navigation Menu Keyboard */}
          <div className="bg-[#111827] border-t border-[#1f2937] p-3 space-y-2 shrink-0 z-10 select-none">
            {messages.length > 0 && messages[messages.length - 1].keyboard ? (
              <div className={
                settings?.keyboardLayout === "vertical"
                  ? "grid grid-cols-1 gap-1.5"
                  : "grid grid-cols-2 gap-1.5"
              }>
                {(() => {
                  const keyboardRows = messages[messages.length - 1].keyboard || [];
                  const flatButtons = keyboardRows.flatMap(row => row);
                  const isStepped = settings?.keyboardLayout === "stepped";
                  
                  return flatButtons.map((buttonText, idx) => {
                    const colSpanClass = isStepped && idx % 3 === 0 ? "col-span-2" : "";
                    return (
                      <button
                        key={buttonText}
                        onClick={() => handleKeyboardClick(buttonText)}
                        className={`py-2.5 px-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-gray-200 font-semibold hover:bg-slate-800 hover:text-white transition cursor-pointer text-center ${colSpanClass}`}
                      >
                        {buttonText}
                      </button>
                    );
                  });
                })()}
              </div>
            ) : null}

            {/* Manual user message input field */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder={t.typeMessagePlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    handleUserAction(inputText);
                    setInputText("");
                  }
                }}
              />
              <button
                disabled={!inputText.trim()}
                onClick={() => {
                  handleUserAction(inputText);
                  setInputText("");
                }}
                className={`p-1.5 rounded-full text-white cursor-pointer transition ${
                  inputText.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-800 text-slate-600"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Admin Telegram PV Ticket Notification Broadcast Toast */}
          {adminNotification && (
            <div className="absolute top-4 right-4 bg-slate-900 border-2 border-indigo-500 rounded-xl shadow-2xl p-4 max-w-sm z-30 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600/25 p-2 rounded-lg shrink-0">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 text-right" dir="rtl">
                  <span className="block text-[10px] text-indigo-400 font-bold tracking-wide uppercase">💬 پیام جدید در پی‌وی ادمین (PV Telegram)</span>
                  <p className="text-xs text-white font-semibold mt-1">کاربر <b>@{adminNotification.username}</b> تیکت جدیدی در ربات ثبت کرد!</p>
                  <p className="text-[11px] text-gray-400 mt-1"><b>موضوع تیکت:</b> "{adminNotification.subject}"</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800">
                    <span className="text-[9px] text-slate-500 font-mono">ID: {adminNotification.id}</span>
                    <button 
                      onClick={() => setAdminNotification(null)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] rounded transition cursor-pointer"
                    >
                      تایید پیام ادمین
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}



        </div>
      </div>

    </div>
  );
}
