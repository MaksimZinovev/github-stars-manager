/**
 * EXTRACT REPOS - Step 1 of 4
 * Prerequisites: readiness-check.js passed
 * Purpose: Fetch all starred repos via GitHub API
 * Execute: mcp__chrome-devtools__evaluate_script
 */

async () => {
  const output = {
    HEADER: "EXTRACT REPOS RESULTS",

    WHAT_WAS_EXECUTED: {
      method: "GitHub API - GET /users/{username}/starred",
      pagination: "100 per page, all pages fetched"
    },

    RESULTS: {
      repos_found: 0,
      repos: []
    },

    ERRORS: [],
    NEXT_STEP: ""
  };

  // Get username from current page
  const username = window.location.pathname.split('/')[1];
  if (!username) {
    output.ERRORS.push({ type: "NO_USERNAME", message: "Cannot determine username from URL" });
    output.NEXT_STEP = "BLOCKED: Navigate to your stars page first";
    return output;
  }

  // Fetch all starred repos via API
  let allRepos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const result = await window.debugAPI.fetchWithAuth(
      `https://api.github.com/users/${username}/starred?per_page=${perPage}&page=${page}`
    );

    if (!result.success) {
      output.ERRORS.push({ type: "API_ERROR", message: result.error, page });
      break;
    }

    const repos = result.data;
    if (repos.length === 0) break;

    allRepos = allRepos.concat(repos.map(r => r.full_name));

    if (repos.length < perPage) break; // Last page
    page++;
  }

  output.RESULTS.repos_found = allRepos.length;
  output.RESULTS.repos = allRepos;

  if (allRepos.length === 0) {
    output.NEXT_STEP = "BLOCKED: No starred repos found";
  } else {
    output.NEXT_STEP = `SUCCESS: Found ${allRepos.length} repos. Run fetch-ids.js with:

    const REPO_LIST = ${JSON.stringify(allRepos.slice(0, 5), null, 2)}; // showing first 5`;
  }

  return output;
}
