// calorio — détecte les aliments et recettes cités par Vito dans une réponse,
// pour proposer « Ajouter au journal » en un tap. Fonctions pures (testées).
import { ALIMENTS, RECETTES } from "./calorio";

export type Detected = { kind: "food" | "recette"; id: string; label: string; emoji: string };

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Noms trop courts/génériques à ignorer (évite les faux positifs comme « eau », « ail »).
const MIN_LEN = 4;

/**
 * Repère, dans un texte, les aliments/recettes connus qui y sont cités.
 * Priorité aux recettes (plus spécifiques), puis aux aliments. Dédupliqué, borné.
 */
export function detectFoods(text: string, lang: "fr" | "de" | "en", max = 4): Detected[] {
  if (!text) return [];
  const hay = " " + norm(text) + " ";
  const out: Detected[] = [];
  const seenLabels = new Set<string>();

  const tryMatch = (name: string, kind: "food" | "recette", id: string, emoji: string) => {
    if (out.length >= max) return;
    const n = norm(name);
    if (n.length < MIN_LEN) return;
    if (seenLabels.has(n)) return;
    // match sur limite de mot (évite « thon » dans « python »)
    const re = new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
    if (re.test(hay)) { out.push({ kind, id, label: name, emoji }); seenLabels.add(n); }
  };

  // recettes d'abord (les noms les plus longs en premier pour préférer le plus spécifique)
  [...RECETTES].sort((a, b) => b.nom[lang].length - a.nom[lang].length).forEach((r) => tryMatch(r.nom[lang], "recette", r.id, r.emoji));
  [...ALIMENTS].sort((a, b) => b.nom[lang].length - a.nom[lang].length).forEach((a) => tryMatch(a.nom[lang], "food", a.id, a.emoji));

  return out.slice(0, max);
}
