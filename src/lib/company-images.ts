const configuredHosts = (process.env.NEXT_PUBLIC_COMPANY_IMAGE_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter((host) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host));

export const COMPANY_IMAGE_HOSTS = Array.from(new Set([
  "res.cloudinary.com",
  "assets.ubuntu.com",
  ...configuredHosts,
]));

export function getCompanyImageUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      && COMPANY_IMAGE_HOSTS.includes(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}
