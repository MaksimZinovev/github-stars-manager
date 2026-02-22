# Adding Tags Workflow

## Steps

1. **Build extension**: `npm run start`
2. **Stop sessions**: `playwright-cli session-stop-all`
3. **Open browser**: `playwright-cli open https://github.com/ --headed`
4. **Load in Chrome**: Ask user to open new tab `chrome://extensions/` → Developer mode → Load unpacked → select `dist/`
5. **Optional. Login**: Ask user to log into github (when not authenticated)
6. **Navigate to**: `playwright-cli open "https://github.com/MaksimZinovev?tab=stars" --headed`
7. **Optional. Enter PAT**: Extension prompts for GitHub Personal Access Token. Ask user to paste PAT
8. **Get refs**: `playwright-cli snapshot` → find `button "New tag" [ref=eXXX]` in `.playwright-cli/page-*.yml`
9. **Open modal**: `playwright-cli click <new-tag-ref>`
10. **Enter tag**: `playwright-cli type "<tag>"`
11. **Submit**: `playwright-cli press Enter`
12. **Wait for sync**: Wait 1-2 seconds for storage to sync
13. **Verify tag TEXT**: `playwright-cli snapshot` → check for `text: <tag>` in snapshot (NOT just "N tags" count)

## Tips
- Always snapshot after actions (refs change when DOM updates)
- Verify tag **text** is visible, not just tag count
- Wait 1-2 seconds between tags on same repo (storage sync delay)
- Max 2 tags per repo (see tagging-convention.md)
- If tag text missing: refresh page with `playwright-cli reload` and re-check

## Common Issues
| Issue | Fix |
|-------|-----|
| Tag count shows but no text | Reload page, storage sync race condition |
| Modal won't close | Press Escape, retry |
| Add tag button has no ref | Press Enter to submit |
