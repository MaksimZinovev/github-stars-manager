/**
 * BULK TAG DEVTOOLS - Agent Script
 *
 * Purpose: Tag all repos in partition with 'devtools' tag
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * Lead agent: Replace IDS array before spawning agent
 * Worker agent: Execute as-is
 */

async () => {
  const IDS = [/* DEVTOOLS_REPO_IDS */];
  const TAG = "devtools";

  const output = {
    HEADER: "BULK TAG DEVTOOLS RESULTS",

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

  if (IDS.length === 0) {
    output.ERRORS.push({ type: "NO_IDS", message: "IDS array is empty" });
    output.NEXT_STEP = "BLOCKED: No IDs to tag";
    return output;
  }

  if (typeof window.debugAPI !== "object") {
    output.ERRORS.push({ type: "NO_DEBUG_API", message: "Extension not loaded" });
    output.NEXT_STEP = "BLOCKED: Extension not ready";
    return output;
  }

  try {
    const result = await window.debugAPI.bulkTag(IDS, TAG);
    output.RESULTS.response = result;
    output.RESULTS.success = result && result.success;
    output.NEXT_STEP = output.RESULTS.success
      ? `SUCCESS: Tagged ${IDS.length} repos with '${TAG}'`
      : "FAILED: Check response above";
  } catch (e) {
    output.ERRORS.push({ type: "EXCEPTION", message: e.message });
    output.NEXT_STEP = "FAILED: Exception occurred";
  }

  return output;
}
