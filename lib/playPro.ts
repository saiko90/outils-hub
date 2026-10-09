// Écrit le statut Pro « Google Play » d'un compte (colonnes play_* de calorio_pro, service_role uniquement).
import { SB_URL, svcHeaders } from "@/lib/serverAuth";
import type { PlaySub } from "@/lib/googlePlay";

/** Compte qui détient déjà ce jeton d'achat (null si aucun). */
export async function ownerOfToken(token: string): Promise<string | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?play_token=eq.${encodeURIComponent(token)}&select=id`, { headers: svcHeaders() });
  if (!r.ok) throw new Error("pro_read_failed");
  const rows = (await r.json()) as { id: string }[];
  return rows[0]?.id || null;
}

/** Applique le statut lu chez Google sur le compte uid. Lève une erreur si la base refuse. */
export async function applyPlay(uid: string, token: string, sub: PlaySub): Promise<void> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro`, {
    method: "POST",
    headers: { ...svcHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: uid,
      play_token: token,
      play_until: sub.until,
      play_product: sub.basePlan ? `${sub.productId}:${sub.basePlan}` : sub.productId,
      play_state: sub.state,
      play_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    if (body.includes("23503")) return; // compte supprimé entre-temps
    throw new Error(`pro_write_failed_${r.status}`);
  }
}

/** Libère un ancien jeton (abonnement remplacé : changement de forfait, réabonnement). */
export async function releaseToken(token: string): Promise<void> {
  await fetch(`${SB_URL}/rest/v1/calorio_pro?play_token=eq.${encodeURIComponent(token)}`, {
    method: "PATCH",
    headers: { ...svcHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ play_token: null }),
  }).catch(() => {});
}
