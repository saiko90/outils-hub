// alloco — cœur de calcul : allocations familiales par canton (Suisse, montants 2026).
// Allocation pour enfant + allocation de formation. Minimum fédéral LAFam : 200 / 250 CHF.
// Certains cantons majorent le montant dès le 3e enfant — voir disclaimer.

export type CantonAlloc = { code: string; nom: string; enfant: number; formation: number };

export const FED_MIN = { enfant: 200, formation: 250 };

// Montants mensuels 2026 par canton (CHF).
export const CANTONS: CantonAlloc[] = [
  { code: "VS", nom: "Valais", enfant: 305, formation: 445 },
  { code: "GE", nom: "Genève", enfant: 311, formation: 415 },
  { code: "VD", nom: "Vaud", enfant: 300, formation: 400 },
  { code: "FR", nom: "Fribourg", enfant: 265, formation: 325 },
  { code: "JU", nom: "Jura", enfant: 275, formation: 325 },
  { code: "NE", nom: "Neuchâtel", enfant: 250, formation: 310 },
  { code: "BE", nom: "Berne", enfant: 230, formation: 290 },
  { code: "GR", nom: "Grisons", enfant: 230, formation: 280 },
  { code: "SG", nom: "Saint-Gall", enfant: 230, formation: 280 },
  { code: "NW", nom: "Nidwald", enfant: 220, formation: 270 },
  { code: "LU", nom: "Lucerne", enfant: 210, formation: 260 },
  { code: "OW", nom: "Obwald", enfant: 210, formation: 260 },
  { code: "SZ", nom: "Schwyz", enfant: 210, formation: 260 },
  { code: "UR", nom: "Uri", enfant: 210, formation: 260 },
  { code: "ZG", nom: "Zoug", enfant: 300, formation: 350 },
  { code: "AG", nom: "Argovie", enfant: 200, formation: 250 },
  { code: "AI", nom: "Appenzell Rh.-Int.", enfant: 200, formation: 250 },
  { code: "AR", nom: "Appenzell Rh.-Ext.", enfant: 200, formation: 250 },
  { code: "BL", nom: "Bâle-Campagne", enfant: 200, formation: 250 },
  { code: "BS", nom: "Bâle-Ville", enfant: 200, formation: 250 },
  { code: "GL", nom: "Glaris", enfant: 200, formation: 250 },
  { code: "SH", nom: "Schaffhouse", enfant: 200, formation: 250 },
  { code: "SO", nom: "Soleure", enfant: 200, formation: 250 },
  { code: "TG", nom: "Thurgovie", enfant: 200, formation: 250 },
  { code: "TI", nom: "Tessin", enfant: 200, formation: 250 },
  { code: "ZH", nom: "Zurich", enfant: 200, formation: 250 },
];

export const cantonByCode = (code: string): CantonAlloc | undefined => CANTONS.find((c) => c.code === code);

export type AllocoInputs = { canton: string; nbEnfants: number; nbFormation: number };
export type AllocoResult = {
  canton: CantonAlloc;
  tarifEnfant: number; tarifFormation: number;
  totalEnfants: number; totalFormation: number;
  totalMensuel: number; totalAnnuel: number;
};

export function computeAlloco(inp: AllocoInputs): AllocoResult {
  const canton = cantonByCode(inp.canton) ?? CANTONS[0];
  const ne = Math.max(0, Math.floor(inp.nbEnfants));
  const nf = Math.max(0, Math.floor(inp.nbFormation));
  const totalEnfants = ne * canton.enfant;
  const totalFormation = nf * canton.formation;
  const totalMensuel = totalEnfants + totalFormation;
  return {
    canton,
    tarifEnfant: canton.enfant, tarifFormation: canton.formation,
    totalEnfants, totalFormation,
    totalMensuel, totalAnnuel: totalMensuel * 12,
  };
}
