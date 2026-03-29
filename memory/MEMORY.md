# alisonanders.com Project Memory

## Overview
Static art portfolio site for Alison Anders. Node.js custom build system (no webpack/vite), deploys to AWS S3.

## Node/npm
- Node: 22.21.0 (nvm, `.nvmrc` at root)
- npm: 11.x (use npm, not yarn — yarn.lock deleted)
- Run: `source ~/.nvm/nvm.sh && nvm use 22.21.0` before any node/npm commands

## Build System
- Entry: `index.js` (dev) / `NODE_ENV=production node index.js` (prod)
- Build pipeline lives in `build/*.js` (CommonJS modules)
- Uses EventEmitter (`BUILD_EVENTS`) for pipeline orchestration
- Production: minify HTML/JS/CSS → hash assets → gzip → exit
- Dev: chokidar file watcher, express static server on port 3000

## Key Tech Stack
- Templates: EJS + gray-matter (front matter)
- Styles: Dart Sass (`sass` package, not `node-sass`)
- JS bundling: Browserify + Babelify
- HTML minify: `html-minifier-terser`
- Asset hashing: Node `crypto` SHA-256 (8-char hex suffix)
- Gzip: Node `zlib` (promisified)
- Logging/colors: `chalk@4` (last CommonJS version)
- Deploy: `s3-uploader.js` → AWS S3 + CloudFront invalidation

## Package Notes
- `chalk@4` required (v5 is ESM-only, project is CommonJS)
- `chokidar@3` required (v4 is ESM-only)
- `glob` v11 — use `{ globSync }` destructuring for sync
- No `gulp`, `watchify`, `vinyl-*`, `colors`, `node-sass`, `xxhash`, `merge`, `copy` (all removed)
- `express-static` removed — use `express.static()` built-in

## Build Output (package/)
- Hashed filenames: `all-b415763a.js`, `main-c2fe6c01.css` etc.
- Both `.gz` and uncompressed versions of HTML/CSS/JS/XML
- 16 piece pages under `package/piece/<name>/index.html`
- `sitemap.xml`, `robots.txt`, `humans.txt`

## Sass Warnings (non-breaking)
- `@import` rules are deprecated in Dart Sass 3.0 (existing SCSS uses them)
- Division `/` operator deprecated in `_mixins.scss`
- Leave these as-is unless user asks to fix SCSS

## Scripts
- `npm start` — dev server + watch
- `npm run build` — production build
- `npm run deploy` — prod deploy to S3 (requires AWS env vars)
- `npm run stage` — staging deploy
