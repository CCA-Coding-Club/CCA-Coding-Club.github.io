/*
 * markdown.js — Fetch a markdown file and render it into a container.
 *
 * Uses the "marked" library loaded from CDN in the HTML file.
 * Call renderMarkdown(url, elementId) to fetch a .md file and
 * display the rendered HTML inside the element with that ID.
 */

async function renderMarkdown(url, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  try {
    container.innerHTML = '<p class="status-message">Loading...</p>';

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load content");

    const markdownText = await response.text();
    container.innerHTML = marked.parse(markdownText);
  } catch (error) {
    container.innerHTML =
      '<div class="status-message"><h3>Error</h3><p>Could not load content.</p></div>';
    console.error("Markdown render error:", error);
  }
}
