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
    notify: true,
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
            notify: form.notify,
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
    <div className="min-h-screen bg-black text-white px-4 pt-12 pb-12 selection:bg-white/20 font-sans">
      <div className="mx-auto max-w-xl">

        {/* Header & Back Link */}
        <div className="mb-8">
          <Link
            href="/monitors"
            className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Monitors
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Create New Monitor
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Set up a health check for your endpoint.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-6 shadow-sm">

          <div className="space-y-6">

            {/* Target Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                <Activity size={16} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-200">Target</h3>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Friendly Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. API Production"
                  className="w-full rounded-md bg-black border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:ring-0 transition-colors"
                />
              </div>

              {/* URL & Method Group */}
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">URL</label>
                  <div className="relative">
                    <input
                      name="url"
                      value={form.url}
                      onChange={handleChange}
                      placeholder="https://api.example.com"
                      className="w-full rounded-md bg-black border border-gray-800 pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:ring-0 transition-colors"
                    />
                    <div className="absolute left-2.5 top-2.5 text-gray-600">
                      <Globe size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Method</label>
                  <div className="relative">
                    <select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-md bg-black border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 focus:ring-0 transition-colors cursor-pointer"
                    >
                      <option>GET</option>
                      <option>HEAD</option>
                      <option>POST</option>
                      <option>PUT</option>
                    </select>
                    <div className="absolute right-2.5 top-2.5 text-gray-600 pointer-events-none">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Group */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                <Zap size={16} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-200">Configuration</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Interval */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Interval (s)</label>
                  <input
                    type="number"
                    name="interval_seconds"
                    value={form.interval_seconds}
                    onChange={handleChange}
                    className="w-full rounded-md bg-black border border-gray-800 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/40 focus:ring-0 transition-colors"
                  />
                </div>

                {/* Timeout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Timeout (s)</label>
                  <input
                    type="number"
                    name="timeout_seconds"
                    value={form.timeout_seconds}
                    onChange={handleChange}
                    className="w-full rounded-md bg-black border border-gray-800 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/40 focus:ring-0 transition-colors"
                  />
                </div>

                {/* Expected Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Status Code</label>
                  <input
                    type="number"
                    name="expected_status"
                    value={form.expected_status}
                    onChange={handleChange}
                    placeholder="200"
                    className="w-full rounded-md bg-black border border-gray-800 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/40 focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Config */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${form.notify ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Email Notifications</h3>
                    <p className="text-xs text-gray-500">Receive alerts when this monitor goes down.</p>
                  </div>
                </div>

                {/* Custom Toggle */}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, notify: !f.notify }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.notify ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${form.notify ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>


            {/* Footer Actions */}
            <div className="pt-4">
              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-900/50 flex items-start gap-2">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={14} />
                  <div className="text-xs text-red-300">{error}</div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href="/monitors"
                  className="flex-1 py-2.5 text-center text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md border border-transparent transition-all"
                >
                  Cancel
                </Link>
                <button
                  onClick={createMonitor}
                  disabled={loading || status === "success"}
                  className="flex-[2] py-2.5 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      <span>Creating...</span>
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Created</span>
                    </>
                  ) : (
                    "Create Monitor"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
