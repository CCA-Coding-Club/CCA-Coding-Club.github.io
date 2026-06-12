/*
 * learn-config.js — Shared configuration and helpers for the Learn pages.
 *
 * The site reads all learning content from ONE central index repo, served via
 * GitHub Pages. paths.json in that repo is the master list of learning paths.
 * Each path entry may declare an optional "source" pointing at a *different*
 * repo, so new paths can be added by pushing to the central repo (or by
 * referencing another repo) — never by editing the website.
 *
 * This script must load before learn.js / learn-path.js / learn-node.js.
 * It exposes these globals:
 *   LEARN_CONTENT_BASE          — Pages URL of the central index repo
 *   resolvePathBase(entry)      — base URL for a path's content
 *   fetchPaths()                — the parsed paths.json array
 *   fetchPathEntry(pathId)      — the single paths.json entry with that id
 *   getLocalProgress(pathId)    — completed node ids from localStorage
 */

// Central index repo (CCA-Coding-Club/Learn) served via GitHub Pages.
var LEARN_CONTENT_BASE = 'https://cca-coding-club.github.io/Learn';

/*
 * Resolve the base URL that a path's content lives at.
 *
 *   (no source)                          -> {LEARN_CONTENT_BASE}/{entry.id}
 *   "https://..." (full URL)             -> used as-is (trailing slash trimmed)
 *   "owner/repo"                         -> https://owner.github.io/repo
 *   "owner/repo:subpath"                 -> https://owner.github.io/repo/subpath
 *   "owner/owner.github.io"              -> https://owner.github.io  (host root)
 *
 * There is no "@branch" component: GitHub Pages publishes one configured branch
 * per repo, so the branch is not selectable from the URL.
 */
function resolvePathBase(entry) {
    var source = entry.source;

    // Default: content is in the central repo under the path id.
    if (!source) return LEARN_CONTENT_BASE + '/' + entry.id;

    // Full URL passthrough (any host).
    if (/^https?:\/\//i.test(source)) return source.replace(/\/+$/, '');

    // Shorthand: owner/repo[:subpath]
    var subpath = '';
    var colon = source.indexOf(':');
    if (colon !== -1) {
        subpath = source.slice(colon + 1).replace(/^\/+|\/+$/g, '');
        source = source.slice(0, colon);
    }

    var parts = source.split('/');
    var owner = parts[0];
    var repo = parts[1] || '';
    var host = owner.toLowerCase() + '.github.io';

    // A repo literally named "<owner>.github.io" is served at the host root.
    var base = (repo.toLowerCase() === host)
        ? 'https://' + host
        : 'https://' + host + '/' + repo;

    return subpath ? base + '/' + subpath : base;
}

async function fetchPaths() {
    var res = await fetch(LEARN_CONTENT_BASE + '/paths.json');
    return res.json();
}

// Look up a single path entry by id (needed by learn-path/learn-node, which
// only receive a pathId from the URL hash and must read its "source" before
// resolving the content base).
async function fetchPathEntry(pathId) {
    var paths = await fetchPaths();
    var entry = paths.find(function(p) { return p.id === pathId; });
    if (!entry) throw new Error('Path not found: ' + pathId);
    return entry;
}

function getLocalProgress(pathId) {
    try {
        return JSON.parse(localStorage.getItem('progress_' + pathId) || '[]');
    } catch (e) {
        return [];
    }
}
