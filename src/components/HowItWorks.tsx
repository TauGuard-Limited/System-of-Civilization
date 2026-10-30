import { useState } from 'react';
import { 
  Database, Cpu, BarChart3, Network, Shield, GitBranch, 
  FileSearch, Monitor, ArrowRight, Play, Pause, 
  ChevronRight, Info, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';

const pipelineSteps = [
  {
    id: 1,
    icon: <Database size={22} />,
    title: 'Data Acquisition',
    subtitle: 'Collect authorized records',
    color: 'emerald',
    description: 'The system collects textual statements, timestamps, interaction counts, voting records, and network relationships from configured digital ecosystems (e.g., Ethereum governance, Wikipedia edits, public discourse datasets).',
    detail: 'Every input retains source provenance, collection time, and licensing restrictions. Raw content is stored only where permitted.',
    equation: null,
  },
  {
    id: 2,
    icon: <Cpu size={22} />,
    title: 'Symbolic Representation',
    subtitle: 'Transform into analyzable form',
    color: 'cyan',
    description: 'Source material is transformed into semantic embeddings, topic distributions, narrative clusters, and entity relationships using versioned models.',
    detail: 'The system records model version, parameters, and preprocessing configuration. Symbolic categories are analytical constructs, not universal classifications.',
    equation: 'ψ_i → embedding(ψ_i) ∈ ℝ^d',
  },
  {
    id: 3,
    icon: <BarChart3 size={22} />,
    title: 'Coherence Calculation',
    subtitle: 'Compute κ(t) signal',
    color: 'emerald',
    description: 'The TauGuard Coherence Engine computes pairwise semantic similarity between observations, applies attention weights, and integrates temporally with exponential decay.',
    detail: 'Produces both the aggregate κ(t) signal and its constituent measurements. An aggregate score without diagnostic components is insufficient for audit.',
    equation: 'κ_t = Σ h_j·C_(t-j)·d_j / Σ h_j·d_j',
  },
  {
    id: 4,
    icon: <Network size={22} />,
    title: 'Narrative Dynamics',
    subtitle: 'Track temporal patterns',
    color: 'cyan',
    description: 'Tracks narrative prevalence, amplification, semantic diversity (entropy), and network distribution. Identifies fragmentation, synchronization, and oscillation patterns.',
    detail: 'Patterns are descriptive. Their social meaning must be established through contextual analysis, not assumed from the metric alone.',
    equation: 'H*_t = -Σ p_k(t)·ln(p_k(t)) / ln(K)',
  },
  {
    id: 5,
    icon: <Shield size={22} />,
    title: 'Homeostasis Assessment',
    subtitle: 'Classify ecosystem state',
    color: 'purple',
    description: 'Evaluates coherence, diversity, and instability jointly against ecosystem-specific reference ranges. Applies persistence requirements and hysteresis to reduce false alarms.',
    detail: 'Every classification includes observation window, data coverage, threshold configuration, uncertainty estimate, and known limitations.',
    equation: 'κ_min < κ(t) < κ_max → homeostasis',
  },
  {
    id: 6,
    icon: <GitBranch size={22} />,
    title: 'Simulation (Optional)',
    subtitle: 'Model propagation dynamics',
    color: 'amber',
    description: 'The SIR-inspired simulator explores hypothetical narrative propagation, reinforcement, attenuation, and recovery dynamics within a modelled network.',
    detail: 'States represent modelled relationships with narrative patterns, not medical conditions. Clearly distinguished from real observations.',
    equation: 'dI/dt = β·(S·I/N) - γ·I',
  },
  {
    id: 7,
    icon: <FileSearch size={22} />,
    title: 'Audit & Provenance',
    subtitle: 'Record everything',
    color: 'emerald',
    description: 'Records data sources, analytical configurations, model versions, threshold changes, computed metrics, and generated alerts in append-only verifiable records.',
    detail: 'An independent reviewer must be able to reconstruct the methodology and inspect the evidence supporting any assessment.',
    equation: null,
  },
  {
    id: 8,
    icon: <Monitor size={22} />,
    title: 'Visualization & Export',
    subtitle: 'Transparent reporting',
    color: 'cyan',
    description: 'Provides time-series charts, narrative-network visualizations, anomaly reports, ecosystem comparisons, and reproducible analytical exports.',
    detail: 'Every displayed indicator includes its definition, observation window, uncertainty, and applicable interpretation limits.',
    equation: null,
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', ring: 'ring-emerald-500/50' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', ring: 'ring-cyan-500/50' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', ring: 'ring-purple-500/50' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', ring: 'ring-amber-500/50' },
};

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= pipelineSteps.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2500);
    }
  };

  const step = pipelineSteps[activeStep];
  const colors = colorMap[step.color];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          How It Works
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          An interactive walkthrough of the System of Civilization's analytical pipeline — from raw data ingestion 
          through coherence measurement to homeostasis classification and transparent reporting.
        </p>
      </div>

      {/* Core Principle */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Central Design Principle</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              <span className="text-emerald-400 font-medium">Diagnostic measurement without doctrinal control.</span>{' '}
              The system detects both fragmentation and excessive synchronization without treating disagreement as a defect 
              or confusing semantic coherence with truth. It reveals patterns, identifies anomalies, and supports transparent 
              human analysis — it does not determine which beliefs a population is permitted to hold.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-white">Analytical Pipeline</h3>
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Pause' : 'Auto-play'}
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {pipelineSteps.map((s, i) => {
            const c = colorMap[s.color];
            const isActive = i === activeStep;
            const isPast = i < activeStep;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => { setActiveStep(i); setIsPlaying(false); }}
                  className={`
                    flex flex-col items-center gap-1.5 px-2 py-2 rounded-lg transition-all shrink-0
                    ${isActive ? `${c.bg} ring-1 ${c.ring}` : 'hover:bg-gray-800/50'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isActive ? `${c.bg} ${c.border} border ${c.text}` : 
                      isPast ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-gray-600'}
                  `}>
                    {s.icon}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${
                    isActive ? c.text : isPast ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {s.title.split(' ')[0]}
                  </span>
                </button>
                {i < pipelineSteps.length - 1 && (
                  <ChevronRight size={14} className={`mx-0.5 shrink-0 ${
                    i < activeStep ? 'text-emerald-500' : 'text-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Active Step Detail */}
        <div className={`rounded-xl ${colors.bg} border ${colors.border} p-5 transition-all`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`${colors.text}`}>{step.icon}</div>
            <div>
              <h4 className={`text-sm font-semibold ${colors.text}`}>
                Step {step.id}: {step.title}
              </h4>
              <p className="text-xs text-gray-400">{step.subtitle}</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">{step.description}</p>
          
          {step.equation && (
            <div className="rounded-lg bg-gray-900/50 p-3 border border-gray-700/30 mb-3">
              <code className="text-xs text-emerald-300 font-mono">{step.equation}</code>
            </div>
          )}
          
          <div className="flex items-start gap-2 pt-2 border-t border-gray-700/30">
            <Info size={12} className="text-gray-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">{step.detail}</p>
          </div>
        </div>
      </div>

      {/* Data Flow */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">What Happens to a Single Observation</h3>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Ingested', desc: 'A statement arrives with timestamp, source ID, and interaction metadata', color: 'emerald' },
            { step: '2', label: 'Validated', desc: 'System checks for malformed records, missing fields, invalid timestamps', color: 'emerald' },
            { step: '3', label: 'Embedded', desc: 'Text is transformed into a semantic vector using a versioned model', color: 'cyan' },
            { step: '4', label: 'Compared', desc: 'Pairwise semantic similarity computed against other observations in window', color: 'cyan' },
            { step: '5', label: 'Weighted', desc: 'Attention weights applied (log-bounded), decay function applied by age', color: 'purple' },
            { step: '6', label: 'Integrated', desc: 'Contributes to κ(t) via temporal window with exponential smoothing', color: 'purple' },
            { step: '7', label: 'Classified', desc: 'Combined with diversity and instability to produce homeostasis assessment', color: 'amber' },
            { step: '8', label: 'Audited', desc: 'Full provenance chain recorded — reproducible by independent reviewer', color: 'emerald' },
          ].map((item, i) => {
            const c = colorMap[item.color];
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                  <span className={`text-xs font-bold ${c.text}`}>{item.step}</span>
                </div>
                <ArrowRight size={12} className="text-gray-700 shrink-0" />
                <div className="flex-1">
                  <span className={`text-xs font-medium ${c.text}`}>{item.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Logic */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Classification Decision Logic</h3>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-800/30 p-4 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">First: Evidence Check</span>
            </div>
            <p className="text-xs text-gray-400">
              Is data volume sufficient? Are measurements stable? Is uncertainty within bounds?
              If not → <span className="text-gray-300 font-medium">INSUFFICIENT EVIDENCE</span> (withhold classification)
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowRight size={16} className="text-gray-600 rotate-90" />
          </div>

          <div className="rounded-lg bg-gray-800/30 p-4 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Second: Persistence Check</span>
            </div>
            <p className="text-xs text-gray-400">
              Has the threshold breach persisted for the required number of observations?
              If not → continue monitoring, no high-confidence alert yet (hysteresis)
            </p>
          </div>

          <div className="flex justify-center">
            <ArrowRight size={16} className="text-gray-600 rotate-90" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-500/5 p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-400">If κ(t) &lt; κ_min persistently</span>
              </div>
              <p className="text-xs text-gray-400">
                → <span className="text-blue-300 font-medium">POTENTIAL HYPO-COHERENCE</span><br/>
                Investigate: dysfunction vs. legitimate pluralism vs. changing subject matter
              </p>
            </div>
            <div className="rounded-lg bg-red-500/5 p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs font-medium text-red-400">If κ(t) &gt; κ_max AND diversity &lt; threshold</span>
              </div>
              <p className="text-xs text-gray-400">
                → <span className="text-red-300 font-medium">POTENTIAL HYPER-COHERENCE</span><br/>
                Investigate: coercive conformity vs. normal coordination vs. shared factual response
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/5 p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-400">If instability is high AND persistence is low</span>
              </div>
              <p className="text-xs text-gray-400">
                → <span className="text-amber-300 font-medium">MEMETIC TURBULENCE</span><br/>
                Investigate: event-driven volatility, sampling artifacts, participation changes
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">If κ(t) ∈ range AND diversity acceptable</span>
              </div>
              <p className="text-xs text-gray-400">
                → <span className="text-emerald-300 font-medium">POTENTIAL HOMEOSTASIS</span><br/>
                No threshold breach detected. Not proof of civilizational health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Safeguards */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Built-in Safeguards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'No Automatic Enforcement', desc: 'Analytical alerts never trigger censorship or punitive actions against individuals.' },
            { title: 'Disagreement ≠ Pathology', desc: 'Low coherence may reflect legitimate pluralism, not dysfunction.' },
            { title: 'Agreement ≠ Health', desc: 'High coherence may reflect coercive conformity, not civilizational health.' },
            { title: 'Similarity ≠ Truth', desc: 'Semantic relatedness measures shared topic, not correctness.' },
            { title: 'Indeterminate Over Fabricated', desc: 'When evidence is insufficient, the system returns "insufficient evidence" — never a made-up score.' },
            { title: 'Versioned & Auditable', desc: 'Every threshold, model, and configuration change is recorded and reviewable.' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-gray-800/30 p-3 border border-gray-700/30">
              <h4 className="text-xs font-medium text-emerald-400 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What It Does NOT Do */}
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-6">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          What the System Does NOT Do
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Determine truth from coherence alone',
            'Classify individuals as "infected" or "defective"',
            'Automatically censor or suppress viewpoints',
            'Treat disagreement as pathology',
            'Execute governance actions from scores alone',
            'Establish a single authoritative interpretation',
            'Generalize digital discourse to entire civilizations',
            'Replace human contextual judgment',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <span className="text-red-400 text-[10px]">✕</span>
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-emerald-950/20 border border-emerald-500/20 p-6">
        <p className="text-xs text-gray-300 leading-relaxed italic">
          "A civilization is not healthy because everyone agrees. Its resilience depends, in part, on its capacity 
          to sustain meaningful coordination without eliminating the diversity through which it questions, corrects, 
          and renews itself."
        </p>
        <p className="text-xs text-gray-500 mt-2">— Michal Harcej, System of Civilization v1.0</p>
      </div>
    </div>
  );
}
