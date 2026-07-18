import React, { useState, useEffect } from "react";
import StartScreen from "./components/StartScreen";
import ConfirmationScreen from "./components/ConfirmationScreen";
import StoryCards from "./components/StoryCards";
import InfoModal from "./components/InfoModal";
import { AppScreen, ReportCardData } from "./types";
import { Sparkles, HelpCircle, Loader2, AlertTriangle } from "lucide-react";
import { LOCALES } from "./locales";

export default function App() {
  const [lang, setLang] = useState<"de" | "en">("de");
  const [screen, setScreen] = useState<AppScreen>("start");
  const [selectedState, setSelectedState] = useState<string>("NW");
  const [reportCardData, setReportCardData] = useState<ReportCardData | null>(null);
  
  // Loading states
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const t = LOCALES[lang];
  const LOADING_MESSAGES = t.loading_messages;

  // Rotate loading messages during extraction
  useEffect(() => {
    let messageTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (screen === "loading") {
      setLoadingProgress(5);
      setLoadingMessageIndex(0);

      messageTimer = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);

      // Smooth progress bar simulation
      progressTimer = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev; // Hold at 90% until server responds
          return prev + Math.floor(Math.random() * 8) + 2;
        });
      }, 400);
    }

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, [screen, LOADING_MESSAGES]);

  // Call Express API to perform report card extraction using server-side Gemini 3.5 Flash
  const handleStartExtraction = async (base64Image: string, mimeType: string, stateCode: string) => {
    setSelectedState(stateCode);
    setScreen("loading");
    setErrorMsg(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || (lang === "en" ? "Extraction failed on server." : "Extraktionsfehler auf dem Server."));
      }

      const extracted = await response.json();

      // Formulate correct UI state structure
      const mappedSubjects = (extracted.subjects || []).map((s: any) => ({
        id: Math.random().toString(36).substring(2, 9),
        subject: s.subject || (lang === "en" ? "Unknown" : "Unbekannt"),
        grade: s.grade || "unleserlich",
        confirmed: false,
      }));

      const finalData: ReportCardData = {
        subjects: mappedSubjects,
        absentDaysExcused: extracted.absentDaysExcused || "0",
        absentDaysExcusedConfirmed: false,
        absentDaysUnexcused: extracted.absentDaysUnexcused || "0",
        absentDaysUnexcusedConfirmed: false,
        absentLessonsExcused: extracted.absentLessonsExcused || "0",
        absentLessonsExcusedConfirmed: false,
        absentLessonsUnexcused: extracted.absentLessonsUnexcused || "0",
        absentLessonsUnexcusedConfirmed: false,
      };

      setLoadingProgress(100);
      setTimeout(() => {
        setReportCardData(finalData);
        setScreen("confirmation");
      }, 500);

    } catch (err: any) {
      console.error("Extraction error in frontend:", err);
      setErrorMsg(err.message || t.api_offline_error);
      setScreen("start");
    }
  };

  const handleConfirmData = (confirmedData: ReportCardData) => {
    setReportCardData(confirmedData);
    setScreen("story");
  };

  const handleReset = () => {
    setReportCardData(null);
    setScreen("start");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col items-center justify-center relative overflow-x-hidden antialiased py-4 px-2">
      {/* Background ambient mesh gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-md bg-slate-900/40 border border-slate-900/80 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl relative min-h-[85vh] flex flex-col justify-center">
        
        {/* Render screens */}
        {screen === "start" && (
          <div className="py-2">
            {errorMsg && (
              <div className="max-w-xs mx-auto mb-4 bg-red-500/15 border border-red-500/25 text-red-200 text-xs p-3.5 rounded-2xl flex gap-2.5 items-start animate-pulse">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">{t.extraction_failed}</p>
                  <p className="text-red-300/90 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}
            <StartScreen
              lang={lang}
              setLang={setLang}
              onStartExtraction={handleStartExtraction}
              onOpenInfo={() => setIsInfoOpen(true)}
            />
          </div>
        )}

        {screen === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white min-h-[70vh]">
            {/* Pulsing glow ring loader */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="absolute inset-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-400 animate-spin flex items-center justify-center">
                <Loader2 size={32} className="text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-4 max-w-xs mx-auto">
              {/* Rotating funny school messages */}
              <h3 className="font-sans font-black text-xl tracking-tight leading-tight min-h-[3rem] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed">
                {t.loading_desc}
              </p>

              {/* Glowing horizontal progress bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/30 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                {loadingProgress}% {t.loading_progress}
              </span>
            </div>
          </div>
        )}

        {screen === "confirmation" && reportCardData && (
          <ConfirmationScreen
            lang={lang}
            setLang={setLang}
            initialData={reportCardData}
            onConfirm={handleConfirmData}
            onOpenInfo={() => setIsInfoOpen(true)}
          />
        )}

        {screen === "story" && reportCardData && (
          <StoryCards
            lang={lang}
            setLang={setLang}
            data={reportCardData}
            stateCode={selectedState}
            onReset={handleReset}
            onOpenInfo={() => setIsInfoOpen(true)}
          />
        )}
      </main>

      {/* Global Privacy Dialog Modal (re-accessible everywhere) */}
      <InfoModal lang={lang} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
