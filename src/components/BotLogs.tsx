import { translateText, Language } from "../lang/locales"; 
import React from "react";
import { BotActionLog } from "../types";
import { Clock } from "lucide-react";

interface Props {
  logs: BotActionLog[];
  lang: Language;
}

export default function BotLogs({ logs, lang }: Props) {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex border-b border-white/10 pb-2 mb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">
          {translateText("Bot Logs", "وضعیت ربات (لاگ‌ها)", lang)}
        </h2>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400 font-medium">
            {translateText("No logs available.", "هیچ فعالیتی ثبت نشده است.", lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLogs.map((log) => (
            <div key={log.id} className="bg-slate-800/80 rounded-xl p-4 border border-white/10 shadow-lg hover:border-indigo-500/50 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
                    {log.action}
                  </span>
                  <span className="text-sm font-bold text-white">
                    @{log.username} ({log.userId})
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(log.date).toLocaleString(translateText("en-US", "fa-IR", lang))}
                </span>
              </div>
              <p className="text-sm text-gray-300 pr-2 border-r-2 border-indigo-500/30">
                {log.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
