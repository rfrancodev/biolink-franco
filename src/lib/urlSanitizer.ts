const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript):/i;

export function sanitizeUrl(url: string): string {
  if (!url || BLOCKED_PROTOCOLS.test(url.trim())) {
    return "#blocked";
  }
  return url;
}
