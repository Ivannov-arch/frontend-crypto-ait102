import Link from "next/link";
import CandlestickChart from "../../components/CandlestickChart.jsx";

export default function ChartPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          ← Home
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-center flex-1">
          Live chart &amp; prediction
        </h1>
        <span className="text-xs text-gray-600 w-16 text-right hidden sm:block">1h · 1wk</span>
      </header>
      <div className="p-4 sm:p-6">
        <CandlestickChart />
      </div>
    </div>
  );
}
