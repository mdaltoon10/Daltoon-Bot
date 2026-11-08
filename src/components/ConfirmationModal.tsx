import React from "react";
import { Language, translations } from "../lang/locales";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  lang: Language;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isAlert?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel, 
  lang,
  title,
  confirmText,
  cancelText,
  isDangerous = false,
  isAlert = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0b101d] border border-cyan-500/30 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-sm space-y-4 text-right">
        {title && (
          <h3 className="text-base font-bold text-cyan-400 border-b border-gray-800/80 pb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {title}
          </h3>
        )}
        <p className="text-gray-200 text-sm font-medium leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex gap-3 pt-2">
          {!isAlert && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/60 text-gray-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
            >
              {cancelText ? cancelText : (translations[lang]?.btnCancel || translations.en.btnCancel || "انصراف")}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              isDangerous 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {confirmText ? confirmText : (isAlert ? (lang === "fa" ? "متوجه شدم" : "OK") : (translations[lang]?.btnConfirm || translations.en.btnConfirm || "تایید"))}
          </button>
        </div>
      </div>
    </div>
  );
}
