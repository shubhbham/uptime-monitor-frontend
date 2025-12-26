// "use client";

// import { useEffect, useState } from "react";

export default function ResponseTimeline({ loading, filteredChecks, hoveredPoint, setHoveredPoint, maxResponse }) {
    if (loading || filteredChecks.length === 0) return null;

    return (
        <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-4 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base md:text-lg font-semibold text-white/90">
                    Response Timeline
                </h2>

                {/* Subtler Legend */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full ring-2 ring-indigo-500/50 bg-indigo-500"></div>
                        <span>Response Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full ring-2 ring-emerald-500/50 bg-emerald-500"></div>
                        <span className="text-emerald-500/80">Uptime</span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 1000 300"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <defs>
                        {/* Smooth Gradient for Response Time */}
                        <linearGradient id="responseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Dashed Pattern for Grip (Optional, using lines directly instead) */}
                    </defs>

                    {/* Subtle Grid Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={i}
                            x1="50"
                            y1={i * 60 + 10}
                            x2="990"
                            y2={i * 60 + 10}
                            stroke="#ffffff"
                            strokeOpacity="0.03"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Y-axis Labels (Clean, Small) */}
                    <g className="text-[10px] font-medium fill-gray-500 select-none">
                        {[0, 1, 2, 3, 4].map((i) => {
                            const value = Math.round((maxResponse / 4) * (4 - i));
                            return (
                                <text key={i} x="10" y={i * 60 + 14}>
                                    {value}ms
                                </text>
                            );
                        })}
                    </g>

                    {/* DATA RENDERING */}
                    {(() => {
                        const points = [...filteredChecks].reverse();
                        const step = 940 / Math.max(points.length - 1, 1);

                        // Response Time Path
                        const responsePathString = points
                            .map((check, i) => {
                                const x = 50 + (i * step);
                                const y = 240 - ((check.response_time_ms / maxResponse) * 230);
                                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                            })
                            .join(' ');
                        const responseAreaString = responsePathString + ` L ${50 + ((points.length - 1) * step)},250 L 50,250 Z`;

                        // Uptime Line Path (Simplified visuals)
                        const uptimePathString = points
                            .map((check, i) => {
                                const x = 50 + (i * step);
                                const y = check.is_up ? 245 : 245; // Just show a flat line at bottom for up? Or visualize drops?
                                // User logic was: is_up ? 40 : 120. That was plotting status as a line.
                                // Let's keep specific logic but cleaner:
                                // If up, line is at bottom (or top). If down, it spikes? 
                                // Actually, let's keep the user's apparent intent of a second line for status.
                                // But "uptime" usually implies a bar or availability. 
                                // Previous code: check.is_up ? 40 : 120. (Higher is Up/40, Lower is Down/120).
                                // Let's make it more standard: 
                                // Up = 20 (Top), Down = 250 (Bottom)? 
                                // Or stick to purely response time as the main hero, and highlight drops differently.
                                // Preserving logic:
                                const logicY = check.is_up ? 20 : 250; // Just discrete states
                                // Actually, the user's previous logic was numeric y-values. Let's retain the 'shape' but make it cleaner.
                                // Let's disable the 'uptime line' visual noise unless it's a downtime event.
                                return `${i === 0 ? 'M' : 'L'} ${x},${logicY}`;
                            })
                            .join(' ');

                        return (
                            <>
                                {/* AREA FILL (Response Time) */}
                                <path
                                    d={responseAreaString}
                                    fill="url(#responseGradient)"
                                    className="transition-all duration-300"
                                />

                                {/* MAIN LINE (Response Time) - Thin, Crisp, Indigo */}
                                <path
                                    d={responsePathString}
                                    fill="none"
                                    stroke="#818cf8" // Indigo-400
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                />

                                {/* HOVER INTERACTION OVERLAY */}
                                {points.map((check, i) => {
                                    const rectX = 50 + (i * step) - (step / 2);
                                    return (
                                        <rect
                                            key={check.id}
                                            x={rectX}
                                            y={0}
                                            width={Math.max(step, 2)}
                                            height={300}
                                            fill="transparent"
                                            className="cursor-crosshair hover:bg-white/[0.03] transition-colors"
                                            onMouseEnter={() => setHoveredPoint(i)}
                                            onMouseMove={() => setHoveredPoint(i)}
                                        />
                                    );
                                })}

                                {/* HOVER INDICATOR (Vertical Line & Dot) */}
                                {hoveredPoint !== null && (
                                    (() => {
                                        const x = 50 + (hoveredPoint * step);
                                        const check = points[hoveredPoint];
                                        const y = 240 - ((check.response_time_ms / maxResponse) * 230);
                                        return (
                                            <g pointerEvents="none">
                                                {/* Vertical Guide */}
                                                <line
                                                    x1={x} y1="10" x2={x} y2="250"
                                                    stroke="#a5b4fc"
                                                    strokeWidth="1"
                                                    strokeDasharray="3 3"
                                                    opacity="0.5"
                                                />
                                                {/* Active Dot */}
                                                <circle cx={x} cy={y} r="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                                            </g>
                                        );
                                    })()
                                )}
                            </>
                        );
                    })()}

                    {/* AXES - Minimalist */}
                    <line x1="50" y1="250" x2="990" y2="250" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
                    <line x1="50" y1="10" x2="50" y2="250" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />

                </svg>

                {/* PREMIUM GLASS TOOLTIP */}
                {hoveredPoint !== null && (() => {
                    const points = [...filteredChecks].reverse();
                    const check = points[hoveredPoint];
                    const step = 940 / Math.max(points.length - 1, 1);
                    const x = 50 + (hoveredPoint * step);

                    // Calculation to keep tooltip inside bounds
                    const leftPos = (x / 1000) * 100;

                    return (
                        <div
                            className="absolute z-50 flex flex-col gap-1 rounded-lg border border-white/10 bg-gray-900/90 p-3 shadow-xl backdrop-blur-md"
                            style={{
                                left: `${leftPos}%`,
                                top: '10%',
                                transform: `translateX(${leftPos > 50 ? '-105%' : '5%'})`, // Smart positioning
                            }}
                        >
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                {new Date(check.checked_at).toLocaleTimeString()}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-white tabular-nums">
                                    {check.response_time_ms}
                                    <span className="text-xs font-normal text-gray-500 ml-0.5">ms</span>
                                </span>
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${check.is_up
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                                    }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${check.is_up ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {check.is_up ? 'UP' : 'DOWN'}
                                </span>
                            </div>
                        </div>
                    );
                })()}

            </div>

            <div className="mt-4 flex justify-between text-xs font-medium text-gray-500 px-2">
                <span>{new Date(filteredChecks[filteredChecks.length - 1]?.checked_at).toLocaleTimeString()}</span>
                <span>{new Date(filteredChecks[0]?.checked_at).toLocaleTimeString()}</span>
            </div>
        </div>
    );
}
