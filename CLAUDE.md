# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Stars Manager is a Chrome extension (Manifest V3) that lets users organize their GitHub starred repositories with custom tags. Data syncs across Chrome browsers via `chrome.storage.sync` API.

## Build Commands

```bash
# Development build (outputs to dist/)
npm run start
# or
npm run webpack:dev

# Watch for changes and rebuild
npm run watch

# Production build
npm run build

# Lint
npm run lint
```

## Architecture

### Extension Structure

- **Background Script** (`src/assets/js/background/background.js`): Service worker handling message responses and export operations
- **Content Scripts** (`src/assets/js/content_scripts/`): Injected into GitHub pages, contains main extension logic
  - `main.js`: Entry point, orchestrates UI and data flow
  - `githubAPI.js`: GitHub API integration (fetches starred repos, user details)
  - `dom/`: UI components (modals, tag page, footer UI, event listeners)
  - `storageSync/`: Chrome storage managers for tags, repos, and generic data

### Data Flow

1. User tags a repo → stored in `chrome.storage.sync`
2. Tags are normalized (lowercase, trimmed) and limited to 6 per repo
3. Tag IDs are sequential with gap-filling for efficient storage
4. Data syncs automatically across Chrome browsers when logged in

### Key Files

- `manifest.json`: Chrome extension manifest (permissions: contextMenus, bookmarks, tabs, storage)
- `webpack.config.dev.babel.js`: Two entry points - background and content_script bundles
- `.env`: GitHub Personal Access Token for API access
- `keys.js`: OAuth credentials (encrypted with blackbox)

### UI Entry Points

- Custom tag page: accessible via URL hash `#starsmngr` on github.com
- Tag modal: triggered from repository pages
- Sidebar: tag browsing within GitHub

## Conventions

- CSS classes prefixed with `ghstarsmngr-`
- Stylus for CSS preprocessing
- ESLint configured with Google style guide, max line length 100
- 2-space indentation (see `.editorconfig`)
- GitHub-flavored UI styling (dark theme compatible)

## Loading the Extension for Development

1. Run `npm run start` to build
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select the `dist/` folder
5. Reload extension after code changes
