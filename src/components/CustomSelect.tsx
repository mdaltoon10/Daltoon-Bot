import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  title?: string;
  dir?: "rtl" | "ltr";
  size?: "compact" | "normal";
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  title,
  dir = "rtl",
  size = "normal",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isCompact = size === "compact";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      dir={dir}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 active:border-purple-500 rounded-xl transition-all text-white font-medium focus:outline-none ${
          isCompact
            ? "px-2.5 py-1.5 text-xs rounded-xl"
            : "px-3.5 py-2.5 text-xs rounded-2xl"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : title || "انتخاب کنید..."}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-purple-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-full min-w-[140px] bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-1.5 max-h-56 overflow-y-auto overscroll-contain backdrop-blur-xl ${
            dir === "rtl" ? "right-0" : "left-0"
          }`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-slate-500 text-center">
              موردی یافت نشد
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors text-right ${
                    isSelected
                      ? "bg-purple-600/20 text-purple-300 font-bold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  } ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mr-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
