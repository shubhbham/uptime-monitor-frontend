"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Pencil, Play, Loader2 } from "lucide-react";

const TruncatedText = ({ text, limit = 10, className = "" }) => {
    if (!text) return null;
    if (text.length <= limit) return <span className={className}>{text}</span>;
    const truncated = text.slice(0, limit) + "...";
    return (
        <div className="relative group inline-flex items-center">
            <span className={`cursor-help decoration-dotted underline-offset-4 ${className}`}>{truncated}</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                <div className="relative bg-gray-900/95 backdrop-blur-md border border-white/10 text-white text-xs px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap">
                    {text}
                    <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900/95"></div>
                </div>
            </div>
        </div>
    );
};

export default function MonitorItem({ monitor, onEdit, onDelete, onEnable, onIncidents }) {
    const [isEnabling, setIsEnabling] = useState(false);
    const isActive = monitor.is_active;

    // Determine if there is an ongoing incident. 
    // Assuming 'status' is false when down, or 'active_incident' ID is present.
    // We treat explicit false or presence of active_incident as 'Down'.
    const hasOngoingIncident = monitor.status === false || (monitor.active_incident_id !== null && monitor.active_incident_id !== undefined);

    const handleEnableClick = async (e) => {
        e.stopPropagation();
        try {
            setIsEnabling(true);
            await onEnable(monitor);
        } catch (error) {
            console.error("Failed to enable", error);
        } finally {
            setIsEnabling(false);
        }
    };

    return (
        <>
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-3px) rotate(-5deg); }
                    75% { transform: translateX(3px) rotate(5deg); }
                }
                .animate-shake-alert {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both infinite;
                }
            `}</style>
            
            <div className={`group relative rounded-2xl border transition-all duration-300 
      ${isActive
                    ? "border-white/10 bg-white/5 backdrop-blur-xl hover:border-indigo-500/50 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-indigo-500/10"
                    : "border-white/5 bg-gray-900/50 grayscale hover:grayscale-0 hover:bg-gray-800/80"
                }`}
            >
                <div className="p-5 md:p-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Content Section */}
                    <Link
                        href={isActive ? `/monitors/${monitor.id}/checks` : "#"}
                        className={`min-w-0 flex-1 space-y-2 ${!isActive ? 'cursor-default pointer-events-none' : ''}`}
                        onClick={(e) => !isActive && e.preventDefault()}
                    >
                        {/* Name & Status */}
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                <TruncatedText text={monitor.name} limit={20} />
                            </h2>

                            {isActive ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Paused
                                </span>
                            )}
                        </div>

                        {/* URL / Domain */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono text-xs uppercase bg-white/5 px-1.5 py-0.5 rounded text-gray-400">
                                {monitor.method}
                            </span>
                            <span>•</span>
                            <TruncatedText text={monitor.url} limit={15} className="font-medium" />
                        </div>
                    </Link>

                    {/* Meta & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 mt-2 md:mt-0 relative">
                        {/* Disabled Overlay Motivation */}
                        {!isActive && (
                            <div className="md:absolute md:right-full md:mr-8 flex items-center gap-4">
                                <span className="text-xs text-gray-500 hidden xl:inline-block">Monitoring paused</span>
                                <button
                                    onClick={handleEnableClick}
                                    disabled={isEnabling}
                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all z-20 whitespace-nowrap"
                                >
                                    {isEnabling ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Play size={12} fill="currentColor" />
                                    )}
                                    {isEnabling ? "Enabling..." : "Enable Monitor"}
                                </button>
                            </div>
                        )}

                        {/* Stats - Dimmed if disabled */}
                        <div className={`grid grid-cols-3 gap-6 text-xs ${!isActive ? 'opacity-30' : ''}`}>
                            <div className="text-center md:text-left">
                                <p className="text-gray-600 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Interval</p>
                                <p className="text-gray-400 font-mono">{monitor.interval_seconds}s</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-gray-600 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Timeout</p>
                                <p className="text-gray-400 font-mono">{monitor.timeout_seconds}s</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-gray-600 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Exp.</p>
                                <p className="text-gray-400 font-mono">{monitor.expected_status}</p>
                            </div>
                        </div>

                        {/* Actions Divider */}
                        <div className="h-8 w-px bg-white/5 hidden md:block" />

                        {/* Action Buttons - Combined & Smaller */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(monitor);
                                }}
                                className="group/edit relative flex items-center justify-center w-8 h-8 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
                                title="Edit Configuration"
                            >
                                <Pencil size={14} />
                            </button>

                            <span className="text-gray-700 mx-1">|</span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(monitor);
                                }}
                                className="group/delete relative flex items-center justify-center w-8 h-8 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all"
                                title="Delete Monitor"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
