export interface ServerConfig {
  id: string;
  name: string;
  panelUrl: string;
  subUrl?: string;
  panelUsername: string;
  panelPassword: string;
  panelToken?: string;
  activeInboundIds: number[];
  status?: "active" | "inactive";
  planCategories?: string[]; // Allowed categories for this server
  panelType?: "sanaei" | "rebecca" | "pasarguard"; // Panel type (defaults to sanaei if undefined)
}

export interface PanelSettings {
  servers?: ServerConfig[];
  colleagueServers?: ServerConfig[];
  botToken: string;
  receiptBotToken?: string;
  currency?: string; // Custom currency string (e.g. "تومان", "USD", "$", etc.)
  botNickname?: string;
  usePremiumEmojis?: boolean;
  baseUrl: string; // Deprecated, kept for backward compatibility
  subUrl?: string; // Deprecated
  panelUrl: string; // Deprecated
  panelUsername: string; // Deprecated
  panelPassword: string; // Deprecated
  activeInboundIds: number[]; // Deprecated
  ownerId: number;
  geminiApiKey?: string;
  geminiBaseUrl?: string;
  customAiApiKey?: string;
  aiBaseUrl?: string;
  aiModelName?: string;
  cardNumber?: string;
  cardHolder?: string;
  bankName?: string;
  cardNumbers?: Array<{ bankName: string; number: string; holder: string }>;
  welcomeText?: string;
  guidesText?: string;
  supportText?: string;
  tgChannel?: string;
  supportHandle?: string;
  hideBtnBuyNew?: boolean;
  btnTextBuyNew?: string;
  hideBtnMySubs?: boolean;
  btnTextMySubs?: string;
  hideBtnGuides?: boolean;
  btnTextGuides?: string;
  hideBtnProfile?: boolean;
  btnTextProfile?: string;
  hideBtnSupport?: boolean;
  btnTextSupport?: string;
  hideBtnTicketSupport?: boolean;
  btnTextTicketSupport?: string;
  hideBtnFreeTest?: boolean;
  btnTextFreeTest?: string;
  isFreeTestActive?: boolean;
  freeTestDisabledMessage?: string;
  freeTestGb?: number;
  freeTestDays?: number;
  freeTestServerId?: string;
  hideBtnInstantSupport?: boolean;
  btnTextInstantSupport?: string;
  hideBtnFeedback?: boolean;
  btnTextFeedback?: string;
  btnTextWallet?: string;
  hideBtnWallet?: boolean;
  btnTextReferral?: string;
  hideBtnReferral?: boolean;
  btnTextColleagues?: string;
  hideBtnColleagues?: boolean;
  btnTextAiChat?: string;
  hideBtnAiChat?: boolean;
  btnTextAi?: string;
  hideBtnAi?: boolean;
  botTelegramHandle?: string;
  referralRewardAmount?: number;
  referralRewardPercent?: number; // Kept as invite percent
  referralPurchasePercent?: number; // New: Purchase percent
  referralL2Percent?: number;
  referralL3Percent?: number;
  referralL4Percent?: number;
  referralRewardCondition?: 'invite' | 'purchase' | 'both';
  referralBaseAmount?: number;
  referralMessage?: string;
  dashboardUsername?: string;
  dashboardPassword?: string;
  hideSupport?: boolean;
  hideBuy?: boolean;
  hideProfile?: boolean;
  hideWallet?: boolean;
  serverPort?: number;
  autoRefreshInterval?: number;
  keyboardLayout?: "horizontal" | "vertical" | "stepped";
  mainButtonsOrder?: string[];
  purchaseSuccessNote?: string;
  purchaseSuccessAttachment?: {fileData: string, fileName: string, fileType: "image"|"video"|"voice"|"file"} | null;
  panelConnectionActive?: boolean;

  // Custom QR settings
  qrTemplate?: string;
  qrColor?: string;
  qrLogo?: string;

  // New Payment Gateways
  gatewayPlisioWallet?: string;
  gatewayNowpaymentsKey?: string;
  gatewayCryptomusKey?: string;
  gatewayCryptomusMerchantId?: string;
  gatewayHeleketWallet?: string;
  gatewayStarsStatus?: boolean;

  // Auto Warning config
  autoWarningConfigBtn?: boolean;
  autoWarningNoConnectionBtn?: boolean;
  autoWarningFirstConnectionBtn?: boolean;

  // Guide Video URLs / File IDs
  guideVideoHapp?: string;
  guideVideoIos?: string;
  guideVideoAndroid?: string;
  guideVideoV2rayn?: string;
  guideVideoKaring?: string;
  guideVideoMac?: string;
  guideVideoLinux?: string;
  guideVideoUpdate?: string;
  guideVideoCrypto?: string;

  // Mandatory Join Config
  mandatoryJoinActive?: boolean;
  mandatoryJoinChannel?: string;
  mandatoryJoinChannels?: string[];
  mandatoryJoinText?: string;

  admins?: Array<{
    id: string;
    userId: number;
    username: string;
    role: "admin" | "super_admin";
    createdAt: string;
  }>;

  // Auto Backup
  autoBackupEnabled?: boolean;
  autoBackupInterval?: string;
  walletChargeAmounts?: number[];

  simulatorMode?: boolean;
  customPricingBoxes?: CustomPricingBox[];

  // Advanced AI Search
  aiSearchEnabled?: boolean;
  googleSearchApiKey?: string;
  googleSearchCx?: string;
  braveSearchApiKey?: string;

  // Pinned Message Config
  pinnedMessageActive?: boolean;
  pinnedMessageText?: string;
}

export interface CustomPricingBox {
  id: string;
  pricePerGb: number;
  pricePerDay: number;
  serverIds: string[];
  minGb?: number;
  minDays?: number;
}

export interface InboundInfo {
  id: number;
  remark: string;
  protocol: "vless" | "vmess" | "trojan" | "shadowsocks";
  port: number;
  totalClients: number;
  trafficUsed: string; // in GB
  trafficLimit: string; // in GB
  status: "active" | "inactive";
}

export interface User {
  userId: number; // Telegram User ID
  username: string;
  walletBalance: number; // in Toman
  activePlansCount: number;
  joinDate: string;
  referralCount?: number;
  referralRewardTotal?: number;
  status: "active" | "banned";
}

export interface Transaction {
  id: string;
  userId: number;
  username: string;
  amount: number; // in Toman
  receiptImage: string; // Mock SVG or placeholder image base64
  status: "pending" | "approved" | "rejected";
  date: string;
  description?: string;
  customGb?: number;
  customDays?: number;
  planId?: string;
  clientName?: string;
  serverId?: string;
}

export interface VpnPlan {
  id: string;
  name: string;
  durationDays: number;
  trafficGb: number;
  price: number; // in Toman
  category: string;
  configStock?: string[];
}

export interface PlanCategory {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
}

export interface SubscriptionKey {
  id: string;
  userId: number;
  planId: string;
  planName: string;
  clientName?: string;
  subLink: string;
  expireDate: string;
  trafficLimitGb: number;
  trafficUsedGb: number;
  clientUuid?: string;
  colleagueAccountId?: string;
  status: "active" | "expired" | "suspended";
}

export interface CustomButton {
  id: string;
  text: string;
  replyText: string;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  totalUsage: number;
  maxUsage: number;
  usedBy: number[];
  createdAt: string;
  durationDays?: number;
}

export interface TicketMessage {
  sender: "user" | "admin";
  message: string;
  date: string;
}

export interface Ticket {
  id: string; // unique tracking number
  userId: number;
  username: string;
  subject: string;
  status: "open" | "answered" | "closed";
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ColleaguePackage {
  id: string;
  title: string;
  price: number;
  trafficGb: number;
  description: string;
  category?: string;
  minCreateGb?: number;
}

export interface ColleagueAccount {
  id: string;
  userId?: number;
  username: string;
  password: string;
  packageId: string;
  packageTitle: string;
  createdAt: string;
  trafficGb: number;
  usedTrafficGb?: number;
  realUsedTrafficGb?: number;
  deletedTrafficGb?: number;
  deletedRealTrafficGb?: number;
  prefix: string;
  recoveryToken?: string;
  status: "active" | "expired" | "suspended";
}

export interface ColleagueCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface BotActionLog {
  id: string;
  date: string;
  userId?: number;
  username?: string;
  action: string;
  details: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "extend_days" | "fixed_amount";
  value: number; // discount percent, days of extension, or fixed discount amount
  maxUsage: number;
  totalUsage: number;
  usedBy: number[];
  createdAt: string;
  durationDays?: number;
}



