import React from "react";
import { Language } from "../locales";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Language;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel, 
  lang,
  confirmText,
  cancelText,
  isDangerous = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900/80 border border-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm space-y-4">
        <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
          >
            {cancelText ? cancelText : (lang === "fa" ? "انصراف" : "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 backdrop-blur-md rounded-xl text-sm font-medium transition-all duration-200 ${
              isDangerous 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
            }`}
          >
            {confirmText ? confirmText : (lang === "fa" ? "بله، تأیید" : "Yes, Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
