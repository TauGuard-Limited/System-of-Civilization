import { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitBranch, Play, RotateCcw, Info, AlertTriangle } from 'lucide-react';

interface SIRState {
  S: number;
  I: number;
  R: number;
}

function simulateSIR(beta: number, gamma: number, N: number, steps: number, initialI: number, interventions: { time: number; betaMult: number; gammaMult: number }[]) {
  const data: { t: number; S: number; I: number; R: number; S_pct: number; I_pct: number; R_pct: number }[] = [];
  let state: SIRState = { S: N - initialI, I: initialI, R: 0 };
  
  for (let t = 0; t <= steps; t++) {
    data.push({
      t,
      S: state.S,
      I: state.I,
      R: state.R,
      S_pct: (state.S / N) * 100,
      I_pct: (state.I / N) * 100,
      R_pct: (state.R / N) * 100,
    });
    
    // Check for interventions
    let currentBeta = beta;
    let currentGamma = gamma;
    for (const int of interventions) {
      if (t >= int.time) {
        currentBeta *= int.betaMult;
        currentGamma *= int.gammaMult;
      }
    }
    
    const dS = -currentBeta * (state.S * state.I / N);
    const dI = currentBeta * (state.S * state.I / N) - currentGamma * state.I;
    const dR = currentGamma * state.I;
    
    state = {
      S: Math.max(0, state.S + dS),
      I: Math.max(0, state.I + dI),
      R: Math.max(0, state.R + dR),
    };
  }
  
  return data;
}

export default function SIRSimulator() {
  const [beta, setBeta] = useState(0.35);
  const [gamma, setGamma] = useState(0.1);
  const [N, setN] = useState(10000);
  const [initialI, setInitialI] = useState(10);
  const [steps, setSteps] = useState(200);
  const [enableIntervention, setEnableIntervention] = useState(false);
  const [interventionTime, setInterventionTime] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

  const interventions = useMemo(() => {
    if (!enableIntervention) return [];
    return [{ time: interventionTime, betaMult: 0.3, gammaMult: 2.0 }];
  }, [enableIntervention, interventionTime]);

  const data = useMemo(() => simulateSIR(beta, gamma, N, steps, initialI, interventions), [beta, gamma, N, steps, initialI, interventions]);

  const peakI = Math.max(...data.map(d => d.I));
  const peakTime = data.find(d => d.I === peakI)?.t ?? 0;
  const finalR = data[data.length - 1]?.R ?? 0;
  const R0 = beta / gamma;

  const handleReset = useCallback(() => {
    setBeta(0.35);
    setGamma(0.1);
    setN(10000);
    setInitialI(10);
    setSteps(200);
    setEnableIntervention(false);
    setIsRunning(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch size={20} className="text-purple-400" />
          Symbolic Epidemiology Simulator
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Explores how narrative patterns may propagate, persist, lose influence, and recover within a modelled network. 
          The SIR analogy is a research abstraction — it does not imply that ideas are biological pathogens.
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-300 font-medium">Model Abstraction Notice</p>
          <p className="text-xs text-gray-400 mt-1">
            States S, I, R represent modelled relationships with narrative patterns, not medical conditions. 
            In real digital ecosystems, exposure, endorsement, rejection, and disengagement are distinct phenomena.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Basic Reproduction Number</p>
          <p className="text-2xl font-bold text-white">R₀ = {R0.toFixed(2)}</p>
          <p className={`text-xs mt-1 ${R0 > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
            {R0 > 1 ? 'Narrative spreads' : 'Narrative contained'}
          </p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Peak Prevalence</p>
          <p className="text-2xl font-bold text-white">{((peakI / N) * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">At t = {peakTime}</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Exposure</p>
          <p className="text-2xl font-bold text-white">{((finalR / N) * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Recovered/Disengaged</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Recovery Rate (γ)</p>
          <p className="text-2xl font-bold text-white">{gamma.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Half-life: {(Math.log(2) / gamma).toFixed(1)} steps</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Narrative Propagation Dynamics</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Play size={12} />
              {isRunning ? 'Running' : 'Simulate'}
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
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="t" stroke="#4b5563" fontSize={10} />
              <YAxis stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="S_pct" stroke="#3b82f6" strokeWidth={2} dot={false} name="Susceptible (S)" />
              <Line type="monotone" dataKey="I_pct" stroke="#ef4444" strokeWidth={2} dot={false} name="Influenced (I)" />
              <Line type="monotone" dataKey="R_pct" stroke="#10b981" strokeWidth={2} dot={false} name="Recovered (R)" />
              {enableIntervention && (
                <line x1={interventionTime} y1={0} x2={interventionTime} y2="100%" stroke="#a855f7" strokeDasharray="5 5" strokeOpacity={0.5} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Info size={16} className="text-cyan-400" />
          Simulation Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Transmission Coefficient (β): {beta.toFixed(2)}
            </label>
            <input 
              type="range" min="0.05" max="0.8" step="0.01" value={beta}
              onChange={e => setBeta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Rate at which narrative pattern spreads through the network</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Recovery Rate (γ): {gamma.toFixed(2)}
            </label>
            <input 
              type="range" min="0.01" max="0.3" step="0.01" value={gamma}
              onChange={e => setGamma(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Rate at which nodes disengage from the narrative state</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Population (N): {N.toLocaleString()}
            </label>
            <input 
              type="range" min="1000" max="100000" step="1000" value={N}
              onChange={e => setN(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Modelled population size</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Initial Influenced: {initialI}
            </label>
            <input 
              type="range" min="1" max="100" step="1" value={initialI}
              onChange={e => setInitialI(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Initial nodes in the influenced state</p>
          </div>
        </div>

        {/* Intervention */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-white">Recovery Intervention</p>
              <p className="text-xs text-gray-500">Simulates satire, pluralism, or art as symbolic recovery agents</p>
            </div>
            <button
              onClick={() => setEnableIntervention(!enableIntervention)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                enableIntervention 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                  : 'bg-gray-800 text-gray-500 border-gray-700'
              }`}
            >
              {enableIntervention ? 'Active' : 'Disabled'}
            </button>
          </div>
          {enableIntervention && (
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Intervention Time: t = {interventionTime}
              </label>
              <input 
                type="range" min="10" max="150" step="5" value={interventionTime}
                onChange={e => setInterventionTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                At intervention: β → {((beta * 0.3)).toFixed(3)} (70% reduction), γ → {(gamma * 2).toFixed(3)} (2× increase)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Equations */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Baseline SIR Equations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-blue-400 mb-2">dS/dt</p>
            <code className="text-xs text-emerald-300 font-mono">
              -β · (S·I/N)
            </code>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-red-400 mb-2">dI/dt</p>
            <code className="text-xs text-emerald-300 font-mono">
              β·(S·I/N) - γ·I
            </code>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50">
            <p className="text-xs text-emerald-400 mb-2">dR/dt</p>
            <code className="text-xs text-emerald-300 font-mono">
              γ · I
            </code>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          N = S + I + R. These equations provide a baseline simulation model. They are not validated laws of narrative propagation.
          Simulated outputs must be clearly distinguished from observations collected from real ecosystems.
        </p>
      </div>
    </div>
  );
}
