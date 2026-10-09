import { describe, it, expect } from "vitest";
import { interpretSub, parseServiceAccount } from "./googlePlay";
import { pickPlayOffers } from "./playOffers";
import { proActiveRow } from "./serverAuth";

const NOW = Date.parse("2026-10-09T12:00:00Z");
const item = (exp: string, plan = "monthly") => ({ productId: "calorio_pro", expiryTime: exp, offerDetails: { basePlanId: plan } });

describe("Google Play : lecture d'un abonnement", () => {
  it("actif et payé → Pro jusqu'à l'échéance, achat à confirmer", () => {
    const s = interpretSub({ subscriptionState: "SUBSCRIPTION_STATE_ACTIVE", acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING", lineItems: [item("2026-11-09T12:00:00Z")], externalAccountIdentifiers: { obfuscatedExternalAccountId: "u1" } }, NOW);
    expect(s.active).toBe(true);
    expect(s.until).toBe("2026-11-09T12:00:00.000Z");
    expect(s.needsAck).toBe(true);
    expect(s.accountId).toBe("u1");
    expect(s.basePlan).toBe("monthly");
  });
  it("résilié mais période payée en cours → reste Pro jusqu'à la fin", () => {
    expect(interpretSub({ subscriptionState: "SUBSCRIPTION_STATE_CANCELED", lineItems: [item("2026-10-20T00:00:00Z")] }, NOW).active).toBe(true);
  });
  it("expiré, suspendu ou paiement en attente → pas Pro", () => {
    for (const st of ["SUBSCRIPTION_STATE_EXPIRED", "SUBSCRIPTION_STATE_ON_HOLD", "SUBSCRIPTION_STATE_PAUSED", "SUBSCRIPTION_STATE_PENDING"]) {
      expect(interpretSub({ subscriptionState: st, lineItems: [item("2026-12-01T00:00:00Z")] }, NOW).active).toBe(false);
    }
  });
  it("échéance dépassée → pas Pro même si l'état dit actif", () => {
    expect(interpretSub({ subscriptionState: "SUBSCRIPTION_STATE_ACTIVE", lineItems: [item("2026-10-01T00:00:00Z")] }, NOW).active).toBe(false);
  });
});

describe("Google Play : tarifs affichés", () => {
  it("format réel du plugin Android (identifier = forfait, planIdentifier = abonnement)", () => {
    const r = pickPlayOffers([
      { planIdentifier: "calorio_pro", identifier: "monthly", offerId: null, priceString: "CHF 4.90", offerToken: "base-m" },
      { planIdentifier: "calorio_pro", identifier: "monthly", offerId: "essai-7j", priceString: "CHF 4.90", offerToken: "trial-m" },
      { planIdentifier: "calorio_pro", identifier: "yearly", offerId: null, priceString: "CHF 39.00", offerToken: "base-y" },
    ]);
    expect(r.monthly).toEqual({ priceString: "CHF 4.90", offerToken: "trial-m", trial: true });
    expect(r.yearly).toEqual({ priceString: "CHF 39.00", offerToken: "base-y", trial: false });
  });
  it("préfère l'offre d'essai mais affiche le prix du forfait de base", () => {
    const r = pickPlayOffers([
      { planIdentifier: "monthly", priceString: "CHF 4.90", offerToken: "base-m" },
      { planIdentifier: "monthly", offerId: "essai-7j", priceString: "CHF 0.00", offerToken: "trial-m" },
      { planIdentifier: "yearly", priceString: "CHF 39.00", offerToken: "base-y" },
    ]);
    expect(r.monthly).toEqual({ priceString: "CHF 4.90", offerToken: "trial-m", trial: true });
    expect(r.yearly).toEqual({ priceString: "CHF 39.00", offerToken: "base-y", trial: false });
  });
});

describe("Pro effectif", () => {
  it("web OU Google Play", () => {
    expect(proActiveRow({ is_pro: false, play_until: "2026-11-01T00:00:00Z" }, NOW)).toBe(true);
    expect(proActiveRow({ is_pro: true, pro_until: "2026-10-01T00:00:00Z", play_until: null }, NOW)).toBe(false);
    expect(proActiveRow({ is_pro: true, pro_until: null }, NOW)).toBe(true);
    expect(proActiveRow(null, NOW)).toBe(false);
  });
});

describe("Clé du compte de service (copier-coller)", () => {
  const KEY = "-----BEGIN PRIVATE KEY-----\nAAAA\nBBBB\n-----END PRIVATE KEY-----\n";
  const json = JSON.stringify({ type: "service_account", client_email: "sa@x.iam.gserviceaccount.com", private_key: KEY, token_uri: "https://oauth2.googleapis.com/token" }, null, 2);
  it("JSON normal", () => {
    expect(parseServiceAccount(json)?.private_key).toBe(KEY);
  });
  it("entouré d'espaces / retours à la ligne", () => {
    expect(parseServiceAccount(`\n  ${json}\n`)?.client_email).toBe("sa@x.iam.gserviceaccount.com");
  });
  it("encodé en base64", () => {
    expect(parseServiceAccount(Buffer.from(json).toString("base64"))?.private_key).toBe(KEY);
  });
  it("clé privée avec de vrais retours à la ligne (JSON cassé)", () => {
    const broken = json.replace(/\\n/g, "\n");
    expect(() => JSON.parse(broken)).toThrow();
    const sa = parseServiceAccount(broken);
    expect(sa?.client_email).toBe("sa@x.iam.gserviceaccount.com");
    expect(sa?.private_key).toBe(KEY);
  });
  it("vide ou sans clé privée → null", () => {
    expect(parseServiceAccount("")).toBeNull();
    expect(parseServiceAccount('{"client_email":"a@b"}')).toBeNull();
  });
});
