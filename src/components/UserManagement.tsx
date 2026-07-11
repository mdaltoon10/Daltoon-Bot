import { translateText, Language, translations } from "../lang/locales";
import React, { useState, useEffect } from "react";
import { User, SubscriptionKey, PanelSettings } from "../types";
import { copyTextToClipboard } from "../utils/clipboard";
import { 
  Search, 
  Wallet, 
  Ban, 
  CheckCircle, 
  UserPlus, 
  Smartphone, 
  Key, 
  Activity, 
  Plus, 
  Minus,
  MessageSquare,
  Trash2,
  Link2,
  Copy,
  Check,
  Eye,
  Settings,
  RefreshCw,
  Sparkles,
  QrCode,
  RotateCcw
} from "lucide-react";

interface UserManagementProps {
  users: User[];
  keys: SubscriptionKey[];
  adjustUserWallet: (userId: number, amount: number) => void;
  toggleUserBan: (userId: number) => void;
  addNewUser: (user: User) => void;
  deleteUser: (userId: number) => void;
  deleteSubscriptionKey: (keyId: string) => void;
  toggleSubscriptionKey: (keyId: string) => void;
  addNewSubscriptionKey: (key: SubscriptionKey) => void;
  openSimulatedChat: (userId: number) => void;
  lang: Language;
  settings?: PanelSettings;
  updateSubscriptionKey?: (keyId: string, updatedFields: Partial<SubscriptionKey>) => void;
}

export default function UserManagement({
  users,
  keys,
  adjustUserWallet,
  toggleUserBan,
  addNewUser,
  deleteUser,
  deleteSubscriptionKey,
  toggleSubscriptionKey,
  addNewSubscriptionKey,
  openSimulatedChat,
  lang,
  settings,
  updateSubscriptionKey
}: UserManagementProps) {
  const t = { ...translations.en, ...translations[lang] };
  const currency = settings?.currency || (translateText("Toman", "تومان", lang));
  const [searchTerm, setSearchTerm] = useState("");

  const getCalculatedPrice = () => {
    const gb = Number(renewGb) || 0;
    const days = Number(renewDays) || 0;
    let pricePerGb = 3000;
    let pricePerDay = 2000;
    if (settings?.customPricingBoxes && settings.customPricingBoxes.length > 0) {
      const firstBox = settings.customPricingBoxes[0];
      pricePerGb = firstBox.pricePerGb ?? 3000;
      pricePerDay = firstBox.pricePerDay ?? 2000;
    }
    return gb * pricePerGb + days * pricePerDay;
  };
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"add" | "sub">("add");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // States for direct PV message
  const [sendingMsgUser, setSendingMsgUser] = useState<User | null>(null);
  const [directMsgText, setDirectMsgText] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  
  // Custom manual config addition form states
  const [addingConfigForUser, setAddingConfigForUser] = useState<User | null>(null);
  const [manualPlanName, setManualPlanName] = useState("");
  const [manualSubLink, setManualSubLink] = useState("");
  const [manualTrafficLimit, setManualTrafficLimit] = useState("50");
  const [manualExpiryDays, setManualExpiryDays] = useState("30");

  // Multi-mode configuration creation state
  const [creationMode, setCreationMode] = useState<"panel" | "manual">("manual");
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);
  const [configErrorMessage, setConfigErrorMessage] = useState("");

  useEffect(() => {
    if (settings?.panelConnectionActive) {
      setCreationMode("panel");
    } else {
      setCreationMode("manual");
    }
  }, [settings?.panelConnectionActive, addingConfigForUser]);

  // New User Form fields
  const [newUserId, setNewUserId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newBalance, setNewBalance] = useState("");

  // Secure modal confirmation for deletes
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string | number;
    type: "user" | "key";
    title: string;
    message: string;
  } | null>(null);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [activeQrKey, setActiveQrKey] = useState<SubscriptionKey | null>(null);

  const [renewingKey, setRenewingKey] = useState<SubscriptionKey | null>(null);
  const [renewGb, setRenewGb] = useState<string>("30");
  const [renewDays, setRenewDays] = useState<string>("30");
  const [isRenewSubmitting, setIsRenewSubmitting] = useState<boolean>(false);

  const [localToast, setLocalToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 4000);
  };

  const handleRenewKeySubmit = () => {
    if (!renewingKey) return;
    setIsRenewSubmitting(true);
    showToast(translateText("Renewing subscription...", "در حال تمدید اشتراک...", lang), "success");

    fetch("/api/subscription-keys/renew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: renewingKey.id,
        addGb: Number(renewGb),
        addDays: Number(renewDays)
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsRenewSubmitting(false);
      if (data.success) {
        if (updateSubscriptionKey && data.key) {
          updateSubscriptionKey(renewingKey.id, {
            expireDate: data.key.expireDate,
            trafficLimitGb: data.key.trafficLimitGb,
            subLink: data.key.subLink,
            status: data.key.status
          });
        }
        showToast(translateText("Service renewed successfully! 🎉", "سرویس با موفقیت تمدید شد! 🎉", lang), "success");
        setRenewingKey(null);
      } else {
        showToast(data.error || (translateText("Error renewing service", "خطا در تمدید سرویس", lang)), "error");
      }
    })
    .catch(err => {
      setIsRenewSubmitting(false);
      showToast(err.message || (translateText("Connection error", "خطا در برقراری ارتباط", lang)), "error");
    });
  };

  const [regeneratingKeyId, setRegeneratingKeyId] = useState<string | null>(null);

  const handleRegenerateUuid = (keyId: string) => {
    if (regeneratingKeyId) return;
    setRegeneratingKeyId(keyId);
    
    showToast(translateText("Resetting user link...", "در حال بازنشانی لینک کاربر...", lang), "success");

    fetch("/api/subscription-keys/regenerate-uuid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: keyId })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.error || `HTTP error ${res.status}`);
        }).catch(() => {
          throw new Error(`HTTP error ${res.status}`);
        });
      }
      return res.json();
    })
    .then(data => {
      setRegeneratingKeyId(null);
      if (data.success && data.key) {
        if (updateSubscriptionKey) {
          updateSubscriptionKey(keyId, {
            clientUuid: data.key.clientUuid,
            subLink: data.key.subLink
          });
        }
        showToast(translateText("Link & UUID regenerated successfully! 🎉", "لینک و آیدی با موفقیت تغییر کرد! 🎉", lang), "success");
      } else {
        showToast(data.error || (translateText("Error resetting link", "خطا در تغییر لینک", lang)), "error");
      }
    })
    .catch(err => {
      setRegeneratingKeyId(null);
      showToast(err.message || (translateText("Failed to communicate with server", "خطا در ارتباط با سرور", lang)), "error");
    });
  };

  const handleManualConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingConfigForUser) return;
    setConfigErrorMessage("");

    const parsedExpiryDays = parseInt(manualExpiryDays) || 30;

    if (creationMode === "panel") {
      setIsSubmittingConfig(true);
      fetch("/api/subscription-keys/auto-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: addingConfigForUser.userId,
          clientName: manualPlanName.trim() || addingConfigForUser.username || "user_" + Math.random().toString(36).substring(2, 8),
          trafficLimitGb: Number(manualTrafficLimit) || 50,
          expiryDays: parsedExpiryDays,
          planName: manualPlanName.trim() || `Auto Plan (${manualTrafficLimit}GB)`
        })
      })
      .then(res => res.json())
      .then(data => {
        setIsSubmittingConfig(false);
        if (data.success) {
          addNewSubscriptionKey(data.subKey);
          setAddingConfigForUser(null);
          setManualPlanName("");
          setManualSubLink("");
          setManualTrafficLimit("50");
          setManualExpiryDays("30");
        } else {
          setConfigErrorMessage(data.error || "خطا در ساخت کانفیگ روی پنل");
        }
      })
      .catch(err => {
        setIsSubmittingConfig(false);
        setConfigErrorMessage(translateText("Server connection failure", "خطا در ارتباط با سرور", lang));
      });
      return;
    }

    // Traditional Manual Registration
    const randomId = "SUB-" + Math.floor(Math.random() * 9000 + 1000);
    const expireDate = new Date(Date.now() + parsedExpiryDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    // Auto populate a default connection string if they didn't supply one, using sub domain layout
    const generatedVless = manualSubLink.trim() || `vless://${Math.random().toString(36).substring(2)}@server.example.com:2052?security=reality&sni=google.com&fp=chrome#Secret-${manualPlanName || "Manual"}`;

    const newKey = {
      id: randomId,
      userId: addingConfigForUser.userId,
      planId: "custom",
      planName: manualPlanName.trim() || "Account Normal",
      subLink: generatedVless,
      expireDate: expireDate,
      trafficLimitGb: parseInt(manualTrafficLimit) || 50,
      trafficUsedGb: 0,
      status: "active" as const
    };

    // Call server to persist the key in database to prevent loss
    fetch("/api/subscription-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKey)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        addNewSubscriptionKey(newKey);
      }
    });

    setAddingConfigForUser(null);
    setManualPlanName("");
    setManualSubLink("");
    setManualTrafficLimit("50");
    setManualExpiryDays("30");
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendingMsgUser || !directMsgText.trim() || isSendingMsg) return;
    
    setIsSendingMsg(true);
    fetch("/api/users/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sendingMsgUser.userId,
        message: directMsgText
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsSendingMsg(false);
      if (data.success) {
        showToast(translateText("Direct message sent successfully!", "پیام خصوصی با موفقیت ارسال شد!", lang), "success");
        setDirectMsgText("");
        setSendingMsgUser(null);
      } else {
        showToast(data.error || (translateText("Error sending message", "خطا در ارسال پیام", lang)), "error");
      }
    })
    .catch(err => {
      setIsSendingMsg(false);
      showToast(err.message || (translateText("Failed to communicate with server", "خطا در ارتباط با سرور", lang)), "error");
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    const amountNum = parseInt(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.warn(translateText("Please enter a valid amount.", "لطفا مبلغ معتبری وارد کنید.", lang));
      return;
    }
    
    const signedAmount = adjustType === "add" ? amountNum : -amountNum;
    adjustUserWallet(adjustingUser.userId, signedAmount);
    setAdjustingUser(null);
    setAdjustAmount("");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedId = parseInt(newUserId);
    const parsedBalance = parseInt(newBalance) || 0;
    if (isNaN(parsedId) || parsedId <= 0) {
      console.warn(translateText("Please enter a valid Telegram User ID.", "لطفا شناسه عددی تلگرام معتبری وارد کنید.", lang));
      return;
    }
    if (!newUsername) {
      console.warn(translateText("Please enter a username.", "لطفا نام کاربری را وارد کنید.", lang));
      return;
    }

    addNewUser({
      userId: parsedId,
      username: newUsername,
      walletBalance: parsedBalance,
      activePlansCount: 0,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active"
    });

    setNewUserId("");
    setNewUsername("");
    setNewBalance("");
    setShowAddForm(false);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toString().includes(searchTerm)
  );

  return (
    <div id="users-tab" className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#1f2937] rounded-lg bg-[#111827] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t.userSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {t.btnAddUser}
        </button>
      </div>

      {/* Add User Modal-like Form (collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t.formTelegramId}</label>
            <input
              type="number"
              required
              className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="e.g. 6536288293"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t.formUsername}</label>
            <input
              type="text"
              required
              className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. m_reza_vpn"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t.formInitialBalance}</label>
            <input
              type="number"
              className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="e.g. 50000"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
            >
              {t.formBtnSubmitUser}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg text-sm hover:bg-slate-700 transition"
            >
              {t.formBtnCancel}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-slate-900 border-b border-[#1f2937] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3">{t.tableColTelegramId}</th>
                <th className="px-5 py-3">{t.tableColHandle}</th>
                <th className="px-5 py-3">{t.tableColWallet}</th>
                <th className="px-5 py-3">{t.tableColSubs}</th>
                <th className="px-5 py-3">{translateText("Referrals", "زیرمجموعه‌ها", lang)}</th>
                <th className="px-5 py-3">{t.tableColRegDate}</th>
                <th className="px-5 py-3">{t.tableColCompliance}</th>
                <th className="px-5 py-3 text-right">{t.tableColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                    {t.noUsersMatch}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userKeys = keys.filter(k => k.userId === user.userId && !k.planName.includes("تست رایگان"));
                  
                  return (
                    <tr key={user.userId} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span>{user.userId}</span>
                          <button
                            onClick={() => {
                              copyTextToClipboard(String(user.userId));
                              setCopiedKeyId("uid_" + user.userId);
                              setTimeout(() => setCopiedKeyId(null), 1500);
                            }}
                            className="text-gray-500 hover:text-indigo-400 p-0.5 rounded transition cursor-pointer"
                            title={translateText("Copy Telegram ID", "کپی شناسه تلگرام", lang)}
                          >
                            {copiedKeyId === "uid_" + user.userId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        <div className="flex items-center gap-1">
                          <span className="text-indigo-400">@</span>
                          <span>{user.username}</span>
                          <button
                            onClick={() => {
                              copyTextToClipboard(user.username);
                              setCopiedKeyId("uname_" + user.userId);
                              setTimeout(() => setCopiedKeyId(null), 1500);
                            }}
                            className="text-gray-500 hover:text-indigo-400 p-0.5 rounded transition cursor-pointer ml-1"
                            title={translateText("Copy Username", "کپی نام کاربری", lang)}
                          >
                            {copiedKeyId === "uname_" + user.userId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-display text-emerald-400 font-semibold">
                          <Wallet className="w-4 h-4" />
                          {user.walletBalance.toLocaleString()} {currency}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1.5 max-w-[190px]">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold inline-block text-center ${
                            userKeys.length > 0 ? "bg-indigo-500/10 text-indigo-300" : "bg-slate-800/60 text-gray-500"
                          }`}>
                            {userKeys.length} {translateText("configs", "کانفیگ", lang)}
                          </span>
                          {userKeys.length > 0 && (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar pt-1">
                              {userKeys.map((key) => (
                                <div key={key.id} className="flex flex-col gap-1 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 p-1.5 rounded text-[10px] transition">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate text-indigo-300 font-medium font-sans max-w-[120px]" title={`${key.planName} (${key.clientName || 'N/A'})`}>
                                      {key.planName}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => {
                                          copyTextToClipboard(key.subLink);
                                          setCopiedKeyId(key.id);
                                          setTimeout(() => setCopiedKeyId(null), 1500);
                                        }}
                                        className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-0.5 rounded transition cursor-pointer"
                                        title={translateText("Copy connection link", "کپی لینک کانکشن", lang)}
                                      >
                                        {copiedKeyId === key.id ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                      
                                      <button
                                        onClick={() => toggleSubscriptionKey(key.id)}
                                        className={`p-0.5 rounded transition cursor-pointer ${
                                          key.status === "active"
                                            ? "text-amber-500 hover:bg-amber-500/10"
                                            : "text-emerald-400 hover:bg-emerald-500/10"
                                        }`}
                                        title={key.status === "active" ? (translateText("Suspend", "تعلیق", lang)) : (translateText("Enable", "فعال کردن", lang))}
                                      >
                                        <Ban className="w-3 h-3" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRenewingKey(key);
                                          setRenewGb("30");
                                          setRenewDays("30");
                                        }}
                                        className="text-emerald-400 hover:bg-emerald-500/10 p-0.5 rounded transition cursor-pointer"
                                        title={translateText("Renew Service", "تمدید سرویس", lang)}
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleRegenerateUuid(key.id)}
                                        disabled={regeneratingKeyId === key.id}
                                        className="text-rose-400 hover:bg-rose-500/10 p-0.5 rounded transition cursor-pointer disabled:opacity-50"
                                        title={translateText("New Link", "تغییر لینک", lang)}
                                      >
                                        <RotateCcw className={`w-3 h-3 ${regeneratingKeyId === key.id ? 'animate-spin' : ''}`} />
                                      </button>

                                      <button
                                        onClick={() => setDeleteConfirm({
                                          id: key.id,
                                          type: "key",
                                          title: translateText("Confirm Delete Subscription", "تایید حذف کانفیگ", lang),
                                          message: translateText(`Are you sure you want to delete config ${key.planName} (ID: ${key.id})?`, `آیا از حذف دائم کانفیگ ${key.planName} (شناسه: ${key.id}) اطمینان دارید؟`, lang)
                                        })}
                                        className="text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 p-0.5 rounded transition shrink-0 cursor-pointer"
                                        title={translateText("Remove this key", "حذف این کانفیگ", lang)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 px-1 py-0.5 rounded-sm select-all">
                                    <span className="font-mono text-[9px] text-gray-400 truncate grow" title={key.subLink}>
                                      {key.subLink}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                                            <td className="px-5 py-3">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <span className="text-gray-500">{translateText("Invites:", "دعوت:", lang)}</span> {user.referralCount || 0}
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <span className="text-gray-500">{translateText("Earned:", "درآمد:", lang)}</span> {(user.referralRewards || 0).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">{user.joinDate}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          user.status === "active" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {user.status === "active" ? (translateText("active", "فعال", lang)) : (translateText("banned", "مسدود", lang))}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap flex items-center justify-end gap-1 font-sans">
                        <button
                          onClick={() => {
                            setAdjustingUser(user);
                            setAdjustType("add");
                          }}
                          className="p-1 px-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-gray-300 rounded text-[11px] transition inline-flex items-center gap-0.5 cursor-pointer"
                          title="Adjust Balance"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          {t.fundsAction}
                        </button>

                        <button
                          onClick={() => setAddingConfigForUser(user)}
                          className="p-1 px-2 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/10 text-emerald-300 rounded text-[11px] transition inline-flex items-center gap-0.5 cursor-pointer"
                          title={translateText("Add Manual VPN Config", "افزودن کانفیگ دستی", lang)}
                        >
                          <Key className="w-3 h-3 text-emerald-400" />
                          {translateText("+ Config", "➕ کانفیگ", lang)}
                        </button>

                        <button
                          onClick={() => openSimulatedChat(user.userId)}
                          className="p-1 px-2 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 rounded text-[11px] transition inline-flex items-center gap-0.5 cursor-pointer"
                          title="Simulate Bot Chat"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {t.chatAction}
                        </button>

                        <button
                          onClick={() => setSendingMsgUser(user)}
                          className="p-1 px-2 bg-fuchsia-950/40 hover:bg-fuchsia-900 border border-fuchsia-500/20 text-fuchsia-300 rounded text-[11px] transition inline-flex items-center gap-0.5 cursor-pointer"
                          title={translateText("Send direct Telegram message", "ارسال پیام خصوصی به تلگرام", lang)}
                        >
                          <MessageSquare className="w-3 h-3 text-fuchsia-400" />
                          {translateText("💬 Message PV", "💬 پیام به PV", lang)}
                        </button>

                        <button
                          onClick={() => toggleUserBan(user.userId)}
                          className={`p-1 px-2 rounded text-[11px] transition cursor-pointer inline-flex items-center gap-0.5 ${
                            user.status === "active"
                              ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          {user.status === "active" ? t.banAction : t.unbanAction}
                        </button>

                        <button
                          onClick={() => setDeleteConfirm({
                            id: user.userId,
                            type: "user",
                            title: translateText("Confirm Delete User", "تایید حذف کاربر", lang),
                            message: translateText(`Are you sure you want to completely delete @${user.username} and all of their active subscription keys?`, `آیا از حذف کامل کاربر @${user.username} و تمام سرویس‌ها و اکانت‌های فعال وی از دالتون بات اطمینان دارید؟`, lang)
                          })}
                          className="p-1 px-2.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 hover:text-white rounded text-[11px] transition inline-flex items-center gap-0.5 cursor-pointer"
                          title={translateText("Delete User Completely", "حذف کامل کاربر", lang)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet adjustment dialog (collapsible) */}
      {adjustingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="font-display font-semibold text-lg text-white">{t.adjustWalletTitle}</h3>
            <p className="text-xs text-gray-400">
              {t.adjustWalletDesc} <span className="text-indigo-400 font-semibold">@{adjustingUser.username}</span> (ID: {adjustingUser.userId}).
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center p-2 rounded-lg border border-gray-700 bg-slate-900 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="adjustType"
                    className="mr-2 accent-indigo-500"
                    checked={adjustType === "add"}
                    onChange={() => setAdjustType("add")}
                  />
                  <Plus className="w-4 h-4 text-emerald-400 mr-1" /> {t.adjustAdd}
                </label>
                <label className="flex-1 flex items-center justify-center p-2 rounded-lg border border-gray-700 bg-slate-900 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="adjustType"
                    className="mr-2 accent-indigo-500"
                    checked={adjustType === "sub"}
                    onChange={() => setAdjustType("sub")}
                  />
                  <Minus className="w-4 h-4 text-rose-400 mr-1" /> {t.adjustSub}
                </label>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t.adjustAmountLabel}</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-sm text-white font-display focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 50000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition cursor-pointer"
                >
                  {t.adjustBtnSave}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer"
                >
                  {t.formBtnCancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Configuration Adder Dialog Modal */}
      {addingConfigForUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              {(creationMode === "panel" ? translateText("Auto-Create Client in X-UI", "ایجاد کانفیگ خودکار روی پنل", lang) : translateText("Create Manual VPN Config", "ثبت کانفیگ دستی جدید", lang))}
            </h3>
            <p className="text-xs text-gray-400">
              {lang === "fa" 
                ? (creationMode === "panel" ? "مشخصات کلاینت را بنویسید تا سیستم به صورت خودکار کاربر را در پنل ۳x-ui بسازد." : "یک کانفیگ اختصاصی یا لینک اتصال دلخواه برای این کاربر ایجاد و ثبت کنید.")
                : (creationMode === "panel" ? "Enter client details. The system will automatically add the user directly to the X-UI panel." : "Create a custom connection link or account subscription for this client.")}
              <br />
              {translateText("Target User:", "کاربر هدف:", lang)}{" "}
              <span className="text-indigo-400 font-semibold font-mono">@{addingConfigForUser.username || "بدون آیدی"} (ID: {addingConfigForUser.userId})</span>
            </p>

            {/* Mode Toggle with Active Connection Status */}
            {settings?.panelConnectionActive && (
              <div className="flex bg-[#1a2234] p-1 rounded-lg gap-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setCreationMode("panel"); setConfigErrorMessage(""); }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                    creationMode === "panel"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {translateText("Panel Auto-Create", "ساخت خودکار روی پنل", lang)}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreationMode("manual"); setConfigErrorMessage(""); }}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                    creationMode === "manual"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  {translateText("Manual Link", "ثبت دستی لینک", lang)}
                </button>
              </div>
            )}

            {configErrorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg font-sans">
                ⚠️ {configErrorMessage}
              </div>
            )}

            <form onSubmit={handleManualConfigSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  {creationMode === "panel" 
                    ? (translateText("Client Email / Name (English, min 3 chars)", "نام کاربری کلاینت (به انگلیسی، حداقل ۳ کاراکتر)", lang))
                    : (translateText("Plan Title / Label", "نام پلن / مدت دوره", lang))}
                </label>
                <input
                  type="text"
                  required
                  placeholder={creationMode === "panel" 
                    ? (translateText("e.g. active-vless", "مثلا: active-vless", lang))
                    : (translateText("e.g. Monthly 50GB, VIP", "مثلا: ۱ ماهه ۵۰ گیگ یا VIP", lang))}
                  className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                  value={manualPlanName}
                  onChange={(e) => setManualPlanName(e.target.value)}
                />
              </div>

              {creationMode === "manual" ? (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                    {translateText("Connection Link (Vless / Trojan / SS)", "لینک کانکشن (Vless / Trojan / SS)", lang)}
                  </label>
                  <textarea
                    placeholder={translateText("Paste connection link here (if left empty, a mock link is generated)", "لینک تولید شده در x-ui را اینجا پیست کنید (در صورت خالی بودن، لینک تصادفی ساخته میشود)", lang)}
                    rows={3}
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 font-sans"
                    value={manualSubLink}
                    onChange={(e) => setManualSubLink(e.target.value)}
                  />
                </div>
              ) : (
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-indigo-300 font-sans leading-relaxed">
                  📢 {translateText("How it works: System will define client in all active 3x-ui panel inbounds & dynamically register the unified subscription link automatically.", "نحوه کارکرد پنل: سیستم به طور هوشمند کاربر تعریف‌شده را روی تمامی اینباندهای فعال چندگانه در هسته 3x-ui تعریف کرده و لینک جامع سابسکریپشن را تولید و در صفحه کاربری او فعال خواهد کرد. نیازی به ورود دستی هیچ کدی نیست!", lang)}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                    {translateText("Traffic Cap (GB)", "حجم مجاز (گیگابایت)", lang)}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-sm text-white font-sans"
                    value={manualTrafficLimit}
                    onChange={(e) => setManualTrafficLimit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                    {translateText("Validity (Days)", "مدت زمان (روز)", lang)}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-sm text-white font-sans"
                    value={manualExpiryDays}
                    onChange={(e) => setManualExpiryDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 font-sans">
                <button
                  type="submit"
                  disabled={isSubmittingConfig}
                  className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-1 cursor-pointer ${
                    isSubmittingConfig
                      ? "bg-indigo-800 cursor-not-allowed opacity-80"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSubmittingConfig ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{translateText("Generating on Panel...", "در حال ایجاد در پنل...", lang)}</span>
                    </>
                  ) : (
                    <span>{translateText("Create Subscription", "ثبت کانفیگ", lang)}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingConfigForUser(null);
                    setConfigErrorMessage("");
                  }}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer"
                >
                  {t.formBtnCancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern, state-based, non-blocking confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-semibold text-base text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400 animate-pulse" />
              {deleteConfirm.title}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {deleteConfirm.message}
            </p>
            <div className="flex gap-2 pt-2 justify-end text-xs">
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === "user") {
                    deleteUser(deleteConfirm.id as number);
                  } else {
                    deleteSubscriptionKey(deleteConfirm.id as string);
                  }
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition cursor-pointer"
              >
                {translateText("Yes, Permanently Delete", "تایید و حذف دائم", lang)}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition cursor-pointer"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Telegram Message (PV Chat) Dialog */}
      {sendingMsgUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xl max-w-md w-full space-y-4 shadow-2xl" dir={translateText("ltr", "rtl", lang)}>
            <h3 className="font-display font-semibold text-base text-fuchsia-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-fuchsia-400" />
              {translateText("Send Direct PV Message to @", "ارسال پیام خصوصی به @", lang) + (sendingMsgUser.username || sendingMsgUser.userId)}
            </h3>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              {translateText("Your message will be sent directly from the Telegram bot to the user's private chat. You can use HTML formatting tags like <b>bold</b> or <code>code</code>.", "پیام شما به صورت مستقیم و خصوصی از طرف ربات تلگرام به پی‌وی کاربر ارسال خواهد شد. می‌توانید از تگ‌های HTML نظیر <b>خط ضخیم</b> یا <code>کد کپی‌شونده</code> استفاده کنید.", lang)}
            </p>

            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  {translateText("Message Text:", "متن پیام:", lang)}
                </label>
                <textarea
                  rows={5}
                  value={directMsgText}
                  onChange={(e) => setDirectMsgText(e.target.value)}
                  placeholder={translateText("Hello! Your account has been extended...", "سلام! اکانت شما با موفقیت تمدید شد...", lang)}
                  className="w-full p-2.5 rounded-lg border border-gray-700 bg-slate-900 text-white text-xs focus:ring-1 focus:ring-fuchsia-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end text-xs">
                <button
                  type="submit"
                  disabled={isSendingMsg || !directMsgText.trim()}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  {isSendingMsg 
                    ? (translateText("Sending...", "در حال ارسال...", lang)) 
                    : (translateText("Send Message", "ارسال پیام", lang))}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSendingMsgUser(null);
                    setDirectMsgText("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition cursor-pointer"
                >
                  {translateText("Cancel", "انصراف", lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* State-based QR Code Modal Display */}
      {activeQrKey && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#0f1424] border border-violet-500/30 p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl shadow-violet-500/5 relative">
            <button
              onClick={() => setActiveQrKey(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <h3 className="font-display font-medium text-lg text-white">
                {translateText("🖼️ Client Connection QR Code", "🖼️ بارکد QR اتصال کلاینت", lang)}
              </h3>
              <p className="text-xs text-indigo-300 font-mono">
                {activeQrKey.planName}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl flex items-center justify-center border-4 border-violet-500/20 max-w-[240px] mx-auto shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrKey.subLink)}`}
                alt="VPN Connection QR Code"
                className="w-full h-auto aspect-square rounded select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-gray-500 block">
                  {translateText("Unified Client Subscription Link:", "لینک هوشمند سابسکریپشن کلاینت:", lang)}
                </span>
                <span className="text-xs font-mono text-indigo-400 break-all select-all font-semibold block">
                  {activeQrKey.subLink}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    copyTextToClipboard(activeQrKey.subLink);
                  }}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer text-center"
                >
                  {translateText("Copy Link", "کپی مجدد لینک", lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQrKey(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition cursor-pointer"
                >
                  {translateText("Close", "بستن", lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State-based Renew Subscription Modal Display */}
      {renewingKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#0f1424] border border-emerald-500/30 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRenewingKey(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-display font-medium text-lg text-white">
                {translateText("🔄 Renew User Service", "🔄 تمدید سرویس کاربر", lang)}
              </h3>
              <p className="text-xs text-emerald-400 font-mono">
                {renewingKey.planName} ({renewingKey.clientName || "N/A"})
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">
                  {translateText("Additional Traffic Limit (GB):", "حجم ترافیک اضافی (گیگابایت):", lang)}
                </label>
                <input
                  type="number"
                  value={renewGb}
                  onChange={(e) => setRenewGb(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-medium">
                  {translateText("Additional Duration (Days):", "روزهای اعتبار اضافی:", lang)}
                </label>
                <input
                  type="number"
                  value={renewDays}
                  onChange={(e) => setRenewDays(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                  {translateText("Calculated Renewal Cost", "هزینه محاسباتی تمدید", lang)}
                </span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {getCalculatedPrice().toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isRenewSubmitting}
                  onClick={handleRenewKeySubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 text-white font-semibold rounded-lg text-xs transition cursor-pointer text-center"
                >
                  {isRenewSubmitting
                    ? (translateText("Applying...", "در حال اعمال...", lang))
                    : (translateText("Confirm & Renew", "تایید و تمدید", lang))}
                </button>
                <button
                  type="button"
                  onClick={() => setRenewingKey(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs rounded-lg transition cursor-pointer"
                >
                  {translateText("Cancel", "لغو", lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {localToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-[#0f1424] border border-slate-800 text-sm shadow-2xl rounded-xl p-3 flex items-center gap-2.5 animate-slide-in font-sans animate-fade-in">
          <div className={`p-1.5 rounded-full ${localToast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {localToast.type === 'success' ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          </div>
          <p className="font-sans text-gray-200">{localToast.message}</p>
        </div>
      )}
    </div>
  );
}
