/*
 * navbar.js — Generates the navbar on every page.
 *
 * The navbar is defined HERE, once.
 * Each HTML page just needs: <div id="navbar"></div>
 *
 * To add a new page, add an entry to the PAGES array below.
 */

// ---- Define your pages here ----
// { name: "Link Text", href: "filename.html" }
var PAGES = [
  { name: "Info", href: "index.html" },
  { name: "Challenges", href: "pages/challenges.html" },
  { name: "Worksheets", href: "pages/worksheets.html" },
  { name: "Projects", href: "pages/projects.html" },
];

// ---- Build and inject the navbar ----
document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("navbar");
  if (!container) return;

  // Figure out where this page is relative to root
  // Pages in subfolders need "../" to reach root-level files
  var depth = window.location.pathname.split("/pages/").length - 1;
  var prefix = depth > 0 ? "../" : "";

  // Figure out which page is active
  var currentFile = window.location.pathname.split("/").pop() || "index.html";

  // Build nav links
  var linksHtml = "";
  for (var i = 0; i < PAGES.length; i++) {
    var page = PAGES[i];
    var href = prefix + page.href;
    var active = page.href.indexOf(currentFile) !== -1 ? " active" : "";
    linksHtml += '<a href="' + href + '" class="navbar__link' + active + '">' + page.name + '</a>';
  }

  // Inject the full navbar
  container.innerHTML =
    '<nav class="navbar"><div class="navbar__inner">' +
    '<a href="' + prefix + 'index.html" class="navbar__brand">' +
    '<div class="navbar__logo">CC</div>Coding Club</a>' +
    '<div class="navbar__links">' + linksHtml + '</div>' +
    '</div></nav>';
});
