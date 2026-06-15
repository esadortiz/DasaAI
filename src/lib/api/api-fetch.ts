import { safeInternalPath } from "../security/redirects";

export type ApiFetchResult<T> =
  | { ok: true; status: number; data: T; response: Response }
  | { ok: false; status: number; error: string; response?: Response };

function currentPath() {
  if (typeof window === "undefined") return "/profile";
  return safeInternalPath(window.location.pathname + window.location.search, "/profile");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const next = encodeURIComponent(currentPath());
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign(`/login?next=${next}`);
  }
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}): Promise<ApiFetchResult<T>> {
  try {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const response = await fetch(input, {
      credentials: "include",
      ...init,
      headers,
    });
    const data = await parseJson(response);

    if (response.status === 401) {
      redirectToLogin();
      return { ok: false, status: 401, error: "Your session expired. Please sign in again.", response };
    }

    if (!response.ok) {
      const error = typeof data === "object" && data && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed. Please try again.";
      return { ok: false, status: response.status, error, response };
    }

    return { ok: true, status: response.status, data: data as T, response };
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
}
