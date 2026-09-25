"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Traceur first-party, sans cookie ni stockage. Envoie un ping "page vue" à chaque
// changement de route. Non bloquant et silencieux : ne casse jamais la page.
export default function Hit() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const p = pathname || "/";
      if (p.startsWith("/admin")) return;
      let ref = "";
      try {
        if (document.referrer) {
          const h = new URL(document.referrer).hostname.replace(/^www\./, "");
          const self = window.location.hostname.replace(/^www\./, "");
          // Pas de « source » pour les navigations internes ni les retours de connexion / paiement.
          const flow = ["accounts.google.com", "checkout.stripe.com", "billing.stripe.com", "srcvnqfgtazupuzwznrr.supabase.co"];
          if (h && h !== self && h !== "outils.ch" && !h.endsWith(".outils.ch") && h !== "calorio.ch" && !flow.includes(h)) ref = h;
        }
      } catch { /* no-op */ }
      const body = JSON.stringify(ref ? { p, ref } : { p });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/hit", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/hit", {
          method: "POST",
          body,
          headers: { "content-type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* no-op */
    }
  }, [pathname]);
  return null;
}
