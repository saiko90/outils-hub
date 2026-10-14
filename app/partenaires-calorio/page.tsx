import type { Metadata, Viewport } from "next";
import { PV_CSS as CSS } from "@/lib/calorioLegalStyle";

// Programme partenaires de calorio (créateurs de contenu, coachs, diététicien·nes).
// Servi sur calorio.ch/partenaires (+ /de/partner, /en/partners) via le middleware.
const CANON = "https://calorio.ch/partenaires";

export const metadata: Metadata = {
  title: "Programme partenaires — calorio",
  description: "Créateurs, coachs, diététicien·nes : calorio Pro offert, −20 % pour votre communauté avec votre code, 30 % de commission sur la première année.",
  alternates: { canonical: CANON },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const MAIL = "contact@swissdigitalstudio.ch";
const SUBJECT = encodeURIComponent("Programme partenaires calorio");

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS + EXTRA }} />
      <div className="pv-bg" aria-hidden />
      <main className="pv">
        <header className="pv-top">
          <a className="pv-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <h1 className="pv-h1">Programme partenaires</h1>
        <p className="pv-intro">Tu crées du contenu sur la nutrition, le sport ou le bien-être, ou tu accompagnes des client·es comme coach ou diététicien·ne ? Fais découvrir calorio, le compteur de calories suisse, et gagne une commission sur chaque abonnement.</p>

        <div className="pa-grid">
          <div className="pa-card"><b>calorio Pro offert</b><span>Pour toi, tant que tu es partenaire, pour tester et en parler honnêtement.</span></div>
          <div className="pa-card"><b>−20 % pour ta communauté</b><span>Avec ton code personnel (par exemple LAURA20), pendant les 12 premiers mois.</span></div>
          <div className="pa-card"><b>30 % de commission</b><span>Sur tout ce que paient tes abonné·es la première année, versé chaque mois.</span></div>
        </div>

        <h2 className="pv-h2">Comment ça marche</h2>
        <ul className="pv-ul">
          <li><b>1.</b> Tu nous écris et on crée ton code personnel, avec ton lien : <code>calorio.ch/?code=TONCODE</code>.</li>
          <li><b>2.</b> Ton public s&apos;abonne sur calorio.ch avec ton lien ou ton code : le rabais de 20 % s&apos;applique automatiquement, après 7 jours d&apos;essai gratuit.</li>
          <li><b>3.</b> Chaque début de mois, on t&apos;envoie le relevé des abonnements faits avec ton code et on te verse 30 % des montants encaissés pendant leur première année, par virement (IBAN suisse ou européen).</li>
        </ul>

        <h2 className="pv-h2">Ce que ton public obtient</h2>
        <p>calorio Pro coûte normalement CHF 4.90 par mois ou CHF 39.– par an. Avec ton code : CHF 3.92 par mois ou CHF 31.20 la première année. Pro comprend Vito, le coach nutrition IA sans limite, l&apos;analyse des repas en photo, des rappels du soir personnalisés et un bilan chaque dimanche. L&apos;app de base reste gratuite, sans publicité, et connaît les produits Migros et Coop.</p>

        <h2 className="pv-h2">Nos quelques règles</h2>
        <ul className="pv-ul">
          <li>Indique clairement le partenariat dans tes publications (« pub », « partenariat » ou « Werbung »).</li>
          <li>Pas de promesse de perte de poids ni de régime extrême : calorio aide à suivre son alimentation, ce n&apos;est pas un dispositif médical.</li>
          <li>Ton public doit être majeur ou s&apos;adresser à des adultes.</li>
          <li>Pas de publicité payante (Google, Meta…) sur le nom « calorio » avec ton code.</li>
        </ul>

        <h2 className="pv-h2">Devenir partenaire</h2>
        <p>Écris-nous en indiquant ton compte (Instagram, TikTok, YouTube, site…) et le code que tu aimerais :</p>
        <p><a className="pa-btn" href={`mailto:${MAIL}?subject=${SUBJECT}`}>Écrire à {MAIL}</a></p>
        <p className="pv-maj">Programme géré par Krystel Fiorbianco (Swiss Digital Studio), Aven, Valais. Voir les <a href="/mentions-legales">mentions légales et conditions</a>.</p>

        <h2 className="pv-h2" id="de" lang="de">Partnerprogramm (Deutsch)</h2>
        <p lang="de">Für Creator, Coaches und Ernährungsberater·innen: calorio Pro gratis für dich, −20 % für deine Community mit deinem persönlichen Code (12 Monate) und 30 % Provision auf alles, was deine Abonnent·innen im ersten Jahr bezahlen, monatlich überwiesen. Kooperation bitte als Werbung kennzeichnen. Kontakt: <a href={`mailto:${MAIL}?subject=${SUBJECT}`}>{MAIL}</a>.</p>

        <h2 className="pv-h2" id="en" lang="en">Partner programme (English)</h2>
        <p lang="en">For creators, coaches and dietitians: free calorio Pro for you, 20% off for your audience with your personal code (12 months) and a 30% commission on everything your subscribers pay in their first year, paid monthly. Please label the partnership as an ad. Contact: <a href={`mailto:${MAIL}?subject=${SUBJECT}`}>{MAIL}</a>.</p>

        <p className="pv-back"><a href="https://calorio.ch/">← Retour à calorio</a></p>
      </main>
    </>
  );
}

const EXTRA = `
.pa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0 6px}
.pa-card{background:#fff;border:1px solid #dbe8de;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:6px}
.pa-card b{color:#12733a;font-size:1.02rem}
.pa-card span{color:#4b5563;font-size:.9rem;line-height:1.45}
.pa-btn{display:inline-block;background:linear-gradient(135deg,#1c9c55,#11743a);color:#fff !important;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:12px}
.pv code{background:#e6f2e9;padding:1px 6px;border-radius:6px;font-size:.92em}
@media(max-width:640px){.pa-grid{grid-template-columns:1fr}}
`;
