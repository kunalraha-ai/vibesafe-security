// VibeSafe server functions
// Add createServerFn handlers here as the backend is built.
// Each function in this file runs server-side only and can safely
// import from .server.ts modules (secrets, DB clients, etc).
//
// Example pattern:
//   export const startScan = createServerFn({ method: "POST" })
//     .inputValidator(z.object({ repoUrl: z.string().url() }))
//     .handler(async ({ data }) => { ... })
//
// The Express scan engine on DigitalOcean handles heavy work
// (cloning, Gitleaks, Playwright). These server fns are for
// lightweight ops: auth checks, DB reads, job status polling.
export {};

