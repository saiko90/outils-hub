import Landing, { landingMetadata, landingViewport } from "./Landing";

export const metadata = landingMetadata("fr");
export const viewport = landingViewport;
export const revalidate = 3600; // section « Nouveau dans le Mag »

export default function Page() {
  return <Landing lang="fr" />;
}
