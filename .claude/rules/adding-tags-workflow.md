# Adding Tags Workflow

## Quick
```bash
playwright-cli session-stop-all
playwright-cli open https://github.com --headed
playwright-cli snapshot && grep "New tag" .playwright-cli/*.yml
playwright-cli click <ref> && playwright-cli type "<tag>" && playwright-cli click <add-ref>
```

## Steps
1. **Start**: `playwright-cli session-stop-all && playwright-cli open <url> --headed`
2. **Find refs**: `playwright-cli snapshot` → read `.playwright-cli/page-*.yml`
3. **Add**: `click <new-tag-ref>` → `type "<tag>"` → `click <add-tag-ref>`
4. **Verify**: Check snapshot shows "N tags"

## Ref Patterns
- New tag: `button "New tag" [ref=eXXX]`
- Add tag: `button "Add tag" [ref=eXXX]`

## Tips
- Always `session-stop-all` first for headed mode
- Max 2 tags per repo (see tagging-convention.md)
