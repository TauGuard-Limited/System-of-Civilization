import { Activity, Shield, GitBranch, Waves, TrendingUp, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type View = 'dashboard' | 'coherence' | 'sir' | 'homeostasis' | 'architecture' | 'data' | 'narrative';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border border-gray-800 p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Specification v1.0
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Proposed Architecture
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            System of Civilization
          </h1>
          <p className="text-gray-400 text-sm lg:text-base max-w-3xl leading-relaxed">
            Toward a Formal Model of Symbolic Homeostasis — A diagnostic measurement system for observing 
            how meaning, trust, narratives, and collective attention evolve across distributed digital ecosystems.
          </p>
          <p className="text-gray-500 text-xs mt-3">
            Author: Michal Harcej • Organization: TauGuard • Category: Distributed symbolic-coherence monitoring
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Diagnostic, Not Doctrinal</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Reveals patterns and identifies anomalies without determining which beliefs a population is permitted to hold.
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
            <Activity size={20} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Measurable κ(t)</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Symbolic coherence signal evaluated alongside semantic diversity, narrative amplification, and temporal instability.
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
            <GitBranch size={20} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Immune System Metaphor</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Detects destabilizing narrative dynamics and examines mechanisms of collective recovery through SIR-inspired simulation.
          </p>
        </div>
      </div>

      {/* Two Pathological Conditions */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Two Pathological Conditions Detected
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Hypo-coherence</span>
            </div>
            <p className="text-xs text-gray-400">
              Fragmentation, loss of shared reference, or declining capacity to coordinate around common information.
            </p>
          </div>
          <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-red-400" />
              <span className="text-xs font-medium text-red-400">Hyper-coherence</span>
            </div>
            <p className="text-xs text-gray-400">
              Excessive synchronization, narrative monoculture, or suppression of meaningful interpretive diversity.
            </p>
          </div>
        </div>
      </div>

      {/* System Components */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">System Components</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Coherence Engine', desc: 'κ(t) computation', view: 'coherence', color: 'emerald' },
            { title: 'Narrative Dynamics', desc: 'Temporal patterns', view: 'narrative', color: 'cyan' },
            { title: 'Homeostasis Analyzer', desc: 'Classification', view: 'homeostasis', color: 'purple' },
            { title: 'SIR Simulator', desc: 'Propagation model', view: 'sir', color: 'amber' },
          ].map(item => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view as View)}
              className="text-left rounded-lg bg-gray-800/50 border border-gray-700/50 p-4 hover:border-gray-600 transition-all group"
            >
              <h4 className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Application Domains */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={16} className="text-cyan-400" />
          Initial Application Domains
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <div>
              <p className="text-xs font-medium text-white">Decentralized Governance</p>
              <p className="text-xs text-gray-500 mt-0.5">Ethereum proposals, discussions, voting records</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <div>
              <p className="text-xs font-medium text-white">Collaborative Knowledge</p>
              <p className="text-xs text-gray-500 mt-0.5">Wikipedia edits, discussion pages, topic evolution</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <div>
              <p className="text-xs font-medium text-white">Public Discourse</p>
              <p className="text-xs text-gray-500 mt-0.5">Licensed news and social-media datasets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Equations */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          Core Mathematical Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Semantic Coherence</p>
            <code className="text-xs text-emerald-300 font-mono block">
              C_t = Σ w_ij(t)·s_ij(t) / Σ w_ij(t)
            </code>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Symbolic Dissipation</p>
            <code className="text-xs text-emerald-300 font-mono block">
              d(Δt) = e^(-λ·Δt)
            </code>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Temporal Coherence Signal</p>
            <code className="text-xs text-emerald-300 font-mono block">
              κ_t = Σ h_j·C_(t-j)·d_j / Σ h_j·d_j
            </code>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Narrative Entropy</p>
            <code className="text-xs text-emerald-300 font-mono block">
              H_t = -Σ p_k(t)·ln(p_k(t))
            </code>
          </div>
        </div>
      </div>

      {/* Explicit Exclusions */}
      <div className="rounded-xl bg-gray-900 border border-red-900/30 p-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-red-400" />
          Explicit Exclusions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Determine truth of a narrative from coherence alone',
            'Classify individuals as ideologically infected',
            'Automatically censor or suppress viewpoints',
            'Treat disagreement as evidence of pathology',
            'Execute governance actions based solely on scores',
            'Infer collective consciousness from thresholds',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <X size={12} className="text-red-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
