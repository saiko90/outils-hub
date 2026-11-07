/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pages fusionnées (308) : imco (doublon d'imca) et la catégorie Données (rattachée à Dev).
  async redirects() {
    return ["", "/de", "/en"].flatMap((p) => [
      { source: `${p}/o/imco`, destination: `${p}/o/imca`, permanent: true },
      { source: `${p}/c/donnees`, destination: `${p}/c/dev`, permanent: true },
    ]);
  },
};
export default nextConfig;
