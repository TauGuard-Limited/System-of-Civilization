import { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../App';
import { analyzeSYGON, computeSYGONMetrics, loadSGUState, loadPrimeRegistry, clearSYGONState } from '../services/sygonEngine';
import { computePairwiseSimilarity } from '../services/semanticSimilarity';
import { Activity, Network, TrendingUp, Trash2, Info } from 'lucide-react';

interface SGUVisualizationProps {
  sgus: any[];
  width?: number;
  height?: number;
}

function SGUVisualization({ sgus, width = 600, height = 400 }: SGUVisualizationProps) {
  if (sgus.length === 0) return null;

  // Compute bounds
  const xs = sgus.map(s => s.x);
  const ys = sgus.map(s => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const padding = 40;

  // Normalize coordinates to SVG space
  const normalizeX = (x: number) => padding + ((x - minX) / rangeX) * (width - 2 * padding);
  const normalizeY = (y: number) => height - padding - ((y - minY) / rangeY) * (height - 2 * padding);

  // Color by wave coherence
  const getColor = (coherence: number) => {
    if (coherence > 0.7) return '#10b981'; // Green
    if (coherence > 0.4) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <svg width={width} height={height} className="bg-gray-900 rounded-lg">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(frac => (
        <g key={frac}>
          <line
            x1={padding}
            y1={height - padding - frac * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - frac * (height - 2 * padding)}
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <line
            x1={padding + frac * (width - 2 * padding)}
            y1={padding}
            x2={padding + frac * (width - 2 * padding)}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </g>
      ))}

      {/* τ-circles */}
      {sgus.map((sgu, i) => {
        const cx = normalizeX(sgu.x);
        const cy = normalizeY(sgu.y);
        const radius = (sgu.tauRadius / Math.max(rangeX, rangeY)) * (width - 2 * padding);
        return (
          <circle
            key={`tau-${i}`}
            cx={cx}
            cy={cy}
            r={Math.min(radius, 50)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.3"
          />
        );
      })}

      {/* SGU points */}
      {sgus.map((sgu, i) => {
        const cx = normalizeX(sgu.x);
        const cy = normalizeY(sgu.y);
        const color = getColor(sgu.waveCoherence);
        return (
          <g key={`sgu-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill={color}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
            >
              {sgu.category}
            </text>
          </g>
        );
      })}

      {/* Axes labels */}
      <text x={width / 2} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="12">
        φ-lattice X
      </text>
      <text x={15} y={height / 2} textAnchor="middle" fill="#6b7280" fontSize="12" transform={`rotate(-90, 15, ${height / 2})`}>
        φ-lattice Y
      </text>
    </svg>
  );
}

export default function SYGONAnalyzer() {
  const { kappaHistory, activeCountry } = useAppState();
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract articles from kappaHistory metadata
  const allArticles = useMemo(() => {
    const articles: Array<{id: string; title: string; category: string; source: string}> = [];
    kappaHistory.forEach(snap => {
      if (snap.articleMetadata?.titles) {
        snap.articleMetadata.titles.forEach((title, idx) => {
          const topic = snap.articleMetadata?.topics[idx] || 'unknown';
          articles.push({
            id: `${snap.id}-${idx}`,
            title,
            category: topic,
            source: snap.sources[0] || 'unknown',
          });
        });
      }
    });
    return articles;
  }, [kappaHistory]);

  // Get unique sources
  const sources = useMemo(() => {
    const srcs = new Set(allArticles.map(a => a.source));
    return ['all', ...Array.from(srcs)];
  }, [allArticles]);

  // Filter articles by source
  const filteredArticles = useMemo(() => {
    if (selectedSource === 'all') return allArticles;
    return allArticles.filter(a => a.source === selectedSource);
  }, [allArticles, selectedSource]);

  // Run SYGON analysis
  const runAnalysis = () => {
    if (filteredArticles.length < 2) {
      alert('Need at least 2 articles to run SYGON analysis');
      return;
    }

    setIsAnalyzing(true);

    try {
      const texts = filteredArticles.map(a => a.title);
      const categories = filteredArticles.map(a => a.category);
      const weights = filteredArticles.map(() => 1.0);
      const ids = filteredArticles.map(a => a.id);

      // Compute similarity matrix
      const similarityMatrix = computePairwiseSimilarity(texts);

      // Run SYGON analysis
      const result = analyzeSYGON(texts, categories, weights, ids, similarityMatrix);
      const metrics = computeSYGONMetrics(result.sgus);

      setAnalysisResult({ ...result, metrics });
    } catch (error) {
      console.error('SYGON analysis failed:', error);
      alert('SYGON analysis failed: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear SYGON state
  const handleClearState = () => {
    if (confirm('Clear all SYGON state? This will reset prime registry and SGU history.')) {
      clearSYGONState();
      setAnalysisResult(null);
      alert('SYGON state cleared');
    }
  };

  // Load existing state info
  const stateInfo = useMemo(() => {
    const registry = loadPrimeRegistry();
    const sguState = loadSGUState();
    return {
      primeTokens: registry.tokens.size,
      sgus: sguState.sgus.size,
      driftRecords: Array.from(sguState.driftHistory.values()).reduce((sum, records) => sum + records.length, 0),
    };
  }, [analysisResult]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Network size={20} className="text-purple-400" />
          SYGON Geometry Analyzer
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          φ-lattice geometry, prime-indexed lexical identity, and semantic wave coherence analysis.
          All calculations use real article data from RSS feeds.
        </p>
      </div>

      {/* State Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Prime Tokens</p>
          <p className="text-2xl font-bold text-white">{stateInfo.primeTokens}</p>
          <p className="text-xs text-gray-500 mt-1">Lexical units with prime identity</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">SGUs</p>
          <p className="text-2xl font-bold text-white">{stateInfo.sgus}</p>
          <p className="text-xs text-gray-500 mt-1">Semantic Governance Units</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Drift Records</p>
          <p className="text-2xl font-bold text-white">{stateInfo.driftRecords}</p>
          <p className="text-xs text-gray-500 mt-1">Golden-spiral drift history</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Analysis Controls</h3>
          <button
            onClick={handleClearState}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs"
          >
            <Trash2 size={14} />
            Clear State
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-2">Source Filter</label>
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {sources.map((src: string) => (
                <option key={src} value={src}>
                  {src === 'all' ? 'All Sources' : src}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-2">Articles to Analyze</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {filteredArticles.length} articles
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || filteredArticles.length < 2}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Activity size={16} />
              {isAnalyzing ? 'Analyzing...' : 'Run SYGON Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Mean Wave Coherence</p>
              <p className="text-2xl font-bold text-emerald-400">
                {analysisResult.metrics.meanWaveCoherence.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Category alignment</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Mean Voronoi Radius</p>
              <p className="text-2xl font-bold text-cyan-400">
                {analysisResult.metrics.meanVoronoiRadius.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Neighborhood size</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Mean τ-Radius</p>
              <p className="text-2xl font-bold text-indigo-400">
                {analysisResult.metrics.meanTauRadius.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Context circle</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Mean Spiral Fidelity</p>
              <p className="text-2xl font-bold text-purple-400">
                {analysisResult.metrics.meanSpiralFidelity.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Golden spiral alignment</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Drift</p>
              <p className="text-2xl font-bold text-amber-400">
                {analysisResult.metrics.totalDrift.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Cumulative movement</p>
            </div>
          </div>

          {/* Visualization */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">φ-Lattice SGU Visualization</h3>
            <SGUVisualization sgus={analysisResult.sgus} width={800} height={500} />
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>High coherence (&gt;0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Medium coherence (0.4-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Low coherence (&lt;0.4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-indigo-500"></div>
                <span>τ-circle (context radius)</span>
              </div>
            </div>
          </div>

          {/* SGU Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">SGU Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">ID</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Category</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Position</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Wave Coherence</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">τ-Radius</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Spiral Fidelity</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.sgus.slice(0, 20).map((sgu: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-2 text-gray-300 font-mono text-[10px]">
                        {sgu.id.substring(0, 20)}...
                      </td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {sgu.category}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-400 font-mono">
                        ({sgu.x.toFixed(2)}, {sgu.y.toFixed(2)})
                      </td>
                      <td className="py-2 px-2">
                        <span className={
                          sgu.waveCoherence > 0.7 ? 'text-emerald-400' :
                          sgu.waveCoherence > 0.4 ? 'text-amber-400' : 'text-red-400'
                        }>
                          {sgu.waveCoherence.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-indigo-400 font-mono">
                        {sgu.tauRadius.toFixed(3)}
                      </td>
                      <td className="py-2 px-2 text-purple-400 font-mono">
                        {sgu.spiralFidelity.toFixed(3)}
                      </td>
                      <td className="py-2 px-2 text-gray-400">
                        {sgu.observationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {analysisResult.sgus.length > 20 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing 20 of {analysisResult.sgus.length} SGUs
              </p>
            )}
          </div>

          {/* Category Centroids */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Category Centroids</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from(analysisResult.categoryCentroids.entries() as IterableIterator<[string, any]>).map(([category, centroid]) => (
                <div key={category} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-white font-medium mb-2">{category}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position:</span>
                      <span className="text-gray-300 font-mono">
                        ({centroid.x.toFixed(2)}, {centroid.y.toFixed(2)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Count:</span>
                      <span className="text-gray-300">{centroid.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Methodology */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
          <Info size={16} className="text-cyan-400" />
          SYGON Methodology
        </h3>
        <div className="space-y-3 text-xs text-gray-400">
          <div>
            <p className="font-medium text-white mb-1">φ-Lattice Geometry</p>
            <p>
              Lexical units are assigned prime indices and placed on a phyllotactic spiral using
              the golden angle α = 2π/φ². Each token receives deterministic coordinates:
              θ = k·α, r = √k, where k is the prime index.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Semantic Governance Units (SGUs)</p>
            <p>
              Each article becomes an SGU with coordinates computed from its lexical lattice centroid
              and semantic similarity vector. SGUs track wave coherence (category alignment),
              Voronoi neighborhood, τ-circle radius, and golden-spiral drift.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Wave Coherence</p>
            <p>
              Measures how strongly an SGU aligns with its category centroid. Computed as
              1/(1+distance) where distance is Euclidean distance to the category's mean position.
            </p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Drift Tracking</p>
            <p>
              Repeated observations of the same SGU (by ID) track position changes over time.
              Spiral fidelity measures how well the drift follows a golden spiral pattern.
            </p>
          </div>
          <div className="pt-3 border-t border-gray-800">
            <p className="text-amber-400">
              <strong>Note:</strong> This is a 2-D engineering projection. The full SYGON specification
              describes high-dimensional Riemannian manifolds, which are not implemented here.
              All measurements are corpus-relative operational indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
