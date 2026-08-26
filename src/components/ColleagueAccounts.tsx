import { translateText } from "../lang/locales"; import { Language } from "../lang/locales";
import React, { useState } from "react";
import { ColleagueAccount } from "../types";
import { Trash, Copy, RotateCcw, Pencil, AlertCircle, CheckCircle2, Ticket } from "lucide-react";

interface Props {
  accounts: ColleagueAccount[];
  setAccounts: (a: ColleagueAccount[]) => void;
  lang: Language;
}

export default function ColleagueAccounts({ 
  accounts, 
  setAccounts, 
  lang
}: Props) {
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
  
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [aTraffic, setATraffic] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    let success = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
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

    showToast(
      translateText(`✅ ${label} copied!`, `✅ ${label} کپی شد!`, lang)
    );
  };

  const deleteAccount = async (id: string) => {
    setConfirmAction({
      message: translateText("Are you sure you want to delete this colleague account?", "آیا از حذف این حساب مستقل همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            showToast(translateText("Account deleted successfully.", "حساب همکار حذف شد.", lang), "success");
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      }
    });
  };

  const resetAccount = async (id: string) => {
    setConfirmAction({
      message: translateText("Are you sure you want to reset credentials for this account?", "آیا از ریست کردن نام کاربری و رمز عبور این حساب همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            showToast(translateText("Credentials reset successfully.", "مشخصات اتصال نمایندگی با موفقیت ریست شد.", lang), "success");
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      }
    });
  };

  const saveAccount = async () => {
    if (!editAccountId || !aTraffic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/colleague-accounts/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editAccountId, trafficGb: Number(aTraffic) })
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(data.colleagueAccounts);
        setEditAccountId(null);
        showToast(translateText("Changes saved successfully.", "تغییرات با موفقیت ذخیره شد.", lang), "success");
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
      message: translateText("Are you sure you want to reset usage to zero?", "آیا از صفر کردن حجم مصرفی همکار اطمینان دارید؟", lang),
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/colleague-accounts/reset-usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editAccountId })
          });
          const data = await res.json();
          if (data.success) {
            setAccounts(data.colleagueAccounts);
            setEditAccountId(null);
            showToast(translateText("Usage reset successfully.", "حجم مصرفی همکار با موفقیت صفر شد.", lang), "success");
          } else {
            showToast(data.error, "error");
          }
        } catch (err: any) {
          showToast(err.message, "error");
        }
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6" dir={translateText("ltr", "rtl", lang)}>
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1f2937] bg-slate-900/50 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            {translateText("Colleague Issued Accounts", "حساب‌های صادر شده همکاران", lang)}
          </h2>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[700px] custom-scrollbar">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-900/60 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("User ID", "مخاطب (آیدی)", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Package", "پکیج", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Prefix", "پیشوند", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Recovery Token", "توکن بازیابی", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Username", "یوزرنیم", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Password", "رمز", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Total Traffic", "کل حجم", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Allocated", "تخصیص داده شده", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Real Usage", "مجموع مصرف کاربر", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs">{translateText("Status", "وضعیت", lang)}</th>
                <th className="px-4 py-3 text-gray-400 font-bold text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-800/40 transition group">
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">{acc.userId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white font-bold">{acc.packageTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{acc.prefix || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {acc.recoveryToken ? (
                      <div className="flex items-center gap-1.5 justify-start">
                        <span>{acc.recoveryToken}</span>
                        <button
                          onClick={() => copyToClipboard(acc.recoveryToken, translateText("Recovery Token", "توکن بازیابی", lang))}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-indigo-300 font-mono">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span>{acc.username}</span>
                      <button
                        onClick={() => copyToClipboard(acc.username, translateText("Username", "یوزرنیم", lang))}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-300 font-mono tracking-wider">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span>{acc.password}</span>
                      <button
                        onClick={() => copyToClipboard(acc.password, translateText("Password", "رمز عبور", lang))}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-amber-400 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{acc.trafficGb} GB</td>
                  <td className="px-4 py-3 text-sm text-blue-400 font-mono">{acc.usedTrafficGb || 0} GB</td>
                  <td className="px-4 py-3 text-sm text-rose-400 font-mono">{acc.realUsedTrafficGb || 0} GB</td>
                  <td className="px-4 py-3 text-sm">
                    {acc.status === "active" ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/20">{lang === 'fa' ? 'فعال' : 'Active'}</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md text-[10px] font-bold border border-rose-500/20">{lang === 'fa' ? 'منقضی' : 'Expired'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => resetAccount(acc.id)}
                        disabled={loading}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditAccountId(acc.id);
                          setATraffic(String(acc.trafficGb));
                        }}
                        disabled={loading}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        disabled={loading}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-md transition"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-20 text-gray-500 font-bold">
                    {translateText("No accounts issued yet.", "هیچ حسابی در سیستم صادر نشده است.", lang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editAccountId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b0f19] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#1f2937] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1f2937] flex justify-between items-center bg-slate-900/50">
              <h3 className="text-white font-bold">{translateText("Edit Account Traffic", "ویرایش حجم حساب همکار", lang)}</h3>
              <button onClick={() => setEditAccountId(null)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{translateText("Total Traffic (GB)", "کل حجم (گیگابایت)", lang)}</label>
                <input type="number" value={aTraffic} onChange={e => setATraffic(e.target.value)} className="w-full bg-[#070913] border border-[#1f2937] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" dir="ltr" />
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                  {translateText("Increasing this value expands the colleague's limit for creating users.", "با افزایش این عدد، سقف مجاز همکار برای ایجاد کاربر افزایش می‌یابد.", lang)}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAccountUsage}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-xs transition-all flex gap-2 items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  {translateText("Reset Usage to Zero", "صفر کردن حجم مصرفی همکار", lang)}
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-[#1f2937] flex gap-2 bg-slate-900/30">
              <button
                onClick={() => setEditAccountId(null)}
                className="flex-1 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-400 transition"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
              <button
                onClick={saveAccount}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {loading ? "..." : (translateText("Save Changes", "ذخیره تغییرات", lang))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Modals/Toasts */}
      {localToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn flex items-center gap-2.5 bg-[#141b2d] border border-slate-800 rounded-xl px-4 py-3 shadow-2xl text-xs max-w-sm text-right font-sans" dir="rtl">
          <div className={`p-1.5 rounded-full ${localToast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <p className="font-sans text-gray-200">{localToast.message}</p>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="bg-[#0b0f19] border border-[#1f2937] backdrop-blur-xl p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm space-y-4" dir={translateText("ltr", "rtl", lang)}>
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#1f2937] pb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                {translateText("Confirm Operation", "تایید نهایی عملیات", lang)}
              </h3>
            </div>
            
            <p className="text-white text-sm font-medium leading-relaxed font-sans opacity-80">
              {confirmAction.message}
            </p>

            <div className="flex items-center gap-3 pt-4 font-sans">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-[#1f2937] text-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/10"
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

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
