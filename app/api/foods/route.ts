import { NextResponse } from "next/server";

// Recherche d'aliments et lecture par code-barres via Open Food Facts (base ouverte,
// gratuite, ~3 M de produits dont beaucoup de références suisses). On passe par le
// serveur pour la mise en cache, le User-Agent requis et éviter les soucis CORS.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const UA = "outils.ch-calorio/1.0 (https://outils.ch)";
const OFF = "https://world.openfoodfacts.org";
const SEARCH = "https://search.openfoodfacts.org";

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_fr?: string;
  brands?: string | string[];
  nutriments?: Record<string, number | string>;
};

type Food = {
  id: string;
  nom: string;
  kcal: number;
  prot: number;
  gluc: number;
  lip: number;
  portion: number;
  emoji: string;
  brand?: string;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

function toFood(p: OffProduct): Food | null {
  const nu = p.nutriments || {};
  let kcal = num(nu["energy-kcal_100g"]);
  if (!kcal && nu["energy_100g"]) kcal = Math.round(num(nu["energy_100g"]) / 4.184); // kJ → kcal
  if (!kcal) return null;
  const nom = (p.product_name_fr || p.product_name || "").trim();
  if (!nom) return null;
  const brandRaw = Array.isArray(p.brands) ? p.brands[0] || "" : p.brands || "";
  const brand = brandRaw.split(",")[0].trim();
  return {
    id: `off:${p.code || nom}`,
    nom: nom.slice(0, 60),
    kcal: Math.round(kcal),
    prot: Math.round(num(nu["proteins_100g"]) * 10) / 10,
    gluc: Math.round(num(nu["carbohydrates_100g"]) * 10) / 10,
    lip: Math.round(num(nu["fat_100g"]) * 10) / 10,
    portion: 100,
    emoji: "🏷️",
    brand: brand || undefined,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const code = (url.searchParams.get("code") || "").replace(/\D/g, "").slice(0, 20);
  const fields = "code,product_name,product_name_fr,brands,nutriments";

  try {
    // Lecture par code-barres
    if (code) {
      const r = await fetch(`${OFF}/api/v2/product/${code}?fields=${fields}`, {
        headers: { "user-agent": UA },
      });
      if (!r.ok) return NextResponse.json({ foods: [] });
      const data = (await r.json()) as { status?: number; product?: OffProduct };
      if (data.status !== 1 || !data.product) return NextResponse.json({ foods: [], notFound: true });
      const f = toFood(data.product);
      return NextResponse.json({ foods: f ? [f] : [], notFound: !f });
    }

    // Recherche texte
    if (q.length < 2) return NextResponse.json({ foods: [] });
    const search = `${SEARCH}/search?q=${encodeURIComponent(q)}&page_size=24&fields=${fields}`;
    const r = await fetch(search, { headers: { "user-agent": UA } });
    if (!r.ok) return NextResponse.json({ foods: [] });
    const data = (await r.json()) as { hits?: OffProduct[] };
    const seen = new Set<string>();
    const foods = (data.hits || [])
      .map(toFood)
      .filter((f): f is Food => {
        if (!f) return false;
        const k = f.nom.toLowerCase() + "|" + f.kcal;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 18);
    return NextResponse.json({ foods });
  } catch {
    return NextResponse.json({ foods: [] });
  }
}
