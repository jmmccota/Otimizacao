# Otimização

Online tool to learn Optimization (SIMO project): **Simplex** (Big-M, Two-Phase, Generalized),
**Transportation** (northwest corner, least cost, Vogel) and **Branch and Bound**, with every step of the
calculation shown. Runs entirely in the browser (no backend), installs as a PWA and works offline.
UI in Portuguese, English and Spanish.

Live at <https://otimizacao.js.org>.

## Development

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # unit + component tests (vitest)
pnpm lint
pnpm build      # type-check + production build into dist/
pnpm preview    # serve dist/ locally
```

Stack: React 19 + React Compiler, Vite, TanStack Router (file-based), Material UI, i18next, KaTeX, D3 (tree layout),
`glpk.js` (WebAssembly, runs in a Web Worker) for the Branch and Bound relaxations, `vite-plugin-pwa`.

The solvers are plain TypeScript in `src/lib` (no DOM) and are checked against GLPK and against the original
JavaScript implementation (`tests/`).

## Configuration (build-time environment variables)

| Variable | Purpose |
|---|---|
| `VITE_SITE_URL` | Public address, e.g. `https://otimizacao.js.org`. Used for `sitemap.xml`, canonical links, `robots.txt` and the `CNAME` file. Without it the sitemap is skipped (the build prints a warning). |
| `VITE_GA_MEASUREMENT_ID` | Optional override of the Google Analytics 4 ID (default: the project's own, `G-GKCC8YF8CM`), e.g. for a staging site. Analytics only loads after the visitor accepts the banner. |
| `VITE_CONTACT_EMAIL` | Optional. Shows an email address on the Contact page. |

Put them in `.env.local` for local builds. In CI they come from the workflow (`VITE_SITE_URL`) and from repository
**Variables** (the other two).

## Publishing on GitHub Pages (custom domain `otimizacao.js.org`)

The workflow in `.github/workflows/deploy.yml` lints, tests, builds and deploys `dist/` on every push to `main`.

1. **Repository settings → Pages → Source: “GitHub Actions”.** (The old site used the `gh-pages` branch; switch this.)
2. Push to `main`. The first deployment publishes at `https://<user>.github.io/<repo>/` until the domain works.
3. **Request the domain on js.org.** Open a pull request to [js-org/js.org](https://github.com/js-org/js.org) adding,
   in alphabetical order in `cnames_active.js`:

   ```js
   "otimizacao": "<github-user>.github.io",
   ```

   Read that repository's README first for its current rules (the site must be live and the repository must
   contain the `CNAME` file, which the build already generates).
4. When the pull request is merged and DNS has propagated, go back to **Settings → Pages** and tick
   **Enforce HTTPS**.

### How the static build works on GitHub Pages

GitHub Pages cannot rewrite URLs, so the build (`src/seo/ghPages.ts`) copies the app shell to one real file per
page (`simplex/index.html`, `simplex/about/index.html`, …). Deep links therefore answer with HTTP 200 (good for
search engines and AdSense), and unknown addresses get `404.html`, which shows the app's “page not found” screen.
Every page lives at a URL with a trailing slash (`/simplex/`). The build also emits `CNAME`, `.nojekyll`,
`robots.txt` and `sitemap.xml`. When you add a page, add its path to `PUBLIC_PATHS` in `src/seo/seo.ts` (a test fails if
you forget).

## Credits

SIMO: *Uma Ferramenta Online para Auxiliar o Ensino de Otimização* — presented at the Brazilian Symposium on
Operations Research (SBPO), 2016. Advisor: Prof. Ms. André Oliveira da Cruz. Authors:
[André](https://github.com/andrmalta), [Daniel](https://github.com/daniel22390),
[Elias](https://github.com/EliasLuiz) and [João](https://github.com/jmmccota). Licensed under GNU GPL v3.
