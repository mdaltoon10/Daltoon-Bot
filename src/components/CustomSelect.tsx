import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, Search } from "lucide-react";

export interface CustomSelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  dir?: "rtl" | "ltr";
  size?: "compact" | "sm" | "md" | "lg";
  searchable?: boolean;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید...",
  title,
  className = "",
  disabled = false,
  dir = "rtl",
  size = "md",
  searchable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const showSearch = searchable !== undefined ? searchable : options.length > 7;

  const filteredOptions = searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(opt.value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Size specific styling for trigger button
  const getSizeClasses = () => {
    switch (size) {
      case "compact":
        return "px-1.5 py-0.5 text-[10px] rounded-lg";
      case "sm":
        return "px-2.5 py-1.5 text-xs rounded-xl";
      case "lg":
        return "px-4 py-3 text-sm rounded-2xl";
      case "md":
      default:
        return "px-3 py-2 text-xs rounded-xl";
    }
  };

  return (
    <div className={`relative inline-block w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`} dir={dir}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 bg-[#111827] border border-slate-700/80 hover:border-cyan-500/50 text-slate-100 font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer ${getSizeClasses()} ${className}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-cyan-400" : ""}`} />
      </button>

      {/* Modal / Portal Overlay Dropdown */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            dir={dir}
          >
            <div
              className="w-full max-w-sm sm:max-w-md bg-[#0d1322] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <span className="text-xs font-bold text-slate-200">
                    {title || placeholder || "انتخاب کنید"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search input if option count is large */}
              {showSearch && (
                <div className="p-2.5 border-b border-slate-800 bg-slate-950/50">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="جستجو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="p-2 overflow-y-auto space-y-1 max-h-[60vh] custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    موردی یافت نشد
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = String(opt.value) === String(value);
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mr-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
