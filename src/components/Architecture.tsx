import { Network, Database, Cpu, BarChart3, Shield, GitBranch, FileSearch, Monitor } from 'lucide-react';

const components = [
  {
    id: '3.1',
    name: 'Data Acquisition Layer',
    icon: <Database size={20} />,
    color: 'emerald',
    description: 'Collects authorized records from configured digital ecosystems.',
    inputs: [
      'Textual statements and discussion contributions',
      'Timestamps and source identifiers',
      'Topic and semantic representations',
      'Interaction and amplification counts',
      'Voting and participation records',
      'Network relationships',
      'Relevant contextual metadata',
    ],
    requirement: 'Every input must retain source provenance, collection time, and applicable licensing restrictions.',
  },
  {
    id: '3.2',
    name: 'Symbolic Representation Engine',
    icon: <Cpu size={20} />,
    color: 'cyan',
    description: 'Transforms source material into representations suitable for temporal analysis.',
    inputs: [
      'Semantic embeddings',
      'Topic distributions',
      'Narrative clusters',
      'Entity and relationship representations',
      'Archetypal or symbolic categories',
    ],
    requirement: 'Must record representation model, version, parameters, and preprocessing configuration.',
  },
  {
    id: '3.3',
    name: 'TauGuard Coherence Engine',
    icon: <BarChart3 size={20} />,
    color: 'emerald',
    description: 'Computes the proposed symbolic-coherence signal κ(t).',
    inputs: [
      'Semantic relationships',
      'Narrative priors',
      'Attention weights',
      'Temporal integration',
    ],
    requirement: 'Must produce both aggregate signal and constituent measurements. Aggregate without diagnostics is insufficient.',
  },
  {
    id: '3.4',
    name: 'Narrative Dynamics Engine',
    icon: <Network size={20} />,
    color: 'cyan',
    description: 'Tracks changes in narrative prevalence, amplification, semantic diversity, and network distribution.',
    inputs: [
      'Stable shared reference',
      'Fragmentation into weakly connected clusters',
      'Rapid synchronization around a narrative',
      'Repeated oscillation between competing clusters',
      'Concentration of influence among few sources',
    ],
    requirement: 'Patterns are descriptive. Social meaning must be established through contextual analysis.',
  },
  {
    id: '3.5',
    name: 'Symbolic Homeostasis Analyzer',
    icon: <Shield size={20} />,
    color: 'purple',
    description: 'Evaluates coherence, diversity, and instability jointly.',
    inputs: [
      'Ecosystem-specific reference ranges',
      'Persistence requirements',
      'Uncertainty estimates',
      'Hysteresis parameters',
    ],
    requirement: 'Uses configurable entry and exit thresholds to prevent rapid switching between classifications.',
  },
  {
    id: '3.6',
    name: 'Symbolic Epidemiology Simulator',
    icon: <GitBranch size={20} />,
    color: 'amber',
    description: 'SIR metaphor simulation for narrative propagation and recovery.',
    inputs: [
      'Propagation dynamics (β)',
      'Recovery dynamics (γ)',
      'Network structure',
      'Competing narratives',
    ],
    requirement: 'States represent modelled relationships, not medical conditions. Clearly distinguished from real observations.',
  },
  {
    id: '3.7',
    name: 'Audit and Provenance Layer',
    icon: <FileSearch size={20} />,
    color: 'emerald',
    description: 'Records data sources, configurations, model versions, metrics, and alerts.',
    inputs: [
      'Data sources and provenance',
      'Analytical configurations',
      'Model versions',
      'Threshold changes',
      'Computed metrics',
      'Generated alerts',
    ],
    requirement: 'Append-only and cryptographically verifiable records where appropriate.',
  },
  {
    id: '3.8',
    name: 'Research and Visualization Interface',
    icon: <Monitor size={20} />,
    color: 'cyan',
    description: 'Provides charts, network visualizations, anomaly reports, and exports.',
    inputs: [
      'Time-series charts',
      'Narrative-network visualizations',
      'Anomaly reports',
      'Ecosystem comparisons',
      'Reproducible analytical exports',
    ],
    requirement: 'Every displayed indicator must include definition, observation window, uncertainty, and interpretation limits.',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/5' },
  cyan: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/5' },
  purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/5' },
  amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/5' },
};

export default function Architecture() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Network size={20} className="text-cyan-400" />
          System Architecture
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          The system consists of eight logical components. Each component has defined inputs, outputs, 
          and operational requirements. The architecture separates observation, analysis, classification, and simulation.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-6">Component Pipeline</h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {components.map((comp, i) => {
            const colors = colorMap[comp.color];
            return (
              <div key={comp.id} className="flex items-center gap-2">
                <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 text-center min-w-[100px]`}>
                  <div className={`${colors.text} flex justify-center mb-1`}>{comp.icon}</div>
                  <p className="text-xs font-medium text-white">{comp.name.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs text-gray-500">{comp.id}</p>
                </div>
                {i < components.length - 1 && (
                  <div className="text-gray-600 text-xs hidden md:block">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {components.map(comp => {
          const colors = colorMap[comp.color];
          return (
            <div key={comp.id} className={`rounded-xl ${colors.bg} border ${colors.border} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`${colors.text}`}>{comp.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{comp.name}</h3>
                  <p className="text-xs text-gray-500">§{comp.id}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">{comp.description}</p>
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-gray-500 font-medium">Capabilities:</p>
                {comp.inputs.map((input, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-1 h-1 rounded-full ${colors.text.replace('text', 'bg')} mt-1.5 shrink-0`} />
                    <span className="text-xs text-gray-400">{input}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-800/50">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-400">Requirement: </span>
                  {comp.requirement}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Design Principles */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Core Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Diagnostic Measurement', desc: 'The system detects both fragmentation and excessive synchronization without treating disagreement as a defect.' },
            { title: 'No Doctrinal Control', desc: 'Does not determine which political, cultural, or philosophical beliefs a population is permitted to hold.' },
            { title: 'Semantic ≠ Truth', desc: 'Does not confuse semantic coherence with truth. Similarity measures relatedness, not necessarily agreement.' },
            { title: 'Transparent Uncertainty', desc: 'Every classification includes observation window, data coverage, threshold configuration, and known limitations.' },
            { title: 'Versioned Methodology', desc: 'Metric definitions, models, thresholds, and schemas are versioned independently. Changes are reviewable.' },
            { title: 'Non-coercive Operation', desc: 'Analytical alerts never automatically trigger censorship or enforcement against people.' },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-gray-800/30 p-4 border border-gray-700/30">
              <h4 className="text-xs font-medium text-white mb-1">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">API Specification (v1)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Method</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Endpoint</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                { method: 'POST', endpoint: '/api/v1/ecosystems', purpose: 'Register an analytical ecosystem' },
                { method: 'POST', endpoint: '/api/v1/ingestion/jobs', purpose: 'Submit an authorized ingestion job' },
                { method: 'GET', endpoint: '/api/v1/ingestion/jobs/{id}', purpose: 'Retrieve ingestion status' },
                { method: 'POST', endpoint: '/api/v1/analysis/runs', purpose: 'Start a coherence-analysis run' },
                { method: 'GET', endpoint: '/api/v1/analysis/runs/{id}', purpose: 'Retrieve analysis status' },
                { method: 'GET', endpoint: '/api/v1/ecosystems/{id}/coherence', purpose: 'Retrieve coherence time series' },
                { method: 'GET', endpoint: '/api/v1/ecosystems/{id}/assessments', purpose: 'Retrieve homeostasis assessments' },
                { method: 'GET', endpoint: '/api/v1/ecosystems/{id}/narratives', purpose: 'Retrieve narrative-cluster summaries' },
                { method: 'POST', endpoint: '/api/v1/simulations', purpose: 'Create a simulation run' },
                { method: 'GET', endpoint: '/api/v1/simulations/{id}', purpose: 'Retrieve simulation results' },
                { method: 'GET', endpoint: '/api/v1/audit/events', purpose: 'Retrieve authorized audit records' },
              ].map((ep, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-300 font-mono">{ep.endpoint}</td>
                  <td className="py-2 px-3 text-gray-400">{ep.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
