"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { AlertTriangle, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";

export default function IncidentsPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) {
                    // retry once
                    await new Promise(r => setTimeout(r, 500));
                    const t2 = await getToken();
                    if (!t2) throw new Error("Authentication not ready");
                }

                // Strategy: Fetch all monitors, then fetch incidents for each.
                // This is robust if there is no global incidents endpoint.

                // 1. Fetch Monitors
                const monRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!monRes.ok) throw new Error("Failed to fetch monitors");
                const monitors = await monRes.json();

                if (!Array.isArray(monitors)) {
                    setIncidents([]);
                    return;
                }

                // 2. Fetch Incidents for each monitor
                // Use Promise.all
                const incidentPromises = monitors.map(m =>
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${m.id}/incidents`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(r => r.ok ? r.json() : []).then(data => ({
                        monitorName: m.name,
                        monitorId: m.id,
                        incidents: Array.isArray(data) ? data : []
                    }))
                );

                const results = await Promise.all(incidentPromises);

                // Flatten and Sort
                const allIncidents = results.flatMap(r =>
                    r.incidents.map(i => ({ ...i, monitor_name: r.monitorName, monitor_id: r.monitorId }))
                ).sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

                setIncidents(allIncidents);

            } catch (err) {
                console.error(err);
                setError("Failed to load incidents history.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoaded, isSignedIn, getToken]);

    if (!isLoaded) return <div className="min-h-screen bg-black" />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 pt-24 pb-16">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/20">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Incidents</h1>
                            <p className="text-gray-400 text-sm mt-1">History of all downtime events across your monitors.</p>
                        </div>
                    </div>

                    <Link
                        href="/monitors"
                        className="group relative inline-flex items-center justify-center gap-2
                        rounded-xl px-5 py-2.5
                        text-sm font-medium text-white
                        bg-white/5 border border-white/10
                        hover:bg-white/10
                        transition-all duration-300
                        shadow-lg"
                    >
                        <ArrowLeft size={16} />
                        Back to Monitors
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
                        ))}
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">All Systems Operational</h3>
                        <p className="text-gray-500 text-sm">No recent incidents recorded across your monitors.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incidents.map((incident) => {
                            const isResolved = incident.is_resolved || !!incident.resolved_at;
                            const startTime = new Date(incident.started_at);
                            const endTime = incident.resolved_at ? new Date(incident.resolved_at) : null;

                            // Duration Logic
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
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${isResolved
                                        ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                                        : "border-red-500/30 bg-red-500/10 hover:bg-red-500/15"
                                        }`}
                                >
                                    {/* Status Indicator Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isResolved ? "bg-emerald-500/50" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"}`} />

                                    <div className="pl-5 p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-base font-semibold ${isResolved ? 'text-gray-200' : 'text-red-400'}`}>
                                                    {incident.monitor_name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isResolved
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse'
                                                    }`}>
                                                    {isResolved ? 'Resolved' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    <span>{startTime.toLocaleString()}</span>
                                                </div>
                                                {incident.cause && (
                                                    <span className="italic">"{incident.cause}"</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                            <div className="flex flex-col md:items-end md:text-right gap-0.5">
                                                <span className="text-[10px] uppercase font-semibold text-gray-600">Started</span>
                                                <span className="text-xs font-mono text-gray-400">{startTime.toLocaleTimeString()}</span>
                                            </div>

                                            {endTime && (
                                                <div className="flex flex-col md:items-end md:text-right gap-0.5">
                                                    <span className="text-[10px] uppercase font-semibold text-gray-600">Resolved</span>
                                                    <span className="text-xs font-mono text-gray-400">{endTime.toLocaleTimeString()}</span>
                                                </div>
                                            )}

                                            <div className="flex flex-col md:items-end md:text-right gap-0.5 min-w-[60px]">
                                                <span className="text-[10px] uppercase font-semibold text-gray-600">Duration</span>
                                                <span className={`text-sm font-medium ${isResolved ? 'text-gray-300' : 'text-red-300'}`}>
                                                    {duration}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
