export interface SubjectGrade {
  id: string; // unique ID for React lists and state management
  subject: string;
  grade: string;
  confirmed: boolean;
}

export interface ReportCardData {
  subjects: SubjectGrade[];
  absentDaysExcused: string;
  absentDaysExcusedConfirmed: boolean;
  absentDaysUnexcused: string;
  absentDaysUnexcusedConfirmed: boolean;
}

export interface BundeslandInfo {
  name: string;
  schoolDays: number;
}

// 16 German states with school days (190 days placeholder as requested)
export const BUNDESLAENDER: Record<string, BundeslandInfo> = {
  "BW": { name: "Baden-Württemberg", schoolDays: 190 },
  "BY": { name: "Bayern", schoolDays: 190 },
  "BE": { name: "Berlin", schoolDays: 190 },
  "BB": { name: "Brandenburg", schoolDays: 190 },
  "HB": { name: "Bremen", schoolDays: 190 },
  "HH": { name: "Hamburg", schoolDays: 190 },
  "HE": { name: "Hessen", schoolDays: 190 },
  "MV": { name: "Mecklenburg-Vorpommern", schoolDays: 190 },
  "NI": { name: "Niedersachsen", schoolDays: 190 },
  "NW": { name: "Nordrhein-Westfalen", schoolDays: 190 },
  "RP": { name: "Rheinland-Pfalz", schoolDays: 190 },
  "SL": { name: "Saarland", schoolDays: 190 },
  "SN": { name: "Sachsen", schoolDays: 190 },
  "ST": { name: "Sachsen-Anhalt", schoolDays: 190 },
  "SH": { name: "Schleswig-Holstein", schoolDays: 190 },
  "TH": { name: "Thüringen", schoolDays: 190 },
};

export type AppScreen = "start" | "loading" | "confirmation" | "story";
