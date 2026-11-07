/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pages fusionnées (308) : imco (doublon d'imca) et la catégorie Données (rattachée à Dev).
  async redirects() {
    // /de/kalorien n'a pas d'index propre : la page pivot « Schweizer Spezialitäten » en tient lieu (une page par intention).
    const deIndex = [{ source: "/de/kalorien", destination: "/de/kalorien/schweizer-spezialitaeten", permanent: true }];
    return deIndex.concat(["", "/de", "/en"].flatMap((p) => [
      { source: `${p}/o/imco`, destination: `${p}/o/imca`, permanent: true },
      { source: `${p}/c/donnees`, destination: `${p}/c/dev`, permanent: true },
    ]));
  },
};
export default nextConfig;
