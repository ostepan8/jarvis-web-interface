'use client'

import ProtocolCard from "@/components/protocol/card";
import ExecutionModal from "@/components/protocol/execution_modal";
import { getProtocols, Protocol, ProtocolRunResult, runProtocol } from "@/lib/api";
import {
  Loader,
  Terminal,
  Zap,
  AlertCircle,
  Wifi,
  WifiOff,
  Search
} from "lucide-react";
import { useEffect, useState } from "react";

// Main Protocols Page Component
export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningProtocols, setRunningProtocols] = useState<Set<string>>(new Set());
  const [executionResult, setExecutionResult] = useState<ProtocolRunResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchMode, setSearchMode] = useState<'name' | 'trigger' | 'all'>('all');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Test connection to JARVIS API
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('http://0.0.0.0:8000/protocols');
      setConnectionStatus(response.ok ? 'connected' : 'disconnected');
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus('disconnected');
    }
  };

  // Load protocols on mount
  useEffect(() => {
    testConnection();
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    setLoading(true);
    try {
      const fetchedProtocols = await getProtocols();
      setProtocols(fetchedProtocols);
    } catch (error) {
      console.error('Failed to load protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunProtocol = async (
    protocol: Protocol,
    args?: Record<string, unknown>
  ) => {
    setRunningProtocols(prev => new Set(prev).add(protocol.name));

    try {
      const result = await runProtocol(protocol.name, args);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        protocol: protocol.name,
        results: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setRunningProtocols(prev => {
        const newSet = new Set(prev);
        newSet.delete(protocol.name);
        return newSet;
      });
    }
  };

  // Enhanced filtering with trigger phrase search
  const filteredProtocols = protocols.filter(protocol => {
    if (!searchTerm && selectedCategory === 'all') return true;

    let matchesSearch = false;
    const searchLower = searchTerm.toLowerCase();

    switch (searchMode) {
      case 'name':
        matchesSearch = protocol.name.toLowerCase().includes(searchLower) ||
          protocol.description?.toLowerCase().includes(searchLower);
        break;
      case 'trigger':
        matchesSearch = protocol.trigger_phrases?.some(phrase =>
          phrase.toLowerCase().includes(searchLower)
        ) || false;
        break;
      case 'all':
      default:
        matchesSearch = protocol.name.toLowerCase().includes(searchLower) ||
          protocol.description?.toLowerCase().includes(searchLower) ||
          protocol.trigger_phrases?.some(phrase =>
            phrase.toLowerCase().includes(searchLower)
          ) || false;
        break;
    }

    // Category filtering based on agent type
    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory && protocol.steps?.length > 0) {
      const agentType = protocol.steps[0].agent.toLowerCase();
      matchesCategory = agentType.includes(selectedCategory.toLowerCase());
    }

    return (!searchTerm || matchesSearch) && matchesCategory;
  });

  // Get unique categories from agent types
  const categories = ['all', ...Array.from(new Set(
    protocols.flatMap(p => p.steps?.map(s => s.agent) || [])
      .map(agent => agent.replace('Agent', ''))
      .filter(Boolean)
  ))];

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-400" />;
      case 'disconnected': return <WifiOff className="w-5 h-5 text-red-400" />;
      case 'checking': return <Loader className="w-5 h-5 text-yellow-400 animate-spin" />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />

        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <Loader className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-cyan-400/20 rounded-full animate-ping mx-auto" />
            </div>
            <h2 className="text-2xl font-mono font-bold text-cyan-300 mb-2">
              INITIALIZING PROTOCOLS
            </h2>
            <p className="text-gray-400 font-mono">Connecting to JARVIS system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background effects */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
          animation: 'float 8s ease-in-out infinite'
        }}
      />

      <div className="relative z-10 p-6">
        {/* Connection Status */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`
            p-4 rounded-xl border backdrop-blur-sm
            ${connectionStatus === 'connected'
              ? 'border-green-500/40 bg-gradient-to-r from-green-500/10 to-emerald-500/10'
              : 'border-red-500/40 bg-gradient-to-r from-red-500/10 to-rose-500/10'
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getConnectionIcon()}
                <span className="font-mono text-lg font-bold">
                  JARVIS.CORE: {connectionStatus.toUpperCase()}
                </span>
              </div>
              <button
                onClick={testConnection}
                className="px-4 py-2 text-sm font-mono bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/30 transition-all duration-200"
              >
                REFRESH
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <div className="relative p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30">
                <Zap className="w-16 h-16 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-5xl font-mono font-black mb-4">
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                JARVIS
              </span>
              <span className="text-gray-500">.</span>
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text">
                PROTOCOLS
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto leading-relaxed">
              Advanced automation protocols and intelligent system commands
            </p>

            <div className="flex items-center justify-center space-x-6 mt-8">
              <div className="flex items-center space-x-2 text-cyan-400/70">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono text-sm">{protocols.length} protocols loaded</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-400/70">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-sm">{runningProtocols.size} active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search & Filters */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-50" />
            <div className="relative p-6 bg-gradient-to-r from-slate-900/80 to-blue-950/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Search Input */}
                <div className="lg:col-span-6 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Search protocols, descriptions, or voice triggers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 placeholder-gray-500 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                  />
                </div>

                {/* Search Mode */}
                <div className="lg:col-span-3">
                  <select
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'name' | 'trigger' | 'all')}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                  >
                    <option value="all" className="bg-gray-900">Search All</option>
                    <option value="name" className="bg-gray-900">Names Only</option>
                    <option value="trigger" className="bg-gray-900">Voice Triggers</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="lg:col-span-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-900/50 border border-cyan-400/40 rounded-xl text-cyan-300 font-mono focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-900">
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Summary */}
              {(searchTerm || selectedCategory !== 'all') && (
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm font-mono">
                      <span className="text-gray-400">Active filters:</span>
                      {searchTerm && (
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-400/30">
                          &quot;{searchTerm}&quot; in {searchMode}
                        </span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30">
                          {selectedCategory} protocols
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSearchMode('all');
                      }}
                      className="px-3 py-1 text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protocols Grid */}
        <div className="max-w-7xl mx-auto">
          {connectionStatus === 'disconnected' ? (
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <AlertCircle className="w-20 h-20 text-red-400 mx-auto" />
                <div className="absolute inset-0 w-20 h-20 border-2 border-red-400/20 rounded-full animate-ping mx-auto" />
              </div>
              <h3 className="text-3xl font-mono font-bold text-red-400 mb-4">
                JARVIS CORE OFFLINE
              </h3>
              <p className="text-gray-500 font-mono text-lg mb-8">
                Unable to establish connection to protocol execution engine
              </p>
              <div className="space-y-2 text-sm font-mono text-gray-400 max-w-md mx-auto">
                <p>• Verify JARVIS API server is running on port 8000</p>
                <p>• Check network connectivity and firewall settings</p>
                <p>• Ensure CORS configuration allows frontend access</p>
              </div>
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="text-center py-20">
              <Terminal className="w-20 h-20 text-gray-600 mx-auto mb-8" />
              <h3 className="text-2xl font-mono font-bold text-gray-400 mb-4">
                No protocols found
              </h3>
              <p className="text-gray-500 font-mono">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No automation protocols are currently available'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Results summary */}
              <div className="mb-8 text-center">
                <p className="text-lg font-mono text-gray-400">
                  Showing <span className="text-cyan-400 font-bold">{filteredProtocols.length}</span> of{' '}
                  <span className="text-cyan-400 font-bold">{protocols.length}</span> protocols
                </p>
              </div>

              {/* Protocol cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProtocols.map((protocol) => (
                  <ProtocolCard
                    key={protocol.name}
                    protocol={protocol}
                    isRunning={runningProtocols.has(protocol.name)}
                    onRun={handleRunProtocol}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Execution Result Modal */}
      <ExecutionModal
        result={executionResult}
        onClose={() => setExecutionResult(null)}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
      `}</style>
    </div>
  );
}