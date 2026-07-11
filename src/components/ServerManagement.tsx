import { translateText, Language, translations } from "../lang/locales";
import React, { useState, useRef, useEffect } from "react";
import { VpnPlan, PanelSettings, InboundInfo, PlanCategory, ColleaguePackage, CustomPricingBox } from "../types";
import MultiServerConfig from "./MultiServerConfig";
import { 
  Server, 
  Layers, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  PlusCircle, 
  X, 
  Check, 
  Cpu,
  RefreshCw,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";

interface ServerManagementProps {
  vpnPlans: VpnPlan[];
  setVpnPlans: React.Dispatch<React.SetStateAction<VpnPlan[]>>;
  planCategories: PlanCategory[];
  setPlanCategories: React.Dispatch<React.SetStateAction<PlanCategory[]>>;
  colleaguePackages?: ColleaguePackage[];
  lang: Language;
  settings: PanelSettings;
  onSaveSettings: (settings: PanelSettings) => void;
  inbounds: InboundInfo[];
  setInbounds: React.Dispatch<React.SetStateAction<InboundInfo[]>>;
}

export default function ServerManagement({
  vpnPlans,
  setVpnPlans,
  planCategories,
  setPlanCategories,
  colleaguePackages = [],
  lang,
  settings,
  onSaveSettings,
  inbounds,
  setInbounds
}: ServerManagementProps) {
  const currency = settings?.currency || (translateText("Toman", "تومان", lang));
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAddForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showAddForm, editingPlanId]);

  // Form states for the VPN package
  const [planName, setPlanName] = useState("");
  const [planDays, setPlanDays] = useState("30");
  const [planTraffic, setPlanTraffic] = useState("50");
  const [planPrice, setPlanPrice] = useState("135000"); // in Toman
  const [planCategory, setPlanCategory] = useState<string>("Standard");
  
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Category management states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("⚡️");
  const [catError, setCatError] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Safe Inline Deletion confirmation
  const [confirmDeletingId, setConfirmDeletingId] = useState<string | null>(null);

  // Simplify Inbounds display option
  const [showInbounds, setShowInbounds] = useState(false);
  const [inboundsSuccess, setInboundsSuccess] = useState(false);

  // Free test local states to allow smooth typing/backspacing and saving via button
  const [localFreeTestGb, setLocalFreeTestGb] = useState<string>(
    settings.freeTestGb !== undefined ? String(settings.freeTestGb) : "0.1"
  );
  const [localFreeTestDays, setLocalFreeTestDays] = useState<string>(
    settings.freeTestDays !== undefined ? String(settings.freeTestDays) : "1"
  );
  const [localFreeTestDisabledMessage, setLocalFreeTestDisabledMessage] = useState<string>(
    settings.freeTestDisabledMessage || ""
  );
  const [localFreeTestServerId, setLocalFreeTestServerId] = useState<string>(
    settings.freeTestServerId || ""
  );
  const [localIsFreeTestActive, setLocalIsFreeTestActive] = useState<boolean>(
    settings.isFreeTestActive !== false
  );
  const [freeTestSuccess, setFreeTestSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.freeTestGb !== undefined) {
        setLocalFreeTestGb(String(settings.freeTestGb));
      }
      if (settings.freeTestDisabledMessage !== undefined) {
        setLocalFreeTestDisabledMessage(settings.freeTestDisabledMessage);
      }
      if (settings.freeTestServerId !== undefined) {
        setLocalFreeTestServerId(settings.freeTestServerId);
      } else {
        setLocalFreeTestServerId("");
      }
      setLocalIsFreeTestActive(settings.isFreeTestActive !== false);
    }
  }, [settings.freeTestGb, settings.freeTestDisabledMessage, settings.freeTestServerId, settings.isFreeTestActive]);

  // Handle durationDays specifically so that when settings.freeTestDays updates externally we can reflect it but not overwrite active typing
  useEffect(() => {
    if (settings && settings.freeTestDays !== undefined) {
      setLocalFreeTestDays(String(settings.freeTestDays));
    }
  }, [settings.freeTestDays]);

  const handleSaveFreeTestSettings = () => {
    onSaveSettings({
      ...settings,
      freeTestGb: localFreeTestGb === "" ? 0.1 : parseFloat(localFreeTestGb) || 0.1,
      freeTestDays: localFreeTestDays === "" ? 1 : parseFloat(localFreeTestDays) || 1,
      freeTestDisabledMessage: localFreeTestDisabledMessage,
      freeTestServerId: localFreeTestServerId || undefined,
      isFreeTestActive: localIsFreeTestActive
    });
    setFreeTestSuccess(true);
    setTimeout(() => {
      setFreeTestSuccess(false);
    }, 3000);
  };

  const [pricingBoxes, setPricingBoxes] = useState<CustomPricingBox[]>(() => {
    return Array.isArray(settings.customPricingBoxes) ? settings.customPricingBoxes : [];
  });

  const [editingBoxIds, setEditingBoxIds] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(settings.customPricingBoxes)) {
      setPricingBoxes(settings.customPricingBoxes);
    }
  }, [settings.customPricingBoxes]);

  const handleAddPricingBox = () => {
    const newBox: CustomPricingBox = {
      id: "price_" + Math.random().toString(36).substring(2, 8),
      pricePerGb: 3000,
      pricePerDay: 2000,
      serverIds: [],
      minGb: 1,
      minDays: 1
    };
    setPricingBoxes([...pricingBoxes, newBox]);
    setEditingBoxIds(prev => [...prev, newBox.id]);
  };

  const handleUpdateBoxField = (id: string, field: keyof CustomPricingBox, value: any) => {
    setPricingBoxes(prev => prev.map(box => {
      if (box.id === id) {
        return { ...box, [field]: value };
      }
      return box;
    }));
  };

  const handleToggleServerInBox = (boxId: string, serverId: string) => {
    setPricingBoxes(prev => prev.map(box => {
      if (box.id === boxId) {
        const isChecked = box.serverIds.includes(serverId);
        const nextServerIds = isChecked
          ? box.serverIds.filter(id => id !== serverId)
          : [...box.serverIds, serverId];
        return { ...box, serverIds: nextServerIds };
      }
      return box;
    }));
  };

  const handleDeletePricingBox = (id: string) => {
    setPricingBoxes(prev => prev.filter(box => box.id !== id));
    setEditingBoxIds(prev => prev.filter(x => x !== id));
  };

  const handleToggleEditBox = (id: string) => {
    setEditingBoxIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCloseAndSaveBox = (id: string) => {
    setEditingBoxIds(prev => prev.filter(x => x !== id));
    const sanitizedBoxes = pricingBoxes.map(b => ({
      ...b,
      minGb: b.minGb === "" || b.minGb === undefined || b.minGb === null ? 0 : Number(b.minGb),
      minDays: b.minDays === "" || b.minDays === undefined || b.minDays === null ? 0 : Number(b.minDays)
    }));
    setPricingBoxes(sanitizedBoxes);
    onSaveSettings({
      ...settings,
      customPricingBoxes: sanitizedBoxes
    });
  };

  const handleSavePricingSettings = () => {
    setEditingBoxIds([]);
    const sanitizedBoxes = pricingBoxes.map(b => ({
      ...b,
      minGb: b.minGb === "" || b.minGb === undefined || b.minGb === null ? 0 : Number(b.minGb),
      minDays: b.minDays === "" || b.minDays === undefined || b.minDays === null ? 0 : Number(b.minDays)
    }));
    setPricingBoxes(sanitizedBoxes);
    onSaveSettings({
      ...settings,
      customPricingBoxes: sanitizedBoxes
    });
  };

  const startCreateNewPlan = () => {
    setEditingPlanId(null);
    setPlanName("");
    setPlanDays("30");
    setPlanTraffic("50");
    setPlanPrice("135000");
    setPlanCategory("Standard");
    setFormError("");
    setFormSuccess(false);
    setShowAddForm(true);
  };

  const startEditPlan = (plan: VpnPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanDays(String(plan.durationDays));
    setPlanTraffic(String(plan.trafficGb));
    setPlanPrice(String(plan.price));
    setPlanCategory(plan.category);
    setFormError("");
    setFormSuccess(false);
    setShowAddForm(true);
  };

  const handleMovePlan = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= vpnPlans.length) return;

    const newPlans = [...vpnPlans];
    const temp = newPlans[index];
    newPlans[index] = newPlans[targetIndex];
    newPlans[targetIndex] = temp;

    setVpnPlans(newPlans);

    try {
      const response = await fetch("/api/vpn-plans/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newPlans.map(p => p.id) })
      });
      if (!response.ok) {
        console.error("Failed to persist new order of plans");
      }
    } catch (err) {
      console.error("Error reordering plans:", err);
    }
  };

  const handleSetPlanPosition = async (index: number, newPositionIndex: number) => {
    if (newPositionIndex < 0 || newPositionIndex >= vpnPlans.length || index === newPositionIndex) return;

    const newPlans = [...vpnPlans];
    const [movedPlan] = newPlans.splice(index, 1);
    newPlans.splice(newPositionIndex, 0, movedPlan);

    setVpnPlans(newPlans);

    try {
      const response = await fetch("/api/vpn-plans/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newPlans.map(p => p.id) })
      });
      if (!response.ok) {
        console.error("Failed to persist new order of plans");
      }
    } catch (err) {
      console.error("Error reordering plans:", err);
    }
  };

  const handleMovePlanCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= planCategories.length) return;

    const newCats = [...planCategories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    setPlanCategories(newCats);

    try {
      const response = await fetch("/api/plan-categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newCats.map(c => c.id) })
      });
      if (!response.ok) {
        console.error("Failed to persist new order of plan categories");
      }
    } catch (err) {
      console.error("Error reordering plan categories:", err);
    }
  };

  const handleSetPlanCategoryPosition = async (index: number, newPositionIndex: number) => {
    if (newPositionIndex < 0 || newPositionIndex >= planCategories.length || index === newPositionIndex) return;

    const newCats = [...planCategories];
    const [movedCat] = newCats.splice(index, 1);
    newCats.splice(newPositionIndex, 0, movedCat);

    setPlanCategories(newCats);

    try {
      const response = await fetch("/api/plan-categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newCats.map(c => c.id) })
      });
      if (!response.ok) {
        console.error("Failed to persist new order of plan categories");
      }
    } catch (err) {
      console.error("Error reordering plan categories:", err);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!planName.trim()) {
      setFormError(translateText("Plan name is required.", "نام بسته نمی‌تواند خالی باشد.", lang));
      return;
    }

    const priceNum = Number(planPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError(translateText("Invalid pricing value.", "مبلغ معتبر وارد کنید.", lang));
      return;
    }

    const idToUse = editingPlanId || "plan_" + Math.random().toString(36).substring(2, 8);

    const targetPlan: VpnPlan = {
      id: idToUse,
      name: planName.trim(),
      durationDays: Number(planDays) || 30,
      trafficGb: Number(planTraffic) || 30,
      price: priceNum,
      category: planCategory,
      configStock: [] // Dynamic generation from 3x-ui panel
    };

    try {
      const response = await fetch("/api/vpn-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetPlan)
      });
      const data = await response.json();
      if (data.success) {
        setVpnPlans(data.vpnPlans || []);
        setFormSuccess(true);
        setTimeout(() => {
          setFormSuccess(false);
          setShowAddForm(false);
        }, 1500);
      } else {
        setFormError(translateText("Error writing backend state.", "خطا در ثبت اطلاعات بسته در پایگاه داده.", lang));
      }
    } catch (err) {
      setFormError(translateText("Communication lost with backend container.", "خطا در انتقال اطلاعات با سرور.", lang));
    }
  };

  const handleDeletePlanConfirm = async (id: string) => {
    try {
      const response = await fetch("/api/vpn-plans/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setVpnPlans(data.vpnPlans || []);
        setConfirmDeletingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      setCatError(translateText("Category name is required", "نام دسته‌بندی اجباری است", lang));
      return;
    }
    setCatError("");
    const categoryData: Partial<PlanCategory> = {
      name: catName.trim(),
      emoji: catEmoji.trim()
    };
    if (editingCategoryId) categoryData.id = editingCategoryId;

    try {
      const response = await fetch("/api/plan-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData)
      });
      const data = await response.json();
      if (data.success) {
        setEditingCategoryId(null);
        setCatName("");
        setIsAddingCat(false);
        // Trigger a refresh from parent or update local state
        const refreshResponse = await fetch("/api/plan-categories");
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setPlanCategories(refreshData.categories);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch("/api/plan-categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setPlanCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sleek Header cards displaying plan statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
              {translateText("Total Active Packages", "کل بسته‌های خرید تعریف شده", lang)}
            </span>
            <h3 className="text-2xl font-bold font-mono text-white mt-1">
              {vpnPlans.length}
            </h3>
            <p className="text-[11px] text-indigo-400 font-medium font-sans">
              {translateText("Active plans for customer purchase", "بسته‌های فعال و هوشمند تلگرام", lang)}
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
              {translateText("Active Servers", "تعداد سرورهای فعال", lang)}
            </span>
            <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {(Array.isArray(settings.servers) ? settings.servers : []).filter(s => s.status !== 'inactive').length}
            </h3>
            <p className="text-[11px] text-emerald-400/80 font-sans">
              {translateText("Connected servers for subscriptions", "سرورهای متصل جهت ارائه اشتراک", lang)}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
              {translateText("Plan Categories", "تعداد دسته‌بندی‌ها", lang)}
            </span>
            <h3 className="text-2xl font-bold font-mono text-purple-400 mt-1">
              {planCategories.length}
            </h3>
            <p className="text-[11px] text-purple-400/80 font-sans">
              {translateText("Groups like VIP, Standard, etc.", "گروه‌های VIP، معمولی و ...", lang)}
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Multi-Server Config Block */}
      <MultiServerConfig settings={settings} onSaveSettings={onSaveSettings} lang={lang} planCategories={planCategories} colleaguePackages={colleaguePackages} />

      {/* Free Test Dedicated Server Config Box */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="font-semibold text-white text-sm">
            {translateText("Free Test Settings", "تنظیمات اختصاصی تست رایگان", lang)}
          </h4>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          {translateText("Define the specific server dedicated to handling free test requests. The Telegram bot will automatically create and issue free tests from this selected server.", "در این بخش می‌توانید سرور مورد نظر خود را برای ساخت و تحویل کانفیگ‌های تست رایگان کاربران انتخاب کنید. ربات تلگرام اکانت‌های تست رایگان را مستقیماً از روی این سرور ایجاد خواهد کرد.", lang)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1.5 font-bold">
              {translateText("Select Free Test Server", "انتخاب سرور تست رایگان", lang)}
            </label>
            <select
              value={localFreeTestServerId}
              onChange={(e) => {
                setLocalFreeTestServerId(e.target.value);
              }}
              className="w-full bg-[#1f2937] border border-gray-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold appearance-none cursor-pointer"
            >
              <option value="">
                {translateText("First Active Server (Default)", "نخستین سرور فعال سیستم (پیش‌فرض)", lang)}
              </option>
              {(Array.isArray(settings.servers) ? settings.servers : []).map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} ({srv.panelUrl})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1.5 font-bold">
              {translateText("Free Test Status", "وضعیت سرویس تست رایگان", lang)}
            </label>
            <div className="flex items-center gap-2 h-[38px]">
              <button
                type="button"
                onClick={() => {
                  setLocalIsFreeTestActive(!localIsFreeTestActive);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  localIsFreeTestActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {localIsFreeTestActive
                  ? (translateText("✅ Enabled", "✅ فعال", lang))
                  : (translateText("❌ Disabled", "❌ غیرفعال", lang))}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 uppercase mb-1.5 font-bold">
            {translateText("Free Test Disabled Message", "پیام خطا زمان غیرفعال بودن تست رایگان", lang)}
          </label>
          <input
            type="text"
            value={localFreeTestDisabledMessage}
            onChange={(e) => {
              setLocalFreeTestDisabledMessage(e.target.value);
            }}
            placeholder={translateText("e.g., Free test accounts are temporarily unavailable.", "مثلا: اکانت تست رایگان فعلا موجود نیست.", lang)}
            className="w-full bg-[#1f2937] border border-gray-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1.5 font-bold">
              {translateText("Free Test Volume (GB - supports decimals)", "حجم اکانت تست (گیگابایت - پشتیبانی از مگابایت با عدد اعشاری)", lang)}
            </label>
            <input
              type="text"
              value={localFreeTestGb}
              onChange={(e) => {
                setLocalFreeTestGb(e.target.value);
              }}
              placeholder="e.g. 0.1"
              className="w-full bg-[#1f2937] border border-gray-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1.5 font-bold">
              {translateText("Free Test Duration (Days)", "مدت زمان تست (روز)", lang)}
            </label>
            <input
              type="text"
              value={localFreeTestDays}
              onChange={(e) => {
                setLocalFreeTestDays(e.target.value);
              }}
              placeholder="e.g. 1"
              className="w-full bg-[#1f2937] border border-gray-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800/60 pt-4 mt-2">
          {freeTestSuccess ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              {translateText("Free test settings saved successfully!", "تنظیمات تست رایگان با موفقیت ذخیره شد!", lang)}
            </span>
          ) : (
            <div></div>
          )}
          <button
            type="button"
            onClick={handleSaveFreeTestSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{translateText("Save Free Test Settings", "ذخیره تنظیمات تست رایگان", lang)}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Volume/Days Pricing Rules Box */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">
              {translateText("Custom Volume & Days Pricing Rules", "تنظیم قیمت حجم و روز دلخواه (محاسبه هوشمند ربات)", lang)}
            </h4>
          </div>
          <button
            onClick={handleAddPricingBox}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{translateText("Add New Rule", "افزودن کادر جدید", lang)}</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          {translateText("Define price per GB and price per Day for different servers. The bot will automatically calculate final prices for custom subscriptions and renewals based on these boxes.", "در این بخش می‌توانید قیمت هر گیگابایت ترافیک و هر روز اعتبار را به تفکیک سرورها مشخص کنید. ربات تلگرام در بخش خرید با حجم دلخواه و همچنین در فرآیند تمدید، قیمت نهایی را به صورت هوشمند بر اساس قوانین این کادرها محاسبه می‌کند.", lang)}
        </p>

        {pricingBoxes.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-gray-800">
            <p className="text-xs text-gray-500">
              {translateText("No rules defined. Bot will use default prices: 3,000 per GB and 2,000 per Day.", "هیچ قانون قیمت‌گذاری تعریف نشده است. (ربات از مقادیر پیش‌فرض استفاده خواهد کرد: هر گیگ ۳,۰۰۰ و هر روز ۲,۰۰۰ تومان)", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pricingBoxes.map((box, idx) => {
              const isEditing = editingBoxIds.includes(box.id);
              // Find the names of selected servers for the summary badge
              const selectedServersNames = Array.isArray(settings.servers)
                ? settings.servers
                    .filter((srv: any) => box.serverIds?.includes(srv.id))
                    .map((srv: any) => srv.name)
                : [];

              return (
                <div key={box.id} className={`p-4 rounded-xl border transition-all duration-200 ${
                  isEditing 
                    ? "bg-slate-950/70 border-indigo-500/30 shadow-md shadow-indigo-950/10 space-y-4" 
                    : "bg-slate-950/30 border-gray-800/60 hover:border-gray-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                }`}>
                  
                  {/* Collapsed View */}
                  {!isEditing ? (
                    <>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {translateText("Rule #", "کادر شماره ", lang) + (idx + 1)}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {translateText(`GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days`, `ترافیک: ${box.pricePerGb?.toLocaleString()} تومان | زمان: ${box.pricePerDay?.toLocaleString()} تومان | حداقل: ${box.minGb || 1} گیگ و ${box.minDays || 1} روز`, lang)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-gray-500 font-medium">
                            {translateText("Applied Servers:", "سرورهای اعمال‌شده:", lang)}
                          </span>
                          {selectedServersNames.length > 0 ? (
                            selectedServersNames.map((name, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.2 rounded font-semibold truncate max-w-[120px]">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-rose-400/80 bg-rose-500/5 px-1.5 py-0.2 rounded font-semibold">
                              {translateText("No servers selected", "بدون سرور (اعمال نشده)", lang)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-end self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 border-gray-900/40">
                        <button
                          onClick={() => handleToggleEditBox(box.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{translateText("Edit Rule", "ویرایش و تنظیم", lang)}</span>
                        </button>
                        <button
                          onClick={() => handleDeletePricingBox(box.id)}
                          className="p-2 text-rose-400/80 hover:text-white hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          title={translateText("Delete box", "حذف کادر", lang)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Expanded Edit View */
                    <>
                       <div className="flex justify-between items-center pb-2 border-b border-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {translateText("✍️ Editing Rule #", "✍️ ویرایش تنظیمات کادر شماره ", lang) + (idx + 1)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePricingBox(box.id)}
                          className="p-1 text-rose-400 hover:text-white hover:bg-rose-950/40 rounded transition cursor-pointer"
                          title={translateText("Delete box", "حذف کادر", lang)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">
                            {translateText("Price per GB ", "قیمت به ازای هر گیگابایت ", lang) + `(${currency})`}
                          </label>
                          <input
                            type="number"
                            value={box.pricePerGb || ""}
                            onChange={(e) => handleUpdateBoxField(box.id, "pricePerGb", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                            placeholder="3000"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">
                            {translateText("Price per Day ", "قیمت به ازای هر روز ", lang) + `(${currency})`}
                          </label>
                          <input
                            type="number"
                            value={box.pricePerDay || ""}
                            onChange={(e) => handleUpdateBoxField(box.id, "pricePerDay", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                            placeholder="2000"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">
                            {translateText("Minimum GB Limit", "حداقل حجم ساخت (گیگابایت)", lang)}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={box.minGb !== undefined && box.minGb !== null ? box.minGb : ""}
                            onChange={(e) => handleUpdateBoxField(box.id, "minGb", e.target.value === "" ? "" : parseFloat(e.target.value))}
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1 font-bold">
                            {translateText("Minimum Days Limit", "حداقل روز ساخت (روز)", lang)}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={box.minDays !== undefined && box.minDays !== null ? box.minDays : ""}
                            onChange={(e) => handleUpdateBoxField(box.id, "minDays", e.target.value === "" ? "" : parseFloat(e.target.value))}
                            className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">
                          {translateText("Select servers for this rule:", "انتخاب سرورهای تیک‌خورده برای اعمال این قانون:", lang)}
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-[#111827]/40 p-3 rounded-lg border border-gray-900">
                          {Array.isArray(settings.servers) && settings.servers.length > 0 ? (
                            settings.servers.map((srv: any) => {
                              const isChecked = box.serverIds.includes(srv.id);
                              return (
                                <label key={srv.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleServerInBox(box.id, srv.id)}
                                    className="rounded border-gray-750 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 bg-slate-950 w-3.5 h-3.5"
                                  />
                                  <span className="truncate">{srv.name}</span>
                                </label>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-gray-500 col-span-full">
                              {translateText("No servers available.", "هیچ سروری تعریف نشده است.", lang)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-900/60">
                        <button
                          type="button"
                          onClick={() => handleCloseAndSaveBox(box.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{translateText("Save and Close Box", "ذخیره و بستن کادر", lang)}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePricingSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{translateText("Save Pricing Rules", "ذخیره تنظیمات قیمت‌گذاری", lang)}</span>
          </button>
        </div>
      </div>

      {/* Plan Categories Management Section */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">
              {translateText("Plan Categories Management", "مدیریت دسته‌بندی پلن‌ها", lang)}
            </h4>
          </div>
          <button
            onClick={() => {
              setIsAddingCat(true);
              setEditingCategoryId(null);
              setCatName("");
              setCatEmoji("⚡️");
            }}
            className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {(isAddingCat || editingCategoryId) && (
          <div className="bg-[#1a2234] p-4 rounded-xl space-y-3 border border-purple-500/20 animate-in fade-in slide-in-from-top-1">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-gray-400 uppercase mb-1">{translateText("Category Name", "نام دسته", lang)}</label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 outline-none"
                  placeholder={translateText("e.g. VIP", "مثلا: VIP", lang)}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-[10px] text-gray-400 uppercase mb-1">{translateText("Emoji", "ایموجی", lang)}</label>
                <input
                  type="text"
                  value={catEmoji}
                  onChange={e => setCatEmoji(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:border-purple-500 outline-none text-center"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition active:scale-95 flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsAddingCat(false);
                    setEditingCategoryId(null);
                  }}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {catError && <p className="text-[10px] text-rose-400">{catError}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {planCategories.map((cat, index) => (
            <div key={cat.id} className="bg-[#1c253b] border border-gray-800 p-4 rounded-xl hover:border-purple-500/50 transition-all flex flex-col justify-between gap-3.5 shadow-sm">
              {/* Order & Reordering Controls */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-1">
                <span className="text-[10px] font-mono text-gray-400 font-semibold flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded border border-gray-800">
                  <Layers className="w-2.5 h-2.5 text-indigo-400" />
                  {translateText("Rank: ", "جایگاه: ", lang) + (index + 1)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMovePlanCategory(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                    title={translateText("Move Up", "انتقال به بالا", lang)}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePlanCategory(index, "down")}
                    disabled={index === planCategories.length - 1}
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                    title={translateText("Move Down", "انتقال به پایین", lang)}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <select
                    value={index}
                    onChange={(e) => handleSetPlanCategoryPosition(index, Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[9px] text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    title={translateText("Direct Position Selection", "انتخاب مستقیم جایگاه", lang)}
                  >
                    {planCategories.map((_, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-sm font-bold text-white">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setCatName(cat.name);
                      setCatEmoji(cat.emoji || "⚡️");
                      setIsAddingCat(false);
                    }}
                    className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                    title={translateText("Edit", "ویرایش", lang)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteCategory(cat.id);
                    }}
                    className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                    title={translateText("Delete", "حذف", lang)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {planCategories.length === 0 && (
            <div className="col-span-full py-8 text-center bg-[#1c253b]/50 border border-dashed border-gray-800 rounded-xl">
              <p className="text-xs text-gray-500">
                {translateText("No categories created yet.", "هنوز هیچ دسته‌بندی ایجاد نشده است.", lang)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Single Column Layout representing customized VPN lists and replenishment tools */}
      <div className="space-y-6">
        
        {/* Main Action Bar */}
        {!showAddForm && (
          <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-2xl flex sm:flex-row flex-col gap-3 justify-between items-start sm:items-center">
            <div>
              <h4 className="font-semibold text-white text-sm">
                {translateText("Subscription Packages & Selling Matrix", "بسته‌های اشتراکی تلگرام و قیمت فروشگاه", lang)}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {translateText("These packages are pulled dynamically by the Telegram bot.", "این بسته‌ها درون ربات تلگرام با شارژ کیف پول تایید شده اتوماتیک ارائه می‌گردند.", lang)}
              </p>
            </div>
            <button
              type="button"
              onClick={startCreateNewPlan}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              {translateText("Create New VPN Plan", "تعریف بسته جدید", lang)}
            </button>
          </div>
        )}

        {/* New Plan / Edit Plan Form */}
        {showAddForm && (
          <div ref={formRef} className="bg-[#111827] border-2 border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-white text-md">
                  {editingPlanId 
                    ? (translateText("✏️ Edit VPN Package specifications", "✏️ ویرایش مشخصات بسته اشتراکی", lang)) 
                    : (translateText("➕ Spec out New Subscription Package", "➕ جزئیات و ساخت بسته جدید اشتراکی", lang))}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">{translateText("Display Name", "نام بسته (برنزی، VIP طلایی، گیمینگ)", lang)}</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    value={planName}
                    placeholder={translateText("Standard Promo Pack 50GB", "مثال: استاندارد ۱ ماهه ۵۰ گیگابایت", lang)}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">{translateText("Category / Group Name", "دسته‌بندی پنل (نام گروه)", lang)}</label>
                  <select
                    required
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold appearance-none"
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value)}
                  >
                    <option value="">{translateText("Select Category...", "انتخاب دسته‌بندی...", lang)}</option>
                    {planCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {planCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPlanCategory(cat.name)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 ${
                          planCategory === cat.name 
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                            : "bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">{translateText("Volume Size (GB)", "حجم (گیگابایت)", lang)}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    value={planTraffic}
                    onChange={(e) => setPlanTraffic(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">{translateText("Duration (Days)", "مدت زمان (به روز)", lang)}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    value={planDays}
                    onChange={(e) => setPlanDays(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-medium mb-1.5">{translateText("Selling Price ", "قیمت مصرف کننده ", lang) + `(${currency})`}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-yellow-300 focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {translateText("VPN subscription details stored and synchronized!", "اطلاعات بسته با موفقیت با هسته تلگرام مجیک همگام شد!", lang)}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  {editingPlanId ? (translateText("Save Changes", "ثبت نهایی تغییرات بسته", lang)) : (translateText("Generate & Launch Package", "ایجاد و ذخیره نهایی بسته", lang))}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition"
                >
                  {translateText("Cancel", "انصراف", lang)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of active subscription plans */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl space-y-4">
          <h4 className="text-xs uppercase font-mono tracking-wider text-gray-400 font-semibold flex justify-between items-center border-b border-gray-800 pb-2">
            <span>{translateText("Active Subscription specifications & prices:", "بسته‌های فعال و مشخصات سابسکریپشن سیستم:", lang)}</span>
            <span className="bg-[#1f2937] text-indigo-400 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold">{vpnPlans.length}</span>
          </h4>

          {vpnPlans.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-xl space-y-2 border border-dashed border-gray-800">
              <Layers className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-gray-400 text-sm font-semibold">
                {translateText("No packages listed inside the sqlite database pool.", "هیچ بسته‌ای در پایگاه اتصال تعریف نشده است.", lang)}
              </p>
              <button
                onClick={startCreateNewPlan}
                className="mt-2 text-indigo-400 text-xs font-bold hover:underline"
              >
                {translateText("Define your first VPN plan spec", "تعریف اولین پلن VPN", lang)}
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vpnPlans.map((plan, index) => {
                const isConfirmDeleting = confirmDeletingId === plan.id;

                return (
                  <div key={plan.id} className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 shadow-sm hover:border-slate-800 transition flex flex-col justify-between">
                    
                    {/* Order & Reordering Controls (Dropdown & Arrows) */}
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-3.5">
                      <span className="text-[11px] font-mono text-gray-500 font-semibold flex items-center gap-1 bg-slate-900/40 px-2 py-0.5 rounded-md border border-slate-900/60">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {translateText(`Rank: ${index + 1}`, `جایگاه: ${index + 1}`, lang)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMovePlan(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                          title={translateText("Move Up", "انتقال به بالا", lang)}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePlan(index, "down")}
                          disabled={index === vpnPlans.length - 1}
                          className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                          title={translateText("Move Down", "انتقال به پایین", lang)}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <select
                          value={index}
                          onChange={(e) => handleSetPlanPosition(index, Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          title={translateText("Direct Position Selection", "انتخاب مستقیم جایگاه", lang)}
                        >
                          {vpnPlans.map((_, idx) => (
                            <option key={idx} value={idx}>
                              {idx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Package Info Header */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-white">{plan.name}</h4>
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                            {plan.category.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold font-mono bg-amber-400/5 border border-amber-400/10 px-2 py-1 rounded-lg">
                          {plan.durationDays} {translateText("Days", "روز", lang)} / {plan.trafficGb}GB
                        </span>
                      </div>

                      <div className="text-sm text-gray-300 bg-[#111827]/40 border border-[#1f2937]/30 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-gray-400">{translateText("Bot Price:", "قیمت فروش ربات:", lang)}</span>
                        <div className="font-mono text-white text-md font-bold">
                          <span className="text-yellow-400">{plan.price.toLocaleString()}</span>
                          <span className="text-[11px] text-gray-500 font-sans font-medium"> {currency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Package Actions / Delete Confirms (NO WINDOW.CONFIRM) */}
                    <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-905 justify-end">
                      {isConfirmDeleting ? (
                        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/50 p-1 rounded-lg w-full justify-between">
                          <span className="text-[11px] text-rose-300 font-medium px-1">
                            {translateText("Confirm delete?", "حذف کامل بسته؟", lang)}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeletePlanConfirm(plan.id)}
                              className="px-2.5 py-1 bg-red-650 hover:bg-red-500 text-white rounded text-[11px] font-medium cursor-pointer"
                            >
                              {translateText("Yes", "بله", lang)}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletingId(null)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded text-[11px] cursor-pointer"
                            >
                              {translateText("No", "خیر", lang)}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditPlan(plan)}
                            className="bg-[#111827] border border-slate-800 hover:bg-gray-800 px-3 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                            title="Edit specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{translateText("Edit Plan", "ویرایش پلن", lang)}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletingId(plan.id)}
                            className="bg-[#111827] border border-slate-800 hover:bg-rose-950 hover:border-rose-900 px-3 py-2 rounded-lg text-rose-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
                            title="Delete package spec"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{translateText("Delete", "حذف", lang)}</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
