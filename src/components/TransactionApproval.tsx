import { translateText, Language, translations } from "../lang/locales";
import React, { useState } from "react";
import { Transaction, PanelSettings } from "../types";
import { formatDateTime } from "../utils/dateTimeUtils";
import { 
  Check, 
  X, 
  Clock, 
  Eye, 
  Filter, 
  DollarSign, 
  AlertCircle, 
  CreditCard,
  Trash2
} from "lucide-react";

interface TransactionApprovalProps {
  transactions: Transaction[];
  approveTransaction: (id: string, correctedAmount?: number) => void;
  rejectTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;
  clearTransactionHistory: () => void;
  lang: Language;
  settings?: PanelSettings;
}

export default function TransactionApproval({
  transactions,
  approveTransaction,
  rejectTransaction,
  deleteTransaction,
  clearTransactionHistory,
  lang,
  settings
}: TransactionApprovalProps) {
  const t = { ...translations.en, ...translations[lang] };
  const currency = settings?.currency || (translateText("Toman", "تومان", lang));
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Track custom corrected amount per transaction ID
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  // Custom state-based safe iframe modal confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id?: string;
    type: "single" | "all";
    title: string;
    message: string;
  } | null>(null);

  const getNormalizedStatus = (st?: string) => {
    const s = (st || "").toLowerCase().trim();
    if (s === "approved" || s === "confirmed" || s === "active" || s === "success") return "approved";
    if (s === "pending" || s === "waiting") return "pending";
    if (s === "refunded") return "refunded";
    if (s === "failed") return "failed";
    if (s === "rejected" || s === "declined") return "rejected";
    return s || "pending";
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterStatus === "all") return true;
    const norm = getNormalizedStatus(tx.status);
    if (filterStatus === "approved") return norm === "approved";
    if (filterStatus === "pending") return norm === "pending";
    if (filterStatus === "rejected") return ["rejected", "refunded", "failed"].includes(norm);
    return true;
  });

  const statusCounts = {
    all: transactions.length,
    pending: transactions.filter(t => getNormalizedStatus(t.status) === "pending").length,
    approved: transactions.filter(t => getNormalizedStatus(t.status) === "approved").length,
    rejected: transactions.filter(t => ["rejected", "refunded", "failed"].includes(getNormalizedStatus(t.status))).length,
  };

  const getStatusBadge = (rawStatus?: string) => {
    const norm = getNormalizedStatus(rawStatus);
    switch (norm) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "refunded":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "failed":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "rejected":
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  const renderStatusLabel = (rawStatus?: string) => {
    const norm = getNormalizedStatus(rawStatus);
    if (norm === "pending") return t.filterPending;
    if (norm === "approved") return t.filterApproved;
    if (norm === "refunded") return translateText("Refunded", "مرجوع شد", lang);
    if (norm === "failed") return translateText("Failed", "خطا در انجام", lang);
    return t.filterRejected;
  };

  return (
    <div id="transactions-tab" className="space-y-6">
      {/* Tab Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-medium text-lg text-white">{t.manualReceiptsTitle}</h3>
          <p className="text-xs text-gray-400">{t.manualReceiptsDesc}</p>
        </div>

        <button
          onClick={() => setDeleteConfirm({
            type: "all",
            title: translateText("Clear Receipts History", "تایید حذف تاریخچه", lang),
            message: translateText("Are you sure you want to completely delete all transaction receipts (including approved, rejected, and pending logs) from Daltoon Bot database? This cannot be undone.", "آیا از حذف کامل کل تاریخچه فیش‌های بارگذاری شده (شامل فیش‌های تایید شده، رد شده و معلق) از پایگاه داده دالتون بات اطمینان دارید؟ این عمل غیرقابل بازگشت است.", lang)
          })}
          className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/10 text-rose-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1.5 self-start sm:self-auto"
          title={translateText("Truncate All Slip History Records", "حذف کل تاریخچه فیش‌ها", lang)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {translateText("Clear Receipts History", "حذف تاریخچه فیش‌ها", lang)}
        </button>
      </div>

      {/* Top Status Counters as Clickable Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus("all")}
          className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between cursor-pointer ${
            filterStatus === "all"
              ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/50"
              : "bg-[#111827] border-[#1f2937] text-gray-400 hover:border-gray-700 hover:text-gray-200"
          }`}
        >
          <span className="text-xs font-medium text-gray-400">{translateText("All Slips", "همه فیش‌ها", lang)}</span>
          <div className="flex items-center justify-between mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            <span className="text-lg md:text-xl font-bold font-mono text-indigo-400">{statusCounts.all}</span>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("pending")}
          className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between cursor-pointer ${
            filterStatus === "pending"
              ? "bg-amber-600/20 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/50"
              : "bg-[#111827] border-[#1f2937] text-gray-400 hover:border-gray-700 hover:text-gray-200"
          }`}
        >
          <span className="text-xs font-medium text-amber-400/90">{translateText("Pending", "در انتظار تایید", lang)}</span>
          <div className="flex items-center justify-between mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></span>
            <span className="text-lg md:text-xl font-bold font-mono text-amber-400">{statusCounts.pending}</span>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("approved")}
          className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between cursor-pointer ${
            filterStatus === "approved"
              ? "bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/50"
              : "bg-[#111827] border-[#1f2937] text-gray-400 hover:border-gray-700 hover:text-gray-200"
          }`}
        >
          <span className="text-xs font-medium text-emerald-400/90">{translateText("Approved", "تایید شده", lang)}</span>
          <div className="flex items-center justify-between mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-lg md:text-xl font-bold font-mono text-emerald-400">{statusCounts.approved}</span>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("rejected")}
          className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between cursor-pointer ${
            filterStatus === "rejected"
              ? "bg-rose-600/20 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)] ring-2 ring-rose-500/50"
              : "bg-[#111827] border-[#1f2937] text-gray-400 hover:border-gray-700 hover:text-gray-200"
          }`}
        >
          <span className="text-xs font-medium text-rose-400/90">{translateText("Rejected", "رد شده", lang)}</span>
          <div className="flex items-center justify-between mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            <span className="text-lg md:text-xl font-bold font-mono text-rose-400">{statusCounts.rejected}</span>
          </div>
        </button>
      </div>

      {/* Main Grid: list + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction log table */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-slate-900 border-b border-[#1f2937] sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">{t.tableColTxId}</th>
                  <th className="px-5 py-3">{t.tableColUser}</th>
                  <th className="px-5 py-3">{t.tableColAmount}</th>
                  <th className="px-5 py-3">{t.tableColDate}</th>
                  <th className="px-5 py-3">{t.tableColStatus}</th>
                  <th className="px-5 py-3 text-right">{t.tableColActionsTx}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                      {t.noInvoicesFound}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold">{tx.id}</td>
                      <td className="px-5 py-4">
                        <div className="text-white font-medium text-sm">@{tx.username}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {tx.userId}</div>
                      </td>
                      <td className="px-5 py-4 font-display font-semibold text-emerald-400">
                        {tx.amount.toLocaleString()} {currency}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {formatDateTime(tx.date, { timeZone: settings?.timeZone, calendarSystem: settings?.calendarSystem, includeTime: true })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(tx.status)}`}>
                          {renderStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t.viewSlipBtn}
                        </button>

                        {getNormalizedStatus(tx.status) === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                const valStr = customAmounts[tx.id];
                                const correctedAmount = valStr !== undefined && valStr !== "" ? Number(valStr) : undefined;
                                approveTransaction(tx.id, correctedAmount);
                              }}
                              className="p-1 px-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded text-xs transition inline-flex items-center gap-0.5 cursor-pointer"
                              title="Approve & Credit Balance"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {t.approveBtn}
                            </button>
                            <button
                              onClick={() => rejectTransaction(tx.id)}
                              className="p-1 px-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-xs transition inline-flex items-center gap-0.5 cursor-pointer"
                              title="Reject Receipt"
                            >
                              <X className="w-3.5 h-3.5" />
                              {t.rejectBtn}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setDeleteConfirm({
                            id: tx.id,
                            type: "single",
                            title: translateText("Confirm Delete Slip", "تایید حذف فیش", lang),
                            message: translateText(`Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?`, `آیا از حذف تراکنش کاربر @${tx.username} با شناسه ${tx.id} مطمئن هستید؟`, lang)
                          })}
                          className="p-1 px-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/20 text-rose-300 hover:text-white rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Delete Receipt From History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Slip Receipt Preview Container */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between h-fit space-y-4">
          <div className="space-y-4">
            <h3 className="font-display font-medium text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              {t.analyzerTitle}
            </h3>
            <p className="text-xs text-gray-400">{t.analyzerDesc}</p>

            {selectedTx ? (
              (() => {
                const isRealImage = selectedTx.receiptImage && (
                  selectedTx.receiptImage.startsWith("data:") || 
                  selectedTx.receiptImage.startsWith("http") || 
                  selectedTx.receiptImage.startsWith("/") || 
                  selectedTx.receiptImage.includes(".")
                );
                return (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 p-4 space-y-4">
                    {isRealImage ? (
                      <div className="w-full h-80 rounded-md relative flex items-center justify-center bg-slate-950 overflow-hidden border border-slate-800 group">
                        <img 
                          src={selectedTx.receiptImage} 
                          alt="Receipt Preview" 
                          className="w-full h-full object-contain cursor-pointer transition duration-300 group-hover:scale-[1.02]"
                          referrerPolicy="no-referrer"
                          onClick={() => setLightboxOpen(true)}
                        />
                        <div 
                          className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black/90 text-white backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-sans flex items-center gap-1.5 cursor-pointer transition shadow-lg border border-slate-700/50" 
                          onClick={() => setLightboxOpen(true)}
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          {translateText("Zoom Receipt", "بزرگنمایی فیش", lang)}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-full aspect-video rounded-md relative flex items-center justify-center text-white overflow-hidden p-4 ${selectedTx.receiptImage}`}>
                        <div className="absolute inset-0 bg-black/35 backdrop-blur-xs"></div>
                        <div className="z-10 text-center space-y-1 font-mono text-xs">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t.bankReportHeader}</p>
                          <p className="text-xl font-bold font-display text-emerald-400">{selectedTx.amount.toLocaleString()} {translateText("TOMAN", "تومان", lang)}</p>
                          <p className="text-[10px]">Reference: {selectedTx.id.replace("TX-", "")}</p>
                          <p className="text-[10px]">Recipient Card: 6037-xxxx-xxxx-8848</p>
                          <div className="pt-2">
                            <span className="px-2 py-0.5 rounded bg-black/50 text-[9px] uppercase border border-slate-700">
                              {t.digitalVerificationSlip}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs space-y-2 pt-2 text-gray-400">
                      <div className="flex justify-between">
                        <span>{t.analyzerDepositor}:</span>
                        <span className="text-white font-medium">@{selectedTx.username} (ID: {selectedTx.userId})</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-1 rounded border border-slate-800/80">
                        <span>{t.analyzerCreditAmount}:</span>
                        {getNormalizedStatus(selectedTx.status) === "pending" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={customAmounts[selectedTx.id] !== undefined ? customAmounts[selectedTx.id] : selectedTx.amount}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomAmounts(prev => ({ ...prev, [selectedTx.id]: val }));
                              }}
                              className="bg-slate-950 text-emerald-400 font-semibold font-display text-right w-24 py-0.5 px-1 rounded border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-gray-400">{currency}</span>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold font-display">{selectedTx.amount.toLocaleString()} {currency}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span>{t.analyzerReportingDate}:</span>
                        <span>{formatDateTime(selectedTx.date, { timeZone: settings?.timeZone, calendarSystem: settings?.calendarSystem, includeTime: true })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.analyzerDescription}:</span>
                        <span className="text-gray-300 font-mono text-[10px]">{selectedTx.description || "N/A"}</span>
                      </div>
                    </div>

                    {getNormalizedStatus(selectedTx.status) === "pending" && (
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800">
                        <button
                          onClick={() => {
                            const correctedVal = customAmounts[selectedTx.id];
                            const correctedAmount = correctedVal !== undefined && correctedVal !== "" ? Number(correctedVal) : undefined;
                            approveTransaction(selectedTx.id, correctedAmount);
                            setSelectedTx(null);
                          }}
                          className="inline-flex justify-center items-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> {t.approveSlipBtn}
                        </button>
                        <button
                          onClick={() => {
                            rejectTransaction(selectedTx.id);
                            setSelectedTx(null);
                          }}
                          className="inline-flex justify-center items-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {t.rejectSlipBtn}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="border border-dashed border-[#1f2937] rounded-lg p-10 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-slate-600 animate-pulse" />
                <p>{t.selectInvoicePlaceholder}</p>
              </div>
            )}
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 text-xs text-amber-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t.guidelinesNotice}</p>
          </div>
        </div>

      </div>

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
                  if (deleteConfirm.type === "all") {
                    clearTransactionHistory();
                  } else if (deleteConfirm.id) {
                    deleteTransaction(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition cursor-pointer"
              >
                {translateText("Yes, Delete", "تایید و حذف", lang)}
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

      {/* High-Resolution Lightbox Modal */}
      {lightboxOpen && selectedTx && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in font-sans"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button top right */}
          <button 
            onClick={() => setLightboxOpen(false)} 
            className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-gray-300 hover:text-white rounded-full transition border border-slate-700 cursor-pointer z-50"
            title={translateText("Close", "بستن", lang)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Full Screen Image */}
          <div 
            className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          >
            <img 
              src={selectedTx.receiptImage} 
              alt="Receipt Lightbox" 
              className="max-h-[80vh] max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Info footer */}
          <div 
            className="mt-4 bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-3 max-w-md w-full text-center space-y-1 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-medium text-sm">@{selectedTx.username} (ID: {selectedTx.userId})</p>
            <p className="text-emerald-400 font-bold text-base font-display">{selectedTx.amount.toLocaleString()} {currency}</p>
            <p className="text-[10px] text-gray-400 font-mono">Reference: {selectedTx.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
