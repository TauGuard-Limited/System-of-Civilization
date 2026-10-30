import { createContext, useContext } from 'react';

// ---------- Types ----------
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
  articleMetadata?: {
    titles: string[];
    topics: string[];
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

// ---------- App State Interface ----------
export interface AppState {
  activeCountry: string;
  setActiveCountry: (c: string) => void;
  
  apiConfig: {
    customFeeds: CustomFeed[];
    embeddingEndpoint: string;
    storageEndpoint: string;
    authKey: string;
  };
  setApiConfig: (cfg: AppState['apiConfig']) => void;
  
  kappaHistory: KappaSnapshot[];
  addKappaSnapshot: (snap: KappaSnapshot) => void;
  clearKappaHistory: () => void;
  
  assessments: HomeostasisAssessment[];
  addAssessment: (a: HomeostasisAssessment) => void;
}

// ---------- Context ----------
export const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppContext.Provider');
  }
  return ctx;
}
