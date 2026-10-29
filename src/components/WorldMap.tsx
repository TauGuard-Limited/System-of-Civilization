import { useState, useMemo } from 'react';
import { Globe, Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { COUNTRIES, COUNTRY_NAME_TO_ID, type CountryShape } from '../data/worldMap';
import { useAppState } from '../App';

export default function WorldMap() {
  const { kappaHistory, activeCountry, setActiveCountry, assessments } = useAppState();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Compute per-country metrics from kappaHistory
  const countryMetrics = useMemo(() => {
    const metrics: Record<string, {
      kappa: number;
      entropy: number;
      itemCount: number;
      lastUpdate: number;
      status: 'homeostasis' | 'hypo' | 'hyper' | 'no-data';
      trend: 'up' | 'down' | 'stable';
      snapshots: number;
    }> = {};

    // Initialize all countries
    COUNTRIES.forEach(c => {
      metrics[c.id] = {
        kappa: 0,
        entropy: 0,
        itemCount: 0,
        lastUpdate: 0,
        status: 'no-data',
        trend: 'stable',
        snapshots: 0,
      };
    });

    // Aggregate by country
    const byCountry: Record<string, typeof kappaHistory> = {};
    kappaHistory.forEach(snap => {
      if (!byCountry[snap.country]) byCountry[snap.country] = [];
      byCountry[snap.country].push(snap);
    });

    Object.entries(byCountry).forEach(([country, snaps]) => {
      const countryId = COUNTRY_NAME_TO_ID[country];
      if (!countryId || countryId === 'GLOBAL') return;

      const sorted = snaps.sort((a, b) => a.timestamp - b.timestamp);
      const latest = sorted[sorted.length - 1];
      const avgKappa = sorted.reduce((sum, s) => sum + s.kappa, 0) / sorted.length;
      const avgEntropy = sorted.reduce((sum, s) => sum + s.entropy, 0) / sorted.length;
      const totalItems = sorted.reduce((sum, s) => sum + s.itemCount, 0);

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (sorted.length >= 2) {
        const recent = sorted.slice(-3);
        const older = sorted.slice(-6, -3);
        if (older.length > 0) {
          const recentAvg = recent.reduce((s, x) => s + x.kappa, 0) / recent.length;
          const olderAvg = older.reduce((s, x) => s + x.kappa, 0) / older.length;
          const diff = recentAvg - olderAvg;
          if (diff > 0.01) trend = 'up';
          else if (diff < -0.01) trend = 'down';
        }
      }

      // Determine status
      const kappaMin = 0.05;
      const kappaMax = 0.35;
      let status: 'homeostasis' | 'hypo' | 'hyper' | 'no-data' = 'no-data';
      if (latest) {
        if (latest.kappa < kappaMin) status = 'hypo';
        else if (latest.kappa > kappaMax) status = 'hyper';
        else status = 'homeostasis';
      }

      metrics[countryId] = {
        kappa: latest?.kappa ?? avgKappa,
        entropy: latest?.entropy ?? avgEntropy,
        itemCount: totalItems,
        lastUpdate: latest?.timestamp ?? 0,
        status,
        trend,
        snapshots: sorted.length,
      };
    });

    return metrics;
  }, [kappaHistory]);

  // Get color for country based on κ(t)
  const getCountryColor = (countryId: string): string => {
    const m = countryMetrics[countryId];
    if (!m || m.status === 'no-data') return '#374151'; // gray-700

    const kappa = m.kappa;
    const kappaMin = 0.05;
    const kappaMax = 0.35;

    if (kappa < kappaMin) {
      // Blue gradient for hypo-coherence
      const intensity = Math.max(0, Math.min(1, (kappaMin - kappa) / kappaMin));
      const r = Math.round(59 - intensity * 20);
      const g = Math.round(130 - intensity * 30);
      const b = Math.round(246);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (kappa > kappaMax) {
      // Red gradient for hyper-coherence
      const intensity = Math.min(1, (kappa - kappaMax) / 0.2);
      const r = 239;
      const g = Math.round(68 - intensity * 30);
      const b = Math.round(68 - intensity * 30);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Green gradient for homeostasis
      const normalized = (kappa - kappaMin) / (kappaMax - kappaMin);
      const r = Math.round(16 + normalized * 20);
      const g = Math.round(185 - normalized * 40);
      const b = Math.round(129 - normalized * 30);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Global stats
  const globalStats = useMemo(() => {
    const active = Object.values(countryMetrics).filter(m => m.status !== 'no-data');
    if (active.length === 0) return null;

    const avgKappa = active.reduce((s, m) => s + m.kappa, 0) / active.length;
    const avgEntropy = active.reduce((s, m) => s + m.entropy, 0) / active.length;
    const totalItems = active.reduce((s, m) => s + m.itemCount, 0);
    const hypoCount = active.filter(m => m.status === 'hypo').length;
    const hyperCount = active.filter(m => m.status === 'hyper').length;
    const homeoCount = active.filter(m => m.status === 'homeostasis').length;

    return {
      avgKappa,
      avgEntropy,
      totalItems,
      activeCountries: active.length,
      hypoCount,
      hyperCount,
      homeoCount,
    };
  }, [countryMetrics]);

  const hoveredData = hoveredCountry ? countryMetrics[hoveredCountry] : null;
  const hoveredShape = hoveredCountry ? COUNTRIES.find(c => c.id === hoveredCountry) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Globe size={20} className="text-cyan-400" />
          Global Coherence Map
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Real-time symbolic coherence scores by country. Click any country to view details or switch context.
        </p>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Global κ(t)</p>
            <p className="text-xl font-bold text-white">{globalStats.avgKappa.toFixed(3)}</p>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Active Countries</p>
            <p className="text-xl font-bold text-emerald-400">{globalStats.activeCountries}</p>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Homeostasis</p>
            <p className="text-xl font-bold text-emerald-400">{globalStats.homeoCount}</p>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Hypo-coherence</p>
            <p className="text-xl font-bold text-blue-400">{globalStats.hypoCount}</p>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Hyper-coherence</p>
            <p className="text-xl font-bold text-red-400">{globalStats.hyperCount}</p>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
            <p className="text-xs text-gray-500 mb-1">Total Articles</p>
            <p className="text-xl font-bold text-white">{globalStats.totalItems}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 relative">
        <div className="relative">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            {/* Background */}
            <rect width="1000" height="500" fill="#0a0a0a" />
            
            {/* Grid lines */}
            {[...Array(10)].map((_, i) => (
              <line
                key={`vline-${i}`}
                x1={i * 100}
                y1={0}
                x2={i * 100}
                y2={500}
                stroke="#1f2937"
                strokeWidth="0.5"
                strokeDasharray="2,4"
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <line
                key={`hline-${i}`}
                x1={0}
                y1={i * 100}
                x2={1000}
                y2={i * 100}
                stroke="#1f2937"
                strokeWidth="0.5"
                strokeDasharray="2,4"
              />
            ))}

            {/* Countries */}
            {COUNTRIES.map(country => {
              const isActive = activeCountry === country.name;
              const isHovered = hoveredCountry === country.id;
              const color = getCountryColor(country.id);
              const m = countryMetrics[country.id];

              return (
                <g key={country.id}>
                  <path
                    d={country.path}
                    fill={color}
                    stroke={isActive ? '#10b981' : isHovered ? '#06b6d4' : '#1f2937'}
                    strokeWidth={isActive ? 2 : isHovered ? 1.5 : 0.5}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      filter: isHovered ? 'brightness(1.3)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      setHoveredCountry(country.id);
                      const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => setActiveCountry(country.name)}
                  />
                  {/* Pulse animation for active countries */}
                  {m && m.status !== 'no-data' && (
                    <circle
                      cx={country.center[0]}
                      cy={country.center[1]}
                      r="3"
                      fill={color}
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredCountry && hoveredData && hoveredShape && (
            <div
              className="absolute pointer-events-none z-10 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl"
              style={{
                left: `${Math.min(tooltipPos.x + 10, 800)}px`,
                top: `${tooltipPos.y + 10}px`,
              }}
            >
              <p className="text-xs font-semibold text-white mb-1">{hoveredShape.name}</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">κ(t):</span>
                  <span className={`font-bold ${
                    hoveredData.status === 'hypo' ? 'text-blue-400' :
                    hoveredData.status === 'hyper' ? 'text-red-400' :
                    hoveredData.status === 'homeostasis' ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {hoveredData.kappa.toFixed(3)}
                  </span>
                  {hoveredData.trend === 'up' && <TrendingUp size={10} className="text-emerald-400" />}
                  {hoveredData.trend === 'down' && <TrendingDown size={10} className="text-red-400" />}
                  {hoveredData.trend === 'stable' && <Minus size={10} className="text-gray-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Entropy:</span>
                  <span className="text-white">{hoveredData.entropy.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Articles:</span>
                  <span className="text-white">{hoveredData.itemCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    hoveredData.status === 'hypo' ? 'text-blue-400' :
                    hoveredData.status === 'hyper' ? 'text-red-400' :
                    hoveredData.status === 'homeostasis' ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {hoveredData.status === 'no-data' ? 'No data' : hoveredData.status.toUpperCase()}
                  </span>
                </div>
                {hoveredData.lastUpdate > 0 && (
                  <p className="text-gray-600 text-[10px] mt-1">
                    Updated: {new Date(hoveredData.lastUpdate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(39, 100, 246)' }} />
            <span className="text-gray-400">Hypo-coherence (&lt; 0.05)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(16, 185, 129)' }} />
            <span className="text-gray-400">Homeostasis (0.05–0.35)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(239, 68, 68)' }} />
            <span className="text-gray-400">Hyper-coherence (&gt; 0.35)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-700" />
            <span className="text-gray-400">No data</span>
          </div>
        </div>
      </div>

      {/* Selected Country Details */}
      {activeCountry !== 'Global' && (
        <div className="rounded-xl bg-gray-900 border border-emerald-500/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe size={16} className="text-emerald-400" />
              {activeCountry} — Detailed View
            </h3>
            <button
              onClick={() => setActiveCountry('Global')}
              className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              Back to Global
            </button>
          </div>

          {countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]]?.status !== 'no-data' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current κ(t)</p>
                <p className={`text-2xl font-bold ${
                  countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].status === 'hypo' ? 'text-blue-400' :
                  countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].status === 'hyper' ? 'text-red-400' :
                  'text-emerald-400'
                }`}>
                  {countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].kappa.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Entropy H*</p>
                <p className="text-2xl font-bold text-white">
                  {countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].entropy.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Articles</p>
                <p className="text-2xl font-bold text-white">
                  {countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].itemCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Snapshots</p>
                <p className="text-2xl font-bold text-white">
                  {countryMetrics[COUNTRY_NAME_TO_ID[activeCountry]].snapshots}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Info size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                No data available for {activeCountry}. Run Live Ingestion with feeds from this country.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
          <Info size={16} className="text-cyan-400" />
          How to Use
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
          <div>
            <p className="font-medium text-white mb-1">1. Collect Data</p>
            <p>Go to Live Ingestion, select feeds, and click "Fetch Live Data Now" to populate κ(t) scores.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">2. Explore Map</p>
            <p>Hover over countries to see details. Click to select a country and view its metrics.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">3. Switch Context</p>
            <p>Use the country selector in the top-right or click the map to switch views. All data is country-scoped.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
