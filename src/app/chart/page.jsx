import CandlestickChart from "../../components/CandlestickChart.jsx"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Crypto Market Direction Predictor</h1>
      <CandlestickChart />
    </div>
  );
}
