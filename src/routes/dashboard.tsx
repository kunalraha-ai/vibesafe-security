import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useState, useEffect, useRef } from "react";
import { listScans } from "../lib/vibesafe-api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VibeSafe" },
      { name: "description", content: "Your VibeSafe security scans" },
    ],
  }),
  component: DashboardPage,
});

const NAV = [
  { label: "Scans", active: true },
  { label: "Settings", active: false },
  { label: "Upgrade to Pro", active: false },
];

const STATUS_PILL: Record<string, { text: string; bg: string }> = {
  complete:  { text: "text-[var(--severity-medium)]",   bg: "bg-[var(--severity-medium-bg)]" },
  queued:    { text: "text-[var(--severity-low)]",      bg: "bg-[var(--severity-low-bg)]" },
  cloning:   { text: "text-[var(--severity-low)]",      bg: "bg-[var(--severity-low-bg)]" },
  scanning:  { text: "text-[var(--severity-low)]",      bg: "bg-[var(--severity-low-bg)]" },
  failed:    { text: "text-[var(--severity-critical)]", bg: "bg-[var(--severity-critical-bg)]" },
};

const STATUS_LABEL: Record<string, string> = {
  complete: "Complete",
  queued:   "Queued",
  cloning:  "Running",
  scanning: "Running",
  failed:   "Failed",
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_PILL[status] ?? STATUS_PILL.queued;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.text} ${meta.bg}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

interface ScanRow {
  _id: string;
  repoName: string;
  repoUrl?: string;
  status: string;
  meta: { filesScanned: number; secretsFound: number; endpointsTested: number; durationMs: number };
  summary?: { critical: number; high: number; medium: number; low: number };
  createdAt: string;
}

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchScans() {
    if (!user?.id) return;
    try {
      const data = await listScans(user.id);
      setScans(data.scans ?? []);
      setFetchError("");
    } catch (err: any) {
      setFetchError(err.message ?? "Failed to load scans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    fetchScans();
    // Poll every 5s so running scans auto-update
    pollRef.current = setInterval(fetchScans, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isLoaded, isSignedIn, user?.id]);

  if (isLoaded && !isSignedIn) {
    window.location.href = "/";
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const hasRunning = scans.some(s => s.status === "queued" || s.status === "cloning" || s.status === "scanning");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-[220px] flex-col border-r border-border bg-background">
        <div className="px-5 pt-5">
          <a href="/" className="text-[15px] font-semibold tracking-tight text-foreground">VibeSafe</a>
        </div>
        <div className="mt-8 flex-1 px-3">
          <div className="px-2 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">Account</div>
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <a
                key={n.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`rounded-md px-2 py-1.5 text-[13px] transition-colors ${n.active ? "font-medium text-primary" : "text-foreground hover:bg-[var(--color-surface)]"}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 border-t border-border px-5 py-4">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName ?? ""} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full border border-border bg-[var(--color-surface)]" />
          )}
          <span className="truncate text-[12px] text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress ?? ""}
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-semibold text-foreground">My scans</h1>
            {hasRunning && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            )}
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            New scan
          </button>
        </div>

        {fetchError && (
          <div className="mb-4 rounded-md border border-[var(--severity-critical-bg)] bg-[var(--severity-critical-bg)] px-4 py-3 text-[13px] text-[var(--severity-critical)]">
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border py-24 text-center">
            <p className="text-[15px] font-medium text-foreground">No scans yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Paste a GitHub URL on the home page to run your first scan.</p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              Start a scan
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  {["Repo", "Date", "Critical", "High", "Medium", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scans.map((r, i) => (
                  <tr key={r._id} className={i !== 0 ? "border-t border-border" : ""}>
                    <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.repoName}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-critical)]">
                      {r.summary?.critical ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-high)]">
                      {r.summary?.high ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-medium)]">
                      {r.summary?.medium ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-[13px]">
                        {r.status === "complete" ? (
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigate({ to: "/results", search: { scanId: r._id } }); }}
                            className="font-medium text-primary hover:opacity-80"
                          >
                            View
                          </a>
                        ) : r.status === "failed" ? (
                          <span className="text-muted-foreground">Failed</span>
                        ) : (
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigate({ to: "/results", search: { scanId: r._id } }); }}
                            className="font-medium text-primary hover:opacity-80"
                          >
                            Watch
                          </a>
                        )}
                        {r.repoUrl && (
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Re-scan
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
