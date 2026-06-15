type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitRpcRow = {
  allowed: boolean;
  remaining: number;
  retry_after: number;
  reset_at: string;
};

type RateLimitRpcClient = {
  rpc: (
    functionName: "check_api_rate_limit",
    args: { p_key: string; p_limit: number; p_window_seconds: number }
  ) => PromiseLike<{ data: RateLimitRpcRow[] | RateLimitRpcRow | null; error: { message: string } | null }>;
};

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions) {
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimitHeaders(result: { limit: number; remaining: number; retryAfter: number }) {
  return {
    "Retry-After": String(result.retryAfter),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
}

export async function checkDistributedRateLimit(
  client: RateLimitRpcClient,
  options: { key: string; limit: number; windowSeconds: number; fallbackWindowMs?: number }
) {
  const { key, limit, windowSeconds, fallbackWindowMs = windowSeconds * 1000 } = options;

  try {
    const { data, error } = await client.rpc("check_api_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        return {
          allowed: row.allowed,
          limit,
          remaining: row.remaining,
          retryAfter: row.retry_after,
          source: "supabase" as const,
        };
      }
    }

    if (error) console.error("Distributed rate limit fallback", { message: error.message });
  } catch (error) {
    console.error("Distributed rate limit failed", { message: error instanceof Error ? error.message : String(error) });
  }

  const fallback = checkRateLimit({ key, limit, windowMs: fallbackWindowMs });
  return {
    allowed: fallback.allowed,
    limit,
    remaining: fallback.remaining,
    retryAfter: Math.max(Math.ceil((fallback.resetAt - Date.now()) / 1000), 0),
    source: "memory" as const,
  };
}
