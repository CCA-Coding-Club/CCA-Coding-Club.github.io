/*
 * learn.js — Learning path selection page.
 *
 * Fetches paths.json from the Discord-with-Python repo and renders path cards.
 * Progress is read from localStorage (keyed by pathId).
 */

var LEARN_CONTENT_BASE = 'https://raw.githubusercontent.com/CCA-Coding-Club/Discord-with-Python/main';

async function fetchPaths() {
    var res = await fetch(LEARN_CONTENT_BASE + '/paths.json');
    return res.json();
}

function getLocalProgress(pathId) {
    try {
        return JSON.parse(localStorage.getItem('progress_' + pathId) || '[]');
    } catch (e) {
        return [];
    }
}

function pathCardHTML(path, done, total) {
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return '<a class="path-card" href="learn-path.html#' + path.id + '">' +
        '<div class="path-card-top">' +
            '<span class="path-icon">' + path.icon + '</span>' +
            '<h2>' + path.title + '</h2>' +
        '</div>' +
        '<p>' + path.description + '</p>' +
        '<div class="path-progress">' +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
            '<span class="progress-label">' + done + ' / ' + total + ' nodes complete</span>' +
        '</div>' +
    '</a>';
}

async function init() {
    var paths = await fetchPaths();
    var html = '';
    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var done = getLocalProgress(path.id).length;
        html += pathCardHTML(path, done, path.nodeCount || 0);
    }
    document.getElementById('paths-grid').innerHTML =
        html || '<p class="loading">No learning paths found.</p>';
}

init();
