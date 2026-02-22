# Tagging Convention for GitHub Stars

## Rules

- **Max 2 tags per repo** - keep it simple
- **Style**: Simple lowercase (e.g., `security`, `devops`)
- **Primary focus**: Domain/use-case only (no language tags)

## Decision Tree

```
┌─ What is the PRIMARY purpose?
│
├─ Development & Code
│  ├─ Dev tools/IDE/tooling     → devtools
│  ├─ Testing frameworks/tools  → testing
│  ├─ Automation/CI/CD          → automation
│  └─ Documentation generators  → docs
│
├─ Security
│  ├─ Vulnerability scanning    → security
│  ├─ SAST/DAST tools           → security
│  └─ Secrets detection         → security
│
├─ AI & Automation
│  ├─ MCP servers/tools         → mcp
│  ├─ AI agents/LLM tools       → ai
│  └─ No-code/Low-code platforms→ lowcode
│
├─ Content & Media
│  ├─ Video tools               → video
│  ├─ Music/Audio tools         → music
│  ├─ Games                     → games
│  └─ Fonts/Typography          → fonts
│
├─ Design & Graphics
│  ├─ Design tools (Figma-like) → design
│  ├─ Graphic editors           → design
│  ├─ Icon libraries            → icons
│  ├─ Emoji libraries           → icons
│  └─ UI component kits         → design
│
├─ Productivity & Personal
│  ├─ Productivity tools        → productivity
│  ├─ Personal website/portfolios→ website
│  ├─ Obsidian plugins/themes   → obsidian
│  ├─ Mac-specific tools        → mac
│  ├─ Windows-specific tools    → windows
│  └─ CLI tools                 → cli
│
├─ Self-Hosted
│  ├─ Self-hosted tools         → selfhosted
│  ├─ Local-first apps          → selfhosted
│  └─ On-premise solutions      → selfhosted
│
├─ Resources & Learning
│  ├─ Tutorials/courses/books   → learning
│  ├─ Awesome lists             → awesome
│  ├─ Examples/templates        → examples
│  ├─ README examples           → examples
│  └─ Test examples             → testing
│
├─ Alternatives & Free
│  ├─ Open-source alternatives  → alternative
│  └─ Free tools/services       → free
│
├─ Data & Visualization
│  ├─ Databases/ETL             → data
│  ├─ Data visualization        → viz
│  ├─ Charts/graphs libraries   → viz
│  └─ Diagramming tools         → viz
│
└─ Fun & Misc
   ├─ Fun projects              → fun
   └─ Landing pages             → website
```

```
┌─ SECOND tag (optional, only if adds value)
│
├─ Product-specific    → sonarqube, kubernetes, docker
├─ Quality indicator   → essential, reference
├─ Platform-specific   → mac, obsidian
├─ Deployment model    → selfhosted
└─ Skip if primary tag is enough
```

## Domain Tags Reference

| Tag | Count | Use for |
|-----|-------|---------|
| `devtools` | ~172 | Dev tools, IDE extensions, CLI utilities |
| `alternative` | ~133 | Open-source alternatives to paid tools |
| `learning` | ~87 | Tutorials, courses, books, guides |
| `testing` | ~82 | Testing tools, test examples |
| `free` | ~52 | Free tools and services |
| `mac` | ~32 | Mac-specific tools |
| `mcp` | ~16 | Model Context Protocol tools |
| `lowcode` | ~23 | No-code/Low-code platforms |
| `music` | ~15 | Music and audio tools |
| `website` | ~16 | Personal websites, landing pages |
| `productivity` | ~14 | Productivity tools |
| `awesome` | ~11 | Awesome lists |
| `examples` | ~31 | Examples, templates, README examples |
| `security` | ~8 | Security tools, SAST |
| `automation` | ~5 | Automation, CI/CD |
| `fun` | ~9 | Fun projects |
| `docs` | ~4 | Documentation tools |
| `video` | ~4 | Video tools |
| `games` | ~3 | Games |
| `data` | ~2 | Data tools |
| `viz` | ~ | Visualization, charts, diagrams |
| `design` | ~ | Design tools, graphic editors, UI kits |
| `icons` | ~ | Icon libraries, emoji libraries |
| `obsidian` | ~3 | Obsidian plugins |
| `mac` | ~ | Mac-specific tools |
| `windows` | ~ | Windows-specific tools |
| `cli` | ~ | Command-line interface tools |
| `selfhosted` | ~ | Self-hosted tools, local-first apps |

## Examples

| Repo | Tag 1 | Tag 2 | Reason |
|------|-------|-------|--------|
| sonar-findbugs | security | | Domain is enough |
| playwright | testing | | Domain is enough |
| awesome-mcp | awesome | mcp | Type + domain |
| free-programming-books | free | learning | Cost + purpose |
| obsidian-git | obsidian | productivity | Platform + purpose |
| open-source-alternative-to | alternative | | Domain is enough |
| mac-cleanup | mac | productivity | Platform + purpose |
| d3 | viz | | Data visualization library |
| mermaid | viz | docs | Diagrams + documentation |
| penpot | design | alternative | Open-source Figma alt |
| lucide | icons | | Icon toolkit |
| twemoji | icons | | Emoji library |
| graphite | design | | 2D graphic design suite |
| immich-app / immich | productivity | selfhosted | Self-hosted photo management |
| n8n-io / n8n | automation | selfhosted | Workflow automation + self-hosted |
| awesome-selfhosted / awesome-selfhosted | learning | selfhosted | Self-hosted list + learning |

## Anti-patterns

- ❌ More than 2 tags
- ❌ Language tags (`python`, `rust`, `javascript`)
- ❌ Too specific (`react-hooks` → use `devtools`)
- ❌ Redundant (`testing` + `test-examples` → pick one)
- ❌ Dash-separated when single word exists (`dev-tools` → `devtools`)
