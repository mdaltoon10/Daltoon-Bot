import React, { useState, useEffect } from "react";
import { Activity, Server, BarChart3, Eye, EyeOff, Globe } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Language, translations, translateText } from "../lang/locales";
import SystemResourceMonitor from "./SystemResourceMonitor";
import BotLogs from "./BotLogs";
import { BotActionLog, PanelSettings } from "../types";

interface MonitoringDashboardProps {
  lang: Language;
  botLogs: BotActionLog[];
  settings?: PanelSettings;
}

export default function MonitoringDashboard({ lang, botLogs, settings }: MonitoringDashboardProps) {
  const t = { ...translations.en, ...translations[lang] };

  const [showIp, setShowIp] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{ publicIp: string, ipv4: string, ipv6: string, activityData: number[], uptime: number, load: number[] } | null>(null);

  useEffect(() => {
    fetch("/api/system/info")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSystemInfo(data);
      })
      .catch(err => console.warn("Failed to fetch system info", err));
  }, []);

  const chartData = systemInfo?.activityData.map((val, i) => ({ name: i, value: val })) || 
                   Array.from({ length: 20 }, (_, i) => ({ name: i, value: Math.floor(Math.random() * 50) + 20 }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10" id="monitoring-dashboard-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wide">
              {translateText("System Monitoring", "مانیتورینگ سیستم", lang)}
            </h1>
            <p className="text-sm text-gray-400">
              {translateText("Real-time system resource usage and bot logs", "وضعیت لحظه‌ای منابع سرور و لاگ‌های ربات", lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Resource Monitor - Full Width */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              {translateText("Resource Usage", "مصرف منابع سرور", lang)}
            </h2>
          </div>
        </div>
        <div className="relative z-10">
          <SystemResourceMonitor lang={lang} />
        </div>
      </div>

      {/* Activity & System IP Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Charts Section - Real Activity Visualizer */}
        <div className="md:col-span-2 bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col h-[180px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-200 text-sm">
                {translateText("Activity Chart", "نمودار فعالیت", lang)}
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono mt-0.5">
                {translateText("System Load: ", "بار سیستم: ", lang)}
                {systemInfo?.load?.[0] !== undefined ? systemInfo.load[0].toFixed(2) : "0.00"}
              </span>
            </div>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 w-full -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IP Addresses Card */}
        <div className="md:col-span-1 bg-black/30 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-bold text-gray-200 text-sm">IP Addresses</h3>
            <button 
              onClick={() => setShowIp(!showIp)}
              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
              title="Toggle visibility of the IP"
            >
              {showIp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">IPv4</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className={`text-sm font-mono font-medium transition-all duration-300 ${showIp ? "text-gray-200" : "text-transparent bg-white/10 blur-[4px] select-none rounded px-1"}`}>
                  {systemInfo?.ipv4 || "127.0.0.1"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">IPv6</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className={`text-sm font-mono font-medium transition-all duration-300 ${showIp ? "text-gray-200" : "text-transparent bg-white/10 blur-[4px] select-none rounded px-1"}`}>
                  {systemInfo?.ipv6 || "::1"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Logs - Full Width */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-6 overflow-hidden">
        <BotLogs logs={botLogs} lang={lang} settings={settings} />
      </div>
    </div>
  );
}
