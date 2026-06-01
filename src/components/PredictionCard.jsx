"use client";

const DIRECTION_BADGE = {
  Bullish:  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Bearish:  "bg-rose-500/20    text-rose-400    border border-rose-500/30",
  Volatile: "bg-amber-500/20   text-amber-400   border border-amber-500/30",
  Neutral:  "bg-slate-500/20   text-slate-400   border border-slate-500/30",
};

const DIRECTION_BAR = {
  Bullish:  "bg-emerald-500",
  Bearish:  "bg-rose-500",
  Volatile: "bg-amber-500",
  Neutral:  "bg-slate-500",
};

function SignalList({ title, signals, emptyText }) {
  const entries = Object.entries(signals ?? {});
  if (entries.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-[11px] text-gray-600">{emptyText}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
      <ul className="text-[11px] text-gray-400 space-y-0.5">
        {entries.map(([name, count]) => (
          <li key={name}>
            {name} <span className="text-gray-600">×{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PredictionCard({ prediction, className = "" }) {
  const badge = DIRECTION_BADGE[prediction.direction] ?? DIRECTION_BADGE.Neutral;
  const bar   = DIRECTION_BAR[prediction.direction]   ?? DIRECTION_BAR.Neutral;
  const reasoning = prediction.reasoning;

  return (
    <div
      className={`p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl space-y-4 ${className}`}
    >
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-gray-300">
            AI Market Intelligence
          </h2>
          {prediction.model && (
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">
              {prediction.model} dual-detector
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shrink-0 ${badge}`}>
          {prediction.direction}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Model Confidence</span>
          <span className="font-semibold text-gray-200">{prediction.confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${bar}`}
            style={{ width: `${Math.min(100, prediction.confidence ?? 0)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-sm">
        <div className="bg-emerald-950/10 border border-emerald-900/30 p-3 rounded-lg">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">Up Detector</span>
          <span className="text-xl font-bold text-emerald-300">{prediction.prob_up ?? 0}%</span>
          <span className="text-[10px] text-emerald-500/70 block mt-0.5">Probability of upward move</span>
        </div>
        <div className="bg-rose-950/10 border border-rose-900/30 p-3 rounded-lg">
          <span className="text-xs text-rose-400 font-semibold block mb-1">Down Detector</span>
          <span className="text-xl font-bold text-rose-300">{prediction.prob_down ?? 0}%</span>
          <span className="text-[10px] text-rose-500/70 block mt-0.5">Probability of downward move</span>
        </div>
      </div>

      {reasoning && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <SignalList
            title="Supporting signals"
            signals={reasoning.supporting_signals}
            emptyText="None in this window"
          />
          <SignalList
            title="Contradicting signals"
            signals={reasoning.contradicting_signals}
            emptyText="None in this window"
          />
          <SignalList
            title="Warnings"
            signals={reasoning.warnings}
            emptyText="No warnings"
          />
        </div>
      )}

      <div className="text-[11px] text-gray-600 space-y-0.5">
        {prediction.analysis_window && <p>Analysis window: {prediction.analysis_window}</p>}
        {prediction.prediction_candle && (
          <p>Prediction candle: {new Date(prediction.prediction_candle).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

export function PredictionSkeleton({ className = "" }) {
  return (
    <div className={`p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl space-y-4 animate-pulse ${className}`}>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-700 rounded w-44" />
        <div className="h-6 bg-gray-700 rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-2 bg-gray-800 rounded-full w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
        <div className="h-20 bg-gray-800 rounded-lg" />
        <div className="h-20 bg-gray-800 rounded-lg" />
      </div>
      <p className="text-xs text-gray-600">Loading XGBoost prediction…</p>
    </div>
  );
}

export function PredictionError({ message, apiUrl, className = "" }) {
  return (
    <div className={`p-5 bg-red-950/20 border border-red-800/30 rounded-xl text-sm text-red-400 space-y-1 ${className}`}>
      <p className="font-semibold">⚠ AI prediction unavailable</p>
      <p className="text-red-500/70">{message}</p>
      {apiUrl && (
        <p className="text-red-500/50 text-xs break-all">
          API: <code className="text-red-400">{apiUrl}</code>
        </p>
      )}
      <p className="text-red-500/50 text-xs">
        Local: <code className="text-red-400">cd ml &amp;&amp; uvicorn main:app --reload --port 8000</code>
        {" · "}
        Set <code className="text-red-400">NEXT_PUBLIC_API_URL=http://localhost:8000</code> in{" "}
        <code className="text-red-400">frontend/.env.local</code>, then redeploy Render after pushing{" "}
        <code className="text-red-400">ml/</code> updates.
      </p>
    </div>
  );
}
