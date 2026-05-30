import { createFileRoute } from "@tanstack/react-router";

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

const ROWS = [
  {
    repo: "github.com/user/saas-app",
    date: "May 30, 2026",
    critical: 2,
    high: 5,
    medium: 8,
    status: "Complete",
  },
  {
    repo: "github.com/user/marketing-site",
    date: "May 28, 2026",
    critical: 0,
    high: 1,
    medium: 3,
    status: "Complete",
  },
  {
    repo: "github.com/acme/internal-tools",
    date: "May 27, 2026",
    critical: 1,
    high: 4,
    medium: 6,
    status: "Complete",
  },
  {
    repo: "github.com/user/ai-chatbot",
    date: "May 26, 2026",
    critical: 0,
    high: 0,
    medium: 2,
    status: "Running",
  },
  {
    repo: "github.com/acme/billing-service",
    date: "May 24, 2026",
    critical: 3,
    high: 7,
    medium: 9,
    status: "Failed",
  },
];

const STATUS_PILL: Record<string, { text: string; bg: string }> = {
  Complete: {
    text: "text-[var(--severity-medium)]",
    bg: "bg-[var(--severity-medium-bg)]",
  },
  Running: {
    text: "text-[var(--severity-low)]",
    bg: "bg-[var(--severity-low-bg)]",
  },
  Failed: {
    text: "text-[var(--severity-critical)]",
    bg: "bg-[var(--severity-critical-bg)]",
  },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_PILL[status];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.text} ${meta.bg}`}
    >
      {status}
    </span>
  );
}

function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-[220px] flex-col border-r border-border bg-background">
        <div className="px-5 pt-5">
          <a
            href="/"
            className="text-[15px] font-semibold tracking-tight text-foreground"
          >
            VibeSafe
          </a>
        </div>
        <div className="mt-8 flex-1 px-3">
          <div className="px-2 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
            Account
          </div>
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <a
                key={n.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                  n.active
                    ? "font-medium text-primary"
                    : "text-foreground hover:bg-[var(--color-surface)]"
                }`}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 border-t border-border px-5 py-4">
          <div className="h-7 w-7 rounded-full bg-[var(--color-surface)] border border-border" />
          <span className="truncate text-[12px] text-muted-foreground">
            alex@example.com
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-foreground">My scans</h1>
          <button
            onClick={() => {}}
            className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            New scan
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--color-surface)]">
              <tr>
                {["Repo", "Date", "Critical", "High", "Medium", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={r.repo}
                  className={i !== 0 ? "border-t border-border" : ""}
                >
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">
                    {r.repo}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">
                    {r.date}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-critical)]">
                    {r.critical}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-high)]">
                    {r.high}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--severity-medium)]">
                    {r.medium}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-[13px]">
                      <a
                        href="/results"
                        className="font-medium text-primary hover:opacity-80"
                      >
                        View
                      </a>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Re-scan
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
