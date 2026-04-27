/*
 * browser.js — GitHub file browser for Worksheets and Projects pages.
 *
 * Both pages share this script. The HTML page sets BROWSER_FOLDER
 * before loading this file:
 *   <script>var BROWSER_FOLDER = "Worksheets";</script>
 *   <script src="../js/pages/browser.js"></script>
 *
 * How it works:
 * 1. Shows language cards (Python, C++, etc.)
 * 2. When a language is clicked, fetches that repo's folder via GitHub API
 * 3. Renders a file list with folder navigation and breadcrumbs
 * 4. Clicking a file opens a preview panel (code, markdown, images, PDFs, docx)
 *
 * Requires (loaded via CDN in the HTML):
 *   - highlight.js — for code syntax highlighting
 *   - marked.js — for markdown rendering
 *   - mammoth.js — for .docx rendering
 */

// ---- Configuration ----
var GITHUB_ORG = "CCA-Coding-Club";
var GITHUB_BRANCH = "main";

// Languages the club supports — add new ones here
// name: display name, repo: exact GitHub repo name
var LANGUAGES = [
  { name: "Python", repo: "Python" },
  { name: "C++", repo: "Cplusplus" },
];

// File extensions grouped by preview type
var CODE_EXTENSIONS = [".py", ".js", ".java", ".cpp", ".c", ".h", ".hpp", ".cs", ".rb", ".go", ".rs", ".ts", ".css", ".html", ".json", ".xml", ".yaml", ".yml", ".sh", ".bat", ".sql", ".txt"];
var IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"];
var MARKDOWN_EXTENSIONS = [".md", ".markdown"];

// ---- State ----
var selectedLanguage = null;  // Currently selected language object
var currentPath = "";         // Current folder path within the repo

// ---- Main ----
document.addEventListener("DOMContentLoaded", function () {
  renderLanguageCards();
});

// ---- Language Cards ----

function renderLanguageCards() {
  var grid = document.getElementById("browser-grid");

  var html = "";
  for (var i = 0; i < LANGUAGES.length; i++) {
    var lang = LANGUAGES[i];
    html += '<div class="lang-card" onclick="selectLanguage(' + i + ')">';
    html += '<div class="lang-card__name">' + lang.name + '</div>';
    html += '</div>';
  }
  grid.innerHTML = html;
}

function selectLanguage(index) {
  selectedLanguage = LANGUAGES[index];
  currentPath = BROWSER_FOLDER;

  // Highlight the selected card
  var cards = document.querySelectorAll(".lang-card");
  for (var i = 0; i < cards.length; i++) {
    if (i === index) {
      cards[i].classList.add("active");
    } else {
      cards[i].classList.remove("active");
    }
  }

  // Show the file browser panel, close any open preview
  var panel = document.getElementById("browser-panel");
  panel.classList.add("open");
  closePreview();

  // Update breadcrumbs and load the folder
  updateBreadcrumbs();
  loadFolder(currentPath);
}

// ---- Folder Loading ----

async function loadFolder(path) {
  var fileList = document.getElementById("file-list");
  fileList.innerHTML = '<div class="status-message">Loading...</div>';
  closePreview();

  try {
    // Use the Trees API to get the full repo tree, then filter to path
    var apiUrl = "https://api.github.com/repos/" + GITHUB_ORG + "/" +
      selectedLanguage.repo + "/git/trees/" + GITHUB_BRANCH + "?recursive=1";

    var response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Could not reach GitHub");
    var data = await response.json();

    // Filter items that are direct children of the current path
    var items = [];
    for (var i = 0; i < data.tree.length; i++) {
      var item = data.tree[i];

      // Must start with the current path
      if (item.path.indexOf(path + "/") !== 0) continue;

      // Get the part after the current path
      var relativePath = item.path.substring(path.length + 1);

      // Must be a direct child (no more slashes)
      if (relativePath.indexOf("/") !== -1) continue;

      items.push({
        name: relativePath,
        fullPath: item.path,
        type: item.type === "tree" ? "folder" : "file",
        size: item.size || 0
      });
    }

    // Sort: folders first, then files, alphabetically within each
    items.sort(function (a, b) {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    renderFileList(items);
  } catch (error) {
    fileList.innerHTML = '<div class="status-message"><h3>Error</h3><p>Could not load files. Check your connection.</p></div>';
    console.error("Browser error:", error);
  }
}

// ---- Rendering ----

function renderFileList(items) {
  var fileList = document.getElementById("file-list");

  if (items.length === 0) {
    fileList.innerHTML = '<div class="status-message"><h3>Empty folder</h3><p>No files found here.</p></div>';
    return;
  }

  var html = '<div class="file-table">';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var ext = getExtension(item.name);
    var icon = getFileIcon(item.type, ext);

    if (item.type === "folder") {
      html += '<div class="file-row" onclick="navigateToFolder(\'' + escapeAttr(item.fullPath) + '\')">';
      html += '<span class="file-row__icon">' + icon + '</span>';
      html += '<span class="file-row__name">' + item.name + '</span>';
      html += '<span class="file-row__size"></span>';
      html += '</div>';
    } else {
      var rawUrl = getRawUrl(item.fullPath);
      var sizeStr = formatFileSize(item.size);
      var previewType = getPreviewType(ext);

      if (previewType) {
        // Previewable file — click opens preview
        html += '<div class="file-row" onclick="previewFile(\'' + escapeAttr(item.fullPath) + '\', \'' + escapeAttr(item.name) + '\')">';
        html += '<span class="file-row__icon">' + icon + '</span>';
        html += '<span class="file-row__name file-row__link">' + item.name + '</span>';
      } else {
        // Non-previewable — click opens raw in new tab
        html += '<div class="file-row" onclick="window.open(\'' + escapeAttr(rawUrl) + '\', \'_blank\')">';
        html += '<span class="file-row__icon">' + icon + '</span>';
        html += '<span class="file-row__name file-row__link">' + item.name + '</span>';
      }

      html += '<button class="file-row__download" onclick="event.stopPropagation(); downloadFile(\'' + escapeAttr(rawUrl) + '\', \'' + escapeAttr(item.name) + '\')" title="Download">Download</button>';
      html += '<span class="file-row__size">' + sizeStr + '</span>';
      html += '</div>';
    }
  }

  html += '</div>';
  fileList.innerHTML = html;
}

// ---- File Preview ----

async function previewFile(fullPath, fileName) {
  var preview = document.getElementById("file-preview");
  var previewTitle = document.getElementById("preview-title");
  var previewBody = document.getElementById("preview-body");

  previewTitle.textContent = fileName;
  previewBody.innerHTML = '<div class="status-message">Loading preview...</div>';
  preview.classList.add("open");

  var rawUrl = getRawUrl(fullPath);
  var ext = getExtension(fileName);
  var type = getPreviewType(ext);

  try {
    if (type === "code") {
      var response = await fetch(rawUrl);
      var text = await response.text();
      var codeHtml = escapeHtml(text);

      // Auto-detect language and highlight
      if (window.hljs) {
        var result = hljs.highlightAuto(text);
        codeHtml = result.value;
      }

      previewBody.innerHTML = '<pre><code class="hljs">' + codeHtml + '</code></pre>';

    } else if (type === "markdown") {
      var response = await fetch(rawUrl);
      var text = await response.text();
      previewBody.innerHTML = '<div class="markdown">' + marked.parse(text) + '</div>';

    } else if (type === "image") {
      previewBody.innerHTML = '<img class="preview-image" src="' + rawUrl + '" alt="' + fileName + '" />';

    } else if (type === "pdf") {
      previewBody.innerHTML = '<iframe class="preview-pdf" src="' + rawUrl + '"></iframe>';

    } else if (type === "docx") {
      var response = await fetch(rawUrl);
      var arrayBuffer = await response.arrayBuffer();

      if (window.mammoth) {
        var result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        previewBody.innerHTML = '<div class="markdown">' + result.value + '</div>';
      } else {
        previewBody.innerHTML = '<div class="status-message"><p>DOCX preview unavailable. <a href="' + rawUrl + '" download>Download instead</a>.</p></div>';
      }
    }
  } catch (error) {
    previewBody.innerHTML = '<div class="status-message"><h3>Preview failed</h3><p><a href="' + rawUrl + '" target="_blank">Open raw file</a></p></div>';
    console.error("Preview error:", error);
  }
}

function closePreview() {
  var preview = document.getElementById("file-preview");
  if (preview) preview.classList.remove("open");
}

// ---- Navigation ----

function navigateToFolder(path) {
  currentPath = path;
  updateBreadcrumbs();
  loadFolder(currentPath);
}

function navigateToBreadcrumb(path) {
  currentPath = path;
  updateBreadcrumbs();
  loadFolder(currentPath);
}

function updateBreadcrumbs() {
  var container = document.getElementById("breadcrumbs");

  // Split the path into parts: e.g. "Worksheets/subfolder" -> ["Worksheets", "subfolder"]
  var parts = currentPath.split("/");
  var html = '<span class="breadcrumb__lang">' + selectedLanguage.name + '</span>';

  var buildPath = "";
  for (var i = 0; i < parts.length; i++) {
    buildPath += (i === 0 ? "" : "/") + parts[i];

    html += '<span class="breadcrumb__sep">/</span>';

    if (i === parts.length - 1) {
      // Last part — not clickable
      html += '<span class="breadcrumb__current">' + parts[i] + '</span>';
    } else {
      // Clickable
      html += '<span class="breadcrumb__link" onclick="navigateToBreadcrumb(\'' + escapeAttr(buildPath) + '\')">' + parts[i] + '</span>';
    }
  }

  container.innerHTML = html;
}

// ---- Utility ----

function getRawUrl(fullPath) {
  return "https://raw.githubusercontent.com/" + GITHUB_ORG + "/" +
    selectedLanguage.repo + "/" + GITHUB_BRANCH + "/" + encodeURI(fullPath);
}

function getExtension(filename) {
  var dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.substring(dot).toLowerCase();
}

function getPreviewType(ext) {
  if (CODE_EXTENSIONS.indexOf(ext) !== -1) return "code";
  if (MARKDOWN_EXTENSIONS.indexOf(ext) !== -1) return "markdown";
  if (IMAGE_EXTENSIONS.indexOf(ext) !== -1) return "image";
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  return null;
}

function getFileIcon(type, ext) {
  if (type === "folder") return "📁";
  if (IMAGE_EXTENSIONS.indexOf(ext) !== -1) return "🖼️";
  if (ext === ".pdf") return "📕";
  if (ext === ".docx" || ext === ".doc") return "📝";
  if (MARKDOWN_EXTENSIONS.indexOf(ext) !== -1) return "📖";
  return "📄";
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Download a file by fetching it as a blob (bypasses cross-origin download restriction)
async function downloadFile(url, fileName) {
  try {
    var response = await fetch(url);
    var blob = await response.blob();
    var blobUrl = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error("Download failed:", e);
    window.open(url, "_blank");
  }
}
