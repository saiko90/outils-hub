"use client";
import { getSupabase } from "./supabaseClient";
import { VAPID_PUBLIC_KEY } from "./vapid";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY;

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function pushPermission(): NotificationPermission | "unsupported" {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

export type PushResult = { ok: boolean; reason?: "unsupported" | "not_configured" | "denied" | "no_supabase" | "save_failed" | "error" };

export async function enablePush(userId: string, lang: string): Promise<PushResult> {
  try {
    if (!pushSupported()) return { ok: false, reason: "unsupported" };
    if (!VAPID_PUBLIC) return { ok: false, reason: "not_configured" };
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC) as BufferSource });
    }
    const json = sub.toJSON();
    const supa = getSupabase();
    if (!supa) return { ok: false, reason: "no_supabase" };
    const { error } = await supa.from("calorio_push").upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        enabled: true,
        lang,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" } // un abonnement par appareil (téléphone + ordinateur)
    );
    if (error) return { ok: false, reason: "save_failed" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// Désactive les notifications de CET appareil (les autres appareils du compte restent abonnés).
export async function disablePush(userId: string): Promise<PushResult> {
  let endpoint = "";
  try {
    if (pushSupported()) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { endpoint = sub.endpoint; await sub.unsubscribe(); }
    }
  } catch {
    /* ignore */
  }
  try {
    const supa = getSupabase();
    // Uniquement l'abonnement de CET appareil : sans abonnement local, on ne touche à rien
    // (sinon on couperait les notifications des autres appareils du compte).
    if (supa && endpoint) await supa.from("calorio_push").delete().eq("user_id", userId).eq("endpoint", endpoint);
  } catch {
    /* ignore */
  }
  return { ok: true };
}
