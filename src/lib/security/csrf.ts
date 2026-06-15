function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const allowedOrigins = new Set([requestOrigin, configuredOrigin].filter(Boolean));
  const origin = normalizeOrigin(request.headers.get("origin"));

  if (origin) return allowedOrigins.has(origin);

  const referer = normalizeOrigin(request.headers.get("referer"));
  if (referer) return allowedOrigins.has(referer);

  return false;
}
