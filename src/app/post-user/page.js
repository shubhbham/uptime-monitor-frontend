"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Zap
} from "lucide-react";

export default function CreateMonitorPage() {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(1); // Quick redirect

  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "GET",
    expected_status: 200,
    interval_seconds: 60,
    timeout_seconds: 10,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Redirect logic
  useEffect(() => {
    if (status !== "success" && status !== "error") return;

    // Only redirect automatically on success or if we want to force it
    // For success, we show the success state briefly then push
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/monitors");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const createMonitor = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isSignedIn) throw new Error("Please sign in");

      const token = await getToken();
      if (!token) throw new Error("Unable to get auth token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            expected_status: Number(form.expected_status),
            interval_seconds: Number(form.interval_seconds),
            timeout_seconds: Number(form.timeout_seconds),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create monitor");
      }

      setStatus("success");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setStatus("idle"); // Reset to idle so user can try again
      // We don't auto-redirect on error anymore, we show the error in the form
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-medium">
        Authentication required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white px-4 pt-16 pb-16 selection:bg-indigo-500/30">
      <div className="mx-auto max-w-3xl">

        {/* Header & Back Link */}
        <div className="mb-12 flex flex-col items-start gap-4">
          <Link
            href="/monitors"
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Monitors
          </Link>

          <div className="px-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
              New Monitor
            </h1>
            <p className="mt-2 text-lg text-gray-400 max-w-xl">
              Configure a new health check for your website or API. We&apos;ll alert you the moment it goes down.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="relative rounded-3xl border border-white/10 bg-gray-900/50 backdrop-blur-xl shadow-2xl p-8 md:p-10 overflow-hidden">

          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-8">

            {/* Basic Info Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Activity size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Target Details</h3>
              </div>

              <div className="grid gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Friendly Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Landing Page Production"
                    className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-black/30"
                  />
                </div>

                {/* URL & Method Group */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Endpoint URL</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                        <Globe size={18} />
                      </div>
                      <input
                        name="url"
                        value={form.url}
                        onChange={handleChange}
                        placeholder="https://api.example.com"
                        className="w-full rounded-xl bg-black/20 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-black/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Method</label>
                    <div className="relative">
                      <select
                        name="method"
                        value={form.method}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-black/30 cursor-pointer"
                      >
                        <option>GET</option>
                        <option>HEAD</option>
                        <option>POST</option>
                        <option>PUT</option>
                      </select>
                      <div className="absolute right-3 top-3.5 text-gray-500 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Group */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Health Check Rules</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Interval */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1.5">
                    Interval <span className="text-gray-600">(sec)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-3.5 text-gray-500 transition-colors">
                      <Clock size={16} />
                    </div>
                    <input
                      type="number"
                      name="interval_seconds"
                      value={form.interval_seconds}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-black/20 border border-white/10 pl-11 pr-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all hover:bg-black/30"
                    />
                  </div>
                </div>

                {/* Timeout */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1.5">
                    Timeout <span className="text-gray-600">(sec)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="timeout_seconds"
                      value={form.timeout_seconds}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all hover:bg-black/30"
                    />
                  </div>
                </div>

                {/* Expected Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1 flex items-center gap-1.5">
                    Success Code
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-500">
                      <CheckCircle2 size={16} />
                    </div>
                    <input
                      type="number"
                      name="expected_status"
                      value={form.expected_status}
                      onChange={handleChange}
                      placeholder="200"
                      className="w-full rounded-xl bg-black/20 border border-white/10 pl-11 pr-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all hover:bg-black/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-red-200">{error}</div>
                </div>
              )}

              <button
                onClick={createMonitor}
                disabled={loading || status === "success"}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none"
              >
                <div className="relative flex items-center justify-center gap-2 rounded-xl bg-gray-900/50 backdrop-blur-sm px-8 py-4 transition-all group-hover:bg-transparent">
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      <span className="font-semibold text-white">Creating Monitor...</span>
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 className="text-white" size={20} />
                      <span className="font-semibold text-white">Monitor Created!</span>
                    </>
                  ) : (
                    <span className="font-semibold text-white">Create Monitor</span>
                  )}
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Success Overlay Animation (Optional - keeping generic success state for redirect instead) */}
    </div>
  );
}
