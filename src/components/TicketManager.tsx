import { translateText } from "../lang/locales";
import React, { useState } from "react";
import { MessageSquare, Check, X, Send, Search, Clock, Shield, AlertCircle, Trash2, ArrowRight } from "lucide-react";
import { Ticket } from "../types";
import { Language } from "../lang/locales";

interface TicketManagerProps {
  tickets: Ticket[];
  onReplyTicket: (ticketId: string, replyMessage: string) => void;
  onCloseTicket: (ticketId: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
  lang?: Language;
}

export default function TicketManager({
  tickets = [],
  onReplyTicket,
  onCloseTicket,
  onDeleteTicket,
  lang = "fa",
}: TicketManagerProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "answered" | "closed">("all");
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const isFa = lang === "fa";

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    onReplyTicket(selectedTicketId, replyText.trim());
    setReplyText("");
  };

  const handleClose = () => {
    if (selectedTicketId) {
      onCloseTicket(selectedTicketId);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId.toString().includes(searchTerm) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || t.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="p-3 bg-rose-500/10 rounded-xl">
          <MessageSquare className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {translateText("Professional Ticketing & Support", "🎟️ سیستم تخصصی تیکت و پشتیبانی", lang)}
          </h2>
          <p className="text-sm text-gray-400">
            {isFa
              ? "مدیریت، پاسخ‌گویی و ثبت مکاتبات با کاربران و مشتریان به صورت پرونده‌ای"
              : "Manage and reply to support tickety chains created by Telegram users"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List (Left Panel / 1col or 2cols) */}
        <div className={`${selectedTicketId ? "hidden lg:flex" : "flex"} lg:col-span-1 bg-[#0f1626] border border-gray-800/80 rounded-2xl p-5 flex flex-col h-[650px]`}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            {translateText("Inbound Support Tickets", "لیست تیکت‌های دریافتی", lang)}
          </h3>

          {/* Search Table */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={translateText("Search user, subject, ID...", "جستجو در شناسه، کاربر، موضوع...", lang)}
              className="w-full bg-[#161c2a] border border-gray-700/80 rounded-xl p-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Filter Status Pills */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {(["all", "open", "answered", "closed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  filterStatus === status
                    ? "bg-rose-600 text-white"
                    : "bg-[#161c2a] text-gray-400 hover:text-white"
                }`}
              >
                {status === "all"
                  ? translateText("All", "همه", lang)
                  : status === "open"
                  ? translateText("Open", "باز", lang)
                  : status === "answered"
                  ? translateText("Reply", "پاسخ", lang)
                  : translateText("Closed", "بسته", lang)}
              </button>
            ))}
          </div>

          {/* Ticket Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-xs text-gray-500">
                  {translateText("No support tickets found.", "هیچ تیکتی پیدا نشد.", lang)}
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                    selectedTicketId === t.id
                      ? "bg-rose-600/15 border-rose-500/50"
                      : "bg-[#161c2a] border-transparent hover:border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                      {t.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          t.status === "open"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : t.status === "answered"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-gray-700/20 text-gray-400"
                        }`}
                      >
                        {t.status === "open"
                          ? translateText("Pending Answer", "در انتظار پاسخ", lang)
                          : t.status === "answered"
                          ? translateText("Answered", "پاسخ داده شده", lang)
                          : translateText("Closed", "بسته شده", lang)}
                      </span>
                      {onDeleteTicket && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTicketToDelete(t.id);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition cursor-pointer flex items-center justify-center shrink-0"
                          title={translateText("Delete Ticket", "حذف تیکت", lang)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-white truncate" dir="rtl">
                    {t.subject}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>
                      {translateText("User:", "کاربر:", lang)} <strong className="text-gray-300 font-medium">@{t.username}</strong>
                    </span>
                    <span className="font-mono text-[9px] text-gray-500">
                      {t.updatedAt.split("T")[0]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reply Ticket / Chat Panel (Right / 2 cols) */}
        <div className={`${selectedTicketId ? "flex" : "hidden lg:flex"} lg:col-span-2 bg-[#0f1626] border border-gray-800/80 rounded-2xl h-[650px] flex flex-col overflow-hidden`}>
          {selectedTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {/* Header Details */}
              <div className="p-4 bg-[#141b2c] border-b border-gray-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketId(null)}
                    className="lg:hidden p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer flex items-center justify-center shrink-0"
                    title={translateText("Back to List", "بازگشت به لیست", lang)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-right" dir="rtl">
                    <h3 className="text-xs text-rose-400 font-bold mb-0.5">
                      {translateText("Ticket ", "پرونده تیکت ", lang) + selectedTicket.id}
                    </h3>
                    <h2 className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-[280px]">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    disabled={selectedTicket.status === "closed"}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-emerald-600/15 border border-transparent hover:border-emerald-500/20 text-gray-300 hover:text-emerald-400 text-[11px] font-semibold cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {translateText("Close Ticket Chain", "بستن پرونده تیکت", lang)}
                  </button>

                  {onDeleteTicket && (
                    <button
                      type="button"
                      onClick={() => {
                        setTicketToDelete(selectedTicket.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-[11px] font-semibold cursor-pointer transition flex items-center gap-1"
                      title={translateText("Delete Ticket", "حذف تیکت", lang)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {translateText("Delete", "حذف پرونده", lang)}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Streams (Scroll Area) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col bg-[#0b0e17]/40">
                {/* Meta Header */}
                <div className="bg-gray-800/20 border border-gray-800/40 rounded-xl p-3 flex flex-col gap-1 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2" dir="rtl">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {translateText("Author Info:", "فرستنده تیکت:", lang)}{" "}
                      <strong className="text-gray-200">
                        {selectedTicket.username} ({selectedTicket.userId})
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2" dir="rtl">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {translateText("Registered At:", "تاریخ ثبت اولیه:", lang)}{" "}
                      <strong className="text-gray-200">
                        {new Date(selectedTicket.createdAt).toLocaleString("fa-IR")}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Array of messages */}
                {selectedTicket.messages.map((m, idx) => {
                  const isAdmin = m.sender === "admin";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[80%] ${
                        isAdmin ? "self-start text-left" : "self-end text-right"
                      }`}
                    >
                      <span className="text-[9px] text-gray-500 mb-1 px-1">
                        {isAdmin ? (translateText("Support", "👨‍💼 مدیریت", lang)) : (translateText("Customer", "👤 کاربر", lang))}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? "bg-rose-600/10 text-rose-100 border border-rose-500/20 rounded-tl-none font-medium text-right"
                            : "bg-[#161c2a] text-gray-100 border border-gray-800 rounded-tr-none text-right"
                        }`}
                        dir="rtl"
                      >
                        {m.message}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-1 font-mono px-1">
                        {new Date(m.date).toLocaleTimeString("fa-IR", {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Form Input Reply Area */}
              <div className="p-3 bg-[#111625] border-t border-gray-800/60">
                {selectedTicket.status === "closed" ? (
                  <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {isFa
                      ? "⚠️ این تیکت بسته شده است و امکان ارسال پاسخ جدید وجود ندارد."
                      : "⚠️ This support ticket is closed and cannot be replied to."}
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={translateText("Type support reply text here...", "پاسخ مدیریت را اینجا بنویسید...", lang)}
                      className="flex-1 bg-[#161c2a] border border-gray-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none h-[64px]"
                      dir="rtl"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer text-xs font-semibold flex flex-col justify-center items-center gap-1.5 transition"
                    >
                      <Send className="w-4 h-4 scale-x-[-1]" />
                      <span>{translateText("Send", "ارسال", lang)}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <MessageSquare className="w-12 h-12 text-gray-700 mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-white mb-1">
                {translateText("Select Support Chain", "مکاتبات پشتیبانی", lang)}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                {isFa
                  ? "لطفاً از پنل سمت راست یک پرونده تیکت را انتخاب کنید تا جزئیات گفتگوها و پاسخ‌گویی به کاربر باز شود."
                  : "Pick a client's support ticket case from the left listing to see communications details."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative text-right" dir="rtl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-gray-800 pb-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <h3 className="text-base font-bold text-white">
                {translateText("Confirm Ticket Deletion", "تایید حذف نهایی تیکت", lang)}
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {isFa 
                ? `آیا از حذف دائم و همیشگی پرونده تیکت به شماره ${ticketToDelete} اطمینان کامل دارید؟ این عمل غیرقابل بازگشت است.`
                : `Are you sure you want to permanently delete support ticket #${ticketToDelete}? This action cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-850 hover:bg-gray-800 text-gray-300 text-xs font-semibold cursor-pointer transition font-sans border border-gray-800"
              >
                {translateText("Cancel", "انصراف", lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTicket) {
                    onDeleteTicket(ticketToDelete);
                    if (selectedTicketId === ticketToDelete) {
                      setSelectedTicketId(null);
                    }
                  }
                  setTicketToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 font-sans shadow-lg shadow-red-600/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {translateText("Yes, Delete", "بله، حذف شود", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
