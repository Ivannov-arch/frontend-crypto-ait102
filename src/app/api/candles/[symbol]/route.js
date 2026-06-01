export async function GET(request, { params }) {
  const { symbol } = params;

  // Uses RAPIDAPI_HOST from .env.local (yahoo-finance15.p.rapidapi.com)
  const host = process.env.RAPIDAPI_HOST || "yahoo-finance15.p.rapidapi.com";
  const url  = `https://${host}/api/v1/markets/stock/history?symbol=${symbol}&interval=1d&diffandsplits=false`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key":  process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": host,
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      throw new Error(`RapidAPI responded ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    // yahoo-finance15 returns { body: { "1234567890": { date, open, high, low, close, volume } } }
    const body = json?.body;
    if (!body || typeof body !== "object") {
      throw new Error("Unexpected API response shape — check the RapidAPI plan/endpoint.");
    }

    const candles = Object.values(body)
      .filter((entry) => entry.open != null && entry.high != null)
      .map((entry) => ({
        x: new Date(entry.date).getTime(),
        y: [
          parseFloat(entry.open),
          parseFloat(entry.high),
          parseFloat(entry.low),
          parseFloat(entry.close),
        ],
        volume: parseFloat(entry.volume ?? 0),
      }))
      .sort((a, b) => a.x - b.x); // ensure chronological order

    return Response.json({ candles });

  } catch (err) {
    console.error("[/api/candles] Error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
