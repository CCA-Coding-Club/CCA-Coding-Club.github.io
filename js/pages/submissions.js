/*
 * submissions.js — Load and display student submissions from Firestore.
 *
 * When "View Submissions" is clicked on a challenge, this script:
 * 1. Queries Firestore for all submissions for that challenge
 * 2. For each member, shows their attempts with the code they submitted
 * 3. If a member has multiple attempts, lets you page through them
 *
 * Requires: firebase-config.js to be loaded first (provides the "db" variable)
 */

// ---- Main Function ----

// Load submissions for a challenge and display them
async function loadSubmissions(challengeId) {
  var container = document.getElementById("submissions-container");
  if (!container || !challengeId) return;

  container.innerHTML = '<div class="status-message">Loading submissions...</div>';

  try {
    // Query Firestore for submissions matching this challenge
    var snapshot = await db.collection("ChallengeSubmissions")
      .where("challengeId", "==", challengeId)
      .orderBy("lastActivityDate", "desc")
      .get();

    var submissions = [];
    snapshot.forEach(function (doc) {
      submissions.push(doc.data());
    });

    // If no submissions exist yet
    if (submissions.length === 0) {
      container.innerHTML =
        '<div class="solutions"><div class="solutions__body">' +
        '<div class="status-message"><h3>No submissions yet</h3>' +
        '<p>Be the first to submit over the CCA Coding Club Discord!</p></div>' +
        '</div></div>';
      return;
    }

    // Build the HTML for all submissions
    var html = '<div class="solutions">';
    html += '<div class="solutions__header"><h3>Submissions (' + submissions.length + ')</h3></div>';
    html += '<div class="solutions__body">';

    for (var i = 0; i < submissions.length; i++) {
      html += buildMemberGroup(submissions[i]);
    }

    html += '</div></div>';
    container.innerHTML = html;

    // Load the code for the first visible attempt of each member
    loadVisibleCode();

  } catch (error) {
    container.innerHTML =
      '<div class="status-message"><h3>Error</h3><p>Could not load submissions.</p></div>';
    console.error("Submissions error:", error);
  }
}

// ---- Building HTML ----

// Build the HTML for one member's submission group
function buildMemberGroup(sub) {
  // Sort attempts newest first
  var history = sub.submissionHistory.slice().sort(function (a, b) {
    return b.attempt - a.attempt;
  });

  var memberId = "member-" + sub.memberName.replace(/\s/g, "-");
  var html = '<div class="member-group" id="' + memberId + '">';

  // Header with member name and pagination (if multiple attempts)
  html += '<div class="member-group__header">';
  html += '<span>' + sub.memberName + ' — ' + history.length + ' attempt(s)</span>';

  if (history.length > 1) {
    html += '<div class="member-group__pagination">';
    html += '<button class="btn btn--small" onclick="changeAttempt(\'' + memberId + '\', -1)">← Newer</button>';
    html += '<span class="member-group__page-info" data-page>1 / ' + history.length + '</span>';
    html += '<button class="btn btn--small" onclick="changeAttempt(\'' + memberId + '\', 1)">Older →</button>';
    html += '</div>';
  }
  html += '</div>';

  // Render each attempt (only show the first one, hide the rest)
  for (var i = 0; i < history.length; i++) {
    var attempt = history[i];
    var display = i === 0 ? "" : "display:none";
    html += '<div class="attempt" data-attempt-idx="' + i + '" style="' + display + '">';
    html += '<div class="attempt__header">';
    html += '<span>Attempt #' + attempt.attempt + '</span>';
    html += '<span>' + new Date(attempt.submissionDate).toLocaleDateString() + '</span>';
    html += '</div>';
    html += '<div class="attempt__code" data-submission-id="' + attempt.submissionId + '">';
    html += '<p class="attempt__placeholder">Loading code...</p>';
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

// ---- Loading Code ----

// Load code for all currently visible attempts
async function loadVisibleCode() {
  var attempts = document.querySelectorAll(".attempt");

  for (var i = 0; i < attempts.length; i++) {
    // Skip hidden attempts
    if (attempts[i].style.display === "none") continue;

    var codeContainer = attempts[i].querySelector(".attempt__code");
    var submissionId = codeContainer.getAttribute("data-submission-id");

    // Skip if already loaded
    if (!submissionId || codeContainer.getAttribute("data-loaded")) continue;

    try {
      var doc = await db.collection("ChallengeSubmissionsCode").doc(submissionId).get();

      if (doc.exists) {
        var code = doc.data().submissionCode;
        var languageName = "";
        var codeHtml = escapeHtml(code);
        
        // Auto-detect language and highlight if available
        if (window.hljs) {
          var result = hljs.highlightAuto(code);
          codeHtml = result.value; // The library returns pre-escaped HTML here
          languageName = result.language || "text";
        }
        
        var langBadge = languageName ? '<div class="attempt__lang">' + languageName + '</div>' : '';
        codeContainer.innerHTML = langBadge + '<pre><code class="hljs">' + codeHtml + '</code></pre>';
      } else {
        codeContainer.innerHTML = '<p class="attempt__placeholder">Code not available</p>';
      }

      codeContainer.setAttribute("data-loaded", "true");
    } catch (e) {
      codeContainer.innerHTML = '<p class="attempt__placeholder">Failed to load code</p>';
    }
  }
}

// ---- Pagination ----

// Switch which attempt is shown for a member (direction: -1 = newer, +1 = older)
function changeAttempt(memberId, direction) {
  var group = document.getElementById(memberId);
  if (!group) return;

  var attempts = group.querySelectorAll(".attempt");
  var pageInfo = group.querySelector("[data-page]");

  // Find which attempt is currently visible
  var currentIdx = 0;
  for (var i = 0; i < attempts.length; i++) {
    if (attempts[i].style.display !== "none") {
      currentIdx = i;
      break;
    }
  }

  var newIdx = currentIdx + direction;
  if (newIdx < 0 || newIdx >= attempts.length) return;

  // Hide current, show new
  attempts[currentIdx].style.display = "none";
  attempts[newIdx].style.display = "";

  // Update the page counter
  if (pageInfo) pageInfo.textContent = (newIdx + 1) + " / " + attempts.length;

  // Load code for the newly visible attempt
  loadVisibleCode();
}

// ---- Utility ----

// Escape HTML characters to safely display user-submitted code
function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---- Submitting Code ----

async function submitSolution() {
  // Uses selectedChallengeId from challenges.js
  if (!selectedChallengeId) return;

  var nameInput = document.getElementById("submit-name");
  var codeInput = document.getElementById("submit-code");
  var errorEl = document.getElementById("submit-error");
  var submitBtn = document.getElementById("submit-btn");

  var memberName = nameInput.value.trim();
  var code = codeInput.value.trim();

  if (!memberName) {
    errorEl.textContent = "Please enter your Member Name.";
    return;
  }
  if (!code) {
    errorEl.textContent = "Please paste your code before submitting.";
    return;
  }

  errorEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Generate the exact same document ID structure the discord bot uses
    var subDocId = selectedChallengeId + "_" + memberName;
    var subRef = db.collection('ChallengeSubmissions').doc(subDocId);
    
    // Check if member already has submissions for this challenge to determine attempt number
    var subDoc = await subRef.get();
    var attemptNumber = 1;
    if (subDoc.exists) {
      var history = subDoc.data().submissionHistory || [];
      attemptNumber = history.length + 1;
    }

    // Always append "Z" for standard UTC string parity if we aren't using an exact ISO.
    // The standard .toISOString() does this.
    var now = new Date().toISOString();
    
    // 1. Create code ref
    var codeRef = db.collection('ChallengeSubmissionsCode').doc();
    var submissionId = codeRef.id;

    // 2. Setup batch
    var batch = db.batch();

    batch.set(codeRef, {
      submissionId: submissionId,
      submissionDate: now,
      submissionCode: code
    });

    batch.set(subRef, {
      challengeId: selectedChallengeId,
      memberName: memberName,
      lastActivityDate: now,
      submissionHistory: firebase.firestore.FieldValue.arrayUnion({
        attempt: attemptNumber,
        submissionDate: now,
        submissionId: submissionId
      })
    }, { merge: true });

    // 3. Commit
    await batch.commit();

    // Reset and close modal
    closeSubmitModal();
    
    // Auto-open or refresh the submissions tab
    var subContainer = document.getElementById("submissions-container");
    if (!subContainer.innerHTML.trim()) {
      toggleSubmissions(); 
    } else {
      loadSubmissions(selectedChallengeId); 
    }

  } catch (err) {
    console.error("Failed to submit solution:", err);
    errorEl.textContent = "Submission failed! Check connection or contact an admin.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
}
