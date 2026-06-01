"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PredictionCard, { PredictionError, PredictionSkeleton } from "@/components/PredictionCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_SYMBOL = "BTC-USD";
const DEFAULT_START = "2025-01-01";
const INTERVAL = "1h";
const PREDICTION_TIMEOUT_MS = 40_000;

async function fetchWeekly(symbol, start) {
  const res = await fetch(
    `${API_BASE_URL}/market/weekly?symbol=${symbol}&start=${start}&interval=${INTERVAL}`
  );
  if (!res.ok) throw new Error(`Market API error (${res.status})`);
  const json = await res.json();
  if (!json.data?.length) throw new Error("Market data empty");
  return json.data;
}

async function fetchPrediction(symbol, start, signal) {
  const res = await fetch(
    `${API_BASE_URL}/market/prediction?symbol=${symbol}&start=${start}&interval=${INTERVAL}`,
    { signal }
  );
  if (!res.ok) throw new Error(`Prediction API error (${res.status})`);
  return res.json();
}

export default function YahooFinPage() {
  const [candleData, setCandleData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingPred, setLoadingPred] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [predError, setPredError] = useState(null);

  useEffect(() => {
    setLoadingChart(true);
    setChartError(null);

    fetchWeekly(DEFAULT_SYMBOL, DEFAULT_START)
      .then((rows) => {
        setCandleData(
          rows.map((row) => ({
            x: new Date(row.date).getTime(),
            y: [row.open, row.high, row.low, row.close],
          }))
        );
      })
      .catch((err) => setChartError(err.message || "Failed to load market data."))
      .finally(() => setLoadingChart(false));
  }, []);

  useEffect(() => {
    setLoadingPred(true);
    setPrediction(null);
    setPredError(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREDICTION_TIMEOUT_MS);

    fetchPrediction(DEFAULT_SYMBOL, DEFAULT_START, controller.signal)
      .then(setPrediction)
      .catch((err) => {
        if (err.name === "AbortError") {
          setPredError("Request timed out — backend took too long to respond.");
        } else {
          setPredError(err.message || "Could not reach the prediction API.");
        }
      })
      .finally(() => {
        clearTimeout(timer);
        setLoadingPred(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const options = {
    chart: { type: "candlestick", background: "transparent", toolbar: { show: false } },
    theme: { mode: "dark" },
    tooltip: { theme: "dark" },
    xaxis: { type: "datetime" },
    grid: { borderColor: "#1f2937" },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {DEFAULT_SYMBOL}{" "}
          <span className="text-gray-500 text-xl font-normal">· {INTERVAL} · 1 week</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Chart and prediction from the XGBoost API in <code className="text-gray-500">ml/</code>
        </p>
      </div>

      {chartError ? (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-red-400 text-sm">
          ⚠ {chartError}
          <p className="text-red-500/60 text-xs mt-2">
            Start backend: <code>cd ml &amp;&amp; uvicorn main:app --reload --port 8000</code>
          </p>
        </div>
      ) : loadingChart ? (
        <div className="h-[420px] bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">
          Loading market data…
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-xl">
          <Chart options={options} series={[{ data: candleData }]} type="candlestick" height={420} />
        </div>
      )}

      <div className="max-w-2xl">
        {loadingPred && <PredictionSkeleton />}
        {!loadingPred && predError && <PredictionError message={predError} />}
        {!loadingPred && !predError && prediction && <PredictionCard prediction={prediction} />}
      </div>
    </div>
  );
}
