"use server";

import { auth } from "@clerk/nextjs/server";

export async function getMonitorChecks(monitorId, cursor = null, from = null, to = null) {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: "golang" });

    if (!token) {
      return { error: "Untitled to get auth token" };
    }

    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/monitors/${monitorId}/checks`
    );

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    // Attempt standard timestamp filtering if the backend supports it
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Failed to load checks" };
    }

    const checks = await res.json();
    const nextCursor = res.headers.get("X-Next-Cursor");

    return {
      data: checks || [],
      nextCursor: nextCursor || null,
    };
  } catch (error) {
    console.error("Error fetching monitor checks:", error);
    return { error: "Internal server error" };
  }
}
