"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import MonitorItem from "@/components/monitors/MonitorItem";
import EditMonitorModal from "@/components/monitors/EditMonitorModal";
import DeleteMonitorModal from "@/components/monitors/DeleteMonitorModal";
import IncidentsDrawer from "@/components/monitors/IncidentsDrawer";

export default function MonitorListPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [updateTarget, setUpdateTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [incidentsTarget, setIncidentsTarget] = useState(null);

  // FETCH MONITORS
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let aborted = false;

    const fetchMonitors = async () => {
      try {
        setLoading(true);
        setError(null);

        let token = await getToken();

        // Clerk hydration retry
        if (!token) {
          await new Promise((r) => setTimeout(r, 300));
          token = await getToken();
        }

        if (!token) throw new Error("Authentication not ready");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load monitors");
        }

        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];

        if (!aborted) setMonitors(safeData);
      } catch (err) {
        if (!aborted) {
          setMonitors([]);
          setError(err.message || "Unable to fetch monitors");
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchMonitors();

    return () => {
      aborted = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  // UPDATE HANDLER
  const handleUpdate = async (monitorData) => {
    if (!monitorData) return;

    try {
      setIsUpdating(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication not ready");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${monitorData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interval_seconds: monitorData.interval_seconds,
            is_active: monitorData.is_active,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update monitor");

      // Optimistic Update
      setMonitors((prev) =>
        prev.map((m) =>
          m.id === monitorData.id ? { ...m, ...monitorData } : m
        )
      );
      setUpdateTarget(null);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  // DELETE HANDLER
  const handleDelete = async (monitor) => {
    if (!monitor) return;

    try {
      setIsDeleting(true);

      const token = await getToken();
      if (!token) throw new Error("Authentication not ready");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${monitor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete monitor");

      setMonitors((prev) =>
        Array.isArray(prev) ? prev.filter((m) => m.id !== monitor.id) : []
      );

      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // ONE-CLICK ENABLE HANDLER
  const handleEnable = async (monitor) => {
    await handleUpdate({ ...monitor, is_active: true });
  }

  // AUTH STATE
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        Initializing session…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Please sign in to view monitors.
      </div>
    );
  }

  const hasMonitors = Array.isArray(monitors) && monitors.length > 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 pt-16 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Monitors
              </h1>

              { /* Purple dot */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
              </span>
            </div>

            {/* <Link
              href="/post-user"
              className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
            >
              + Create Monitor
            </Link> */}

            <Link
              href="/post-user"
              aria-label="Create new monitor"
              className="group relative inline-flex items-center gap-2
             rounded-xl px-5 py-2.5
             text-sm font-medium text-white
             bg-blue-500/10 backdrop-blur-md
             border border-white/10
             shadow-lg shadow-blue-500/20
             transition-all duration-300
             hover:shadow-purple-500/30"
            >
              {/* Inner purple border on hover */}
              <span
                className="pointer-events-none absolute inset-0 rounded-xl
               ring-1 ring-transparent
               transition-all duration-300
               group-hover:ring-purple-400/60"
              />

              {/* + icon */}
              <span className="relative z-10 text-base leading-none">+</span>

              {/* Text */}
              <span className="relative z-10">New</span>
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
              <p className="text-sm text-gray-600">
                Create your first monitor to get started
              </p>
            </div>
          )}

          {!loading && hasMonitors && (
            <div className="grid grid-cols-1 gap-4">
              {monitors.map((monitor) => (
                <MonitorItem
                  key={monitor.id}
                  monitor={monitor}
                  onEdit={setUpdateTarget}
                  onDelete={setDeleteTarget}
                  onEnable={handleEnable}
                  onIncidents={setIncidentsTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditMonitorModal
        key={updateTarget?.id || 'edit-modal'}
        monitor={updateTarget}
        onClose={() => setUpdateTarget(null)}
        onSave={handleUpdate}
        isUpdating={isUpdating}
      />

      <DeleteMonitorModal
        monitor={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <IncidentsDrawer
        monitor={incidentsTarget}
        onClose={() => setIncidentsTarget(null)}
      />
    </>
  );
}
