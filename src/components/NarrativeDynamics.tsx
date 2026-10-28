import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Waves, Info } from 'lucide-react';

function generateNarrativeData(numClusters: number, steps: number, fragmentation: number) {
  const data = [];
  const clusters = Array.from({ length: numClusters }, (_, i) => ({
    id: i,
    name: `Narrative ${String.fromCharCode(65 + i)}`,
    basePrevalence: i === 0 ? 0.4 : 0.6 / (numClusters - 1),
  }));

  for (let t = 0; t < steps; t++) {
    const point: Record<string, number | string> = { t };
    let totalWeight = 0;

    clusters.forEach((cluster, i) => {
      let prevalence = cluster.basePrevalence;

      // Add fragmentation dynamics
      if (fragmentation > 0.5 && t > steps * 0.3 && t < steps * 0.6) {
        // Fragmentation: dominant cluster loses, others gain
        if (i === 0) {
          prevalence *= (1 - fragmentation * 0.5 * Math.sin((t - steps * 0.3) * 0.1));
        } else {
          prevalence *= (1 + fragmentation * 0.3 * Math.sin((t - steps * 0.3) * 0.1 + i));
        }
      }

      // Add synchronization dynamics
      if (fragmentation < 0.3 && t > steps * 0.5 && t < steps * 0.8) {
        if (i === 0) {
          prevalence *= (1 + 0.3 * Math.sin((t - steps * 0.5) * 0.08));
        } else {
          prevalence *= (1 - 0.2 * Math.sin((t - steps * 0.5) * 0.08));
        }
      }

      // Add noise
      prevalence += (Math.random() - 0.5) * 0.03;
      prevalence = Math.max(0.01, prevalence);

      point[cluster.name] = prevalence;
      totalWeight += prevalence;
    });

    // Normalize
    clusters.forEach(cluster => {
      point[cluster.name] = ((point[cluster.name] as number) / totalWeight) * 100;
    });

    // Compute entropy
    let entropy = 0;
    clusters.forEach(cluster => {
      const p = (point[cluster.name] as number) / 100;
      if (p > 0) entropy -= p * Math.log(p);
    });
    point['entropy'] = entropy / Math.log(numClusters); // Normalized

    data.push(point);
  }

  return { data, clusters };
}

const clusterColors = ['#10b981', '#06b6d4', '#a855f7', '#f59e0b', '#ef4444', '#ec4899'];

export default function NarrativeDynamics() {
  const [numClusters, setNumClusters] = useState(4);
  const [steps, setSteps] = useState(100);
  const [fragmentation, setFragmentation] = useState(0.5);

  const { data, clusters } = useMemo(
    () => generateNarrativeData(numClusters, steps, fragmentation),
    [numClusters, steps, fragmentation]
  );

  // Compute summary statistics
  const avgEntropy = data.reduce((sum, d) => sum + (d.entropy as number), 0) / data.length;
  const minEntropy = Math.min(...data.map(d => d.entropy as number));
  const maxEntropy = Math.max(...data.map(d => d.entropy as number));
  const finalDominance = Math.max(...clusters.map((_, i) => data[data.length - 1][clusters[i].name] as number));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Waves size={20} className="text-cyan-400" />
          Narrative Dynamics Engine
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Tracks changes in narrative prevalence, amplification, semantic diversity, and network distribution.
          Identifies potential patterns such as fragmentation, synchronization, and oscillation.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Avg. Normalized Entropy</p>
          <p className="text-2xl font-bold text-white">{avgEntropy.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">H* = H/ln(K)</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Entropy Range</p>
          <p className="text-2xl font-bold text-white">{minEntropy.toFixed(2)}–{maxEntropy.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Min to Max H*</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Clusters</p>
          <p className="text-2xl font-bold text-white">{numClusters}</p>
          <p className="text-xs text-gray-500 mt-1">Narrative groups</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Final Dominance</p>
          <p className="text-2xl font-bold text-white">{finalDominance.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Largest cluster share</p>
        </div>
      </div>

      {/* Narrative Prevalence Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Narrative Cluster Prevalence Over Time</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis stroke="#4b5563" fontSize={10} label={{ value: 'Prevalence %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 10 } }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {clusters.map((cluster, i) => (
                <Area
                  key={cluster.id}
                  type="monotone"
                  dataKey={cluster.name}
                  stackId="1"
                  stroke={clusterColors[i % clusterColors.length]}
                  fill={clusterColors[i % clusterColors.length]}
                  fillOpacity={0.3}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Entropy Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Normalized Narrative Entropy H*(t)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => [value.toFixed(3), 'H*']}
              />
              <Line type="monotone" dataKey="entropy" stroke="#a855f7" strokeWidth={2} dot={false} name="Normalized Entropy H*" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Dynamics Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Number of Clusters (K): {numClusters}
            </label>
            <input 
              type="range" min="2" max="6" step="1" value={numClusters}
              onChange={e => setNumClusters(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">Distinct narrative groups in the ecosystem</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Time Steps: {steps}
            </label>
            <input 
              type="range" min="50" max="200" step="10" value={steps}
              onChange={e => setSteps(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">Observation period length</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Fragmentation Index: {fragmentation.toFixed(2)}
            </label>
            <input 
              type="range" min="0" max="1" step="0.05" value={fragmentation}
              onChange={e => setFragmentation(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">0 = synchronized, 1 = highly fragmented</p>
          </div>
        </div>
      </div>

      {/* Pattern Detection */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Detected Pattern Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { 
              pattern: 'Stable Shared Reference',
              active: fragmentation < 0.3 && avgEntropy < 0.5,
              desc: 'Dominant narrative maintains consistent prevalence'
            },
            { 
              pattern: 'Fragmentation',
              active: fragmentation > 0.5 && avgEntropy > 0.7,
              desc: 'Weakly connected clusters with distributed attention'
            },
            { 
              pattern: 'Rapid Synchronization',
              active: fragmentation < 0.2,
              desc: 'Quick convergence around a single narrative cluster'
            },
            { 
              pattern: 'Oscillation',
              active: fragmentation > 0.3 && fragmentation < 0.7,
              desc: 'Repeated shifts between competing narrative clusters'
            },
            { 
              pattern: 'Concentration of Influence',
              active: finalDominance > 60,
              desc: 'Small number of sources dominate attention'
            },
            { 
              pattern: 'High Diversity',
              active: avgEntropy > 0.8,
              desc: 'Attention broadly distributed across many narratives'
            },
          ].map((item, i) => (
            <div key={i} className={`rounded-lg p-3 border ${
              item.active 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-gray-800/30 border-gray-700/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                <span className={`text-xs font-medium ${item.active ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {item.pattern}
                </span>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          These patterns are descriptive. Their social meaning must be established through contextual analysis.
          The system must report the clustering method and sensitivity to alternative cluster definitions.
        </p>
      </div>

      {/* Entropy Formula */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Symbolic Entropy Equations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Shannon Entropy</p>
            <code className="text-xs text-emerald-300 font-mono">
              H_t = -Σ(k=1..K) p_k(t)·ln(p_k(t))
            </code>
            <p className="text-xs text-gray-500 mt-2">
              where p_k(t) is the normalized prevalence of narrative cluster k.
            </p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Normalized Entropy</p>
            <code className="text-xs text-emerald-300 font-mono">
              H*_t = H_t / ln(K)
            </code>
            <p className="text-xs text-gray-500 mt-2">
              For K {'>'} 1, normalized to [0,1]. Low = concentration; High = distributed.
              Neither is inherently healthy or unhealthy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
