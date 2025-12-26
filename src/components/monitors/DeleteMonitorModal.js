"use client";

import { Trash2 } from "lucide-react";

// Inline TruncatedText since it's simple and avoids dependency issues for now, 
// or I can assume the common one will be available. 
// I'll make a local helper for the modal to be self-contained or use the common one later.
const ModalTruncatedText = ({ text }) => {
    if (!text) return null;
    return text.length > 20 ? text.slice(0, 20) + "..." : text;
};

export default function DeleteMonitorModal({ monitor, onClose, onDelete, isDeleting }) {
    if (!monitor) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-gray-900/90 backdrop-blur-xl p-6 text-white shadow-2xl ring-1 ring-red-500/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Trash2 size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Delete Monitor?</h2>
                </div>

                <div className="text-sm text-gray-300 mb-6 leading-relaxed">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded">
                        <ModalTruncatedText text={monitor.name} />
                    </span>
                    ?
                    <br />
                    This action cannot be undone and all historical data will be lost.
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 hover:text-white text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onDelete(monitor)}
                        disabled={isDeleting}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:opacity-90 disabled:opacity-60 transition-all"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Monitor"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
