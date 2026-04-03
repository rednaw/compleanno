# Compleanno

Static mini-sites for **birthday puzzle trails**: Wordle-style games, word search, picture/music/guess challenges, and small “code” finales. Each person or year lives under its own route (`/maria25/`, `/jan25/`, `/lrnz25/`, and so on).

## Stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [Vite 6](https://vitejs.dev/)
- [@sveltejs/adapter-static](https://github.com/sveltejs/kit/tree/main/packages/adapter-static) — full prerender, no server runtime

## Develop

```bash
npm install
npm run dev
```

Optional: open the dev server in a browser tab:

```bash
npm run dev -- --open
```

## Build and preview

```bash
npm run build
npm run preview
```

Output is written to `build/` (see `svelte.config.js`).

## Base path and deployment

Production builds assume the app is served under **`/compleanno`** (for example GitHub Pages project sites). That comes from `svelte.config.js`: when `NODE_ENV` is not `development`, `kit.paths.base` is set to `/compleanno`.

- **Local dev** (`npm run dev`): base is empty, so URLs start at `/` (e.g. `/maria25/`).
- **Production**: asset and page URLs are prefixed with `/compleanno` (for example `https://your-name.github.io/compleanno/maria25/`).

To **build for the site root** instead (no `/compleanno` prefix), set `VITE_PREVIEW=1` for the build so `kit.paths.base` stays empty (see `svelte.config.js`). After a normal production build, open the app from a URL that includes the `/compleanno` path, or use your host’s preview for that path.

## Project layout

- `src/routes/+page.svelte` — landing with links to each puzzle section
- `src/routes/maria25/` — hub + Wordle-like game, letter puzzles, code page
- `src/routes/jan25/` — word search and follow-on game
- `src/routes/lrnz25/` — hub + music, connections, picture, guess, code; progress uses `localStorage`

Global styles: `src/app.css`. Root layout sets viewport and global touch tweaks in `src/routes/+layout.svelte`.

## Quality checks

```bash
npm run lint
npm run format
```
