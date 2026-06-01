/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Live Chart", href: "/chart" },
  { name: "Demo", href: "/yahoofin" },
];

const features = [
  {
    name: "Candlestick intelligence",
    description:
      "Hourly OHLCV charts with single-candle and multi-candle pattern labels — Doji, Engulfing, Morning Star, and more.",
    icon: ChartBarIcon,
  },
  {
    name: "Dual XGBoost detectors",
    description:
      "Separate up and down classifiers score the next move. Combined logic yields Bullish, Bearish, Volatile, or Neutral.",
    icon: CpuChipIcon,
  },
  {
    name: "Explainable signals",
    description:
      "Each prediction includes confidence, detector probabilities, and supporting or contradicting pattern counts.",
    icon: SparklesIcon,
  },
];

const symbols = ["BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD", "BNB-USD"];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8 border-b border-white/5 bg-gray-950/80 backdrop-blur-md"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-lg font-bold border border-emerald-500/30">
                ◈
              </span>
              <span className="font-semibold text-white tracking-tight">
                Candlestick Recognizer
              </span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Open menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/chart"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Open chart
            </Link>
          </div>
        </nav>

        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/60" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-950 px-6 py-6 sm:max-w-sm border-l border-gray-800">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>
                Candlestick Recognizer
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-8 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-200 hover:bg-gray-800"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/chart"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 block rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-base font-semibold text-white"
              >
                Open chart
              </Link>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <main className="relative isolate pt-28">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div className="relative left-1/2 aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-emerald-600/30 to-rose-600/20 opacity-40 sm:w-[72rem]" />
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              AIT102 · XGBoost dual-detector · FastAPI + Next.js
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-balance">
              Crypto market direction from candlesticks &amp; ML
            </h1>
            <p className="mt-6 text-lg text-pretty text-gray-400 leading-relaxed">
              Analyze hourly crypto charts with pattern recognition, then let two XGBoost models
              estimate whether the next candle leans up, down, or into a volatile or neutral regime —
              with probabilities and human-readable reasoning.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chart"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
              >
                Launch live chart
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/yahoofin"
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                View demo page →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {symbols.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-gray-700 bg-gray-800/80 px-2.5 py-1 text-xs font-mono text-gray-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Preview card — mimics prediction UI */}
          <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-gray-800 bg-gray-900/90 p-6 shadow-2xl ring-1 ring-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-400">AI Market Intelligence</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-0.5 text-xs font-bold uppercase text-emerald-400">
                Bullish
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-6">
              <div className="h-full w-[68%] rounded-full bg-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                <p className="text-xs text-emerald-400 font-semibold">Up detector</p>
                <p className="text-2xl font-bold text-emerald-300 mt-1">68%</p>
              </div>
              <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3">
                <p className="text-xs text-rose-400 font-semibold">Down detector</p>
                <p className="text-2xl font-bold text-rose-300 mt-1">31%</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-gray-600 text-center">
              Illustration — live values from your selected symbol and week on the chart page
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-800 bg-gray-900/50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="text-3xl font-bold text-white">What the system does</h2>
              <p className="mt-4 text-gray-400">
                Backend in <code className="text-emerald-400/90">ml/</code> serves labeled candles and
                XGBoost inference; the frontend visualizes charts and predictions together.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.name}
                  className="rounded-xl border border-gray-800 bg-gray-950 p-6 hover:border-gray-700 transition-colors"
                >
                  <f.icon className="size-8 text-emerald-500 mb-4" aria-hidden />
                  <h3 className="text-lg font-semibold text-white">{f.name}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack + directions */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-gray-800 bg-gray-900 p-8">
            <h2 className="text-xl font-bold text-white mb-4">Prediction outcomes</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Bullish", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
                { label: "Bearish", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
                { label: "Volatile", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
                { label: "Neutral", color: "text-slate-400 border-slate-500/30 bg-slate-500/10" },
              ].map((d) => (
                <li
                  key={d.label}
                  className={`rounded-lg border px-4 py-3 font-semibold ${d.color}`}
                >
                  {d.label}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              Stack: Python · XGBoost · FastAPI · Yahoo Finance · Next.js · ApexCharts
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 text-center px-6">
          <h2 className="text-2xl font-bold text-white">Ready to explore the market?</h2>
          <p className="mt-2 text-gray-400 text-sm">
            Pick a symbol, choose a week, and read the dual-detector forecast.
          </p>
          <Link
            href="/chart"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            Go to live chart
            <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-600">
        Candlestick Recognizer — university project. Predictions are for research only, not financial advice.
      </footer>
    </div>
  );
}
