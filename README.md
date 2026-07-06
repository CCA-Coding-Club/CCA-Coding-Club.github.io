# CCA Coding Club Website

The official website for the Community College of Aurora Coding Club.

## Tech Stack

- **HTML / CSS / JavaScript** — no frameworks, no build step
- **Firebase Cloud Firestore** — stores student challenge submissions
- **GitHub API** — challenges, worksheets, and projects are pulled from separate repos
- **GitHub Pages** — hosts the site as static files; also serves the [`Learn`](https://github.com/CCA-Coding-Club/Learn) repo that the Learn pages read from
- **Browser `localStorage`** — remembers each learner's Learn progress (no account needed)

### CDN Libraries (loaded per page, no install needed)

| Library | Size | Used on | Purpose |
|---------|------|---------|---------|
| [marked.js](https://marked.js.org/) | ~40KB | Challenges, Worksheets, Projects, Learn | Render markdown |
| [highlight.js](https://highlightjs.org/) | ~15KB | Challenges, Worksheets, Projects, Learn | Syntax highlighting |
| [mammoth.js](https://github.com/mwilliamson/mammoth.js) | ~30KB | Worksheets, Projects | Render `.docx` files as HTML |
| [Firebase Compat SDK](https://firebase.google.com/) | ~80KB | Challenges | Read/write submissions |

## How It Works

**Info Page** (`index.html`)
Fetches `content/info.md` and renders it as markdown.

**Challenges Page** (`pages/challenges.html`)
1. Fetches challenge folders from the [`challenges`](https://github.com/CCA-Coding-Club/challenges) repo
2. Parses front matter from each `challenge.md` for title/date/description
3. "View Submissions" queries Firestore for student-submitted code
4. "View Solutions" fetches `solutions.md` from the challenge folder (language dropdown)
5. "Submit Solution" writes directly to Firestore via batch write

**Worksheets Page** (`pages/worksheets.html`)
GitHub-powered file browser. Shows language cards → fetches that repo's `Worksheets/` folder → displays files with inline preview (code, markdown, images, PDF, `.docx`).

**Projects Page** (`pages/projects.html`)
Same as Worksheets, but fetches the `Projects/` folder. Both pages share `browser.js`.

**Learn Pages** (`pages/learn.html`, `pages/learn-path.html`, `pages/learn-node.html`)
A three-step flow for guided, Duolingo-style learning paths. All content comes from the separate [`Learn`](https://github.com/CCA-Coding-Club/Learn) repo (served over GitHub Pages); the website never has to change to add or edit a path.

1. **Learn** (`learn.html`) — fetches `paths.json` from the Learn repo and renders one card per learning path, each showing a progress bar.
2. **Path** (`learn-path.html#<path-id>`) — fetches that path's `path.json` and draws an interactive SVG node graph. Lessons are diamonds, challenges are rounded rectangles; a node stays *locked* until the nodes its edges point from are complete.
3. **Node** (`learn-node.html#<path-id>/<node-id>`) — fetches the node's `node.md`, renders it as markdown, and offers a **Mark as Complete** button.

Progress is stored in the browser's `localStorage`, keyed by path id — there's no login. `js/base/learn-config.js` holds the content base URL (`LEARN_CONTENT_BASE`) and resolves where each path's files live (it can also point a path at a *different* repo via a `source` field — see below).

## GitHub Repositories

| Repo | What it holds | Used by |
|------|--------------|---------|
| [`challenges`](https://github.com/CCA-Coding-Club/challenges) | Challenge markdown files and solutions | Challenges page |
| [`Python`](https://github.com/CCA-Coding-Club/Python) | Python worksheets and projects | Worksheets & Projects pages |
| [`Cplusplus`](https://github.com/CCA-Coding-Club/Cplusplus) | C++ worksheets and projects | Worksheets & Projects pages |
| [`Learn`](https://github.com/CCA-Coding-Club/Learn) | Learning paths — the master `paths.json`, each path's `path.json`, and per-node `node.md` lessons | Learn pages |

Each language repo follows this structure:
```
Python/
├── Worksheets/     ← fetched by the Worksheets page
│   ├── intro.py
│   └── loops.docx
└── Projects/       ← fetched by the Projects page
    └── calculator/
```

The `Learn` repo is the single source of truth for every learning path — adding or
editing a path is just a push there, no website change required. Its layout:

```
Learn/
├── paths.json              ← master list (one entry per path → one card)
├── .nojekyll               ← required so node.md is served verbatim, not as HTML
└── <path-id>/
    ├── path.json           ← the node graph (nodes + edges)
    └── <node-id>/
        └── node.md         ← the lesson / challenge content (Markdown)
```

A path entry can instead set a `source` field to pull its content from another repo
(that repo needs Pages enabled and its own `.nojekyll`). See the Learn repo's
[`README.md`](https://github.com/CCA-Coding-Club/Learn/blob/main/README.md) and
[`AUTHORING.md`](https://github.com/CCA-Coding-Club/Learn/blob/main/AUTHORING.md)
for the full authoring guide.

## Project Structure

```
├── index.html                      ← Homepage (root for GitHub Pages)
├── pages/                          ← All other pages go here
│   ├── challenges.html
│   ├── worksheets.html
│   ├── projects.html
│   ├── learn.html                  ← Learning path cards
│   ├── learn-path.html             ← SVG node graph for one path
│   └── learn-node.html             ← A single lesson / challenge
│
├── content/                        ← Editable content (markdown files)
│   └── info.md
│
├── css/
│   ├── base/                       ← Foundational styles, loaded on every page
│   │   ├── variables.css           ← Colors, fonts, spacing tokens
│   │   └── reset.css               ← Browser default normalization
│   ├── components/                 ← Reusable UI pieces
│   │   ├── navbar.css              ← Top navigation bar
│   │   ├── markdown.css            ← Rendered markdown content
│   │   └── graph.css               ← Learn path SVG node graph
│   └── pages/                      ← Styles specific to one page
│       ├── info.css
│       ├── challenges.css
│       ├── browser.css             ← Shared by Worksheets & Projects
│       └── learn.css               ← Shared by all three Learn pages
│
├── js/
│   ├── base/                       ← Config and setup, loaded first
│   │   ├── firebase-config.js      ← Firestore database connection
│   │   └── learn-config.js         ← Learn content base URL + path/progress helpers
│   ├── components/                 ← Shared logic used across pages
│   │   ├── navbar.js               ← Generates the nav on every page
│   │   └── markdown.js             ← Fetch and render .md files
│   └── pages/                      ← Logic specific to one page
│       ├── challenges.js           ← Fetch challenges from GitHub
│       ├── submissions.js          ← Fetch/create submissions from Firestore
│       ├── browser.js              ← Shared file browser for Worksheets & Projects
│       ├── learn.js                ← Render path cards
│       ├── learn-path.js           ← Build the SVG node graph + unlock logic
│       └── learn-node.js           ← Render a node + "Mark as Complete"
│
└── assets/                         ← Images, icons, graphics
    ├── favicon.svg
    └── icons.svg
```

### Why this structure?

- **`base/`** = stuff every page needs (variables, reset, firebase config)
- **`components/`** = reusable pieces shared across pages (navbar, markdown renderer)
- **`pages/`** = code that only runs on one specific page

This pattern is the same for both `css/` and `js/`, so once you learn it for one you know it for both.

## Adding a New Page

1. Create `pages/mypage.html`
2. Add a CSS file at `css/pages/mypage.css`
3. Add a JS file at `js/pages/mypage.js` (if needed)
4. Add one line to the `PAGES` array in `js/components/navbar.js`:
   ```js
   { name: "My Page", href: "pages/mypage.html" },
   ```

The navbar updates automatically on every page.

## Adding a New Language

Add one line to the `LANGUAGES` array in `js/pages/browser.js`:

```js
{ name: "Java", repo: "Java" },
```

Then create the repo on GitHub with `Worksheets/` and `Projects/` folders.

## File Preview Support

The Worksheets and Projects pages can preview files inline:

| File type | How it's rendered |
|-----------|------------------|
| `.py`, `.js`, `.cpp`, `.java`, `.txt`, etc. | Syntax-highlighted code block |
| `.md` | Rendered markdown |
| `.png`, `.jpg`, `.svg`, `.gif` | Inline image |
| `.pdf` | Embedded PDF viewer |
| `.docx` | Converted to HTML via mammoth.js |
| Other | Opens in new tab / download link |

## Running Locally

Serve the root directory with any static file server:

```bash
npx serve
```

Then open `http://localhost:3000`.
