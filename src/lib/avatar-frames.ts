export function normalizeAvatarFramePath(frameSrc?: string | null): string | null {
  if (!frameSrc) return null;
  const trimmed = frameSrc.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}
