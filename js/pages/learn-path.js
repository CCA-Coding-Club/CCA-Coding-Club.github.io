/*
 * learn-path.js — Renders the interactive SVG learning-path graph.
 *
 * URL hash: #pathId
 * Progress is stored in localStorage (keyed by pathId).
 * Node states: locked | available | complete
 * Clicking an available or complete node navigates to learn-node.html#pathId/nodeId
 */

// SVG geometry constants
var DIAMOND_HW = 75;
var DIAMOND_HH = 55;
var CHALLENGE_HW = 110;
var CHALLENGE_HH = 28;
var SVG_W = 760;
var SVG_H = 810;

// Build a map of nodeId -> 'locked' | 'available' | 'complete'
function computeStates(nodes, edges, completedNodes) {
    var completed = new Set(completedNodes);
    var prereqs = {};
    nodes.forEach(function(n) { prereqs[n.id] = []; });
    edges.forEach(function(e) { prereqs[e.to].push(e.from); });

    var states = {};
    nodes.forEach(function(node) {
        if (completed.has(node.id)) {
            states[node.id] = 'complete';
        } else {
            var allDone = prereqs[node.id].every(function(p) { return completed.has(p); });
            states[node.id] = allDone ? 'available' : 'locked';
        }
    });
    return states;
}

function edgePoints(from, to) {
    function dims(node) {
        return node.type === 'challenge'
            ? { hw: CHALLENGE_HW, hh: CHALLENGE_HH }
            : { hw: DIAMOND_HW, hh: DIAMOND_HH };
    }
    var fd = dims(from), td = dims(to);
    var dx = to.x - from.x, dy = to.y - from.y;

    if (Math.abs(dy) >= Math.abs(dx)) {
        return dy > 0
            ? { x1: from.x, y1: from.y + fd.hh, x2: to.x, y2: to.y - td.hh }
            : { x1: from.x, y1: from.y - fd.hh, x2: to.x, y2: to.y + td.hh };
    } else {
        return dx > 0
            ? { x1: from.x + fd.hw, y1: from.y, x2: to.x - td.hw, y2: to.y }
            : { x1: from.x - fd.hw, y1: from.y, x2: to.x + td.hw, y2: to.y };
    }
}

function wrapText(title, maxChars) {
    var words = title.split(' ');
    var lines = [], current = '';
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (!current) {
            current = word;
        } else if (current.length + 1 + word.length <= maxChars) {
            current += ' ' + word;
        } else {
            lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function svgLabel(cx, cy, title, maxChars) {
    var lines = wrapText(title, maxChars);
    var lineH = 16;
    var startY = cy - ((lines.length - 1) * lineH / 2);
    return lines.map(function(line, i) {
        return '<text class="node-label" x="' + cx + '" y="' + (startY + i * lineH) +
               '" text-anchor="middle" dominant-baseline="middle">' +
               line.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text>';
    }).join('');
}

function renderEdge(from, to, states) {
    var pts = edgePoints(from, to);
    var active = states[from.id] === 'complete';
    var cls = 'graph-edge' + (active ? ' active' : '');
    var marker = active ? 'url(#arrow-active)' : 'url(#arrow)';
    return '<line class="' + cls + '" x1="' + pts.x1 + '" y1="' + pts.y1 +
           '" x2="' + pts.x2 + '" y2="' + pts.y2 +
           '" marker-end="' + marker + '"/>';
}

function renderNode(node, state, pathId) {
    var cls = 'graph-node ' + state;
    var shape = '', label = '';

    if (node.type === 'challenge') {
        var rx = node.x - CHALLENGE_HW, ry = node.y - CHALLENGE_HH;
        shape = '<rect class="node-shape" x="' + rx + '" y="' + ry +
                '" width="' + (CHALLENGE_HW * 2) + '" height="' + (CHALLENGE_HH * 2) + '" rx="12"/>';
        label = svgLabel(node.x, node.y, node.title, 20);
    } else {
        var hw = DIAMOND_HW, hh = DIAMOND_HH;
        var pts = node.x + ',' + (node.y - hh) + ' ' +
                  (node.x + hw) + ',' + node.y + ' ' +
                  node.x + ',' + (node.y + hh) + ' ' +
                  (node.x - hw) + ',' + node.y;
        shape = '<polygon class="node-shape" points="' + pts + '"/>';
        label = svgLabel(node.x, node.y, node.title, 11);
    }

    var topY = node.y - (node.type === 'challenge' ? CHALLENGE_HH : DIAMOND_HH) - 8;

    var check = state === 'complete'
        ? '<text class="node-check" x="' + node.x + '" y="' + topY +
          '" text-anchor="middle" dominant-baseline="auto">✓</text>'
        : '';

    var lock = state === 'locked'
        ? '<text class="node-label" x="' + node.x + '" y="' + topY +
          '" text-anchor="middle" dominant-baseline="auto" style="font-size:13px;fill:#4a5568">🔒</text>'
        : '';

    var href = state !== 'locked' ? 'href="learn-node.html#' + pathId + '/' + node.id + '"' : '';
    var tag = state !== 'locked' ? 'a' : 'g';

    return '<' + tag + ' class="' + cls + '" ' + href + '>' +
        shape + label + check + lock +
    '</' + tag + '>';
}

function buildSVG(pathData, states) {
    var pathId = pathData.id;
    var nodeMap = {};
    pathData.nodes.forEach(function(n) { nodeMap[n.id] = n; });

    var parts = [
        '<svg class="graph-svg" viewBox="0 0 ' + SVG_W + ' ' + SVG_H + '" xmlns="http://www.w3.org/2000/svg">',
        '<defs>',
        '<marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">',
        '<polygon points="0 0, 8 3, 0 6" fill="#3a3f55"/></marker>',
        '<marker id="arrow-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">',
        '<polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/></marker>',
        '</defs>',
        '<g class="edges">',
    ];

    pathData.edges.forEach(function(edge) {
        var from = nodeMap[edge.from], to = nodeMap[edge.to];
        if (from && to) parts.push(renderEdge(from, to, states));
    });

    parts.push('</g><g class="nodes">');
    pathData.nodes.forEach(function(node) {
        parts.push(renderNode(node, states[node.id] || 'locked', pathId));
    });
    parts.push('</g></svg>');
    return parts.join('\n');
}

async function init() {
    var hash = window.location.hash.slice(1);
    if (!hash) { window.location.href = 'learn.html'; return; }

    var pathData;
    try {
        var entry = await fetchPathEntry(hash);
        var base = resolvePathBase(entry);
        pathData = await fetch(base + '/path.json').then(function(r) { return r.json(); });
    } catch (e) {
        document.getElementById('graph-container').innerHTML = '<p class="loading">Could not load path data.</p>';
        return;
    }

    document.getElementById('path-title').textContent = pathData.title;
    document.title = pathData.title + ' — CCA Coding Club';

    var completedNodes = getLocalProgress(hash);
    var states = computeStates(pathData.nodes, pathData.edges, completedNodes);
    document.getElementById('graph-container').innerHTML = buildSVG(pathData, states);
    document.getElementById('progress-label').textContent =
        completedNodes.length + ' / ' + pathData.nodes.length + ' nodes complete';
}

init();
