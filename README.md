# CCA Coding Club Website

The official website for the Community College of Aurora Coding Club.

## Tech Stack

- **HTML / CSS / JavaScript** — no frameworks, no build step
- **Firebase Cloud Firestore** — stores student challenge submissions
- **GitHub API** — challenges, worksheets, and projects are pulled from separate repos
- **GitHub Pages** — hosts the site as static files

### CDN Libraries (loaded per page, no install needed)

| Library | Size | Used on | Purpose |
|---------|------|---------|---------|
| [marked.js](https://marked.js.org/) | ~40KB | Challenges, Worksheets, Projects | Render markdown |
| [highlight.js](https://highlightjs.org/) | ~15KB | Challenges, Worksheets, Projects | Syntax highlighting |
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

## GitHub Repositories

| Repo | What it holds | Used by |
|------|--------------|---------|
| [`challenges`](https://github.com/CCA-Coding-Club/challenges) | Challenge markdown files and solutions | Challenges page |
| [`Python`](https://github.com/CCA-Coding-Club/Python) | Python worksheets and projects | Worksheets & Projects pages |
| [`Cplusplus`](https://github.com/CCA-Coding-Club/Cplusplus) | C++ worksheets and projects | Worksheets & Projects pages |

Each language repo follows this structure:
```
Python/
├── Worksheets/     ← fetched by the Worksheets page
│   ├── intro.py
│   └── loops.docx
└── Projects/       ← fetched by the Projects page
    └── calculator/
```

## Project Structure

```
├── index.html                      ← Homepage (root for GitHub Pages)
├── pages/                          ← All other pages go here
│   ├── challenges.html
│   ├── worksheets.html
│   └── projects.html
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
│   │   └── markdown.css            ← Rendered markdown content
│   └── pages/                      ← Styles specific to one page
│       ├── info.css
│       ├── challenges.css
│       └── browser.css             ← Shared by Worksheets & Projects
│
├── js/
│   ├── base/                       ← Config and setup, loaded first
│   │   └── firebase-config.js      ← Firestore database connection
│   ├── components/                 ← Shared logic used across pages
│   │   ├── navbar.js               ← Generates the nav on every page
│   │   └── markdown.js             ← Fetch and render .md files
│   └── pages/                      ← Logic specific to one page
│       ├── challenges.js           ← Fetch challenges from GitHub
│       ├── submissions.js          ← Fetch/create submissions from Firestore
│       └── browser.js              ← Shared file browser for Worksheets & Projects
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
