import crypto from "crypto";

function hashPrompt(prompt: string) {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export type CallResult = {
  ok: boolean;
  data?: unknown;
  error?: string;
  promptHash?: string;
};

const DEFAULT_TIMEOUT_MS = 30_000;

function getTimeoutMs() {
  const parsed = Number(process.env.FOUNDRY_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export async function callFoundry(prompt: string, history?: { role: string; content: string }[]): Promise<CallResult> {
  const endpoint = process.env.FOUNDRY_ENDPOINT;
  const apiKey = process.env.FOUNDRY_API_KEY;
  const deployment = process.env.FOUNDRY_DEPLOYMENT;

  if (!endpoint || !apiKey || !deployment) {
    return { ok: false, error: "Foundry environment variables not set" };
  }

  const promptHash = hashPrompt(prompt);

  const messages = history && history.length > 0
    ? history.concat([{ role: "user", content: prompt }])
    : [{ role: "user", content: prompt }];

  try {
    let host: string;
    try {
      host = new URL(endpoint).host;
    } catch {
      host = endpoint.replace(/^https?:\/\//, "").split("/")[0];
    }

    // Versions ordered by preference — 2024-05-01-preview confirmed working on this resource
    const apiVersions = ["2024-05-01-preview", "2024-02-15-preview", "2024-10-21", "2025-01-01-preview"];

    const attemptErrors: string[] = [];

    for (const ver of apiVersions) {
      const url = `https://${host}/models/chat/completions?api-version=${encodeURIComponent(ver)}`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            model: deployment,
            messages,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (resp.ok) {
          const data = await resp.json();
          return { ok: true, data, promptHash };
        }

        const text = await resp.text();
        const short = text.slice(0, 250).replace(/\n/g, " ");
        attemptErrors.push(`${ver}: ${resp.status} ${short}`);

        if (resp.status === 400 && /api version not supported/i.test(short)) {
          continue;
        }

        return { ok: false, error: `Foundry ${resp.status}: ${short}`, promptHash };
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return { ok: false, error: "Foundry request timed out", promptHash };
        }
        const msg = err instanceof Error ? err.message : String(err);
        attemptErrors.push(`${ver}: ${msg}`);
        continue;
      }
    }

    const details = attemptErrors.length ? attemptErrors.join(" | ") : "no details";
    return { ok: false, error: `All api-version attempts failed: ${details}`, promptHash };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), promptHash };
  }
}

export default callFoundry;
