import React from "react";
import { X, ShieldCheck, EyeOff, Sparkles, RefreshCw } from "lucide-react";
import { LOCALES } from "../locales";

interface InfoModalProps {
  lang: "de" | "en";
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ lang, isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  const t = LOCALES[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
          aria-label={lang === "en" ? "Close" : "Schließen"}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg leading-tight">{t.privacy_modal_title}</h3>
            <p className="text-xs text-slate-400">{t.privacy_modal_subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            {t.privacy_modal_desc}
          </p>

          <div className="flex gap-3 items-start bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
            <EyeOff size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">{t.privacy_card1_title}</p>
              <p className="text-xs text-slate-400 leading-normal">
                {t.privacy_card1_desc}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
            <RefreshCw size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">{t.privacy_card2_title}</p>
              <p className="text-xs text-slate-400 leading-normal">
                {t.privacy_card2_desc}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
            <Sparkles size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">{t.privacy_card3_title}</p>
              <p className="text-xs text-slate-400 leading-normal">
                {t.privacy_card3_desc}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-600/20 text-center text-sm"
        >
          {t.privacy_close_btn}
        </button>
      </div>
    </div>
  );
}
