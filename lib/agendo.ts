// agendo — génération d'événements agenda au format iCalendar (.ics, RFC 5545).
// Cœur 100 % déterministe (temps « flottants » : la valeur vient directement des
// composants saisis, sans conversion de fuseau) → testable au caractère près.

export type IcsEvent = {
  title: string;
  date: string;            // "YYYY-MM-DD"
  allDay?: boolean;
  startTime?: string;      // "HH:MM" (ignoré si allDay)
  endDate?: string;        // "YYYY-MM-DD" (défaut = date)
  endTime?: string;        // "HH:MM"
  location?: string;
  description?: string;
  url?: string;
  rrule?: string;          // ex. "FREQ=WEEKLY;BYDAY=MO"
  alarmMinutes?: number | null; // minutes avant le début (rappel)
};

export type IcsOptions = { uid?: string; dtstamp?: string; prodId?: string };

const pad = (n: number) => String(n).padStart(2, "0");

// Échappement des valeurs texte (RFC 5545 §3.3.11).
export function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

// "YYYY-MM-DD" + "HH:MM" -> "YYYYMMDDTHHMMSS" (temps flottant, secondes = 00).
export function stampLocal(date: string, time: string): string {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!d || !t) throw new Error("bad datetime");
  return `${d[1]}${d[2]}${d[3]}T${pad(+t[1])}${t[2]}00`;
}

// "YYYY-MM-DD" -> "YYYYMMDD".
export function dateOnly(date: string): string {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!d) throw new Error("bad date");
  return `${d[1]}${d[2]}${d[3]}`;
}

// Ajoute des jours à une date "YYYY-MM-DD" (arithmétique en UTC → indépendant du fuseau).
export function addDays(date: string, n: number): string {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!d) throw new Error("bad date");
  const dt = new Date(Date.UTC(+d[1], +d[2] - 1, +d[3]));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
}

// Ajoute des minutes à (date, "HH:MM") → "YYYYMMDDTHHMMSS" flottant.
export function addMinutes(date: string, time: string, mins: number): string {
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!d || !t) throw new Error("bad datetime");
  const base = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  const dt = new Date(base + mins * 60000);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
}

// Pliage des lignes à 75 octets (RFC 5545 §3.1) : continuation préfixée d'une espace.
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    parts.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join("\r\n");
}

// Construit le contenu .ics complet (CRLF, plié). uid/dtstamp injectables (tests).
export function buildICS(ev: IcsEvent, opts: IcsOptions = {}): string {
  const uid = opts.uid || `${Date.now()}-${Math.random().toString(36).slice(2)}@outils.ch`;
  const dtstamp = opts.dtstamp || new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const prodId = opts.prodId || "-//outils.ch//agendo//FR";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
  ];

  if (ev.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(ev.date)}`);
    // DTEND est exclusif pour un événement toute la journée → +1 jour après la fin.
    const end = ev.endDate || ev.date;
    lines.push(`DTEND;VALUE=DATE:${addDays(end, 1)}`);
  } else {
    const st = ev.startTime || "09:00";
    lines.push(`DTSTART:${stampLocal(ev.date, st)}`);
    let end: string;
    if (ev.endTime) end = stampLocal(ev.endDate || ev.date, ev.endTime);
    else end = addMinutes(ev.date, st, 60); // défaut : +1 h
    lines.push(`DTEND:${end}`);
  }

  lines.push(`SUMMARY:${icsEscape(ev.title || "")}`);
  if (ev.location) lines.push(`LOCATION:${icsEscape(ev.location)}`);
  if (ev.description) lines.push(`DESCRIPTION:${icsEscape(ev.description)}`);
  if (ev.url) lines.push(`URL:${icsEscape(ev.url)}`);
  if (ev.rrule) lines.push(`RRULE:${ev.rrule}`);

  if (ev.alarmMinutes != null && ev.alarmMinutes >= 0) {
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(ev.title || "Rappel")}`, `TRIGGER:-PT${Math.round(ev.alarmMinutes)}M`, "END:VALARM");
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

// Lien « Ajouter à Google Agenda » (calendar.google.com/render).
export function googleCalUrl(ev: IcsEvent): string {
  const p = new URLSearchParams();
  p.set("action", "TEMPLATE");
  p.set("text", ev.title || "");
  let dates: string;
  if (ev.allDay) {
    dates = `${dateOnly(ev.date)}/${addDays(ev.endDate || ev.date, 1)}`;
  } else {
    const st = ev.startTime || "09:00";
    const start = stampLocal(ev.date, st);
    const end = ev.endTime ? stampLocal(ev.endDate || ev.date, ev.endTime) : addMinutes(ev.date, st, 60);
    dates = `${start}/${end}`;
  }
  p.set("dates", dates);
  if (ev.description) p.set("details", ev.description);
  if (ev.location) p.set("location", ev.location);
  if (ev.rrule) p.set("recur", `RRULE:${ev.rrule}`);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
