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
      const body = JSON.stringify({ p });
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
