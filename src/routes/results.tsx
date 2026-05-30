import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Navbar from "../components/Navbar";
import FixModal from "../components/FixModal";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Scan Results — VibeSafe" },
      {
        name: "description",
        content: "Security scan results for github.com/demo/myapp",
      },
    ],
  }),
  component: ResultsPage,
});

const SEVERITY_META: Record<
  string,
  { text: string; bg: string }
> = {
  Critical: {
    text: "text-[var(--severity-critical)]",
    bg: "bg-[var(--severity-critical-bg)]",
  },
  High: {
    text: "text-[var(--severity-high)]",
    bg: "bg-[var(--severity-high-bg)]",
  },
  Medium: {
    text: "text-[var(--severity-medium)]",
    bg: "bg-[var(--severity-medium-bg)]",
  },
  Low: {
    text: "text-[var(--severity-low)]",
    bg: "bg-[var(--severity-low-bg)]",
  },
};

const VULNERABILITIES = [
  {
    severity: "Critical",
    title: "Supabase RLS misconfiguration",
    description: "all user data publicly readable",
    file: "supabase/migrations/001_init.sql",
  },
  {
    severity: "High",
    title: "Stripe secret key exposed in frontend bundle",
    description: "",
    file: "src/components/PaymentForm.tsx",
  },
  {
    severity: "High",
    title: "Unauthenticated /api/users endpoint",
    description: "",
    file: "src/routes/api/users.ts",
  },
  {
    severity: "Medium",
    title: "SQL injection pattern in search route",
    description: "",
    file: "src/routes/search.tsx",
  },
];

function SeverityBadge({ severity }: { severity: string }) {
  const meta = SEVERITY_META[severity];
  if (!meta) return null;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.text} ${meta.bg}`}
    >
      {severity}
    </span>
  );
}

function ResultsPage() {
  const [openFix, setOpenFix] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="text-[13px] text-muted-foreground">
            Dashboard › github.com/demo/myapp
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold text-foreground">
              github.com/demo/myapp
            </h1>
            <span className="text-[13px] text-muted-foreground">
              May 30, 2026 at 14:23
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
              Scan complete
            </span>
            <button
              onClick={() => {}}
              className="ml-auto rounded-md border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
            >
              Re-scan
            </button>
          </div>
        </div>

        {/* Severity summary */}
        <div className="mb-8 flex items-stretch divide-x divide-border border-y border-border">
          {[
            { label: "Critical", count: 2, cls: "text-[var(--severity-critical)]" },
            { label: "High", count: 5, cls: "text-[var(--severity-high)]" },
            { label: "Medium", count: 8, cls: "text-[var(--severity-medium)]" },
            { label: "Low", count: 3, cls: "text-[var(--severity-low)]" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-1 flex-col items-center py-6"
            >
              <span className={`text-[28px] font-semibold ${s.cls}`}>
                {s.count}
              </span>
              <span className="mt-1 text-[13px] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main 70/30 split */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: vulnerability list */}
          <div className="w-full lg:w-[70%]">
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {VULNERABILITIES.map((v, i) => (
                <div key={i} className="bg-background p-4">
                  <SeverityBadge severity={v.severity} />
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-medium text-foreground">
                        {v.title}
                      </h3>
                      {v.description && (
                        <p className="mt-1 text-[14px] text-muted-foreground">
                          {v.description}
                        </p>
                      )}
                      <code className="mt-2 block font-mono text-[12px] text-[var(--muted-slate)]">
                        {v.file}
                      </code>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenFix(v.title);
                      }}
                      className="shrink-0 text-[13px] font-medium text-primary transition-colors hover:opacity-80"
                    >
                      View fix →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: sticky scan summary */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-6 rounded-lg border border-border bg-background p-5">
              <h2 className="text-[15px] font-semibold text-foreground">
                Scan summary
              </h2>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Files scanned", value: "47" },
                  { label: "Secrets detected", value: "2" },
                  { label: "Endpoints tested", value: "12" },
                  { label: "Scan duration", value: "43s" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex justify-between text-[13px]"
                  >
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-medium text-foreground">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="space-y-2">
                <button
                  onClick={() => {}}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {}}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
                >
                  Share report
                </button>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground">
                Report valid for 30 days
              </p>
            </div>
          </div>
        </div>
      </main>
      <FixModal
        open={openFix !== null}
        onClose={() => setOpenFix(null)}
        title={openFix ?? ""}
      />
    </div>
  );
}
