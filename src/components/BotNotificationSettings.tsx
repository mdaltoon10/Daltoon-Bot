import React, { useState, useMemo } from "react";
import { PanelSettings } from "../types";
import { translateText, Language } from "../lang/locales";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Receipt,
  Gift,
  MessageSquare,
  Wallet,
  RefreshCw,
  Users,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  Database,
  Server,
  UserCheck,
  UserX,
  UserPlus,
  Radio,
  Share2,
  Briefcase,
  Power,
  Search,
  Filter,
  Check,
  CheckCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";

interface BotNotificationSettingsProps {
  settings: PanelSettings;
  onChange: (updatedSettings: Partial<PanelSettings>) => void;
  lang: Language;
}

export interface NotificationItemDef {
  key: keyof PanelSettings;
  target: "user" | "admin";
  category: "finance" | "support" | "system" | "marketing";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
}

export const NOTIFICATION_DEFINITIONS: NotificationItemDef[] = [
  // User Notifications
  {
    key: "notifyUserPurchase",
    target: "user",
    category: "finance",
    icon: ShoppingCart,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    titleFa: "تحویل کانفیگ و خرید موفق سرویس",
    titleEn: "Order Fulfillment & Config Delivery",
    descFa: "ارسال مشخصات اکانت، سابسکریپشن، لینک‌های اتصال و کد QR به پیوی کاربر پس از خرید موفق.",
    descEn: "Sends subscription links, credentials, direct links and QR code to user PM upon purchase."
  },
  {
    key: "notifyUserReceiptApproved",
    target: "user",
    category: "finance",
    icon: CheckCircle2,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10 border-green-500/20",
    titleFa: "تایید فیش کارت‌به‌کارت و فعال‌سازی سرویس",
    titleEn: "Receipt Approved & Service Activated",
    descFa: "ارسال پیام تایید پرداخت کارت‌به‌کارت و اطلاعات سرویس خریداری شده به پیوی کاربر.",
    descEn: "Sends approval confirmation and service links to user after admin approves the card-to-card receipt."
  },
  {
    key: "notifyUserReceiptRejected",
    target: "user",
    category: "finance",
    icon: XCircle,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    titleFa: "رد شدن فیش پرداختی کارت‌به‌کارت",
    titleEn: "Receipt Rejected Notification",
    descFa: "ارسال پیام عدم تایید و علت رد شدن فیش ارسالی به پیوی کاربر با راهنمایی پشتیبانی.",
    descEn: "Notifies the user with reasons when their receipt is rejected by admin."
  },
  {
    key: "notifyUserFreeTest",
    target: "user",
    category: "marketing",
    icon: Gift,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    titleFa: "تحویل اکانت تست رایگان",
    titleEn: "Free Test Config Delivery",
    descFa: "ارسال مشخصات، بارکد و لینک‌های اتصال اکانت تست رایگان به پیوی کاربر.",
    descEn: "Delivers free trial account details, subscription and connection links to user."
  },
  {
    key: "notifyUserTicketReply",
    target: "user",
    category: "support",
    icon: MessageSquare,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    titleFa: "پاسخ پشتیبانی به تیکت",
    titleEn: "Support Ticket Reply Alert",
    descFa: "ارسال پیام و پاسخ ارسال شده توسط ادمین در پاسخ به تیکت پشتیبانی به پیوی کاربر.",
    descEn: "Sends admin replies to user PM with ticket ID and message content."
  },
  {
    key: "notifyUserWalletCharge",
    target: "user",
    category: "finance",
    icon: Wallet,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/10 border-teal-500/20",
    titleFa: "شارژ و افزایش موجودی کیف پول",
    titleEn: "Wallet Top-up Confirmation",
    descFa: "ارسال پیام تایید افزایش موجودی (شارژ دستی توسط ادمین یا درگاه پرداخت) به پیوی کاربر.",
    descEn: "Alerts user when funds are successfully added to their wallet balance."
  },
  {
    key: "notifyUserRenewSuccess",
    target: "user",
    category: "finance",
    icon: RefreshCw,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    titleFa: "تمدید موفقیت‌آمیز سرویس",
    titleEn: "Service Renewal Confirmation",
    descFa: "ارسال پیام تایید تمدید حجم و زمان سرویس با تاریخ انقضای جدید به پیوی کاربر.",
    descEn: "Sends confirmation message when a service is renewed with new expiration date."
  },
  {
    key: "notifyUserReferralReward",
    target: "user",
    category: "marketing",
    icon: Users,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    titleFa: "پاداش زیرمجموعه‌گیری و دعوت دوستان",
    titleEn: "Referral & Commission Reward",
    descFa: "ارسال پیام پاداش ورود یا خرید اولین سرویس توسط زیرمجموعه به پیوی کاربر معرف.",
    descEn: "Notifies referrer when someone joins or makes a purchase using their invite link."
  },
  {
    key: "notifyUserUsageWarning",
    target: "user",
    category: "system",
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    titleFa: "هشدار خودکار حجم یا زمان کم (زیر ۱ گیگ یا ۱ روز)",
    titleEn: "Auto Usage & Expiration Warning",
    descFa: "هشدار خودکار به کاربر جهت تمدید در صورت باقی‌ماندن کمتر از ۱ گیگابایت یا ۱ روز از سرویس.",
    descEn: "Warns user when less than 1GB or 1 day remains on their active config."
  },
  {
    key: "notifyUserFirstConnection",
    target: "user",
    category: "system",
    icon: Zap,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    titleFa: "اعلان اولین اتصال موفق به سرور",
    titleEn: "First Connection Welcome Alert",
    descFa: "ارسال پیام خوش‌آمدگویی و تایید اتصال موفق پس از مصرف اولین کیلوبایت از سرویس.",
    descEn: "Sends welcome guidance upon the user's first successful traffic connection."
  },
  {
    key: "notifyUserNoConnection",
    target: "user",
    category: "system",
    icon: Clock,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    titleFa: "اخطار عدم اتصال پس از ۲۴ ساعت",
    titleEn: "No Connection Reminder (24h)",
    descFa: "ارسال پیام پیگیری و راهنمای اتصال در صورتی که کاربر پس از خرید هنوز متصل نشده باشد.",
    descEn: "Follows up with connection guides if zero traffic used after 24 hours of purchase."
  },
  {
    key: "notifyUserServiceToggle",
    target: "user",
    category: "system",
    icon: Power,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/10 border-pink-500/20",
    titleFa: "تغییر وضعیت سرویس (قطع / وصل / مسدودی)",
    titleEn: "Service State Change Notification",
    descFa: "اطلاع‌رسانی به پیوی کاربر هنگام قطع یا وصل دستی سرویس یا تغییر وضعیت توسط مدیریت.",
    descEn: "Alerts user when their service is enabled, disabled or revoked by admin."
  },

  // Admin Notifications
  {
    key: "notifyAdminNewReceipt",
    target: "admin",
    category: "finance",
    icon: Receipt,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    titleFa: "ثبت فیش کارت‌به‌کارت جدید",
    titleEn: "New Card-to-Card Receipt Upload",
    descFa: "ارسال تصویر فیش، مشخصات سفارش و دکمه‌های تایید/رد سریع به پیوی ادمین و ربات رسیدها.",
    descEn: "Sends uploaded payment receipt photo with instant Approve/Reject buttons to admin PM."
  },
  {
    key: "notifyAdminNewOrder",
    target: "admin",
    category: "finance",
    icon: ShoppingCart,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    titleFa: "سفارش و خرید مستقیم یا تمدید جدید",
    titleEn: "New Direct Purchase Notification",
    descFa: "ارسال گزارش خرید آنی، پرداخت کیف پول و درگاه به همراه مبلغ و نام خریدار به پیوی ادمین.",
    descEn: "Alerts admin PM whenever a client completes a direct plan purchase or gateway payment."
  },
  {
    key: "notifyAdminNewTicket",
    target: "admin",
    category: "support",
    icon: MessageSquare,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    titleFa: "ثبت یا پاسخ تیکت پشتیبانی جدید",
    titleEn: "New Support Ticket Alert",
    descFa: "ارسال پیام اطلاع‌رسانی تیکت و پاسخ‌های جدید ارسالی کاربر با خلاصه متن به پیوی ادمین.",
    descEn: "Notifies admin PM immediately when a new user support ticket or reply is submitted."
  },
  {
    key: "notifyAdminNewUser",
    target: "admin",
    category: "marketing",
    icon: UserPlus,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    titleFa: "ورود و ثبت‌نام کاربر جدید در ربات",
    titleEn: "New User Registration Alert",
    descFa: "ارسال اعلان به پیوی ادمین هنگام استارت اولیه ربات توسط کاربران جدید با آیدی عددی و یوزرنیم.",
    descEn: "Sends a notification to admin PM whenever a new Telegram user starts the bot."
  },
  {
    key: "notifyAdminUserLeave",
    target: "admin",
    category: "marketing",
    icon: UserX,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    titleFa: "خروج، توقف یا بلاک کردن ربات توسط کاربر",
    titleEn: "User Left / Blocked Bot Alert",
    descFa: "ارسال پیام به پیوی ادمین در صورت بلاک یا استاپ کردن ربات توسط کاربر.",
    descEn: "Notifies admin PM whenever a user blocks or stops the bot."
  },
  {
    key: "notifyAdminUserUnblock",
    target: "admin",
    category: "marketing",
    icon: UserCheck,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    titleFa: "آن‌بلاک و بازگشت کاربر به ربات",
    titleEn: "User Unblocked Bot Alert",
    descFa: "ارسال اعلان به پیوی ادمین هنگام آن‌بلاک کردن مجدد ربات توسط کاربران قبلی.",
    descEn: "Alerts admin PM when a previously blocked user unblocks the bot."
  },
  {
    key: "notifyAdminChannelJoin",
    target: "admin",
    category: "marketing",
    icon: Radio,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    titleFa: "عضویت کاربر در کانال اجباری / اسپانسر",
    titleEn: "Sponsor Channel Join Verified",
    descFa: "ارسال اعلان به ادمین پس از تایید عضویت موفق کاربر در کانال اجباری ربات.",
    descEn: "Alerts admin PM when user successfully joins the mandatory sponsor channel."
  },
  {
    key: "notifyAdminInvite",
    target: "admin",
    category: "marketing",
    icon: Share2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    titleFa: "دعوت کاربر جدید با لینک زیرمجموعه‌گیری",
    titleEn: "Referral Invite & Sub-user Joined",
    descFa: "ارسال اعلان به پیوی ادمین هنگام پیوستن یک کاربر از طریق لینک اختصاصی معرف.",
    descEn: "Notifies admin PM when a new user joins through a referral invitation link."
  },
  {
    key: "notifyAdminColleague",
    target: "admin",
    category: "finance",
    icon: Briefcase,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    titleFa: "عملیات پنل همکاران (خرید بسته / تمدید کانفیگ)",
    titleEn: "Colleague Panel Operations Alert",
    descFa: "ارسال گزارش خرید بسته همکاری، ساخت و تمدید کانفیگ توسط همکاران به پیوی ادمین.",
    descEn: "Alerts admin PM when colleague accounts purchase packages or renew sub configs."
  },
  {
    key: "notifyAdminFreeTest",
    target: "admin",
    category: "marketing",
    icon: Gift,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    titleFa: "دریافت اکانت تست رایگان",
    titleEn: "Free Test Account Claimed",
    descFa: "ارسال گزارش دریافت اکانت تست رایگان توسط کاربر به پیوی ادمین.",
    descEn: "Informs admin PM when a user claims their one-time free trial config."
  },
  {
    key: "notifyAdminServerAlert",
    target: "admin",
    category: "system",
    icon: Server,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    titleFa: "هشدار و گزارش سلامت سرورها",
    titleEn: "Server Health & Node Alerts",
    descFa: "ارسال هشدارهای قطعی سرور یا خطای اتصال به پنل ثنایی به پیوی ادمین.",
    descEn: "Alerts admin PM in case of panel connection issues or server node downtime."
  },
  {
    key: "notifyAdminBackup",
    target: "admin",
    category: "system",
    icon: Database,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    titleFa: "ارسال فایل بکاپ خودکار دیتابیس",
    titleEn: "Automated Database Backup Delivery",
    descFa: "ارسال زمان‌بندی شده فایل پایگاه‌داده و پشتیبان سرور به پیوی ادمین.",
    descEn: "Delivers scheduled SQLite database backup files directly to admin PM."
  }
];

export default function BotNotificationSettings({
  settings,
  onChange,
  lang,
}: BotNotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "user" | "admin">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", labelFa: "تمام دسته‌ها", labelEn: "All Categories", icon: "📑" },
    { id: "finance", labelFa: "مالی و خرید", labelEn: "Finance & Plans", icon: "💳" },
    { id: "support", labelFa: "پشتیبانی و تیکت", labelEn: "Support & Tickets", icon: "🎧" },
    { id: "system", labelFa: "سیستمی و اتصال", labelEn: "System & Connection", icon: "⚡" },
    { id: "marketing", labelFa: "باشگاه و بازاریابی", labelEn: "Marketing & Referral", icon: "🎁" },
  ];

  const currentCategory = categories.find((c) => c.id === categoryFilter) || categories[0];

  const filteredItems = useMemo(() => {
    return NOTIFICATION_DEFINITIONS.filter((item) => {
      // Filter by recipient target
      if (activeFilter !== "all" && item.target !== activeFilter) {
        return false;
      }
      // Filter by category
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitleFa = item.titleFa.toLowerCase().includes(q);
        const matchTitleEn = item.titleEn.toLowerCase().includes(q);
        const matchDescFa = item.descFa.toLowerCase().includes(q);
        const matchDescEn = item.descEn.toLowerCase().includes(q);
        return matchTitleFa || matchTitleEn || matchDescFa || matchDescEn;
      }
      return true;
    });
  }, [activeFilter, categoryFilter, searchQuery]);

  // Status counts
  const totalCount = NOTIFICATION_DEFINITIONS.length;
  const userCount = NOTIFICATION_DEFINITIONS.filter((i) => i.target === "user").length;
  const adminCount = NOTIFICATION_DEFINITIONS.filter((i) => i.target === "admin").length;

  const enabledCount = useMemo(() => {
    return NOTIFICATION_DEFINITIONS.filter((item) => {
      const val = settings[item.key];
      return val !== false; // default is true
    }).length;
  }, [settings]);

  const disabledCount = totalCount - enabledCount;

  // Toggle single item
  const handleToggle = (key: keyof PanelSettings) => {
    const currentVal = settings[key] !== false; // default true
    onChange({ [key]: !currentVal });
  };

  // Bulk actions
  const handleEnableAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const patch: Partial<PanelSettings> = {};
    NOTIFICATION_DEFINITIONS.forEach((item) => {
      (patch as any)[item.key] = true;
    });
    onChange(patch);
  };

  const handleDisableAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const patch: Partial<PanelSettings> = {};
    NOTIFICATION_DEFINITIONS.forEach((item) => {
      (patch as any)[item.key] = false;
    });
    onChange(patch);
  };

  return (
    <div
      id="bot-notifications-card"
      className="bg-[#111827] border border-indigo-500/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300"
    >
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Accordion / Tab Header (Clickable to open/close) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner shrink-0">
            <BellRing className={`w-6 h-6 ${isOpen ? "text-indigo-400 animate-pulse" : "text-indigo-400"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                {translateText("Bot Direct Message & Notifications Manager", "مدیریت اعلانات و پیام‌های پیوی ربات", lang)}
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {totalCount} {translateText("Alerts", "اعلان", lang)}
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {enabledCount} {translateText("Active", "روشن", lang)}
              </span>
              {disabledCount > 0 && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {disabledCount} {translateText("Muted", "خاموش", lang)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-1 sm:line-clamp-none">
              {translateText(
                "Click to expand/collapse notification controls for User PM and Admin PM alerts.",
                "کلیک کنید تا اعلانات پیوی کاربر و ادمین باز/بسته شود و ارسال هر پیام را مدیریت کنید.",
                lang
              )}
            </p>
          </div>
        </div>

        {/* Header Right Side (Quick actions + Chevron Toggle) */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleEnableAll}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={translateText("Enable All Notifications", "روشن کردن تمام اعلانات", lang)}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{translateText("Enable All", "فعال‌سازی همه", lang)}</span>
          </button>

          <button
            type="button"
            onClick={handleDisableAll}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title={translateText("Disable All Notifications", "خاموش کردن تمام اعلانات", lang)}
          >
            <BellOff className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{translateText("Disable All", "غیرفعال‌سازی همه", lang)}</span>
          </button>

          {/* Expand/Collapse Chevron Button */}
          <div
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              isOpen
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 rotate-180"
                : "bg-gray-800 text-gray-400 border-gray-700"
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Accordion Body (Rendered when isOpen is true) */}
      {isOpen && (
        <div className="p-5 pt-2 border-t border-gray-800/80 space-y-5">
          {/* Live Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0c101d] border border-gray-800/80 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <span className="text-xs text-gray-400">{translateText("Total Alerts", "کل اعلانات", lang)}</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">{totalCount}</span>
            </div>

            <div className="bg-[#0c101d] border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs text-emerald-400">{translateText("Active / On", "روشن و فعال", lang)}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono">{enabledCount}</span>
            </div>

            <div className="bg-[#0c101d] border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <span className="text-xs text-rose-400">{translateText("Disabled / Off", "خاموش و متوقف", lang)}</span>
              </div>
              <span className="text-sm font-bold text-rose-400 font-mono">{disabledCount}</span>
            </div>

            <div className="bg-[#0c101d] border border-purple-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-xs text-purple-300">{translateText("Recipients", "گیرندگان", lang)}</span>
              </div>
              <span className="text-xs font-semibold text-gray-300">
                {userCount} {translateText("User", "کاربر", lang)} / {adminCount} {translateText("Admin", "ادمین", lang)}
              </span>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0c101d] p-3 rounded-xl border border-gray-800/80">
            {/* Recipient Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {translateText("All Notifications", "همه اعلانات", lang)} ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("user")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeFilter === "user"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-emerald-400"
                }`}
              >
                <span>👤</span>
                <span>{translateText("User Direct Alerts", "پیوی کاربر", lang)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25">({userCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeFilter === "admin"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-purple-400"
                }`}
              >
                <span>🛡️</span>
                <span>{translateText("Admin Direct Alerts", "پیوی ادمین", lang)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25">({adminCount})</span>
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2">
              {/* Custom Themed Category Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="bg-[#161f30] hover:bg-[#1c2840] border border-gray-700/80 hover:border-indigo-500/50 text-gray-200 text-xs rounded-xl px-3 py-2 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span className="text-xs">{currentCategory.icon}</span>
                  <span className="font-medium">{translateText(currentCategory.labelEn, currentCategory.labelFa, lang)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180 text-indigo-400" : ""}`} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsCategoryOpen(false)}
                    />
                    <div className="absolute top-full mt-1.5 right-0 z-40 w-52 bg-[#0f172a] border border-gray-700/90 rounded-xl shadow-2xl shadow-black/80 py-1.5 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 border-b border-gray-800/80">
                        {translateText("Filter by Category", "دسته‌بندی اعلانات", lang)}
                      </div>
                      {categories.map((cat) => {
                        const isSelected = categoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(cat.id);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600/20 text-indigo-300 font-bold border-r-2 border-indigo-500"
                                : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{translateText(cat.labelEn, cat.labelFa, lang)}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Search Box */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder={translateText("Search notifications...", "جستجوی اعلان...", lang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161f30] border border-gray-700/80 rounded-xl pr-8 pl-2.5 py-2 text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/80 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="bg-[#0b101d] border border-gray-800 p-8 rounded-xl text-center space-y-2">
                <Info className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-400">
                  {translateText("No notification matches your search.", "هیچ اعلانی با فیلتر یا جستجوی شما یافت نشد.", lang)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setCategoryFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  {translateText("Reset filters", "بازنشانی فیلترها", lang)}
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isEnabled = settings[item.key] !== false; // default true
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isEnabled
                        ? "bg-[#0d1322] border-gray-800 hover:border-indigo-500/40"
                        : "bg-[#090d17]/80 border-gray-850 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 border ${item.iconBg} ${item.iconColor} mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs sm:text-sm font-bold ${isEnabled ? "text-white" : "text-gray-400"}`}>
                            {lang === "fa" ? item.titleFa : item.titleEn}
                          </h4>

                          {/* Recipient Badge */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              item.target === "user"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}
                          >
                            {item.target === "user" ? (
                              <>
                                <span>👤</span>
                                <span>{translateText("User PM", "پیوی کاربر", lang)}</span>
                              </>
                            ) : (
                              <>
                                <span>🛡️</span>
                                <span>{translateText("Admin PM", "پیوی ادمین", lang)}</span>
                              </>
                            )}
                          </span>

                          {/* Category Badge */}
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-gray-400 border border-slate-700">
                            {item.category === "finance"
                              ? translateText("Finance", "مالی و خرید", lang)
                              : item.category === "support"
                              ? translateText("Support", "پشتیبانی", lang)
                              : item.category === "system"
                              ? translateText("System", "سیستمی", lang)
                              : translateText("Marketing", "بازاریابی", lang)}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                          {lang === "fa" ? item.descFa : item.descEn}
                        </p>
                      </div>
                    </div>

                    {/* Right: Toggle Switch Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/60">
                      {/* Status Text Indicator */}
                      <span
                        className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                          isEnabled ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {translateText("ON / Sending", "روشن (ارسال فعال)", lang)}
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            {translateText("OFF / Muted", "خاموش (عدم ارسال)", lang)}
                          </>
                        )}
                      </span>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(item.key)}
                        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 ease-in-out focus:outline-none items-center ${
                          isEnabled
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-400"
                            : "bg-slate-800 border-slate-700"
                        }`}
                        style={{ direction: "ltr" }}
                        title={
                          isEnabled
                            ? translateText("Click to turn OFF", "کلیک جهت خاموش کردن", lang)
                            : translateText("Click to turn ON", "کلیک جهت روشن کردن", lang)
                        }
                      >
                        <div
                          className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ml-0.5 ${
                            isEnabled
                              ? "translate-x-[24px] text-emerald-600"
                              : "translate-x-0 text-slate-400"
                          }`}
                        >
                          <Power className="w-3 h-3 stroke-[3.0]" />
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info Notice */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl flex items-start gap-2 text-[11px] text-indigo-300/90 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              {translateText(
                "Note: All notification changes take effect in real time. Disabling an alert will completely silence that message in Telegram direct chat without affecting database records or web dashboard notifications.",
                "نکته: تغییر وضعیت هر اعلان بلافاصله اعمال می‌شود. با خاموش کردن یک اعلان، ارسال آن پیام در پیوی تلگرام متوقف می‌شود اما ثبت اطلاعات و تراکنش‌ها در پایگاه داده و پنل ادمین بدون اختلال انجام خواهد شد.",
                lang
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
