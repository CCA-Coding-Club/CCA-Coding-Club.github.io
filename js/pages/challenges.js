/*
 * challenges.js — Load challenges from the GitHub challenges repo.
 *
 * How it works:
 * 1. Calls the GitHub API once to get the list of challenge folders
 * 2. Fetches each folder's meta.json for title/date/description
 * 3. Renders clickable cards in the grid
 * 4. When a card is clicked, fetches the challenge.md and shows it
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

    // Step 2: Fetch meta.json for each challenge folder
    var challenges = [];
    for (var i = 0; i < folders.length; i++) {
      var meta = await fetchMeta(folders[i]);
      challenges.push({ id: folders[i], title: meta.title, date: meta.date, description: meta.description });
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
  } catch (error) {
    grid.innerHTML = '<div class="status-message"><h3>Error</h3><p>Could not load challenges. Check your connection.</p></div>';
    console.error("Failed to load challenges:", error);
  }
}

// Fetch the meta.json file for a challenge folder
async function fetchMeta(folderName) {
  try {
    var response = await fetch(RAW_BASE + "/" + folderName + "/meta.json");
    if (!response.ok) throw new Error("No meta.json");
    return await response.json();
  } catch (e) {
    // If there's no meta.json, use the folder name as a readable title
    // "fizzbuzz-remix" becomes "Fizzbuzz Remix"
    var title = folderName.replace(/-/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return { title: title, date: "", description: "" };
  }
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

  // Load and render the challenge markdown
  var body = document.getElementById("detail-body");
  body.innerHTML = '<p class="status-message">Loading...</p>';

  try {
    var response = await fetch(RAW_BASE + "/" + id + "/challenge.md");
    if (!response.ok) throw new Error("Failed to load");
    var markdown = await response.text();
    body.innerHTML = marked.parse(markdown);
  } catch (e) {
    body.innerHTML = '<p class="status-message">Could not load challenge details.</p>';
  }

  // Show the panel, reset solutions
  panel.classList.add("open");
  document.getElementById("solutions-container").innerHTML = "";
  var btn = document.getElementById("toggle-solutions-btn");
  btn.textContent = "View Solutions";
  btn.classList.remove("btn--primary");
}

// Close the detail panel
function closeDetail() {
  selectedChallengeId = null;
  document.getElementById("challenge-detail").classList.remove("open");
  var cards = document.querySelectorAll(".challenge-card");
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.remove("active");
  }
}

// Toggle the solutions section
function toggleSolutions() {
  var container = document.getElementById("solutions-container");
  var btn = document.getElementById("toggle-solutions-btn");

  if (container.innerHTML.trim()) {
    // Already showing — hide
    container.innerHTML = "";
    btn.textContent = "View Solutions";
    btn.classList.remove("btn--primary");
  } else {
    // Show solutions
    btn.textContent = "Hide Solutions";
    btn.classList.add("btn--primary");
    loadSubmissions(selectedChallengeId);
  }
}
