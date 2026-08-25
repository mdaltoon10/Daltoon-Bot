import React from "react";
import { ShoppingBag, HardDrive, Users, CreditCard, User, Headphones } from "lucide-react";

interface MiniAppBottomNavProps {
  activeTab: "plans" | "subs" | "wallet" | "colleagues" | "profile" | "support";
  setActiveTab: (tab: "plans" | "subs" | "wallet" | "colleagues" | "profile" | "support") => void;
}

export const MiniAppBottomNav: React.FC<MiniAppBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "plans" as const, label: "خرید پلن", icon: ShoppingBag },
    { id: "subs" as const, label: "سرویس\u200Cهای من", icon: HardDrive },
    { id: "colleagues" as const, label: "همکاران", icon: Users },
    { id: "wallet" as const, label: "کیف پول", icon: CreditCard },
    { id: "profile" as const, label: "پروفایل", icon: User },
    { id: "support" as const, label: "پشتیبانی", icon: Headphones },
  ];

  return (
    <nav
      id="miniapp-bottom-nav"
      className="shrink-0 w-full z-[99999] bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 py-2.5 px-2 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      style={{
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))"
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? "text-purple-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : "scale-100"}`} />
              <span className="text-[10px] mt-1 whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-1 bg-purple-500 rounded-full shadow-md shadow-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};