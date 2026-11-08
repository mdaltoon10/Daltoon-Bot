import React, { useState, useEffect } from "react";
import { Cpu, Server, HardDrive, Repeat, Clock, Activity } from "lucide-react";
import { Language, translations } from "../lang/locales";

interface ResourceStat {
  usage: number;
  total?: string;
  used?: string;
  cores?: number;
  speed?: number;
  model?: string;
}

interface SystemStatus {
  cpu: ResourceStat;
  memory: ResourceStat;
  swap?: ResourceStat;
  disk: ResourceStat;
  uptime: string;
}

export default function SystemResourceMonitor({ lang }: { lang: Language }) {
  const [status, setStatus] = useState<SystemStatus>({
    cpu: { usage: 22.6, cores: 2, speed: 2390 },
    memory: { usage: 15.0, total: "3.73 GB", used: "574.11 MB" },
    swap: { usage: 0.0, total: "1022.98 MB", used: "0 B" },
    disk: { usage: 8.6, total: "50 GB", used: "4.3 GB" },
    uptime: "2d 14h 5m"
  });

  // History arrays for sparkline graphs
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 14, 15, 13, 16, 18, 15, 20, 22.6]);
  const [ramHistory, setRamHistory] = useState<number[]>([14, 14.5, 14.8, 15, 15.2, 15.1, 14.9, 15.0]);
  const [swapHistory, setSwapHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [diskHistory, setDiskHistory] = useState<number[]>([8.5, 8.5, 8.6, 8.6, 8.6, 8.6, 8.6]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);

          const cpuVal = typeof data.cpu?.usage === "number" ? data.cpu.usage : 0;
          const ramVal = typeof data.memory?.usage === "number" ? data.memory.usage : 0;
          const swapVal = typeof data.swap?.usage === "number" ? data.swap.usage : 0;
          const diskVal = typeof data.disk?.usage === "number" ? data.disk.usage : 0;

          setCpuHistory(prev => [...prev.slice(-14), cpuVal]);
          setRamHistory(prev => [...prev.slice(-14), ramVal]);
          setSwapHistory(prev => [...prev.slice(-14), swapVal]);
          setDiskHistory(prev => [...prev.slice(-14), diskVal]);
        }
      } catch (err) {
        // Fallback or dev simulation
        const fakeCpu = Math.floor(Math.random() * 15) + 12;
        setCpuHistory(prev => [...prev.slice(-14), fakeCpu]);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateSparklinePaths = (data: number[], width = 280, height = 40) => {
    if (!data || data.length === 0) return { line: "", area: "" };
    if (data.length === 1) {
      const y = height - (data[0] / 100) * (height - 10);
      return {
        line: `M 0,${y} L ${width},${y}`,
        area: `M 0,${y} L ${width},${y} L ${width},${height} L 0,${height} Z`
      };
    }

    const pts = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const clampedVal = Math.max(0, Math.min(100, val));
      const y = height - 4 - (clampedVal / 100) * (height - 10);
      return { x, y };
    });

    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx.toFixed(1)},${p0.y.toFixed(1)} ${mx.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }

    const area = `${d} L ${width},${height} L 0,${height} Z`;
    return { line: d, area };
  };

  const calcAvg = (history: number[], current: number) => {
    if (!history.length) return current.toFixed(1);
    const sum = history.reduce((a, b) => a + b, 0);
    return (sum / history.length).toFixed(history.some(n => n % 1 !== 0) ? 1 : 0);
  };

  const calcPeak = (history: number[], current: number) => {
    const max = Math.max(...history, current);
    return max.toFixed(max % 1 !== 0 ? 1 : 0);
  };

  const cards = [
    {
      id: "cpu",
      label: "CPU",
      icon: Cpu,
      value: status.cpu?.usage ?? 0,
      subtext: status.cpu?.cores 
        ? `${status.cpu.cores} Cores / ${status.cpu.cores}T · ${status.cpu.speed ? (status.cpu.speed / 1000).toFixed(2) + " GHz" : "2.39 GHz"}`
        : "2 Cores / 2T · 2.39 GHz",
      history: cpuHistory,
      color: "#3b82f6", // blue
      colorClass: "text-blue-400",
      gradId: "grad-cpu"
    },
    {
      id: "ram",
      label: "RAM",
      icon: Server,
      value: status.memory?.usage ?? 0,
      subtext: `${status.memory?.used || "574.11 MB"} / ${status.memory?.total || "3.73 GB"}`,
      history: ramHistory,
      color: "#a855f7", // purple
      colorClass: "text-purple-400",
      gradId: "grad-ram"
    },
    {
      id: "swap",
      label: "SWAP",
      icon: Repeat,
      value: status.swap?.usage ?? 0,
      subtext: `${status.swap?.used || "0 B"} / ${status.swap?.total || "1022.98 MB"}`,
      history: swapHistory,
      color: "#06b6d4", // cyan
      colorClass: "text-cyan-400",
      gradId: "grad-swap"
    },
    {
      id: "storage",
      label: "STORAGE",
      icon: HardDrive,
      value: status.disk?.usage ?? 0,
      subtext: `${status.disk?.used || "4.3 GB"} / ${status.disk?.total || "50 GB"}`,
      history: diskHistory,
      color: "#f59e0b", // amber
      colorClass: "text-amber-400",
      gradId: "grad-storage"
    }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top bar with server status & Uptime */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-gray-300">System Live Monitor</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>UPTIME: <strong className="text-emerald-400">{status.uptime || "0h 0m"}</strong></span>
        </div>
      </div>

      {/* Stacked X-UI style monitoring cards in a vertical column */}
      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const { line, area } = generateSparklinePaths(card.history, 280, 40);
          const avg = calcAvg(card.history, card.value);
          const peak = calcPeak(card.history, card.value);

          return (
            <div
              key={card.id}
              className="bg-[#121624]/90 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg transition-all duration-300 group"
            >
              {/* Header: Icon + Label */}
              <div className="flex items-center justify-between mb-2 z-10">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${card.colorClass}`} />
                  <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {card.label}
                  </span>
                </div>
              </div>

              {/* Main value */}
              <div className="my-1 z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
                    {typeof card.value === "number" ? card.value.toFixed(1) : card.value}
                  </span>
                  <span className="text-base font-medium text-gray-400">%</span>
                </div>
                <div className="text-xs text-gray-400/90 font-mono mt-1 truncate">
                  {card.subtext}
                </div>
              </div>

              {/* AVG & PEAK statistics */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400/80 mt-4 mb-2 z-10">
                <span>AVG {avg}%</span>
                <span>PEAK {peak}%</span>
              </div>

              {/* Bottom Sparkline Graph */}
              <div className="w-full h-10 mt-1 relative -mx-5 -mb-5 overflow-hidden">
                <svg
                  className="w-full h-full block"
                  viewBox="0 0 280 40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={card.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={area} fill={`url(#${card.gradId})`} />
                  <path
                    d={line}
                    fill="none"
                    stroke={card.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
