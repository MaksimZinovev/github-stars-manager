/**
 * Readiness Check Script for Bulk Tagging
 * Agents: Execute this FIRST via mcp__chrome-devtools__evaluate_script
 */

async () => {
  const checks = {
    step: "readiness_check",
    timestamp: new Date().toISOString(),
    results: [],
    ready: false,
    nextAction: ""
  };

  // Check 1: debugAPI exists
  const hasDebugAPI = typeof window.debugAPI === "object";
  checks.results.push({
    name: "debugAPI available",
    pass: hasDebugAPI,
    value: typeof window.debugAPI
  });

  // Check 2: Can access GitHub API (basic connectivity)
  let canFetch = false;
  try {
    const res = await fetch("https://api.github.com/rate_limit");
    canFetch = res.ok;
  } catch (e) {
    canFetch = false;
  }
  checks.results.push({
    name: "GitHub API accessible",
    pass: canFetch,
    value: canFetch ? "yes" : "no"
  });

  // Check 3: On GitHub stars page
  const onStarsPage = window.location.href.includes("tab=stars");
  checks.results.push({
    name: "On stars page",
    pass: onStarsPage,
    value: window.location.href
  });

  // Check 4: Extension loaded (check for our UI elements)
  const hasExtensionUI = document.querySelector('[class*="ghstarsmngr"]') !== null ||
                          document.body.textContent.includes("New tag");
  checks.results.push({
    name: "Extension UI visible",
    pass: hasExtensionUI,
    value: hasExtensionUI ? "yes" : "no"
  });

  // Determine readiness and next action
  const allPassed = checks.results.every(r => r.pass);

  if (!hasDebugAPI) {
    checks.nextAction = "BLOCKED: Extension not loaded. Navigate to chrome://extensions/, enable Developer mode, click 'Load unpacked', select project root folder, then reload this page.";
  } else if (!onStarsPage) {
    checks.nextAction = "BLOCKED: Navigate to https://github.com/<username>?tab=stars";
  } else if (!canFetch) {
    checks.nextAction = "WARNING: GitHub API not accessible. May have rate limiting issues.";
  } else if (allPassed) {
    checks.ready = true;
    checks.nextAction = "READY: Proceed to extract repos. Run: window.debugAPI.listAllTags() to see existing tags.";
  }

  return checks;
}
