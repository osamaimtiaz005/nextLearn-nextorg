## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

---

## Next.js core concepts (detailed reference)

This section summarizes how Next.js works so you can navigate the official docs with context. For the latest APIs and examples, always prefer **[nextjs.org/docs](https://nextjs.org/docs)**.

### What Next.js is

Next.js is a React **framework**: it adds file-based routing, conventions for server vs client code, built-in optimizations (images, fonts, scripts), and a production-ready Node.js server story. You still write **components** with React; Next.js decides **where** and **when** they run (on the server per request, on the client in the browser, or both).

### App Router (`app/` directory)

Modern Next.js apps use the **App Router**. Folders under `app/` define **routes**; `page.tsx` (or `page.js`) is the UI for a route, and `layout.tsx` wraps child routes. Special files include `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts` for HTTP handlers.

| File            | Role |
|-----------------|------|
| `page`          | Unique UI for a route segment |
| `layout`        | Shared UI that wraps nested segments (persists across navigations) |
| `loading`       | Instant loading UI while a segment suspends |
| `error`         | Error boundary for a segment |
| `not-found`     | UI when `notFound()` is called or a route is missing |
| `route`         | Route Handler: `GET`/`POST`/… for the segment’s URL |

Official: [App Router](https://nextjs.org/docs/app).

### Routing

- **File-system routing**: URL path mirrors the folder tree. `app/dashboard/invoices/page.tsx` → `/dashboard/invoices`.
- **Dynamic segments**: Folders named `[id]` capture a path param (e.g. `/invoices/123`).
- **Route groups**: Folders in parentheses like `(overview)` **do not** appear in the URL; they organize code and layouts.
- **Parallel & intercepting routes** (advanced): Multiple pages in one layout, or showing a modal while keeping the URL—see docs when you need them.

Official: [Defining Routes](https://nextjs.org/docs/app/building-your-application/routing).

### Server Components vs Client Components

- **React Server Components (default in `app/`)**: Components are rendered on the **server**. They can be `async`, talk to databases and secrets directly, and send a compact payload to the client. They **cannot** use hooks like `useState`, `useEffect`, or browser APIs.
- **Client Components**: Marked with `"use client"` at the top of the file. They run in the **browser**, can use state, effects, and event handlers. Import Server Components **into** Client Components only as props/children (composition), not by importing the server file directly in most cases.

Rule of thumb: keep **data fetching and secrets on the server**; use **client** for interactivity.

Official: [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components).

### Rendering models (how HTML is produced)

- **Static**: Built ahead of time or cached; same output for many users (great for marketing pages).
- **Dynamic / per-request**: HTML or RSC payload is produced when a request arrives (personalized or data-heavy pages).
- **Streaming**: The server can send the shell first and **stream** slower parts as they resolve (works with `loading.tsx` and `Suspense`).

Next.js chooses strategies based on your code (e.g. `fetch` options, `dynamic` route segment config). The mental model: **Server Components** shift work to the server; **caching** controls how often that work repeats.

Official: [Rendering](https://nextjs.org/docs/app/building-your-application/rendering).

### CSR, SSR, SSG, and ISR (what’s the difference?)

These four terms describe **when and where** your UI and data are produced. They come from classic React/Next.js teaching; the **App Router** still uses the same ideas but often expresses them with **Server Components**, **caching**, and **`revalidate`** instead of only `getStaticProps` / `getServerSideProps`.

| Acronym | Name | When work runs | First HTML | Typical use |
|--------|------|----------------|------------|-------------|
| **CSR** | Client-Side Rendering | In the **browser** after JS loads | Shell or empty, then React paints | Highly interactive UIs, dashboards behind login |
| **SSR** | Server-Side Rendering | On the **server per request** | Full HTML for that request | Personalized pages, data that must be fresh every time |
| **SSG** | Static Site Generation | At **build** time (or when the page is pre-rendered) | Prebuilt HTML, same for everyone until rebuilt | Marketing pages, docs, blogs |
| **ISR** | Incremental Static Regeneration | **Static** pages that **refresh** on a timer or on-demand | Like SSG, then updated in the background | Product catalogs, semi-fresh content without rebuilding the whole site |

**CSR (Client-Side Rendering)**  
The server sends JavaScript bundles; **React runs in the client** and often **fetches data in the browser** (`useEffect`, client fetch). The first meaningful paint may wait for JS. In Next.js, any **`"use client"`** component behaves like CSR for the parts that only run after hydration—but the App Router usually still sends **server-rendered HTML** for the initial load when parent Server Components exist.

**SSR (Server-Side Rendering)**  
For each request, the **server** runs your React tree (or RSC payload) and sends **fresh** output. Good for **always-fresh** or **user-specific** data. In the App Router, routes that are **dynamic** (e.g. use uncached `fetch`, cookies, or `headers`) behave like SSR for that segment.

**SSG (Static Site Generation)**  
Output is produced **ahead of time** and can be served from a CDN—very fast. In the App Router, this corresponds to routes that Next can **fully prerender** and cache as **static** (no per-request dynamic APIs in that path).

**ISR (Incremental Static Regeneration)**  
You keep the **speed of static** pages but allow them to **update** after a **`revalidate`** interval, or via **`revalidatePath`** / **`revalidateTag`** after a mutation—without redeploying the whole app. This is the bridge between “static” and “always live.”

**How this maps to the App Router (mental model)**  
- Default **Server Components** + static-friendly data → closer to **SSG** / **ISR** when cached and revalidated.  
- Dynamic server work every time → closer to **SSR**.  
- **`"use client"`** interactivity after load → **CSR**-style behavior for that subtree.  

Official: [Rendering](https://nextjs.org/docs/app/building-your-application/rendering) · [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration).

### Data fetching in Server Components

In the App Router, **`fetch` in Server Components** participates in Next.js **caching** (see `cache` and `next.revalidate` options). You can also read databases directly (as in this project’s `app/lib/data.ts`) because that code never ships to the browser.

- **Parallel requests**: Use `Promise.all` (or multiple awaits) to run independent queries together.
- **Revalidation**: `revalidatePath` / `revalidateTag` after mutations (e.g. after a form `action` updates the DB).

Official: [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching).

### Forms and Server Actions

**Server Actions** are async functions that run on the server, often triggered from a `<form action={...}>`. They can validate input, mutate the database, and call `revalidatePath`. Use them to avoid writing separate API routes for many mutations.

Official: [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).

### Caching (high level)

Next.js layers include **Request Memoization**, **Data Cache**, and **Full Route Cache** (static routes). Mutations and `revalidatePath` / `revalidateTag` tie into this. Treat “cached until revalidated” as the default mental model for static-friendly routes.

Official: [Caching](https://nextjs.org/docs/app/building-your-application/caching).

### Metadata and SEO

Export **`metadata`** (static) or **`generateMetadata`** (dynamic) from `layout.tsx` or `page.tsx` to set title, description, Open Graph, etc., without manually managing `<head>` tags everywhere.

Official: [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata).

### `loading.tsx` and Suspense

**`loading.tsx`** provides immediate feedback while a route segment’s async work runs. **`Suspense`** boundaries let you wrap parts of the tree so only those subtrees show fallbacks. Both improve perceived performance via **streaming**.

Official: [Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming).

### Error handling

- **`error.tsx`**: Must be a Client Component; catches errors in child segments and allows a reset.
- **`not-found.tsx`**: Shown for missing resources; call `notFound()` from Server Components when a lookup fails.

Official: [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling).

### Route Handlers (`route.ts`)

Files like `app/api/.../route.ts` export functions named `GET`, `POST`, etc. They are your **HTTP API** inside the Next.js server—useful for webhooks, non-HTML responses, or clients that must call a REST endpoint.

Official: [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

### Middleware and Proxy (edge before the request)

**Middleware** (or the newer **Proxy** convention in recent Next.js versions) runs at the **edge** before a request completes. Typical uses: auth checks, redirects, rewrites, A/B splits. It should stay fast and avoid heavy DB work; session checks often use cookies/JWT.

This project uses Auth.js (`auth`) as the proxy/middleware entry. Official: [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) · [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware).

### Authentication (Auth.js / NextAuth)

**Auth.js** integrates with Next.js via route handlers and session helpers (`auth`, `signIn`, `signOut`). Sessions are validated on the server; middleware can protect route prefixes (e.g. `/dashboard`).

Official: [Auth.js Next.js](https://authjs.dev/getting-started/installation?framework=next.js).

### Styling

This app uses **Tailwind CSS** for utility-first styling. Next.js also supports CSS Modules, global CSS, and CSS-in-JS libraries with varying setup. Prefer **co-locating styles** near components and using layout for shared structure.

Official: [Styling](https://nextjs.org/docs/app/building-your-application/styling).

### Built-in optimizations

- **`next/image`**: Responsive images, lazy loading, modern formats (requires `remotePatterns` or `domains` for remote URLs in `next.config`).
- **`next/font`**: Self-hosted fonts with no layout shift (see `app/ui/font.ts` in this project).
- **`next/script`**: Control third-party script loading order and strategy.

Official: [Image](https://nextjs.org/docs/app/building-your-application/optimizing/images) · [Font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) · [Script](https://nextjs.org/docs/app/building-your-application/optimizing/scripts).

### Configuration (`next.config.ts`)

`next.config` is where you enable experimental flags, set `images.remotePatterns`, redirects, headers, TypeScript/eslint build behavior, etc. Keep it minimal and well-documented—each flag has implications for build and deployment.

Official: [next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js).

### Deployment

Next.js outputs a **Node.js server** by default (`next start`); you can also use **static export** for fully static sites or deploy to **Vercel** and other platforms that run the Node or Edge runtime. Environment variables for secrets must be set on the host (e.g. `POSTGRES_URL`), never committed.

Official: [Deploying](https://nextjs.org/docs/app/building-your-application/deploying).

### Where to go next

1. Work through [Learn Next.js](https://nextjs.org/learn) alongside this repo.
2. Use the [App Router reference](https://nextjs.org/docs/app/api-reference) when you need exact signatures.
3. When behavior surprises you, search the docs for **“Caching”** and **“Rendering”**—most “why did my page update / not update?” questions are answered there.
