"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

export default function EditMonitorModal({ monitor, onClose, onSave, isUpdating }) {
    // Initialize state from props
    const [formData, setFormData] = useState({
        name: monitor?.name || "",
        url: monitor?.url || "",
        method: monitor?.method || "GET",
        expected_status: monitor?.expected_status || 200,
        interval_seconds: monitor?.interval_seconds || 60,
        timeout_seconds: monitor?.timeout_seconds || 30,
        is_active: monitor?.is_active ?? true,
        notify: monitor?.notify ?? false,
    });

    if (!monitor) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...monitor, ...formData });
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNumberChange = (field, value) => {
        // Allow empty string for better typing experience
        if (value === "") {
            setFormData(prev => ({ ...prev, [field]: "" }));
            return;
        }
        const num = parseInt(value);
        if (!isNaN(num)) {
            setFormData(prev => ({ ...prev, [field]: num }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-800 bg-[#0A0A0A] shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                            <Pencil size={14} />
                        </div>
                        <h2 className="text-base font-semibold text-white">Edit Monitor</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    
                    {/* Scrollable Content */}
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Basic Info
                            </label>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-200">
                                        Monitor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        placeholder="My Monitor"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-200">
                                        URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => handleChange("url", e.target.value)}
                                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Request Settings */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                TCP / HTTP Details
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-200">
                                        Method
                                    </label>
                                    <select
                                        value={formData.method}
                                        onChange={(e) => handleChange("method", e.target.value)}
                                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-3 py-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                    >
                                        {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-200">
                                        Expected Status
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.expected_status}
                                        onChange={(e) => handleNumberChange("expected_status", e.target.value)}
                                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        placeholder="200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Timing & Configuration
                            </label>
                            
                            <div className="space-y-3">
                                {/* Check Interval */}
                                <div className="group rounded-lg border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-200">
                                            Check Interval
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={formData.interval_seconds}
                                                onChange={(e) => handleNumberChange("interval_seconds", e.target.value)}
                                                className="w-24 rounded-md bg-black border border-gray-800 px-2 py-1 text-right text-sm text-white focus:border-white/20 focus:outline-none focus:ring-0"
                                                min="30"
                                            />
                                            <span className="text-xs text-gray-500">sec</span>
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        How often we check your endpoint.
                                    </p>
                                </div>

                                {/* Timeout */}
                                <div className="group rounded-lg border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-200">
                                            Request Timeout
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={formData.timeout_seconds}
                                                onChange={(e) => handleNumberChange("timeout_seconds", e.target.value)}
                                                className="w-24 rounded-md bg-black border border-gray-800 px-2 py-1 text-right text-sm text-white focus:border-white/20 focus:outline-none focus:ring-0"
                                                min="1"
                                            />
                                            <span className="text-xs text-gray-500">sec</span>
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Max time to wait for a response.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notifications & Status */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Status & Alerts
                            </label>

                            <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900/40">

                                {/* Notify Toggle */}
                                <div className="flex items-center justify-between p-3.5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-gray-200">Email Notifications</div>
                                        <div className="text-xs text-gray-500">Receive alerts when down</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(f => ({ ...f, notify: !f.notify }))}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.notify ? 'bg-green-500' : 'bg-gray-700'
                                            }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${formData.notify ? 'translate-x-4' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>

                                {/* Active Status Toggle */}
                                <div className="flex items-center justify-between p-3.5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium text-gray-200">Monitor Status</div>
                                        <div className="text-xs text-gray-500">Enable or disable checking</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(f => ({ ...f, is_active: !f.is_active }))}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_active ? 'bg-green-500' : 'bg-gray-700'
                                            }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_active ? 'translate-x-4' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800 bg-[#0A0A0A] shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                    <span>Saving...</span>
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
