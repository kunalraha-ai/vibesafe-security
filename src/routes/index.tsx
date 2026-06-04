import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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

// ── Policy Modal ─────────────────────────────────────────────────────────────

type PolicyType = "privacy" | "terms" | "refund" | null;

function PolicyModal({ type, onClose }: { type: PolicyType; onClose: () => void }) {
  useEffect(() => {
    if (!type) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [type, onClose]);

  if (!type) return null;

  const EFFECTIVE_DATE = "June 1, 2026";
  const COMPANY = "VibeSafe";
  const EMAIL = "kunal@omniprocure.in";
  const WEBSITE = "https://vibesafe.dev";

  const content: Record<NonNullable<PolicyType>, { title: string; body: React.ReactNode }> = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-5 text-[14px] leading-relaxed text-foreground">
          <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">1. Who We Are</h3>
            <p>{COMPANY} ("we", "us", "our") operates {WEBSITE}. We provide security scanning services for software repositories and live web applications. For any privacy-related questions, contact us at <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a>.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">2. Information We Collect</h3>
            <p className="mb-2">We collect the following categories of information:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Account data:</strong> Your name, email address, and profile information provided via Clerk authentication (Google OAuth or email/password).</li>
              <li><strong>Scan inputs:</strong> GitHub repository URLs, live URLs, or uploaded ZIP archives you submit for scanning.</li>
              <li><strong>Scan results:</strong> Vulnerability findings, severity classifications, and AI-generated fix suggestions produced during your scans.</li>
              <li><strong>Usage data:</strong> Scan counts, timestamps, scan duration, and feature usage patterns.</li>
              <li><strong>Payment data:</strong> Billing is handled by DodoPayments. We do not store your card number or payment credentials. We receive a transaction record and subscription status only.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and request logs retained for up to 30 days for security and rate-limiting purposes.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">3. How We Use Your Information</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>To provide, operate, and improve the VibeSafe scanning service.</li>
              <li>To authenticate you and manage your subscription tier.</li>
              <li>To send transactional emails (scan complete, account alerts). We do not send marketing emails without your explicit consent.</li>
              <li>To enforce our Terms of Service and free-tier usage limits.</li>
              <li>To investigate abuse, security incidents, and fraud.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">4. Repository and Code Data</h3>
            <p>When you scan a GitHub repository or upload a ZIP, we clone or extract the code into a temporary working directory on our servers. This data is:</p>
            <ul className="list-disc space-y-1 pl-5 mt-2">
              <li>Used solely to perform the security scan you requested.</li>
              <li>Deleted from our servers immediately after the scan completes or fails.</li>
              <li>Never shared with third parties or used to train AI models.</li>
              <li>Processed within the European Union or United States, depending on our infrastructure provider.</li>
            </ul>
            <p className="mt-2">Scan results (findings, summaries, metadata) are retained in our database for 30 days to allow you to access your reports, after which they are automatically deleted.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">5. AI Processing</h3>
            <p>We use Azure OpenAI to triage and enrich vulnerability findings. Code snippets (surrounding context around a finding, typically 10–20 lines) may be sent to Azure OpenAI's API. Microsoft's data processing terms apply to this data. We do not send full repository contents to any AI provider.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">6. Third-Party Services</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Clerk:</strong> Authentication and user management.</li>
              <li><strong>MongoDB Atlas:</strong> Database storage for scan results and user records.</li>
              <li><strong>Redis / BullMQ:</strong> Job queue for background scan processing.</li>
              <li><strong>Azure OpenAI:</strong> AI-powered vulnerability analysis.</li>
              <li><strong>DodoPayments:</strong> Payment processing for Pro and Team subscriptions.</li>
            </ul>
            <p className="mt-2">Each provider operates under their own privacy policy and data processing agreements. We enter into Data Processing Agreements with all providers who handle personal data.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">7. Data Retention</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Repository code: deleted immediately after scan completion.</li>
              <li>Scan results: 30 days from scan date, then auto-deleted.</li>
              <li>Account data: retained while your account is active; deleted within 30 days of account deletion request.</li>
              <li>Payment records: retained as required by applicable tax and financial regulations (typically 7 years).</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">8. Your Rights</h3>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data, or to object to certain processing. To exercise these rights, email <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">9. Cookies</h3>
            <p>We use only strictly necessary cookies for authentication session management via Clerk. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">10. Changes to This Policy</h3>
            <p>We may update this Privacy Policy. Material changes will be notified via email to registered users. Continued use of VibeSafe after changes constitutes acceptance.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">11. Contact</h3>
            <p>Privacy questions: <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a></p>
          </section>
        </div>
      ),
    },

    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-5 text-[14px] leading-relaxed text-foreground">
          <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">1. Agreement</h3>
            <p>By creating a {COMPANY} account or using our services at {WEBSITE}, you agree to these Terms of Service ("Terms"). If you do not agree, do not use {COMPANY}. These Terms form a legally binding agreement between you and {COMPANY}.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">2. Description of Service</h3>
            <p>{COMPANY} provides automated security scanning for software repositories and live web applications ("Service"). Scans detect vulnerabilities including but not limited to: hardcoded secrets, injection flaws, misconfigured security headers, exposed files, and insecure authentication patterns. Results are informational and do not constitute professional security consulting or penetration testing.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">3. Eligibility and Accounts</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>You must be at least 18 years old to use {COMPANY}.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>One account per individual or organisation; creating multiple accounts to circumvent free-tier limits is prohibited.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">4. Permitted Use</h3>
            <p className="mb-2">You may only use {COMPANY} to scan repositories and URLs that you own or have explicit written authorisation to test. Specifically, you represent and warrant that:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>You are the owner of the GitHub repository or have been granted permission by the owner to conduct security testing.</li>
              <li>You are the owner of the live URL or have been granted explicit authorisation to probe it for vulnerabilities.</li>
              <li>You will not use {COMPANY} to scan third-party systems without authorisation, which may violate the Computer Fraud and Abuse Act (US), Computer Misuse Act (UK), or equivalent laws in your jurisdiction.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">5. Prohibited Conduct</h3>
            <p>You must not:</p>
            <ul className="list-disc space-y-1 pl-5 mt-2">
              <li>Scan systems you do not own or are not authorised to test.</li>
              <li>Use {COMPANY} output to attack, exploit, or harm any systems or individuals.</li>
              <li>Attempt to reverse-engineer, scrape, or extract the scanning engine or AI models.</li>
              <li>Circumvent rate limits, scan quotas, or authentication mechanisms.</li>
              <li>Upload malware, offensive content, or material that violates applicable law.</li>
              <li>Resell or sublicense access to {COMPANY} without prior written consent.</li>
              <li>Use the Service for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">6. Subscription Plans and Billing</h3>
            <p className="mb-2">We offer the following plans:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Free:</strong> 3 scans per calendar month. No payment required.</li>
              <li><strong>Pro:</strong> Unlimited scans, AI analysis, private repos, fix suggestions. Billed monthly via DodoPayments.</li>
              <li><strong>Team:</strong> Everything in Pro plus 5 seats, API access, and Slack alerts. Billed monthly via DodoPayments.</li>
            </ul>
            <p className="mt-2">Subscriptions auto-renew monthly. You may cancel at any time; cancellation takes effect at the end of the current billing period. Price changes will be communicated at least 14 days in advance.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">7. Disclaimer of Warranties</h3>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. {COMPANY.toUpperCase()} DOES NOT WARRANT THAT THE SERVICE IS ERROR-FREE, COMPLETE, OR THAT ALL VULNERABILITIES IN YOUR CODE WILL BE DETECTED. SECURITY SCANNING IS INHERENTLY PROBABILISTIC. YOU SHOULD NOT RELY SOLELY ON {COMPANY.toUpperCase()} OUTPUT AS YOUR SOLE SECURITY MEASURE.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">8. Limitation of Liability</h3>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO SECURITY BREACHES, DATA LOSS, OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">9. Intellectual Property</h3>
            <p>{COMPANY} and its scan engine, AI models, report templates, and UI are proprietary to {COMPANY}. Your code and scan results belong to you. You grant {COMPANY} a limited licence to process your code and URLs solely for the purpose of providing the Service.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">10. Termination</h3>
            <p>We may suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or abuse of the Service. You may delete your account at any time by contacting <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a>.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">11. Governing Law</h3>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">12. Changes to Terms</h3>
            <p>We may update these Terms. Continued use after changes constitutes acceptance. Material changes will be communicated via email at least 14 days in advance.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">13. Contact</h3>
            <p>For any questions about these Terms: <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a></p>
          </section>
        </div>
      ),
    },

    refund: {
      title: "Refund Policy",
      body: (
        <div className="space-y-5 text-[14px] leading-relaxed text-foreground">
          <p className="text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">1. Overview</h3>
            <p>{COMPANY} processes all payments via <strong>DodoPayments</strong>, a global payment infrastructure provider. This Refund Policy governs refunds for Pro and Team subscriptions purchased through {WEBSITE}. By purchasing a subscription, you agree to the terms below.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">2. Eligibility for Refund</h3>
            <p className="mb-2">You are eligible for a full refund if <strong>all</strong> of the following conditions are met:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>You contact us at <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a> <strong>within 7 days</strong> of your initial purchase or renewal date.</li>
              <li>You have used <strong>less than 50%</strong> of your monthly scan quota for that billing period at the time of the refund request.</li>
              <li>This is your first refund request for your account.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">3. No Refund After Half Usage</h3>
            <p>If you have consumed <strong>50% or more</strong> of your monthly scan entitlement for the billing period in question, no refund will be issued, regardless of when the request is made. This threshold exists because substantial value of the subscription has already been delivered.</p>
            <p className="mt-2">Example: If you are on the Pro plan and have run 50 or more scans in a billing month, you are not eligible for a refund for that month.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">4. No Refund After 7 Days</h3>
            <p>Refund requests submitted more than <strong>7 calendar days</strong> after the purchase or renewal date will not be processed, regardless of usage. Subscription fees are charged for access to the service during the billing period, not solely for scans conducted.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">5. DodoPayments Processing</h3>
            <p className="mb-2">All payment transactions are processed by <strong>DodoPayments</strong>. The following terms from DodoPayments apply to all transactions on {COMPANY}:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Payments are processed securely via DodoPayments' PCI-DSS compliant infrastructure. {COMPANY} does not store your card details.</li>
              <li>Approved refunds will be credited to your original payment method within <strong>5–10 business days</strong>, depending on your bank or card issuer. DodoPayments does not guarantee a specific processing timeline beyond initiating the refund promptly.</li>
              <li>Currency conversion fees or foreign transaction fees charged by your bank are not refundable by {COMPANY} or DodoPayments.</li>
              <li>In the event of a payment dispute or chargeback initiated with your bank, {COMPANY} reserves the right to suspend your account pending resolution. We encourage contacting us first at <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a> before initiating a chargeback, as disputes can delay resolution significantly.</li>
              <li>Refunds for payments made in currencies other than the original charge currency may be subject to exchange rate differences at the time of refund processing.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">6. Non-Refundable Situations</h3>
            <p>The following are explicitly non-refundable:</p>
            <ul className="list-disc space-y-1 pl-5 mt-2">
              <li>Requests made after 7 days from the charge date.</li>
              <li>Accounts that have used 50% or more of their scan quota for the period.</li>
              <li>Cases where the account has been suspended or terminated for Terms of Service violations.</li>
              <li>Partial-month usage after a mid-period plan cancellation (cancellation takes effect at end of billing period).</li>
              <li>Free plan — there are no charges on the Free plan, so no refunds apply.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">7. How to Request a Refund</h3>
            <p>To request a refund, email <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a> with the subject line <strong>"Refund Request — [your email]"</strong> and include:</p>
            <ul className="list-disc space-y-1 pl-5 mt-2">
              <li>Your registered email address.</li>
              <li>The date of the charge.</li>
              <li>The reason for your refund request.</li>
            </ul>
            <p className="mt-2">We will review your request and respond within <strong>3 business days</strong>. If eligible, the refund will be initiated via DodoPayments within 2 business days of approval.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">8. Exceptions</h3>
            <p>In exceptional circumstances (e.g., extended service outages affecting your ability to use scans during a billing period), we may issue partial credits or refunds at our sole discretion, even outside the standard policy. Contact <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a> to discuss.</p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-foreground">9. Contact</h3>
            <p>For all refund requests and billing questions: <a href={`mailto:${EMAIL}`} className="text-primary underline">{EMAIL}</a></p>
          </section>
        </div>
      ),
    },
  };

  const { title, body } = content[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: "#00000066" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-[720px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">VibeSafe</p>
            <h2 className="text-[18px] font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--color-surface)] hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5">
          {body}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-6 py-3">
          <p className="text-[12px] text-muted-foreground">
            Questions? Email <a href="mailto:kunal@omniprocure.in" className="text-primary underline">kunal@omniprocure.in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

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

// ── Stats ─────────────────────────────────────────────────────────────────────

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

// ── Pricing ───────────────────────────────────────────────────────────────────

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

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer({ onPolicy }: { onPolicy: (p: PolicyType) => void }) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
        <p className="text-[12px] text-muted-foreground">VibeSafe © 2026</p>
        <div className="flex items-center gap-4">
          {(
            [
              ["Privacy Policy", "privacy"],
              ["Terms of Service", "terms"],
              ["Refund Policy", "refund"],
            ] as [string, PolicyType][]
          ).map(([label, key], i, arr) => (
            <span key={label} className="flex items-center gap-4">
              <button
                onClick={() => onPolicy(key)}
                className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
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

// ── Landing ───────────────────────────────────────────────────────────────────

function Landing() {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Pricing />
      </main>
      <Footer onPolicy={setActivePolicy} />
      <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />
    </div>
  );
}
