import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  BookOpen,
  Award,
  CalendarCheck,
  Percent,
  Clock,
  HelpCircle,
  Check
} from "lucide-react";
import { ReportCardData, BUNDESLAENDER } from "../types";

interface StoryCardsProps {
  data: ReportCardData;
  stateCode: string;
  onReset: () => void;
  onOpenInfo: () => void;
}

// Custom Counter component to animate hours or homework counts
function CountingNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end <= 0) {
      setCount(0);
      return;
    }

    const totalMs = duration * 1000;
    const stepTime = Math.max(Math.floor(totalMs / end), 8);
    const steps = totalMs / stepTime;
    const increment = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Function to rank school grades in Germany (lower score is better, e.g. 1 is best)
function parseGradeToScore(gradeStr: string): number {
  if (!gradeStr) return 7.0;
  const clean = gradeStr.trim().toLowerCase();

  // Check if it's the 15-to-0 points system (gymnasiale Oberstufe)
  const points = parseInt(clean, 10);
  if (!isNaN(points) && points >= 0 && points <= 15) {
    // Map 15 points to 0.7 (highest), 0 points to 6.0 (lowest)
    return (15 - points) * 0.35 + 0.7;
  }

  // Check traditional grades & decimals/modifiers
  if (clean.includes("1+") || clean === "sehr gut+") return 0.7;
  if (clean.includes("1-") || clean === "sehr gut-") return 1.3;
  if (clean.startsWith("1") || clean.includes("sehr gut")) return 1.0;

  if (clean.includes("2+") || clean === "gut+") return 1.7;
  if (clean.includes("2-") || clean === "gut-") return 2.3;
  if (clean.startsWith("2") || clean.includes("gut")) return 2.0;

  if (clean.includes("3+") || clean === "befriedigend+") return 2.7;
  if (clean.includes("3-") || clean === "befriedigend-") return 3.3;
  if (clean.startsWith("3") || clean.includes("befriedigend")) return 3.0;

  if (clean.includes("4+") || clean === "ausreichend+") return 3.7;
  if (clean.includes("4-") || clean === "ausreichend-") return 4.3;
  if (clean.startsWith("4") || clean.includes("ausreichend")) return 4.0;

  if (clean.includes("5+") || clean === "mangelhaft+") return 4.7;
  if (clean.includes("5-") || clean === "mangelhaft-") return 5.3;
  if (clean.startsWith("5") || clean.includes("mangelhaft")) return 5.0;

  if (clean.startsWith("6") || clean.includes("ungenügend")) return 6.0;

  // Non-graded subjects (e.g., 'teilgenommen', 'befreit', 'unleserlich')
  return 7.0;
}

export default function StoryCards({ data, stateCode, onReset, onOpenInfo }: StoryCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalCards = 5;

  // Retrieve school days based on chosen state (using 190 days placeholder)
  const stateInfo = BUNDESLAENDER[stateCode] || { name: "Nordrhein-Westfalen", schoolDays: 190 };
  const schoolDays = stateInfo.schoolDays;

  // Calculate statistics
  const absentExcused = parseInt(data.absentDaysExcused) || 0;
  const absentUnexcused = parseInt(data.absentDaysUnexcused) || 0;
  const totalAbsent = absentExcused + absentUnexcused;

  // Unterrichtsstunden = (Schultage - Fehltage gesamt) * 6
  const lessons = Math.max(0, (schoolDays - totalAbsent) * 6);

  // geschätzte Hausaufgaben = Schultage * 0,75
  const homework = Math.round(schoolDays * 0.75);

  // Anwesenheitsquote = ((Schultage - Fehltage gesamt) / Schultage) * 100
  const attendanceRate = Math.max(0, Math.min(100, Math.round(((schoolDays - totalAbsent) / schoolDays) * 1000) / 10));

  // Sort and extract top three subjects
  const rankedSubjects = data.subjects
    .map(s => ({ ...s, score: parseGradeToScore(s.grade) }))
    .filter(s => s.score < 7.0) // Skip ungraded or completely unreadable
    .sort((a, b) => a.score - b.score);

  const topThree = rankedSubjects.slice(0, 3);

  // Story Navigation
  const nextCard = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Export current card as PNG
  const saveAsImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      // Small timeout to allow state to settle
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#030712", // match dark body background
        style: {
          transform: "scale(1)",
          borderRadius: "0px", // remove card borders for full image look
        }
      });

      const link = document.createElement("a");
      link.download = `schulzeit-wrapped-card-${currentIndex + 1}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Fehler beim Erstellen des Bildes:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextCard();
      if (e.key === "ArrowLeft") prevCard();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Gradient selection for cards
  const gradients = [
    "from-violet-600 via-indigo-900 to-slate-950", // Card 1 (Hours)
    "from-amber-500 via-rose-700 to-slate-950",   // Card 2 (Homework)
    "from-teal-600 via-emerald-800 to-slate-950",  // Card 3 (Best Grades)
    "from-cyan-500 via-blue-800 to-slate-950",     // Card 4 (Attendance)
    "from-fuchsia-600 via-purple-950 to-slate-950" // Card 5 (Summary)
  ];

  const currentGradient = gradients[currentIndex];

  return (
    <div className="w-full max-w-md mx-auto h-[92vh] flex flex-col justify-between text-white relative select-none overflow-hidden rounded-3xl shadow-2xl border border-slate-800/80">
      
      {/* Top Header Indicators (Story progress indicators like Instagram) */}
      <div className="absolute top-0 inset-x-0 z-40 p-4 bg-gradient-to-b from-black/60 to-transparent flex flex-col gap-3">
        <div className="flex gap-1.5 w-full">
          {Array.from({ length: totalCards }).map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i < currentIndex
                    ? "w-full"
                    : i === currentIndex
                    ? "w-full animate-[pulse_1.5s_infinite]"
                    : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-300 tracking-widest uppercase">
              Schulzeit Wrapped
            </span>
            <span className="text-slate-500 text-[10px]">•</span>
            <span className="font-sans text-[10px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
              {stateInfo.name}
            </span>
          </div>
          <button
            onClick={onOpenInfo}
            className="p-1.5 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Screen Click-to-Navigate Overlays (Left 25% back, Right 75% forward) */}
      <div className="absolute inset-y-16 inset-x-0 z-20 flex">
        <div
          onClick={prevCard}
          className="w-1/4 h-full cursor-w-resize"
          title="Zurück"
        />
        <div
          onClick={nextCard}
          className="w-3/4 h-full cursor-e-resize"
          title="Weiter"
        />
      </div>

      {/* Immersive Fullscreen Story Card Body */}
      <div
        ref={cardRef}
        className={`w-full h-full flex flex-col justify-between p-6 pt-24 pb-20 bg-gradient-to-br ${currentGradient} transition-all duration-700 ease-out`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center text-center px-2"
          >
            {/* CARD 1: Lessons Hours Counter */}
            {currentIndex === 0 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-3xl bg-white/10 text-white mx-auto border border-white/20 shadow-lg">
                  <Clock size={36} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-violet-300 mb-2">
                    Dein Fleiß in Zahlen
                  </h3>
                  <h4 className="font-sans font-black text-2xl tracking-tight leading-tight text-white px-4">
                    Du hast dieses Jahr im Klassenzimmer geschwitzt:
                  </h4>
                </div>
                <div className="my-4">
                  <span className="font-sans font-black text-7xl md:text-8xl tracking-tighter text-white block">
                    <CountingNumber value={lessons} />
                  </span>
                  <span className="text-xl font-bold text-violet-200 mt-2 block">
                    Unterrichtsstunden
                  </span>
                </div>
                <p className="text-xs text-violet-200/80 max-w-xs mx-auto leading-relaxed">
                  (Basiert auf {schoolDays} Schultagen abzüglich deiner {totalAbsent} Fehltage, hochgerechnet mit 6 Stunden pro Tag.)
                </p>
              </div>
            )}

            {/* CARD 2: Estimated Homework */}
            {currentIndex === 1 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-3xl bg-white/10 text-white mx-auto border border-white/20 shadow-lg">
                  <BookOpen size={36} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-rose-300 mb-2">
                    Nachspielzeit
                  </h3>
                  <h4 className="font-sans font-black text-2xl tracking-tight leading-tight text-white">
                    Schätzungsweise hast du folgendes bewältigt:
                  </h4>
                </div>
                <div className="my-4">
                  <span className="font-sans font-black text-7xl md:text-8xl tracking-tighter text-white block">
                    ~<CountingNumber value={homework} />
                  </span>
                  <span className="text-xl font-bold text-rose-200 mt-2 block">
                    Hausaufgaben
                  </span>
                </div>
                <div className="inline-block bg-black/40 border border-white/10 rounded-2xl p-3 max-w-xs mx-auto">
                  <p className="text-[10px] font-mono tracking-wider text-rose-300 uppercase mb-1">
                    HINWEIS
                  </p>
                  <p className="text-[11px] text-rose-100 leading-normal">
                    hochgerechnete Schätzung, kein exakter Wert (Annahme: 0,75 Aufgaben pro Schultag).
                  </p>
                </div>
              </div>
            )}

            {/* CARD 3: Best Grades */}
            {currentIndex === 2 && (
              <div className="space-y-5">
                <div className="inline-flex p-4 rounded-3xl bg-white/10 text-white mx-auto border border-white/20 shadow-lg mb-2">
                  <Award size={36} />
                </div>
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-300 mb-1">
                    Deine Spitzenleistungen
                  </h3>
                  <h4 className="font-sans font-black text-2xl tracking-tight leading-tight text-white">
                    Die Hall of Fame deiner Noten:
                  </h4>
                </div>

                <div className="space-y-3 max-w-xs mx-auto mt-4">
                  {topThree.length === 0 ? (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-emerald-200">
                      Keine lesbaren Noten gefunden, um deine besten Fächer zu berechnen.
                    </div>
                  ) : (
                    topThree.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-sm shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm text-white text-left truncate max-w-[150px]">
                            {item.subject}
                          </span>
                        </div>
                        <span className="font-sans font-black text-lg bg-white text-slate-900 px-3 py-1 rounded-xl shadow">
                          {item.grade}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CARD 4: Attendance Rate Circular Progress */}
            {currentIndex === 3 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-3xl bg-white/10 text-white mx-auto border border-white/20 shadow-lg">
                  <CalendarCheck size={36} />
                </div>
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-300 mb-2">
                    Anwesenheit
                  </h3>
                  <h4 className="font-sans font-black text-2xl tracking-tight leading-tight text-white">
                    Deine Zuverlässigkeits-Quote:
                  </h4>
                </div>

                {/* Animated Circular Ring */}
                <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-white/10 fill-none"
                      strokeWidth="10"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-cyan-400 fill-none"
                      strokeWidth="10"
                      strokeDasharray={402} // 2 * pi * r (2 * 3.14159 * 64 = ~402)
                      initial={{ strokeDashoffset: 402 }}
                      animate={{ strokeDashoffset: 402 - (402 * attendanceRate) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-sans font-black text-3xl text-white">
                      {attendanceRate}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-cyan-200/80 max-w-xs mx-auto leading-relaxed">
                  Du hast an <strong>{schoolDays - totalAbsent}</strong> von <strong>{schoolDays}</strong> Tagen aktiv am Unterricht teilgenommen!
                  {totalAbsent > 0 && ` (${totalAbsent} Fehltage insgesamt)`}
                </p>
              </div>
            )}

            {/* CARD 5: Comprehensive Summary */}
            {currentIndex === 4 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-fuchsia-300 uppercase block mb-1">
                    Jahresrückblick
                  </span>
                  <h4 className="font-sans font-black text-2xl leading-none text-white tracking-tight">
                    Deine Schulzeit Wrapped
                  </h4>
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl text-left backdrop-blur-sm shadow">
                    <span className="text-[10px] font-mono text-fuchsia-200 uppercase block mb-1">Stunden</span>
                    <span className="font-sans font-black text-xl text-white block leading-tight">
                      {lessons.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-white/60 block mt-0.5">Klassenzimmer</span>
                  </div>

                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl text-left backdrop-blur-sm shadow">
                    <span className="text-[10px] font-mono text-fuchsia-200 uppercase block mb-1">Hausaufgaben</span>
                    <span className="font-sans font-black text-xl text-white block leading-tight">
                      ~{homework}
                    </span>
                    <span className="text-[9px] text-white/60 block mt-0.5">Schätzung</span>
                  </div>

                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl text-left backdrop-blur-sm shadow col-span-2">
                    <span className="text-[10px] font-mono text-fuchsia-200 uppercase block mb-1">Top Fächer</span>
                    <div className="flex gap-1.5 mt-1">
                      {topThree.length === 0 ? (
                        <span className="text-xs text-white/50">Keine Noten extrahiert</span>
                      ) : (
                        topThree.map((item, index) => (
                          <div key={item.id} className="flex-1 bg-black/30 px-2 py-1 rounded-lg flex justify-between items-center text-[10px] font-bold">
                            <span className="truncate max-w-[50px]">{item.subject}</span>
                            <span className="text-fuchsia-300 ml-1 shrink-0">{item.grade}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl text-left backdrop-blur-sm shadow col-span-2 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-fuchsia-200 uppercase block mb-0.5">Anwesenheit</span>
                      <span className="text-[11px] text-white/80 leading-tight">
                        {schoolDays - totalAbsent} von {schoolDays} Tagen da gewesen
                      </span>
                    </div>
                    <span className="font-sans font-black text-2xl text-fuchsia-300 ml-2">
                      {attendanceRate}%
                    </span>
                  </div>
                </div>

                {/* Helper buttons inside the printable area (only visible if not downloading, but we just let it be) */}
                <div className="pt-2 text-[10px] text-fuchsia-200/50 italic">
                  #SchulzeitWrapped {new Date().getFullYear()}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Bottom Action/Navigation bar (does not cover content) */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-center gap-3">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
            currentIndex === 0
              ? "text-white/20 border-white/5 bg-white/5 cursor-not-allowed"
              : "text-white border-white/15 bg-white/10 hover:bg-white/20"
          }`}
          title="Zurück"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Action Button depending on card (Export Image on final Card, Download helpers) */}
        {currentIndex === 4 ? (
          <button
            onClick={saveAsImage}
            disabled={downloading}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              downloadSuccess
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20 font-bold"
                : "bg-white text-slate-900 hover:bg-slate-100 shadow-white/10"
            }`}
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Speichert...
              </>
            ) : downloadSuccess ? (
              <>
                <Check size={14} className="stroke-[3]" />
                Gespeichert!
              </>
            ) : (
              <>
                <Download size={14} />
                Als Bild speichern
              </>
            )}
          </button>
        ) : (
          <button
            onClick={saveAsImage}
            disabled={downloading}
            className="flex items-center gap-1.5 py-3 px-3.5 rounded-2xl text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors cursor-pointer"
            title="Diese Karte als Bild exportieren"
          >
            <Download size={13} />
            Karte sichern
          </button>
        )}

        {currentIndex === 4 ? (
          <button
            onClick={onReset}
            className="p-3 text-white border border-white/15 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors cursor-pointer"
            title="Neues Zeugnis scannen"
          >
            <RotateCcw size={18} />
          </button>
        ) : (
          <button
            onClick={nextCard}
            disabled={currentIndex === totalCards - 1}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              currentIndex === totalCards - 1
                ? "text-white/20 border-white/5 bg-white/5 cursor-not-allowed"
                : "text-white border-white/15 bg-white/10 hover:bg-white/20"
            }`}
            title="Weiter"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
