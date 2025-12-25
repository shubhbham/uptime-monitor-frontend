"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    loading
}) {
    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                onClick={onPrevious}
                disabled={!hasPrevious || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </button>

            <span className="text-sm text-gray-500 font-medium">
                {loading ? "Loading..." : "Page View"}
            </span>

            <button
                onClick={onNext}
                disabled={!hasNext || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
