import { translateText, Language, translations } from "../lang/locales";
import React, { useState } from "react";
import { ServerConfig, PanelSettings, InboundInfo, PlanCategory, ColleaguePackage, ConfigDeliveryMode } from "../types";
import ConfirmationModal from "./ConfirmationModal";

const SEPARATOR_PRESETS = [
  { label: "🔸 الماس نارنجی (استاندارد)", value: "🔸━━━━━━━━━━━━━━━━━━🔸" },
  { label: "⚡️ صاعقه نئون", value: "⚡️ ────────────── ⚡️" },
  { label: "✨ ستاره درخشان", value: "✨➖➖➖➖➖➖➖➖✨" },
  { label: "💎 الماس کریستال", value: "💎 ════════════════ 💎" },
  { label: "🌐 شبکه جهانی", value: "🌐 ••••••••••••••••• 🌐" },
  { label: "🚀 راکت پرسرعت", value: "🚀 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 🚀" },
  { label: "🔥 آتش کلاسیک", value: "🔥 ---------------- 🔥" },
  { label: "✂️ خط برش", value: "✂️ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✂️" },
];
import {
  Cpu,
  RefreshCw,
  X,
  Check,
  Activity,
  ChevronDown,
  ChevronUp,
  Save,
  Server,
  Trash2,
  Edit,
} from "lucide-react";

interface MultiServerConfigProps {
  settings: PanelSettings;
  onSaveSettings: (settings: PanelSettings) => void;
  lang: Language;
  planCategories: PlanCategory[];
  colleaguePackages?: ColleaguePackage[];
  serverType?: "standard" | "colleague";
}

export default function MultiServerConfig({
  settings,
  onSaveSettings,
  lang,
  planCategories,
  colleaguePackages = [],
  serverType = "standard",
}: MultiServerConfigProps) {
  const isColleague = serverType === "colleague";
  
  const [servers, setServers] = useState<ServerConfig[]>(() => {
    const sList = isColleague ? settings.colleagueServers : settings.servers;
    return Array.isArray(sList) ? sList : [];
  });
  
  React.useEffect(() => {
    const sList = isColleague ? settings.colleagueServers : settings.servers;
    const currentList = Array.isArray(sList) ? sList : [];
    if (JSON.stringify(servers) !== JSON.stringify(currentList)) {
      setServers(currentList);
    }
  }, [settings.servers, settings.colleagueServers, isColleague]);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletingServerIndex, setDeletingServerIndex] = useState<number | null>(null);

  const updateSettingsWithServers = (newServers: ServerConfig[]) => {
    if (isColleague) {
      onSaveSettings({ ...settings, colleagueServers: newServers });
    } else {
      onSaveSettings({ ...settings, servers: newServers });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newServers = [...servers];
    const draggedItem = newServers[draggedIndex];
    newServers.splice(draggedIndex, 1);
    newServers.splice(index, 0, draggedItem);

    setServers(newServers);
    updateSettingsWithServers(newServers);
    setDraggedIndex(null);
  };

  // Form State
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [subUrl, setSubUrl] = useState("");
  const [panelUsername, setPanelUsername] = useState("");
  const [panelPassword, setPanelPassword] = useState("");
  const [panelToken, setPanelToken] = useState("");
  const [panelType, setPanelType] = useState<"sanaei" | "rebecca" | "pasarguard" | "dui">("sanaei");

  const [testStatus, setTestStatus] = useState<{
    type: "success" | "error" | "loading" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [inbounds, setInbounds] = useState<InboundInfo[]>([]);
  const [checkedInboundIds, setCheckedInboundIds] = useState<number[]>([]);
  const [manualInboundInput, setManualInboundInput] = useState("");
  const [checkedPlanCategories, setCheckedPlanCategories] = useState<string[]>([]);
  const [allowedPaymentMethods, setAllowedPaymentMethods] = useState<string[]>([
    "wallet",
    "card_to_card",
    "plisio",
    "nowpayments",
    "cryptomus",
    "heleket",
    "stars",
  ]);
  const [showInbounds, setShowInbounds] = useState(true);

  // Custom Delivery State Overrides on a Per-Server level (v4.4.7 compatibility)
  const [deliveryMode, setDeliveryMode] = useState<"use_default" | "both" | "subscription_only" | "direct_only">("use_default");
  const [deliveryHeader, setDeliveryHeader] = useState("");
  const [deliverySubText, setDeliverySubText] = useState("");
  const [deliveryDirectText, setDeliveryDirectText] = useState("");
  const [deliverySeparator, setDeliverySeparator] = useState("");
  const [deliveryFooter, setDeliveryFooter] = useState("");

  const AVAILABLE_PAYMENT_METHODS = [
    { id: "wallet", name: "کیف پول (موجودی حساب)", icon: "💳", desc: "پرداخت آنی از موجودی کیف پول کاربر" },
    { id: "card_to_card", name: "کارت به کارت", icon: "💳", desc: "ارسال تصویر رسید و تایید دستی توسط مدیریت" },
    { id: "plisio", name: "ارزی Plisio", icon: "🪙", desc: "درگاه پرداخت کریپتو و ارز دیجیتال پلیسیو" },
    { id: "nowpayments", name: "ارزی NowPayments", icon: "🪙", desc: "درگاه پرداخت ارز دیجیتال ناپیمنتس" },
    { id: "cryptomus", name: "ارزی Cryptomus", icon: "🪙", desc: "درگاه کریپتوموس" },
    { id: "heleket", name: "ارزی Heleket", icon: "🪙", desc: "درگاه هِلِکِت" },
    { id: "stars", name: "استارز تلگرام (Stars)", icon: "⭐️", desc: "پرداخت مستقیم با ستاره‌های تلگرام" },
  ];

  const startAdd = () => {
    setName("");
    setBaseUrl("");
    setSubUrl("");
    setPanelUsername("");
    setPanelPassword("");
    setPanelToken("");
    setPanelType("sanaei");
    setInbounds([]);
    setCheckedInboundIds([]);
    setManualInboundInput("");
    setCheckedPlanCategories([]);
    setAllowedPaymentMethods([
      "wallet",
      "card_to_card",
      "plisio",
      "nowpayments",
      "cryptomus",
      "heleket",
      "stars",
    ]);
    setDeliveryMode("use_default");
    setDeliveryHeader("");
    setDeliverySubText("");
    setDeliveryDirectText("");
    setDeliverySeparator("");
    setDeliveryFooter("");
    setTestStatus({ type: "idle", message: "" });
    setEditingIndex(null);
    setShowForm(true);
  };

  const startEdit = (index: number) => {
    const s = servers[index];
    setName(s.name);
    setBaseUrl(s.panelUrl);
    setSubUrl(s.subUrl || "");
    setPanelUsername(s.panelUsername || "");
    setPanelPassword(s.panelPassword || "");
    setPanelToken(s.panelToken || "");
    setPanelType(s.panelType || "sanaei");
    const initialInbounds = Array.isArray(s.activeInboundIds) ? s.activeInboundIds : [];
    setCheckedInboundIds(initialInbounds);
    setManualInboundInput(initialInbounds.join(", "));
    setCheckedPlanCategories(Array.isArray(s.planCategories) ? s.planCategories : []);
    setAllowedPaymentMethods(
      Array.isArray(s.allowedPaymentMethods) && s.allowedPaymentMethods.length > 0
        ? s.allowedPaymentMethods
        : ["wallet", "card_to_card", "plisio", "nowpayments", "cryptomus", "heleket", "stars"]
    );
    setDeliveryMode(s.deliveryMode || "use_default");
    setDeliveryHeader(s.deliveryHeader || "");
    setDeliverySubText(s.deliverySubText || "");
    setDeliveryDirectText(s.deliveryDirectText || "");
    setDeliverySeparator(s.deliverySeparator || "");
    setDeliveryFooter(s.deliveryFooter || "");
    setInbounds([]); // We don't have the old list, need to re-test to fetch them or just let them stay as ids.
    setTestStatus({ type: "idle", message: "" });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const newServers = [...servers];
    newServers.splice(index, 1);
    setServers(newServers);
    updateSettingsWithServers(newServers);
  };

  const handleTestConnection = async () => {
    if (!name.trim()) {
      setTestStatus({
        type: "error",
        message:
          translateText("Server name is required.", "نام سرور الزامی است.", lang),
      });
      return;
    }
    let pFa = "سنایی (Sanaei)";
    let pEn = "Sanaei";
    if (panelType === "dui") {
      pFa = "دالتون (D-UI)";
      pEn = "D-UI";
    } else if (panelType === "rebecca") {
      pFa = "ربکا (Reebeka)";
      pEn = "Reebeka";
    } else if (panelType === "pasarguard") {
      pFa = "پاسارگارد (Pasarguard)";
      pEn = "Pasarguard";
    } else if (panelType === "sanaei") {
      pFa = "سنایی (Sanaei)";
      pEn = "Sanaei";
    }

    setTestStatus({
      type: "loading",
      message: translateText(
        `Connecting to ${pEn} panel and fetching inbounds...`,
        `در حال اتصال به پنل ${pFa} و دریافت لیست اینباندها...`,
        lang
      ),
    });
    try {
      const response = await fetch("/api/xui/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, panelUsername, panelPassword, panelType, panelToken }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.panelToken) {
          setPanelToken(data.panelToken);
        }
        setTestStatus({ type: "success", message: data.message });
        if (Array.isArray(data.inbounds)) {
          setInbounds(data.inbounds);
          if (checkedInboundIds.length === 0) {
            const allIds = data.inbounds.map((ib: any) => ib.id);
            setCheckedInboundIds(allIds);
            setManualInboundInput(allIds.join(", "));
          } else {
            const fetchedIds = data.inbounds.map((ib: any) => String(ib.id));
            setCheckedInboundIds((prev) => {
              const res = prev.filter((id) => fetchedIds.includes(String(id)));
              setManualInboundInput(res.join(", "));
              return res;
            });
          }
        }
      } else {
        setTestStatus({ type: "error", message: data.error });
      }
    } catch (err: any) {
      setTestStatus({
        type: "error",
        message: translateText("Connection failed.", "خطا در اتصال به سرور.", lang),
      });
    }
  };

  const handleSave = () => {
    if (!name.trim() || !baseUrl.trim()) return;

    const newServer: ServerConfig = {
      id:
        editingIndex !== null
          ? servers[editingIndex].id
          : "srv_" + Math.random().toString(36).substring(2, 8),
      name,
      panelUrl: baseUrl,
      subUrl,
      panelUsername,
      panelPassword,
      panelToken,
      panelType,
      activeInboundIds: checkedInboundIds,
      planCategories: checkedPlanCategories,
      allowedPaymentMethods: allowedPaymentMethods,
      deliveryMode: deliveryMode === "use_default" ? undefined : (deliveryMode as any),
      deliveryHeader: deliveryHeader.trim() || undefined,
      deliverySubText: deliverySubText.trim() || undefined,
      deliveryDirectText: deliveryDirectText.trim() || undefined,
      deliverySeparator: deliverySeparator.trim() || undefined,
      deliveryFooter: deliveryFooter.trim() || undefined,
      status: "active",
    };

    let newServers = [...servers];
    if (editingIndex !== null) {
      newServers[editingIndex] = newServer;
    } else {
      newServers.push(newServer);
    }

    setServers(newServers);
    updateSettingsWithServers(newServers);
    setShowForm(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#0c1020] to-[#121c35] border border-indigo-500/20 p-6 rounded-2xl space-y-6 shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-850 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              {isColleague ? translateText("🔌 Colleague Servers Management", "🔌 مدیریت سرورهای همکاران", lang) : translateText("🔌 Xray Servers Management", "🔌 مدیریت سرورهای Xray", lang)}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isColleague ? translateText("Manage X-UI panels designated for colleague accounts subscription delivery.", "پنل‌های مخصوص همکاران را برای ساخت خودکار اشتراک‌های همکار اضافه کنید.", lang) : translateText("Manage your X-UI panels for automated subscription delivery.", "پنل‌های خود را برای ساخت خودکار اشتراک‌ها اضافه کنید.", lang)}
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition active:scale-95"
          >
            {translateText("Add New Server +", "افزودن سرور جدید +", lang)}
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-4 animate-fade-in bg-[#13192e]/50 p-4 rounded-xl border border-indigo-500/10">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-white">
              {editingIndex !== null
                ? translateText("Edit Server", "ویرایش سرور", lang)
                : translateText("Add New Connection", "افزودن اتصال جدید", lang)}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                {translateText("Panel Type", "نوع پنل", lang)}
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="sanaei"
                    checked={panelType === "sanaei"}
                    onChange={() => setPanelType("sanaei")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("X-UI", "سنایی (Sanaei)", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="rebecca"
                    checked={panelType === "rebecca"}
                    onChange={() => setPanelType("rebecca")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Reebeka", "ربکا (Reebeka)", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="pasarguard"
                    checked={panelType === "pasarguard"}
                    onChange={() => setPanelType("pasarguard")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Pasarguard", "پاسارگارد (Pasarguard)", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="dui"
                    checked={panelType === "dui"}
                    onChange={() => setPanelType("dui")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Daltoon (D-UI)", "دالتون (D-UI)", lang)}</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Server Name", "نام دلخواه سرور", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder={translateText("e.g. Germany 1", "مثلا: آلمان ۱", lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel URL (with port)", "آدرس پنل (با پورت)", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="http://ip:port"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Subscription URL (Optional)", "لینک سابسکریپشن (اختیاری)", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="https://sub.example.com"
                value={subUrl}
                onChange={(e) => setSubUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel Username", "نام کاربری پنل", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                value={panelUsername}
                onChange={(e) => setPanelUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel Password", "رمز عبور پنل", lang)}
              </label>
              <input
                type="password"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                value={panelPassword}
                onChange={(e) => setPanelPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestConnection}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${testStatus.type === "loading" ? "animate-spin" : ""}`}
              />
              {panelType === "rebecca" ? translateText("Test Reebeka Connection", "تست اتصال به پنل ریبکا", lang) : translateText("Test Connection & Fetch Inbounds", "تست اتصال و دریافت اینباندها", lang)}
            </button>
          </div>

          {testStatus.type !== "idle" && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                testStatus.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : testStatus.type === "loading"
                    ? "bg-indigo-500/10 text-indigo-400 animate-pulse"
                    : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {testStatus.message}
            </div>
          )}

          {/* Manual Inbound Entry */}
          <div className="border border-indigo-500/20 rounded-xl bg-slate-950/40 p-4 mt-4">
            <label className="block text-xs uppercase tracking-wider text-gray-200 mb-1 font-bold">
              {translateText("Manual Inbound IDs (Comma-separated)", "تنظیم دستی آی‌دی اینباندها (با کاما جدا کنید)", lang)}
            </label>
            <input
              type="text"
              className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder={translateText("e.g. 1, 2, 3", "مثلا: 1, 2, 3", lang)}
              value={manualInboundInput}
              onChange={(e) => {
                const val = e.target.value;
                setManualInboundInput(val);
                const parsed = val
                  .split(",")
                  .map((v) => parseInt(v.trim(), 10))
                  .filter((n) => !isNaN(n));
                setCheckedInboundIds(parsed);
              }}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              {translateText(
                "Enter inbound IDs manually (e.g. 1, 2, 3) or click test connection above to fetch list.",
                "اگر لیست اینباندها آنلاین دریافت نشد یا قصد انتخاب دستی دارید، آی‌دی‌ها را با کاما جدا کنید (مثلاً: 1, 2, 3)",
                lang
              )}
            </p>
          </div>

          {inbounds.length > 0 && (
            <div className="border border-indigo-500/20 rounded-xl bg-slate-950/40 p-4 mt-4">
              <h4 className="text-xs font-bold text-gray-200 mb-3">
                {panelType === "pasarguard" ? translateText("Allowed Groups:", "گروه‌های مجاز برای این سرور:", lang) : panelType === "rebecca" ? translateText("Allowed Services:", "سرویس‌های مجاز برای این سرور:", lang) : translateText("Allowed Inbounds:", "اینباندهای مجاز برای ساخت اکانت (از لیستی که دریافت شد):", lang)}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1">
                {inbounds.map((ib) => (
                  <label
                    key={ib.id}
                    className="flex items-start gap-2 p-2 rounded-lg border border-gray-800 hover:border-indigo-500/50 cursor-pointer bg-[#111827]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checkedInboundIds.some((id) => String(id) === String(ib.id))}
                      onChange={(e) => {
                        let newIds: number[];
                        if (e.target.checked) {
                          if (checkedInboundIds.some((id) => String(id) === String(ib.id))) return;
                          newIds = [...checkedInboundIds, ib.id];
                        } else {
                          newIds = checkedInboundIds.filter((id) => String(id) !== String(ib.id));
                        }
                        setCheckedInboundIds(newIds);
                        setManualInboundInput(newIds.join(", "));
                      }}
                    />
                    <div className="text-xs text-gray-300">
                      <div className="font-bold text-white">{ib.remark}</div>
                      <div>
                        {ib.protocol} | Port: {ib.port}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border border-purple-500/20 rounded-xl bg-slate-950/40 p-4 mt-4">
            {!isColleague ? (
              <>
                <h4 className="text-xs font-bold text-gray-200 mb-3">
                  {translateText("Allowed Plan Categories for this server:", "دسته‌بندی‌های پلن مجاز برای این سرور:", lang)}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {planCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-800 hover:border-purple-500/50 cursor-pointer bg-[#111827]"
                    >
                      <input
                        type="checkbox"
                        checked={checkedPlanCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setCheckedPlanCategories((prev) => [...prev, cat.id]);
                          else
                            setCheckedPlanCategories((prev) =>
                              prev.filter((id) => id !== cat.id),
                            );
                        }}
                      />
                      <div className="text-xs text-gray-300 flex items-center gap-1">
                        <span>{cat.emoji}</span>
                        <span className="font-bold text-white">{cat.name}</span>
                      </div>
                    </label>
                  ))}
                  {planCategories.length === 0 && (
                    <span className="text-xs text-gray-500">
                      {translateText("No categories created yet.", "هنوز هیچ دسته‌بندی ایجاد نشده است.", lang)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              colleaguePackages && colleaguePackages.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-gray-200 mb-3">
                    {translateText("Allowed Colleague Packages for this server:", "بسته‌های مجاز همکاران برای این سرور:", lang)}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {colleaguePackages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-800 hover:border-blue-500/50 cursor-pointer bg-[#111827]"
                      >
                        <input
                          type="checkbox"
                          checked={checkedPlanCategories.includes(pkg.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setCheckedPlanCategories((prev) => [...prev, pkg.id]);
                            else
                              setCheckedPlanCategories((prev) =>
                                prev.filter((id) => id !== pkg.id),
                              );
                          }}
                        />
                        <div className="text-xs text-gray-300 flex items-center gap-1">
                          <span className="font-bold text-white">{pkg.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )
            )}
          </div>

          {/* Allowed Payment Methods Section */}
          <div className="border border-emerald-500/20 rounded-xl bg-slate-950/40 p-4 mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💳</span>
                  <span>{translateText("Allowed Payment Methods for this server:", "روش‌های پرداخت مجاز برای این سرور:", lang)}</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {translateText(
                    "Only checked payment methods will be displayed in MiniApp & Telegram Bot during purchase for this server.",
                    "فقط روش‌هایی که تیک خورده باشند در مینی‌اپ و ربات تلگرام هنگام خرید از این سرور به کاربر نمایش داده می‌شوند.",
                    lang
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAllowedPaymentMethods(AVAILABLE_PAYMENT_METHODS.map((m) => m.id))
                  }
                  className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md transition"
                >
                  {translateText("Select All", "انتخاب همه", lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedPaymentMethods([])}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md transition"
                >
                  {translateText("Deselect All", "لغو همه", lang)}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {AVAILABLE_PAYMENT_METHODS.map((method) => {
                const isSelected = allowedPaymentMethods.includes(method.id);
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-emerald-950/20 border-emerald-500/50 shadow-sm shadow-emerald-950/30"
                        : "bg-[#111827]/60 border-gray-800/80 hover:border-gray-700 opacity-70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-emerald-500 rounded border-gray-700 focus:ring-emerald-500/40 bg-gray-900"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedPaymentMethods((prev) => [...prev, method.id]);
                        } else {
                          setAllowedPaymentMethods((prev) =>
                            prev.filter((m) => m !== method.id)
                          );
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span>{method.icon}</span>
                        <span>{method.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                        {method.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {allowedPaymentMethods.length === 0 && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  {translateText(
                    "Warning: No payment method selected! All payment methods will be enabled by default fallback.",
                    "هشدار: هیچ روش پرداختی انتخاب نشده است! در این حالت به عنوان پیش‌فرض تمام روش‌ها در دسترس خواهند بود.",
                    lang
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Custom Server Delivery Settings Section */}
          <div className="border border-purple-500/20 rounded-xl bg-slate-950/40 p-4 mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span>📬</span>
                  <span>{translateText("Custom Config Delivery for this server (Optional):", "تنظیمات تحویل اختصاصی این سرور (اختیاری):", lang)}</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {translateText(
                    "Override the global bot delivery settings for users purchasing from this server.",
                    "می‌توانید قالب ارسال و متون تحویل را فقط برای خریداران این سرور شخصی‌سازی کنید تا تنظیمات کل ربات را نادیده بگیرد.",
                    lang
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Delivery Mode Option */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2 font-bold">
                  {translateText("Delivery Format Override:", "نحوه تحویل برای این سرور:", lang)}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    deliveryMode === "use_default"
                      ? "bg-purple-950/20 border-purple-500/50"
                      : "bg-[#111827]/60 border-gray-800/80"
                  }`}>
                    <input
                      type="radio"
                      name="srvDeliveryMode"
                      checked={deliveryMode === "use_default"}
                      onChange={() => setDeliveryMode("use_default")}
                      className="text-purple-500 focus:ring-purple-500 bg-gray-950"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">{translateText("Use Global Default", "استفاده از تنظیمات پیش‌فرض کل ربات", lang)}</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    deliveryMode === "both"
                      ? "bg-purple-950/20 border-purple-500/50"
                      : "bg-[#111827]/60 border-gray-800/80"
                  }`}>
                    <input
                      type="radio"
                      name="srvDeliveryMode"
                      checked={deliveryMode === "both"}
                      onChange={() => setDeliveryMode("both")}
                      className="text-purple-500 focus:ring-purple-500 bg-gray-950"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">{translateText("Subscription + Direct", "سابسکریپشن + مستقیم", lang)}</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    deliveryMode === "subscription_only"
                      ? "bg-purple-950/20 border-purple-500/50"
                      : "bg-[#111827]/60 border-gray-800/80"
                  }`}>
                    <input
                      type="radio"
                      name="srvDeliveryMode"
                      checked={deliveryMode === "subscription_only"}
                      onChange={() => setDeliveryMode("subscription_only")}
                      className="text-purple-500 focus:ring-purple-500 bg-gray-950"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">{translateText("Subscription Link Only", "فقط لینک سابسکریپشن", lang)}</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    deliveryMode === "direct_only"
                      ? "bg-purple-950/20 border-purple-500/50"
                      : "bg-[#111827]/60 border-gray-800/80"
                  }`}>
                    <input
                      type="radio"
                      name="srvDeliveryMode"
                      checked={deliveryMode === "direct_only"}
                      onChange={() => setDeliveryMode("direct_only")}
                      className="text-purple-500 focus:ring-purple-500 bg-gray-950"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">{translateText("Direct Links Only", "فقط لینک‌های معمولی (اتصال مستقیم)", lang)}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Text Fields Overrides */}
              {deliveryMode !== "use_default" && (
                <div className="space-y-4 pt-2 border-t border-gray-800/60">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">
                      {translateText("Header & Greeting Text:", "متن سربرگ و تبریک خرید:", lang)}
                    </label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="🎉 <b>خرید شما با موفقیت انجام شد!</b>"
                      value={deliveryHeader}
                      onChange={(e) => setDeliveryHeader(e.target.value)}
                    />
                  </div>

                  {(deliveryMode === "both" || deliveryMode === "subscription_only") && (
                    <div>
                      <label className="block text-xs text-gray-300 mb-1 font-bold">
                        {translateText("Above Subscription Link Text:", "متن بالای لینک سابسکریپشن:", lang)}
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>"
                        value={deliverySubText}
                        onChange={(e) => setDeliverySubText(e.target.value)}
                      />
                    </div>
                  )}

                  {(deliveryMode === "both" || deliveryMode === "direct_only") && (
                    <div>
                      <label className="block text-xs text-gray-300 mb-1 font-bold">
                        {translateText("Above Direct Connections Text:", "متن بالای کانفیگ‌های مستقیم:", lang)}
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="🚀 <b>لینک‌های اتصال مستقیم:</b>"
                        value={deliveryDirectText}
                        onChange={(e) => setDeliveryDirectText(e.target.value)}
                      />
                    </div>
                  )}

                  {(deliveryMode === "both" || deliveryMode === "direct_only") && (
                    <div>
                      <label className="block text-xs text-gray-300 mb-1 font-bold">
                        {translateText("Emoji or Separator Line:", "شکلک یا خط جداکننده بین کانفیگ‌ها:", lang)}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="🔸━━━━━━━━━━━━━━━━━━🔸"
                          value={deliverySeparator}
                          onChange={(e) => setDeliverySeparator(e.target.value)}
                        />
                        <select
                          className="bg-[#13192e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                          onChange={(e) => setDeliverySeparator(e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>{translateText("Presets", "انتخاب قالب آماده", lang)}</option>
                          {SEPARATOR_PRESETS.map((preset) => (
                            <option key={preset.value} value={preset.value}>{preset.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-bold">
                      {translateText("Footer & Client Instructions Text:", "متن پاورقی و راهنمای مشتری:", lang)}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="💡 لینک سابسکریپشن را کپی کرده و در برنامه v2rayNG..."
                      value={deliveryFooter}
                      onChange={(e) => setDeliveryFooter(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {translateText("Save Server", "ذخیره سرور", lang)}
            </button>
          </div>
        </div>
      )}

      {/* List of Servers */}
      {!showForm && servers.length > 0 && (
        <div className="overflow-x-auto border border-gray-800 rounded-xl">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#13192e] text-gray-300 border-b border-gray-800">
              <tr>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Server Name", "نام سرور", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Panel URL", "آدرس پنل", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Inbounds", "اینباندها", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Delivery Format", "نحوه تحویل کانفیگ", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Payment Methods", "روش‌های پرداخت", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-center">
                  {translateText("Connection Status", "وضعیت اتصال", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-center">
                  {translateText("Actions", "عملیات", lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {servers.map((srv, index) => (
                <tr
                  key={srv.id}
                  className={`bg-[#0c1020] hover:bg-[#13192e] transition-colors ${draggedIndex === index ? "opacity-50 border-2 border-indigo-500" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 cursor-move"
                        title={
                          translateText("Drag to reorder", "برای جابجایی بکشید", lang)
                        }
                      >
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{srv.name}</span>
                        <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest">
                          {srv.panelType === "rebecca"
                            ? "Reebeka"
                            : srv.panelType === "pasarguard"
                            ? "Pasarguard"
                            : srv.panelType === "dui"
                            ? "D-UI"
                            : "X-UI"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-400">
                      {srv.panelUrl}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-300 font-bold">
                        {srv.activeInboundIds?.length || 0}{" "}
                        {translateText("Inbounds", "اینباند", lang)}
                      </span>
                      {srv.activeInboundIds && srv.activeInboundIds.length > 0 && (
                        <span className="font-mono text-[10px] text-indigo-400/80">
                          [{srv.activeInboundIds.join(", ")}]
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-purple-300">
                        {!srv.deliveryMode || srv.deliveryMode === ("use_default" as any)
                          ? translateText("Global Default", "پیش‌فرض کل ربات", lang)
                          : srv.deliveryMode === "both"
                          ? translateText("Subscription + Direct", "سابسکریپشن + مستقیم", lang)
                          : srv.deliveryMode === "subscription_only"
                          ? translateText("Subscription Only", "فقط سابسکریپشن", lang)
                          : translateText("Direct Only", "فقط مستقیم", lang)}
                      </span>
                      {srv.deliveryMode && srv.deliveryMode !== ("use_default" as any) && (
                        <span className="text-[10px] text-purple-400/80">
                          {translateText("Custom Override", "شخصی‌سازی اختصاصی", lang)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {(!srv.allowedPaymentMethods || srv.allowedPaymentMethods.length === 0) ? (
                        <span className="text-[10px] text-gray-400 bg-gray-800/60 border border-gray-700/50 px-2 py-0.5 rounded">
                          {translateText("All (Default)", "همه (پیش‌فرض)", lang)}
                        </span>
                      ) : (
                        srv.allowedPaymentMethods.map((m) => {
                          const methodInfo = AVAILABLE_PAYMENT_METHODS.find((pm) => pm.id === m);
                          return (
                            <span
                              key={m}
                              className="text-[10px] font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1"
                            >
                              <span>{methodInfo?.icon || "💳"}</span>
                              <span>{methodInfo?.name.split(" ")[0] || m}</span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {translateText("Connected", "متصل", lang)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition"
                        title={translateText("Edit", "ویرایش", lang)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingServerIndex(index)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                        title={translateText("Delete", "حذف سرور", lang)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!showForm && servers.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500 text-sm">
            {translateText("No servers added yet.", "هیچ سروری اضافه نشده است.", lang)}
          </p>
        </div>
      )}

      {/* Confirmation Modal for Server Deletion */}
      <ConfirmationModal
        isOpen={deletingServerIndex !== null}
        message={
          deletingServerIndex !== null && servers[deletingServerIndex]
            ? translateText(
                `Are you sure you want to delete server "${servers[deletingServerIndex].name}"?`,
                `آیا از حذف سرور «${servers[deletingServerIndex].name}» اطمینان کامل دارید؟`,
                lang
              )
            : ""
        }
        onConfirm={() => {
          if (deletingServerIndex !== null) {
            handleDelete(deletingServerIndex);
            setDeletingServerIndex(null);
          }
        }}
        onCancel={() => setDeletingServerIndex(null)}
        lang={lang}
        isDangerous={true}
        confirmText={translateText("Delete Server", "بله، حذف سرور", lang)}
        cancelText={translateText("Cancel", "انصراف", lang)}
      />
    </div>
  );
}
