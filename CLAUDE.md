# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lito** (`@litodocs/cli`) is a documentation site generator that converts Markdown/MDX files into static websites using Astro. It abstracts Astro complexity while providing powerful customization through templates and configuration.

The CLI follows a **pipeline pattern**: resolve template → scaffold to temp → sync docs → generate config → build → cleanup.

## Local Development

```bash
# Install dependencies
pnpm install

# Make CLI executable and link globally
chmod +x bin/cli.js
npm link

# Test with a docs folder
lito dev -i ./test-docs
lito build -i ./test-docs -o ./dist
```

**Note:** This is a pure ES modules project (no TypeScript, no build step). Code runs directly from source.

## Architecture

### Directory Structure

```
bin/cli.js              # Executable entry point (shebang + dynamic import)
src/
  cli.js                # Commander setup, defines all commands
  commands/
    build.js            # Full pipeline + Astro build + Pagefind search index
    dev.js              # Pipeline + Astro dev server + chokidar file watching
    eject.js            # Export full Astro project (no cleanup)
    template.js         # Template management (list, cache)
  core/
    scaffold.js         # Copy template to /tmp/.lito/ temporary directory
    template-fetcher.js # Resolve GitHub/local/registry templates
    template-registry.js # Map short names to GitHub URLs
    sync.js             # Copy docs + inject layout frontmatter (i18n, versioning)
    config-sync.js      # Merge user config + auto-generate navigation
    config-validator.js # Validate against core-schema.json
    config.js           # Generate astro.config.mjs
    colors.js           # OKLCH color palette generation
    providers.js        # Vercel/Netlify/Cloudflare configs
    package-manager.js  # Auto-detect bun → pnpm → yarn → npm
    update-check.js     # NPM version check + upgrade command
    astro.js            # Spawn Astro CLI commands
    output.js           # Copy dist to output directory
  schema/
    core-schema.json    # REQUIRED config all templates must support
    template-manifest.json # Template capability declaration
```

### Template System

Templates can come from three sources:

1. **Registry**: `lito dev -i ./docs --template default` (shortname lookup)
2. **GitHub**: `lito dev -i ./docs --template github:owner/repo#v1.0.0`
3. **Local**: `lito dev -i ./docs --template ./my-template`

Template resolution in `template-fetcher.js`:
- GitHub templates cached in `~/.lito/templates/` for 24 hours
- Subdirectories supported: `github:owner/repo/path/to/template#ref`
- Use `--refresh` flag to bypass cache

### The Sync Engine (`sync.js`)

The most complex module. Handles:
- **i18n**: Auto-detects 40+ locale folders (en, es, fr, de, zh, ja, etc.)
- **Versioning**: Detects version folders from `docs-config.json`
- **Asset syncing**: `_assets`, `_images`, `_css`, `public` folders
- **Layout injection**: Recursively adds `layout: MarkdownLayout.astro` to frontmatter
- **Smart layouts**: Files with `api:` frontmatter get `APILayout.astro`

Special folders excluded from content sync: `_assets`, `_css`, `_images`, `_static`, `public`

### Configuration System

Three-layer approach:

1. **`core-schema.json`**: Defines portable config across ALL templates (metadata, branding, navigation, search, SEO, i18n, assets)
2. **Template's `docs-config.json`**: Base config with theme-specific defaults
3. **User's `docs-config.json`**: Optional override (validated against core schema)

`config-sync.js` merges configs and auto-generates navigation from folder structure if not provided.

### Pipeline Flow (build/dev commands)

```
1. parseThemeSpec() → Resolve template source
2. getTemplatePath() → Fetch/cache template
3. scaffoldProject() → Copy to /tmp/.lito/
4. Promise.all():
   - installDependencies() (bun → pnpm → yarn → npm)
   - syncDocs() (copy + inject layouts)
   - syncDocsConfig() (merge + auto-generate nav)
5. generateAstroConfig() (base URL, site URL, adapter)
6. configureProvider() (Vercel/Netlify/Cloudflare)
7. runAstroCommand() (build or dev)
8. postBuild() (pagefind, copy output, cleanup /tmp/.lito/)
```

### Dev Server Hot Reload

The dev command uses `chokidar` to watch the source docs folder. On file change:
1. Re-runs `syncDocs()` to copy changed files
2. Re-runs `syncDocsConfig()` if config changed
3. Triggers Astro's native HMR

## Key Patterns

- **Temp directory**: All builds use `/tmp/.lito/` as workspace, cleaned up after completion
- **Parallel prep**: `syncDocs()`, `installDependencies()`, `syncDocsConfig()` run via `Promise.all()`
- **Package manager detection**: Auto-detects bun → pnpm → yarn → npm in `package-manager.js`
- **Deep merge strategy**: Arrays are replaced (not merged) in config-sync.js
- **Locale detection**: 40+ known ISO 639-1 codes checked against folder names
- **Cleanup on error**: Try/finally blocks ensure temp directory is removed even on failure

## Adding New Commands

Follow the pattern in `commands/`:

```javascript
import { scaffoldProject } from '../core/scaffold.js';
import { syncDocs } from '../core/sync.js';
import { syncDocsConfig } from '../core/config-sync.js';
// ... other imports

export default function buildCommand(program) {
  program.command('mycommand')
    .option('-i, --input <path>', 'Path to docs')
    .action(async (options) => {
      // 1. Get template path
      // 2. Scaffold project
      // 3. Run parallel prep (syncDocs, installDeps, syncConfig)
      // 4. Your custom logic
      // 5. Cleanup
    });
}
```

Register in `src/cli.js`:
```javascript
import mycommandCommand from './commands/mycommand.js';
program.addCommand(mycommandCommand(program));
```

## Adding Template Providers

Extend `providers.js` with new provider configs:

```javascript
export function configureProvider(projectDir, provider, renderingMode) {
  switch (provider) {
    case 'myprovider':
      return writeMyProviderConfig(projectDir, renderingMode);
    // ...
  }
}
```

## Core Schema Extension

When modifying `core-schema.json`, remember:
- This defines the **portable** config contract between templates
- ALL templates must support these fields
- Template-specific extensions go in the template's own config, not here

## Important Constants

- **Cache dir**: `~/.lito/templates/`
- **Temp workspace**: `/tmp/.lito/`
- **Known locales**: 40+ codes in `sync.js` line 7-12
- **Special folders**: `_assets`, `_css`, `_images`, `_static`, `public`
- **Default port**: 4321
- **Node requirement**: >=18.0.0
