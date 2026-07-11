import { translateText, Language, translations } from "../lang/locales";
import React, { useState } from "react";
import {
  ColleaguePackage,
  ColleagueAccount,
  ColleagueCategory,
  PlanCategory,
  PanelSettings,
} from "../types";
import {
  Plus,
  Trash,
  Copy,
  CheckCircle2,
  Ticket,
  RotateCcw,
  Pencil,
  AlertCircle,
  X,
  Shield,
  Star,
  Zap,
  Infinity,
  Layers,
  Smile,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import MultiServerConfig from "./MultiServerConfig";

interface Props {
  packages: ColleaguePackage[];
  accounts: ColleagueAccount[];
  setPackages: (p: ColleaguePackage[]) => void;
  setAccounts: (a: ColleagueAccount[]) => void;
  lang: Language;
  settings: PanelSettings;
  onSaveSettings: (s: PanelSettings) => void;
  planCategories?: PlanCategory[];
  colleagueCategories?: ColleagueCategory[];
  setColleagueCategories?: (c: ColleagueCategory[]) => void;
}

export default function ColleaguesManagement({
  packages,
  accounts,
  setPackages,
  setAccounts,
  lang,
  settings,
  onSaveSettings,
  planCategories = [],
  colleagueCategories = [],
  setColleagueCategories,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "packages" | "accounts" | "categories" | "servers"
  >("servers");
  const [loading, setLoading] = useState(false);

  const [localToast, setLocalToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    let success = false;
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        navigator.clipboard.writeText(text);
        success = true;
      }
    } catch (err) {
      console.warn("navigator.clipboard failed, trying fallback", err);
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
    }

    showToast(translateText("✅ ", "✅ ", lang) + label + translateText(" copied!", " کپی شد!", lang));
  };

  // Package Form
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editPackageId, setEditPackageId] = useState<string | null>(null);
  const [pTitle, setPTitle] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pTraffic, setPTraffic] = useState("");
  const [pMinCreateGb, setPMinCreateGb] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pDesc, setPDesc] = useState("");

  // Category Form
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("📁");

  // Account Form
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [aTraffic, setATraffic] = useState("");

  const resetPackageForm = () => {
    setShowAddPackage(false);
    setEditPackageId(null);
    setPTitle("");
    setPPrice("");
    setPTraffic("");
    setPMinCreateGb("");
    setPCategory("");
    setPDesc("");
  };

  const saveCategory = async () => {
    if (!catName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/colleague-categories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: catEditingId || Math.random().toString(36).substring(2, 9),
          name: catName,
          emoji: catEmoji,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setColleagueCategories?.(data.colleagueCategories);
        showToast(
          translateText("Category saved.", "دسته همکار ذخیره شد.", lang),
          "success",
        );
        setShowAddCategory(false);
        setCatName("");
        setCatEmoji("📁");
        setCatEditingId(null);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setConfirmAction({
      message:
        translateText("Are you sure you want to delete this category?", "آیا از حذف این دسته‌بندی اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-categories/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (data.success) {
            setColleagueCategories?.(data.colleagueCategories);
            showToast(
              translateText("Category deleted.", "دسته حذف شد.", lang),
              "success",
            );
          }
        } catch (err: any) {
          showToast(err.message, "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleMoveColleagueCategory = async (
    index: number,
    direction: "up" | "down",
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= colleagueCategories.length) return;

    const newCats = [...colleagueCategories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    setColleagueCategories?.(newCats);

    try {
      const response = await fetch("/api/colleague-categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newCats.map((c) => c.id) }),
      });
      if (!response.ok) {
        console.error("Failed to persist new order of colleague categories");
      }
    } catch (err) {
      console.error("Error reordering colleague categories:", err);
    }
  };

  const handleSetColleagueCategoryPosition = async (
    index: number,
    newPositionIndex: number,
  ) => {
    if (
      newPositionIndex < 0 ||
      newPositionIndex >= colleagueCategories.length ||
      index === newPositionIndex
    )
      return;

    const newCats = [...colleagueCategories];
    const [movedCat] = newCats.splice(index, 1);
    newCats.splice(newPositionIndex, 0, movedCat);

    setColleagueCategories?.(newCats);

    try {
      const response = await fetch("/api/colleague-categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newCats.map((c) => c.id) }),
      });
      if (!response.ok) {
        console.error("Failed to persist new order of colleague categories");
      }
    } catch (err) {
      console.error("Error reordering colleague categories:", err);
    }
  };

  const savePackage = async () => {
    if (!pTitle || !pPrice || !pTraffic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/colleague-packages/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:
            editPackageId ||
            (window.crypto && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2, 15)),
          title: pTitle,
          price: Number(pPrice),
          trafficGb: Number(pTraffic),
          category: pCategory,
          description: pDesc,
          minCreateGb: pMinCreateGb ? Number(pMinCreateGb) : 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages(data.colleaguePackages);
        resetPackageForm();
        showToast(
          translateText("Package saved successfully.", "بسته با موفقیت ذخیره شد.", lang),
          "success",
        );
      } else {
        showToast(data.error, "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
    setLoading(false);
  };

  const handleMovePackage = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const newPackages = [...packages];
    const temp = newPackages[index];
    newPackages[index] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    setPackages(newPackages);

    try {
      const response = await fetch("/api/colleague-packages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newPackages.map((p) => p.id) }),
      });
      if (!response.ok) {
        console.error("Failed to persist new order of colleague packages");
      }
    } catch (err) {
      console.error("Error reordering colleague packages:", err);
    }
  };

  const handleSetPackagePosition = async (
    index: number,
    newPositionIndex: number,
  ) => {
    if (
      newPositionIndex < 0 ||
      newPositionIndex >= packages.length ||
      index === newPositionIndex
    )
      return;

    const newPackages = [...packages];
    const [movedPkg] = newPackages.splice(index, 1);
    newPackages.splice(newPositionIndex, 0, movedPkg);

    setPackages(newPackages);

    try {
      const response = await fetch("/api/colleague-packages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newPackages.map((p) => p.id) }),
      });
      if (!response.ok) {
        console.error("Failed to persist new order of colleague packages");
      }
    } catch (err) {
      console.error("Error reordering colleague packages:", err);
    }
  };

  const deletePackage = async (id: string) => {
    setConfirmAction({
      message:
        translateText("Are you sure you want to delete this package?", "آیا از حذف این بسته اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-packages/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (data.success) {
            setPackages(data.colleaguePackages);
            showToast(
              translateText("Package deleted successfully.", "بسته با موفقیت حذف شد.", lang),
              "success",
            );
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      },
    });
  };

  const deleteAccount = async (id: string) => {
    setConfirmAction({
      message:
        translateText("Are you sure you want to delete this colleague account?", "آیا از حذف این حساب مستقل همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            showToast(
              translateText("Account deleted successfully.", "حساب همکار حذف شد.", lang),
              "success",
            );
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      },
    });
  };

  const resetAccount = async (id: string) => {
    setConfirmAction({
      message:
        translateText("Are you sure you want to reset credentials for this account?", "آیا از ریست کردن نام کاربری و رمز عبور این حساب همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            showToast(
              translateText("Credentials reset successfully.", "مشخصات اتصال نمایندگی با موفقیت ریست شد.", lang),
              "success",
            );
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      },
    });
  };

  const saveAccount = async () => {
    if (!editAccountId || !aTraffic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/colleague-accounts/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editAccountId,
          trafficGb: Number(aTraffic),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(data.colleagueAccounts);
        setEditAccountId(null);
        showToast(
          translateText("Changes saved successfully.", "تغییرات با موفقیت ذخیره شد.", lang),
          "success",
        );
      } else {
        showToast(data.error, "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
    setLoading(false);
  };

  const resetAccountUsage = async () => {
    if (!editAccountId) return;
    setConfirmAction({
      message:
        translateText("Are you sure you want to reset usage to zero?", "آیا از صفر کردن حجم مصرفی همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/reset-usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editAccountId }),
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            setEditAccountId(null);
            showToast(
              translateText("Usage reset successfully.", "حجم مصرفی همکار با موفقیت صفر شد.", lang),
              "success",
            );
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      },
    });
  };

  return (
    <div className="space-y-6" dir={translateText("ltr", "rtl", lang)}>
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("servers")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "servers" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:text-white"}`}
        >
          {translateText("Colleague Servers", "سرورهای همکاران", lang)}
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "packages" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:text-white"}`}
        >
          {translateText("Colleague Packages", "بسته‌های همکاران", lang)}
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "accounts" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:text-white"}`}
        >
          {translateText("Issued Accounts", "حساب‌های صادر شده", lang)}
        </button>
      </div>

      {activeTab === "packages" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Integrated Category Management */}
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Layers className="text-indigo-400 w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-sm">
                  {translateText("Categories", "مدیریت دسته‌بندی‌ها", lang)}
                </h4>
              </div>
              <button
                onClick={() => {
                  setCatEditingId(null);
                  setCatName("");
                  setCatEmoji("📁");
                  setShowAddCategory(!showAddCategory);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[11px] font-bold transition-all"
              >
                {showAddCategory ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {translateText("Add Category", "تعریف دسته", lang)}
              </button>
            </div>

            {showAddCategory && (
              <div className="mb-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      {" "}
                      {translateText("Name", "نام دسته‌بندی", lang)}{" "}
                    </label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                      {" "}
                      {translateText("Emoji", "ایموجی", lang)}{" "}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={catEmoji}
                        onChange={(e) => setCatEmoji(e.target.value)}
                        className="w-10 bg-slate-900 border border-slate-800 rounded-lg py-2 text-center text-sm"
                      />
                      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
                        {["📁", "⭐", "🚀", "💎"].map((em) => (
                          <button
                            key={em}
                            onClick={() => setCatEmoji(em)}
                            className={`w-6 h-6 flex items-center justify-center rounded text-xs hover:bg-white/5 ${catEmoji === em ? "bg-indigo-500/20 text-indigo-400" : ""}`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveCategory}
                      disabled={loading}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {loading ? "..." : translateText("Save", "ذخیره", lang)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {colleagueCategories.map((cat, index) => (
                <div
                  key={cat.id}
                  className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-sm"
                >
                  {/* Order & Reordering Controls */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                    <span className="text-[10px] font-mono text-gray-400 font-semibold flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded border border-white/5">
                      <Layers className="w-2.5 h-2.5 text-indigo-400" />
                      {translateText(`Rank: ${index + 1}`, `جایگاه: ${index + 1}`, lang)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveColleagueCategory(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-900 border border-white/5 hover:bg-slate-700 text-gray-300 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                        title={translateText("Move Up", "انتقال به بالا", lang)}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMoveColleagueCategory(index, "down")
                        }
                        disabled={index === colleagueCategories.length - 1}
                        className="p-1 rounded bg-slate-900 border border-white/5 hover:bg-slate-700 text-gray-300 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                        title={translateText("Move Down", "انتقال به پایین", lang)}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <select
                        value={index}
                        onChange={(e) =>
                          handleSetColleagueCategoryPosition(
                            index,
                            Number(e.target.value),
                          )
                        }
                        className="bg-slate-900 border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                        title={
                          translateText("Direct Position Selection", "انتخاب مستقیم جایگاه", lang)
                        }
                      >
                        {colleagueCategories.map((_, idx) => (
                          <option key={idx} value={idx}>
                            {idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-sm font-bold text-slate-200">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCatName(cat.name);
                          setCatEmoji(cat.emoji);
                          setCatEditingId(cat.id);
                          setShowAddCategory(true);
                        }}
                        className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowAddPackage(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {translateText("Add New Package", "افزودن پکیج جدید", lang)}
            </button>
          </div>

          {showAddPackage && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-indigo-500/30">
              <h3 className="text-white font-bold mb-4">
                {editPackageId
                  ? translateText("Edit Package", "ویرایش پکیج", lang)
                  : translateText("Register New Package", "ثبت پکیج جدید", lang)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Title", "عنوان پکیج", lang)}
                  </label>
                  <input
                    type="text"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Price (IRT)", "قیمت (تومان)", lang)}
                  </label>
                  <input
                    type="number"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Traffic (GB)", "حجم (گیگابایت)", lang)}
                  </label>
                  <input
                    type="number"
                    value={pTraffic}
                    onChange={(e) => setPTraffic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Min GB per Client", "حداقل حجم ساخت کلاینت", lang)}
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={pMinCreateGb}
                    onChange={(e) => setPMinCreateGb(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Category", "دسته‌بندی", lang)}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">
                        {translateText("No Category", "بدون دسته‌بندی", lang)}
                      </option>
                      {colleagueCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={translateText("Manual...", "دستی...", lang)}
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    {translateText("Description", "توضیحات پکیج (نمایش به کاربر)", lang)}
                  </label>
                  <textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4 mt-4">
                <button
                  disabled={loading}
                  onClick={savePackage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm"
                >
                  {loading
                    ? "..."
                    : translateText("Save Package", "ذخیره پکیج", lang)}
                </button>
                <button
                  onClick={resetPackageForm}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm"
                >
                  {translateText("Cancel", "انصراف", lang)}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((p, index) => (
                <div
                  key={p.id}
                  className="bg-slate-800/50 p-4 rounded-xl border border-white/10 relative flex flex-col justify-between"
                >
                  <div>
                    {/* Order & Reordering Controls (Dropdown & Arrows) */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3.5">
                      <span className="text-[11px] font-mono text-gray-400 font-semibold flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {translateText(`Rank: ${index + 1}`, `جایگاه: ${index + 1}`, lang)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMovePackage(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-900 border border-white/5 hover:bg-slate-700 text-gray-300 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                          title={translateText("Move Up", "انتقال به بالا", lang)}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePackage(index, "down")}
                          disabled={index === packages.length - 1}
                          className="p-1 rounded bg-slate-900 border border-white/5 hover:bg-slate-700 text-gray-300 hover:text-white transition disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95"
                          title={
                            translateText("Move Down", "انتقال به پایین", lang)
                          }
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <select
                          value={index}
                          onChange={(e) =>
                            handleSetPackagePosition(
                              index,
                              Number(e.target.value),
                            )
                          }
                          className="bg-slate-900 border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          title={
                            translateText("Direct Position Selection", "انتخاب مستقیم جایگاه", lang)
                          }
                        >
                          {packages.map((_, idx) => (
                            <option key={idx} value={idx}>
                              {idx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Original Edit/Delete buttons repositioned elegantly in content layout */}
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-bold text-lg pr-4">
                        {p.title}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditPackageId(p.id);
                            setPTitle(p.title);
                            setPPrice(String(p.price));
                            setPTraffic(String(p.trafficGb));
                            setPMinCreateGb(
                              p.minCreateGb ? String(p.minCreateGb) : "",
                            );
                            setPCategory(p.category || "");
                            setPDesc(p.description || "");
                            setShowAddPackage(true);
                          }}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{translateText("Edit", "ویرایش", lang)}</span>
                        </button>
                        <button
                          onClick={() => deletePackage(p.id)}
                          disabled={loading}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-md flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">
                            {translateText("Delete", "حذف", lang)}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-300">
                      <span className="text-indigo-400 font-bold whitespace-nowrap">
                        💰 {p.price.toLocaleString()} تومان
                      </span>
                      <span className="whitespace-nowrap">
                        🗄️ {p.trafficGb} گیگابایت
                      </span>
                      <span className="text-amber-400 font-bold whitespace-nowrap">
                        ⚠️ حداقل حجم ساخت: {p.minCreateGb || 1} گیگابایت
                      </span>
                      {p.category && (
                        <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-500/20 uppercase tracking-tighter">
                          {colleagueCategories.find(
                            (c) => c.name === p.category,
                          )?.emoji || "📁"}{" "}
                          {p.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
              {packages.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {translateText("No packages found.", "هیچ پکیجی ثبت نشده است.", lang)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-900/60 pb-2">
              <tr>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("User ID", "مخاطب (آیدی)", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Package", "پکیج", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Prefix", "پیشوند", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Recovery Token", "توکن بازیابی", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Username", "یوزرنیم", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Password", "رمز", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Total Traffic", "کل حجم", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Allocated", "تخصیص داده شده", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Real Usage", "مجموع مصرف کاربر", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs">
                  {translateText("Status", "وضعیت", lang)}
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {acc.userId || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-bold">
                    {acc.packageTitle}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {acc.prefix || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {acc.recoveryToken ? (
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>{acc.recoveryToken}</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              acc.recoveryToken,
                              translateText("Recovery Token", "توکن بازیابی", lang),
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer"
                          title={translateText("Copy Token", "کپی توکن", lang)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-indigo-300 font-mono">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span>{acc.username}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            acc.username,
                            translateText("Username", "یوزرنیم", lang),
                          )
                        }
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer"
                        title={translateText("Copy Username", "کپی یوزرنیم", lang)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-300 font-mono tracking-wider">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span>{acc.password}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            acc.password,
                            translateText("Password", "رمز عبور", lang),
                          )
                        }
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-amber-400 transition cursor-pointer"
                        title={translateText("Copy Password", "کپی رمز عبور", lang)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                    {acc.trafficGb} GB
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                    {acc.usedTrafficGb || 0} GB
                  </td>
                  <td className="px-4 py-3 text-sm text-rose-400 font-mono">
                    {acc.realUsedTrafficGb || 0} GB
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {acc.status === "active" ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md text-xs">
                        {translateText("Active", "فعال", lang)}
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md text-xs">
                        {translateText("Expired", "منقضی", lang)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => resetAccount(acc.id)}
                        disabled={loading}
                        title={
                          translateText("Reset Credentials", "ریست نام کاربری و رمز عبور", lang)
                        }
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditAccountId(acc.id);
                          setATraffic(String(acc.trafficGb));
                        }}
                        disabled={loading}
                        title={
                          translateText("Edit Account Traffic", "ویرایش حجم حساب", lang)
                        }
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        disabled={loading}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-md"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-500">
                    {translateText("No accounts found.", "هیچ حسابی صادر نشده است.", lang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editAccountId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-bold">
                {translateText("Edit Account Traffic", "ویرایش حجم حساب همکار", lang)}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  {translateText("Total Traffic (GB)", "کل حجم (گیگابایت)", lang)}
                </label>
                <input
                  type="number"
                  value={aTraffic}
                  onChange={(e) => setATraffic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {translateText("Increasing this value expands the colleague's limit for creating users.", "با افزایش این عدد، سقف مجاز همکار برای ایجاد کاربر افزایش می‌یابد.", lang)}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetAccountUsage}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-bold text-sm transition flex gap-2 items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  {translateText("Reset Usage to Zero", "صفر کردن حجم مصرفی همکار", lang)}
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-slate-900/50">
              <button
                onClick={() => setEditAccountId(null)}
                className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-bold text-gray-300 transition"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
              <button
                onClick={saveAccount}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
              >
                {loading
                  ? "..."
                  : translateText("Save Changes", "ذخیره تغییرات", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "servers" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <MultiServerConfig
            settings={settings}
            onSaveSettings={onSaveSettings}
            lang={lang as any}
            planCategories={planCategories}
            colleaguePackages={packages}
            serverType="colleague"
          />
        </div>
      )}

      {/* Toast Notification Container */}
      {localToast && (
        <div
          className="fixed bottom-5 right-5 z-50 animate-fadeIn flex items-center gap-2.5 bg-[#141b2d] border border-slate-800 rounded-xl px-4 py-3 shadow-2xl text-xs max-w-sm text-right font-sans"
          dir="rtl"
        >
          <div
            className={`p-1.5 rounded-full ${localToast.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <p className="font-sans text-gray-200">{localToast.message}</p>
        </div>
      )}

      {/* Confirmation Modal Container */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div
            className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm space-y-4"
            dir={translateText("ltr", "rtl", lang)}
          >
            <div className="flex items-center gap-2 text-amber-400 border-b border-white/5 pb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                {translateText("Confirm Operation", "تایید نهایی عملیات", lang)}
              </h3>
            </div>

            <p className="text-white text-sm font-medium leading-relaxed font-sans">
              {confirmAction.message}
            </p>

            <div className="flex items-center gap-3 pt-4 font-sans">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 backdrop-blur-md text-indigo-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              >
                {translateText("Confirm", "تایید", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
