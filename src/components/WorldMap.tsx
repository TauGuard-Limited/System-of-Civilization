import { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Graticule,
  Line,
  Sphere,
} from 'react-simple-maps';
import {
  Globe, ZoomIn, ZoomOut, RotateCcw, Search, TrendingUp, TrendingDown,
  Minus, Info, AlertTriangle, CheckCircle, XCircle, MapPin
} from 'lucide-react';
import { GEO_URL, getCountryByCode, CODE_TO_APP_COUNTRY, APP_COUNTRY_TO_CODE } from '../data/countries';
import { useAppState } from '../App';

const GEO_URL_REAL = GEO_URL;

// Color scale for κ(t)
function getKappaColor(kappa: number | null): string {
  if (kappa === null) return '#1f2937'; // gray-800 (no data)
  
  const kappaMin = 0.05;
  const kappaMax = 0.35;
  
  if (kappa < kappaMin) {
    // Blue gradient: hypo-coherence
    const intensity = Math.max(0, Math.min(1, (kappaMin - kappa) / kappaMin));
    // From light blue to deep blue
    const r = Math.round(59 - intensity * 30);
    const g = Math.round(130 - intensity * 50);
    const b = Math.round(246 - intensity * 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (kappa > kappaMax) {
    // Red gradient: hyper-coherence
    const intensity = Math.min(1, (kappa - kappaMax) / 0.15);
    const r = 239;
    const g = Math.round(68 - intensity * 40);
    const b = Math.round(68 - intensity * 40);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green gradient: homeostasis
    const normalized = (kappa - kappaMin) / (kappaMax - kappaMin);
    const r = Math.round(16 + normalized * 10);
    const g = Math.round(185 - normalized * 50);
    const b = Math.round(129 - normalized * 40);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function getKappaStatus(kappa: number | null): 'hypo' | 'homeo' | 'hyper' | 'none' {
  if (kappa === null) return 'none';
  if (kappa < 0.05) return 'hypo';
  if (kappa > 0.35) return 'hyper';
  return 'homeo';
}

interface CountryMetrics {
  kappa: number;
  entropy: number;
  itemCount: number;
  lastUpdate: number;
  trend: 'up' | 'down' | 'stable';
  snapshots: number;
  sources: string[];
}

export default function WorldMap() {
  const { kappaHistory, activeCountry, setActiveCountry } = useAppState();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);

  // Compute per-country metrics
  const countryMetrics = useMemo(() => {
    const metrics: Record<string, CountryMetrics> = {};

    const byCountry: Record<string, typeof kappaHistory> = {};
    kappaHistory.forEach(snap => {
      if (!byCountry[snap.country]) byCountry[snap.country] = [];
      byCountry[snap.country].push(snap);
    });

    Object.entries(byCountry).forEach(([country, snaps]) => {
      const code = APP_COUNTRY_TO_CODE[country];
      if (!code) return;

      const sorted = [...snaps].sort((a, b) => a.timestamp - b.timestamp);
      const latest = sorted[sorted.length - 1];
      const avgKappa = sorted.reduce((s, x) => s + x.kappa, 0) / sorted.length;
      const avgEntropy = sorted.reduce((s, x) => s + x.entropy, 0) / sorted.length;
      const totalItems = sorted.reduce((s, x) => s + x.itemCount, 0);

      // Trend calculation
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (sorted.length >= 4) {
        const recent = sorted.slice(-2);
        const older = sorted.slice(-4, -2);
        const recentAvg = recent.reduce((s, x) => s + x.kappa, 0) / recent.length;
        const olderAvg = older.reduce((s, x) => s + x.kappa, 0) / older.length;
        const diff = recentAvg - olderAvg;
        if (diff > 0.005) trend = 'up';
        else if (diff < -0.005) trend = 'down';
      }

      metrics[code] = {
        kappa: latest?.kappa ?? avgKappa,
        entropy: latest?.entropy ?? avgEntropy,
        itemCount: totalItems,
        lastUpdate: latest?.timestamp ?? 0,
        trend,
        snapshots: sorted.length,
        sources: latest?.sources ?? [],
      };
    });

    return metrics;
  }, [kappaHistory]);

  // Global stats
  const globalStats = useMemo(() => {
    const active = Object.values(countryMetrics);
    if (active.length === 0) return null;
    return {
      avgKappa: active.reduce((s, m) => s + m.kappa, 0) / active.length,
      avgEntropy: active.reduce((s, m) => s + m.entropy, 0) / active.length,
      totalItems: active.reduce((s, m) => s + m.itemCount, 0),
      activeCountries: active.length,
      hypoCount: active.filter(m => m.kappa < 0.05).length,
      hyperCount: active.filter(m => m.kappa > 0.35).length,
      homeoCount: active.filter(m => m.kappa >= 0.05 && m.kappa <= 0.35).length,
    };
  }, [countryMetrics]);

  // Get hovered country info
  const hoveredMetrics = hoveredCountry ? countryMetrics[hoveredCountry] : null;
  const hoveredInfo = hoveredCountry ? getCountryByCode(hoveredCountry) : null;

  // Selected country details
  const selectedCode = APP_COUNTRY_TO_CODE[activeCountry];
  const selectedMetrics = selectedCode ? countryMetrics[selectedCode] : null;

  // Country list for sidebar (filtered by search)
  const countryList = useMemo(() => {
    const list = Object.entries(countryMetrics)
      .map(([code, metrics]) => ({
        code,
        info: getCountryByCode(code),
        metrics,
      }))
      .filter(c => c.info)
      .filter(c => !searchQuery || 
        c.info!.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.info!.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.metrics.kappa - a.metrics.kappa);
    return list;
  }, [countryMetrics, searchQuery]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));
  const handleReset = () => { setZoom(1); setCenter([0, 20]); };

  const handleCountryClick = useCallback((geo: any) => {
    const code = String(geo.id ?? '');
    const appCountry = CODE_TO_APP_COUNTRY[code];
    if (appCountry) {
      setActiveCountry(appCountry);
    }
  }, [setActiveCountry]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe size={20} className="text-cyan-400" />
            Global Coherence Map
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-world country boundaries. Hover to inspect, click to select, scroll to zoom.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowList(!showList)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              showList ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            Country List
          </button>
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <StatCard label="Global κ(t)" value={globalStats.avgKappa.toFixed(3)} color="text-white" />
          <StatCard label="Countries" value={String(globalStats.activeCountries)} color="text-emerald-400" />
          <StatCard label="Homeostasis" value={String(globalStats.homeoCount)} color="text-emerald-400" />
          <StatCard label="Hypo" value={String(globalStats.hypoCount)} color="text-blue-400" />
          <StatCard label="Hyper" value={String(globalStats.hyperCount)} color="text-red-400" />
          <StatCard label="Entropy H*" value={globalStats.avgEntropy.toFixed(3)} color="text-purple-400" />
          <StatCard label="Articles" value={globalStats.totalItems.toLocaleString()} color="text-cyan-400" />
        </div>
      )}

      {/* Main Map Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden relative">
          {/* Zoom controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-gray-800/90 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center backdrop-blur-sm"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-gray-800/90 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center backdrop-blur-sm"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-lg bg-gray-800/90 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center backdrop-blur-sm"
              title="Reset view"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg bg-gray-800/90 border border-gray-700 text-xs text-gray-400 backdrop-blur-sm">
            {zoom.toFixed(1)}×
          </div>

          {/* Hover tooltip */}
          {hoveredInfo && (
            <div className="absolute bottom-3 left-3 z-10 bg-gray-900/95 border border-gray-700 rounded-lg p-3 backdrop-blur-sm min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white">{hoveredInfo.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                  {hoveredInfo.region}
                </span>
              </div>
              {hoveredMetrics ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">κ(t)</span>
                    <span className={`font-bold ${
                      hoveredMetrics.kappa < 0.05 ? 'text-blue-400' :
                      hoveredMetrics.kappa > 0.35 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {hoveredMetrics.kappa.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Entropy H*</span>
                    <span className="text-white">{hoveredMetrics.entropy.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Articles</span>
                    <span className="text-white">{hoveredMetrics.itemCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Trend</span>
                    <span className="flex items-center gap-1">
                      {hoveredMetrics.trend === 'up' && <><TrendingUp size={10} className="text-emerald-400" /><span className="text-emerald-400">Rising</span></>}
                      {hoveredMetrics.trend === 'down' && <><TrendingDown size={10} className="text-red-400" /><span className="text-red-400">Falling</span></>}
                      {hoveredMetrics.trend === 'stable' && <><Minus size={10} className="text-gray-400" /><span className="text-gray-400">Stable</span></>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      hoveredMetrics.kappa < 0.05 ? 'text-blue-400' :
                      hoveredMetrics.kappa > 0.35 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {hoveredMetrics.kappa < 0.05 ? 'Hypo-coherence' :
                       hoveredMetrics.kappa > 0.35 ? 'Hyper-coherence' : 'Homeostasis'}
                    </span>
                  </div>
                  {hoveredMetrics.lastUpdate > 0 && (
                    <p className="text-[10px] text-gray-600 pt-1 border-t border-gray-800">
                      Updated: {new Date(hoveredMetrics.lastUpdate).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No data collected for this country yet.</p>
              )}
            </div>
          )}

          {/* The Map */}
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 140 }}
            style={{ width: '100%', height: 'auto', background: 'linear-gradient(180deg, #020617 0%, #0c1220 100%)' }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: newZoom }) => {
                setCenter(coordinates as [number, number]);
                if (typeof newZoom === 'number') setZoom(newZoom);
              }}
              minZoom={1}
              maxZoom={8}
            >
              {/* Ocean sphere */}
              <Sphere id="sphere" fill="#0a1628" stroke="#1e3a5f" strokeWidth={0.3} />
              
              {/* Graticule (lat/lon grid) */}
              <Graticule stroke="#1e293b" strokeWidth={0.3} strokeDasharray="2,3" />

              {/* Countries */}
              <Geographies geography={GEO_URL_REAL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const code = String(geo.id ?? '');
                    const metrics = countryMetrics[code];
                    const isActive = selectedCode === code;
                    const isHovered = hoveredCountry === code;
                    const hasData = !!metrics;
                    const kappa = metrics?.kappa ?? null;
                    const fillColor = getKappaColor(kappa);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={isActive ? '#10b981' : isHovered ? '#06b6d4' : '#1f2937'}
                        strokeWidth={isActive ? 1.2 : isHovered ? 0.8 : 0.3}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.2s' },
                          hover: { outline: 'none', fill: hasData ? fillColor : '#374151', cursor: hasData ? 'pointer' : 'default' },
                          pressed: { outline: 'none' },
                        } as any}
                        onMouseEnter={() => setHoveredCountry(code)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onClick={() => handleCountryClick(geo)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-10 bg-gray-900/95 border border-gray-700 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-[10px] text-gray-500 mb-2 font-medium">Coherence Scale κ(t)</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ background: 'rgb(29, 80, 196)' }} />
                <span className="text-[10px] text-gray-400">Hypo (&lt; 0.05)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ background: 'linear-gradient(90deg, rgb(16, 185, 129), rgb(26, 135, 89))' }} />
                <span className="text-[10px] text-gray-400">Homeostasis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded" style={{ background: 'rgb(239, 28, 28)' }} />
                <span className="text-[10px] text-gray-400">Hyper (&gt; 0.35)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gray-800 border border-gray-700" />
                <span className="text-[10px] text-gray-400">No data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Country List */}
        {showList && (
          <div className="lg:col-span-1 rounded-xl bg-gray-900 border border-gray-800 p-4 max-h-[640px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Search size={14} className="text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {countryList.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  {searchQuery ? 'No matches' : 'No data yet. Run Live Ingestion first.'}
                </p>
              ) : (
                countryList.map(({ code, info, metrics }) => {
                  const status = getKappaStatus(metrics.kappa);
                  const isActive = selectedCode === code;
                  return (
                    <button
                      key={code}
                      onClick={() => info && setActiveCountry(info.name)}
                      className={`w-full text-left rounded-lg p-2 transition-colors ${
                        isActive 
                          ? 'bg-emerald-500/10 border border-emerald-500/20' 
                          : 'hover:bg-gray-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getKappaColor(metrics.kappa) }}
                          />
                          <span className="text-xs text-white truncate">{info?.name}</span>
                        </div>
                        <span className={`text-xs font-mono ${
                          status === 'hypo' ? 'text-blue-400' :
                          status === 'hyper' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {metrics.kappa.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                        <span>{metrics.itemCount} articles</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          {metrics.trend === 'up' && <TrendingUp size={8} className="text-emerald-400" />}
                          {metrics.trend === 'down' && <TrendingDown size={8} className="text-red-400" />}
                          {metrics.trend === 'stable' && <Minus size={8} className="text-gray-500" />}
                          {metrics.trend}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Country Details */}
      {activeCountry !== 'Global' && (
        <div className="rounded-xl bg-gray-900 border border-emerald-500/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              {activeCountry}
              {selectedMetrics && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedMetrics.kappa < 0.05 ? 'bg-blue-500/10 text-blue-400' :
                  selectedMetrics.kappa > 0.35 ? 'bg-red-500/10 text-red-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {selectedMetrics.kappa < 0.05 ? 'Hypo-coherence' :
                   selectedMetrics.kappa > 0.35 ? 'Hyper-coherence' : 'Homeostasis'}
                </span>
              )}
            </h3>
            <button
              onClick={() => setActiveCountry('Global')}
              className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              Back to Global
            </button>
          </div>

          {selectedMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500 mb-1">Current κ(t)</p>
                <p className={`text-2xl font-bold ${
                  selectedMetrics.kappa < 0.05 ? 'text-blue-400' :
                  selectedMetrics.kappa > 0.35 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {selectedMetrics.kappa.toFixed(3)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500 mb-1">Entropy H*</p>
                <p className="text-2xl font-bold text-white">{selectedMetrics.entropy.toFixed(3)}</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500 mb-1">Articles</p>
                <p className="text-2xl font-bold text-white">{selectedMetrics.itemCount.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500 mb-1">Snapshots</p>
                <p className="text-2xl font-bold text-white">{selectedMetrics.snapshots}</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500 mb-1">Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedMetrics.trend === 'up' && <TrendingUp size={20} className="text-emerald-400" />}
                  {selectedMetrics.trend === 'down' && <TrendingDown size={20} className="text-red-400" />}
                  {selectedMetrics.trend === 'stable' && <Minus size={20} className="text-gray-400" />}
                  <span className="text-sm text-white capitalize">{selectedMetrics.trend}</span>
                </div>
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
          Map Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-gray-400">
          <div>
            <p className="font-medium text-white mb-1">🖱️ Hover</p>
            <p>View country metrics in the tooltip</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">👆 Click</p>
            <p>Select a country to switch context</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">🔍 Scroll</p>
            <p>Zoom in/out on the map</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">✋ Drag</p>
            <p>Pan the map to explore regions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
