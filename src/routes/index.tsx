import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useUser } from "@clerk/tanstack-react-start";
import Navbar from "../components/Navbar";
import { startScan, startLiveScan } from "../lib/vibesafe-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeSafe — Security scans for vibe-coded apps" },
      {
        name: "description",
        content:
          "Paste a GitHub URL and get a full vulnerability report in minutes. No CLI, no setup, no jargon.",
      },
      { property: "og:title", content: "VibeSafe — Security scans for vibe-coded apps" },
      {
        property: "og:description",
        content:
          "Ship vibe-coded apps without the security debt. Full vulnerability reports in minutes.",
      },
    ],
  }),
  component: Landing,
});

function Hero() {
  const [mode, setMode] = useState<"repo" | "live" | "both">("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  function handleModeSwitch(newMode: "repo" | "live" | "both") {
    setMode(newMode);
    setRepoUrl("");
    setLiveUrl("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSignedIn || !user) {
      setError("Please sign in to start a scan.");
      return;
    }

    if (mode === "repo" || mode === "both") {
      if (!repoUrl.startsWith("https://github.com/")) {
        setError("Please enter a valid GitHub URL (https://github.com/...)");
        return;
      }
    }

    if (mode === "live" || mode === "both") {
      if (!liveUrl.trim()) {
        setError("Please enter a live URL to scan.");
        return;
      }
    }

    setLoading(true);
    try {
      let scanId: string;
      if (mode === "repo") {
        ({ scanId } = await startScan(repoUrl, user.id));
      } else if (mode === "live") {
        ({ scanId } = await startLiveScan(liveUrl, user.id));
      } else {
        // both — repo scan + IDOR against live URL
        ({ scanId } = await startScan(repoUrl, user.id, liveUrl));
      }
      navigate({ to: "/results", search: { scanId } });
    } catch (err: any) {
      if (err.upgradeRequired) {
        setError("Free tier limit reached (3 scans/month). Upgrade to Pro for unlimited scans.");
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  const MODES = [
    { key: "repo" as const,  label: "GitHub repo",  desc: "Static analysis + AI + secrets scanning" },
    { key: "live" as const,  label: "Live URL",     desc: "Headers, exposed files, CORS, cookies" },
    { key: "both" as const,  label: "Both",         desc: "Full scan + IDOR dynamic testing" },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
          Trusted security for vibe-built products
        </p>
        <h1 className="mx-auto mt-5 max-w-2xl text-[40px] font-semibold leading-[1.1] tracking-tight text-foreground md:text-[48px]">
          Ship vibe-coded apps without the security debt.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {MODES.find(m => m.key === mode)?.desc}
        </p>

        {/* Mode toggle */}
        <div className="mx-auto mt-7 inline-flex rounded-md border border-border bg-[var(--color-surface)] p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleModeSwitch(m.key)}
              className={`rounded px-4 py-1.5 text-[13px] font-medium transition-colors ${
                mode === m.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-xl space-y-2">
          {/* GitHub URL input — shown for repo + both */}
          {(mode === "repo" || mode === "both") && (
            <div className="flex items-stretch overflow-hidden rounded-md border border-[var(--color-border-strong)] bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your/repo"
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              {mode === "repo" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Starting..." : "Scan now"}
                </button>
              )}
            </div>
          )}

          {/* Live URL input — shown for live + both */}
          {(mode === "live" || mode === "both") && (
            <div className="flex items-stretch overflow-hidden rounded-md border border-[var(--color-border-strong)] bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://yourapp.com"
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              {mode === "live" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Starting..." : "Scan now"}
                </button>
              )}
            </div>
          )}

          {/* Single scan button for both mode */}
          {mode === "both" && (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Starting full scan..." : "Run full scan (static + IDOR)"}
            </button>
          )}
        </form>

        {error && (
          <p className="mx-auto mt-3 max-w-xl text-[13px] text-[var(--severity-critical)]">
            {error}
          </p>
        )}

        {mode === "both" && (
          <p className="mx-auto mt-2 max-w-xl text-[12px] text-muted-foreground">
            Clones your repo for static analysis, then probes your live URL for IDOR and auth bypass vulnerabilities.
          </p>
        )}
      </div>
    </section>
  );
}

const STATS = [
  { n: "62%", l: "of AI-generated code has vulnerabilities" },
  { n: "10.3%", l: "of Lovable apps had critical RLS flaws" },
  { n: "2.74x", l: "more vulns in vibe code vs human code" },
  { n: "60%", l: "of new code will be AI-generated by end of 2026" },
];

function Stats() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.n}
              className="rounded-md border border-border bg-[var(--color-surface)] p-6"
            >
              <div className="text-[28px] font-semibold leading-none text-foreground">{s.n}</div>
              <div className="mt-3 text-[13px] leading-snug text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Plan = {
  name: string;
  price: string;
  per: string;
  features: string[];
  popular?: boolean;
  cta: string;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    features: ["3 scans / month", "Static analysis", "Public repos only"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$19",
    per: "/month",
    popular: true,
    features: [
      "Unlimited scans",
      "AI-powered analysis",
      "Playwright testing",
      "Private repos",
      "Fix suggestions",
    ],
    cta: "Get Pro",
  },
  {
    name: "Team",
    price: "$49",
    per: "/month",
    features: ["Everything in Pro", "5 seats", "API access", "Slack alerts"],
    cta: "Start team trial",
  },
];

function Pricing() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Start free. Upgrade when your codebase needs more.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-lg bg-[var(--color-surface)] p-7 ${
                p.popular ? "border border-primary" : "border border-border"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-7 rounded-sm bg-primary px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-[15px] font-semibold text-foreground">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[32px] font-semibold leading-none text-foreground">
                  {p.price}
                </span>
                <span className="text-[13px] text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] text-foreground"
                  >
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.296a1 1 0 010 1.408l-8 8a1 1 0 01-1.408 0l-4-4a1 1 0 011.408-1.408L8 12.592l7.296-7.296a1 1 0 011.408 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {}}
                className={`mt-7 w-full rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  p.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-[var(--color-border-strong)] bg-background text-foreground hover:bg-[var(--color-surface)]"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
        <p className="text-[12px] text-muted-foreground">VibeSafe © 2026</p>
        <div className="flex items-center gap-4">
          {["Privacy", "Terms", "Docs"].map((l, i, arr) => (
            <span key={l} className="flex items-center gap-4">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l}
              </a>
              {i < arr.length - 1 && (
                <span className="text-[12px] text-muted-foreground">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
