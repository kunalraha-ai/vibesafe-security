import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
// Read process.env INSIDE a function (not at module scope) so it works
// on both Node and edge runtimes.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,

    // Express scan engine (DigitalOcean)
    apiUrl: process.env.API_URL,
    apiSecret: process.env.API_SECRET,

    // MongoDB Atlas
    mongoUri: process.env.MONGODB_URI,

    // Clerk auth
    clerkSecretKey: process.env.CLERK_SECRET_KEY,

    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}
