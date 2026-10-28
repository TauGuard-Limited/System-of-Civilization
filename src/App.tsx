import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CoherenceEngine from './components/CoherenceEngine';
import SIRSimulator from './components/SIRSimulator';
import HomeostasisAnalyzer from './components/HomeostasisAnalyzer';
import Architecture from './components/Architecture';
import DataModel from './components/DataModel';
import NarrativeDynamics from './components/NarrativeDynamics';
import HowItWorks from './components/HowItWorks';
import { 
  LayoutDashboard, 
  Activity, 
  GitBranch, 
  Shield, 
  Network, 
  Database, 
  Waves,
  Zap,
  Menu,
  X
} from 'lucide-react';

type View = 'dashboard' | 'how' | 'coherence' | 'sir' | 'homeostasis' | 'architecture' | 'data' | 'narrative';

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'how', label: 'How It Works', icon: <Zap size={18} /> },
  { id: 'coherence', label: 'Coherence Engine', icon: <Activity size={18} /> },
  { id: 'narrative', label: 'Narrative Dynamics', icon: <Waves size={18} /> },
  { id: 'homeostasis', label: 'Homeostasis', icon: <Shield size={18} /> },
  { id: 'sir', label: 'SIR Simulator', icon: <GitBranch size={18} /> },
  { id: 'architecture', label: 'Architecture', icon: <Network size={18} /> },
  { id: 'data', label: 'Data Model', icon: <Database size={18} /> },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'how': return <HowItWorks />;
      case 'coherence': return <CoherenceEngine />;
      case 'sir': return <SIRSimulator />;
      case 'homeostasis': return <HomeostasisAnalyzer />;
      case 'architecture': return <Architecture />;
      case 'data': return <DataModel />;
      case 'narrative': return <NarrativeDynamics />;
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800 
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">τ</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-white">TauGuard</h1>
              <p className="text-xs text-gray-500">System of Civilization</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${view === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Specification v1.0</p>
            <p>Status: Proposed Architecture</p>
            <p className="text-emerald-500/70">Diagnostic • Non-coercive</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-medium text-white">
              {navItems.find(n => n.id === view)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Proposed
            </span>
            <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0
            </span>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
