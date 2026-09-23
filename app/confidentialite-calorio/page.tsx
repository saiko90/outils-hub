import type { Metadata, Viewport } from "next";

const CANON = "https://calorio.ch/confidentialite-calorio";

export const metadata: Metadata = {
  title: "Politique de confidentialité — calorio",
  description: "Comment calorio traite tes données : compte, journal, poids, coach IA, analytics, paiements. Aucune revente de données.",
  alternates: { canonical: CANON },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const MAJ = "23 septembre 2026";

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pv-bg" aria-hidden />
      <main className="pv">
        <header className="pv-top">
          <a className="pv-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <h1 className="pv-h1">Politique de confidentialité</h1>
        <p className="pv-maj">Dernière mise à jour : {MAJ}</p>

        <p className="pv-intro">calorio est un compteur de calories et journal nutritionnel. Cette page explique quelles données sont traitées, pourquoi, et tes droits. En résumé : <b>tes données ne sont jamais vendues</b>, et l'application fonctionne même sans créer de compte.</p>

        <h2 className="pv-h2">Responsable du traitement</h2>
        <p>calorio est édité par <b>Krystel Fiorbianco — Swiss Digital Studio</b>, Valais, Suisse. Contact : <a href="mailto:m.kaeser90@gmail.com">m.kaeser90@gmail.com</a>.</p>

        <h2 className="pv-h2">Utilisation sans compte</h2>
        <p>Par défaut, tu peux utiliser calorio <b>sans créer de compte</b>. Dans ce cas, tes données (profil, journal alimentaire, poids, préférences) restent stockées <b>localement sur ton appareil</b> et ne sont pas transmises à nos serveurs.</p>

        <h2 className="pv-h2">Données traitées si tu crées un compte</h2>
        <p>Si tu crées un compte gratuit (pour synchroniser entre appareils), nous traitons :</p>
        <ul className="pv-ul">
          <li><b>Adresse e-mail</b> — pour créer et sécuriser ton compte (authentification).</li>
          <li><b>Données de suivi</b> — profil (âge, sexe, taille, poids, objectif), journal alimentaire, historique de poids, préférences alimentaires, série et hydratation — afin de synchroniser ton compte entre téléphone et ordinateur.</li>
          <li><b>Statut d'abonnement</b> (gratuit / Pro) et, pour les notifications, ton abonnement push si tu l'actives.</li>
        </ul>
        <p>Base légale : l'exécution du service que tu demandes (art. 31 nLPD / art. 6(1)(b) RGPD).</p>

        <h2 className="pv-h2">Coach IA « Vito »</h2>
        <p>Si tu utilises le coach Vito (option Pro), tes messages et un résumé de ta journée nutritionnelle (calories, macros) sont envoyés à l'API <b>Google Gemini</b> uniquement pour générer une réponse. Nous n'y joignons pas ton identité. N'y saisis pas d'informations sensibles que tu ne souhaites pas transmettre.</p>

        <h2 className="pv-h2">Paiements (Pro)</h2>
        <p>Les paiements de l'abonnement Pro sont traités par <b>Stripe</b>. calorio ne voit ni ne stocke tes données de carte : elles sont gérées directement par Stripe, prestataire de paiement certifié.</p>

        <h2 className="pv-h2">Mesure d'audience</h2>
        <p>calorio utilise une mesure d'audience <b>sans cookie</b> et respectueuse de la vie privée : nous comptons des pages vues de façon <b>agrégée</b>, sans stocker ton adresse IP ni créer d'identifiant publicitaire. Aucun traceur tiers à des fins publicitaires.</p>

        <h2 className="pv-h2">Hébergement et sous-traitants</h2>
        <p>Les données de compte sont hébergées via <b>Supabase</b> (base de données) et l'application est servie par <b>Vercel</b>. Le coach utilise <b>Google Gemini</b> et les paiements <b>Stripe</b>. Ces prestataires agissent comme sous-traitants et peuvent traiter des données hors de Suisse/UE avec des garanties appropriées.</p>

        <h2 className="pv-h2">Durée de conservation</h2>
        <p>Tes données de compte sont conservées tant que ton compte existe. Tu peux les exporter ou les supprimer à tout moment (voir ci-dessous).</p>

        <h2 className="pv-h2">Tes droits</h2>
        <p>Tu disposes des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Concrètement :</p>
        <ul className="pv-ul">
          <li><b>Exporter</b> tes données depuis l'application (écran Aide → export).</li>
          <li><b>Supprimer</b> tes données locales depuis l'application, ou demander la suppression de ton compte par e-mail à <a href="mailto:m.kaeser90@gmail.com">m.kaeser90@gmail.com</a>.</li>
        </ul>

        <h2 className="pv-h2">Enfants</h2>
        <p>calorio n'est pas destiné aux enfants de moins de 13 ans et ne leur est pas spécifiquement adressé.</p>

        <h2 className="pv-h2">Absence de revente</h2>
        <p>Nous ne vendons pas et ne louons pas tes données personnelles. calorio ne diffuse pas de publicité.</p>

        <h2 className="pv-h2">Modifications</h2>
        <p>Cette politique peut évoluer. La date de dernière mise à jour en haut de page fait foi.</p>

        <p className="pv-back"><a href="https://calorio.ch/">← Retour à calorio</a></p>
      </main>
    </>
  );
}

const CSS = `
body{background:#f3f7f2 !important}
.pv-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.pv{max-width:720px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit;line-height:1.6}
.pv a{color:#16a34a}
.pv-top{padding:8px 2px 10px}
.pv-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.pv-brand img{border-radius:9px}
.pv-h1{font-size:1.9rem;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:8px 0 4px}
.pv-maj{color:#9aa2b4;font-size:.85rem;margin:0 0 18px}
.pv-intro{font-size:1.02rem;color:#4b5563;margin:0 0 8px}
.pv-intro b{color:#166a3a}
.pv-h2{font-size:1.18rem;font-weight:800;color:#1a2030;margin:26px 0 8px;padding-bottom:8px;border-bottom:1px solid #f6cdd9}
.pv p{margin:0 0 10px;color:#3b4252}
.pv b{color:#232a37}
.pv-ul{margin:0 0 12px;padding-left:20px;color:#3b4252}
.pv-ul li{margin:6px 0}
.pv-back{margin:28px 0 0}
.pv-back a{text-decoration:none;font-weight:700}
@media(max-width:560px){.pv-h1{font-size:1.55rem}}
`;
