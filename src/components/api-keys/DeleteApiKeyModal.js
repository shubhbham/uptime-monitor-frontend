"use client";

import { Trash2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function DeleteApiKeyModal({ apiKey, onClose, onDelete, isDeleting }) {
    const [confirmName, setConfirmName] = useState("");

    if (!apiKey) return null;

    // For safety, require typing "delete" to confirm
    const isConfirmed = confirmName.toLowerCase() === "delete";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-gray-900 shadow-2xl animate-in zoom-in-95 duration-200 p-0 ring-1 ring-white/10">

                {/* Header */}
                <div className="border-b border-white/5 bg-red-500/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-400">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                            <AlertTriangle size={16} />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Revoke API Key</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        Are you sure you want to permanently delete the API key{" "}
                        <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {apiKey.name}
                        </span>
                        ?
                    </p>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200 mb-6">
                        <strong className="block text-red-50 mb-1">Warning: This action is irreversible.</strong>
                        All applications and scripts using this key will immediately lose access to the API.
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type <span className="text-white select-all">delete</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="delete"
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 bg-white/[0.02] px-6 py-4 border-t border-white/5">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onDelete(apiKey.id)}
                        disabled={!isConfirmed || isDeleting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20"
                    >
                        {isDeleting ? (
                            <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                                Revoking...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Revoke Key
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
