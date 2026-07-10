import { PanelSettings, InboundInfo, User, Transaction, VpnPlan, SubscriptionKey } from "./types";

export const initialSettings: PanelSettings = {
  botToken: "",
  currency: "تومان",
  baseUrl: "https://panel.example.com:8443",
  panelUrl: "https://panel.example.com:8443/secretPath",
  panelUsername: "admin",
  panelPassword: "Daltoon",
  activeInboundIds: [1, 12, 16, 19, 24, 26],
  ownerId: 6536288293,
  btnTextGuides: "💡 راهنمای اتصال",
  guidesText: "🌐 راهنمای فعال‌سازی و اتصال به سرویس (لینک سابسکریپشن)\n\nکاربر گرامی، ضمن تشکر از انتخاب و اعتماد شما، روش فعال‌سازی و راه‌اندازی سرویس به شرح زیر می‌باشد:\n\n۱. نرم‌افزار متناسب با سیستم‌عامل خود را دانلود و نصب کنید:\n• اندروید: v2rayNG\n• آیفون (iOS): V2box یا Streisand\n• ویندوز: Nekoray یا v2rayN\n\n۲. لینک اشتراک (سابسکریپشن) دریافتی از ربات را کپی نمایید.\n\n۳. وارد نرم‌افزار شده و پیوند کپی شده را اضافه نمایید (معمولاً دکمه + و انتخاب گزینه Import from clipboard یا Add Subscription).\n\n۴. روی گزینه Update Subscription کلیک کنید تا تمام سرورها بارگذاری شوند.\n\n۵. یکی از سرورها را انتخاب کرده و اتصال را برقرار نمایید. در صورت وجود هرگونه مشکل با دکمه پشتیبانی در تماس باشید."
};

export const initialInbounds: InboundInfo[] = [
  { id: 1, remark: "IR-MCI-Direct-VLESS 🚀", protocol: "vless", port: 2052, totalClients: 42, trafficUsed: "148.5", trafficLimit: "1000", status: "active" },
  { id: 12, remark: "IR-MTN-Tunnel-VMESS ⚡", protocol: "vmess", port: 2082, totalClients: 85, trafficUsed: "412.3", trafficLimit: "2000", status: "active" },
  { id: 16, remark: "MCI-VIP-Trojan 💎", protocol: "trojan", port: 443, totalClients: 19, trafficUsed: "88.1", trafficLimit: "500", status: "active" },
  { id: 19, remark: "Wi-Fi-Asiatech-Direct 🛜", protocol: "vless", port: 80, totalClients: 33, trafficUsed: "110.4", trafficLimit: "1000", status: "active" },
  { id: 24, remark: "IR-MCI-VoIP-Optimized 📞", protocol: "vless", port: 8080, totalClients: 11, trafficUsed: "24.9", trafficLimit: "300", status: "active" },
  { id: 26, remark: "MTN-HighSpeed-Shadowsocks 🌪️", protocol: "shadowsocks", port: 31289, totalClients: 54, trafficUsed: "289.0", trafficLimit: "1500", status: "active" }
];

export const initialUsers: User[] = [
  { userId: 6536288293, username: "daltoon_admin", walletBalance: 250000, activePlansCount: 2, joinDate: "2026-05-12", status: "active" },
  { userId: 512938474, username: "milad_kh", walletBalance: 120000, activePlansCount: 1, joinDate: "2026-05-15", status: "active" },
  { userId: 382910482, username: "maryam_rz", walletBalance: 45000, activePlansCount: 0, joinDate: "2026-05-20", status: "active" },
  { userId: 882910493, username: "reza_parsa", walletBalance: 0, activePlansCount: 1, joinDate: "2026-05-25", status: "active" },
  { userId: 104829381, username: "hassan_v2ray", walletBalance: 450000, activePlansCount: 3, joinDate: "2026-06-01", status: "active" },
  { userId: 492038104, username: "spammer_user", walletBalance: 0, activePlansCount: 0, joinDate: "2026-06-12", status: "banned" }
];

export const initialPlans: VpnPlan[] = [];

export const initialTransactions: Transaction[] = [
  {
    id: "TX-1004",
    userId: 512938474,
    username: "milad_kh",
    amount: 150000,
    receiptImage: "bg-gradient-to-br from-indigo-500 to-purple-700",
    status: "pending",
    date: "2026-06-16T15:30:00Z",
    description: "کارت به کارت به بانک صادرات"
  },
  {
    id: "TX-1003",
    userId: 382910482,
    username: "maryam_rz",
    amount: 45000,
    receiptImage: "bg-gradient-to-br from-teal-500 to-cyan-600",
    status: "approved",
    date: "2026-06-15T11:20:00Z",
    description: "کارت به کارت به بانک ملی تایید شد"
  },
  {
    id: "TX-1002",
    userId: 104829381,
    username: "hassan_v2ray",
    amount: 300000,
    receiptImage: "bg-gradient-to-br from-indigo-500 to-pink-600",
    status: "approved",
    date: "2026-06-14T19:45:00Z",
    description: "شارژ کیف پول - تایید خودکار بانک رفاه"
  },
  {
    id: "TX-1001",
    userId: 492038104,
    username: "spammer_user",
    amount: 500000,
    receiptImage: "bg-gradient-to-br from-red-500 to-orange-600",
    status: "rejected",
    date: "2026-06-13T09:10:00Z",
    description: "فیش جعلی ارسال شده است"
  }
];

export const initialSubscriptionKeys: SubscriptionKey[] = [
  {
    id: "SUB-829A",
    userId: 6536288293,
    planId: "std_1m_50g",
    planName: "Standard 1 Month - 50GB",
    subLink: "vless://93a7e4b2-e1d5-4923-9da5-db7c6bd123fc@m.daltoon-server.ir:2052?security=reality&sni=google.com&fp=chrome&pbk=Ea_V80fD78H_mG4_Qd-8&sid=1c7d2e3f&spx=%2F#IR-MCI-Direct",
    expireDate: "2026-07-12",
    trafficLimitGb: 50,
    trafficUsedGb: 12.4,
    status: "active"
  },
  {
    id: "SUB-918B",
    userId: 512938474,
    planId: "vip_1m_100g",
    planName: "VIP HyperSpeed 1 Month - 100GB",
    subLink: "vmess://eyJhZGRyIjoibS5kYWx0b29uLXNlcnZlci5pciIsInBvcnQiOjIwODIsImlkIjoiOTNhN2U0YjItZTFkNS00OTIzLTlkYTUtZGI3YzZiZDEyM2ZjIiwiYWlkIjowLCJuZXQiOiJ3cyIsInBhdGgiOiIvRGFsdG9vbiIsInR5cGUiOiJub25lIiwidGxzIjoibm9uZSJ9",
    expireDate: "2026-07-15",
    trafficLimitGb: 100,
    trafficUsedGb: 88.5,
    status: "active"
  },
  {
    id: "SUB-104C",
    userId: 104829381,
    planId: "vip_3m_200g",
    planName: "VIP Family Pack 3 Months - 200GB",
    subLink: "vless://4a27c00e-3cc4-436f-b1e7-bc1829e2f183@m.daltoon-server.ir:80?path=%2F&security=none&type=ws#Wi-Fi-Asiatech",
    expireDate: "2026-09-01",
    trafficLimitGb: 200,
    trafficUsedGb: 4.2,
    status: "active"
  }
];
