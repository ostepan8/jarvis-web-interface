import { ProtocolRunResult } from "../../../types";
import { AlertTriangle, CheckCircle, Loader, XCircle, Terminal, Activity, Clock } from "lucide-react";

// Enhanced Execution Result Modal
const ExecutionModal: React.FC<{
    result: ProtocolRunResult | null;
    onClose: () => void;
}> = ({ result, onClose }) => {
    if (!result) return null;

    const getStatusIcon = () => {
        switch (result.status) {
            case 'success':
                return (
                    <div className="relative">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                    </div>
                );
            case 'error':
                return (
                    <div className="relative">
                        <XCircle className="w-8 h-8 text-red-400" />
                        <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse" />
                    </div>
                );
            case 'running':
                return (
                    <div className="relative">
                        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" />
                    </div>
                );
            default:
                return (
                    <div className="relative">
                        <AlertTriangle className="w-8 h-8 text-yellow-400" />
                        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
                    </div>
                );
        }
    };

    const getStatusColor = () => {
        switch (result.status) {
            case 'success': return 'border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10';
            case 'error': return 'border-red-500/50 bg-gradient-to-r from-red-500/10 to-rose-500/10';
            case 'running': return 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10';
            default: return 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/10';
        }
    };

    const getStatusText = () => {
        switch (result.status) {
            case 'success': return 'EXECUTION COMPLETE';
            case 'error': return 'EXECUTION FAILED';
            case 'running': return 'EXECUTION IN PROGRESS';
            default: return 'EXECUTION STATUS UNKNOWN';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with holographic effect */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.4) 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                        animation: 'float 6s ease-in-out infinite'
                    }}
                />
            </div>

            {/* Modal container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Holographic glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-75" />

                {/* Main modal */}
                <div className="relative bg-gradient-to-br from-slate-900/95 via-blue-950/60 to-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl">
                    {/* Animated grid overlay */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}
                    />

                    {/* Header */}
                    <div className="relative p-8 border-b border-cyan-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {getStatusIcon()}
                                <div>
                                    <h2 className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                                        Protocol Execution
                                    </h2>
                                    <p className="text-lg font-mono text-gray-400 mt-1">{result.protocol}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="group p-3 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 border border-transparent hover:border-cyan-400/30"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div className={`mx-8 mt-8 p-6 rounded-xl border ${getStatusColor()}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Terminal className="w-5 h-5 text-cyan-400" />
                                <span className="font-mono text-lg font-bold uppercase tracking-wider text-cyan-300">
                                    {getStatusText()}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm font-mono text-gray-400">
                                {result.duration && (
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{result.duration}ms</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4" />
                                    <span className="capitalize">{result.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="p-8 max-h-[50vh] overflow-auto">
                        <h3 className="text-lg font-mono font-bold text-cyan-400 mb-6 uppercase tracking-wider flex items-center">
                            <Terminal className="w-5 h-5 mr-3" />
                            Execution Output
                        </h3>

                        {result.error ? (
                            <div className="relative">
                                {/* Error container with holographic effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur opacity-75" />
                                <div className="relative p-6 bg-gradient-to-br from-red-950/30 via-rose-950/20 to-red-950/30 border border-red-500/40 rounded-xl">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-mono font-bold text-red-300 mb-2">Error Details</h4>
                                            <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap leading-relaxed">
                                                {result.error}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Success/Results container with holographic effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-50" />
                                <div className="relative p-6 bg-gradient-to-br from-slate-800/50 via-blue-900/20 to-slate-800/50 border border-cyan-500/40 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-mono font-bold text-cyan-300 mb-4">Execution Results</h4>
                                            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                                                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                                    {typeof result.results === 'string'
                                                        ? result.results
                                                        : JSON.stringify(result.results, null, 2)
                                                    }
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-cyan-500/30 bg-gradient-to-r from-slate-900/50 to-blue-950/30">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-mono text-gray-500">
                                Protocol execution completed at {new Date().toLocaleTimeString()}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-xl font-mono font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/20"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
        </div>
    );
};

export default ExecutionModal;