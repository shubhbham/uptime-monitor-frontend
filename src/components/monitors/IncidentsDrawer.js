"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { X, CheckCircle2, Calendar } from "lucide-react";

export default function IncidentsDrawer({ monitor, onClose }) {
    const { getToken } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch Incidents Function - Memoized or Effect dependency
    const fetchIncidents = useCallback(async () => {
        if (!monitor) return;
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${monitor.id}/incidents`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error("Failed to load incidents");

            const data = await res.json();
            setIncidents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [monitor, getToken]);

    // Handle slide-in animation and data fetching
    useEffect(() => {
        if (monitor) {
            setIsVisible(true);
            fetchIncidents();
        } else {
            setIsVisible(false);
            setIncidents([]);
        }
    }, [monitor, fetchIncidents]);

    const handleClose = () => {
        setIsVisible(false);
        // Delay actual unmount/nulling to allow animation to finish
        setTimeout(onClose, 300);
    };

    if (!monitor && !isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={handleClose}
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-[101] w-full max-w-md transform border-l border-white/10 bg-gray-950 shadow-2xl transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">

                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-white/5 p-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Incidents History</h2>
                            <p className="mt-1 text-sm text-gray-400">
                                Recent downtime events for <span className="font-medium text-white">{monitor?.name}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {loading ? (
                            <div className="flex h-40 flex-col items-center justify-center gap-3 text-gray-400">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                                <span className="text-sm">Loading incidents...</span>
                            </div>
                        ) : error ? (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-400">
                                {error}
                            </div>
                        ) : incidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
                                <CheckCircle2 size={32} className="text-emerald-500/50 mb-2" />
                                <p className="text-white font-medium">No Incidents Recorded</p>
                                <p className="text-xs text-gray-500 max-w-[200px]">This monitor has been stable with no downtime events.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Timeline</span>
                                    <div className="h-px flex-1 bg-white/5"></div>
                                </div>

                                {incidents.map((incident) => {
                                    const isResolved = incident.is_resolved || !!incident.resolved_at;
                                    const startTime = new Date(incident.started_at);
                                    const endTime = incident.resolved_at ? new Date(incident.resolved_at) : null;

                                    // Calculate duration string
                                    let duration = "Ongoing";
                                    if (endTime) {
                                        const diffMs = endTime - startTime;
                                        const diffMinsTotal = diffMs / 60000;

                                        if (diffMinsTotal < 60) {
                                            duration = `${diffMinsTotal.toFixed(2)}m`;
                                        } else {
                                            const hours = Math.floor(diffMinsTotal / 60);
                                            const mins = Math.floor(diffMinsTotal % 60);
                                            duration = `${hours}h ${mins}m`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={incident.id}
                                            className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${isResolved
                                                ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                                                : "border-red-500/30 bg-red-500/10 hover:bg-red-500/15"
                                                }`}
                                        >
                                            {/* Status Line */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isResolved ? "bg-emerald-500/50" : "bg-red-500"}`} />

                                            <div className="pl-3">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-semibold ${isResolved ? 'text-gray-300' : 'text-red-400'}`}>
                                                            {isResolved ? 'Downtime Resolved' : 'Ongoing Outage'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                            <Calendar size={10} />
                                                            {startTime.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${isResolved ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/20 text-red-400 animate-pulse"
                                                        }`}>
                                                        {isResolved ? 'Resolved' : 'Active'}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center gap-6 text-xs text-gray-400">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] uppercase text-gray-600 font-semibold">Started</span>
                                                        <span className="font-mono text-gray-300">{startTime.toLocaleTimeString()}</span>
                                                    </div>
                                                    {endTime && (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] uppercase text-gray-600 font-semibold">Resolved</span>
                                                            <span className="font-mono text-gray-300">{endTime.toLocaleTimeString()}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-0.5 ml-auto text-right">
                                                        <span className="text-[10px] uppercase text-gray-600 font-semibold">Duration</span>
                                                        <span className="font-medium text-white">{duration}</span>
                                                    </div>
                                                </div>

                                                {/* Cause if available (Optional, if API sends cause) */}
                                                {incident.cause && (
                                                    <div className="mt-3 text-xs text-gray-500 italic border-t border-white/5 pt-2">
                                                        &quot;{incident.cause}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
