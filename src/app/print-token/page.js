"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function CreateApiKeyPage() {
  const { getToken, isSignedIn } = useAuth();

  const [name, setName] = useState("B2B API Key");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  const createApiKey = async () => {
    setLoading(true);
    setError(null);
    setApiKey(null);

    try {
      const token = await getToken({ template: "golang" });
      if (!token) {
        throw new Error("Unable to get Clerk token");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/api-keys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            scopes: [
              "monitors:read",
              "monitors:write",
              "incidents:read",
              "stats:read",
            ],
            rate_limit_per_hour: 5000,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create API key");
      }

      const data = await res.json();
      setApiKey(data.api_key.raw_key);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-6 text-center text-red-500">
        Please sign in to create an API key.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white">Create API Key</h1>

          <p className="mt-2 text-sm text-gray-400">
            Generate a secure API key for{" "}
            <span className="font-medium text-gray-200">
              B2B & server access
            </span>
            . This key will be shown only once.
          </p>

          {/* Input */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Production Backend"
            />
          </div>

          {/* Button */}
          <button
            onClick={createApiKey}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating API Key…" : "Create API Key"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* API Key Result */}
          {apiKey && (
            <div className="mt-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4">
              <p className="mb-2 text-sm font-semibold text-yellow-300">
                ⚠️ Save this API key now
              </p>

              <p className="mb-3 text-xs text-yellow-200/80">
                You won’t be able to see it again.
              </p>

              <code className="block w-full break-all rounded-lg bg-black/60 p-3 text-sm text-yellow-200 border border-yellow-400/20">
                {apiKey}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
