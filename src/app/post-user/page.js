"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateMonitorPage() {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

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

  // Redirect countdown on error
  useEffect(() => {
    if (status !== "error") return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/monitors");
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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

      // Redirect after animation
      setTimeout(() => {
        router.push("/monitors");
      }, 1800);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Please sign in to create a monitor.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-16 relative overflow-hidden">
      {/* BACK LINK */}
      {/* <Link
        href="/monitors"
        className="text-sm text-indigo-400 hover:text-indigo-300 transition"
      >
        ← Back to Monitors
      </Link> */}
      <div className="flex justify-end mr-18 mb-10">
        <Link
          href="/monitors"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          ← Back to Monitors
        </Link>
      </div>

      <div className="mx-auto max-w-2xl relative z-10">
        {/* FORM */}
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 transition-all duration-700
          ${
            status !== "idle"
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }
        `}
        >
          <h1 className="text-3xl font-bold text-white">Create Monitor</h1>

          <p className="mt-2 text-sm text-gray-400">
            Monitor an endpoint for uptime, latency, and failures.
          </p>

          {/* Inputs */}
          <div className="mt-8 space-y-6">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Monitor name"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
            />

            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
            >
              <option>GET</option>
              <option>HEAD</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="number"
                name="expected_status"
                value={form.expected_status}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              />
              <input
                type="number"
                name="interval_seconds"
                value={form.interval_seconds}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              />
              <input
                type="number"
                name="timeout_seconds"
                value={form.timeout_seconds}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              />
            </div>
          </div>

          <button
            onClick={createMonitor}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Monitor"}
          </button>
        </div>

        {/* SUCCESS OVERLAY */}
        {status === "success" && (
          <div className="absolute inset-0 flex items-center justify-center animate-[pop_0.6s_cubic-bezier(.2,1,.3,1)]">
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-xl p-8 text-center shadow-2xl">
              <h2 className="text-2xl font-semibold text-green-400 mb-2">
                Monitor Created
              </h2>
              <p className="text-gray-300 animate-pulse">
                Redirecting to monitors…
              </p>
            </div>
          </div>
        )}

        {/* ERROR OVERLAY */}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center animate-[shake_0.6s]">
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl p-8 text-center shadow-2xl">
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Creation Failed
              </h2>
              <p className="text-gray-300 mb-2">{error}</p>
              <p className="text-sm text-gray-400">
                Redirecting in {countdown}s…
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ANIMATION KEYFRAMES */}
      <style jsx>{`
        @keyframes pop {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-6px);
          }
          50% {
            transform: translateX(6px);
          }
          75% {
            transform: translateX(-3px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
