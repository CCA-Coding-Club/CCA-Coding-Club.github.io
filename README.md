# CCA Coding Club Website

The official website for the Community College of Aurora Coding Club.

## Tech Stack

- **HTML / CSS / JavaScript** — no frameworks, no build step
- **Firebase Cloud Firestore** — stores student challenge submissions
- **GitHub API** — challenges are pulled from a separate repo ([coding-challenges](https://github.com/CCA-Coding-Club/coding-challenges))
- **GitHub Pages** — hosts the site as static files

## How It Works

**Info Page** (`index.html`)  
Fetches `content/info.md` and renders it as markdown using [marked.js](https://marked.js.org/).

**Challenges Page** (`pages/challenges.html`)  
1. Fetches the challenge folder list from the `coding-challenges` repo via the GitHub Trees API (1 API call)
2. Fetches each challenge's `meta.json` and `challenge.md` from `raw.githubusercontent.com` (no rate limit)
3. When "View Solutions" is clicked, queries Firestore for student submissions

## Project Structure

```
├── index.html                      ← Homepage (root for GitHub Pages)
├── pages/                          ← All other pages go here
│   └── challenges.html
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
│       └── challenges.css
│
├── js/
│   ├── base/                       ← Config and setup, loaded first
│   │   └── firebase-config.js      ← Firestore database connection
│   ├── components/                 ← Shared logic used across pages
│   │   ├── navbar.js               ← Generates the nav on every page
│   │   └── markdown.js             ← Fetch and render .md files
│   └── pages/                      ← Logic specific to one page
│       ├── challenges.js           ← Fetch challenges from GitHub
│       └── submissions.js          ← Fetch submissions from Firestore
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

## Running Locally

Serve the root directory with any static file server:

```bash
npx serve
```

Then open `http://localhost:3000`.
