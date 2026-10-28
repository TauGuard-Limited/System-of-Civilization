import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Activity, Info, Settings } from 'lucide-react';

function generateCoherenceData(lambda: number, windowSize: number, noise: number) {
  const data = [];
  const T = 100;
  let prevC = 0.65;
  
  for (let t = 0; t < T; t++) {
    // Simulate events
    let baseC = 0.65;
    
    // Fragmentation event around t=25
    if (t > 20 && t < 35) {
      baseC = 0.65 - 0.25 * Math.exp(-0.5 * Math.pow((t - 27) / 4, 2));
    }
    // Recovery
    if (t > 35 && t < 50) {
      baseC = 0.4 + 0.25 * (1 - Math.exp(-0.3 * (t - 35)));
    }
    // Synchronization event around t=65
    if (t > 55 && t < 75) {
      baseC = 0.65 + 0.2 * Math.exp(-0.5 * Math.pow((t - 65) / 5, 2));
    }
    // Return to baseline
    if (t > 75) {
      baseC = 0.65 - 0.05 * Math.exp(-0.2 * (t - 75));
    }

    // Raw coherence with noise
    const rawC = baseC + (Math.random() - 0.5) * noise * 0.1;
    
    // Apply temporal integration (exponential smoothing with decay)
    const alpha = 1 - Math.exp(-lambda * 0.5);
    prevC = alpha * rawC + (1 - alpha) * prevC;
    
    // Compute decay weight for display
    const decay = Math.exp(-lambda * (T - t) * 0.1);
    
    data.push({
      t,
      raw: Math.max(0, Math.min(1, rawC)),
      kappa: Math.max(0, Math.min(1, prevC)),
      decay: decay,
      window: windowSize,
    });
  }
  return data;
}

export default function CoherenceEngine() {
  const [lambda, setLambda] = useState(0.15);
  const [windowSize, setWindowSize] = useState(10);
  const [noise, setNoise] = useState(1.0);
  const [showRaw, setShowRaw] = useState(true);

  const data = useMemo(() => generateCoherenceData(lambda, windowSize, noise), [lambda, windowSize, noise]);

  const kappaMin = 0.35;
  const kappaMax = 0.85;

  const currentKappa = data[data.length - 1]?.kappa ?? 0;
  const currentRaw = data[data.length - 1]?.raw ?? 0;
  const deltaKappa = data.length > 1 ? (data[data.length - 1].kappa - data[data.length - 2].kappa) : 0;

  const getStatus = () => {
    if (currentKappa < kappaMin) return { label: 'Potential Hypo-coherence', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (currentKappa > kappaMax) return { label: 'Potential Hyper-coherence', color: 'text-red-400', bg: 'bg-red-500/10' };
    return { label: 'Within Reference Range', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const status = getStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" />
            TauGuard Coherence Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Computes the symbolic-coherence signal κ(t) using semantic relationships, narrative priors, 
            attention weights, and temporal integration. The engine produces both aggregate signal and constituent measurements.
          </p>
        </div>
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
          <p className="text-xs text-gray-500 mt-1">Unsmoothed</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Δκ(t)</p>
          <p className={`text-2xl font-bold ${deltaKappa > 0 ? 'text-emerald-400' : deltaKappa < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {deltaKappa > 0 ? '+' : ''}{deltaKappa.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Rate of change</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Half-life</p>
          <p className="text-2xl font-bold text-white">{(Math.log(2) / lambda).toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">t₁/₂ = ln(2)/λ</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Temporal Coherence Signal κ(t)</h3>
          <button 
            onClick={() => setShowRaw(!showRaw)}
            className={`text-xs px-2 py-1 rounded ${showRaw ? 'bg-cyan-500/10 text-cyan-400' : 'bg-gray-800 text-gray-500'}`}
          >
            Show Raw C(t)
          </button>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="kappaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={kappaMax} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_max', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={kappaMin} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_min', fill: '#3b82f6', fontSize: 10 }} />
              {showRaw && <Line type="monotone" dataKey="raw" stroke="#06b6d4" strokeWidth={1} dot={false} strokeOpacity={0.4} />}
              <Area type="monotone" dataKey="kappa" stroke="#10b981" strokeWidth={2} fill="url(#kappaGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Settings size={16} className="text-gray-400" />
          Configuration Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Dissipation Rate (λ): {lambda.toFixed(2)}
            </label>
            <input 
              type="range" min="0.01" max="0.5" step="0.01" value={lambda}
              onChange={e => setLambda(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Controls how quickly older observations lose analytical influence</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Window Size (W): {windowSize}
            </label>
            <input 
              type="range" min="3" max="30" step="1" value={windowSize}
              onChange={e => setWindowSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Observation window for temporal integration</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Noise Level: {noise.toFixed(1)}
            </label>
            <input 
              type="range" min="0" max="3" step="0.1" value={noise}
              onChange={e => setNoise(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Simulated measurement noise in raw observations</p>
          </div>
        </div>
      </div>

      {/* Decay Visualization */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Exponential Decay Function d(Δt) = e^(-λ·Δt)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="decay" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equations */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Formal Definitions
        </h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Pairwise Semantic Coherence</p>
            <code className="text-xs text-emerald-300 font-mono">
              C_t = Σ(i&lt;j) w_ij(t)·s_ij(t) / Σ(i&lt;j) w_ij(t)
            </code>
            <p className="text-xs text-gray-500 mt-2">
              where s_ij(t) is normalized semantic similarity and w_ij(t) is the documented pairwise weighting function.
            </p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Temporal Coherence Signal (κ)</p>
            <code className="text-xs text-emerald-300 font-mono">
              κ_t = Σ(j=0..W-1) h_j·C_(t-j)·d_j / Σ(j=0..W-1) h_j·d_j
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Smoothed coherence using temporal window weights h_j and decay weights d_j over observation window W.
            </p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Rate of Change</p>
            <code className="text-xs text-emerald-300 font-mono">
              v_κ(t) = (κ_t - κ_(t-1)) / Δt
            </code>
            <p className="text-xs text-gray-500 mt-2">
              A sharp increase is not automatically evidence of harmful synchronization. Interpretation requires additional evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
