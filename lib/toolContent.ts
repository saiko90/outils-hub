// Contenu éditorial unique et sourcé des 8 outils prioritaires (FR et DE) : comment ça marche, exemple
// chiffré (calculé avec les fonctions de lib/ : intero, preo, resilio, salaro, ideo ; à la main pour
// avso, prorato et pourcento, dont le code vit encore dans des projets séparés) et base légale vérifiée
// sur fedlex.admin.ch (version du CO en vigueur au 01.10.2026). Quand une entrée existe, ToolView
// l'affiche à la place de la description générique et de PRO_CONTENT, et utilise cette FAQ.
import type { Lang } from "./i18n";

export type ToolSection = { h2: string; html: string };
export type ToolContent = { sections: ToolSection[]; faq: { q: string; a: string }[] };

const CO_FR = "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr";
const CO_DE = "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de";
const LAVS_FR = "https://www.fedlex.admin.ch/eli/cc/63/837_843_843/fr";
const LAVS_DE = "https://www.fedlex.admin.ch/eli/cc/63/837_843_843/de";
const LIDE_FR = "https://www.fedlex.admin.ch/eli/cc/2010/705/fr";
const LIDE_DE = "https://www.fedlex.admin.ch/eli/cc/2010/705/de";
const a = (href: string, text: string) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

export const TOOL_CONTENT: Record<string, Partial<Record<Lang, ToolContent>>> = {
  avso: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Le numéro AVS suisse compte 13 chiffres et s'écrit 756.XXXX.XXXX.XX. Les trois premiers chiffres, 756, sont le code numérique de la Suisse dans la norme ISO 3166. Les neuf suivants sont attribués sans aucune signification : depuis 2008, le numéro ne dit rien de votre date de naissance ni de votre nom. Le dernier chiffre est une clé de contrôle calculée comme un code-barres EAN-13.</p><p>avso enlève les espaces et les points, vérifie qu'il y a bien 13 chiffres commençant par 756, recalcule la clé et remet le numéro en forme. Il contrôle la structure, pas l'existence du numéro dans les registres de l'AVS.</p>" },
        { h2: "Exemple chiffré", html: "<p>Prenons le numéro fictif 756.1234.5678.97. On multiplie les 12 premiers chiffres, de gauche à droite, alternativement par 1 et par 3 : 7×1 + 5×3 + 6×1 + 1×3 + 2×1 + 3×3 + 4×1 + 5×3 + 6×1 + 7×3 + 8×1 + 9×3 = 123. La clé vaut (10 − 3) = <b>7</b>, le chiffre des unités de 123 étant 3. Le numéro se termine bien par 7 : il est valide. Avec 756.1234.5678.98, la clé ne correspond plus et avso signale une faute de frappe.</p>" },
        { h2: "Base légale et sources", html: `<p>Le numéro AVS est prévu par l'${a(`${LAVS_FR}#art_50_c`, "art. 50c de la loi fédérale sur l'AVS (LAVS)")}, qui exige que sa composition ne permette aucune déduction sur la personne. L'Office fédéral des assurances sociales explique son usage sur ${a("https://www.bsv.admin.ch/fr/numero-avs", "sa page consacrée au numéro AVS")}.</p>` },
      ],
      faq: [
        { q: "Où trouver son numéro AVS ?", a: "Sur la carte d'assurance-maladie. Les salariés peuvent aussi le demander à leur employeur, les indépendants à leur caisse de compensation." },
        { q: "Que signifie le préfixe 756 ?", a: "C'est le code numérique de la Suisse dans la norme internationale ISO 3166. Tous les numéros AVS actuels commencent par 756." },
        { q: "Le numéro AVS change-t-il en cas de mariage ?", a: "Non. Depuis 2008, le numéro à 13 chiffres ne contient aucune information personnelle et reste valable à vie, même après un mariage ou un changement de nom." },
        { q: "avso vérifie-t-il que le numéro existe vraiment ?", a: "Non. avso contrôle le format et la clé de contrôle, ce qui détecte la plupart des fautes de frappe, mais pas l'attribution réelle du numéro. Rien n'est envoyé : le calcul se fait dans votre navigateur." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Die Schweizer AHV-Nummer hat 13 Ziffern und wird als 756.XXXX.XXXX.XX geschrieben. Die ersten drei Ziffern, 756, sind der Zahlencode der Schweiz nach der Norm ISO 3166. Die neun folgenden Ziffern werden ohne Bedeutung vergeben: Seit 2008 verrät die Nummer weder Geburtsdatum noch Namen. Die letzte Ziffer ist eine Prüfziffer, berechnet wie bei einem EAN-13-Strichcode.</p><p>avso entfernt Leerzeichen und Punkte, prüft, ob es 13 Ziffern mit 756 am Anfang sind, berechnet die Prüfziffer neu und formatiert die Nummer. Geprüft wird die Struktur, nicht ob die Nummer in den AHV-Registern existiert.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Nehmen wir die fiktive Nummer 756.1234.5678.97. Die ersten 12 Ziffern werden von links nach rechts abwechselnd mit 1 und 3 multipliziert: 7×1 + 5×3 + 6×1 + 1×3 + 2×1 + 3×3 + 4×1 + 5×3 + 6×1 + 7×3 + 8×1 + 9×3 = 123. Die Prüfziffer ist (10 − 3) = <b>7</b>, weil die Einerstelle von 123 eine 3 ist. Die Nummer endet tatsächlich auf 7: Sie ist gültig. Bei 756.1234.5678.98 stimmt die Prüfziffer nicht mehr, und avso meldet einen Tippfehler.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Die AHV-Nummer ist in ${a(`${LAVS_DE}#art_50_c`, "Art. 50c des Bundesgesetzes über die AHV (AHVG)")} geregelt: Ihre Zusammensetzung darf keine Rückschlüsse auf die Person zulassen. Das Bundesamt für Sozialversicherungen erklärt die Verwendung auf ${a("https://www.bsv.admin.ch/de/ahv-nummer", "seiner Seite zur AHV-Nummer")}.</p>` },
      ],
      faq: [
        { q: "Wo finde ich meine AHV-Nummer?", a: "Auf der Krankenversicherungskarte. Angestellte können sie auch beim Arbeitgeber erfragen, Selbstständige bei ihrer Ausgleichskasse." },
        { q: "Was bedeutet die Vorwahl 756?", a: "Das ist der Zahlencode der Schweiz in der internationalen Norm ISO 3166. Alle heutigen AHV-Nummern beginnen mit 756." },
        { q: "Ändert sich die AHV-Nummer bei einer Heirat?", a: "Nein. Seit 2008 enthält die 13-stellige Nummer keine persönlichen Angaben und bleibt lebenslang gültig, auch nach einer Heirat oder Namensänderung." },
        { q: "Prüft avso, ob die Nummer wirklich existiert?", a: "Nein. avso prüft Format und Prüfziffer, was die meisten Tippfehler erkennt, aber nicht die tatsächliche Vergabe. Es wird nichts gesendet: Die Berechnung läuft im Browser." },
      ],
    },
  },

  prorato: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Quand un locataire entre ou sort en cours de mois, on ne paie que les jours occupés. En Suisse, beaucoup de régies calculent selon la <b>méthode des 30es</b> : chaque mois compte pour 30 jours, qu'il en ait 28 ou 31. Le loyer journalier vaut donc le loyer mensuel divisé par 30, et un jour occupé au-delà du 30 n'est pas facturé en plus. C'est un usage, pas une règle de la loi : votre bail ou la régie peuvent prévoir le calcul au jour réel, que prorato propose aussi.</p><p>Indiquez le loyer mensuel (charges comprises si vous voulez le total à payer), le mois et les jours occupés.</p>" },
        { h2: "Exemple chiffré", html: "<p>Loyer de 1800 CHF par mois charges comprises, entrée le 12 mars. Méthode des 30es : du 12 au 30, soit <b>19 jours</b>, et 1800 × 19 / 30 = <b>1140.00 CHF</b>. Au jour réel, mars compte 31 jours et le locataire en occupe 20 : 1800 × 20 / 31 = 1161.29 CHF (1161.30 CHF arrondi aux 5 centimes, comme le propose prorato). L'écart reste faible, mais il vaut mieux savoir quelle méthode le bail prévoit avant de payer.</p>" },
        { h2: "Base légale et sources", html: `<p>Le Code des obligations ne fixe pas de méthode de calcul au prorata. Il prévoit seulement que le loyer et les frais accessoires se paient à la fin de chaque mois, sauf convention ou usage local contraires (${a(`${CO_FR}#art_257_c`, "art. 257c CO")}). La méthode des 30es relève de l'usage ; en cas de doute, c'est le bail qui fait foi.</p>` },
      ],
      faq: [
        { q: "Pourquoi compter 30 jours même en février ?", a: "Par usage : la méthode des 30es donne le même loyer journalier toute l'année (loyer mensuel / 30), ce qui simplifie les décomptes. Elle n'est pas imposée par la loi." },
        { q: "Les charges se calculent-elles aussi au prorata ?", a: "Les acomptes de charges suivent en général la même règle que le loyer. Saisissez le loyer charges comprises pour obtenir directement le montant total à payer." },
        { q: "Quelle méthode s'applique à mon bail ?", a: "Celle prévue par le bail ou pratiquée par la régie. Sans précision, les deux méthodes sont courantes : prorato affiche les deux pour comparer." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Zieht jemand mitten im Monat ein oder aus, wird nur die bewohnte Zeit bezahlt. In der Schweiz rechnen viele Verwaltungen nach der <b>30tel-Methode</b>: Jeder Monat zählt 30 Tage, ob er 28 oder 31 hat. Der Tagesmietzins ist also der Monatsmietzins geteilt durch 30, und ein Tag nach dem 30. wird nicht zusätzlich verrechnet. Das ist eine Praxis, keine gesetzliche Regel: Mietvertrag oder Verwaltung können die Berechnung nach effektiven Tagen vorsehen, die prorato ebenfalls anbietet.</p><p>Geben Sie den Monatsmietzins (inklusive Nebenkosten, wenn Sie den Gesamtbetrag wollen), den Monat und die bewohnten Tage ein.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Mietzins 1800 CHF pro Monat inklusive Nebenkosten, Einzug am 12. März. 30tel-Methode: vom 12. bis 30., also <b>19 Tage</b>, und 1800 × 19 / 30 = <b>1140.00 CHF</b>. Nach effektiven Tagen hat der März 31 Tage, bewohnt sind 20: 1800 × 20 / 31 = 1161.29 CHF (1161.30 CHF auf 5 Rappen gerundet, wie prorato es anbietet). Der Unterschied ist klein, aber es lohnt sich, vor dem Zahlen die Methode im Vertrag zu prüfen.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Das Obligationenrecht schreibt keine Methode für die anteilige Berechnung vor. Es bestimmt nur, dass Mietzins und Nebenkosten am Ende jedes Monats zu bezahlen sind, wenn nichts anderes vereinbart oder ortsüblich ist (${a(`${CO_DE}#art_257_c`, "Art. 257c OR")}). Die 30tel-Methode ist eine Praxis; im Zweifel gilt der Mietvertrag.</p>` },
      ],
      faq: [
        { q: "Warum 30 Tage, auch im Februar?", a: "Aus Praxis: Die 30tel-Methode ergibt das ganze Jahr denselben Tagesmietzins (Monatsmietzins / 30) und vereinfacht die Abrechnung. Gesetzlich vorgeschrieben ist sie nicht." },
        { q: "Werden die Nebenkosten auch pro rata berechnet?", a: "Die Akontozahlungen folgen meist derselben Regel wie der Mietzins. Geben Sie den Mietzins inklusive Nebenkosten ein, um direkt den Gesamtbetrag zu erhalten." },
        { q: "Welche Methode gilt für meinen Mietvertrag?", a: "Die im Vertrag vorgesehene oder von der Verwaltung angewandte. Ohne Angabe sind beide Methoden üblich: prorato zeigt beide zum Vergleich." },
      ],
    },
  },

  pourcento: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>pourcento regroupe les cinq calculs de pourcentage les plus courants : <b>X % d'un nombre</b>, <b>quel pourcentage</b> représente une valeur, <b>hausse ou baisse</b> d'un montant, <b>variation</b> entre deux valeurs et <b>prix hors taxe depuis un prix TTC</b>. Choisissez le calcul, tapez vos chiffres : le résultat s'affiche en direct.</p><p>Pour retrouver un prix hors taxe, on divise le prix TTC par (1 + taux) : on ne retire pas simplement le pourcentage, qui donnerait un résultat trop bas.</p>" },
        { h2: "Exemple chiffré", html: "<ul><li>15 % de 80 = 80 × 0,15 = <b>12</b>.</li><li>Un article passe de 80 à 92 CHF : (92 − 80) / 80 = <b>+15 %</b>.</li><li>Remise de 20 % sur 150 CHF : 150 × (1 − 0,20) = <b>120 CHF</b>.</li><li>Prix de 108.10 CHF TTC avec la TVA à 8,1 % : 108.10 / 1,081 = <b>100.00 CHF HT</b>, soit 8.10 CHF de TVA. En retirant 8,1 % de 108.10, on obtiendrait à tort 99.34 CHF.</li></ul>" },
        { h2: "Taux et sources", html: `<p>Les taux de TVA suisses sont de 8,1 % (taux normal), 2,6 % (taux réduit, par exemple pour l'alimentation) et 3,8 % (hébergement), selon l'${a("https://www.estv.admin.ch/estv/fr/home/mehrwertsteuer/mwst-steuersaetze.html", "Administration fédérale des contributions")}. Pour un décompte TVA complet, utilisez plutôt tvaflash.</p>` },
      ],
      faq: [
        { q: "Comment calculer un prix hors taxe à partir du TTC ?", a: "Divisez le prix TTC par 1 + le taux de TVA : 108.10 / 1,081 = 100.00 CHF avec la TVA à 8,1 %." },
        { q: "Une hausse de 10 % puis une baisse de 10 % ramènent-elles au prix de départ ?", a: "Non : 100 + 10 % = 110, puis 110 − 10 % = 99. La baisse s'applique à un montant plus élevé." },
        { q: "Comment calculer une variation en pourcentage ?", a: "Soustrayez l'ancienne valeur de la nouvelle, divisez par l'ancienne et multipliez par 100 : de 80 à 92, (92 − 80) / 80 × 100 = 15 %." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>pourcento vereint die fünf häufigsten Prozentrechnungen: <b>X % einer Zahl</b>, <b>wie viel Prozent</b> ein Wert ausmacht, <b>Aufschlag oder Rabatt</b> auf einen Betrag, <b>Veränderung</b> zwischen zwei Werten und <b>Nettopreis aus einem Bruttopreis</b>. Rechnung wählen, Zahlen eintippen: Das Resultat erscheint sofort.</p><p>Für den Nettopreis wird der Bruttopreis durch (1 + Satz) geteilt. Einfach den Prozentsatz abzuziehen, ergibt ein zu tiefes Resultat.</p>" },
        { h2: "Rechenbeispiel", html: "<ul><li>15 % von 80 = 80 × 0,15 = <b>12</b>.</li><li>Ein Artikel steigt von 80 auf 92 CHF: (92 − 80) / 80 = <b>+15 %</b>.</li><li>20 % Rabatt auf 150 CHF: 150 × (1 − 0,20) = <b>120 CHF</b>.</li><li>Bruttopreis 108.10 CHF mit 8,1 % MWST: 108.10 / 1,081 = <b>100.00 CHF netto</b>, also 8.10 CHF MWST. Wer 8,1 % von 108.10 abzieht, käme fälschlich auf 99.34 CHF.</li></ul>" },
        { h2: "Sätze und Quellen", html: `<p>Die Schweizer MWST-Sätze betragen 8,1 % (Normalsatz), 2,6 % (reduzierter Satz, etwa für Lebensmittel) und 3,8 % (Beherbergung), laut ${a("https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html", "Eidgenössischer Steuerverwaltung")}. Für eine vollständige MWST-Abrechnung eignet sich tvaflash besser.</p>` },
      ],
      faq: [
        { q: "Wie berechne ich den Nettopreis aus dem Bruttopreis?", a: "Bruttopreis durch 1 + MWST-Satz teilen: 108.10 / 1,081 = 100.00 CHF bei 8,1 % MWST." },
        { q: "Ergeben 10 % Aufschlag und danach 10 % Rabatt wieder den Ausgangspreis?", a: "Nein: 100 + 10 % = 110, dann 110 − 10 % = 99. Der Rabatt gilt auf einen höheren Betrag." },
        { q: "Wie berechne ich eine prozentuale Veränderung?", a: "Alten Wert vom neuen abziehen, durch den alten teilen und mal 100 nehmen: von 80 auf 92 sind (92 − 80) / 80 × 100 = 15 %." },
      ],
    },
  },

  intero: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Un débiteur qui ne paie pas une somme d'argent exigible est <b>en demeure</b> dès que le créancier l'a interpellé (un rappel suffit), ou dès l'expiration du jour de paiement convenu. À partir de là court un <b>intérêt moratoire de 5 % l'an</b>, même si le contrat prévoyait un taux plus bas.</p><p>intero compte les jours entre la mise en demeure et le paiement, puis applique la formule montant × taux × jours / 360. La base de 360 jours est un usage courant ; avec 365 jours, le résultat change de quelques centimes.</p>" },
        { h2: "Exemple chiffré", html: "<p>Une facture de 2000 CHF, en demeure depuis le 1er mars 2026 (rappel reçu), payée le 30 juin 2026 : <b>121 jours</b> de retard. Intérêts : 2000 × 5 % × 121 / 360 = <b>33.61 CHF</b>, soit 2033.61 CHF au total. Chaque jour de retard ajoute environ 0.28 CHF.</p>" },
        { h2: "Base légale et sources", html: `<p>La mise en demeure est réglée par l'${a(`${CO_FR}#art_102`, "art. 102 CO")} et le taux de 5 % par l'${a(`${CO_FR}#art_104`, "art. 104 CO")}. Si le contrat prévoit un intérêt supérieur à 5 %, ce taux plus élevé peut aussi être exigé pendant la demeure. Les frais de rappel, eux, ne peuvent en principe être facturés que s'ils sont prévus au contrat.</p>` },
      ],
      faq: [
        { q: "Depuis quand courent les intérêts moratoires ?", a: "Dès que le débiteur est en demeure : après réception d'un rappel (interpellation du créancier), ou dès l'expiration du jour de paiement fixé d'un commun accord (art. 102 CO)." },
        { q: "Peut-on facturer plus que 5 % ?", a: "Oui, si le contrat prévoit un intérêt supérieur à 5 % : ce taux peut alors être exigé pendant la demeure (art. 104 al. 2 CO). Sans clause, c'est 5 % l'an." },
        { q: "Les intérêts moratoires s'ajoutent-ils automatiquement à la facture ?", a: "Ils sont dus de par la loi, mais il faut les réclamer : mentionnez le montant et la période dans votre rappel ou votre mise en demeure." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Wer eine fällige Geldschuld nicht bezahlt, kommt <b>in Verzug</b>, sobald der Gläubiger ihn mahnt, oder mit Ablauf eines vereinbarten Zahlungstags. Ab dann läuft ein <b>Verzugszins von 5 % pro Jahr</b>, selbst wenn im Vertrag ein tieferer Zins vereinbart war.</p><p>intero zählt die Tage zwischen Verzugsbeginn und Zahlung und rechnet Betrag × Zinssatz × Tage / 360. Die Basis von 360 Tagen ist eine verbreitete Praxis; mit 365 Tagen ändert das Resultat um wenige Rappen.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Eine Rechnung über 2000 CHF, in Verzug seit dem 1. März 2026 (Mahnung erhalten), bezahlt am 30. Juni 2026: <b>121 Tage</b> Verzug. Zins: 2000 × 5 % × 121 / 360 = <b>33.61 CHF</b>, total 2033.61 CHF. Jeder Verzugstag kostet rund 0.28 CHF.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Der Verzug ist in ${a(`${CO_DE}#art_102`, "Art. 102 OR")} geregelt, der Zinssatz von 5 % in ${a(`${CO_DE}#art_104`, "Art. 104 OR")}. Sieht der Vertrag einen höheren Zins als 5 % vor, kann dieser auch während des Verzugs verlangt werden. Mahngebühren können grundsätzlich nur verlangt werden, wenn der Vertrag sie vorsieht.</p>` },
      ],
      faq: [
        { q: "Ab wann läuft der Verzugszins?", a: "Ab Verzug: nach Erhalt einer Mahnung oder mit Ablauf des vereinbarten Zahlungstags (Art. 102 OR)." },
        { q: "Darf man mehr als 5 % verlangen?", a: "Ja, wenn der Vertrag einen höheren Zins als 5 % vorsieht: Dieser gilt dann auch während des Verzugs (Art. 104 Abs. 2 OR). Ohne Klausel sind es 5 % pro Jahr." },
        { q: "Wird der Verzugszins automatisch geschuldet?", a: "Er ist von Gesetzes wegen geschuldet, muss aber eingefordert werden: Nennen Sie Betrag und Zeitraum in der Mahnung." },
      ],
    },
  },

  preo: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Un contrat de travail de durée indéterminée se résilie en respectant un <b>délai de congé</b> qui dépend de l'ancienneté. Pendant le <b>temps d'essai</b> (le premier mois, sauf accord écrit, trois mois au plus), le délai est de 7 jours. Ensuite, sauf accord écrit, contrat-type ou convention collective : 1 mois pendant la première année de service, 2 mois de la 2e à la 9e année, 3 mois dès la 10e, toujours <b>pour la fin d'un mois</b>.</p><p>Ce qui compte, c'est la date à laquelle la lettre est <b>reçue</b>. preo calcule la fin du contrat et le dernier jour pour que le congé arrive à temps.</p>" },
        { h2: "Exemple chiffré", html: "<p>Une employée a 3 ans de service et donne son congé le 20 novembre 2026. Le délai est de 2 mois pour la fin d'un mois : son contrat se termine le <b>31 janvier 2027</b>, à condition que l'employeur reçoive la lettre au plus tard le <b>30 novembre 2026</b>. Reçue le 1er décembre, elle ne produirait effet qu'au 28 février 2027. Pendant le temps d'essai, un congé donné le 20 novembre prend fin le 27 novembre.</p>" },
        { h2: "Base légale et sources", html: `<p>Le temps d'essai est réglé par l'${a(`${CO_FR}#art_335_b`, "art. 335b CO")}, les délais ordinaires par l'${a(`${CO_FR}#art_335_c`, "art. 335c CO")}. Votre contrat ou votre CCT peut prévoir d'autres délais : vérifiez-les avant d'envoyer votre lettre. Pendant une maladie ou un accident, des périodes de protection peuvent s'appliquer au congé donné par l'employeur.</p>` },
      ],
      faq: [
        { q: "Quel délai pendant la période d'essai ?", a: "7 jours, pour n'importe quel jour (art. 335b CO). Le temps d'essai dure un mois, sauf accord écrit qui peut le porter à trois mois au plus." },
        { q: "Le délai court-il depuis l'envoi ou la réception de la lettre ?", a: "Depuis la réception : la lettre doit être arrivée chez l'autre partie avant le début du délai. Envoyez-la assez tôt, idéalement en recommandé." },
        { q: "Mon contrat peut-il prévoir un autre délai ?", a: "Oui, par accord écrit, contrat-type ou convention collective. Un délai de moins d'un mois n'est possible que par convention collective et pour la première année de service." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Ein unbefristeter Arbeitsvertrag wird mit einer <b>Kündigungsfrist</b> gekündigt, die vom Dienstalter abhängt. In der <b>Probezeit</b> (erster Monat, schriftlich verlängerbar auf höchstens drei Monate) beträgt die Frist 7 Tage. Danach gilt, sofern Vertrag, Normalarbeitsvertrag oder GAV nichts anderes vorsehen: 1 Monat im ersten Dienstjahr, 2 Monate vom 2. bis 9. Dienstjahr, 3 Monate ab dem 10., jeweils <b>auf ein Monatsende</b>.</p><p>Massgebend ist, wann die Kündigung <b>empfangen</b> wird. preo berechnet das Vertragsende und den letzten Tag, an dem die Kündigung eintreffen muss.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Eine Angestellte mit 3 Dienstjahren kündigt am 20. November 2026. Die Frist beträgt 2 Monate auf ein Monatsende: Ihr Vertrag endet am <b>31. Januar 2027</b>, sofern der Arbeitgeber das Schreiben spätestens am <b>30. November 2026</b> erhält. Kommt es erst am 1. Dezember an, wirkt die Kündigung erst auf den 28. Februar 2027. In der Probezeit endet eine Kündigung vom 20. November am 27. November.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Die Probezeit regelt ${a(`${CO_DE}#art_335_b`, "Art. 335b OR")}, die ordentlichen Fristen ${a(`${CO_DE}#art_335_c`, "Art. 335c OR")}. Ihr Vertrag oder GAV kann andere Fristen vorsehen: Prüfen Sie diese vor dem Versand. Bei Krankheit oder Unfall können Sperrfristen für Kündigungen durch den Arbeitgeber gelten.</p>` },
      ],
      faq: [
        { q: "Welche Kündigungsfrist gilt in der Probezeit?", a: "7 Tage, auf jeden beliebigen Tag (Art. 335b OR). Die Probezeit dauert einen Monat; schriftlich kann sie auf höchstens drei Monate verlängert werden." },
        { q: "Zählt der Versand oder der Empfang der Kündigung?", a: "Der Empfang: Das Schreiben muss vor Beginn der Frist bei der anderen Partei sein. Rechtzeitig und am besten eingeschrieben versenden." },
        { q: "Kann mein Vertrag eine andere Frist vorsehen?", a: "Ja, durch schriftliche Abrede, Normalarbeitsvertrag oder GAV. Weniger als einen Monat ist nur per GAV und nur im ersten Dienstjahr möglich." },
      ],
    },
  },

  resilio: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Un bail d'habitation de durée indéterminée se résilie avec un <b>délai de congé de trois mois</b>, pour le <b>terme fixé par l'usage local</b> ou, à défaut, pour la fin d'un trimestre de bail. Votre bail peut prévoir un délai plus long ou d'autres échéances (par exemple fin mars, juin et septembre).</p><p>La lettre doit être <b>reçue</b> par le bailleur au plus tard le dernier jour avant le début du délai. resilio calcule cette date limite pour les échéances de votre bail et vous indique la prochaine encore possible.</p>" },
        { h2: "Exemple chiffré", html: "<p>Bail avec un préavis de 3 mois et des échéances fin mars, fin juin et fin septembre. Vous voulez partir le 30 juin 2027 : le délai court du 1er avril au 30 juin, votre résiliation doit donc être reçue au plus tard le <b>31 mars 2027</b>. Si elle arrive le 1er avril, le bail se termine seulement à l'échéance suivante, le <b>30 septembre 2027</b>.</p>" },
        { h2: "Base légale et sources", html: `<p>Les délais et termes sont réglés aux ${a(`${CO_FR}#art_266_a`, "art. 266a à 266o CO")}, en particulier l'${a(`${CO_FR}#art_266_c`, "art. 266c CO")} pour les habitations. Le congé doit être donné par écrit (${a(`${CO_FR}#art_266_l`, "art. 266l CO")}). Pour un logement de famille, un époux ou un partenaire enregistré ne peut résilier qu'avec le consentement exprès de l'autre (${a(`${CO_FR}#art_266_m`, "art. 266m CO")}).</p>` },
      ],
      faq: [
        { q: "Quel est le délai de résiliation d'un appartement ?", a: "Trois mois au minimum, pour le terme fixé par l'usage local ou, à défaut, pour la fin d'un trimestre de bail (art. 266c CO). Le bail peut prévoir plus long." },
        { q: "Ma lettre doit-elle arriver avant le début du préavis ?", a: "Oui. C'est la date de réception qui compte : avec un préavis de trois mois pour fin juin, la lettre doit être reçue au plus tard le 31 mars." },
        { q: "Peut-on partir avant l'échéance ?", a: "Oui, en présentant un nouveau locataire solvable, que le bailleur ne peut raisonnablement refuser et qui reprend le bail aux mêmes conditions (art. 264 CO). Sinon, le loyer reste dû jusqu'à l'échéance." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Ein unbefristeter Wohnungsmietvertrag wird mit einer <b>Kündigungsfrist von drei Monaten</b> gekündigt, auf den <b>ortsüblichen Termin</b> oder, wenn es keinen gibt, auf das Ende einer dreimonatigen Mietdauer. Der Vertrag kann eine längere Frist oder andere Termine vorsehen (zum Beispiel Ende März, Juni und September).</p><p>Die Kündigung muss beim Vermieter spätestens am letzten Tag vor Fristbeginn <b>eintreffen</b>. resilio berechnet dieses Datum für die Termine Ihres Vertrags und zeigt den nächsten noch möglichen.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Vertrag mit 3 Monaten Frist und Terminen Ende März, Juni und September. Sie möchten am 30. Juni 2027 ausziehen: Die Frist läuft vom 1. April bis 30. Juni, die Kündigung muss also spätestens am <b>31. März 2027</b> eintreffen. Kommt sie am 1. April an, endet das Mietverhältnis erst auf den nächsten Termin, den <b>30. September 2027</b>.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Fristen und Termine regeln ${a(`${CO_DE}#art_266_a`, "Art. 266a bis 266o OR")}, insbesondere ${a(`${CO_DE}#art_266_c`, "Art. 266c OR")} für Wohnungen. Die Kündigung muss schriftlich erfolgen (${a(`${CO_DE}#art_266_l`, "Art. 266l OR")}). Bei einer Familienwohnung braucht es die ausdrückliche Zustimmung des Ehegatten oder eingetragenen Partners (${a(`${CO_DE}#art_266_m`, "Art. 266m OR")}).</p>` },
      ],
      faq: [
        { q: "Welche Kündigungsfrist gilt für eine Wohnung?", a: "Mindestens drei Monate, auf den ortsüblichen Termin oder sonst auf das Ende einer dreimonatigen Mietdauer (Art. 266c OR). Der Vertrag kann länger vorsehen." },
        { q: "Muss die Kündigung vor Fristbeginn eintreffen?", a: "Ja. Massgebend ist der Empfang: Bei drei Monaten Frist auf Ende Juni muss das Schreiben spätestens am 31. März beim Vermieter sein." },
        { q: "Kann ich vor dem Termin ausziehen?", a: "Ja, wenn Sie einen zahlungsfähigen Nachmieter vorschlagen, den der Vermieter nicht zumutbar ablehnen kann und der den Vertrag zu gleichen Bedingungen übernimmt (Art. 264 OR). Sonst bleibt der Mietzins bis zum Termin geschuldet." },
      ],
    },
  },

  salaro: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Du salaire brut, l'employeur retient la part salariale des assurances sociales : <b>AVS/AI/APG 5,3 %</b> sans plafond, <b>assurance chômage 1,1 %</b> jusqu'à 148'200 CHF par an, l'<b>assurance accidents non professionnels</b> (taux fixé par l'assureur selon la branche) et la <b>prévoyance professionnelle (LPP)</b>, qui dépend de votre caisse de pension et de votre âge. L'impôt à la source s'ajoute pour certains permis.</p><p>salaro applique ces taux et vous laisse ajuster LAA, LPP et impôt à la source. L'impôt ordinaire sur le revenu n'est pas déduit du salaire et n'est pas compris.</p>" },
        { h2: "Exemple chiffré", html: "<p>Salaire brut de 85'000 CHF par an, LAA 1,3 %, LPP estimée à 5 % du brut, sans impôt à la source : AVS/AI/APG 4505 CHF, chômage 935 CHF, LAA 1105 CHF, LPP 4250 CHF. Total des déductions : 10'795 CHF (12,7 %). Salaire net : <b>74'205 CHF par an</b>, soit <b>6183.75 CHF par mois</b> sur 12 salaires. Avec un 13e salaire, le même total se répartit sur 13 versements.</p>" },
        { h2: "Base légale et sources", html: `<p>La cotisation AVS de 4,35 % à charge du salarié figure à l'${a(`${LAVS_FR}#art_5`, "art. 5 LAVS")} ; avec l'AI et les APG, la part salariale atteint 5,3 %. Les taux 2026 (5,3 % AVS/AI/APG, 1,1 % AC jusqu'à 148'200 CHF) sont résumés par ${a("https://www.swissmem.ch/de/wissen/personalwesen/arbeitsrecht/sozialversicherungsbeitraege-2026.html", "Swissmem (en allemand)")}. La cotisation de solidarité de l'assurance chômage n'est plus prélevée depuis 2023.</p>` },
      ],
      faq: [
        { q: "Quelle part du salaire part en cotisations sociales ?", a: "Au minimum 6,4 % du brut (5,3 % AVS/AI/APG et 1,1 % chômage), plus la LAA et surtout la LPP, qui varie selon l'âge et la caisse. Dans l'exemple ci-dessus, 12,7 % au total." },
        { q: "Pourquoi mon salaire net diffère-t-il du calcul ?", a: "Le taux LPP de votre caisse, la LAA de votre branche, des indemnités journalières maladie ou l'impôt à la source peuvent modifier le résultat : ajustez-les dans salaro." },
        { q: "Y a-t-il encore une cotisation chômage au-delà de 148'200 CHF ?", a: "Non. La cotisation de solidarité de 0,5 % n'est plus prélevée depuis le 1er janvier 2023 : le 1,1 % s'arrête au plafond." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Vom Bruttolohn zieht der Arbeitgeber den Arbeitnehmeranteil der Sozialversicherungen ab: <b>AHV/IV/EO 5,3 %</b> ohne Plafond, <b>Arbeitslosenversicherung 1,1 %</b> bis 148'200 CHF pro Jahr, die <b>Nichtberufsunfallversicherung</b> (Satz des Versicherers je nach Branche) und die <b>berufliche Vorsorge (BVG)</b>, die von Pensionskasse und Alter abhängt. Bei gewissen Bewilligungen kommt die Quellensteuer dazu.</p><p>salaro wendet diese Sätze an; NBU, BVG und Quellensteuer lassen sich anpassen. Die ordentliche Einkommenssteuer wird nicht vom Lohn abgezogen und ist nicht enthalten.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Bruttolohn 85'000 CHF pro Jahr, NBU 1,3 %, BVG geschätzt 5 % vom Brutto, keine Quellensteuer: AHV/IV/EO 4505 CHF, ALV 935 CHF, NBU 1105 CHF, BVG 4250 CHF. Total Abzüge: 10'795 CHF (12,7 %). Nettolohn: <b>74'205 CHF pro Jahr</b>, also <b>6183.75 CHF pro Monat</b> bei 12 Löhnen. Mit 13. Monatslohn verteilt sich derselbe Betrag auf 13 Zahlungen.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Der AHV-Beitrag von 4,35 % zulasten der Arbeitnehmenden steht in ${a(`${LAVS_DE}#art_5`, "Art. 5 AHVG")}; mit IV und EO ergibt das 5,3 %. Die Sätze 2026 (5,3 % AHV/IV/EO, 1,1 % ALV bis 148'200 CHF) fasst ${a("https://www.swissmem.ch/de/wissen/personalwesen/arbeitsrecht/sozialversicherungsbeitraege-2026.html", "Swissmem")} zusammen. Der Solidaritätsbeitrag der ALV wird seit 2023 nicht mehr erhoben.</p>` },
      ],
      faq: [
        { q: "Wie viel vom Lohn geht an die Sozialversicherungen?", a: "Mindestens 6,4 % vom Brutto (5,3 % AHV/IV/EO und 1,1 % ALV), dazu NBU und vor allem das BVG, das je nach Alter und Kasse variiert. Im Beispiel oben total 12,7 %." },
        { q: "Warum weicht mein Nettolohn von der Berechnung ab?", a: "BVG-Satz Ihrer Kasse, NBU Ihrer Branche, Krankentaggeld oder Quellensteuer können das Resultat verändern: Passen Sie sie in salaro an." },
        { q: "Gibt es über 148'200 CHF noch einen ALV-Beitrag?", a: "Nein. Der Solidaritätsbeitrag von 0,5 % wird seit dem 1. Januar 2023 nicht mehr erhoben: Die 1,1 % enden beim Plafond." },
      ],
    },
  },

  ideo: {
    fr: {
      sections: [
        { h2: "Comment ça marche", html: "<p>Chaque entreprise suisse reçoit un <b>numéro d'identification des entreprises (IDE)</b>, aussi appelé UID, au format CHE-123.456.789. Il est attribué une seule fois, ne change jamais et ne contient aucune information sur l'entreprise. Le dernier chiffre est une <b>clé de contrôle</b> qui détecte les fautes de frappe.</p><p>ideo enlève les lettres et la ponctuation, vérifie les 9 chiffres et recalcule la clé : on multiplie les 8 premiers chiffres par les poids 5, 4, 3, 2, 7, 6, 5, 4, on additionne, et la clé vaut 11 moins le reste de la division par 11 (0 si le reste est nul ; un résultat de 10 n'est jamais attribué). ideo ne vérifie pas que l'entreprise existe : pour cela, consultez le registre IDE de la Confédération.</p>" },
        { h2: "Exemple chiffré", html: "<p>Numéro fictif CHE-123.456.788. Calcul : 1×5 + 2×4 + 3×3 + 4×2 + 5×7 + 6×6 + 7×5 + 8×4 = 168. 168 divisé par 11 laisse un reste de 3, donc la clé vaut 11 − 3 = <b>8</b>. Le numéro se termine bien par 8 : il est valide. Avec CHE-123.456.789, ideo signale une erreur.</p>" },
        { h2: "Base légale et sources", html: `<p>L'IDE est régi par la ${a(LIDE_FR, "loi fédérale sur le numéro d'identification des entreprises (LIDE)")} : l'Office fédéral de la statistique l'attribue gratuitement à chaque entité. Les données publiques des entreprises se consultent dans le ${a("https://www.uid.admin.ch/", "registre IDE")}.</p>` },
      ],
      faq: [
        { q: "Quelle différence entre IDE, UID et numéro de TVA ?", a: "IDE (français) et UID (allemand) désignent le même numéro CHE-123.456.789. Une entreprise assujettie à la TVA utilise ce numéro suivi de « TVA » (ou MWST, IVA)." },
        { q: "Où trouver l'IDE d'une entreprise ?", a: "Sur ses factures et dans le registre IDE public de la Confédération (uid.admin.ch), qui permet de chercher par nom." },
        { q: "Un numéro valide pour ideo est-il forcément attribué ?", a: "Non. ideo vérifie la structure et la clé de contrôle ; seule une recherche dans le registre IDE confirme qu'une entreprise porte ce numéro." },
      ],
    },
    de: {
      sections: [
        { h2: "So funktioniert's", html: "<p>Jedes Schweizer Unternehmen erhält eine <b>Unternehmens-Identifikationsnummer (UID)</b> im Format CHE-123.456.789. Sie wird nur einmal vergeben, ändert sich nie und enthält keine Angaben über das Unternehmen. Die letzte Ziffer ist eine <b>Prüfziffer</b>, die Tippfehler erkennt.</p><p>ideo entfernt Buchstaben und Satzzeichen, prüft die 9 Ziffern und berechnet die Prüfziffer neu: Die ersten 8 Ziffern werden mit den Gewichten 5, 4, 3, 2, 7, 6, 5, 4 multipliziert und addiert; die Prüfziffer ist 11 minus der Rest der Division durch 11 (0, wenn kein Rest bleibt; das Ergebnis 10 wird nie vergeben). Ob das Unternehmen existiert, prüft ideo nicht: Dafür gibt es das UID-Register des Bundes.</p>" },
        { h2: "Rechenbeispiel", html: "<p>Fiktive Nummer CHE-123.456.788. Rechnung: 1×5 + 2×4 + 3×3 + 4×2 + 5×7 + 6×6 + 7×5 + 8×4 = 168. 168 geteilt durch 11 ergibt den Rest 3, die Prüfziffer ist also 11 − 3 = <b>8</b>. Die Nummer endet auf 8: Sie ist gültig. Bei CHE-123.456.789 meldet ideo einen Fehler.</p>" },
        { h2: "Rechtsgrundlage", html: `<p>Die UID ist im ${a(LIDE_DE, "Bundesgesetz über die Unternehmens-Identifikationsnummer (UIDG)")} geregelt: Das Bundesamt für Statistik vergibt sie kostenlos an jede Einheit. Die öffentlichen Unternehmensdaten stehen im ${a("https://www.uid.admin.ch/", "UID-Register")}.</p>` },
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen UID, IDE und MWST-Nummer?", a: "UID (deutsch) und IDE (französisch) bezeichnen dieselbe Nummer CHE-123.456.789. Ein MWST-pflichtiges Unternehmen verwendet sie mit dem Zusatz «MWST» (oder TVA, IVA)." },
        { q: "Wo finde ich die UID eines Unternehmens?", a: "Auf seinen Rechnungen und im öffentlichen UID-Register des Bundes (uid.admin.ch), mit Suche nach Namen." },
        { q: "Ist eine für ideo gültige Nummer auch vergeben?", a: "Nicht unbedingt. ideo prüft Struktur und Prüfziffer; nur eine Suche im UID-Register bestätigt, dass ein Unternehmen diese Nummer trägt." },
      ],
    },
  },
};

export function toolContent(lang: Lang, slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug]?.[lang];
}
