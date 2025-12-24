'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              Monitors
            </h1>

            <Link
              href="/post-user"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Create Monitor
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-400">
              Loading monitors…
            </div>
          )}

          {!loading && !hasMonitors && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
              No monitors created yet.
            </div>
          )}

          {!loading && hasMonitors && (
            <div className="space-y-4">
              {monitors.map((monitor) => (
                <Link
                  key={monitor.id}
                  href={`/monitors/${monitor.id}/checks`}
                  className="relative block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 transition hover:border-indigo-400 hover:bg-white/10"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-white truncate">
                          {monitor.name}
                        </h2>

                        <span className="rounded-full px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                          Active
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-400 break-all">
                        {monitor.method} • {monitor.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                        <div>
                          <p className="text-gray-500">Interval</p>
                          <p>{monitor.interval_seconds}s</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Timeout</p>
                          <p>{monitor.timeout_seconds}s</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expected</p>
                          <p>{monitor.expected_status}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteTarget(monitor)
                        }}
                        className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.6)] transition"
                      >
                        🗑
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-black/60 backdrop-blur-xl p-6 text-white shadow-2xl">
            <h2 className="text-xl font-semibold mb-2">
              Delete monitor?
            </h2>

            <p className="text-sm text-gray-300 mb-6">
              This will permanently remove{' '}
              <span className="font-semibold text-white">
                {deleteTarget.name}
              </span>{' '}
              and all its data.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition"
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
