# Routes

File-based routing via TanStack Router. One file = one route.

| File | Route | Description |
|---|---|---|
| `__root.tsx` | (layout) | Root shell — QueryClient, error boundaries, head tags |
| `index.tsx` | `/` | Landing page |
| `results.tsx` | `/results` | Scan results page |
| `dashboard.tsx` | `/dashboard` | User dashboard |

`routeTree.gen.ts` in `src/` is auto-generated — never edit it manually.
Add new routes by creating a new `.tsx` file here and running `bun dev`.
