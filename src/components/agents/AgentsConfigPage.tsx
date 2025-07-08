'use client';
import { useState } from 'react';
import { Save } from 'lucide-react';

interface AgentField {
  key: string;
  label: string;
  value: string;
}

interface AgentConfig {
  name: string;
  description: string;
  fields: AgentField[];
}

const initialAgents: AgentConfig[] = [
  {
    name: 'Phillips Hue',
    description: 'Configure your Phillips Hue bridge connection.',
    fields: [
      { key: 'bridge_ip', label: 'Bridge IP', value: '' },
      { key: 'api_key', label: 'API Key', value: '' },
    ],
  },
  {
    name: 'Calendar',
    description: 'Calendar agent settings and credentials.',
    fields: [
      { key: 'calendar_url', label: 'Calendar URL', value: '' },
    ],
  },
  {
    name: 'Weather',
    description: 'Weather service configuration.',
    fields: [
      { key: 'api_key', label: 'API Key', value: '' },
      { key: 'location', label: 'Location', value: '' },
    ],
  },
];

export default function AgentsConfigPage() {
  const [agents, setAgents] = useState<AgentConfig[]>(initialAgents);

  const handleFieldChange = (
    agentIndex: number,
    fieldIndex: number,
    value: string,
  ) => {
    setAgents(prev => {
      const copy = [...prev];
      copy[agentIndex].fields[fieldIndex].value = value;
      return copy;
    });
  };

  const handleSave = (agent: AgentConfig) => {
    // Placeholder for future API call
    console.log('Saving agent config', agent);
    alert(`${agent.name} configuration saved (mock)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-mono font-bold text-center text-cyan-300 mb-8">
          Agent Configuration
        </h1>
        {agents.map((agent, i) => (
          <div
            key={agent.name}
            className="relative bg-gradient-to-br from-slate-900/80 via-blue-950/40 to-slate-900/80 border border-cyan-500/40 rounded-xl p-6"
          >
            <h2 className="text-2xl font-mono font-bold text-cyan-300 mb-2">
              {agent.name}
            </h2>
            <p className="text-sm font-mono text-gray-400 mb-4">
              {agent.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {agent.fields.map((field, j) => (
                <div key={field.key}>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => handleFieldChange(i, j, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-cyan-400/40 rounded text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => handleSave(agent)}
              className="mt-2 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/50 rounded hover:from-cyan-500/30 hover:to-blue-500/30 font-mono text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
