import React, { useState, useEffect } from "react";
import { Cpu, HardDrive, LayoutPanelLeft } from "lucide-react";
import { Language, translations } from "../lang/locales";

interface ResourceStat {
  usage: number;
  total?: string;
  used?: string;
}

interface SystemStatus {
  cpu: ResourceStat;
  memory: ResourceStat;
  disk: ResourceStat;
  uptime: string;
}

export default function SystemResourceMonitor({ lang }: { lang: Language }) {
  const [status, setStatus] = useState<SystemStatus>({
    cpu: { usage: 0 },
    memory: { usage: 0, total: "0GB", used: "0GB" },
    disk: { usage: 0, total: "0GB", used: "0GB" },
    uptime: "0h 0m"
  });

  const t = { ...translations.en, ...translations[lang] };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        // Mock data if API fails or for dev
        setStatus(prev => ({
          ...prev,
          cpu: { usage: Math.floor(Math.random() * 30) + 10 },
          memory: { usage: 45, total: "16GB", used: "7.2GB" },
          disk: { usage: 62, total: "500GB", used: "310GB" }
        }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const CircularProgress = ({ value, label, icon: Icon, colorClass, subtext }: { 
    value: number, 
    label: string, 
    icon: any, 
    colorClass: string,
    subtext?: string 
  }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${colorClass} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <Icon className={`w-5 h-5 mb-1 ${colorClass.replace("stroke-", "text-")}`} />
            <span className="text-lg font-bold text-gray-800">{value}%</span>
          </div>
        </div>
        <h3 className="mt-4 font-medium text-gray-700">{label}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    );
  };

  return (
    <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 p-2 rounded-lg flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] sm:text-xs font-mono">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-white text-[8px] leading-none mb-1">CPU LOAD</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                style={{ width: `${status.cpu.usage}%` }}
              />
            </div>
            <span className="text-blue-400 font-bold min-w-[30px] tabular-nums">
              {status.cpu.usage}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 border-l border-gray-800 pl-8">
        <div className="flex flex-col">
          <span className="text-white text-[8px] leading-none mb-1">MEMORY</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000"
                style={{ width: `${status.memory.usage}%` }}
              />
            </div>
            <span className="text-purple-400 font-bold min-w-[30px] tabular-nums">
              {status.memory.usage}%
            </span>
            <span className="text-[9px] text-gray-600 hidden sm:inline">
              [{status.memory.used}/{status.memory.total}]
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-l border-gray-800 pl-8">
        <div className="flex flex-col">
          <span className="text-white text-[8px] leading-none mb-1">STORAGE</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-1000"
                style={{ width: `${status.disk.usage}%` }}
              />
            </div>
            <span className="text-amber-400 font-bold min-w-[30px] tabular-nums">
              {status.disk.usage}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col border-l border-gray-800 pl-8 ml-auto hidden md:flex">
        <span className="text-white text-[8px] leading-none mb-1 text-right">UPTIME</span>
        <span className="text-emerald-400 font-bold tabular-nums text-right shadow-text-[0_0_5px_rgba(52,211,153,0.3)]">
          {status.uptime}
        </span>
      </div>
    </div>
  );
}
