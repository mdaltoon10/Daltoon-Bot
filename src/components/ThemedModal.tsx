import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface ThemedModalProps {
  isOpen: boolean;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const ThemedModal: React.FC<ThemedModalProps> = ({ isOpen, type, title, message, buttonText, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] top-0 left-0 w-full h-[100dvh] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl shadow-purple-950/60 text-center animate-fade-in my-auto">
        <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
          {type === "success" && (
            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-full h-full rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          {type === "error" && (
            <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 w-full h-full rounded-2xl flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          )}
          {type === "warning" && (
            <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 w-full h-full rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          )}
          {type === "info" && (
            <div className="bg-purple-500/20 text-purple-400 border border-purple-500/30 w-full h-full rounded-2xl flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h4 className="font-extrabold text-sm text-white">{title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
        >
          {buttonText || "متوجه شدم"}
        </button>
      </div>
    </div>
  );
};