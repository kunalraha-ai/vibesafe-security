import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import FixModal from "../components/FixModal";
import { getScanStatus, getScanResults, downloadPdfReport, type Finding, type ScanResults } from "../lib/vibesafe-api";

export const Route = createFileRoute("/results")({
  validateSearch: (search: Record<string, unknown>) => ({
    scanId: typeof search.scanId === "string" ? search.scanId : "",
  }),
  head: () => ({
    meta: [
      { title: "Scan Results — VibeSafe" },
      { name: "description", content: "Security scan results — VibeSafe" },
    ],
  }),
  component: ResultsPage,
});

const SEVERITY_META: Record<string, { text: string; bg: string }> = {
  critical: { text: "text-[var(--severity-critical)]", bg: "bg-[var(--severity-critical-bg)]" },
  high: { text: "text-[var(--severity-high)]", bg: "bg-[var(--severity-high-bg)]" },
  medium: { text: "text-[var(--severity-medium)]", bg: "bg-[var(--severity-medium-bg)]" },
  low: { text: "text-[var(--severity-low)]", bg: "bg-[var(--severity-low-bg)]" },
  Critical: { text: "text-[var(--severity-critical)]", bg: "bg-[var(--severity-critical-bg)]" },
  High: { text: "text-[var(--severity-high)]", bg: "bg-[var(--severity-high-bg)]" },
  Medium: { text: "text-[var(--severity-medium)]", bg: "bg-[var(--severity-medium-bg)]" },
  Low: { text: "text-[var(--severity-low)]", bg: "bg-[var(--severity-low-bg)]" },
};

function SeverityBadge({ severity }: { severity: string }) {
  const meta = SEVERITY_META[severity];
  if (!meta) return null;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.text} ${meta.bg}`}>
      {severity}
    </span>
  );
}

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  cloning: "Cloning repo...",
  scanning: "Scanning...",
  complete: "Scan complete",
  failed: "Scan failed",
};

function ResultsPage() {
  const { scanId } = useSearch({ from: "/results" });
  const navigate = useNavigate();
  const [openFix, setOpenFix] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [status, setStatus] = useState<string>("queued");
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState("");
  const [repoName, setRepoName] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!scanId) return;

    async function poll() {
      try {
        const s = await getScanStatus(scanId);
        setStatus(s.status);
        setRepoName(s.repoName ?? "");

        if (s.status === "complete") {
          stopPolling();
          const r = await getScanResults(scanId);
          setResults(r);
        } else if (s.status === "failed") {
          stopPolling();
          setError(s.errorMessage ?? "Scan failed. Please try again.");
        }
      } catch (err: any) {
        stopPolling();
        setError(err.message ?? "Something went wrong.");
      }
    }

    function stopPolling() {
      if (pollRef.current) clearInterval(pollRef.current);
    }

    poll();
    pollRef.current = setInterval(poll, 2000);
    return stopPolling;
  }, [scanId]);

  // No scanId
  if (!scanId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-[15px] text-muted-foreground">No scan found.</p>
          <button onClick={() => navigate({ to: "/" })} className="mt-4 text-[13px] font-medium text-primary hover:opacity-80">
            ← Start a new scan
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-[15px] text-[var(--severity-critical)]">{error}</p>
          <button onClick={() => navigate({ to: "/" })} className="mt-4 text-[13px] font-medium text-primary hover:opacity-80">
            ← Try again
          </button>
        </div>
      </div>
    );
  }

  // Loading / in-progress state
  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8">
            <div className="text-[13px] text-muted-foreground">Dashboard › {repoName || scanId}</div>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-[20px] font-semibold text-foreground">{repoName || "Scanning..."}</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-700">
                {STATUS_LABELS[status] ?? status}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-[14px] text-muted-foreground">{STATUS_LABELS[status] ?? "Processing..."}</p>
          </div>
        </main>
      </div>
    );
  }

  // Flatten all findings for display
  const allFindings: (Finding & { severityKey: string })[] = [
    ...results.findings.critical.map(f => ({ ...f, severityKey: "critical" })),
    ...results.findings.high.map(f => ({ ...f, severityKey: "high" })),
    ...results.findings.medium.map(f => ({ ...f, severityKey: "medium" })),
    ...results.findings.low.map(f => ({ ...f, severityKey: "low" })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="text-[13px] text-muted-foreground">
            Dashboard › {results.repoName}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold text-foreground">{results.repoName}</h1>
            <span className="text-[13px] text-muted-foreground">
              {new Date(results.completedAt).toLocaleString()}
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
              Scan complete
            </span>
            <button
              onClick={() => navigate({ to: "/" })}
              className="ml-auto rounded-md border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]"
            >
              New scan
            </button>
          </div>
        </div>

        {/* Severity summary */}
        <div className="mb-8 flex items-stretch divide-x divide-border border-y border-border">
          {[
            { label: "Critical", count: results.summary.critical, cls: "text-[var(--severity-critical)]" },
            { label: "High", count: results.summary.high, cls: "text-[var(--severity-high)]" },
            { label: "Medium", count: results.summary.medium, cls: "text-[var(--severity-medium)]" },
            { label: "Low", count: results.summary.low, cls: "text-[var(--severity-low)]" },
          ].map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center py-6">
              <span className={`text-[28px] font-semibold ${s.cls}`}>{s.count}</span>
              <span className="mt-1 text-[13px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Main 70/30 split */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: vulnerability list */}
          <div className="w-full lg:w-[70%]">
            {allFindings.length === 0 ? (
              <div className="rounded-lg border border-border bg-background p-8 text-center">
                <p className="text-[15px] font-medium text-foreground">No vulnerabilities found 🎉</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Your repo looks clean.</p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {allFindings.map((v, i) => (
                  <div key={i} className="bg-background p-4">
                    <SeverityBadge severity={v.severityKey} />
                    <div className="mt-2 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-medium text-foreground">{v.title}</h3>
                        {v.description && (
                          <p className="mt-1 text-[14px] text-muted-foreground">{v.description}</p>
                        )}
                        {v.file && (
                          <code className="mt-2 block font-mono text-[12px] text-[var(--muted-slate)]">
                            {v.file}{v.line ? `:${v.line}` : ""}
                          </code>
                        )}
                      </div>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setOpenFix(v.title); }}
                        className="shrink-0 text-[13px] font-medium text-primary transition-colors hover:opacity-80"
                      >
                        View fix →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: sticky scan summary */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-6 rounded-lg border border-border bg-background p-5">
              <h2 className="text-[15px] font-semibold text-foreground">Scan summary</h2>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Files scanned", value: String(results.meta.filesScanned) },
                  { label: "Secrets detected", value: String(results.meta.secretsFound) },
                  { label: "Endpoints tested", value: String(results.meta.endpointsTested) },
                  { label: "Scan duration", value: `${(results.meta.durationMs / 1000).toFixed(1)}s` },
                  { label: "Total findings", value: String(results.summary.total) },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-medium text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="space-y-2">
                <button onClick={async () => {
                    setPdfError("");
                    setPdfLoading(true);
                    try { await downloadPdfReport(scanId); }
                    catch (e: any) { setPdfError(e.message ?? "PDF failed"); }
                    finally { setPdfLoading(false); }
                  }} disabled={pdfLoading} className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)] disabled:opacity-50">
                  {pdfLoading ? "Generating..." : "Export PDF"}
                </button>
                <button onClick={() => {}} className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-[var(--color-surface)]">
                  Share report
                </button>
              </div>
              {pdfError && (
                <p className="mt-2 text-[12px] text-[var(--severity-critical)]">{pdfError}</p>
              )}
              <p className="mt-3 text-[12px] text-muted-foreground">Report valid for 30 days</p>
            </div>
          </div>
        </div>
      </main>
      <FixModal open={openFix !== null} onClose={() => setOpenFix(null)} title={openFix ?? ""} />
    </div>
  );
}
