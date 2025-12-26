"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { X, AlertTriangle, Trash2, User, Mail, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsModal({ onClose }) {
    const { getToken, signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);

    // Profile Data
    const [profile, setProfile] = useState(null);

    // Delete State
    const [deleteStep, setDeleteStep] = useState("idle"); // idle, confirming, deleting
    const [deleteInput, setDeleteInput] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // API returns an array, take the first item
                    if (Array.isArray(data) && data.length > 0) {
                        setProfile(data[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [getToken]);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/account`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ confirm: "DELETE" })
            });

            if (!res.ok) throw new Error("Deletion failed");

            await signOut(() => router.push("/"));
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative z-10 w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[450px]">

                {/* Sidebar */}
                <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 flex flex-col gap-2">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Settings</h2>

                    <button
                        onClick={() => setActiveTab("general")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "general" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <User size={18} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab("danger")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "danger" ? "bg-red-500/10 text-red-400 border border-red-500/10" : "text-gray-400 hover:text-red-400 hover:bg-red-500/5"}`}
                    >
                        <AlertTriangle size={18} /> Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-gray-900/50 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {activeTab === "general" ? "Profile Info" : "Danger Zone"}
                        </h2>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-8">

                        {activeTab === "general" && (
                            <div className="space-y-8">
                                {/* Profile Header */}
                                <div className="flex items-start gap-6">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/10">
                                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                            {user?.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-white">{profile?.name?.[0] || "U"}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white">{profile?.name || user?.fullName || "User"}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Mail size={14} />
                                            <span>{profile?.email || user?.primaryEmailAddress?.emailAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                                            <Calendar size={12} />
                                            <span>Joined {formatDate(profile?.created_at || user?.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "danger" && (
                            <div className="space-y-8">
                                {/* Delete */}
                                <div className="rounded-xl border border-red-500/30 p-6 bg-red-500/5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-white text-base mb-1 text-red-400">Delete Account</h3>
                                            <p className="text-sm text-red-200/60 leading-relaxed max-w-md">
                                                Permanently remove your personal account and all associated data. <span className="font-semibold text-red-300">This action is irreversible and cannot be undone.</span>
                                            </p>
                                        </div>
                                        <div className="bg-red-500/10 p-2 rounded-lg">
                                            <Trash2 size={20} className="text-red-400" />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        {deleteStep === "idle" ? (
                                            <button
                                                onClick={() => setDeleteStep("confirming")}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-red-600/20"
                                            >
                                                Delete Personal Account
                                            </button>
                                        ) : (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="p-3 bg-red-950/50 border border-red-500/20 rounded-lg">
                                                    <label className="text-xs font-semibold text-red-300 uppercase tracking-wide block mb-2">
                                                        Type <span className="select-all text-white bg-red-500/20 px-1.5 py-0.5 rounded ml-1">DELETE</span> to confirm
                                                    </label>
                                                    <input
                                                        value={deleteInput}
                                                        onChange={(e) => setDeleteInput(e.target.value)}
                                                        placeholder="DELETE"
                                                        className="w-full bg-black/40 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder-red-900/50"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleDelete}
                                                        disabled={loading || deleteInput !== "DELETE"}
                                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-red-600/20"
                                                    >
                                                        {loading ? "Deleting..." : "Confirm Delete"}
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteStep("idle"); setDeleteInput(""); }}
                                                        className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
