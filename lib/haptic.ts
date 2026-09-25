// Retour haptique léger (mobile) — l'âme du « feel » natif de l'app.
// No-op silencieux si non supporté, ou si l'utilisateur préfère moins d'animations.
// Jamais bloquant, jamais d'erreur.
export function haptic(kind: "tap" | "success" | "warn" = "tap"): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const pattern = kind === "success" ? [11, 45, 20] : kind === "warn" ? [24] : 9;
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
