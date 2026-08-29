export function siteUrl() {
  return (
    process.env["PUBLIC_SITE_URL"] ?? process.env["VITE_PUBLIC_SITE_URL"] ?? "http://localhost:8080"
  );
}
