"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PredictionCard, { PredictionError, PredictionSkeleton } from "@/components/PredictionCard";
import {
  API_BASE_URL,
  PREDICTION_TIMEOUT_MS,
  fetchPrediction,
  fetchWeekly,
} from "@/lib/marketApi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DEFAULT_SYMBOL = "BTC-USD";
const DEFAULT_START = "2025-01-01";
const INTERVAL = "1h";

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

    fetchWeekly({ symbol: DEFAULT_SYMBOL, start: DEFAULT_START, interval: INTERVAL })
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

    fetchPrediction({
      symbol: DEFAULT_SYMBOL,
      start: DEFAULT_START,
      interval: INTERVAL,
      signal: controller.signal,
    })
      .then(setPrediction)
      .catch((err) => {
        if (err.name === "AbortError") {
          setPredError(
            `Request timed out after ${PREDICTION_TIMEOUT_MS / 1000}s. Render may still be on the old LSTM build — redeploy from the ml/ folder.`
          );
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
        {!loadingPred && predError && (
          <PredictionError message={predError} apiUrl={API_BASE_URL} />
        )}
        {!loadingPred && !predError && prediction && <PredictionCard prediction={prediction} />}
      </div>
    </div>
  );
}
