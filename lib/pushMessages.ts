/* calorio — banques de messages de notification (Pro).
   Objectif : beaucoup de variété pour ne jamais avoir l'impression de relire la même notif.
   3 types : lunch (midi, si rien noté), dinner (soir, si rien noté), encourage (tous les 3 jours). */

export type PushLang = "fr" | "de" | "en";
export type PushType = "lunch" | "dinner" | "encourage";
export type PushVariant = { title: string; body: string };

const MSGS: Record<PushLang, Record<PushType, PushVariant[]>> = {
  fr: {
    lunch: [
      { title: "T'as mangé quoi à midi ? 🍽️", body: "Note vite ton repas dans calorio pendant que c'est frais." },
      { title: "Petit rappel de Vito 🥕", body: "Rien dans ton journal aujourd'hui — c'était quoi, le déjeuner ?" },
      { title: "Pause déj ? 🥗", body: "Ajoute ton repas en deux tapes, je m'occupe des calories." },
      { title: "Coucou, c'est Vito 🥕", body: "Ton journal est encore vide. On note ton midi ensemble ?" },
      { title: "Hop, avant d'oublier ⏱️", body: "Le plus dur c'est de noter tout de suite. Ton repas de midi ?" },
      { title: "Miam, c'était bon ? 😋", body: "Dis-moi ce que tu as mangé, je calcule le reste de ta journée." },
      { title: "Journal du jour vide 📖", body: "Un petit geste : ajoute ton déjeuner et garde le cap." },
      { title: "Vito veille sur toi 🥕", body: "Note ton midi maintenant, tu me remercieras ce soir." },
      { title: "Ça mange bien ? 🍴", body: "Ouvre calorio et enregistre ton assiette de midi." },
      { title: "Un scan et c'est réglé 📷", body: "Photo de ton assiette → calories estimées. Ton midi ?" },
      { title: "On garde le rythme 💪", body: "Rien de noté aujourd'hui. Ton repas de midi pour bien démarrer ?" },
      { title: "Deux secondes pour toi 🥕", body: "Ajoute ton déjeuner, ta journée sera plus claire." },
    ],
    dinner: [
      { title: "Journée pas encore notée 🌙", body: "Rien dans calorio aujourd'hui — on rattrape ton dîner ?" },
      { title: "Bonsoir, c'est Vito 🥕", body: "Avant de te poser, note ce que tu as mangé aujourd'hui." },
      { title: "Ton dîner, ça donne quoi ? 🍽️", body: "Enregistre-le vite pour boucler ta journée." },
      { title: "Petit bilan du soir 📊", body: "Ton journal est vide. Ajoute tes repas pendant que tu y penses." },
      { title: "On termine en beauté ✨", body: "Note ton repas du soir et garde ta série intacte." },
      { title: "Pssst 🥕", body: "Tu n'as encore rien enregistré aujourd'hui. Ton dîner ?" },
      { title: "Avant le canapé 🛋️", body: "Un dernier geste : note ton assiette du soir dans calorio." },
      { title: "Ta journée en 30 s ⏱️", body: "Ajoute ce que tu as mangé, Vito s'occupe du calcul." },
      { title: "C'était bon ce soir ? 😋", body: "Dis-le à calorio pour suivre tes calories du jour." },
      { title: "On n'oublie pas 🥕", body: "Rien de noté aujourd'hui — quelques tapes et c'est fait." },
      { title: "Le soir, c'est le moment 🌙", body: "Note ton dîner et vois où tu en es par rapport à ton objectif." },
      { title: "Vito attend ton journal 🥕", body: "Enregistre tes repas du jour avant de dormir." },
    ],
    encourage: [
      { title: "Fier de toi 🥕", body: "Chaque repas noté, c'est un pas de plus. Continue comme ça !" },
      { title: "T'assures 💪", body: "La régularité paie plus que la perfection. Bravo pour ton suivi !" },
      { title: "Petit mot de Vito 🥕", body: "Prendre soin de soi, ça se cultive jour après jour. Tu gères." },
      { title: "On avance ensemble ✨", body: "Pas besoin d'être parfait, juste régulier. Et tu l'es !" },
      { title: "Belle énergie 🔥", body: "Ton objectif se rapproche à chaque jour de suivi. Lâche rien." },
      { title: "Coucou 🥕", body: "Rappelle-toi pourquoi tu as commencé. Tu es sur la bonne voie." },
      { title: "Bravo champion·ne 🏆", body: "Tenir un journal, c'est déjà gagner. Continue à ce rythme !" },
      { title: "Vito est content 🥕", body: "Tu prends de bonnes habitudes — elles vont te porter loin." },
      { title: "Un pas après l'autre 👣", body: "Les petits efforts d'aujourd'hui font les grands résultats de demain." },
      { title: "Tu mérites un high-five ✋", body: "Merci de prendre soin de toi. Vito croit en toi !" },
      { title: "Garde le cap ⛵", body: "La motivation va et vient, l'habitude reste. Tu bâtis la tienne." },
      { title: "Douceur avant tout 🥕", body: "Sois fier·ère du chemin parcouru, pas seulement du but. Continue !" },
    ],
  },
  de: {
    lunch: [
      { title: "Was gab's zu Mittag? 🍽️", body: "Trag dein Essen schnell in calorio ein, solange du dran denkst." },
      { title: "Kleiner Gruss von Vito 🥕", body: "Heute noch nichts im Journal — was gab's zum Mittagessen?" },
      { title: "Mittagspause? 🥗", body: "Zwei Tipps und dein Essen ist erfasst, die Kalorien mach ich." },
      { title: "Hoi, hier ist Vito 🥕", body: "Dein Journal ist noch leer. Tragen wir dein Mittagessen ein?" },
      { title: "Bevor du's vergisst ⏱️", body: "Am besten gleich eintragen. Was gab's heute Mittag?" },
      { title: "War's fein? 😋", body: "Sag mir, was du gegessen hast, ich rechne den Rest." },
      { title: "Journal noch leer 📖", body: "Eine kleine Geste: Mittagessen eintragen und dranbleiben." },
      { title: "Vito passt auf dich auf 🥕", body: "Trag dein Mittagessen jetzt ein, heute Abend dankst du's dir." },
      { title: "Ein Scan reicht 📷", body: "Teller fotografieren → Kalorien geschätzt. Dein Mittag?" },
      { title: "Wir bleiben dran 💪", body: "Heute noch nichts notiert. Dein Mittagessen für einen guten Start?" },
      { title: "Zwei Sekunden für dich 🥕", body: "Trag dein Mittagessen ein, dein Tag wird klarer." },
      { title: "Guten Appetit 🍴", body: "Öffne calorio und erfasse deinen Mittagsteller." },
    ],
    dinner: [
      { title: "Tag noch nicht erfasst 🌙", body: "Heute nichts in calorio — holen wir dein Abendessen nach?" },
      { title: "Guten Abend, hier ist Vito 🥕", body: "Bevor du dich hinsetzt: trag ein, was du heute gegessen hast." },
      { title: "Wie war dein Znacht? 🍽️", body: "Schnell eintragen und deinen Tag abschliessen." },
      { title: "Kleiner Abend-Check 📊", body: "Dein Journal ist leer. Trag deine Mahlzeiten ein, solange du dran denkst." },
      { title: "Schön abschliessen ✨", body: "Trag dein Abendessen ein und halte deine Serie." },
      { title: "Pssst 🥕", body: "Du hast heute noch nichts erfasst. Dein Abendessen?" },
      { title: "Vor dem Sofa 🛋️", body: "Eine letzte Geste: Abendessen in calorio eintragen." },
      { title: "Dein Tag in 30 s ⏱️", body: "Trag ein, was du gegessen hast, Vito rechnet." },
      { title: "War's fein heute? 😋", body: "Sag's calorio, um deine Kalorien zu verfolgen." },
      { title: "Nicht vergessen 🥕", body: "Heute nichts notiert — ein paar Tipps und es ist erledigt." },
      { title: "Abends ist der Moment 🌙", body: "Trag dein Znacht ein und sieh, wo du im Ziel stehst." },
      { title: "Vito wartet auf dein Journal 🥕", body: "Erfasse deine Mahlzeiten, bevor du schlafen gehst." },
    ],
    encourage: [
      { title: "Stolz auf dich 🥕", body: "Jede erfasste Mahlzeit ist ein Schritt weiter. Weiter so!" },
      { title: "Du machst das 💪", body: "Regelmässigkeit zählt mehr als Perfektion. Bravo für dein Tracking!" },
      { title: "Ein Wort von Vito 🥕", body: "Auf sich achten ist tägliche Pflege. Du machst das grossartig." },
      { title: "Gemeinsam vorwärts ✨", body: "Nicht perfekt, sondern regelmässig — und das bist du!" },
      { title: "Schöne Energie 🔥", body: "Dein Ziel rückt mit jedem Tag näher. Bleib dran." },
      { title: "Hoi 🥕", body: "Denk daran, warum du angefangen hast. Du bist auf dem richtigen Weg." },
      { title: "Bravo! 🏆", body: "Ein Journal führen ist schon ein Gewinn. Mach weiter so!" },
      { title: "Vito freut sich 🥕", body: "Du baust gute Gewohnheiten auf — die tragen dich weit." },
      { title: "Schritt für Schritt 👣", body: "Die kleinen Mühen von heute sind die Erfolge von morgen." },
      { title: "High-five! ✋", body: "Danke, dass du auf dich achtest. Vito glaubt an dich!" },
      { title: "Halte Kurs ⛵", body: "Motivation kommt und geht, die Gewohnheit bleibt. Du baust deine auf." },
      { title: "Sei sanft mit dir 🥕", body: "Sei stolz auf den Weg, nicht nur aufs Ziel. Weiter so!" },
    ],
  },
  en: {
    lunch: [
      { title: "What did you have for lunch? 🍽️", body: "Log your meal in calorio while it's fresh." },
      { title: "Little nudge from Vito 🥕", body: "Nothing in your log today — what was lunch?" },
      { title: "Lunch break? 🥗", body: "Two taps to add your meal, I'll handle the calories." },
      { title: "Hi, it's Vito 🥕", body: "Your log is still empty. Shall we add your lunch?" },
      { title: "Before you forget ⏱️", body: "Easiest to log it right away. What did you eat at noon?" },
      { title: "Was it good? 😋", body: "Tell me what you ate, I'll work out the rest of your day." },
      { title: "Today's log is empty 📖", body: "One small step: add your lunch and stay on track." },
      { title: "Vito's got your back 🥕", body: "Log lunch now, you'll thank yourself tonight." },
      { title: "One scan and done 📷", body: "Snap your plate → estimated calories. Your lunch?" },
      { title: "Keeping the rhythm 💪", body: "Nothing logged today. Add lunch for a good start?" },
      { title: "Two seconds for you 🥕", body: "Add your lunch and your day gets clearer." },
      { title: "Enjoy your meal 🍴", body: "Open calorio and log your lunch plate." },
    ],
    dinner: [
      { title: "Day not logged yet 🌙", body: "Nothing in calorio today — shall we catch up on dinner?" },
      { title: "Evening, it's Vito 🥕", body: "Before you settle in, log what you ate today." },
      { title: "How was dinner? 🍽️", body: "Log it quickly to wrap up your day." },
      { title: "Little evening check 📊", body: "Your log is empty. Add your meals while you think of it." },
      { title: "Finish strong ✨", body: "Log your dinner and keep your streak alive." },
      { title: "Psst 🥕", body: "You haven't logged anything today. Your dinner?" },
      { title: "Before the couch 🛋️", body: "One last step: log your evening plate in calorio." },
      { title: "Your day in 30s ⏱️", body: "Add what you ate, Vito does the maths." },
      { title: "Tasty tonight? 😋", body: "Tell calorio to track today's calories." },
      { title: "Let's not forget 🥕", body: "Nothing logged today — a few taps and it's done." },
      { title: "Evening's the moment 🌙", body: "Log your dinner and see where you are vs your goal." },
      { title: "Vito's waiting for your log 🥕", body: "Record your meals before you sleep." },
    ],
    encourage: [
      { title: "Proud of you 🥕", body: "Every logged meal is a step forward. Keep it up!" },
      { title: "You've got this 💪", body: "Consistency beats perfection. Well done for tracking!" },
      { title: "A word from Vito 🥕", body: "Taking care of yourself is daily care. You're doing great." },
      { title: "Moving forward together ✨", body: "No need to be perfect, just consistent — and you are!" },
      { title: "Nice energy 🔥", body: "Your goal gets closer with every day you track. Don't quit." },
      { title: "Hi 🥕", body: "Remember why you started. You're on the right path." },
      { title: "Bravo! 🏆", body: "Keeping a log is already a win. Keep this rhythm going!" },
      { title: "Vito's happy 🥕", body: "You're building good habits — they'll take you far." },
      { title: "One step at a time 👣", body: "Today's small efforts are tomorrow's big results." },
      { title: "Have a high-five ✋", body: "Thanks for taking care of yourself. Vito believes in you!" },
      { title: "Stay the course ⛵", body: "Motivation comes and goes, habit stays. You're building yours." },
      { title: "Be kind to yourself 🥕", body: "Be proud of the journey, not just the goal. Keep going!" },
    ],
  },
};

export function pickPush(lang: string, type: PushType, seed?: number): PushVariant {
  const l: PushLang = lang === "de" ? "de" : lang === "en" ? "en" : "fr";
  const pool = MSGS[l][type];
  const idx = typeof seed === "number" ? seed % pool.length : Math.floor(Math.random() * pool.length);
  return pool[idx];
}
