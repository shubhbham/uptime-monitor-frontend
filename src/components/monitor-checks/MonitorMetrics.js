"use client";

import { useMemo } from "react";

export default function MonitorMetrics({ loading, filteredChecks, percentileLoading, percentiles, uptimePercentage }) {
  if (loading || filteredChecks.length === 0) return null;

  return (
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
  );
}
