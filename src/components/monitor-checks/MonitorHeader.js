"use client";

import Link from "next/link";

export default function MonitorHeader() {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Monitor Health</h1>

      <Link
        href="/monitors"
        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        ← Back to Monitors
      </Link>
    </div>
  );
}
