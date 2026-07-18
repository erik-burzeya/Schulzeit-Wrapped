import React, { useState, useEffect } from "react";
import { Check, Plus, Trash2, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { ReportCardData, SubjectGrade } from "../types";
import { LOCALES } from "../locales";

interface ConfirmationScreenProps {
  lang: "de" | "en";
  setLang: (lang: "de" | "en") => void;
  initialData: ReportCardData;
  onConfirm: (finalData: ReportCardData) => void;
  onOpenInfo: () => void;
}

export default function ConfirmationScreen({ lang, setLang, initialData, onConfirm, onOpenInfo }: ConfirmationScreenProps) {
  const [data, setData] = useState<ReportCardData>({ ...initialData });

  const t = LOCALES[lang];

  // Deep copy subjects to avoid mutating initialData
  useEffect(() => {
    setData({
      ...initialData,
      subjects: initialData.subjects.map(s => ({ ...s }))
    });
  }, [initialData]);

  const handleSubjectChange = (id: string, field: "subject" | "grade", value: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === id) {
          return { ...s, [field]: value, confirmed: false }; // Reset confirmed if user edits
        }
        return s;
      })
    }));
  };

  const handleToggleConfirmSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === id) {
          return { ...s, confirmed: !s.confirmed };
        }
        return s;
      })
    }));
  };

  const handleDeleteSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  const handleAddSubject = () => {
    const newSubject: SubjectGrade = {
      id: Math.random().toString(36).substring(2, 9),
      subject: "",
      grade: "",
      confirmed: false
    };
    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }));
  };

  const handleAbsenceChange = (
    field: "absentDaysExcused" | "absentDaysUnexcused" | "absentLessonsExcused" | "absentLessonsUnexcused",
    value: string
  ) => {
    let confirmField: keyof ReportCardData;
    if (field === "absentDaysExcused") confirmField = "absentDaysExcusedConfirmed";
    else if (field === "absentDaysUnexcused") confirmField = "absentDaysUnexcusedConfirmed";
    else if (field === "absentLessonsExcused") confirmField = "absentLessonsExcusedConfirmed";
    else confirmField = "absentLessonsUnexcusedConfirmed";

    setData(prev => ({
      ...prev,
      [field]: value,
      [confirmField]: false // Reset confirmed if edited
    }));
  };

  const handleToggleConfirmAbsence = (
    field: "absentDaysExcused" | "absentDaysUnexcused" | "absentLessonsExcused" | "absentLessonsUnexcused"
  ) => {
    let confirmField: keyof ReportCardData;
    if (field === "absentDaysExcused") confirmField = "absentDaysExcusedConfirmed";
    else if (field === "absentDaysUnexcused") confirmField = "absentDaysUnexcusedConfirmed";
    else if (field === "absentLessonsExcused") confirmField = "absentLessonsExcusedConfirmed";
    else confirmField = "absentLessonsUnexcusedConfirmed";

    setData(prev => ({
      ...prev,
      [confirmField]: !prev[confirmField]
    }));
  };

  const handleConfirmAll = () => {
    setData(prev => ({
      ...prev,
      absentDaysExcusedConfirmed: true,
      absentDaysUnexcusedConfirmed: true,
      absentLessonsExcusedConfirmed: true,
      absentLessonsUnexcusedConfirmed: true,
      subjects: prev.subjects.map(s => ({ ...s, confirmed: true }))
    }));
  };

  // Validation logic
  const totalSubjects = data.subjects.length;
  const confirmedSubjects = data.subjects.filter(s => s.confirmed).length;
  const absencesConfirmed =
    data.absentDaysExcusedConfirmed &&
    data.absentDaysUnexcusedConfirmed &&
    data.absentLessonsExcusedConfirmed &&
    data.absentLessonsUnexcusedConfirmed;
  const allSubjectsConfirmed = confirmedSubjects === totalSubjects;
  const canProceed = absencesConfirmed && allSubjectsConfirmed;

  const totalFieldsToConfirm = totalSubjects + 4; // subjects + 2 days fields + 2 lessons fields
  const confirmedFieldsCount =
    confirmedSubjects +
    (data.absentDaysExcusedConfirmed ? 1 : 0) +
    (data.absentDaysUnexcusedConfirmed ? 1 : 0) +
    (data.absentLessonsExcusedConfirmed ? 1 : 0) +
    (data.absentLessonsUnexcusedConfirmed ? 1 : 0);

  const handleSubmit = () => {
    if (canProceed) {
      onConfirm(data);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[85vh] text-white p-6 relative">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 uppercase">
              {t.step_indicator}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switch pill */}
            <div className="flex bg-slate-950/60 p-0.5 rounded-full border border-slate-800/80">
              <button
                type="button"
                onClick={() => setLang("de")}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all cursor-pointer ${
                  lang === "de"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onOpenInfo}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/40 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={t.privacy_info}
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        <h2 className="font-sans font-black text-2xl leading-tight mb-2 tracking-tight">
          {t.check_confirm_title} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">
            {t.check_confirm_subtitle}
          </span>
        </h2>
        <p className="text-xs text-slate-400 leading-normal mb-6">
          {t.check_confirm_desc}
        </p>

        {/* Bulk action */}
        <div className="flex justify-between items-center bg-slate-800/30 border border-slate-700/50 rounded-2xl p-3 mb-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400 uppercase">{t.progress}</span>
            <span className="text-xs font-bold text-slate-200">
              {t.confirmed_out_of.replace("{n}", String(confirmedFieldsCount)).replace("{total}", String(totalFieldsToConfirm))}
            </span>
          </div>
          <button
            onClick={handleConfirmAll}
            className="text-xs py-2 px-3.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl font-semibold transition-all cursor-pointer"
          >
            {t.confirm_all_btn}
          </button>
        </div>

        {/* Section: Absences (Days) */}
        <div className="mb-5">
          <h3 className="text-xs font-mono text-slate-400 mb-2.5 uppercase tracking-wider">
            {t.section_absences_days}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Excused Absences (Days) */}
            <div className={`p-3 rounded-2xl border transition-all ${
              data.absentDaysExcusedConfirmed
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-slate-800/40 border-slate-700"
            }`}>
              <div className="flex justify-between items-start mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">{t.excused}</label>
                <button
                  onClick={() => handleToggleConfirmAbsence("absentDaysExcused")}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    data.absentDaysExcusedConfirmed
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>
              <input
                type="text"
                value={data.absentDaysExcused}
                onChange={(e) => handleAbsenceChange("absentDaysExcused", e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-1.5 px-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Unexcused Absences (Days) */}
            <div className={`p-3 rounded-2xl border transition-all ${
              data.absentDaysUnexcusedConfirmed
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-slate-800/40 border-slate-700"
            }`}>
              <div className="flex justify-between items-start mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">{t.unexcused}</label>
                <button
                  onClick={() => handleToggleConfirmAbsence("absentDaysUnexcused")}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    data.absentDaysUnexcusedConfirmed
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>
              <input
                type="text"
                value={data.absentDaysUnexcused}
                onChange={(e) => handleAbsenceChange("absentDaysUnexcused", e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-1.5 px-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Absences (Lessons/Hours) */}
        <div className="mb-6">
          <h3 className="text-xs font-mono text-slate-400 mb-2.5 uppercase tracking-wider">
            {t.section_absences_lessons}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Excused Absences (Lessons) */}
            <div className={`p-3 rounded-2xl border transition-all ${
              data.absentLessonsExcusedConfirmed
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-slate-800/40 border-slate-700"
            }`}>
              <div className="flex justify-between items-start mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">{t.excused}</label>
                <button
                  onClick={() => handleToggleConfirmAbsence("absentLessonsExcused")}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    data.absentLessonsExcusedConfirmed
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>
              <input
                type="text"
                value={data.absentLessonsExcused}
                onChange={(e) => handleAbsenceChange("absentLessonsExcused", e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-1.5 px-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Unexcused Absences (Lessons) */}
            <div className={`p-3 rounded-2xl border transition-all ${
              data.absentLessonsUnexcusedConfirmed
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-slate-800/40 border-slate-700"
            }`}>
              <div className="flex justify-between items-start mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">{t.unexcused}</label>
                <button
                  onClick={() => handleToggleConfirmAbsence("absentLessonsUnexcused")}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    data.absentLessonsUnexcusedConfirmed
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>
              <input
                type="text"
                value={data.absentLessonsUnexcused}
                onChange={(e) => handleAbsenceChange("absentLessonsUnexcused", e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-1.5 px-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Subjects */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {t.subjects_grades}
            </h3>
            <button
              onClick={handleAddSubject}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> {t.add_subject}
            </button>
          </div>

          <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
            {data.subjects.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                {t.empty_subjects}
              </div>
            ) : (
              data.subjects.map((s) => (
                <div
                  key={s.id}
                  className={`flex gap-2 items-center p-2 rounded-2xl border transition-all ${
                    s.confirmed
                      ? "bg-emerald-950/10 border-emerald-500/20"
                      : "bg-slate-800/20 border-slate-800"
                  }`}
                >
                  <input
                    type="text"
                    value={s.subject}
                    onChange={(e) => handleSubjectChange(s.id, "subject", e.target.value)}
                    placeholder={t.placeholder_subject}
                    className="flex-1 bg-slate-950/30 border border-slate-850 rounded-xl py-2 px-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={s.grade}
                    onChange={(e) => handleSubjectChange(s.id, "grade", e.target.value)}
                    placeholder={t.placeholder_grade}
                    className="w-14 text-center bg-slate-950/30 border border-slate-850 rounded-xl py-2 px-1 text-xs font-bold text-indigo-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleConfirmSubject(s.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        s.confirmed
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title={s.confirmed ? (lang === "en" ? "Confirmed" : "Bestätigt") : (lang === "en" ? "Confirm" : "Bestätigen")}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-xl bg-slate-800/30 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={lang === "en" ? "Delete" : "Löschen"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800/60">
        {!canProceed && (
          <div className="mb-4 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 p-3 rounded-2xl">
            <AlertCircle size={16} className="text-pink-400 shrink-0" />
            <p className="text-[11px] text-pink-300 leading-normal">
              {t.confirm_alert}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          className={`w-full py-4 px-4 rounded-2xl font-bold transition-all text-center text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
            canProceed
              ? "bg-gradient-to-r from-pink-500 via-indigo-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-indigo-600/20"
              : "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow-none"
          }`}
        >
          <Sparkles size={16} className={canProceed ? "animate-pulse" : ""} />
          {t.generate_btn}
        </button>
      </div>
    </div>
  );
}
