/*
 * challenges.js — Load challenges from the GitHub challenges repo.
 *
 * How it works:
 * 1. Calls the GitHub API once to get the list of challenge folders
 * 2. Fetches each folder's challenge.md
 * 3. Parses front matter (metadata between --- delimiters at the top)
 * 4. Renders clickable cards in the grid
 * 5. When a card is clicked, shows the challenge content
 */

// ---- Configuration ----
// Change these if the repo name or org changes
var GITHUB_ORG = "CCA-Coding-Club";
var GITHUB_REPO = "challenges";
var GITHUB_BRANCH = "main";

// Base URL for fetching raw file content (no rate limit)
var RAW_BASE = "https://raw.githubusercontent.com/" + GITHUB_ORG + "/" + GITHUB_REPO + "/" + GITHUB_BRANCH;

// API URL for listing folders (rate limited to 60/hour, but we only call it once)
var API_TREE = "https://api.github.com/repos/" + GITHUB_ORG + "/" + GITHUB_REPO + "/git/trees/" + GITHUB_BRANCH;

// ---- State ----
var loadedChallenges = [];       // All challenges after loading
var selectedChallengeId = null;  // Currently selected challenge

// ---- Main Function ----
// This runs when the page loads
document.addEventListener("DOMContentLoaded", function () {
  loadAllChallenges();
});

// Load all challenges from GitHub and display them
async function loadAllChallenges() {
  var grid = document.getElementById("challenges-grid");
  grid.innerHTML = '<div class="status-message">Loading challenges...</div>';

  try {
    // Step 1: Get the list of folders from the GitHub API
    var response = await fetch(API_TREE);
    if (!response.ok) throw new Error("Could not reach GitHub");
    var data = await response.json();

    // Filter to only folders (type "tree"), ignore files like README.md
    var folders = [];
    for (var i = 0; i < data.tree.length; i++) {
      if (data.tree[i].type === "tree") {
        folders.push(data.tree[i].path);
      }
    }

    // Step 2: Fetch challenge.md for each folder and parse front matter
    var challenges = [];
    for (var i = 0; i < folders.length; i++) {
      var parsed = await fetchChallenge(folders[i]);
      challenges.push(parsed);
    }

    // Step 3: Sort by date (newest first)
    challenges.sort(function (a, b) {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    loadedChallenges = challenges;

    // Step 4: Render the cards
    renderCards(challenges);

    // Step 5: If the URL has a #hash, auto-open that challenge
    var hash = window.location.hash.substring(1);
    if (hash) selectChallenge(hash);
  } catch (error) {
    grid.innerHTML = '<div class="status-message"><h3>Error</h3><p>Could not load challenges. Check your connection.</p></div>';
    console.error("Failed to load challenges:", error);
  }
}

// Fetch challenge.md and parse front matter + content
async function fetchChallenge(folderName) {
  // Default values if anything goes wrong
  var fallbackTitle = folderName.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  var result = { id: folderName, title: fallbackTitle, date: "", description: "", content: "" };

  try {
    var response = await fetch(RAW_BASE + "/" + folderName + "/challenge.md");
    if (!response.ok) return result;

    var text = await response.text();
    var parsed = parseFrontMatter(text);

    result.title = parsed.meta.title || fallbackTitle;
    result.date = parsed.meta.date || "";
    result.description = parsed.meta.description || "";
    result.content = parsed.body;
  } catch (e) {
    // If fetch fails, return defaults
  }

  return result;
}

/*
 * Parse front matter from a markdown string.
 *
 * Front matter is metadata between --- delimiters at the top of the file:
 *
 *   ---
 *   title: My Challenge
 *   date: 2026-04-17
 *   description: A short summary
 *   ---
 *
 *   # The actual markdown content...
 *
 * Returns { meta: { title, date, description }, body: "markdown content" }
 */
function parseFrontMatter(text) {
  var meta = {};
  var body = text;

  // Check if the file starts with ---
  if (text.trimStart().startsWith("---")) {
    var trimmed = text.trimStart();
    // Find the closing ---
    var endIndex = trimmed.indexOf("---", 3);

    if (endIndex !== -1) {
      var frontMatter = trimmed.substring(3, endIndex).trim();
      body = trimmed.substring(endIndex + 3).trim();

      // Parse each line as "key: value"
      var lines = frontMatter.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var colonIndex = lines[i].indexOf(":");
        if (colonIndex !== -1) {
          var key = lines[i].substring(0, colonIndex).trim();
          var value = lines[i].substring(colonIndex + 1).trim();
          meta[key] = value;
        }
      }
    }
  }

  return { meta: meta, body: body };
}

// ---- Rendering ----

// Draw challenge cards into the grid
function renderCards(challenges) {
  var grid = document.getElementById("challenges-grid");

  if (challenges.length === 0) {
    grid.innerHTML = '<div class="status-message"><h3>No challenges yet</h3><p>Check back soon!</p></div>';
    return;
  }

  var html = "";
  for (var i = 0; i < challenges.length; i++) {
    var c = challenges[i];
    html += '<div class="challenge-card" data-id="' + c.id + '" onclick="selectChallenge(\'' + c.id + '\')">';
    html += '  <div class="challenge-card__label">' + (c.date || "Challenge") + '</div>';
    html += '  <div class="challenge-card__name">' + c.title + '</div>';
    html += '  <div class="challenge-card__desc">' + c.description + '</div>';
    html += '</div>';
  }
  grid.innerHTML = html;
}

// Filter challenges based on the search bar
function filterChallenges() {
  var input = document.getElementById("challenge-search").value.toLowerCase();
  var cards = document.querySelectorAll(".challenge-card");

  for (var i = 0; i < cards.length; i++) {
    var title = cards[i].querySelector(".challenge-card__name").textContent.toLowerCase();
    var desc = cards[i].querySelector(".challenge-card__desc").textContent.toLowerCase();

    if (title.indexOf(input) > -1 || desc.indexOf(input) > -1) {
      cards[i].style.display = "";
    } else {
      cards[i].style.display = "none";
    }
  }
}

// ---- Detail Panel ----

// Called when a challenge card is clicked
async function selectChallenge(id) {
  var panel = document.getElementById("challenge-detail");

  // Clicking the same card again closes the panel
  if (selectedChallengeId === id) {
    closeDetail();
    return;
  }

  selectedChallengeId = id;

  // Find the challenge data
  var challenge = null;
  for (var i = 0; i < loadedChallenges.length; i++) {
    if (loadedChallenges[i].id === id) {
      challenge = loadedChallenges[i];
      break;
    }
  }
  if (!challenge) return;

  // Highlight the clicked card
  var cards = document.querySelectorAll(".challenge-card");
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].getAttribute("data-id") === id) {
      cards[i].classList.add("active");
    } else {
      cards[i].classList.remove("active");
    }
  }

  // Fill in the panel header
  document.getElementById("detail-title").textContent = challenge.title;
  document.getElementById("detail-date").textContent = challenge.date
    ? new Date(challenge.date).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "";

  // Render the challenge content (already fetched during load)
  var body = document.getElementById("detail-body");
  if (challenge.content) {
    body.innerHTML = marked.parse(challenge.content);
  } else {
    body.innerHTML = '<p class="status-message">No challenge details available.</p>';
  }

  // Show the panel, reset both containers
  panel.classList.add("open");
  document.getElementById("submissions-container").innerHTML = "";
  document.getElementById("solutions-container").innerHTML = "";
  var subBtn = document.getElementById("toggle-submissions-btn");
  subBtn.textContent = "View Submissions";
  subBtn.classList.remove("btn--primary");
  var solBtn = document.getElementById("toggle-solutions-btn");
  solBtn.textContent = "View Solutions";
  solBtn.classList.remove("btn--primary");

  // Update the URL hash so people can share this link
  window.history.replaceState(null, "", "#" + id);
}

// Close the detail panel
function closeDetail() {
  selectedChallengeId = null;
  document.getElementById("challenge-detail").classList.remove("open");
  var cards = document.querySelectorAll(".challenge-card");
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.remove("active");
  }
  // Clear the hash from the URL
  window.history.replaceState(null, "", window.location.pathname);
}

// Toggle student submissions (from Firestore)
function toggleSubmissions() {
  var container = document.getElementById("submissions-container");
  var btn = document.getElementById("toggle-submissions-btn");

  if (container.innerHTML.trim()) {
    container.innerHTML = "";
    btn.textContent = "View Submissions";
    btn.classList.remove("btn--primary");
  } else {
    btn.textContent = "Hide Submissions";
    btn.classList.add("btn--primary");
    loadSubmissions(selectedChallengeId);
  }
}

// Toggle official solutions (from the challenges repo)
function toggleOfficialSolutions() {
  var container = document.getElementById("solutions-container");
  var btn = document.getElementById("toggle-solutions-btn");

  if (container.innerHTML.trim()) {
    container.innerHTML = "";
    btn.textContent = "View Solutions";
    btn.classList.remove("btn--primary");
  } else {
    btn.textContent = "Hide Solutions";
    btn.classList.add("btn--primary");
    loadOfficialSolutions(selectedChallengeId);
  }
}

// Fetch and display solutions.md from the challenges repo
async function loadOfficialSolutions(challengeId) {
  var container = document.getElementById("solutions-container");
  if (!container || !challengeId) return;

  container.innerHTML = '<div class="status-message">Loading solutions...</div>';

  try {
    var response = await fetch(RAW_BASE + "/" + challengeId + "/solutions.md");

    if (!response.ok) {
      container.innerHTML =
        '<div class="solutions"><div class="solutions__body">' +
        '<div class="status-message"><h3>No solutions yet</h3>' +
        '<p>Solutions will be posted by club leaders after the challenge.</p></div>' +
        '</div></div>';
      return;
    }

    var text = await response.text();
    var languages = parseSolutions(text);

    if (languages.length === 0) {
      container.innerHTML =
        '<div class="solutions"><div class="solutions__body">' +
        '<div class="status-message"><h3>No solutions yet</h3></div>' +
        '</div></div>';
      return;
    }

    // Build the dropdown and content
    var html = '<div class="solutions">';
    html += '<div class="solutions__header">';
    html += '<h3>Official Solutions</h3>';

    if (languages.length > 1) {
      html += '<select id="language-select" class="language-select" onchange="switchLanguage()">';
      for (var i = 0; i < languages.length; i++) {
        html += '<option value="' + i + '">' + languages[i].name + '</option>';
      }
      html += '</select>';
    }

    html += '</div>';

    // Render each language block (only first is visible)
    for (var i = 0; i < languages.length; i++) {
      var display = i === 0 ? "" : "display:none";
      html += '<div class="solutions__body language-block" data-lang-idx="' + i + '" style="' + display + '">';
      html += '<div class="markdown">' + marked.parse(languages[i].content) + '</div>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Apply syntax highlighting to code blocks
    container.querySelectorAll("pre code").forEach(function (block) {
      if (window.hljs) hljs.highlightElement(block);
    });

  } catch (error) {
    container.innerHTML =
      '<div class="status-message"><h3>Error</h3><p>Could not load solutions.</p></div>';
    console.error("Solutions error:", error);
  }
}

/*
 * Parse solutions.md into language sections.
 *
 * Format: each --LanguageName line starts a new language section.
 *
 *   --Python
 *   ```python
 *   code here
 *   ```
 *
 *   --JavaScript
 *   ```javascript
 *   code here
 *   ```
 *
 * Returns [{ name: "Python", content: "..." }, { name: "JavaScript", content: "..." }]
 */
function parseSolutions(text) {
  var languages = [];
  var sections = text.split(/^--/m);

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i].trim();
    if (!section) continue;

    // First line is the language name, rest is content
    var newlineIndex = section.indexOf("\n");
    if (newlineIndex === -1) continue;

    var name = section.substring(0, newlineIndex).trim();
    var content = section.substring(newlineIndex + 1).trim();

    if (name && content) {
      languages.push({ name: name, content: content });
    }
  }

  return languages;
}

// Switch between language tabs in the solutions view
function switchLanguage() {
  var select = document.getElementById("language-select");
  var idx = parseInt(select.value);
  var blocks = document.querySelectorAll(".language-block");

  for (var i = 0; i < blocks.length; i++) {
    blocks[i].style.display = (parseInt(blocks[i].getAttribute("data-lang-idx")) === idx) ? "" : "none";
  }
}

// ---- Submit Solution Modal ----

function openSubmitModal() {
  var modal = document.getElementById("submit-modal");
  if (!modal) return;
  
  // Clear previous inputs
  document.getElementById("submit-name").value = "";
  document.getElementById("submit-code").value = "";
  document.getElementById("submit-error").textContent = "";
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("submit-btn").textContent = "Submit";
  
  modal.style.display = "flex";
}

function closeSubmitModal() {
  var modal = document.getElementById("submit-modal");
  if (modal) {
    modal.style.display = "none";
  }
}
