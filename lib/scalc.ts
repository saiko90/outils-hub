// scalc — cœur de calcul : évaluateur d'expression mathématique SÛR (sans eval()).
// Parseur à descente récursive : + − × ÷, ^, %, parenthèses, fonctions trigo/log/…, ! (factorielle), π, e.

export type ScalcOpts = { deg?: boolean };

const FUNCS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt", "exp", "abs"]);
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

type Tok = { t: string; v: string };

function tokenize(input: string): Tok[] {
  const s = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/,/g, ".");
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\t") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      toks.push({ t: "num", v: num });
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let id = "";
      while (i < s.length && /[a-zA-Z0-9]/.test(s[i])) id += s[i++];
      const low = id.toLowerCase();
      if (FUNCS.has(low)) toks.push({ t: "fn", v: low });
      else if (low in CONSTS) toks.push({ t: "const", v: low });
      else throw new Error(`Inconnu : ${id}`);
      continue;
    }
    if ("+-*/^%()!".includes(c)) { toks.push({ t: c, v: c }); i++; continue; }
    throw new Error(`Caractère invalide : ${c}`);
  }
  return toks;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorielle : entier positif requis");
  if (n > 170) return Infinity;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

/** Évalue une expression mathématique. `deg:true` = fonctions trigo en degrés. */
export function evaluate(input: string, opts: ScalcOpts = {}): number {
  const deg = !!opts.deg;
  const toks = tokenize(input);
  let pos = 0;
  const peek = () => toks[pos];
  const eat = (t?: string) => { const tk = toks[pos]; if (t && (!tk || tk.t !== t)) throw new Error("Expression invalide"); pos++; return tk; };

  const toRad = (x: number) => (deg ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (deg ? (x * 180) / Math.PI : x);
  const applyFn = (name: string, x: number): number => {
    switch (name) {
      case "sin": return Math.sin(toRad(x));
      case "cos": return Math.cos(toRad(x));
      case "tan": return Math.tan(toRad(x));
      case "asin": return fromRad(Math.asin(x));
      case "acos": return fromRad(Math.acos(x));
      case "atan": return fromRad(Math.atan(x));
      case "ln": return Math.log(x);
      case "log": return Math.log10(x);
      case "sqrt": return Math.sqrt(x);
      case "exp": return Math.exp(x);
      case "abs": return Math.abs(x);
      default: throw new Error(`Fonction inconnue : ${name}`);
    }
  };

  // grammaire : expr → add ; add → mul (('+'|'-') mul)* ; mul → unary (('*'|'/') unary)* ;
  //             unary → ('-'|'+') unary | power ; power → postfix ('^' unary)? ;
  //             postfix → primary ('!' | '%')* ; primary → num | const | fn '(' expr ')' | '(' expr ')'
  function parseExpr(): number { return parseAdd(); }
  function parseAdd(): number {
    let v = parseMul();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = eat().t; const r = parseMul();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function parseMul(): number {
    let v = parseUnary();
    while (peek() && (peek().t === "*" || peek().t === "/")) {
      const op = eat().t; const r = parseUnary();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function parseUnary(): number {
    if (peek() && (peek().t === "-" || peek().t === "+")) {
      const op = eat().t; const v = parseUnary();
      return op === "-" ? -v : v;
    }
    return parsePower();
  }
  function parsePower(): number {
    const base = parsePostfix();
    if (peek() && peek().t === "^") { eat(); const exp = parseUnary(); return Math.pow(base, exp); }
    return base;
  }
  function parsePostfix(): number {
    let v = parsePrimary();
    while (peek() && (peek().t === "!" || peek().t === "%")) {
      const op = eat().t;
      v = op === "!" ? factorial(v) : v / 100;
    }
    return v;
  }
  function parsePrimary(): number {
    const tk = peek();
    if (!tk) throw new Error("Expression incomplète");
    if (tk.t === "num") { eat(); const n = Number(tk.v); if (Number.isNaN(n)) throw new Error(`Nombre invalide : ${tk.v}`); return n; }
    if (tk.t === "const") { eat(); return CONSTS[tk.v]; }
    if (tk.t === "fn") { eat(); eat("("); const arg = parseExpr(); eat(")"); return applyFn(tk.v, arg); }
    if (tk.t === "(") { eat(); const v = parseExpr(); eat(")"); return v; }
    throw new Error("Expression invalide");
  }

  const result = parseExpr();
  if (pos !== toks.length) throw new Error("Expression invalide");
  if (!Number.isFinite(result)) throw new Error("Résultat non défini");
  return result;
}

/** Version « sûre » qui renvoie une chaîne (résultat ou "Erreur"). */
export function evaluateSafe(input: string, opts: ScalcOpts = {}): { ok: boolean; value: number; text: string } {
  try {
    const v = evaluate(input, opts);
    const rounded = Math.round(v * 1e10) / 1e10; // limite les artefacts flottants
    return { ok: true, value: v, text: String(rounded) };
  } catch (e) {
    return { ok: false, value: NaN, text: (e as Error).message || "Erreur" };
  }
}
