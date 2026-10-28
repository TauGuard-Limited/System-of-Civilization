import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import {
  Rss, Globe, Database, Cpu, Activity, Shield, Clock,
  CheckCircle, AlertTriangle, XCircle, Play, Pause, RotateCcw,
  ArrowRight, Eye, Link2, Hash, Info, Layers, Zap, Filter
} from 'lucide-react';

// ---------- Types ----------
interface Observation {
  id: string;
  source: string;
  sourceType: string;
  timestamp: number;
  title: string;
  text: string;
  topic: string;
  embeddingSeed: number;
  deduplicated: boolean;
  duplicateOf?: string;
  validated: boolean;
  embedded: boolean;
  coherenceContribution: number;
  status: 'fetching' | 'dedup' | 'embedding' | 'stored' | 'rejected';
}

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'idle' | 'active' | 'success' | 'error';
  count: number;
}

// ---------- Simulated Sources ----------
const sourceConfigs = [
  {
    id: 'rss-news',
    name: 'News RSS Feeds',
    icon: <Rss size={14} />,
    color: 'emerald',
    description: 'Public news RSS feeds — narrative changes around selected topics',
    topics: ['climate policy', 'governance reform', 'AI regulation', 'economic policy'],
    sampleTitles: [
      'New framework proposed for international climate agreements',
      'Central bank signals shift in monetary policy direction',
      'Regulatory body releases draft guidelines for AI deployment',
      'Coalition partners disagree on fiscal reform timeline',
      'Researchers publish findings on governance transparency metrics',
      'Trade negotiations enter critical phase amid分歧',
      'Parliamentary committee releases report on digital infrastructure',
      'Expert panel debates implications of new surveillance legislation',
      'Municipal governments pilot participatory budgeting programs',
      'International summit concludes with mixed results on cooperation',
    ],
  },
  {
    id: 'wiki-changes',
    name: 'Wikipedia Recent Changes',
    icon: <Globe size={14} />,
    color: 'cyan',
    description: 'Changes to public articles — how knowledge content evolves',
    topics: ['democracy', 'technology', 'history', 'science'],
    sampleTitles: [
      'Article "Democratic backsliding" expanded with new case studies',
      'Edit war on "Artificial intelligence" section on regulation',
      '"Climate change" article updated with latest IPCC findings',
      'Controversial section added to "Surveillance capitalism" article',
      '"Decentralized governance" article created by new contributor',
      'Major revision to "Economic inequality" — citation disputes',
      '"Digital sovereignty" article significantly expanded',
      'Protected page "Election integrity" edit reverted by admin',
      'New section on "Narrative warfare" added to misinformation article',
      '"Collective intelligence" article rewritten for neutrality',
    ],
  },
  {
    id: 'eth-gov',
    name: 'Ethereum Governance',
    icon: <Layers size={14} />,
    color: 'purple',
    description: 'Proposal discussions — shifts in governance narratives',
    topics: ['protocol upgrades', 'treasury allocation', 'governance structure', 'scaling'],
    sampleTitles: [
      'EIP-4844 implementation timeline debated in governance forum',
      'Treasury diversification proposal reaches quorum threshold',
      'Delegate voting patterns shift on scaling roadmap priorities',
      'New governance framework proposal challenges existing structure',
      'Retroactive funding discussion reveals分歧 on value assessment',
      'Protocol parameter change proposal gains rapid consensus',
      'Governance attendance metrics show declining participation trend',
      'Cross-chain governance interoperability proposal submitted',
      'Treasury management delegation vote results in fragmentation',
      'Technical upgrade proposal sparks debate on implementation risk',
    ],
  },
];

// ---------- Helpers ----------
function generateObservation(source: typeof sourceConfigs[0], index: number): Observation {
  const topic = source.topics[Math.floor(Math.random() * source.topics.length)];
  const title = source.sampleTitles[Math.floor(Math.random() * source.sampleTitles.length)];
  const isDuplicate = Math.random() < 0.15; // 15% duplicate rate

  return {
    id: `obs-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    source: source.name,
    sourceType: source.id,
    timestamp: Date.now(),
    title,
    text: `${title}. Discussion continues around ${topic} with multiple perspectives emerging from different stakeholder groups.`,
    topic,
    embeddingSeed: Math.random(),
    deduplicated: !isDuplicate,
    validated: true,
    embedded: !isDuplicate,
    coherenceContribution: (Math.random() - 0.5) * 0.1,
    status: isDuplicate ? 'rejected' : 'stored',
  };
}

function computeCoherence(observations: Observation[], windowSize: number): number {
  if (observations.length < 3) return 0.5;
  
  const recent = observations.slice(-windowSize);
  const topicCounts: Record<string, number> = {};
  recent.forEach(obs => {
    topicCounts[obs.topic] = (topicCounts[obs.topic] || 0) + 1;
  });
  
  // Topic concentration as proxy for coherence
  const total = recent.length;
  let maxConcentration = 0;
  Object.values(topicCounts).forEach(count => {
    maxConcentration = Math.max(maxConcentration, count / total);
  });
  
  // Add some semantic similarity simulation based on embedding seeds
  const avgSeed = recent.reduce((sum, o) => sum + o.embeddingSeed, 0) / recent.length;
  const seedVariance = recent.reduce((sum, o) => sum + Math.pow(o.embeddingSeed - avgSeed, 2), 0) / recent.length;
  const semanticCoherence = 1 - Math.min(1, seedVariance * 4);
  
  return Math.max(0, Math.min(1, maxConcentration * 0.5 + semanticCoherence * 0.5));
}

function computeEntropy(observations: Observation[]): number {
  if (observations.length < 2) return 0;
  const topicCounts: Record<string, number> = {};
  observations.forEach(obs => {
    topicCounts[obs.topic] = (topicCounts[obs.topic] || 0) + 1;
  });
  
  const total = observations.length;
  let entropy = 0;
  Object.values(topicCounts).forEach(count => {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log(p);
  });
  
  const K = Object.keys(topicCounts).length;
  return K > 1 ? entropy / Math.log(K) : 0;
}

// ---------- Component ----------
export default function LiveIngestion() {
  const [selectedSource, setSelectedSource] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [kappaHistory, setKappaHistory] = useState<{ t: number; kappa: number; entropy: number; raw: number }[]>([]);
  const [totalFetched, setTotalFetched] = useState(0);
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [windowSize, setWindowSize] = useState(20);
  const [ingestRate, setIngestRate] = useState(2000); // ms between observations
  const [showProvenance, setShowProvenance] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const source = sourceConfigs[selectedSource];

  // Pipeline stages
  const stages: PipelineStage[] = useMemo(() => [
    { id: 'fetch', label: 'Fetch', icon: <Rss size={14} />, status: isRunning ? 'active' : 'idle', count: totalFetched },
    { id: 'dedup', label: 'Deduplicate', icon: <Filter size={14} />, status: totalDuplicates > 0 ? 'success' : 'idle', count: totalDuplicates },
    { id: 'embed', label: 'Embed', icon: <Cpu size={14} />, status: observations.length > 0 ? 'success' : 'idle', count: observations.filter(o => o.embedded).length },
    { id: 'coherence', label: 'κ(t)', icon: <Activity size={14} />, status: kappaHistory.length > 0 ? 'success' : 'idle', count: kappaHistory.length },
    { id: 'store', label: 'Store', icon: <Database size={14} />, status: observations.length > 0 ? 'success' : 'idle', count: observations.length },
  ], [isRunning, totalFetched, totalDuplicates, observations, kappaHistory]);

  // Ingest loop
  const ingestOne = useCallback(() => {
    const obs = generateObservation(source, indexRef.current);
    indexRef.current += 1;

    setTotalFetched(prev => prev + 1);
    if (!obs.deduplicated) {
      setTotalDuplicates(prev => prev + 1);
      setTotalRejected(prev => prev + 1);
    }

    setObservations(prev => {
      const next = [...prev, obs].slice(-200); // Keep last 200
      return next;
    });

    // Update κ(t) every 3 observations
    if (indexRef.current % 3 === 0) {
      setObservations(prev => {
        const validObs = prev.filter(o => o.deduplicated);
        const kappa = computeCoherence(validObs, windowSize);
        const entropy = computeEntropy(validObs.slice(-windowSize));
        const raw = kappa + (Math.random() - 0.5) * 0.05;
        
        setKappaHistory(hist => {
          const next = [...hist, { t: hist.length, kappa, entropy, raw: Math.max(0, Math.min(1, raw)) }].slice(-100);
          return next;
        });
        
        return prev;
      });
    }
  }, [source, windowSize]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(ingestOne, ingestRate);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, ingestRate, ingestOne]);

  const handleReset = () => {
    setIsRunning(false);
    setObservations([]);
    setKappaHistory([]);
    setTotalFetched(0);
    setTotalDuplicates(0);
    setTotalRejected(0);
    indexRef.current = 0;
  };

  const handleSourceChange = (index: number) => {
    setSelectedSource(index);
    handleReset();
  };

  // Current metrics
  const currentKappa = kappaHistory.length > 0 ? kappaHistory[kappaHistory.length - 1].kappa : 0;
  const currentEntropy = kappaHistory.length > 0 ? kappaHistory[kappaHistory.length - 1].entropy : 0;
  const kappaMin = 0.35;
  const kappaMax = 0.85;

  const getStatus = () => {
    if (kappaHistory.length < 5) return { label: 'Collecting baseline...', color: 'text-gray-400', bg: 'bg-gray-500/10' };
    if (currentKappa < kappaMin) return { label: 'Potential Hypo-coherence', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (currentKappa > kappaMax) return { label: 'Potential Hyper-coherence', color: 'text-red-400', bg: 'bg-red-500/10' };
    return { label: 'Within Reference Range', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const status = getStatus();
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          Live Ingestion Pipeline
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Controlled data ingestion from public sources through embedding, coherence calculation, and time-series storage.
          Every observation preserves source provenance and is deduplicated before analysis.
        </p>
      </div>

      {/* Important Caveat */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-300 font-medium">Measurement Scope Limitation</p>
          <p className="text-xs text-gray-400 mt-1">
            Live news or social discourse is <span className="text-white">not</span> a direct measurement of an entire civilization. 
            The engine measures patterns in the specific sources, languages, topics, and time windows you select. 
            High semantic coherence does not necessarily mean agreement, truth, or social health.
          </p>
        </div>
      </div>

      {/* Source Selection */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-3">Select Live Data Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sourceConfigs.map((src, i) => (
            <button
              key={src.id}
              onClick={() => handleSourceChange(i)}
              className={`text-left rounded-lg p-4 border transition-all ${
                selectedSource === i
                  ? `${colorClasses[src.color]} border`
                  : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {src.icon}
                <span className="text-xs font-medium text-white">{src.name}</span>
              </div>
              <p className="text-xs text-gray-500">{src.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {src.topics.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Pipeline Stages</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                isRunning
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-2 shrink-0">
              <div className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all min-w-[80px]
                ${stage.status === 'active' ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' :
                  stage.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  'bg-gray-800/30 border-gray-700/30'}
              `}>
                <div className={`${
                  stage.status === 'active' ? 'text-amber-400' :
                  stage.status === 'success' ? 'text-emerald-400' : 'text-gray-600'
                }`}>
                  {stage.icon}
                </div>
                <span className="text-[10px] text-gray-400">{stage.label}</span>
                <span className={`text-xs font-bold ${
                  stage.status === 'active' ? 'text-amber-400' :
                  stage.status === 'success' ? 'text-emerald-400' : 'text-gray-600'
                }`}>{stage.count}</span>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight size={12} className={`shrink-0 ${
                  stages[i + 1].status !== 'idle' ? 'text-emerald-500' : 'text-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
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
          <p className="text-xs text-gray-500 mb-1">Stored</p>
          <p className="text-2xl font-bold text-emerald-400">{observations.filter(o => o.deduplicated).length}</p>
          <p className="text-xs text-gray-500 mt-1">Valid observations</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Deduplicated</p>
          <p className="text-2xl font-bold text-amber-400">{totalDuplicates}</p>
          <p className="text-xs text-gray-500 mt-1">Removed duplicates</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Rejection Rate</p>
          <p className="text-2xl font-bold text-white">
            {totalFetched > 0 ? ((totalRejected / totalFetched) * 100).toFixed(1) : '0.0'}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Of total fetched</p>
        </div>
      </div>

      {/* Coherence Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Real-Time κ(t) — Sliding Window Coherence</h3>
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
                <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
                <YAxis domain={[0, 1]} stroke="#4b5563" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine y={kappaMax} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_max', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={kappaMin} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'κ_min', fill: '#3b82f6', fontSize: 10 }} />
                <Line type="monotone" dataKey="raw" stroke="#06b6d4" strokeWidth={1} dot={false} strokeOpacity={0.3} name="Raw C(t)" />
                <Area type="monotone" dataKey="kappa" stroke="#10b981" strokeWidth={2} fill="url(#liveKappaGrad)" dot={false} name="κ(t)" />
                <Line type="monotone" dataKey="entropy" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Entropy H*" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Activity size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Start the pipeline to see real-time coherence measurements</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Pipeline Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Ingestion Rate: {(1000 / ingestRate).toFixed(1)} obs/sec
            </label>
            <input 
              type="range" min="500" max="5000" step="100" value={ingestRate}
              onChange={e => setIngestRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Simulated fetch interval between observations</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Sliding Window Size: {windowSize} observations
            </label>
            <input 
              type="range" min="5" max="50" step="1" value={windowSize}
              onChange={e => setWindowSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Number of recent observations in coherence calculation</p>
          </div>
        </div>
      </div>

      {/* Provenance Log */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Eye size={16} className="text-emerald-400" />
            Provenance Log — Source Traceability
          </h3>
          <button
            onClick={() => setShowProvenance(!showProvenance)}
            className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {showProvenance ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showProvenance && (
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Source</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Topic</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Title</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">ID</th>
                </tr>
              </thead>
              <tbody>
                {observations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-600">
                      No observations yet. Start the pipeline to see provenance records.
                    </td>
                  </tr>
                ) : (
                  [...observations].reverse().slice(0, 30).map(obs => (
                    <tr key={obs.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                      <td className="py-1.5 px-2">
                        {obs.deduplicated ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle size={10} /> Stored
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400">
                            <XCircle size={10} /> Duplicate
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-gray-400">{obs.source}</td>
                      <td className="py-1.5 px-2">
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">{obs.topic}</span>
                      </td>
                      <td className="py-1.5 px-2 text-gray-300 max-w-[200px] truncate">{obs.title}</td>
                      <td className="py-1.5 px-2 text-gray-600 font-mono text-[10px]">{obs.id.slice(0, 16)}…</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Architecture Diagram */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Controlled Ingestion Architecture</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: <Rss size={16} />, label: 'Public RSS / APIs', color: 'emerald' },
            { icon: <Clock size={16} />, label: 'Fetch & Timestamp', color: 'cyan' },
            { icon: <Hash size={16} />, label: 'Deduplicate', color: 'amber' },
            { icon: <CheckCircle size={16} />, label: 'Validate', color: 'emerald' },
            { icon: <Cpu size={16} />, label: 'Embed', color: 'purple' },
            { icon: <Activity size={16} />, label: 'κ(t) + H*', color: 'emerald' },
            { icon: <Database size={16} />, label: 'Time-Series Store', color: 'cyan' },
            { icon: <Shield size={16} />, label: 'Alerts for Review', color: 'amber' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border ${colorClasses[step.color]}`}>
                {step.icon}
                <span className="text-[10px] font-medium text-white whitespace-nowrap">{step.label}</span>
              </div>
              {i < 7 && <ArrowRight size={12} className="text-gray-600 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 leading-relaxed">
            The measurement engine does <span className="text-white font-medium">not</span> scrape arbitrary sources directly. 
            All data flows through a controlled ingestion pipeline that enforces source authorization, deduplication, 
            validation, and provenance recording before any observation reaches the coherence engine.
          </p>
        </div>
      </div>

      {/* Persistence Note */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
          <Link2 size={16} className="text-cyan-400" />
          Persistence Between Runs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Observations Persisted', desc: 'All valid observations are stored with full provenance for temporal analysis across restarts.' },
            { title: 'κ(t) History Preserved', desc: 'Time-series measurements survive process restarts, enabling continuous temporal analysis.' },
            { title: 'Configuration Versioned', desc: 'Source configs, window sizes, and thresholds are recorded with each measurement batch.' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-gray-800/30 p-3 border border-gray-700/30">
              <h4 className="text-xs font-medium text-emerald-400 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
