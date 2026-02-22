/**
 * ═══════════════════════════════════════════════════════════════
 * BULK TAG AI - Agent Script
 * ═══════════════════════════════════════════════════════════════
 * Purpose: Tag all repos in partition with 'ai' tag
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * Lead agent: Replace IDS array before spawning agent
 * Worker agent: Execute as-is
 * ═══════════════════════════════════════════════════════════════
 */

async () => {
  // ============================================================
  // IDS - Lead agent replaces this with actual IDs
  // ============================================================
  const IDS = [/* AI_REPO_IDS */];
  const TAG = "ai";
  // ============================================================

  const output = {
    HEADER: "BULK TAG AI RESULTS",

    WHAT_WAS_EXECUTED: {
      function: "window.debugAPI.bulkTag(IDS, TAG)",
      tag: TAG,
      ids_provided: IDS.length,
      ids: IDS
    },

    RESULTS: {
      success: false,
      response: null
    },

    ERRORS: [],

    NEXT_STEP: ""
  };

  // Validation
  if (IDS.length === 0) {
    output.ERRORS.push({
      type: "NO_IDS",
      message: "IDS array is empty",
      fix: "Lead agent must populate IDS before spawning"
    });
    output.NEXT_STEP = "BLOCKED: No IDs to tag";
    return output;
  }

  if (typeof window.debugAPI !== "object") {
    output.ERRORS.push({
      type: "NO_DEBUG_API",
      message: "debugAPI not available",
      fix: "Extension not loaded. Run readiness-check.js"
    });
    output.NEXT_STEP = "BLOCKED: Extension not ready";
    return output;
  }

  // Execute bulk tag
  try {
    const result = await window.debugAPI.bulkTag(IDS, TAG);
    output.RESULTS.response = result;
    output.RESULTS.success = result && result.success;

    if (output.RESULTS.success) {
      output.NEXT_STEP = `SUCCESS: Tagged ${IDS.length} repos with '${TAG}'`;
    } else {
      output.ERRORS.push({
        type: "BULK_TAG_FAILED",
        message: "bulkTag returned failure",
        response: result
      });
      output.NEXT_STEP = "FAILED: Check response above";
    }
  } catch (e) {
    output.ERRORS.push({
      type: "EXCEPTION",
      message: e.message,
      stack: e.stack
    });
    output.NEXT_STEP = "FAILED: Exception occurred";
  }

  return output;
}
