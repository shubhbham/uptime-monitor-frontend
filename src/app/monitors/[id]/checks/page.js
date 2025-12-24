"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function MonitorChecksPage() {
  const { id } = useParams();
  const { getToken, isSignedIn } = useAuth();

  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [percentileLoading, setPercentileLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        if (!isSignedIn) return;

        const token = await getToken({ template: "golang" });
        if (!token) throw new Error("Unable to get auth token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${id}/checks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load checks");
        }

        const data = await res.json();
        setChecks(data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        setTimeout(() => setPercentileLoading(false), 600);
      }
    };

    fetchChecks();

    // Auto-refresh every 15 seconds
    let interval;
    if (autoRefresh && isSignedIn) {
      interval = setInterval(() => {
        fetchChecks();
      }, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, getToken, isSignedIn, autoRefresh]);

  const filteredChecks = useMemo(() => {
    if (!checks || checks.length === 0) return [];
    
    const now = new Date();
    const cutoffMs = {
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }[timeRange];

    const filtered = checks.filter(check => {
      const checkTime = new Date(check.checked_at);
      return (now.getTime() - checkTime.getTime()) <= cutoffMs;
    });

    return filtered;
  }, [checks, timeRange]);

  const percentiles = useMemo(() => {
    if (filteredChecks.length === 0) return null;

    const responseTimes = filteredChecks
      .map((c) => c.response_time_ms)
      .filter((rt) => rt != null && rt >= 0)
      .sort((a, b) => a - b);

    if (responseTimes.length === 0) return null;

    const getPercentile = (p) => {
      const index = Math.ceil((p / 100) * responseTimes.length) - 1;
      return responseTimes[Math.max(0, index)];
    };

    return {
      p50: getPercentile(50),
      p75: getPercentile(75),
      p99: getPercentile(99),
      p100: responseTimes[responseTimes.length - 1],
    };
  }, [filteredChecks]);

  const uptimePercentage = useMemo(() => {
    if (filteredChecks.length === 0) return 0;
    const upChecks = filteredChecks.filter(c => c.is_up).length;
    return ((upChecks / filteredChecks.length) * 100).toFixed(2);
  }, [filteredChecks]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Please sign in to view checks.
      </div>
    );
  }

  const maxResponse = Math.max(...(filteredChecks.length > 0 ? filteredChecks.map(c => c.response_time_ms || 0) : [1]), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Monitor Health</h1>

          <Link
            href="/monitors"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to Monitors
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-400">
            Loading checks…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Time Range Selector */}
        {!loading && checks && checks.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Time Range:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "15M", value: "15m" },
                  { label: "1H", value: "1h" },
                  { label: "6H", value: "6h" },
                  { label: "24H", value: "24h" },
                  { label: "7D", value: "7d" },
                  { label: "30D", value: "30d" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRange(option.value)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                      timeRange === option.value
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`ml-auto px-4 py-2 text-sm rounded-lg border transition-all ${
                autoRefresh
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
          </div>
        )}

        {/* ===== PERCENTILE METRICS ===== */}
        {!loading && filteredChecks.length > 0 && (
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {percentileLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    <div className="relative">
                      <div className="flex items-center justify-center h-12 w-12 mx-auto mb-2 rounded-lg border-2 border-emerald-500/30">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="h-4 bg-white/10 rounded w-12 mx-auto mb-1" />
                      <div className="h-3 bg-white/5 rounded w-16 mx-auto" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all duration-300 group">
                  <div className={`flex items-center justify-center h-12 w-12 mx-auto mb-2 rounded-xl border-2 ${
                    parseFloat(uptimePercentage) < 70 
                      ? "border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                      : "border-emerald-500/40 bg-white/5"
                  } backdrop-blur-md group-hover:scale-110 transition-transform shadow-inner`}>
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" className={`${
                        parseFloat(uptimePercentage) < 70 ? "stroke-red-400" : "stroke-emerald-400"
                      } stroke-2`} strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" className={`${
                        parseFloat(uptimePercentage) < 70 ? "stroke-red-400" : "stroke-emerald-400"
                      } stroke-2`} strokeLinecap="round"/>
                    </svg>
                    {parseFloat(uptimePercentage) < 70 && (
                      <div className="absolute inset-0 rounded-xl bg-red-500/20 animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-400 mb-1">Uptime</div>
                    <div className={`text-lg md:text-xl font-bold ${
                      parseFloat(uptimePercentage) < 70 ? "text-red-400" : "text-white"
                    }`}>{uptimePercentage}%</div>
                  </div>
                </div>

                {[
                  { label: "P50", value: percentiles?.p50, gradient: "from-cyan-400 to-blue-400", border: "border-cyan-500/40", icon: "stroke-cyan-400", fill: "fill-cyan-500/60" },
                  { label: "P75", value: percentiles?.p75, gradient: "from-blue-400 to-violet-400", border: "border-blue-500/40", icon: "stroke-blue-400", fill: "fill-blue-500/60" },
                  { label: "P99", value: percentiles?.p99, gradient: "from-violet-400 to-purple-400", border: "border-violet-500/40", icon: "stroke-violet-400", fill: "fill-violet-500/60" },
                  { label: "P100", value: percentiles?.p100, gradient: "from-purple-400 to-pink-400", border: "border-purple-500/40", icon: "stroke-purple-400", fill: "fill-purple-500/60" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className={`flex items-center justify-center h-12 w-12 mx-auto mb-2 rounded-xl border-2 ${metric.border} bg-white/5 backdrop-blur-md group-hover:scale-110 transition-transform shadow-inner`}>
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="13" rx="2" className={`${metric.icon} stroke-2`} fill="none"/>
                        <path d="M2 19h20M8 22h8" className={`${metric.icon} stroke-2`} strokeLinecap="round"/>
                        <circle cx="12" cy="10.5" r="2" className={`${metric.fill}`}/>
                        <path d="M7 10.5h3M14 10.5h3" className={`${metric.icon} stroke-2`} strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-400 mb-1">
                        {metric.label}
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white">
                        {metric.value != null ? `${metric.value}ms` : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ===== GLASSY WAVE CHART ===== */}
        {!loading && filteredChecks.length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-white">
                Response Timeline
              </h2>

              {/* Legend */}
              <div className="flex flex-col gap-2 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs text-gray-300">Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-300">Status</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-64 md:h-80 overflow-hidden rounded-xl bg-gradient-to-b from-gray-900/50 to-gray-950/50 border border-white/5">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 1000 300" 
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  {/* Gradient for response time line */}
                  <linearGradient id="responseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.1"/>
                  </linearGradient>
                  
                  {/* Gradient for uptime line */}
                  <linearGradient id="uptimeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.05"/>
                  </linearGradient>
                  
                  {/* Glow filters */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Wave animation */}
                  <animate
                    attributeName="offset"
                    values="0;1;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </defs>

                {/* Y-axis labels */}
                <g className="text-xs fill-gray-400">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const value = Math.round((maxResponse / 4) * (4 - i));
                    return (
                      <text key={i} x="10" y={i * 60 + 15} fontSize="10" fill="rgba(156, 163, 175, 0.8)">
                        {value}ms
                      </text>
                    );
                  })}
                </g>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="50"
                    y1={i * 60 + 10}
                    x2="990"
                    y2={i * 60 + 10}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}

                {/* X-axis */}
                <line x1="50" y1="250" x2="990" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                
                {/* Y-axis */}
                <line x1="50" y1="10" x2="50" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

                {/* Response Time Wave */}
                {(() => {
                  const points = [...filteredChecks].reverse();
                  const step = 940 / Math.max(points.length - 1, 1);
                  
                  const responsePath = points
                    .map((check, i) => {
                      const x = 50 + (i * step);
                      const y = 240 - ((check.response_time_ms / maxResponse) * 230);
                      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                    })
                    .join(' ');

                  const responseArea = responsePath + ` L ${50 + ((points.length - 1) * step)},250 L 50,250 Z`;

                  return (
                    <>
                      {/* Response time area with wave animation */}
                      <path
                        d={responseArea}
                        fill="url(#responseGradient)"
                        opacity="0.4"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.4;0.6;0.4"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </path>
                      
                      {/* Response time line */}
                      <path
                        d={responsePath}
                        fill="none"
                        stroke="rgb(99, 102, 241)"
                        strokeWidth="3"
                        filter="url(#glow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Invisible hover targets - larger hit area */}
                      {points.map((check, i) => {
                        const x = 50 + (i * step);
                        const y = 240 - ((check.response_time_ms / maxResponse) * 230);
                        return (
                          <rect
                            key={check.id}
                            x={x - 15}
                            y={0}
                            width={30}
                            height={250}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredPoint(i)}
                            onMouseMove={() => setHoveredPoint(i)}
                          />
                        );
                      })}
                    </>
                  );
                })()}

                {/* Uptime Status Wave */}
                {(() => {
                  const points = [...filteredChecks].reverse();
                  const step = 940 / Math.max(points.length - 1, 1);
                  
                  const uptimePath = points
                    .map((check, i) => {
                      const x = 50 + (i * step);
                      const y = check.is_up ? 40 : 120;
                      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                    })
                    .join(' ');

                  const uptimeArea = uptimePath + ` L ${50 + ((points.length - 1) * step)},250 L 50,250 Z`;

                  return (
                    <>
                      {/* Uptime area */}
                      <path
                        d={uptimeArea}
                        fill="url(#uptimeGradient)"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.3;0.5;0.3"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </path>
                      
                      {/* Uptime line */}
                      <path
                        d={uptimePath}
                        fill="none"
                        stroke="rgb(16, 185, 129)"
                        strokeWidth="2.5"
                        filter="url(#glow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}

                {/* X-axis labels */}
                {(() => {
                  const points = [...filteredChecks].reverse();
                  const step = 940 / Math.max(points.length - 1, 1);
                  const labelCount = Math.min(5, points.length);
                  const labelStep = Math.floor(points.length / labelCount);
                  
                  return Array.from({ length: labelCount }).map((_, i) => {
                    const idx = i * labelStep;
                    if (idx >= points.length) return null;
                    const x = 50 + (idx * step);
                    const time = new Date(points[idx].checked_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    return (
                      <text key={i} x={x} y="270" fontSize="9" fill="rgba(156, 163, 175, 0.8)" textAnchor="middle">
                        {time}
                      </text>
                    );
                  });
                })()}
              </svg>

              {/* Hover tooltip */}
              {hoveredPoint !== null && (() => {
                const points = [...filteredChecks].reverse();
                const check = points[hoveredPoint];
                const step = 940 / Math.max(points.length - 1, 1);
                const x = 50 + (hoveredPoint * step);
                const percentage = (x / 1000) * 100;
                
                return (
                  <div 
                    className="absolute top-0 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl pointer-events-none z-50"
                    style={{ 
                      left: `${Math.min(Math.max(percentage, 10), 85)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="text-xs text-gray-300 mb-1">
                      {new Date(check.checked_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-sm font-semibold text-white">{check.response_time_ms}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${check.is_up ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-medium ${check.is_up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {check.is_up ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>Older</span>
              <span>Newer</span>
            </div>
          </div>
        )}

        {/* No data message for selected time range */}
        {!loading && filteredChecks.length === 0 && checks.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">No Data Available</h3>
            <p className="text-gray-400">
              No check data found for the selected time range (<span className="font-semibold">{timeRange.toUpperCase()}</span>).
              <br />
              Try selecting a different time period or wait for more data to be collected.
            </p>
          </div>
        )}

        {/* No data at all - brand new monitor */}
        {!loading && checks.length === 0 && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <svg className="absolute inset-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Monitor Starting Up</h3>
            <p className="text-gray-400">
              This monitor may be created just now and has no check data yet.
              <br />
              Or please wait until the data appear here.
            </p>
          </div>
        )}  

        {/* Toggle */}
        {!loading && filteredChecks.length > 0 && (
          <button
            onClick={() => setShowTable(!showTable)}
            className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            {showTable ? "Hide detailed logs" : "View detailed logs"}
          </button>
        )}

        {/* ===== TABLE (DETAIL VIEW) ===== */}
        {showTable && filteredChecks.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left">HTTP</th>
                    <th className="px-4 md:px-6 py-3 text-left">Response</th>
                    <th className="px-4 md:px-6 py-3 text-left">Checked At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map((check, idx) => (
                    <tr
                      key={check.id || idx}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            check.is_up
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {check.is_up ? "UP" : "DOWN"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-200">
                        {check.status_code || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-200">
                        {check.response_time_ms != null ? `${check.response_time_ms} ms` : "—"}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-400">
                        {check.checked_at ? new Date(check.checked_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}