import { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import {
  Rss, Globe, Database, Cpu, Activity, Shield, Clock,
  CheckCircle, AlertTriangle, XCircle, Play, Pause, RotateCcw,
  ArrowRight, Eye, Link2, Info, Layers, Zap, Filter,
  ExternalLink, RefreshCw, Wifi, WifiOff, Loader2, BookOpen
} from 'lucide-react';
import {
  REAL_FEEDS, fetchAndParseFeed, type RSSFeedConfig, type RSSItem
} from '../services/rssService';
import {
  computeCoherence, computeEntropy, extractTopics, decayWeight
} from '../services/semanticSimilarity';

interface FeedState {
  config: RSSFeedConfig;
  enabled: boolean;
  items: RSSItem[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface KappaPoint {
  t: number;
  kappa: number;
  rawCoherence: number;
  entropy: number;
  itemCount: number;
  timestamp: number;
}

const colorClasses: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function LiveIngestion() {
  const [feeds, setFeeds] = useState<FeedState[]>(
    REAL_FEEDS.map(config => ({
      config,
      enabled: ['bbc-world', 'hackernews', 'wikipedia-rc'].includes(config.id), // Default selection
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    }))
  );
  const [kappaHistory, setKappaHistory] = useState<KappaPoint[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(60); // seconds
  const [decayLambda, setDecayLambda] = useState(0.1);
  const [windowSize, setWindowSize] = useState(30);
  const [fetchCount, setFetchCount] = useState(0);
  const [showProvenance, setShowProvenance] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // All items from enabled feeds
  const allItems = feeds
    .filter(f => f.enabled)
    .flatMap(f => f.items)
    .sort((a, b) => b.pubDate - a.pubDate);

  // Fetch a single feed
  const fetchFeed = useCallback(async (feedIndex: number) => {
    const feed = feeds[feedIndex];
    if (!feed.enabled) return;

    setFeeds(prev => prev.map((f, i) => i === feedIndex ? { ...f, loading: true, error: null } : f));

    try {
      const items = await fetchAndParseFeed(feed.config);
      setFeeds(prev => prev.map((f, i) => i === feedIndex ? {
        ...f,
        items,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      } : f));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setFeeds(prev => prev.map((f, i) => i === feedIndex ? {
        ...f,
        loading: false,
        error: errorMsg,
      } : f));
    }
  }, [feeds]);

  // Fetch all enabled feeds
  const fetchAll = useCallback(async () => {
    setGlobalError(null);
    setFetchCount(c => c + 1);

    const enabledIndices = feeds
      .map((f, i) => f.enabled ? i : -1)
      .filter(i => i >= 0);

    await Promise.all(enabledIndices.map(i => fetchFeed(i)));

    // After fetching, compute κ(t) for the new snapshot
    setTimeout(() => computeKappaSnapshot(), 100);
  }, [feeds, fetchFeed]);

  // Compute κ(t) snapshot from current items
  const computeKappaSnapshot = useCallback(() => {
    const items = feeds
      .filter(f => f.enabled)
      .flatMap(f => f.items)
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, windowSize);

    if (items.length < 2) return;

    const texts = items.map(item => `${item.title} ${item.description}`);
    const now = Date.now();

    // Apply decay weights based on age
    const weights = items.map((item, i) => {
      const age = now - item.pubDate;
      const decay = decayWeight(age, decayLambda);
      return items.map((_, j) => {
        const ageJ = now - items[j].pubDate;
        return (decay + decayWeight(ageJ, decayLambda)) / 2;
      });
    });

    const rawCoherence = computeCoherence(texts, weights);
    const categories = items.flatMap(item => 
      item.categories.length > 0 ? item.categories : extractTopics(`${item.title} ${item.description}`, 1)
    );
    const entropy = computeEntropy(categories);

    // Smooth κ(t) with exponential moving average
    setKappaHistory(prev => {
      const prevKappa = prev.length > 0 ? prev[prev.length - 1].kappa : rawCoherence;
      const alpha = 0.3; // Smoothing factor
      const kappa = alpha * rawCoherence + (1 - alpha) * prevKappa;

      const newPoint: KappaPoint = {
        t: prev.length,
        kappa,
        rawCoherence,
        entropy,
        itemCount: items.length,
        timestamp: now,
      };

      return [...prev, newPoint].slice(-100);
    });
  }, [feeds, decayLambda, windowSize]);

  // Auto-refresh
  useEffect(() => {
    if (isAutoRefresh) {
      autoRefreshRef.current = setInterval(fetchAll, autoRefreshInterval * 1000);
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [isAutoRefresh, autoRefreshInterval, fetchAll]);

  // Toggle feed
  const toggleFeed = (index: number) => {
    setFeeds(prev => prev.map((f, i) => i === index ? { ...f, enabled: !f.enabled } : f));
  };

  // Current metrics
  const currentKappa = kappaHistory.length > 0 ? kappaHistory[kappaHistory.length - 1].kappa : 0;
  const currentEntropy = kappaHistory.length > 0 ? kappaHistory[kappaHistory.length - 1].entropy : 0;
  const kappaMin = 0.05; // Lower threshold for real data (Jaccard is sparser than embeddings)
  const kappaMax = 0.35;

  const getStatus = () => {
    if (kappaHistory.length < 2) return { label: 'Collecting baseline...', color: 'text-gray-400' };
    if (currentKappa < kappaMin) return { label: 'Potential Hypo-coherence', color: 'text-blue-400' };
    if (currentKappa > kappaMax) return { label: 'Potential Hyper-coherence', color: 'text-red-400' };
    return { label: 'Within Reference Range', color: 'text-emerald-400' };
  };

  const status = getStatus();
  const enabledFeeds = feeds.filter(f => f.enabled);
  const totalItems = allItems.length;
  const failedFeeds = feeds.filter(f => f.error).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          Live RSS Ingestion Pipeline
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Real-time ingestion from public RSS feeds through the Symbolic Homeostasis Engine. 
          Data flows through a controlled pipeline: fetch → deduplicate → validate → embed → κ(t) → store.
        </p>
      </div>

      {/* Methodology Notice */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-400 leading-relaxed">
          <p className="text-amber-300 font-medium mb-1">Methodology Note</p>
          <p>
            This implementation uses <span className="text-white">Jaccard similarity on tokenized text</span> as a proxy for semantic similarity, 
            since browser environments cannot run full embedding models. In production, this would be replaced with 
            sentence-transformers or equivalent. Coherence values will therefore be lower than with true embeddings.
            Also: live news is <span className="text-white font-medium">not</span> a direct measurement of civilizational health — 
            it measures patterns in the specific sources you select.
          </p>
        </div>
      </div>

      {/* Feed Selection */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Rss size={16} className="text-emerald-400" />
            Configure Live RSS Sources
          </h3>
          <span className="text-xs text-gray-500">
            {enabledFeeds.length} of {feeds.length} feeds enabled
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feeds.map((feed, i) => (
            <div
              key={feed.config.id}
              className={`rounded-lg border p-3 transition-all ${
                feed.enabled
                  ? colorClasses[feed.config.color]
                  : 'bg-gray-800/30 border-gray-700/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleFeed(i)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        feed.enabled
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'bg-transparent border-gray-600'
                      }`}
                    >
                      {feed.enabled && <CheckCircle size={10} className="text-white" />}
                    </button>
                    <span className="text-xs font-medium text-white truncate">{feed.config.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      feed.config.category === 'news' ? 'bg-emerald-500/20 text-emerald-300' :
                      feed.config.category === 'knowledge' ? 'bg-cyan-500/20 text-cyan-300' :
                      feed.config.category === 'governance' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {feed.config.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{feed.config.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {feed.loading ? (
                      <Loader2 size={10} className="text-amber-400 animate-spin" />
                    ) : feed.error ? (
                      <XCircle size={10} className="text-red-400" />
                    ) : feed.lastFetched ? (
                      <CheckCircle size={10} className="text-emerald-400" />
                    ) : null}
                    <span className="text-[10px] text-gray-500">
                      {feed.loading ? 'Fetching...' :
                       feed.error ? `Error: ${feed.error}` :
                       feed.lastFetched ? `${feed.items.length} items • ${new Date(feed.lastFetched).toLocaleTimeString()}` :
                       'Not fetched yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fetch Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              disabled={enabledFeeds.length === 0 || feeds.some(f => f.loading)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={feeds.some(f => f.loading) ? 'animate-spin' : ''} />
              Fetch Live Data Now
            </button>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border transition-colors ${
                isAutoRefresh
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {isAutoRefresh ? <Pause size={12} /> : <Play size={12} />}
              Auto-refresh {isAutoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { setFeeds(prev => prev.map(f => ({ ...f, items: [] }))); setKappaHistory([]); setFetchCount(0); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Wifi size={12} className={failedFeeds > 0 ? 'text-red-400' : 'text-emerald-400'} />
              {failedFeeds > 0 ? `${failedFeeds} failed` : 'All feeds OK'}
            </span>
            <span>Fetches: {fetchCount}</span>
          </div>
        </div>

        {isAutoRefresh && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <label className="text-xs text-gray-400 block mb-2">
              Auto-refresh interval: {autoRefreshInterval}s
            </label>
            <input
              type="range" min="30" max="600" step="30" value={autoRefreshInterval}
              onChange={e => setAutoRefreshInterval(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-500 max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">Please respect feed providers — longer intervals are more polite</p>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">κ(t) Current</p>
          <p className="text-2xl font-bold text-white">{currentKappa.toFixed(3)}</p>
          <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Entropy H*</p>
          <p className="text-2xl font-bold text-white">{currentEntropy.toFixed(3)}</p>
          <p className="text-xs text-gray-500 mt-1">Narrative diversity</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Articles Ingested</p>
          <p className="text-2xl font-bold text-emerald-400">{totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">From {enabledFeeds.length} feeds</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Snapshots</p>
          <p className="text-2xl font-bold text-white">{kappaHistory.length}</p>
          <p className="text-xs text-gray-500 mt-1">κ(t) measurements</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Window Size</p>
          <p className="text-2xl font-bold text-white">{windowSize}</p>
          <p className="text-xs text-gray-500 mt-1">Most recent items</p>
        </div>
      </div>

      {/* Coherence Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">κ(t) Time Series — Coherence Across Fetches</h3>
        <div className="h-64">
          {kappaHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kappaHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="liveKappaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="t" stroke="#4b5563" fontSize={10} label={{ value: 'Fetch #', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }} />
                <YAxis domain={[0, 'auto']} stroke="#4b5563" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                  labelFormatter={(label) => `Fetch #${label}`}
                />
                <ReferenceLine y={kappaMax} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_max', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={kappaMin} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_min', fill: '#3b82f6', fontSize: 10 }} />
                <Line type="monotone" dataKey="rawCoherence" stroke="#06b6d4" strokeWidth={1} dot={false} strokeOpacity={0.4} name="Raw C(t)" />
                <Area type="monotone" dataKey="kappa" stroke="#10b981" strokeWidth={2} fill="url(#liveKappaGrad)" dot={{ fill: '#10b981', r: 3 }} name="κ(t) (smoothed)" />
                <Line type="monotone" dataKey="entropy" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Entropy H*" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Activity size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Click "Fetch Live Data Now" to begin ingesting from real RSS feeds</p>
                <p className="text-xs text-gray-600 mt-1">Each fetch creates one κ(t) measurement point</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Engine Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Decay Rate (λ): {decayLambda.toFixed(2)}
            </label>
            <input
              type="range" min="0.01" max="0.5" step="0.01" value={decayLambda}
              onChange={e => setDecayLambda(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Exponential decay: d(Δt) = e^(-λ·Δt). Half-life: {(Math.log(2) / decayLambda).toFixed(1)} hours
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Sliding Window: {windowSize} articles
            </label>
            <input
              type="range" min="5" max="100" step="5" value={windowSize}
              onChange={e => setWindowSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Number of most recent articles in coherence calculation</p>
          </div>
        </div>
      </div>

      {/* Provenance Log — Real Articles */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Eye size={16} className="text-emerald-400" />
            Provenance Log — Real Articles with Source Traceability
          </h3>
          <button
            onClick={() => setShowProvenance(!showProvenance)}
            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {showProvenance ? 'Hide' : 'Show'} ({allItems.length})
          </button>
        </div>

        {showProvenance && (
          <div className="max-h-96 overflow-y-auto">
            {allItems.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No articles yet. Click "Fetch Live Data Now" to ingest from real RSS feeds.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allItems.slice(0, 50).map((item, i) => {
                  const feed = feeds.find(f => f.config.id === item.sourceId);
                  const feedColor = feed?.config.color || 'emerald';
                  return (
                    <div key={`${item.id}-${i}`} className="rounded-lg bg-gray-800/30 border border-gray-700/30 p-3 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${colorClasses[feedColor]} border`}>
                              {item.sourceName}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(item.pubDate).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-white leading-snug mb-1">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                                {item.title} <ExternalLink size={9} className="inline ml-1 opacity-50" />
                              </a>
                            ) : item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{item.description.slice(0, 200)}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {item.categories.slice(0, 3).map(cat => (
                              <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">
                                {cat}
                              </span>
                            ))}
                            {item.author && (
                              <span className="text-[10px] text-gray-600">by {item.author}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono shrink-0">
                          {item.id.slice(0, 20)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pipeline Architecture */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Controlled Ingestion Architecture</h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: <Rss size={14} />, label: 'Real RSS Feeds', color: 'emerald' },
            { icon: <Globe size={14} />, label: 'CORS Proxy', color: 'cyan' },
            { icon: <Filter size={14} />, label: 'Parse & Validate', color: 'amber' },
            { icon: <Database size={14} />, label: 'Deduplicate', color: 'purple' },
            { icon: <Cpu size={14} />, label: 'Tokenize', color: 'cyan' },
            { icon: <Activity size={14} />, label: 'κ(t) + H*', color: 'emerald' },
            { icon: <Layers size={14} />, label: 'Time-Series', color: 'purple' },
            { icon: <Shield size={14} />, label: 'Alerts', color: 'amber' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg border ${colorClasses[step.color]}`}>
                {step.icon}
                <span className="text-[10px] font-medium text-white whitespace-nowrap">{step.label}</span>
              </div>
              {i < 7 && <ArrowRight size={12} className="text-gray-600 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="text-xs text-gray-400">
            <p className="font-medium text-white mb-1">CORS Proxy Fallback Chain</p>
            <p className="text-gray-500">
              1. api.allorigins.win → 2. corsproxy.io → 3. api.codetabs.com. 
              If all fail, the feed is marked as errored and existing data is preserved.
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p className="font-medium text-white mb-1">Rate Limiting</p>
            <p className="text-gray-500">
              Auto-refresh defaults to 60s. Please increase interval for production use. 
              The system does not hammer feeds — each fetch is cached and deduplicated.
            </p>
          </div>
        </div>
      </div>

      {/* Real Data Caveats */}
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          Important Limitations of Live News Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>News feeds are a <span className="text-white">partial, biased sample</span> — not representative of an entire civilization</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>Editorial selection, geographic focus, and language create systematic skew</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>High coherence may reflect <span className="text-white">media monoculture</span>, not social agreement</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>Low coherence may reflect <span className="text-white">healthy pluralism</span> of sources, not social fragmentation</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>Jaccard similarity is a weak proxy — real embeddings would give different values</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span>This is a <span className="text-white">diagnostic research tool</span>, not a measure of civilizational health</span>
          </div>
        </div>
      </div>
    </div>
  );
}
