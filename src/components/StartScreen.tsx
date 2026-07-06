import React, { useState, useRef } from "react";
import { Upload, HelpCircle, FileText, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { BUNDESLAENDER } from "../types";

interface StartScreenProps {
  onStartExtraction: (base64Image: string, mimeType: string, stateCode: string) => void;
  onOpenInfo: () => void;
}

export default function StartScreen({ onStartExtraction, onOpenInfo }: StartScreenProps) {
  const [selectedState, setSelectedState] = useState<string>("NW"); // Default to Nordrhein-Westfalen
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Bitte lade ein gültiges Bild hoch (PNG, JPEG, WebP).");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const dataUrl = reader.result;
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          onStartExtraction(base64Data, mimeType, selectedState);
        } else {
          setErrorMsg("Fehler beim Verarbeiten des Bildes. Bitte versuche es erneut.");
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg("Fehler beim Lesen der Datei.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[85vh] text-white p-6 relative">
      {/* Background Decor */}
      <div className="absolute top-10 right-4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase">
              Jahresrückblick
            </span>
          </div>
          <button
            onClick={onOpenInfo}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/40 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Datenschutz anzeigen"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        <h1 className="font-sans font-black text-4xl leading-tight tracking-tight mb-3">
          Schulzeit <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-indigo-400 to-emerald-400">
            Wrapped
          </span>
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Dein persönlicher Jahresrückblick im Social-Story-Format. Lade dein Zeugnis hoch und entdecke deine Statistik auf einen Blick!
        </p>

        {/* Info Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl mb-8 flex gap-3 items-start">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300 leading-normal">
            <strong>Datenschutz garantiert:</strong> Dein Zeugnis-Bild wird nur zur Berechnung genutzt und nirgendwo dauerhaft gespeichert.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
            1. Wähle dein Bundesland
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/80 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none text-white cursor-pointer"
            >
              {Object.entries(BUNDESLAENDER).map(([code, info]) => (
                <option key={code} value={code} className="bg-slate-900 text-white">
                  {info.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
            2. Zeugnis hochladen
          </label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? "border-pink-500 bg-pink-500/10 scale-[0.99]"
                : "border-slate-700 hover:border-slate-600 bg-slate-800/20 hover:bg-slate-800/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
            />
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
              <Upload size={28} />
            </div>
            <p className="font-semibold text-sm mb-1 text-slate-200">
              Bild auswählen oder herbeiziehen
            </p>
            <p className="text-xs text-slate-500 leading-normal max-w-xs px-2">
              Fotografiere dein Zeugnis oder wähle eine Datei. Die Kamera deines Handys wird direkt unterstützt.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>Verarbeitung im RAM</span>
          <span>•</span>
          <button
            onClick={onOpenInfo}
            className="underline hover:text-slate-400 font-medium cursor-pointer bg-transparent border-none"
          >
            Datenschutz-Info
          </button>
        </p>
      </div>
    </div>
  );
}
