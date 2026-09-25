import Landing, { landingMetadata, landingViewport } from "../Landing";

export const metadata = landingMetadata("en");
export const viewport = landingViewport;

export default function Page() {
  return <Landing lang="en" />;
}
