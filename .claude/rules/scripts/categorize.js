/**
 * ═══════════════════════════════════════════════════════════════
 * CATEGORIZE - Step 3 of 4
 * ═══════════════════════════════════════════════════════════════
 * Prerequisites: fetch-ids.js completed
 * Purpose: Assign tags and partition repos for parallel agents
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * INSTRUCTIONS:
 * 1. Copy REPOS_WITH_IDS from fetch-ids.js output
 * 2. Paste it in the repos variable below
 * 3. Execute this script
 * ═══════════════════════════════════════════════════════════════
 */

async () => {
  // ============================================================
  // PASTE REPOS WITH IDS HERE (from fetch-ids.js output)
  // ============================================================
  const repos = [
    // { repo: "owner/repo", id: 123456 },
  ];
  // ============================================================

  const output = {
    HEADER: "CATEGORIZE RESULTS",

    INPUT: {
      repos_provided: repos.length
    },

    WHAT_WAS_EXECUTED: {
      description: "Applied tag decision rules and partitioned repos",
      decision_table: [
        { pattern: "mcp, model-context", tag: "mcp" },
        { pattern: "ai, llm, agent, gpt, claude, rag", tag: "ai" },
        { pattern: "test, spec, benchmark", tag: "testing" },
        { pattern: "viz, chart, diagram, graph", tag: "viz" },
        { pattern: "security, auth, secret", tag: "security" },
        { pattern: "selfhosted, docker-compose", tag: "selfhosted" },
        { pattern: "cli, terminal", tag: "cli" },
        { pattern: "default", tag: "devtools" }
      ]
    },

    RESULTS: {
      partitions: { ai: [], devtools: [], other: [] },
      counts: { ai: 0, devtools: 0, other: 0 }
    },

    ERRORS: [],

    NEXT_STEP: ""
  };

  // Validation
  if (repos.length === 0 || repos[0].repo === undefined) {
    output.ERRORS.push({
      type: "NO_INPUT",
      message: "repos array is empty or wrong format",
      fix: "Paste repos from fetch-ids.js output (must have repo and id fields)"
    });
    output.NEXT_STEP = "BLOCKED: Update repos array with data from fetch-ids.js";
    return output;
  }

  // Tag decision function
  const categorize = (repoName) => {
    const n = repoName.toLowerCase();

    if (/mcp|model-context/i.test(n)) return ["mcp"];
    if (/ai|llm|agent|gpt|claude|rag/i.test(n)) return ["ai"];
    if (/test|spec|benchmark/i.test(n)) return ["testing"];
    if (/viz|chart|diagram|graph|mermaid|visualiz/i.test(n)) return ["viz"];
    if (/security|auth|secret|pii/i.test(n)) return ["security"];
    if (/selfhosted|self-hosted|docker-compos|mailcow/i.test(n)) return ["selfhosted"];
    if (/cli|terminal/i.test(n)) return ["cli"];
    if (/design|ui|figma|sketch/i.test(n)) return ["design"];
    if (/doc|markdown/i.test(n)) return ["docs"];
    return ["devtools"];
  };

  // Categorize and partition
  for (const item of repos) {
    const tags = categorize(item.repo);
    item.tags = tags;

    const primary = tags[0];

    if (primary === "ai") {
      output.RESULTS.partitions.ai.push(item);
    } else if (primary === "devtools") {
      output.RESULTS.partitions.devtools.push(item);
    } else {
      output.RESULTS.partitions.other.push(item);
    }
  }

  output.RESULTS.counts.ai = output.RESULTS.partitions.ai.length;
  output.RESULTS.counts.devtools = output.RESULTS.partitions.devtools.length;
  output.RESULTS.counts.other = output.RESULTS.partitions.other.length;

  // Generate agent payloads
  output.NEXT_STEP = `SUCCESS: Partitioned ${repos.length} repos.

PARTITION COUNTS:
  - ai: ${output.RESULTS.counts.ai}
  - devtools: ${output.RESULTS.counts.devtools}
  - other: ${output.RESULTS.counts.other}

NEXT: Spawn 3 agents with these payloads:

AGENT 1 (ai): Use bulk-tag-ai.js with IDs: [${output.RESULTS.partitions.ai.map(i => i.id).join(', ')}]

AGENT 2 (devtools): Use bulk-tag-devtools.js with IDs: [${output.RESULTS.partitions.devtools.map(i => i.id).join(', ')}]

AGENT 3 (other): Use bulk-tag-other.js with items: ${JSON.stringify(output.RESULTS.partitions.other)}`;
  return output;
}
