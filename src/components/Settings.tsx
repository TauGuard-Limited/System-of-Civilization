import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Key, Link2, Plus, Trash2, Save, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAppState, type CustomFeed } from '../App';

export default function Settings() {
  const { apiConfig, setApiConfig, activeCountry, setActiveCountry } = useAppState();
  const [testStatus, setTestStatus] = useState<{ [key: string]: 'testing' | 'success' | 'error' }>({});
  const [newFeed, setNewFeed] = useState<Partial<CustomFeed>>({
    name: '',
    url: '',
    country: activeCountry === 'Global' ? 'United States' : activeCountry,
    category: 'news',
    enabled: true,
  });

  const countries = [
    'Global', 'United States', 'United Kingdom', 'Germany', 'France', 'Poland',
    'Czech Republic', 'Ukraine', 'Japan', 'China', 'India', 'Brazil', 'Australia', 'Canada'
  ];

  const addCustomFeed = () => {
    if (!newFeed.name || !newFeed.url) return;
    const feed: CustomFeed = {
      id: `custom-${Date.now()}`,
      name: newFeed.name!,
      url: newFeed.url!,
      country: newFeed.country || 'Global',
      category: newFeed.category as CustomFeed['category'],
      enabled: newFeed.enabled ?? true,
    };
    setApiConfig({
      ...apiConfig,
      customFeeds: [...apiConfig.customFeeds, feed],
    });
    setNewFeed({ name: '', url: '', country: activeCountry === 'Global' ? 'United States' : activeCountry, category: 'news', enabled: true });
  };

  const removeCustomFeed = (id: string) => {
    setApiConfig({
      ...apiConfig,
      customFeeds: apiConfig.customFeeds.filter(f => f.id !== id),
    });
  };

  const toggleCustomFeed = (id: string) => {
    setApiConfig({
      ...apiConfig,
      customFeeds: apiConfig.customFeeds.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f),
    });
  };

  const testEndpoint = async (url: string, key: string) => {
    if (!url) return;
    setTestStatus(prev => ({ ...prev, [key]: 'testing' }));
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: apiConfig.authKey ? { 'Authorization': `Bearer ${apiConfig.authKey}` } : {},
      });
      setTestStatus(prev => ({ ...prev, [key]: response.ok ? 'success' : 'error' }));
    } catch {
      setTestStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  const saveAll = () => {
    setApiConfig(apiConfig); // Trigger localStorage save
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <SettingsIcon size={20} className="text-emerald-400" />
          Settings & API Configuration
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Configure API endpoints, custom RSS feeds, and country-specific settings. All changes are persisted to local storage.
        </p>
      </div>

      {/* Country Configuration */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Globe size={16} className="text-cyan-400" />
          Country Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Active Country</label>
            <select
              value={activeCountry}
              onChange={e => setActiveCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Filters all views (Live Ingestion, Reports, etc.) to this country's data.
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">Country-Specific Thresholds</label>
            <div className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400">
              <p>κ_min: 0.05 (Jaccard proxy) / 0.35 (embeddings)</p>
              <p>κ_max: 0.35 (Jaccard proxy) / 0.85 (embeddings)</p>
              <p className="text-gray-500 mt-1">Country-specific calibration requires empirical validation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-purple-400" />
          API Endpoints
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Embedding Service Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiConfig.embeddingEndpoint}
                onChange={e => setApiConfig({ ...apiConfig, embeddingEndpoint: e.target.value })}
                placeholder="https://api.example.com/embeddings"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => testEndpoint(apiConfig.embeddingEndpoint, 'embedding')}
                className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs hover:bg-cyan-500/20 transition-colors"
              >
                Test
              </button>
            </div>
            {testStatus.embedding && (
              <p className={`text-xs mt-1 ${
                testStatus.embedding === 'success' ? 'text-emerald-400' :
                testStatus.embedding === 'error' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {testStatus.embedding === 'testing' ? 'Testing...' :
                 testStatus.embedding === 'success' ? '✓ Endpoint reachable' : '✗ Connection failed'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Production: sentence-transformers, OpenAI, or custom embedding API. Currently using Jaccard tokenization.
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Storage / Persistence Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiConfig.storageEndpoint}
                onChange={e => setApiConfig({ ...apiConfig, storageEndpoint: e.target.value })}
                placeholder="https://api.example.com/store"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => testEndpoint(apiConfig.storageEndpoint, 'storage')}
                className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs hover:bg-cyan-500/20 transition-colors"
              >
                Test
              </button>
            </div>
            {testStatus.storage && (
              <p className={`text-xs mt-1 ${
                testStatus.storage === 'success' ? 'text-emerald-400' :
                testStatus.storage === 'error' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {testStatus.storage === 'testing' ? 'Testing...' :
                 testStatus.storage === 'success' ? '✓ Endpoint reachable' : '✗ Connection failed'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              PostgreSQL, TimescaleDB, or custom persistence API. Currently using localStorage.
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Authentication Key (Optional)</label>
            <input
              type="password"
              value={apiConfig.authKey}
              onChange={e => setApiConfig({ ...apiConfig, authKey: e.target.value })}
              placeholder="Bearer token or API key"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Sent as Authorization: Bearer header to configured endpoints.</p>
          </div>
        </div>
      </div>

      {/* Custom RSS Feeds */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-emerald-400" />
          Custom RSS Feeds
        </h3>

        {/* Add new feed */}
        <div className="rounded-lg bg-gray-800/30 border border-gray-700/30 p-4 mb-4">
          <p className="text-xs text-gray-400 mb-3">Add Custom Feed</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newFeed.name}
              onChange={e => setNewFeed({ ...newFeed, name: e.target.value })}
              placeholder="Feed name"
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={newFeed.url}
              onChange={e => setNewFeed({ ...newFeed, url: e.target.value })}
              placeholder="https://example.com/rss"
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newFeed.country}
              onChange={e => setNewFeed({ ...newFeed, country: e.target.value })}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {countries.filter(c => c !== 'Global').map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={newFeed.category}
              onChange={e => setNewFeed({ ...newFeed, category: e.target.value as CustomFeed['category'] })}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="news">News</option>
              <option value="knowledge">Knowledge</option>
              <option value="governance">Governance</option>
              <option value="discourse">Discourse</option>
            </select>
          </div>
          <button
            onClick={addCustomFeed}
            disabled={!newFeed.name || !newFeed.url}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add Feed
          </button>
        </div>

        {/* Existing custom feeds */}
        {apiConfig.customFeeds.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No custom feeds configured. Add feeds above.</p>
        ) : (
          <div className="space-y-2">
            {apiConfig.customFeeds.map(feed => (
              <div key={feed.id} className="flex items-center justify-between rounded-lg bg-gray-800/30 border border-gray-700/30 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => toggleCustomFeed(feed.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        feed.enabled ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-gray-600'
                      }`}
                    >
                      {feed.enabled && <CheckCircle size={10} className="text-white" />}
                    </button>
                    <span className="text-xs font-medium text-white">{feed.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">{feed.country}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">{feed.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{feed.url}</p>
                </div>
                <button
                  onClick={() => removeCustomFeed(feed.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveAll}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <Save size={16} />
          Save All Settings
        </button>
      </div>

      {/* Integration Notes */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-400" />
          API Integration Notes
        </h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• <span className="text-white">Embedding Endpoint:</span> Should accept POST with JSON body <code className="text-emerald-300">{"{ \"texts\": [...] }"}</code> and return embeddings array.</p>
          <p>• <span className="text-white">Storage Endpoint:</span> Should accept POST with κ(t) snapshots and assessments for persistent storage.</p>
          <p>• <span className="text-white">Authentication:</span> Bearer token sent in Authorization header. Leave blank for public endpoints.</p>
          <p>• <span className="text-white">Country Separation:</span> Each country maintains independent κ(t) series, thresholds, and assessments.</p>
          <p>• <span className="text-white">Custom Feeds:</span> Added feeds appear in Live Ingestion under the configured country. Must be valid RSS/Atom XML.</p>
        </div>
      </div>
    </div>
  );
}
