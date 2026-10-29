import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Activity, Info, AlertCircle } from 'lucide-react';
import { useAppState } from '../App';

export default function CoherenceEngine() {
  const { kappaHistory, activeCountry } = useAppState();

  // Filter by active country
  const countryData = useMemo(() => {
    return kappaHistory
      .filter(snap => activeCountry === 'Global' || snap.country === activeCountry)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [kappaHistory, activeCountry]);

  // Chart data from real measurements
  const chartData = useMemo(() => {
    return countryData.map((snap, i) => ({
      t: i,
      kappa: snap.kappa,
      raw: snap.rawCoherence,
      entropy: snap.entropy,
      timestamp: snap.timestamp,
      itemCount: snap.itemCount,
    }));
  }, [countryData]);

  // Current metrics from real data
  const currentKappa = chartData.length > 0 ? chartData[chartData.length - 1].kappa : 0;
  const currentRaw = chartData.length > 0 ? chartData[chartData.length - 1].raw : 0;
  const deltaKappa = chartData.length > 1 
    ? chartData[chartData.length - 1].kappa - chartData[chartData.length - 2].kappa 
    : 0;

  const kappaMin = 0.05;
  const kappaMax = 0.35;

  const getStatus = () => {
    if (chartData.length === 0) return { label: 'No data', color: 'text-gray-400', bg: 'bg-gray-500/10' };
    if (currentKappa < kappaMin) return { label: 'Potential Hypo-coherence', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (currentKappa > kappaMax) return { label: 'Potential Hyper-coherence', color: 'text-red-400', bg: 'bg-red-500/10' };
    return { label: 'Within Reference Range', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const status = getStatus();

  // Decay visualization from real configuration
  const decayData = useMemo(() => {
    if (countryData.length === 0) return [];
    const lambda = countryData[0].configuration.decayLambda;
    const maxAge = 24; // hours
    return Array.from({ length: 50 }, (_, i) => {
      const age = (i / 49) * maxAge;
      return {
        age,
        decay: Math.exp(-lambda * age),
      };
    });
  }, [countryData]);

  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" />
            TauGuard Coherence Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Computes the symbolic-coherence signal κ(t) from real ingested data.
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <AlertCircle size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-white mb-2">No Coherence Data Available</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            The coherence engine requires real data from the Live Ingestion pipeline. 
            Go to <span className="text-emerald-400">Live Ingestion</span>, select RSS feeds, and click "Fetch Live Data Now" to begin collecting real measurements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity size={20} className="text-emerald-400" />
          TauGuard Coherence Engine
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Real-time κ(t) computed from {countryData.length} measurements across {countryData[0]?.sources.length ?? 0} sources.
          All data from live RSS ingestion — no simulations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">κ(t) Current</p>
          <p className="text-2xl font-bold text-white">{currentKappa.toFixed(3)}</p>
          <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Raw C(t)</p>
          <p className="text-2xl font-bold text-white">{currentRaw.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">Latest measurement</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Δκ(t)</p>
          <p className={`text-2xl font-bold ${deltaKappa > 0 ? 'text-emerald-400' : deltaKappa < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {deltaKappa > 0 ? '+' : ''}{deltaKappa.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last change</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Snapshots</p>
          <p className="text-2xl font-bold text-white">{chartData.length}</p>
          <p className="text-xs text-gray-500 mt-1">Real measurements</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Real κ(t) Time Series — {activeCountry}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="kappaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 'auto']} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelFormatter={(label) => `Measurement #${label}`}
              />
              <ReferenceLine y={kappaMax} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_max', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={kappaMin} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_min', fill: '#3b82f6', fontSize: 10 }} />
              <Line type="monotone" dataKey="raw" stroke="#06b6d4" strokeWidth={1} dot={false} strokeOpacity={0.4} name="Raw C(t)" />
              <Area type="monotone" dataKey="kappa" stroke="#10b981" strokeWidth={2} fill="url(#kappaGradient)" dot={{ fill: '#10b981', r: 2 }} name="κ(t)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decay Visualization */}
      {decayData.length > 0 && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            Exponential Decay Function — λ = {countryData[0].configuration.decayLambda.toFixed(2)}
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="age" stroke="#4b5563" fontSize={10} label={{ value: 'Age (hours)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }} />
                <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="decay" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Half-life: {(Math.log(2) / countryData[0].configuration.decayLambda).toFixed(1)} hours
          </p>
        </div>
      )}

      {/* Data Provenance */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Data Provenance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Country</p>
            <p className="text-sm text-white">{activeCountry}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Sources</p>
            <p className="text-sm text-white">{countryData[0]?.sources.join(', ') || 'None'}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Window Size</p>
            <p className="text-sm text-white">{countryData[0]?.configuration.windowSize ?? 'N/A'}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Decay Rate (λ)</p>
            <p className="text-sm text-white">{countryData[0]?.configuration.decayLambda.toFixed(2) ?? 'N/A'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          All measurements computed from real RSS feed data. No simulations or synthetic data.
        </p>
      </div>
    </div>
  );
}
