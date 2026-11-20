import { translateText, Language } from "../lang/locales"; 
import React, { useState, useMemo } from "react";
import { BotActionLog, PanelSettings } from "../types";
import { Clock, Search, Filter, X, FileText } from "lucide-react";

import { formatDateTime } from "../utils/dateTimeUtils";

interface Props {
  logs: BotActionLog[];
  lang: Language;
  settings?: PanelSettings;
}

type TimeFilterOption = "all" | "1d" | "2d" | "1w" | "1m";

export default function BotLogs({ logs, lang, settings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("all");

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const filterTimes: Record<string, number> = {
      "1d": 24 * 60 * 60 * 1000,
      "2d": 2 * 24 * 60 * 60 * 1000,
      "1w": 7 * 24 * 60 * 60 * 1000,
      "1m": 30 * 24 * 60 * 60 * 1000,
    };

    return sortedLogs.filter((log) => {
      // Time filter
      if (timeFilter !== "all" && filterTimes[timeFilter]) {
        const logTime = new Date(log.date).getTime();
        const cutoff = now - filterTimes[timeFilter];
        if (isNaN(logTime) || logTime < cutoff) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAction = log.action?.toLowerCase().includes(q);
        const matchUser = log.username?.toLowerCase().includes(q);
        const matchUserId = log.userId?.toString().includes(q);
        const matchDetails = log.details?.toLowerCase().includes(q);
        if (!matchAction && !matchUser && !matchUserId && !matchDetails) {
          return false;
        }
      }

      return true;
    });
  }, [sortedLogs, timeFilter, searchQuery]);

  const timeFilterLabels: { id: TimeFilterOption; labelFa: string; labelEn: string }[] = [
    { id: "all", labelFa: "همه", labelEn: "All" },
    { id: "1d", labelFa: "یک روز گذشته", labelEn: "Past 1 Day" },
    { id: "2d", labelFa: "دو روز گذشته", labelEn: "Past 2 Days" },
    { id: "1w", labelFa: "یک هفته گذشته", labelEn: "Past 1 Week" },
    { id: "1m", labelFa: "یک ماه گذشته", labelEn: "Past 1 Month" },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-wide">
            {translateText("Bot Logs", "وضعیت ربات (لاگ‌ها)", lang)}
          </h2>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-bold">
            {filteredLogs.length}
          </span>
        </div>
      </div>

      {/* Controls: Search bar & Time filter pills */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translateText("Search in action, username, ID, details...", "جستجو در اکشن، نام‌کاربری، شناسه یا جزئیات...", lang)}
            className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
              title="پاک کردن"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Time Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0 hidden sm:inline-block" />
          {timeFilterLabels.map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFilter(item.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                timeFilter === item.id
                  ? "bg-indigo-600/80 text-white border-indigo-400/50 shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5 hover:border-white/10"
              }`}
            >
              {translateText(item.labelEn, item.labelFa, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Logs list */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400 font-medium">
            {searchQuery || timeFilter !== "all"
              ? translateText("No logs match the current search or filter criteria.", "هیچ لاگی با فیلتر یا جستجوی فعلی یافت نشد.", lang)
              : translateText("No logs available.", "هیچ فعالیتی ثبت نشده است.", lang)}
          </p>
          {(searchQuery || timeFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTimeFilter("all");
              }}
              className="mt-3 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs rounded-lg border border-indigo-500/30 transition cursor-pointer"
            >
              {translateText("Reset filters", "حذف فیلترها", lang)}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-800/80 rounded-xl p-4 border border-white/10 shadow-lg hover:border-indigo-500/50 transition group"
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs font-mono font-bold border border-indigo-500/30">
                    {log.action}
                  </span>
                  {log.username && (
                    <span className="text-xs font-bold text-white">
                      @{log.username}
                    </span>
                  )}
                  {log.userId && (
                    <span className="text-xs font-mono text-gray-400">
                      ({log.userId})
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {formatDateTime(log.date, { timeZone: settings?.timeZone, calendarSystem: settings?.calendarSystem, includeTime: true })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 pr-2 border-r-2 border-indigo-500/30 leading-relaxed break-words">
                {log.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
