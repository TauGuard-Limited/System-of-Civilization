import { useState } from 'react';
import { FileText, Download, Calendar, Filter, Trash2, AlertCircle } from 'lucide-react';
import { useAppState } from '../context/AppContext';

export default function Reports() {
  const { kappaHistory, assessments, clearKappaHistory, activeCountry } = useAppState();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Filter by country and date range
  const filteredKappa = kappaHistory.filter(snap => {
    if (activeCountry !== 'Global' && snap.country !== activeCountry) return false;
    if (dateRange === 'all') return true;
    const now = Date.now();
    const ms = dateRange === '24h' ? 86400000 : dateRange === '7d' ? 604800000 : 2592000000;
    return snap.timestamp > now - ms;
  });

  const filteredAssessments = assessments.filter(a => {
    if (activeCountry !== 'Global' && a.country !== activeCountry) return false;
    if (dateRange === 'all') return true;
    const now = Date.now();
    const ms = dateRange === '24h' ? 86400000 : dateRange === '7d' ? 604800000 : 2592000000;
    return a.timestamp > now - ms;
  });

  // Export handlers
  const exportJSON = () => {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        system: 'TauGuard System of Civilization',
        version: '1.0',
        country: activeCountry,
        dateRange,
        recordCount: {
          kappaSnapshots: filteredKappa.length,
          assessments: filteredAssessments.length,
        },
      },
      kappaTimeSeries: filteredKappa,
      homeostasisAssessments: filteredAssessments,
      summary: computeSummary(),
    };

    downloadFile(
      `tauguard-report-${activeCountry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`,
      JSON.stringify(report, null, 2),
      'application/json'
    );
  };

  const exportCSV = () => {
    const headers = ['timestamp', 'datetime', 'country', 'kappa', 'rawCoherence', 'entropy', 'itemCount', 'sources'];
    const rows = filteredKappa.map(snap => [
      snap.timestamp,
      new Date(snap.timestamp).toISOString(),
      snap.country,
      snap.kappa.toFixed(4),
      snap.rawCoherence.toFixed(4),
      snap.entropy.toFixed(4),
      snap.itemCount,
      `"${snap.sources.join(';')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(
      `tauguard-kappa-${activeCountry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`,
      csv,
      'text/csv'
    );
  };

  const computeSummary = () => {
    if (filteredKappa.length === 0) return null;
    const kappas = filteredKappa.map(s => s.kappa);
    const entropies = filteredKappa.map(s => s.entropy);
    return {
      kappaMean: kappas.reduce((a, b) => a + b, 0) / kappas.length,
      kappaMin: Math.min(...kappas),
      kappaMax: Math.max(...kappas),
      entropyMean: entropies.reduce((a, b) => a + b, 0) / entropies.length,
      totalSnapshots: filteredKappa.length,
      timeSpanHours: (filteredKappa[filteredKappa.length - 1].timestamp - filteredKappa[0].timestamp) / 3600000,
    };
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'json') exportJSON();
    else exportCSV();
  };

  const summary = computeSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText size={20} className="text-emerald-400" />
          Reports & Export
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          Export analysis reports with full provenance. Reports include κ(t) time series, homeostasis assessments,
          configuration parameters, and source traceability. All exports are country-scoped.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Filter size={16} className="text-cyan-400" />
          Report Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Country</label>
            <div className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white">
              {activeCountry}
            </div>
            <p className="text-xs text-gray-500 mt-1">Change in top-right selector</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as typeof dateRange)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">Export Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setExportFormat('json')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-colors ${
                  exportFormat === 'json'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-colors ${
                  exportFormat === 'csv'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Report Summary</h3>
        {summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-gray-800/50 p-3">
              <p className="text-xs text-gray-500 mb-1">κ(t) Mean</p>
              <p className="text-xl font-bold text-white">{summary.kappaMean.toFixed(3)}</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-3">
              <p className="text-xs text-gray-500 mb-1">κ(t) Range</p>
              <p className="text-xl font-bold text-white">
                {summary.kappaMin.toFixed(2)}–{summary.kappaMax.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-3">
              <p className="text-xs text-gray-500 mb-1">Entropy Mean</p>
              <p className="text-xl font-bold text-white">{summary.entropyMean.toFixed(3)}</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-3">
              <p className="text-xs text-gray-500 mb-1">Time Span</p>
              <p className="text-xl font-bold text-white">{summary.timeSpanHours.toFixed(1)}h</p>
              <p className="text-xs text-gray-500">{summary.totalSnapshots} snapshots</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No data available for export. Run Live Ingestion first.</p>
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 p-5">
        <h3 className="text-sm font-medium text-white mb-3">Export Report</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            disabled={filteredKappa.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export {exportFormat.toUpperCase()} Report
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all stored κ(t) history and assessments? This cannot be undone.')) {
                clearKappaHistory();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={16} />
            Clear History
          </button>
          <span className="text-xs text-gray-500">
            {filteredKappa.length} snapshots • {filteredAssessments.length} assessments
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Reports include full provenance: timestamps, source references, configuration versions, and uncertainty metadata.
          All exports are scoped to the currently selected country.
        </p>
      </div>

      {/* Recent Assessments */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-purple-400" />
          Recent Homeostasis Assessments
        </h3>
        {filteredAssessments.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No assessments recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...filteredAssessments].reverse().slice(0, 20).map(a => (
              <div key={a.id} className="rounded-lg bg-gray-800/30 border border-gray-700/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    a.condition === 'homeostasis' ? 'text-emerald-400' :
                    a.condition === 'hypo' ? 'text-blue-400' :
                    a.condition === 'hyper' ? 'text-red-400' :
                    a.condition === 'turbulence' ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {a.condition.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">κ: </span>
                    <span className="text-white">{a.coherence.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">H*: </span>
                    <span className="text-white">{a.diversity.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Conf: </span>
                    <span className="text-white">{(a.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Country: </span>
                    <span className="text-white">{a.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Schema */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-white mb-3">Report Schema (JSON)</h3>
        <pre className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-4 overflow-x-auto border border-gray-700/50">
{`{
  "metadata": {
    "generatedAt": "ISO-8601 timestamp",
    "system": "TauGuard System of Civilization",
    "version": "1.0",
    "country": "<selected country>",
    "dateRange": "<all|24h|7d|30d>",
    "recordCount": { "kappaSnapshots": N, "assessments": N }
  },
  "kappaTimeSeries": [
    {
      "id": "uuid",
      "timestamp": 1234567890,
      "country": "United Kingdom",
      "kappa": 0.123,
      "rawCoherence": 0.145,
      "entropy": 0.678,
      "itemCount": 42,
      "sources": ["bbc-world", "guardian"],
      "configuration": { "decayLambda": 0.15, "windowSize": 30 }
    }
  ],
  "homeostasisAssessments": [...],
  "summary": {
    "kappaMean": 0.123,
    "kappaMin": 0.05,
    "kappaMax": 0.25,
    "entropyMean": 0.678,
    "totalSnapshots": 100,
    "timeSpanHours": 24.5
  }
}`}
        </pre>
      </div>
    </div>
  );
}
