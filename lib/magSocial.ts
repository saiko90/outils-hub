// Publication automatique des articles du Mag sur Facebook (page Calorio) et Instagram (calorio_app),
// via l'API Graph de Meta. Logique pure ici (testable) ; les appels réseau sont dans app/api/mag-social.
import { MAG_ALL, MAG_ORIGIN, todayZurich, type MagArticle } from "./mag";

export const GRAPH = "https://graph.facebook.com/v26.0";

/** Articles dont la date de publication est `day` (AAAA-MM-JJ) et qui ont une légende. */
export function magForDay(day: string, all: MagArticle[] = MAG_ALL): MagArticle[] {
  return all.filter((a) => a.date === day && !!a.fr.social?.trim());
}

/** Heure (0-23) à Zurich. */
export function zurichHour(now = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", hour: "2-digit", hourCycle: "h23" }).format(now));
}

/** Le planificateur (UTC) appelle deux fois (été + hiver) : on ne publie qu'entre `hour` et `hour + 3` à Zurich. */
export function inWindow(hour: number, now = new Date()): boolean {
  const h = zurichHour(now);
  return h >= hour && h < hour + 3;
}

/** Première ligne non vide de la légende : sert à repérer une publication déjà faite (anti-doublon). */
export function captionKey(caption: string): string {
  return (caption.split("\n").find((l) => l.trim()) || "").trim();
}

/** Vrai si une des légendes existantes commence par la même première ligne. */
export function alreadyPosted(key: string, existing: (string | undefined | null)[]): boolean {
  if (!key) return false;
  return existing.some((m) => !!m && captionKey(m) === key);
}

/** Visuel PNG (Facebook) et JPEG (Instagram n'accepte que le JPEG). */
export function postImageUrls(a: MagArticle): { png: string; jpg: string } {
  const base = `${MAG_ORIGIN}/mag/${a.fr.slug}`;
  return { png: `${base}/image?lang=fr&format=post`, jpg: `${base}/post.jpg` };
}

export { todayZurich };
