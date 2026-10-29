import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Waves, AlertCircle } from 'lucide-react';
import { useAppState } from '../App';

export default function NarrativeDynamics() {
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
      entropy: snap.entropy,
      itemCount: snap.itemCount,
      timestamp: snap.timestamp,
    }));
  }, [countryData]);

  // Extract real topics from article metadata
  const topicAnalysis = useMemo(() => {
    if (countryData.length === 0) return null;

    const latestSnapshot = countryData[countryData.length - 1];
    const topics = latestSnapshot.articleMetadata?.topics || [];
    
    // Count topic frequency
    const topicCounts: Record<string, number> = {};
    topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    // Sort by frequency
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const totalTopics = topics.length;
    const uniqueTopics = Object.keys(topicCounts).length;

    return {
      topTopics: sortedTopics,
      totalTopics,
      uniqueTopics,
      topicConcentration: totalTopics > 0 ? sortedTopics[0][1] / totalTopics : 0,
    };
  }, [countryData]);

  // Current metrics from real data
  const currentEntropy = chartData.length > 0 ? chartData[chartData.length - 1].entropy : 0;
  const currentKappa = chartData.length > 0 ? chartData[chartData.length - 1].kappa : 0;
  const currentItemCount = chartData.length > 0 ? chartData[chartData.length - 1].itemCount : 0;

  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Waves size={20} className="text-cyan-400" />
            Narrative Dynamics Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Tracks changes in narrative prevalence, amplification, semantic diversity, and network distribution.
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <AlertCircle size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-white mb-2">No Narrative Data Available</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            The narrative dynamics engine requires real data from the Live Ingestion pipeline. 
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
          <Waves size={20} className="text-cyan-400" />
          Narrative Dynamics Engine
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Real-time narrative analysis from {countryData.length} measurements. All data from live RSS ingestion — no simulations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Entropy H*</p>
          <p className="text-2xl font-bold text-white">{currentEntropy.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">Narrative diversity</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">κ(t)</p>
          <p className="text-2xl font-bold text-white">{currentKappa.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">Coherence</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Articles</p>
          <p className="text-2xl font-bold text-white">{currentItemCount}</p>
          <p className="text-xs text-gray-500 mt-1">Latest snapshot</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Unique Topics</p>
          <p className="text-2xl font-bold text-white">{topicAnalysis?.uniqueTopics ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">From metadata</p>
        </div>
      </div>

      {/* Entropy Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Narrative Entropy H*(t) — {activeCountry}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelFormatter={(label) => `Measurement #${label}`}
              />
              <Area type="monotone" dataKey="entropy" stroke="#06b6d4" strokeWidth={2} fill="url(#entropyGradient)" dot={{ fill: '#06b6d4', r: 2 }} name="Entropy H*" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Coherence vs Entropy */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Coherence κ(t) vs. Entropy H*(t)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelFormatter={(label) => `Measurement #${label}`}
              />
              <Line type="monotone" dataKey="kappa" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 2 }} name="κ(t) Coherence" />
              <Line type="monotone" dataKey="entropy" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 2 }} name="H* Entropy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Analysis */}
      {topicAnalysis && topicAnalysis.topTopics.length > 0 && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            Top Narrative Topics (Real Data)
          </h3>
          <div className="space-y-2">
            {topicAnalysis.topTopics.map(([topic, count], i) => {
              const percentage = (count / topicAnalysis.totalTopics) * 100;
              return (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                  <span className="text-xs text-white flex-1 truncate">{topic}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Topics</p>
              <p className="text-sm text-white">{topicAnalysis.totalTopics}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Unique Topics</p>
              <p className="text-sm text-white">{topicAnalysis.uniqueTopics}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Top Topic Share</p>
              <p className="text-sm text-white">{(topicAnalysis.topicConcentration * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Provenance */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-3">Data Provenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Country</p>
            <p className="text-sm text-white">{activeCountry}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Total Snapshots</p>
            <p className="text-sm text-white">{countryData.length}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Sources</p>
            <p className="text-sm text-white">{countryData[0]?.sources.join(', ') || 'None'}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Time Range</p>
            <p className="text-sm text-white">
              {countryData.length > 0 
                ? `${new Date(countryData[0].timestamp).toLocaleDateString()} — ${new Date(countryData[countryData.length - 1].timestamp).toLocaleDateString()}`
                : 'N/A'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          All narrative analysis computed from real RSS feed data. No simulations or synthetic data.
        </p>
      </div>
    </div>
  );
}
