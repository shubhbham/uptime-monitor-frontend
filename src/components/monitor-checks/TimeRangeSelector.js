"use client";

export default function TimeRangeSelector({
  timeRange,
  setTimeRange,
  liveTail,
  setLiveTail,
}) {
  const ranges = [
    { label: "15M", value: "15m" },
    { label: "1H", value: "1h" },
    { label: "6H", value: "6h" },
    { label: "24H", value: "24h" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
  ];

  const handleRangeChange = (value) => {
    setTimeRange(value);
    setLiveTail(false); // Disable live tail when changing range
  };

  const handleLiveTailToggle = () => {
    const newState = !liveTail;
    setLiveTail(newState);
    if (newState) {
      // If enabling live tail, we might want to reset range to recent?
      // Usually, live tail works with any range, just appending new data.
      // But often implies "Show me now". 
    }
  };

  return (
    <div className="mb-6 flex flex-col xl:flex-row items-start xl:items-center gap-4 justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">

      {/* Time Ranges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Range</span>
        {ranges.map((option) => (
          <button
            key={option.value}
            onClick={() => handleRangeChange(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${timeRange === option.value
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">

        {/* Live Tail Button */}
        <button
          onClick={handleLiveTailToggle}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ml-auto sm:ml-0 ${liveTail
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
        >
          <div className={`w-2 h-2 rounded-full ${liveTail ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`} />
          {liveTail ? "Live Tail ON" : "Live Tail OFF"}
        </button>
      </div>
    </div>
  );
}
