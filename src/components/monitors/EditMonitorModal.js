"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

export default function EditMonitorModal({ monitor, onClose, onSave, isUpdating }) {
    // Initialize state from props once on mount. 
    // The parent MUST use a unique 'key' to force re-mount when monitor changes.
    const [formData, setFormData] = useState({
        interval_seconds: monitor?.interval_seconds || 60,
        is_active: monitor?.is_active ?? true,
    });

    if (!monitor) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...monitor, ...formData });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/90 backdrop-blur-xl p-6 text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Pencil size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Edit Monitor</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            Interval (Seconds)
                        </label>
                        <input
                            type="number"
                            value={formData.interval_seconds}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    interval_seconds: parseInt(e.target.value) || 60,
                                })
                            }
                            className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="e.g. 60"
                            min="30"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Active Status</span>
                            <span className="text-xs text-gray-400">
                                Pause or resume monitoring
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setFormData({ ...formData, is_active: !formData.is_active })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${formData.is_active ? "bg-indigo-500" : "bg-gray-700"
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 hover:text-white text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:opacity-90 disabled:opacity-60 transition-all"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
