# Task Manager — Next.js 15 + tRPC

A simple task management app built for a technical challenge. The back-end keeps
tasks **in memory** and exposes them through **tRPC**; the front-end uses
**Next.js 15 (App Router)**, **React 19**, **TanStack Query** and **Material UI**.

The repository is a small monorepo (npm workspaces) with two folders:

- **`back-end/`** (`@task-manager/back-end`): everything server-side — the tRPC router,
  business rules, validation (Zod) and the in-memory store.
- **`front-end/`** (`@task-manager/front-end`): the Next.js app — pages, components and
  the tRPC client.

It is still **a single Next.js application**: the front-end's `/api/trpc` route only mounts
the HTTP handler provided by the back-end, so `npm run dev` starts everything in one process.

## Getting started

Requirements: Node.js 22.12+ (needed by the test runner; the app itself runs on 18.18+).
Run the commands from the **repository root**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production build:

```bash
npm run build
npm start
```

Type-check both packages:

```bash
npm run typecheck
```

Run the tests:

```bash
npm test
```

> The app starts with 25 sample tasks so the list and the infinite scroll can be seen
> right away. Since data lives in memory, **everything is lost when the server restarts**.

> In development every tRPC call has an artificial 400 ms delay so the loading states are
> visible. Disable it with `TRPC_DELAY_MS=0 npm run dev`.

Extras beyond the requirements:

- **Task status** (not started / in progress / done), changed from a status chip on each
  card with an optimistic update (`changeStatus` procedure).
- Long descriptions are truncated to 200 characters on the list, with a dialog to read the full task.
- Delete confirmation dialog (instead of the browser's `window.confirm`).
- Accessible UI (see [Accessibility](#accessibility)) and automatic light/dark mode.



