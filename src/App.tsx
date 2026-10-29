import { useState, createContext, useContext } from 'react';
import Dashboard from './components/Dashboard';
import CoherenceEngine from './components/CoherenceEngine';
import SIRSimulator from './components/SIRSimulator';
import HomeostasisAnalyzer from './components/HomeostasisAnalyzer';
import Architecture from './components/Architecture';
import DataModel from './components/DataModel';
import NarrativeDynamics from './components/NarrativeDynamics';
import HowItWorks from './components/HowItWorks';
import LiveIngestion from './components/LiveIngestion';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { 
  LayoutDashboard, 
  Activity, 
  GitBranch, 
  Shield, 
  Network, 
  Database, 
  Waves,
  Zap,
  Rss,
  Menu,
  X,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react';

export type View = 'dashboard' | 'how' | 'coherence' | 'narrative' | 'homeostasis' | 'sir' | 'live' | 'reports' | 'settings' | 'architecture' | 'data';

// ---------- Global App Context (for cross-view state sharing) ----------
interface AppState {
  // Country context — shared across all engines
  activeCountry: string;
  setActiveCountry: (c: string) => void;
  
  // API configuration
  apiConfig: {
    customFeeds: CustomFeed[];
    embeddingEndpoint: string;
    storageEndpoint: string;
    authKey: string;
  };
  setApiConfig: (cfg: AppState['apiConfig']) => void;
  
  // κ(t) history — collected from LiveIngestion, consumed by Reports
  kappaHistory: KappaSnapshot[];
  addKappaSnapshot: (snap: KappaSnapshot) => void;
  clearKappaHistory: () => void;
  
  // Homeostasis assessments
  assessments: HomeostasisAssessment[];
  addAssessment: (a: HomeostasisAssessment) => void;
}

export interface CustomFeed {
  id: string;
  name: string;
  url: string;
  country: string;
  category: 'news' | 'knowledge' | 'governance' | 'discourse';
  enabled: boolean;
}

export interface KappaSnapshot {
  id: string;
  timestamp: number;
  country: string;
  kappa: number;
  rawCoherence: number;
  entropy: number;
  itemCount: number;
  sources: string[];
  configuration: {
    decayLambda: number;
    windowSize: number;
  };
}

export interface HomeostasisAssessment {
  id: string;
  timestamp: number;
  country: string;
  condition: string;
  coherence: number;
  diversity: number;
  instability: number;
  confidence: number;
  persistence: number;
  evidence: string;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

// Load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

const navItems: { id: View; label: string; icon: React.ReactNode; group?: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} />, group: 'main' },
  { id: 'how', label: 'How It Works', icon: <Zap size={18} />, group: 'main' },
  { id: 'live', label: 'Live Ingestion', icon: <Rss size={18} />, group: 'main' },
  { id: 'coherence', label: 'Coherence Engine', icon: <Activity size={18} />, group: 'engines' },
  { id: 'narrative', label: 'Narrative Dynamics', icon: <Waves size={18} />, group: 'engines' },
  { id: 'homeostasis', label: 'Homeostasis', icon: <Shield size={18} />, group: 'engines' },
  { id: 'sir', label: 'SIR Simulator', icon: <GitBranch size={18} />, group: 'engines' },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} />, group: 'ops' },
  { id: 'settings', label: 'Settings & API', icon: <SettingsIcon size={18} />, group: 'ops' },
  { id: 'architecture', label: 'Architecture', icon: <Network size={18} />, group: 'docs' },
  { id: 'data', label: 'Data Model', icon: <Database size={18} />, group: 'docs' },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visited, setVisited] = useState<Set<View>>(new Set(['dashboard']));

  // Global state
  const [activeCountry, setActiveCountryState] = useState<string>(
    () => loadFromStorage('tauguard.country', 'Global')
  );
  const [apiConfig, setApiConfigState] = useState<{
    customFeeds: CustomFeed[];
    embeddingEndpoint: string;
    storageEndpoint: string;
    authKey: string;
  }>(() => loadFromStorage('tauguard.apiConfig', {
    customFeeds: [],
    embeddingEndpoint: '',
    storageEndpoint: '',
    authKey: '',
  }));
  const [kappaHistory, setKappaHistory] = useState<KappaSnapshot[]>(
    () => loadFromStorage('tauguard.kappaHistory', [])
  );
  const [assessments, setAssessments] = useState<HomeostasisAssessment[]>(
    () => loadFromStorage('tauguard.assessments', [])
  );

  // Wrapped setters that persist
  const setActiveCountry = (c: string) => {
    setActiveCountryState(c);
    saveToStorage('tauguard.country', c);
  };
  const setApiConfig = (cfg: typeof apiConfig) => {
    setApiConfigState(cfg);
    saveToStorage('tauguard.apiConfig', cfg);
  };
  const addKappaSnapshot = (snap: KappaSnapshot) => {
    setKappaHistory(prev => {
      const next = [...prev, snap].slice(-500);
      saveToStorage('tauguard.kappaHistory', next);
      return next;
    });
  };
  const clearKappaHistory = () => {
    setKappaHistory([]);
    saveToStorage('tauguard.kappaHistory', []);
  };
  const addAssessment = (a: HomeostasisAssessment) => {
    setAssessments(prev => {
      const next = [...prev, a].slice(-200);
      saveToStorage('tauguard.assessments', next);
      return next;
    });
  };

  const appState: AppState = {
    activeCountry,
    setActiveCountry,
    apiConfig,
    setApiConfig,
    kappaHistory,
    addKappaSnapshot,
    clearKappaHistory,
    assessments,
    addAssessment,
  };

  // Mark tab as visited (keeps component mounted after first visit)
  const handleNavigate = (v: View) => {
    setView(v);
    setVisited(prev => new Set(prev).add(v));
    setSidebarOpen(false);
  };

  const groupedNav = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    const g = item.group || 'main';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <AppContext.Provider value={appState}>
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
          
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 mb-1 font-medium">
                  {group === 'main' ? '' : group === 'engines' ? 'Engines' : group === 'ops' ? 'Operations' : 'Documentation'}
                </p>
                <div className="space-y-1">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
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
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Specification v1.0</p>
              <p className="text-emerald-500/70">Diagnostic • Non-coercive</p>
              <p className="text-cyan-400/70">Country: {activeCountry}</p>
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
              <select
                value={activeCountry}
                onChange={e => setActiveCountry(e.target.value)}
                className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-emerald-500"
              >
                <option>Global</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>France</option>
                <option>Poland</option>
                <option>Czech Republic</option>
                <option>Ukraine</option>
                <option>Japan</option>
                <option>China</option>
                <option>India</option>
                <option>Brazil</option>
                <option>Australia</option>
                <option>Canada</option>
              </select>
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </div>
          </header>

          {/* All views rendered; hidden ones use display:none to preserve state */}
          <div className="p-4 lg:p-6">
            <div style={{ display: view === 'dashboard' ? 'block' : 'none' }}>
              <Dashboard onNavigate={handleNavigate} />
            </div>
            <div style={{ display: view === 'how' ? 'block' : 'none' }}>
              <HowItWorks />
            </div>
            <div style={{ display: view === 'live' ? 'block' : 'none' }}>
              <LiveIngestion />
            </div>
            <div style={{ display: view === 'coherence' ? 'block' : 'none' }}>
              <CoherenceEngine />
            </div>
            <div style={{ display: view === 'narrative' ? 'block' : 'none' }}>
              <NarrativeDynamics />
            </div>
            <div style={{ display: view === 'homeostasis' ? 'block' : 'none' }}>
              <HomeostasisAnalyzer />
            </div>
            <div style={{ display: view === 'sir' ? 'block' : 'none' }}>
              <SIRSimulator />
            </div>
            <div style={{ display: view === 'reports' ? 'block' : 'none' }}>
              <Reports />
            </div>
            <div style={{ display: view === 'settings' ? 'block' : 'none' }}>
              <Settings />
            </div>
            <div style={{ display: view === 'architecture' ? 'block' : 'none' }}>
              <Architecture />
            </div>
            <div style={{ display: view === 'data' ? 'block' : 'none' }}>
              <DataModel />
            </div>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
}
