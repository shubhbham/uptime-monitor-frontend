"use client";

import { useEffect, useState } from "react";

export default function ResponseTimeline({ loading, filteredChecks, hoveredPoint, setHoveredPoint, maxResponse }) {
    if (loading || filteredChecks.length === 0) return null;

    return (
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
                            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.1" />
                        </linearGradient>

                        {/* Gradient for uptime line */}
                        <linearGradient id="uptimeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.05" />
                        </linearGradient>

                        {/* Glow filters */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
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
                    <line x1="50" y1="250" x2="990" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

                    {/* Y-axis */}
                    <line x1="50" y1="10" x2="50" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

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
    );
}
