/**
 * ═══════════════════════════════════════════════════════════════
 * EXTRACT REPOS - Step 1 of 4
 * ═══════════════════════════════════════════════════════════════
 * Prerequisites: readiness-check.js passed
 * Purpose: Extract repo names from stars page
 * Execute: mcp__chrome-devtools__evaluate_script
 * ═══════════════════════════════════════════════════════════════
 */

async () => {
  const output = {
    ═══════════════════════════════════════════════════════════════
    HEADER: "EXTRACT REPOS RESULTS",
    ═══════════════════════════════════════════════════════════════

    WHAT_WAS_EXECUTED: {
      description: "Scanned page for GitHub repo links",
      selectors_used: ["a[href^='https://github.com/']"],
      filters_applied: [
        "owner/repo format only",
        "exclude user profiles",
        "exclude sponsors pages",
        "deduplicated"
      ]
    },

    RESULTS: {
      repos_found: 0,
      repos: []
    },

    ERRORS: [],

    NEXT_STEP: ""
  };

  // ─────────────────────────────────────────────────────────────
  // EXTRACTION LOGIC
  // ─────────────────────────────────────────────────────────────
  const rawRepos = [];

  document.querySelectorAll('a[href^="https://github.com/"]').forEach(link => {
    const href = link.getAttribute('href');
    const repo = href.replace('https://github.com/', '');

    // Filter criteria
    const isValid =
      repo.split('/').length === 2 &&     // Must be owner/repo
      !repo.includes('?') &&               // No query params
      !repo.includes('MaksimZinovev') &&   // Not user profile
      !href.includes('/stars/') &&         // Not stars list
      !href.includes('/sponsors/');        // Not sponsors

    if (isValid) {
      rawRepos.push(repo);
    }
  });

  // Deduplicate
  const uniqueRepos = [...new Set(rawRepos)];

  // ─────────────────────────────────────────────────────────────
  // POPULATE OUTPUT
  // ─────────────────────────────────────────────────────────────
  output.RESULTS.repos_found = uniqueRepos.length;
  output.RESULTS.repos = uniqueRepos;

  if (uniqueRepos.length === 0) {
    output.ERRORS.push({
      type: "NO_REPOS_FOUND",
      possible_causes: [
        "Not on stars page",
        "Page not fully loaded",
        "Different page layout"
      ],
      suggested_fix: "Verify you're on github.com/<username>?tab=stars and page is loaded"
    });
    output.NEXT_STEP = "❌ BLOCKED: No repos found. See errors above.";
  } else {
    output.NEXT_STEP = `✅ SUCCESS: Copy repos array below, then run fetch-ids.js

    // COPY THIS:
    const REPO_LIST = ${JSON.stringify(uniqueRepos, null, 2)};`;
  }

  return output;
}
