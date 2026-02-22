/**
 * CATEGORIZE - Step 3 of 4
 * Prerequisites: fetch-ids.js completed
 * Purpose: Assign tags using decision tree, partition for agents
 * Execute: mcp__chrome-devtools__evaluate_script
 *
 * INSTRUCTIONS:
 * 1. Copy REPOS_WITH_IDS from fetch-ids.js output
 * 2. Paste it in the repos variable below
 * 3. Execute this script
 */

async () => {
  // PASTE REPOS WITH IDS HERE (from fetch-ids.js output)
  const repos = [
    // { repo: "owner/repo", id: 123456 },
  ];

  const output = {
    HEADER: "CATEGORIZE RESULTS",
    INPUT: { repos_provided: repos.length },
    WHAT_WAS_EXECUTED: {
      description: "Applied decision tree from tagging-convention.md",
      rules: ["Max 2-3 tags per repo", "Primary: domain/use-case", "Secondary: platform/quality", "Third: CLI only"]
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
    output.ERRORS.push({ type: "NO_INPUT", message: "repos array empty or wrong format" });
    output.NEXT_STEP = "BLOCKED: Paste repos from fetch-ids.js";
    return output;
  }

  // Decision tree implementation (from tagging-convention.md)
  const categorize = (repoName, description = "") => {
    const n = repoName.toLowerCase();
    const d = description.toLowerCase();
    const combined = n + " " + d;

    const tags = [];

    // === PRIMARY TAG (pick first match) ===

    // AI & Automation
    if (/mcp|model-context|modelcontextprotocol/.test(combined)) {
      tags.push("mcp");
    } else if (/ai|llm|agent|gpt|claude|rag|openai|anthropic|machine-learning|deep-learning/.test(combined)) {
      tags.push("ai");
    } else if (/lowcode|low-code|no-code|nocode/.test(combined)) {
      tags.push("lowcode");
    } else if (/automation|ci-cd|cicd|pipeline|workflow/.test(combined)) {
      tags.push("automation");

    // Security
    } else if (/security|vulnerab|sast|dast|secret|auth|pii|encrypt|penetration/.test(combined)) {
      tags.push("security");

    // Testing
    } else if (/test|spec|benchmark|playwright|cypress|jest|mocha|testing/.test(combined)) {
      tags.push("testing");

    // Visualization
    } else if (/viz|visualiz|chart|diagram|graph|mermaid|d3|plot|canvas|render/.test(combined)) {
      tags.push("viz");

    // Data
    } else if (/database|sql|etl|data-pipeline|bigquery|postgres|mysql|redis/.test(combined)) {
      tags.push("data");

    // Design & Graphics
    } else if (/design|figma|sketch|ui-kit|component-lib|graphic|draw|paint/.test(combined)) {
      tags.push("design");
    } else if (/icon|emoji|font|typography/.test(combined)) {
      tags.push("icons");

    // Content & Media
    } else if (/video|ffmpeg|stream|youtube|mp4/.test(combined)) {
      tags.push("video");
    } else if (/music|audio|sound|midi|mp3|spotify/.test(combined)) {
      tags.push("music");
    } else if (/game|gaming|unity|unreal/.test(combined)) {
      tags.push("games");

    // E-commerce
    } else if (/shop|store|ecommerce|e-commerce|cart|checkout|payment|stripe|shopify/.test(combined)) {
      tags.push("ecommerce");

    // Productivity & Personal
    } else if (/obsidian|note-taking|knowledge-base/.test(combined)) {
      tags.push("obsidian");
    } else if (/productivity|task|todo|calendar|organize/.test(combined)) {
      tags.push("productivity");
    } else if (/website|portfolio|landing-page|homepage/.test(combined)) {
      tags.push("website");
    } else if (/macos|mac-app|darwin/.test(combined)) {
      tags.push("mac");
    } else if (/windows|win32|powershell/.test(combined)) {
      tags.push("windows");

    // Self-Hosted
    } else if (/selfhost|self-host|on-premise|local-first|homelab|mailcow/.test(combined)) {
      tags.push("selfhosted");

    // Resources & Learning
    } else if (/awesome-|curated-list|best-of/.test(combined)) {
      tags.push("awesome");
    } else if (/tutorial|course|book|learn|guide|how-to|example|template|boilerplate/.test(combined)) {
      tags.push("learning");

    // Alternatives & Free
    } else if (/alternative|open-source-alternative/.test(combined)) {
      tags.push("alternative");
    } else if (/free|opensource|open-source/.test(combined)) {
      tags.push("free");

    // Fun
    } else if (/fun|joke|meme|easter/.test(combined)) {
      tags.push("fun");

    // Docs
    } else if (/doc|markdown|readme|documentation/.test(combined)) {
      tags.push("docs");

    // Default
    } else {
      tags.push("devtools");
    }

    // === SECONDARY TAG (optional, adds value) ===

    // Platform-specific additions
    if (tags[0] !== "mac" && /macos|mac-app|darwin/.test(combined)) {
      tags.push("mac");
    } else if (tags[0] !== "windows" && /windows|win32/.test(combined)) {
      tags.push("windows");
    } else if (tags[0] !== "obsidian" && /obsidian/.test(combined)) {
      tags.push("obsidian");
    }

    // Self-hosted addition
    if (tags[0] !== "selfhosted" && /selfhost|self-host|docker-compose|homelab/.test(combined)) {
      tags.push("selfhosted");
    }

    // Devtools addition for AI repos
    if (tags[0] === "ai" && /tool|sdk|lib|framework|api/.test(combined)) {
      tags.push("devtools");
    }

    // === THIRD TAG (CLI only) ===
    if (tags.length < 3 && /cli|command-line|terminal|shell/.test(combined)) {
      tags.push("cli");
    }

    // Max 3 tags
    return tags.slice(0, 3);
  };

  // Categorize and partition
  for (const item of repos) {
    const tags = categorize(item.repo);
    item.tags = tags;

    const primary = tags[0];

    // Partition: ai repos go to ai agent, devtools to devtools agent, rest to other
    if (primary === "ai" || primary === "mcp") {
      output.RESULTS.partitions.ai.push(item);
    } else if (primary === "devtools" || primary === "testing" || primary === "automation") {
      output.RESULTS.partitions.devtools.push(item);
    } else {
      output.RESULTS.partitions.other.push(item);
    }
  }

  output.RESULTS.counts.ai = output.RESULTS.partitions.ai.length;
  output.RESULTS.counts.devtools = output.RESULTS.partitions.devtools.length;
  output.RESULTS.counts.other = output.RESULTS.partitions.other.length;

  output.NEXT_STEP = `SUCCESS: Partitioned ${repos.length} repos.

PARTITIONS:
  - ai: ${output.RESULTS.counts.ai}
  - devtools: ${output.RESULTS.counts.devtools}
  - other: ${output.RESULTS.counts.other}

NEXT: Spawn 3 agents with these payloads:

AGENT 1 (ai): IDs = [${output.RESULTS.partitions.ai.map(i => i.id).join(', ')}]

AGENT 2 (devtools): IDs = [${output.RESULTS.partitions.devtools.map(i => i.id).join(', ')}]

AGENT 3 (other): ITEMS = ${JSON.stringify(output.RESULTS.partitions.other.map(i => ({id: i.id, tags: i.tags})))}`;

  return output;
}
