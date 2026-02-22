/**
 * ═══════════════════════════════════════════════════════════════
 * FETCH IDS - Step 2 of 4
 * ═══════════════════════════════════════════════════════════════
 * Prerequisites: extract-repos.js completed
 * Purpose: Fetch GitHub repo IDs via API
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * INSTRUCTIONS:
 * 1. Copy REPO_LIST from extract-repos.js output
 * 2. Paste it in the repoList variable below
 * 3. Execute this script
 * ═══════════════════════════════════════════════════════════════
 */

async () => {
  // ============================================================
  // PASTE REPOS HERE (from extract-repos.js output)
  // ============================================================
  const repoList = [
    // "owner/repo1",
    // "owner/repo2",
  ];
  // ============================================================

  const output = {
    HEADER: "FETCH IDS RESULTS",

    INPUT: {
      repos_requested: repoList.length,
      source: "user-provided array"
    },

    WHAT_WAS_EXECUTED: {
      description: "Fetched GitHub repo IDs via API with auth",
      method: "window.debugAPI.fetchWithAuth()",
      rate_limit_delay: "50ms between requests"
    },

    RESULTS: {
      success_count: 0,
      failed_count: 0,
      repos: [],
      failures: []
    },

    ERRORS: [],

    NEXT_STEP: ""
  };

  // Validation
  if (repoList.length === 0 || (repoList.length === 1 && repoList[0].startsWith("//"))) {
    output.ERRORS.push({
      type: "NO_INPUT",
      message: "repoList is empty or contains only comments",
      fix: "Paste repos from extract-repos.js output into repoList array"
    });
    output.NEXT_STEP = "BLOCKED: Update repoList with repos from extract-repos.js";
    return output;
  }

  if (typeof window.debugAPI !== "object") {
    output.ERRORS.push({
      type: "NO_DEBUG_API",
      message: "Extension not loaded",
      fix: "Run readiness-check.js first"
    });
    output.NEXT_STEP = "BLOCKED: Extension not ready";
    return output;
  }

  // Fetch IDs (with auth to avoid rate limiting)
  for (const r of repoList) {
    try {
      const result = await window.debugAPI.fetchWithAuth(
        `https://api.github.com/repos/${r}`
      );

      if (result.success && result.data?.id) {
        output.RESULTS.repos.push({ repo: r, id: result.data.id });
        output.RESULTS.success_count++;
      } else {
        output.RESULTS.failures.push({ repo: r, reason: result.error || "No ID" });
        output.RESULTS.failed_count++;
      }
    } catch (e) {
      output.RESULTS.failures.push({ repo: r, reason: e.message });
      output.RESULTS.failed_count++;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Determine next step
  if (output.RESULTS.success_count > 0) {
    output.NEXT_STEP = `SUCCESS: Fetched ${output.RESULTS.success_count} IDs. Copy the repos array below and run categorize.js

    // COPY THIS:
    const REPOS_WITH_IDS = ${JSON.stringify(output.RESULTS.repos, null, 2)};`;
  } else {
    output.NEXT_STEP = "BLOCKED: No IDs fetched. Check failures above.";
  }

  return output;
}
