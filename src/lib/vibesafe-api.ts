const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const SECRET = import.meta.env.VITE_API_SECRET ?? "vibesafe_dev_secret_123";

const headers = {
  "Content-Type": "application/json",
  "x-api-secret": SECRET,
};

export interface Finding {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  file?: string;
  line?: number;
  tool?: string;
}

export interface ScanStatus {
  scanId: string;
  status: "queued" | "cloning" | "scanning" | "complete" | "failed";
  repoName: string;
  meta: {
    filesScanned: number;
    secretsFound: number;
    endpointsTested: number;
    durationMs: number;
  };
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanResults {
  scanId: string;
  repoName: string;
  repoUrl?: string;
  status: string;
  meta: ScanStatus["meta"];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  findings: {
    critical: Finding[];
    high: Finding[];
    medium: Finding[];
    low: Finding[];
  };
  completedAt: string;
}

export async function startLiveScan(url: string, userId: string): Promise<{ scanId: string }> {
  const res = await fetch(`${BASE}/scan/live`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url, userId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error ?? "Failed to start live scan"), {
      status: res.status,
      upgradeRequired: data.upgradeRequired ?? false,
    });
  }

  return res.json();
}

export async function startScan(repoUrl: string, userId: string, liveTestUrl?: string): Promise<{ scanId: string }> {
  const res = await fetch(`${BASE}/scan`, {
    method: "POST",
    headers,
    body: JSON.stringify({ repoUrl, userId, liveTestUrl }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error ?? "Failed to start scan"), {
      status: res.status,
      upgradeRequired: data.upgradeRequired ?? false,
    });
  }

  return res.json();
}

export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  const res = await fetch(`${BASE}/scan/${scanId}/status`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to get scan status");
  }
  return res.json();
}

export async function getScanResults(scanId: string): Promise<ScanResults> {
  const res = await fetch(`${BASE}/scan/${scanId}/results`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to get scan results");
  }
  return res.json();
}

export async function downloadPdfReport(scanId: string): Promise<void> {
  const res = await fetch(`${BASE}/scan/${scanId}/report`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to generate PDF");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vibesafe-report-${scanId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function listScans(userId: string) {
  const res = await fetch(`${BASE}/scan?userId=${encodeURIComponent(userId)}`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to list scans");
  }
  return res.json();
}
