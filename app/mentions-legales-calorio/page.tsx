import type { Metadata, Viewport } from "next";
import { PV_CSS as CSS } from "@/lib/calorioLegalStyle";

// Mentions légales + conditions de l'abonnement calorio Pro (servies aussi sur calorio.ch/mentions-legales,
// /impressum et /conditions). Les exigences TWINT demandent : nom complet de l'exploitante, adresse
// complète, un contact (e-mail ou téléphone) et des prix en CHF.
const CANON = "https://calorio.ch/mentions-legales";

export const metadata: Metadata = {
  title: "Mentions légales et conditions — calorio",
  description: "Éditrice de calorio, adresse et contact, prix de calorio Pro en CHF, essai, résiliation et droit applicable.",
  alternates: { canonical: CANON },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const MAJ = "14 octobre 2026";
const OP = {
  name: "Krystel Fiorbianco",
  brand: "Swiss Digital Studio",
  street: "Route de Derborence 28",
  city: "1976 Aven",
  country: "Suisse",
  phone: "+41 78 711 64 11",
  phoneHref: "+41787116411",
  email: "contact@swissdigitalstudio.ch",
};

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pv-bg" aria-hidden />
      <main className="pv">
        <header className="pv-top">
          <a className="pv-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <h1 className="pv-h1">Mentions légales et conditions</h1>
        <p className="pv-maj">Dernière mise à jour : {MAJ}</p>

        <h2 className="pv-h2" id="editeur">Éditrice et exploitante</h2>
        <p>
          calorio (calorio.ch et l&apos;application Android « calorio: Calorie Counter ») est édité et exploité par
          <b> {OP.name}</b>, entreprise individuelle, sous la marque {OP.brand}.
        </p>
        <p>
          {OP.name}<br />
          {OP.street}<br />
          {OP.city}<br />
          {OP.country}
        </p>
        <p>
          Téléphone : <a href={`tel:${OP.phoneHref}`}>{OP.phone}</a><br />
          E-mail : <a href={`mailto:${OP.email}`}>{OP.email}</a>
        </p>
        <p>Responsable de la publication : {OP.name}.</p>

        <h2 className="pv-h2" id="prix">Prix de calorio Pro</h2>
        <p>calorio est gratuit. L&apos;abonnement facultatif <b>calorio Pro</b> coûte, en francs suisses, taxes comprises :</p>
        <ul className="pv-ul">
          <li><b>CHF 4.90 par mois</b> (abonnement mensuel) ;</li>
          <li><b>CHF 39.– par an</b> (abonnement annuel).</li>
        </ul>
        <p>calorio Pro comprend : Vito, le coach nutrition IA, sans limite ; l&apos;analyse des repas en photo ; des rappels du soir personnalisés selon tes calories restantes ; ton bilan de la semaine, chaque dimanche.</p>

        <h2 className="pv-h2" id="conditions">Conditions de l&apos;abonnement</h2>
        <p><b>Essai gratuit.</b> Un premier abonnement commence par 7 jours gratuits. Rien n&apos;est prélevé si tu résilies avant la fin de l&apos;essai.</p>
        <p><b>Renouvellement.</b> L&apos;abonnement se renouvelle automatiquement à la fin de chaque période (mois ou année) jusqu&apos;à sa résiliation.</p>
        <p><b>Paiement.</b> Sur calorio.ch, les paiements sont traités par Stripe (carte bancaire, TWINT et autres moyens proposés au paiement) ; tes données de paiement sont saisies et conservées par Stripe, jamais par calorio. Dans l&apos;application Android, l&apos;abonnement est acheté et géré par Google Play.</p>
        <p><b>Résiliation.</b> Tu peux résilier à tout moment, en un clic : sur calorio.ch dans « Mon compte → Mon abonnement », ou dans Google Play → Abonnements pour un achat fait dans l&apos;application. La résiliation prend effet à la fin de la période en cours ; tu gardes l&apos;accès Pro jusque-là, sans nouveau prélèvement ensuite. Les périodes entamées ne sont pas remboursées, sauf disposition légale impérative.</p>
        <p><b>Changement de prix.</b> Un changement de prix est annoncé à l&apos;avance et ne s&apos;applique qu&apos;aux périodes suivantes.</p>
        <p><b>Nature du service.</b> calorio et Vito donnent des estimations et des conseils généraux de nutrition. Ils ne remplacent pas l&apos;avis d&apos;un·e médecin ou d&apos;un·e diététicien·ne. Le service est fourni en l&apos;état ; des interruptions techniques peuvent survenir.</p>
        <p><b>Questions et réclamations :</b> <a href={`mailto:${OP.email}`}>{OP.email}</a> ou <a href={`tel:${OP.phoneHref}`}>{OP.phone}</a>.</p>

        <h2 className="pv-h2" id="hebergement">Hébergement</h2>
        <p>Le site est hébergé par Vercel Inc. (San Francisco, États-Unis). Les données de compte sont stockées chez Supabase, sur des serveurs situés dans l&apos;Union européenne. Voir la <a href="/confidentialite-calorio">politique de confidentialité</a>.</p>

        <h2 className="pv-h2" id="droit">Propriété intellectuelle et droit applicable</h2>
        <p>Les contenus de calorio (textes, interface, code, logo) sont protégés ; toute reproduction sans autorisation est interdite. Le site, l&apos;application et ces conditions sont régis par le droit suisse. Le for est à Sion (Valais), sous réserve d&apos;un for impératif différent prévu par la loi.</p>

        <h2 className="pv-h2" id="de" lang="de">Impressum (Deutsch)</h2>
        <p lang="de">calorio wird von {OP.name} (Einzelunternehmen, Marke {OP.brand}), {OP.street}, {OP.city}, Schweiz, betrieben. Telefon {OP.phone}, E-Mail {OP.email}. calorio Pro kostet CHF 4.90 pro Monat oder CHF 39.– pro Jahr (inkl. Steuern), mit 7 Tagen Gratis-Test, automatischer Verlängerung und jederzeitiger Kündigung auf das Ende der laufenden Periode. Es gilt Schweizer Recht, Gerichtsstand Sitten (Wallis).</p>

        <h2 className="pv-h2" id="en" lang="en">Legal notice (English)</h2>
        <p lang="en">calorio is published by {OP.name} (sole proprietorship, brand {OP.brand}), {OP.street}, {OP.city}, Switzerland. Phone {OP.phone}, email {OP.email}. calorio Pro costs CHF 4.90 per month or CHF 39 per year (taxes included), with a 7-day free trial, automatic renewal and cancellation at any time, effective at the end of the current period. Swiss law applies; place of jurisdiction is Sion (Valais).</p>

        <p className="pv-back"><a href="https://calorio.ch/">← Retour à calorio</a></p>
      </main>
    </>
  );
}
