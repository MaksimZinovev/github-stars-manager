# Bulk Tagging Workflow

## Scripts

| Run | Script | Output |
|-----|--------|--------|
| 1 | `scripts/readiness-check.js` | ✅/❌ for each check |
| 2 | `scripts/extract-repos.js` | Array of repo names |
| 3 | `scripts/fetch-ids.js` | Array of `{repo, id}` |
| 4 | `scripts/categorize.js` | 3 partitions with payloads |
| 5 | `scripts/bulk-tag-*.js` | Tag results |

---

## Lead Agent: Run Steps 1-4

Execute each script via `mcp__chrome-devtools__evaluate_script`:

```
1. Read script → Execute → Check output
2. If BLOCKED → Fix issue → Retry
3. If SUCCESS → Copy output → Paste into next script
4. Repeat until categorize.js gives you 3 agent payloads
```

---

## Spawn Agents

Give each agent **exactly this** (replace placeholders):

```
TAG REPOS

Execute via mcp__chrome-devtools__evaluate_script:

[PASTE bulk-tag-*.js CONTENT HERE]

Replace the IDS/ITEMS array with: [PASTE IDS FROM CATEGORIZE]

Then update your task to completed.
```

---

## Checks

| If you see... | Do this |
|---------------|---------|
| `debugAPI undefined` | Load extension in chrome://extensions/ |
| `NOT_READY` | Run readiness-check.js first |
| `NO_IDS` | Lead agent must populate array |
| `BLOCKED` | Read ERRORS array for fix |

---

## Agent Rules

```
✅ Use mcp__chrome-devtools__evaluate_script
✅ Return output object with RESULTS and ERRORS
❌ Never launch new browser
❌ Never modify script logic
```
