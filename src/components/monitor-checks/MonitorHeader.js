"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MonitorHeader() {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Monitor Health</h1>

      <Link
        href="/monitors"
        className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Monitors
      </Link>
    </div>
  );
}
