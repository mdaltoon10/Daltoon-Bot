import React, { useState } from "react";
import { InboundInfo, Transaction } from "../types";
import { Language, translations } from "../locales";
import SystemResourceMonitor from "./SystemResourceMonitor";
import SystemHealthAssessment from "./SystemHealthAssessment";
import { 
  Activity, 
  Cpu, 
  Database, 
  Server, 
  CheckCircle, 
  ArrowUpRight, 
  ShieldAlert,
  DownloadCloud,
  UploadCloud,
  TrendingUp,
  Coins,
  Clock,
  Zap,
  CalendarDays,
  BarChart3,
  Send,
  Cloud,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip
} from "recharts";
import { useEffect } from "react";

interface DashboardOverviewProps {
  inbounds: InboundInfo[];
  toggleInbound: (id: number) => void;
  usersCount: number;
  activeSubsCount: number;
  totalIncome: number;
  pendingTransactionsCount: number;
  transactions: Transaction[];
  logs: any[];
  lang: Language;
  appVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  onOpenUpdatePanel: () => void;
}

export default function DashboardOverview({
  inbounds,
  toggleInbound,
  usersCount,
  activeSubsCount,
  totalIncome,
  pendingTransactionsCount,
  transactions,
  logs,
  lang,
  appVersion,
  latestVersion,
  updateAvailable,
  onOpenUpdatePanel
}: DashboardOverviewProps) {
  const t = translations[lang];
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
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

  // Live Advanced Financial Calculations
  const approvedTxs = (transactions || []).filter(tx => tx.status === "approved");

  const sumIncomeForHours = (hours: number) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return approvedTxs
      .filter(tx => {
        if (!tx.date) return false;
        const txTime = new Date(tx.date).getTime();
        return txTime >= cutoff;
      })
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  };

  const dailyIncome = sumIncomeForHours(24);
  const fortyEightHoursIncome = sumIncomeForHours(48);
  const seventyTwoHoursIncome = sumIncomeForHours(72);
  const weeklyIncome = sumIncomeForHours(24 * 7);
  const monthlyIncome = sumIncomeForHours(24 * 30);

  return (
    <div id="dashboard-tab" className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="stat-card-users" className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.metricTotalUsers}</span>
            <h3 className="text-2xl font-bold font-display mt-1">{usersCount}</h3>
            <span className="text-xs text-emerald-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> {t.activeEngagements}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div id="stat-card-subs" className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.metricActiveVpns}</span>
            <h3 className="text-2xl font-bold font-display mt-1 text-emerald-400">{activeSubsCount}</h3>
            <span className="text-xs text-emerald-400 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" /> {t.runningSmoothly}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div id="stat-card-revenue" className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.metricRevenue}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-bold font-display text-indigo-400">
                {totalIncome.toLocaleString()}
              </h3>
              <span className="text-xs text-gray-400">{lang === "fa" ? "تومان" : "Toman"}</span>
            </div>
            <span className="text-xs text-gray-500 flex items-center mt-1">
              {t.fromApproved}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#6366f1]/10 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div id="stat-card-receipts" className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.metricPendingApprovals}</span>
            <h3 className="text-2xl font-bold font-display mt-1 text-amber-500">{pendingTransactionsCount}</h3>
            <span className="text-xs text-amber-400 flex items-center mt-1 animate-pulse">
              {t.requiresAttention}
            </span>
          </div>
          <div className={`p-3 rounded-lg ${pendingTransactionsCount > 0 ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-gray-800 text-gray-500"}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daltoon Bot Card - Standalone Horizontal on Desktop */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-200">Daltoon Bot</h3>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  v{appVersion}
                </span>
                {updateAvailable && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 rounded-md bg-amber-500/10 border border-amber-500/20 animate-pulse whitespace-nowrap">
                    {lang === "fa" ? "نسخه جدید در دسترس است" : "New update available"}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {lang === "fa" ? "مدیریت، بررسی وضعیت و بروزرسانی ربات دالتون" : "Manage, monitor, and update Daltoon Bot"}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onOpenUpdatePanel}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all text-xs font-bold border ${
              updateAvailable 
                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse" 
                : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/5"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            {updateAvailable ? (lang === "fa" ? "بروزرسانی" : "Update") : (lang === "fa" ? "بروزرسانی" : "Update")}
          </button>
          <a 
            href="https://t.me/mDaltoon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            Telegram
          </a>
        </div>
      </div>

      {/* Cool Advanced Live Income Dashboard */}
      <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        {/* Glow indicator line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />
        
        {/* Background ambient radial aura */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              {lang === "fa" ? "گزارش زنده درآمدهای ربات دالتون" : "Daltoon Bot Live Treasury Analytics"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {lang === "fa" 
                ? "بررسی و پایش دقیق مالی در بازه‌های زمانی مختلف بر اساس تراکنش‌های تایید شده" 
                : "Real-time auditing of approved store transactions across custom temporal windows"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-semibold">
              {lang === "fa" ? "به‌روزرسانی آنی فعال" : "Live Synchronization Active"}
            </span>
          </div>
        </div>

        {/* 5-Column Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Daily (24h) */}
          <div className="group relative bg-[#1f2937]/20 hover:bg-[#1f2937]/35 border border-gray-800 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium font-sans">
                {lang === "fa" ? "۲۴ ساعت گذشته" : "Last 24 Hours"}
              </span>
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-[10px] font-bold">
                {lang === "fa" ? "امروز" : "Daily"}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  {dailyIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">{lang === "fa" ? "تومان" : "TOM"}</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-indigo-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (dailyIncome / totalIncome) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* 48 Hours */}
          <div className="group relative bg-[#1f2937]/20 hover:bg-[#1f2937]/35 border border-gray-800 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium font-sans">
                {lang === "fa" ? "۴۸ ساعت گذشته" : "Last 48 Hours"}
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                {lang === "fa" ? "۲ روز" : "48h"}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  {fortyEightHoursIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">{lang === "fa" ? "تومان" : "TOM"}</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (fortyEightHoursIncome / totalIncome) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* 72 Hours */}
          <div className="group relative bg-[#1f2937]/20 hover:bg-[#1f2937]/35 border border-gray-800 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium font-sans">
                {lang === "fa" ? "۷۲ ساعت گذشته" : "Last 72 Hours"}
              </span>
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 text-[10px] font-bold">
                {lang === "fa" ? "۳ روز" : "72h"}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  {seventyTwoHoursIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">{lang === "fa" ? "تومان" : "TOM"}</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (seventyTwoHoursIncome / totalIncome) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Weekly */}
          <div className="group relative bg-[#1f2937]/20 hover:bg-[#1f2937]/35 border border-gray-800 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium font-sans">
                {lang === "fa" ? "هفتگی (۷ روز اخیر)" : "Weekly (Last 7 Days)"}
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                {lang === "fa" ? "هفته" : "Weekly"}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  {weeklyIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">{lang === "fa" ? "تومان" : "TOM"}</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (weeklyIncome / totalIncome) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div className="group col-span-2 md:col-span-1 relative bg-[#1f2937]/20 hover:bg-[#1f2937]/35 border border-gray-800 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium font-sans">
                {lang === "fa" ? "ماهانه (۳۰ روز اخیر)" : "Monthly (Last 30 Days)"}
              </span>
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                {lang === "fa" ? "ماه" : "Monthly"}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  {monthlyIncome.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500">{lang === "fa" ? "تومان" : "TOM"}</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (monthlyIncome / totalIncome) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & System IP Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Charts Section - Real Activity Visualizer */}
        <div className="md:col-span-2 bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex flex-col h-[140px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-200 text-xs">{lang === "fa" ? "نمودار فعالیت" : "Activity Chart"}</h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                {lang === "fa" ? "بار سیستم: " : "Load: "} {systemInfo?.load[0].toFixed(2)}
              </span>
            </div>
            <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
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

        {/* IP Addresses Card - Screenshot style */}
        <div className="md:col-span-1 bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
            <h3 className="font-bold text-gray-200 text-sm">IP Addresses</h3>
            <button 
              onClick={() => setShowIp(!showIp)}
              className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-300 transition-colors"
              title="Toggle visibility of the IP"
            >
              {showIp ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">IPv4</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-mono font-medium transition-all duration-300 ${showIp ? "text-gray-200" : "text-transparent bg-gray-700/50 blur-[4px] select-none rounded px-1"}`}>
                  {systemInfo?.ipv4 || "127.0.0.1"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">IPv6</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-mono font-medium transition-all duration-300 ${showIp ? "text-gray-200" : "text-transparent bg-gray-700/50 blur-[4px] select-none rounded px-1"}`}>
                  {systemInfo?.ipv6 || "::1"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Backup and Restore */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-gray-200">{lang === "fa" ? "نسخه پشتیبان (بکاپ)" : "Database Backup & Restore"}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {lang === "fa" ? "برای انتقال به سرور جدید یا نگهداری ایمن اطلاعات، می‌توانید دستی فایل دیتابیس را دانلود کنید و یا یک بکاپ قدیمی را اینجا بارگذاری نمایید تا همه تنظیمات، پیام‌ها اکانت‌ها و... برگردد." : "Download a full database backup or restore from an existing one."}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                 window.open('/api/backup-download', '_blank');
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-3 rounded-lg border border-indigo-500/30 transition-all text-sm font-medium"
            >
              <DownloadCloud className="w-4 h-4" />
              {lang === "fa" ? "دریافت بکاپ" : "Download Backup"}
            </button>
            
            <label className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-lg border border-emerald-500/30 transition-all text-sm font-medium cursor-pointer">
              <UploadCloud className="w-4 h-4" />
              {lang === "fa" ? "بارگذاری" : "Restore"}
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                     const content = ev.target?.result;
                     if (typeof content === 'string') {
                            try {
                              const fb = await fetch("/api/backup-restore", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ backupData: content })
                              });
                              const rJson = await fb.json();
                              if (rJson.success) {
                                console.log(lang === "fa" ? "بکاپ با موفقیت بازگردانی شد. داشبورد تا ثانیه‌هایی دیگر بروز خواهد شد." : "Backup restored. Dashboard will be reloaded soon.");
                                setTimeout(() => window.location.reload(), 1500);
                              } else {
                                console.error(rJson.error || "Error restoring backup");
                              }
                            } catch(er: any) {
                              console.error(er.message);
                            }
                     }
                  }
                  reader.readAsText(file);
                }} 
              />
            </label>
          </div>
      </div>

      {/* Detailed System Health Evaluation Card */}
      <SystemHealthAssessment lang={lang} />

      {/* Compact System Resource Monitoring Bar */}
      <div className="pt-4 border-t border-[#1f2937]">
        <SystemResourceMonitor lang={lang} />
      </div>
    </div>
  );
}
