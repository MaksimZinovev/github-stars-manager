# Adding Tags Workflow

## Steps

1. **Build extension**: `npm run start`
2. **Load in Chrome**: `chrome://extensions/` → Developer mode → Load unpacked → select `dist/`
3. **Login to GitHub**: Authenticate in browser
4. **Paste PAT**: Extension prompts for GitHub Personal Access Token
5. **Stop sessions**: `playwright-cli session-stop-all`
6. **Open browser**: `playwright-cli open https://github.com/stars/USER --headed`
7. **Get refs**: `playwright-cli snapshot` → find `button "New tag" [ref=eXXX]` in `.playwright-cli/page-*.yml`
8. **Open modal**: `playwright-cli click <new-tag-ref>`
9. **Enter tag**: `playwright-cli type "<tag>"`
10. **Get add ref**: `playwright-cli snapshot` → find `button "Add tag" [ref=eXXX]`
11. **Submit**: `playwright-cli click <add-tag-ref>`
12. **Verify**: Snapshot shows "N tags"

## Tips
- Always snapshot after actions (refs change when DOM updates)
- Max 2 tags per repo (see tagging-convention.md)
