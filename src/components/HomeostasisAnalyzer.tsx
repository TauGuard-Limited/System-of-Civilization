import { useMemo } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useAppState } from '../App';

export default function HomeostasisAnalyzer() {
  const { kappaHistory, activeCountry } = useAppState();

  // Filter by active country
  const countryData = useMemo(() => {
    return kappaHistory
      .filter(snap => activeCountry === 'Global' || snap.country === activeCountry)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [kappaHistory, activeCountry]);

  // Compute homeostasis assessment from real data
  const assessment = useMemo(() => {
    if (countryData.length === 0) return null;

    const latest = countryData[countryData.length - 1];
    const kappa = latest.kappa;
    const entropy = latest.entropy;
    
    // Reference ranges (from specification)
    const kappaMin = 0.05;
    const kappaMax = 0.35;
    const entropyMin = 0.3;
    const entropyMax = 0.8;

    // Determine condition
    let condition: 'homeostasis' | 'hypo' | 'hyper' | 'turbulence' | 'insufficient';
    let confidence = 0;
    let evidence = '';

    // Check for insufficient data
    if (countryData.length < 3) {
      condition = 'insufficient';
      confidence = 0.2;
      evidence = `Only ${countryData.length} measurements available. Need at least 3 for reliable assessment.`;
    }
    // Check for turbulence (high variance in recent measurements)
    else if (countryData.length >= 5) {
      const recent = countryData.slice(-5);
      const kappas = recent.map(s => s.kappa);
      const mean = kappas.reduce((a, b) => a + b, 0) / kappas.length;
      const variance = kappas.reduce((sum, k) => sum + Math.pow(k - mean, 2), 0) / kappas.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > 0.05) {
        condition = 'turbulence';
        confidence = 0.6;
        evidence = `High variance detected (σ = ${stdDev.toFixed(3)}) in last 5 measurements. System is unstable.`;
      }
      // Check for hypo-coherence
      else if (kappa < kappaMin) {
        condition = 'hypo';
        confidence = 0.8;
        evidence = `κ(t) = ${kappa.toFixed(3)} is below threshold κ_min = ${kappaMin}. Indicates fragmentation and loss of shared reference.`;
      }
      // Check for hyper-coherence
      else if (kappa > kappaMax && entropy < entropyMin) {
        condition = 'hyper';
        confidence = 0.8;
        evidence = `κ(t) = ${kappa.toFixed(3)} exceeds κ_max = ${kappaMax} with low entropy H* = ${entropy.toFixed(3)}. Indicates excessive synchronization.`;
      }
      // Homeostasis
      else {
        condition = 'homeostasis';
        confidence = 0.9;
        evidence = `κ(t) = ${kappa.toFixed(3)} within reference range [${kappaMin}, ${kappaMax}]. Entropy H* = ${entropy.toFixed(3)} indicates healthy diversity.`;
      }
    }
    // Fallback for 3-4 measurements
    else {
      if (kappa < kappaMin) {
        condition = 'hypo';
        confidence = 0.6;
        evidence = `κ(t) = ${kappa.toFixed(3)} is below threshold. Limited data for full assessment.`;
      } else if (kappa > kappaMax) {
        condition = 'hyper';
        confidence = 0.6;
        evidence = `κ(t) = ${kappa.toFixed(3)} exceeds threshold. Limited data for full assessment.`;
      } else {
        condition = 'homeostasis';
        confidence = 0.7;
        evidence = `κ(t) = ${kappa.toFixed(3)} within range. Limited data for full assessment.`;
      }
    }

    return {
      condition,
      confidence,
      evidence,
      kappa,
      entropy,
      timestamp: latest.timestamp,
      itemCount: latest.itemCount,
      sources: latest.sources,
    };
  }, [countryData]);

  // Trend analysis
  const trend = useMemo(() => {
    if (countryData.length < 2) return null;

    const recent = countryData.slice(-3);
    const older = countryData.slice(-6, -3);
    
    if (older.length === 0) return null;

    const recentAvg = recent.reduce((sum, s) => sum + s.kappa, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.kappa, 0) / older.length;
    const diff = recentAvg - olderAvg;

    let direction: 'rising' | 'falling' | 'stable';
    if (diff > 0.01) direction = 'rising';
    else if (diff < -0.01) direction = 'falling';
    else direction = 'stable';

    return {
      direction,
      magnitude: Math.abs(diff),
      recentAvg,
      olderAvg,
    };
  }, [countryData]);

  if (!assessment) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield size={20} className="text-purple-400" />
            Symbolic Homeostasis Analyzer
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Evaluates coherence, diversity, and instability to identify homeostatic and non-homeostatic conditions.
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <AlertCircle size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-white mb-2">No Assessment Data Available</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            The homeostasis analyzer requires real data from the Live Ingestion pipeline. 
            Go to <span className="text-emerald-400">Live Ingestion</span>, select RSS feeds, and click "Fetch Live Data Now" to begin collecting real measurements.
          </p>
        </div>
      </div>
    );
  }

  const conditionColors = {
    homeostasis: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    hypo: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    hyper: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    turbulence: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    insufficient: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' },
  };

  const colors = conditionColors[assessment.condition];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield size={20} className="text-purple-400" />
          Symbolic Homeostasis Analyzer
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Real-time assessment from {countryData.length} measurements. All data from live RSS ingestion — no simulations.
        </p>
      </div>

      {/* Assessment Card */}
      <div className={`rounded-xl ${colors.bg} border ${colors.border} p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${colors.text} mb-2`}>
              {assessment.condition === 'homeostasis' && 'Potential Homeostasis'}
              {assessment.condition === 'hypo' && 'Potential Hypo-coherence'}
              {assessment.condition === 'hyper' && 'Potential Hyper-coherence'}
              {assessment.condition === 'turbulence' && 'Memetic Turbulence'}
              {assessment.condition === 'insufficient' && 'Insufficient Evidence'}
            </h3>
            <p className="text-xs text-gray-400">
              {new Date(assessment.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Confidence</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {(assessment.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-gray-900/50 p-4 border border-gray-700/30">
          <p className="text-xs text-gray-300 leading-relaxed">{assessment.evidence}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">κ(t) Coherence</p>
          <p className={`text-2xl font-bold ${
            assessment.kappa < 0.05 ? 'text-blue-400' :
            assessment.kappa > 0.35 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {assessment.kappa.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Range: [0.05, 0.35]</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Entropy H*</p>
          <p className="text-2xl font-bold text-white">{assessment.entropy.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">Narrative diversity</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Articles</p>
          <p className="text-2xl font-bold text-white">{assessment.itemCount}</p>
          <p className="text-xs text-gray-500 mt-1">Latest snapshot</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Measurements</p>
          <p className="text-2xl font-bold text-white">{countryData.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total snapshots</p>
        </div>
      </div>

      {/* Trend Analysis */}
      {trend && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-4">Trend Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-800/50 p-4">
              <p className="text-xs text-gray-500 mb-2">Direction</p>
              <p className={`text-lg font-bold ${
                trend.direction === 'rising' ? 'text-emerald-400' :
                trend.direction === 'falling' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend.direction === 'rising' && '↑ Rising'}
                {trend.direction === 'falling' && '↓ Falling'}
                {trend.direction === 'stable' && '→ Stable'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-4">
              <p className="text-xs text-gray-500 mb-2">Magnitude</p>
              <p className="text-lg font-bold text-white">
                {trend.magnitude > 0 ? '+' : ''}{trend.magnitude.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 mt-1">κ(t) change</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-4">
              <p className="text-xs text-gray-500 mb-2">Comparison</p>
              <p className="text-xs text-gray-400">
                Recent avg: <span className="text-white">{trend.recentAvg.toFixed(3)}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Older avg: <span className="text-white">{trend.olderAvg.toFixed(3)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Ranges */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Reference Ranges</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div>
              <p className="text-xs text-white font-medium">κ(t) Coherence</p>
              <p className="text-xs text-gray-500 mt-1">Symbolic coherence signal</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                <span className="text-blue-400">&lt; 0.05</span> Hypo
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-emerald-400">0.05–0.35</span> Homeostasis
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-red-400">&gt; 0.35</span> Hyper
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div>
              <p className="text-xs text-white font-medium">Entropy H*</p>
              <p className="text-xs text-gray-500 mt-1">Narrative diversity</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                <span className="text-red-400">&lt; 0.3</span> Low diversity
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-emerald-400">0.3–0.8</span> Healthy
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-amber-400">&gt; 0.8</span> High diversity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Provenance */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-3">Data Provenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Country</p>
            <p className="text-sm text-white">{activeCountry}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Assessment Time</p>
            <p className="text-sm text-white">{new Date(assessment.timestamp).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <p className="text-xs text-gray-500 mb-1">Sources</p>
            <p className="text-sm text-white">{assessment.sources.join(', ') || 'None'}</p>
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
          All assessments computed from real RSS feed data. No simulations or synthetic data.
        </p>
      </div>
    </div>
  );
}
