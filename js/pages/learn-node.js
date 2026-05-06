/*
 * learn-node.js — Renders individual learning node content and handles
 * "Mark as Complete" progress tracking via localStorage.
 *
 * URL hash: #pathId/nodeId
 */

var LEARN_CONTENT_BASE = 'https://raw.githubusercontent.com/CCA-Coding-Club/Discord-with-Python/main';

async function fetchPathData(pathId) {
    var res = await fetch(LEARN_CONTENT_BASE + '/' + pathId + '/path.json');
    return res.json();
}

async function fetchNodeContent(pathId, nodeId) {
    var res = await fetch(LEARN_CONTENT_BASE + '/' + pathId + '/' + nodeId + '/node.md');
    if (!res.ok) throw new Error('Node not found');
    return res.text();
}

function getLocalProgress(pathId) {
    try {
        return JSON.parse(localStorage.getItem('progress_' + pathId) || '[]');
    } catch (e) {
        return [];
    }
}

function saveLocalProgress(pathId, nodeId) {
    var completed = getLocalProgress(pathId);
    if (completed.indexOf(nodeId) === -1) {
        completed.push(nodeId);
        localStorage.setItem('progress_' + pathId, JSON.stringify(completed));
    }
}

function stripFrontMatter(markdown) {
    var match = markdown.match(/^---[\s\S]*?---\n/);
    return match ? markdown.slice(match[0].length) : markdown;
}

function renderCompleteButton(container, pathData, nodeId, isComplete) {
    container.innerHTML = '';

    if (isComplete) {
        container.innerHTML =
            '<button class="btn-complete already-done" disabled>✓ Already Completed</button>' +
            '<a class="btn-back" href="learn-path.html#' + pathData.id + '">← Back to Path</a>';
        return;
    }

    var btn = document.createElement('button');
    btn.className = 'btn-complete';
    btn.textContent = 'Mark as Complete';
    btn.onclick = function() {
        saveLocalProgress(pathData.id, nodeId);
        container.innerHTML =
            '<span class="complete-msg">✓ Marked as complete!</span>' +
            '<a class="btn-back" href="learn-path.html#' + pathData.id + '">← Back to Path</a>';
    };

    var backLink = document.createElement('a');
    backLink.className = 'btn-back';
    backLink.href = 'learn-path.html#' + pathData.id;
    backLink.textContent = '← Back to Path';

    container.appendChild(btn);
    container.appendChild(backLink);
}

async function init() {
    var hash = window.location.hash.slice(1);
    var parts = hash.split('/');
    if (parts.length < 2) { window.location.href = 'learn.html'; return; }

    var pathId = parts[0], nodeId = parts[1];

    var pathData, rawContent;
    try {
        [pathData, rawContent] = await Promise.all([
            fetchPathData(pathId),
            fetchNodeContent(pathId, nodeId)
        ]);
    } catch (e) {
        document.getElementById('node-content').innerHTML = '<p class="loading">Could not load content.</p>';
        return;
    }

    var node = pathData.nodes.find(function(n) { return n.id === nodeId; });
    if (!node) {
        document.getElementById('node-content').innerHTML = '<p class="loading">Node not found.</p>';
        return;
    }

    document.title = node.title + ' — CCA Coding Club';
    document.getElementById('path-link').textContent = pathData.title;
    document.getElementById('path-link').href = 'learn-path.html#' + pathId;
    document.getElementById('node-title').textContent = node.title;

    var badge = document.getElementById('node-badge');
    badge.textContent = node.type === 'challenge' ? 'Challenge' : 'Lesson';
    if (node.type === 'challenge') badge.classList.add('challenge');

    document.getElementById('node-content').innerHTML = marked.parse(stripFrontMatter(rawContent));
    hljs.highlightAll();

    var completedNodes = getLocalProgress(pathId);
    renderCompleteButton(
        document.getElementById('node-actions'),
        pathData, nodeId,
        completedNodes.indexOf(nodeId) !== -1
    );
}

init();
