export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Render cold start + Yahoo fetch can exceed 40s */
export const PREDICTION_TIMEOUT_MS = 90_000;
const WARMUP_TIMEOUT_MS = 20_000;

/**
 * Wake the API (e.g. Render free tier) before a heavy /market/prediction call.
 */
export async function warmupApi() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPrediction({ symbol, start, interval = "1h", signal }) {
  await warmupApi();

  const res = await fetch(
    `${API_BASE_URL}/market/prediction?symbol=${encodeURIComponent(symbol)}&start=${encodeURIComponent(start)}&interval=${encodeURIComponent(interval)}`,
    { signal }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text || `Prediction API error (${res.status}) at ${API_BASE_URL}`
    );
  }
  return res.json();
}

export async function fetchWeekly({ symbol, start, interval = "1h" }) {
  const res = await fetch(
    `${API_BASE_URL}/market/weekly?symbol=${encodeURIComponent(symbol)}&start=${encodeURIComponent(start)}&interval=${encodeURIComponent(interval)}`
  );
  if (!res.ok) throw new Error(`Market API error (${res.status})`);
  const json = await res.json();
  if (!json.data?.length) throw new Error("Market data empty");
  return json.data;
}
