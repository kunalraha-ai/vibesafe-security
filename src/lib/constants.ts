// VibeSafe frontend constants
// Public values only — nothing secret goes here (it ships to the browser).
// Secrets live in config.server.ts and are read via process.env server-side.

// Base URL of the Express scan engine running on DigitalOcean.
// Set VITE_API_URL in your .env file.
// e.g. http://localhost:4000 in dev, https://api.vibesafe.dev in prod.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// Clerk publishable key (safe to expose — it's public by design).
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

// Stripe publishable key (safe to expose).
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

// Free tier limits (keep in sync with Express backend enforcement).
export const FREE_SCANS_PER_MONTH = 3;

// Pricing (keep in sync with Stripe products).
export const PRICING = {
  pro: { monthly: 19, label: "Pro" },
  team: { monthly: 49, label: "Team" },
} as const;
