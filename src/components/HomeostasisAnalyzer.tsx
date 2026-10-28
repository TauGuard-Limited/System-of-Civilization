import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

type Condition = 'homeostasis' | 'hypo' | 'hyper' | 'turbulence' | 'insufficient';

interface Assessment {
  coherence: number;
  diversity: number;
  instability: number;
  concentration: number;
  dataVolume: number;
  condition: Condition;
  confidence: number;
  persistence: number;
}

function generateAssessment(coherence: number, diversity: number, instability: number, persistence: number): Assessment {
  const concentration = 1 - diversity;
  const dataVolume = 0.7 + Math.random() * 0.3;
  
  let condition: Condition;
  let confidence = 0.5;

  if (dataVolume < 0.4 || coherence < 0 || coherence > 1) {
    condition = 'insufficient';
    confidence = 0.2;
  } else if (instability > 0.7 && persistence < 3) {
    condition = 'turbulence';
    confidence = 0.6;
  } else if (coherence < 0.35 && persistence >= 3) {
    condition = 'hypo';
    confidence = Math.min(0.9, 0.5 + persistence * 0.1);
  } else if (coherence > 0.85 && diversity < 0.3 && persistence >= 3) {
    condition = 'hyper';
    confidence = Math.min(0.9, 0.5 + persistence * 0.1);
  } else {
    condition = 'homeostasis';
    confidence = 0.7;
  }

  return { coherence, diversity, instability, concentration, dataVolume, condition, confidence, persistence };
}

const conditionInfo: Record<Condition, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  homeostasis: {
    label: 'Potential Homeostasis',
    color: 'text-emerald-400',
    icon: <CheckCircle size={16} className="text-emerald-400" />,
    description: 'Coherence within reference range, acceptable diversity, limited instability. Not proof of civilizational health.',
  },
  hypo: {
    label: 'Potential Hypo-coherence',
    color: 'text-blue-400',
    icon: <AlertCircle size={16} className="text-blue-400" />,
    description: 'Persistently low coherence, declining shared references, or increasing fragmentation. Investigate whether this reflects dysfunction, legitimate pluralism, or changing subject matter.',
  },
  hyper: {
    label: 'Potential Hyper-coherence',
    color: 'text-red-400',
    icon: <AlertTriangle size={16} className="text-red-400" />,
    description: 'Persistently high coherence with low diversity or excessive concentration. Investigate whether synchronization reflects coercive conformity, normal coordination, or shared factual response.',
  },
  turbulence: {
    label: 'Memetic Turbulence',
    color: 'text-amber-400',
    icon: <AlertTriangle size={16} className="text-amber-400" />,
    description: 'Repeated sharp changes in coherence or rapid shifts between clusters. Investigate event-driven volatility, sampling artifacts, and changes in participation.',
  },
  insufficient: {
    label: 'Insufficient Evidence',
    color: 'text-gray-400',
    icon: <Info size={16} className="text-gray-400" />,
    description: 'Sparse data, unstable measurements, or excessive uncertainty. Withhold classification and report the evidence gap.',
  },
};

export default function HomeostasisAnalyzer() {
  const [coherence, setCoherence] = useState(0.62);
  const [diversity, setDiversity] = useState(0.55);
  const [instability, setInstability] = useState(0.2);
  const [persistence, setPersistence] = useState(5);

  const assessment = useMemo(
    () => generateAssessment(coherence, diversity, instability, persistence),
    [coherence, diversity, instability, persistence]
  );

  const radarData = [
    { metric: 'Coherence', value: assessment.coherence * 100 },
    { metric: 'Diversity', value: assessment.diversity * 100 },
    { metric: 'Stability', value: (1 - assessment.instability) * 100 },
    { metric: 'Data Volume', value: assessment.dataVolume * 100 },
    { metric: 'Confidence', value: assessment.confidence * 100 },
  ];

  const indicatorBars = [
    { name: 'Coherence κ(t)', value: assessment.coherence, threshold: [0.35, 0.85] },
    { name: 'Diversity H*', value: assessment.diversity, threshold: [0.2, 0.9] },
    { name: 'Instability', value: assessment.instability, threshold: [0, 0.5] },
    { name: 'Concentration', value: assessment.concentration, threshold: [0, 0.7] },
    { name: 'Data Coverage', value: assessment.dataVolume, threshold: [0.4, 1.0] },
  ];

  const info = conditionInfo[assessment.condition];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield size={20} className="text-purple-400" />
          Symbolic Homeostasis Analyzer
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Evaluates coherence, diversity, and instability jointly to identify candidate homeostatic and non-homeostatic conditions.
          Uses ecosystem-specific reference ranges, persistence requirements, and uncertainty estimates.
        </p>
      </div>

      {/* Current Assessment */}
      <div className={`rounded-xl border p-6 ${
        assessment.condition === 'homeostasis' ? 'bg-emerald-500/5 border-emerald-500/20' :
        assessment.condition === 'hypo' ? 'bg-blue-500/5 border-blue-500/20' :
        assessment.condition === 'hyper' ? 'bg-red-500/5 border-red-500/20' :
        assessment.condition === 'turbulence' ? 'bg-amber-500/5 border-amber-500/20' :
        'bg-gray-900 border-gray-800'
      }`}>
        <div className="flex items-start gap-3">
          {info.icon}
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${info.color}`}>{info.label}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{info.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500">
                Confidence: <span className="text-white font-medium">{(assessment.confidence * 100).toFixed(0)}%</span>
              </span>
              <span className="text-xs text-gray-500">
                Persistence: <span className="text-white font-medium">{assessment.persistence} observations</span>
              </span>
              <span className="text-xs text-gray-500">
                Window: <span className="text-white font-medium">30 days</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-4">Multi-Dimensional Assessment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-4">Indicator Levels vs. Reference Ranges</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indicatorBars} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" domain={[0, 1]} stroke="#4b5563" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#4b5563" fontSize={10} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: number) => [value.toFixed(3), 'Value']}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Assessment Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Coherence κ(t): {coherence.toFixed(2)}
            </label>
            <input 
              type="range" min="0" max="1" step="0.01" value={coherence}
              onChange={e => setCoherence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>κ_min = 0.35</span>
              <span>κ_max = 0.85</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Diversity H*: {diversity.toFixed(2)}
            </label>
            <input 
              type="range" min="0" max="1" step="0.01" value={diversity}
              onChange={e => setDiversity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Normalized narrative entropy</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Instability: {instability.toFixed(2)}
            </label>
            <input 
              type="range" min="0" max="1" step="0.01" value={instability}
              onChange={e => setInstability(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Rate and magnitude of coherence changes</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Persistence: {persistence} observations
            </label>
            <input 
              type="range" min="1" max="15" step="1" value={persistence}
              onChange={e => setPersistence(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum observations before high-confidence alert (hysteresis)</p>
          </div>
        </div>
      </div>

      {/* Classification Table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Candidate Operating Conditions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Condition</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Indicators</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(conditionInfo).map(([key, val]) => (
                <tr key={key} className={`border-b border-gray-800/50 ${assessment.condition === key ? 'bg-gray-800/30' : ''}`}>
                  <td className={`py-2.5 px-3 font-medium ${val.color}`}>
                    <div className="flex items-center gap-2">
                      {val.icon}
                      {val.label}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {key === 'homeostasis' && 'κ ∈ range, diversity acceptable, low instability'}
                    {key === 'hypo' && 'Persistently low κ, declining references, fragmentation'}
                    {key === 'hyper' && 'Persistently high κ, low diversity, concentration'}
                    {key === 'turbulence' && 'Repeated sharp κ changes, rapid cluster shifts'}
                    {key === 'insufficient' && 'Sparse data, unstable measurements, high uncertainty'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 max-w-xs">
                    {key === 'homeostasis' && 'No threshold breach; not proof of health'}
                    {key === 'hypo' && 'Investigate: dysfunction vs. pluralism vs. topic change'}
                    {key === 'hyper' && 'Investigate: conformity vs. coordination vs. factual response'}
                    {key === 'turbulence' && 'Investigate: events, artifacts, participation changes'}
                    {key === 'insufficient' && 'Withhold classification; report evidence gap'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uncertainty Report */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Uncertainty Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Observation Window', value: '30 days (configurable)' },
            { label: 'Data Coverage', value: `${(assessment.dataVolume * 100).toFixed(0)}% of expected volume` },
            { label: 'Coherence Measure', value: `κ = ${assessment.coherence.toFixed(3)}` },
            { label: 'Diversity Measure', value: `H* = ${assessment.diversity.toFixed(3)}` },
            { label: 'Threshold Version', value: 'v1.0-ethereum-gov' },
            { label: 'Confidence', value: `${(assessment.confidence * 100).toFixed(0)}%` },
            { label: 'Sampling Limitations', value: 'Digital discourse only; partial representation' },
            { label: 'Model Limitations', value: 'Semantic similarity ≠ agreement or truth' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-1.5 px-3 rounded bg-gray-800/30">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className="text-xs text-gray-300">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
