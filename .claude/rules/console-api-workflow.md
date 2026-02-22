# Console API Workflow

> ✅ **Tested 2026-02-22** - Direct storage operations via Chrome DevTools MCP

## ⚠️ For Subagents

**DO NOT launch a new browser.** Connect to existing Chrome debug instance via MCP:
- Use `mcp__chrome-devtools__evaluate_script` to execute code
- Verify `typeof window.debugAPI === "object"` before tagging
- If undefined, ask user to load extension in `chrome://extensions/`

For bulk tagging (50+ repos), see [bulk-tagging-workflow.md](bulk-tagging-workflow.md).

---

## Quick Start

```javascript
await window.debugAPI.listAllTags()                 // View all tags
await window.debugAPI.addTag(123456789, 'devtools') // Add tag
await window.debugAPI.getReposByTag('viz')          // Find repos with tag
```

## Debug Mode

Enable debug logs in browser console:
```javascript
localStorage.setItem('DEBUG', '1')
```

Then refresh the page. You'll see `[debugAPI]` and `[main.js]` log messages.

## Prerequisites

1. **Build extension**: `npm run start`
2. **Chrome with remote debugging**:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9222 \
     --user-data-dir=/tmp/chrome-debug-profile
   ```

## Setup

### Step 1: Configure MCP

Note: disable this project-scope MCP in Claude Code when you do not need to use this workflow. 

Create `.mcp.json` in project root to connect MCP to your Chrome:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browserUrl",
        "http://127.0.0.1:9222"
      ]
    }
  }
}
```

### Step 2: Load Extension

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the **project root folder** (not `dist/`)
5. Extension should appear as "Github Stars Manager"

### Step 3: Login to GitHub

1. Navigate to `github.com`
2. Sign in to your account
3. If prompted, paste your GitHub Personal Access Token (PAT)

### Step 4: Navigate to Stars Page

Navigate to: `https://github.com/<username>?tab=stars`

### Step 5: Verify Setup

Check console for these log messages:
```
[debugAPI] Module loading...
[debugAPI] window.debugAPI set in isolated world: object
[debugAPI] Injecting into main world via scripting API...
[debugAPI] Main world injection complete
[debugAPI] Main world injection requested successfully
```

Verify via MCP:
```javascript
typeof window.debugAPI  // Should return "object"
```

## Architecture

### Isolated World vs Main World

Chrome content scripts run in an **isolated JavaScript world**, separate from the page's **main world**:
- **Isolated world**: Content script's context, has access to Chrome APIs
- **Main world**: Page's context, accessible via DevTools/MCP

The `window.debugAPI` must be injected into the **main world** for MCP to access it.

### Bridge Mechanism

```
┌─────────────────┐    postMessage    ┌─────────────────┐
│   Main World    │ ───────────────► │ Isolated World  │
│ window.debugAPI │ ◄─────────────── │  debugAPI impl  │
│  (MCP access)   │    postMessage   │ (chrome.storage)│
└─────────────────┘                  └─────────────────┘
```

1. MCP calls `window.debugAPI.addTag(id, name)` in main world
2. Main world posts message to isolated world
3. Isolated world executes actual storage operation
4. Result posted back to main world
5. Promise resolves with result

## API Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `addTag(id, name)` | Add tag to repo | `addTag(123456789, 'devtools')` |
| `bulkTag([ids], name)` | Tag multiple repos | `bulkTag([1,2,3], 'testing')` |
| `getTags(id)` | Get repo's tags | `getTags(123456789)` |
| `removeTag(id, name)` | Remove tag from repo | `removeTag(123456789, 'devtools')` |
| `listAllTags()` | List all stored tags | `listAllTags()` |
| `getReposByTag(name)` | Find repos with tag | `getReposByTag('devtools')` |
| `fetchWithAuth(url)` | Authenticated API fetch | `fetchWithAuth('https://api.github.com/repos/owner/repo')` |

### Finding Repo ID

```javascript
// Use fetchWithAuth to avoid rate limiting
const result = await window.debugAPI.fetchWithAuth(
  'https://api.github.com/repos/owner/repo'
);
console.log(result.data.id);
```

## Troubleshooting

### `window.debugAPI` is undefined

**Cause**: Content script not running or injection failed.

**Check**:
1. Extension is enabled in `chrome://extensions/`
2. Page URL matches `https://github.com/*`
3. Check console for error messages

**Fix**: Reload extension and refresh page.

### "Cannot access contents of url" error

**Cause**: Missing `host_permissions` in manifest.

**Fix**: Ensure manifest has:
```json
"host_permissions": ["https://github.com/*"]
```

Then reload extension (may need to remove and re-add).

### "CSP blocks inline script" error

**Cause**: GitHub's Content Security Policy prevents inline script injection.

**Fix**: The code uses `chrome.scripting.executeScript` with `world: 'MAIN'` to bypass CSP. Ensure:
1. `"scripting"` permission in manifest
2. `host_permissions` for the target site

### MCP connects to wrong browser

**Cause**: MCP launches its own Chrome instead of connecting to port 9222.

**Fix**: Ensure `.mcp.json` has `--browserUrl http://127.0.0.1:9222` argument.

### Chrome port 9222 not accessible

**Cause**: Chrome started without `--remote-debugging-port=9222`.

**Fix**:
1. Completely quit Chrome (Cmd+Q on Mac)
2. Start with: `--remote-debugging-port=9222`
3. Verify: `curl http://127.0.0.1:9222/json/version`

### Extension loaded from wrong folder

**Symptom**: Console shows `Failed to load resource` errors.

**Fix**: Load from **project root**, not `dist/` folder. Manifest references `dist/content_script.js`.

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Using `--profile-directory` instead of `--user-data-dir` | Use `--user-data-dir` for fresh profile |
| Loading extension from `dist/` | Load from project root |
| Chrome already running without debugging | Kill all Chrome, restart with flag |
| Forgot to reload extension after build | Click refresh in `chrome://extensions/` |

## Manual Testing (Alternative)

If MCP isn't available, use Chrome DevTools Console directly:

1. Build: `npm run start`
2. Load extension in Chrome
3. Open GitHub stars page
4. Open DevTools: F12 or Cmd+Option+I
5. Run in Console: `await window.debugAPI.listAllTags()`

Note: This works in the **isolated world** context, which has access to `window.debugAPI` set by the content script.

## Related

- Tag naming: `tagging-convention.md` (max 2 tags per repo)
- UI workflow: `adding-tags-workflow.md`

## Session Cleanup

When finished testing, clean up properly:

### 1. Remove Test Tags (optional)

```javascript
// List tags to review
await window.debugAPI.listAllTags()

// Remove specific tag from repo
await window.debugAPI.removeTag(1139576798, 'viz')
```

### 2. Disable Debug Mode

```javascript
localStorage.removeItem('DEBUG')
```

### 3. Close Chrome

```bash
pkill -f "Google Chrome"
```

### 4. Clean Up MCP Config (optional)

If you created `.mcp.json` just for this session:
```bash
rm .mcp.json
```

### 5. Clean Up Temp Profile (if used)

If you started Chrome with `--user-data-dir=/tmp/chrome-debug-profile`:
```bash
rm -rf /tmp/chrome-debug-profile
```

### 6. Commit Changes

```bash
git status
git add -A
git commit -m "feat: Add console debug API for tag operations"
```

## Files Modified

| File | Purpose |
|------|---------|
| `manifest.json` | Added `scripting` permission, `host_permissions` |
| `src/assets/js/content_scripts/debugAPI.js` | Debug API implementation + main world bridge |
| `src/assets/js/background/background.js` | Script injection for main world |
| `.mcp.json` | MCP config for Chrome DevTools connection |


## How user can launch Chrome profile with existing tags 

On MacOS

```
open -na "Google Chrome" --args --user-data-dir=/tmp/chrome-debug-profile

# or 
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/chrome-debug-profile

```