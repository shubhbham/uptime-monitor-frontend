'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

// Optimized Truncation Component with Tooltip
const TruncatedText = ({ text, limit = 10, className = "" }) => {
  if (!text) return null;

  // If text fits, just render it
  if (text.length <= limit) {
    return <span className={className}>{text}</span>;
  }

  const truncated = text.slice(0, limit) + "...";

  return (
    <div className="relative group inline-flex items-center">
      <span className={`cursor-help decoration-dotted underline-offset-4 ${className}`}>
        {truncated}
      </span>

      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
        <div className="relative bg-gray-900/95 backdrop-blur-md border border-white/10 text-white text-xs px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap">
          {text}
          {/* Arrow */}
          <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900/95"></div>
        </div>
      </div>
    </div>
  );
};

export default function MonitorListPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  const [monitors, setMonitors] = useState([]) // ALWAYS array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ===============================
  // FETCH MONITORS (SAFE)
  // ===============================
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    let aborted = false

    const fetchMonitors = async () => {
      try {
        setLoading(true)
        setError(null)

        let token = await getToken()

        // Clerk hydration retry
        if (!token) {
          await new Promise((r) => setTimeout(r, 300))
          token = await getToken()
        }

        if (!token) throw new Error('Authentication not ready')

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load monitors')
        }

        const data = await res.json()

        // ✅ NORMALIZE DATA (critical fix)
        const safeData = Array.isArray(data) ? data : []

        if (!aborted) setMonitors(safeData)
      } catch (err) {
        if (!aborted) {
          setMonitors([]) // ✅ NEVER leave it null
          setError(err.message || 'Unable to fetch monitors')
        }
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    fetchMonitors()

    return () => {
      aborted = true
    }
  }, [isLoaded, isSignedIn, getToken])

  // ===============================
  // DELETE MONITOR (SAFE)
  // ===============================
  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)

      const token = await getToken()
      if (!token) throw new Error('Authentication not ready')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error('Failed to delete monitor')

      setMonitors((prev) =>
        Array.isArray(prev)
          ? prev.filter((m) => m.id !== deleteTarget.id)
          : []
      )

      setDeleteTarget(null)
    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  // ===============================
  // AUTH LOADING
  // ===============================
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Initializing session…
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Please sign in to view monitors.
      </div>
    )
  }

  const hasMonitors = Array.isArray(monitors) && monitors.length > 0

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Monitors
            </h1>

            <Link
              href="/post-user"
              className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
            >
              + Create Monitor
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-gray-400 text-sm">Loading monitors...</p>
            </div>
          )}

          {!loading && !hasMonitors && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="text-gray-500 mb-2">No monitors found</div>
              <p className="text-sm text-gray-600">Create your first monitor to get started</p>
            </div>
          )}

          {!loading && hasMonitors && (
            <div className="grid grid-cols-1 gap-4">
              {monitors.map((monitor) => (
                <Link
                  key={monitor.id}
                  href={`/monitors/${monitor.id}/checks`}
                  className="group relative block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 transition-all hover:border-indigo-500/50 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Monitor Info */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Name & Status */}
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-white">
                          <TruncatedText text={monitor.name} limit={20} className="text-white" />
                        </h2>

                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </div>

                      {/* URL / Domain */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-mono text-xs uppercase bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                          {monitor.method}
                        </span>
                        <span className="text-gray-500">•</span>
                        {/* STRICT 10 CHAR LIMIT as requested by user */}
                        <TruncatedText text={monitor.url} limit={10} className="text-gray-300 font-medium hover:text-white transition-colors" />
                      </div>
                    </div>

                    {/* Meta Stats & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 mt-2 md:mt-0">

                      <div className="grid grid-cols-3 gap-6 text-xs">
                        <div className="text-center md:text-left">
                          <p className="text-gray-500 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Interval</p>
                          <p className="text-gray-300 font-mono">{monitor.interval_seconds}s</p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-gray-500 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Timeout</p>
                          <p className="text-gray-300 font-mono">{monitor.timeout_seconds}s</p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-gray-500 mb-0.5 uppercase tracking-wider font-semibold text-[10px]">Exp.</p>
                          <p className="text-green-400 font-mono">{monitor.expected_status}</p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="h-8 w-px bg-white/10 hidden md:block" />

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteTarget(monitor)
                        }}
                        className="group/delete shrink-0 relative flex items-center justify-center w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                        title="Delete Monitor"
                      >
                        <Trash2 size={18} className="transition-transform group-hover/delete:scale-110" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-gray-900/90 backdrop-blur-xl p-6 text-white shadow-2xl ring-1 ring-red-500/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Trash2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Monitor?</h2>
            </div>

            <div className="text-sm text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded"><TruncatedText text={deleteTarget.name} limit={10} /></span>?
              <br />This action cannot be undone and all historical data will be lost.
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 hover:text-white text-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Monitor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
