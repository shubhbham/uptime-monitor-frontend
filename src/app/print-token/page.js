"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Copy, Trash2, Check, Key, ShieldCheck, Plus, Power, Activity, Clock, BarChart3, Lock, Info } from "lucide-react";
import DeleteApiKeyModal from "@/components/api-keys/DeleteApiKeyModal";

export default function ApiKeysPage() {
  const { getToken, isSignedIn } = useAuth();

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // For creating new key
  const [keyName, setKeyName] = useState("");

  const fetchKeys = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api-keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch keys");
      const data = await res.json();
      setKeys(data.api_keys || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn) fetchKeys();
  }, [isSignedIn, fetchKeys]);

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    setCreating(true);
    setError(null);
    setNewKey(null);

    try {
      const token = await getToken({ template: "golang" });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api-keys`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: keyName, scopes: ["monitors:read", "monitors:write", "incidents:read", "stats:read"] })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create key");
      }

      const data = await res.json();
      setNewKey(data.api_key.raw_key);
      setKeyName("");
      fetchKeys(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Open the modal
  const openDeleteModal = (key) => {
    setDeleteTarget(key);
  };

  // Actual Delete Logic called by Modal
  const confirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeys(keys.filter(k => k.id !== id));
      setDeleteTarget(null); // Close modal
    } catch (err) {
      alert("Failed to delete key");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api-keys/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (res.ok) {
        setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSignedIn) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Please sign in.</div>;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white pt-16 pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-6xl space-y-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                API Keys
              </h1>
              <p className="mt-2 text-gray-300 max-w-lg text-sm">
                Manage authentication tokens for programmatic access.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5 backdrop-blur-sm w-full md:w-auto hover:border-white/20 transition-colors">
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Token Name (e.g. CI/CD)"
                className="bg-transparent border-none px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none w-full md:w-48"
              />
              <button
                onClick={handleCreateKey}
                disabled={creating || !keyName}
                className="bg-white text-black hover:bg-gray-200 text-sm font-semibold px-4 py-1.5 rounded-md transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-lg shadow-white/5"
              >
                {creating ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus size={14} />}
                Create Token
              </button>
            </div>
            {error && <p className="text-red-400 text-xs absolute right-8 top-32">{error}</p>}
          </div>

          {/* New Key Alert */}
          {newKey && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
                    <Check size={18} className="text-emerald-400" />
                    Token Generated
                  </h3>
                  <p className="text-emerald-200/60 text-sm mt-1">Copy this token now. It will not be shown again.</p>
                </div>

                <div className="flex items-center gap-2">
                  <code className="block flex-1 rounded-lg bg-black/40 border border-emerald-500/20 p-3 font-mono text-sm text-emerald-300 break-all shadow-inner">
                    {newKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newKey)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm border border-emerald-500/10"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Keys Table */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <Key className="text-gray-500 mb-4" size={32} />
                <p className="text-gray-400">No active tokens found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {keys.map((key) => {
                  // Parse scopes if needed
                  let scopesList = [];
                  try {
                    scopesList = Array.isArray(key.scopes) ? key.scopes : JSON.parse(key.scopes || "[]");
                  } catch (e) { scopesList = []; }

                  return (
                    <div key={key.id} className="group relative bg-black/20 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all hover:bg-white/[0.02]">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                        {/* Left: Identity */}
                        <div className="flex items-start gap-4 min-w-[300px]">
                          <div className={`mt-1 h-3 w-3 rounded-full shadow-[0_0_8px_current] ${key.is_active ? 'text-emerald-500 bg-emerald-500' : 'text-red-500 bg-red-500'}`} />
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white text-lg tracking-tight">{key.name}</h3>
                              {!key.is_active && <span className="text-[10px] uppercase bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">Revoked</span>}
                            </div>

                            {/* Trust / Security UI */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="font-mono text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-2 border border-white/5 shadow-sm">
                                <span className="text-gray-500 select-none text-xs uppercase tracking-wider font-bold">Prefix</span>
                                <span className="text-indigo-200">{key.key_prefix}••••••••</span>
                              </div>

                              {/* Trust Badge */}
                              <div className="group/trust relative flex items-center justify-center">
                                <ShieldCheck size={16} className="text-emerald-500/50 hover:text-emerald-400 cursor-help transition-colors" />
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover/trust:block z-50 w-64">
                                  <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-xs text-gray-300 p-3 rounded-xl shadow-2xl">
                                    <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                                      <Lock size={10} className="text-emerald-400" /> Secure Storage
                                    </p>
                                    <p>For your security, we only store the hashed prefix of your API key. The full key is never saved on our servers.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Stats */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Activity size={12} /> Usage
                            </span>
                            <div className="flex items-end gap-1">
                              <span className="text-white font-mono font-medium">{key.total_requests || 0}</span>
                              <span className="text-gray-500 text-xs mb-0.5">reqs</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-indigo-500/50 w-[5%]" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Lock size={12} /> Limit
                            </span>
                            <span className="text-gray-300 font-mono">{(key.rate_limit_per_hour || 0).toLocaleString()}/hr</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock size={12} /> Last Used
                            </span>
                            <span className="text-gray-300 text-xs">
                              {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck size={12} /> Scopes
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {scopesList.slice(0, 2).map(s => (
                                <span key={s} className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-1.5 rounded">{s.split(':')[0]}</span>
                              ))}
                              {scopesList.length > 2 && <span className="text-[10px] text-gray-500">+{scopesList.length - 2}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0 justify-end">
                          <button
                            onClick={() => handleToggleStatus(key.id, key.is_active)}
                            className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-2 ${key.is_active
                                ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                              }`}
                          >
                            <Power size={14} />
                            {key.is_active ? "Revoke" : "Enable"}
                          </button>

                          <div className="h-4 w-px bg-white/10 mx-2" />

                          <button
                            onClick={() => openDeleteModal(key)}
                            className="group/delete p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Key"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteApiKeyModal
        apiKey={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
