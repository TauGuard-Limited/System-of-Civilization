import { Database, Key, Link } from 'lucide-react';

interface Entity {
  name: string;
  fields: { name: string; type: string; key?: boolean; ref?: string }[];
}

const entities: Entity[] = [
  {
    name: 'Ecosystem',
    fields: [
      { name: 'ecosystem_id', type: 'UUID', key: true },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'domain', type: 'VARCHAR(100)' },
      { name: 'language_profile', type: 'VARCHAR(50)' },
      { name: 'collection_policy_version', type: 'VARCHAR(50)' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'SourceRecord',
    fields: [
      { name: 'record_id', type: 'UUID', key: true },
      { name: 'ecosystem_id', type: 'UUID', ref: 'Ecosystem' },
      { name: 'source_reference', type: 'TEXT' },
      { name: 'observed_at', type: 'TIMESTAMP' },
      { name: 'collected_at', type: 'TIMESTAMP' },
      { name: 'content_reference', type: 'TEXT' },
      { name: 'provenance_metadata', type: 'JSONB' },
      { name: 'retention_class', type: 'VARCHAR(50)' },
    ],
  },
  {
    name: 'SymbolicRepresentation',
    fields: [
      { name: 'representation_id', type: 'UUID', key: true },
      { name: 'record_id', type: 'UUID', ref: 'SourceRecord' },
      { name: 'model_version', type: 'VARCHAR(50)' },
      { name: 'representation_type', type: 'VARCHAR(50)' },
      { name: 'representation_reference', type: 'TEXT' },
      { name: 'uncertainty_metadata', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'NarrativeCluster',
    fields: [
      { name: 'cluster_id', type: 'UUID', key: true },
      { name: 'ecosystem_id', type: 'UUID', ref: 'Ecosystem' },
      { name: 'cluster_version', type: 'VARCHAR(50)' },
      { name: 'label_reference', type: 'TEXT' },
      { name: 'definition_reference', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'CoherenceMeasurement',
    fields: [
      { name: 'measurement_id', type: 'UUID', key: true },
      { name: 'ecosystem_id', type: 'UUID', ref: 'Ecosystem' },
      { name: 'window_start', type: 'TIMESTAMP' },
      { name: 'window_end', type: 'TIMESTAMP' },
      { name: 'coherence_value', type: 'FLOAT' },
      { name: 'diversity_value', type: 'FLOAT' },
      { name: 'dynamics_value', type: 'FLOAT' },
      { name: 'sample_count', type: 'INTEGER' },
      { name: 'uncertainty_metadata', type: 'JSONB' },
      { name: 'configuration_version', type: 'VARCHAR(50)' },
    ],
  },
  {
    name: 'HomeostasisAssessment',
    fields: [
      { name: 'assessment_id', type: 'UUID', key: true },
      { name: 'ecosystem_id', type: 'UUID', ref: 'Ecosystem' },
      { name: 'measurement_id', type: 'UUID', ref: 'CoherenceMeasurement' },
      { name: 'assessment_type', type: 'VARCHAR(50)' },
      { name: 'threshold_version', type: 'VARCHAR(50)' },
      { name: 'evidence_reference', type: 'TEXT' },
      { name: 'limitations', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'SimulationRun',
    fields: [
      { name: 'simulation_id', type: 'UUID', key: true },
      { name: 'scenario_version', type: 'VARCHAR(50)' },
      { name: 'parameter_set', type: 'JSONB' },
      { name: 'initial_conditions', type: 'JSONB' },
      { name: 'results_reference', type: 'TEXT' },
      { name: 'random_seed', type: 'INTEGER' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'AuditEvent',
    fields: [
      { name: 'event_id', type: 'UUID', key: true },
      { name: 'event_type', type: 'VARCHAR(50)' },
      { name: 'subject_reference', type: 'TEXT' },
      { name: 'configuration_version', type: 'VARCHAR(50)' },
      { name: 'actor_reference', type: 'TEXT' },
      { name: 'event_timestamp', type: 'TIMESTAMP' },
      { name: 'integrity_metadata', type: 'JSONB' },
    ],
  },
];

const relationships = [
  { from: 'Ecosystem', to: 'SourceRecord', label: '1:N' },
  { from: 'SourceRecord', to: 'SymbolicRepresentation', label: '1:N' },
  { from: 'Ecosystem', to: 'NarrativeCluster', label: '1:N' },
  { from: 'Ecosystem', to: 'CoherenceMeasurement', label: '1:N' },
  { from: 'CoherenceMeasurement', to: 'HomeostasisAssessment', label: '1:N' },
  { from: 'Ecosystem', to: 'HomeostasisAssessment', label: '1:N' },
];

export default function DataModel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database size={20} className="text-emerald-400" />
          Data Model
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-3xl">
          The initial system uses a relational database for metadata and analytical results, with suitable storage 
          for source records, semantic representations, and network structures. Source content stored only where permitted.
        </p>
      </div>

      {/* Relationship Diagram */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Link size={16} className="text-cyan-400" />
          Entity Relationships
        </h3>
        <div className="flex flex-wrap gap-3">
          {relationships.map((rel, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
              <span className="text-xs font-medium text-emerald-400">{rel.from}</span>
              <span className="text-xs text-gray-500">→</span>
              <span className="text-xs text-gray-400">{rel.label}</span>
              <span className="text-xs text-gray-500">→</span>
              <span className="text-xs font-medium text-cyan-400">{rel.to}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entities.map(entity => (
          <div key={entity.name} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800 flex items-center gap-2">
              <Database size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">{entity.name}</h3>
            </div>
            <div className="p-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Field</th>
                    <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Type</th>
                    <th className="text-center py-1.5 px-2 text-gray-500 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {entity.fields.map((field, i) => (
                    <tr key={i} className="border-b border-gray-800/30 last:border-0">
                      <td className="py-1.5 px-2 text-gray-300 font-mono">
                        {field.key && <Key size={10} className="inline mr-1 text-amber-400" />}
                        {field.name}
                      </td>
                      <td className="py-1.5 px-2 text-gray-500">{field.type}</td>
                      <td className="py-1.5 px-2 text-center">
                        {field.ref && (
                          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                            FK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Design Notes */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Schema Design Notes</h3>
        <div className="space-y-3">
          {[
            'The schema is a logical starting point. The final physical schema should be validated against expected ingestion volumes, query patterns, retention requirements, and the selected database technology.',
            'Source content should be stored only where permitted. Where retention of raw content is prohibited or unnecessary, the system preserves permitted references, provenance, and derived measurements instead.',
            'JSONB fields (provenance_metadata, uncertainty_metadata, parameter_set, etc.) allow flexible extension without schema migration for analytical metadata.',
            'All entities include version fields to support independent versioning of metric definitions, models, thresholds, and schemas.',
            'The AuditEvent entity supports append-only recording with integrity metadata for tamper detection and reproducibility.',
          ].map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
