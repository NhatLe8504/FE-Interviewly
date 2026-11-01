export interface EmbedVideoInfo {
  isIframe: boolean;
  embedUrl: string;
  originalUrl: string;
}

/**
 * Parses video URLs (YouTube, Vimeo, MP4 direct) into appropriate player format.
 * Converts youtube.com/watch?v=... and youtu.be/... into embeddable URLs.
 */
export function parseVideoUrl(url: string | null | undefined): EmbedVideoInfo | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      isIframe: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      originalUrl: trimmed,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      isIframe: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // Direct MP4 / WebM / Cloudinary
  return {
    isIframe: false,
    embedUrl: trimmed,
    originalUrl: trimmed,
  };
}
