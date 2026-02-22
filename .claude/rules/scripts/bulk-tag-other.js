/**
 * BULK TAG OTHER - Agent Script
 *
 * Purpose: Tag repos with specialized tags (mcp, viz, security, etc.)
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * Lead agent: Replace ITEMS array before spawning agent
 * Worker agent: Execute as-is
 */

async () => {
  // Format: [{id: 123, tags: ["mcp"]}, {id: 456, tags: ["viz", "devtools"]}, ...]
  const ITEMS = [/* OTHER_REPO_ITEMS */];

  const output = {
    HEADER: "BULK TAG OTHER RESULTS",

    WHAT_WAS_EXECUTED: {
      function: "window.debugAPI.bulkTag(IDS, TAG) for each tag group",
      items_provided: ITEMS.length,
      items: ITEMS
    },

    RESULTS: {
      tag_groups: [],
      total_tagged: 0,
      all_success: false
    },

    ERRORS: [],

    NEXT_STEP: ""
  };

  if (ITEMS.length === 0) {
    output.ERRORS.push({ type: "NO_ITEMS", message: "ITEMS array is empty" });
    output.NEXT_STEP = "BLOCKED: No items to tag";
    return output;
  }

  if (typeof window.debugAPI !== "object") {
    output.ERRORS.push({ type: "NO_DEBUG_API", message: "Extension not loaded" });
    output.NEXT_STEP = "BLOCKED: Extension not ready";
    return output;
  }

  // Group IDs by tag
  const byTag = {};
  for (const item of ITEMS) {
    for (const tag of item.tags) {
      if (!byTag[tag]) byTag[tag] = [];
      byTag[tag].push(item.id);
    }
  }

  // Bulk tag each group
  for (const [tag, ids] of Object.entries(byTag)) {
    try {
      const result = await window.debugAPI.bulkTag(ids, tag);
      output.RESULTS.tag_groups.push({
        tag: tag,
        ids_count: ids.length,
        success: result && result.success
      });
      if (result && result.success) {
        output.RESULTS.total_tagged += ids.length;
      }
    } catch (e) {
      output.RESULTS.tag_groups.push({
        tag: tag,
        ids_count: ids.length,
        success: false,
        error: e.message
      });
    }
  }

  output.RESULTS.all_success = output.RESULTS.tag_groups.every(g => g.success);

  if (output.RESULTS.all_success) {
    output.NEXT_STEP = `SUCCESS: Tagged ${output.RESULTS.total_tagged} repos across ${output.RESULTS.tag_groups.length} tag groups`;
  } else {
    output.NEXT_STEP = "PARTIAL FAILURE: Some tag groups failed. Check results above.";
  }

  return output;
}
