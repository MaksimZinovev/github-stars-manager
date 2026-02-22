# Adding Tags Workflow

> ✅ **Tested 2026-02-22** - Workflow verified working

## Steps

1. **Build extension**: `npm run start`
2. **Stop sessions**: `playwright-cli session-stop-all`
3. **Open browser**: `playwright-cli open https://github.com/ --headed`
4. **Load in Chrome**: Ask user to open new tab `chrome://extensions/` → Developer mode → Load unpacked → select `dist/`
5. **Optional. Login**: Ask user to log into github (when not authenticated)
6. **Navigate to**: `playwright-cli open "https://github.com/MaksimZinovev?tab=stars" --headed`
7. **Optional. Enter PAT**: Extension prompts for GitHub Personal Access Token. Ask user to paste PAT
8. **Get refs**: `playwright-cli snapshot` → find `button "New tag" [ref=eXXX]`
9. **Open modal**: `playwright-cli click <new-tag-ref>`
10. **Enter tag**: `playwright-cli type "<tag>"`
11. **Submit**: `playwright-cli press Enter`
12. **Wait**: `sleep 2` — **CRITICAL: prevents race condition**
13. **Verify**: `playwright-cli snapshot` → grep for `text: <tag>` — must see tag **text**, not just count

## Verification Example

```bash
# After adding tag "viz" to mermaid-rs-renderer:
grep -A10 "mermaid-rs-renderer" .playwright-cli/page-*.yml | grep "text: viz"
# Output should show: - text: viz
```

## Critical Rules

| Rule | Why |
|------|-----|
| Always `sleep 2` after submit | Storage sync race condition causes missing tag text |
| Verify tag **text**, not count | Count can show "1 tag" without text being visible |
| Fresh snapshot before click | Refs change when DOM updates |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tag count shows but no text | `sleep 2` was skipped — reload and re-add |
| Ref not found error | Take fresh snapshot, refs expire quickly |
| Modal won't close | Press Escape, retry |
| Add tag button has no ref | Press Enter to submit |

## Related
- Tag naming: `.claude/rules/tagging-convention.md` (max 2 tags per repo)
