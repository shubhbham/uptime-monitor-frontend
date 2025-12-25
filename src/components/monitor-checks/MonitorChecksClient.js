"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getMonitorChecks } from "@/actions/monitorChecks";
import MonitorHeader from "./MonitorHeader";
import MonitorMetrics from "./MonitorMetrics";
import ResponseTimeline from "./ResponseTimeline";
import ChecksTable from "./ChecksTable";
import TimeRangeSelector from "./TimeRangeSelector";


export default function MonitorChecksClient({ id }) {
    const { isSignedIn } = useAuth();

    // Data State
    const [checks, setChecks] = useState([]);
    // Loading States
    const [loading, setLoading] = useState(true); 
    const [loadingMore, setLoadingMore] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Loading data...");
    
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Filters & Mode
    const [timeRange, setTimeRange] = useState("24h");
    const [liveTail, setLiveTail] = useState(true);

    // Pagination State
    const [nextCursor, setNextCursor] = useState(null);

    // Safety Limit for auto-fetching
    const MAX_AUTO_FETCH = 2000; 

    // Helper: Calculate 'from' date based on timeRange
    const getFromDateData = useCallback((range) => {
        if (range === "custom") return null;
        
        const now = new Date();
        const rangeMap = {
            "15m": 15 * 60 * 1000,
            "1h": 60 * 60 * 1000,
            "6h": 6 * 60 * 60 * 1000,
            "24h": 24 * 60 * 60 * 1000,
            "7d": 7 * 24 * 60 * 60 * 1000,
            "30d": 30 * 24 * 60 * 60 * 1000,
        };
        const ms = rangeMap[range];
        if (!ms) return null;
        
        return new Date(now.getTime() - ms);
    }, []);


    // Core Fetch Function (Single Page)
    const fetchPage = useCallback(async (cursor, fromDate) => {
        // Pass 'from' to API to potentially optimize, but we mainly check client side loop
         const fromIso = fromDate ? fromDate.toISOString() : null;
         return await getMonitorChecks(id, cursor, fromIso);
    }, [id]);

    // Recursive / Deep Fetch Logic
    const loadDataForRange = useCallback(async (range) => {
        if (!isSignedIn) return;

        setLoading(true);
        setLoadingMessage("Initializing timeline...");
        setError(null);
        
        try {
            const targetDate = getFromDateData(range); // Date obj or null
            const targetTime = targetDate ? targetDate.getTime() : 0;
            
            let accumulatedChecks = [];
            let currentCursor = null;
            let keepFetching = true;
            let fetchCount = 0;

            // Fetch Loop
            while (keepFetching) {
                fetchCount++;
                if (fetchCount > 1 && targetDate) {
                     setLoadingMessage(`Retrieving history... Page ${fetchCount} (${accumulatedChecks.length} logs)`);
                }

                const result = await fetchPage(currentCursor, targetDate);
                
                if (result.error) throw new Error(result.error);
                
                const pageData = result.data || [];
                if (pageData.length === 0) {
                    keepFetching = false;
                    break;
                }

                // Append
                accumulatedChecks = [...accumulatedChecks, ...pageData];

                // Check termination conditions
                // 1. No more pages
                if (!result.nextCursor) {
                    currentCursor = null;
                    keepFetching = false;
                    break;
                }

                // 2. Safety Limit
                if (accumulatedChecks.length >= MAX_AUTO_FETCH) {
                    console.warn("Hit max auto-fetch limit. Stopping.");
                    currentCursor = result.nextCursor; // Save cursor to continue later if needed
                    keepFetching = false;
                    break;
                }

                // 3. Time Range Covered?
                if (targetTime > 0) {
                    const oldestInPage = new Date(pageData[pageData.length - 1].checked_at).getTime();
                    if (oldestInPage < targetTime) {
                        // We reached past the target start date
                        currentCursor = result.nextCursor;
                        keepFetching = false;
                        break;
                    }
                } else {
                    // If no target time (custom/all?), fetch only page 1 usually? 
                    // Or if "Range" logic is invoked generally:
                    if (range === "24") { 
                        // Default simple logic, maybe loop a bit or just one page? 
                        // Logic moved to: "If range is specific, loop until range covered"
                    } else {
                         // Default safety: just 1 page if we don't know the range logic
                         currentCursor = result.nextCursor;
                         keepFetching = false;
                    }
                }
                
                // Prepare next iteration
                currentCursor = result.nextCursor;
            }

            // Deduplicate (just in case) & Sort
            // (Assuming pages are sequential, mostly just concat is fine but map is safer)
            const uniqueMap = new Map();
            accumulatedChecks.forEach(c => uniqueMap.set(c.id, c));
            const finalSorted = Array.from(uniqueMap.values())
                .sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at));
            
            setChecks(finalSorted);
            setNextCursor(currentCursor);
            
            // Re-enable Live Tail if appropriate
            setLiveTail(true);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load range configuration");
        } finally {
            setLoading(false);
            setLoadingMessage("Loading data...");
        }
    }, [isSignedIn, fetchPage, getFromDateData]);


    // "Load More" Handler (Manual Append)
    const handleLoadMore = async () => {
        if (!nextCursor) return;
        setLoadingMore(true);
        setLiveTail(false);
        setTimeRange("custom"); // Switch mode
        
        try {
            const result = await fetchPage(nextCursor, null); // No 'from' constraint on load more
            if (result.error) throw new Error(result.error);
            
            const newData = result.data || [];
            
            setChecks(prev => {
                const map = new Map(prev.map(c => [c.id, c]));
                newData.forEach(c => map.set(c.id, c));
                return Array.from(map.values()).sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at));
            });
            
            setNextCursor(result.nextCursor || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    };

    // Live Tail Logic (Background Refetch)
    const handleLiveUpdate = useCallback(async () => {
        if (!liveTail) return;
        // Just fetch latest page/partial
        try {
             // We don't want to use 'fetchPage' recursively here. Just simple latest check.
             // We also don't want 'from' constraint to hide new stuff? 
             // Actually, API 'from' usually filters OUT older. 
             const result = await getMonitorChecks(id, null, null); 
             if (result.data) {
                 setChecks(prev => {
                     const map = new Map(prev.map(c => [c.id, c]));
                     result.data.forEach(c => map.set(c.id, c));
                     return Array.from(map.values()).sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at));
                 });
             }
        } catch (e) { console.error("Live tail error", e); }
    }, [id, liveTail]);


    // Effect: Initial Load & Range Change
    useEffect(() => {
        if (timeRange === "custom") return; // Don't auto-load on custom switch
        
        loadDataForRange(timeRange);
    }, [timeRange, loadDataForRange]);

    // Effect: Live Tail Interval
    useEffect(() => {
        const interval = setInterval(handleLiveUpdate, 5000);
        return () => clearInterval(interval);
    }, [handleLiveUpdate]);


    // Helper for Filters
    const displayChecks = useMemo(() => {
        if (!checks) return [];
        if (timeRange === "custom") return checks;

        const targetDate = getFromDateData(timeRange);
        if (!targetDate) return checks;
        
        const cutoff = targetDate.getTime();
        return checks.filter(c => new Date(c.checked_at).getTime() >= cutoff);
    }, [checks, timeRange, getFromDateData]);

    
    /* Metrics Logic using displayChecks */
    const percentiles = useMemo(() => {
        if (!displayChecks.length) return null;
        const responseTimes = displayChecks
            .map((c) => c.response_time_ms)
            .filter((rt) => rt != null && rt >= 0)
            .sort((a, b) => a - b);
        if (!responseTimes.length) return null;
        const getPercentile = (p) => responseTimes[Math.ceil((p / 100) * responseTimes.length) - 1];
        return { p50: getPercentile(50), p75: getPercentile(75), p99: getPercentile(99), p100: responseTimes[responseTimes.length - 1] };
    }, [displayChecks]);

    const uptimePercentage = useMemo(() => {
        if (!displayChecks.length) return 0;
        return ((displayChecks.filter(c => c.is_up).length / displayChecks.length) * 100).toFixed(2);
    }, [displayChecks]);

    const maxResponse = useMemo(() => Math.max(...(displayChecks.length ? displayChecks.map(c => c.response_time_ms || 0) : [1]), 1), [displayChecks]);

    if (!isSignedIn) return <div className="min-h-screen flex items-center justify-center bg-black text-red-400">Please sign in.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-6 md:py-12">
            <div className="mx-auto max-w-7xl space-y-6">
                <MonitorHeader />

                {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}

                <TimeRangeSelector
                    timeRange={timeRange === "custom" ? "" : timeRange}
                    setTimeRange={setTimeRange}
                    liveTail={liveTail}
                    setLiveTail={setLiveTail}
                />

                <MonitorMetrics
                    loading={loading && checks.length === 0}
                    filteredChecks={displayChecks}
                    percentileLoading={loading && checks.length === 0}
                    percentiles={percentiles}
                    uptimePercentage={uptimePercentage}
                />

                {/* Graph Container with Overlay Loader */}
                <div className="relative min-h-[300px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    {/* Centered Spinner Overlay */}
                    {(loading || isRefetching) && (
                         <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm rounded-2xl">
                            <div className="flex flex-col items-center gap-3 bg-black/40 p-6 rounded-xl border border-white/10 backdrop-blur-md">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                <span className="text-sm font-medium text-indigo-200">{loadingMessage}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-4 md:p-6 h-full">
                        <ResponseTimeline
                            loading={false}
                            filteredChecks={displayChecks}
                            hoveredPoint={hoveredPoint}
                            setHoveredPoint={setHoveredPoint}
                            maxResponse={maxResponse}
                        />
                    </div>
                </div>

                {!loading && displayChecks.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
                        {loading ? "Initializing..." : "No logs available for this period."}
                    </div>
                )}

                <ChecksTable
                    checks={displayChecks}
                    showTable={showTable}
                    setShowTable={setShowTable}
                />

                {/* Load More Button */}
                {!loading && nextCursor && (
                    <div className="flex justify-center pt-6">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingMore && <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />}
                            {loadingMore ? "Loading history..." : "Load Older Logs"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
