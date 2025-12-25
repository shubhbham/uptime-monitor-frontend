"use client";

export default function ChecksTable({ checks, showTable, setShowTable }) {
    if (!checks || checks.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setShowTable(!showTable)}
                className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
                {showTable ? "Hide detailed logs" : "View detailed logs"}
            </button>

            {showTable && (
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
                                {checks.map((check, idx) => (
                                    <tr
                                        key={check.id || idx}
                                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 md:px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${check.is_up
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
        </>
    );
}
