"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import PredictionCard, { PredictionError, PredictionSkeleton } from "./PredictionCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SYMBOLS = ["BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD", "BNB-USD"];
const INTERVAL = "1h";
const PREDICTION_TIMEOUT_MS = 40_000; // 40s — handles Render cold start

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchMarketPeriod({ symbol, start }) {
  const res = await fetch(
    `${API_BASE_URL}/market/weekly?symbol=${symbol}&start=${start}`
  );
  if (!res.ok) throw new Error(`Market API error (${res.status})`);
  const json = await res.json();
  if (!json.data || json.data.length === 0) throw new Error("Market data empty");
  return json.data;
}

async function fetchPrediction({ symbol, start, signal }) {
  const res = await fetch(
    `${API_BASE_URL}/market/prediction?symbol=${symbol}&start=${start}&interval=${INTERVAL}`,
    { signal }
  );
  if (!res.ok) throw new Error(`Prediction API error (${res.status})`);
  return res.json();
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CandlestickChartWithPrediction() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [start,  setStart]  = useState("2025-01-01");
  const [search, setSearch] = useState("");

  const [prediction,      setPrediction]      = useState(null);
  const [predLoading,     setPredLoading]      = useState(true);
  const [predError,       setPredError]        = useState(null);

  const filteredSymbols = SYMBOLS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  // ── Chart data query ────────────────────────────────────────────────────────
  const marketQuery = useQuery({
    queryKey: ["market-period", symbol, start],
    queryFn:  () => fetchMarketPeriod({ symbol, start }),
    retry: 1,
  });

  // ── Prediction fetch (with timeout + abort) ─────────────────────────────────
  useEffect(() => {
    if (!symbol || !start) return;

    setPrediction(null);
    setPredLoading(true);
    setPredError(null);

    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, PREDICTION_TIMEOUT_MS);

    fetchPrediction({ symbol, start, signal: controller.signal })
      .then((data) => {
        setPrediction(data);
        setPredError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          setPredError("Request timed out — backend took too long to respond.");
        } else {
          setPredError(err.message || "Unknown prediction error.");
        }
      })
      .finally(() => {
        clearTimeout(timer);
        setPredLoading(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [symbol, start]);

  // ── Chart options ───────────────────────────────────────────────────────────
  const marketData = marketQuery.data || [];
  const candles = marketData.map((row) => ({
    x: new Date(row.date),
    y: [row.open, row.high, row.low, row.close],
  }));

  const options = {
    chart: {
      type: "candlestick",
      background: "transparent",
      toolbar: { show: false },
    },
    theme: { mode: "dark" },
    xaxis: { type: "datetime" },
    grid: { borderColor: "#1f2937" },
    tooltip: {
      shared: false,
      custom: ({ dataPointIndex }) => {
        const c = marketData[dataPointIndex];
        if (!c) return "";
        return `
          <div style="padding:10px;background:#111;color:#e5e7eb;font-size:12px;border-radius:6px;min-width:220px;">
            <div style="font-weight:600;margin-bottom:6px">${new Date(c.date).toLocaleString()}</div>
            <div><b>Candle Type:</b> ${c.single_candle_type ?? "—"}</div>
            <div><b>Pattern Type:</b> ${c.pattern_type ?? "—"}</div>
            <div><b>Direction:</b>
              <span style="color:${c.direction === "UP" ? "#22c55e" : c.direction === "DOWN" ? "#ef4444" : "#eab308"}">
                ${c.direction ?? "—"}
              </span>
            </div>
            <hr style="margin:6px 0;border-color:#333"/>
            <div><b>Body Ratio:</b> ${(c.body_ratio ?? 0).toFixed(2)}</div>
            <div><b>Future Return:</b> ${((c.future_return ?? 0) * 100).toFixed(2)}%</div>
            <hr style="margin:6px 0;border-color:#333"/>
            <div>Open: ${c.open}</div>
            <div>High: ${c.high}</div>
            <div>Low: ${c.low}</div>
            <div>Close: ${c.close}</div>
          </div>
        `;
      },
    },
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">
        {symbol} · {INTERVAL} · 1wk
      </h1>

      {/* Symbol search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search symbol…"
        className="w-full max-w-sm px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {/* Symbol selector */}
      <div className="flex gap-2 flex-wrap">
        {filteredSymbols.map((s) => (
          <button
            key={s}
            onClick={() => { setSymbol(s); setSearch(""); }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              symbol === s
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Date picker */}
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="px-3 py-1 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {/* Candlestick chart */}
      {marketQuery.isLoading ? (
        <div className="h-[420px] bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">
          Loading market data…
        </div>
      ) : marketQuery.isError ? (
        <div className="h-[420px] bg-red-950/10 border border-red-800/30 rounded-xl flex items-center justify-center text-red-400 text-sm px-6 text-center">
          <div>
            <p className="font-semibold mb-1">⚠ Failed to load market data</p>
            <p className="text-red-500/70">{marketQuery.error.message}</p>
            <p className="text-red-500/50 text-xs mt-2">
              Make sure the backend at <code>{API_BASE_URL}</code> is running.
            </p>
          </div>
        </div>
      ) : (
        <Chart
          options={options}
          series={[{ data: candles }]}
          type="candlestick"
          height={420}
        />
      )}

      {/* Prediction card — three states */}
      {predLoading && <PredictionSkeleton className="mt-6 max-w-2xl" />}
      {!predLoading && predError && <PredictionError message={predError} className="mt-6 max-w-2xl" />}
      {!predLoading && !predError && prediction && (
        <PredictionCard prediction={prediction} className="mt-6 max-w-2xl" />
      )}
    </div>
  );
}
