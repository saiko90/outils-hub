import Landing, { landingMetadata, landingViewport } from "./Landing";

export const metadata = landingMetadata("fr");
export const viewport = landingViewport;

export default function Page() {
  return <Landing lang="fr" />;
}
