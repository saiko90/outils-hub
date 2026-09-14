"use client";

import { useEffect, useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { buildICS, googleCalUrl, type IcsEvent } from "@/lib/agendo";

const L = {
  fr: {
    title: "Titre de l'événement", titlePh: "Rendez-vous dentiste",
    allDay: "Toute la journée",
    date: "Date", start: "Début", end: "Fin", endDate: "Date de fin",
    location: "Lieu", locationPh: "Rue de Berne 1, Sion",
    desc: "Description", descPh: "Notes, ordre du jour, lien…",
    url: "Lien (URL)",
    reminder: "Rappel", rem: { none: "Aucun", "0": "À l'heure", "15": "15 min avant", "30": "30 min avant", "60": "1 h avant", "120": "2 h avant", "1440": "1 jour avant" },
    repeat: "Répétition", rep: { none: "Une seule fois", daily: "Chaque jour", weekly: "Chaque semaine", monthly: "Chaque mois", yearly: "Chaque année" },
    preview: "Fichier .ics généré",
    download: "Télécharger .ics", gcal: "Ajouter à Google Agenda",
    hint: "Le fichier .ics s'ouvre dans Apple Calendar, Outlook, Google Agenda, Thunderbird… Envoie-le en pièce jointe pour inviter quelqu'un.",
    needTitle: "Donne un titre à ton événement pour générer le fichier.",
    copied: "Copié ✓", copy: "Copier le texte",
  },
  de: {
    title: "Titel des Termins", titlePh: "Zahnarzttermin",
    allDay: "Ganztägig",
    date: "Datum", start: "Beginn", end: "Ende", endDate: "Enddatum",
    location: "Ort", locationPh: "Berner Strasse 1, Sitten",
    desc: "Beschreibung", descPh: "Notizen, Agenda, Link…",
    url: "Link (URL)",
    reminder: "Erinnerung", rem: { none: "Keine", "0": "Zur Zeit", "15": "15 Min vorher", "30": "30 Min vorher", "60": "1 Std vorher", "120": "2 Std vorher", "1440": "1 Tag vorher" },
    repeat: "Wiederholung", rep: { none: "Einmalig", daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich", yearly: "Jährlich" },
    preview: "Erzeugte .ics-Datei",
    download: ".ics herunterladen", gcal: "Zu Google Kalender hinzufügen",
    hint: "Die .ics-Datei öffnet sich in Apple Kalender, Outlook, Google Kalender, Thunderbird… Als Anhang senden, um jemanden einzuladen.",
    needTitle: "Gib deinem Termin einen Titel, um die Datei zu erzeugen.",
    copied: "Kopiert ✓", copy: "Text kopieren",
  },
  en: {
    title: "Event title", titlePh: "Dentist appointment",
    allDay: "All day",
    date: "Date", start: "Start", end: "End", endDate: "End date",
    location: "Location", locationPh: "Rue de Berne 1, Sion",
    desc: "Description", descPh: "Notes, agenda, link…",
    url: "Link (URL)",
    reminder: "Reminder", rem: { none: "None", "0": "At time of event", "15": "15 min before", "30": "30 min before", "60": "1 h before", "120": "2 h before", "1440": "1 day before" },
    repeat: "Repeat", rep: { none: "Once", daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" },
    preview: "Generated .ics file",
    download: "Download .ics", gcal: "Add to Google Calendar",
    hint: "The .ics file opens in Apple Calendar, Outlook, Google Calendar, Thunderbird… Send it as an attachment to invite someone.",
    needTitle: "Give your event a title to generate the file.",
    copied: "Copied ✓", copy: "Copy text",
  },
} as const;

const RRULE: Record<string, string> = { daily: "FREQ=DAILY", weekly: "FREQ=WEEKLY", monthly: "FREQ=MONTHLY", yearly: "FREQ=YEARLY" };

function slugify(s: string): string {
  return (s || "evenement").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "evenement";
}

export default function AgendoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [reminder, setReminder] = useState("none");
  const [repeat, setRepeat] = useState("none");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    setEndDate(today);
    setMounted(true);
  }, []);

  const ev: IcsEvent = useMemo(() => ({
    title: title.trim(),
    date: date || "2026-01-01",
    allDay,
    startTime,
    endDate: endDate || date,
    endTime,
    location: location.trim() || undefined,
    description: desc.trim() || undefined,
    url: url.trim() || undefined,
    rrule: repeat !== "none" ? RRULE[repeat] : undefined,
    alarmMinutes: reminder !== "none" ? Number(reminder) : null,
  }), [title, date, allDay, startTime, endDate, endTime, location, desc, url, repeat, reminder]);

  const ready = mounted && !!title.trim() && !!date;
  const ics = useMemo(() => (ready ? buildICS(ev, { uid: `agendo-${slugify(title)}-${date}@outils.ch`, dtstamp: "20260101T000000Z" }) : ""), [ready, ev, title, date]);

  const download = () => {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slugify(title)}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2000);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(ics); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  return (
    <section className="ag" id="agendo">
      <style>{AG_CSS}</style>
      <div className="ag-grid">
        <div className="ag-form">
          <label className="ag-field">
            <span>{t.title}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePh} className="ag-in" />
          </label>

          <label className="ag-check">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            <span>{t.allDay}</span>
          </label>

          <div className="ag-row">
            <label className="ag-field">
              <span>{t.date}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ag-in" />
            </label>
            {!allDay && (
              <label className="ag-field ag-sm">
                <span>{t.start}</span>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="ag-in" />
              </label>
            )}
            {!allDay && (
              <label className="ag-field ag-sm">
                <span>{t.end}</span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="ag-in" />
              </label>
            )}
          </div>

          {allDay && (
            <label className="ag-field">
              <span>{t.endDate}</span>
              <input type="date" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value)} className="ag-in" />
            </label>
          )}

          <label className="ag-field">
            <span>{t.location}</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.locationPh} className="ag-in" />
          </label>

          <label className="ag-field">
            <span>{t.desc}</span>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.descPh} className="ag-in ag-ta" rows={3} />
          </label>

          <div className="ag-row">
            <label className="ag-field">
              <span>{t.reminder}</span>
              <select value={reminder} onChange={(e) => setReminder(e.target.value)} className="ag-in">
                {(["none", "0", "15", "30", "60", "120", "1440"] as const).map((k) => (
                  <option key={k} value={k}>{t.rem[k]}</option>
                ))}
              </select>
            </label>
            <label className="ag-field">
              <span>{t.repeat}</span>
              <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="ag-in">
                {(["none", "daily", "weekly", "monthly", "yearly"] as const).map((k) => (
                  <option key={k} value={k}>{t.rep[k]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="ag-out">
          <div className="ag-actions">
            <button className="ag-btn primary" onClick={download} disabled={!ready}>⬇︎ {t.download}</button>
            <a className={`ag-btn ${ready ? "" : "off"}`} href={ready ? googleCalUrl(ev) : undefined} target="_blank" rel="noopener noreferrer">📅 {t.gcal}</a>
          </div>
          <p className="ag-hint">{t.hint}</p>

          <div className="ag-prevhead">
            <span>{t.preview}</span>
            {ready && <button className="ag-copy" onClick={copy}>{copied ? t.copied : t.copy}</button>}
          </div>
          {ready ? (
            <pre className="ag-pre">{ics}</pre>
          ) : (
            <p className="ag-empty">{t.needTitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}

const AG_CSS = `
.ag{margin:22px 0 8px;color:#e6e9f5}
.ag-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
@media(max-width:820px){.ag-grid{grid-template-columns:1fr}}
.ag-form{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:14px}
.ag-field{display:block}
.ag-field>span{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:6px}
.ag-in{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#f5f6fb;padding:10px 12px;font-size:.92rem;font-family:inherit}
.ag-in:focus{outline:none;border-color:rgba(56,189,248,.55)}
.ag-ta{resize:vertical;min-height:70px}
.ag-row{display:flex;gap:12px;flex-wrap:wrap}
.ag-row .ag-field{flex:1;min-width:120px}
.ag-sm{max-width:130px}
.ag-check{display:flex;align-items:center;gap:9px;font-size:.9rem;color:#e6e9f5;cursor:pointer}
.ag-check input{width:18px;height:18px;accent-color:#38bdf8}
.ag-out{display:flex;flex-direction:column;gap:12px}
.ag-actions{display:flex;gap:10px;flex-wrap:wrap}
.ag-btn{flex:1;min-width:150px;text-align:center;text-decoration:none;padding:12px 16px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#e6e9f5;font-size:.92rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px}
.ag-btn.primary{background:linear-gradient(135deg,#38bdf8,#6366f1);color:#05131f;border-color:transparent}
.ag-btn.primary:disabled{opacity:.45;cursor:not-allowed}
.ag-btn.off{opacity:.45;pointer-events:none}
.ag-hint{margin:0;font-size:.82rem;line-height:1.5;color:#8b93b7}
.ag-prevhead{display:flex;justify-content:space-between;align-items:center;font-size:.8rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#8b93b7;margin-top:4px}
.ag-copy{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.35);color:#7dd3fc;border-radius:8px;padding:5px 10px;font-size:.72rem;font-weight:700;cursor:pointer;text-transform:none;letter-spacing:0}
.ag-pre{margin:0;background:#0b1120;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;font-family:var(--mono,ui-monospace,monospace);font-size:.78rem;line-height:1.5;color:#c8d2ea;white-space:pre-wrap;word-break:break-word;max-height:340px;overflow:auto}
.ag-empty{margin:0;color:#8b93b7;font-size:.9rem;text-align:center;padding:26px 16px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.12);border-radius:12px}
`;
