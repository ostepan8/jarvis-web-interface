import { Protocol } from "../../../types";
import {
    Code, Loader, Play, Settings, Terminal, ChevronDown,
    ChevronUp, Mic, Activity
} from "lucide-react";
import { useState } from "react";
import { ArgumentDefinition } from "../../../types";

// Argument Input Component
const ArgumentInput: React.FC<{
    arg: ArgumentDefinition;
    value: string | undefined;
    onChange: (value: string) => void;
}> = ({ arg, value, onChange }) => {
    if (arg.type === 'choice' && arg.choices) {
        return (
            <select
                value={value || ''}
                onChange={(e) => {
                    e.stopPropagation();
                    onChange(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-30 w-full px-3 py-2 bg-gray-900/50 border border-cyan-400/40 rounded-lg text-cyan-300 font-mono text-sm focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all duration-200 cursor-pointer"
            >
                <option value="">Select {arg.name}</option>
                {arg.choices.map((choice: string) => (
                    <option key={choice} value={choice} className="bg-gray-900">
                        {choice}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <input
            type="text"
            value={value || ''}
            onChange={(e) => {
                e.stopPropagation();
                onChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder={`Enter ${arg.name}`}
            className="relative z-30 w-full px-3 py-2 bg-gray-900/50 border border-cyan-400/40 rounded-lg text-cyan-300 font-mono text-sm focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all duration-200"
        />
    );
};

// Enhanced Protocol Card Component
const ProtocolCard: React.FC<{
    protocol: Protocol;
    isRunning: boolean;
    onRun: (protocol: Protocol, args?: Record<string, string>) => void;
    searchTerm: string;
}> = ({ protocol, isRunning, onRun, searchTerm }) => {
    const [expanded, setExpanded] = useState(false);
    const [showArguments, setShowArguments] = useState(false);
    const [arguments_, setArguments] = useState<Record<string, string>>({});

    const hasRequiredArgs = protocol.argument_definitions?.some(arg => arg.required);
    const canExecute = !hasRequiredArgs || protocol.argument_definitions?.every(arg =>
        !arg.required || arguments_[arg.name]
    );

    const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="bg-cyan-400/30 text-cyan-200 px-1 rounded">
                    {part}
                </span>
            ) : part
        );
    };

    const handleExecute = () => {
        // If we have required args and they're not filled, show the arguments form
        if (hasRequiredArgs && !canExecute) {
            setShowArguments(true);
            return;
        }
        // If we have required args and the form is showing but not complete, don't execute
        if (hasRequiredArgs && showArguments && !canExecute) {
            return;
        }
        // Execute the protocol
        onRun(protocol, arguments_);
    };

    const getAgentColor = (agentName: string) => {
        const colors = {
            'PhillipsHueAgent': 'text-purple-400',
            'WeatherAgent': 'text-blue-400',
            'CalendarAgent': 'text-green-400',
            'SystemAgent': 'text-red-400',
            'default': 'text-cyan-400'
        };
        return colors[agentName as keyof typeof colors] || colors.default;
    };

    return (
        <div className="relative group">
            {/* Holographic outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-slate-900/80 via-blue-950/40 to-slate-900/80 backdrop-blur-xl border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl">
                {/* Animated grid overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.3) 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Header with holographic effect */}
                <div className="relative p-6 border-b border-cyan-500/20">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="relative p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50">
                                <Terminal className="w-5 h-5 text-cyan-400" />
                                <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-mono font-bold text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text">
                                    {highlightText(protocol.name, searchTerm)}
                                </h3>
                                {protocol.steps?.[0] && (
                                    <span className={`text-xs font-mono ${getAgentColor(protocol.steps[0].agent)} uppercase tracking-wider opacity-80`}>
                                        {protocol.steps[0].agent}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {protocol.argument_definitions?.length > 0 && (
                                <span className="px-2 py-1 text-xs font-mono bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                                    {protocol.argument_definitions.length} args
                                </span>
                            )}
                            {protocol.trigger_phrases?.length > 0 && (
                                <span className="px-2 py-1 text-xs font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-400/30">
                                    {protocol.trigger_phrases.length} triggers
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 font-mono leading-relaxed mb-4">
                        {highlightText(protocol.description || 'No description available', searchTerm)}
                    </p>

                    {/* Quick stats */}
                    <div className="flex items-center space-x-4 text-xs font-mono">
                        {protocol.steps && (
                            <div className="flex items-center space-x-1 text-cyan-400/70">
                                <Activity className="w-3 h-3" />
                                <span>{protocol.steps.length} step{protocol.steps.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {protocol.argument_definitions?.filter(arg => arg.required).length > 0 && (
                            <div className="flex items-center space-x-1 text-amber-400/70">
                                <Settings className="w-3 h-3" />
                                <span>{protocol.argument_definitions.filter(arg => arg.required).length} required</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arguments Section */}
                {showArguments && protocol.argument_definitions?.length > 0 && (
                    <div className="relative p-6 border-b border-cyan-500/20 bg-gradient-to-r from-blue-950/20 to-purple-950/20 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center">
                                <Settings className="w-4 h-4 mr-2" />
                                Configure Arguments
                            </h4>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowArguments(false);
                                }}
                                className="relative z-20 p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 hover:bg-cyan-500/10 rounded"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {protocol.argument_definitions.map((arg) => (
                                <div key={arg.name} className="space-y-2 relative z-10">
                                    <label className="block text-xs font-mono text-gray-300">
                                        {arg.name}
                                        {arg.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>
                                    <div className="relative z-10">
                                        <ArgumentInput
                                            arg={arg}
                                            value={arguments_[arg.name]}
                                            onChange={(value) => setArguments(prev => ({ ...prev, [arg.name]: value }))}
                                        />
                                    </div>
                                    {arg.description && (
                                        <p className="text-xs text-gray-500 font-mono">{arg.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Execute button in arguments section when configured */}
                        {canExecute && (
                            <div className="mt-6 pt-4 border-t border-cyan-500/20 relative z-10">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowArguments(false);
                                        onRun(protocol, arguments_);
                                    }}
                                    disabled={isRunning}
                                    className="relative z-20 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/50 hover:border-green-300 shadow-lg shadow-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>EXECUTE WITH ARGUMENTS</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Expandable details */}
                {expanded && (
                    <div className="p-6 space-y-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-blue-900/20">
                        {/* Trigger Phrases */}
                        {protocol.trigger_phrases?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-mono font-bold text-purple-400 mb-3 flex items-center">
                                    <Mic className="w-4 h-4 mr-2" />
                                    Voice Triggers ({protocol.trigger_phrases.length})
                                </h4>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {protocol.trigger_phrases.slice(0, 5).map((phrase, index) => (
                                        <div
                                            key={index}
                                            className="text-xs font-mono text-gray-400 p-2 bg-gray-800/30 rounded border border-gray-700/50"
                                        >
                                            &quot;{highlightText(phrase, searchTerm)}&quot;
                                        </div>
                                    ))}
                                    {protocol.trigger_phrases.length > 5 && (
                                        <div className="text-xs font-mono text-gray-500 italic">
                                            ... and {protocol.trigger_phrases.length - 5} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Execution Steps */}
                        {protocol.steps?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-mono font-bold text-cyan-400 mb-3 flex items-center">
                                    <Code className="w-4 h-4 mr-2" />
                                    Execution Steps
                                </h4>
                                <div className="space-y-2">
                                    {protocol.steps.map((step, index) => (
                                        <div key={index} className="p-3 bg-gray-800/30 rounded border border-gray-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-mono font-bold ${getAgentColor(step.agent)}`}>
                                                    {step.agent}
                                                </span>
                                                <span className="text-xs font-mono text-gray-500">
                                                    {step.function}()
                                                </span>
                                            </div>
                                            {Object.keys(step.parameter_mappings || {}).length > 0 && (
                                                <div className="text-xs font-mono text-gray-400">
                                                    Maps: {Object.entries(step.parameter_mappings).map(([key, value]) =>
                                                        `${key} → ${value}`
                                                    ).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 bg-gradient-to-r from-slate-900/60 to-blue-950/30">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleExecute}
                            disabled={isRunning}
                            className={`
                flex items-center space-x-2 px-6 py-3 rounded-xl font-mono text-sm font-bold
                transition-all duration-300 ease-out relative overflow-hidden
                ${isRunning
                                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                    : canExecute || !hasRequiredArgs
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/50 hover:border-cyan-300 shadow-lg shadow-cyan-500/20'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30 cursor-pointer'
                                }
              `}
                        >
                            {isRunning ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>EXECUTING...</span>
                                </>
                            ) : hasRequiredArgs && !canExecute ? (
                                <>
                                    <Settings className="w-4 h-4" />
                                    <span>CONFIGURE</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span>EXECUTE</span>
                                </>
                            )}

                            {/* Button glow effect */}
                            {!isRunning && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            )}
                        </button>

                        {/* Only show expand button if there's actually content to expand */}
                        {(protocol.trigger_phrases?.length > 0 || protocol.steps?.length > 0) && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="relative z-20 p-3 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 border border-transparent hover:border-cyan-400/30 cursor-pointer"
                                title={expanded ? "Hide details" : "Show details"}
                            >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtocolCard;