// calorio — « Duo » (binôme/couple). Helpers purs, partagés par l'API et testés.
// On ne partage jamais le journal brut d'un partenaire : uniquement un résumé du jour.
import { computeBesoins, type Profil } from "./calorio";

export type DuoSummary = {
  kcal: number; // calories consommées aujourd'hui
  cible: number | null; // objectif calorique (si profil exploitable)
  pct: number | null; // % de la cible
  streak: number; // série en cours (jours consécutifs notés)
  loggedToday: boolean; // a noté quelque chose aujourd'hui
};

type JLine = { food?: { kcal?: number }; grammes?: number };

/** Somme des calories d'une journée (lignes du journal). */
export function dayKcalFromRows(rows: unknown): number {
  if (!Array.isArray(rows)) return 0;
  let k = 0;
  for (const r of rows as JLine[]) {
    if (r && r.food && typeof r.food.kcal === "number" && typeof r.grammes === "number") k += (r.food.kcal * r.grammes) / 100;
  }
  return Math.round(k);
}

/** Cible calorique à partir d'un profil stocké (validé), sinon null. */
export function cibleFromProfil(p: unknown): number | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const okNum = (v: unknown) => typeof v === "number" && isFinite(v) && v > 0;
  if ((o.sexe !== "homme" && o.sexe !== "femme") || !okNum(o.age) || !okNum(o.poids) || !okNum(o.taille) || typeof o.activite !== "string" || typeof o.objectif !== "string") return null;
  try {
    const c = computeBesoins(o as unknown as Profil).cible;
    return isFinite(c) && c > 0 ? c : null;
  } catch { return null; }
}

/** Jours consécutifs notés en terminant aujourd'hui (ou hier si rien noté aujourd'hui). */
export function streakFromJournal(journal: Record<string, unknown[]> | null | undefined, todayISO: string): number {
  if (!journal) return 0;
  const has = (iso: string) => Array.isArray(journal[iso]) && (journal[iso] as unknown[]).length > 0;
  const base = new Date(todayISO + "T00:00:00Z");
  const start = has(todayISO) ? 0 : 1; // si rien aujourd'hui, la série peut tenir jusqu'à hier
  let n = 0;
  for (let i = start; i < 400; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    if (has(d.toISOString().slice(0, 10))) n++;
    else break;
  }
  return n;
}

/** Résumé quotidien partagé au binôme (aucune donnée brute). */
export function duoSummary(journal: Record<string, unknown[]> | null | undefined, profil: unknown, todayISO: string): DuoSummary {
  const rows = journal?.[todayISO];
  const kcal = dayKcalFromRows(rows);
  const cible = cibleFromProfil(profil);
  return {
    kcal,
    cible,
    pct: cible ? Math.round((kcal / cible) * 100) : null,
    streak: streakFromJournal(journal, todayISO),
    loggedToday: Array.isArray(rows) && (rows as unknown[]).length > 0,
  };
}
