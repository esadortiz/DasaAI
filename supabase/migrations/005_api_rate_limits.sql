-- Distributed rate limiting for server-side APIs.

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key, window_start)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, retry_after INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN QUERY SELECT false, 0, p_window_seconds, v_now + make_interval(secs => p_window_seconds);
    RETURN;
  END IF;

  v_window_start := to_timestamp(floor(extract(epoch FROM v_now) / p_window_seconds) * p_window_seconds);
  v_reset_at := v_window_start + make_interval(secs => p_window_seconds);

  INSERT INTO public.api_rate_limits(key, window_start, count, expires_at)
  VALUES (p_key, v_window_start, 1, v_reset_at + interval '5 minutes')
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.api_rate_limits.count + 1
  RETURNING count INTO v_count;

  DELETE FROM public.api_rate_limits WHERE expires_at < v_now;

  RETURN QUERY SELECT
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    greatest(ceil(extract(epoch FROM (v_reset_at - v_now)))::integer, 0),
    v_reset_at;
END;
$$;

REVOKE ALL ON FUNCTION public.check_api_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_api_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;
