import type { Metadata, Viewport } from "next";

const CANON = "https://calorio.ch/confidentialite-calorio";

export const metadata: Metadata = {
  title: "Politique de confidentialité — calorio",
  description: "Comment calorio traite tes données : compte, journal, poids, coach IA, photo, duo, paiements. Suppression du compte en un clic. Aucune revente de données.",
  alternates: { canonical: CANON },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const MAJ = "25 septembre 2026";

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

        <h2 className="pv-h2">Health Connect et données d'activité (application Android)</h2>
        <p>Sur l'application Android, calorio peut, <b>uniquement avec ton accord explicite</b>, lire certaines données depuis <b>Health Connect</b> (le hub de santé de Google) :</p>
        <ul className="pv-ul">
          <li><b>Nombre de pas</b> du jour ;</li>
          <li><b>Calories dépensées</b> (actives et totales) mesurées par ton téléphone ou ta montre connectée.</li>
        </ul>
        <p>Ces données sont lues <b>en lecture seule</b> : calorio n'écrit jamais rien dans Health Connect. Elles servent <b>exclusivement</b> à affiner l'estimation de ta dépense énergétique quotidienne, et donc ta cible de calories et de macros — c'est le cœur du service que tu demandes. Elles sont traitées <b>sur ton appareil</b> pour ce calcul, ne sont <b>ni vendues ni partagées</b> avec des tiers, et ne sont <b>jamais utilisées à des fins publicitaires</b>. calorio n'accède à aucune autre catégorie de données de santé (fréquence cardiaque, sommeil, glycémie, etc.).</p>
        <p>Tu peux <b>révoquer cet accès à tout moment</b> depuis Health Connect (Paramètres Android → Applications → Health Connect), ou en désinstallant l'application. L'usage de Health Connect par calorio respecte la <a href="https://developer.android.com/health-and-fitness/guides/health-connect" target="_blank" rel="noopener">politique de Google relative à Health Connect</a>.</p>

        <h2 className="pv-h2">Données traitées si tu crées un compte</h2>
        <p>Si tu crées un compte gratuit (pour synchroniser entre appareils), nous traitons :</p>
        <ul className="pv-ul">
          <li><b>Adresse e-mail</b> — pour créer et sécuriser ton compte (connexion par lien e-mail ou Google).</li>
          <li><b>Données de suivi</b> — profil (âge, sexe, taille, poids, niveau d'activité, objectif), journal alimentaire, séances de sport, hydratation, historique de poids, repas et aliments enregistrés, préférences alimentaires (dont allergies), trophées et conversations favorites avec Vito — afin de synchroniser ton compte entre tes appareils.</li>
          <li><b>Statut d'abonnement</b> (gratuit / Pro) et, si tu actives les notifications, l'adresse technique d'abonnement push de chacun de tes appareils.</li>
          <li><b>Parrainage</b> — ton code d'invitation et les liens de parrainage (qui a invité qui), pour attribuer les mois offerts une fois le filleul actif.</li>
        </ul>
        <p><b>Base légale.</b> Tes données de poids et d'alimentation sont des données sur la santé, donc des données sensibles. Nous les traitons parce que tu le demandes expressément : en créant un compte, en activant la synchronisation ou en utilisant une fonction (coach, photo, duo), tu consens à ce traitement pour cette finalité (art. 6 al. 6-7 nLPD ; art. 6(1)(a) et 9(2)(a) RGPD). Tu peux retirer ce consentement à tout moment en supprimant ton compte.</p>

        <h2 className="pv-h2">Coach IA « Vito »</h2>
        <p>Quand tu écris à Vito (quelques messages d'essai gratuits, puis illimité avec Pro), nous transmettons à l'API <b>Google Gemini</b>, uniquement pour générer la réponse : tes messages, ton profil de base (sexe, âge, poids, taille, activité, objectif, poids visé), ta cible calorique, les aliments et quantités notés aujourd'hui, ta tendance de poids et tes préférences alimentaires (régime, allergies, aliments aimés ou non). Nous n'y joignons ni ton nom ni ton e-mail. N'y saisis pas d'informations que tu ne souhaites pas transmettre.</p>

        <h2 className="pv-h2">Analyse de repas en photo (Pro)</h2>
        <p>La photo de ton assiette est envoyée à <b>Google Gemini</b> pour identifier les aliments et estimer les quantités. calorio ne conserve pas la photo : seul le résultat que tu choisis d'ajouter entre dans ton journal.</p>

        <h2 className="pv-h2">Duo (binôme)</h2>
        <p>Le duo ne s'active que lorsque <b>chacun a saisi le code de l'autre</b>. Ton binôme voit alors uniquement un résumé du jour : calories consommées, cible, pourcentage atteint et série. Jamais le détail de ton journal ni ton poids. Tu peux délier le duo à tout moment.</p>

        <h2 className="pv-h2">Recherche d'aliments</h2>
        <p>Les recherches d'aliments et les codes-barres scannés sont transmis, via notre serveur et sans donnée personnelle, à la base ouverte <b>Open Food Facts</b>.</p>

        <h2 className="pv-h2">Paiements (Pro)</h2>
        <p>Les paiements de l'abonnement Pro sont traités par <b>Stripe</b>. calorio ne voit ni ne stocke tes données de carte : elles sont gérées directement par Stripe, prestataire de paiement certifié. Tu gères ton abonnement (carte, factures, résiliation) depuis l'app : Aide → Mon compte → Mon abonnement.</p>

        <h2 className="pv-h2">Mesure d'audience et protection contre les abus</h2>
        <p>calorio utilise une mesure d'audience <b>sans cookie</b> : nous comptons des pages vues de façon <b>agrégée</b>, sans stocker ton adresse IP ni créer d'identifiant publicitaire. Pour empêcher l'usage abusif du coach IA, nous conservons des compteurs associés à une <b>empreinte chiffrée</b> de l'adresse IP (calculée avec une clé secrète : l'adresse elle-même n'est jamais enregistrée). Les compteurs journaliers sont effacés après quelques jours. Aucun traceur publicitaire.</p>

        <h2 className="pv-h2">Hébergement et sous-traitants</h2>
        <p>Les données de compte sont hébergées via <b>Supabase</b> (base de données) et l'application est servie par <b>Vercel</b>. Le coach et l'analyse photo utilisent <b>Google Gemini</b>, les paiements <b>Stripe</b> et la recherche d'aliments <b>Open Food Facts</b>. Les polices de caractères sont hébergées par calorio lui-même (aucune requête vers Google Fonts). Ces prestataires peuvent traiter des données hors de Suisse/UE avec des garanties appropriées (clauses contractuelles types).</p>

        <h2 className="pv-h2">Durée de conservation</h2>
        <p>Tes données de compte sont conservées tant que ton compte existe, puis effacées immédiatement à sa suppression (journal, poids, profil, préférences, abonnements aux notifications et compteurs liés au compte). Seuls les justificatifs de paiement conservés par Stripe restent soumis aux obligations comptables légales. Sans compte, les données restent sur ton appareil jusqu'à ce que tu les effaces.</p>

        <h2 className="pv-h2">Tes droits</h2>
        <p>Tu disposes des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Concrètement, dans l'application :</p>
        <ul className="pv-ul">
          <li><b>Exporter</b> toutes tes données : Aide → Mes données → Télécharger.</li>
          <li><b>Supprimer ton compte</b> et toutes les données associées, immédiatement et définitivement : Aide → Mon compte → Supprimer mon compte. Un abonnement en cours est résilié.</li>
          <li>À la <b>déconnexion</b>, une fois tes données bien enregistrées dans ton compte, elles sont retirées de l'appareil et ses notifications sont désactivées.</li>
        </ul>
        <p>Pour toute question ou demande : <a href="mailto:m.kaeser90@gmail.com">m.kaeser90@gmail.com</a>. Tu peux aussi t'adresser au Préposé fédéral à la protection des données et à la transparence (PFPDT).</p>

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
