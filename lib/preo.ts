// preo — cœur de calcul : délai de résiliation du contrat de travail (Suisse, CO art. 335b/335c).
// Règles légales par défaut (sauf accord écrit / CCT). Information générale — pas un conseil.

import { lastDayOfMonth } from "./resilio";

export type PreoInputs = {
  anneesService: number;   // années de service révolues
  tempsEssai: boolean;     // vrai si encore en temps d'essai
  dateConge: string;       // date à laquelle le congé est donné (YYYY-MM-DD)
};

export type PreoResult = {
  type: "essai" | "ordinaire";
  delaiMois: number;       // 0 en temps d'essai (délai en jours)
  delaiJours: number;      // 7 en temps d'essai, sinon 0
  finContrat: string;      // dernière date du contrat (YYYY-MM-DD)
  deadlineRecu: string;    // date limite à laquelle le congé doit être reçu (YYYY-MM-DD)
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };

/** Délai légal (mois) après le temps d'essai selon l'ancienneté (CO art. 335c). */
export function delaiLegalMois(anneesService: number): number {
  const a = Math.max(0, Math.floor(anneesService));
  if (a === 0) return 1;       // pendant la 1re année
  if (a <= 8) return 2;        // de la 2e à la 9e année
  return 3;                    // dès la 10e année
}

export function computePreo(inp: PreoInputs): PreoResult {
  const conge = parse(inp.dateConge);

  if (inp.tempsEssai) {
    // 7 jours, pour la fin d'un jour quelconque
    const fin = new Date(conge.getTime() + 7 * 86400000);
    return { type: "essai", delaiMois: 0, delaiJours: 7, finContrat: iso(fin), deadlineRecu: inp.dateConge };
  }

  const n = delaiLegalMois(inp.anneesService);
  const y = conge.getUTCFullYear();
  const m = conge.getUTCMonth() + 1; // 1-12, mois où le congé est donné
  // fin du contrat = dernier jour du mois (mois du congé + n)
  const idxFin = y * 12 + (m - 1) + n;
  const finContrat = lastDayOfMonth(Math.floor(idxFin / 12), (idxFin % 12) + 1);
  // pour cette échéance, le congé doit être reçu au plus tard le dernier jour du mois du congé
  const deadline = lastDayOfMonth(y, m);
  return { type: "ordinaire", delaiMois: n, delaiJours: 0, finContrat: iso(finContrat), deadlineRecu: iso(deadline) };
}
