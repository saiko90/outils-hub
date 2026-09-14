import { describe, it, expect } from "vitest";
import {
  icsEscape, stampLocal, dateOnly, addDays, addMinutes, foldLine, buildICS, googleCalUrl,
} from "./agendo";

const OPTS = { uid: "test-uid@outils.ch", dtstamp: "20260101T000000Z", prodId: "-//outils.ch//agendo//FR" };

describe("agendo — helpers", () => {
  it("échappe , ; \\ et retours ligne", () => {
    expect(icsEscape("Réunion, projet; phase\\1\nsuite")).toBe("Réunion\\, projet\\; phase\\\\1\\nsuite");
  });
  it("stampLocal en temps flottant (pad heure)", () => {
    expect(stampLocal("2026-09-20", "9:05")).toBe("20260920T090500");
    expect(stampLocal("2026-09-20", "14:00")).toBe("20260920T140000");
  });
  it("dateOnly", () => {
    expect(dateOnly("2026-09-20")).toBe("20260920");
  });
  it("addDays gère les bords de mois/année", () => {
    expect(addDays("2026-09-20", 1)).toBe("20260921");
    expect(addDays("2026-01-31", 1)).toBe("20260201");
    expect(addDays("2026-12-31", 1)).toBe("20270101");
  });
  it("addMinutes traverse minuit", () => {
    expect(addMinutes("2026-09-20", "23:30", 60)).toBe("20260921T003000");
    expect(addMinutes("2026-09-20", "14:00", 60)).toBe("20260920T150000");
  });
  it("foldLine plie à 75 octets avec espace de continuation", () => {
    const line = "DESCRIPTION:" + "x".repeat(120);
    const folded = foldLine(line);
    const physical = folded.split("\r\n");
    expect(physical[0].length).toBe(75);
    expect(physical[1].startsWith(" ")).toBe(true);
    // reconstruction sans les CRLF+espace = ligne d'origine
    expect(physical.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe(line);
  });
});

describe("agendo — buildICS", () => {
  it("événement horaire complet, fin par défaut +1 h", () => {
    const ics = buildICS({ title: "Dentiste", date: "2026-09-20", startTime: "14:00" }, OPTS);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0\r\n");
    expect(ics).toContain("UID:test-uid@outils.ch\r\n");
    expect(ics).toContain("DTSTAMP:20260101T000000Z\r\n");
    expect(ics).toContain("DTSTART:20260920T140000\r\n");
    expect(ics).toContain("DTEND:20260920T150000\r\n");
    expect(ics).toContain("SUMMARY:Dentiste\r\n");
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
  });

  it("heure de fin explicite respectée", () => {
    const ics = buildICS({ title: "Réu", date: "2026-09-20", startTime: "09:00", endTime: "10:30" }, OPTS);
    expect(ics).toContain("DTSTART:20260920T090000\r\n");
    expect(ics).toContain("DTEND:20260920T103000\r\n");
  });

  it("toute la journée : VALUE=DATE et DTEND exclusif (+1 j)", () => {
    const ics = buildICS({ title: "Vacances", date: "2026-07-01", endDate: "2026-07-05", allDay: true }, OPTS);
    expect(ics).toContain("DTSTART;VALUE=DATE:20260701\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20260706\r\n");
  });

  it("échappe le résumé/description et pose LOCATION/URL/RRULE", () => {
    const ics = buildICS({
      title: "Café, thé; eau", date: "2026-09-20", startTime: "08:00",
      location: "Rue de Berne 1, Sion", description: "Ligne 1\nLigne 2", url: "https://outils.ch", rrule: "FREQ=WEEKLY;BYDAY=MO",
    }, OPTS);
    expect(ics).toContain("SUMMARY:Café\\, thé\\; eau\r\n");
    expect(ics).toContain("LOCATION:Rue de Berne 1\\, Sion\r\n");
    expect(ics).toContain("DESCRIPTION:Ligne 1\\nLigne 2\r\n");
    expect(ics).toContain("URL:https://outils.ch\r\n");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO\r\n");
  });

  it("rappel → bloc VALARM avec TRIGGER négatif", () => {
    const ics = buildICS({ title: "Vol", date: "2026-09-20", startTime: "06:00", alarmMinutes: 120 }, OPTS);
    expect(ics).toContain("BEGIN:VALARM\r\n");
    expect(ics).toContain("ACTION:DISPLAY\r\n");
    expect(ics).toContain("TRIGGER:-PT120M\r\n");
    expect(ics).toContain("END:VALARM\r\n");
  });

  it("sans rappel → pas de VALARM", () => {
    const ics = buildICS({ title: "X", date: "2026-09-20", startTime: "06:00" }, OPTS);
    expect(ics).not.toContain("VALARM");
  });
});

describe("agendo — googleCalUrl", () => {
  it("compose l'URL Google Agenda (dates start/end, titre)", () => {
    const u = googleCalUrl({ title: "Dentiste", date: "2026-09-20", startTime: "14:00" });
    expect(u.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(u).toContain("action=TEMPLATE");
    expect(u).toContain("dates=20260920T140000%2F20260920T150000");
    expect(u).toContain("text=Dentiste");
  });
  it("toute la journée → plage de dates", () => {
    const u = googleCalUrl({ title: "V", date: "2026-07-01", endDate: "2026-07-05", allDay: true });
    expect(u).toContain("dates=20260701%2F20260706");
  });
});
